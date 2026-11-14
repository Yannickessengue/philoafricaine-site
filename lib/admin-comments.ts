import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { neon } from "@neondatabase/serverless";
import "@/lib/admin-db-retry";
import { sendMail, siteUrl, emailLogoUrl } from "@/lib/admin-mailer";

const sql = neon(process.env.DATABASE_URL!);

export const REACTIONS = ["like", "love", "think", "clap"] as const;
export type ReactionKind = (typeof REACTIONS)[number];

export type CommentRow = {
  id: number;
  slug: string;
  parent_id: number | null;
  author_name: string;
  body: string;
  status: "visible" | "hidden";
  created_at: string;
  deleted_at: string | null;
};

export type PublicComment = {
  id: number;
  parentId: number | null;
  author: string;
  body: string;
  createdAt: string;
  deleted: boolean;
  reactions: Record<ReactionKind, number>;
  mine: { author: boolean; reactions: ReactionKind[] };
  replies: PublicComment[];
};

const emptyReactions = (): Record<ReactionKind, number> =>
  Object.fromEntries(REACTIONS.map((r) => [r, 0])) as Record<ReactionKind, number>;

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256")
    .update(`${process.env.COMMENT_IP_SALT ?? ""}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

const escHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Avertit la rédaction par e-mail d’un nouveau commentaire (sans bloquer la réponse). */
async function notifyNewComment(c: {
  id: number;
  slug: string;
  author: string;
  body: string;
  isReply: boolean;
}): Promise<void> {
  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER;
  if (!to) return;

  const [ed] = (await sql`select title from editos where slug = ${c.slug}`) as { title: string }[];
  const editoTitle = ed?.title || c.slug;
  const url = siteUrl();
  const dateLabel = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f8ede8">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:26px 12px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fbf8f3;border:1px solid #e4d9d2">
        <tr><td align="center" style="background:#1a1a1a;padding:22px"><img src="${emailLogoUrl()}" width="130" alt="Groupe JOGOO" style="display:block;border:0"/></td></tr>
        <tr><td style="height:4px;background:#eabf31;font-size:0">&nbsp;</td></tr>
        <tr><td style="padding:26px 30px">
          <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#9e3a1c">Nouveau commentaire${c.isReply ? " · réponse" : ""}</p>
          <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:16px;line-height:1.4;color:#1a1a1a">
            sur l’édito <a href="${url}/edito/${c.slug}#commentaires" style="color:#1a1a1a">« ${escHtml(editoTitle)} »</a>
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4d9d2">
            <tr><td style="padding:16px 18px">
              <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#1a1a1a">${escHtml(c.author)}</p>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a807a">${dateLabel}</p>
              <div style="font-family:Georgia,serif;font-size:14px;line-height:1.6;color:#3f3a38;white-space:pre-wrap">${escHtml(c.body)}</div>
            </td></tr>
          </table>

          <p style="margin:22px 0 0">
            <a href="${url}/admin/commentaires" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:10px 18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Modérer</a>
            <a href="${url}/edito/${c.slug}#commentaires" style="display:inline-block;margin-left:8px;color:#9e3a1c;text-decoration:none;padding:10px 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Voir sur le site</a>
          </p>
        </td></tr>
        <tr><td style="padding:0 30px 24px">
          <hr style="border:0;border-top:1px solid #e4d9d2;margin:0 0 12px"/>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a99f98">
            Les commentaires paraissent immédiatement et sont modérés a posteriori.
          </p>
        </td></tr>
      </table>
    </td></tr></table></body></html>`;

  await sendMail({
    to,
    subject: `Nouveau commentaire de ${c.author} — « ${editoTitle} »`,
    html,
  });
}

/** Arbre des commentaires d'un édito, avec agrégats de réactions. */
export async function listComments(
  slug: string,
  clientId: string | null,
  includeHidden = false,
): Promise<PublicComment[]> {
  const rows = (
    includeHidden
      ? await sql`
          select id, parent_id, author_name, body, status, created_at, deleted_at
          from edito_comments
          where slug = ${slug}
          order by created_at asc
        `
      : await sql`
          select id, parent_id, author_name, body, status, created_at, deleted_at
          from edito_comments
          where slug = ${slug} and status = 'visible'
          order by created_at asc
        `
  ) as Omit<CommentRow, "slug">[];

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const reactions = (await sql`
    select comment_id, kind, count(*)::int as n,
           bool_or(client_id = ${clientId ?? ""}) as mine
    from edito_comment_reactions
    where comment_id = any(${ids})
    group by comment_id, kind
  `) as { comment_id: number; kind: ReactionKind; n: number; mine: boolean }[];

  const byId = new Map<number, PublicComment>();
  for (const r of rows) {
    byId.set(Number(r.id), {
      id: Number(r.id),
      parentId: r.parent_id == null ? null : Number(r.parent_id),
      author: r.author_name,
      body: r.deleted_at ? "" : r.body,
      createdAt: new Date(r.created_at).toISOString(),
      deleted: !!r.deleted_at,
      reactions: emptyReactions(),
      mine: { author: false, reactions: [] },
      replies: [],
    });
  }
  for (const x of reactions) {
    const c = byId.get(Number(x.comment_id));
    if (!c) continue;
    c.reactions[x.kind] = x.n;
    if (x.mine) c.mine.reactions.push(x.kind);
  }
  if (clientId) {
    const mineRows = (await sql`
      select id from edito_comments
      where slug = ${slug} and client_id = ${clientId}
    `) as { id: number }[];
    for (const m of mineRows) {
      const c = byId.get(Number(m.id));
      if (c) c.mine.author = true;
    }
  }

  const roots: PublicComment[] = [];
  for (const r of rows) {
    const node = byId.get(Number(r.id))!;
    const pid = r.parent_id == null ? null : Number(r.parent_id);
    if (pid && byId.has(pid)) byId.get(pid)!.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

type CreateInput = {
  slug: string;
  parentId: number | null;
  name: string;
  email: string | null;
  body: string;
  clientId: string;
  ipHash: string | null;
};

export async function createComment(input: CreateInput): Promise<{ id: number } | { error: string }> {
  const name = input.name.trim();
  const body = input.body.trim();
  if (name.length < 2 || name.length > 60) return { error: "Nom invalide (2 à 60 caractères)." };
  if (body.length < 2 || body.length > 4000) return { error: "Le commentaire doit faire de 2 à 4000 caractères." };
  if ((body.match(/https?:\/\//gi) ?? []).length > 2) return { error: "Trop de liens dans le commentaire." };

  // Limitation de fréquence
  const [recent] = (await sql`
    select
      count(*) filter (where client_id = ${input.clientId} and created_at > now() - interval '20 seconds')::int as by_client,
      count(*) filter (where ip_hash = ${input.ipHash} and created_at > now() - interval '60 seconds')::int as by_ip
    from edito_comments
  `) as { by_client: number; by_ip: number }[];
  if (recent.by_client > 0 || recent.by_ip > 2) {
    return { error: "Vous publiez trop vite. Réessayez dans un instant." };
  }

  if (input.parentId != null) {
    const [parent] = (await sql`
      select id, parent_id from edito_comments
      where id = ${input.parentId} and slug = ${input.slug} and status = 'visible'
    `) as { id: number; parent_id: number | null }[];
    if (!parent) return { error: "Commentaire parent introuvable." };
    if (parent.parent_id != null) input.parentId = parent.parent_id; // aplatit à un niveau
  }

  const [row] = (await sql`
    insert into edito_comments (slug, parent_id, author_name, author_email, body, client_id, ip_hash)
    values (${input.slug}, ${input.parentId}, ${name}, ${input.email}, ${body}, ${input.clientId}, ${input.ipHash})
    returning id
  `) as { id: number }[];

  // Notification rédaction, après la réponse (compatible serverless)
  const notif = {
    id: Number(row.id),
    slug: input.slug,
    author: name,
    body,
    isReply: input.parentId != null,
  };
  after(async () => {
    try {
      await notifyNewComment(notif);
    } catch (e) {
      console.error("[comments] notif:", e instanceof Error ? e.message : e);
    }
  });

  return { id: row.id };
}

export async function toggleReaction(
  commentId: number,
  clientId: string,
  kind: ReactionKind,
): Promise<Record<ReactionKind, number>> {
  const [existing] = (await sql`
    select 1 from edito_comment_reactions
    where comment_id = ${commentId} and client_id = ${clientId} and kind = ${kind}
  `) as unknown[];
  if (existing) {
    await sql`
      delete from edito_comment_reactions
      where comment_id = ${commentId} and client_id = ${clientId} and kind = ${kind}
    `;
  } else {
    await sql`
      insert into edito_comment_reactions (comment_id, client_id, kind)
      values (${commentId}, ${clientId}, ${kind})
      on conflict do nothing
    `;
  }
  const counts = (await sql`
    select kind, count(*)::int as n from edito_comment_reactions
    where comment_id = ${commentId} group by kind
  `) as { kind: ReactionKind; n: number }[];
  const out = emptyReactions();
  for (const c of counts) out[c.kind] = c.n;
  return out;
}

/** Suppression par l'auteur (fenêtre de 15 min) ou par la modération. */
export async function deleteOwnComment(
  commentId: number,
  clientId: string,
): Promise<{ ok: boolean }> {
  const rows = (await sql`
    update edito_comments set deleted_at = now(), body = ''
    where id = ${commentId} and client_id = ${clientId}
      and deleted_at is null and created_at > now() - interval '15 minutes'
    returning id
  `) as { id: number }[];
  return { ok: rows.length > 0 };
}

export async function setStatus(commentId: number, status: "visible" | "hidden"): Promise<void> {
  await sql`update edito_comments set status = ${status} where id = ${commentId}`;
}

export type ModerationItem = {
  id: number;
  slug: string;
  parentId: number | null;
  author: string;
  email: string | null;
  body: string;
  status: "visible" | "hidden";
  createdAt: string;
  deleted: boolean;
};

export async function listForModeration(limit = 200): Promise<ModerationItem[]> {
  const rows = (await sql`
    select id, slug, parent_id, author_name, author_email, body, status, created_at, deleted_at
    from edito_comments
    order by created_at desc
    limit ${limit}
  `) as (CommentRow & { author_email: string | null })[];
  return rows.map((r) => ({
    id: Number(r.id),
    slug: r.slug,
    parentId: r.parent_id == null ? null : Number(r.parent_id),
    author: r.author_name,
    email: r.author_email,
    body: r.body,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
    deleted: !!r.deleted_at,
  }));
}

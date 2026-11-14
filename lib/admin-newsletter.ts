import "server-only";
import { randomUUID, createHash } from "node:crypto";
import { after } from "next/server";
import { neon } from "@neondatabase/serverless";
import "@/lib/admin-db-retry";
import { sendMail, siteUrl, mailerEnabled, emailLogoUrl } from "@/lib/admin-mailer";

const sql = neon(process.env.DATABASE_URL!);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
export const emailLooksValid = (e: string) => EMAIL_RE.test(e.trim());
export const normalizeEmail = (e: string) => e.trim().toLowerCase();

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256")
    .update(`${process.env.COMMENT_IP_SALT ?? ""}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** Envoi d’e-mail actif si Gmail (mot de passe d’application) ou Resend est configuré. */
export const emailEnabled = mailerEnabled;

export type SubscribeResult =
  | { ok: true; state: "confirmed" | "pending" | "already" }
  | { ok: false; error: string };

export async function subscribe(
  rawEmail: string,
  opts: { ip?: string | null; source?: string } = {},
): Promise<SubscribeResult> {
  const email = normalizeEmail(rawEmail);
  if (!emailLooksValid(email)) return { ok: false, error: "Adresse e-mail invalide." };

  const ipHash = hashIp(opts.ip ?? null);
  if (ipHash) {
    const [rl] = (await sql`
      select count(*)::int as n from newsletter_subscribers
      where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'
    `) as { n: number }[];
    if (rl.n >= 5) return { ok: false, error: "Trop de tentatives. Réessayez plus tard." };
  }

  const [existing] = (await sql`
    select id, status from newsletter_subscribers where email = ${email}
  `) as { id: number; status: string }[];

  const willConfirm = !emailEnabled();
  const token = randomUUID();

  if (existing) {
    if (existing.status === "confirmed") return { ok: true, state: "already" };
    // pending ou unsubscribed → on relance
    await sql`
      update newsletter_subscribers set
        status = ${willConfirm ? "confirmed" : "pending"},
        token = ${token},
        confirmed_at = ${willConfirm ? new Date().toISOString() : null},
        unsubscribed_at = null,
        source = coalesce(${opts.source ?? null}, source)
      where id = ${existing.id}
    `;
  } else {
    await sql`
      insert into newsletter_subscribers (email, status, token, source, ip_hash, confirmed_at)
      values (
        ${email},
        ${willConfirm ? "confirmed" : "pending"},
        ${token},
        ${opts.source ?? "site"},
        ${ipHash},
        ${willConfirm ? new Date().toISOString() : null}
      )
    `;
  }

  if (willConfirm) return { ok: true, state: "confirmed" };

  // Envoi après la réponse (compatible serverless : la fonction reste vivante).
  after(async () => {
    try {
      await sendConfirmationEmail(email, token);
    } catch (e) {
      console.error("[newsletter] mail confirmation:", e instanceof Error ? e.message : e);
    }
  });
  return { ok: true, state: "pending" };
}

export async function confirmByToken(token: string): Promise<boolean> {
  const rows = (await sql`
    update newsletter_subscribers
    set status = 'confirmed', confirmed_at = coalesce(confirmed_at, now())
    where token = ${token} and status <> 'unsubscribed'
    returning id
  `) as { id: number }[];
  return rows.length > 0;
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const rows = (await sql`
    update newsletter_subscribers
    set status = 'unsubscribed', unsubscribed_at = now()
    where token = ${token}
    returning id
  `) as { id: number }[];
  return rows.length > 0;
}

/* ---------- back-office ---------- */

export type Subscriber = {
  id: number;
  email: string;
  status: "pending" | "confirmed" | "unsubscribed";
  source: string | null;
  createdAt: string;
  confirmedAt: string | null;
};

export async function listSubscribers(search = ""): Promise<Subscriber[]> {
  const q = `%${search.trim().toLowerCase()}%`;
  const rows = (
    search.trim()
      ? await sql`
          select id, email, status, source, created_at, confirmed_at
          from newsletter_subscribers
          where lower(email) like ${q}
          order by created_at desc limit 1000
        `
      : await sql`
          select id, email, status, source, created_at, confirmed_at
          from newsletter_subscribers
          order by created_at desc limit 1000
        `
  ) as {
    id: number;
    email: string;
    status: Subscriber["status"];
    source: string | null;
    created_at: string;
    confirmed_at: string | null;
  }[];
  return rows.map((r) => ({
    id: Number(r.id),
    email: r.email,
    status: r.status,
    source: r.source,
    createdAt: r.created_at,
    confirmedAt: r.confirmed_at,
  }));
}

export async function subscriberStats() {
  const [row] = (await sql`
    select
      count(*) filter (where status = 'confirmed')::int as confirmed,
      count(*) filter (where status = 'pending')::int as pending,
      count(*) filter (where status = 'unsubscribed')::int as unsubscribed
    from newsletter_subscribers
  `) as { confirmed: number; pending: number; unsubscribed: number }[];
  return row;
}

export async function addSubscriberManually(rawEmail: string): Promise<SubscribeResult> {
  const email = normalizeEmail(rawEmail);
  if (!emailLooksValid(email)) return { ok: false, error: "Adresse invalide." };
  const [existing] = (await sql`select status from newsletter_subscribers where email = ${email}`) as {
    status: string;
  }[];
  if (existing) {
    if (existing.status === "confirmed") return { ok: true, state: "already" };
    await sql`
      update newsletter_subscribers
      set status = 'confirmed', confirmed_at = now(), unsubscribed_at = null
      where email = ${email}
    `;
    return { ok: true, state: "confirmed" };
  }
  await sql`
    insert into newsletter_subscribers (email, status, token, source, confirmed_at)
    values (${email}, 'confirmed', ${randomUUID()}, 'admin', now())
  `;
  return { ok: true, state: "confirmed" };
}

export async function deleteSubscriber(id: number): Promise<void> {
  await sql`delete from newsletter_subscribers where id = ${id}`;
}

export async function setSubscriberStatus(
  id: number,
  status: Subscriber["status"],
): Promise<void> {
  await sql`
    update newsletter_subscribers set
      status = ${status},
      confirmed_at = case when ${status} = 'confirmed' then coalesce(confirmed_at, now()) else confirmed_at end,
      unsubscribed_at = case when ${status} = 'unsubscribed' then now() else null end
    where id = ${id}
  `;
}

export async function listConfirmedRecipients(): Promise<{ email: string; token: string }[]> {
  return (await sql`
    select email, token from newsletter_subscribers where status = 'confirmed'
    order by confirmed_at asc nulls last, created_at asc
  `) as { email: string; token: string }[];
}

export type Campaign = {
  id: number;
  subject: string;
  recipients: number;
  delivered: number;
  failed: number;
  sentAt: string;
};

export async function recordCampaign(c: {
  subject: string;
  intro: string;
  recipients: number;
  delivered: number;
  failed: number;
}): Promise<void> {
  await sql`
    insert into newsletter_campaigns (subject, intro, recipients, delivered, failed)
    values (${c.subject}, ${c.intro}, ${c.recipients}, ${c.delivered}, ${c.failed})
  `;
}

export async function listCampaigns(limit = 10): Promise<Campaign[]> {
  const rows = (await sql`
    select id, subject, recipients, delivered, failed, sent_at
    from newsletter_campaigns order by sent_at desc limit ${limit}
  `) as {
    id: number;
    subject: string;
    recipients: number;
    delivered: number;
    failed: number;
    sent_at: string;
  }[];
  return rows.map((r) => ({
    id: Number(r.id),
    subject: r.subject,
    recipients: r.recipients,
    delivered: r.delivered,
    failed: r.failed,
    sentAt: r.sent_at,
  }));
}

export async function exportConfirmedCsv(): Promise<string> {
  const rows = (await sql`
    select email, source, to_char(confirmed_at, 'YYYY-MM-DD') as date
    from newsletter_subscribers
    where status = 'confirmed'
    order by confirmed_at asc nulls last, created_at asc
  `) as { email: string; source: string | null; date: string | null }[];
  const head = "email,source,date_confirmation";
  const body = rows
    .map((r) => `${r.email},${(r.source ?? "").replace(/,/g, " ")},${r.date ?? ""}`)
    .join("\n");
  return `${head}\n${body}\n`;
}

/* ---------- e-mail de confirmation ---------- */

async function sendConfirmationEmail(email: string, token: string): Promise<boolean> {
  const confirmUrl = `${siteUrl()}/api/newsletter/confirm?token=${token}`;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f8ede8">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fbf8f3;border:1px solid #e4d9d2">
        <tr><td align="center" style="background:#1a1a1a;padding:24px"><img src="${emailLogoUrl()}" width="140" alt="Groupe JOGOO" style="display:block;border:0"/></td></tr>
        <tr><td style="height:4px;background:#eabf31;font-size:0">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px;font-family:Georgia,serif;color:#1a1a1a;line-height:1.6">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9e3a1c">Lettre d’information</p>
          <h1 style="font-size:20px;margin:0 0 14px">Une dernière étape</h1>
          <p style="margin:0 0 14px">Merci de votre intérêt pour la lettre du Groupe JOGOO — philosophie africaine, débats &amp; questions.</p>
          <p style="margin:0 0 20px">Confirmez votre inscription&nbsp;:</p>
          <p style="margin:0 0 18px"><a href="${confirmUrl}" style="background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 20px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase">Confirmer mon inscription</a></p>
          <p style="margin:0 0 4px;font-size:12px;color:#8a807a">Ou copiez ce lien&nbsp;: ${confirmUrl}</p>
          <p style="margin:14px 0 0;font-size:12px;color:#8a807a">Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>
        </td></tr>
      </table>
    </td></tr></table></body></html>`;

  return sendMail({
    to: email,
    subject: "Confirmez votre inscription à la lettre du Groupe JOGOO",
    html,
  });
}

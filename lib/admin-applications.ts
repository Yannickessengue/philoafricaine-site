import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { neon } from "@neondatabase/serverless";
import "@/lib/admin-db-retry";
import { put, del } from "@vercel/blob";
import { sendMail, siteUrl, emailLogoUrl } from "@/lib/admin-mailer";
import { APPLICATION_STATUSES, STATUS_LABEL, type ApplicationStatus } from "@/lib/admin-application-status";

export { APPLICATION_STATUSES, STATUS_LABEL };
export type { ApplicationStatus };

const sql = neon(process.env.DATABASE_URL!);

/* ---------- Fichiers merci---------- */

export const MAX_FILE = 8 * 1024 * 1024; // 8 Mo / fichier
const DOC_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
const PORTFOLIO_TYPES: Record<string, string> = {
  ...DOC_TYPES,
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const mo = (n: number) => `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;

const slugName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "candidat";

type UploadKind = "cv" | "lettre" | "portfolio";

async function uploadFile(
  file: File,
  kind: UploadKind,
  who: string,
): Promise<{ url: string; name: string }> {
  const allowed = kind === "portfolio" ? PORTFOLIO_TYPES : DOC_TYPES;
  const ext = allowed[file.type];
  if (!ext) {
    const nice = kind === "portfolio" ? "PDF, Word, JPG ou PNG" : "PDF ou Word";
    throw new AppError(`« ${file.name} » : format non accepté (${nice} attendu).`);
  }
  if (file.size === 0) throw new AppError(`« ${file.name} » est vide.`);
  if (file.size > MAX_FILE) {
    throw new AppError(`« ${file.name} » est trop lourd : ${mo(file.size)} (maximum ${mo(MAX_FILE)}).`);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const stamp = Date.now().toString(36);
  const key = `applications/${slugName(who)}-${stamp}/${kind}.${ext}`;
  const blob = await put(key, buf, {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: true, // URL non énumérable — les CV ne doivent pas se deviner
  });
  return { url: blob.url, name: file.name };
}

/* ---------- Erreur métier ---------- */

class AppError extends Error {}
export function isAppError(e: unknown): e is Error {
  return e instanceof AppError;
}

/* ---------- Utilitaires ---------- */

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256")
    .update(`${process.env.COMMENT_IP_SALT ?? ""}:app:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/* ---------- Création ---------- */

export type ApplicationInput = {
  posteId: number | null;
  posteN: number | null;
  posteTitle: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  links: string[];
  cv: File;
  lettre: File | null;
  portfolio: File | null;
  ipHash: string | null;
  honeypot: string;
};

export async function createApplication(
  input: ApplicationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (input.honeypot.trim()) return { ok: true }; // bot silencieux

    const name = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const message = input.message.trim();

    if (name.length < 2 || name.length > 90) return { ok: false, error: "Indiquez votre nom complet." };
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Adresse e-mail invalide." };
    if (message.length < 20) return { ok: false, error: "Présentez votre candidature en quelques phrases (20 caractères minimum)." };
    if (message.length > 6000) return { ok: false, error: "Message trop long (6000 caractères maximum)." };
    if (!(input.cv instanceof File) || input.cv.size === 0) {
      return { ok: false, error: "Le CV est obligatoire." };
    }

    // Limitation de fréquence : 3 candidatures / heure / IP
    if (input.ipHash) {
      const [rec] = (await sql`
        select count(*)::int as n from applications
        where ip_hash = ${input.ipHash} and created_at > now() - interval '1 hour'
      `) as { n: number }[];
      if (rec.n >= 3) {
        return { ok: false, error: "Vous avez déjà envoyé plusieurs candidatures récemment. Réessayez plus tard." };
      }
    }

    const cv = await uploadFile(input.cv, "cv", name);
    const lettre = input.lettre ? await uploadFile(input.lettre, "lettre", name) : null;
    const portfolio = input.portfolio ? await uploadFile(input.portfolio, "portfolio", name) : null;
    const links = input.links.map((l) => l.trim()).filter((l) => /^https?:\/\//i.test(l)).slice(0, 5);

    const [row] = (await sql`
      insert into applications
        (poste_id, poste_n, poste_title, full_name, email, phone, message,
         cv_url, cv_name, letter_url, letter_name, portfolio_url, portfolio_name, links, ip_hash)
      values
        (${input.posteId}, ${input.posteN}, ${input.posteTitle}, ${name}, ${email},
         ${input.phone?.trim() || null}, ${message},
         ${cv.url}, ${cv.name}, ${lettre?.url ?? null}, ${lettre?.name ?? null},
         ${portfolio?.url ?? null}, ${portfolio?.name ?? null}, ${JSON.stringify(links)}, ${input.ipHash})
      returning id
    `) as { id: number }[];

    const record = {
      id: Number(row.id),
      posteTitle: input.posteTitle,
      posteN: input.posteN,
      name,
      email,
      phone: input.phone?.trim() || null,
      message,
      links,
      cv,
      lettre,
      portfolio,
    };
    after(async () => {
      try {
        await Promise.all([notifyRecruiter(record), confirmApplicant(record)]);
      } catch (e) {
        console.error("[applications] mail:", e instanceof Error ? e.message : e);
      }
    });

    return { ok: true };
  } catch (e) {
    if (isAppError(e)) return { ok: false, error: e.message };
    console.error("[applications] create:", e instanceof Error ? e.message : e);
    return { ok: false, error: "L’envoi a échoué. Réessayez dans un instant." };
  }
}

/* ---------- E-mails ---------- */

type MailRecord = {
  id: number;
  posteTitle: string;
  posteN: number | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  links: string[];
  cv: { url: string; name: string };
  lettre: { url: string; name: string } | null;
  portfolio: { url: string; name: string } | null;
};

const shell = (inner: string) => `<!doctype html><html lang="fr"><body style="margin:0;background:#f8ede8">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:26px 12px">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fbf8f3;border:1px solid #e4d9d2">
      <tr><td align="center" style="background:#1a1a1a;padding:22px"><img src="${emailLogoUrl()}" width="130" alt="Groupe JOGOO" style="display:block;border:0"/></td></tr>
      <tr><td style="height:4px;background:#eabf31;font-size:0">&nbsp;</td></tr>
      ${inner}
    </table>
  </td></tr></table></body></html>`;

const fileRow = (label: string, f: { url: string; name: string } | null) =>
  f
    ? `<tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#3f3a38">
         ${label} : <a href="${f.url}" style="color:#9e3a1c">${esc(f.name)}</a></td></tr>`
    : "";

async function notifyRecruiter(r: MailRecord): Promise<void> {
  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER;
  if (!to) return;
  const url = siteUrl();
  const when = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  const inner = `<tr><td style="padding:26px 30px">
    <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#9e3a1c">Nouvelle candidature</p>
    <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:17px;line-height:1.4;color:#1a1a1a">
      ${esc(r.name)} — <strong>${r.posteN ? `Poste ${r.posteN} · ` : ""}${esc(r.posteTitle)}</strong>
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e4d9d2">
      <tr><td style="padding:16px 18px">
        <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a807a">${when}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#3f3a38">E-mail : <a href="mailto:${esc(r.email)}" style="color:#9e3a1c">${esc(r.email)}</a></td></tr>
          ${r.phone ? `<tr><td style="padding:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#3f3a38">Téléphone : ${esc(r.phone)}</td></tr>` : ""}
        </table>
        <div style="margin-top:12px;font-family:Georgia,serif;font-size:14px;line-height:1.6;color:#3f3a38;white-space:pre-wrap">${esc(r.message)}</div>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px">
      ${fileRow("CV", r.cv)}
      ${fileRow("Lettre de motivation", r.lettre)}
      ${fileRow("Portfolio", r.portfolio)}
      ${r.links.map((l) => `<tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#3f3a38">Lien : <a href="${esc(l)}" style="color:#9e3a1c">${esc(l)}</a></td></tr>`).join("")}
    </table>

    <p style="margin:22px 0 0">
      <a href="${url}/admin/candidatures/${r.id}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">Ouvrir dans l’administration</a>
    </p>
  </td></tr>`;

  await sendMail({
    to,
    replyTo: r.email,
    subject: `Candidature — ${r.name} · ${r.posteN ? `Poste ${r.posteN}` : r.posteTitle}`,
    html: shell(inner),
  });
}

async function confirmApplicant(r: MailRecord): Promise<void> {
  const inner = `<tr><td style="padding:26px 30px">
    <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#9e3a1c">Candidature reçue</p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:18px;line-height:1.4;color:#1a1a1a">Merci, ${esc(r.name)}.</p>
    <p style="margin:0 0 14px;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#3f3a38">
      Nous avons bien reçu votre candidature ${r.posteN ? `au poste <strong>${esc(r.posteTitle)}</strong>` : "spontanée"} au Groupe JOGOO.
      L’équipe l’examinera avec attention et reviendra vers vous ${r.posteN ? "si votre profil est retenu pour un entretien" : "en fonction des besoins des programmes"}.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e4d9d2;margin:8px 0 4px">
      <tr><td style="padding:14px 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a807a">
        Pièces transmises :
        <span style="color:#3f3a38">CV${r.lettre ? ", lettre de motivation" : ""}${r.portfolio ? ", portfolio" : ""}${r.links.length ? `, ${r.links.length} lien(s)` : ""}.</span>
      </td></tr>
    </table>
    <p style="margin:18px 0 0;font-family:Georgia,serif;font-size:13px;line-height:1.6;color:#8a807a">
      Une question ? Répondez simplement à cet e-mail.
    </p>
  </td></tr>
  <tr><td style="padding:0 30px 24px">
    <hr style="border:0;border-top:1px solid #e4d9d2;margin:18px 0 12px"/>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a99f98">
      Groupe JOGOO · Philosophie africaine. Débats & questions · ${siteUrl().replace(/^https?:\/\//, "")}
    </p>
  </td></tr>`;

  await sendMail({
    to: r.email,
    subject: "Votre candidature au Groupe JOGOO a bien été reçue",
    html: shell(inner),
  });
}

/* ---------- Back-office ---------- */

export type ApplicationRow = {
  id: number;
  posteId: number | null;
  posteN: number | null;
  posteTitle: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  cvUrl: string;
  cvName: string | null;
  letterUrl: string | null;
  letterName: string | null;
  portfolioUrl: string | null;
  portfolioName: string | null;
  links: string[];
  status: ApplicationStatus;
  note: string | null;
  createdAt: string;
};

const mapApp = (r: Record<string, unknown>): ApplicationRow => ({
  id: Number(r.id),
  posteId: r.poste_id == null ? null : Number(r.poste_id),
  posteN: r.poste_n == null ? null : Number(r.poste_n),
  posteTitle: (r.poste_title as string) ?? "",
  fullName: (r.full_name as string) ?? "",
  email: (r.email as string) ?? "",
  phone: (r.phone as string) ?? null,
  message: (r.message as string) ?? "",
  cvUrl: (r.cv_url as string) ?? "",
  cvName: (r.cv_name as string) ?? null,
  letterUrl: (r.letter_url as string) ?? null,
  letterName: (r.letter_name as string) ?? null,
  portfolioUrl: (r.portfolio_url as string) ?? null,
  portfolioName: (r.portfolio_name as string) ?? null,
  links: Array.isArray(r.links) ? (r.links as string[]) : [],
  status: (r.status as ApplicationStatus) ?? "new",
  note: (r.note as string) ?? null,
  createdAt: new Date(r.created_at as string).toISOString(),
});

export async function listApplications(status?: ApplicationStatus): Promise<ApplicationRow[]> {
  const rows = status
    ? await sql`select * from applications where status = ${status} order by created_at desc`
    : await sql`select * from applications order by created_at desc`;
  return (rows as Record<string, unknown>[]).map(mapApp);
}

export async function getApplicationById(id: number): Promise<ApplicationRow | null> {
  const [r] = (await sql`select * from applications where id = ${id}`) as Record<string, unknown>[];
  return r ? mapApp(r) : null;
}

export async function setApplicationStatus(id: number, status: ApplicationStatus): Promise<void> {
  await sql`update applications set status = ${status} where id = ${id}`;
}

export async function setApplicationNote(id: number, note: string): Promise<void> {
  await sql`update applications set note = ${note.trim() || null} where id = ${id}`;
}

export async function deleteApplication(id: number): Promise<void> {
  const app = await getApplicationById(id);
  if (app && process.env.BLOB_READ_WRITE_TOKEN) {
    const urls = [app.cvUrl, app.letterUrl, app.portfolioUrl].filter(Boolean) as string[];
    try {
      await del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch (e) {
      console.error("[applications] blob del:", e instanceof Error ? e.message : e);
    }
  }
  await sql`delete from applications where id = ${id}`;
}

export async function applicationStats(): Promise<{ total: number; new: number }> {
  const [r] = (await sql`
    select count(*)::int as total,
           count(*) filter (where status = 'new')::int as new
    from applications
  `) as { total: number; new: number }[];
  return r ?? { total: 0, new: 0 };
}

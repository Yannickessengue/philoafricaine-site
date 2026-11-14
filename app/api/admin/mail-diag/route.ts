import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { sendMail, mailerEnabled, siteUrl, fromAddress, emailLogoUrl } from "@/lib/admin-mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const has = (k: string) => (process.env[k] ? "présent" : "manquant");

export async function GET(req: NextRequest) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? ""))) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const report: Record<string, unknown> = {
    env: {
      DATABASE_URL: has("DATABASE_URL"),
      SITE_URL: process.env.SITE_URL ?? "(défaut)",
      GMAIL_USER: process.env.GMAIL_USER ?? "manquant",
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD
        ? `présent (${process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, "").length} car.)`
        : "manquant",
      SMTP_HOST: process.env.SMTP_HOST || "(non défini)",
      SMTP_PORT: process.env.SMTP_PORT || "(non défini)",
      NEWSLETTER_FROM: process.env.NEWSLETTER_FROM ?? "(défaut)",
      NOTIFY_EMAIL: process.env.NOTIFY_EMAIL ?? "(défaut = GMAIL_USER)",
      RESEND_API_KEY: has("RESEND_API_KEY"),
    },
    mailerEnabled: mailerEnabled(),
    from: fromAddress(),
    siteUrl: siteUrl(),
    logoUrl: emailLogoUrl(),
  };

  if (new URL(req.url).searchParams.get("send") === "1") {
    const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER || "";
    let error: string | null = null;
    let sent = false;
    try {
      const nodemailer = (await import("nodemailer")).default;
      const t = nodemailer.createTransport(
        process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT || 587),
              secure: Number(process.env.SMTP_PORT) === 465,
              auth: { user: process.env.SMTP_USER, pass: (process.env.SMTP_PASS || "").replace(/\s+/g, "") },
            }
          : {
              host: "smtp.gmail.com",
              port: 465,
              secure: true,
              auth: {
                user: process.env.GMAIL_USER,
                pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
              },
              connectionTimeout: 10_000,
            },
      );
      // vérifie la connexion + l’auth AVANT d’envoyer
      await t.verify();
      await sendMail({
        to,
        subject: "Diagnostic e-mail — Groupe JOGOO",
        html: `<p style="font-family:Georgia,serif">Diagnostic OK : l’envoi d’e-mails fonctionne sur le site déployé.</p><p style="font-family:Arial;color:#888;font-size:12px">${new Date().toISOString()}</p>`,
      });
      sent = true;
    } catch (e) {
      error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    }
    report.testSend = { to, sent, error };
  } else {
    report.testSend = "Ajoutez ?send=1 à l’URL pour tenter un envoi réel (vers NOTIFY_EMAIL).";
  }

  return NextResponse.json(report, { status: 200 });
}

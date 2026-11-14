import "server-only";

/** Config SMTP effective, quelle que soit la provenance des variables. */
function smtpConfig() {
  // 1) SMTP générique (Brevo, Mailgun, OVH…)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 587);
    return {
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS.replace(/\s+/g, "") },
    };
  }
  // 2) Raccourci Gmail (mot de passe d’application obligatoire)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""),
      },
    };
  }
  return null;
}

export function mailerEnabled(): boolean {
  return !!smtpConfig() || !!process.env.RESEND_API_KEY;
}

export function siteUrl(): string {
  return (process.env.SITE_URL || "https://www.philoafricaine.org").replace(/\/+$/, "");
}

export function fromAddress(): string {
  if (process.env.NEWSLETTER_FROM) return process.env.NEWSLETTER_FROM;
  const addr = process.env.GMAIL_USER || process.env.SMTP_USER;
  return addr ? `Groupe JOGOO <${addr}>` : "Groupe JOGOO <onboarding@resend.dev>";
}

/** URL absolue du logo blanc pour les en-têtes d’e-mails (servi par le CDN). */
export function emailLogoUrl(): string {
  return `${siteUrl()}/jogoo/logo-jogoo-blanc.png`;
}

type SendInput = { to: string; subject: string; html: string; replyTo?: string };

/** Envoie un e-mail. Priorité : SMTP (Gmail/Brevo…), puis Resend. Renvoie true si accepté. */
export async function sendMail({ to, subject, html, replyTo }: SendInput): Promise<boolean> {
  const smtp = smtpConfig();

  if (smtp) {
    try {
      const nodemailer = (await import("nodemailer")).default;
      const transport = nodemailer.createTransport({
        ...smtp,
        connectionTimeout: 10_000,
        greetingTimeout: 8_000,
        socketTimeout: 15_000,
      });
      await transport.sendMail({ from: fromAddress(), to, subject, html, replyTo });
      return true;
    } catch (err) {
      console.error("[mailer] smtp:", err instanceof Error ? err.message : err);
      return false;
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: fromAddress(),
          to,
          subject,
          html,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("[mailer] resend:", err instanceof Error ? err.message : err);
      return false;
    }
  }

  console.warn("[mailer] aucun transport configuré");
  return false;
}

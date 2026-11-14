import { siteUrl, sendMail } from "@/lib/admin-mailer";
import { assembleDigest, UNSUB_PLACEHOLDER } from "@/lib/admin-newsletter-digest";
import { listConfirmedRecipients, recordCampaign } from "@/lib/admin-newsletter";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendDigestCampaign(
  intro: string,
): Promise<{ ok: boolean; delivered: number; failed: number; total: number; error?: string }> {
  const recipients = await listConfirmedRecipients();
  if (recipients.length === 0) return { ok: false, delivered: 0, failed: 0, total: 0, error: "Aucun abonné confirmé." };

  const d = await assembleDigest(intro);
  let delivered = 0;
  let failed = 0;

  for (const r of recipients) {
    const html = d.html.replaceAll(UNSUB_PLACEHOLDER, `${siteUrl()}/api/newsletter/unsubscribe?token=${r.token}`);
    const ok = await sendMail({ to: r.email, subject: d.subject, html });
    if (ok) delivered++;
    else failed++;
    await sleep(180); // ménage la limite d’envoi Gmail
  }

  await recordCampaign({ subject: d.subject, intro, recipients: recipients.length, delivered, failed });
  return { ok: true, delivered, failed, total: recipients.length };
}

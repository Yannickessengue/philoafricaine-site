"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { sendMail, siteUrl } from "@/lib/admin-mailer";
import { assembleDigest, UNSUB_PLACEHOLDER } from "@/lib/admin-newsletter-digest";
import { sendDigestCampaign } from "@/lib/admin-newsletter-send";

async function assertAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? "");
  if (!ok) throw new Error("Non autorisé.");
}

export async function previewDigest(
  intro: string,
): Promise<{ subject: string; html: string; summary: Awaited<ReturnType<typeof assembleDigest>>["summary"] }> {
  await assertAdmin();
  const d = await assembleDigest(intro);
  const html = d.html.replaceAll(UNSUB_PLACEHOLDER, `${siteUrl()}/api/newsletter/unsubscribe?token=APERCU`);
  return { subject: d.subject, html, summary: d.summary };
}

export async function sendTestDigest(
  email: string,
  intro: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) {
    return { ok: false, error: "Adresse invalide." };
  }
  const d = await assembleDigest(intro);
  const html = d.html.replaceAll(
    UNSUB_PLACEHOLDER,
    `${siteUrl()}/api/newsletter/unsubscribe?token=TEST`,
  );
  const sent = await sendMail({
    to: email.trim(),
    subject: `[TEST] ${d.subject}`,
    html,
  });
  return sent ? { ok: true } : { ok: false, error: "L’envoi a échoué (vérifiez la configuration e-mail)." };
}

export async function sendDigestToAll(
  intro: string,
): Promise<{ ok: boolean; delivered: number; failed: number; total: number; error?: string }> {
  await assertAdmin();
  const result = await sendDigestCampaign(intro);
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin/newsletter/lettre");

  return result;
}

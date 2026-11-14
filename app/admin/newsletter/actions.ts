"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import {
  addSubscriberManually,
  deleteSubscriber,
  setSubscriberStatus,
  type Subscriber,
} from "@/lib/admin-newsletter";

async function assertAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? "");
  if (!ok) throw new Error("Non autorisé.");
}

export async function addSubscriber(email: string): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const res = await addSubscriberManually(email);
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin");
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}

export async function removeSubscriber(id: number) {
  await assertAdmin();
  await deleteSubscriber(id);
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin");
}

export async function changeSubscriberStatus(id: number, status: Subscriber["status"]) {
  await assertAdmin();
  await setSubscriberStatus(id, status);
  revalidatePath("/admin/newsletter");
  revalidatePath("/admin");
}

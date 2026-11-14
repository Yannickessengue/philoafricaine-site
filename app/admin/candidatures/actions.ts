"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import {
  setApplicationStatus,
  setApplicationNote,
  deleteApplication,
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/admin-applications";

async function assertAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? ""))) {
    throw new Error("Non autorisé.");
  }
}

export async function updateStatus(id: number, status: string): Promise<{ ok: boolean }> {
  await assertAdmin();
  if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) return { ok: false };
  await setApplicationStatus(id, status as ApplicationStatus);
  revalidatePath("/admin/candidatures");
  revalidatePath(`/admin/candidatures/${id}`);
  return { ok: true };
}

export async function saveNote(id: number, note: string): Promise<{ ok: boolean }> {
  await assertAdmin();
  await setApplicationNote(id, note);
  revalidatePath(`/admin/candidatures/${id}`);
  return { ok: true };
}

export async function removeApplication(id: number): Promise<void> {
  await assertAdmin();
  await deleteApplication(id);
  revalidatePath("/admin/candidatures");
  redirect("/admin/candidatures");
}

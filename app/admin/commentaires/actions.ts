"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { setStatus } from "@/lib/admin-comments";

async function assertAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? "");
  if (!ok) throw new Error("Non autorisé.");
}

export async function moderateComment(id: number, status: "visible" | "hidden", slug: string) {
  await assertAdmin();
  await setStatus(id, status);
  revalidatePath("/admin/commentaires");
  revalidatePath("/admin");
  revalidatePath(`/edito/${slug}`);
}

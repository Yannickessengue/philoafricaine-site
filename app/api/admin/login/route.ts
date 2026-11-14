import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const password = String(data.password ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const token = await createSessionToken(process.env.ADMIN_SESSION_SECRET ?? "");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions);
  return res;
}

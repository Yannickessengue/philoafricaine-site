import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { exportConfirmedCsv } from "@/lib/admin-newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET ?? "");
  if (!ok) return NextResponse.json({ error: "non autorisé" }, { status: 401 });

  const csv = await exportConfirmedCsv();
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="jogoo-newsletter-${date}.csv"`,
    },
  });
}

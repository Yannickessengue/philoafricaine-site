import { NextResponse } from 'next/server';

/** Inscription à la lettre d'information (Brevo), si BREVO_API_KEY et BREVO_LIST_ID sont définis. */
export async function POST(req: Request) {
  const corps = await req.json().catch(() => ({}));
  const email = String(corps.email ?? '').trim().toLowerCase();
  if (corps.site) return NextResponse.json({ ok: true });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ erreur: 'Adresse électronique invalide.' }, { status: 400 });
  const cle = process.env.BREVO_API_KEY;
  const liste = Number(process.env.BREVO_LIST_ID);
  if (!cle || !liste) return NextResponse.json({ repli: true }, { status: 503 });
  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, listIds: [liste], updateEnabled: true }),
  });
  if (!r.ok && r.status !== 204) return NextResponse.json({ erreur: 'Inscription impossible pour le moment.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}

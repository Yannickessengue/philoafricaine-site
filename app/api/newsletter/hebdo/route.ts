import { NextResponse } from 'next/server';
import { composerLettre, lettreHTML } from '@/lib/lettre';

/**
 * Envoi hebdomadaire de la lettre (tâche planifiée Vercel, chaque lundi à 8 h, heure de Paris : voir vercel.json).
 * Crée une campagne Brevo avec la lettre du jour et l’envoie à la liste des abonnés.
 * Variables : BREVO_API_KEY, BREVO_LIST_ID, CRON_SECRET (obligatoire), BREVO_SENDER_EMAIL (adresse validée dans Brevo).
 * Sans nouvel édito depuis huit jours, la lettre n’est pas envoyée (sauf ?force=1).
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ erreur: 'Non autorisé' }, { status: 401 });
  const cle = process.env.BREVO_API_KEY;
  const liste = Number(process.env.BREVO_LIST_ID);
  if (!cle || !liste) return NextResponse.json({ erreur: 'Brevo n’est pas configuré (BREVO_API_KEY, BREVO_LIST_ID).' }, { status: 503 });

  const l = await composerLettre();
  const force = new URL(req.url).searchParams.get('force') === '1';
  if (!l.edito?.recent && !force) return NextResponse.json({ envoye: false, raison: 'Pas de nouvel édito cette semaine.' });

  const entetes = { 'api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' };
  const creation = await fetch('https://api.brevo.com/v3/emailCampaigns', {
    method: 'POST',
    headers: entetes,
    body: JSON.stringify({
      name: `Lettre hebdomadaire n° ${l.numero} — ${new Date().toISOString().slice(0, 10)}`,
      subject: l.sujet,
      previewText: l.edito?.accroche?.slice(0, 140),
      sender: { name: 'Groupe JOGOO', email: process.env.BREVO_SENDER_EMAIL || 'philoafricaine@gmail.com' },
      replyTo: 'philoafricaine@gmail.com',
      type: 'classic',
      htmlContent: lettreHTML(l),
      recipients: { listIds: [liste] },
    }),
  });
  const campagne = await creation.json().catch(() => ({}));
  if (!creation.ok || !campagne.id) return NextResponse.json({ erreur: 'Création de la campagne refusée par Brevo.', detail: campagne }, { status: 502 });
  const envoi = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campagne.id}/sendNow`, { method: 'POST', headers: entetes });
  if (!envoi.ok) return NextResponse.json({ erreur: 'Envoi refusé par Brevo.', campagne: campagne.id, detail: await envoi.text() }, { status: 502 });
  return NextResponse.json({ envoye: true, campagne: campagne.id, sujet: l.sujet });
}

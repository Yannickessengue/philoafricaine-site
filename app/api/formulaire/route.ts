import { NextResponse } from 'next/server';
import { getCandidature, getInscription, type Activite } from '@/lib/activites';
import { DESTINATAIRES, EXTENSIONS, FICHIER_MAX, FORMULAIRES } from '@/lib/formulaires';
import { SITE } from '@/lib/site';

/**
 * Réception des formulaires d’inscription et de candidature.
 * Chaque envoi part, par Brevo (e-mail transactionnel), à philoafricaine@gmail.com et fondseboussi@gmail.com,
 * avec le fichier joint ; la personne reçoit un accusé de réception avec le PDF de l’activité.
 * Variables : BREVO_API_KEY, BREVO_SENDER_EMAIL (adresse d’expédition validée dans Brevo).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const echap = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const derniers = new Map<string, number>();

function tableau(lignes: [string, string][]) {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font:15px/1.55 Georgia,serif;color:#1a1512">${lignes
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 14px 10px 0;border-bottom:1px solid #eee3d6;vertical-align:top;width:34%;font:700 12px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#8a2a12">${echap(k)}</td><td style="padding:10px 0;border-bottom:1px solid #eee3d6;white-space:pre-wrap">${echap(v)}</td></tr>`,
    )
    .join('')}</table>`;
}

function enveloppe(titre: string, corps: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6efe6;padding:24px"><div style="max-width:680px;margin:0 auto;background:#fff;border-top:5px solid #c8481e;padding:28px 30px">
<p style="margin:0 0 4px;font:700 11px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#c8481e">Groupe JOGOO · Fonds Eboussi Boulaga</p>
<h1 style="margin:0 0 18px;font:400 24px/1.25 Georgia,serif;color:#1a1512">${echap(titre)}</h1>${corps}
<p style="margin:26px 0 0;font:12px/1.5 Arial,sans-serif;color:#8b7f74">Philosophie africaine. Débats &amp; Questions · <a href="${SITE}" style="color:#c8481e">${SITE.replace(/^https?:\/\//, '')}</a></p></div></body></html>`;
}

async function brevo(cle: string, message: object) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': cle, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(message),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status} ${await r.text().catch(() => '')}`);
}

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ erreur: 'Envoi illisible (le fichier est peut-être trop lourd).' }, { status: 400 });
  }
  const txt = (k: string) => String(fd.get(k) ?? '').trim();
  if (txt('site_web') || Number(txt('duree')) < 4000) return NextResponse.json({ ok: true }); // robots

  const sorte = txt('sorte');
  const slug = txt('slug');
  const a: Activite | null = sorte === 'inscription' ? await getInscription(slug) : sorte === 'candidature' ? await getCandidature(slug) : null;
  if (!a) return NextResponse.json({ erreur: 'Activité introuvable.' }, { status: 404 });
  if (!a.ouvert) return NextResponse.json({ erreur: 'Les inscriptions pour cette activité sont closes.' }, { status: 410 });
  if (!txt('accord')) return NextResponse.json({ erreur: 'Merci de cocher la case d’accord.' }, { status: 400 });

  // Validation à partir de la définition du formulaire (jamais du navigateur)
  const lignes: [string, string][] = [];
  let piece: { name: string; content: string } | null = null;
  for (const c of a.champs) {
    if (c.type === 'fichier') {
      const f = fd.get(c.nom);
      if (f instanceof File && f.size > 0) {
        const nom = f.name.replace(/[^\w.\- ()À-ÿ]/g, '_').slice(-120);
        if (f.size > FICHIER_MAX) return NextResponse.json({ erreur: 'Fichier trop lourd (4 Mo au plus).' }, { status: 413 });
        if (!EXTENSIONS.some((x) => nom.toLowerCase().endsWith(x))) return NextResponse.json({ erreur: `Format accepté : ${EXTENSIONS.join(', ')}.` }, { status: 400 });
        piece = { name: nom, content: Buffer.from(await f.arrayBuffer()).toString('base64') };
        lignes.push([c.libelle, `${nom} (pièce jointe, ${Math.round(f.size / 1024)} Ko)`]);
      } else if (c.requis) return NextResponse.json({ erreur: `Fichier manquant : ${c.libelle}.` }, { status: 400 });
      continue;
    }
    const v = txt(c.nom).slice(0, c.max ?? 500);
    if (c.requis && !v) return NextResponse.json({ erreur: `Champ obligatoire : ${c.libelle}.` }, { status: 400 });
    if (c.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return NextResponse.json({ erreur: 'Adresse e-mail invalide.' }, { status: 400 });
    if (c.type === 'choix' && v && c.options?.length && !c.options.includes(v)) return NextResponse.json({ erreur: `Choix invalide : ${c.libelle}.` }, { status: 400 });
    if (v) lignes.push([c.libelle, v]);
  }

  const email = txt('email');
  const qui = `${txt('prenom')} ${txt('nom')}`.trim();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'inconnu';
  const t = Date.now();
  if ((derniers.get(ip + slug) ?? 0) > t - 30_000) return NextResponse.json({ erreur: 'Envoi déjà reçu il y a un instant.' }, { status: 429 });

  const cle = process.env.BREVO_API_KEY;
  if (!cle)
    return NextResponse.json(
      { erreur: 'L’envoi en ligne n’est pas encore activé.' },
      { status: 503 },
    );
  const expediteur = { name: a.organisateur === 'Fonds Eboussi Boulaga' ? 'Fonds Eboussi Boulaga' : 'Groupe JOGOO', email: process.env.BREVO_SENDER_EMAIL || 'philoafricaine@gmail.com' };
  const formulaire = FORMULAIRES[a.genre].titre;
  const pdf = a.fichier ? `${SITE}${a.fichier}` : null;
  const page = `${SITE}/${a.sorte}/${a.slug}`;

  try {
    // 1. Copie aux deux adresses du Groupe et du Fonds
    await brevo(cle, {
      sender: expediteur,
      to: DESTINATAIRES.map((e) => ({ email: e })),
      replyTo: { email, name: qui },
      subject: `[${formulaire}] ${qui} · ${a.titre}`.slice(0, 250),
      htmlContent: enveloppe(
        `${formulaire} : ${qui}`,
        `<p style="margin:0 0 16px;font:15px/1.55 Georgia,serif;color:#5b5048"><strong style="color:#1a1512">${echap(a.titre)}</strong>${a.quand ? `<br>${echap(a.quand)}` : ''}</p>${tableau([
          ...lignes,
          ['Reçu le', new Date(t).toLocaleString('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'full', timeStyle: 'short' }) + ' (heure du Cameroun)'],
        ])}<p style="margin:18px 0 0;font:13px Arial,sans-serif;color:#8b7f74">Répondre à ce message écrit directement à ${echap(email)}.</p>`,
      ),
      ...(piece ? { attachment: [piece] } : {}),
    });
    // 2. Accusé de réception, avec le PDF de l’activité
    await brevo(cle, {
      sender: expediteur,
      to: [{ email, name: qui }],
      replyTo: { email: DESTINATAIRES[1], name: 'Fonds Eboussi Boulaga' },
      subject: `${a.sorte === 'inscription' ? 'Inscription enregistrée' : 'Envoi bien reçu'} · ${a.titre}`.slice(0, 250),
      htmlContent: enveloppe(
        a.sorte === 'inscription' ? 'Votre inscription est enregistrée' : 'Votre envoi est bien reçu',
        `<p style="font:16px/1.6 Georgia,serif;color:#1a1512">Bonjour ${echap(txt('prenom'))},</p>
<p style="font:16px/1.6 Georgia,serif;color:#1a1512">Merci pour votre ${a.sorte === 'inscription' ? 'inscription à' : 'envoi pour'} <strong>${echap(a.titre)}</strong>. ${
          a.sorte === 'inscription'
            ? 'Le lien de connexion et les informations pratiques vous seront envoyés avant la séance.'
            : 'Votre dossier a été transmis aux organisateurs, qui reviendront vers vous après examen.'
        }</p>
${pdf ? `<p style="margin:22px 0"><a href="${pdf}" style="display:inline-block;background:#c8481e;color:#fff;text-decoration:none;font:700 13px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:13px 20px">Télécharger le document (PDF)</a></p>` : ''}
<p style="font:13px/1.5 Arial,sans-serif;color:#8b7f74;margin:22px 0 8px">Copie de votre envoi :</p>${tableau(lignes)}
<p style="font:14px/1.6 Georgia,serif;color:#5b5048;margin-top:20px">Page de l’activité : <a href="${page}" style="color:#c8481e">${page.replace(/^https?:\/\//, '')}</a><br>Pour toute question : ${DESTINATAIRES.join(' · ')}</p>`,
      ),
    });
  } catch (e) {
    console.error('formulaire', e);
    return NextResponse.json({ erreur: 'Le service d’envoi n’a pas répondu.' }, { status: 502 });
  }
  derniers.set(ip + slug, t);
  return NextResponse.json({ ok: true });
}

// Formulaires du site : voir lib/formulaires.ts (champs) et lib/activites.ts (activités).
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdhesion, getCandidature, getInscription, type Activite } from '@/lib/activites';
import { DESTINATAIRES, EXTENSIONS, FICHIER_MAX, FORMULAIRES } from '@/lib/formulaires';
import { SITE } from '@/lib/site';

/**
 * Réception des formulaires d’inscription et de candidature.
 * Chaque envoi part, par Brevo (e-mail transactionnel), à philoafricaine@gmail.com et fondseboussi@gmail.com,
 * avec le fichier joint ; la personne reçoit un accusé de réception avec le PDF de l’activité.
 * Envoi : Brevo si BREVO_API_KEY (+ BREVO_SENDER_EMAIL) est défini, sinon Gmail directement si GMAIL_APP_PASSWORD
 * (mot de passe d’application Google, + GMAIL_USER, par défaut philoafricaine@gmail.com).
 * LIENS_ZOOM (facultatif) : JSON {"<slug agenda>": {"lien": "...", "id": "...", "code": "..."}} — le lien Zoom
 * n’est jamais publié sur le site (dépôt public) : il n’apparaît que dans l’e-mail de confirmation des inscrits.
 */
type Zoom = { lien: string; id?: string; code?: string };
function zoomPour(slug: string): Zoom | null {
  try {
    const z = JSON.parse(process.env.LIENS_ZOOM || '{}')[slug];
    return z && typeof z.lien === 'string' && z.lien.startsWith('https://') ? z : null;
  } catch {
    return null;
  }
}
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

type Message = {
  sender: { name: string; email: string };
  to: { email: string; name?: string }[];
  replyTo: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  attachment?: { name: string; content: string }[];
};

const gmail = () =>
  process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER || 'philoafricaine@gmail.com', pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '') },
      })
    : null;

const serviceActif = () => Boolean(process.env.BREVO_API_KEY || process.env.GMAIL_APP_PASSWORD);

async function envoyer(m: Message) {
  const cle = process.env.BREVO_API_KEY;
  if (cle) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': cle, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(m),
    });
    if (!r.ok) throw new Error(`Brevo ${r.status} ${await r.text().catch(() => '')}`);
    return;
  }
  const t = gmail();
  if (!t) throw new Error('Aucun service d’envoi configuré');
  const nom = (n?: string, e?: string) => (n ? `"${n.replace(/"/g, '')}" <${e}>` : e!);
  await t.sendMail({
    from: nom(m.sender.name, process.env.GMAIL_USER || 'philoafricaine@gmail.com'),
    to: m.to.map((d) => nom(d.name, d.email)),
    replyTo: nom(m.replyTo.name, m.replyTo.email),
    subject: m.subject,
    html: m.htmlContent,
    attachments: m.attachment?.map((a) => ({ filename: a.name, content: Buffer.from(a.content, 'base64') })),
  });
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
  const a: Activite | null =
    sorte === 'inscription' ? await getInscription(slug) : sorte === 'candidature' ? await getCandidature(slug) : sorte === 'adhesion' && slug === getAdhesion().slug ? getAdhesion() : null;
  if (!a) return NextResponse.json({ erreur: 'Activité introuvable.' }, { status: 404 });
  if (!a.ouvert) return NextResponse.json({ erreur: 'Les inscriptions pour cette activité sont closes.' }, { status: 410 });
  if (!txt('accord')) return NextResponse.json({ erreur: 'Merci de cocher la case d’accord.' }, { status: 400 });

  // Validation à partir de la définition du formulaire (jamais du navigateur)
  const lignes: [string, string][] = [];
  const pieces: { name: string; content: string }[] = [];
  let total = 0;
  for (const c of a.champs) {
    if (c.type === 'fichier') {
      const f = fd.get(c.nom);
      if (f instanceof File && f.size > 0) {
        const nom = f.name.replace(/[^\w.\- ()À-ÿ]/g, '_').slice(-120);
        total += f.size;
        if (f.size > FICHIER_MAX || total > FICHIER_MAX) return NextResponse.json({ erreur: 'Fichiers trop lourds (4 Mo au plus en tout).' }, { status: 413 });
        const ext = c.accept ?? EXTENSIONS;
        if (!ext.some((x) => nom.toLowerCase().endsWith(x))) return NextResponse.json({ erreur: `${c.libelle} : formats acceptés ${ext.join(', ')}.` }, { status: 400 });
        pieces.push({ name: `${c.nom}-${nom}`, content: Buffer.from(await f.arrayBuffer()).toString('base64') });
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

  if (!serviceActif())
    return NextResponse.json(
      { erreur: 'L’envoi en ligne n’est pas encore activé.' },
      { status: 503 },
    );
  const expediteur = { name: a.organisateur === 'Fonds Eboussi Boulaga' ? 'Fonds Eboussi Boulaga' : 'Groupe JOGOO', email: process.env.BREVO_SENDER_EMAIL || 'philoafricaine@gmail.com' };
  const formulaire = FORMULAIRES[a.genre].titre;
  const pdf = a.fichier ? `${SITE}${a.fichier}` : null;
  const page = a.sorte === 'adhesion' ? `${SITE}/adhesion` : `${SITE}/${a.sorte}/${a.slug}`;
  const zoom = a.sorte === 'inscription' ? zoomPour(a.slug) : null;
  const blocZoom = zoom
    ? `<div style="margin:22px 0;padding:18px 20px;background:#f6efe6;border-left:4px solid #1a1512">
<p style="margin:0 0 6px;font:700 11px Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a2a12">Rejoindre la séance sur Zoom</p>
<p style="margin:0 0 12px;font:15px/1.5 Georgia,serif;color:#1a1512">${echap(a.quand)}</p>
<p style="margin:0 0 12px"><a href="${echap(zoom.lien)}" style="display:inline-block;background:#1a1512;color:#fff;text-decoration:none;font:700 13px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:12px 18px">Participer à la réunion Zoom</a></p>
${zoom.id ? `<p style="margin:0;font:14px/1.6 Arial,sans-serif;color:#5b5048">ID de réunion : <strong>${echap(zoom.id)}</strong>${zoom.code ? ` · Code secret : <strong>${echap(zoom.code)}</strong>` : ''}</p>` : ''}
<p style="margin:10px 0 0;font:13px/1.5 Arial,sans-serif;color:#8b7f74">Ce lien vous est personnel : merci de ne pas le diffuser. La séance est aussi retransmise en direct sur <a href="${SITE}/direct" style="color:#c8481e">${SITE.replace(/^https?:\/\//, '')}/direct</a>.</p></div>`
    : '';

  try {
    // 1. Copie aux deux adresses du Groupe et du Fonds
    await envoyer({
      sender: expediteur,
      to: (a.sorte === 'adhesion' ? DESTINATAIRES.slice(0, 1) : DESTINATAIRES).map((e) => ({ email: e })),
      replyTo: { email, name: qui },
      subject: `[${formulaire}] ${qui} · ${a.titre}`.slice(0, 250),
      htmlContent: enveloppe(
        `${formulaire} : ${qui}`,
        `<p style="margin:0 0 16px;font:15px/1.55 Georgia,serif;color:#5b5048"><strong style="color:#1a1512">${echap(a.titre)}</strong>${a.quand ? `<br>${echap(a.quand)}` : ''}</p>${tableau([
          ...lignes,
          ['Reçu le', new Date(t).toLocaleString('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'full', timeStyle: 'short' }) + ' (heure du Cameroun)'],
        ])}<p style="margin:18px 0 0;font:13px Arial,sans-serif;color:#8b7f74">Répondre à ce message écrit directement à ${echap(email)}.</p>`,
      ),
      ...(pieces.length ? { attachment: pieces } : {}),
    });
    // 2. Accusé de réception, avec le PDF de l’activité
    await envoyer({
      sender: expediteur,
      to: [{ email, name: qui }],
      replyTo: a.sorte === 'adhesion' ? { email: DESTINATAIRES[0], name: 'Groupe JOGOO' } : { email: DESTINATAIRES[1], name: 'Fonds Eboussi Boulaga' },
      subject: `${a.sorte === 'inscription' ? 'Inscription enregistrée' : a.sorte === 'adhesion' ? 'Demande d’adhésion reçue' : 'Envoi bien reçu'} · ${a.titre}`.slice(0, 250),
      htmlContent: enveloppe(
        a.sorte === 'inscription' ? 'Votre inscription est enregistrée' : a.sorte === 'adhesion' ? 'Votre demande d’adhésion est bien reçue' : 'Votre envoi est bien reçu',
        `<p style="font:16px/1.6 Georgia,serif;color:#1a1512">Bonjour ${echap(txt('prenom'))},</p>
<p style="font:16px/1.6 Georgia,serif;color:#1a1512">Merci pour votre ${a.sorte === 'inscription' ? 'inscription à' : 'envoi pour'} <strong>${echap(a.titre)}</strong>. ${
          a.sorte === 'inscription'
            ? zoom
              ? 'Voici le lien pour rejoindre la séance ; gardez ce message.'
              : 'Le lien de connexion et les informations pratiques vous seront envoyés avant la séance.'
            : a.sorte === 'adhesion'
              ? `Le bureau examinera votre demande et vous adressera votre attestation de membre. Si ce n’est pas déjà fait, réglez votre cotisation (PayPal ou virement : voir ${SITE}/adhesion) et joignez le justificatif en répondant à ce message, avec les pièces non envoyées en ligne.`
              : 'Votre dossier a été transmis aux organisateurs, qui reviendront vers vous après examen.'
        }</p>
${blocZoom}
${pdf ? `<p style="margin:22px 0"><a href="${pdf}" style="display:inline-block;background:#c8481e;color:#fff;text-decoration:none;font:700 13px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:13px 20px">Télécharger le document (PDF)</a></p>` : ''}
<p style="font:13px/1.5 Arial,sans-serif;color:#8b7f74;margin:22px 0 8px">Copie de votre envoi :</p>${tableau(lignes)}
<p style="font:14px/1.6 Georgia,serif;color:#5b5048;margin-top:20px">Page de l’activité : <a href="${page}" style="color:#c8481e">${page.replace(/^https?:\/\//, '')}</a><br>Pour toute question : ${(a.sorte === 'adhesion' ? DESTINATAIRES.slice(0, 1) : DESTINATAIRES).join(' · ')}</p>`,
      ),
    });
  } catch (e) {
    console.error('formulaire', e);
    return NextResponse.json({ erreur: 'Le service d’envoi n’a pas répondu.' }, { status: 502 });
  }
  derniers.set(ip + slug, t);
  return NextResponse.json({ ok: true });
}

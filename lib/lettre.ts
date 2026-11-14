import { reader, getActualites, getAgenda, getEditos, sansEmail } from '@/lib/content';
import { CANDIDATURES_CLOSES } from '@/lib/postes';
import { getPodcasts } from '@/lib/podcasts';
import { getMinutes, MINUTE } from '@/lib/minutes';
import { SITE } from '@/lib/site';

/**
 * Lettre d’information hebdomadaire.
 * Composée automatiquement chaque lundi à partir du contenu publié :
 * l’édito de la semaine, les nouveautés des sept derniers jours, les appels encore ouverts,
 * les rendez-vous à venir et un épisode de podcast. Mise en forme en HTML « e-mail » (tableaux, styles en ligne).
 */

const esc = (s?: string | null) => (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sansMd = (s?: string | null) => (s ?? '').replace(/\*+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
const jour = (iso?: string | null) => (iso ? new Date(iso + (iso.length === 10 ? 'T12:00:00Z' : '')).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '');
const abs = (u?: string | null) => (!u ? '' : /^https?:/.test(u) ? u : `${SITE}${u}`);

export type Lettre = Awaited<ReturnType<typeof composerLettre>>;

export async function composerLettre(maintenant = new Date()) {
  const [editos, actus, agenda, appels, postes, podcasts, flashs] = await Promise.all([
    getEditos(),
    getActualites(),
    getAgenda(),
    reader.collections.appels.all(),
    reader.collections.postes.all(),
    getPodcasts(),
    reader.collections.flash.all(),
  ]);
  const minutes = await getMinutes();
  const t = maintenant.getTime();
  const ilYa = (jours: number) => new Date(t - jours * 864e5).toISOString().slice(0, 10);
  const aujourdhui = new Date(t).toISOString().slice(0, 10);

  const e = editos[0];
  const edito = e && {
    titre: e.entry.titre,
    soustitre: e.entry.soustitre,
    surtitre: e.entry.surtitre,
    accroche: sansMd(e.entry.accroche),
    image: abs(e.entry.image),
    auteur: sansEmail(e.entry.signature).split(/\s+·\s+|,\s+/)[0],
    date: e.entry.date,
    url: `${SITE}/edito/${e.slug}`,
    pdf: e.entry.pdf ? abs(e.entry.pdf) : `${SITE}/edito/${e.slug}/pdf`,
    recent: (e.entry.date ?? '') >= ilYa(8),
  };

  let nouveautes = actus.filter((a) => (a.entry.date ?? '') >= ilYa(7));
  if (nouveautes.length === 0) nouveautes = actus.slice(0, 2);
  const actualites = nouveautes.slice(0, 4).map((a) => ({ titre: a.entry.titre, date: a.entry.date, resume: sansMd(a.entry.resume), image: abs(a.entry.image), url: `${SITE}/actualites/${a.slug}` }));

  const appelsOuverts = appels
    .filter((a) => a.entry.ouvert && (!a.entry.cloture || a.entry.cloture >= aujourdhui))
    .sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0))
    .map((a) => ({ titre: a.entry.titre, type: a.entry.type, limite: a.entry.dateLimite, url: `${SITE}/recherche/appels-a-contributions` }));

  const postesOuverts = CANDIDATURES_CLOSES ? 0 : postes.filter((p) => !p.entry.pourvu).length;

  const rendezVous = agenda
    .filter((a) => (a.entry.date ?? '') >= aujourdhui)
    .sort((a, b) => (a.entry.date ?? '').localeCompare(b.entry.date ?? ''))
    .slice(0, 4)
    .map((a) => ({ titre: a.entry.intitule, date: a.entry.dateAffichee || jour(a.entry.date), lieu: a.entry.lieu, url: `${SITE}/agenda` }));

  // Un épisode de podcast différent chaque semaine.
  const semaine = Math.floor(t / (7 * 864e5));
  const podcast = podcasts.length ? podcasts[semaine % podcasts.length] : null;
  const flash = flashs.length ? flashs.sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0))[semaine % flashs.length] : null;

  const numero = Math.max(1, editos.length);
  return {
    date: maintenant,
    numero,
    sujet: edito ? `Lettre du Groupe JOGOO · ${edito.titre}` : 'Lettre hebdomadaire du Groupe JOGOO',
    edito,
    actualites,
    appels: appelsOuverts,
    postesOuverts,
    rendezVous,
    podcast: podcast && { titre: podcast.titre, description: podcast.description, url: `${SITE}/podcasts` },
    minute: minutes[0] && (minutes[0].entry.date ?? '') >= ilYa(14) ? { titre: minutes[0].entry.titre, philosophe: minutes[0].entry.philosophe, definition: minutes[0].entry.definition, url: `${SITE}${MINUTE.base}/${minutes[0].slug}` } : null,
    flash: flash && { titre: flash.entry.titre, url: `${SITE}/flash` },
  };
}

/** HTML de la lettre (compatible avec les messageries : tableaux et styles en ligne). */
export function lettreHTML(l: Lettre, { desabonnement = '{{ unsubscribe }}', web = `${SITE}/lettre` } = {}) {
  const BRIQUE = '#a8361b';
  const OR = '#c8901c';
  const ENCRE = '#1a1a1a';
  const titreSection = (t: string) =>
    `<tr><td style="padding:34px 40px 10px"><p style="margin:0;font:800 11px/1.2 Montserrat,Arial,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:${BRIQUE}">${esc(t)}</p></td></tr>`;
  const bouton = (href: string, txt: string, fond = BRIQUE) =>
    `<a href="${esc(href)}" style="display:inline-block;background:${fond};color:#fff;text-decoration:none;font:700 12px/1 Montserrat,Arial,sans-serif;letter-spacing:1.2px;text-transform:uppercase;padding:13px 20px">${esc(txt)}</a>`;
  const ligne = (titre: string, href: string, meta?: string | null, texte?: string | null) =>
    `<tr><td style="padding:10px 40px"><a href="${esc(href)}" style="font:700 17px/1.35 Georgia,'Times New Roman',serif;color:${ENCRE};text-decoration:none">${esc(titre)}</a>${meta ? `<p style="margin:4px 0 0;font:600 11px/1.4 Arial,sans-serif;color:#8a8178;text-transform:uppercase;letter-spacing:1px">${esc(meta)}</p>` : ''}${texte ? `<p style="margin:6px 0 0;font:15px/1.55 Georgia,serif;color:#4a4540">${esc(texte)}</p>` : ''}</td></tr>`;

  const e = l.edito;
  const blocs: string[] = [];
  if (e) {
    blocs.push(`
<tr><td style="padding:0">${e.image ? `<a href="${esc(e.url)}"><img src="${esc(e.image)}" alt="" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0"></a>` : ''}</td></tr>
<tr><td style="padding:30px 40px 8px">
  <p style="margin:0;font:800 11px/1.2 Montserrat,Arial,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:${BRIQUE}">L’édito de la semaine${e.surtitre ? ` · ${esc(e.surtitre)}` : ''}</p>
  <h1 style="margin:12px 0 0;font:700 30px/1.15 Georgia,'Times New Roman',serif;color:${ENCRE}"><a href="${esc(e.url)}" style="color:${ENCRE};text-decoration:none">${esc(e.titre)}</a></h1>
  ${e.soustitre ? `<p style="margin:10px 0 0;font:italic 18px/1.4 Georgia,serif;color:#5a534c">${esc(e.soustitre)}</p>` : ''}
  <p style="margin:12px 0 0;font:600 12px/1.4 Arial,sans-serif;color:#8a8178;text-transform:uppercase;letter-spacing:1px">${esc(e.auteur)}${e.date ? ` · ${esc(jour(e.date))}` : ''}</p>
  <p style="margin:18px 0 0;font:16px/1.6 Georgia,serif;color:#3a3530">${esc(e.accroche)}</p>
  <p style="margin:22px 0 0">${bouton(e.url, 'Lire l’édito')} &nbsp; ${bouton(e.pdf, 'Version PDF', ENCRE)}</p>
</td></tr>`);
  }
  if (l.minute) {
    blocs.push(titreSection('Les 5 minutes du chant du coq'));
    blocs.push(ligne(`▶︎ ${l.minute.titre}`, l.minute.url, `Expliqué par ${l.minute.philosophe} · 5 minutes en vidéo`, l.minute.definition));
  }
  if (l.actualites.length) {
    blocs.push(titreSection('Cette semaine sur le portail'));
    l.actualites.forEach((a) => blocs.push(ligne(a.titre, a.url, a.date ? jour(a.date) : null, a.resume)));
  }
  if (l.appels.length || l.postesOuverts) {
    blocs.push(titreSection('Appels en cours'));
    l.appels.forEach((a) => blocs.push(ligne(a.titre, a.url, [a.type, a.limite].filter(Boolean).join(' · '))));
    if (l.postesOuverts)
      blocs.push(ligne(`${l.postesOuverts} poste${l.postesOuverts > 1 ? 's' : ''} de responsable d’axe de recherche à pourvoir`, `${SITE}/recherche/appels-a-postes`, 'Groupe JOGOO · Candidatures ouvertes'));
  }
  if (l.rendezVous.length) {
    blocs.push(titreSection('Agenda'));
    l.rendezVous.forEach((r) => blocs.push(ligne(r.titre, r.url, [r.date, r.lieu].filter(Boolean).join(' · '))));
  }
  const aEcouter: string[] = [];
  if (l.podcast) aEcouter.push(ligne(`🎧 ${l.podcast.titre}`, l.podcast.url, 'Podcast', l.podcast.description));
  if (l.flash) aEcouter.push(ligne(l.flash.titre, l.flash.url, 'Flash · Philosophie africaine'));
  if (aEcouter.length) {
    blocs.push(titreSection('À écouter, à relire'));
    blocs.push(...aEcouter);
  }
  blocs.push(`
<tr><td style="padding:34px 40px 10px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe4"><tr><td style="padding:22px 24px">
    <p style="margin:0;font:700 16px/1.4 Georgia,serif;color:${ENCRE}">Une question de philosophie africaine ?</p>
    <p style="margin:6px 0 14px;font:14px/1.5 Arial,sans-serif;color:#5a534c">JOGOO AI répond à partir des textes publiés par le Groupe, avec les sources.</p>
    ${bouton(`${SITE}/sous-sites/jogoo-ai`, 'Interroger JOGOO AI', ENCRE)}
  </td></tr></table>
</td></tr>`);

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(l.sujet)}</title></head>
<body style="margin:0;padding:0;background:#ece5d8">
<div style="display:none;max-height:0;overflow:hidden">${esc(l.edito?.accroche?.slice(0, 140) ?? 'Les nouvelles de la semaine du Groupe JOGOO')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ece5d8"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#fbf8f2">
  <tr><td style="background:${ENCRE};padding:22px 40px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><a href="${SITE}"><img src="${SITE}/medias/site/jogoo/logo-jogoo-blanc.png" alt="Groupe JOGOO" height="40" style="display:block;height:40px;border:0"></a></td>
      <td align="right" style="font:600 11px/1.4 Arial,sans-serif;color:#d9cfbf;text-transform:uppercase;letter-spacing:1.5px">Lettre n° ${l.numero}<br>${esc(l.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))}</td>
    </tr></table>
  </td></tr>
  <tr><td style="height:4px;background:${OR};font-size:0;line-height:0">&nbsp;</td></tr>
  ${blocs.join('\n')}
  <tr><td style="padding:34px 40px 30px;background:${ENCRE};color:#b9b0a3;font:12px/1.6 Arial,sans-serif">
    <p style="margin:0 0 8px;color:#fff;font-weight:700">Groupe JOGOO · Philosophie africaine. Débats &amp; questions</p>
    <p style="margin:0">Vous recevez cette lettre parce que vous vous êtes inscrit sur philoafricaine.org. <a href="${esc(web)}" style="color:${OR}">Version en ligne</a> · <a href="${desabonnement}" style="color:${OR}">Se désinscrire</a> · <a href="mailto:philoafricaine@gmail.com" style="color:${OR}">Nous écrire</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

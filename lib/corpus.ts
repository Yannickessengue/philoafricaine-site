import { reader, getEditos, getActualites, getPublications, getRevue, sousEmbargo, motsCles, sansEmail } from './content';
import { corpsBrut } from './raw';
import { adressesStatiques, pageStatique } from './gabarits';
import { bibliothequePrivee } from './bibliotheque-privee';

/* Corpus documentaire de JOGOO AI : uniquement les textes publiés par le Groupe JOGOO sur ce site
   (droits maîtrisés). Les articles de revue sous embargo n'y figurent que par leur résumé. */

export type Notice = {
  id: string;
  type: 'Note de lecture' | 'Article de revue' | 'Édito' | 'Actualité' | 'Flash' | 'Fiche auteur' | 'Page du portail' | 'Ouvrage' | 'Revue Terroirs' | 'Cours';
  titre: string;
  auteur: string;
  annee: string;
  source: string; // revue, rubrique…
  url: string;
  langue: string;
  acces: 'Texte intégral' | 'Résumé seul (embargo)' | 'Texte en ligne' | 'Notice seule (bibliothèque du Groupe)' | 'Texte intégral (bibliothèque du Groupe)';
  resume: string;
  motsCles: string[];
  texte: string; // texte interrogeable par l'assistant
};

const nettoyer = (s: string) =>
  sansEmail(s)
    .replace(/\{%[\s\S]*?%\}/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`|]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
const htmlEnTexte = (h: string) =>
  h
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<\/(p|li|h[1-6]|div|section)>/g, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
const annee = (d?: string | null) => (d ?? '').slice(0, 4);
const LANGUES: Record<string, string> = { fr: 'Français', en: 'Anglais', es: 'Espagnol', pt: 'Portugais', ar: 'Arabe' };

let cache: { quand: number; notices: Notice[] } | null = null;

export async function corpus(): Promise<Notice[]> {
  if (cache && Date.now() - cache.quand < 3600_000) return cache.notices;
  const [pubs, revue, editos, actus, flashs, auteurs] = await Promise.all([
    getPublications(),
    getRevue(),
    getEditos(),
    getActualites(),
    reader.collections.flash.all(),
    reader.collections.auteurs.all(),
  ]);
  const n: Notice[] = [];
  for (const p of pubs) {
    const e = p.entry;
    n.push({
      id: `pub-${p.slug}`,
      type: 'Note de lecture',
      titre: e.titre,
      auteur: e.auteurOuvrage ?? '',
      annee: e.annee ?? '',
      source: [e.editeur, 'Notes de lecture du Groupe JOGOO'].filter(Boolean).join(' · '),
      url: `/publications/${p.slug}`,
      langue: 'Français',
      acces: 'Texte en ligne',
      resume: e.resume ?? '',
      motsCles: motsCles(e.motsCles),
      texte: nettoyer(corpsBrut('publications', p.slug)),
    });
  }
  for (const r of revue) {
    const e = r.entry;
    const embargo = sousEmbargo(e.datePublication!, e.embargoMois);
    n.push({
      id: `revue-${r.slug}`,
      type: 'Article de revue',
      titre: e.titre,
      auteur: e.auteurs ?? '',
      annee: annee(e.datePublication),
      source: `Revue JOGOO, n° 1${e.pages ? `, ${e.pages}` : ''}`,
      url: `/sous-sites/revue-jogoo/${r.slug}`,
      langue: LANGUES[e.langue ?? 'fr'] ?? 'Français',
      acces: embargo ? 'Résumé seul (embargo)' : 'Texte intégral',
      resume: e.resume ?? '',
      motsCles: motsCles(e.motsCles),
      texte: nettoyer([e.resume, e.citation, embargo ? '' : corpsBrut('revue', r.slug)].filter(Boolean).join('\n\n')),
    });
  }
  for (const x of editos) {
    const e = x.entry;
    n.push({
      id: `edito-${x.slug}`,
      type: 'Édito',
      titre: e.titre,
      auteur: sansEmail(e.signature ?? ''),
      annee: annee(e.date),
      source: 'L’édito de la semaine',
      url: `/edito/${x.slug}`,
      langue: 'Français',
      acces: 'Texte intégral',
      resume: e.accroche ?? '',
      motsCles: motsCles(e.motsCles),
      texte: nettoyer([e.accroche, corpsBrut('editos', x.slug), e.conclusion].filter(Boolean).join('\n\n')),
    });
  }
  for (const x of actus) {
    const e = x.entry;
    n.push({
      id: `actu-${x.slug}`,
      type: 'Actualité',
      titre: e.titre,
      auteur: sansEmail(e.auteur ?? ''),
      annee: annee(e.date),
      source: 'Actualités du Groupe JOGOO',
      url: `/actualites/${x.slug}`,
      langue: 'Français',
      acces: 'Texte intégral',
      resume: e.resume ?? '',
      motsCles: [],
      texte: nettoyer(corpsBrut('actualites', x.slug)),
    });
  }
  for (const f of flashs) {
    n.push({
      id: `flash-${f.slug}`,
      type: 'Flash',
      titre: f.entry.titre,
      auteur: f.entry.auteur ?? '',
      annee: '',
      source: 'Flash d’entrée',
      url: `/flash#${f.slug}`,
      langue: 'Français',
      acces: 'Texte intégral',
      resume: f.entry.phrase ?? '',
      motsCles: [],
      texte: nettoyer(corpsBrut('flash', f.slug)),
    });
  }
  for (const a of auteurs) {
    n.push({
      id: `auteur-${a.slug}`,
      type: 'Fiche auteur',
      titre: a.entry.nom,
      auteur: a.entry.nom,
      annee: '',
      source: [a.entry.dates, a.entry.pays].filter(Boolean).join(' · '),
      url: `/publications/auteurs/${a.slug}`,
      langue: 'Français',
      acces: 'Texte intégral',
      resume: '',
      motsCles: [],
      texte: nettoyer(corpsBrut('auteurs', a.slug)),
    });
  }
  for (const adr of adressesStatiques()) {
    if (!/^\/(philosophie-africaine|le-groupe|colloque-eboussi|sous-sites\/(fonds-eboussi-boulaga|revue-jogoo))/.test(adr)) continue;
    const s = pageStatique(adr)!;
    n.push({
      id: `page-${adr}`,
      type: 'Page du portail',
      titre: s.titre,
      auteur: 'Groupe JOGOO',
      annee: '',
      source: 'philoafricaine.org',
      url: adr,
      langue: 'Français',
      acces: 'Texte intégral',
      resume: s.description,
      motsCles: [],
      texte: htmlEnTexte(s.html).slice(0, 30000),
    });
  }
  cache = { quand: Date.now(), notices: n };
  return n;
}

/* ——— Recherche par mots-clés (BM25 simplifié) sur des passages ——— */
const VIDES = new Set(
  'le la les un une des de du d l et ou en au aux a à est sont que qui quoi dont pour par sur dans avec sans ce cet cette ces se sa son ses leur leurs il elle ils elles on nous vous je tu ne pas plus comme mais si y the of and to in is what how qu quel quelle quels quelles entre chez selon ont été être fait faire'.split(
    ' ',
  ),
);
export const normaliser = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, ' ');
const mots = (s: string) => normaliser(s).split(/[^a-z0-9]+/).filter((m) => m.length > 2 && !VIDES.has(m));
const racine = (m: string) => m.replace(/(ions|ion|ites|ite|ismes|isme|istes|iste|ement|ements|ments|ment|ales|aux|ale|al|es|s|e)$/, '');

export type Passage = { notice: Notice; extrait: string; score: number };

type Entree = { notice: Notice; extrait: string; tf: Map<string, number>; long: number; tete: Set<string> };
let index: { quand: number; passages: Entree[]; df: Map<string, number>; moy: number } | null = null;

/** Index des passages (corpus du site + bibliothèque privée), construit une fois puis gardé une heure. */
async function indexer() {
  if (index && Date.now() - index.quand < 3600_000) return index;
  const notices = [...(await corpus()), ...(await bibliothequePrivee())];
  const passages: Entree[] = [];
  const ajouter = (no: Notice, extrait: string) => {
    const termes = mots(`${no.titre}. ${no.auteur}. ${no.motsCles.join(', ')} ${extrait}`).map(racine);
    const tf = new Map<string, number>();
    for (const t of termes) tf.set(t, (tf.get(t) ?? 0) + 1);
    passages.push({ notice: no, extrait, tf, long: termes.length, tete: new Set(mots(`${no.titre} ${no.auteur}`).map(racine)) });
  };
  for (const no of notices) {
    const blocs = no.texte.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 60);
    // passages d'environ 900 caractères
    let courant = '';
    for (const b of blocs.length ? blocs : [no.resume || no.titre]) {
      if ((courant + b).length > 900 && courant) {
        ajouter(no, courant.trim());
        courant = '';
      }
      courant += b + '\n\n';
    }
    if (courant.trim()) ajouter(no, courant.trim());
  }
  const df = new Map<string, number>();
  for (const p of passages) for (const t of p.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const moy = passages.reduce((s, p) => s + p.long, 0) / Math.max(1, passages.length);
  index = { quand: Date.now(), passages, df, moy };
  return index;
}

export async function rechercher(question: string, max = 6): Promise<Passage[]> {
  const q = [...new Set(mots(question).map(racine))].filter(Boolean);
  if (!q.length) return [];
  const { passages, df, moy } = await indexer();
  const N = passages.length;
  const scores: Passage[] = [];
  for (const p of passages) {
    let s = 0;
    for (const t of q) {
      const tf = p.tf.get(t);
      if (!tf) continue;
      const d = df.get(t) ?? 0;
      const idf = Math.log(1 + (N - d + 0.5) / (d + 0.5));
      s += idf * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (p.long / moy))));
    }
    if (!s) continue;
    // bonus si le terme est dans le titre ou l'auteur
    s += q.filter((t) => p.tete.has(t)).length * 1.5;
    if (s > 1) scores.push({ notice: p.notice, extrait: p.extrait, score: s });
  }
  scores.sort((a, b) => b.score - a.score);
  // au plus deux passages par document
  const parDoc = new Map<string, number>();
  const res: Passage[] = [];
  for (const s of scores) {
    const k = parDoc.get(s.notice.id) ?? 0;
    if (k >= 2) continue;
    parDoc.set(s.notice.id, k + 1);
    res.push(s);
    if (res.length >= max) break;
  }
  return res;
}

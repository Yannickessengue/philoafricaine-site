import { reader, getEditos, getActualites, getPublications, getRevue, sousEmbargo, motsCles, sansEmail } from './content';
import { corpsBrut } from './raw';
import { adressesStatiques, pageStatique } from './gabarits';
import { bibliothequeChercheurs, bibliothequePrivee } from './bibliotheque-privee';

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
  for (const x of await reader.collections.chronologie.all()) {
    const e = x.entry;
    n.push({
      id: `histoire-${x.slug}`,
      type: 'Actualité',
      titre: e.titre,
      auteur: 'Groupe JOGOO',
      annee: annee(e.date),
      source: 'Notre histoire (chronologie des activités du Groupe JOGOO)',
      url: `/notre-histoire#${x.slug}`,
      langue: 'Français',
      acces: 'Texte intégral',
      resume: e.presentation ?? '',
      motsCles: ['histoire du Groupe JOGOO', e.categorie],
      texte: nettoyer([`${e.titre}. ${e.dateAffichee ?? ''}, ${e.lieu ?? ''} (${e.format ?? ''}).`, e.presentation, e.intervenants].filter(Boolean).join('\n\n')),
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
type Index = { quand: number; passages: Entree[]; df: Map<string, number>; moy: number };
const index = new Map<boolean, Index>();

/** Index des passages (corpus du site + bibliothèque privée), construit une fois puis gardé une heure. */
async function indexer(chercheurs: boolean) {
  const deja = index.get(chercheurs);
  if (deja && Date.now() - deja.quand < 3600_000) return deja;
  const prives = await bibliothequePrivee();
  let notices = [...(await corpus()), ...prives];
  if (chercheurs) {
    // dans l'espace chercheurs, le texte intégral (cherché à part, voir chercherIntegral) remplace la notice
    const ids = new Set((await integraux()).map((c) => c.notice.id));
    notices = notices.filter((n) => !ids.has(n.id));
  }
  const passages: Entree[] = [];
  for (const no of notices) for (const extrait of decouper(no)) passages.push(entree(no, extrait));
  const df = new Map<string, number>();
  for (const p of passages) for (const t of p.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const moy = passages.reduce((s, p) => s + p.long, 0) / Math.max(1, passages.length);
  const ix = { quand: Date.now(), passages, df, moy };
  index.set(chercheurs, ix);
  return ix;
}

function entree(no: Notice, extrait: string): Entree {
  const termes = mots(`${no.titre}. ${no.auteur}. ${no.motsCles.join(', ')} ${extrait}`).map(racine);
  const tf = new Map<string, number>();
  for (const t of termes) tf.set(t, (tf.get(t) ?? 0) + 1);
  return { notice: no, extrait, tf, long: termes.length, tete: new Set(mots(`${no.titre} ${no.auteur}`).map(racine)) };
}

/** Passages d'environ 900 caractères. */
function decouper(no: Notice): string[] {
  const blocs = no.texte.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 60);
  const out: string[] = [];
  let courant = '';
  for (const b of blocs.length ? blocs : [no.resume || no.titre]) {
    if ((courant + b).length > 900 && courant) {
      out.push(courant.trim());
      courant = '';
    }
    courant += b + '\n\n';
  }
  if (courant.trim()) out.push(courant.trim());
  return out;
}

/* ——— Espace chercheurs : plusieurs centaines de livres en texte intégral ———
   Indexer chaque passage de tous les livres coûterait trop de mémoire : on cherche d'abord
   les livres les plus pertinents (comptage des termes dans le texte normalisé), puis on ne découpe
   en passages que ces livres-là. */
type Integral = { notice: Notice; norm: string; long: number; passages?: Entree[] };
let integrauxCache: Integral[] | null = null;
async function integraux(): Promise<Integral[]> {
  if (integrauxCache) return integrauxCache;
  const complets = await bibliothequeChercheurs();
  integrauxCache = complets.map((notice) => ({ notice, norm: normaliser(notice.texte), long: notice.texte.length }));
  return integrauxCache;
}

async function chercherIntegral(q: string[], df: Map<string, number>, N: number, moy: number): Promise<Passage[]> {
  const docs = await integraux();
  if (!docs.length) return [];
  const longMoy = docs.reduce((s, d) => s + d.long, 0) / docs.length;
  const termes = q.filter((t) => t.length >= 3);
  // fréquence documentaire des termes parmi les livres
  const comptes = docs.map((d) => termes.map((t) => compter(d.norm, t)));
  const dfDoc = termes.map((_, i) => comptes.filter((c) => c[i] > 0).length);
  const classes = docs
    .map((d, j) => {
      let s = 0;
      termes.forEach((t, i) => {
        const tf = comptes[j][i];
        if (!tf) return;
        const idf = Math.log(1 + (docs.length - dfDoc[i] + 0.5) / (dfDoc[i] + 0.5));
        s += idf * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.long / longMoy))));
      });
      s += termes.filter((t) => normaliser(`${d.notice.titre} ${d.notice.auteur}`).includes(t)).length * 1.5;
      return { d, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 6);
  const res: Passage[] = [];
  for (const { d } of classes) {
    d.passages ??= decouper(d.notice).map((e) => entree(d.notice, e));
    const meilleurs = d.passages
      .map((p) => ({ notice: p.notice, extrait: p.extrait, score: bm25(p, q, df, N, moy) }))
      .filter((p) => p.score > 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    res.push(...meilleurs);
  }
  return res;
}

function compter(texte: string, t: string) {
  let n = 0;
  for (let i = texte.indexOf(t); i !== -1 && n < 5000; i = texte.indexOf(t, i + t.length)) n++;
  return n;
}

function bm25(p: Entree, q: string[], df: Map<string, number>, N: number, moy: number) {
  let s = 0;
  for (const t of q) {
    const tf = p.tf.get(t);
    if (!tf) continue;
    const d = df.get(t) ?? 0;
    const idf = Math.log(1 + (N - d + 0.5) / (d + 0.5));
    s += idf * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (p.long / moy))));
  }
  if (s) s += q.filter((t) => p.tete.has(t)).length * 1.5;
  return s;
}

export async function rechercher(question: string, max = 6, chercheurs = false): Promise<Passage[]> {
  const q = [...new Set(mots(question).map(racine))].filter(Boolean);
  if (!q.length) return [];
  const { passages, df, moy } = await indexer(chercheurs);
  const N = passages.length;
  const scores: Passage[] = [];
  for (const p of passages) {
    const s = bm25(p, q, df, N, moy);
    if (s > 1) scores.push({ notice: p.notice, extrait: p.extrait, score: s });
  }
  if (chercheurs) scores.push(...(await chercherIntegral(q, df, N, moy)));
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

/* ——— Vocabulaire de Lalande (espace chercheurs) ———
   Pour une question de définition, on va chercher directement l'article du Vocabulaire technique et critique
   de la philosophie consacré au terme, repéré par son mot-vedette en capitales. */
export async function definitionLalande(terme: string): Promise<Passage | null> {
  if (!terme || terme.length < 3) return null;
  const docs = await integraux();
  const lal = docs.find((d) => /vocabulaire technique et critique/i.test(d.notice.titre));
  if (!lal) return null;
  const texte = lal.notice.texte;
  const sansAccent = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const vedette = terme.toLocaleUpperCase('fr');
  const motifs = [vedette, sansAccent(vedette)].map((v) => new RegExp(`(^|\\n)\\s*${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'));
  for (const m of motifs) {
    const r = m.exec(texte);
    if (r) {
      const debut = r.index + (r[1] ? 1 : 0);
      const extrait = texte.slice(debut, debut + 2200).trim();
      return { notice: lal.notice, extrait, score: 100 };
    }
  }
  return null;
}

/** Terme à définir dans une question (« qu'est-ce que l'altérité ? » → « altérité »). */
export function termeDefini(question: string): string {
  const q = question.trim().replace(/[?!.…]+$/, '');
  const m =
    q.match(/(?:qu['’]\s*est[- ]ce\s+qu(?:e|['’])|que\s+(?:signifie|veut\s+dire)|d[ée]finition\s+(?:de\s+(?:la\s+|l['’]\s*)?|du\s+|des\s+|d['’]\s*)|d[ée]finir|notion\s+(?:de\s+(?:la\s+|l['’]\s*)?|du\s+|d['’]\s*)|concept\s+(?:de\s+(?:la\s+|l['’]\s*)?|du\s+|d['’]\s*))\s*(?:(?:le|la|les|l['’]|un|une|du|des)\s*)?(.+)$/i);
  const reste = (m ? m[1] : q).trim();
  const mots = reste.split(/\s+/).filter((w) => !/^(le|la|les|l['’].*|un|une|du|des|de|en|selon|chez|dans|pour)$/i.test(w));
  return (mots[0] || '').replace(/^l['’]/i, '').replace(/[,;:]$/, '');
}


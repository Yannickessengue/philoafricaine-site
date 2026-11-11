import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { JOGOO_AI as S } from '@/lib/sous-sites';
import { Bandeau, Pied } from '@/components/SousSite';
import { Assistant } from '@/components/Assistant';
import { Bibliotheque } from '@/components/Bibliotheque';
import { Constellation, CoqCyborg } from '@/components/EspaceAI';
import { corpus, rechercher } from '@/lib/corpus';

const B = S.base;
const PAGES = ['', 'interroger', 'bibliotheque', 'philosophes', 'concepts', 'ressources', 'a-propos'] as const;
const TITRES: Record<string, string> = {
  '': 'JOGOO AI — Assistant de recherche en philosophie africaine',
  interroger: 'Interroger JOGOO AI',
  bibliotheque: 'Bibliothèque',
  philosophes: 'Philosophes',
  concepts: 'Concepts',
  ressources: 'Ressources et outils',
  'a-propos': 'À propos et méthode',
};

export const revalidate = 3600;

export function generateStaticParams() {
  return PAGES.map((p) => ({ page: p ? [p] : [] }));
}

export async function generateMetadata({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  return TITRES[p]
    ? {
        title: p ? `${TITRES[p]} · JOGOO AI` : TITRES[''],
        description: 'Explorez la philosophie africaine avec JOGOO AI : interroger des textes, découvrir des auteurs, clarifier des concepts, avec des sources vérifiables.',
      }
    : {};
}

const PHILOSOPHES: { nom: string; dates?: string; fiche?: string }[] = [
  { nom: 'Fabien Eboussi Boulaga', dates: '1934 – 2018', fiche: '/sous-sites/fonds-eboussi-boulaga/fabien-eboussi-boulaga' },
  { nom: 'Paulin Hountondji' },
  { nom: 'V. Y. Mudimbe' },
  { nom: 'Kwasi Wiredu' },
  { nom: 'Alexis Kagame' },
  { nom: 'Souleymane Bachir Diagne', fiche: '/publications/auteurs/souleymane-bachir-diagne' },
  { nom: 'Marcien Towa', fiche: '/publications/auteurs/marcien-towa' },
  { nom: 'Henry Odera Oruka' },
];
const CONCEPTS = ['Ethnophilosophie', 'Muntu', 'Ubuntu', 'Reprise de soi', 'Décolonisation', 'Traduction', 'Interculturalité', 'Rationalité'];
const GUIDES: { titre: string; etapes: string[] }[] = [
  { titre: 'Formuler une question', etapes: ['Partir d’une controverse précise.', 'Délimiter auteur, corpus, période.', 'En faire une question à laquelle des textes répondent.'] },
  { titre: 'Bâtir une bibliographie', etapes: ['Textes primaires d’abord.', 'Vérifier chaque notice.', 'Noter où chaque document se consulte.'] },
  { titre: 'Fiche de lecture', etapes: ['Situer l’œuvre.', 'Restituer thèse et arguments, avec les pages.', 'Séparer résumé, citation et commentaire.'] },
  { titre: 'Comparer des arguments', etapes: ['Énoncer chaque position.', 'Repérer présupposés et concepts.', 'Situer accords et désaccords.'] },
  { titre: 'Citer correctement', etapes: ['Ne citer que le vérifié.', 'Indiquer édition et page.', 'Remonter toujours au document.'] },
];
const MENU: [string, string, string][] = [
  ['bibliotheque', 'Bibliothèque', 'M4 19V5M8 19V5M12 19l4-14 4 14'],
  ['philosophes', 'Philosophes', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0'],
  ['concepts', 'Concepts', 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3'],
  ['ressources', 'Ressources', 'M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h6'],
  ['a-propos', 'Méthode', 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z'],
];

const verre = 'bg-white/[0.045] backdrop-blur-sm transition-all duration-300';

export default async function JogooAI({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  if (!(PAGES as readonly string[]).includes(p)) notFound();
  return (
    <div className="jogoo-ai-doux bg-[#070d16] text-[#e9e2d0]">
      <Bandeau site={S} actif={p === 'interroger' ? '' : p} />
      {(p === '' || p === 'interroger') && <Espace />}
      {p === 'bibliotheque' && <PageBibliotheque />}
      {p === 'philosophes' && <Philosophes />}
      {p === 'concepts' && <Concepts />}
      {p === 'ressources' && <Ressources />}
      {p === 'a-propos' && <APropos />}
      <Pied site={S} />
    </div>
  );
}

/** Fond commun : motif géométrique, constellation animée, lignes de balayage. */
function Fond({ children, plein = false }: { children: ReactNode; plein?: boolean }) {
  return (
    <section className={`ai-lignes relative isolate overflow-hidden ${plein ? 'min-h-[calc(100dvh-9rem)]' : ''}`}>
      <div className="ai-motif absolute inset-0 -z-10" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_20%,rgba(106,13,13,0.35),transparent_60%),radial-gradient(ellipse_at_80%_90%,rgba(217,154,14,0.12),transparent_55%)]" aria-hidden="true" />
      <Constellation className="-z-10" />
      {children}
    </section>
  );
}

function Titre({ sur, titre }: { sur: string; titre: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-14 sm:pt-16">
      <p className="font-brand text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#d99a0e]">{sur}</p>
      <h1 className="mt-3 font-brand text-3xl font-light tracking-tight text-[#f9f5ec] sm:text-4xl">{titre}</h1>
    </div>
  );
}

async function Espace() {
  const notices = await corpus();
  return (
    <Fond plein>
      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-10 sm:pt-12">
        <CoqCyborg taille={260} />
        <h1 className="mt-6 text-center font-brand text-3xl font-light tracking-tight text-[#f9f5ec] sm:text-4xl">
          JOGOO <span className="bg-gradient-to-r from-[#ffc94a] to-[#d99a0e] bg-clip-text text-transparent">AI</span>
        </h1>
        <p className="mt-2 text-center font-brand text-xs font-semibold uppercase tracking-[0.24em] text-[#e9e2d0]/60">Explorer · Comprendre · Analyser · Citer</p>

        <div className="mt-8 w-full">
          <Assistant email={S.email} variante="sombre" />
        </div>

        <nav aria-label="Explorer JOGOO AI" className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
          {MENU.map(([slug, nom, d]) => (
            <a key={slug} href={`${B}/${slug}`} className={`group flex flex-col items-center gap-2.5 px-3 py-5 text-center ${verre} hover:bg-white/[0.09] hover:shadow-[0_0_40px_-10px_rgba(255,201,74,0.45)]`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d99a0e]/15 text-[#ffc94a] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#d99a0e] group-hover:text-[#070d16]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={d} />
                </svg>
              </span>
              <span className="font-brand text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#f9f5ec]">{nom}</span>
            </a>
          ))}
        </nav>
        <p className="mt-8 font-brand text-[0.66rem] uppercase tracking-[0.28em] text-[#e9e2d0]/40">{notices.length} documents · sources vérifiables · Groupe JOGOO</p>
      </div>
    </Fond>
  );
}

async function PageBibliotheque() {
  const notices = await corpus();
  const fiches = notices
    .filter((n) => n.type !== 'Page du portail')
    .map(({ texte: _t, ...f }) => f)
    .sort((a, b) => a.type.localeCompare(b.type, 'fr') || a.titre.localeCompare(b.titre, 'fr'));
  return (
    <Fond>
      <Titre sur="Bibliothèque" titre="Le corpus" />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <Bibliotheque fiches={fiches} />
      </div>
    </Fond>
  );
}

async function Philosophes() {
  const sources = await Promise.all(PHILOSOPHES.map((p) => rechercher(p.nom, 8).then((r) => r.length)));
  return (
    <Fond>
      <Titre sur="Philosophes" titre="Des voix à explorer" />
      <div className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {PHILOSOPHES.map((p, i) => (
          <div key={p.nom} className={`group flex flex-col p-6 ${verre} hover:bg-white/[0.08] hover:shadow-[0_0_40px_-12px_rgba(255,201,74,0.4)]`}>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6a0d0d] to-[#b02424] font-brand text-lg font-black text-[#f9f5ec] shadow-[0_0_24px_rgba(176,36,36,0.5)]">
              {p.nom
                .split(' ')
                .filter((m) => /^[A-Z]/.test(m))
                .slice(-2)
                .map((m) => m[0])
                .join('')}
            </span>
            <p className="mt-4 font-brand text-lg font-bold leading-snug text-[#f9f5ec]">{p.nom}</p>
            <p className="mt-1 text-xs text-[#e9e2d0]/50">
              {p.dates ? `${p.dates} · ` : ''}
              {sources[i]} doc.
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <a href={`${B}/interroger?q=${encodeURIComponent(`Que dit le corpus sur ${p.nom} ?`)}`} className="bg-[#d99a0e] px-3 py-1.5 font-brand text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#070d16] hover:bg-[#ffc94a]">
                Interroger
              </a>
              {p.fiche && (
                <a href={p.fiche} className="bg-white/10 px-3 py-1.5 font-brand text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#f9f5ec] hover:bg-white/20">
                  Fiche
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Fond>
  );
}

async function Concepts() {
  const sources = await Promise.all(CONCEPTS.map((c) => rechercher(c, 8).then((r) => r.length)));
  return (
    <Fond>
      <Titre sur="Concepts" titre="Un dictionnaire vivant" />
      <div className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {CONCEPTS.map((c, i) => (
          <a
            key={c}
            href={`${B}/interroger?q=${encodeURIComponent(`Quels sont les usages et les débats autour de la notion de « ${c.toLowerCase()} » ?`)}`}
            className={`group relative flex min-h-[9rem] flex-col justify-between overflow-hidden p-6 ${verre} hover:bg-white/[0.08] hover:shadow-[0_0_40px_-12px_rgba(255,201,74,0.45)]`}
          >
            <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#d99a0e]/10 blur-xl transition-all duration-500 group-hover:bg-[#d99a0e]/30" aria-hidden="true" />
            <span className="font-brand text-2xl font-black tracking-tight text-[#f9f5ec] group-hover:text-[#ffc94a]">{c}</span>
            <span className="flex items-center justify-between font-brand text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#e9e2d0]/50">
              {sources[i]} doc. <span className="text-[#ffc94a] opacity-0 transition-opacity group-hover:opacity-100">Explorer →</span>
            </span>
          </a>
        ))}
      </div>
    </Fond>
  );
}

function Ressources() {
  return (
    <Fond>
      <Titre sur="Ressources" titre="Chercher, lire, citer" />
      <div className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 pt-8 md:grid-cols-2 lg:grid-cols-5">
        {GUIDES.map((g, i) => (
          <div key={g.titre} className={`p-6 ${verre}`}>
            <p className="font-brand text-3xl font-black text-[#d99a0e]/80">{String(i + 1).padStart(2, '0')}</p>
            <p className="mt-2 font-brand text-base font-bold leading-snug text-[#f9f5ec]">{g.titre}</p>
            <ol className="mt-4 space-y-2">
              {g.etapes.map((e, j) => (
                <li key={j} className="flex gap-2.5 text-[0.88rem] leading-snug text-[#e9e2d0]/80">
                  <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffc94a]" aria-hidden="true" />
                  {e}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Fond>
  );
}

function APropos() {
  const points: [string, string][] = [
    ['Sources d’abord', 'L’assistant cherche les passages pertinents, puis répond à partir de ces seuls documents, numérotés et cliquables.'],
    ['Limites assumées', 'Sans source pertinente, il le dit. Une réponse générée n’est jamais une citation vérifiée.'],
    ['Droits respectés', 'Le corpus réunit les textes publiés par le Groupe JOGOO ; les articles sous embargo n’y figurent que par leur résumé.'],
    ['Évaluation continue', 'Corpus, fonctions et résultats sont relus par l’équipe scientifique. Signalez toute erreur.'],
  ];
  return (
    <Fond>
      <Titre sur="Méthode" titre="Une IA au service de la pensée" />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {points.map(([t, d]) => (
            <div key={t} className={`p-6 ${verre}`}>
              <p className="font-brand text-base font-bold text-[#ffc94a]">{t}</p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-[#e9e2d0]/80">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`${B}/interroger`} className="bg-[#d99a0e] px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-[#070d16] hover:bg-[#ffc94a]">
            Interroger JOGOO AI →
          </a>
          <a href={`mailto:${S.email}?subject=${encodeURIComponent('JOGOO AI — signalement')}`} className="bg-white/10 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-[#f9f5ec] hover:bg-white/20">
            Signaler une erreur
          </a>
        </div>
      </div>
    </Fond>
  );
}

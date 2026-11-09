import { notFound } from 'next/navigation';
import { JOGOO_AI as S } from '@/lib/sous-sites';
import { Bandeau, Pied, Ouverture, Section, Texte, Boutons } from '@/components/SousSite';
import { Assistant } from '@/components/Assistant';
import { Bibliotheque } from '@/components/Bibliotheque';
import { corpus, rechercher } from '@/lib/corpus';

const B = S.base;
const PAGES = ['', 'interroger', 'bibliotheque', 'philosophes', 'concepts', 'ressources', 'a-propos'] as const;
const TITRES: Record<string, string> = {
  '': 'JOGOO AI — Assistant de recherche en philosophies africaines',
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
        description: 'Explorez les philosophies africaines avec JOGOO AI : interroger des textes, découvrir des auteurs, clarifier des concepts, avec des sources vérifiables.',
      }
    : {};
}

const PHILOSOPHES: { nom: string; dates?: string; fiche?: string; requete: string }[] = [
  { nom: 'Fabien Eboussi Boulaga', dates: '1934 – 2018', fiche: '/sous-sites/fonds-eboussi-boulaga/fabien-eboussi-boulaga', requete: 'Fabien Eboussi Boulaga' },
  { nom: 'Paulin Hountondji', requete: 'Paulin Hountondji ethnophilosophie' },
  { nom: 'V. Y. Mudimbe', requete: 'Mudimbe invention de l’Afrique' },
  { nom: 'Kwasi Wiredu', requete: 'Kwasi Wiredu décolonisation conceptuelle' },
  { nom: 'Alexis Kagame', requete: 'Alexis Kagame philosophie bantu-rwandaise de l’être' },
  { nom: 'Souleymane Bachir Diagne', fiche: '/publications/auteurs/souleymane-bachir-diagne', requete: 'Souleymane Bachir Diagne' },
  { nom: 'Marcien Towa', fiche: '/publications/auteurs/marcien-towa', requete: 'Marcien Towa' },
  { nom: 'Henry Odera Oruka', requete: 'Odera Oruka philosophie de la sagesse' },
];

const CONCEPTS = ['Ethnophilosophie', 'Muntu', 'Ubuntu', 'Reprise de soi', 'Décolonisation', 'Traduction', 'Interculturalité', 'Rationalité'];

const GUIDES: { titre: string; etapes: string[] }[] = [
  {
    titre: 'Formuler une question de recherche',
    etapes: ['Partir d’un étonnement ou d’une controverse précise.', 'Délimiter un auteur, un corpus, une période.', 'Transformer le thème en question à laquelle on peut répondre par des textes.'],
  },
  {
    titre: 'Construire une bibliographie',
    etapes: ['Commencer par les textes primaires, puis les études de référence.', 'Vérifier chaque notice : auteur, titre, éditeur, année, pages.', 'Garder la trace du lieu de consultation de chaque document.'],
  },
  {
    titre: 'Préparer une fiche de lecture',
    etapes: ['Situer l’œuvre : auteur, contexte, enjeux.', 'Restituer la thèse et les arguments principaux, avec les pages.', 'Distinguer clairement résumé, citation et commentaire personnel.'],
  },
  {
    titre: 'Comparer des arguments',
    etapes: ['Énoncer chaque position dans ses propres termes.', 'Repérer les présupposés et les concepts en jeu.', 'Identifier les points d’accord, de désaccord et les malentendus.'],
  },
  {
    titre: 'Citer correctement',
    etapes: ['Ne citer que ce qui a été vérifié dans le texte original.', 'Indiquer l’édition et la page de chaque citation.', 'Une réponse d’assistant n’est jamais une source : remonter au document.'],
  },
];

const carte = 'bg-white p-6 shadow-[0_1px_2px_rgba(13,27,42,0.05),0_16px_36px_-24px_rgba(13,27,42,0.35)]';

export default async function JogooAI({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  if (!(PAGES as readonly string[]).includes(p)) notFound();
  return (
    <>
      <Bandeau site={S} actif={p} />
      {p === '' && <Accueil />}
      {p === 'interroger' && <Interroger />}
      {p === 'bibliotheque' && <PageBibliotheque />}
      {p === 'philosophes' && <Philosophes />}
      {p === 'concepts' && <Concepts />}
      {p === 'ressources' && <Ressources />}
      {p === 'a-propos' && <APropos />}
      <Pied site={S} />
    </>
  );
}

function Recherche({ grand = false }: { grand?: boolean }) {
  return (
    <form action={`${B}/interroger`} method="get" className={`flex flex-col gap-3 sm:flex-row ${grand ? 'mt-8' : ''}`}>
      <input
        name="q"
        required
        minLength={3}
        placeholder="Quelle question souhaitez-vous explorer en philosophie africaine ?"
        aria-label="Votre question"
        className="h-14 min-w-0 flex-1 bg-white px-5 text-[1rem] text-[#0d1b2a] shadow-[0_1px_2px_rgba(13,27,42,0.08),0_18px_40px_-24px_rgba(13,27,42,0.45)] outline-none placeholder:text-[#333]/45 focus:ring-2 focus:ring-[#d99a0e]/60"
      />
      <button type="submit" className="h-14 shrink-0 bg-[#6a0d0d] px-6 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#0d1b2a]">
        Interroger JOGOO AI
      </button>
    </form>
  );
}

async function Accueil() {
  const notices = await corpus();
  const compte = (t: string) => notices.filter((n) => n.type === t).length;
  return (
    <>
      <section className="relative overflow-hidden bg-[#f9f5ec]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(217,154,14,0.25), transparent 45%), radial-gradient(circle at 10% 90%, rgba(106,13,13,0.12), transparent 40%)' }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="kicker text-[#b07a06]">Assistant de recherche en philosophies africaines</p>
            <h1 className="mt-3 font-serif text-[2.2rem] font-bold leading-[1.05] text-[#0d1b2a] sm:text-[3.3rem]">Explorez les philosophies africaines avec JOGOO AI</h1>
            <p className="mt-6 max-w-2xl text-[1.06rem] leading-relaxed text-[#333]">
              Interrogez des textes, découvrez des auteurs, clarifiez des concepts et construisez vos pistes de recherche grâce à un assistant documentaire qui privilégie les sources vérifiables et la rigueur scientifique.
            </p>
            <Recherche grand />
            <div className="mt-4">
              <a href={`${B}/bibliotheque`} className="font-brand text-xs font-bold uppercase tracking-[0.12em] text-[#6a0d0d] hover:underline">
                Explorer la bibliothèque →
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <img src="/medias/site/jogoo/logo-jogoo-ai.png" alt="JOGOO AI" className="w-full max-w-sm drop-shadow-[0_24px_40px_rgba(106,13,13,0.18)]" />
          </div>
        </div>
      </section>

      <section className="bg-[#0d1b2a] text-[#f9f5ec]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:grid-cols-4">
          {[
            [notices.length, 'documents dans le corpus'],
            [compte('Article de revue'), 'articles de la Revue JOGOO'],
            [compte('Note de lecture') + compte('Fiche auteur'), 'notes de lecture et fiches'],
            [compte('Édito') + compte('Actualité') + compte('Flash'), 'éditos, actualités et flashs'],
          ].map(([n, l]) => (
            <div key={String(l)}>
              <p className="font-serif text-4xl font-bold text-[#d99a0e]">{n}</p>
              <p className="mt-1 text-sm text-[#f9f5ec]/70">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <Section site={S} kicker="Présentation" titre="Un espace de dialogue critique">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Texte>
            <p>
              JOGOO AI est un projet numérique du Groupe JOGOO – Philosophie africaine. Débats &amp; Questions. Il vise à soutenir la recherche, l’enseignement et la transmission des philosophies africaines grâce à des outils d’intelligence artificielle associés à un corpus documentaire sélectionné et progressivement enrichi.
            </p>
            <p>
              Conçu comme un espace de dialogue critique, il aide à retrouver des références, à éclairer des notions et à confronter des perspectives, sans se substituer à la lecture des œuvres ni au jugement du chercheur.
            </p>
          </Texte>
          <div className={`${carte} bg-[#f9f5ec]`}>
            <p className="kicker text-[#b07a06]">Notre ambition</p>
            <p className="mt-3 font-serif text-[1.1rem] leading-relaxed text-[#0d1b2a]">
              Faire circuler les savoirs philosophiques produits sur le continent africain et dans ses diasporas, renforcer leur visibilité et faciliter leur appropriation critique.
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-[#333]">
              JOGOO AI entend contribuer à une infrastructure documentaire ouverte, plurilingue et attentive à la diversité des traditions, des langues, des écoles et des controverses.
            </p>
          </div>
        </div>
      </Section>

      <Section site={S} doux kicker="Explorer" titre="Quatre portes d’entrée">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['bibliotheque', 'Bibliothèque', 'Ouvrages, articles, notes de lecture et archives, avec filtres et statut d’accès.'],
            ['philosophes', 'Philosophes', 'Trajectoires, œuvres et contributions des philosophes africains.'],
            ['concepts', 'Concepts', 'Un dictionnaire évolutif des notions qui traversent les philosophies africaines.'],
            ['ressources', 'Ressources', 'Guides pour chercher, lire, comparer et citer.'],
          ].map(([slug, t, d]) => (
            <a key={slug} href={`${B}/${slug}`} className={`group ${carte} transition-all duration-300 hover:-translate-y-1`}>
              <p className="font-serif text-xl font-bold text-[#0d1b2a] group-hover:text-[#6a0d0d]">{t}</p>
              <p className="mt-2 text-[0.93rem] leading-relaxed text-[#333]/85">{d}</p>
              <p className="mt-4 font-brand text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#b07a06]">Ouvrir →</p>
            </a>
          ))}
        </div>
      </Section>

      <Section site={S} kicker="Publics" titre="Pour qui ?">
        <div className="flex flex-wrap gap-2">
          {['Étudiants', 'Enseignants', 'Doctorants', 'Chercheurs', 'Bibliothécaires', 'Traducteurs', 'Institutions de recherche', 'Lecteurs curieux'].map((x) => (
            <span key={x} className="bg-[#f9f5ec] px-4 py-2 font-brand text-sm font-semibold text-[#0d1b2a]">
              {x}
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}

function Interroger() {
  return (
    <>
      <Ouverture
        site={S}
        kicker="Interroger JOGOO AI"
        titre="Posez votre question"
        chapeau="Sur un auteur, une œuvre, une tradition ou une controverse philosophique. L’assistant recherche les passages pertinents du corpus et propose une réponse structurée avec des références consultables."
      />
      <div className="bg-[#f9f5ec]">
        <div className="mx-auto max-w-4xl px-4 pb-14 sm:px-6">
          <Assistant email={S.email} />
          <p className="mt-6 text-sm leading-relaxed text-[#333]/75">
            Vous pouvez prolonger la discussion, demander une comparaison ou solliciter des pistes bibliographiques. Le corpus est constitué des textes publiés par le Groupe JOGOO ; les articles sous embargo n’y figurent que par leur résumé.
          </p>
        </div>
      </div>
    </>
  );
}

async function PageBibliotheque() {
  const notices = await corpus();
  const fiches = notices
    .filter((n) => n.type !== 'Page du portail')
    .map(({ texte: _t, ...f }) => f)
    .sort((a, b) => a.type.localeCompare(b.type, 'fr') || a.titre.localeCompare(b.titre, 'fr'));
  return (
    <>
      <Ouverture
        site={S}
        kicker="Bibliothèque"
        titre="La Bibliothèque JOGOO"
        chapeau="Notices d’ouvrages, articles, notes de lecture, archives et ressources utiles à l’étude des philosophies africaines."
      />
      <Section site={S}>
        <Texte className="mb-8">
          <p>
            Les documents disponibles en accès autorisé peuvent être interrogés par l’assistant ; les autres sont présentés sous forme de références bibliographiques et de liens vers leurs lieux de consultation.
          </p>
        </Texte>
        <Bibliotheque fiches={fiches} />
      </Section>
    </>
  );
}

async function Philosophes() {
  const sources = await Promise.all(PHILOSOPHES.map((p) => rechercher(p.requete, 8).then((r) => r.length)));
  return (
    <>
      <Ouverture
        site={S}
        kicker="Philosophes"
        titre="Les philosophes"
        chapeau="Trajectoires, œuvres et contributions des philosophes africains et des penseurs qui participent aux débats sur l’Afrique."
      />
      <Section site={S}>
        <Texte className="mb-8">
          <p>
            Chaque fiche rassemblera une biographie sourcée, les principaux écrits, les notions associées, les controverses et des ressources pour approfondir la lecture. Fiches pilotes, après validation scientifique :
          </p>
        </Texte>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PHILOSOPHES.map((p, i) => (
            <div key={p.nom} className={`${carte} flex flex-col`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6a0d0d] font-serif text-lg font-bold text-[#f9f5ec]">
                {p.nom
                  .split(' ')
                  .filter((m) => /^[A-Z]/.test(m))
                  .slice(-2)
                  .map((m) => m[0])
                  .join('')}
              </span>
              <p className="mt-4 font-serif text-lg font-bold leading-snug text-[#0d1b2a]">{p.nom}</p>
              {p.dates && <p className="text-sm text-[#333]/60">{p.dates}</p>}
              <p className="mt-2 font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#333]/45">
                {p.fiche ? 'Fiche disponible' : 'Fiche en préparation'} · {sources[i]} document{sources[i] > 1 ? 's' : ''} dans le corpus
              </p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm font-semibold">
                {p.fiche && (
                  <a href={p.fiche} className="text-[#6a0d0d] hover:underline">
                    Lire la fiche →
                  </a>
                )}
                <a href={`${B}/interroger?q=${encodeURIComponent(`Que dit le corpus sur ${p.nom} ?`)}`} className="text-[#b07a06] hover:underline">
                  Interroger →
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

async function Concepts() {
  const sources = await Promise.all(CONCEPTS.map((c) => rechercher(c, 8).then((r) => r.length)));
  return (
    <>
      <Ouverture
        site={S}
        kicker="Concepts"
        titre="Un dictionnaire évolutif"
        chapeau="Pour comprendre les notions qui traversent les philosophies africaines. Chaque notice distingue les usages des termes, leurs contextes, leurs débats et leurs références."
      />
      <Section site={S}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONCEPTS.map((c, i) => (
            <a key={c} href={`${B}/interroger?q=${encodeURIComponent(`Quels sont les usages et les débats autour de la notion de « ${c.toLowerCase()} » ?`)}`} className={`group ${carte} flex flex-col transition-all duration-300 hover:-translate-y-1`}>
              <p className="font-serif text-2xl font-bold text-[#0d1b2a] group-hover:text-[#6a0d0d]">{c}</p>
              <p className="mt-2 font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#333]/45">
                Notice en préparation · {sources[i]} document{sources[i] > 1 ? 's' : ''}
              </p>
              <p className="mt-auto pt-4 font-brand text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#b07a06]">Explorer avec JOGOO AI →</p>
            </a>
          ))}
          <div className={`${carte} flex flex-col justify-center bg-[#f9f5ec]`}>
            <p className="font-serif text-lg italic text-[#0d1b2a]">… et bien d’autres.</p>
            <p className="mt-2 text-sm text-[#333]/75">Une notion à proposer ? Écrivez-nous.</p>
            <a href={`mailto:${S.email}?subject=${encodeURIComponent('JOGOO AI — proposition de concept')}`} className="mt-3 text-sm font-semibold text-[#6a0d0d] hover:underline">
              Proposer une notion →
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}

function Ressources() {
  return (
    <>
      <Ouverture
        site={S}
        kicker="Ressources et outils"
        titre="Chercher, lire, comparer, citer"
        chapeau="Des guides pour accompagner le travail intellectuel, non pour produire des références fictives ou remplacer l’écriture personnelle."
      />
      <Section site={S}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g, i) => (
            <div key={g.titre} className={carte}>
              <p className="font-serif text-3xl text-[#d99a0e]">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-2 font-serif text-xl font-bold text-[#0d1b2a]">{g.titre}</p>
              <ol className="mt-4 space-y-2">
                {g.etapes.map((e, j) => (
                  <li key={j} className="flex gap-3 text-[0.93rem] leading-relaxed text-[#333]">
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6a0d0d]" aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function APropos() {
  const phases: [string, string][] = [
    ['V1 — indispensable', 'Dialogue en français ; recherche dans un corpus autorisé ; sources cliquables ; fiches documentaires ; administration des documents ; signalement d’erreurs ; protection contre les abus.'],
    ['V1 — recommandé', 'Filtres bibliographiques ; suggestions de questions ; affichage des limites de la réponse ; interface adaptée au mobile.'],
    ['V2 — évolution', 'Anglais ; comptes chercheurs ; espace de travail ; export bibliographique ; comparaison de textes ; enrichissement multilingue.'],
  ];
  return (
    <>
      <Ouverture site={S} kicker="À propos" titre="Méthode et engagements" chapeau="JOGOO AI est développé progressivement sous la responsabilité du Groupe JOGOO." />
      <Section site={S} kicker="Méthode" titre="Une évaluation scientifique continue">
        <Texte>
          <p>
            Son corpus, ses fonctionnalités et ses résultats font l’objet d’une évaluation scientifique continue. Les utilisateurs sont invités à signaler les erreurs, les omissions et les références problématiques. Le projet s’engage à respecter les droits des auteurs, la protection des données et la pluralité des traditions philosophiques.
          </p>
          <p>
            L’assistant recherche d’abord les passages pertinents dans le corpus, puis rédige une réponse appuyée sur ces seuls documents, numérotés et cliquables. En l’absence de source pertinente, il le dit explicitement. Un résultat généré n’est jamais une citation vérifiée : remontez toujours au texte.
          </p>
        </Texte>
        <Boutons site={S} liens={[[`mailto:${S.email}?subject=${encodeURIComponent('JOGOO AI — signalement')}`, 'Signaler une erreur'], [`${B}/interroger`, 'Interroger JOGOO AI', true]]} />
      </Section>
      <Section site={S} doux kicker="Feuille de route" titre="Fonctionnalités">
        <div className="grid gap-4 md:grid-cols-3">
          {phases.map(([t, d]) => (
            <div key={t} className={carte}>
              <p className="font-brand text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#6a0d0d]">{t}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-[#333]">{d}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section site={S} kicker="Publics" titre="Publics concernés">
        <Texte>
          <p>Étudiants, enseignants, doctorants, chercheurs, bibliothécaires, traducteurs, institutions de recherche et lecteurs curieux des philosophies africaines.</p>
        </Texte>
      </Section>
    </>
  );
}

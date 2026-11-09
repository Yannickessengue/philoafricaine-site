import { notFound } from 'next/navigation';
import { EDITIONS as S } from '@/lib/sous-sites';
import { Bandeau, Pied, Ouverture, Section, Texte, Boutons, Repere, Contact } from '@/components/SousSite';
import { Html } from '@/components/Html';
import { fragment } from '@/lib/gabarits';

const ancien = (n: string) => fragment(`ancien-editions-${n}`);

const B = S.base;
const PAGES = ['', 'la-maison', 'catalogue', 'publier', 'actualites', 'professionnels'] as const;
const TITRES: Record<string, string> = {
  '': 'Éditions JOGOO',
  'la-maison': 'Une maison d’édition en préfiguration',
  catalogue: 'Collections et programme inaugural',
  publier: 'Présenter un projet de livre',
  actualites: 'Actualités des Éditions',
  professionnels: 'Librairies, bibliothèques et presse',
};

export function generateStaticParams() {
  return PAGES.map((p) => ({ page: p ? [p] : [] }));
}

export async function generateMetadata({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  return TITRES[p] ? { title: p ? `${TITRES[p]} · Éditions JOGOO` : 'Éditions JOGOO', description: 'Penser l’Afrique, publier le monde. La maison d’édition du Groupe JOGOO.' } : {};
}

/* Une couleur par collection (consigne : « pour s'y retrouver ») */
const COLLECTIONS: { nom: string; texte: string; couleur: string; soustitre?: string; direction?: string }[] = [
  { nom: 'Sankofa', soustitre: 'Classiques et patrimoines de la philosophie africaine', direction: 'Adoulou N. Bitang', texte: 'Retour aux textes fondateurs et aux patrimoines philosophiques africains.', couleur: '#ad0e0e' },
  { nom: 'Muntu', soustitre: 'Anthropologie et philosophies de la personne', direction: 'À désigner', texte: 'La personne, ses relations et les conceptions de l’humain.', couleur: '#cc7a05' },
  { nom: 'Savoirs endogènes', soustitre: 'Épistémologies et traditions de savoir africaines', direction: 'À désigner', texte: 'Les conditions de formation, de transmission et de transformation des savoirs.', couleur: '#5b7f2a' },
  { nom: 'Transversalités', soustitre: 'Penser les grands défis contemporains', direction: 'À désigner', texte: 'Des essais qui mettent plusieurs disciplines au travail sur une question contemporaine.', couleur: '#1f5f8b' },
  { nom: 'T(r)opiques', soustitre: 'Lieux, trajectoires et biographies intellectuelles', direction: 'À désigner', texte: 'Lieux de pensée, parcours d’auteurs et biographies intellectuelles.', couleur: '#8a3b8f' },
  { nom: 'Écologie des savoirs', soustitre: 'Pluralité des rationalités et justice épistémique', direction: 'Pr Ulrich Metende', texte: 'Pluralité des rationalités et conditions d’une justice épistémique.', couleur: '#2e7d6b' },
  { nom: 'Herméneutique', soustitre: 'Comprendre, interpréter, transmettre', direction: 'Pr Benoît Okolo Okonda & Pr Cléophas Jacob Defo', texte: 'Pratiques de l’interprétation, de la traduction et de la transmission.', couleur: '#6b4a2b' },
  { nom: 'Chemins africains de l’éthique et de la bioéthique', soustitre: 'Penser le vivant, soigner l’humain, habiter le monde', direction: 'Pr Basile Ngono', texte: 'Questions du soin, du vivant et de la responsabilité.', couleur: '#b5475b' },
  { nom: 'Transtopicités', soustitre: 'Les écritures en mouvement', direction: 'Yannick Essengue', texte: 'Essais, fragments, récits et formes qui traversent philosophie et littérature.', couleur: '#3c3c8f' },
  { nom: 'Revues', soustitre: 'Pôle des périodiques scientifiques', direction: 'Coordination à préciser', texte: 'Un espace de circulation pour les périodiques scientifiques.', couleur: '#141414' },
];

const PROJETS: { titre: string; statut: string; collection?: string; texte: string }[] = [
  {
    titre: 'Philosophie africaine. Débats et questions',
    statut: 'Ouvrage collectif en préparation',
    texte: 'Sous la direction de Molongwa Bayi Bayi et Yannick Essengue, ce projet collectif revient sur les débats et les méthodes qui ont donné forme à la philosophie africaine contemporaine.',
  },
  {
    titre: 'Panser et Penser l’Afrique',
    statut: 'Ouvrage collectif en préparation',
    texte: 'Ce projet rapproche le geste du soin et celui de la réflexion. Il ouvre une enquête sur les manières de penser les épreuves collectives et les possibilités de transformation.',
  },
  {
    titre: 'Le tournant épistémologique de la philosophie africaine',
    statut: 'Ouvrage collectif en préparation',
    texte: 'Le projet s’intéresse aux conditions dans lesquelles se constituent les savoirs philosophiques africains. Il prolonge un cycle scientifique dont une journée s’est tenue à l’UQAM le 30 mai 2025.',
  },
  {
    titre: 'Philosophie africaine du langage',
    statut: 'Projet annoncé',
    texte: 'Inscrit au programme inaugural, ce titre ouvre un chantier sur les rapports entre langage et pratique philosophique en contexte africain.',
  },
  {
    titre: 'Triturations',
    statut: 'Projet annoncé',
    collection: 'Transtopicités',
    texte: 'Un projet de Yannick Essengue pour la collection Transtopicités, consacrée aux formes qui circulent entre philosophie, littérature et création.',
  },
];

const PERIODIQUES = [
  { titre: 'L’être africain', revue: 'Revue JOGOO · N° 1', texte: 'Sommaire et contributions de la revue de philosophie africaine et de culture.', href: '/sous-sites/revue-jogoo', logo: '/medias/site/jogoo/logo-revue-jogoo.png' },
  { titre: 'Reprise de soi et décolonisation des savoirs', revue: 'Eboussi Studies · N° 1', texte: 'Revue scientifique du Groupe JOGOO adossée au Fonds Eboussi Boulaga.', href: '/sous-sites/eboussi-studies', logo: '/medias/site/jogoo/logo-eboussi-studies.png' },
];

/** Couverture « en vitrine » : un livre à venir, aux couleurs de sa collection. */
function Livre({ titre, statut, couleur = '#141414' }: { titre: string; statut: string; couleur?: string }) {
  return (
    <div
      className="relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden p-4 text-white shadow-[6px_10px_24px_-10px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1deg]"
      style={{ backgroundColor: couleur }}
    >
      <span className="absolute inset-y-0 left-0 w-2 bg-black/20" aria-hidden="true" />
      <span className="pl-2 font-brand text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/75">Éditions JOGOO</span>
      <span lang="fr" className="pl-2 font-serif text-[0.92rem] font-bold leading-tight [hyphens:auto] [overflow-wrap:anywhere]">{titre}</span>
      <span className="pl-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/70">{statut}</span>
    </div>
  );
}

export default async function Editions({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  if (!(PAGES as readonly string[]).includes(p)) notFound();
  return (
    <>
      <Bandeau site={S} actif={p} />
      {p === '' && <Accueil />}
      {p === 'la-maison' && <Maison />}
      {p === 'catalogue' && <Catalogue />}
      {p === 'publier' && <Publier />}
      {p === 'actualites' && <Actualites />}
      {p === 'professionnels' && <Professionnels />}
      <Contact site={S} texte="Éditions JOGOO · philoafricaine@gmail.com." />
      <Pied site={S} />
    </>
  );
}

function Accueil() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#faf6f0]">
        <img alt="" aria-hidden="true" src="/medias/site/jogoo/logo-editions-jogoo-rouge.png" className="pointer-events-none absolute -right-24 -top-10 hidden w-[28rem] rotate-6 opacity-[0.06] lg:block" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="kicker text-[#cc7a05]">Éditions JOGOO</p>
            <h1 className="mt-3 font-serif text-[2.4rem] font-bold leading-[1.02] text-[#141414] sm:text-6xl">Penser l’Afrique, publier le monde.</h1>
            <h2 className="mt-8 font-brand text-lg font-bold text-[#ad0e0e]">Des textes qui circulent</h2>
            <p className="mt-2 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">
              Les Éditions JOGOO prolongent le travail du Groupe dans l’édition de philosophie africaine, de sciences humaines et d’écritures contemporaines. Le projet associe la lecture des patrimoines intellectuels, la publication de recherches et l’attention aux formes nouvelles de l’essai.
            </p>
            <Boutons site={S} liens={[[`${B}/catalogue`, 'Explorer le catalogue'], [`${B}/publier`, 'Présenter un projet', true]]} />
          </div>
          <div className="grid grid-cols-3 items-end gap-4">
            {PROJETS.slice(0, 3).map((l, i) => (
              <a key={l.titre} href={`${B}/catalogue#projets`} className={`group block ${i === 1 ? '-translate-y-6' : ''}`}>
                <Livre titre={l.titre} statut="En préparation" couleur={COLLECTIONS[i * 3].couleur} />
              </a>
            ))}
          </div>
        </div>
      </section>
      <Html html={ancien('1')} />
      <Section site={S} kicker="À lire dès maintenant" titre="Les premiers numéros des revues">
        <Periodiques />
      </Section>
    </>
  );
}

function Periodiques() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PERIODIQUES.map((r) => (
        <a key={r.titre} href={r.href} className="group flex items-center gap-5 border border-ink/12 bg-white p-5 transition-colors hover:border-[#ad0e0e]">
          <img alt="" src={r.logo} loading="lazy" className="h-16 w-16 shrink-0 object-contain" />
          <span className="min-w-0">
            <span className="kicker text-[#cc7a05]">{r.revue}</span>
            <span className="mt-1 block font-serif text-lg font-bold italic leading-snug text-[#141414] group-hover:text-[#ad0e0e]">{r.titre}</span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{r.texte}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

function Maison() {
  return (
    <>
      <Ouverture site={S} kicker="La maison" titre="Une maison d’édition en préfiguration" chapeau="Les Éditions JOGOO sont un projet à vocation panafricaine et internationale porté par le Groupe JOGOO." />
      <Section site={S} kicker="Ligne éditoriale" titre="Ligne éditoriale">
        <Texte>
          <p>Nous voulons rendre disponibles des travaux qui prennent au sérieux les archives, les concepts et les langues depuis lesquels se construit la philosophie africaine.</p>
          <p>
            Le programme donne une place aux savoirs endogènes, aux études décoloniales, aux sciences humaines et aux écritures contemporaines. La traduction et les coéditions font partie des pistes envisagées pour élargir la circulation des textes.
          </p>
        </Texte>
      </Section>
      <Html html={ancien('2')} />
      <section className="bg-[#faf6f0]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 sm:py-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="kicker text-[#cc7a05]">Organisation du projet</p>
            <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#141414] sm:text-3xl">Organisation du projet</h2>
            <Texte className="mt-6">
              <p>La préfiguration est portée par Yannick Essengue et le noyau fondateur. La gouvernance et les responsabilités éditoriales font partie des travaux de fondation.</p>
              <p>Des assises sont envisagées à Toulouse en 2027 pour arrêter les orientations, les collections et le programme des premières publications.</p>
            </Texte>
            <Boutons site={S} liens={[[`${B}/catalogue`, 'Voir les collections']]} />
          </div>
          <figure className="cadre aspect-[4/3] border border-ink/10">
            <img alt="Université Toulouse – Jean Jaurès" src="/medias/site/jogoo/toulouse-ut2j.jpg" loading="lazy" />
          </figure>
        </div>
      </section>
      <Html html={ancien('5')} />
      <Html html={ancien('7')} />
      <Html html={ancien('8')} />
    </>
  );
}

function Catalogue() {
  return (
    <>
      <Ouverture site={S} kicker="Catalogue" titre="Collections et programme inaugural" chapeau="Explorez les dix collections envisagées, les projets d’ouvrages et les premiers numéros des revues du Groupe." />
      <Section site={S} kicker="Dix collections" titre="Dix collections">
        <ul className="grid gap-3 sm:grid-cols-2">
          {COLLECTIONS.map((c) => (
            <li key={c.nom} className="flex gap-4 border border-ink/12 bg-white p-5">
              <span className="w-1.5 shrink-0" style={{ backgroundColor: c.couleur }} aria-hidden="true" />
              <span>
                <span className="block font-serif text-lg font-bold leading-snug" style={{ color: c.couleur === '#141414' ? '#141414' : c.couleur }}>
                  {c.nom}
                </span>
                {c.soustitre && <span className="mt-0.5 block font-serif text-[0.95rem] italic text-ink/70">{c.soustitre}</span>}
                <span className="mt-1 block text-[0.95rem] leading-relaxed text-ink-soft">{c.texte}</span>
                {c.direction && (
                  <span className="mt-2 block font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink/45">
                    Direction : <span className={c.direction === 'À désigner' || c.direction.startsWith('Coordination') ? 'text-ink/45' : 'text-[#ad0e0e]'}>{c.direction}</span>
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl border-l-2 border-[#3c3c8f] pl-4 text-[0.95rem] leading-relaxed text-ink-soft">
          La collection Transtopicités accueille les écritures qui traversent les frontières entre philosophie, littérature et création : poésie, essai, nouvelle, pamphlet, aphorisme, billet, fragment, carnet, correspondance, méditation et récit.
        </p>
      </Section>
      <Section site={S} doux id="projets" kicker="Projets de livres" titre="Projets de livres">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PROJETS.map((l, i) => {
            const couleur = COLLECTIONS.find((c) => c.nom === l.collection)?.couleur ?? COLLECTIONS[(i * 3) % 9].couleur;
            return (
              <article key={l.titre} className="group grid grid-cols-[7rem_minmax(0,1fr)] gap-5">
                <Livre titre={l.titre} statut={l.statut.replace('Ouvrage collectif en préparation', 'En préparation')} couleur={couleur} />
                <div>
                  <p className="kicker text-[#cc7a05]">
                    {l.statut}
                    {l.collection ? ` · ${l.collection}` : ''}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-bold leading-snug text-[#141414]">{l.titre}</h3>
                  <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-soft">{l.texte}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
      <Section site={S} kicker="Périodiques à consulter" titre="Périodiques à consulter">
        <Periodiques />
      </Section>
    </>
  );
}

function Publier() {
  return (
    <>
      <Ouverture site={S} kicker="Publier chez nous" titre="Présenter un projet de livre" chapeau="Adressez une présentation de votre projet pour ouvrir un échange avec les Éditions JOGOO." />
      <Section site={S} kicker="Ce qu’il faut préciser" titre="Ce qu’il faut préciser">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <Texte>
            <p>
              Indiquez le titre provisoire, le sujet, l’argument central, le lectorat, le plan et l’état d’avancement. Pour un collectif, ajoutez les noms des responsables et la structure envisagée. Pour une
              traduction, précisez l’édition de référence et la situation des droits.
            </p>
            <p>Vous pouvez joindre un chapitre ou un extrait et indiquer la collection dans laquelle vous pensez inscrire le livre.</p>
          </Texte>
          <ul className="space-y-2 border-l-2 border-[#cc7a05] pl-5 text-sm text-ink-soft">
            {['Titre provisoire', 'Sujet et argument central', 'Lectorat', 'Plan', 'État d’avancement', 'Collection envisagée', 'Chapitre ou extrait (facultatif)'].map((x) => (
              <li key={x} className="flex gap-2">
                <span className="text-[#ad0e0e]" aria-hidden="true">
                  ✓
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <Section site={S} doux kicker="Après le premier contact" titre="Après le premier contact">
        <Texte>
          <p>Ce premier échange sert à discuter l’adéquation du projet avec la ligne de la maison et à convenir des pièces à transmettre pour un examen éditorial.</p>
        </Texte>
        <Boutons
          site={S}
          liens={[
            [
              `mailto:${S.email}?subject=${encodeURIComponent('Projet de livre — Éditions JOGOO')}&body=${encodeURIComponent('Titre provisoire :\nSujet et argument central :\nLectorat :\nPlan :\nÉtat d’avancement :\nCollection envisagée :\n\n(Joindre un chapitre ou un extrait si vous le souhaitez.)')}`,
              'Écrire aux Éditions',
            ],
          ]}
        />
      </Section>
    </>
  );
}

function Actualites() {
  return (
    <>
      <Ouverture site={S} kicker="Actualités" titre="Actualités des Éditions" chapeau="Suivez le programme inaugural et les étapes de préfiguration." />
      <Section site={S} kicker="Repères" titre="Repères">
        <div className="grid gap-4 md:grid-cols-2">
          <Repere site={S} date="Octobre 2026" titre="Premiers numéros des revues" texte="Consultez les pages de la Revue JOGOO et d’Eboussi Studies." href="/sous-sites/revue-jogoo" />
          <Repere site={S} date="2027 · Envisagé" titre="Assises fondatrices à Toulouse" texte="Les travaux prévus portent sur les orientations scientifiques, la gouvernance et le programme éditorial." />
        </div>
        <Boutons site={S} liens={[['/actualites', 'Suivre les parutions']]} />
      </Section>
      <Html html={ancien('6')} />
    </>
  );
}

function Professionnels() {
  const demandes: [string, string, string, string][] = [
    ['Librairies', 'Diffusion et rencontres', 'Indiquez le titre, la quantité envisagée, la destination ou le format de la rencontre.', 'Demande librairie'],
    ['Bibliothèques', 'Acquisitions et signalement', 'Précisez le titre et le format souhaité. Vous pouvez demander les données bibliographiques disponibles.', 'Demande bibliothèque'],
    ['Presse', 'Présentation et entretiens', 'Indiquez le média, le sujet, le titre concerné et votre échéance.', 'Demande presse'],
  ];
  return (
    <>
      <Ouverture site={S} kicker="Espace professionnels" titre="Librairies, bibliothèques et presse" chapeau="Un contact pour les demandes bibliographiques, les possibilités de diffusion et les projets de rencontre." />
      <Section site={S} kicker="Préparer votre demande" titre="Préparer votre demande">
        <div className="grid gap-4 md:grid-cols-3">
          {demandes.map(([qui, titre, texte, objet]) => (
            <div key={qui} className="flex flex-col border border-ink/12 bg-white p-6">
              <p className="kicker text-[#cc7a05]">{qui}</p>
              <h3 className="mt-1.5 font-serif text-lg font-bold text-[#141414]">{titre}</h3>
              <p className="mt-2 flex-1 text-[0.93rem] leading-relaxed text-ink-soft">{texte}</p>
              <a href={`mailto:${S.email}?subject=${encodeURIComponent(`${objet} — Éditions JOGOO`)}`} className="mt-5 text-sm font-semibold text-[#ad0e0e] hover:underline">
                Écrire aux Éditions →
              </a>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

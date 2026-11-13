import { notFound } from 'next/navigation';
import { EDITIONS as S } from '@/lib/sous-sites';
import { Bandeau, Pied, Ouverture, Section, Texte, Boutons, Repere, Contact } from '@/components/SousSite';
import { Html } from '@/components/Html';
import { fragment } from '@/lib/gabarits';
import { COLLECTIONS, PROJETS, PERIODIQUES, OBJECTIFS, DOCUMENTS, LOGOS, collection, type Collection, type Projet } from '@/lib/editions';

const ancien = (n: string) => fragment(`ancien-editions-${n}`);

const B = S.base;
const PAGES = ['', 'la-maison', 'catalogue', 'publier', 'actualites', 'professionnels'] as const;
const TITRES: Record<string, string> = {
  '': 'Éditions JOGOO',
  'la-maison': 'La maison',
  catalogue: 'Catalogue : dix collections et programme inaugural',
  publier: 'Présenter un projet de livre',
  actualites: 'Actualités des Éditions',
  professionnels: 'Librairies, bibliothèques et presse',
};

export function generateStaticParams() {
  return [...PAGES.map((p) => ({ page: p ? [p] : [] })), ...COLLECTIONS.map((c) => ({ page: ['catalogue', c.slug] }))];
}

function fiche(p: string) {
  const m = p.match(/^catalogue\/([a-z-]+)$/);
  return m ? collection(m[1]) : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  const c = fiche(p);
  if (c) return { title: `Collection ${c.nom} · Éditions JOGOO`, description: `${c.soustitre}. ${c.texte}` };
  return TITRES[p] ? { title: p ? `${TITRES[p]} · Éditions JOGOO` : 'Éditions JOGOO', description: 'Penser l’Afrique, publier le monde. La maison d’édition du Groupe JOGOO.' } : {};
}

const couleurProjet = (l: Projet, i: number) => collection(l.collection ?? '')?.couleur ?? ['#ad0e0e', '#5b7f2a', '#1f5f8b', '#cc7a05', '#3c3c8f', '#6b4a2b'][i % 6];

/** Couverture « en vitrine » d’un livre à venir, aux couleurs de sa collection. */
function Livre({ titre, collectionNom, couleur = '#141414', petit = false }: { titre: string; collectionNom?: string; couleur?: string; petit?: boolean }) {
  return (
    <div
      className="relative flex aspect-[2/3] w-full flex-col overflow-hidden text-white shadow-[6px_12px_26px_-12px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1deg]"
      style={{ backgroundColor: couleur }}
    >
      <span className="absolute inset-y-0 left-0 w-[7%] bg-black/20" aria-hidden="true" />
      <span className="absolute inset-y-0 left-[7%] w-px bg-white/25" aria-hidden="true" />
      <div className={`relative flex flex-1 flex-col ${petit ? 'py-3 pl-[14%] pr-3' : 'py-4 pl-[14%] pr-4'}`}>
        <span className={`min-h-[0.7rem] font-brand font-bold uppercase leading-tight tracking-[0.18em] text-white/80 ${petit ? 'text-[0.45rem]' : 'text-[0.55rem]'}`}>{collectionNom}</span>
        <span lang="fr" className={`mt-3 font-serif font-bold leading-[1.12] [hyphens:auto] [overflow-wrap:anywhere] ${petit ? 'text-[0.78rem]' : 'text-[0.98rem]'}`}>
          {titre}
        </span>
        <span className="mt-auto flex items-end justify-between gap-2">
          <img src={LOGOS.symboleBlanc} alt="" aria-hidden="true" className={petit ? 'w-6' : 'w-8'} />
          <span className={`font-brand uppercase tracking-[0.16em] text-white/70 ${petit ? 'text-[0.4rem]' : 'text-[0.5rem]'}`}>Éditions JOGOO</span>
        </span>
      </div>
    </div>
  );
}

/** Le rayonnage : les dix collections comme dos de livres. */
function Rayonnage() {
  const hauteurs = ['h-64', 'h-56', 'h-60', 'h-52', 'h-64', 'h-56', 'h-60', 'h-64', 'h-52', 'h-60'];
  return (
    <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
      <ul className="flex min-w-[40rem] items-end justify-center gap-1 border-b-[6px] border-[#141414] px-1">
        {COLLECTIONS.map((c, i) => (
          <li key={c.slug} className="w-full max-w-[4.75rem] flex-1">
            <a
              href={`${B}/catalogue/${c.slug}`}
              className={`group relative flex ${hauteurs[i]} flex-col items-center justify-between py-3 text-white transition-transform duration-300 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc7a05]`}
              style={{ backgroundColor: c.couleur }}
              title={`${c.nom} — ${c.soustitre}`}
            >
              <span className="h-px w-3/5 bg-white/40" aria-hidden="true" />
              <span className="font-serif text-[0.95rem] font-bold leading-tight [text-orientation:mixed] [writing-mode:vertical-rl] rotate-180">
                {c.nom === 'Chemins africains de l’éthique et de la bioéthique' ? 'Éthique et bioéthique' : c.nom}
              </span>
              <img src={LOGOS.symboleBlanc} alt="" aria-hidden="true" className="w-5 opacity-90" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink/55">Choisissez un dos pour ouvrir la collection.</p>
    </div>
  );
}

/** Le coq, animal de l’aurore : le symbole qui fonde la maison. */
function Aurore() {
  return (
    <section className="relative overflow-hidden bg-[#ad0e0e] text-white">
      <img src={LOGOS.symboleBlanc} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 w-[22rem] opacity-[0.12] sm:w-[30rem]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">Une philosophie du matin</h2>
          <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-white/85">
            Le Groupe JOGOO a choisi pour symbole le coq, et non la chouette de Hegel. Les Éditions prolongent ce choix : publier une pensée qui réveille et qui met au travail.
          </p>
        </div>
        <blockquote className="border-l-2 border-[#cc7a05] pl-6">
          <p className="font-serif text-xl italic leading-relaxed sm:text-2xl">
            « Le coq est un animal de l’aurore, celui qui nous réveille ; celui qui nous met au travail ; celui qui féconde chacun de nos instants. »
          </p>
          <footer className="mt-4 text-sm text-white/70">Statuts du Groupe JOGOO, article 1, § 1.1</footer>
        </blockquote>
      </div>
    </section>
  );
}

export default async function Editions({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  const c = fiche(p);
  if (!c && !(PAGES as readonly string[]).includes(p)) notFound();
  return (
    <>
      <Bandeau site={S} actif={c ? 'catalogue' : p} />
      {c && <FicheCollection c={c} />}
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
  const vitrine = [PROJETS[0], PROJETS[4], PROJETS[1]];
  return (
    <>
      <section className="relative overflow-hidden bg-[#faf6f0]">
        <img alt="" aria-hidden="true" src={LOGOS.symbole} className="pointer-events-none absolute -right-28 -top-16 hidden w-[30rem] rotate-6 opacity-[0.07] lg:block" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-serif text-[2.5rem] font-bold leading-[1.02] text-[#141414] sm:text-6xl">Penser l’Afrique, publier le monde.</h1>
            <p className="mt-7 max-w-xl font-serif text-xl leading-relaxed text-[#141414]/85">
              Une maison d’édition africaine et internationale consacrée à la philosophie africaine, aux sciences humaines, aux savoirs endogènes, aux études décoloniales et aux écritures contemporaines.
            </p>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft">
              Dix collections, un pôle de revues et un programme inaugural en préparation, en vue des Assises fondatrices de Toulouse en octobre 2027.
            </p>
            <Boutons site={S} liens={[[`${B}/catalogue`, 'Explorer le catalogue'], [`${B}/publier`, 'Présenter un projet', true]]} />
          </div>
          <div className="grid grid-cols-3 items-end gap-4">
            {vitrine.map((l, i) => (
              <a key={l.titre} href={`${B}/catalogue#programme`} className={`group block ${i === 1 ? '-translate-y-6' : ''}`}>
                <Livre titre={l.titre} collectionNom={collection(l.collection ?? '')?.nom} couleur={couleurProjet(l, PROJETS.indexOf(l))} petit />
              </a>
            ))}
          </div>
        </div>
      </section>
      <Section site={S} titre="Dix collections pour s’y retrouver">
        <Rayonnage />
      </Section>
      <Aurore />
      <Section site={S} doux titre="Le programme inaugural">
        <Programme limite={3} />
        <Boutons site={S} liens={[[`${B}/catalogue#programme`, 'Tout le programme', true]]} />
      </Section>
      <Section site={S} titre="Les premiers numéros des revues">
        <Periodiques />
      </Section>
    </>
  );
}

function Periodiques() {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {PERIODIQUES.map((r) => (
        <a key={r.titre} href={r.href} className="group flex flex-col gap-6 bg-white p-6 shadow-[0_1px_2px_rgba(26,26,26,0.04),0_18px_40px_-26px_rgba(26,26,26,0.35)] transition-all duration-300 hover:-translate-y-1 md:flex-row md:items-center">
          <span className="relative mx-auto block w-48 shrink-0 md:mx-0 md:w-44 lg:w-52">
            <img
              alt={`Couverture : ${r.revue}, « ${r.titre} »`}
              src={r.couverture}
              loading="lazy"
              className="block aspect-[2/3] w-full object-cover shadow-[0_22px_40px_-18px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.03]"
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[#cc7a05]">{r.revue} · Octobre 2026</span>
            <span className="mt-2 block font-serif text-2xl font-bold italic leading-snug text-[#141414] group-hover:text-[#ad0e0e]">{r.titre}</span>
            <span className="mt-2 block text-sm leading-relaxed text-ink-soft">{r.coordination}</span>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ad0e0e] group-hover:underline">Découvrir le numéro</span>
          </span>
        </a>
      ))}
    </div>
  );
}

/** Fiches des livres du programme inaugural. */
function Programme({ limite, liste }: { limite?: number; liste?: Projet[] }) {
  const items = (liste ?? PROJETS).slice(0, limite);
  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
      {items.map((l) => {
        const col = collection(l.collection ?? '');
        return (
          <article key={l.titre} className="group grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
            <div className="self-start">
              <Livre titre={l.titre} collectionNom={col?.nom} couleur={couleurProjet(l, PROJETS.indexOf(l))} petit />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#cc7a05]">{l.statut}</p>
              <h3 className="mt-1 font-serif text-xl font-bold leading-snug text-[#141414]">{l.titre}</h3>
              {l.soustitre && <p className="mt-0.5 font-serif italic leading-snug text-ink/75">{l.soustitre}</p>}
              {l.auteurs && <p className="mt-2 text-sm text-ink/70">{l.auteurs}</p>}
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{l.texte}</p>
              {l.parties && (
                <ul className="mt-3 space-y-1 border-l border-ink/15 pl-3 text-[0.9rem] leading-snug text-ink/80">
                  {l.parties.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
              {(col || l.parution) && (
                <p className="mt-3 flex flex-wrap gap-x-3 text-sm text-ink/55">
                  {col && (
                    <a href={`${B}/catalogue/${col.slug}`} className="text-[#ad0e0e] hover:underline">
                      Collection {col.nom}
                    </a>
                  )}
                  {l.parution && <span>{l.parution}</span>}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Maison() {
  return (
    <>
      <Ouverture site={S} kicker="La maison" titre="Une maison d’édition en préfiguration" chapeau="Les Éditions JOGOO prolongent l’esprit du Groupe JOGOO : contribuer à la production, à la circulation et à la visibilité mondiale des savoirs africains." />
      <Section site={S} titre="Vision et ambition">
        <Texte>
          <p>
            Les Éditions JOGOO sont conçues comme une maison d’édition africaine et internationale consacrée à la philosophie africaine, aux sciences humaines, aux savoirs endogènes, aux études décoloniales et aux écritures contemporaines.
          </p>
          <p>
            Elles veulent se construire depuis la France avec une vocation panafricaine et internationale : une forte exigence scientifique, une identité éditoriale reconnaissable et un réseau de représentations et de correspondants dans le monde. Les traductions, les coéditions et les rééditions de classiques font partie du projet.
          </p>
        </Texte>
      </Section>
      <Aurore />
      <Section site={S} titre="Ce que la maison veut faire">
        <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {OBJECTIFS.map(([t, x]) => (
            <li key={t} className="border-t border-ink/15 pt-4">
              <p className="font-serif text-lg font-bold leading-snug text-[#141414]">{t}</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">{x}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Html html={ancien('2')} />
      <Html html={ancien('5')} />
      <Section site={S} doux titre="Les textes fondateurs en préparation">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Texte>
            <p>Les Assises de Toulouse adopteront les textes qui fondent la maison : manifeste, chartes, politique éditoriale et procédure d’évaluation des manuscrits en double aveugle.</p>
          </Texte>
          <ul className="columns-1 gap-8 text-[0.97rem] leading-relaxed text-ink sm:columns-2">
            {DOCUMENTS.map((d) => (
              <li key={d} className="mb-2 break-inside-avoid border-b border-ink/10 pb-2">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <Html html={ancien('7')} />
      <Html html={ancien('8')} />
    </>
  );
}

function Catalogue() {
  return (
    <>
      <Ouverture site={S} kicker="Catalogue" titre="Dix collections et un programme inaugural" chapeau="Chaque collection a sa couleur, pour s’y retrouver d’un coup d’œil. Ouvrez une collection pour lire sa ligne, sa direction et ses titres." />
      <Section site={S} titre="Le rayonnage">
        <Rayonnage />
      </Section>
      <Section site={S} doux titre="Les collections">
        <ul className="grid gap-4 sm:grid-cols-2">
          {COLLECTIONS.map((c) => {
            const n = PROJETS.filter((l) => l.collection === c.slug).length + (c.slug === 'revues' ? PERIODIQUES.length : 0);
            return (
              <li key={c.slug}>
                <a href={`${B}/catalogue/${c.slug}`} className="group flex h-full gap-4 border border-ink/12 bg-white p-5 transition-colors hover:border-ink/40">
                  <span className="w-1.5 shrink-0" style={{ backgroundColor: c.couleur }} aria-hidden="true" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="block font-serif text-xl font-bold leading-snug group-hover:underline" style={{ color: c.couleur }}>
                      {c.nom}
                    </span>
                    <span className="mt-0.5 block font-serif italic text-ink/70">{c.soustitre}</span>
                    <span className="mt-2 block text-[0.95rem] leading-relaxed text-ink-soft">{c.texte}</span>
                    <span className="mt-auto flex flex-wrap justify-between gap-x-4 gap-y-1 pt-3 text-sm">
                      <span className={c.direction === 'À désigner' || c.direction.startsWith('Coordination') ? 'text-ink/45' : 'text-ink/80'}>Direction : {c.direction}</span>
                      {n > 0 && <span className="text-ink/55">{n === 1 ? '1 titre' : `${n} titres`}</span>}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section site={S} id="programme" titre="Le programme inaugural">
        <Programme />
      </Section>
      <Section site={S} doux titre="Périodiques à consulter">
        <Periodiques />
      </Section>
    </>
  );
}

function FicheCollection({ c }: { c: Collection }) {
  const i = COLLECTIONS.indexOf(c);
  const prec = COLLECTIONS[(i + COLLECTIONS.length - 1) % COLLECTIONS.length];
  const suiv = COLLECTIONS[(i + 1) % COLLECTIONS.length];
  const titres = PROJETS.filter((l) => l.collection === c.slug);
  const designer = c.direction === 'À désigner' || c.direction.startsWith('Coordination');
  return (
    <>
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: c.couleur }}>
        <img src={LOGOS.symboleBlanc} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-8 w-64 opacity-[0.14] sm:w-96" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <a href={`${B}/catalogue`} className="text-sm text-white/75 hover:text-white hover:underline">
            ← Catalogue
          </a>
          <p className="mt-6 text-sm font-semibold text-white/75">Collection {i + 1} sur {COLLECTIONS.length}</p>
          <h1 className="mt-2 max-w-4xl font-serif text-[2.4rem] font-bold leading-[1.04] sm:text-6xl">{c.nom}</h1>
          <p className="mt-4 max-w-2xl font-serif text-xl italic leading-relaxed text-white/90">{c.soustitre}</p>
          <p className="mt-6 text-[0.95rem] text-white/85">
            Direction : <span className="font-semibold text-white">{c.direction}</span>
          </p>
        </div>
      </section>
      <Section site={S} titre="La ligne de la collection">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <Texte>
            {c.presentation.map((x) => (
              <p key={x.slice(0, 24)}>{x}</p>
            ))}
          </Texte>
          {c.domaines && (
            <div className="self-start border-l-2 pl-5" style={{ borderColor: c.couleur }}>
              <p className="font-serif text-lg font-bold text-[#141414]">Ce qu’elle accueille</p>
              <ul className={`mt-2 gap-x-6 text-[0.95rem] text-ink-soft ${c.domaines.length > 6 ? 'columns-2' : ''}`}>
                {c.domaines.map((d) => (
                  <li key={d} className="mb-1">{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
      {c.slug === 'revues' ? (
        <Section site={S} doux titre="Les revues du pôle">
          <Periodiques />
        </Section>
      ) : (
        <Section site={S} doux titre={titres.length ? 'Titres en préparation' : 'Premiers titres'}>
          {titres.length ? (
            <Programme liste={titres} />
          ) : (
            <p className="max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft">
              Les premiers titres de la collection sont à construire. Les propositions de manuscrits qui s’inscrivent dans cette ligne sont les bienvenues.
            </p>
          )}
        </Section>
      )}
      <Section site={S} titre="Proposer un manuscrit">
        <Texte>
          <p>
            Votre projet relève de la collection {c.nom} ? Présentez-le en quelques lignes : titre provisoire, argument central, lectorat, plan et état d’avancement.
            {designer ? '' : ` La direction de la collection (${c.direction}) en sera destinataire.`}
          </p>
        </Texte>
        <Boutons
          site={S}
          liens={[
            [`mailto:${S.email}?subject=${encodeURIComponent(`Projet pour la collection ${c.nom} — Éditions JOGOO`)}`, 'Écrire aux Éditions'],
            [`${B}/publier`, 'Ce qu’il faut préciser', true],
          ]}
        />
      </Section>
      <nav aria-label="Autres collections" className="border-t border-ink/10">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 sm:grid-cols-2">
          {[
            [prec, 'Collection précédente'],
            [suiv, 'Collection suivante'],
          ].map(([x, l], k) => {
            const col = x as Collection;
            return (
              <a key={col.slug} href={`${B}/catalogue/${col.slug}`} className={`group block border-l-4 py-1 pl-4 ${k ? 'sm:border-l-0 sm:border-r-4 sm:pl-0 sm:pr-4 sm:text-right' : ''}`} style={{ borderColor: col.couleur }}>
                <span className="block text-sm text-ink/55">{l as string}</span>
                <span className="block font-serif text-lg font-bold text-[#141414] group-hover:underline">{col.nom}</span>
              </a>
            );
          })}
        </div>
      </nav>
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
          <Repere site={S} date="Novembre 2026" titre="Une identité visuelle pour la maison" texte="Le coq de l’aurore et la lettre J : logos et déclinaisons disponibles dans l’espace professionnels." href={`${B}/professionnels#identite`} />
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
      <Section site={S} doux id="identite" titre="Identité visuelle">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Texte>
              <p>Pour annoncer une parution ou une rencontre, utilisez les logos officiels des Éditions JOGOO : version complète, horizontale, symbole seul, en couleurs, en noir et en négatif.</p>
              <p>Ne déformez pas le logo et ne modifiez pas ses couleurs : rouge #ad0e0e, ocre #cc7a05, noir #141414.</p>
            </Texte>
            <Boutons site={S} liens={[[LOGOS.kit, 'Télécharger les logos (zip, 1,4 Mo)']]} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <figure className="col-span-3 flex items-center justify-center border border-ink/10 bg-white p-6">
              <img src={LOGOS.horizontal} alt="Logo horizontal des Éditions JOGOO" className="h-20 w-auto" loading="lazy" />
            </figure>
            <figure className="flex aspect-square items-center justify-center border border-ink/10 bg-white p-4">
              <img src={LOGOS.base} alt="Logo complet des Éditions JOGOO" className="max-h-full w-auto" loading="lazy" />
            </figure>
            <figure className="flex aspect-square items-center justify-center bg-[#141414] p-5">
              <img src={LOGOS.symboleBlanc} alt="Symbole des Éditions JOGOO en négatif" className="w-full" loading="lazy" />
            </figure>
            <figure className="flex aspect-square items-center justify-center bg-[#ad0e0e] p-5">
              <img src={LOGOS.symboleBlanc} alt="Symbole des Éditions JOGOO sur fond rouge" className="w-full" loading="lazy" />
            </figure>
          </div>
        </div>
      </Section>
    </>
  );
}

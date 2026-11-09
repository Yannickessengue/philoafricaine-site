import { notFound } from 'next/navigation';
import { MAGAZINE as S } from '@/lib/sous-sites';
import { Bandeau, Pied, Ouverture, Section, Texte, Boutons, Cartes, Repere, Contact } from '@/components/SousSite';
import { Html } from '@/components/Html';
import { Visionneuse } from '@/components/Visionneuse';
import { fragment } from '@/lib/gabarits';
import { numerosEnLigne } from '@/lib/magazine';

const ancien = (n: string) => fragment(`ancien-${n}`);

const B = S.base;
const PAGES = ['', 'lire', 'numero-001', 'dossier', 'rubriques', 'a-propos', 'contribuer', 'acheter'] as const;
const TITRES: Record<string, string> = {
  '': 'Philo Africaine Magazine',
  lire: 'Lire le magazine en ligne',
  'numero-001': 'Numéro 001 — Mythologies africaines et pensée philosophique',
  dossier: 'Le dossier MAPP',
  rubriques: 'Les rubriques',
  'a-propos': 'Pourquoi un magazine de philosophie ?',
  contribuer: 'Proposer un article',
  acheter: 'Acheter et s’abonner',
};

export async function generateStaticParams() {
  const numeros = await numerosEnLigne();
  return [...PAGES.map((p) => ({ page: p ? [p] : [] })), ...numeros.map((n) => ({ page: ['lire', n.slug] }))];
}

// L'embargo se lève automatiquement : pages régénérées chaque jour
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  if (p.startsWith('lire/')) return { title: `Numéro ${p.slice(5)} en ligne · Philo Africaine Magazine` };
  return TITRES[p] ? { title: p ? `${TITRES[p]} · Philo Africaine Magazine` : 'Philo Africaine Magazine', description: 'Du philosophique au philosophant 2.0. Magazine semestriel de philosophie du Groupe JOGOO.' } : {};
}

const RUBRIQUES: [string, string][] = [
  ['Éditorial', 'Une prise de position de la rédaction sur la question qui ouvre chaque numéro.'],
  ['Le philosophique', 'Concepts, arguments et controverses pour lire l’Afrique comme lieu d’élaboration philosophique.'],
  ['Actualité philosophique', 'Rencontres de recherche et lectures philosophiques de l’actualité politique et sociale.'],
  ['Dossier', 'Un même problème abordé par plusieurs auteur·rices. Le premier dossier interroge les rapports entre mythe et raison.'],
  ['Décoloniser les savoirs', 'Des enquêtes sur la production et la transmission des savoirs africains. Référente : Edith Ekodo Mvondo.'],
  ['Figures pour notre temps', 'Des parcours et des œuvres qui aident à formuler les questions d’aujourd’hui. Référent : Kokoré Koffi Dramane.'],
  ['Économie africaine', 'Des lectures philosophiques du travail, des échanges et de leurs institutions. Référent : Josué Mbeutcha.'],
  ['L’invité', 'Une conversation autour d’une œuvre, d’une recherche ou d’une pratique de création.'],
  ['À la découverte de…', 'Des collectifs, institutions et lieux qui font vivre la philosophie en Afrique et dans ses diasporas.'],
  ['Lectures', 'Des recensions et notes critiques pour entrer dans les livres et discuter leurs propositions.'],
];

/** Couverture du numéro en cours (image tirée du PDF), cliquable vers la lecture en ligne. */
function Couverture({ petite = false, image = '/medias/site/jogoo/pam/couverture-001.jpg', href = `${B}/lire/001` }: { petite?: boolean; image?: string; href?: string }) {
  return (
    <a
      href={href}
      className={`group relative block w-full shadow-[0_30px_60px_-25px_rgba(26,23,20,0.6)] transition-transform duration-500 hover:-rotate-1 hover:scale-[1.015] ${petite ? 'max-w-[15rem]' : 'max-w-sm'}`}
    >
      <img alt="Couverture de Philo Africaine Magazine n° 001" src={image} className="block aspect-[595/780] w-full object-cover" />
      <span className="absolute inset-x-0 bottom-0 flex translate-y-1 items-center justify-center gap-2 bg-[#1a1714]/85 py-2.5 font-brand text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#e5a220] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        Feuilleter en ligne →
      </span>
    </a>
  );
}

export default async function Magazine({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  const lecture = p.startsWith('lire/') ? p.slice(5) : null;
  if (!lecture && !(PAGES as readonly string[]).includes(p)) notFound();
  const numeros = await numerosEnLigne();
  const numero = lecture ? numeros.find((n) => n.slug === lecture) : null;
  if (lecture && !numero) notFound();

  return (
    <>
      <Bandeau site={S} actif={lecture ? 'lire' : p} />
      {numero && <Lecture n={numero} />}
      {p === '' && <Accueil n={numeros[0]} />}
      {p === 'lire' && <Kiosque numeros={numeros} />}
      {p === 'numero-001' && <Numero />}
      {p === 'dossier' && <Dossier />}
      {p === 'rubriques' && <Rubriques />}
      {p === 'a-propos' && <APropos />}
      {p === 'contribuer' && <Contribuer />}
      {p === 'acheter' && <Acheter />}
      <Contact site={S} texte="Philo Africaine Magazine · philoafricaine@gmail.com · WhatsApp du Groupe JOGOO +242 06 445 99 09." whatsapp />
      <Pied site={S} />
    </>
  );
}

type Numero = Awaited<ReturnType<typeof numerosEnLigne>>[number];

function Accueil({ n }: { n?: Numero }) {
  return (
    <>
      <section className="relative overflow-hidden bg-[#f7f1e6]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="kicker text-[#c8461f]">Numéro inaugural</p>
            <h1 className="mt-3 font-serif text-[2.3rem] font-bold leading-[1.02] text-[#1a1714] sm:text-6xl">Mythologies africaines et pensée philosophique</h1>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-soft">
              Le dossier prolonge les journées d’étude MAPP des 29 et 30 avril 2025. Il réunit des perspectives sur la rationalité, la transmission des récits et leur place dans la vie politique.
            </p>
            <Boutons site={S} liens={[[`${B}/lire/001`, 'Feuilleter en ligne'], [`${B}/numero-001`, 'Explorer le n° 001', true], [`${B}/contribuer`, 'Proposer un article', true]]} />
          </div>
          <div className="flex justify-center lg:justify-end">
            <Couverture image={n?.couverture ?? undefined} />
          </div>
        </div>
      </section>
      <Html html={ancien('magazine-1')} />
      {n && <EnLigne n={n} />}
      <Section site={S} kicker="À lire sur le portail" titre="Pour entrer dans le magazine">
        <Cartes
          site={S}
          items={[
            { surtitre: 'Figures', titre: 'En mémoire de Tanella Boni', texte: 'Un hommage publié dans les éditos du Groupe JOGOO.', href: '/edito/en-memoire-de-tanella-boni' },
            { surtitre: 'Lectures', titre: 'Notes de lecture', texte: 'Des recensions en philosophie africaine, de Marcien Towa à Souleymane Bachir Diagne.', href: '/publications' },
            { surtitre: 'Dossier 001', titre: 'Trois questions pour entrer dans le dossier', texte: 'Que fait un récit à la raison, à la mémoire et à l’ordre social ?', href: `${B}/dossier` },
          ]}
        />
      </Section>
      <Html html={ancien('magazine-2')} />
      <Section site={S} doux kicker="Dix rubriques" titre="Dix manières d’entrer dans le magazine">
        <div className="flex flex-wrap gap-2">
          {RUBRIQUES.map(([r]) => (
            <a key={r} href={`${B}/rubriques`} className="border border-[#1a1714]/15 bg-white px-3 py-1.5 font-brand text-xs font-semibold text-[#1a1714] transition-colors hover:border-[#c8461f] hover:text-[#c8461f]">
              {r}
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}

/** Bandeau « Lire en ligne » (accueil et numéro) */
function EnLigne({ n }: { n: Numero }) {
  return (
    <section className="bg-[#1a1714] text-[#f7f1e6]">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-12 sm:grid-cols-[auto_1fr]">
        <a href={`${B}/lire/${n.slug}`} className="group mx-auto block w-36 shrink-0 sm:mx-0">
          {n.couverture && <img alt="" src={n.couverture} className="w-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:-rotate-2" />}
        </a>
        <div>
          <p className="kicker text-[#e5a220]">Le magazine en ligne</p>
          <h2 className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">Feuilletez le n° {n.slug} dans votre navigateur</h2>
          <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-[#f7f1e6]/75">
            {n.embargo
              ? `La couverture, l’éditorial et le sommaire sont en lecture libre. Le numéro complet (${n.total} pages) sera en accès libre le ${n.fin} ; d’ici là, il est disponible en version papier ou numérique.`
              : `Le numéro complet (${n.total} pages) est en accès libre.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`${B}/lire/${n.slug}`} className="inline-flex items-center gap-2 bg-[#c8461f] px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#e5a220] hover:text-[#1a1714]">
              Ouvrir la visionneuse →
            </a>
            {n.embargo && (
              <a href={`${B}/acheter`} className="inline-flex items-center gap-2 border border-[#f7f1e6]/30 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-[#f7f1e6] transition-colors hover:bg-[#f7f1e6] hover:text-[#1a1714]">
                Commander le numéro →
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Kiosque({ numeros }: { numeros: Numero[] }) {
  return (
    <>
      <Ouverture site={S} kicker="Lire en ligne" titre="Le magazine en ligne" chapeau="Chaque numéro se feuillette dans le navigateur. Pendant un an après sa parution, seules les premières pages sont en lecture libre ; le numéro complet s’obtient en version papier ou numérique." />
      <Section site={S} titre="Les numéros">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {numeros.map((n) => (
            <a key={n.slug} href={`${B}/lire/${n.slug}`} className="group block">
              <span className="relative block">
                {n.couverture && <img alt={`Couverture du n° ${n.slug}`} src={n.couverture} className="aspect-[595/780] w-full object-cover shadow-[0_24px_50px_-24px_rgba(26,23,20,0.7)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-1" />}
                <span className={`absolute left-3 top-3 px-2 py-1 font-brand text-[0.62rem] font-bold uppercase tracking-[0.12em] ${n.embargo ? 'bg-[#1a1714] text-[#e5a220]' : 'bg-[#e5a220] text-[#1a1714]'}`}>
                  {n.embargo ? `Aperçu · libre le ${n.fin}` : 'Accès libre'}
                </span>
                {n.maquette && <span className="absolute right-3 top-3 bg-white/90 px-2 py-1 font-brand text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#c8461f]">Maquette</span>}
              </span>
              <span className="mt-4 block">
                <span className="kicker text-[#c8461f]">
                  N° {n.slug}
                  {n.periode ? ` · ${n.periode}` : ''}
                </span>
                <span className="mt-1 block font-serif text-xl font-bold leading-snug text-[#1a1714] group-hover:text-[#c8461f]">{n.titre}</span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {n.total} pages · {n.embargo ? `${Math.min(n.pagesApercu ?? 5, n.total)} pages en lecture libre` : 'texte intégral'}
                </span>
              </span>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}

function Lecture({ n }: { n: Numero }) {
  const url = n.embargo ? `${n.pdf}?apercu=1` : n.pdf!;
  return (
    <>
      <section className="bg-[#1a1714]">
        <div className="mx-auto max-w-6xl px-0 sm:px-6 sm:py-6">
          <Visionneuse
            url={url}
            titre={`Philo Africaine Magazine · N° ${n.slug} — ${n.titre}`}
            pagesTotal={n.total}
            apercu={n.embargo}
            finEmbargo={n.fin}
            sommaire={(n.sommaire ?? []).map((x) => ({ page: x.page, rubrique: x.rubrique, titre: x.titre }))}
            commander={`${B}/acheter`}
            telecharger={n.embargo ? undefined : n.pdf!}
          />
        </div>
      </section>
      <Section site={S} kicker={`N° ${n.slug}${n.periode ? ` · ${n.periode}` : ''}`} titre={n.titre ?? ''}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            {n.resume && (
              <Texte>
                <p>{n.resume}</p>
              </Texte>
            )}
            {(n.sommaire ?? []).length > 0 && (
              <ol className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {n.sommaire!.map((x) => (
                  <li key={x.page + x.titre} className="flex items-baseline gap-5 py-3">
                    <span className="w-10 shrink-0 font-serif text-xl text-[#c8461f]">{x.page}</span>
                    <span className="w-28 shrink-0 font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink/50">{x.rubrique}</span>
                    <span className="font-serif text-[1.05rem] leading-snug text-[#1a1714]">{x.titre}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <aside className="h-fit border-t-2 border-[#c8461f] bg-[#f7f1e6] p-6">
            <p className="kicker text-[#c8461f]">Accès</p>
            {n.embargo ? (
              <>
                <p className="mt-2 font-serif text-lg font-bold leading-snug text-[#1a1714]">Lecture libre de {Math.min(n.pagesApercu ?? 5, n.total)} pages</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Le numéro complet sera en accès libre le <strong>{n.fin}</strong>, un an après sa mise en ligne. D’ici là, commandez-le en version papier ou numérique.
                </p>
                <a href={`${B}/acheter`} className="mt-5 inline-flex items-center gap-2 bg-[#c8461f] px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1a1714]">
                  Commander →
                </a>
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Texte intégral en accès libre. Le PDF peut être téléchargé depuis la visionneuse.</p>
            )}
            {n.maquette && <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/55">Version de travail (maquette) : certaines pages contiennent encore des emplacements d’images à remplacer.</p>}
          </aside>
        </div>
      </Section>
    </>
  );
}

function Numero() {
  return (
    <>
      <section className="bg-[#1a1714] text-[#f7f1e6]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex justify-center lg:justify-start">
            <Couverture petite />
          </div>
          <div>
            <p className="kicker text-[#e5a220]">Numéro 001</p>
            <h1 className="mt-3 font-serif text-[2.1rem] font-bold leading-[1.05] sm:text-5xl">Mythologies africaines et pensée philosophique</h1>
            <p className="mt-6 max-w-2xl font-serif text-xl italic leading-relaxed text-[#f7f1e6]/85">
              Que nous apprennent les récits de fondation sur la manière dont une société comprend le monde, transmet une mémoire et justifie ses institutions ?
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`${B}/lire/001`} className="inline-flex items-center gap-2 bg-[#c8461f] px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#e5a220] hover:text-[#1a1714]">
                Feuilleter en ligne →
              </a>
              <a href={`${B}/acheter`} className="inline-flex items-center gap-2 border border-[#f7f1e6]/30 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-[#f7f1e6] transition-colors hover:bg-[#f7f1e6] hover:text-[#1a1714]">
                Disponibilité et tarifs →
              </a>
            </div>
          </div>
        </div>
      </section>
      <Section site={S} kicker="Le dossier" titre="Philosophie, anthropologie, critique des récits">
        <Texte>
          <p>
            Coordonné par Robby Mandiangu et Yannick Essengue, le dossier s’appuie sur les journées MAPP des 29 et 30 avril 2025. Il croise philosophie, anthropologie, critique des récits et lectures du présent.
          </p>
        </Texte>
        <Boutons site={S} liens={[[`${B}/dossier`, 'Lire les repères et les huit notices']]} />
      </Section>
      <Html html={ancien('numero-1')} />
      <Html html={ancien('numero-2')} />
      <Html html={ancien('numero-3')} />
      <Section site={S} doux kicker="Dans les archives du Groupe" titre="Deux rencontres à relire">
        <div className="grid gap-4 md:grid-cols-2">
          <Repere site={S} date="12–14 octobre 2026 · En ligne" titre="Fabien Eboussi Boulaga interculturel ?" texte="Colloque rattaché à l’Université Toulouse – Jean Jaurès autour du dialogue entre les lieux de la pensée." href="/colloque-eboussi" />
          <Repere site={S} date="21 octobre 2026 · Aubervilliers" titre="Palabre autour de Jean Godefroy Bidima" texte="Journée d’étude autour des leçons de biopolitique et des épreuves de la démocratie." href="/recherche/appels-a-contributions" />
        </div>
        <Boutons site={S} liens={[['/actualites', 'Consulter les actualités du Groupe', true]]} />
      </Section>
    </>
  );
}

function Dossier() {
  return (
    <>
      <Ouverture site={S} kicker="Dossier MAPP" titre="Le dossier MAPP" chapeau="Des récits d’origine aux usages politiques du mythe, les journées MAPP ont ouvert plusieurs voies de lecture." />
      <Section site={S} kicker="Trois questions" titre="Trois questions pour lire le dossier">
        <Cartes
          site={S}
          items={[
            { numero: '01', titre: 'Que fait le récit à la raison ?', texte: 'Un récit relie des phénomènes, rend le monde familier et propose une manière de l’interpréter. Quels critères permettent d’éprouver ces liens ?' },
            { numero: '02', titre: 'Comment articuler mythos, logos et pathos ?', texte: 'Récit, argument et affect se croisent dans une même expérience. Le dossier s’intéresse à leurs fonctions dans la formation d’un jugement.' },
            { numero: '03', titre: 'À qui profite un récit fondateur ?', texte: 'Un récit peut ouvrir un espace de transmission ou fournir une justification à des hiérarchies. L’interprétation examine ces deux usages dans leurs contextes.' },
          ]}
        />
      </Section>
      <Section site={S} doux kicker="29 et 30 avril 2025" titre="Les journées des 29 et 30 avril 2025">
        <Texte>
          <p>
            Conférences principales de Mahamadé Savadogo et Benoît Okolo Okonda. Quatre panels : Rationalité(s) critique(s), Transculturalités, Mythocritique, Mythologie et philosophie africaine.
          </p>
          <p>
            Bienvenue : Robby Mandiangu et Yannick Essengue. Interventions invitées : Émile Kenmogne, Elvis Steeve Ella, Marie-Anne Paveau et Désiré Médégnon.
          </p>
        </Texte>
      </Section>
      <Html html={ancien('numero-5')} />
      <Html html={ancien('numero-4')} />
      <div className="mx-auto max-w-6xl px-6 pb-12">
        <Boutons site={S} liens={[[`${B}/numero-001`, 'Revenir au numéro', true], [`${B}/lire/001`, 'Feuilleter le magazine']]} />
      </div>
    </>
  );
}

function Rubriques() {
  return (
    <>
      <Ouverture site={S} kicker="Rubriques" titre="Dix manières d’entrer dans le magazine" chapeau="Retrouvez les entrées du magazine et les premières pistes de lecture." />
      <Section site={S} titre="Les rubriques">
        <Cartes site={S} items={RUBRIQUES.map(([titre, texte], i) => ({ numero: String(i + 1).padStart(2, '0'), titre, texte }))} />
      </Section>
      <Section site={S} doux kicker="En cours" titre="Les nouvelles">
        <Texte>
          <p>
            Nous voulons dans cette rubrique présenter les actualités philosophiques sur et autour de la philosophie et des philosophes africains et non africains ayant pour centre l’Afrique philosophique.
          </p>
        </Texte>
        <Boutons site={S} liens={[['/actualites', 'Lire les actualités du Groupe']]} />
      </Section>
    </>
  );
}

const OBJECTIFS = [
  'Rapprocher l’acte philosophique de l’expérience immédiate',
  'Rendre compte des dynamiques philosophiques liées à l’Afrique',
  'Rendre plus accessibles les initiatives de recherche philosophique de l’Afrique et de sa diaspora',
  'Accompagner les initiatives de recherche et de publication sur la philosophie africaine',
  'Renforcer les initiatives interdisciplinaires de recherche sur la réalité africaine',
  'Penser (avec) notre temps',
  'Explorer la richesse culturelle, artistique et esthétique africaine',
  'Travailler à la consolidation d’une conscience noire',
  'Interroger et investir les lieux communs de l’imaginaire africain',
  'Voir et faire voir les philosophes africains',
];

function APropos() {
  return (
    <>
      <Ouverture site={S} kicker="À propos" titre="Pourquoi un magazine de philosophie ? De philosophie africaine ?" chapeau="Les questions philosophiques prennent forme aussi dans un récit, une scène de la vie publique, une œuvre ou une conversation." />
      <Section site={S} kicker="Manifeste" titre="Du philosophique au philosophant 2.0">
        <Texte>
          <p>
            La philosophie selon une conception « sérieuse » se veut avant tout un exercice austère et qui rime avec une certaine gravité dans l’acte de pensée et donc dans le propos. L’image classique du (et non pas de la) philosophe est malheureusement celle d’un sujet suffisamment mortifié pour faire de son existence immédiate une mise en épochè. Il y a en effet dans les manières philosophiques d’écrire et d’écriture un certain nombre de principes « sacrés » visant à sauvegarder la scientificité d’un type de savoir déjà problématique du fait de son abstraction. Le concept en soi y est pour quelque chose. Ce n’est donc pas sans surprise si les canons classiques de transmission du philosopher ne sont ni le jeu, ni le dilettantisme, ni un certain « laisser-aller ». De cela il ressort que ceux qui ont essayé de jouer tout en ne jouant pas ont rarement échappé à un destin tragique.
          </p>
          <p>
            La tradition africaine, pour ce qui la concerne, a très vite su tirer sa part de sérieux inhérent aux jeux sociaux en tant que lieu de socialisation, de passage, d’apprentissage, de développement de la stratégie et même de régulation des rapports sociaux <em>ad intra</em> et <em>ad extra</em>.
          </p>
          <p>
            Philo Africaine Magazine, en voulant prendre au sérieux la philosophie et la philosophie africaine, voudrait ouvrir des espaces en s’ouvrant à une manière non pas moins philosophique de philosopher au quotidien. Rapprocher l’acte philosophique de l’expérience immédiate, c’est aussi faire le passage du philosophique au philosophant 2.0. C’est aussi donner à voir ces nombreuses figures qui, dans l’ombre, font et défont souvent l’histoire des histoires de la philosophie africaine.
          </p>
        </Texte>
      </Section>
      <Section site={S} doux kicker="Le chant du coq" titre="Quelques objectifs">
        <ol className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
          {OBJECTIFS.map((o, i) => (
            <li key={o} className="flex gap-4 border-b border-[#1a1714]/10 pb-3">
              <span className="w-7 shrink-0 font-serif text-xl leading-none text-[#c8461f]">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[0.98rem] leading-snug text-[#1a1714]">{o}</span>
            </li>
          ))}
        </ol>
      </Section>
      <Html html={ancien('magazine-4')} />
      <Section site={S} kicker="Notre démarche" titre="Notre démarche">
        <Texte>
          <p>Philo Africaine Magazine prend ces expériences comme point de départ. Il s’adresse aux lecteurs curieux, aux étudiants, aux enseignants et aux chercheurs, en Afrique et dans les diasporas.</p>
          <p>
            Nous voulons rendre visibles les philosophes africains et leurs lieux de travail, faire circuler les recherches, ouvrir le dialogue entre disciplines, lire les œuvres et les arts, approfondir la réflexion sur la conscience noire et examiner les imaginaires qui orientent la vie collective.
          </p>
        </Texte>
      </Section>
      <Html html={ancien('magazine-2')} />
      <Html html={ancien('magazine-7')} />
      <Section site={S} doux kicker="Deux revues du Groupe" titre="Deux revues du Groupe">
        <Cartes
          site={S}
          colonnes={2}
          items={[
            { titre: 'Revue JOGOO', texte: 'Publie des recherches en philosophie africaine et en culture.', href: '/sous-sites/revue-jogoo' },
            { titre: 'Eboussi Studies', texte: 'Consacrée à Fabien Eboussi Boulaga et aux recherches suscitées par son œuvre.', href: '/sous-sites/eboussi-studies' },
          ]}
        />
        <Boutons site={S} liens={[[`mailto:${S.email}?subject=Philo%20Africaine%20Magazine`, 'Contacter la rédaction']]} />
      </Section>
    </>
  );
}

function Contribuer() {
  return (
    <>
      <Ouverture site={S} kicker="Contribuer" titre="Proposer un article" chapeau="Partez d’une question, d’un événement ou d’une œuvre et indiquez le lectorat auquel vous souhaitez vous adresser." />
      <Section site={S} kicker="Cinq formats" titre="Cinq formats">
        <Cartes
          site={S}
          items={[
            { numero: '01', titre: 'Reportage ou compte rendu', texte: 'Sur un événement philosophique : conférence, débat, soutenance, colloque…' },
            { numero: '02', titre: 'Entretien', texte: 'Avec une personnalité des arts, des lettres ou de la culture.' },
            { numero: '03', titre: 'Chronique d’actualité', texte: 'Une réflexion sur un événement présent ou à venir.' },
            { numero: '04', titre: 'Billet ou note explicative', texte: 'Critique, explicative ou humoristique, toujours pour donner à penser.' },
            { numero: '05', titre: 'Critique', texte: 'De livre, de film, de chanson ou d’œuvre d’art, en rapport avec la culture africaine.' },
          ]}
        />
      </Section>
      <Section site={S} doux kicker="Préparer l’envoi" titre="Préparer l’envoi">
        <div className="grid gap-10 lg:grid-cols-2">
          <Texte>
            <p>Donnez au texte un titre, un sous-titre et un chapô. Ouvrez sur un fait ou une question précise. Organisez le développement avec des intertitres et soignez la conclusion.</p>
            <p>
              Joignez votre texte, indiquez la rubrique proposée et ajoutez vos coordonnées dans le courriel. Préparez une version anonymisée pour l’évaluation par le comité scientifique.
            </p>
          </Texte>
          <div className="border-l-2 border-[#c8461f] bg-white p-6">
            <p className="kicker text-[#c8461f]">Un article de magazine</p>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              Il suit l’écriture journalistique, avec les exigences de la philosophie : favoriser l’accès à l’information, susciter l’esprit critique et la prise de recul, s’assurer de la fiabilité des informations, intégrer l’analyse au-delà des faits.
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
              Il répond aux questions : qui ? quoi ? où ? quand ? pourquoi ? comment ? combien ? Ses articulations : titre, sous-titre, chapeau ; une attaque courte ; un développement en sous-parties avec intertitres ; une chute qui conclut.
            </p>
          </div>
        </div>
        <Boutons site={S} liens={[[`mailto:${S.email}?subject=${encodeURIComponent('Proposition d’article — Philo Africaine Magazine')}`, 'Écrire à la rédaction']]} />
      </Section>
      <Html html={ancien('magazine-8')} />
    </>
  );
}

function Acheter() {
  return (
    <>
      <Ouverture site={S} kicker="Acheter et s’abonner" titre="Commander le magazine" chapeau="Le numéro inaugural est en préparation. Écrivez à la rédaction pour connaître la disponibilité et les modalités de commande." />
      <Section site={S} kicker="Tarifs annoncés" titre="Tarifs annoncés">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['3 000 FCFA', 'Papier · Afrique', 'Prix annoncé par numéro.'],
            ['5 € / 5 $', 'Papier · Europe / États-Unis', 'Prix annoncé par numéro.'],
            ['2 €', 'Numérique', 'Prix annoncé pour la version électronique.'],
          ].map(([prix, k, t]) => (
            <div key={k} className="flex flex-col border border-ink/12 bg-white p-6">
              <p className="kicker text-[#c8461f]">{k}</p>
              <p className="mt-3 font-serif text-4xl font-bold leading-none text-[#1a1714]">{prix}</p>
              <p className="mt-3 text-sm text-ink-soft">{t}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section site={S} doux kicker="Parutions et abonnements" titre="Parutions et abonnements">
        <Texte>
          <p>Pour être averti de la parution du numéro 001 ou vous renseigner sur les abonnements, écrivez à la rédaction.</p>
        </Texte>
        <Boutons
          site={S}
          liens={[
            [`mailto:${S.email}?subject=${encodeURIComponent('Philo Africaine Magazine — commande et abonnement')}`, 'Se renseigner par courriel'],
            ['https://wa.me/242064459909', 'Écrire sur WhatsApp', true],
          ]}
        />
      </Section>
    </>
  );
}

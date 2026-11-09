import { notFound } from 'next/navigation';
import { MAGAZINE as S } from '@/lib/sous-sites';
import { Bandeau, Pied, Ouverture, Section, Texte, Boutons, Cartes, Repere, Contact } from '@/components/SousSite';

const B = S.base;
const PAGES = ['', 'numero-001', 'dossier', 'rubriques', 'a-propos', 'contribuer', 'acheter'] as const;
const TITRES: Record<string, string> = {
  '': 'Philo Africaine Magazine',
  'numero-001': 'Numéro 001 — Mythologies africaines et pensée philosophique',
  dossier: 'Le dossier MAPP',
  rubriques: 'Les rubriques',
  'a-propos': 'Pourquoi un magazine de philosophie ?',
  contribuer: 'Proposer un article',
  acheter: 'Acheter et s’abonner',
};

export function generateStaticParams() {
  return PAGES.map((p) => ({ page: p ? [p] : [] }));
}

export async function generateMetadata({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  return TITRES[p] ? { title: p ? `${TITRES[p]} · Philo Africaine Magazine` : 'Philo Africaine Magazine', description: 'Du philosophique au philosophant 2.0. Magazine semestriel de philosophie du Groupe JOGOO.' } : {};
}

const NOTICES: { n: string; titre: string; auteurs: string; texte: string; photos: string[] }[] = [
  { n: '01', titre: 'Mythologies négro-africaines et rationalité philosophique', auteurs: 'Hervé Marius Benoit Amenguele Nyimi et Ingrid Selva Madounyem', texte: 'À partir de plusieurs traditions cosmogoniques, les auteurs reviennent sur les transformations historiques du rapport entre récits, concepts et savoirs scientifiques.', photos: ['amenguele-nyimi', 'madounyem'] },
  { n: '02', titre: 'Répondre à la crise de la raison', auteurs: 'Mahamadé Savadogo', texte: 'L’intervention distingue le rôle politique des mythes de leur prétention à expliquer le monde. Elle cherche dans le débat public et l’accès partagé au pouvoir les conditions d’une rationalité commune.', photos: ['savadogo'] },
  { n: '03', titre: 'Mythologies africaines : à la recherche de sens et d’intelligibilité', auteurs: 'Bouhssine Sidi Mohamed', texte: 'Des récits transmis aux œuvres qui les réinterprètent, la communication examine les conditions d’une lecture critique attentive à la diversité des contextes.', photos: ['sidi-mohamed'] },
  { n: '04', titre: 'Le problème idéologique dans le procès du mythe chez Marcien Towa', auteurs: 'Ramsès Nzenti Kopa', texte: 'La lecture de Towa fait apparaître une tension entre la critique du récit sacré, son rôle pédagogique et le recours à une idéologie politique.', photos: [] },
  { n: '05', titre: 'Le corps vécu comme matrice de sens mythique : approche phénoménologique', auteurs: 'Nadia Chafai et Oumaima Sriti', texte: 'Le récit d’Uncama sert de point de départ à une réflexion sur l’orientation du corps, l’épreuve de la vulnérabilité et le passage initiatique.', photos: ['sriti'] },
  { n: '06', titre: 'Les mythes fondateurs du Maghreb et l’imaginaire des jeunes', auteurs: 'Nabila El Fahmy', texte: 'Comment raconter aujourd’hui les figures de Kahina, Jugurtha et Antée ? La communication examine les médiations contemporaines qui renouvellent leur transmission.', photos: ['el-fahmy'] },
  { n: '07', titre: 'Au-delà de l’anthropocentrisme, du biocentrisme et du cosmocentrisme : l’universisme comme philosophie africaine de l’écologie', auteurs: 'Ignace Bertrand Tchinemang', texte: 'L’intervention discute plusieurs philosophies de l’écologie et explore une approche relationnelle à partir du paradigme du croisement.', photos: ['se-ankh'] },
  { n: '08', titre: 'Le mythe d’avènement des Ñoole dans la culture wolof : enjeux de la stratification sociale', auteurs: 'Ibou Dramé Sylla', texte: 'La communication distingue l’explication historique de la stratification sociale du récit d’origine qui contribue à justifier la place attribuée aux Ñoole.', photos: ['ibou-drame-sylla'] },
];

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

/** Couverture typographique du numéro en cours. */
function Couverture({ petite = false }: { petite?: boolean }) {
  return (
    <a
      href={`${B}/numero-001`}
      className={`group relative flex aspect-[210/275] w-full flex-col justify-between overflow-hidden bg-[#1a1714] p-6 text-[#f7f1e6] shadow-[0_30px_60px_-25px_rgba(26,23,20,0.6)] transition-transform duration-500 hover:-rotate-1 hover:scale-[1.01] ${petite ? 'max-w-[15rem]' : 'max-w-sm'}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 opacity-25 transition-opacity duration-500 group-hover:opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #e5a220 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg, #c8461f 0 2px, transparent 2px 14px)',
        }}
      />
      <span className="absolute inset-0 bg-gradient-to-b from-[#1a1714]/40 via-transparent to-[#1a1714]" aria-hidden="true" />
      <span className="relative">
        <img alt="Philo Africaine Magazine" src="/medias/site/jogoo/logo-philo-africaine-magazine-sombre.png" className="-ml-3 w-[85%] mix-blend-lighten" />
      </span>
      <span className="relative">
        <span className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#e5a220]">Numéro 001 · Dossier</span>
        <span className={`mt-2 block font-serif font-bold leading-[1.05] ${petite ? 'text-xl' : 'text-[1.75rem]'}`}>Mythologies africaines et pensée philosophique</span>
        <span className="mt-3 block h-1 w-12 bg-[#c8461f]" aria-hidden="true" />
      </span>
    </a>
  );
}

export default async function Magazine({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  if (!(PAGES as readonly string[]).includes(p)) notFound();

  return (
    <>
      <Bandeau site={S} actif={p} />
      {p === '' && <Accueil />}
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

function Accueil() {
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
            <Boutons site={S} liens={[[`${B}/numero-001`, 'Explorer le n° 001'], [`${B}/contribuer`, 'Proposer un article', true]]} />
          </div>
          <div className="flex justify-center lg:justify-end">
            <Couverture />
          </div>
        </div>
      </section>
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
          </div>
        </div>
      </section>
      <Section site={S} kicker="Le dossier" titre="Philosophie, anthropologie, critique des récits">
        <Texte>
          <p>
            Coordonné par Robby Mandiangu et Yannick Essengue, le dossier s’appuie sur les journées MAPP des 29 et 30 avril 2025. Il croise philosophie, anthropologie, critique des récits et lectures du présent.
          </p>
        </Texte>
        <Boutons site={S} liens={[[`${B}/dossier`, 'Lire les repères et les huit notices'], [`${B}/acheter`, 'Disponibilité et tarifs', true]]} />
      </Section>
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
        <div className="mt-8">
          <Cartes
            site={S}
            colonnes={4}
            items={[
              { surtitre: 'Panel 1', titre: 'Rationalité(s) critique(s)', texte: 'Charles Romain Mbele, Cheikh Moctar Ba, Thoutmosis Ndi et Jules Marie Tsanga.' },
              { surtitre: 'Panel 2', titre: 'Transculturalités', texte: 'Philippe Nguemeta et Raïssa Biyada, Erik Beck’s Awoumou, Joseph Owona-Ntsama, Ignace Bertrand Tchinemang et Ibou Dramé Sylla.' },
              { surtitre: 'Panel 3', titre: 'Mythocritique', texte: 'Nadia Chafai et Oumaima Sriti, Adama Sidibe, Bouhssine Sidi Mohamed et Nabila El Fahmy.' },
              { surtitre: 'Panel 4', titre: 'Mythologie et philosophie africaine', texte: 'Ramsès Nzenti Kopa et Ouédraogo Toudebson.' },
            ]}
          />
        </div>
      </Section>
      <Section site={S} kicker="Les communications" titre="Huit notices de communication">
        <ol className="divide-y divide-ink/10 border-y border-ink/10">
          {NOTICES.map((n) => (
            <li key={n.n} className="grid gap-4 py-6 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-start">
              <span className="font-serif text-3xl leading-none text-[#c8461f]/60">{n.n}</span>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-bold leading-snug text-[#1a1714]">{n.titre}</h3>
                <p className="mt-1 font-brand text-sm font-semibold text-[#c8461f]">{n.auteurs}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{n.texte}</p>
              </div>
              {n.photos.length > 0 && (
                <div className="flex gap-2 sm:justify-end">
                  {n.photos.map((ph) => (
                    <img key={ph} alt="" src={`/medias/site/jogoo/pam/${ph}.jpg`} loading="lazy" className="h-20 w-16 border border-ink/10 object-cover object-top grayscale" />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
        <Boutons site={S} liens={[[`${B}/numero-001`, 'Revenir au numéro', true]]} />
      </Section>
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
    </>
  );
}

function APropos() {
  return (
    <>
      <Ouverture site={S} kicker="À propos" titre="Pourquoi un magazine de philosophie ?" chapeau="Les questions philosophiques prennent forme aussi dans un récit, une scène de la vie publique, une œuvre ou une conversation." />
      <Section site={S} kicker="Notre démarche" titre="Notre démarche">
        <Texte>
          <p>Philo Africaine Magazine prend ces expériences comme point de départ. Il s’adresse aux lecteurs curieux, aux étudiants, aux enseignants et aux chercheurs, en Afrique et dans les diasporas.</p>
          <p>
            Nous voulons rendre visibles les philosophes africains et leurs lieux de travail, faire circuler les recherches, ouvrir le dialogue entre disciplines, lire les œuvres et les arts, approfondir la réflexion sur la conscience noire et examiner les imaginaires qui orientent la vie collective.
          </p>
        </Texte>
      </Section>
      <Section site={S} doux kicker="Fiche technique" titre="Le magazine en bref">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Périodicité', 'Semestriel, en version papier et numérique'],
            ['Format', '210 × 275 mm, autour de 100 pages'],
            ['Éditeur', 'Groupe JOGOO – Philosophie africaine. Débats & Questions'],
          ].map(([k, v]) => (
            <div key={k} className="border-t-2 border-[#c8461f] bg-white p-5">
              <p className="kicker text-[#c8461f]">{k}</p>
              <p className="mt-2 font-serif text-lg leading-snug text-[#1a1714]">{v}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section site={S} kicker="L’équipe" titre="L’équipe">
        <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {[
            ['Rédaction en chef', 'Yannick Essengue'],
            ['Rédaction', 'Sandrine Kongoue · Edith Ekodo Mvondo · Kokoré Koffi Dramane · Robby Mandiangu'],
            ['Direction technique', 'Laurence Lema Ngamga · Nemy Bingan David'],
            ['Communication et marketing', 'Gaëlle Magne · Jean Paul Sade · Stelle Carine Alima · Laurence Lema Ngamga'],
          ].map(([r, n]) => (
            <div key={r} className="border-l-2 border-[#e5a220] pl-4">
              <dt className="kicker text-[#c8461f]">{r}</dt>
              <dd className="mt-1 font-brand font-semibold leading-snug text-[#1a1714]">{n}</dd>
            </div>
          ))}
        </dl>
      </Section>
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
            { numero: '01', titre: 'Reportage ou compte rendu', texte: 'D’une rencontre philosophique.' },
            { numero: '02', titre: 'Entretien' },
            { numero: '03', titre: 'Chronique d’actualité' },
            { numero: '04', titre: 'Billet ou note explicative' },
            { numero: '05', titre: 'Critique', texte: 'De livre, de film, de chanson ou d’œuvre d’art.' },
          ]}
        />
      </Section>
      <Section site={S} doux kicker="Préparer l’envoi" titre="Préparer l’envoi">
        <Texte>
          <p>Donnez au texte un titre, un sous-titre et un chapô. Ouvrez sur un fait ou une question précise. Organisez le développement avec des intertitres et soignez la conclusion.</p>
          <p>
            Joignez votre texte, indiquez la rubrique proposée et ajoutez vos coordonnées dans le courriel. Préparez une version anonymisée pour l’évaluation par le comité scientifique.
          </p>
        </Texte>
        <Boutons site={S} liens={[[`mailto:${S.email}?subject=${encodeURIComponent('Proposition d’article — Philo Africaine Magazine')}`, 'Écrire à la rédaction']]} />
      </Section>
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

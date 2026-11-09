import { notFound } from 'next/navigation';
import { SANKOFA as S } from '@/lib/sous-sites';
import { Bandeau, Pied, Ouverture, Section, Texte, Boutons, Repere, Contact } from '@/components/SousSite';
import { Devis } from '@/components/Devis';

const B = S.base;
const PAGES = ['', 'agence', 'services', 'realisations', 'devis'] as const;
const TITRES: Record<string, string> = {
  '': 'Sankofa Communications',
  agence: 'Revenir aux sources pour préparer la suite',
  services: 'Services',
  realisations: 'Rencontres et ressources du Groupe',
  devis: 'Demander un devis',
};

export function generateStaticParams() {
  return PAGES.map((p) => ({ page: p ? [p] : [] }));
}

export async function generateMetadata({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  return TITRES[p] ? { title: p ? `${TITRES[p]} · Sankofa Communications` : 'Sankofa Communications', description: 'L’Afrique du futur. Communication au service de la recherche : événementiel scientifique, création visuelle, traduction.' } : {};
}

const SERVICES: { id: string; titre: string; accroche: string; texte: string; icone: string }[] = [
  {
    id: 'evenementiel',
    titre: 'Événementiel scientifique',
    accroche: 'Pour les colloques, journées d’étude, conférences et rencontres hybrides.',
    texte: 'Construction du calendrier, préparation des communications aux intervenants et au public, supports d’inscription et coordination des besoins de diffusion. L’étendue de l’accompagnement se définit pour chaque rencontre.',
    icone: 'M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm3 7h3v3H8z',
  },
  {
    id: 'creation',
    titre: 'Création visuelle et web',
    accroche: 'Des supports cohérents, de l’annonce au programme final.',
    texte: 'Affiches, programmes, badges, kakémonos, visuels pour les réseaux sociaux et pages d’événements. Indiquez la charte disponible, les dimensions, les fichiers attendus et les échéances d’impression ou de publication.',
    icone: 'M4 5h16v11H4zM8 20h8M12 16v4M7 12l3-3 2 2 3-3 2 2',
  },
  {
    id: 'traduction',
    titre: 'Traduction et interprétariat',
    accroche: 'Pour les textes scientifiques et la communication des rencontres.',
    texte: 'Précisez la langue source et la langue cible, la discipline, le volume, le support et l’échéance. Pour une intervention orale, ajoutez le mode de participation et la durée. La faisabilité est établie lors du devis.',
    icone: 'M4 5h8M8 3v2M6 5c0 4 2 7 5 8M10 5c0 3-2 6-6 8M13 21l4-9 4 9M14.5 18h5',
  },
  {
    id: 'edition',
    titre: 'Assistance à l’édition',
    accroche: 'Préparation et mise en forme de documents scientifiques et institutionnels.',
    texte: 'Relecture, harmonisation des documents et préparation des supports de diffusion, selon le besoin. Transmettez la charte éditoriale, un extrait et les formats de sortie attendus.',
    icone: 'M6 3h9l3 3v15H6zM14 3v4h4M9 12h6M9 16h6',
  },
  {
    id: 'numerique',
    titre: 'Campagnes et communication numérique',
    accroche: 'Structurer la diffusion d’une publication, d’un appel ou d’un événement.',
    texte: 'Direction artistique, campagnes, régie publicitaire et animation des réseaux selon le projet. Décrivez le public, les canaux déjà utilisés, les échéances et les éléments disponibles.',
    icone: 'M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
  },
];

const Icone = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default async function Sankofa({ params }: { params: Promise<{ page?: string[] }> }) {
  const p = (await params).page?.join('/') ?? '';
  if (!(PAGES as readonly string[]).includes(p)) notFound();
  return (
    <>
      <Bandeau site={S} actif={p} />
      {p === '' && <Accueil />}
      {p === 'agence' && <Agence />}
      {p === 'services' && <Services />}
      {p === 'realisations' && <Realisations />}
      {p === 'devis' && <PageDevis />}
      {p !== 'devis' && (
        <section className="bg-[#e20613] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-brand text-lg font-bold">Un colloque, une affiche, une traduction à préparer ?</p>
            <a href={`${B}/devis`} className="inline-flex w-fit items-center gap-2 bg-white px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-[#e20613] transition-colors hover:bg-[#3d3d3a] hover:text-white">
              Demander un devis →
            </a>
          </div>
        </section>
      )}
      <div className="h-14" />
      <Contact site={S} texte="Sankofa Communications · philoafricaine@gmail.com · WhatsApp du Groupe JOGOO +242 06 445 99 09." whatsapp />
      <Pied site={S} />
      {/* Bouton WhatsApp toujours visible */}
      <a
        href="https://wa.me/242064459909"
        target="_blank"
        rel="noreferrer"
        aria-label="Écrire à Sankofa Communications sur WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_25px_-8px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 print:hidden"
      >
        <svg width="28" height="28" viewBox="0 0 26 26" fill="currentColor" aria-hidden="true">
          <path d="M13 3a10 10 0 0 0-8.6 15.1L3 23l5-1.3A10 10 0 1 0 13 3Zm5.4 13.8c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.6-.8-3.1-1.2-5-4.4-5.2-4.6-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .6l-.4.6c-.2.2-.4.4-.1.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.8.4.2.6.2.8-.1l.9-1.1c.2-.3.4-.2.7-.1l2.2 1c.3.2.5.2.6.4 0 .1 0 .7-.3 1.2Z" />
        </svg>
      </a>
    </>
  );
}

function Accueil() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#f3f3f1]">
        <span aria-hidden="true" className="pointer-events-none absolute -right-40 -top-6 hidden h-[22rem] w-[44rem] overflow-hidden opacity-[0.08] lg:block">
          <img alt="" src="/medias/site/jogoo/logo-sankofa-full.png" className="w-full" />
        </span>
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="kicker text-[#e20613]">L’Afrique du futur.</p>
          <h1 className="mt-3 max-w-3xl font-brand text-[2.3rem] font-extrabold leading-[1.02] text-[#3d3d3a] sm:text-6xl">Faire connaître un travail de recherche</h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
            Sankofa Communications accompagne les équipes qui doivent annoncer une rencontre, rendre un programme lisible ou faire circuler une publication. L’agence s’adresse aux universités, laboratoires, associations savantes, chercheurs et éditeurs.
          </p>
          <Boutons site={S} liens={[[`${B}/devis`, 'Demander un devis'], [`${B}/services`, 'Explorer les services', true]]} />
        </div>
      </section>
      <Section site={S} kicker="Services" titre="Ce que fait l’agence">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((s) => (
            <a key={s.id} href={`${B}/services#${s.id}`} className="group flex flex-col border border-ink/12 bg-white p-5 transition-colors hover:border-[#e20613]">
              <span className="flex h-11 w-11 items-center justify-center bg-[#e20613]/10 text-[#e20613] transition-colors group-hover:bg-[#e20613] group-hover:text-white">
                <Icone d={s.icone} />
              </span>
              <span className="mt-4 font-brand text-[0.95rem] font-bold leading-snug text-[#3d3d3a]">{s.titre}</span>
              <span className="mt-2 text-sm leading-relaxed text-ink-soft">{s.accroche}</span>
            </a>
          ))}
        </div>
      </Section>
      <Section site={S} doux kicker="Réalisations" titre="Rencontres et ressources du Groupe">
        <Rencontres />
      </Section>
    </>
  );
}

function Rencontres() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Repere site={S} date="29–30 avril 2025" titre="Journées MAPP" texte="Un programme de conférences et de panels autour des mythologies africaines et de la pensée philosophique." href="/sous-sites/philo-africaine-magazine/dossier" />
        <Repere site={S} date="12–14 octobre 2026" titre="Colloque Fabien Eboussi Boulaga" texte="Une rencontre internationale en ligne autour des lieux de la pensée et de l’interculturalité." href="/colloque-eboussi" />
        <Repere site={S} date="21 octobre 2026" titre="Palabre autour de Jean Godefroy Bidima" texte="Une journée d’étude à Aubervilliers sur la biopolitique et les épreuves de la démocratie." href="/recherche/appels-a-contributions" />
      </div>
      <Boutons site={S} liens={[[`${B}/devis`, 'Échanger sur votre événement']]} />
    </>
  );
}

function Agence() {
  return (
    <>
      <Ouverture site={S} kicker="L’agence" titre="Revenir aux sources pour préparer la suite" chapeau="Sankofa Communications inscrit son travail dans la vie scientifique et culturelle du Groupe JOGOO." />
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 sm:py-14 lg:grid-cols-[0.7fr_1.3fr]">
          <img alt="Le symbole Sankofa : un oiseau qui avance la tête tournée vers l’arrière" src="/medias/site/jogoo/logo-sankofa-full.png" className="mx-auto w-full max-w-xs" />
          <div>
            <p className="kicker text-[#e20613]">Le nom Sankofa</p>
            <h2 className="mt-2 font-brand text-2xl font-extrabold leading-tight text-[#3d3d3a] sm:text-3xl">Le nom Sankofa</h2>
            <Texte className="mt-6">
              <p>
                Le symbole adinkra issu de la culture akan figure un oiseau qui avance la tête tournée vers l’arrière. Cette image donne son sens au projet : relire les ressources du passé pour concevoir les supports dont la recherche a besoin aujourd’hui.
              </p>
              <p>
                Le mot vient de la culture akan d’Afrique de l’Ouest. Dans les symboles adinkra, il signifie « retour aux sources » : <strong>SAN</strong> (retourne), <strong>KO</strong> (va), <strong>FA</strong> (ramène). L’oiseau avance en regardant vers l’arrière, un œuf en son bec.
              </p>
              <p>
                Sankofa Communications prend sa source dans la dialectique africaine du passé et du futur : offrir une solution numérique africaine aux préoccupations africaines. S’il y a une « âme africaine », il y a aussi une manière africaine d’être, de sentir et d’habiter le monde.
              </p>
            </Texte>
          </div>
        </div>
      </section>
      <Section site={S} doux kicker="La méthode" titre="La méthode">
        <Texte>
          <p>
            Nous partons du public, des échéances et des usages concrets des livrables. Un programme à imprimer, une page de colloque et une traduction destinée à la publication demandent des préparations différentes. Le premier échange fixe le périmètre et les éléments à fournir.
          </p>
        </Texte>
        <Boutons site={S} liens={[[`${B}/devis`, 'Présenter votre projet']]} />
      </Section>
      <Section site={S} kicker="Projets en cours" titre="Projets en cours">
        <p className="max-w-3xl text-[1.02rem] leading-relaxed text-ink-soft">Pour installer l’agence dans la durée, trois chantiers sont en cours :</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {['Matériel informatique', 'Aménagement des bureaux et loyer pour un an', 'Allocations infographe et community manager (un an)'].map((x, i) => (
            <div key={x} className="border-t-2 border-[#e20613] bg-[#f3f3f1] p-5">
              <span className="font-brand text-2xl font-extrabold text-[#e20613]/40">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 font-brand font-bold leading-snug text-[#3d3d3a]">{x}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          Pour soutenir ces projets ou devenir partenaire :{' '}
          <a className="font-semibold text-[#e20613] underline underline-offset-2" href={`mailto:${S.email}?subject=Soutenir%20Sankofa%20Communications`}>
            {S.email}
          </a>
        </p>
      </Section>
    </>
  );
}

function Services() {
  return (
    <>
      <Ouverture site={S} kicker="Services" titre="Services" chapeau="Cinq domaines d’intervention, au service des équipes de recherche et des institutions.">
        <ul className="mt-8 flex flex-wrap gap-2">
          {['Solutions numériques, graphic & web design', 'Événementiel d’activités scientifiques', 'Assistance à l’édition, traductions et interprétariat', 'Régie publicitaire, campagnes, direction artistique', 'Digital marketing & community management'].map((x) => (
            <li key={x} className="border border-[#646460]/25 bg-white px-3 py-1.5 font-brand text-xs font-semibold text-[#3d3d3a]">
              {x}
            </li>
          ))}
        </ul>
      </Ouverture>
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
        <div className="space-y-4">
          {SERVICES.map((s, i) => (
            <article key={s.id} id={s.id} className="grid scroll-mt-24 gap-5 border border-ink/12 bg-white p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-8">
              <span className="flex h-14 w-14 items-center justify-center bg-[#e20613] text-white">
                <Icone d={s.icone} />
              </span>
              <div>
                <p className="kicker text-[#e20613]">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="mt-1 font-brand text-xl font-extrabold text-[#3d3d3a] sm:text-2xl">{s.titre}</h2>
                <p className="mt-2 font-serif text-lg italic text-ink/75">{s.accroche}</p>
                <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-ink-soft">{s.texte}</p>
                <a href={`${B}/devis`} className="mt-4 inline-block text-sm font-semibold text-[#e20613] hover:underline">
                  Demander un devis pour ce service →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function Realisations() {
  return (
    <>
      <Ouverture site={S} kicker="Réalisations" titre="Rencontres et ressources du Groupe" chapeau="Trois exemples de rencontres scientifiques documentées par le Groupe JOGOO." />
      <Section site={S} kicker="Dans les archives du Groupe" titre="Dans les archives du Groupe">
        <Rencontres />
      </Section>
    </>
  );
}

function PageDevis() {
  return (
    <>
      <Ouverture site={S} kicker="Demander un devis" titre="Demander un devis" chapeau="Décrivez le projet, le public et le calendrier. Le devis se précise à partir de ces éléments." />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <h2 className="font-brand text-xl font-extrabold text-[#3d3d3a]">Votre demande</h2>
          <div className="mt-5">
            <Devis email={S.email} />
          </div>
        </div>
        <aside className="space-y-5">
          <div className="border-t-2 border-[#e20613] bg-[#f3f3f1] p-5">
            <p className="kicker text-[#e20613]">Écrire directement</p>
            <a href={`mailto:${S.email}`} className="mt-2 block text-sm font-semibold text-[#3d3d3a] hover:underline">
              {S.email}
            </a>
            <a href="https://wa.me/242064459909" target="_blank" rel="noreferrer" className="mt-1 block text-sm font-semibold text-[#3d3d3a] hover:underline">
              WhatsApp du Groupe JOGOO
            </a>
          </div>
          <div className="border-t-2 border-[#646460] bg-[#f3f3f1] p-5">
            <p className="kicker text-[#646460]">Champs du devis</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Service souhaité, nom ou organisation, courriel, échéance, budget indicatif et description du projet. Les fichiers se joignent au brouillon depuis la messagerie.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

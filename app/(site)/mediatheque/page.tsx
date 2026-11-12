import { reader } from '@/lib/content';
import { EnTete } from '@/components/ui';
import { GrilleVideos } from '@/components/Lecteur';

export const metadata = { title: 'Médiathèque', description: 'Vidéos, podcasts, galeries et archives du Groupe JOGOO et du Fonds Eboussi Boulaga.' };

const F = '/medias/site/jogoo/fonds-eboussi';

// Les trois portes d'entrée : chaque carte porte son propre visuel
const UNE: { href: string; genre: string; titre: string; texte: string; action: string; image: string; contenir?: boolean; fond: string }[] = [
  {
    href: '/les-5-minutes-du-chant-du-coq',
    genre: 'Vidéo',
    titre: 'Les 5 minutes du chant du coq',
    texte: 'Un concept, un philosophe, cinq minutes.',
    action: 'Regarder',
    image: '/medias/site/jogoo/coq-penseur-gauche.png',
    contenir: true,
    fond: 'bg-[#140f0c]',
  },
  {
    href: '/podcasts',
    genre: 'Audio',
    titre: 'Écouter la philosophie africaine',
    texte: 'Lectures et extraits de Marcien Towa, avec descriptifs et références.',
    action: 'Écouter',
    image: '/medias/podcasts/couverture-podcast.jpg',
    fond: 'bg-ink',
  },
  {
    href: '/notre-histoire',
    genre: 'Galeries',
    titre: 'Notre histoire en images',
    texte: 'Affiches et photos des conférences, colloques et journées d’étude depuis 2010.',
    action: 'Parcourir',
    image: '/medias/histoire/cinquantenaire-essai-marcien-towa-2021/photo-23-v.jpg',
    fond: 'bg-terra-deep',
  },
];

const ARCHIVES: [string, string, string, string][] = [
  ['/sous-sites/fonds-eboussi-boulaga/galerie', 'Visages d’Eboussi', 'Portraits, illustrations et archives photographiques.', `${F}/eboussi-fauteuil-rouge-1.jpg`],
  ['/sous-sites/fonds-eboussi-boulaga/mediatheque', 'Archives audiovisuelles et presse', 'Entretiens filmés et dossiers de presse, dont Mosaïques n° 005.', `${F}/archive-mosaiques-015-068.jpg`],
  ['/sous-sites/fonds-eboussi-boulaga/bibliographie', 'L’œuvre de Fabien Eboussi Boulaga', 'Bibliographie complète, à consulter ou télécharger.', `${F}/eboussi-bibliotheque-900.jpg`],
];

export default async function Mediatheque() {
  const videos = (await reader.collections.videos.all()).sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));
  const rubriques: { nom: string; note?: string | null; liste: typeof videos }[] = [];
  for (const v of videos) {
    const nom = v.entry.rubrique || 'Vidéos';
    let r = rubriques.find((x) => x.nom === nom);
    if (!r) rubriques.push((r = { nom, note: v.entry.noteRubrique, liste: [] }));
    if (!r.note && v.entry.noteRubrique) r.note = v.entry.noteRubrique;
    r.liste.push(v);
  }
  const ancre = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const sommaire: [string, string][] = [['#a-la-une', 'À la une'], ...rubriques.map((r) => [`#${ancre(r.nom)}`, r.nom] as [string, string]), ['#archives', 'Archives du Fonds']];

  return (
    <>
      <EnTete kicker="Portail" titre="Médiathèque" intro="Vidéos, podcasts, galeries et archives du Groupe JOGOO et du Fonds Eboussi Boulaga." icone={null} />

      <nav aria-label="Rubriques de la médiathèque" className="border-b border-ink/10 bg-paper">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none]">
          {sommaire.map(([h, l]) => (
            <a key={h} href={h} className="shrink-0 border border-ink/15 px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-terra hover:bg-terra hover:text-white">
              {l}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-20 px-5 py-16">
        <section id="a-la-une" className="scroll-mt-24">
          <div className="grid gap-5 md:grid-cols-3">
            {UNE.map((c) => (
              <a key={c.href} href={c.href} className={`group relative flex min-h-[26rem] flex-col justify-end overflow-hidden ${c.fond} text-paper`}>
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.04] ${c.contenir ? 'object-contain object-top p-8 pb-40' : 'object-cover opacity-80 group-hover:opacity-95'}`}
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <span className="relative p-7">
                  <span className="font-brand text-sm font-semibold text-gold">{c.genre}</span>
                  <span className="mt-1 block font-brand text-2xl font-bold leading-tight text-white">{c.titre}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-paper/75">{c.texte}</span>
                  <span className="mt-5 inline-block border-b border-gold pb-0.5 font-brand text-xs font-bold uppercase tracking-[0.12em] text-gold transition-colors group-hover:text-white">
                    {c.action}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {rubriques.map((r) => (
          <section key={r.nom} id={ancre(r.nom)} className="scroll-mt-24">
            <div className="mb-8 flex flex-col gap-2 border-b border-ink/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="display-title text-3xl text-terra sm:text-4xl">{r.nom}</h2>
                {r.note && <p className="mt-2 max-w-xl font-serif text-[0.95rem] italic text-ink/60">{r.note}</p>}
              </div>
              <p className="shrink-0 text-sm text-ink/45">
                {r.liste.length} vidéo{r.liste.length > 1 ? 's' : ''}
              </p>
            </div>
            <GrilleVideos videos={r.liste.map((v) => ({ titre: v.entry.titre, url: v.entry.url ?? '' }))} />
          </section>
        ))}

        <section id="archives" className="scroll-mt-24">
          <div className="mb-8 border-b border-ink/10 pb-4">
            <h2 className="display-title text-3xl text-terra sm:text-4xl">Archives du Fonds Eboussi Boulaga</h2>
            <p className="mt-2 max-w-xl font-serif text-[0.95rem] italic text-ink/60">Le fonds documentaire consacré à Fabien Eboussi Boulaga, en cours de constitution.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {ARCHIVES.map(([h, t, d, img]) => (
              <a key={h} href={h} className="group block border border-ink/12 bg-white transition-colors hover:border-terra">
                <span className="block aspect-[4/3] overflow-hidden bg-cream">
                  <img src={img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                </span>
                <span className="block p-5">
                  <span className="block font-brand text-base font-bold leading-snug text-ink group-hover:text-terra">{t}</span>
                  <span className="mt-1 block text-sm leading-snug text-ink/60">{d}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

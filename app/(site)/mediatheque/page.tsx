import { reader } from '@/lib/content';
import { EnTete } from '@/components/ui';
import { Html } from '@/components/Html';
import { ListeVideos } from '@/components/Lecteur';
import { fragment } from '@/lib/gabarits';

export const metadata = { title: 'Médiathèque', description: 'Vidéos, audio & podcasts, galeries, documents & archives.' };

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
  return (
    <>
      <EnTete kicker="Portail · 6" titre="Médiathèque" intro="Vidéos · Audio & podcasts · Galeries · Documents & archives." icone={null} />
      <div className="mx-auto max-w-5xl px-5 py-16">
        <a href="/la-minute-du-chant-du-coq" className="group mb-4 flex flex-col items-start gap-5 bg-[#140f0c] p-6 text-paper transition-colors hover:bg-[#241c18] sm:flex-row sm:items-center sm:p-8">
          <img src="/medias/site/jogoo/coq-penseur-t.png" alt="" className="w-24 shrink-0 sm:w-28" />
          <span className="flex-1">
            <span className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Rubrique vidéo</span>
            <span className="mt-1 block font-brand text-2xl font-bold text-white">La minute du chant du coq</span>
            <span className="mt-1 block text-sm text-paper/65">Un concept, un philosophe, cinq minutes.</span>
          </span>
          <span className="font-brand text-xs font-bold uppercase tracking-[0.12em] text-gold transition-transform group-hover:translate-x-1">Regarder →</span>
        </a>
        <a href="/podcasts" className="group mb-14 flex flex-col items-start gap-5 bg-ink p-6 text-paper transition-colors hover:bg-[#241c18] sm:flex-row sm:items-center sm:p-8">
          <img src="/medias/podcasts/couverture-podcast.jpg" alt="" className="w-24 shrink-0 sm:w-28" />
          <span className="flex-1">
            <span className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Audio &amp; podcasts</span>
            <span className="mt-1 block font-brand text-2xl font-bold text-white">Écouter la philosophie africaine</span>
            <span className="mt-1 block text-sm text-paper/65">Lectures et extraits de Marcien Towa, avec descriptifs et références.</span>
          </span>
          <span className="font-brand text-xs font-bold uppercase tracking-[0.12em] text-gold group-hover:translate-x-1 transition-transform">Écouter →</span>
        </a>
        {rubriques.map((r) => (
          <section key={r.nom} className="mb-14">
            <div>
              <h2 className="display-title text-3xl text-terra sm:text-4xl">{r.nom}</h2>
              {r.note && <p className="mt-2 max-w-xl text-sm italic text-ink/60">{r.note}</p>}
            </div>
            <ListeVideos videos={r.liste.map((v) => ({ titre: v.entry.titre, url: v.entry.url ?? '' }))} />
          </section>
        ))}
        <Html html={fragment('mediatheque-avenir')} />
      </div>
    </>
  );
}

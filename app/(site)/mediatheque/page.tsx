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

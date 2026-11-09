import { reader } from '@/lib/content';
import { EnTete } from '@/components/ui';

export const metadata = { title: 'Médiathèque' };

export default async function Mediatheque() {
  const items = (await reader.collections.videos.all()).sort((a, b) => a.entry.ordre! - b.entry.ordre!);
  const rubriques = [...new Set(items.map((i) => i.entry.rubrique || 'Vidéos'))];
  return (
    <>
      <EnTete kicker="Écouter, voir" titre="Médiathèque" intro="Leçons, conférences et entretiens de philosophie africaine." />
      <div className="mx-auto max-w-7xl space-y-20 px-5 sm:px-8">
        {rubriques.map((r) => {
          const liste = items.filter((i) => (i.entry.rubrique || 'Vidéos') === r);
          return (
            <section key={r} className="grid gap-8 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-4">
                <h2 className="titre titre-l">{r}</h2>
                {liste[0]?.entry.noteRubrique && <p className="mt-3 font-serif italic text-ink-soft">{liste[0].entry.noteRubrique}</p>}
              </div>
              <ol className="border-t border-ink md:col-span-8">
                {liste.map((v, i) => (
                  <li key={v.slug} className="border-b border-line">
                    <a href={v.entry.url ?? '#'} target="_blank" rel="noopener" className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-5">
                      <span className="font-serif italic text-gold">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-serif text-[1.08rem] text-ink"><span className="lien">{v.entry.titre}</span></span>
                      <span className="label group-hover:!text-terra">Voir ↗</span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </>
  );
}

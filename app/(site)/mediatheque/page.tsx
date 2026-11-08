import { reader } from '@/lib/content';
import { EnTete } from '@/components/ui';

export const metadata = { title: 'Médiathèque' };

export default async function Mediatheque() {
  const items = (await reader.collections.videos.all()).sort((a, b) => a.entry.ordre! - b.entry.ordre!);
  const rubriques = [...new Set(items.map((i) => i.entry.rubrique || 'Vidéos'))];
  return (
    <>
      <EnTete kicker="Écouter, voir" titre="Médiathèque" intro="Leçons, conférences et entretiens de philosophie africaine." />
      <div className="mx-auto max-w-5xl space-y-14 px-5 py-14">
        {rubriques.map((r) => {
          const liste = items.filter((i) => (i.entry.rubrique || 'Vidéos') === r);
          return (
            <section key={r}>
              <h2 className="display-title text-2xl text-terra">{r}</h2>
              {liste[0]?.entry.noteRubrique && <p className="mt-2 font-serif italic text-ink-soft">{liste[0].entry.noteRubrique}</p>}
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {liste.map((v) => (
                  <li key={v.slug}>
                    <a href={v.entry.url ?? '#'} target="_blank" rel="noopener" className="flex h-full items-start gap-4 border border-ink/10 bg-white p-5 hover:border-terra">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-terra text-paper">▶</span>
                      <span className="font-semibold text-ink">{v.entry.titre}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

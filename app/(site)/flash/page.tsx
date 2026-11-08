import { reader } from '@/lib/content';
import { EnTete } from '@/components/ui';
import { Prose } from '@/components/Prose';
import { Cadre } from '@/components/Cadre';

export const metadata = { title: 'Flash' };

export default async function Flash() {
  const items = (await reader.collections.flash.all()).sort((a, b) => a.entry.ordre! - b.entry.ordre!);
  const corps = await Promise.all(items.map((i) => i.entry.contenu()));
  return (
    <>
      <EnTete kicker="Textes-manifestes" titre="Flash d’entrée" />
      <div className="mx-auto max-w-4xl space-y-16 px-5 py-14">
        {items.map((f, n) => (
          <article key={f.slug} id={f.slug} className="scroll-mt-24">
            <p className="kicker">{String(n + 1).padStart(2, '0')}{f.entry.lieu && ` · ${f.entry.lieu}`}</p>
            <h2 className="display-title mt-2 text-2xl text-terra sm:text-3xl">{f.entry.titre}</h2>
            {f.entry.auteur && <p className="mt-2 font-serif italic text-ink-soft">{f.entry.auteur}</p>}
            {f.entry.image && (
              <figure className="mt-6">
                <Cadre src={f.entry.image} alt={f.entry.imageDescription} format="16/9" />
                {(f.entry.imageLegende || f.entry.imageCredit) && <figcaption className="mt-2 text-xs text-ink/55">{f.entry.imageLegende}{f.entry.imageCredit && ` · ${f.entry.imageCredit}`}</figcaption>}
              </figure>
            )}
            {f.entry.phrase && <p className="my-8 border-l-4 border-gold pl-5 font-serif text-xl italic text-ink">{f.entry.phrase}</p>}
            <Prose node={corps[n].node} className="mt-6" />
          </article>
        ))}
      </div>
    </>
  );
}

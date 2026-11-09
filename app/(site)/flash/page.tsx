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
      <EnTete kicker="Textes-manifestes" titre="Flash d’entrée" intro="Des textes courts pour entrer dans les débats de la philosophie africaine." />
      <div className="mx-auto max-w-7xl space-y-28 px-5 sm:px-8">
        {items.map((f, n) => (
          <article key={f.slug} id={f.slug} className="scroll-mt-10">
            <div className="mx-auto max-w-4xl text-center">
              <p className="font-serif text-3xl italic text-gold">{String(n + 1).padStart(2, '0')}</p>
              <h2 className="titre titre-l mt-4">{f.entry.titre}</h2>
              <p className="mt-4 text-sm text-mute">{[f.entry.auteur, f.entry.lieu].filter(Boolean).join(' · ')}</p>
            </div>
            {f.entry.image && (
              <figure className="mx-auto mt-12 max-w-5xl">
                <Cadre src={f.entry.image} alt={f.entry.imageDescription} format="21/9" />
                {(f.entry.imageLegende || f.entry.imageCredit) && <figcaption className="mt-3 text-[0.8rem] text-mute">{f.entry.imageLegende}{f.entry.imageCredit && <span className="italic"> — {f.entry.imageCredit}</span>}</figcaption>}
              </figure>
            )}
            {f.entry.phrase && <p className="mx-auto mt-14 max-w-3xl text-center font-serif text-2xl italic leading-snug text-ink">« {f.entry.phrase.replace(/^[«"\s]+|[»"\s]+$/g, '')} »</p>}
            <Prose node={corps[n].node} className="mt-12" />
            <div className="aube mx-auto mt-16 max-w-[40rem]" aria-hidden />
          </article>
        ))}
      </div>
    </>
  );
}

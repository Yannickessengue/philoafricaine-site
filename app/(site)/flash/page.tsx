import { reader } from '@/lib/content';
import { EnTete } from '@/components/ui';
import { decouper, rendre } from '@/components/Prose';

export const metadata = {
  title: 'Flash d’entrée',
  description: '« Penser, oser penser et oser donner à penser sur la philosophie, sur la philosophie en Afrique, sur la philosophie africaine. »',
};

// Anciennes ancres du site d'origine (#texte-9, #texte-5…), conservées pour les liens existants
const ANCIENNES = ['texte-9', 'texte-5', 'texte-10', 'texte-6', 'texte-7', 'texte-8'];
const LETTRINE =
  'first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[3.4rem] first-letter:font-black first-letter:leading-[0.72] first-letter:text-terra';

export default async function Flash() {
  const flashs = (await reader.collections.flash.all()).sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));
  const n = flashs.length;
  const textes = await Promise.all(flashs.map(async (f) => decouper((await f.entry.contenu()).node)));
  const num = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <>
      <EnTete
        kicker="Manifeste"
        titre="Flash d’entrée"
        intro="« Penser, oser penser et oser donner à penser sur la philosophie, sur la philosophie en Afrique, sur la philosophie africaine. »"
        icone="tete"
      />
      <section className="border-b border-ink/10 bg-cream/50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <p className="max-w-2xl font-serif text-xl leading-relaxed text-ink/85 sm:text-[1.6rem] sm:leading-relaxed">
            {n} textes fondateurs, {n} voix — pour dire ce que « Philosophie africaine. Débats &amp; questions » cherche à ouvrir.
          </p>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-ink/12 bg-ink/12 sm:grid-cols-2">
            {flashs.map((f, i) => (
              <li key={f.slug}>
                <a className="group flex h-full flex-col gap-2 bg-paper p-5 transition-colors hover:bg-cream/60" href={`#${f.slug}`}>
                  <span className="font-serif text-lg text-terra/50 group-hover:text-terra">{num(i)}</span>
                  <span className="font-serif text-[1.05rem] font-bold leading-snug text-ink transition-colors group-hover:text-terra-deep">{f.entry.titre}</span>
                  <span className="mt-auto pt-2 text-xs text-ink/50">
                    {f.entry.auteur}
                    {f.entry.lieu ? ` · ${f.entry.lieu}` : ''}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {flashs.map((f, i) => {
        const { chapeau, sections } = textes[i];
        const corps = [...chapeau, ...sections.flatMap((s) => (s.titre ? [s.titre, ...s.corps] : s.corps))];
        const [premier, ...reste] = corps;
        return (
          <article key={f.slug} id={f.slug} className={`scroll-mt-16 ${i % 2 ? 'bg-cream/40' : 'bg-paper'}`}>
            {ANCIENNES[i] && <span id={ANCIENNES[i]} className="block scroll-mt-16" aria-hidden="true" />}
            {f.entry.image && (
              <div className="relative aspect-[16/7] max-h-[52vh] w-full overflow-hidden bg-ink">
                <img alt={f.entry.imageDescription ?? ''} src={f.entry.image} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent">
                  {(f.entry.imageLegende || f.entry.imageCredit) && (
                    <p className="absolute bottom-3 left-0 right-0 mx-auto max-w-6xl px-5 text-xs text-paper/85">
                      {f.entry.imageLegende && <span className="italic">{f.entry.imageLegende}</span>}
                      {f.entry.imageCredit && <span className="text-paper/55"> — {f.entry.imageCredit}</span>}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="mx-auto grid max-w-6xl gap-x-14 gap-y-6 px-5 py-14 sm:py-16 lg:grid-cols-[17rem_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <p className="font-serif text-[2.75rem] leading-none text-terra">
                  {num(i)}
                  <span className="text-xl text-terra/35"> / {String(n).padStart(2, '0')}</span>
                </p>
                <h2 className="mt-4 font-serif text-[1.3rem] font-bold leading-[1.22] text-ink [text-wrap:balance]">{f.entry.titre}</h2>
                <p className="mt-4 border-t border-ink/15 pt-3 text-sm leading-relaxed text-ink/55">
                  {f.entry.auteur && <span className="block font-semibold text-terra-deep">{f.entry.auteur}</span>}
                  {f.entry.lieu && <span>{f.entry.lieu}</span>}
                </p>
                {f.entry.phrase && (
                  <p className="mt-7 hidden border-l-2 border-terra pl-4 font-serif text-[1.15rem] italic leading-snug text-ink lg:block">{f.entry.phrase}</p>
                )}
              </aside>
              <div className="max-w-[40rem]">
                <div className="prose-jogoo prose-jogoo--flash">
                  {premier && rendre(premier, { p: LETTRINE })}
                  {rendre(reste, {})}
                </div>
                {f.entry.phrase && <p className="mt-8 border-l-2 border-terra pl-4 font-serif text-lg italic leading-snug text-ink lg:hidden">{f.entry.phrase}</p>}
              </div>
            </div>
          </article>
        );
      })}

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
          <p className="kicker text-gold">Flash — appel à la fierté</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-paper/60">
            Le groupe musical sénégalais Daara J Family, dans le titre « Bayi Yoon », nous lance cet appel à la fierté d’être Africain…
          </p>
          <a
            href="https://www.youtube.com/results?search_query=Daara+J+Family+Bayi+Yoon"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 border border-paper/30 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            Écouter « Bayi Yoon » <span aria-hidden="true">↗</span>
          </a>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Daara J Family — « Bayi Yoon »</p>
        </div>
      </section>
    </>
  );
}

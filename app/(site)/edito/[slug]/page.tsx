import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { apercuEdito } from '@/lib/apercu';
import { reader, getEditos, dateFr, motsCles, sansEmail } from '@/lib/content';
import { decouper, rendre, versNoeud, type Classes } from '@/components/Prose';
import { Partage } from '@/components/Partage';
import { Commentaires } from '@/components/Commentaires';
import { typo } from '@/lib/typo';

export async function generateStaticParams() {
  return (await getEditos()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = await reader.collections.editos.read((await params).slug);
  return e ? { title: e.titre, description: e.accroche?.replace(/\*/g, '').slice(0, 200), ...partageEdito(e) } : {};
}

const JUSTIFIE = '[text-align:justify] [hyphens:auto]';
const chapeau: Classes = {
  p: `mb-4 text-[1.05rem] leading-relaxed text-ink ${JUSTIFIE}`,
  pFort: 'my-5 border-l-2 border-terra pl-4 font-brand text-[1.05rem] font-bold leading-snug text-terra-deep',
  ul: 'mb-4 space-y-1.5 text-[1.05rem] leading-relaxed text-ink',
  ol: 'mb-4 list-decimal space-y-1.5 pl-5 text-[1.05rem] leading-relaxed text-ink',
  li: 'relative pl-5 before:absolute before:left-0 before:text-terra before:content-["✳"] [ol_&]:pl-0 [ol_&]:before:content-none',
  blockquote: 'my-6 border-l-[3px] border-terra pl-4 font-serif italic text-ink',
  a: 'text-terra-deep underline underline-offset-2 hover:text-terra',
  img: 'my-6 h-auto w-full border border-ink/10',
  h3: 'display-title mb-2 mt-6 text-[1rem] leading-tight text-terra-deep',
};
const colonnes: Classes = {
  ...chapeau,
  p: `mb-3 text-[0.94rem] leading-relaxed text-ink-soft ${JUSTIFIE}`,
  pFort: 'my-5 border-l-2 border-terra pl-4 font-brand text-[0.98rem] font-bold leading-snug text-terra-deep [break-inside:avoid]',
  ul: 'mb-3 space-y-1.5 text-[0.94rem] leading-relaxed text-ink-soft',
  ol: 'mb-3 list-decimal space-y-1.5 pl-5 text-[0.94rem] leading-relaxed text-ink-soft',
  h2: 'display-title mb-2 text-[1.05rem] leading-tight text-terra [break-after:avoid]',
};
const LETTRINE =
  'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[3.4rem] first-letter:font-black first-letter:leading-[0.75] first-letter:text-terra';

function partageEdito(e: { titre: string; soustitre?: string | null; surtitre?: string | null; accroche?: string | null; image?: string | null; portrait?: string | null; date?: string | null; signature?: string | null }) {
  const img = apercuEdito(e, sansEmail(e.signature) || 'Groupe JOGOO');
  const desc = e.accroche?.replace(/\*/g, '').slice(0, 200);
  return {
    openGraph: { title: e.titre, description: desc, images: [img], siteName: 'Groupe JOGOO', locale: 'fr_FR', type: 'article' as const },
    twitter: { card: 'summary_large_image' as const, title: e.titre, description: desc, images: [img.url] },
  };
}

export default async function Edito({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [e, tous] = await Promise.all([reader.collections.editos.read(slug), getEditos()]);
  if (!e) notFound();
  const { node } = await e.contenu();
  const { chapeau: debut, sections } = decouper(node);
  const signature = sansEmail(e.signature);
  const pos = tous.findIndex((x) => x.slug === slug);
  const precedent = tous[pos + 1];
  const suivant = pos > 0 ? tous[pos - 1] : undefined;
  const url = `${SITE}/edito/${slug}`;
  const partage = { url, titre: e.titre, accroche: e.accroche ?? undefined, hashtags: motsCles(e.motsCles), pdf: e.pdf || `/edito/${slug}/pdf` };
  const refs = (e.references ?? '').split(/\n\s*\n/).map((r) => r.trim()).filter(Boolean);
  const conclusion = e.conclusion ? decouper(versNoeud(e.conclusion)).chapeau : [];

  return (
    <>
      <article className="edito-doc mx-auto max-w-5xl px-5 py-14 lg:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="kicker">
            Édito de la semaine{e.surtitre ? ` · ${e.surtitre}` : ''}
          </p>
          <h1 className="display-title mt-4 text-4xl leading-[0.98] text-ink sm:text-5xl">{typo(e.titre)}</h1>
          {e.soustitre && <p className="mt-3 font-serif text-lg italic text-ink/70 sm:text-xl">{typo(e.soustitre)}</p>}
          <div className="mt-6 flex flex-col items-center gap-3">
            {e.portrait && <img alt={signature} src={e.portrait} className="h-24 w-24 rounded-full object-cover" />}
            <div>
              {signature && <p className="font-brand text-sm font-bold text-ink">{signature}</p>}
              <p className="text-xs uppercase tracking-wide text-ink/50">{dateFr(e.date)}</p>
            </div>
          </div>
          <Partage {...partage} className="mt-8 justify-center" />
        </header>

        {e.exergue && (
          <blockquote className="mx-auto mt-10 max-w-2xl border-y border-ink/15 py-5 text-center font-serif text-lg italic leading-relaxed text-ink">
            « {typo(e.exergue)} »
            {e.exergueAuteur && (
              <footer className="mt-2 font-brand text-[0.7rem] font-semibold uppercase not-italic tracking-wide text-terra-deep">{typo(e.exergueAuteur)}</footer>
            )}
          </blockquote>
        )}

        {e.image && (
          <figure className="mx-auto mt-10 max-w-4xl">
            <div className="cadre aspect-[7/5] border border-ink/10">
              <img alt={e.imageDescription ?? ''} src={e.image} />
            </div>
            {e.imageDescription && <figcaption className="mt-2 text-xs italic text-ink/50">{e.imageDescription}</figcaption>}
          </figure>
        )}

        {debut.length > 0 && (
          <div className="edito-lede mx-auto mt-12 max-w-3xl">
            {debut.map((n, i) => (
              <div key={i} className="contents">
                {rendre(n, i === 0 ? { ...chapeau, p: `${chapeau.p} ${LETTRINE}` } : chapeau)}
              </div>
            ))}
          </div>
        )}

        {sections.length > 0 && (
          <div className="edito-columns mx-auto mt-10 max-w-4xl lg:columns-2 lg:gap-12">
            {sections.map((s, i) => (
              <section key={i} className="mb-6">
                {s.titre && rendre(s.titre, colonnes)}
                {rendre(s.corps, colonnes)}
              </section>
            ))}
          </div>
        )}

        {conclusion.length > 0 && (
          <div className="edito-conclusion mx-auto mt-12 max-w-3xl border-t border-ink/15 pt-10">{rendre(conclusion, chapeau)}</div>
        )}

        {refs.length > 0 && (
          <div className="mx-auto mt-12 max-w-4xl border-t border-ink/15 pt-6">
            <p className="kicker mb-4">Références bibliographiques</p>
            <ol className="list-none gap-x-10 text-[0.78rem] leading-relaxed text-ink/55 sm:columns-2">
              {refs.map((r, i) => (
                <li key={i} className="mb-2.5 break-inside-avoid">
                  {rendre(decouper(versNoeud(r)).chapeau, { p: 'inline' })}
                </li>
              ))}
            </ol>
          </div>
        )}

        {motsCles(e.motsCles).length > 0 && (
          <p className="mx-auto mt-10 max-w-4xl text-center text-xs text-ink/45">
            {motsCles(e.motsCles).map((m) => `#${m.replace(/\s+/g, '')}`).join('  ')}
          </p>
        )}

        <Partage {...partage} className="mt-12 justify-center" />

        <nav className="mt-12 grid gap-3 border-t border-ink/10 pt-6 sm:grid-cols-2 print:hidden">
          {precedent ? (
            <a className="group border border-ink/12 bg-white p-4 transition-colors hover:border-terra" href={`/edito/${precedent.slug}`}>
              <span className="kicker">Édito précédent</span>
              <span className="mt-1 block font-brand text-sm font-bold text-ink group-hover:text-terra">{precedent.entry.titre}</span>
            </a>
          ) : (
            <span />
          )}
          {suivant && (
            <a className="group border border-ink/12 bg-white p-4 text-right transition-colors hover:border-terra" href={`/edito/${suivant.slug}`}>
              <span className="kicker">Édito suivant</span>
              <span className="mt-1 block font-brand text-sm font-bold text-ink group-hover:text-terra">{suivant.entry.titre}</span>
            </a>
          )}
        </nav>
        <p className="mt-10 text-sm text-ink-soft print:hidden">
          <a className="font-semibold text-terra-deep underline underline-offset-2 hover:text-terra" href="/edito">
            ← Tous les éditos
          </a>
        </p>
      </article>
      <Commentaires edito={slug} />
    </>
  );
}

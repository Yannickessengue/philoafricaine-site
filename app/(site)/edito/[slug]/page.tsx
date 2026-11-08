import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getEditos, dateFr, motsCles, sansEmail } from '@/lib/content';
import { Prose, TexteSimple } from '@/components/Prose';
import { Cadre } from '@/components/Cadre';

export async function generateStaticParams() {
  return (await getEditos()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = await reader.collections.editos.read((await params).slug);
  return e ? { title: e.titre, description: e.accroche?.replace(/\*/g, '').slice(0, 200), openGraph: { images: e.image ? [e.image] : [] } } : {};
}

export default async function Edito({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await reader.collections.editos.read(slug);
  if (!e) notFound();
  const { node } = await e.contenu();
  return (
    <article>
      <header className="bg-cream/60">
        <div className="mx-auto max-w-4xl px-5 pb-10 pt-12">
          <Link href="/edito" className="kicker hover:text-terra">← L’édito</Link>
          {e.surtitre && <p className="kicker mt-6 !text-gold-deep">{e.surtitre}</p>}
          <h1 className="display-title mt-2 text-3xl text-terra sm:text-5xl">{e.titre}</h1>
          {e.soustitre && <p className="mt-3 font-serif text-xl italic text-ink-soft">{e.soustitre}</p>}
          <p className="mt-4 text-sm text-ink/60"><time dateTime={e.date ?? ''}>{dateFr(e.date)}</time></p>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5">
        {e.image && (
          <figure className="-mt-2">
            <Cadre src={e.image} alt={e.imageDescription} format="16/9" />
            {e.imageDescription && <figcaption className="mt-2 text-xs text-ink/55">{e.imageDescription}</figcaption>}
          </figure>
        )}
        <div className="mx-auto max-w-3xl py-10">
          {e.accroche && <TexteSimple texte={e.accroche} className="!text-ink [&_p]:!text-left font-semibold text-lg" />}
          {e.exergue && (
            <blockquote className="my-10 border-l-4 border-gold pl-6 font-serif text-lg italic text-ink">
              {e.exergue}
              {e.exergueAuteur && <footer className="mt-3 font-sans text-sm not-italic text-ink/60">— {e.exergueAuteur}</footer>}
            </blockquote>
          )}
          <Prose node={node} className="text-[1.04rem]" />
          {e.conclusion && (
            <section className="mt-10 border-t-2 border-terra pt-8">
              <TexteSimple texte={e.conclusion} className="text-[1.04rem]" />
            </section>
          )}
          {e.signature && (
            <div className="mt-12 flex items-center gap-5 border-y border-ink/10 py-6">
              {e.portrait && <div className="w-20 shrink-0"><Cadre src={e.portrait} alt={e.signature} format="1/1" /></div>}
              <p className="font-serif italic text-ink">{sansEmail(e.signature)}</p>
            </div>
          )}
          {e.references && (
            <section className="mt-10">
              <p className="kicker">Références</p>
              <TexteSimple texte={e.references} className="mt-3 text-sm [&_p]:!text-left" />
            </section>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {motsCles(e.motsCles).map((m) => <span key={m} className="bg-cream px-2 py-0.5 text-xs text-terra-deep">#{m}</span>)}
            {e.pdf && (
              <a href={e.pdf} className="ml-auto bg-ink px-4 py-2 font-brand text-xs font-bold uppercase tracking-wider text-paper hover:bg-terra">Télécharger le PDF</a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

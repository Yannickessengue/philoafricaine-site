import { notFound } from 'next/navigation';
import { reader, getEditos, dateFr, motsCles, sansEmail } from '@/lib/content';
import { Prose, TexteSimple } from '@/components/Prose';
import { Cadre } from '@/components/Cadre';
import { ArticleTete, Fin } from '@/components/Article';

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
  const signature = sansEmail(e.signature);
  const [nom, ...fonction] = signature.split(/\s*[,·]\s*/);
  return (
    <article>
      <ArticleTete retour="/edito" retourLabel="L’édito" kicker={e.surtitre || 'Édito'} titre={e.titre} soustitre={e.soustitre} auteur={nom} date={dateFr(e.date)} />
      {e.image && (
        <figure className="mx-auto mt-14 max-w-5xl px-5 sm:px-8">
          <Cadre src={e.image} alt={e.imageDescription} format="16/9" priorite />
          {e.imageDescription && <figcaption className="mt-3 text-[0.8rem] text-mute">{e.imageDescription}</figcaption>}
        </figure>
      )}
      <div className="px-5 pt-14 sm:px-8">
        {e.accroche && <TexteSimple texte={e.accroche} className="!text-[1.2rem] !leading-relaxed [&_p]:!text-ink [&_strong]:font-normal" />}
        {e.exergue && (
          <figure className="mx-auto my-14 max-w-[40rem] text-center">
            <span className="aube mx-auto w-24" aria-hidden />
            <blockquote className="mt-6 font-serif text-[1.15rem] italic leading-relaxed text-ink">{e.exergue}</blockquote>
            {e.exergueAuteur && <figcaption className="mt-4 text-[0.82rem] text-mute">{e.exergueAuteur}</figcaption>}
          </figure>
        )}
        <Prose node={node} className="lettrine" />
        {e.conclusion && <TexteSimple texte={e.conclusion} />}
        {signature && (
          <div className="mx-auto mt-14 flex max-w-[40rem] items-center gap-5 border-t border-line pt-8">
            {e.portrait && <div className="w-16 shrink-0 overflow-hidden rounded-full"><Cadre src={e.portrait} alt={nom} format="1/1" /></div>}
            <p className="text-sm leading-relaxed text-ink-soft"><span className="font-serif text-base italic text-ink">{nom}</span>{fonction.length > 0 && <><br />{fonction.join(', ')}</>}</p>
          </div>
        )}
        {e.references && (
          <section className="mx-auto mt-12 max-w-[40rem]">
            <p className="label">Références</p>
            <TexteSimple texte={e.references} className="mt-4 !text-[0.88rem] !leading-relaxed [&_p]:!mx-0" />
          </section>
        )}
        <div className="mx-auto mt-10 flex max-w-[40rem] flex-wrap items-center gap-x-4 gap-y-2">
          {motsCles(e.motsCles).map((m) => <span key={m} className="text-[0.8rem] text-mute">#{m}</span>)}
        </div>
        {e.pdf && <div className="mx-auto mt-10 max-w-[40rem]"><a href={e.pdf} className="bouton">Télécharger l’édito en PDF</a></div>}
        <Fin />
      </div>
    </article>
  );
}

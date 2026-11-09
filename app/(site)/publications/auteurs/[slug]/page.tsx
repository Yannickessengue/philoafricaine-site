import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getPublications } from '@/lib/content';
import { Prose } from '@/components/Prose';
import { Cadre } from '@/components/Cadre';
import { Fin } from '@/components/Article';

export async function generateStaticParams() {
  return (await reader.collections.auteurs.list()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await reader.collections.auteurs.read((await params).slug);
  return a ? { title: a.nom } : {};
}

export default async function Auteur({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.auteurs.read(slug);
  if (!a) notFound();
  const { node } = await a.notice();
  const ouvrages = (await getPublications()).filter((p) => p.entry.auteurFiche === slug);
  return (
    <article className="mx-auto max-w-6xl px-5 pt-14 sm:px-8">
      <Link href="/publications" className="label hover:!text-terra">← Publications</Link>
      <div className="mt-10 grid items-start gap-12 md:grid-cols-12">
        <figure className="md:col-span-4">
          <Cadre src={a.portrait} alt={a.nom} format="4/5" priorite />
          {a.creditPhoto && <figcaption className="mt-3 text-[0.75rem] text-mute">{a.creditPhoto}</figcaption>}
        </figure>
        <div className="md:col-span-8">
          <p className="label label-accent">{[a.pays, a.dates].filter(Boolean).join(' · ')}</p>
          <h1 className="titre titre-xl mt-4">{a.nom}</h1>
          <Prose node={node} className="mt-10 [&>*]:!ml-0" />
          {ouvrages.length > 0 && (
            <div className="mt-12 border-t border-ink pt-6">
              <p className="label">Notes de lecture</p>
              <ul className="mt-4 space-y-3">
                {ouvrages.map((o) => <li key={o.slug}><Link href={`/publications/${o.slug}`} className="group font-serif text-lg italic"><span className="lien">{o.entry.titre}</span></Link></li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Fin />
    </article>
  );
}

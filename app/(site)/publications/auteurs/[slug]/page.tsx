import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getPublications } from '@/lib/content';
import { Prose } from '@/components/Prose';
import { Cadre } from '@/components/Cadre';

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
    <article className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/publications" className="kicker hover:text-terra">← Publications</Link>
      <div className="mt-6 grid items-start gap-10 sm:grid-cols-[220px_1fr]">
        <figure>
          <Cadre src={a.portrait} alt={a.nom} format="3/4" />
          {a.creditPhoto && <figcaption className="mt-2 text-[0.7rem] text-ink/50">{a.creditPhoto}</figcaption>}
        </figure>
        <div>
          <h1 className="display-title text-3xl text-ink sm:text-4xl">{a.nom}</h1>
          <p className="mt-2 text-sm text-ink/60">{[a.dates, a.pays].filter(Boolean).join(' · ')}</p>
          <Prose node={node} className="mt-6" />
          {ouvrages.length > 0 && (
            <div className="mt-8 border-t border-ink/10 pt-6">
              <p className="kicker">Notes de lecture</p>
              <ul className="mt-3 space-y-2">
                {ouvrages.map((o) => <li key={o.slug}><Link href={`/publications/${o.slug}`} className="font-semibold text-terra-deep underline">{o.entry.titre}</Link></li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getActualites, dateFr, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Cadre } from '@/components/Cadre';
import { Prose } from '@/components/Prose';

export async function generateStaticParams() {
  return (await getActualites()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.actualites.read(slug);
  if (!a) return {};
  const description = a.resume || extrait(corpsBrut('actualites', slug), 160);
  return { title: a.titre, description, openGraph: { images: a.image ? [a.image] : [] } };
}

export default async function Actualite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.actualites.read(slug);
  if (!a) notFound();
  const { node } = await a.contenu();
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/actualites" className="kicker hover:text-terra">← Actualités</Link>
      <h1 className="display-title mt-4 text-3xl text-ink sm:text-4xl">{a.titre}</h1>
      <p className="mt-3 text-sm text-ink/60">
        {a.auteur && <span className="font-semibold text-terra-deep">{sansEmail(a.auteur)} · </span>}
        <time dateTime={a.date ?? ''}>{dateFr(a.date)}</time>
      </p>
      {a.image && (
        <figure className="mt-8">
          <Cadre src={a.image} alt={a.imageDescription} format="16/10" />
          {(a.imageDescription || a.imageCredit) && (
            <figcaption className="mt-2 text-xs text-ink/55">
              {a.imageDescription}{a.imageCredit && ` · ${a.imageCredit}`}
            </figcaption>
          )}
        </figure>
      )}
      <Prose node={node} className="mt-10 text-[1.04rem]" />
    </article>
  );
}

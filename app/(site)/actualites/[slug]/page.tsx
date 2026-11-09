import { notFound } from 'next/navigation';
import { reader, getActualites, dateFr, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Cadre } from '@/components/Cadre';
import { Prose } from '@/components/Prose';
import { ArticleTete, Fin } from '@/components/Article';

export async function generateStaticParams() {
  return (await getActualites()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.actualites.read(slug);
  if (!a) return {};
  return { title: a.titre, description: a.resume || extrait(corpsBrut('actualites', slug), 160), openGraph: { images: a.image ? [a.image] : [] } };
}

export default async function Actualite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.actualites.read(slug);
  if (!a) notFound();
  const { node } = await a.contenu();
  return (
    <article>
      <ArticleTete retour="/actualites" retourLabel="Actualités" kicker="Actualité" titre={a.titre} auteur={sansEmail(a.auteur)} date={dateFr(a.date)} />
      {a.image && (
        <figure className="mx-auto mt-14 max-w-5xl px-5 sm:px-8">
          <Cadre src={a.image} alt={a.imageDescription} format="16/9" priorite />
          {(a.imageDescription || a.imageCredit) && (
            <figcaption className="mt-3 text-[0.8rem] text-mute">{a.imageDescription}{a.imageCredit && <span className="italic"> — {a.imageCredit}</span>}</figcaption>
          )}
        </figure>
      )}
      <div className="px-5 pt-14 sm:px-8">
        <Prose node={node} className="lettrine" />
        <Fin />
      </div>
    </article>
  );
}

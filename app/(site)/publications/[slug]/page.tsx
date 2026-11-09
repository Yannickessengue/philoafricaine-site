import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getPublications, motsCles } from '@/lib/content';
import { Prose } from '@/components/Prose';
import { Cadre } from '@/components/Cadre';
import { ArticleTete, Fin } from '@/components/Article';

export async function generateStaticParams() {
  return (await getPublications()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await reader.collections.publications.read((await params).slug);
  return p ? { title: `${p.titre} — ${p.auteurOuvrage ?? ''}`, description: p.resume ?? undefined } : {};
}

export default async function Publication({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await reader.collections.publications.read(slug);
  if (!p) notFound();
  const { node } = await p.contenu();
  const auteur = p.auteurFiche ? await reader.collections.auteurs.read(p.auteurFiche) : null;
  return (
    <article>
      <ArticleTete retour="/publications" retourLabel="Publications" kicker="Note de lecture" titre={p.titre}
        soustitre={[p.auteurOuvrage, [p.editeur, p.annee].filter(Boolean).join(', ')].filter(Boolean).join(' — ')} />
      {p.couverture && <div className="mx-auto mt-12 w-48"><Cadre src={p.couverture} alt={p.titre} format="2/3" /></div>}
      <div className="px-5 pt-14 sm:px-8">
        <Prose node={node} className="lettrine" />
        <div className="mx-auto mt-12 grid max-w-[40rem] gap-6 border-t border-line pt-8 sm:grid-cols-2">
          {auteur && (
            <div>
              <p className="label">L’auteur</p>
              <Link href={`/publications/auteurs/${p.auteurFiche}`} className="group mt-2 inline-block font-serif text-lg italic"><span className="lien">{auteur.nom}</span></Link>
            </div>
          )}
          {p.lienUrl && (
            <div>
              <p className="label">L’ouvrage</p>
              <a href={p.lienUrl} target="_blank" rel="noopener" className="group mt-2 inline-block font-serif text-lg italic"><span className="lien">{p.lienLibelle || 'Voir l’ouvrage'}</span> ↗</a>
            </div>
          )}
        </div>
        {motsCles(p.motsCles).length > 0 && (
          <p className="mx-auto mt-8 max-w-[40rem] text-[0.8rem] text-mute">{motsCles(p.motsCles).join(' · ')}</p>
        )}
        <Fin />
      </div>
    </article>
  );
}

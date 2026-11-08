import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getPublications, motsCles } from '@/lib/content';
import { Prose } from '@/components/Prose';
import { Cadre } from '@/components/Cadre';

export async function generateStaticParams() {
  return (await getPublications()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await reader.collections.publications.read((await params).slug);
  return p ? { title: `${p.titre} · ${p.auteurOuvrage ?? ''}`, description: p.resume ?? undefined } : {};
}

export default async function Publication({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await reader.collections.publications.read(slug);
  if (!p) notFound();
  const { node } = await p.contenu();
  const auteur = p.auteurFiche ? await reader.collections.auteurs.read(p.auteurFiche) : null;
  return (
    <article className="mx-auto max-w-5xl px-5 py-12">
      <Link href="/publications" className="kicker hover:text-terra">← Publications</Link>
      <div className="mt-6 grid items-start gap-10 md:grid-cols-[1fr_2fr]">
        <aside className="space-y-4">
          {p.couverture && <Cadre src={p.couverture} alt={p.titre} format="2/3" />}
          <dl className="space-y-2 border-t border-ink/10 pt-4 text-sm">
            {p.auteurOuvrage && <div><dt className="kicker">Auteur</dt><dd>{auteur ? <Link className="text-terra-deep underline" href={`/publications/auteurs/${p.auteurFiche}`}>{p.auteurOuvrage}</Link> : p.auteurOuvrage}</dd></div>}
            {p.editeur && <div><dt className="kicker">Éditeur</dt><dd>{p.editeur}{p.annee && `, ${p.annee}`}</dd></div>}
          </dl>
          {p.lienUrl && (
            <a href={p.lienUrl} target="_blank" rel="noopener" className="inline-block border border-terra px-4 py-2 font-brand text-xs font-bold uppercase tracking-wider text-terra hover:bg-terra hover:text-paper">
              {p.lienLibelle || 'Voir l’ouvrage'} ↗
            </a>
          )}
        </aside>
        <div>
          <p className="kicker">Note de lecture</p>
          <h1 className="display-title mt-2 text-3xl text-ink sm:text-4xl">{p.titre}</h1>
          {p.auteurOuvrage && <p className="mt-2 font-serif text-lg italic text-ink-soft">{p.auteurOuvrage}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {motsCles(p.motsCles).map((m) => <span key={m} className="bg-cream px-2 py-0.5 text-xs text-terra-deep">{m}</span>)}
          </div>
          <Prose node={node} className="mt-8" />
        </div>
      </div>
    </article>
  );
}

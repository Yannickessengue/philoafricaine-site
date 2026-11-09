import { notFound } from 'next/navigation';
import { reader, getPublications, motsCles, extrait } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { toutesLesNotes } from '@/lib/notes';
import { EnTete } from '@/components/ui';
import { Prose } from '@/components/Prose';
import { CarteNote } from '@/components/FiltreNotes';

export async function generateStaticParams() {
  return (await getPublications()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await reader.collections.publications.read(slug);
  return p ? { title: p.titre, description: p.resume || extrait(corpsBrut('publications', slug), 160) } : {};
}

export default async function Publication({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await reader.collections.publications.read(slug);
  if (!p) notFound();
  const [{ node }, notes, auteur] = await Promise.all([
    p.contenu(),
    toutesLesNotes(),
    p.auteurFiche ? reader.collections.auteurs.read(p.auteurFiche) : Promise.resolve(null),
  ]);
  const moi = notes.find((n) => n.slug === slug)!;
  const tags = motsCles(p.motsCles);
  const proches = notes
    .filter((n) => n.slug !== slug)
    .map((n) => ({ n, s: n.tags.filter((t) => tags.includes(t)).length }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map((x) => x.n);
  const sousTitre = [p.auteurOuvrage, [p.editeur, p.annee].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
  return (
    <>
      <EnTete kicker="Note de lecture" titre={p.titre} intro={sousTitre} icone="book" />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-ink/10 py-3 text-sm text-ink-soft">
          {p.annee && <span>{p.annee}</span>}
          {p.annee && <span aria-hidden="true">·</span>}
          <span>{moi.minutes} min de lecture</span>
          <ul className="ml-auto flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li key={t} className="border border-ink/15 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <Prose node={node} className="mt-8" />
        {p.lienUrl && (
          <a className="mt-8 inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra" href={p.lienUrl} target="_blank" rel="noreferrer">
            Lire ou se procurer l’ouvrage
            {p.lienLibelle && <span className="text-xs font-normal normal-case text-paper/60">· {p.lienLibelle}</span>}
            <span aria-hidden="true">↗</span>
          </a>
        )}
        {auteur && (
          <div className="mt-12 flex gap-5 border-l-2 border-terra bg-cream/50 p-6">
            {auteur.portrait && <img alt={auteur.nom} src={auteur.portrait} className="h-24 w-20 shrink-0 border border-ink/10 object-cover object-top grayscale" />}
            <div>
              <p className="kicker">L’auteur</p>
              <h2 className="mt-1 font-brand text-lg font-bold text-ink">{auteur.nom}</h2>
              <p className="text-sm text-ink/60">{[auteur.dates, auteur.pays].filter(Boolean).join(' · ')}</p>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{extrait(corpsBrut('auteurs', p.auteurFiche!), 400)}</p>
              <a className="mt-3 inline-block text-sm font-semibold text-terra-deep underline underline-offset-2 hover:text-terra" href={`/publications/auteurs/${p.auteurFiche}`}>
                Voir le profil →
              </a>
            </div>
          </div>
        )}
        {proches.length > 0 && (
          <>
            <hr className="rule-dotted my-14" />
            <div className="mb-6">
              <p className="kicker mb-2">Dans le même esprit</p>
              <h2 className="display-title text-3xl text-terra sm:text-4xl">À lire aussi</h2>
            </div>
            <div className="grid gap-4">
              {proches.map((n) => (
                <CarteNote key={n.slug} n={n} />
              ))}
            </div>
          </>
        )}
        <p className="mt-12 text-sm text-ink-soft">
          <a className="font-semibold text-terra-deep underline underline-offset-2 hover:text-terra" href="/publications">
            ← Toutes les publications
          </a>
        </p>
      </div>
    </>
  );
}

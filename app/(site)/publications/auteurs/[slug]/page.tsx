import { notFound } from 'next/navigation';
import { partage } from '@/lib/apercu';
import { reader } from '@/lib/content';
import { toutesLesNotes } from '@/lib/notes';
import { EnTete } from '@/components/ui';
import { Prose } from '@/components/Prose';
import { CarteNote } from '@/components/FiltreNotes';

export async function generateStaticParams() {
  return (await reader.collections.auteurs.all()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await reader.collections.auteurs.read((await params).slug);
  return a ? { title: a.nom, ...partage(a.nom, null, 'Auteurs') } : {};
}

export default async function Auteur({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.auteurs.read(slug);
  if (!a) notFound();
  const [{ node }, notes] = await Promise.all([a.notice(), toutesLesNotes()]);
  const siennes = notes.filter((n) => n.fiche === slug);
  return (
    <>
      <EnTete kicker="Auteur" titre={a.nom} intro={[a.dates, a.pays].filter(Boolean).join(' · ')} icone="book" />
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start">
          {a.portrait && (
            <figure className="mx-auto w-48 shrink-0 sm:mx-0">
              <img alt={a.nom} src={a.portrait} className="aspect-[4/5] w-full border border-ink/10 object-cover object-top grayscale" />
              {a.creditPhoto && <figcaption className="mt-2 text-xs text-ink/45">{a.creditPhoto}</figcaption>}
            </figure>
          )}
          <Prose node={node} className="!max-w-none text-[1.02rem]" />
        </div>
        {siennes.length > 0 && (
          <>
            <div className="mb-6 mt-14">
              <p className="kicker mb-2">
                {siennes.length} recension{siennes.length > 1 ? 's' : ''}
              </p>
              <h2 className="display-title text-3xl text-terra sm:text-4xl">Recensions</h2>
            </div>
            <div className="grid gap-4">
              {siennes.map((n) => (
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

import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { partage } from '@/lib/apercu';
import { reader, getActualites, dateFr, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Prose } from '@/components/Prose';
import { Partage } from '@/components/Partage';
import { typo } from '@/lib/typo';
import { Lateral } from '@/components/Lateral';

export async function generateStaticParams() {
  return (await getActualites()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.actualites.read(slug);
  if (!a) return {};
  const description = a.resume || extrait(corpsBrut('actualites', slug), 160);
  return { title: a.titre, description, ...partage(a.titre, description, 'Actualités', a.image) };
}

export default async function Actualite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [a, toutes] = await Promise.all([reader.collections.actualites.read(slug), getActualites()]);
  if (!a) notFound();
  const { node } = await a.contenu();
  const autres = toutes.filter((x) => x.slug !== slug).slice(0, 3);
  const partage = { url: `${SITE}/actualites/${slug}`, titre: a.titre, accroche: a.resume ?? undefined, commentaires: false };
  return (
    <article className="edito-doc mx-auto max-w-6xl px-5 py-14 lg:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="kicker">
          <a href="/actualites" className="hover:text-terra">Actualités</a>
        </p>
        <h1 className="display-title mt-4 text-3xl leading-[0.98] text-ink sm:text-5xl">{typo(a.titre)}</h1>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 text-xs uppercase tracking-wide text-ink/50">
          {a.auteur && <span className="font-semibold text-terra-deep">{sansEmail(a.auteur)}</span>}
          {a.auteur && <span aria-hidden="true">·</span>}
          <time dateTime={a.date ?? undefined}>{dateFr(a.date)}</time>
        </p>
        <Partage {...partage} className="mt-8 justify-center" />
      </header>
      {a.image && (
        <figure className="mx-auto mt-10 max-w-4xl">
          <div className="cadre aspect-[16/9] border border-ink/10">
            <img alt={a.imageDescription ?? ''} src={a.image} />
          </div>
          {(a.imageDescription || a.imageCredit) && (
            <figcaption className="mt-2 text-xs italic text-ink/50">
              {a.imageDescription}
              {a.imageCredit && ` — ${a.imageCredit}`}
            </figcaption>
          )}
        </figure>
      )}
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_19.5rem]">
      <div className="min-w-0">
      <div className="mx-auto max-w-3xl">
        <Prose node={node} className="prose-jogoo--flash !max-w-none" />
      </div>
      <Partage {...partage} className="mt-12 justify-center" />
      {autres.length > 0 && (
        <nav className="mt-12 border-t border-ink/10 pt-6 print:hidden">
          <p className="kicker mb-4">Autres actualités</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {autres.map((x) => (
              <a key={x.slug} className="group border border-ink/12 bg-white p-4 transition-colors hover:border-terra" href={`/actualites/${x.slug}`}>
                <span className="kicker">{dateFr(x.entry.date)}</span>
                <span className="mt-1 block font-brand text-sm font-bold leading-snug text-ink group-hover:text-terra">{x.entry.titre}</span>
              </a>
            ))}
          </div>
        </nav>
      )}
      <p className="mt-10 text-sm text-ink-soft print:hidden">
        <a className="font-semibold text-terra-deep underline underline-offset-2 hover:text-terra" href="/actualites">
          ← Toutes les actualités
        </a>
      </p>
      </div>
      <div className="print:hidden">
        <Lateral />
      </div>
      </div>
    </article>
  );
}

import { notFound } from 'next/navigation';
import { reader, extrait } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Prose } from '@/components/Prose';
import { Partage } from '@/components/Partage';
import { typo } from '@/lib/typo';
import { SITE } from '@/lib/site';
import { partage } from '@/lib/apercu';

/* Page propre à chaque appel à contributions : une adresse à partager, avec l’image et le texte complet. */
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await reader.collections.appels.list()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.appels.read(slug);
  if (!a) return {};
  const description = [a.type, a.dateEvenement, a.lieu, a.dateLimite].filter(Boolean).join(' · ') || extrait(corpsBrut('appels', slug), 160);
  return { title: a.titre, description, ...partage(a.titre, description, 'Appel à contributions', a.image) };
}

export default async function Appel({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.appels.read(slug);
  if (!a) notFound();
  const { node } = await a.descriptif();
  const ouvert = Boolean(a.ouvert) && !(a.cloture && a.cloture < new Date().toISOString().slice(0, 10));
  const p = { url: `${SITE}/recherche/appels-a-contributions/${slug}`, titre: a.titre, accroche: [a.dateEvenement, a.lieu, a.dateLimite].filter(Boolean).join(' · ') || undefined, commentaires: false };
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 lg:py-16">
      <header className="text-center">
        <p className="kicker">
          <a href="/recherche/appels-a-contributions" className="hover:text-terra">Appels à contributions</a>
          {a.type ? ` · ${a.type}` : ''}
        </p>
        <h1 className="mt-4 font-brand text-3xl font-bold leading-tight text-ink sm:text-[2.6rem]">{typo(a.titre)}</h1>
        <p className="mt-4 text-sm text-ink-soft">
          {[a.dateEvenement, a.lieu].filter(Boolean).join(' · ')}
        </p>
        <p className={`mt-3 inline-block px-3 py-1 font-brand text-[0.7rem] font-bold uppercase tracking-wide ${ouvert ? 'bg-terra text-white' : 'bg-ink/10 text-ink/55'}`}>
          {ouvert ? a.dateLimite || 'Appel ouvert' : 'Appel clos'}
        </p>
        <Partage {...p} className="mt-8 justify-center" />
      </header>
      {a.image && (
        <figure className="mt-10">
          <div className="cadre aspect-[16/9] border border-ink/10">
            <img alt={a.imageLegende ?? ''} src={a.image} />
          </div>
          {a.imageLegende && <figcaption className="mt-2 text-center text-xs italic text-ink/50">{a.imageLegende}</figcaption>}
        </figure>
      )}
      <Prose node={node} className="mx-auto mt-10 text-[1.02rem]" />
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-ink/10 pt-8">
        {ouvert && a.formulaire && a.formulaire !== 'aucun' && (
          <a className="bg-terra px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-ink" href={`/candidature/${slug}`}>
            Candidater en ligne
          </a>
        )}
        {a.fichier && (
          <a className="border border-ink/20 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.08em] text-ink hover:border-terra hover:text-terra" href={a.fichier} target="_blank" rel="noreferrer">
            {a.fichierLibelle || 'Télécharger l’appel (PDF)'}
          </a>
        )}
        {a.contact && (
          <a className="text-sm font-semibold text-terra-deep underline underline-offset-2" href={`mailto:${a.contact}`}>
            {a.contact}
          </a>
        )}
      </div>
      <Partage {...p} className="mt-10 justify-center" />
      <p className="mt-10 text-center text-sm">
        <a className="font-semibold text-terra-deep underline underline-offset-2" href="/recherche/appels-a-contributions">Tous les appels à contributions</a>
      </p>
    </article>
  );
}

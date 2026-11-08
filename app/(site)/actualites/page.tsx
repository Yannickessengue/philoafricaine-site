import Link from 'next/link';
import { getActualites, dateFr, extrait, sansEmail } from '@/lib/content';
import { corpsBrut } from '@/lib/raw';
import { Cadre } from '@/components/Cadre';
import { Carte, EnTete } from '@/components/ui';

export const metadata = { title: 'Actualités' };

export default async function Actualites() {
  const items = await getActualites();
  const [une, ...autres] = items;
  return (
    <>
      <EnTete kicker="Groupe JOGOO" titre="Actualités" intro="La vie du Groupe, des revues et de la philosophie africaine." />
      <div className="mx-auto max-w-6xl space-y-12 px-5 py-14">
        {une && (
          // À la une : l'image garde un format fixe (16:10) et reste en haut, sans s'étirer avec le texte.
          <article className="grid items-start gap-0 border border-ink/12 bg-white lg:grid-cols-2">
            <Link href={`/actualites/${une.slug}`}>
              <Cadre src={une.entry.image} alt={une.entry.imageDescription} format="16/10" gris />
            </Link>
            <div className="p-7 sm:p-10">
              <p className="kicker">À la une</p>
              <h2 className="display-title mt-2 text-2xl text-ink sm:text-3xl">
                <Link href={`/actualites/${une.slug}`} className="hover:text-terra">{une.entry.titre}</Link>
              </h2>
              <p className="mt-2 text-xs text-ink/55">
                {une.entry.auteur && <span className="font-semibold text-terra-deep">{sansEmail(une.entry.auteur)} · </span>}
                {dateFr(une.entry.date)}
              </p>
              <p className="mt-5 leading-relaxed text-ink-soft">{une.entry.resume || extrait(corpsBrut('actualites', une.slug), 420)}</p>
              <Link href={`/actualites/${une.slug}`} className="mt-6 inline-block bg-terra px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-wider text-paper hover:bg-terra-deep">
                Lire l’article
              </Link>
            </div>
          </article>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {autres.map((a) => (
            <Carte
              key={a.slug}
              href={`/actualites/${a.slug}`}
              image={a.entry.image}
              alt={a.entry.imageDescription}
              titre={a.entry.titre}
              meta={[sansEmail(a.entry.auteur), dateFr(a.entry.date)].filter(Boolean).join(' · ')}
              texte={a.entry.resume || extrait(corpsBrut('actualites', a.slug), 180)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

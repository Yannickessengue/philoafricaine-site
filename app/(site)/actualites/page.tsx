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
      <EnTete kicker="Groupe JOGOO" titre="Actualités" intro="La vie du Groupe, de ses revues et de la philosophie africaine." />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {une && (
          // À la une : l'image garde toujours son format (16:10) et reste en haut, quelle que soit la longueur du texte.
          <Link href={`/actualites/${une.slug}`} className="group grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7"><Cadre src={une.entry.image} alt={une.entry.imageDescription} format="16/10" priorite /></div>
            <div className="lg:col-span-5">
              <p className="label label-accent">À la une · {dateFr(une.entry.date)}</p>
              <h2 className="titre titre-l mt-4"><span className="lien">{une.entry.titre}</span></h2>
              {une.entry.auteur && <p className="mt-4 font-serif text-sm italic text-ink">{sansEmail(une.entry.auteur)}</p>}
              <p className="mt-5 leading-relaxed text-ink-soft">{une.entry.resume || extrait(corpsBrut('actualites', une.slug), 380)}</p>
              <span className="fleche mt-8">Lire l’article</span>
            </div>
          </Link>
        )}
        {autres.length > 0 && (
          <div className="mt-24 grid gap-x-10 gap-y-16 border-t border-ink pt-12 md:grid-cols-2 lg:grid-cols-3">
            {autres.map((a) => (
              <Carte key={a.slug} href={`/actualites/${a.slug}`} image={a.entry.image} alt={a.entry.imageDescription}
                kicker={dateFr(a.entry.date)} titre={a.entry.titre} meta={sansEmail(a.entry.auteur) || undefined}
                texte={a.entry.resume || extrait(corpsBrut('actualites', a.slug), 170)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

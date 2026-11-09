import Link from 'next/link';
import { getEditos, dateFr, extrait, sansEmail } from '@/lib/content';
import { Cadre } from '@/components/Cadre';
import { Carte, EnTete } from '@/components/ui';

export const metadata = { title: 'Édito' };

export default async function Editos() {
  const [premier, ...items] = await getEditos();
  return (
    <>
      <EnTete kicker="Chaque dimanche" titre="L’édito" intro="Une tribune hebdomadaire ouverte aux voix de la philosophie africaine et aux questions de notre temps." />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {premier && (
          <Link href={`/edito/${premier.slug}`} className="group grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7"><Cadre src={premier.entry.image} alt={premier.entry.imageDescription} format="16/10" priorite /></div>
            <div className="lg:col-span-5">
              <p className="label label-accent">{dateFr(premier.entry.date)}</p>
              <h2 className="titre titre-l mt-4"><span className="lien">{premier.entry.titre}</span></h2>
              {premier.entry.signature && <p className="mt-4 font-serif text-sm italic text-ink">{sansEmail(premier.entry.signature).split(',')[0]}</p>}
              <p className="mt-5 leading-relaxed text-ink-soft">{extrait(premier.entry.accroche ?? '', 320)}</p>
              <span className="fleche mt-8">Lire l’édito</span>
            </div>
          </Link>
        )}
        <div className="mt-24 grid gap-x-10 gap-y-16 border-t border-ink pt-12 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <Carte key={e.slug} href={`/edito/${e.slug}`} image={e.entry.image} alt={e.entry.imageDescription}
              kicker={dateFr(e.entry.date)} titre={e.entry.titre} meta={sansEmail(e.entry.signature).split(',')[0] || undefined}
              texte={extrait(e.entry.accroche ?? '', 160)} />
          ))}
        </div>
      </div>
    </>
  );
}

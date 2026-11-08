import { getEditos, dateFr } from '@/lib/content';
import { Carte, EnTete } from '@/components/ui';

export const metadata = { title: 'Édito' };

export default async function Editos() {
  const items = await getEditos();
  return (
    <>
      <EnTete kicker="Chaque dimanche" titre="L’édito" intro="Une tribune hebdomadaire sur la philosophie africaine et les questions du temps." />
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <Carte key={e.slug} href={`/edito/${e.slug}`} image={e.entry.image} alt={e.entry.imageDescription}
            kicker={e.entry.surtitre || 'Édito'} titre={e.entry.titre} meta={dateFr(e.entry.date)} texte={e.entry.accroche?.replace(/\*/g, '')} />
        ))}
      </div>
    </>
  );
}

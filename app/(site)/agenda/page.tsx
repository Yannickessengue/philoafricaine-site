import { getAgenda } from '@/lib/content';
import { EnTete, Etat } from '@/components/ui';

export const metadata = { title: 'Agenda' };
export const revalidate = 86400;

export default async function Agenda() {
  const items = await getAgenda();
  const mois = new Date().toISOString().slice(0, 7);
  const avenir = items.filter((i) => i.entry.date! >= mois);
  const passes = items.filter((i) => i.entry.date! < mois).reverse();
  const Liste = ({ liste }: { liste: typeof items }) => (
    <ul className="border-t border-ink">
      {liste.map((i) => (
        <li key={i.slug} className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-10">
          <p className="font-serif text-xl italic text-terra md:col-span-3">{i.entry.dateAffichee}</p>
          <div className="md:col-span-9">
            <p className="titre titre-m">{i.entry.intitule}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {i.entry.lieu && <span className="text-sm text-mute">{i.entry.lieu}</span>}
              {i.entry.aConfirmer && <Etat ton="gold">Date à confirmer</Etat>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <EnTete kicker="Groupe JOGOO" titre="Agenda" intro="Séminaires, ateliers de lecture, journées d’étude et colloques." />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="label mb-5">À venir</h2>
        <Liste liste={avenir} />
        {passes.length > 0 && (<><h2 className="label mb-5 mt-20">Événements passés</h2><div className="opacity-70"><Liste liste={passes} /></div></>)}
      </div>
    </>
  );
}

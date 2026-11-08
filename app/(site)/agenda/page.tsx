import { getAgenda } from '@/lib/content';
import { EnTete, Pastille } from '@/components/ui';

export const metadata = { title: 'Agenda' };
export const revalidate = 86400;

export default async function Agenda() {
  const items = await getAgenda();
  const today = new Date().toISOString().slice(0, 10);
  const avenir = items.filter((i) => i.entry.date! >= today.slice(0, 7));
  const passes = items.filter((i) => i.entry.date! < today.slice(0, 7)).reverse();
  const Ligne = ({ i }: { i: (typeof items)[number] }) => (
    <li className="grid gap-2 border-b border-ink/10 py-5 sm:grid-cols-[180px_1fr]">
      <p className="font-brand text-sm font-bold uppercase tracking-wide text-terra">
        {i.entry.dateAffichee}{i.entry.aConfirmer && <span className="ml-2"><Pastille ton="gold">à confirmer</Pastille></span>}
      </p>
      <div>
        <p className="font-serif text-lg text-ink">{i.entry.intitule}</p>
        {i.entry.lieu && <p className="mt-1 text-sm text-ink/60">{i.entry.lieu}</p>}
      </div>
    </li>
  );
  return (
    <>
      <EnTete kicker="Groupe JOGOO" titre="Agenda" intro="Séminaires, ateliers de lecture, journées d’étude et colloques." />
      <div className="mx-auto max-w-4xl px-5 py-14">
        <h2 className="kicker">À venir</h2>
        <ul className="mt-2">{avenir.map((i) => <Ligne key={i.slug} i={i} />)}</ul>
        {passes.length > 0 && (<><h2 className="kicker mt-14">Événements passés</h2><ul className="mt-2 opacity-75">{passes.map((i) => <Ligne key={i.slug} i={i} />)}</ul></>)}
      </div>
    </>
  );
}

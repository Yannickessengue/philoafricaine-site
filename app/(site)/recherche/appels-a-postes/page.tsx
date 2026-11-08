import { reader } from '@/lib/content';
import { EnTete, Pastille } from '@/components/ui';
import { Prose } from '@/components/Prose';

export const metadata = { title: 'Appels à postes' };

export default async function Postes() {
  const items = (await reader.collections.postes.all()).sort((a, b) => a.entry.numero! - b.entry.numero!);
  const corps = await Promise.all(items.map((i) => i.entry.missions()));
  return (
    <>
      <EnTete kicker="Recherche" titre="Appels à postes" intro="Fiches de poste de direction des axes de recherche du Groupe JOGOO." />
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-14">
        {items.map((p, n) => (
          <article key={p.slug} className="border border-ink/10 bg-white p-7">
            <div className="flex flex-wrap items-center gap-3">
              <p className="kicker">Axe {p.entry.numero}</p>
              {p.entry.pourvu ? <Pastille ton="ink">Pourvu</Pastille> : <Pastille>Ouvert</Pastille>}
            </div>
            <h2 className="mt-2 font-display text-xl font-extrabold uppercase text-ink">{p.entry.intitule}</h2>
            <Prose node={corps[n].node} className="mt-4" />
          </article>
        ))}
      </div>
    </>
  );
}

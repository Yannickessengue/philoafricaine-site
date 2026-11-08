import { reader } from '@/lib/content';
import { EnTete, Pastille } from '@/components/ui';
import { Prose } from '@/components/Prose';

export const metadata = { title: 'Appels à contributions' };

export default async function Appels() {
  const items = (await reader.collections.appels.all()).sort((a, b) => a.entry.ordre! - b.entry.ordre!);
  const corps = await Promise.all(items.map((i) => i.entry.descriptif()));
  return (
    <>
      <EnTete kicker="Recherche" titre="Appels à contributions" />
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-14">
        {items.map((a, n) => (
          <article key={a.slug} className="border border-ink/10 bg-white p-7">
            <div className="flex flex-wrap items-center gap-3">
              {a.entry.type && <p className="kicker">{a.entry.type}</p>}
              {a.entry.ouvert ? <Pastille>Ouvert</Pastille> : <Pastille ton="ink">Clos</Pastille>}
            </div>
            <h2 className="mt-2 font-display text-xl font-extrabold uppercase text-ink">{a.entry.titre}</h2>
            <dl className="mt-3 grid gap-1 text-sm text-ink-soft">
              {a.entry.dateEvenement && <div><dt className="inline font-semibold">Date : </dt><dd className="inline">{a.entry.dateEvenement}</dd></div>}
              {a.entry.lieu && <div><dt className="inline font-semibold">Lieu : </dt><dd className="inline">{a.entry.lieu}</dd></div>}
              {a.entry.dateLimite && <div><dt className="inline font-semibold">Échéance : </dt><dd className="inline">{a.entry.dateLimite}</dd></div>}
              {a.entry.contact && <div><dt className="inline font-semibold">Contact : </dt><dd className="inline">{a.entry.contact}</dd></div>}
            </dl>
            <Prose node={corps[n].node} className="mt-4" />
            {a.entry.fichier && <a href={a.entry.fichier} className="mt-4 inline-block bg-terra px-4 py-2 font-brand text-xs font-bold uppercase tracking-wider text-paper">{a.entry.fichierLibelle || 'Télécharger'}</a>}
          </article>
        ))}
      </div>
    </>
  );
}

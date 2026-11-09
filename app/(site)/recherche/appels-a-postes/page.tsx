import { reader } from '@/lib/content';
import { EnTete, Etat } from '@/components/ui';
import { Prose } from '@/components/Prose';

export const metadata = { title: 'Appels à postes' };

export default async function Postes() {
  const items = (await reader.collections.postes.all()).sort((a, b) => a.entry.numero! - b.entry.numero!);
  const corps = await Promise.all(items.map((i) => i.entry.missions()));
  return (
    <>
      <EnTete kicker="Recherche" titre="Appels à postes" intro="Fiches de poste de direction des axes de recherche du Groupe JOGOO." />
      <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="border-t border-ink">
        {items.map((p, n) => (
          <article key={p.slug} className="grid gap-6 border-b border-line py-12 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-4">
              <p className="font-serif text-3xl italic text-gold">Axe {p.entry.numero}</p>
              <div className="mt-4">{p.entry.pourvu ? <Etat ton="mute">Poste pourvu</Etat> : <Etat>Poste ouvert</Etat>}</div>
            </div>
            <div className="md:col-span-8">
              <h2 className="titre titre-m">{p.entry.intitule}</h2>
              <Prose node={corps[n].node} className="mt-5 [&>*]:!ml-0 !text-[1rem]" />
            </div>
          </article>
        ))}
      </div></div>
    </>
  );
}

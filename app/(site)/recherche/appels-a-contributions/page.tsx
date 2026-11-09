import { reader } from '@/lib/content';
import { EnTete, Etat } from '@/components/ui';
import { Prose } from '@/components/Prose';

export const metadata = { title: 'Appels à contributions' };

export default async function Appels() {
  const items = (await reader.collections.appels.all()).sort((a, b) => a.entry.ordre! - b.entry.ordre!);
  const corps = await Promise.all(items.map((i) => i.entry.descriptif()));
  return (
    <>
      <EnTete kicker="Recherche" titre="Appels à contributions" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="border-t border-ink">
        {items.map((a, n) => (
          <article key={a.slug} className="grid gap-8 border-b border-line py-12 md:grid-cols-12 md:gap-10">
            <aside className="space-y-4 md:col-span-4">
              {a.entry.ouvert ? <Etat>Appel ouvert</Etat> : <Etat ton="mute">Appel clos</Etat>}
              <dl className="space-y-3 text-sm">
                {[['Type', a.entry.type], ['Date', a.entry.dateEvenement], ['Lieu', a.entry.lieu], ['Échéance', a.entry.dateLimite], ['Contact', a.entry.contact]]
                  .filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="label">{k}</dt><dd className="mt-1 text-ink-soft">{v}</dd></div>)}
              </dl>
            </aside>
            <div className="md:col-span-8">
              <h2 className="titre titre-m">{a.entry.titre}</h2>
              <Prose node={corps[n].node} className="mt-5 [&>*]:!ml-0 !text-[1rem]" />
              {a.entry.fichier && <a href={a.entry.fichier} className="bouton mt-6">{a.entry.fichierLibelle || 'Télécharger l’appel'}</a>}
            </div>
          </article>
        ))}
      </div></div>
    </>
  );
}

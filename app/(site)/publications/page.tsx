import Link from 'next/link';
import { getPublications, motsCles } from '@/lib/content';
import { Cadre } from '@/components/Cadre';
import { EnTete } from '@/components/ui';

export const metadata = { title: 'Publications' };

export default async function Publications() {
  const items = await getPublications();
  return (
    <>
      <EnTete kicker="Bibliothèque" titre="Publications" intro="Notes de lecture d’ouvrages de philosophie africaine, classiques et contemporains." />
      <ul className="mx-auto max-w-7xl px-5 sm:px-8">
        {items.map((p, i) => (
          <li key={p.slug} className="border-b border-line first:border-t first:border-ink">
            <Link href={`/publications/${p.slug}`} className="group grid gap-6 py-10 md:grid-cols-12 md:gap-10">
              <span className="font-serif text-2xl italic text-gold md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
              {p.entry.couverture && <div className="w-32 md:col-span-2 md:w-auto"><Cadre src={p.entry.couverture} alt={p.entry.titre} format="2/3" /></div>}
              <div className={p.entry.couverture ? 'md:col-span-6' : 'md:col-span-8'}>
                <p className="label label-accent">{motsCles(p.entry.motsCles).slice(0, 3).join(' · ') || 'Note de lecture'}</p>
                <h2 className="titre titre-l mt-3 italic"><span className="lien">{p.entry.titre}</span></h2>
                {p.entry.resume && <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{p.entry.resume}</p>}
              </div>
              <div className="md:col-span-3 md:text-right">
                <p className="font-serif text-ink">{p.entry.auteurOuvrage}</p>
                <p className="mt-1 text-sm text-mute">{[p.entry.editeur, p.entry.annee].filter(Boolean).join(', ')}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

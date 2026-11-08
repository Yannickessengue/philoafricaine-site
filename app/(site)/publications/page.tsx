import { getPublications, motsCles } from '@/lib/content';
import { Carte, EnTete } from '@/components/ui';

export const metadata = { title: 'Publications' };

export default async function Publications() {
  const items = await getPublications();
  return (
    <>
      <EnTete kicker="Bibliothèque" titre="Publications" intro="Notes de lecture d’ouvrages de philosophie africaine, classiques et contemporains." />
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Carte
            key={p.slug}
            href={`/publications/${p.slug}`}
            image={p.entry.couverture}
            alt={p.entry.titre}
            kicker={motsCles(p.entry.motsCles).slice(0, 2).join(' · ') || 'Note de lecture'}
            titre={p.entry.titre}
            meta={[p.entry.auteurOuvrage, p.entry.editeur, p.entry.annee].filter(Boolean).join(' · ')}
            texte={p.entry.resume}
          />
        ))}
      </div>
    </>
  );
}

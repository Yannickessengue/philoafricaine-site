import { getPublications, reader, motsCles, extrait } from './content';
import { corpsBrut } from './raw';
import type { Note } from '@/components/FiltreNotes';

export async function toutesLesNotes() {
  const [pubs, auteurs] = await Promise.all([getPublications(), reader.collections.auteurs.all()]);
  const portraits = new Map(auteurs.map((a) => [a.slug, a.entry.portrait]));
  return pubs.map((p) => {
    const corps = corpsBrut('publications', p.slug);
    const n: Note & { une: boolean; fiche?: string | null } = {
      slug: p.slug,
      titre: p.entry.titre,
      auteur: p.entry.auteurOuvrage,
      annee: p.entry.annee,
      minutes: Math.max(1, Math.round(corps.split(/\s+/).filter(Boolean).length / 200)),
      resume: p.entry.resume || extrait(corps, 220),
      tags: motsCles(p.entry.motsCles),
      portrait: p.entry.auteurFiche ? portraits.get(p.entry.auteurFiche) : null,
      couverture: (p.entry as { couverture?: string | null }).couverture ?? null,
      une: Boolean(p.entry.une),
      fiche: p.entry.auteurFiche,
    };
    return n;
  });
}

import { reader } from '@/lib/content';
import type { Episode } from '@/components/Medias';

/** Épisodes de podcast publiés (ceux qui ont un fichier audio), dans l’ordre choisi dans l’administration. */
export async function getPodcasts(): Promise<(Episode & { slug: string; ordre: number })[]> {
  const tous = await reader.collections.podcasts.all();
  return tous
    .filter((p) => p.entry.audio)
    .sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0))
    .map((p) => ({
      slug: p.slug,
      ordre: p.entry.ordre ?? 0,
      titre: p.entry.titre,
      serie: p.entry.serie,
      audio: p.entry.audio ?? '',
      duree: p.entry.duree,
      description: p.entry.description,
      source: p.entry.source,
    }));
}

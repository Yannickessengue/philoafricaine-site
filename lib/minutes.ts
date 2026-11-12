import { reader } from '@/lib/content';

/** Épisodes de « Les 5 minutes du chant du coq », du plus récent au plus ancien. */
export async function getMinutes() {
  const tous = await reader.collections.minutes.all();
  return tous.sort((a, b) => (b.entry.date ?? '').localeCompare(a.entry.date ?? ''));
}

export const MINUTE = {
  titre: 'Les 5 minutes du chant du coq',
  devise: 'Un concept, un philosophe, cinq minutes.',
  base: '/les-5-minutes-du-chant-du-coq',
};

/** Adresse de lecture intégrée (YouTube sans cookies, WebTV de Rouen) ou null. */
export function integrationVideo(url?: string | null) {
  if (!url) return null;
  const yt = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];
  if (yt) return { src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`, service: 'YouTube', vignette: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` };
  const ubi = url.match(/^(https:\/\/webtv\.univ-rouen\.fr\/permalink\/[\w-]+)\/?$/);
  if (ubi) return { src: `${ubi[1]}/iframe/?autoplay=1`, service: 'la WebTV de l’université de Rouen', vignette: null };
  const vimeo = url.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeo) return { src: `https://player.vimeo.com/video/${vimeo}?autoplay=1&dnt=1`, service: 'Vimeo', vignette: null };
  return null;
}

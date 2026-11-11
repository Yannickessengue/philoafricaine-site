import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { reader } from '@/lib/content';
import { adressesStatiques } from '@/lib/gabarits';
import { slugsCandidature, slugsInscription } from '@/lib/activites';

export const revalidate = 86400;

/** Plan du site pour les moteurs de recherche. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixes = ['', '/actualites', '/publications', '/mediatheque', '/podcasts', '/la-minute-du-chant-du-coq', '/recherche/appels-a-contributions', '/direct', '/notre-histoire', '/adhesion', '/en'];
  const statiques = adressesStatiques();
  const [editos, actus, pubs, minutes] = await Promise.all([
    reader.collections.editos.list(),
    reader.collections.actualites.list(),
    reader.collections.publications.list(),
    reader.collections.minutes.list(),
  ]);
  const chemins = [
    ...fixes,
    ...statiques,
    ...editos.map((s) => `/edito/${s}`),
    ...actus.map((s) => `/actualites/${s}`),
    ...pubs.map((s) => `/publications/${s}`),
    ...minutes.map((s) => `/${s}`),
    ...(await slugsInscription()).map((s) => `/inscription/${s}`),
    ...(await slugsCandidature()).map((s) => `/candidature/${s}`),
  ];
  return [...new Set(chemins)].map((c) => ({ url: `${SITE}${c}` }));
}

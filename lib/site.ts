/**
 * Adresse publique du site, pour les liens de partage et les aperçus.
 * NEXT_PUBLIC_SITE_URL si elle est définie ; sinon le domaine de production Vercel
 * (qui devient philoafricaine.org dès que ce domaine est rattaché au projet).
 */
export const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://www.philoafricaine.org')
).replace(/\/$/, '');

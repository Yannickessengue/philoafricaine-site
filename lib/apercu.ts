/** Adresse de l’image d’aperçu générée pour les partages (voir app/og/route.tsx). */
export function apercu(titre: string, kicker = 'Groupe JOGOO', image?: string | null, auteur?: string | null) {
  const q = new URLSearchParams({ t: titre, k: kicker });
  if (image && image.startsWith('/')) q.set('i', image);
  if (auteur) q.set('a', auteur);
  return { url: `/og?${q.toString()}`, width: 1200, height: 630, alt: titre };
}

/** Métadonnées de partage complètes (Open Graph + X), à fusionner dans generateMetadata. */
export function partage(titre: string, description?: string | null, kicker?: string, image?: string | null, auteur?: string | null, type: 'website' | 'article' = 'article') {
  const img = apercu(titre, kicker, image, auteur);
  const desc = description?.replace(/\*/g, '').slice(0, 200) || undefined;
  return {
    openGraph: { title: titre, description: desc, images: [img], siteName: 'Groupe JOGOO', locale: 'fr_FR', type },
    twitter: { card: 'summary_large_image' as const, title: titre, description: desc, images: [img.url] },
  };
}

/** Montage d’édito (comme sur l’ancien site) : image en fond, titre, sous-titre, auteur avec portrait, date. */
export function apercuEdito(e: { titre: string; soustitre?: string | null; surtitre?: string | null; image?: string | null; portrait?: string | null; date?: string | null }, signature: string) {
  const [nom, ...reste] = signature.split(/\s+·\s+|,\s+/);
  const q = new URLSearchParams({ v: 'edito', t: e.titre, k: 'L’édito de la semaine' });
  if (e.soustitre) q.set('st', e.soustitre);
  if (e.image?.startsWith('/')) q.set('i', e.image);
  if (e.portrait?.startsWith('/')) q.set('p', e.portrait);
  if (nom) q.set('a', nom.trim());
  if (reste.length) q.set('f', reste.join(', ').trim());
  if (e.date) q.set('d', new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }));
  return { url: `/og?${q.toString()}`, width: 1200, height: 630, alt: e.titre };
}

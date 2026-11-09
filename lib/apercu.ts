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

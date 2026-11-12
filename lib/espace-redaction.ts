/* L'Espace rédaction (Keystatic) n'est ouvert que s'il est relié à GitHub :
   seules les personnes ayant un droit d'écriture sur le dépôt peuvent alors s'y connecter et publier.
   Sans cette configuration (mode « local »), il reste fermé en ligne et ne fonctionne qu'en développement. */
export const espaceRedactionOuvert =
  process.env.NODE_ENV === 'development' || Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);

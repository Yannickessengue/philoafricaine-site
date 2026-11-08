# philoafricaine.org — site du Groupe JOGOO

Nouveau site du Groupe JOGOO, reconstruit à partir de la sauvegarde du 9 novembre 2026.

- **Technique** : Next.js 15, Tailwind CSS, hébergement Vercel.
- **Espace rédaction** : Keystatic, à l’adresse `/keystatic` (ou `/admin`). Les contenus sont des fichiers dans `content/`, enregistrés directement dans ce dépôt GitHub.
- **Médias** : `public/medias/` (images et PDF publics), `revue-pdf/` (PDF de la Revue JOGOO, servis seulement après l’embargo).

## Rubriques

| Rubrique | Adresse | Dossier |
| --- | --- | --- |
| Éditos | `/edito` | `content/editos` |
| Actualités | `/actualites` | `content/actualites` |
| Publications (notes de lecture) | `/publications` | `content/publications`, `content/auteurs` |
| Revue JOGOO | `/sous-sites/revue-jogoo` | `content/revue` |
| Agenda | `/agenda` | `content/agenda` |
| Flash | `/flash` | `content/flash` |
| Médiathèque | `/mediatheque` | `content/videos` |
| Appels à postes / contributions | `/recherche/...` | `content/postes`, `content/appels` |
| Pages fixes | leur adresse | `content/pages` |

## Embargo de la Revue JOGOO

Chaque article a une date de publication et une durée d’embargo (6 mois par défaut). Pendant l’embargo, le site n’affiche que le titre, l’auteur, le résumé et la référence ; le PDF est refusé. Les pages sont régénérées chaque jour : l’embargo se lève automatiquement.

## Mise en ligne sur Vercel

1. Sur vercel.com, **Add New → Project**, importer ce dépôt, puis **Deploy** (aucun réglage à changer).
2. Pour que l’Espace rédaction enregistre en ligne, ouvrir `https://<adresse-vercel>/keystatic` et suivre l’assistant « Set up GitHub App » de Keystatic. Il crée une application GitHub et fournit quatre variables à ajouter dans Vercel (Settings → Environment Variables) :
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, puis redéployer.
3. Nom de domaine (o2switch) : dans Vercel, Settings → Domains → ajouter `philoafricaine.org` et `www.philoafricaine.org`, puis reporter chez o2switch les enregistrements DNS indiqués par Vercel.

## Développement local

```bash
npm install
npm run dev   # http://localhost:3000, Espace rédaction sur /keystatic (enregistre dans content/)
```

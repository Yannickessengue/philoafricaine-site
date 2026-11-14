# philoafricaine.org — site du Groupe JOGOO

Nouveau site du Groupe JOGOO, reconstruit à partir de la sauvegarde du 9 novembre 2026.

- **Technique** : Next.js 15, Tailwind CSS, hébergement Vercel.
- **Design** : celui du site d’origine, reproduit à l’identique (couleurs, typographies, mises en page, intro animée du coq). Les pages fixes d’origine sont dans `design/fragments/` (générées par `scripts/fragments.py` à partir des captures de `design/`).
- **Espace rédaction** : Keystatic, à l’adresse `/keystatic` (ou `/admin`). Les contenus sont des fichiers dans `content/`, enregistrés directement dans ce dépôt GitHub.
- **Médias** : `public/medias/` (images et PDF publics), `revue-pdf/` (PDF de la Revue JOGOO, servis seulement après l’embargo).

## Rubriques

| Rubrique | Adresse | Dossier |
| --- | --- | --- |
| Éditos | `/edito` | `content/editos` |
| Actualités | `/actualites` | `content/actualites` |
| Publications (notes de lecture) | `/publications` | `content/publications`, `content/auteurs` |
| Revue JOGOO | `/sous-sites/revue-jogoo` | `content/revue` |
| Revue Eboussi Studies (dans le Fonds) | `/sous-sites/fonds-eboussi-boulaga/eboussi-studies` (l’ancienne adresse redirige en 301) | `design/fragments` |
| JOGOO AI | `/sous-sites/jogoo-ai` | `lib/corpus.ts`, `app/api/jogoo-ai` |
| Agenda (dans la page Actualités) | `/actualites#agenda` | `content/agenda` |
| Flash | `/flash` | `content/flash` |
| Médiathèque | `/mediatheque` | `content/videos` |
| Appels à postes / contributions | `/recherche/...` | `content/postes`, `content/appels` |
| Pages fixes d’origine | leur adresse | `design/fragments/page__*.html` |
| Nouvelles pages | leur adresse | `content/pages` |
| Commentaires des éditos (modération) | sous chaque édito | `donnees/commentaires` |
| Bloc « En cours », coordonnées | Réglages du site | `content/reglages.json` |

## Philo Africaine Magazine en ligne

Les numéros se gèrent dans l’Espace rédaction (rubrique « Philo Africaine Magazine — numéros ») : PDF, couverture, sommaire, date de mise en ligne, durée d’embargo (12 mois par défaut) et nombre de pages lisibles pendant l’embargo (5 par défaut). Les PDF sont rangés dans `magazine-pdf/` (hors du dossier public) ; pendant l’embargo, le serveur ne livre qu’un extrait des premières pages, la visionneuse affiche ensuite une page « sous embargo ». À la fin de l’embargo, le numéro entier devient lisible et téléchargeable, sans intervention.

## Images et encadrés dans les textes

Dans l’éditeur riche (éditos, actualités, notes de lecture, pages…), le bouton « + » propose : **Image avec légende** (pleine largeur, à gauche, à droite ou centrée, le texte l’entoure), **Encadré** (titre, style sable / terracotta / sombre / filet, pleine largeur ou flottant) et **Citation mise en avant**.

## Embargo de la Revue JOGOO

Chaque article a une date de publication et une durée d’embargo (6 mois par défaut). Pendant l’embargo, le site n’affiche que le titre, l’auteur, le résumé et la référence ; le PDF est refusé. Les pages sont régénérées chaque jour : l’embargo se lève automatiquement.

## Mise en ligne sur Vercel

1. Sur vercel.com, **Add New → Project**, importer ce dépôt, puis **Deploy** (aucun réglage à changer).
2. Pour que l’Espace rédaction enregistre en ligne, ouvrir `https://<adresse-vercel>/keystatic` et suivre l’assistant « Set up GitHub App » de Keystatic. Il crée une application GitHub et fournit quatre variables à ajouter dans Vercel (Settings → Environment Variables) :
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, puis redéployer.
3. Nom de domaine (o2switch) : dans Vercel, Settings → Domains → ajouter `philoafricaine.org` et `www.philoafricaine.org`, puis reporter chez o2switch les enregistrements DNS indiqués par Vercel.

## Fonctions qui demandent un réglage dans Vercel

- **Commentaires des éditos** : ajouter `GITHUB_TOKEN`, un jeton GitHub « fine-grained » limité à ce dépôt avec l’autorisation *Contents : Read and write*. Les commentaires sont enregistrés dans `donnees/commentaires/` (sans redéploiement, grâce à `vercel.json`) et se modèrent dans l’Espace rédaction, rubrique « Commentaires (modération) » (case « Masquer »).
- **Lettre d’information** : ajouter `BREVO_API_KEY` et `BREVO_LIST_ID` (compte Brevo gratuit). `BREVO_LIST_ACTIVITES_ID` : liste « annonces des activités », où sont ajoutés les inscrits aux événements (sauf refus). Sans ces variables, le formulaire ouvre un e-mail d’inscription adressé à la rédaction.
- **JOGOO AI** (`/sous-sites/jogoo-ai`) : ajouter `ANTHROPIC_API_KEY` (clé de l’API Claude, compte Anthropic avec plafond de dépenses). Facultatif : `JOGOO_AI_MODELE` (par défaut `claude-sonnet-5-5`). Sans clé, l’assistant fonctionne en mode « bibliothèque » : il affiche les documents du corpus les plus pertinents, sans rédiger de réponse. Le corpus = les textes publiés sur le site (éditos, actualités, notes de lecture, fiches auteurs, flashs, Revue JOGOO — résumés seuls pendant l’embargo —, pages du Fonds Eboussi Boulaga) ; la clé reste côté serveur, avec une limite de 12 questions par visiteur toutes les 10 minutes.
- **Candidatures aux postes** : le formulaire prépare un e-mail à philoafricaine@gmail.com, auquel le candidat joint ses pièces.

## Développement local

```bash
npm install
npm run dev   # http://localhost:3000, Espace rédaction sur /keystatic (enregistre dans content/)
```

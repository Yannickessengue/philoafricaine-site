# philoafricaine.org — dossier de passation au webmaster

Nouveau site du Groupe JOGOO, prêt à remplacer l’ancien site sur **philoafricaine.org**.
Version de travail en ligne : https://philoafricaine-site.vercel.app

Préparé le 11 novembre 2026 à la demande de Yannick Essengue.

---

## 1. Ce qu’il faut savoir en une minute

| | |
|---|---|
| Code source | GitHub, dépôt **Yannickessengue/philoafricaine-site** (branche `main`, public) |
| Technologie | Next.js 15 (App Router), React 19, Tailwind CSS 4, Node 22 |
| Contenus | Fichiers dans le dépôt (`content/`), édités avec **Keystatic** (Espace rédaction, `/keystatic`) |
| Hébergement actuel | **Vercel**, équipe « groupe-jogoo », projet `philoafricaine-site` |
| Base de données | Aucune : tout est dans le dépôt Git |
| Déploiement | Automatique à chaque `git push` sur `main` |
| E-mails | Brevo (formulaires, lettre du lundi) |

**Recommandation : garder Vercel** et y rattacher simplement le domaine (section 3). C’est la voie la plus simple, gratuite à ce volume, et tout est déjà configuré. Un hébergement classique (OVH mutualisé, etc.) ne fait pas tourner Next.js.

---

## 2. Obtenir l’accès

Yannick vous invite :
1. **GitHub** : collaborateur du dépôt `Yannickessengue/philoafricaine-site` (Settings → Collaborators).
2. **Vercel** : membre de l’équipe « groupe-jogoo » (Team Settings → Members).

Les valeurs secrètes (clés API, mots de passe) **ne figurent ni dans le dépôt ni dans ce document** : elles sont déjà enregistrées dans Vercel ; si vous en avez besoin, Yannick vous les transmet par un canal privé.

---

## 3. Basculer philoafricaine.org vers le nouveau site

### 3.1 Avant la bascule
- Faire une **sauvegarde complète de l’ancien site** (fichiers + base de données), à conserver au moins un an.
- Relever la configuration DNS actuelle, notamment les enregistrements **MX** (messagerie) : ils ne doivent pas être modifiés.

### 3.2 Dans Vercel
Projet `philoafricaine-site` → **Settings → Domains** → ajouter :
- `philoafricaine.org`
- `www.philoafricaine.org` (redirigé vers `philoafricaine.org`, ou l’inverse selon votre préférence)

Vercel indique alors les enregistrements DNS exacts à créer.

### 3.3 Chez le registraire du domaine (zone DNS)
Valeurs habituelles (à confirmer avec ce qu’affiche Vercel) :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Supprimer les anciens enregistrements A/AAAA/CNAME du site web ; **ne pas toucher aux MX, SPF, DKIM, DMARC**. Le certificat HTTPS est émis automatiquement par Vercel (quelques minutes à quelques heures selon la propagation DNS).

### 3.4 Juste après la bascule
1. Dans Vercel → Settings → Environment Variables, ajouter **`NEXT_PUBLIC_SITE_URL` = `https://www.philoafricaine.org`** (ou sans `www`, selon le choix fait en 3.2), puis **redéployer** (Deployments → … → Redeploy, en décochant « Use project’s Ignore Build Step »).
   Cette valeur sert aux liens absolus : aperçus de partage, flux RSS des podcasts, e-mails, plan du site.
2. Vérifier la liste de contrôle (section 7).

---

## 4. Variables d’environnement (Vercel → Settings → Environment Variables)

| Variable | Rôle | État au 11/11/2026 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du site | **À ajouter à la bascule** |
| `BREVO_API_KEY` | Envoi des e-mails (formulaires, lettre) | Configurée |
| `BREVO_SENDER_EMAIL` | Expéditeur vérifié dans Brevo (`philoafricaine@gmail.com`) | Configurée |
| `BREVO_LIST_ID` | Liste Brevo des abonnés à la lettre du lundi | À ajouter (n° de la liste dans Brevo) |
| `CRON_SECRET` | Protège l’envoi automatique de la lettre (lundi 7 h UTC) | À ajouter (chaîne aléatoire longue) |
| `LIENS_ZOOM` | Liens Zoom envoyés aux inscrits, jamais publiés (JSON `{"slug-agenda": {"lien","id","code"}}`) | Configurée |
| `ANTHROPIC_API_KEY` | Active JOGOO AI (assistant de recherche) | À ajouter plus tard |
| `JOGOO_AI_MODELE` | Modèle utilisé par JOGOO AI (facultatif) | Facultatif |
| `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` | Commentaires et réactions des lecteurs (écriture dans le dépôt) | À ajouter |
| `GMAIL_APP_PASSWORD`, `GMAIL_USER` | Envoi de secours par Gmail si Brevo n’est pas configuré | Non utilisé (Brevo actif) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` + variables Keystatic | Espace rédaction en ligne (section 5) | À configurer |

Après tout ajout ou changement de variable : **redéployer**.

---

## 5. L’Espace rédaction (Keystatic)

- Adresse : `/keystatic` (ou `/admin`, qui y redirige).
- **En local** (`npm run dev`), Keystatic écrit directement dans les fichiers `content/`.
- **En ligne**, il faut le mode GitHub pour que les rédacteurs publient sans toucher au code :
  1. Ouvrir `https://<domaine>/keystatic` en local ou en ligne et suivre l’assistant « Connect to GitHub » : il crée une **GitHub App** liée au dépôt.
  2. Reporter dans Vercel les variables générées : `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`.
  3. Redéployer. Chaque enregistrement dans l’Espace rédaction devient alors un commit sur `main`, qui déclenche la mise en ligne (1 à 2 minutes).
- Documentation : https://keystatic.com/docs/github-mode

---

## 6. Organisation du code

```
app/                  Pages (App Router) et routes d’API
  (site)/             Site public en français
  en/                 Section anglaise
  api/formulaire/     Inscriptions et candidatures (e-mails Brevo)
  api/jogoo-ai/       Assistant JOGOO AI (recherche dans le corpus + Claude)
  api/newsletter/     Lettre du lundi (tâche planifiée, voir vercel.json)
  og/                 Images d’aperçu de partage
content/              TOUS les contenus (éditos, actualités, agenda, appels, publications, revue…)
public/medias/        Images, PDF, logos
design/fragments/     Gabarits HTML des pages statiques (accueil, sous-sites…)
scripts/fragments.py  Régénère design/fragments/ ; toute retouche manuelle d’un fragment doit y être ajoutée
lib/                  Lecture des contenus, formulaires, corpus de JOGOO AI, lettre, etc.
components/           Composants React
keystatic.config.ts   Schéma de l’Espace rédaction
vercel.json           Tâche planifiée (lettre du lundi) et règle d’ignorance des builds
```

Commandes :
```bash
npm install
npm run dev          # http://localhost:3000 (Espace rédaction local : /keystatic)
npx next build       # vérification avant mise en ligne
```

Particularité : `vercel.json` contient une règle `ignoreCommand` qui **n’effectue pas de nouveau build si aucun fichier n’a changé**. Pour forcer une reconstruction (après un changement de variable), utiliser « Redeploy » en décochant « Use project’s Ignore Build Step ».

---

## 7. Liste de contrôle après la bascule

- [ ] `https://philoafricaine.org` et `https://www.philoafricaine.org` répondent en HTTPS, l’un redirigeant vers l’autre.
- [ ] Accueil, Médiathèque, Publications, Actualités, Agenda, sous-sites (Revue JOGOO, Éditions, Fonds Eboussi Boulaga, JOGOO AI, Sankofa, Magazine) s’affichent.
- [ ] Section anglaise : `/en`.
- [ ] Un formulaire test (`/inscription/...` ou `/candidature/...`) envoie bien les copies à philoafricaine@gmail.com et fondseboussi@gmail.com.
- [ ] Les aperçus de partage (Facebook, WhatsApp) montrent la bonne image et la bonne adresse.
- [ ] `/podcasts/rss.xml`, `/sitemap.xml` et `/robots.txt` utilisent le nouveau domaine.
- [ ] La page `/direct` affiche le lecteur YouTube de la chaîne @groupejogoo.
- [ ] Les e-mails de la messagerie du domaine (si elle existe) fonctionnent toujours.
- [ ] Mettre à jour les liens provisoires `philoafricaine-site.vercel.app` sur la chaîne YouTube (description, liens de la chaîne et de deux playlists).
- [ ] Déclarer le nouveau site dans Google Search Console et y soumettre `/sitemap.xml`.

---

## 8. Anciennes adresses

Le nouveau site reprend la plupart des adresses de l’ancien (`/sous-sites/...`, `/edito/...`, etc.). Après la bascule, consulter dans Vercel → Logs les requêtes en **404** pendant quelques semaines ; pour chaque ancienne adresse encore visitée, ajouter une redirection dans `next.config.ts` (fonction `redirects()`).

---

## 9. Contacts

- Responsable éditorial et commanditaire : Yannick Essengue (Groupe JOGOO)
- Adresses de la rédaction : philoafricaine@gmail.com · fondseboussi@gmail.com

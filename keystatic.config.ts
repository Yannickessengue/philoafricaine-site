import { composantsTexte } from './lib/composants-texte';
import { config, collection, singleton, fields } from '@keystatic/core';

// En production (Vercel), l'Espace rédaction enregistre directement dans le dépôt GitHub.
// En local, il écrit dans les fichiers du dossier content/.
const storage = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
  ? ({ kind: 'github', repo: 'Yannickessengue/philoafricaine-site' } as const)
  : ({ kind: 'local' } as const);

// Éditeur de texte riche : gras, italique, intertitres, listes, citations, liens, images, tableaux.
const texte = (label: string, dossier: string) =>
  fields.markdoc({
    label,
    options: {
      image: { directory: `public/medias/uploads/${dossier}`, publicPath: `/medias/uploads/${dossier}/` },
    },
    components: composantsTexte,
  });

const image = (label: string, dossier: string, description?: string) =>
  fields.image({ label, description, directory: `public/medias/uploads/${dossier}`, publicPath: `/medias/uploads/${dossier}/` });

const fichier = (label: string, dossier: string) =>
  fields.file({ label, directory: `public/medias/uploads/${dossier}`, publicPath: `/medias/uploads/${dossier}/` });

export default config({
  storage,
  ui: {
    brand: { name: 'Groupe JOGOO · Espace rédaction' },
    navigation: {
      'Contenus du portail': ['editos', 'actualites', 'agenda', 'flash'],
      Publications: ['publications', 'auteurs'],
      'Revue JOGOO': ['revue'],
      'Philo Africaine Magazine': ['magazine'],
      Recherche: ['appels', 'postes'],
      Médiathèque: ['videos'],
      'Pages du site': ['pages', 'reglages'],
    },
  },
  collections: {
    editos: collection({
      label: 'Éditos',
      slugField: 'titre',
      path: 'content/editos/*',
      format: { contentField: 'contenu' },
      entryLayout: 'content',
      columns: ['titre', 'date'],
      schema: {
        titre: fields.slug({ name: { label: 'Titre de l’édito' }, slug: { label: 'Identifiant dans l’adresse' } }),
        date: fields.date({ label: 'Date de parution', validation: { isRequired: true } }),
        surtitre: fields.text({ label: 'Sur-titre', description: 'Ex. : L’invité' }),
        soustitre: fields.text({ label: 'Sous-titre' }),
        accroche: fields.text({ label: 'Accroche', multiline: true, description: 'Le paragraphe en gras juste sous le titre.' }),
        exergue: fields.text({ label: 'Citation d’exergue', multiline: true }),
        exergueAuteur: fields.text({ label: 'Auteur de la citation' }),
        image: image('Image principale', 'editos'),
        imageDescription: fields.text({ label: 'Description de l’image' }),
        signature: fields.text({ label: 'Signature', description: 'Nom, fonction, institution' }),
        portrait: image('Portrait du signataire', 'editos'),
        pdf: fichier('PDF de l’édito', 'editos'),
        motsCles: fields.text({ label: 'Hashtags / mots-clés', description: 'Séparés par des virgules' }),
        contenu: texte('Texte de l’édito', 'editos'),
        conclusion: fields.text({ label: 'Conclusion', multiline: true }),
        references: fields.text({ label: 'Références', multiline: true, description: 'Une référence par paragraphe' }),
      },
    }),

    actualites: collection({
      label: 'Actualités',
      slugField: 'titre',
      path: 'content/actualites/*',
      format: { contentField: 'contenu' },
      entryLayout: 'content',
      columns: ['titre', 'date'],
      schema: {
        titre: fields.slug({ name: { label: 'Titre' }, slug: { label: 'Identifiant dans l’adresse' } }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        auteur: fields.text({ label: 'Auteur (signature)' }),
        resume: fields.text({ label: 'Résumé (cartes et accueil)', multiline: true, description: 'Deux ou trois phrases. Laissé vide : le début du texte est utilisé.' }),
        image: image('Image d’illustration', 'actualites', 'Affichée en tête de l’actualité, toujours au format 16:10.'),
        imageDescription: fields.text({ label: 'Description de l’image' }),
        imageCredit: fields.text({ label: 'Crédit de l’image' }),
        contenu: texte('Texte', 'actualites'),
      },
    }),

    agenda: collection({
      label: 'Agenda',
      slugField: 'intitule',
      path: 'content/agenda/*',
      format: { data: 'yaml' },
      columns: ['intitule', 'date'],
      schema: {
        intitule: fields.slug({ name: { label: 'Intitulé' } }),
        date: fields.date({ label: 'Date (pour le tri)', validation: { isRequired: true } }),
        dateAffichee: fields.text({ label: 'Date affichée', description: 'Ex. : Décembre 2025' }),
        lieu: fields.text({ label: 'Lieu' }),
        aConfirmer: fields.checkbox({ label: 'Date à confirmer' }),
        ordre: fields.integer({ label: 'Ordre (à date égale)', defaultValue: 0 }),
      },
    }),

    flash: collection({
      label: 'Flash d’entrée',
      slugField: 'titre',
      path: 'content/flash/*',
      format: { contentField: 'contenu' },
      entryLayout: 'content',
      schema: {
        titre: fields.slug({ name: { label: 'Titre du texte' } }),
        ordre: fields.integer({ label: 'Ordre d’affichage', defaultValue: 0 }),
        auteur: fields.text({ label: 'Voix / auteur' }),
        lieu: fields.text({ label: 'Ville, pays' }),
        image: image('Image', 'flash'),
        imageDescription: fields.text({ label: 'Description de l’image' }),
        imageLegende: fields.text({ label: 'Légende de l’image' }),
        imageCredit: fields.text({ label: 'Crédit de l’image' }),
        phrase: fields.text({ label: 'Phrase forte détachée', multiline: true }),
        contenu: texte('Texte', 'flash'),
      },
    }),

    publications: collection({
      label: 'Publications (notes de lecture)',
      slugField: 'titre',
      path: 'content/publications/*',
      format: { contentField: 'contenu' },
      entryLayout: 'content',
      columns: ['titre', 'auteurOuvrage'],
      schema: {
        titre: fields.slug({ name: { label: 'Titre de l’ouvrage' }, slug: { label: 'Identifiant dans l’adresse' } }),
        auteurOuvrage: fields.text({ label: 'Auteur de l’ouvrage' }),
        auteurFiche: fields.relationship({ label: 'Fiche auteur', collection: 'auteurs' }),
        editeur: fields.text({ label: 'Éditeur' }),
        annee: fields.text({ label: 'Année' }),
        une: fields.checkbox({ label: 'Mettre à la une' }),
        motsCles: fields.text({ label: 'Mots-clés', description: 'Séparés par des virgules' }),
        resume: fields.text({ label: 'Résumé court (cartes)', multiline: true }),
        couverture: image('Couverture', 'publications'),
        lienLibelle: fields.text({ label: 'Libellé du lien externe' }),
        lienUrl: fields.url({ label: 'URL du lien externe' }),
        contenu: texte('Note de lecture', 'publications'),
      },
    }),

    auteurs: collection({
      label: 'Auteurs',
      slugField: 'nom',
      path: 'content/auteurs/*',
      format: { contentField: 'notice' },
      entryLayout: 'content',
      schema: {
        nom: fields.slug({ name: { label: 'Nom' } }),
        dates: fields.text({ label: 'Dates de vie' }),
        pays: fields.text({ label: 'Pays' }),
        portrait: image('Portrait', 'auteurs'),
        creditPhoto: fields.text({ label: 'Crédit photo' }),
        notice: texte('Notice biographique', 'auteurs'),
      },
    }),

    revue: collection({
      label: 'Revue JOGOO · articles',
      slugField: 'titre',
      path: 'content/revue/*',
      format: { contentField: 'contenu' },
      entryLayout: 'content',
      columns: ['titre', 'auteurs', 'datePublication'],
      schema: {
        titre: fields.slug({ name: { label: 'Titre de l’article' }, slug: { label: 'Identifiant dans l’adresse' } }),
        auteurs: fields.text({ label: 'Auteur(s)' }),
        affiliation: fields.text({ label: 'Affiliation' }),
        numero: fields.text({ label: 'Numéro', defaultValue: 'N° 1 — « L’être africain »' }),
        rubrique: fields.select({
          label: 'Rubrique',
          options: [
            { label: 'Présentation du numéro', value: 'presentation' },
            { label: 'Texte d’archive', value: 'archive' },
            { label: 'Article', value: 'article' },
            { label: 'Recension', value: 'recension' },
          ],
          defaultValue: 'article',
        }),
        langue: fields.select({
          label: 'Langue de l’article',
          options: [
            { label: 'Français', value: 'fr' },
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
            { label: 'Português', value: 'pt' },
            { label: 'العربية', value: 'ar' },
          ],
          defaultValue: 'fr',
        }),
        section: fields.text({ label: 'Section du sommaire', description: 'Ex. : Réflexions, Point de vue, Varia, Recensions' }),
        ordre: fields.integer({ label: 'Ordre dans le numéro', defaultValue: 0 }),
        datePublication: fields.date({ label: 'Date de publication', validation: { isRequired: true } }),
        embargoMois: fields.integer({
          label: 'Embargo (en mois)',
          defaultValue: 6,
          description: 'Pendant l’embargo, seuls le titre, l’auteur et le résumé sont visibles. Mettre 0 pour un accès libre immédiat.',
        }),
        pages: fields.text({ label: 'Pages', description: 'Ex. : p. 7-20' }),
        resume: fields.text({ label: 'Résumé', multiline: true }),
        motsCles: fields.text({ label: 'Mots-clés', description: 'Séparés par des virgules' }),
        // Les PDF de la Revue sont rangés hors du dossier public : ils ne sont servis qu'après l'embargo.
        pdf: fields.file({ label: 'Texte intégral (PDF)', directory: 'revue-pdf', publicPath: '/revue/pdf/' }),
        bio: fields.text({ label: 'Notice sur l’auteur', multiline: true }),
        citation: fields.text({ label: 'Pour citer cet article', multiline: true }),
        contenu: texte('Texte (facultatif, en plus du PDF)', 'revue'),
      },
    }),

    appels: collection({
      label: 'Appels à contributions',
      slugField: 'titre',
      path: 'content/appels/*',
      format: { contentField: 'descriptif' },
      entryLayout: 'content',
      schema: {
        titre: fields.slug({ name: { label: 'Titre' } }),
        type: fields.text({ label: 'Type', description: 'Ex. : Journée d’étude, Ouvrage collectif' }),
        dateEvenement: fields.text({ label: 'Date de l’événement' }),
        lieu: fields.text({ label: 'Lieu' }),
        dateLimite: fields.text({ label: 'Date limite (affichée)' }),
        contact: fields.text({ label: 'Contact' }),
        fichier: fichier('Fichier de l’appel (PDF)', 'appels'),
        fichierLibelle: fields.text({ label: 'Libellé du fichier', defaultValue: 'Télécharger l’appel (PDF)' }),
        ouvert: fields.checkbox({ label: 'Appel ouvert', defaultValue: true }),
        cloture: fields.date({ label: 'Date de clôture', description: 'Passée cette date, l’appel s’affiche automatiquement comme clos.' }),
        ordre: fields.integer({ label: 'Ordre', defaultValue: 0 }),
        descriptif: texte('Descriptif', 'appels'),
      },
    }),

    postes: collection({
      label: 'Appels à postes (axes de recherche)',
      slugField: 'intitule',
      path: 'content/postes/*',
      format: { contentField: 'missions' },
      entryLayout: 'content',
      schema: {
        intitule: fields.slug({ name: { label: 'Intitulé de l’axe' } }),
        numero: fields.integer({ label: 'Numéro d’axe' }),
        pourvu: fields.checkbox({ label: 'Poste pourvu' }),
        missions: texte('Missions', 'postes'),
      },
    }),

    videos: collection({
      label: 'Médiathèque (vidéos)',
      slugField: 'titre',
      path: 'content/videos/*',
      format: { data: 'yaml' },
      schema: {
        titre: fields.slug({ name: { label: 'Titre de la vidéo' } }),
        rubrique: fields.text({ label: 'Rubrique' }),
        noteRubrique: fields.text({ label: 'Note de rubrique' }),
        ordre: fields.integer({ label: 'Ordre', defaultValue: 0 }),
        url: fields.url({ label: 'URL' }),
      },
    }),

    magazine: collection({
      label: 'Philo Africaine Magazine — numéros',
      slugField: 'numero',
      path: 'content/magazine/*',
      format: { data: 'yaml' },
      columns: ['numero', 'datePublication'],
      schema: {
        numero: fields.slug({ name: { label: 'Numéro (ex. 001)' } }),
        titre: fields.text({ label: 'Titre du dossier' }),
        periode: fields.text({ label: 'Période indiquée en couverture', description: 'Ex. : Déc. 2025 – Fév. 2026' }),
        datePublication: fields.date({ label: 'Date de mise en ligne', description: 'Point de départ de l’embargo.', validation: { isRequired: true } }),
        embargoMois: fields.integer({ label: 'Durée de l’embargo (mois)', defaultValue: 12, description: 'Pendant l’embargo, seules les premières pages sont lisibles en ligne.' }),
        pagesApercu: fields.integer({ label: 'Pages lisibles pendant l’embargo', defaultValue: 5, description: 'Couverture, éditorial, sommaire…' }),
        pdf: fields.file({ label: 'PDF du numéro', directory: 'magazine-pdf', publicPath: '/magazine/pdf/' }),
        couverture: fields.image({ label: 'Image de couverture', directory: 'public/medias/uploads/magazine', publicPath: '/medias/uploads/magazine/' }),
        resume: fields.text({ label: 'Présentation du numéro', multiline: true }),
        sommaire: fields.array(
          fields.object({ page: fields.text({ label: 'Page' }), rubrique: fields.text({ label: 'Rubrique' }), titre: fields.text({ label: 'Titre' }) }),
          { label: 'Sommaire', itemLabel: (p) => `${p.fields.page.value} · ${p.fields.rubrique.value} — ${p.fields.titre.value}` },
        ),
        maquette: fields.checkbox({ label: 'Version de travail (maquette)', description: 'Affiche la mention « maquette » sur le site.' }),
      },
    }),
    commentaires: collection({
      label: 'Commentaires (modération)',
      slugField: 'edito',
      path: 'donnees/commentaires/*',
      format: { data: 'json' },
      schema: {
        edito: fields.slug({ name: { label: 'Édito (identifiant)' } }),
        liste: fields.array(
          fields.object({
            nom: fields.text({ label: 'Nom' }),
            texte: fields.text({ label: 'Commentaire', multiline: true }),
            date: fields.text({ label: 'Date' }),
            masque: fields.checkbox({ label: 'Masquer ce commentaire' }),
          }),
          { label: 'Commentaires', itemLabel: (p) => `${p.fields.masque.value ? '🚫 ' : ''}${p.fields.nom.value} : ${p.fields.texte.value.slice(0, 60)}` },
        ),
      },
    }),
    pages: collection({
      label: 'Pages fixes',
      slugField: 'titre',
      path: 'content/pages/**',
      format: { contentField: 'contenu' },
      entryLayout: 'content',
      columns: ['titre', 'adresse'],
      schema: {
        titre: fields.slug({ name: { label: 'Titre de la page' } }),
        adresse: fields.text({ label: 'Adresse de la page', description: 'Ex. : /le-groupe' }),
        description: fields.text({ label: 'Description (moteurs de recherche)', multiline: true }),
        contenu: texte('Contenu', 'pages'),
      },
    }),
  },
  singletons: {
    reglages: singleton({
      label: 'Réglages du site',
      path: 'content/reglages',
      format: { data: 'json' },
      schema: {
        email: fields.text({ label: 'E-mail principal' }),
        emailFonds: fields.text({ label: 'E-mail Fonds Eboussi' }),
        whatsapp: fields.text({ label: 'WhatsApp' }),
        facebook: fields.url({ label: 'Facebook' }),
        x: fields.url({ label: 'X / Twitter' }),
        linkedin: fields.url({ label: 'LinkedIn' }),
        instagram: fields.url({ label: 'Instagram' }),
        youtube: fields.url({ label: 'YouTube' }),
        mentionLegale: fields.text({ label: 'Mention légale (pied de page)', multiline: true }),
        enCours: fields.array(fields.text({ label: 'Chantier' }), {
          label: 'Bloc « En cours » (page Actualités)',
          itemLabel: (p) => p.value || 'Chantier',
        }),
      },
    }),
  },
});

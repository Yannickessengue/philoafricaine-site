/* Schéma du back-office : dérivé de keystatic.config.ts (mêmes champs, mêmes noms),
   pour que les contenus enregistrés dans Neon aient exactement la forme attendue par le site.
   Régénérer si keystatic.config.ts change. */

export type FieldType =
  | "text" | "textarea" | "markdown" | "lines" | "json"
  | "bool" | "date" | "number" | "select" | "image" | "file";

export type Field = { name: string; label: string; type: FieldType; help?: string; options?: string[]; full?: boolean; optional?: boolean };

export type EntitySchema = {
  key: string;
  singular: string;
  plural: string;
  route: string;
  publicPaths: string[];
  titleField: string;
  contentField: string | null;
  list: { key: string; label: string; kind?: "status" | "bool" | "date" }[];
  fields: Field[];
};

const LISTE: EntitySchema[] = [
 {
  "key": "editos",
  "singular": "Édito",
  "plural": "Éditos",
  "route": "editos",
  "publicPaths": [
   "/edito",
   "/"
  ],
  "titleField": "titre",
  "contentField": "contenu",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "date",
    "label": "Date",
    "kind": "date"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre de l’édito",
    "type": "text"
   },
   {
    "name": "date",
    "label": "Date de parution",
    "type": "date"
   },
   {
    "name": "surtitre",
    "label": "Sur-titre",
    "type": "text"
   },
   {
    "name": "soustitre",
    "label": "Sous-titre",
    "type": "text"
   },
   {
    "name": "accroche",
    "label": "Accroche",
    "type": "textarea",
    "full": true
   },
   {
    "name": "exergue",
    "label": "Citation d’exergue",
    "type": "textarea",
    "full": true
   },
   {
    "name": "exergueAuteur",
    "label": "Auteur de la citation",
    "type": "text"
   },
   {
    "name": "image",
    "label": "Image principale",
    "type": "image"
   },
   {
    "name": "imageDescription",
    "label": "Description de l’image",
    "type": "text"
   },
   {
    "name": "signature",
    "label": "Signature",
    "type": "text"
   },
   {
    "name": "portrait",
    "label": "Portrait du signataire",
    "type": "image"
   },
   {
    "name": "pdf",
    "label": "PDF de l’édito",
    "type": "file"
   },
   {
    "name": "motsCles",
    "label": "Hashtags / mots-clés",
    "type": "text"
   },
   {
    "name": "contenu",
    "label": "Texte",
    "type": "markdown",
    "full": true
   },
   {
    "name": "conclusion",
    "label": "Conclusion",
    "type": "textarea",
    "full": true
   },
   {
    "name": "references",
    "label": "Références",
    "type": "textarea",
    "full": true
   }
  ]
 },
 {
  "key": "actualites",
  "singular": "Actualité",
  "plural": "Actualités",
  "route": "actualites",
  "publicPaths": [
   "/actualites",
   "/"
  ],
  "titleField": "titre",
  "contentField": "contenu",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "date",
    "label": "Date",
    "kind": "date"
   },
   {
    "key": "auteur",
    "label": "Auteur (signature)"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre",
    "type": "text"
   },
   {
    "name": "date",
    "label": "Date",
    "type": "date"
   },
   {
    "name": "auteur",
    "label": "Auteur (signature)",
    "type": "text"
   },
   {
    "name": "resume",
    "label": "Résumé (cartes et accueil)",
    "type": "textarea",
    "full": true
   },
   {
    "name": "image",
    "label": "Image d’illustration",
    "type": "image"
   },
   {
    "name": "imageDescription",
    "label": "Description de l’image",
    "type": "text"
   },
   {
    "name": "imageCredit",
    "label": "Crédit de l’image",
    "type": "text"
   },
   {
    "name": "imageEntiere",
    "label": "Montrer l’image entière (affiche)",
    "type": "bool"
   },
   {
    "name": "espace",
    "label": "Espace (jogoo = général, fonds = Fonds Eboussi Boulaga)",
    "type": "select",
    "options": [
     "jogoo",
     "fonds"
    ]
   },
   {
    "name": "contenu",
    "label": "Texte",
    "type": "markdown",
    "full": true
   }
  ]
 },
 {
  "key": "agenda",
  "singular": "Événement",
  "plural": "Agenda",
  "route": "agenda",
  "publicPaths": [
   "/actualites",
   "/"
  ],
  "titleField": "intitule",
  "contentField": null,
  "list": [
   {
    "key": "intitule",
    "label": "Titre"
   },
   {
    "key": "date",
    "label": "Date",
    "kind": "date"
   },
   {
    "key": "ordre",
    "label": "Ordre (à date égale)"
   },
   {
    "key": "lieu",
    "label": "Lieu"
   }
  ],
  "fields": [
   {
    "name": "intitule",
    "label": "Intitulé",
    "type": "text"
   },
   {
    "name": "date",
    "label": "Date (pour le tri)",
    "type": "date"
   },
   {
    "name": "dateAffichee",
    "label": "Date affichée",
    "type": "text"
   },
   {
    "name": "lieu",
    "label": "Lieu",
    "type": "text"
   },
   {
    "name": "aConfirmer",
    "label": "Date à confirmer",
    "type": "bool"
   },
   {
    "name": "ordre",
    "label": "Ordre (à date égale)",
    "type": "number"
   },
   {
    "name": "heure",
    "label": "Heure",
    "type": "text"
   },
   {
    "name": "organisateur",
    "label": "Organisé par",
    "type": "select",
    "options": [
     "jogoo",
     "fonds",
     "revue",
     "editions"
    ]
   },
   {
    "name": "presentation",
    "label": "Présentation courte",
    "type": "textarea",
    "full": true
   },
   {
    "name": "fichier",
    "label": "Document à télécharger (PDF)",
    "type": "file"
   },
   {
    "name": "affiche",
    "label": "Visuel / affiche (chemin de l’image)",
    "type": "text"
   },
   {
    "name": "afficheApercu",
    "label": "Aperçu de l’affiche (facultatif)",
    "type": "text"
   },
   {
    "name": "inscription",
    "label": "Formulaire d’inscription en ligne",
    "type": "bool"
   },
   {
    "name": "enDirect",
    "label": "Retransmis en direct sur le site",
    "type": "bool"
   }
  ]
 },
 {
  "key": "flash",
  "singular": "Texte du Flash",
  "plural": "Flash d’entrée",
  "route": "flash",
  "publicPaths": [
   "/flash",
   "/"
  ],
  "titleField": "titre",
  "contentField": "contenu",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "auteur",
    "label": "Voix / auteur"
   },
   {
    "key": "ordre",
    "label": "Ordre d’affichage"
   },
   {
    "key": "lieu",
    "label": "Ville, pays"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre du texte",
    "type": "text"
   },
   {
    "name": "ordre",
    "label": "Ordre d’affichage",
    "type": "number"
   },
   {
    "name": "auteur",
    "label": "Voix / auteur",
    "type": "text"
   },
   {
    "name": "lieu",
    "label": "Ville, pays",
    "type": "text"
   },
   {
    "name": "image",
    "label": "Image",
    "type": "image"
   },
   {
    "name": "imageDescription",
    "label": "Description de l’image",
    "type": "text"
   },
   {
    "name": "imageLegende",
    "label": "Légende de l’image",
    "type": "text"
   },
   {
    "name": "imageCredit",
    "label": "Crédit de l’image",
    "type": "text"
   },
   {
    "name": "phrase",
    "label": "Phrase forte détachée",
    "type": "textarea",
    "full": true
   },
   {
    "name": "contenu",
    "label": "Texte",
    "type": "markdown",
    "full": true
   }
  ]
 },
 {
  "key": "publications",
  "singular": "Note de lecture",
  "plural": "Publications (notes de lecture)",
  "route": "publications",
  "publicPaths": [
   "/publications",
   "/"
  ],
  "titleField": "titre",
  "contentField": "contenu",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "auteurOuvrage",
    "label": "Auteur de l’ouvrage"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre de l’ouvrage",
    "type": "text"
   },
   {
    "name": "auteurOuvrage",
    "label": "Auteur de l’ouvrage",
    "type": "text"
   },
   {
    "name": "auteurFiche",
    "label": "Fiche auteur",
    "type": "text",
    "help": "identifiant de la fiche auteur (ex. achille-mbembe)"
   },
   {
    "name": "editeur",
    "label": "Éditeur",
    "type": "text"
   },
   {
    "name": "annee",
    "label": "Année",
    "type": "text"
   },
   {
    "name": "une",
    "label": "Mettre à la une",
    "type": "bool"
   },
   {
    "name": "motsCles",
    "label": "Mots-clés",
    "type": "text"
   },
   {
    "name": "resume",
    "label": "Résumé court (cartes)",
    "type": "textarea",
    "full": true
   },
   {
    "name": "couverture",
    "label": "Couverture",
    "type": "image"
   },
   {
    "name": "vignette",
    "label": "Vignette de partage 16/9 (ex. : /medias/publications/vignettes/ouvrage.jpg)",
    "type": "text"
   },
   {
    "name": "lienLibelle",
    "label": "Libellé du lien externe",
    "type": "text"
   },
   {
    "name": "lienUrl",
    "label": "URL du lien externe",
    "type": "text",
    "help": "adresse complète (https://…)"
   },
   {
    "name": "contenu",
    "label": "Texte",
    "type": "markdown",
    "full": true
   }
  ]
 },
 {
  "key": "auteurs",
  "singular": "Auteur",
  "plural": "Auteurs",
  "route": "auteurs",
  "publicPaths": [
   "/publications"
  ],
  "titleField": "nom",
  "contentField": "notice",
  "list": [
   {
    "key": "nom",
    "label": "Titre"
   }
  ],
  "fields": [
   {
    "name": "nom",
    "label": "Nom",
    "type": "text"
   },
   {
    "name": "dates",
    "label": "Dates de vie",
    "type": "text"
   },
   {
    "name": "pays",
    "label": "Pays",
    "type": "text"
   },
   {
    "name": "portrait",
    "label": "Portrait",
    "type": "image"
   },
   {
    "name": "creditPhoto",
    "label": "Crédit photo",
    "type": "text"
   },
   {
    "name": "notice",
    "label": "Notice biographique",
    "type": "markdown",
    "full": true
   }
  ]
 },
 {
  "key": "revue",
  "singular": "Article",
  "plural": "Revue JOGOO · articles",
  "route": "revue",
  "publicPaths": [
   "/sous-sites/revue-jogoo"
  ],
  "titleField": "titre",
  "contentField": "contenu",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "datePublication",
    "label": "Date",
    "kind": "date"
   },
   {
    "key": "auteurs",
    "label": "Auteur(s)"
   },
   {
    "key": "rubrique",
    "label": "Rubrique"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre de l’article",
    "type": "text"
   },
   {
    "name": "auteurs",
    "label": "Auteur(s)",
    "type": "text"
   },
   {
    "name": "affiliation",
    "label": "Affiliation",
    "type": "text"
   },
   {
    "name": "numero",
    "label": "Numéro",
    "type": "text"
   },
   {
    "name": "rubrique",
    "label": "Rubrique",
    "type": "select",
    "options": [
     "presentation",
     "archive",
     "article",
     "recension"
    ]
   },
   {
    "name": "langue",
    "label": "Langue de l’article",
    "type": "select",
    "options": [
     "fr",
     "en",
     "es",
     "pt",
     "ar"
    ]
   },
   {
    "name": "section",
    "label": "Section du sommaire",
    "type": "text"
   },
   {
    "name": "ordre",
    "label": "Ordre dans le numéro",
    "type": "number"
   },
   {
    "name": "datePublication",
    "label": "Date de publication",
    "type": "date"
   },
   {
    "name": "embargoMois",
    "label": "Embargo (en mois)",
    "type": "number"
   },
   {
    "name": "pages",
    "label": "Pages",
    "type": "text"
   },
   {
    "name": "resume",
    "label": "Résumé",
    "type": "textarea",
    "full": true
   },
   {
    "name": "motsCles",
    "label": "Mots-clés",
    "type": "text"
   },
   {
    "name": "pdf",
    "label": "Texte intégral (PDF)",
    "type": "file"
   },
   {
    "name": "bio",
    "label": "Notice sur l’auteur",
    "type": "textarea",
    "full": true
   },
   {
    "name": "citation",
    "label": "Pour citer cet article",
    "type": "textarea",
    "full": true
   },
   {
    "name": "contenu",
    "label": "Texte",
    "type": "markdown",
    "full": true
   }
  ]
 },
 {
  "key": "magazine",
  "singular": "Numéro",
  "plural": "Philo Africaine Magazine — numéros",
  "route": "magazine",
  "publicPaths": [
   "/sous-sites/philo-africaine-magazine"
  ],
  "titleField": "numero",
  "contentField": null,
  "list": [
   {
    "key": "numero",
    "label": "Titre"
   },
   {
    "key": "datePublication",
    "label": "Date",
    "kind": "date"
   }
  ],
  "fields": [
   {
    "name": "numero",
    "label": "Numéro (ex. 001)",
    "type": "text"
   },
   {
    "name": "titre",
    "label": "Titre du dossier",
    "type": "text"
   },
   {
    "name": "periode",
    "label": "Période indiquée en couverture",
    "type": "text"
   },
   {
    "name": "datePublication",
    "label": "Date de mise en ligne",
    "type": "date"
   },
   {
    "name": "embargoMois",
    "label": "Durée de l’embargo (mois)",
    "type": "number"
   },
   {
    "name": "pagesApercu",
    "label": "Pages lisibles pendant l’embargo",
    "type": "number"
   },
   {
    "name": "pdf",
    "label": "PDF du numéro",
    "type": "file"
   },
   {
    "name": "couverture",
    "label": "Image de couverture",
    "type": "image"
   },
   {
    "name": "resume",
    "label": "Présentation du numéro",
    "type": "textarea",
    "full": true
   },
   {
    "name": "sommaire",
    "label": "Sommaire",
    "type": "json",
    "help": "liste au format JSON",
    "full": true
   },
   {
    "name": "maquette",
    "label": "Version de travail (maquette)",
    "type": "bool"
   }
  ]
 },
 {
  "key": "appels",
  "singular": "Appel à contributions",
  "plural": "Appels à contributions",
  "route": "appels",
  "publicPaths": [
   "/recherche"
  ],
  "titleField": "titre",
  "contentField": "descriptif",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "cloture",
    "label": "Date",
    "kind": "date"
   },
   {
    "key": "ordre",
    "label": "Ordre"
   },
   {
    "key": "lieu",
    "label": "Lieu"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre",
    "type": "text"
   },
   {
    "name": "type",
    "label": "Type",
    "type": "text"
   },
   {
    "name": "image",
    "label": "Image (facultative)",
    "type": "image"
   },
   {
    "name": "imageLegende",
    "label": "Légende de l’image",
    "type": "text"
   },
   {
    "name": "dateEvenement",
    "label": "Date de l’événement",
    "type": "text"
   },
   {
    "name": "lieu",
    "label": "Lieu",
    "type": "text"
   },
   {
    "name": "dateLimite",
    "label": "Date limite (affichée)",
    "type": "text"
   },
   {
    "name": "contact",
    "label": "Contact",
    "type": "text"
   },
   {
    "name": "fichier",
    "label": "Fichier de l’appel (PDF)",
    "type": "file"
   },
   {
    "name": "fichierLibelle",
    "label": "Libellé du fichier",
    "type": "text"
   },
   {
    "name": "ouvert",
    "label": "Appel ouvert",
    "type": "bool"
   },
   {
    "name": "cloture",
    "label": "Date de clôture",
    "type": "date"
   },
   {
    "name": "ordre",
    "label": "Ordre",
    "type": "number"
   },
   {
    "name": "formulaire",
    "label": "Formulaire de candidature en ligne",
    "type": "select",
    "options": [
     "aucun",
     "communication",
     "article",
     "seminaire",
     "masterclass"
    ]
   },
   {
    "name": "seances",
    "label": "Séances proposées (une par ligne)",
    "type": "textarea",
    "full": true
   },
   {
    "name": "descriptif",
    "label": "Descriptif",
    "type": "markdown",
    "full": true
   }
  ]
 },
 {
  "key": "postes",
  "singular": "Axe de recherche",
  "plural": "Appels à postes (axes de recherche)",
  "route": "postes",
  "publicPaths": [
   "/recherche/appels-a-postes"
  ],
  "titleField": "intitule",
  "contentField": "missions",
  "list": [
   {
    "key": "intitule",
    "label": "Titre"
   },
   {
    "key": "numero",
    "label": "Numéro d’axe"
   }
  ],
  "fields": [
   {
    "name": "intitule",
    "label": "Intitulé de l’axe",
    "type": "text"
   },
   {
    "name": "numero",
    "label": "Numéro d’axe",
    "type": "number"
   },
   {
    "name": "pourvu",
    "label": "Poste pourvu",
    "type": "bool"
   },
   {
    "name": "missions",
    "label": "Missions",
    "type": "markdown",
    "full": true
   }
  ]
 },
 {
  "key": "videos",
  "singular": "Vidéo",
  "plural": "Médiathèque (vidéos)",
  "route": "videos",
  "publicPaths": [
   "/mediatheque"
  ],
  "titleField": "titre",
  "contentField": null,
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "rubrique",
    "label": "Rubrique"
   },
   {
    "key": "ordre",
    "label": "Ordre"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre de la vidéo",
    "type": "text"
   },
   {
    "name": "rubrique",
    "label": "Rubrique",
    "type": "text"
   },
   {
    "name": "noteRubrique",
    "label": "Note de rubrique",
    "type": "text"
   },
   {
    "name": "ordre",
    "label": "Ordre",
    "type": "number"
   },
   {
    "name": "url",
    "label": "URL",
    "type": "text",
    "help": "adresse complète (https://…)"
   }
  ]
 },
 {
  "key": "minutes",
  "singular": "Épisode",
  "plural": "Les 5 minutes du chant du coq",
  "route": "minutes",
  "publicPaths": [
   "/les-5-minutes-du-chant-du-coq"
  ],
  "titleField": "titre",
  "contentField": "contenu",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "date",
    "label": "Date",
    "kind": "date"
   },
   {
    "key": "numero",
    "label": "Numéro de l’épisode"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Concept expliqué",
    "type": "text"
   },
   {
    "name": "date",
    "label": "Date de publication",
    "type": "date"
   },
   {
    "name": "numero",
    "label": "Numéro de l’épisode",
    "type": "number"
   },
   {
    "name": "philosophe",
    "label": "Philosophe qui explique",
    "type": "text"
   },
   {
    "name": "fonction",
    "label": "Fonction, institution",
    "type": "text"
   },
   {
    "name": "portrait",
    "label": "Portrait du philosophe",
    "type": "image"
   },
   {
    "name": "video",
    "label": "Lien de la vidéo (YouTube ou WebTV)",
    "type": "text",
    "help": "adresse complète (https://…)"
   },
   {
    "name": "fichierVideo",
    "label": "Ou fichier vidéo (MP4, 5 min, 100 Mo au plus)",
    "type": "file"
   },
   {
    "name": "affiche",
    "label": "Image d’affiche de la vidéo",
    "type": "image"
   },
   {
    "name": "duree",
    "label": "Durée affichée",
    "type": "text"
   },
   {
    "name": "definition",
    "label": "Le concept en une phrase",
    "type": "textarea",
    "full": true
   },
   {
    "name": "contenu",
    "label": "Texte",
    "type": "markdown",
    "full": true
   },
   {
    "name": "references",
    "label": "Pour aller plus loin",
    "type": "textarea",
    "full": true
   },
   {
    "name": "motsCles",
    "label": "Mots-clés",
    "type": "text"
   }
  ]
 },
 {
  "key": "podcasts",
  "singular": "Épisode",
  "plural": "Podcasts (accueil)",
  "route": "podcasts",
  "publicPaths": [
   "/"
  ],
  "titleField": "titre",
  "contentField": null,
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "ordre",
    "label": "Ordre"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre de l’épisode",
    "type": "text"
   },
   {
    "name": "serie",
    "label": "Série ou ouvrage",
    "type": "text"
   },
   {
    "name": "ordre",
    "label": "Ordre",
    "type": "number"
   },
   {
    "name": "audio",
    "label": "Fichier audio (m4a ou mp3)",
    "type": "file"
   },
   {
    "name": "duree",
    "label": "Durée affichée",
    "type": "text"
   },
   {
    "name": "description",
    "label": "Descriptif",
    "type": "textarea",
    "full": true
   },
   {
    "name": "source",
    "label": "Référence du texte",
    "type": "text"
   }
  ]
 },
 {
  "key": "chronologie",
  "singular": "Événement passé",
  "plural": "Notre histoire (chronologie)",
  "route": "chronologie",
  "publicPaths": [
   "/notre-histoire"
  ],
  "titleField": "titre",
  "contentField": null,
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   },
   {
    "key": "date",
    "label": "Date",
    "kind": "date"
   },
   {
    "key": "lieu",
    "label": "Lieu"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Intitulé",
    "type": "text"
   },
   {
    "name": "date",
    "label": "Date (pour le tri)",
    "type": "date"
   },
   {
    "name": "dateAffichee",
    "label": "Date affichée",
    "type": "text"
   },
   {
    "name": "lieu",
    "label": "Lieu",
    "type": "text"
   },
   {
    "name": "categorie",
    "label": "Type",
    "type": "select",
    "options": [
     "institution",
     "fondation",
     "conference",
     "colloque",
     "journee",
     "seminaire",
     "webinaire",
     "masterclass",
     "hommage",
     "lancement"
    ]
   },
   {
    "name": "format",
    "label": "Format",
    "type": "text"
   },
   {
    "name": "presentation",
    "label": "Présentation",
    "type": "textarea",
    "full": true
   },
   {
    "name": "intervenants",
    "label": "Intervenants",
    "type": "textarea",
    "full": true
   },
   {
    "name": "affiche",
    "label": "Affiche (chemin de l’image)",
    "type": "text"
   },
   {
    "name": "miniature",
    "label": "Miniature (facultatif)",
    "type": "text"
   },
   {
    "name": "attestation",
    "label": "Page d’attestation (ex. : /palabre-bidima/attestation)",
    "type": "text"
   },
   {
    "name": "photos",
    "label": "Galerie de photos",
    "type": "lines",
    "help": "un élément par ligne",
    "full": true
   }
  ]
 },
 {
  "key": "pages",
  "singular": "Page",
  "plural": "Pages fixes",
  "route": "pages",
  "publicPaths": [
   "/"
  ],
  "titleField": "titre",
  "contentField": "contenu",
  "list": [
   {
    "key": "titre",
    "label": "Titre"
   }
  ],
  "fields": [
   {
    "name": "titre",
    "label": "Titre de la page",
    "type": "text"
   },
   {
    "name": "adresse",
    "label": "Adresse de la page",
    "type": "text"
   },
   {
    "name": "description",
    "label": "Description (moteurs de recherche)",
    "type": "textarea",
    "full": true
   },
   {
    "name": "contenu",
    "label": "Texte",
    "type": "markdown",
    "full": true
   }
  ]
 }
];

export const ENTITIES: Record<string, EntitySchema> = Object.fromEntries(LISTE.map((e) => [e.key, e]));
export const ENTITY_KEYS = LISTE.map((e) => e.key);

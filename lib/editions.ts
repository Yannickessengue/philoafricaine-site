/* Éditions JOGOO — données du catalogue et de la maison.
   Sources : « Projet fondateur et feuille de route » (Assises de Toulouse, 2027)
   et « Projet JOGOO Éditions » (présentation des collections et des objectifs). */

export type Collection = {
  slug: string;
  nom: string;
  soustitre: string;
  direction: string;
  couleur: string;
  /** Phrase courte pour les listes. */
  texte: string;
  /** Présentation développée (fiche de la collection). */
  presentation: string[];
  /** Domaines et formes accueillis. */
  domaines?: string[];
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'sankofa',
    nom: 'Sankofa',
    soustitre: 'Classiques et patrimoines de la philosophie africaine',
    direction: 'Adoulou N. Bitang',
    couleur: '#ad0e0e',
    texte: 'Retour aux textes fondateurs et aux patrimoines philosophiques africains.',
    presentation: [
      'Le mot « Sankofa » vient de la culture akan d’Afrique de l’Ouest. Parmi les symboles adinkra, il signifie « retour aux sources » : SAN (retourne), KO (va), FA (ramène). On le représente par un oiseau qui avance en regardant vers l’arrière, un œuf dans le bec.',
      'La collection accueille les grandes publications classiques de la philosophie africaine, en lien avec les textes fondateurs de la pensée africaine. Elle peut aussi intégrer des traductions et des rééditions d’œuvres anciennes qui ont marqué la philosophie africaine.',
    ],
    domaines: ['Textes fondateurs', 'Rééditions', 'Traductions', 'Éditions critiques'],
  },
  {
    slug: 'muntu',
    nom: 'Muntu',
    soustitre: 'Anthropologie et philosophies de la personne',
    direction: 'À désigner',
    couleur: '#cc7a05',
    texte: 'La personne, ses relations et les conceptions de l’humain.',
    presentation: [
      'Muntu désigne l’être humain dans les langues bantu ; Bantu en est le pluriel. Chez Fabien Eboussi Boulaga, Muntu nomme l’humain africain. Pour Alexis Kagame, le concept renvoie à l’être d’intelligence, l’être qui agit par intelligence : il exprime l’ordre des humains, comme la « substance » chez Aristote.',
      'La collection se consacre à la conception de l’être humain dans les sociétés africaines : l’identité, la communauté (Ubuntu) et les valeurs.',
    ],
    domaines: ['Identité', 'Communauté et Ubuntu', 'Valeurs', 'Anthropologie philosophique'],
  },
  {
    slug: 'savoirs-endogenes',
    nom: 'Savoirs endogènes',
    soustitre: 'Épistémologies et traditions de savoir africaines',
    direction: 'À désigner',
    couleur: '#5b7f2a',
    texte: 'Les conditions de formation, de transmission et de transformation des savoirs.',
    presentation: [
      'La collection aborde les savoirs traditionnels africains dans leur histoire. Elle réunit des études approfondies sur la manière dont le savoir se constitue et se transmet, d’où l’importance qu’elle accorde aux méthodologies de recherche.',
      'Parce que le savoir est de nature initiatique dans l’Afrique traditionnelle et que les rationalités y sont plurielles, la collection aborde aussi l’épistémologie africaine traditionnelle dans son lien à la religion africaine traditionnelle et à ses interactions avec les autres religions.',
    ],
    domaines: ['Épistémologie', 'Transmission', 'Méthodologies de recherche', 'Religions africaines'],
  },
  {
    slug: 'transversalites',
    nom: 'Transversalités',
    soustitre: 'Penser les grands défis contemporains',
    direction: 'À désigner',
    couleur: '#1f5f8b',
    texte: 'Des essais qui mettent plusieurs disciplines au travail sur une question contemporaine.',
    presentation: [
      'La collection part des publications philosophiques contemporaines liées aux défis des sociétés africaines d’aujourd’hui : culture, éducation, développement, langage, politique, justice sociale, développement durable, droits humains.',
      'Les manuels pédagogiques et les pratiques philosophiques avec les enfants y trouvent un écho particulier.',
    ],
    domaines: ['Éducation', 'Politique et justice sociale', 'Développement durable', 'Droits humains', 'Manuels', 'Philosophie avec les enfants'],
  },
  {
    slug: 'tropiques',
    nom: 'T(r)opiques',
    soustitre: 'Lieux, trajectoires et biographies intellectuelles',
    direction: 'À désigner',
    couleur: '#8a3b8f',
    texte: 'Lieux de pensée, parcours d’auteurs et biographies intellectuelles.',
    presentation: [
      'Topiques et tropiques : la collection aborde les savoirs africains situés. Elle s’intéresse aux biographies et aux trajectoires de vie, ainsi qu’aux événements scientifiques liés à des personnalités inspirantes d’Afrique et de la diaspora.',
      'Comme « dialogue des lieux », elle ouvre aussi des espaces de dialogue avec les autres traditions philosophiques et culturelles, avec une attention particulière aux pensées du Sud global.',
    ],
    domaines: ['Biographies intellectuelles', 'Trajectoires', 'Sud global', 'Dialogue des traditions'],
  },
  {
    slug: 'ecologie-des-savoirs',
    nom: 'Écologie des savoirs',
    soustitre: 'Pluralité des rationalités et justice épistémique',
    direction: 'Pr Ulrich Metende',
    couleur: '#2e7d6b',
    texte: 'Pluralité des rationalités et conditions d’une justice épistémique.',
    presentation: [
      'L’écologie des savoirs est un courant de la recherche philosophique qui rappelle l’importance de décentrer les approches et les pratiques intellectuelles. Elle défend une forme de justice épistémique : pluralisme, décolonisation des savoirs, interculturalité, vision inclusive de la connaissance.',
      'La collection accueille les questions contemporaines qui s’y rattachent : le genre, l’afrofuturisme, les imaginaires.',
    ],
    domaines: ['Décolonisation des savoirs', 'Interculturalité', 'Genre', 'Afrofuturisme', 'Imaginaires'],
  },
  {
    slug: 'hermeneutique',
    nom: 'Herméneutique',
    soustitre: 'Comprendre, interpréter, transmettre',
    direction: 'Pr Benoît Okolo Okonda & Pr Cléophas Jacob Defo',
    couleur: '#6b4a2b',
    texte: 'Pratiques de l’interprétation, de la traduction et de la transmission.',
    presentation: ['Comprendre, interpréter, transmettre : la collection réunit les travaux consacrés aux pratiques de l’interprétation, de la traduction et de la transmission des textes et des traditions.'],
    domaines: ['Interprétation', 'Traduction', 'Transmission'],
  },
  {
    slug: 'ethique-et-bioethique',
    nom: 'Chemins africains de l’éthique et de la bioéthique',
    soustitre: 'Penser le vivant, soigner l’humain, habiter le monde',
    direction: 'Pr Basile Ngono',
    couleur: '#b5475b',
    texte: 'Questions du soin, du vivant et de la responsabilité.',
    presentation: ['Penser le vivant, soigner l’humain, habiter le monde : la collection ouvre les questions du soin, du vivant et de la responsabilité depuis les ressources de la pensée africaine.'],
    domaines: ['Éthique', 'Bioéthique', 'Soin', 'Vivant'],
  },
  {
    slug: 'transtopicites',
    nom: 'Transtopicités',
    soustitre: 'Les écritures en mouvement',
    direction: 'Yannick Essengue',
    couleur: '#3c3c8f',
    texte: 'Essais, fragments, récits et formes qui traversent philosophie et littérature.',
    presentation: ['La collection accueille les écritures qui traversent les frontières entre philosophie, littérature et création.'],
    domaines: ['Poésie', 'Essai', 'Nouvelle', 'Pamphlet', 'Aphorisme', 'Billet', 'Fragment', 'Carnet', 'Correspondance', 'Méditation', 'Récit'],
  },
  {
    slug: 'revues',
    nom: 'Revues',
    soustitre: 'Pôle des périodiques scientifiques',
    direction: 'Coordination à préciser',
    couleur: '#141414',
    texte: 'Un espace de circulation pour les périodiques scientifiques.',
    presentation: [
      'Ce pôle favorise la création de revues spécialisées dans la recherche en philosophie africaine. Il peut s’ouvrir à d’autres domaines qui mettent en valeur les savoirs et la pensée africaine dans leur ensemble.',
      'Il accueille la Revue JOGOO et Eboussi Studies ; d’autres revues pourront progressivement être accueillies ou développées.',
    ],
  },
];

export const collection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);

export type Projet = {
  titre: string;
  soustitre?: string;
  statut: string;
  collection?: string;
  auteurs?: string;
  texte: string;
  /** Architecture du volume (parties ou tomes). */
  parties?: string[];
  parution?: string;
};

export const PROJETS: Projet[] = [
  {
    titre: 'Panser et Penser l’Afrique',
    soustitre: 'De la construction des mémoires à l’invention des futurs africains',
    statut: 'Ouvrage collectif en préparation',
    auteurs: 'Sous la direction de Yannick Essengue',
    texte: 'Issu de trois rencontres tenues en 2026, le volume rapproche le geste du soin et celui de la réflexion : comment penser les épreuves collectives, les mémoires blessées et les possibilités de transformation.',
    parties: [
      'N’Djamena — Mémoires, fractures sociales et cohésion',
      'Abidjan — Corps, mémoire, institutions et imaginaires en reconstruction',
      'Brazzaville — Panser la Terre, éduquer l’humain',
    ],
    parution: 'Parution visée : premier trimestre 2027',
  },
  {
    titre: 'Le tournant épistémologique de la philosophie africaine',
    statut: 'Ouvrage collectif en trois tomes, en préparation',
    auteurs: 'Sous la direction de Yannick Essengue',
    texte: 'Le projet s’intéresse aux conditions dans lesquelles se constituent les savoirs philosophiques africains. Il prolonge un cycle scientifique dont une journée s’est tenue à l’UQAM le 30 mai 2025.',
    parties: ['Tome I — Pratique de la recherche en contexte post-vérité', 'Tome II — Philosophie africana et philosophie du langage', 'Tome III — Savoirs endogènes'],
    parution: 'Parution visée : 2027',
  },
  {
    titre: 'Philosophie africaine. Débats et questions',
    statut: 'Ouvrage collectif en préparation',
    auteurs: 'Sous la direction de Molongwa Bayi Bayi et Yannick Essengue',
    texte: 'Vingt et une contributions reviennent sur les débats et les méthodes qui ont donné forme à la philosophie africaine contemporaine.',
    parties: ['Historiographie', 'Les grands débats contemporains', 'Le paradigme linguistique', 'Figures contemporaines', 'Philosophie africaine et société'],
  },
  {
    titre: 'Philosophie africaine du langage',
    statut: 'Projet annoncé',
    texte: 'Inscrit au programme inaugural, ce titre ouvre un chantier sur les rapports entre langage et pratique philosophique en contexte africain.',
  },
  {
    titre: 'Triturations',
    soustitre: 'Fragments d’une pensée en mouvement',
    statut: 'Projet annoncé · premier titre de la collection',
    collection: 'transtopicites',
    auteurs: 'Yannick Essengue',
    texte: 'Un recueil illustré de poèmes, nouvelles, essais, pamphlets, billets, aphorismes et fragments, qui inaugure la collection Transtopicités.',
  },
  {
    titre: 'Lire Fabien Eboussi Boulaga aujourd’hui',
    statut: 'Titre à l’étude',
    collection: 'hermeneutique',
    texte: 'Un titre envisagé pour la collection Herméneutique, consacré à l’actualité de l’œuvre de Fabien Eboussi Boulaga.',
  },
];

export const PERIODIQUES = [
  { titre: 'L’être africain', revue: 'Revue JOGOO · N° 1', texte: 'Sommaire et contributions de la revue de philosophie africaine et de culture.', href: '/sous-sites/revue-jogoo', couverture: '/medias/site/jogoo/couverture-revue-jogoo-1.jpg', coordination: 'Coordonné par Yannick Essengue · Entretien avec Fabien Eboussi Boulaga' },
  { titre: 'Reprise de soi et décolonisation des savoirs', revue: 'Eboussi Studies · N° 1', texte: 'Revue scientifique du Groupe JOGOO adossée au Fonds Eboussi Boulaga.', href: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies', couverture: '/medias/site/jogoo/couverture-eboussi-studies-1.jpg', coordination: 'Coordonné par Abbed Kanoor et Yannick Essengue' },
];

/** Objectifs de la maison (« Projet JOGOO Éditions »), dédoublonnés. */
export const OBJECTIFS: [string, string][] = [
  ['Faire lire les intellectuels africains', 'Rendre disponibles et lisibles les œuvres des penseuses et penseurs d’Afrique et de la diaspora.'],
  ['Promouvoir la diversité intellectuelle', 'Publier des ouvrages qui représentent la diversité des perspectives philosophiques africaines, traditions orales, écrites et contemporaines.'],
  ['Éduquer et sensibiliser', 'Offrir au public des textes accessibles sur les idées, les concepts et les questions philosophiques propres à l’Afrique et à sa diaspora.'],
  ['Encourager la recherche', 'Donner aux chercheurs africains et internationaux une plateforme pour publier leurs travaux sur la philosophie africaine.'],
  ['Valoriser les savoirs traditionnels', 'Reconnaître, préserver et promouvoir des connaissances philosophiques souvent négligées ou marginalisées par l’académie dominante.'],
  ['Favoriser le dialogue interculturel', 'Ouvrir l’échange entre penseurs africains et penseurs d’autres cultures.'],
  ['Soutenir la création', 'Offrir aux auteurs émergents un lieu pour partager des idées et des perspectives originales.'],
  ['Corriger les déséquilibres éditoriaux', 'Mettre en lumière des voix philosophiques africaines sous-représentées ou méconnues.'],
  ['Créer des réseaux', 'Construire des réseaux de recherche et de publication novateurs.'],
  ['Publier mieux, à coût maîtrisé', 'Proposer des solutions éditoriales de qualité en réduisant les coûts de production.'],
];

/** Documents fondateurs à préparer pour les Assises. */
export const DOCUMENTS = [
  'Projet fondateur',
  'Manifeste',
  'Déclaration de Toulouse',
  'Charte des fondateurs',
  'Statuts',
  'Politique éditoriale',
  'Charte éthique',
  'Guide des auteurs',
  'Guide des évaluateurs',
  'Procédure d’évaluation en double aveugle',
  'Contrats d’édition et de traduction',
  'Plan stratégique 2027–2032',
  'Budget prévisionnel et plan de financement',
  'Catalogue inaugural',
];

export const LOGOS = {
  horizontal: '/medias/site/jogoo/editions/horizontal.svg',
  base: '/medias/site/jogoo/editions/base.svg',
  symbole: '/medias/site/jogoo/editions/symbole.svg',
  symboleBlanc: '/medias/site/jogoo/editions/symbole-blanc.svg',
  kit: '/medias/site/jogoo/editions/kit-logos-editions-jogoo.zip',
};

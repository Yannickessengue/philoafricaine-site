/* Éditions JOGOO — données du catalogue et de la maison.
   Sources : « Projet fondateur et feuille de route » (Assises de Toulouse, 2027)
   et « Projet JOGOO Éditions » (présentation des collections et des objectifs). */

export type Collection = {
  slug: string;
  nom: string;
  soustitre: string;
  direction: string;
  /** Direction, Codirection ou Coordination. */
  role?: string;
  /** Institution de rattachement de la direction. */
  affiliation?: string;
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
    affiliation: 'École normale supérieure (ENS), Université de Bertoua',
    couleur: '#ad0e0e',
    texte: 'Retour aux textes fondateurs et aux patrimoines philosophiques africains.',
    presentation: ['Sankofa rend accessibles les textes qui ont marqué l’histoire de la philosophie africaine. La collection accueille des rééditions annotées, des traductions, des anthologies et des éditions critiques. Elle invite à relire les œuvres dans les langues, les débats et les circonstances qui leur ont donné forme, et à redécouvrir des textes devenus difficiles d’accès.', 'Le mot « Sankofa » vient de la culture akan d’Afrique de l’Ouest. Parmi les symboles adinkra, il signifie « retour aux sources » : SAN (retourne), KO (va), FA (ramène). On le représente par un oiseau qui avance en regardant vers l’arrière, un œuf dans le bec.'],
    domaines: ['Textes fondateurs', 'Rééditions', 'Traductions', 'Éditions critiques'],
  },
  {
    slug: 'muntu',
    nom: 'Muntu',
    soustitre: 'Anthropologie et philosophies de la personne',
    direction: 'Kinhoun Épiphane',
    affiliation: 'UCAC-ICAM, Douala',
    couleur: '#cc7a05',
    texte: 'La personne, ses relations et les conceptions de l’humain.',
    presentation: ['Que signifie être une personne, et comment le devient-on ? Muntu explore les conceptions de l’humain élaborées dans les langues, les pratiques et les traditions intellectuelles africaines. La collection accueille des travaux philosophiques et anthropologiques sur le corps, la parenté, la communauté, la singularité et les formes de reconnaissance qui façonnent l’existence.', 'Muntu désigne l’être humain dans les langues bantu ; Bantu en est le pluriel. Chez Fabien Eboussi Boulaga, Muntu nomme l’humain africain. Pour Alexis Kagame, le concept renvoie à l’être d’intelligence, l’être qui agit par intelligence : il exprime l’ordre des humains, comme la « substance » chez Aristote.'],
    domaines: ['Identité', 'Communauté et Ubuntu', 'Valeurs', 'Anthropologie philosophique'],
  },
  {
    slug: 'savoirs-endogenes',
    nom: 'Savoirs endogènes',
    soustitre: 'Épistémologies et traditions de savoir africaines',
    direction: 'Pr Bayibayi Molongwa',
    affiliation: 'Université de Malabo',
    couleur: '#5b7f2a',
    texte: 'Les conditions de formation, de transmission et de transformation des savoirs.',
    presentation: ['Cette collection étudie comment les savoirs se forment, se transmettent et se transforment au sein des sociétés africaines. Elle accueille des enquêtes sur l’oralité, les arts, les techniques, les pratiques de soin ou les connaissances du milieu. Elle donne une place aux langues et aux gestes qui portent ces savoirs, ainsi qu’aux débats qui accompagnent leur transmission.'],
    domaines: ['Épistémologie', 'Transmission', 'Méthodologies de recherche', 'Religions africaines'],
  },
  {
    slug: 'transversalites',
    nom: 'Transversalités',
    soustitre: 'Penser les grands défis contemporains',
    direction: 'Théophane Mbogue (Theombogü)',
    couleur: '#1f5f8b',
    texte: 'Des essais qui mettent plusieurs disciplines au travail sur une question contemporaine.',
    presentation: ['Transversalités accueille des essais et des recherches qui font travailler plusieurs disciplines sur une même question contemporaine. La philosophie, la littérature, les arts et les sciences humaines y éclairent des problèmes tels que les migrations, les inégalités, les transformations du travail ou les usages du numérique. La collection privilégie les ouvrages qui montrent ce que le croisement des disciplines change dans la manière de poser le problème.'],
    domaines: ['Éducation', 'Politique et justice sociale', 'Développement durable', 'Droits humains', 'Manuels', 'Philosophie avec les enfants'],
  },
  {
    slug: 'tropiques',
    nom: 'T(r)opiques',
    soustitre: 'Lieux, trajectoires et biographies intellectuelles',
    direction: 'Pr Kalēnge Yamukēna Yantūmbi',
    affiliation: 'Institut supérieur d’études sociales de Lubumbashi (ISES) et Université libre panafricaine (ULP)',
    couleur: '#8a3b8f',
    texte: 'Lieux de pensée, parcours d’auteurs et biographies intellectuelles.',
    presentation: ['T(r)opiques explore les lieux où la pensée prend forme et les trajectoires par lesquelles elle circule. La collection accueille des biographies intellectuelles, des correspondances, des travaux d’archives et des enquêtes sur les réseaux de pensée. Elle s’intéresse à la manière dont un déplacement, une rencontre, une langue ou un lieu d’enseignement infléchissent le parcours d’une œuvre.'],
    domaines: ['Biographies intellectuelles', 'Trajectoires', 'Sud global', 'Dialogue des traditions'],
  },
  {
    slug: 'ecologie-des-savoirs',
    nom: 'Écologie des savoirs',
    soustitre: 'Pluralité des rationalités et justice épistémique',
    direction: 'Pr Ulrich Metende',
    couleur: '#2e7d6b',
    texte: 'Pluralité des rationalités et conditions d’une justice épistémique.',
    presentation: ['Écologie des savoirs examine les conditions dans lesquelles des traditions de connaissance différentes se rencontrent, se traduisent et entrent en conflit. La collection accueille des travaux sur la pluralité des rationalités, les institutions qui confèrent une autorité aux savoirs et les pratiques qui en écartent certains. Elle interroge les conditions d’une justice épistémique dans la recherche, l’enseignement et la vie publique.'],
    domaines: ['Décolonisation des savoirs', 'Interculturalité', 'Genre', 'Afrofuturisme', 'Imaginaires'],
  },
  {
    slug: 'hermeneutique',
    nom: 'Herméneutique',
    soustitre: 'Comprendre, interpréter, transmettre',
    direction: 'Pr Benoît Okolo Okonda et Pr Cléophas Jacob Defo',
    role: 'Codirection',
    couleur: '#6b4a2b',
    texte: 'Pratiques de l’interprétation, de la traduction et de la transmission.',
    presentation: ['Herméneutique est consacrée aux pratiques de l’interprétation, de la traduction et de la transmission. Elle accueille des études sur les textes, les récits oraux, les symboles et les œuvres qui donnent sens à l’expérience. La collection s’intéresse à ce qu’une œuvre devient lorsqu’elle change de langue, de public ou de contexte historique.'],
    domaines: ['Interprétation', 'Traduction', 'Transmission'],
  },
  {
    slug: 'ethique-et-bioethique',
    nom: 'Chemins africains de l’éthique et de la bioéthique',
    soustitre: 'Penser le vivant, soigner l’humain, habiter le monde',
    direction: 'Pr Basile Ngono',
    couleur: '#b5475b',
    texte: 'Questions du soin, du vivant et de la responsabilité.',
    presentation: ['Cette collection aborde les questions morales que soulèvent le soin, la maladie, la vulnérabilité et les transformations du vivant. Elle accueille des travaux sur la relation de soin, la santé publique, la recherche biomédicale et l’accès aux traitements. Elle met les débats bioéthiques en dialogue avec les expériences de terrain, les pratiques de responsabilité et les traditions de pensée africaines.'],
    domaines: ['Éthique', 'Bioéthique', 'Soin', 'Vivant'],
  },
  {
    slug: 'transtopicites',
    nom: 'Transtopicités',
    soustitre: 'Les écritures en mouvement',
    direction: 'Yannick Essengue',
    couleur: '#3c3c8f',
    texte: 'Essais, fragments, récits et formes qui traversent philosophie et littérature.',
    presentation: ['Transtopicités accueille des écritures qui traversent les frontières entre philosophie, littérature et création. Essais, poèmes, nouvelles, fragments, aphorismes, carnets, correspondances et récits y explorent ce que la forme d’un texte permet de penser. *Triturations*, de Yannick Essengue, figure au programme inaugural de la collection.'],
    domaines: ['Poésie', 'Essai', 'Nouvelle', 'Pamphlet', 'Aphorisme', 'Billet', 'Fragment', 'Carnet', 'Correspondance', 'Méditation', 'Récit'],
  },
  {
    slug: 'revues',
    nom: 'Revues',
    soustitre: 'Pôle des périodiques scientifiques',
    direction: 'Dr Gilbert Babena',
    role: 'Coordination',
    affiliation: 'Université de Maroua',
    couleur: '#141414',
    texte: 'Un espace de circulation pour les périodiques scientifiques.',
    presentation: ['Le pôle Revues réunit la Revue JOGOO et Eboussi Studies. Il donne aux travaux de recherche et aux débats en philosophie africaine un espace de publication périodique. La Revue JOGOO couvre la philosophie africaine et les questions de culture. Eboussi Studies, adossée au Fonds Eboussi Boulaga, est consacrée à l’étude de l’œuvre du philosophe et aux recherches qu’elle suscite. Le pôle pourra accueillir d’autres périodiques scientifiques.'],
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

/* Attestations de participation — colloque international
   « Fabien Eboussi Boulaga interculturel ? Faire dialoguer les lieux » (UT2J, 12-14 octobre 2026, en ligne).
   Registre établi d’après le programme définitif. Pour retirer une personne absente ou corriger
   un intitulé, modifier la ligne correspondante : l’attestation est produite à partir de ce fichier. */

export type Intervention = {
  /** Nature de l’intervention, telle qu’elle figure sur l’attestation. */
  nature: string;
  /** Titre de la communication, le cas échéant. */
  titre?: string;
  /** Cadre : panel, plénière, table ronde… */
  cadre?: string;
};

export type Participant = {
  nom: string;
  affiliation?: string;
  /** Autres graphies acceptées à la saisie. */
  alias?: string[];
  interventions: Intervention[];
};

export const COLLOQUE = {
  titre: 'Fabien Eboussi Boulaga interculturel ?',
  soustitre: 'Faire dialoguer les lieux',
  dates: '12, 13 et 14 octobre 2026',
  lieu: 'Université Toulouse – Jean Jaurès, en ligne',
  prefixe: 'CEB26',
};

const com = (titre: string, cadre: string): Intervention => ({ nature: 'Communication', titre, cadre });
const pres = (cadre: string): Intervention => ({ nature: 'Présidence de séance', cadre });
const mod = (cadre: string): Intervention => ({ nature: 'Modération', cadre });

/* L’ordre de cette liste fixe le numéro de chaque attestation : ajouter les nouvelles entrées à la fin. */
export const PARTICIPANTS: Participant[] = [
  { nom: 'Joseph Tonda', interventions: [{ nature: 'Keynote générale d’ouverture à deux voix', titre: 'Le Muntu et la vie ailleurs chez soi' }, pres('Conférence plénière IV')] },
  { nom: 'Jean-Pierre Bekolo', interventions: [{ nature: 'Keynote générale d’ouverture à deux voix' }] },
  { nom: 'Anaëlle Nyoumsi-Poksy', interventions: [{ nature: 'Intermède artistique', cadre: 'Séance d’ouverture' }] },
  {
    nom: 'Charles Romain Mbele',
    affiliation: 'ENS, Université de Yaoundé 1',
    interventions: [{ nature: 'Keynote d’introduction à l’axe 1', titre: 'Fabien Eboussi Boulaga : l’ineffable et la question de la démocratie' }, mod('Panel B'), pres('Conférence plénière V')],
  },
  {
    nom: 'Pierre Tchimabi',
    affiliation: 'Université de Maroua',
    interventions: [com('Universalisation des particuliers culturels du Muntu : analyse heuristique de l’esse ad à partir de Pierre Meinrad Hebga', 'Panel en plénière I'), pres('Panel en plénière III'), mod('Panel F')],
  },
  { nom: 'Henri Gbadi Finimonga', affiliation: 'Université de Kisangani', interventions: [com('Appropriation des savoirs et fusion des horizons', 'Panel en plénière I')] },
  {
    nom: 'Rodrigue M. Naortangar',
    affiliation: 'Institut de Théologie de la Compagnie de Jésus, Abidjan',
    alias: ['Rodrigue Naortangar'],
    interventions: [com('Penser la confiance comme fondement anthropologique dans un Sahel interculturel : leçons de la critique de l’universalité selon Fabien Eboussi Boulaga', 'Panel en plénière I')],
  },
  {
    nom: 'Vincent Sosthène Fouda',
    affiliation: 'Université Catholique de Lille',
    interventions: [{ nature: 'Conférence plénière V', titre: 'Comment situer Eboussi Boulaga dans le contexte de la philosophie africaine ?' }, pres('Panel en plénière I')],
  },
  {
    nom: 'Dia Mbwangi Diafwila',
    affiliation: 'Global Scholars',
    interventions: [{ nature: 'Conférence plénière I', titre: 'L’interculturalité dans l’œuvre de Fabien Eboussi Boulaga. Praxis de l’insoumission et sédimentation de l’universel' }],
  },
  {
    nom: 'Kalēnge Yamukēna Yantūmbi',
    affiliation: 'ISES Lubumbashi / Université libre panafricaine',
    interventions: [com('Transfonctionnaliser l’école. L’ingénierie didactique comme espace du dialogue transépistémique', 'Panel en plénière III'), pres('Conférence plénière I')],
  },
  {
    nom: 'Patrice Yengo',
    affiliation: 'Institut des mondes africains, EHESS',
    interventions: [{ nature: 'Conférence plénière II', titre: 'Crise du Muntu et obsolescence de l’Ubuntu : les violences xénophobes en Afrique du Sud' }],
  },
  {
    nom: 'Jacques Atiogbe',
    affiliation: 'Université Toulouse – Jean Jaurès',
    interventions: [{ nature: 'Conférence plénière VI en dialogue', titre: 'Eboussi, figure par excellence de l’antifascisme' }, pres('Conférence plénière II')],
  },
  { nom: 'Korassi Téwéché', interventions: [{ nature: 'Projection de court métrage', titre: 'Our Gods Also Die. Memory, Estrangement, and the End of Signs' }] },
  { nom: 'Antoinette Nga Mvondo', affiliation: 'Université d’Ebolowa', interventions: [mod('Panel A'), pres('Conférence plénière III')] },
  { nom: 'François Wassouni', affiliation: 'Université de Maroua', interventions: [com('Monuments en dispute : usages sociaux du passé et conflits de mémoire entre Cameroun, France et Afrique du Sud', 'Panel A')] },
  { nom: 'Jean Kalombo Mulimbi', affiliation: 'ULB / Université de Lubumbashi', interventions: [com('Mémoire coloniale et dépossession culturelle : les Tabwa du Tanganyika face aux enjeux de déculturation', 'Panel A')] },
  { nom: 'Prisque Ndjinga Ndjinga', affiliation: 'Université de Yaoundé 1', alias: ['Prisque Ndjinga'], interventions: [com('Archisme et dialogue des lieux : habiter le réalisme historique de Fabien Eboussi Boulaga', 'Panel A')] },
  { nom: 'Bernard Dossou', affiliation: 'UCAO-UUA, Abidjan', interventions: [com('Le corps à l’épreuve de la liberté dans le dialogue des cultures dans la perspective éboussienne', 'Panel B')] },
  { nom: 'Alette Viviane Ntsa Ondobo', affiliation: 'Université de Yaoundé 1', interventions: [com('L’écologie des savoirs comme fondement d’un véritable dialogue et d’un plurivers fécond', 'Panel B')] },
  { nom: 'Koudou François Ozoukou', affiliation: 'Université Alassane Ouattara, Bouaké', interventions: [com('Culture et éducation chez Fabien Eboussi Boulaga : une perspective philosophique pour une émancipation de l’Afrique', 'Panel B')] },
  {
    nom: 'Cédric Dourdy',
    affiliation: 'Université Toulouse – Jean Jaurès',
    interventions: [com('Institutionnalisations et transfonctionnalisations de « l’apprendre à mourir »', 'Panel en plénière III'), mod('Panel C')],
  },
  { nom: 'Bouquet Elvine Jolefack Mboula', affiliation: 'Université de Yaoundé 1', interventions: [com('Tresser pour exister : la coiffure sakadje peule comme pratique en communauté', 'Panel C')] },
  {
    nom: 'Aurèle Fanny Deutcha Nguelieu',
    affiliation: 'Université Laval',
    interventions: [com('Matérialité du care et mémoire de sang : l’agentivité des savoirs endogènes féminins dans les camps de réfugiés au Cameroun à l’aune d’Eboussi Boulaga', 'Panel C'), mod('Panel D')],
  },
  { nom: 'Fabiola Djeukam Ngatcha', affiliation: 'Université de Yaoundé 1', interventions: [com('Transfonctionnaliser le féminisme ? Eboussi Boulaga et la question du genre comme dialogue des lieux', 'Panel C')] },
  { nom: 'Louis Nana', affiliation: 'Université de Tübingen', interventions: [com('Le Sud global et le défi de la pensée critique', 'Panel en plénière II')] },
  {
    nom: 'Adoulou N. Bitang',
    affiliation: 'ENS, Université de Bertoua',
    alias: ['Adoulou Bitang', 'Jean Eric Bitang', 'Jean Eric Adoulou Bitang'],
    interventions: [com('What is Philosophy? A Topographic Answer from Muntu in Crisis', 'Panel en plénière II'), { nature: 'Allocution de bienvenue', cadre: 'Cérémonie d’ouverture' }],
  },
  {
    nom: 'Vanessa Schmitz',
    affiliation: 'Charles University Prague / Université de Tübingen',
    interventions: [com('Radical Topology. A conversation between Fabien Eboussi Boulaga, Arturo Escobar, Rita Segato and Donna Haraway', 'Panel en plénière II')],
  },
  { nom: 'Mukadi Ilunga', affiliation: 'University of Oxford', interventions: [com('Authenticité : éthique de la relation et politique de la rencontre dans l’œuvre d’Eboussi Boulaga', 'Panel en plénière II')] },
  { nom: 'Gideon Jumbam', affiliation: 'Université de Bamenda', interventions: [pres('Panel en plénière II')] },
  { nom: 'Yves Nasser Peutou Fogang', affiliation: 'Université de Yaoundé 1', interventions: [com('Reprendre place dans l’histoire : la rationalité topique comme politique de l’émancipation chez Fabien Eboussi Boulaga', 'Panel D')] },
  { nom: 'Alawadi Zelao', affiliation: 'Université de Yaoundé II', interventions: [com('Éléments de la démocratie substantive dans la pensée de Fabien Eboussi Boulaga', 'Panel D')] },
  {
    nom: 'Thérèse Belinga Belinga',
    affiliation: 'Université de Yaoundé 1',
    alias: ['Thérèse Belinga'],
    interventions: [com('La chorégraphie du sens : transfonctionnalisation et éveil du sujet dans la pensée d’Eboussi Boulaga', 'Panel D'), mod('Panel G')],
  },
  {
    nom: 'Emmanuel Banywesize',
    interventions: [{ nature: 'Conférence plénière III', titre: 'Épistémologie africaine et dialogue des lieux. Eboussi Boulaga et Mudimbe' }, mod('Panel E'), pres('Conférence plénière VII')],
  },
  { nom: 'Jonas Kouakou N’Da', affiliation: 'Université Toulouse – Jean Jaurès', alias: ['Jonas Kouakou Nda'], interventions: [com('La science de l’humanité universelle ou l’« anthropologie transcendantale » dans La crise du Muntu', 'Panel E')] },
  { nom: 'Grégoire Abessolo Amougou', affiliation: 'Institut catholique de Paris', interventions: [com('La théologie comme dialogue interculturel dans Christianisme sans fétiche de Fabien Eboussi Boulaga', 'Panel E')] },
  {
    nom: 'Sefounema Akoutou',
    affiliation: 'Université d’Abomey-Calavi, Bénin',
    interventions: [com('Enjeux interculturels de l’arbre à palabre et procéduralisme institutionnel dans les conférences des forces vives de la nation', 'Panel E'), mod('Panel H')],
  },
  { nom: 'Emmanuel Malolo Dissake', affiliation: 'Université de Douala', interventions: [{ nature: 'Keynote d’introduction à l’axe 2', titre: 'L’énigme de la crise du Muntu' }] },
  {
    nom: 'Brigitte Nga Ondigui',
    affiliation: 'UQAM, coordination artistique',
    alias: ['Brigitte Ondigui'],
    interventions: [mod('Table ronde sur la muséologie'), { nature: 'Performance', titre: 'Faire danser le sens' }],
  },
  { nom: 'Marthe Darisca Mfou’ou Medou', affiliation: 'Université de Yaoundé 1', alias: ['Marthe Darisca Mfouou Medou'], interventions: [com('The Fang people of Central Africa: a case study of a forest civilization', 'Table ronde sur la muséologie')] },
  {
    nom: 'Fanjasoa Louisette Rasoloniaina',
    affiliation: 'EVCAU – ÉCHELLES, ENSAPVS / Université Paris Cité',
    interventions: [com('Du Muntu au Plurivers : faire dialoguer les lieux, les langues et les factures à partir de la prise ontologique au milieu', 'Table ronde sur la muséologie')],
  },
  {
    nom: 'Irène Vanessa Ngandi',
    affiliation: 'Université de Yaoundé 1',
    interventions: [com('Le musée camerounais à l’épreuve du réalisme historique : fréquentation, mémoire et pratiques communautaires. Les cas du Musée national du Cameroun et du Musée des civilisations de Dschang', 'Table ronde sur la muséologie')],
  },
  {
    nom: 'Anaëlle-Laurine Tsafack Azebaze',
    affiliation: 'Université de Yaoundé 1',
    interventions: [com('Le Musée Maritime de Douala et la reprise de soi : patrimoine, mémoire et décolonisation des récits historiques au Cameroun', 'Table ronde sur la muséologie')],
  },
  {
    nom: 'David Le-Duc-Tiaha',
    alias: ['David Le Duc Tiaha', 'David Leduc Tiaha', 'David Tiaha'],
    interventions: [{ nature: 'Conférence plénière IV', titre: 'Décoloniser l’herméneutique. Pour une éthique épistémique de l’interprétation' }],
  },
  {
    nom: 'Louis-Dominique Biakolo Komo',
    affiliation: 'Université de Yaoundé 1',
    interventions: [com('La crise de l’universel dans la pensée d’Eboussi Boulaga', 'Panel en plénière III'), pres('Conférence plénière VI')],
  },
  { nom: 'Momar Kane', affiliation: 'Momar AfroDream, Toulouse', interventions: [{ nature: 'Conte chanté', titre: 'Afrotropisme : écriture de la différe(a)nce', cadre: 'Faire danser le sens' }] },
  {
    nom: 'Abel Kouvouama',
    affiliation: 'Université de Pau et des Pays de l’Adour',
    interventions: [{ nature: 'Keynote d’introduction à l’axe 3', titre: 'Penser la philosophie avec Fabien Eboussi Boulaga : les expériences de la rencontre' }],
  },
  {
    nom: 'Bayi Bayi Molongwa',
    affiliation: 'Université de Malabo',
    alias: ['Bayibayi Molongwa', 'Molongwa Bayibayi'],
    interventions: [{ nature: 'Conférence plénière VI en dialogue', titre: 'Le dilemme africain selon Fabien Eboussi' }, mod('Table ronde bilingue français-espagnol')],
  },
  { nom: 'Joly Colin André Bessala', affiliation: 'Université de Yaoundé 1', interventions: [com('De l’universalisme hégémonique à l’écologie des savoirs : pour une refondation pluriverselle de la philosophie mondiale', 'Panel F')] },
  { nom: 'Alain Christophe Ngosso', affiliation: 'Université Toulouse – Jean Jaurès', interventions: [com('Eboussi multiple', 'Panel F')] },
  { nom: 'Isidore Laohoué', affiliation: 'Université de Douala', interventions: [com('La rationalité topologique comme fondement d’une ontologie interculturelle : essai à partir de Fabien Eboussi Boulaga', 'Panel G')] },
  {
    nom: 'Adama Ouattara-Sanz',
    affiliation: 'Université Paris-Nanterre',
    alias: ['Adama Ouattara Sanz', 'Adama Ouattara'],
    interventions: [com('Tradition utopique, critique et radicale. Une lecture de La crise du Muntu en dialogue avec Talal Asad et Cedric Robinson', 'Panel G')],
  },
  { nom: 'Hervé Marius Benoit Amenguele Nyimi', affiliation: 'Université de Yaoundé 1', interventions: [com('La terre n’est pas un globe : topique, plurivers et responsabilité chez Fabien Eboussi Boulaga', 'Panel G')] },
  { nom: 'Rodrigue Tchassem Tchapdieu', affiliation: 'Université de Yaoundé 1', interventions: [com('Du conte et du théâtre au cinéma : la transposition des matrices narratives africaines comme reconfiguration culturelle', 'Panel H')] },
  {
    nom: 'Danielle Mantho',
    affiliation: 'Université Catholique d’Afrique de l’Ouest, Abidjan',
    interventions: [com('Faire dialoguer l’Éthiopie et Jérusalem : la Reine de Saba comme fille de la sagesse dans le chapitre 24 du Kebra Negast', 'Panel H')],
  },
  {
    nom: 'Bledoumou Cédric-Blanchard Appenan',
    affiliation: 'Université Félix Houphouët-Boigny, Abidjan',
    alias: ['Bledoumou Cédric Blanchard Appenan', 'Cédric Blanchard Appenan'],
    interventions: [com('Penser le fétichisme avec Karl Marx et Fabien Eboussi Boulaga', 'Panel H')],
  },
  { nom: 'Auguste Nsonsissa', interventions: [{ nature: 'Conférence plénière VII', titre: 'Eboussi Boulaga et les études sur les homosexualités africaines' }] },
  {
    nom: 'Yannick Essengue',
    affiliation: 'Université Toulouse – Jean Jaurès',
    interventions: [pres('Restitution des panels et discussion transversale'), { nature: 'Mot de fin', titre: 'Perspectives' }, { nature: 'Comité d’organisation' }],
  },
  {
    nom: 'Anibal Pineda Canabal',
    affiliation: 'Institut de philosophie, Université d’Antioquia, Medellín',
    alias: ['Aníbal Pineda Canabal', 'Anibal Pineda'],
    interventions: [{ nature: 'Intervention', cadre: 'Table ronde bilingue français-espagnol sur le Sud global' }],
  },
  {
    nom: 'Lin Álvarez Villarreal',
    affiliation: 'Universidad de los Andes',
    alias: ['Lin Alvarez'],
    interventions: [{ nature: 'Intervention', cadre: 'Table ronde bilingue français-espagnol sur le Sud global' }],
  },
  {
    nom: 'Jeanne Rosine Abomo',
    affiliation: 'Washington University in St. Louis',
    interventions: [{ nature: 'Intervention', cadre: 'Table ronde bilingue français-espagnol sur le Sud global' }],
  },
  {
    nom: 'Paul-Aarons Ngomo',
    affiliation: 'New York University',
    alias: ['Paul Aarons Ngomo', 'Paul Ngomo'],
    interventions: [{ nature: 'Keynote générale de clôture', titre: 'Logique et opérativité de la transfonctionnalisation : de la relecture en situation et dialogue des lieux' }],
  },
];

const mots = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .split(/[^a-z]+/)
    .filter((m) => m.length > 1);

/* ——— Journée d’étude « Palabre autour de Jean Godefroy Bidima » (Collège international de philosophie, 21 octobre 2026) ———
   Registre provisoire, établi d’après les intervenant·e·s annoncé·e·s : à compléter avec le programme définitif
   (titres des communications, autres intervenant·e·s). Ajouter les nouvelles entrées à la fin. */
export const PARTICIPANTS_BIDIMA: Participant[] = [
  {
    nom: 'David-Le-Duc Tiaha',
    affiliation: 'Collège international de philosophie · Fonds Ricœur',
    alias: ['David Le Duc Tiaha', 'David Leduc Tiaha', 'David Tiaha'],
    interventions: [
      { nature: 'Allocution d’ouverture', cadre: 'Mot de bienvenue' },
      { nature: 'Keynote', titre: 'Espérer et instituer le possible. Une philosophie de la libération chez Bidima', cadre: 'Session 1' },
      { nature: 'Comité d’organisation' },
    ],
  },
  {
    nom: 'Yannick Essengue',
    affiliation: 'Université Toulouse 2 Jean Jaurès · Groupe JOGOO · CIAP',
    interventions: [
      { nature: 'Mot d’introduction', cadre: 'Allocution d’ouverture' },
      { nature: 'Communication', titre: 'Question(s) (de) biopolitique(s)', cadre: 'Session 3' },
      { nature: 'Synthèse et allocution de clôture' },
      { nature: 'Comité d’organisation' },
    ],
  },
  {
    nom: 'Sylvère Mbondobari',
    affiliation: 'Université Bordeaux Montaigne, chaire Diasporas africaines et transculturalité',
    interventions: [{ nature: 'Conférence inaugurale (keynote)', titre: 'Jean Godefroy Bidima : un critique de la postcolonie ?' }],
  },
  {
    nom: 'Brigitte Nga Ondigui',
    affiliation: 'Université du Québec à Montréal',
    alias: ['Brigitte Ondigui'],
    interventions: [{ nature: 'Performance', titre: 'Traversées de M’mouatisations' }, { nature: 'Comité d’organisation' }],
  },
  {
    nom: 'Pierre Tchimabi',
    affiliation: 'ENS, Université de Maroua',
    interventions: [
      { nature: 'Présidence de séance', cadre: 'Session 1 · La palabre : médiation, droit et réparation' },
      {
        nature: 'Communication',
        titre: 'L’art et la « traversée » comme espaces d’émancipation : pour une imagination afrofuturiste de la démocratie chez Jean Godefroy Bidima',
        cadre: 'Session 3',
      },
    ],
  },
  {
    nom: 'Ulrich Metende',
    affiliation: 'Laboratoire des Afriques innovantes, UQAM · Groupe JOGOO',
    interventions: [{ nature: 'Communication', titre: 'Jean Godefroy Bidima, un philosophe de la médiation', cadre: 'Session 1' }, { nature: 'Comité d’organisation' }],
  },
  {
    nom: 'Fanjasoa Louisette Rasoloniaina',
    affiliation: 'EVCAU – ÉCHELLES, ENSAPVS / Université Paris Cité',
    alias: ['Louisette Rasoloniaina'],
    interventions: [{ nature: 'Communication', titre: 'Reprise de la biopolitique avec Bidima. Du régime de véridiction au régime de réalité', cadre: 'Session 1' }],
  },
  {
    nom: 'Emmanuel M. Banywesize',
    affiliation: 'Université de Lubumbashi',
    alias: ['Emmanuel Banywesize', 'Emma Banywesize'],
    interventions: [{ nature: 'Communication', titre: 'La démocratie : une écologie des limites pour « sauvegarder de la vie »', cadre: 'Session 1' }],
  },
  {
    nom: 'Amélie Aristelle Ekassi',
    affiliation: 'ENS de Yaoundé',
    alias: ['Amélie Ekassi'],
    interventions: [
      { nature: 'Présidence de séance', cadre: 'Session 2 · Biopolitique et démocratie en sursis' },
      { nature: 'Communication', titre: 'La dissimultanéité selon Jean Godefroy Bidima : l’intempestif dans les sociétés post-coloniales', cadre: 'Session 3' },
    ],
  },
  {
    nom: 'Charles Romain Mbele',
    affiliation: 'ENS, Université de Yaoundé I',
    interventions: [
      { nature: 'Keynote', titre: 'L’éloge de la voyoucratie et de la ploutocratie chez Jean Godefroy Bidima', cadre: 'Session 2' },
      { nature: 'Présidence de séance', cadre: 'Session 3 · Traversée, temporalité et critique postcoloniale' },
    ],
  },
  {
    nom: 'Philippe Nguemeta',
    affiliation: 'Université de Yaoundé I',
    interventions: [{ nature: 'Communication', titre: 'Droit, violence et coopération chez Bidima', cadre: 'Session 2' }],
  },
  {
    nom: 'Kalēnge Yamukēna Yantūmbi',
    affiliation: 'ISES de Lubumbashi / Université libre panafricaine',
    interventions: [
      { nature: 'Communication', titre: 'Réparer le lien et sauver la vie. Épistémologie de la palabre comme dispositif biopolitique de sortie de la violence', cadre: 'Session 2' },
    ],
  },
  {
    nom: 'Jean-Paul II Djoum',
    affiliation: 'Université de Yaoundé I',
    alias: ['Jean Paul Djoum'],
    interventions: [{ nature: 'Communication', titre: 'La palabre : un ferment à la démocratisation de l’espace public africain à partir de Bidima ?', cadre: 'Session 2' }],
  },
  {
    nom: 'Marthe Lele-Mavie',
    affiliation: 'Université de Garoua',
    alias: ['Marthe Lele Mavie'],
    interventions: [
      { nature: 'Communication', titre: 'La traversée de la vision traditionnelle de l’arbre à palabre chez Bidima et la discussion critique chez Popper', cadre: 'Session 2' },
    ],
  },
  {
    nom: 'Isidore Laohoue',
    affiliation: 'Université de Douala',
    alias: ['Isidore Laohoué'],
    interventions: [{ nature: 'Communication', titre: 'Du discours de maîtrise à l’ontologie du chantage', cadre: 'Session 2' }],
  },
  {
    nom: 'Vincent Sosthène Fouda',
    affiliation: 'Université Catholique de Lille',
    interventions: [{ nature: 'Propos sur Bidima', titre: 'Jean Godefroy Bidima, philosophe', cadre: 'Session 3' }],
  },
  {
    nom: 'Tsanga Tsinemankh',
    affiliation: 'Université de Yaoundé I',
    alias: ['Tsinemang Tsanga', 'Tchinemang Ignace Bertrand'],
    interventions: [{ nature: 'Communication', titre: 'De l’art de la traversée à l’art du croisement : dialogue avec Jean Godefroy Bidima', cadre: 'Session 3' }],
  },
  {
    nom: 'Marcelle Christelle Flora Bakary',
    affiliation: 'Université Alassane Ouattara de Bouaké',
    alias: ['Marcelle Christelle Bakary', 'Marcelle Bakary'],
    interventions: [
      { nature: 'Communication', titre: 'Démocratie et renaissance africaine : une pensée à panser au regard de Jean Godefroy Bidima', cadre: 'Session 3' },
      { nature: 'Comité d’organisation' },
    ],
  },
];

export type Signataire = { nom: string; role: string; signature: string };
export type Evenement = {
  cle: string;
  prefixe: string;
  /** Adresse de la page de demande (et de vérification). */
  page: string;
  surtitre: string;
  /** Phrase d’attestation : avant le titre, titre en gras, après le titre. */
  avant: string;
  titre: string;
  apres: string;
  lieu: string;
  logos: { fichier: string; hauteur: number }[];
  signataires: [Signataire, Signataire];
  participants: Participant[];
  contact: string;
};

export const EVENEMENTS: Record<string, Evenement> = {
  'colloque-eboussi': {
    cle: 'colloque-eboussi',
    prefixe: COLLOQUE.prefixe,
    page: '/colloque-eboussi/attestation',
    surtitre: `Colloque international · Toulouse, ${COLLOQUE.dates}`,
    avant: 'Le comité scientifique et le comité d’organisation du colloque international',
    titre: `${COLLOQUE.titre} ${COLLOQUE.soustitre}`,
    apres: `organisé par l’Université Toulouse – Jean Jaurès (ERRAPHIS, LLA-Créatis), le Fonds Eboussi Boulaga et le Groupe JOGOO, et tenu en ligne les ${COLLOQUE.dates}, attestent la participation de`,
    lieu: 'Toulouse',
    logos: [
      { fichier: 'att-logo-ut2j.png', hauteur: 32 },
      { fichier: 'att-logo-fonds.png', hauteur: 48 },
      { fichier: 'att-logo-jogoo.png', hauteur: 38 },
    ],
    signataires: [
      { nom: 'Dr Adoulou N. Bitang', role: 'Secrétaire exécutif du Fonds Eboussi Boulaga\nMembre du comité d’organisation', signature: 'bitang' },
      { nom: 'Pr Jean-Christophe Goddard', role: 'Université Toulouse – Jean Jaurès\nPour le comité scientifique', signature: 'goddard' },
    ],
    participants: PARTICIPANTS,
    contact: 'fondseboussi@gmail.com',
  },
  'palabre-bidima': {
    cle: 'palabre-bidima',
    prefixe: 'PJB26',
    page: '/palabre-bidima/attestation',
    surtitre: 'Journée d’étude · Paris, 21 octobre 2026',
    avant: 'Le comité scientifique et le comité d’organisation de la journée d’étude',
    titre: 'Palabre autour de Jean Godefroy Bidima. Leçons de biopolitique : la démocratie en sursis ?',
    apres:
      'organisée par le Collège international de philosophie, le Groupe JOGOO et le Conseil Inter-Africain de Philosophie (CIAP), et tenue le 21 octobre 2026 au Fonds Ricœur (Institut protestant de théologie, Paris) et en ligne, attestent la participation de',
    lieu: 'Paris',
    logos: [
      { fichier: 'att-logo-ciph.png', hauteur: 46 },
      { fichier: 'att-logo-jogoo.png', hauteur: 40 },
    ],
    signataires: [
      { nom: 'Yannick Essengue', role: 'Université Toulouse 2 Jean Jaurès · Groupe JOGOO\nPour le comité d’organisation', signature: 'essengue' },
      {
        nom: 'Pr David-Le-Duc Tiaha',
        role: 'Directeur de programme au Collège international de philosophie\nChercheur associé au Fonds Ricœur',
        signature: 'tiaha',
      },
    ],
    participants: PARTICIPANTS_BIDIMA,
    contact: 'philoafricaine@gmail.com',
  },
};

export const reference = (i: number, prefixe: string = COLLOQUE.prefixe) => `${prefixe}-${String(i + 1).padStart(3, '0')}`;

/** Retrouve une personne d’après le nom saisi (ordre des mots, accents et casse indifférents). */
export function chercher(saisie: string, liste: Participant[] = PARTICIPANTS): { index: number; p: Participant } | 'aucun' | 'plusieurs' {
  const s = new Set(mots(saisie));
  if (s.size < 2) return 'aucun';
  const trouves: number[] = [];
  liste.forEach((p, i) => {
    const ok = [p.nom, ...(p.alias ?? [])].some((g) => {
      const m = new Set(mots(g));
      const communs = [...s].filter((x) => m.has(x)).length;
      // tous les mots saisis figurent dans le nom enregistré, ou l’inverse
      return communs >= 2 && (communs === s.size || communs === m.size);
    });
    if (ok) trouves.push(i);
  });
  if (!trouves.length) return 'aucun';
  if (trouves.length > 1) return 'plusieurs';
  return { index: trouves[0], p: liste[trouves[0]] };
}

/** Vérification d’un numéro d’attestation, tous événements confondus. */
export function parReference(ref: string): { index: number; p: Participant; ev: Evenement } | null {
  const m = /^([A-Z0-9]+)-(\d{3})$/i.exec(ref.trim());
  if (!m) return null;
  const ev = Object.values(EVENEMENTS).find((e) => e.prefixe.toLowerCase() === m[1].toLowerCase());
  const i = Number(m[2]) - 1;
  return ev && ev.participants[i] ? { index: i, p: ev.participants[i], ev } : null;
}

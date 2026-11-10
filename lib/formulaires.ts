/**
 * Formulaires en ligne : inscriptions aux rendez-vous de l’agenda et candidatures aux appels.
 * Données pures (aucun import serveur) : utilisées par la page, le composant client et l’API.
 */

export type Champ = {
  nom: string;
  libelle: string;
  type: 'texte' | 'email' | 'tel' | 'zone' | 'choix' | 'fichier';
  requis?: boolean;
  aide?: string;
  max?: number; // caractères
  mots?: [number, number]; // fourchette indicative de mots
  options?: string[];
  lignes?: number;
  demi?: boolean; // moitié de ligne sur ordinateur
};

export type Genre = 'inscription' | 'communication' | 'article' | 'seminaire' | 'masterclass';

export const DESTINATAIRES = ['philoafricaine@gmail.com', 'fondseboussi@gmail.com'];
export const FICHIER_MAX = 4 * 1024 * 1024; // 4 Mo (limite des fonctions Vercel : 4,5 Mo par envoi)
export const EXTENSIONS = ['.docx', '.doc', '.odt', '.pdf', '.rtf'];

const identite: Champ[] = [
  { nom: 'prenom', libelle: 'Prénom', type: 'texte', requis: true, max: 80, demi: true },
  { nom: 'nom', libelle: 'Nom', type: 'texte', requis: true, max: 80, demi: true },
  { nom: 'email', libelle: 'Adresse e-mail', type: 'email', requis: true, max: 160, demi: true },
  { nom: 'telephone', libelle: 'Téléphone ou WhatsApp', type: 'tel', max: 40, demi: true, aide: 'Facultatif.' },
  { nom: 'affiliation', libelle: 'Institution de rattachement', type: 'texte', requis: true, max: 200, demi: true, aide: 'Université, laboratoire, institution ; « indépendant » le cas échéant.' },
  { nom: 'statut', libelle: 'Statut ou fonction', type: 'texte', requis: true, max: 120, demi: true, aide: 'Ex. : doctorant, maître de conférences, enseignant.' },
  { nom: 'pays', libelle: 'Pays de résidence', type: 'texte', max: 80, demi: true },
];

const resume: Champ = { nom: 'resume', libelle: 'Résumé', type: 'zone', requis: true, max: 3500, mots: [250, 300], lignes: 9 };
const motsCles: Champ = { nom: 'motsCles', libelle: 'Mots-clés', type: 'texte', requis: true, max: 200, aide: 'Cinq au plus, séparés par des virgules.' };
const notice: Champ = { nom: 'notice', libelle: 'Notice biobibliographique', type: 'zone', requis: true, max: 2000, mots: [80, 150], lignes: 5, aide: 'Parcours, recherches en cours et principales publications.' };
const titre: Champ = { nom: 'titre', libelle: 'Titre de la proposition', type: 'texte', requis: true, max: 300 };
const langue: Champ = { nom: 'langue', libelle: 'Langue', type: 'choix', requis: true, options: ['Français', 'Anglais'], demi: true };

export const FORMULAIRES: Record<Genre, { titre: string; intro: string; champs: Champ[]; bouton: string }> = {
  inscription: {
    titre: 'Inscription',
    intro: 'Inscrivez-vous pour recevoir le lien de connexion, les rappels et les documents de la séance.',
    bouton: 'Je m’inscris',
    champs: [
      ...identite.map((c) => (c.nom === 'affiliation' || c.nom === 'statut' ? { ...c, requis: false, aide: 'Facultatif.' } : c)),
      { nom: 'participation', libelle: 'Je participerai', type: 'choix', requis: true, options: ['En ligne (Zoom)', 'En direct sur le site ou YouTube'] },
      { nom: 'message', libelle: 'Question ou message aux organisateurs', type: 'zone', max: 1500, lignes: 3, aide: 'Facultatif.' },
    ],
  },
  communication: {
    titre: 'Proposition de communication',
    intro: 'Votre proposition est transmise au comité d’organisation ; une copie vous est envoyée par e-mail.',
    bouton: 'Envoyer ma proposition',
    champs: [...identite, titre, langue, resume, motsCles, notice, { nom: 'fichier', libelle: 'Document complémentaire', type: 'fichier', aide: 'Facultatif : .docx, .odt ou .pdf, 4 Mo au plus.' }],
  },
  article: {
    titre: 'Proposition d’article',
    intro: 'L’article, anonymisé pour la double lecture à l’aveugle, est transmis au secrétariat de la revue ; une copie de votre envoi vous parvient par e-mail.',
    bouton: 'Envoyer mon article',
    champs: [
      ...identite,
      titre,
      langue,
      { ...resume, libelle: 'Résumé de l’article' },
      motsCles,
      notice,
      { nom: 'fichier', libelle: 'Article anonymisé', type: 'fichier', requis: true, aide: 'Fichier .docx (Garamond ou Times New Roman, interligne simple), 50 000 signes au plus ; 4 Mo au plus.' },
    ],
  },
  seminaire: {
    titre: 'Candidature au séminaire',
    intro: 'Choisissez votre rôle et la séance souhaitée ; le secrétariat du Fonds vous répondra par e-mail.',
    bouton: 'Envoyer ma candidature',
    champs: [
      ...identite,
      { nom: 'role', libelle: 'Rôle souhaité', type: 'choix', requis: true, options: ['Présentation', 'Modération'], demi: true },
      { nom: 'seance', libelle: 'Séance souhaitée', type: 'choix', requis: true, options: [] },
      { ...titre, libelle: 'Thème ou titre de l’intervention' },
      { ...resume, libelle: 'Résumé de l’intervention' },
      motsCles,
      notice,
    ],
  },
  masterclass: {
    titre: 'Candidature à la MasterClass',
    intro: 'Votre dossier est transmis au secrétaire exécutif du Fonds ; une copie vous est envoyée par e-mail.',
    bouton: 'Envoyer mon dossier',
    champs: [
      ...identite.map((c) => (c.nom === 'statut' ? { ...c, libelle: 'Niveau d’étude', aide: 'Master 1, master 2, doctorat (année).' } : c)),
      { nom: 'direction', libelle: 'Direction de recherche', type: 'texte', max: 200, demi: true, aide: 'Facultatif.' },
      { nom: 'avancement', libelle: 'Avancement du travail', type: 'choix', requis: true, demi: true, options: ['Projet ou début de recherche', 'Rédaction en cours', 'Rédaction avancée', 'Soutenance prochaine'] },
      { ...titre, libelle: 'Titre du mémoire ou de la thèse' },
      { ...resume, libelle: 'Résumé et problématique du travail' },
      motsCles,
      { nom: 'lettre', libelle: 'Lettre de motivation', type: 'zone', requis: true, max: 5000, lignes: 7 },
      { nom: 'experts', libelle: 'Personnes dont vous souhaitez l’expertise', type: 'texte', max: 400, aide: 'Facultatif.' },
      notice,
      { nom: 'fichier', libelle: 'Extrait du travail', type: 'fichier', requis: true, aide: 'Problématique ou extrait (10 000 mots au plus) : .docx, .odt ou .pdf, 4 Mo au plus.' },
    ],
  },
};

export const compterMots = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

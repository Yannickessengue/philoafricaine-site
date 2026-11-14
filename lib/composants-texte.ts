import { fields } from '@keystatic/core';
import { createElement } from 'react';
import { block, mark, wrapper } from '@keystatic/core/content-components';

/* Couleurs et polices de base du site, proposées dans l’éditeur. */
export const COULEURS: Record<string, [string, string]> = {
  terra: ['Terracotta', '#c94c27'],
  'terra-deep': ['Terracotta foncé', '#9e3a1c'],
  gold: ['Or', '#eabf31'],
  'gold-deep': ['Or foncé', '#a97e0c'],
  ink: ['Noir', '#1a1a1a'],
  'ink-soft': ['Gris brun', '#3f3a38'],
  blanc: ['Blanc (sur fond sombre)', '#ffffff'],
};
export const POLICES: Record<string, [string, string]> = {
  serif: ['Libre Baskerville (sérif)', 'var(--font-serif)'],
  brand: ['Montserrat (titres)', 'var(--font-brand)'],
  sans: ['Ubuntu (texte courant)', 'var(--font-sans)'],
};
export const TAILLES: Record<string, [string, string]> = { petit: ['Petit', '0.85em'], grand: ['Grand', '1.2em'], 'tres-grand': ['Très grand', '1.5em'] };
export const FONDS: Record<string, [string, string]> = { or: ['Or clair', '#f6e08a'], sable: ['Sable', '#f8ede8'], terra: ['Terracotta clair', '#f3d3c8'] };
const choix = (t: Record<string, [string, string]>) => Object.entries(t).map(([value, [label]]) => ({ label, value }));
/* Icônes de la barre d'outils : contenu SVG (l'éditeur les place dans un cadre 24 × 24). */
const lettre = (t: string, x = 12, taille = 17, extra: Record<string, string | number> = {}) =>
  createElement('text', { key: t, x, y: 17, textAnchor: 'middle', fontSize: taille, fontWeight: 700, fill: 'currentColor', stroke: 'none', fontFamily: 'Arial, sans-serif', ...extra }, t);
const icone = (...e: ReturnType<typeof createElement>[]) => createElement('g', null, ...e);
const ICONES = {
  couleur: icone(lettre('A', 12, 16, { y: 15 }), createElement('rect', { key: 'r', x: 4, y: 18.5, width: 16, height: 3.5, fill: '#c94c27', stroke: 'none' })),
  surlignage: icone(createElement('rect', { key: 'r', x: 3, y: 3, width: 18, height: 18, rx: 2, fill: '#f6e08a', stroke: 'none' }), lettre('A', 12, 15)),
  police: icone(lettre('F', 12, 18, { fontFamily: 'Georgia, serif', fontStyle: 'italic' })),
  taille: icone(lettre('A', 7.5, 11), lettre('A ', 16.5, 18)),
};

/* Éléments à insérer au milieu d'un texte, dans l'éditeur riche de l'Espace rédaction
   (bouton « + » ou « / » de l'éditeur) : image avec légende, encadré, citation mise en avant. */
export const composantsTexte = {
  couleur: mark({
    label: 'Couleur du texte',
    icon: ICONES.couleur,
    schema: { teinte: fields.select({ label: 'Couleur', options: choix(COULEURS), defaultValue: 'terra' }) },
    tag: 'span',
    style: ({ value }) => ({ color: (COULEURS[value.teinte] ?? COULEURS.terra)[1] }),
  }),
  surlignage: mark({
    label: 'Surlignage',
    icon: ICONES.surlignage,
    schema: { fond: fields.select({ label: 'Fond', options: choix(FONDS), defaultValue: 'or' }) },
    tag: 'mark',
    style: ({ value }) => ({ backgroundColor: (FONDS[value.fond] ?? FONDS.or)[1], color: 'inherit' }),
  }),
  police: mark({
    label: 'Police de caractères',
    icon: ICONES.police,
    schema: { famille: fields.select({ label: 'Police', options: choix(POLICES), defaultValue: 'serif' }) },
    tag: 'span',
    style: ({ value }) => ({ fontFamily: (POLICES[value.famille] ?? POLICES.serif)[1] }),
  }),
  taille: mark({
    label: 'Taille du texte',
    icon: ICONES.taille,
    schema: { taille: fields.select({ label: 'Taille', options: choix(TAILLES), defaultValue: 'grand' }) },
    tag: 'span',
    style: ({ value }) => ({ fontSize: (TAILLES[value.taille] ?? TAILLES.grand)[1] }),
  }),
  paragraphe: wrapper({
    label: 'Paragraphe mis en forme',
    description: 'Alignement, couleur, police et taille d’un ou plusieurs paragraphes.',
    schema: {
      alignement: fields.select({
        label: 'Alignement',
        options: [
          { label: 'Justifié (par défaut)', value: 'justifie' },
          { label: 'À gauche', value: 'gauche' },
          { label: 'Centré', value: 'centre' },
          { label: 'À droite', value: 'droite' },
        ],
        defaultValue: 'centre',
      }),
      teinte: fields.select({ label: 'Couleur', options: [{ label: 'Couleur du texte courant', value: 'defaut' }, ...choix(COULEURS)], defaultValue: 'defaut' }),
      famille: fields.select({ label: 'Police', options: [{ label: 'Police du texte courant', value: 'defaut' }, ...choix(POLICES)], defaultValue: 'defaut' }),
      taille: fields.select({ label: 'Taille', options: [{ label: 'Taille normale', value: 'defaut' }, ...choix(TAILLES)], defaultValue: 'defaut' }),
    },
  }),
  illustration: block({
    label: 'Image avec légende',
    description: 'Une image au fil du texte : pleine largeur, à gauche ou à droite (le texte l’entoure).',
    schema: {
      image: fields.image({ label: 'Image', directory: 'public/medias/uploads/illustrations', publicPath: '/medias/uploads/illustrations/', validation: { isRequired: true } }),
      description: fields.text({ label: 'Description de l’image (pour l’accessibilité)' }),
      legende: fields.text({ label: 'Légende' }),
      credit: fields.text({ label: 'Crédit (photographe, source)' }),
      position: fields.select({
        label: 'Position',
        options: [
          { label: 'Pleine largeur', value: 'pleine' },
          { label: 'À gauche (texte autour)', value: 'gauche' },
          { label: 'À droite (texte autour)', value: 'droite' },
          { label: 'Centrée, petite', value: 'centre' },
        ],
        defaultValue: 'pleine',
      }),
    },
  }),
  encadre: wrapper({
    label: 'Encadré',
    description: 'Un bloc mis en valeur (repère, définition, biographie, chiffres…) au milieu du texte.',
    schema: {
      titre: fields.text({ label: 'Titre de l’encadré' }),
      style: fields.select({
        label: 'Style',
        options: [
          { label: 'Sable (clair)', value: 'sable' },
          { label: 'Terracotta', value: 'terra' },
          { label: 'Sombre', value: 'sombre' },
          { label: 'Filet simple', value: 'filet' },
        ],
        defaultValue: 'sable',
      }),
      position: fields.select({
        label: 'Position',
        options: [
          { label: 'Pleine largeur', value: 'pleine' },
          { label: 'À droite (texte autour)', value: 'droite' },
          { label: 'À gauche (texte autour)', value: 'gauche' },
        ],
        defaultValue: 'pleine',
      }),
    },
  }),
  citation: block({
    label: 'Citation mise en avant',
    description: 'Une phrase forte, en grand, au milieu du texte.',
    schema: {
      texte: fields.text({ label: 'Citation', multiline: true }),
      auteur: fields.text({ label: 'Auteur ou source' }),
    },
  }),
};

export const rendusTexte = {
  illustration: 'Illustration',
  encadre: 'Encadre',
  citation: 'Citation',
  couleur: 'Couleur',
  surlignage: 'Surlignage',
  police: 'Police',
  taille: 'Taille',
  paragraphe: 'Paragraphe',
} as const;

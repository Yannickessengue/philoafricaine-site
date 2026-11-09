import { fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

/* Éléments à insérer au milieu d'un texte, dans l'éditeur riche de l'Espace rédaction
   (bouton « + » ou « / » de l'éditeur) : image avec légende, encadré, citation mise en avant. */
export const composantsTexte = {
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

export const rendusTexte = { illustration: 'Illustration', encadre: 'Encadre', citation: 'Citation' } as const;

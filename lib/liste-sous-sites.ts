/**
 * Les six projets du Groupe JOGOO : adresse, nom, logo, échelle.
 * Logos recadrés au plus près (public/medias/site/jogoo/projets/) ; l’échelle égalise leur surface visuelle
 * (1 / √(largeur/hauteur), corrigée pour les logos très denses) afin qu’aucun ne paraisse plus gros que les autres.
 */
export const SOUS_SITES: [string, string, string, number][] = [
  ['/sous-sites/revue-jogoo', 'Revue JOGOO', '/medias/site/jogoo/projets/revue.png', 0.98],
  ['/sous-sites/editions-jogoo', 'Éditions JOGOO', '/medias/site/jogoo/projets/editions.png', 1.03],
  ['/sous-sites/fonds-eboussi-boulaga', 'Fonds Eboussi Boulaga', '/medias/site/jogoo/projets/fonds.png', 0.86],
  ['/sous-sites/jogoo-ai', 'JOGOO AI', '/medias/site/jogoo/projets/ai.png', 0.78],
  ['/sous-sites/sankofa-communications', 'Sankofa Communications', '/medias/site/jogoo/projets/sankofa.png', 0.9],
  ['/sous-sites/philo-africaine-magazine', 'Philo Africaine Magazine', '/medias/site/jogoo/projets/magazine.png', 0.7],
];

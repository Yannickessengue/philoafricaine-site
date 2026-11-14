/* Constantes partagées client + serveur (aucune dépendance serveur). */

export const APPLICATION_STATUSES = ["new", "review", "shortlist", "rejected", "archived"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: "Nouvelle",
  review: "À l’étude",
  shortlist: "Présélection",
  rejected: "Écartée",
  archived: "Archivée",
};

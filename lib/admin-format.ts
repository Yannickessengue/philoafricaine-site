const nf = new Intl.NumberFormat("fr-FR");

/** Nombre formaté à la française (séparateurs de milliers). */
export const fmt = (n: number) => nf.format(n);

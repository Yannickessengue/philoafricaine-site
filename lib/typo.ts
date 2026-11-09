/** Typographie française : espaces fines insécables avant ; : ! ? et à l'intérieur des guillemets. */
const FINE = ' ';
export function typo(s: string) {
  return s
    .replace(/[  ]+([;:!?»])/g, `${FINE}$1`)
    .replace(/«[  ]+/g, `«${FINE}`)
    .replace(/([A-Za-zÀ-ÿ\)\]])([;!?])(?=\s|$)/g, `$1${FINE}$2`)
    .replace(/([^\s «])»/g, `$1${FINE}»`)
    .replace(/«([^\s »])/g, `«${FINE}$1`);
}

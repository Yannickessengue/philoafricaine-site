import { composerLettre, lettreHTML } from '@/lib/lettre';

/** Version en ligne de la lettre hebdomadaire (aperçu de la prochaine lettre, mis à jour toutes les heures). */
export const revalidate = 3600;

export async function GET() {
  const l = await composerLettre();
  const html = lettreHTML(l, { desabonnement: 'mailto:philoafricaine@gmail.com?subject=D%C3%A9sinscription%20de%20la%20lettre' });
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

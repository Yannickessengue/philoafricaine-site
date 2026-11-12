import { Html } from '@/components/Html';
import { fragment } from '@/lib/gabarits';

export const metadata = { title: 'Plan du site' };

export default function PlanDuSite() {
  const lien = (href: string, t: string) => `<li><a class="text-ink underline underline-offset-2 hover:text-terra" href="${href}">${t}</a></li>`;
  const html = fragment('plan-du-site')
    .replace(
      '<li><a class="text-ink underline underline-offset-2 hover:text-terra" href="/flash">Flash d’entrée</a></li>',
      `${lien('/edito', 'L’édito de la semaine')}${lien('/flash', 'Flash d’entrée')}`,
    )
    .replace(
      '<li><a class="text-ink underline underline-offset-2 hover:text-terra" href="/sous-sites/fonds-eboussi-boulaga/eboussi-studies">Revue Eboussi Studies</a> <span class="text-sm text-ink/50">, Revue scientifique, plurilingue et annuelle</span></li>',
      '<li><a class="text-ink underline underline-offset-2 hover:text-terra" href="/sous-sites/jogoo-ai">JOGOO AI</a> <span class="text-sm text-ink/50">, Assistant de recherche en philosophie africaine</span></li><li class="pl-4"><a class="text-ink-soft underline underline-offset-2 hover:text-terra" href="/sous-sites/fonds-eboussi-boulaga/eboussi-studies">Revue Eboussi Studies</a> <span class="text-sm text-ink/50">, dans le Fonds Eboussi Boulaga</span></li>',
    )
    .replace(
      '<li><a class="text-ink underline underline-offset-2 hover:text-terra" href="/mediatheque">Médiathèque</a></li>',
      `${lien('/mediatheque', 'Médiathèque')}${lien('/les-5-minutes-du-chant-du-coq', 'Les 5 minutes du chant du coq')}${lien('/podcasts', 'Podcasts')}`,
    )
    .replace(
      'href="/recherche/appels-a-postes">Appels à postes</a></li>',
      'href="/recherche/appels-a-postes">Appels à postes</a></li><li><a class="text-ink-soft underline underline-offset-2 hover:text-terra" href="/recherche/appels-a-contributions">Appels à contributions</a></li>',
    );
  return <Html html={html} />;
}

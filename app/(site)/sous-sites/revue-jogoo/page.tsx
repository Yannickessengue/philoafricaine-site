import { getRevue } from '@/lib/content';
import { Html } from '@/components/Html';
import { esc, fragment } from '@/lib/gabarits';

export const metadata = { title: 'Revue JOGOO', description: 'Revue semestrielle de philosophie africaine et de culture, éditée par les Éditions JOGOO.' };
export const revalidate = 86400;

/** Le numéro en cours, avec sa couverture. */
const NUMERO = `<section class="relative overflow-hidden bg-[#f3c614]/90"><div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.45),transparent_55%)]" aria-hidden="true"></div><div class="relative mx-auto grid max-w-6xl items-center gap-8 px-6 py-12 sm:grid-cols-[auto_1fr] sm:gap-12"><a href="/sous-sites/revue-jogoo/dossier-fondateur" class="group mx-auto block w-48 sm:mx-0 sm:w-56"><img src="/medias/site/jogoo/couverture-revue-jogoo-1.jpg" alt="Couverture de la Revue JOGOO n° 1, « L’être africain »" width="1000" height="1502" class="block w-full shadow-[0_30px_50px_-20px_rgba(90,20,0,0.55)] transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]"/></a><div><p class="font-brand text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#b3200e]">N° 1 · Octobre 2026</p><p class="mt-2 font-brand text-4xl font-black leading-none tracking-tight text-[#b3200e] sm:text-5xl">L’être africain</p><p class="mt-3 font-serif text-lg italic text-ink">Expression du manifeste d’une philosophie africaine</p><p class="mt-4 text-sm text-ink/75">Numéro coordonné par Yannick Essengue · Entretien avec Fabien Eboussi Boulaga</p><div class="mt-6 flex flex-wrap gap-3"><a href="/sous-sites/revue-jogoo/dossier-fondateur" class="bg-[#b3200e] px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-ink">Sommaire du numéro →</a><a href="/sous-sites/revue-jogoo/publier" class="bg-white/70 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-white">Proposer un article</a></div></div></div></section>`;

const LANGUES: Record<string, string> = { pt: 'PT', es: 'ES', en: 'EN', ar: 'AR' };

/** Accueil de la Revue JOGOO : gabarit d'origine, sommaire en trois colonnes tiré de l'administration. */
export default async function RevueAccueil() {
  const revue = await getRevue();
  const colonnes: [string, (s: string, r: string) => boolean][] = [
    ['Contributions', (s, r) => r === 'presentation' || s === 'Réflexions'],
    ['Points de vue &amp; varia', (s, r) => r === 'article' && s !== 'Réflexions' && !s.startsWith('Dossier')],
    ['Recensions', (_s, r) => r === 'recension'],
  ];
  const li = (x: (typeof revue)[number]) => {
    const langue = x.entry.langue ? LANGUES[x.entry.langue] : undefined;
    return `<li class="py-3 first:pt-0"><a class="group block" href="/sous-sites/revue-jogoo/${x.slug}"><span class="font-serif text-[0.98rem] italic leading-snug text-ink-soft group-hover:text-terra-deep">${esc(x.entry.titre)}</span>${langue ? `<span class="ml-1.5 align-middle text-[0.6rem] font-semibold uppercase not-italic text-ink/35">[${langue}]</span>` : ''}<span class="mt-0.5 block text-sm not-italic text-ink/55">${esc(x.entry.auteurs)}</span></a></li>`;
  };
  const sommaire = `<section class="mx-auto max-w-6xl px-6 py-14"><div class="grid gap-5 lg:grid-cols-3">${colonnes
    .map(([titre, test]) => {
      const items = revue.filter((x) => test(x.entry.section ?? '', x.entry.rubrique));
      return `<div class="border border-ink/12 bg-white p-5 sm:p-6"><h2 class="inline-block border-b-[3px] border-terra pb-1 font-brand text-base font-bold text-ink">${titre}</h2><ul class="mt-4 divide-y divide-ink/10">${items.map(li).join('')}</ul></div>`;
    })
    .join('')}</div><p class="mt-6 text-center"><a class="font-brand text-xs font-bold uppercase tracking-wide text-terra-deep hover:text-terra" href="/sous-sites/revue-jogoo/dossier-fondateur">Voir le sommaire complet du numéro →</a></p></section>`;
  const avant = fragment('revue-accueil-avant');
  const fin = avant.indexOf('</header>') + '</header>'.length;
  return <Html html={'<h1 class="sr-only">Revue JOGOO, revue de philosophie africaine &amp; de culture</h1>' + avant.slice(0, fin) + NUMERO + avant.slice(fin) + sommaire + fragment('revue-accueil-apres')} />;
}

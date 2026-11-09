import { getRevue } from '@/lib/content';
import { Html } from '@/components/Html';
import { esc, fragment } from '@/lib/gabarits';

export const metadata = { title: 'Revue JOGOO', description: 'Revue semestrielle de philosophie africaine et de culture, éditée par les Éditions JOGOO.' };
export const revalidate = 86400;

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
  return <Html html={fragment('revue-accueil-avant') + sommaire + fragment('revue-accueil-apres')} />;
}

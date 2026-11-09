import Markdoc from '@markdoc/markdoc';
import { reader } from '@/lib/content';
import { Html } from '@/components/Html';
import { getAppels } from '@/components/Appels';
import { esc, fragment } from '@/lib/gabarits';

export const metadata = { title: 'Recherche', description: 'Mutualiser les connaissances et les expériences, dans un esprit d’interdisciplinarité.' };
export const revalidate = 86400;

type Appel = Awaited<ReturnType<typeof getAppels>>[number];

/** Carte d'appel (même gabarit que l'original), en HTML pour s'insérer dans la page d'origine. */
function carte(a: Appel) {
  const e = a.entry;
  const corps = Markdoc.renderers.html(Markdoc.transform(a.corps)).replace(/<p>/g, '<p class="text-sm leading-relaxed text-ink-soft">').replace(/^<article>|<\/article>$/g, '');
  return `<div class="flex flex-col gap-3 border border-ink/10 p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] ${a.ouvert ? 'bg-white' : 'bg-cream/40'}">
<div class="flex items-start justify-between gap-3"><p class="kicker">${esc(e.type)}</p><span class="shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${a.ouvert ? 'bg-terra/10 text-terra-deep' : 'bg-ink/8 text-ink/50'}">${a.ouvert ? 'Ouvert' : 'Clos'}</span></div>
<h3 class="font-brand text-base font-bold text-ink">${esc(e.titre)}</h3>
${e.dateEvenement || e.lieu ? `<p class="text-sm text-ink-soft">${esc(e.dateEvenement)}${e.dateEvenement && e.lieu ? '<br/>' : ''}${esc(e.lieu)}</p>` : ''}
${corps}
${e.dateLimite ? `<p class="text-sm font-semibold ${a.ouvert ? 'text-terra-deep' : 'text-ink/45 line-through decoration-1'}">${esc(e.dateLimite)}</p>` : ''}
<div class="mt-auto flex flex-wrap gap-3 pt-2">${e.fichier ? `<a class="text-sm font-semibold text-terra-deep underline underline-offset-2 hover:text-terra" href="${esc(e.fichier)}" target="_blank" rel="noreferrer">${esc(e.fichierLibelle || 'Télécharger l’appel (PDF)')}</a>` : ''}${e.contact ? `<a class="text-sm font-semibold text-ink-soft underline underline-offset-2 hover:text-terra" href="mailto:${esc(e.contact)}">${esc(e.contact)}</a>` : ''}</div></div>`;
}

export default async function Recherche() {
  const [appels, postes] = await Promise.all([getAppels(), reader.collections.postes.all()]);
  const ouverts = postes.filter((p) => !p.entry.pourvu).length;
  const h = fragment('page__recherche');
  const a = h.indexOf('<div class=""><p class="kicker mb-2">En ce moment');
  const b = h.indexOf('<hr class="rule-dotted my-14"/>', a);
  const bloc = `<div class=""><p class="kicker mb-2">${appels.some((x) => x.ouvert) ? 'En ce moment' : 'Derniers appels'}</p><h2 class="display-title text-3xl text-terra sm:text-4xl">Appels à contributions</h2></div><div class="mt-8 grid gap-4 sm:grid-cols-2">${appels.map(carte).join('')}</div>`;
  const html = (h.slice(0, a) + bloc + h.slice(b))
    .replace(/(<dt class="display-title text-3xl text-gold">)\d+(<\/dt><dd class="mt-1 text-sm leading-snug text-paper\/70">Postes actuellement ouverts)/, `$1${ouverts}$2`)
    .replace(/\d+ postes actuellement ouverts/g, `${ouverts} poste${ouverts > 1 ? 's' : ''} actuellement ouvert${ouverts > 1 ? 's' : ''}`);
  return <Html html={html} />;
}

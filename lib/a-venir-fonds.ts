import 'server-only';
import { getAgenda } from '@/lib/content';
import { reader } from '@/lib/content';

const echap = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/**
 * Bloc « À venir » des pages du Fonds Eboussi Boulaga (accueil et Activités) : rendez-vous de l’agenda
 * organisés par le Fonds et appels ouverts qui le concernent. Produit du HTML, inséré à la place de
 * <div data-a-venir="fonds"></div> dans les fragments du Fonds.
 */
export async function aVenirFondsHtml() {
  const mois = new Date().toISOString().slice(0, 7);
  const jour = new Date().toISOString().slice(0, 10);
  const rdv = (await getAgenda()).filter((a) => a.entry.organisateur === 'fonds' && a.entry.date!.slice(0, 7) >= mois).slice(0, 4);
  const appels = (await reader.collections.appels.all())
    .filter((a) => a.entry.ouvert && !(a.entry.cloture && a.entry.cloture < jour) && /eboussi|fonds/i.test(`${a.entry.titre} ${a.entry.lieu} ${a.entry.contact}`))
    .sort((a, b) => (a.entry.ordre ?? 0) - (b.entry.ordre ?? 0));
  const actus = (await reader.collections.actualites.all())
    .filter((x) => x.entry.espace === 'fonds')
    .sort((x, y) => (y.entry.date ?? '').localeCompare(x.entry.date ?? ''))
    .slice(0, 3);
  const blocActus = actus.length
    ? `<section aria-label="Actualités du Fonds Eboussi Boulaga" class="bg-white py-14"><div class="mx-auto max-w-[1100px] px-5">
  <p class="font-brand text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#c8481e]">Comptes rendus et annonces</p>
  <h2 class="mt-1 font-serif text-3xl text-[#1a1512] sm:text-4xl">Actualités du Fonds</h2>
  <ul class="mt-6 grid gap-6 ${actus.length > 1 ? 'md:grid-cols-2' : ''}">${actus
    .map(
      ({ slug, entry: e }) => `<li class="grid gap-5 border border-[#e6d9cc] bg-[#fbf7f2] p-5 text-left sm:grid-cols-[11rem_minmax(0,1fr)]">
    ${e.image ? `<a href="/actualites/${slug}" class="block aspect-square overflow-hidden bg-[#f1e6da]"><img src="${e.image}" alt="" loading="lazy" class="h-full w-full object-cover object-top"></a>` : ''}
    <div class="min-w-0"><p class="text-xs uppercase tracking-wide text-[#6b5f56]">${echap(new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${e.date}T00:00:00Z`)))}</p>
    <a href="/actualites/${slug}" class="mt-1 block font-serif text-xl leading-snug !text-[#1a1512] !no-underline hover:!text-[#c8481e]">${echap(e.titre)}</a>
    ${e.resume ? `<p class="mt-2 text-sm leading-relaxed text-[#6b5f56]">${echap(e.resume)}</p>` : ''}
    <a href="/actualites/${slug}" class="mt-3 inline-block text-xs font-bold uppercase tracking-[0.1em] !text-[#c8481e] underline underline-offset-2">Lire le compte rendu</a></div>
  </li>`,
    )
    .join('')}</ul></div></section>`
    : '';
  if (!rdv.length && !appels.length) return blocActus;

  const cartes = rdv
    .map(({ slug, entry: e }) => {
      const [, m, j] = (e.date ?? '').split('-').map(Number);
      const titre = e.intitule.includes(' · ') ? e.intitule.split(' · ').slice(1).join(' · ') : e.intitule;
      const genre = e.intitule.includes(' · ') ? e.intitule.split(' · ')[0].replace(/ du Fonds Eboussi Boulaga/, '') : 'Rendez-vous';
      const pave = e.aConfirmer
        ? '<span class="font-brand text-[0.62rem] font-bold uppercase leading-tight tracking-wide">Date<br>à préciser</span>'
        : `<span class="font-brand text-2xl font-black leading-none">${j}</span><span class="font-brand text-[0.65rem] font-bold uppercase tracking-wide">${MOIS[m - 1]}</span>`;
      return `<li class="flex gap-4 border border-[#e6d9cc] bg-white p-5">
  <span class="flex h-16 w-14 shrink-0 flex-col items-center justify-center bg-[#c8481e] text-center text-white">${pave}</span>
  <div class="min-w-0 text-left">
    <p class="font-brand text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#c8481e]">${echap(genre)}</p>
    <p class="mt-1 font-serif text-lg leading-snug text-[#1a1512]">${echap(titre)}</p>
    <p class="mt-1 text-sm text-[#6b5f56]">${echap([e.aConfirmer ? '' : e.dateAffichee, e.heure, e.lieu].filter(Boolean).join(' · '))}</p>
    <p class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[0.72rem] font-bold uppercase tracking-[0.08em]">
      ${e.inscription ? `<a href="/inscription/${slug}" class="bg-[#1a1512] px-3 py-1.5 !text-white !no-underline hover:bg-[#c8481e]">S’inscrire</a>` : ''}
      ${e.enDirect ? `<a href="/direct" class="py-1.5 !text-[#1a1512] underline underline-offset-2 hover:!text-[#c8481e]">● En direct sur le site</a>` : ''}
      ${e.fichier ? `<a href="${e.fichier}" target="_blank" rel="noreferrer" class="py-1.5 !text-[#c8481e] underline underline-offset-2">PDF</a>` : ''}
    </p>
  </div>
</li>`;
    })
    .join('');

  const listeAppels = appels
    .map(
      ({ slug, entry: e }) => `<li class="border-t border-white/15 py-4 first:border-t-0 first:pt-0">
  <p class="font-brand text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#f3c614] [word-spacing:normal]">${echap(e.type ?? 'Appel')}</p>
  <a href="${e.formulaire && e.formulaire !== 'aucun' ? `/candidature/${slug}` : '/recherche/appels-a-contributions'}" class="mt-1 block font-serif text-[1.05rem] leading-snug !text-white !no-underline hover:!text-[#f3c614]">${echap(e.titre)}</a>
  ${e.dateLimite ? `<p class="mt-1 text-xs text-white/65">${echap(e.dateLimite)}</p>` : ''}
</li>`,
    )
    .join('');

  return `<section aria-label="À venir au Fonds Eboussi Boulaga" class="border-y border-[#e6d9cc] bg-[#f7f0e8] py-14">
<div class="mx-auto grid max-w-[1100px] gap-8 px-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
  <div>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div><p class="font-brand text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#c8481e]">Activités 2026-2027</p>
      <h2 class="mt-1 font-serif text-3xl text-[#1a1512] sm:text-4xl">À venir</h2></div>
      <a href="/actualites#agenda" class="text-sm font-semibold !text-[#c8481e] underline underline-offset-2">Voir l’agenda complet →</a>
    </div>
    <ol class="mt-6 grid gap-3">${cartes || '<li class="text-sm text-[#6b5f56]">Le programme sera annoncé prochainement.</li>'}</ol>
  </div>
  ${
    listeAppels
      ? `<aside class="self-start bg-[#1a1512] p-6 text-left"><p class="font-brand text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/60">Appels ouverts</p><ul class="mt-4">${listeAppels}</ul>
  <a href="/recherche/appels-a-contributions" class="mt-5 inline-block text-xs font-bold uppercase tracking-[0.1em] !text-[#f3c614] underline underline-offset-2">Tous les appels</a></aside>`
      : ''
  }
</div></section>${blocActus}`;
}

import type { Activite } from '@/lib/activites';
import { FORMULAIRES } from '@/lib/formulaires';
import { FormulaireEnLigne } from '@/components/FormulaireEnLigne';

/** Page d’une activité : informations, PDF à télécharger et formulaire en ligne. */
export function PageActivite({ a, enDirect = false }: { a: Activite; enDirect?: boolean }) {
  const f = FORMULAIRES[a.genre];
  const retour = a.sorte === 'inscription' ? { href: '/actualites#agenda', texte: 'Tout l’agenda' } : { href: '/recherche/appels-a-contributions', texte: 'Tous les appels' };
  const titreCourt = a.titre.includes(' · ') ? a.titre.split(' · ').slice(1).join(' · ') : a.titre;
  const surTitre = a.titre.includes(' · ') ? a.titre.split(' · ')[0] : a.type;
  return (
    <>
      <header className="relative overflow-hidden border-b border-ink/10 bg-[#1a1512] text-paper">
        <img loading="lazy" decoding="async" alt="" aria-hidden="true" src="/medias/site/jogoo/fonds-eboussi/portrait-dessine-orange.jpg" className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto object-cover opacity-30 [mask-image:linear-gradient(to_left,black_30%,transparent)] lg:block" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <p className="font-brand text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
            {a.sorte === 'inscription' ? 'Agenda · inscription' : `${a.type}`}
          </p>
          <p className="mt-3 font-serif text-lg italic text-paper/75">{surTitre}</p>
          <h1 className="display-title mt-2 max-w-3xl text-3xl leading-[1.02] text-paper sm:text-5xl">{titreCourt}</h1>
          <dl className="mt-7 grid max-w-3xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            {a.quand && (
              <div>
                <dt className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.18em] text-paper/50">Quand</dt>
                <dd className="mt-0.5 text-paper/90">{a.quand}</dd>
              </div>
            )}
            {a.lieu && (
              <div>
                <dt className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.18em] text-paper/50">Où</dt>
                <dd className="mt-0.5 text-paper/90">{a.lieu}</dd>
              </div>
            )}
            {a.limite && (
              <div className="sm:col-span-2">
                <dt className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.18em] text-paper/50">Date limite</dt>
                <dd className="mt-0.5 font-semibold text-gold">{a.limite}</dd>
              </div>
            )}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            {a.fichier && (
              <a href={a.fichier} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-paper px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.1em] text-ink hover:bg-gold">
                Télécharger le PDF <span aria-hidden="true">↓</span>
              </a>
            )}
            {a.ouvert && (
              <a href="#formulaire" className="bg-terra px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-white hover:text-ink">
                {f.bouton}
              </a>
            )}
            {enDirect && (
              <a href="/direct" className="inline-flex items-center gap-2 border border-paper/40 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.1em] text-paper hover:bg-paper hover:text-ink">
                <span className="h-2 w-2 rounded-full bg-[#e53935]" /> Suivre en direct
              </a>
            )}
          </div>
        </div>
      </header>
      <div id="formulaire" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-5 py-14 lg:grid-cols-[1fr_17rem]">
        <section>
          <p className="kicker">Formulaire en ligne</p>
          <h2 className="display-title mt-1 text-3xl text-terra">{f.titre}</h2>
          {a.ouvert ? (
            <>
              <p className="mb-8 mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{f.intro}</p>
              <FormulaireEnLigne sorte={a.sorte} slug={a.slug} champs={a.champs} bouton={f.bouton} contact="fondseboussi@gmail.com" />
            </>
          ) : (
            <p className="mt-4 border-l-4 border-ink/20 bg-cream/60 px-5 py-4 text-ink-soft">Cet appel est clos : le formulaire n’est plus disponible.</p>
          )}
        </section>
        <aside className="space-y-6 text-sm text-ink-soft lg:pt-16">
          <div className="border-t-2 border-terra pt-4">
            <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink">Ce qui se passe ensuite</p>
            <p className="mt-2 leading-relaxed">
              Votre envoi est transmis à <span className="text-ink">philoafricaine@gmail.com</span> et <span className="text-ink">fondseboussi@gmail.com</span>. Vous recevez aussitôt une copie par e-mail, avec le document à télécharger.
            </p>
          </div>
          <div className="border-t border-ink/15 pt-4">
            <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink">Organisé par</p>
            <p className="mt-2">{a.organisateur}</p>
          </div>
          <a href={retour.href} className="inline-block font-semibold text-terra-deep underline underline-offset-2 hover:text-terra">
            ← {retour.texte}
          </a>
        </aside>
      </div>
    </>
  );
}

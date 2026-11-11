'use client';

import { useState } from 'react';

export type MomentHistoire = { slug: string; annee: string; date: string; titre: string; lieu: string; image: string | null; enSalle: boolean };

/** Frise qui défile doucement sur la page d'accueil : pause au survol, au focus clavier et sur le bouton ;
    immobile (et défilable à la main) si l'utilisateur a demandé moins d'animations. */
export function DefileHistoire({ moments }: { moments: MomentHistoire[] }) {
  const [pause, setPause] = useState(false);
  const duree = Math.max(40, moments.length * 5);
  const carte = (m: MomentHistoire, cle: string, cache = false) => (
    <a
      key={cle}
      href={`/notre-histoire#${m.slug}`}
      tabIndex={cache ? -1 : undefined}
      aria-hidden={cache || undefined}
      className="group flex w-56 shrink-0 flex-col overflow-hidden border border-ink/10 bg-white transition-shadow hover:shadow-lg"
    >
      <span className="relative block aspect-[4/5] overflow-hidden bg-ink">
        {m.image ? (
          <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <span className="flex h-full items-center justify-center bg-terra">
            <img loading="lazy" decoding="async" src="/medias/site/jogoo/coq-penseur-gauche.png" alt="" className="w-24 opacity-90" />
          </span>
        )}
        <span className="absolute left-0 top-0 bg-ink/85 px-2.5 py-1 font-brand text-sm font-bold text-gold">{m.annee}</span>
        {m.enSalle && <span className="absolute bottom-0 right-0 bg-terra px-2 py-0.5 font-brand text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white">En présentiel</span>}
      </span>
      <span className="flex flex-1 flex-col p-3.5">
        <span className="font-brand text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink/50">{m.date}</span>
        <span className="mt-1 line-clamp-3 text-left font-brand text-sm font-bold leading-snug text-ink group-hover:text-terra-deep">{m.titre}</span>
        {m.lieu && <span className="mt-auto line-clamp-1 pt-2 text-xs text-ink/55">{m.lieu}</span>}
      </span>
    </a>
  );

  return (
    <div className="relative">
      <div
        className="defile-histoire overflow-hidden motion-reduce:overflow-x-auto"
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
        onFocus={() => setPause(true)}
        onBlur={() => setPause(false)}
      >
        <div
          className="flex w-max gap-4 py-2 motion-safe:animate-[defile-histoire_var(--duree)_linear_infinite]"
          style={{ ['--duree' as string]: `${duree}s`, animationPlayState: pause ? 'paused' : 'running' }}
        >
          {moments.map((m) => carte(m, m.slug))}
          <span className="contents motion-reduce:hidden">{moments.map((m) => carte(m, `${m.slug}-bis`, true))}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPause((p) => !p)}
        className="mt-4 font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink/55 hover:text-terra motion-reduce:hidden"
        aria-pressed={pause}
      >
        {pause ? '▶︎ Reprendre le défilement' : '❚❚ Mettre en pause'}
      </button>
      <style>{`@keyframes defile-histoire { from { transform: translateX(0) } to { transform: translateX(calc(-50% - 0.5rem)) } }
        .defile-histoire { mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent); }`}</style>
    </div>
  );
}

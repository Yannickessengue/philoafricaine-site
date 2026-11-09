'use client';

import { usePathname } from 'next/navigation';
import { Assistant } from './Assistant';

/** Encadré de dialogue avec JOGOO AI, en tête du pied de page (sauf dans l’espace JOGOO AI, qui a le sien). */
export function PiedAI() {
  const chemin = usePathname() ?? '';
  if (chemin.startsWith('/sous-sites/jogoo-ai')) return null;
  return (
    <section aria-labelledby="pied-ai-titre" className="relative isolate overflow-hidden bg-[#070d16] text-[#e9e2d0]">
      <div className="ai-motif absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_30%,rgba(106,13,13,0.45),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(217,154,14,0.14),transparent_55%)]" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 lg:grid-cols-[0.8fr_1.6fr] lg:gap-12">
        <div className="flex items-center gap-5 lg:flex-col lg:items-start">
          <span className="relative block h-20 w-20 shrink-0 sm:h-24 sm:w-24">
            <span className="ai-pouls absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(255,201,74,0.35),transparent_70%)] blur-md" aria-hidden="true" />
            <span className="ai-tour absolute -inset-1.5 rounded-full border border-dashed border-[#d99a0e]/50" aria-hidden="true" />
            <img src="/medias/site/jogoo/disque-jogoo-ai.png" alt="" className="relative h-full w-full rounded-full shadow-[0_0_0_2px_rgba(217,154,14,0.6)]" />
          </span>
          <div>
            <p className="font-brand text-[0.64rem] font-bold uppercase tracking-[0.28em] text-[#d99a0e]">JOGOO AI</p>
            <h2 id="pied-ai-titre" className="mt-2 font-brand text-2xl font-black leading-tight text-[#f9f5ec] sm:text-3xl">
              Une question ?<br className="hidden lg:block" /> Dialoguez avec le coq.
            </h2>
            <a href="/sous-sites/jogoo-ai" className="mt-3 inline-block font-brand text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#ffc94a] hover:text-white">
              Entrer dans l’espace →
            </a>
          </div>
        </div>
        <Assistant email="philoafricaine@gmail.com" variante="sombre" lireAdresse={false} />
      </div>
    </section>
  );
}

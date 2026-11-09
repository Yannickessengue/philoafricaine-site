'use client';

import { usePathname } from 'next/navigation';
import { SOUS_SITES } from '@/lib/liste-sous-sites';


/** Sur chaque page de sous-site : un accès direct à tous les autres sous-sites du Groupe. */
export function BarreSousSites() {
  const chemin = usePathname() ?? '';
  if (!chemin.startsWith('/sous-sites/')) return null;
  return (
    <nav aria-label="Les sous-sites du Groupe JOGOO" className="bg-[#f4efe4]">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 py-2 lg:justify-between [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="hidden shrink-0 pr-1 font-brand text-[0.6rem] font-bold uppercase tracking-[0.18em] text-ink-soft xl:inline">Sous-sites</span>
        {SOUS_SITES.map(([href, nom, logo]) => {
          const actif = chemin === href || chemin.startsWith(href + '/');
          return (
            <a
              key={href}
              href={href}
              aria-current={actif ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 px-2.5 py-1.5 transition-colors ${actif ? 'bg-white shadow-[0_6px_18px_-10px_rgba(26,26,26,0.35)]' : 'hover:bg-white/70'}`}
            >
              <img src={logo} alt="" className="h-7 w-9 object-contain" />
              <span className={`whitespace-nowrap font-brand text-[0.72rem] font-bold ${actif ? 'text-terra' : 'text-ink'}`}>{nom.replace(' Communications', '')}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

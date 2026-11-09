'use client';

import { useEffect, useState } from 'react';

export type FlashCarte = { ancre: string; titre: string; auteur?: string | null; lieu?: string | null; image?: string | null; alt?: string | null };

/** « Le Groupe JOGOO en 6 flashs » : une grande vignette et quatre petites, qui tournent. */
export function CarrouselFlash({ flashs }: { flashs: FlashCarte[] }) {
  const n = flashs.length;
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause || n < 2) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => window.clearInterval(t);
  }, [pause, n]);

  if (!n) return null;
  const ordre = Array.from({ length: Math.min(5, n) }, (_, k) => (i + k) % n);
  const [grand, ...petits] = ordre;

  const vignette = (idx: number, grande: boolean) => {
    const f = flashs[idx];
    return (
      <a
        key={`${idx}-${i}`}
        href={`/flash#${f.ancre}`}
        aria-label={`Lire « ${f.titre} »`}
        className={`flash-fade group relative block aspect-[4/3] w-full overflow-hidden bg-ink text-left ${grande ? '' : 'lg:aspect-auto lg:h-full'}`}
      >
        {f.image && (
          <img
            alt={f.alt ?? ''}
            src={f.image}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover grayscale transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        <span className="absolute right-3 top-3 z-10 bg-black/60 px-2 py-0.5 font-brand text-[0.65rem] font-bold tabular-nums text-white backdrop-blur-sm">
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span className="relative z-10 flex h-full flex-col justify-end p-4">
          {!grande && f.lieu && (
            <span className="mb-2 inline-block w-fit bg-terra px-2 py-0.5 font-brand text-[0.62rem] font-bold uppercase tracking-wide text-white">{f.lieu}</span>
          )}
          <span className={`line-clamp-2 font-serif italic leading-snug text-white ${grande ? 'text-xl sm:text-2xl' : 'text-sm'}`}>{f.titre}</span>
          {grande && f.auteur && <span className="mt-1.5 text-xs text-white/70">{f.auteur}</span>}
        </span>
      </a>
    );
  };

  return (
    <div onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} onFocus={() => setPause(true)} onBlur={() => setPause(false)}>
      <div className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        {vignette(grand, true)}
        <div className="grid grid-cols-2 gap-3 lg:h-full lg:grid-rows-2">{petits.map((p) => vignette(p, false))}</div>
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {flashs.map((f, k) => (
          <button
            key={k}
            type="button"
            aria-label={`Aller au flash ${k + 1} — ${f.titre}`}
            aria-current={k === i}
            onClick={() => setI(k)}
            className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-terra' : 'w-1.5 bg-ink/20 hover:bg-ink/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

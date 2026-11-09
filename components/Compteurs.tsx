'use client';

import { useEffect, useRef, useState } from 'react';

/** Chiffres qui s’incrémentent quand ils entrent à l’écran. */
export function Compteurs({ chiffres }: { chiffres: { n: number; libelle: string; depuis?: number }[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const [t, setT] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setT(1);
    let raf = 0;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const debut = performance.now();
        const pas = (now: number) => {
          const p = Math.min(1, (now - debut) / 1600);
          setT(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(pas);
        };
        raf = requestAnimationFrame(pas);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <dl ref={ref} className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
      {chiffres.map((c) => {
        const de = c.depuis ?? 0;
        return (
          <div key={c.libelle} className="text-center">
            <dt className="font-brand text-4xl font-black tabular-nums text-gold sm:text-5xl">{Math.round(de + (c.n - de) * t)}</dt>
            <dd className="mt-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.16em] text-paper/70">{c.libelle}</dd>
          </div>
        );
      })}
    </dl>
  );
}

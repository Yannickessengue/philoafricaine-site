'use client';

import { useCallback, useEffect, useState } from 'react';

/** Vignettes cliquables ; ouvre une visionneuse plein écran (flèches, Échap). */
export function Galerie({ images, titre }: { images: string[]; titre: string }) {
  const [i, setI] = useState<number | null>(null);
  const fermer = useCallback(() => setI(null), []);
  const pas = useCallback((d: number) => setI((x) => (x === null ? x : (x + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (i === null) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight') pas(1);
      if (e.key === 'ArrowLeft') pas(-1);
    };
    document.addEventListener('keydown', touche);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', touche);
      document.body.style.overflow = '';
    };
  }, [i, fermer, pas]);

  const vignette = (src: string) => src.replace(/\.jpg$/, '-v.jpg');

  return (
    <>
      <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
        {images.map((src, k) => (
          <button key={src} type="button" onClick={() => setI(k)} className="group relative aspect-square overflow-hidden bg-ink/10" aria-label={`${titre} — photo ${k + 1}`}>
            <img src={vignette(src)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </button>
        ))}
      </div>
      {i !== null && (
        <div role="dialog" aria-modal="true" aria-label={titre} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={fermer}>
          <img loading="lazy" decoding="async" src={images[i]} alt={`${titre} — photo ${i + 1}`} className="max-h-[88vh] max-w-full object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={fermer} className="absolute right-4 top-4 font-brand text-3xl text-white/80 hover:text-white" aria-label="Fermer">×</button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); pas(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-6 font-brand text-4xl text-white/70 hover:text-white" aria-label="Photo précédente">‹</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); pas(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-6 font-brand text-4xl text-white/70 hover:text-white" aria-label="Photo suivante">›</button>
            </>
          )}
          <p className="absolute bottom-4 left-0 right-0 text-center font-brand text-xs uppercase tracking-[0.2em] text-white/60">
            {i + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}

/** Affiche cliquable (même visionneuse, une seule image). */
export function AfficheZoom({ src, titre }: { src: string; titre: string }) {
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [ouvert]);
  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className="block w-full overflow-hidden bg-ink/5 shadow-md transition-shadow hover:shadow-xl" aria-label={`Agrandir l’affiche : ${titre}`}>
        <img src={src.replace(/\.jpg$/, '-v.jpg')} alt={`Affiche : ${titre}`} loading="lazy" className="w-full" />
      </button>
      {ouvert && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setOuvert(false)}>
          <img loading="lazy" decoding="async" src={src} alt={`Affiche : ${titre}`} className="max-h-[92vh] max-w-full object-contain" />
          <button type="button" className="absolute right-4 top-4 font-brand text-3xl text-white/80" aria-label="Fermer">×</button>
        </div>
      )}
    </>
  );
}

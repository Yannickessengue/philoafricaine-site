'use client';

import { Externe } from './Consentement';
import { useEffect, useState } from 'react';

const idYoutube = (u: string) => u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)?.[1];

export type Video = { titre: string; url: string };

/** Liste de vidéos de l'original ; les vidéos YouTube s'ouvrent dans un lecteur intégré. */
export function ListeVideos({ videos }: { videos: Video[] }) {
  const [ouverte, setOuverte] = useState<Video | null>(null);
  useEffect(() => {
    if (!ouverte) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOuverte(null);
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [ouverte]);
  const id = ouverte ? idYoutube(ouverte.url) : undefined;
  return (
    <>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {videos.map((v) => (
          <li key={v.url}>
            <a
              href={v.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { if (idYoutube(v.url)) { e.preventDefault(); setOuverte(v); } }}
              className="group flex items-center gap-4 border border-ink/12 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-terra hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.3)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-terra text-white transition-colors group-hover:bg-terra-deep">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7Z" />
                </svg>
              </span>
              <span className="text-[0.95rem] leading-snug text-ink group-hover:text-terra">{v.titre}</span>
              {!idYoutube(v.url) && <span aria-hidden="true" className="ml-auto text-ink/30">↗</span>}
            </a>
          </li>
        ))}
      </ul>
      {ouverte && id && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm" onClick={() => setOuverte(null)} role="dialog" aria-modal="true" aria-label={ouverte.titre}>
          <div className="flash-fade w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 pb-3 text-paper">
              <p className="font-brand text-sm font-semibold">{ouverte.titre}</p>
              <button type="button" onClick={() => setOuverte(null)} className="inline-flex h-9 w-9 items-center justify-center border border-paper/30 hover:bg-paper hover:text-ink" aria-label="Fermer">
                ✕
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <Externe service="YouTube" lien={ouverte.url}>
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                  title={ouverte.titre}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </Externe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Grille de vignettes vidéo (accueil) : cliquer lance la vidéo dans un lecteur intégré. */
export function GrilleVideos({ videos }: { videos: (Video & { rubrique?: string | null })[] }) {
  const [ouverte, setOuverte] = useState<Video | null>(null);
  useEffect(() => {
    if (!ouverte) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOuverte(null);
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [ouverte]);
  const id = ouverte ? idYoutube(ouverte.url) : undefined;
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const vid = idYoutube(v.url);
          return (
            <a
              key={v.url}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { if (vid) { e.preventDefault(); setOuverte(v); } }}
              className="group block"
            >
              <span className="relative block aspect-video overflow-hidden bg-ink shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
                {vid && <img src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100" />}
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" aria-hidden="true" />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-terra text-white shadow-lg transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z" /></svg>
                </span>
                {v.rubrique && <span className="absolute left-3 top-3 bg-black/55 px-2 py-0.5 font-brand text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">{v.rubrique}</span>}
              </span>
              <span className="mt-3 block font-brand text-[0.95rem] font-bold leading-snug text-ink group-hover:text-terra">{v.titre}</span>
            </a>
          );
        })}
      </div>
      {ouverte && id && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm" onClick={() => setOuverte(null)} role="dialog" aria-modal="true" aria-label={ouverte.titre}>
          <div className="flash-fade w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 pb-3 text-paper">
              <p className="font-brand text-sm font-semibold">{ouverte.titre}</p>
              <button type="button" onClick={() => setOuverte(null)} className="inline-flex h-9 w-9 items-center justify-center border border-paper/30 hover:bg-paper hover:text-ink" aria-label="Fermer">✕</button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <Externe service="YouTube" lien={ouverte.url}>
                <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={ouverte.titre} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              </Externe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

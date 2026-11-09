'use client';

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
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                title={ouverte.titre}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

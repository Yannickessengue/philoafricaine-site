'use client';

import { useState } from 'react';
import { Externe } from './Consentement';

/** Lecteur de « La minute du chant du coq » : fichier MP4 du site, ou vidéo YouTube / Vimeo / WebTV après accord. */
export function VideoMinute({
  titre,
  fichier,
  integration,
  lien,
  affiche,
}: {
  titre: string;
  fichier?: string | null;
  integration?: { src: string; service: string; vignette: string | null } | null;
  lien?: string | null;
  affiche?: string | null;
}) {
  const [lecture, setLecture] = useState(false);
  const poster = affiche || integration?.vignette || undefined;
  if (fichier)
    return (
      <video className="aspect-video w-full bg-black" controls preload="metadata" poster={poster} playsInline>
        <source src={fichier} type="video/mp4" />
      </video>
    );
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink">
      {lecture && integration ? (
        <Externe service={integration.service} lien={lien ?? undefined}>
          <iframe className="absolute inset-0 h-full w-full" src={integration.src} title={titre} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        </Externe>
      ) : (
        <button
          type="button"
          onClick={() => (integration ? setLecture(true) : lien && window.open(lien, '_blank', 'noopener'))}
          className="group absolute inset-0 block"
          aria-label={`Regarder : ${titre}`}
        >
          {poster ? (
            <img loading="lazy" decoding="async" src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100" />
          ) : (
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#7a2a12,#1a1a1a_70%)]" aria-hidden="true" />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" aria-hidden="true" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-terra text-white shadow-2xl transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

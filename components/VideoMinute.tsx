'use client';

import { useEffect, useRef, useState } from 'react';
import { Externe } from './Consentement';

/**
 * Lecteur de « Les 10 minutes du chant du coq » : fichier MP4 du site, ou vidéo
 * YouTube / Vimeo / WebTV après accord. Les sous-titres sont incrustés dans
 * l'image, donc insensibles au pack de langues : plusieurs versions peuvent
 * coexister, la page sert celle qui correspond à la langue de lecture, et le
 * sélecteur reprend la lecture là où elle en était.
 */
type Code = 'fr' | 'en' | 'es' | 'pt' | 'de' | 'sw';
const LIBELLES: Record<Code, string> = { fr: 'Français', en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch', sw: 'Kiswahili' };

export function VideoMinute({
  titre,
  fichier,
  fichierFr,
  fichierEs,
  fichierPt,
  fichierDe,
  fichierSw,
  integration,
  lien,
  affiche,
}: {
  titre: string;
  fichier?: string | null;
  fichierFr?: string | null;
  fichierEs?: string | null;
  fichierPt?: string | null;
  fichierDe?: string | null;
  fichierSw?: string | null;
  integration?: { src: string; service: string; vignette: string | null } | null;
  lien?: string | null;
  affiche?: string | null;
}) {
  const [lecture, setLecture] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const reprise = useRef(0);
  const poster = affiche || integration?.vignette || undefined;

  const versions = (
    [
      ['fr', fichierFr],
      ['en', fichier],
      ['es', fichierEs],
      ['pt', fichierPt],
      ['de', fichierDe],
      ['sw', fichierSw],
    ] as Array<[Code, string | null | undefined]>
  ).filter(([, f]) => Boolean(f)) as Array<[Code, string]>;
  const defaut: Code = versions.find(([c]) => c === 'fr') ? 'fr' : (versions[0]?.[0] ?? 'en');
  const [langue, setLangue] = useState<Code>(defaut);

  // Le pack de langues traduit le texte, jamais les sous-titres incrustés : on suit
  // la langue demandée quand elle existe, l'anglais sinon.
  useEffect(() => {
    if (versions.length < 2) return;
    const cookie = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    const cible = cookie ? decodeURIComponent(cookie[1]).split('/').filter(Boolean).pop() : null;
    if (!cible || cible === 'fr') return;
    const dispo = versions.map(([c]) => c);
    setLangue(dispo.includes(cible as Code) ? (cible as Code) : dispo.includes('en') ? 'en' : dispo[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versions.length]);

  if (fichier || versions.length) {
    // Le suffixe force les navigateurs à oublier une réponse mise en cache avant la
    // mise en ligne des fichiers (un 404 gardé en cache empêchait la lecture).
    const fichierChoisi = versions.find(([c]) => c === langue)?.[1] ?? fichier!;
    const source = fichierChoisi.startsWith('/') ? `${fichierChoisi}?v=2` : fichierChoisi;
    const changer = (vers: Code) => {
      if (vers === langue) return;
      reprise.current = video.current?.currentTime ?? 0;
      setLangue(vers);
    };
    return (
      <div>
        <video
          ref={video}
          key={source}
          className="aspect-video w-full bg-black"
          controls
          preload="metadata"
          poster={poster}
          playsInline
          onLoadedMetadata={(e) => {
            if (reprise.current > 0) {
              e.currentTarget.currentTime = reprise.current;
              reprise.current = 0;
              void e.currentTarget.play().catch(() => {});
            }
          }}
        >
          <source src={source} type="video/mp4" />
        </video>
        {versions.length > 1 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-paper/45">Sous-titres</span>
            {versions.map(([code]) => (
              <button
                key={code}
                type="button"
                onClick={() => changer(code)}
                aria-pressed={langue === code}
                className={`px-3 py-1.5 font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] transition-colors ${
                  langue === code ? 'bg-paper text-ink' : 'bg-paper/10 text-paper/75 hover:bg-paper/20'
                }`}
              >
                {LIBELLES[code]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

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

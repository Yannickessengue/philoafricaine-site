'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* Visionneuse du magazine en ligne : lecture page à page (ou en double page sur grand écran),
   animation de page, plein écran, zoom, sommaire. Pendant l'embargo, seules les premières pages
   sont chargées (le serveur ne livre qu'un extrait) ; la suite est remplacée par une page « embargo ». */

type Doc = { numPages: number; getPage: (n: number) => Promise<any>; destroy: () => void };
type Entree = { page: string; rubrique: string; titre: string };

export function Visionneuse({
  url,
  titre,
  pagesTotal,
  apercu,
  finEmbargo,
  sommaire = [],
  commander,
  telecharger,
}: {
  url: string;
  titre: string;
  pagesTotal: number;
  apercu: boolean;
  finEmbargo: string;
  sommaire?: Entree[];
  commander: string;
  telecharger?: string;
}) {
  const boite = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [erreur, setErreur] = useState(false);
  const [page, setPage] = useState(1); // première page affichée
  const [double, setDouble] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [sens, setSens] = useState<1 | -1>(1);
  const [plein, setPlein] = useState(false);
  const [menu, setMenu] = useState(false);
  const [rendu, setRendu] = useState(0);
  const lisibles = doc?.numPages ?? 0;
  // Pendant l'embargo, une page supplémentaire « verrou » suit les pages d'aperçu
  const dernier = apercu ? lisibles + 1 : lisibles;

  /* Chargement de pdf.js et du document */
  useEffect(() => {
    let annule = false;
    let charge: Doc | null = null;
    (async () => {
      try {
        const pdfjs: any = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
        const tache = pdfjs.getDocument({ url, disableAutoFetch: true, rangeChunkSize: 524288 });
        charge = await tache.promise;
        if (!annule) setDoc(charge);
      } catch (e) {
        console.error(e);
        if (!annule) setErreur(true);
      }
    })();
    return () => {
      annule = true;
      charge?.destroy();
    };
  }, [url]);

  /* Double page sur grand écran */
  useEffect(() => {
    const maj = () => setDouble(window.innerWidth >= 960);
    maj();
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, []);

  /* Pages visibles : couverture seule, puis paires (2-3, 4-5…) en double page */
  const visibles = useCallback(
    (p: number) => {
      if (!double || p === 1) return [p];
      const gauche = p % 2 === 0 ? p : p - 1;
      return [gauche, gauche + 1].filter((x) => x <= dernier);
    },
    [double, dernier],
  );
  const affichees = visibles(page);
  const pas = (dir: 1 | -1) => {
    setSens(dir);
    setPage((p) => {
      const v = visibles(p);
      if (dir === 1) return Math.min(dernier, v[v.length - 1] + 1);
      const avant = v[0] - 1;
      return Math.max(1, avant < 1 ? 1 : visibles(avant)[0]);
    });
  };
  const aller = (n: number) => {
    const cible = Math.min(Math.max(1, n), dernier);
    setSens(cible >= page ? 1 : -1);
    setPage(visibles(cible)[0]);
    setMenu(false);
  };

  /* Rendu des pages dans des canevas */
  useEffect(() => {
    if (!doc || !scene.current) return;
    let annule = false;
    const conteneur = scene.current;
    (async () => {
      const toiles = Array.from(conteneur.querySelectorAll<HTMLCanvasElement>('canvas[data-page]'));
      const hauteurDispo = conteneur.clientHeight;
      const largeurDispo = conteneur.clientWidth / Math.max(1, affichees.length);
      for (const toile of toiles) {
        const n = Number(toile.dataset.page);
        if (n > lisibles) continue;
        const p = await doc.getPage(n);
        if (annule) return;
        const v1 = p.getViewport({ scale: 1 });
        const echelle = Math.min(hauteurDispo / v1.height, largeurDispo / v1.width) * zoom;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const v = p.getViewport({ scale: echelle * dpr });
        toile.width = Math.floor(v.width);
        toile.height = Math.floor(v.height);
        toile.style.width = `${Math.floor(v.width / dpr)}px`;
        toile.style.height = `${Math.floor(v.height / dpr)}px`;
        await p.render({ canvasContext: toile.getContext('2d')!, viewport: v }).promise.catch(() => {});
      }
    })();
    return () => {
      annule = true;
    };
  }, [doc, page, double, zoom, plein, rendu, lisibles, affichees.length]);

  /* Clavier, plein écran, redimensionnement */
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') pas(1);
      if (e.key === 'ArrowLeft') pas(-1);
      if (e.key === 'Escape') setMenu(false);
    };
    const ecran = () => {
      setPlein(Boolean(document.fullscreenElement));
      setRendu((r) => r + 1);
    };
    let t: number | undefined;
    const taille = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setRendu((r) => r + 1), 150);
    };
    window.addEventListener('keydown', touche);
    document.addEventListener('fullscreenchange', ecran);
    window.addEventListener('resize', taille);
    return () => {
      window.removeEventListener('keydown', touche);
      document.removeEventListener('fullscreenchange', ecran);
      window.removeEventListener('resize', taille);
    };
  });

  /* Balayage sur écran tactile */
  const depart = useRef<number | null>(null);

  const pleinEcran = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else boite.current?.requestFullscreen?.();
  };

  const libellePages = affichees.map((n) => (n > lisibles ? '' : n)).filter(Boolean).join('–');

  return (
    <div ref={boite} className={`flex flex-col bg-[#1a1714] text-[#f7f1e6] ${plein ? 'h-screen' : ''}`}>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
        <p className="mr-auto min-w-0 truncate font-brand text-xs font-semibold uppercase tracking-[0.12em] text-[#e5a220]">{titre}</p>
        <span className="font-brand text-xs tabular-nums text-[#f7f1e6]/70">
          {doc ? (
            <>
              Page {libellePages || '—'} <span className="text-[#f7f1e6]/40">/ {pagesTotal}</span>
            </>
          ) : (
            'Chargement…'
          )}
        </span>
        {sommaire.length > 0 && (
          <div className="relative">
            <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} className="h-8 border border-white/20 px-3 text-xs font-semibold uppercase tracking-wide hover:border-[#e5a220] hover:text-[#e5a220]">
              Sommaire
            </button>
            {menu && (
              <ul className="flash-fade absolute right-0 top-10 z-20 w-72 border border-white/15 bg-[#1a1714] py-1 shadow-2xl">
                <li>
                  <button type="button" onClick={() => aller(1)} className="w-full px-4 py-2 text-left text-sm hover:bg-white/5">
                    Couverture
                  </button>
                </li>
                {sommaire.map((s) => {
                  const n = Number(s.page);
                  const ferme = apercu && n > lisibles;
                  return (
                    <li key={s.page + s.titre}>
                      <button
                        type="button"
                        onClick={() => aller(ferme ? lisibles + 1 : n)}
                        className="flex w-full items-baseline gap-3 px-4 py-2 text-left text-sm hover:bg-white/5"
                      >
                        <span className="w-8 shrink-0 font-brand text-xs tabular-nums text-[#e5a220]">{s.page}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-brand text-[0.65rem] font-bold uppercase tracking-wide text-[#f7f1e6]/50">{s.rubrique}</span>
                          <span className="block leading-snug">{s.titre}</span>
                        </span>
                        {ferme && (
                          <span className="shrink-0 text-xs text-[#f7f1e6]/40" title="Sous embargo">
                            🔒
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
        <button type="button" onClick={() => setZoom((z) => (z === 1 ? 1.6 : 1))} aria-pressed={zoom > 1} className="h-8 w-8 border border-white/20 text-sm hover:border-[#e5a220] hover:text-[#e5a220]" aria-label={zoom > 1 ? 'Dézoomer' : 'Zoomer'}>
          {zoom > 1 ? '−' : '+'}
        </button>
        <button type="button" onClick={pleinEcran} className="h-8 w-8 border border-white/20 text-sm hover:border-[#e5a220] hover:text-[#e5a220]" aria-label="Plein écran">
          ⛶
        </button>
        {telecharger && (
          <a href={telecharger} download className="inline-flex h-8 items-center border border-white/20 px-3 text-xs font-semibold uppercase tracking-wide hover:border-[#e5a220] hover:text-[#e5a220]">
            PDF
          </a>
        )}
      </div>

      {/* Scène */}
      <div className="relative flex-1">
        <div
          ref={scene}
          className={`relative mx-auto flex items-center justify-center gap-0 ${plein ? 'h-[calc(100vh-7rem)]' : 'h-[68vh] min-h-[420px] sm:h-[78vh]'} ${zoom > 1 ? 'overflow-auto' : 'overflow-hidden'} px-12 py-5 sm:px-16`}
          onTouchStart={(e) => (depart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (depart.current === null || zoom > 1) return;
            const d = e.changedTouches[0].clientX - depart.current;
            if (Math.abs(d) > 50) pas(d < 0 ? 1 : -1);
            depart.current = null;
          }}
        >
          {erreur && <p className="max-w-sm text-center text-sm text-[#f7f1e6]/70">La visionneuse n’a pas pu ouvrir ce numéro. Rechargez la page ou réessayez plus tard.</p>}
          {!erreur && !doc && (
            <div className="flex flex-col items-center gap-3 text-sm text-[#f7f1e6]/60">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5a220]/30 border-t-[#e5a220]" aria-hidden="true" />
              Ouverture du magazine…
            </div>
          )}
          {doc && (
            <div key={`${page}-${double}`} className={`flex items-center justify-center ${sens === 1 ? 'animate-[tourne-avant_.45s_ease]' : 'animate-[tourne-arriere_.45s_ease]'}`}>
              {affichees.map((n, i) =>
                n > lisibles ? (
                  <div
                    key={n}
                    className="flex aspect-[595/780] h-full max-h-full flex-col items-center justify-center gap-4 bg-[#f7f1e6] p-8 text-center text-[#1a1714] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
                    style={{ height: (scene.current?.clientHeight ?? 600) - 40 }}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c8461f] text-2xl text-white" aria-hidden="true">
                      🔒
                    </span>
                    <p className="font-brand text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#c8461f]">Sous embargo</p>
                    <p className="max-w-[18rem] font-serif text-xl font-bold leading-snug">La suite de ce numéro sera en accès libre le {finEmbargo}.</p>
                    <p className="max-w-[18rem] text-sm leading-relaxed text-[#1a1714]/70">
                      D’ici là, le numéro complet ({pagesTotal} pages) est disponible en version papier ou numérique.
                    </p>
                    <a href={commander} className="mt-2 inline-flex items-center gap-2 bg-[#c8461f] px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1a1714]">
                      Commander le numéro →
                    </a>
                  </div>
                ) : (
                  <canvas
                    key={n}
                    data-page={n}
                    className={`block bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] ${affichees.length === 2 ? (i === 0 ? 'shadow-[inset_-18px_0_24px_-18px_rgba(0,0,0,0.35)]' : '') : ''}`}
                    aria-label={`Page ${n}`}
                  />
                ),
              )}
            </div>
          )}
        </div>
        {/* Flèches */}
        <button
          type="button"
          onClick={() => pas(-1)}
          disabled={page <= 1}
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl backdrop-blur transition hover:bg-[#c8461f] disabled:opacity-20 sm:left-4"
          aria-label="Page précédente"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => pas(1)}
          disabled={affichees[affichees.length - 1] >= dernier}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl backdrop-blur transition hover:bg-[#c8461f] disabled:opacity-20 sm:right-4"
          aria-label="Page suivante"
        >
          ›
        </button>
      </div>

      {/* Réglette de progression */}
      {doc && (
        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-2">
          <input
            type="range"
            min={1}
            max={dernier}
            value={affichees[0]}
            onChange={(e) => aller(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-[#e5a220]"
            aria-label="Aller à la page"
          />
          {apercu && (
            <span className="shrink-0 text-[0.7rem] text-[#f7f1e6]/55">
              Aperçu : {lisibles} pages sur {pagesTotal}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

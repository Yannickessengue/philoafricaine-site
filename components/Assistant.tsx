'use client';

import { useEffect, useRef, useState } from 'react';

type Source = { n: number; titre: string; auteur: string; type: string; source: string; annee: string; url: string; acces: string; extrait: string };
type Tour = { question: string; reponse: string | null; sources: Source[]; mode?: string; erreur?: string; enCours?: boolean };
export type Variante = 'clair' | 'sombre' | 'compact';

export const EXEMPLES = [
  'Qu’entend Eboussi Boulaga par reprise de soi ?',
  'Quels débats ont entouré l’ethnophilosophie ?',
  'Comment Marcien Towa juge-t-il le mythe ?',
  'Que dit le corpus sur le Muntu ?',
];

const THEMES = {
  clair: {
    boite: 'bg-white shadow-[0_24px_60px_-30px_rgba(13,27,42,0.45)]',
    zone: 'max-h-[70vh] min-h-[16rem] px-5 py-6 sm:px-8',
    texte: 'text-[#333]',
    titre: 'text-[#0d1b2a]',
    bulleQ: 'bg-[#0d1b2a] text-[#f9f5ec]',
    source: 'bg-[#f9f5ec]',
    sourceTitre: 'text-[#0d1b2a] group-hover:text-[#6a0d0d]',
    puce: 'bg-[#f9f5ec] text-[#333] hover:bg-[#6a0d0d] hover:text-white',
    pied: 'bg-[#0d1b2a]',
    mute: 'text-[#333]/60',
    lien: 'text-[#6a0d0d]',
  },
  compact: {
    boite: 'bg-white',
    zone: 'h-full px-4 py-4',
    texte: 'text-[#333] text-[0.92rem]',
    titre: 'text-[#0d1b2a]',
    bulleQ: 'bg-[#0d1b2a] text-[#f9f5ec]',
    source: 'bg-[#f9f5ec]',
    sourceTitre: 'text-[#0d1b2a] group-hover:text-[#6a0d0d]',
    puce: 'bg-[#f9f5ec] text-[#333] hover:bg-[#6a0d0d] hover:text-white',
    pied: 'bg-[#0d1b2a]',
    mute: 'text-[#333]/60',
    lien: 'text-[#6a0d0d]',
  },
  sombre: {
    boite: 'bg-[#0b1626]/70 ring-1 ring-[#d99a0e]/25 backdrop-blur-xl shadow-[0_0_80px_-20px_rgba(217,154,14,0.35)]',
    zone: 'max-h-[62vh] min-h-[6rem] px-5 py-6 sm:px-8',
    texte: 'text-[#e9e2d0]',
    titre: 'text-[#f9f5ec]',
    bulleQ: 'bg-[#6a0d0d] text-[#f9f5ec]',
    source: 'bg-white/[0.06] ring-1 ring-white/10',
    sourceTitre: 'text-[#f9f5ec] group-hover:text-[#ffc94a]',
    puce: 'bg-white/[0.06] text-[#e9e2d0] ring-1 ring-[#d99a0e]/30 hover:bg-[#d99a0e] hover:text-[#0d1b2a]',
    pied: 'bg-black/30',
    mute: 'text-[#e9e2d0]/55',
    lien: 'text-[#ffc94a]',
  },
} as const;

/** Met en forme la réponse : paragraphes, listes, gras, et renvois [n] cliquables vers les sources. */
function Reponse({ texte, ancre, sombre }: { texte: string; ancre: string; sombre: boolean }) {
  const blocs = texte.split(/\n{2,}/);
  const enLigne = (t: string, k: string) =>
    t.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((m, i) => {
      if (/^\*\*[^*]+\*\*$/.test(m)) return <strong key={k + i}>{m.slice(2, -2)}</strong>;
      const n = m.match(/^\[(\d+)\]$/)?.[1];
      if (n)
        return (
          <a
            key={k + i}
            href={`#${ancre}-${n}`}
            className={`mx-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-sm px-1 align-text-top font-brand text-[0.62rem] font-bold no-underline ${sombre ? 'bg-[#d99a0e]/20 text-[#ffc94a] hover:bg-[#d99a0e] hover:text-[#0d1b2a]' : 'bg-[#6a0d0d]/10 text-[#6a0d0d] hover:bg-[#6a0d0d] hover:text-white'}`}
          >
            {n}
          </a>
        );
      return m;
    });
  return (
    <div className="space-y-3 leading-relaxed">
      {blocs.map((b, i) => {
        const lignes = b.split('\n');
        if (lignes.every((l) => /^\s*([-•*]|\d+[.)])\s+/.test(l)))
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {lignes.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d99a0e]" aria-hidden="true" />
                  <span>{enLigne(l.replace(/^\s*([-•*]|\d+[.)])\s+/, ''), `${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        if (/^#{1,4}\s/.test(b)) return <p key={i} className="font-brand text-sm font-bold uppercase tracking-wide text-[#d99a0e]">{b.replace(/^#+\s*/, '')}</p>;
        return <p key={i}>{enLigne(b, String(i))}</p>;
      })}
    </div>
  );
}

export function Assistant({
  email,
  initiale = '',
  variante = 'clair',
  accueil = true,
  lireAdresse = true,
}: {
  email: string;
  initiale?: string;
  variante?: Variante;
  accueil?: boolean;
  lireAdresse?: boolean;
}) {
  const t = THEMES[variante];
  const sombre = variante === 'sombre';
  const compact = variante === 'compact';
  const [q, setQ] = useState(initiale);
  const [tours, setTours] = useState<Tour[]>([]);
  const zone = useRef<HTMLDivElement>(null);
  const occupe = tours.some((x) => x.enCours);

  const poser = async (question: string) => {
    const texte = question.trim();
    if (texte.length < 3 || occupe) return;
    const historique = tours.filter((x) => x.reponse).flatMap((x) => [
      { role: 'user', content: x.question },
      { role: 'assistant', content: x.reponse! },
    ]);
    setTours((ts) => [...ts, { question: texte, reponse: null, sources: [], enCours: true }]);
    setQ('');
    try {
      const r = await fetch('/api/jogoo-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: texte, historique }) });
      const j = await r.json();
      setTours((ts) => ts.map((x, i) => (i === ts.length - 1 ? { question: texte, reponse: j.reponse ?? null, sources: j.sources ?? [], mode: j.mode, erreur: j.erreur } : x)));
    } catch {
      setTours((ts) => ts.map((x, i) => (i === ts.length - 1 ? { question: texte, reponse: null, sources: [], erreur: 'La connexion a échoué. Réessayez dans un instant.' } : x)));
    }
  };

  useEffect(() => {
    const depuisAdresse = compact || !lireAdresse ? null : new URLSearchParams(window.location.search).get('q')?.slice(0, 500);
    const premiere = initiale || depuisAdresse;
    if (premiere) poser(premiere);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const z = zone.current;
    if (z) z.scrollTo({ top: z.scrollHeight, behavior: 'smooth' });
  }, [tours]);

  const vide = tours.length === 0;

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : ''} ${t.boite}`}>
      <div ref={zone} className={`flex-1 overflow-y-auto ${t.zone} ${vide && sombre ? 'hidden' : ''}`}>
        {vide && accueil && !sombre && (
          <div className="flex flex-col items-center py-4 text-center">
            <img src="/medias/site/jogoo/picto-jogoo-ai.png" alt="" className={compact ? 'h-16 w-auto' : 'h-24 w-auto'} />
            <p className={`mt-3 font-serif ${compact ? 'text-base' : 'text-xl'} ${t.titre}`}>Une question sur la philosophie africaine ?</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {EXEMPLES.slice(0, compact ? 3 : 4).map((e) => (
                <button key={e} type="button" onClick={() => poser(e)} className={`px-3 py-2 text-left text-[0.82rem] transition-colors ${t.puce}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={`space-y-7 ${t.texte}`}>
          {tours.map((x, i) => (
            <div key={i} className="flash-fade">
              <div className="flex justify-end">
                <p className={`max-w-[85%] px-4 py-2.5 leading-relaxed ${t.bulleQ}`}>{x.question}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <img src="/medias/site/jogoo/picto-jogoo-ai.png" alt="" className={`mt-1 h-9 w-9 shrink-0 object-contain ${sombre ? 'drop-shadow-[0_0_10px_rgba(255,201,74,0.6)]' : ''}`} />
                <div className="min-w-0 flex-1">
                  {x.enCours ? (
                    <p className={`flex items-center gap-2 text-sm ${t.mute}`}>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d99a0e]/30 border-t-[#d99a0e]" aria-hidden="true" />
                      JOGOO AI recherche les documents pertinents…
                    </p>
                  ) : (
                    <>
                      {x.erreur && <p className={`mb-3 text-sm ${t.lien}`}>{x.erreur}</p>}
                      {x.reponse ? (
                        <Reponse texte={x.reponse} ancre={`src-${i}`} sombre={sombre} />
                      ) : x.mode === 'bibliotheque' ? (
                        <p className="leading-relaxed">
                          {x.sources.length
                            ? 'Voici les documents du corpus qui répondent le mieux à votre question :'
                            : 'Je ne dispose pas, dans le corpus consultable, de sources suffisantes pour répondre avec précision. Essayez une autre formulation ou consultez la bibliothèque.'}
                        </p>
                      ) : null}
                      {x.sources.length > 0 && (
                        <ol className="mt-4 space-y-2">
                          {x.sources.slice(0, compact ? 4 : 6).map((s) => (
                            <li key={s.n} id={`src-${i}-${s.n}`} className={`scroll-mt-24 px-3.5 py-2.5 ${t.source}`}>
                              <a href={s.url || undefined} className="group block">
                                <span className="flex items-baseline gap-2">
                                  <span className={`font-brand text-[0.68rem] font-bold ${t.lien}`}>[{s.n}]</span>
                                  <span className={`font-serif text-[0.95rem] font-bold leading-snug ${t.sourceTitre}`}>{s.titre}</span>
                                </span>
                                <span className={`mt-0.5 block text-xs ${t.mute}`}>
                                  {[s.auteur, s.type, s.annee].filter(Boolean).join(' · ')}
                                  {s.acces === 'Résumé seul (embargo)' && ' · résumé seul'}
                                  {s.acces === 'Notice seule (bibliothèque du Groupe)' && ' · notice (ouvrage de la bibliothèque du Groupe)'}
                                </span>
                                {!compact && <span className={`mt-1.5 line-clamp-2 text-[0.85rem] leading-relaxed ${t.mute}`}>{s.extrait}</span>}
                              </a>
                            </li>
                          ))}
                        </ol>
                      )}
                      {(x.reponse || x.sources.length > 0) && (
                        <p className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] ${t.mute}`}>
                          <span>Aide à la recherche : vérifiez toujours les textes originaux.</span>
                          <a
                            className={`font-semibold underline underline-offset-2 ${t.lien}`}
                            href={`mailto:${email}?subject=${encodeURIComponent('JOGOO AI — signalement')}&body=${encodeURIComponent(`Question : ${x.question}\n\nRéponse ou référence incorrecte :\n\n`)}`}
                          >
                            Signaler une erreur
                          </a>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          poser(q);
        }}
        className={`flex items-end gap-2 p-2.5 sm:p-3 ${t.pied}`}
      >
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              poser(q);
            }
          }}
          rows={1}
          maxLength={1200}
          placeholder="Posez votre question sur la philosophie africaine…"
          aria-label="Votre question"
          className={`max-h-40 min-h-[2.75rem] flex-1 resize-none px-4 py-2.5 text-[0.95rem] outline-none ${sombre ? 'bg-white/[0.07] text-[#f9f5ec] placeholder:text-[#e9e2d0]/45 focus:bg-white/[0.11]' : 'bg-white/95 text-[#0d1b2a] placeholder:text-[#333]/45 focus:bg-white'}`}
        />
        <button
          type="submit"
          disabled={occupe || q.trim().length < 3}
          aria-label="Envoyer la question"
          className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#d99a0e] text-[#0d1b2a] transition-colors hover:bg-[#ffc94a] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={compact ? '' : 'sm:hidden'}>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          {!compact && <span className="hidden font-brand text-xs font-bold uppercase tracking-[0.12em] sm:inline">Interroger</span>}
        </button>
      </form>
      {sombre && vide && accueil && (
        <div className="flex flex-wrap justify-center gap-2 px-4 pb-4 pt-1">
          {EXEMPLES.map((e) => (
            <button key={e} type="button" onClick={() => poser(e)} className={`px-3 py-1.5 text-[0.8rem] transition-colors ${t.puce}`}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

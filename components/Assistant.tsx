'use client';

import { useEffect, useRef, useState } from 'react';

type Source = { n: number; titre: string; auteur: string; type: string; source: string; annee: string; url: string; acces: string; extrait: string };
type Tour = { question: string; reponse: string | null; sources: Source[]; mode?: string; erreur?: string; enCours?: boolean };

const EXEMPLES = [
  'Qu’entend Eboussi Boulaga par reprise de soi ?',
  'Quels débats ont entouré l’ethnophilosophie ?',
  'Comment Marcien Towa juge-t-il le mythe ?',
  'Quelles ressources consulter pour travailler sur le Muntu ?',
];

/** Met en forme la réponse : paragraphes, listes, gras, et renvois [n] cliquables vers les sources. */
function Reponse({ texte, ancre }: { texte: string; ancre: string }) {
  const blocs = texte.split(/\n{2,}/);
  const enLigne = (t: string, k: string) =>
    t.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((m, i) => {
      if (/^\*\*[^*]+\*\*$/.test(m)) return <strong key={k + i}>{m.slice(2, -2)}</strong>;
      const n = m.match(/^\[(\d+)\]$/)?.[1];
      if (n)
        return (
          <a key={k + i} href={`#${ancre}-${n}`} className="mx-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-sm bg-[#6a0d0d]/10 px-1 align-text-top font-brand text-[0.62rem] font-bold text-[#6a0d0d] no-underline hover:bg-[#6a0d0d] hover:text-white">
            {n}
          </a>
        );
      return m;
    });
  return (
    <div className="space-y-3 text-[0.98rem] leading-relaxed text-[#333]">
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
        if (/^#{1,4}\s/.test(b)) return <p key={i} className="font-brand text-sm font-bold uppercase tracking-wide text-[#6a0d0d]">{b.replace(/^#+\s*/, '')}</p>;
        return <p key={i}>{enLigne(b, String(i))}</p>;
      })}
    </div>
  );
}

export function Assistant({ email, initiale = '' }: { email: string; initiale?: string }) {
  const [q, setQ] = useState(initiale);
  const [tours, setTours] = useState<Tour[]>([]);
  const fin = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLTextAreaElement>(null);
  const occupe = tours.some((t) => t.enCours);

  const poser = async (question: string) => {
    const texte = question.trim();
    if (texte.length < 3 || occupe) return;
    const historique = tours.filter((t) => t.reponse).flatMap((t) => [
      { role: 'user', content: t.question },
      { role: 'assistant', content: t.reponse! },
    ]);
    setTours((ts) => [...ts, { question: texte, reponse: null, sources: [], enCours: true }]);
    setQ('');
    try {
      const r = await fetch('/api/jogoo-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: texte, historique }) });
      const j = await r.json();
      setTours((ts) => ts.map((t, i) => (i === ts.length - 1 ? { question: texte, reponse: j.reponse ?? null, sources: j.sources ?? [], mode: j.mode, erreur: j.erreur } : t)));
    } catch {
      setTours((ts) => ts.map((t, i) => (i === ts.length - 1 ? { question: texte, reponse: null, sources: [], erreur: 'La connexion a échoué. Réessayez dans un instant.' } : t)));
    }
  };

  useEffect(() => {
    const depuisAdresse = new URLSearchParams(window.location.search).get('q')?.slice(0, 500);
    const premiere = initiale || depuisAdresse;
    if (premiere) poser(premiere);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const zone = fin.current?.parentElement;
    if (zone) zone.scrollTo({ top: zone.scrollHeight, behavior: 'smooth' });
  }, [tours]);

  return (
    <div className="bg-white shadow-[0_24px_60px_-30px_rgba(13,27,42,0.45)]">
      <div className="max-h-[70vh] min-h-[16rem] overflow-y-auto px-5 py-6 sm:px-8">
        {tours.length === 0 && (
          <div className="flex flex-col items-center py-6 text-center">
            <img src="/medias/site/jogoo/picto-jogoo-ai.png" alt="" className="h-24 w-auto" />
            <p className="mt-4 font-serif text-xl text-[#0d1b2a]">Quelle question souhaitez-vous explorer en philosophie africaine ?</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {EXEMPLES.map((e) => (
                <button key={e} type="button" onClick={() => poser(e)} className="bg-[#f9f5ec] px-3.5 py-2 text-left text-sm text-[#333] transition-colors hover:bg-[#6a0d0d] hover:text-white">
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-8">
          {tours.map((t, i) => (
            <div key={i} className="flash-fade">
              <div className="flex justify-end">
                <p className="max-w-[85%] bg-[#0d1b2a] px-4 py-2.5 text-[0.95rem] leading-relaxed text-[#f9f5ec]">{t.question}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <img src="/medias/site/jogoo/picto-jogoo-ai.png" alt="" className="mt-1 h-9 w-9 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  {t.enCours ? (
                    <p className="flex items-center gap-2 text-sm text-[#333]/70">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d99a0e]/30 border-t-[#d99a0e]" aria-hidden="true" />
                      JOGOO AI recherche les documents pertinents…
                    </p>
                  ) : (
                    <>
                      {t.erreur && <p className="mb-3 text-sm text-[#6a0d0d]">{t.erreur}</p>}
                      {t.reponse ? (
                        <Reponse texte={t.reponse} ancre={`src-${i}`} />
                      ) : t.mode === 'bibliotheque' ? (
                        <p className="text-[0.95rem] leading-relaxed text-[#333]">
                          {t.sources.length
                            ? 'L’assistant conversationnel est en cours d’activation. Voici déjà les documents du corpus qui répondent le mieux à votre question :'
                            : 'Je ne dispose pas, dans le corpus consultable, de sources suffisantes pour répondre avec précision. Essayez une autre formulation ou consultez la bibliothèque.'}
                        </p>
                      ) : null}
                      {t.sources.length > 0 && (
                        <ol className="mt-5 space-y-2">
                          <li className="font-brand text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[#333]/50">Sources consultées</li>
                          {t.sources.map((s) => (
                            <li key={s.n} id={`src-${i}-${s.n}`} className="scroll-mt-24 bg-[#f9f5ec] px-4 py-3">
                              <a href={s.url} className="group block">
                                <span className="flex items-baseline gap-2">
                                  <span className="font-brand text-[0.7rem] font-bold text-[#6a0d0d]">[{s.n}]</span>
                                  <span className="font-serif text-[0.98rem] font-bold leading-snug text-[#0d1b2a] group-hover:text-[#6a0d0d]">{s.titre}</span>
                                </span>
                                <span className="mt-0.5 block text-xs text-[#333]/60">
                                  {[s.auteur, s.type, s.source, s.annee].filter(Boolean).join(' · ')}
                                  {s.acces === 'Résumé seul (embargo)' && ' · résumé seul (texte sous embargo)'}
                                </span>
                                <span className="mt-1.5 line-clamp-2 text-[0.85rem] leading-relaxed text-[#333]/80">{s.extrait}</span>
                              </a>
                            </li>
                          ))}
                        </ol>
                      )}
                      {(t.reponse || t.sources.length > 0) && (
                        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#333]/55">
                          <span>Cette réponse est une aide à la recherche. Vérifiez les textes et références avant toute citation scientifique.</span>
                          <a
                            className="font-semibold text-[#6a0d0d] underline underline-offset-2"
                            href={`mailto:${email}?subject=${encodeURIComponent('JOGOO AI — signalement')}&body=${encodeURIComponent(`Question : ${t.question}\n\nRéponse ou référence incorrecte :\n\n`)}`}
                          >
                            Signaler une erreur ou une référence incorrecte
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
        <div ref={fin} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          poser(q);
        }}
        className="flex items-end gap-3 bg-[#0d1b2a] p-3 sm:p-4"
      >
        <textarea
          ref={champ}
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
          placeholder="Posez votre question sur les philosophies africaines…"
          aria-label="Votre question"
          className="max-h-40 min-h-[2.75rem] flex-1 resize-none bg-white/95 px-4 py-2.5 text-[0.95rem] text-[#0d1b2a] outline-none placeholder:text-[#333]/45 focus:bg-white"
        />
        <button
          type="submit"
          disabled={occupe || q.trim().length < 3}
          className="h-11 shrink-0 bg-[#d99a0e] px-5 font-brand text-xs font-bold uppercase tracking-[0.12em] text-[#0d1b2a] transition-colors hover:bg-[#f9f5ec] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Rechercher dans le corpus
        </button>
      </form>
      <p className="bg-[#0d1b2a] px-4 pb-3 text-[0.72rem] leading-relaxed text-[#f9f5ec]/55 sm:px-5">
        Les réponses peuvent comporter des erreurs. Vérifiez toujours les références et consultez les textes originaux. Les citations exactes ne sont affichées que lorsqu’elles sont vérifiables.
      </p>
    </div>
  );
}

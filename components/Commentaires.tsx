'use client';

import { useEffect, useRef, useState } from 'react';

type C = { nom: string; texte: string; date: string };

const initiales = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((m) => m[0]?.toUpperCase() ?? '').join('') || '?';

const quand = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Section « Le débat » de l'original : commentaires sans compte, relus ensuite par la rédaction. */
export function Commentaires({ edito }: { edito: string }) {
  const [liste, setListe] = useState<C[] | null>(null);
  const [ouvert, setOuvert] = useState(true);
  const [nom, setNom] = useState('');
  const [texte, setTexte] = useState('');
  const [etat, setEtat] = useState<'' | 'envoi' | 'ok' | string>('');
  const zone = useRef<HTMLTextAreaElement>(null);
  const piege = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/commentaires?edito=${edito}`)
      .then((r) => r.json())
      .then((j) => { setListe(j.liste ?? []); setOuvert(j.ouvert !== false); })
      .catch(() => setListe([]));
  }, [edito]);

  useEffect(() => {
    const z = zone.current;
    if (z) { z.style.height = 'auto'; z.style.height = z.scrollHeight + 'px'; }
  }, [texte]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ouvert) {
      // Publication en ligne pas encore activée : le commentaire part par e-mail vers la rédaction.
      const corps = `Commentaire sur l’édito « ${edito} »\n\nNom ou pseudonyme : ${nom}\n\n${texte}\n\n— Envoyé depuis ${window.location.href}`;
      window.location.href = `mailto:philoafricaine@gmail.com?subject=${encodeURIComponent('Commentaire — ' + edito)}&body=${encodeURIComponent(corps)}`;
      setEtat('mail');
      return;
    }
    setEtat('envoi');
    const r = await fetch('/api/commentaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edito, nom, texte, site: piege.current?.value }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.commentaire) {
      setListe((l) => [...(l ?? []), j.commentaire]);
      setTexte('');
      setEtat('ok');
    } else setEtat(j.erreur || 'Envoi impossible pour le moment.');
  };

  return (
    <section id="commentaires" className="border-t border-ink/10 bg-cream print:hidden">
      <div className="mx-auto max-w-3xl px-5 py-14 lg:py-16">
        <p className="kicker">Le débat</p>
        <h2 className="display-title mt-2 text-2xl text-ink sm:text-3xl">Laisser un commentaire</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Pas besoin de compte : un nom ou un pseudonyme suffit. Les commentaires paraissent aussitôt et sont relus ensuite par la rédaction. On discute des idées, avec courtoisie.
        </p>
        <form onSubmit={envoyer} className="mt-6 border border-ink/12 bg-white p-5 sm:p-6">
          <input ref={piege} aria-hidden="true" autoComplete="off" className="hidden" tabIndex={-1} type="text" defaultValue="" />
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-terra/12 font-brand text-xs font-bold text-terra-deep">
              {initiales(nom)}
            </span>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="h-10 flex-1 border border-ink/20 bg-white px-3 text-sm outline-none focus:border-terra"
              maxLength={60}
              placeholder="Votre nom ou pseudonyme"
              aria-label="Votre nom ou pseudonyme"
              type="text"
            />
          </div>
          <textarea
            ref={zone}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Partagez votre lecture, une objection, une référence…"
            aria-label="Votre commentaire"
            rows={3}
            maxLength={4000}
            className="mt-3 w-full resize-none overflow-hidden border border-ink/20 bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-terra"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className={`max-w-md text-xs ${etat && etat !== 'envoi' && etat !== 'ok' && etat !== 'mail' ? 'text-terra' : 'text-ink/50'}`}>
              {etat === 'ok'
                ? 'Merci, votre commentaire est publié.'
                : etat === 'mail'
                  ? 'Votre messagerie s’ouvre : envoyez le message, la rédaction publiera votre commentaire après relecture.'
                  : etat && etat !== 'envoi'
                    ? etat
                    : ouvert
                      ? 'Publié sous pseudonymat, modéré ensuite.'
                      : 'Votre commentaire sera transmis à la rédaction, qui le publiera après relecture.'}
            </span>
            <button
              type="submit"
              disabled={nom.trim().length < 2 || texte.trim().length < 3 || etat === 'envoi'}
              className="h-10 bg-ink px-5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra disabled:cursor-not-allowed disabled:opacity-40"
            >
              {etat === 'envoi' ? 'Envoi…' : ouvert ? 'Publier le commentaire' : 'Envoyer le commentaire'}
            </button>
          </div>
        </form>
        <div className="mt-10">
          {liste === null ? (
            <div className="animate-pulse space-y-6 border-t border-ink/10 pt-8">
              {[0, 1].map((k) => (
                <div key={k} className="flex gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-ink/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 bg-ink/10" />
                    <div className="h-3 w-full bg-ink/10" />
                    <div className="h-3 w-3/4 bg-ink/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : liste.length === 0 ? (
            <p className="border-t border-ink/10 pt-8 text-sm text-ink-soft">Aucun commentaire pour l’instant. Ouvrez le débat !</p>
          ) : (
            <ol className="space-y-6 border-t border-ink/10 pt-8">
              <li className="kicker">{liste.length} commentaire{liste.length > 1 ? 's' : ''}</li>
              {liste.map((c, i) => (
                <li key={i} className="flash-fade flex gap-3">
                  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-terra/12 font-brand text-xs font-bold text-terra-deep">
                    {initiales(c.nom)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-brand font-bold text-ink">{c.nom}</span>
                      <span className="ml-2 text-xs text-ink/45">{quand(c.date)}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft">{c.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

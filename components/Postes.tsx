'use client';

import { useState } from 'react';

export type Poste = { numero: number; intitule: string; pourvu: boolean; missions: string[] };

const EMAIL = 'philoafricaine@gmail.com';

/** Fiches de poste de l'original : filtre ouverts / tous, et candidature (formulaire qui prépare l'e-mail). */
export function Postes({ postes }: { postes: Poste[] }) {
  const [tous, setTous] = useState(false);
  const [cible, setCible] = useState<Poste | 'spontanee' | null>(null);
  const [f, setF] = useState({ nom: '', email: '', message: '' });
  const ouverts = postes.filter((p) => !p.pourvu);
  const visibles = tous ? postes : ouverts;
  const objet = cible === 'spontanee' ? 'Candidature spontanée — direction de programme' : cible ? `Candidature — Axe ${String(cible.numero).padStart(2, '0')} : ${cible.intitule}` : '';
  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    const corps = `${f.message}\n\n—\n${f.nom}\n${f.email}\n\n(CV, lettre de motivation et portfolio éventuel en pièces jointes)`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
  };
  return (
    <>
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/12 pb-3">
          <h2 className="display-title text-2xl text-terra sm:text-3xl">Les postes</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink/50">
              {ouverts.length} ouvert{ouverts.length > 1 ? 's' : ''} · {postes.length} au total
            </span>
            <button type="button" onClick={() => setTous((v) => !v)} className="font-semibold text-terra-deep hover:text-terra">
              {tous ? 'Voir les postes ouverts' : 'Voir tous les postes'}
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {visibles.map((p) => (
            <article
              key={p.numero}
              className={`flash-fade flex flex-col rounded-xl border p-5 transition-colors ${p.pourvu ? 'border-ink/10 bg-cream/40' : 'border-ink/12 bg-white hover:border-terra/50'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-serif text-2xl text-terra/50">{String(p.numero).padStart(2, '0')}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${p.pourvu ? 'bg-ink/8 text-ink/50' : 'bg-terra/10 text-terra-deep'}`}>
                  {p.pourvu ? 'Pourvu' : 'Ouvert'}
                </span>
              </div>
              <h3 className={`mt-2 font-brand text-[0.98rem] font-bold leading-snug ${p.pourvu ? 'text-ink/60' : 'text-ink'}`}>{p.intitule}</h3>
              <ul className="mt-3 flex-1 space-y-1 text-xs leading-relaxed text-ink-soft">
                {p.missions.map((m, i) => (
                  <li key={i} className="pl-3.5 -indent-3.5">
                    <span className="text-terra">·</span> {m}
                  </li>
                ))}
              </ul>
              {!p.pourvu && (
                <button
                  type="button"
                  onClick={() => setCible(p)}
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-ink px-4 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra"
                >
                  Postuler
                </button>
              )}
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-start gap-3 rounded-xl bg-ink px-6 py-6 text-paper sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-brand text-sm font-bold">Aucun poste ne correspond ?</p>
            <p className="mt-0.5 text-sm text-paper/60">Envoyez une candidature spontanée, nous la gardons pour les prochains programmes.</p>
          </div>
          <button
            type="button"
            onClick={() => setCible('spontanee')}
            className="shrink-0 rounded-md border border-paper/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            Candidature spontanée
          </button>
        </div>
      </section>

      {cible && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setCible(null)} role="dialog" aria-modal="true" aria-label="Candidature">
          <form onSubmit={envoyer} onClick={(e) => e.stopPropagation()} className="flash-fade w-full max-w-lg rounded-t-xl bg-paper p-6 sm:rounded-xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kicker">Candidature</p>
                <h3 className="mt-1 font-brand text-lg font-bold leading-snug text-ink">{cible === 'spontanee' ? 'Candidature spontanée' : cible.intitule}</h3>
              </div>
              <button type="button" onClick={() => setCible(null)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-ink/15 hover:border-terra hover:text-terra" aria-label="Fermer">
                ✕
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              <input required value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="Nom et prénom" aria-label="Nom et prénom" className="h-11 border border-ink/20 bg-white px-3 text-sm outline-none focus:border-terra" />
              <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Adresse électronique" aria-label="Adresse électronique" className="h-11 border border-ink/20 bg-white px-3 text-sm outline-none focus:border-terra" />
              <textarea required rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Présentez-vous en quelques lignes : parcours, projet pour l’axe, disponibilités…" aria-label="Message" className="border border-ink/20 bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-terra" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink/55">
              Votre messagerie s’ouvre avec un message prêt à l’envoi à {EMAIL} : joignez-y votre CV, votre lettre de motivation et, si vous le souhaitez, un portfolio.
            </p>
            <button type="submit" className="mt-5 inline-flex h-11 w-full items-center justify-center bg-terra px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-terra-deep">
              Préparer l’e-mail de candidature
            </button>
          </form>
        </div>
      )}
    </>
  );
}

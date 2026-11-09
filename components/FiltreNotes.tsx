'use client';

import { useState } from 'react';

export type Note = {
  slug: string;
  titre: string;
  auteur?: string | null;
  annee?: string | null;
  minutes: number;
  resume: string;
  tags: string[];
  portrait?: string | null;
};

const Tags = ({ tags }: { tags: string[] }) => (
  <ul className="flex flex-wrap gap-1.5">
    {tags.map((t) => (
      <li key={t} className="border border-ink/15 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">
        {t}
      </li>
    ))}
  </ul>
);

export function CarteNote({ n, grande = false }: { n: Note; grande?: boolean }) {
  const vignette = grande ? 'h-20 w-16' : 'h-14 w-12';
  return (
    <a className={`flash-fade group flex gap-5 border border-ink/12 bg-white p-6 transition-colors hover:border-terra ${grande ? 'sm:p-7' : ''}`} href={`/publications/${n.slug}`}>
      {n.portrait ? (
        <img alt="" src={n.portrait} className={`${vignette} shrink-0 border border-ink/10 object-cover object-top grayscale transition duration-500 group-hover:grayscale-0`} />
      ) : (
        <span className={`${vignette} flex shrink-0 items-center justify-center border border-ink/10 bg-cream font-display text-lg font-black text-terra/40`}>
          {(n.auteur ?? n.titre).trim()[0]?.toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-terra-deep">
          Note de lecture{n.annee ? ` · ${n.annee}` : ''} · {n.minutes} min
        </p>
        <h3 className={`mt-1.5 font-brand font-bold leading-snug text-ink group-hover:text-terra ${grande ? 'text-xl' : 'text-[1.05rem]'}`}>{n.titre}</h3>
        {n.auteur && <p className="mt-1 font-serif text-sm italic text-ink/70">{n.auteur}</p>}
        <p className="mt-3 line-clamp-3 text-[0.92rem] leading-relaxed text-ink-soft">{n.resume}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Tags tags={n.tags} />
          <span className="ml-auto text-sm font-semibold text-terra-deep">
            Lire<span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </a>
  );
}

/** Notes de lecture filtrables par mot-clé (les étiquettes de l'original deviennent des filtres). */
export function FiltreNotes({ notes }: { notes: Note[] }) {
  const [actif, setActif] = useState<string | null>(null);
  const tous = [...new Set(notes.flatMap((n) => n.tags))].sort((a, b) => a.localeCompare(b, 'fr'));
  const visibles = actif ? notes.filter((n) => n.tags.includes(actif)) : notes;
  return (
    <>
      <div className="mt-16 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="kicker mb-2">
            {visibles.length} recension{visibles.length > 1 ? 's' : ''}
            {actif ? ` · ${actif}` : ''}
          </p>
          <h2 className="display-title text-3xl text-terra sm:text-4xl">Notes de lecture</h2>
        </div>
        {actif && (
          <button type="button" onClick={() => setActif(null)} className="text-sm font-semibold uppercase tracking-wide text-terra-deep hover:text-terra">
            Tout afficher ✕
          </button>
        )}
      </div>
      <ul className="mb-8 mt-4 flex flex-wrap gap-1.5" aria-label="Filtrer par thème">
        {tous.map((t) => (
          <li key={t}>
            <button
              type="button"
              aria-pressed={actif === t}
              onClick={() => setActif(actif === t ? null : t)}
              className={`border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide transition-colors ${actif === t ? 'border-terra bg-terra text-white' : 'border-ink/15 text-ink-soft hover:border-terra hover:text-terra'}`}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 sm:grid-cols-2">
        {visibles.map((n) => (
          <CarteNote key={`${actif}-${n.slug}`} n={n} />
        ))}
      </div>
    </>
  );
}

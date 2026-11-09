'use client';

import { useMemo, useState } from 'react';

export type Fiche = { id: string; type: string; titre: string; auteur: string; annee: string; source: string; url: string; langue: string; acces: string; resume: string; motsCles: string[] };

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Bibliothèque JOGOO : notices filtrables (auteur, titre, concept, période, langue, type, accès). */
export function Bibliotheque({ fiches }: { fiches: Fiche[] }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [langue, setLangue] = useState('');
  const [acces, setAcces] = useState('');
  const [periode, setPeriode] = useState('');
  const options = (k: keyof Fiche) => [...new Set(fiches.map((f) => String(f[k])).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  const periodes = [
    ['', 'Toutes les périodes'],
    ['-1980', 'Avant 1980'],
    ['1980-1999', '1980 – 1999'],
    ['2000-2019', '2000 – 2019'],
    ['2020-', 'Depuis 2020'],
  ];
  const liste = useMemo(() => {
    const mots = norm(q).split(/\s+/).filter(Boolean);
    return fiches.filter((f) => {
      if (type && f.type !== type) return false;
      if (langue && f.langue !== langue) return false;
      if (acces && f.acces !== acces) return false;
      if (periode) {
        const a = Number(f.annee);
        if (!a) return false;
        const [de, a2] = periode.split('-');
        if (de && a < Number(de)) return false;
        if (a2 && a > Number(a2)) return false;
      }
      const tout = norm(`${f.titre} ${f.auteur} ${f.source} ${f.motsCles.join(' ')} ${f.resume}`);
      return mots.every((m) => tout.includes(m));
    });
  }, [fiches, q, type, langue, acces, periode]);

  const choix = 'h-11 bg-white/[0.07] px-3 text-sm text-[#f9f5ec] outline-none placeholder:text-[#e9e2d0]/40 focus:bg-white/[0.11] focus:ring-1 focus:ring-[#d99a0e]/60 [&>option]:bg-[#0b1626]';
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Auteur, titre, concept…" aria-label="Rechercher dans la bibliothèque" className={choix} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={choix} aria-label="Type de document">
          <option value="">Tous les types</option>
          {options('type').map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select value={periode} onChange={(e) => setPeriode(e.target.value)} className={choix} aria-label="Période">
          {periodes.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select value={langue} onChange={(e) => setLangue(e.target.value)} className={choix} aria-label="Langue">
          <option value="">Toutes les langues</option>
          {options('langue').map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select value={acces} onChange={(e) => setAcces(e.target.value)} className={choix} aria-label="Statut d’accès">
          <option value="">Tous les accès</option>
          {options('acces').map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <p className="mt-5 font-brand text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#e9e2d0]/55">
        {liste.length} notice{liste.length > 1 ? 's' : ''}
      </p>
      <ul className="mt-3 grid gap-4 md:grid-cols-2">
        {liste.map((f) => (
          <li key={f.id} className="flash-fade">
            <a href={f.url} className="group flex h-full flex-col bg-white/[0.045] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-[0_0_40px_-12px_rgba(255,201,74,0.35)]">
              <span className="flex flex-wrap items-center gap-2">
                <span className="bg-[#6a0d0d] px-2 py-0.5 font-brand text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white">{f.type}</span>
                <span className={`px-2 py-0.5 font-brand text-[0.6rem] font-bold uppercase tracking-[0.12em] ${f.acces === 'Résumé seul (embargo)' ? 'bg-white/10 text-[#e9e2d0]/70' : 'bg-[#d99a0e]/20 text-[#ffc94a]'}`}>{f.acces}</span>
                {f.langue !== 'Français' && <span className="font-brand text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#e9e2d0]/45">{f.langue}</span>}
              </span>
              <span className="mt-3 font-serif text-lg font-bold leading-snug text-[#f9f5ec] group-hover:text-[#ffc94a]">{f.titre}</span>
              <span className="mt-1 text-sm text-[#e9e2d0]/60">{[f.auteur, f.annee, f.source].filter(Boolean).join(' · ')}</span>
              {f.resume && <span className="mt-3 line-clamp-3 text-[0.9rem] leading-relaxed text-[#e9e2d0]/80">{f.resume}</span>}
              {f.motsCles.length > 0 && (
                <span className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {f.motsCles.slice(0, 5).map((m) => (
                    <span key={m} className="bg-white/[0.06] px-2 py-0.5 text-[0.7rem] text-[#e9e2d0]/70">
                      {m}
                    </span>
                  ))}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

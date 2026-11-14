'use client';

import { useState } from 'react';

const CIVILITES = [
  ['', 'Sans titre'],
  ['Pr', 'Pr'],
  ['Dr', 'Dr'],
  ['M.', 'M.'],
  ['Mme', 'Mme'],
];

/** Formulaire : le nom est vérifié dans le registre des intervenant·e·s, puis le PDF est téléchargé. */
export function DemandeAttestation() {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [civilite, setCivilite] = useState('');
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'ok'>('repos');
  const [erreur, setErreur] = useState('');
  const [fichier, setFichier] = useState<{ url: string; nom: string; ref: string } | null>(null);

  const demander = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setEtat('envoi');
    try {
      const r = await fetch('/api/attestation', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nom: `${prenom} ${nom}`, civilite }) });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.erreur || 'La génération a échoué. Réessayez dans un instant.');
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const nomFichier = /filename="([^"]+)"/.exec(r.headers.get('content-disposition') ?? '')?.[1] ?? 'attestation-colloque-eboussi.pdf';
      setFichier({ url, nom: nomFichier, ref: r.headers.get('x-attestation') ?? '' });
      setEtat('ok');
      const a = document.createElement('a');
      a.href = url;
      a.download = nomFichier;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (x) {
      setErreur(x instanceof Error ? x.message : 'La génération a échoué.');
      setEtat('repos');
    }
  };

  const champ = 'h-12 w-full border border-ink/20 bg-white px-3 text-base outline-none focus:border-terra';
  return (
    <form onSubmit={demander} className="rounded-xl border border-ink/12 bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-[9rem_1fr_1fr]">
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Titre
          <select value={civilite} onChange={(e) => setCivilite(e.target.value)} className={champ}>
            {CIVILITES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Prénom
          <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" className={champ} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          Nom
          <input required value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" className={champ} />
        </label>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">Saisissez votre prénom et votre nom tels qu’ils figurent au programme du colloque. Les accents et les majuscules sont indifférents.</p>
      {erreur && (
        <p role="alert" className="mt-4 rounded-md bg-terra/10 px-4 py-3 text-sm leading-relaxed text-terra-deep">
          {erreur}
        </p>
      )}
      {etat === 'ok' && fichier && (
        <p role="status" className="mt-4 rounded-md bg-cream px-4 py-3 text-sm leading-relaxed text-ink">
          Votre attestation n° {fichier.ref} est prête. Si le téléchargement n’a pas démarré,{' '}
          <a href={fichier.url} download={fichier.nom} className="font-semibold text-terra-deep underline">
            téléchargez le PDF ici
          </a>
          .
        </p>
      )}
      <button type="submit" disabled={etat === 'envoi'} className="mt-6 inline-flex h-12 w-full items-center justify-center bg-terra px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-terra-deep disabled:opacity-60 sm:w-auto">
        {etat === 'envoi' ? 'Vérification en cours…' : 'Obtenir mon attestation (PDF)'}
      </button>
    </form>
  );
}

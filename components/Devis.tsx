'use client';

import { useState } from 'react';

const SERVICES = ['Événementiel scientifique', 'Création visuelle et web', 'Traduction et interprétariat', 'Assistance à l’édition', 'Campagnes et communication numérique', 'Autre / plusieurs services'];

/** Formulaire de devis Sankofa : prépare un brouillon dans la messagerie (les fichiers s'y joignent). */
export function Devis({ email }: { email: string }) {
  const [f, setF] = useState({ service: SERVICES[0], nom: '', courriel: '', echeance: '', budget: '', description: '' });
  const maj = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    const corps = [
      `Service souhaité : ${f.service}`,
      `Nom ou organisation : ${f.nom}`,
      `Courriel : ${f.courriel}`,
      `Échéance : ${f.echeance || 'à préciser'}`,
      `Budget indicatif : ${f.budget || 'à préciser'}`,
      '',
      'Description du projet :',
      f.description,
      '',
      '(Joindre ici les fichiers utiles : charte, programme, textes…)',
    ].join('\n');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Demande de devis — ${f.service}`)}&body=${encodeURIComponent(corps)}`;
  };
  const champ = 'h-11 w-full border border-[#646460]/30 bg-white px-3 text-sm outline-none transition-colors focus:border-[#e20613]';
  const etiquette = 'mb-1.5 block font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#646460]';
  return (
    <form onSubmit={envoyer} className="grid gap-4 border border-[#646460]/20 bg-white p-6 sm:grid-cols-2 sm:p-8">
      <label className="sm:col-span-2">
        <span className={etiquette}>Service souhaité</span>
        <select value={f.service} onChange={maj('service')} className={champ}>
          {SERVICES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={etiquette}>Nom ou organisation</span>
        <input required value={f.nom} onChange={maj('nom')} className={champ} />
      </label>
      <label>
        <span className={etiquette}>Courriel</span>
        <input required type="email" value={f.courriel} onChange={maj('courriel')} className={champ} />
      </label>
      <label>
        <span className={etiquette}>Échéance</span>
        <input value={f.echeance} onChange={maj('echeance')} placeholder="ex. colloque du 12 mars 2027" className={champ} />
      </label>
      <label>
        <span className={etiquette}>Budget indicatif</span>
        <input value={f.budget} onChange={maj('budget')} placeholder="facultatif" className={champ} />
      </label>
      <label className="sm:col-span-2">
        <span className={etiquette}>Description du projet</span>
        <textarea required rows={6} value={f.description} onChange={maj('description')} placeholder="Public, calendrier, livrables attendus, langues, nombre de participants…" className={`${champ} h-auto py-2 leading-relaxed`} />
      </label>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-[#646460]">Le formulaire prépare un brouillon dans votre messagerie. Vous pourrez le relire et ajouter vos fichiers avant l’envoi.</p>
        <button type="submit" className="h-11 shrink-0 bg-[#e20613] px-6 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#3d3d3a]">
          Préparer ma demande
        </button>
      </div>
    </form>
  );
}

'use client';

import { useRef, useState } from 'react';
import { compterMots, EXTENSIONS, FICHIER_MAX, type Champ } from '@/lib/formulaires';

const ACCORD_DEFAUT =
  'J’accepte que ces informations soient transmises aux organisateurs (Groupe JOGOO et Fonds Eboussi Boulaga) pour le traitement de ma demande. Elles ne sont ni publiées ni cédées.';

type Etat = { t: 'repos' } | { t: 'envoi' } | { t: 'ok'; email: string } | { t: 'erreur'; message: string; secours?: boolean };

const base =
  'mt-1.5 w-full border border-ink/20 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink outline-none transition focus:border-terra focus:ring-2 focus:ring-terra/15';

function Compteur({ valeur, mots }: { valeur: string; mots: [number, number] }) {
  const n = compterMots(valeur);
  const hors = n > 0 && (n < mots[0] * 0.8 || n > mots[1] * 1.2);
  return (
    <span className={`text-xs ${hors ? 'text-terra-deep' : 'text-ink/45'}`}>
      {n} mot{n > 1 ? 's' : ''} · attendu : {mots[0]} à {mots[1]}
    </span>
  );
}

function ChampSaisie({ c }: { c: Champ }) {
  const [v, setV] = useState('');
  const id = `f-${c.nom}`;
  const etiquette = (
    <label htmlFor={id} className="font-brand text-[0.8rem] font-bold uppercase tracking-[0.08em] text-ink">
      {c.libelle}
      {c.requis ? <span className="text-terra"> *</span> : null}
    </label>
  );
  let saisie;
  if (c.type === 'zone')
    saisie = <textarea id={id} name={c.nom} required={c.requis} maxLength={c.max} rows={c.lignes ?? 5} value={v} onChange={(e) => setV(e.target.value)} className={`${base} leading-relaxed`} />;
  else if (c.type === 'choix')
    saisie = (
      <select id={id} name={c.nom} required={c.requis} defaultValue="" className={base}>
        <option value="" disabled>
          Choisir…
        </option>
        {c.options?.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  else if (c.type === 'fichier')
    saisie = <input id={id} name={c.nom} type="file" required={c.requis} accept={(c.accept ?? EXTENSIONS).join(',')} className={`${base} file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-brand file:text-xs file:font-bold file:uppercase file:text-paper`} />;
  else
    saisie = (
      <input
        id={id}
        name={c.nom}
        type={c.type === 'texte' ? 'text' : c.type}
        required={c.requis}
        maxLength={c.max}
        autoComplete={{ prenom: 'given-name', nom: 'family-name', email: 'email', telephone: 'tel', pays: 'country-name' }[c.nom]}
        className={base}
      />
    );
  return (
    <div className={c.demi ? 'sm:col-span-1' : 'sm:col-span-2'}>
      {etiquette}
      {saisie}
      <div className="mt-1 flex flex-wrap justify-between gap-2">
        {c.aide ? <span className="text-xs text-ink/55">{c.aide}</span> : <span />}
        {c.mots && <Compteur valeur={v} mots={c.mots} />}
      </div>
    </div>
  );
}

export function FormulaireEnLigne({
  sorte,
  slug,
  champs,
  bouton,
  contact,
  accord = ACCORD_DEFAUT,
  merci = 'Une copie vient de partir à {email}, avec le document de l’activité. Pensez à regarder dans vos courriers indésirables.',
}: {
  sorte: 'inscription' | 'candidature' | 'adhesion';
  slug: string;
  champs: Champ[];
  bouton: string;
  contact: string;
  accord?: string;
  merci?: string;
}) {
  const [etat, setEtat] = useState<Etat>({ t: 'repos' });
  const debut = useRef(Date.now());

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    let total = 0;
    for (const c of champs.filter((x) => x.type === 'fichier')) {
      const f = fd.get(c.nom);
      if (!(f instanceof File) || f.size === 0) continue;
      total += f.size;
      const ext = c.accept ?? EXTENSIONS;
      if (!ext.some((x) => f.name.toLowerCase().endsWith(x))) return setEtat({ t: 'erreur', message: `${c.libelle} : formats acceptés ${ext.join(', ')}.` });
    }
    if (total > FICHIER_MAX) return setEtat({ t: 'erreur', message: 'Les fichiers dépassent 4 Mo au total. Allégez-les (photos, PDF) ou envoyez-les par e-mail.' });
    fd.set('sorte', sorte);
    fd.set('slug', slug);
    fd.set('duree', String(Date.now() - debut.current));
    setEtat({ t: 'envoi' });
    try {
      const r = await fetch('/api/formulaire', { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setEtat({ t: 'ok', email: String(fd.get('email') ?? '') });
        window.scrollTo({ top: (document.getElementById('formulaire')?.offsetTop ?? 0) - 120, behavior: 'smooth' });
      } else setEtat({ t: 'erreur', message: j.erreur || 'L’envoi n’a pas abouti.', secours: r.status >= 500 });
    } catch {
      setEtat({ t: 'erreur', message: 'Connexion impossible. Vérifiez votre réseau puis réessayez.', secours: true });
    }
  }

  if (etat.t === 'ok')
    return (
      <div className="border-l-4 border-terra bg-white p-7" role="status">
        <p className="kicker text-terra-deep">C’est envoyé</p>
        <p className="mt-2 font-serif text-xl text-ink">Merci, votre envoi a bien été reçu.</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {merci.split('{email}')[0]}
          <strong className="text-ink">{etat.email}</strong>
          {merci.split('{email}')[1]}
        </p>
      </div>
    );

  return (
    <form onSubmit={envoyer} className="grid gap-x-5 gap-y-5 sm:grid-cols-2" noValidate={false}>
      {champs.map((c) => (
        <ChampSaisie key={c.nom} c={c} />
      ))}
      {/* piège à robots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Site web <input name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft sm:col-span-2">
        <input type="checkbox" name="accord" required className="mt-1 h-4 w-4 accent-[#b3200e]" />
        <span>{accord}</span>
      </label>
      {sorte !== 'adhesion' && (
        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft sm:col-span-2">
          <input type="checkbox" name="droit_image" value="oui" className="mt-1 h-4 w-4 accent-[#b3200e]" />
          <span>
            Droit à l’image (facultatif) : j’autorise les organisateurs (Groupe JOGOO et Fonds Eboussi Boulaga) à utiliser les photos et vidéos prises pendant l’activité, sur lesquelles je peux figurer, pour leur
            communication et leurs comptes rendus. Je peux retirer mon accord à tout moment en écrivant à{' '}
            <a className="underline" href={`mailto:${contact}`}>
              {contact}
            </a>
            .
          </span>
        </label>
      )}
      {sorte !== 'adhesion' && (
        <>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft sm:col-span-2">
            <input type="checkbox" name="lettre" value="oui" className="mt-1 h-4 w-4 accent-[#b3200e]" />
            <span>Je souhaite aussi recevoir la lettre d’information hebdomadaire du Groupe JOGOO (facultatif).</span>
          </label>
          <p className="text-sm leading-relaxed text-ink-soft sm:col-span-2">
            En vous inscrivant, votre adresse e-mail est ajoutée à notre liste de diffusion : vous recevrez les annonces de nos prochaines activités. Vous pouvez vous désinscrire à tout moment, par le lien présent dans chaque
            message ou en écrivant à{' '}
            <a className="underline" href={`mailto:${contact}`}>
              {contact}
            </a>
            .
          </p>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft sm:col-span-2">
            <input type="checkbox" name="sans_diffusion" value="oui" className="mt-1 h-4 w-4 accent-[#b3200e]" />
            <span>Je ne souhaite pas recevoir les annonces des prochaines activités.</span>
          </label>
        </>
      )}
      {etat.t === 'erreur' && (
        <p className="border-l-4 border-terra-deep bg-terra/5 px-4 py-3 text-sm text-terra-deep sm:col-span-2" role="alert">
          {etat.message}
          {etat.secours && (
            <>
              {' '}
              Vous pouvez aussi écrire à{' '}
              <a className="font-semibold underline" href={`mailto:${contact}`}>
                {contact}
              </a>
              .
            </>
          )}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={etat.t === 'envoi'}
          className="bg-terra px-7 py-3.5 font-brand text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-ink disabled:cursor-wait disabled:opacity-60"
        >
          {etat.t === 'envoi' ? 'Envoi en cours…' : bouton}
        </button>
        <span className="ml-4 text-xs text-ink/50">* champ obligatoire</span>
      </div>
    </form>
  );
}

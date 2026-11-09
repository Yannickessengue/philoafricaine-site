'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

/**
 * Consentement aux cookies.
 * Le site ne dépose lui-même ni cookie publicitaire ni mesure d’audience. Seuls les contenus
 * extérieurs (vidéos YouTube et WebTV, page Facebook) peuvent en déposer : ils ne se chargent
 * qu’après accord. Le choix est gardé six mois (stockage local + cookie technique).
 */
type Choix = { medias: boolean; date: string };
const CLE = 'jogoo-consentement';
const EVENEMENT = 'jogoo-consentement';
const DUREE = 182 * 24 * 3600 * 1000;

function lire(): Choix | null {
  try {
    const c = JSON.parse(localStorage.getItem(CLE) || 'null') as Choix | null;
    if (c && Date.now() - new Date(c.date).getTime() < DUREE) return c;
  } catch {}
  return null;
}

export function enregistrerChoix(medias: boolean) {
  const c: Choix = { medias, date: new Date().toISOString() };
  try {
    localStorage.setItem(CLE, JSON.stringify(c));
  } catch {}
  document.cookie = `${CLE}=${medias ? 'medias' : 'essentiels'}; Max-Age=${DUREE / 1000}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new Event(EVENEMENT));
}

const abonner = (f: () => void) => {
  window.addEventListener(EVENEMENT, f);
  window.addEventListener('storage', f);
  return () => {
    window.removeEventListener(EVENEMENT, f);
    window.removeEventListener('storage', f);
  };
};
/** « oui », « non » ou « inconnu » (pas encore de choix). */
export function useConsentementMedias(): 'oui' | 'non' | 'inconnu' {
  return useSyncExternalStore(
    abonner,
    () => {
      const c = lire();
      return c ? (c.medias ? 'oui' : 'non') : 'inconnu';
    },
    () => 'inconnu',
  );
}

export const ouvrirReglagesCookies = () => window.dispatchEvent(new Event('jogoo-reglages-cookies'));

/** Contenu d’un service extérieur : affiché seulement après accord, sinon une vignette explicative. */
export function Externe({ service, lien, children, sombre = true }: { service: string; lien?: string; children: ReactNode; sombre?: boolean }) {
  const etat = useConsentementMedias();
  if (etat === 'oui') return <>{children}</>;
  return (
    <div className={`flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-3 p-6 text-center ${sombre ? 'bg-ink text-paper' : 'bg-cream text-ink'}`}>
      <p className="max-w-sm text-sm leading-relaxed opacity-80">
        Ce contenu est hébergé par <strong>{service}</strong>, qui peut déposer des cookies. Acceptez-vous de l’afficher&nbsp;?
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => enregistrerChoix(true)} className="bg-terra px-4 py-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white hover:bg-terra-deep">
          Accepter et afficher
        </button>
        {lien && (
          <a href={lien} target="_blank" rel="noreferrer" className={`px-4 py-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.12em] ${sombre ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-white/70'}`}>
            Voir sur {service} ↗
          </a>
        )}
      </div>
    </div>
  );
}

/** Bandeau de premier passage et fenêtre de réglages (rouverte par « Gérer les cookies »). */
const TEXTES = {
  fr: {
    titre: 'Cookies : à vous de choisir',
    intro: 'Le site n’utilise ni publicité ni mesure d’audience. Seuls les contenus extérieurs (vidéos YouTube et WebTV, page Facebook) peuvent déposer des cookies : ils ne s’affichent qu’avec votre accord.',
    perso: 'Personnaliser', refuser: 'Refuser', accepter: 'Tout accepter', reglages: 'Réglages des cookies', fermer: 'Fermer',
    ess: 'Essentiels', essTxt: 'Langue, introduction déjà vue, votre choix de cookies. Indispensables, sans suivi.', toujours: 'Toujours actifs',
    ext: 'Contenus extérieurs', extTxt: 'Vidéos YouTube et WebTV de l’université de Rouen, page Facebook du Groupe JOGOO.',
    note: 'Votre choix est conservé six mois. Vous pouvez le modifier à tout moment par le lien « Cookies » en bas de page.', mentions: 'Mentions légales',
    toutRefuser: 'Tout refuser', valider: 'Valider mon choix',
  },
  en: {
    titre: 'Cookies: your choice',
    intro: 'This site uses no advertising and no audience tracking. Only external content (YouTube and WebTV videos, Facebook page) may set cookies, and it only loads with your consent.',
    perso: 'Customise', refuser: 'Decline', accepter: 'Accept all', reglages: 'Cookie settings', fermer: 'Close',
    ess: 'Essential', essTxt: 'Language, intro already seen, your cookie choice. Required, no tracking.', toujours: 'Always on',
    ext: 'External content', extTxt: 'YouTube videos, University of Rouen WebTV, Groupe JOGOO Facebook page.',
    note: 'Your choice is kept for six months. You can change it at any time with the “Cookies” link at the bottom of the page.', mentions: 'Legal notice',
    toutRefuser: 'Decline all', valider: 'Save my choice',
  },
};

export function BandeauCookies({ en = false }: { en?: boolean }) {
  const T = TEXTES[en ? 'en' : 'fr'];
  const etat = useConsentementMedias();
  const [pret, setPret] = useState(false);
  const [fenetre, setFenetre] = useState(false);
  const [medias, setMedias] = useState(false);

  useEffect(() => {
    setPret(true);
    const ouvrir = () => {
      setMedias(lire()?.medias ?? false);
      setFenetre(true);
    };
    const clic = (e: MouseEvent) => {
      const cible = (e.target as HTMLElement).closest('[data-action="cookies"]');
      if (cible) {
        e.preventDefault();
        ouvrir();
      }
    };
    window.addEventListener('jogoo-reglages-cookies', ouvrir);
    document.addEventListener('click', clic);
    return () => {
      window.removeEventListener('jogoo-reglages-cookies', ouvrir);
      document.removeEventListener('click', clic);
    };
  }, []);

  useEffect(() => {
    if (!fenetre) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setFenetre(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [fenetre]);

  if (!pret) return null;
  const bouton = 'px-4 py-2.5 font-brand text-[0.7rem] font-bold uppercase tracking-[0.12em] transition-colors';

  return (
    <>
      {etat === 'inconnu' && !fenetre && (
        <div role="region" aria-label="Cookies" className={`flash-fade fixed inset-x-3 ${en ? 'bottom-5' : 'bottom-20'} z-[85] mx-auto max-w-2xl bg-ink p-5 text-paper shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] sm:p-6 lg:bottom-5 lg:left-5 lg:right-auto lg:mx-0`}>
          <div className="flex items-start gap-4">
            <img src="/medias/site/jogoo/picto-jogoo-ai.png" alt="" className="hidden h-12 w-12 shrink-0 object-contain sm:block" />
            <div className="text-left">
              <p className="font-brand text-sm font-bold text-white">{T.titre}</p>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-paper/70 [text-align:left]">
                {T.intro}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => { setMedias(false); setFenetre(true); }} className={`${bouton} text-paper/70 underline-offset-4 hover:text-white hover:underline`}>
              {T.perso}
            </button>
            <button type="button" onClick={() => enregistrerChoix(false)} className={`${bouton} bg-white/10 text-white hover:bg-white/20`}>
              {T.refuser}
            </button>
            <button type="button" onClick={() => enregistrerChoix(true)} className={`${bouton} bg-terra text-white hover:bg-terra-deep`}>
              {T.accepter}
            </button>
          </div>
        </div>
      )}

      {fenetre && (
        <div className="fixed inset-0 z-[96] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setFenetre(false)} role="dialog" aria-modal="true" aria-labelledby="cookies-titre">
          <div className="flash-fade w-full max-w-lg bg-paper text-left text-ink shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 id="cookies-titre" className="font-brand text-lg font-bold">{T.reglages}</h2>
              <button type="button" onClick={() => setFenetre(false)} className="flex h-9 w-9 items-center justify-center hover:bg-ink/5" aria-label={T.fermer}>
                ✕
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="flex items-start justify-between gap-4 bg-cream/70 p-4">
                <div>
                  <p className="font-brand text-sm font-bold">{T.ess}</p>
                  <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-soft [text-align:left]">{T.essTxt}</p>
                </div>
                <span className="shrink-0 font-brand text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink/45">{T.toujours}</span>
              </div>
              <label className="flex cursor-pointer items-start justify-between gap-4 bg-cream/70 p-4">
                <span>
                  <span className="block font-brand text-sm font-bold">{T.ext}</span>
                  <span className="mt-1 block text-[0.82rem] leading-relaxed text-ink-soft">{T.extTxt}</span>
                </span>
                <span className="relative mt-1 inline-flex shrink-0">
                  <input type="checkbox" checked={medias} onChange={(e) => setMedias(e.target.checked)} className="peer sr-only" />
                  <span className="h-6 w-11 rounded-full bg-ink/20 transition-colors peer-checked:bg-terra peer-focus-visible:ring-2 peer-focus-visible:ring-terra/40" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
              <p className="text-xs text-ink/50">
                {T.note}{' '}
                <a href="/mentions-legales" className="underline underline-offset-2 hover:text-terra">{T.mentions}</a>
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-ink/10 px-6 py-4">
              <button type="button" onClick={() => { enregistrerChoix(false); setFenetre(false); }} className={`${bouton} bg-ink/5 hover:bg-ink/10`}>
                {T.toutRefuser}
              </button>
              <button type="button" onClick={() => { enregistrerChoix(medias); setFenetre(false); }} className={`${bouton} bg-ink text-paper hover:bg-terra`}>
                {T.valider}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

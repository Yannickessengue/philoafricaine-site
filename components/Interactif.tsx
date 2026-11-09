'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/* Couche interactive du site : en-tête (ombre, lien actif), recherche, langues, menu mobile,
   intro animée, compte à rebours, apparition des sections, navigation sans rechargement. */

const NAV = [
  ['/', 'Accueil'],
  ['/le-groupe', 'Le Groupe'],
  ['/philosophie-africaine', 'Philosophie africaine'],
  ['/recherche', 'Recherche'],
  ['/publications', 'Publications'],
  ['/mediatheque', 'Médiathèque'],
  ['/actualites', 'Actualités'],
  ['/edito', 'Éditos'],
  ['/flash', 'Flashs'],
  ['/contact', 'Contact'],
] as const;

const LANGUES = [
  ['fr', 'Français'],
  ['en', 'English'],
  ['es', 'Español'],
  ['it', 'Italiano'],
  ['pt', 'Português'],
  ['ar', 'العربية'],
] as const;

type Item = { t: string; u: string; k: string; x: string };

const sansAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function langueCourante() {
  if (typeof document === 'undefined') return 'fr';
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/fr\/([a-z-]+)/);
  return m ? m[1] : 'fr';
}

function chargerTraducteur() {
  if (document.getElementById('gt-script')) return;
  const box = document.createElement('div');
  box.id = 'google_translate_element';
  box.style.display = 'none';
  document.body.appendChild(box);
  (window as unknown as Record<string, unknown>).googleTranslateElementInit = () => {
    const g = (window as unknown as { google: any }).google;
    new g.translate.TranslateElement({ pageLanguage: 'fr', autoDisplay: false }, 'google_translate_element');
  };
  const s = document.createElement('script');
  s.id = 'gt-script';
  s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  s.async = true;
  document.body.appendChild(s);
}

/** Bibliographie du Fonds Eboussi Boulaga : filtre par domaine, type et texte. */
function filtrerBibliographie() {
  const outils = document.querySelector('.fonds .bib-tools');
  if (!outils) return;
  const groupes = outils.querySelectorAll('.chips');
  const actif = (g?: Element) => g?.querySelector('[aria-pressed="true"]')?.childNodes[0]?.textContent?.trim() ?? '';
  const domaine = actif(groupes[0]);
  const type = actif(groupes[1]);
  const sans = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const q = sans(outils.querySelector<HTMLInputElement>('input[type="search"]')?.value ?? '').trim();
  let total = 0;
  document.querySelectorAll<HTMLElement>('.fonds .bib-out section').forEach((sec) => {
    const okDomaine = !domaine || domaine === 'Tout' || sec.getAttribute('aria-label') === domaine;
    let n = 0;
    sec.querySelectorAll<HTMLElement>('li').forEach((li) => {
      const k = li.querySelector('.k')?.textContent?.trim() ?? '';
      const okType = !type || type === 'Tous les types' || sans(type).startsWith(sans(k).slice(0, 5));
      const ok = okDomaine && okType && (!q || sans(li.textContent ?? '').includes(q));
      li.style.display = ok ? '' : 'none';
      if (ok) n++;
    });
    sec.style.display = n ? '' : 'none';
    total += n;
  });
  const c = outils.querySelector('.count');
  if (c) c.textContent = `${total} référence${total > 1 ? 's' : ''}`;
}

export function Interactif() {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [recherche, setRecherche] = useState(false);
  const [langue, setLangue] = useState(false);
  const [lang, setLang] = useState('fr');
  const [index, setIndex] = useState<Item[] | null>(null);
  const [q, setQ] = useState('');
  const champ = useRef<HTMLInputElement>(null);
  const [posLangue, setPosLangue] = useState<{ top: number; right: number } | null>(null);

  /* ——— Boutons de l'en-tête (fragment HTML d'origine) ——— */
  useEffect(() => {
    setLang(langueCourante());
    if (langueCourante() !== 'fr') chargerTraducteur();
    const clic = (e: MouseEvent) => {
      const cible = e.target as HTMLElement;
      // Fonds : agrandir une image (galerie, accueil)
      const agrandir = cible.closest<HTMLButtonElement>('.fonds figure > button[aria-label^="Agrandir"]');
      if (agrandir) {
        const img = agrandir.querySelector('img');
        if (!img) return;
        const legende = agrandir.parentElement?.querySelector('figcaption')?.textContent ?? img.alt;
        const fond = document.createElement('div');
        fond.className = 'fixed inset-0 z-[95] flex flex-col items-center justify-center gap-3 bg-black/90 p-4 flash-fade';
        fond.setAttribute('role', 'dialog');
        fond.setAttribute('aria-modal', 'true');
        fond.innerHTML = `<img src="${img.getAttribute('src')}" alt="" class="max-h-[82vh] max-w-full object-contain shadow-2xl"/><p class="max-w-2xl text-center text-sm text-white/80"></p><button type="button" class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black" aria-label="Fermer">✕</button>`;
        (fond.querySelector('img') as HTMLImageElement).alt = img.alt;
        fond.querySelector('p')!.textContent = legende;
        const fermer = () => { fond.remove(); document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
        const esc = (k: KeyboardEvent) => k.key === 'Escape' && fermer();
        fond.addEventListener('click', fermer);
        window.addEventListener('keydown', esc);
        document.body.style.overflow = 'hidden';
        document.body.appendChild(fond);
        return;
      }
      // Fonds : filtres de la bibliographie
      const puce = cible.closest<HTMLButtonElement>('.fonds .bib-tools .chip');
      if (puce) {
        puce.parentElement?.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === puce)));
        filtrerBibliographie();
        return;
      }
      const copie = cible.closest<HTMLButtonElement>('.fonds .cpy');
      if (copie) {
        const texte = copie.previousElementSibling?.textContent?.trim() ?? '';
        navigator.clipboard?.writeText(texte).then(() => {
          const avant = copie.textContent;
          copie.textContent = 'Copié ✓';
          window.setTimeout(() => (copie.textContent = avant), 1800);
        });
        return;
      }
      const bouton = cible.closest<HTMLElement>('[data-action]');
      if (bouton) {
        const a = bouton.dataset.action;
        if (a === 'recherche') setRecherche(true);
        if (a === 'menu') setMenu((v) => !v);
        if (a === 'langue') {
          const r = bouton.getBoundingClientRect();
          setPosLangue({ top: r.bottom + 6, right: window.innerWidth - r.right });
          setLangue((v) => !v);
        }
        return;
      }
      // Liens internes : navigation sans rechargement
      const lien = cible.closest('a');
      if (!lien || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (lien.target === '_blank' || lien.hasAttribute('download')) return;
      const href = lien.getAttribute('href') || '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      if (/\.(pdf|docx?|zip|jpe?g|png|mp3|mp4)$/i.test(href.split('?')[0]) || href.startsWith('/medias/') || href.startsWith('/revue/pdf') || href.startsWith('/keystatic') || href.startsWith('/admin') || href.startsWith('/api/')) return;
      if (lien.closest('[data-next-link]')) return;
      const [chemin, ancre] = href.split('#');
      if (chemin === window.location.pathname && ancre !== undefined) return; // ancre sur la même page
      e.preventDefault();
      router.push(href);
    };
    // Commande d'Eboussi Studies (Fonds Eboussi Boulaga) : total en direct et brouillon d'e-mail
    const totalCommande = (form: HTMLFormElement) => {
      const radios = form.querySelectorAll<HTMLInputElement>('input[name="fmt"]');
      const papier = radios[1]?.checked;
      const n = Math.max(1, Math.min(50, Number(form.querySelector<HTMLInputElement>('input[type="number"]')?.value) || 1));
      const devise = form.querySelector<HTMLSelectElement>('select')?.value ?? 'FCFA';
      const eur = (papier ? 10 : 5000 / 655.957) * n;
      const fcfa = (papier ? 10 * 655.957 : 5000) * n;
      const f = (x: number, d = 0) => x.toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d });
      const texte = devise === 'EUR' ? `${f(eur, 2)} € (${f(Math.round(fcfa))} FCFA)` : `${f(Math.round(fcfa))} FCFA (${f(eur, 2)} €)`;
      const b = form.querySelector('[aria-live] b');
      if (b) b.textContent = texte.split(' (')[0];
      const p = form.querySelector('[aria-live]');
      if (p && b && p.lastChild && p.lastChild !== b) p.lastChild.textContent = ` (${texte.split(' (')[1]}`;
      return { papier, n, texte };
    };
    const changeCommande = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el.closest('.fonds .bib-tools')) return filtrerBibliographie();
      const form = el.closest<HTMLFormElement>('.fonds form.o-form');
      if (form) totalCommande(form);
    };
    document.addEventListener('input', changeCommande);
    document.addEventListener('change', changeCommande);

    // Lettre d'information (formulaire d'origine de l'accueil)
    const envoi = async (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form.matches('.fonds form.o-form')) {
        e.preventDefault();
        const { papier, n, texte } = totalCommande(form);
        const champs = form.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="email"]');
        const nom = champs[0]?.value.trim() ?? '';
        const mail = champs[1]?.value.trim() ?? '';
        if (!nom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
          (nom ? champs[1] : champs[0])?.focus();
          return;
        }
        const corps = `Bonjour,\n\nJe souhaite commander Eboussi Studies n° 1 (« Reprise de soi et décolonisation des savoirs »).\n\nVersion : ${papier ? 'papier' : 'PDF intégral'}\nExemplaires : ${n}\nTotal indiqué : ${texte}${papier ? ' (hors frais d’envoi)' : ''}\n\nNom : ${nom}\nE-mail : ${mail}\n${papier ? '\nAdresse de livraison :\n\n' : ''}\nMerci.`;
        window.location.href = `mailto:fondseboussi@gmail.com?subject=${encodeURIComponent('Commande — Eboussi Studies n° 1')}&body=${encodeURIComponent(corps)}`;
        return;
      }
      const champEmail = form.querySelector<HTMLInputElement>('#nl-email, [data-newsletter] input[type="email"]') ?? (form.matches('[data-newsletter]') ? form.querySelector<HTMLInputElement>('input[type="email"]') : null);
      if (!champEmail) return;
      e.preventDefault();
      const bouton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const note = form.querySelector<HTMLElement>('[data-note]') ?? form.querySelector<HTMLElement>('p');
      const piege = form.querySelector<HTMLInputElement>('input.hidden, input[data-piege]');
      const email = champEmail.value.trim();
      if (bouton) bouton.disabled = true;
      const dire = (t: string, ok = true) => {
        if (note) { note.textContent = t; note.className = `${note.dataset.note !== undefined ? 'mt-2 text-xs' : 'mt-3 text-sm'} ${ok ? 'text-terra-deep font-semibold' : 'text-terra'}`; }
      };
      try {
        const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, site: piege?.value }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok) { dire('Merci ! Votre inscription est enregistrée.'); form.reset(); }
        else if (j.repli) {
          window.location.href = `mailto:philoafricaine@gmail.com?subject=${encodeURIComponent('Inscription à la lettre d’information')}&body=${encodeURIComponent(`Merci de m’inscrire à la lettre d’information du Groupe JOGOO : ${email}`)}`;
          dire('Votre messagerie s’ouvre pour confirmer l’inscription auprès de la rédaction.');
        } else dire(j.erreur || 'Inscription impossible pour le moment.', false);
      } catch { dire('Inscription impossible pour le moment.', false); }
      if (bouton) bouton.disabled = false;
    };
    document.addEventListener('click', clic);
    document.addEventListener('submit', envoi);
    return () => { document.removeEventListener('click', clic); document.removeEventListener('submit', envoi); document.removeEventListener('input', changeCommande); document.removeEventListener('change', changeCommande); };
  }, [router]);

  /* ——— À chaque page : lien actif, ombre de l'en-tête, apparitions, intro, compte à rebours ——— */
  useEffect(() => {
    setMenu(false);
    setLangue(false);
    setRecherche(false);

    // Lien actif dans la navigation principale (même rendu que l'original)
    const nav = document.querySelector('[data-nav]');
    nav?.querySelectorAll('a').forEach((a) => {
      const h = a.getAttribute('href') || '/';
      const actif = h === '/' ? pathname === '/' : pathname === h || pathname.startsWith(h + '/');
      a.querySelector('[data-souligne]')?.remove();
      a.classList.toggle('text-terra', actif);
      a.classList.toggle('text-ink', !actif);
      if (actif) {
        a.setAttribute('aria-current', 'page');
        const s = document.createElement('span');
        s.dataset.souligne = '';
        s.setAttribute('aria-hidden', 'true');
        s.className = 'absolute inset-x-2.5 -bottom-0.5 h-0.5 bg-terra';
        a.appendChild(s);
      } else a.removeAttribute('aria-current');
    });

    // Ombre de l'en-tête au défilement
    const entete = document.querySelector('[data-entete]');
    const defile = () => entete?.classList.toggle('defile', window.scrollY > 8);
    defile();
    window.addEventListener('scroll', defile, { passive: true });

    // Apparition douce des blocs
    const blocs = Array.from(document.querySelectorAll<HTMLElement>('main section, main figure.relative, main article > *, main [data-revele]'))
      .filter((el) => !el.closest('[data-loader]') && el.getBoundingClientRect().top > window.innerHeight * 0.9);
    blocs.forEach((el) => el.setAttribute('data-revele', ''));
    const obs = new IntersectionObserver(
      (es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('vu'); obs.unobserve(en.target); } }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    blocs.forEach((el) => obs.observe(el));

    // Intro animée (accueil, une fois par session)
    const loader = document.querySelector<HTMLElement>('[data-loader]');
    let t1: number | undefined, t2: number | undefined, t3: number | undefined;
    if (loader && !document.documentElement.classList.contains('intro-vue')) {
      document.body.style.overflow = 'hidden';
      const passer = loader.querySelector<HTMLElement>('span[aria-hidden="true"].relative');
      t3 = window.setTimeout(() => passer?.classList.replace('opacity-0', 'opacity-100'), 1400);
      const fermer = () => {
        if (loader.dataset.ferme) return;
        loader.dataset.ferme = '1';
        try { sessionStorage.setItem('jogoo-intro', '1'); } catch {}
        loader.classList.replace('opacity-100', 'opacity-0');
        loader.style.pointerEvents = 'none';
        document.body.style.overflow = '';
        t2 = window.setTimeout(() => { loader.style.display = 'none'; document.documentElement.classList.add('intro-vue'); }, 450);
      };
      loader.addEventListener('click', fermer);
      const touche = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') fermer(); };
      window.addEventListener('keydown', touche, { once: true });
      t1 = window.setTimeout(fermer, 4700);
    }

    // Compte à rebours (bloc colloque de l'accueil)
    const compte = document.querySelector<HTMLElement>('[data-compte]');
    let tick: number | undefined;
    if (compte) {
      const cible = new Date(compte.dataset.compte!).getTime();
      const titre = compte.previousElementSibling as HTMLElement | null;
      const cell = (n: number, l: string) =>
        `<span class="flex flex-col items-center"><span class="tabular-nums display-title text-4xl leading-none sm:text-5xl">${String(n).padStart(2, '0')}</span><span class="mt-1 font-brand text-[0.6rem] font-semibold uppercase tracking-[0.14em]">${l}</span></span>`;
      const maj = () => {
        const r = cible - Date.now();
        if (r <= 0) {
          if (titre) titre.textContent = 'Colloque tenu';
          compte.innerHTML = `<span class="flex flex-col"><span class="display-title text-3xl leading-none text-paper sm:text-4xl">12 – 14 oct.</span><span class="mt-2 font-brand text-[0.6rem] font-semibold uppercase tracking-[0.14em]">2026 · Actes en préparation</span></span>`;
          compte.classList.remove('h-[4.25rem]');
          window.clearInterval(tick);
          return;
        }
        const j = Math.floor(r / 864e5), h = Math.floor((r % 864e5) / 36e5), m = Math.floor((r % 36e5) / 6e4), s = Math.floor((r % 6e4) / 1e3);
        compte.innerHTML = `<span class="flex gap-5">${cell(j, 'jours')}${cell(h, 'heures')}${cell(m, 'min')}${cell(s, 's')}</span>`;
      };
      maj();
      tick = window.setInterval(maj, 1000);
    }

    // Retour en haut de page lors d'un changement de page (sauf ancre)
    if (!window.location.hash) window.scrollTo({ top: 0 });

    return () => {
      window.removeEventListener('scroll', defile);
      obs.disconnect();
      [t1, t2, t3].forEach((t) => t && window.clearTimeout(t));
      if (tick) window.clearInterval(tick);
      document.body.style.overflow = '';
    };
  }, [pathname]);

  /* ——— Recherche ——— */
  useEffect(() => {
    if (!recherche) return;
    setTimeout(() => champ.current?.focus(), 30);
    if (!index) fetch('/api/recherche').then((r) => r.json()).then(setIndex).catch(() => setIndex([]));
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setRecherche(false);
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [recherche, index]);

  const resultats = useMemo(() => {
    const mots = sansAccents(q).split(/\s+/).filter((m) => m.length > 1);
    if (!index || !mots.length) return [];
    return index
      .map((it) => {
        const t = sansAccents(it.t), x = sansAccents(it.x);
        let score = 0;
        for (const m of mots) {
          if (t.includes(m)) score += 5;
          else if (x.includes(m)) score += 1;
          else return null;
        }
        return { it, score };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 30)
      .map((r) => r!.it);
  }, [q, index]);

  const choisirLangue = useCallback((code: string) => {
    const d = window.location.hostname;
    const expire = code === 'fr' ? 'expires=Thu, 01 Jan 1970 00:00:00 GMT;' : '';
    const val = code === 'fr' ? '' : `/fr/${code}`;
    document.cookie = `googtrans=${val};${expire}path=/`;
    document.cookie = `googtrans=${val};${expire}path=/;domain=${d}`;
    document.cookie = `googtrans=${val};${expire}path=/;domain=.${d.replace(/^www\./, '')}`;
    window.location.reload();
  }, []);

  // Code de langue affiché dans le bouton d'origine
  useEffect(() => {
    const b = document.querySelector('[data-action="langue"]');
    if (!b) return;
    const txt = Array.from(b.childNodes).find((n) => n.nodeType === 3 && n.textContent!.trim());
    if (txt) txt.textContent = lang.toUpperCase();
    b.setAttribute('aria-expanded', String(langue));
    document.querySelector('[data-action="menu"]')?.setAttribute('aria-expanded', String(menu));
    const icone = document.querySelector('[data-action="menu"] span');
    if (icone) icone.textContent = menu ? '✕' : '☰';
  }, [lang, langue, menu]);

  return (
    <>
      {/* Menu mobile */}
      <div
        className={`fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto bg-paper transition-all duration-300 lg:hidden ${menu ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2'}`}
        aria-hidden={!menu}
      >
        <nav aria-label="Menu" className="mx-auto max-w-6xl border-t border-ink/10 px-5 pb-10 pt-2">
          {NAV.map(([h, l], i) => {
            const actif = h === '/' ? pathname === '/' : pathname === h || pathname.startsWith(h + '/');
            return (
              <a
                key={h}
                href={h}
                style={{ transitionDelay: menu ? `${i * 30}ms` : '0ms' }}
                className={`flex items-center justify-between border-b border-ink/10 py-3.5 font-brand text-[1.05rem] font-semibold transition-all duration-300 ${menu ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'} ${actif ? 'text-terra' : 'text-ink hover:text-terra'}`}
              >
                {l}
                <span aria-hidden="true" className="text-terra">→</span>
              </a>
            );
          })}
          <p className="kicker mt-8">Les sous-sites</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {[
              ['/sous-sites/revue-jogoo', 'Revue JOGOO'],
              ['/sous-sites/editions-jogoo', 'Éditions JOGOO'],
              ['/sous-sites/fonds-eboussi-boulaga', 'Fonds Eboussi Boulaga'],
              ['/sous-sites/jogoo-ai', 'JOGOO AI'],
              ['/sous-sites/sankofa-communications', 'Sankofa'],
              ['/sous-sites/philo-africaine-magazine', 'Philo Africaine Magazine'],
            ].map(([h, l]) => (
              <a key={h} href={h} className="border border-ink/12 bg-white px-3 py-2.5 font-medium text-ink hover:border-terra hover:text-terra">
                {l}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Choix de la langue */}
      {langue && posLangue && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setLangue(false)} />
          <ul
            role="listbox"
            aria-label="Langue du site"
            className="flash-fade fixed z-[61] min-w-44 border border-ink/15 bg-paper py-1 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.4)]"
            style={{ top: posLangue.top, right: posLangue.right }}
          >
            {LANGUES.map(([c, l]) => (
              <li key={c} role="option" aria-selected={lang === c}>
                <button
                  type="button"
                  onClick={() => choisirLangue(c)}
                  className={`flex w-full items-center justify-between gap-6 px-4 py-2 text-left text-sm transition-colors hover:bg-cream ${lang === c ? 'font-semibold text-terra' : 'text-ink'}`}
                >
                  <span dir={c === 'ar' ? 'rtl' : undefined}>{l}</span>
                  <span className="font-brand text-[0.65rem] font-semibold uppercase tracking-wide text-ink/45">{c}</span>
                </button>
              </li>
            ))}
            <li className="border-t border-ink/10 px-4 pb-1 pt-2 text-[0.68rem] leading-snug text-ink/45">Traduction automatique</li>
            <li className="border-t border-ink/10">
              <a href="/en" hrefLang="en" className="flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left text-sm font-semibold text-terra-deep hover:bg-cream">
                <span>English edition</span>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          </ul>
        </>
      )}

      {/* Recherche plein écran */}
      {recherche && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-ink/60 backdrop-blur-sm" onClick={() => setRecherche(false)} role="dialog" aria-modal="true" aria-label="Recherche">
          <div className="flash-fade bg-paper shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 text-terra">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={champ}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Rechercher un édito, un auteur, une actualité…"
                className="h-12 flex-1 bg-transparent font-brand text-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink/40"
                aria-label="Rechercher sur le site"
              />
              <button type="button" onClick={() => setRecherche(false)} className="inline-flex h-10 w-10 items-center justify-center border border-ink/15 text-ink hover:border-terra hover:text-terra" aria-label="Fermer la recherche">
                ✕
              </button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-5 pb-10" onClick={(e) => e.target === e.currentTarget && setRecherche(false)}>
            {q.trim().length > 1 && (
              <div className="flash-fade mt-4 border border-ink/12 bg-paper">
                {index === null ? (
                  <p className="px-5 py-4 text-sm text-ink-soft">Chargement…</p>
                ) : resultats.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-ink-soft">Aucun résultat pour « {q} ».</p>
                ) : (
                  <ul className="divide-y divide-ink/10">
                    {resultats.map((r) => (
                      <li key={r.u}>
                        <a href={r.u} className="group block px-5 py-3.5 hover:bg-cream/60">
                          <span className="kicker">{r.k}</span>
                          <span className="mt-0.5 block font-brand text-[0.95rem] font-bold leading-snug text-ink group-hover:text-terra">{r.t}</span>
                          {r.x && <span className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{r.x}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

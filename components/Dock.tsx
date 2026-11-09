'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Assistant } from '@/components/Assistant';

/* Barre flottante présente sur tout le site : JOGOO AI, page Facebook, lettre d'information, partage.
   À droite sur grand écran, en bas sur mobile. */

const FACEBOOK = 'https://www.facebook.com/Philosophie-africaine-D%C3%A9bats-et-questions-169580879726591/';
const EMAIL = 'philoafricaine@gmail.com';
type Panneau = 'ia' | 'facebook' | 'lettre' | 'partage' | null;

const Ico = ({ d, fill = false, size = 20 }: { d: string; fill?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke={fill ? undefined : 'currentColor'} strokeWidth={fill ? undefined : 1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const I = {
  fb: 'M14 8.5h2.2V5.2C15.8 5.1 14.7 5 13.6 5 11 5 9.3 6.6 9.3 9.4V12H6.3v3.5h3v8.5h3.6v-8.5h2.9l.5-3.5h-3.4V9.8c0-1 .3-1.7 1.8-1.7Z',
  lettre: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm.5 1.5L12 13l7.5-5.5',
  partage: 'M18 8a3 3 0 1 0-2.8-4M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  x: 'M17.5 5h2.9l-6.4 7.3L21.6 24h-5.9l-4.6-6-5.3 6H2.9l6.9-7.8L2.6 5h6l4.2 5.5L17.5 5Z',
  wa: 'M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Zm4.9 12.4c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.7-4.2-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.2.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.2.5.4.1.1.1.7-.1 1.3Z',
  li: 'M8 10.5v10H5v-10h3ZM6.5 5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM11 10.5h2.9v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.1 3.9 4.9v5.4h-3v-4.8c0-1.1 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.6v4.8H11v-10Z',
  tg: 'M22 4 2.5 11.5c-.9.3-.9 1.5.1 1.8l4.8 1.5 1.8 5.6c.2.6.9.7 1.3.3l2.6-2.5 4.9 3.6c.6.4 1.4 0 1.5-.7L23 5.2c.2-.9-.6-1.6-1-1.2Z',
  lien: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
};

export function Dock() {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState<Panneau>(null);
  const [url, setUrl] = useState('');
  const [titre, setTitre] = useState('');
  const [copie, setCopie] = useState(false);
  const [email, setEmail] = useState('');
  const [etat, setEtat] = useState('');
  const surAI = pathname.startsWith('/sous-sites/jogoo-ai');

  useEffect(() => {
    setOuvert(null);
    setUrl(window.location.href.replace(/^https?:\/\/[^/]+/, 'https://www.philoafricaine.org'));
    setTitre(document.title);
  }, [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const basculer = (p: Panneau) => setOuvert((o) => (o === p ? null : p));

  const inscrire = async (e: React.FormEvent) => {
    e.preventDefault();
    setEtat('envoi');
    const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) {
      setEtat('Merci ! Votre inscription est enregistrée.');
      setEmail('');
    } else if (j.repli) {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Inscription à la lettre d’information')}&body=${encodeURIComponent(`Merci de m’inscrire à la lettre d’information du Groupe JOGOO : ${email}`)}`;
      setEtat('Votre messagerie s’ouvre pour confirmer l’inscription.');
    } else setEtat(j.erreur || 'Inscription impossible pour le moment.');
  };

  const partagerNatif = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: titre, url });
        return;
      } catch {}
    }
    basculer('partage');
  };

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {}
  };

  const boutons: { id: Panneau; libelle: string; icone: React.ReactNode; action?: () => void; masque?: boolean }[] = [
    {
      id: 'ia',
      libelle: 'Discuter avec JOGOO AI',
      icone: <img src="/medias/site/jogoo/picto-jogoo-ai.png" alt="" className="h-8 w-8 object-contain" />,
      masque: surAI,
    },
    { id: 'facebook', libelle: 'Notre page Facebook', icone: <Ico d={I.fb} fill /> },
    { id: 'lettre', libelle: 'Lettre d’information', icone: <Ico d={I.lettre} /> },
    { id: 'partage', libelle: 'Partager cette page', icone: <Ico d={I.partage} />, action: partagerNatif },
  ];

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(titre);
  const reseaux: [string, string, string, boolean?][] = [
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`, I.fb, true],
    ['X', `https://x.com/intent/tweet?text=${t}&url=${u}`, I.x, true],
    ['WhatsApp', `https://api.whatsapp.com/send?text=${encodeURIComponent(`${titre} ${url}`)}`, I.wa, true],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, I.li, true],
    ['Telegram', `https://t.me/share/url?url=${u}&text=${t}`, I.tg, true],
    ['E-mail', `mailto:?subject=${t}&body=${u}`, I.lettre],
  ];

  return (
    <div className="print:hidden">
      {/* Panneau */}
      {ouvert && (
        <>
          <div className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-[2px] lg:bg-transparent lg:backdrop-blur-0" onClick={() => setOuvert(null)} />
          <div
            role="dialog"
            aria-label={boutons.find((b) => b.id === ouvert)?.libelle}
            className={`flash-fade fixed inset-x-0 bottom-16 z-[75] mx-auto flex max-h-[78vh] w-full flex-col overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:inset-x-auto sm:right-4 sm:w-[380px] lg:bottom-auto lg:right-20 lg:top-1/2 lg:-translate-y-1/2 ${ouvert === 'ia' ? 'h-[70vh] lg:h-[600px]' : ''}`}
          >
            <div className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-paper">
              <p className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-gold">{boutons.find((b) => b.id === ouvert)?.libelle}</p>
              <div className="flex items-center gap-1">
                {ouvert === 'ia' && (
                  <a href="/sous-sites/jogoo-ai/interroger" className="px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-paper/70 hover:text-gold">
                    Plein écran ↗
                  </a>
                )}
                <button type="button" onClick={() => setOuvert(null)} className="flex h-8 w-8 items-center justify-center text-paper/80 hover:text-gold" aria-label="Fermer">
                  ✕
                </button>
              </div>
            </div>
            {ouvert === 'ia' && (
              <div className="min-h-0 flex-1">
                <Assistant email={EMAIL} variante="compact" />
              </div>
            )}
            {ouvert === 'facebook' && (
              <div className="flex flex-col items-center gap-3 p-4">
                <iframe
                  title="Page Facebook du Groupe JOGOO"
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FACEBOOK)}&tabs=timeline&width=340&height=440&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                  width="340"
                  height="440"
                  className="max-w-full border-0 bg-paper"
                  loading="lazy"
                  allow="encrypted-media; clipboard-write; web-share"
                />
                <a href={FACEBOOK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#1877f2] px-4 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#0f5fc9]">
                  <Ico d={I.fb} fill size={16} /> Suivre la page
                </a>
              </div>
            )}
            {ouvert === 'lettre' && (
              <form onSubmit={inscrire} className="p-5">
                <p className="font-serif text-xl font-bold leading-snug text-ink">Recevez les éditos, les actualités et les appels du Groupe JOGOO.</p>
                <div className="mt-5 flex">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse e-mail"
                    aria-label="Votre adresse e-mail"
                    className="h-12 min-w-0 flex-1 bg-cream px-4 text-sm outline-none focus:ring-2 focus:ring-gold"
                  />
                  <button type="submit" disabled={etat === 'envoi'} className="h-12 shrink-0 bg-terra px-5 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-terra-deep disabled:opacity-50">
                    S’inscrire
                  </button>
                </div>
                <p className="mt-3 text-sm text-terra-deep">{etat && etat !== 'envoi' ? etat : ''}</p>
                <p className="mt-1 text-xs text-ink/45">Gratuit, sans compte. Votre adresse ne sert qu’à l’envoi de la lettre.</p>
              </form>
            )}
            {ouvert === 'partage' && (
              <div className="p-5">
                <p className="line-clamp-2 font-serif text-lg font-bold leading-snug text-ink">{titre}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {reseaux.map(([nom, href, d, fill]) => (
                    <a key={nom} href={href} target={nom === 'E-mail' ? undefined : '_blank'} rel="noreferrer" className="flex flex-col items-center gap-1.5 bg-cream px-2 py-3 text-xs font-semibold text-ink transition-colors hover:bg-terra hover:text-white">
                      <Ico d={d} fill={fill} />
                      {nom}
                    </a>
                  ))}
                </div>
                <button type="button" onClick={copier} className={`mt-3 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${copie ? 'bg-terra text-white' : 'bg-ink text-paper hover:bg-terra'}`}>
                  <Ico d={I.lien} size={16} />
                  {copie ? 'Lien copié ✓' : 'Copier le lien'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Barre */}
      <nav
        aria-label="Raccourcis"
        className="fixed bottom-3 left-1/2 z-[72] flex -translate-x-1/2 gap-1.5 bg-ink/90 p-1.5 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md lg:bottom-auto lg:left-auto lg:right-3 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:flex-col"
      >
        {boutons
          .filter((b) => !b.masque)
          .map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={b.action ?? (() => basculer(b.id))}
              aria-label={b.libelle}
              aria-expanded={ouvert === b.id}
              title={b.libelle}
              className={`group relative flex h-11 w-11 items-center justify-center transition-colors ${ouvert === b.id ? 'bg-gold text-ink' : 'text-paper hover:bg-white/10 hover:text-gold'} ${b.id === 'ia' ? 'bg-paper hover:bg-paper' : ''}`}
            >
              {b.icone}
              {b.id === 'ia' && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-gold ring-2 ring-ink" aria-hidden="true" />}
              <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap bg-ink px-2.5 py-1 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100 lg:block">{b.libelle}</span>
            </button>
          ))}
      </nav>
    </div>
  );
}

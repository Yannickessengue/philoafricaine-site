'use client';

import { useState } from 'react';

const I = {
  com: 'M13 3C7 3 2.5 6.8 2.5 11.5c0 2.5 1.3 4.7 3.4 6.3-.2 1.3-.8 2.6-1.7 3.6a.6.6 0 0 0 .5 1c2.1-.3 3.9-1.1 5.3-2.1.6.1 1.3.2 2 .2 6 0 10.5-3.8 10.5-8.5S19 3 13 3Z',
  fb: 'M14 8.5h2.2V5.2C15.8 5.1 14.7 5 13.6 5 11 5 9.3 6.6 9.3 9.4V12H6.3v3.5h3v8.5h3.6v-8.5h2.9l.5-3.5h-3.4V9.8c0-1 .3-1.7 1.8-1.7Z',
  x: 'M17.5 5h2.9l-6.4 7.3L21.6 24h-5.9l-4.6-6-5.3 6H2.9l6.9-7.8L2.6 5h6l4.2 5.5L17.5 5Z',
  wa: 'M13 4a9 9 0 0 0-7.7 13.6L4 24l6.6-1.7A9 9 0 1 0 13 4Zm4.9 12.4c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.3-.9-2.8-1.2-4.5-4-4.7-4.2-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.2.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.2.5.4.1.1.1.7-.1 1.3Z',
  li: 'M8 10.5v10H5v-10h3ZM6.5 5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM11 10.5h2.9v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.1 3.9 4.9v5.4h-3v-4.8c0-1.1 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.6v4.8H11v-10Z',
  tg: 'M22 4 2.5 11.5c-.9.3-.9 1.5.1 1.8l4.8 1.5 1.8 5.6c.2.6.9.7 1.3.3l2.6-2.5 4.9 3.6c.6.4 1.4 0 1.5-.7L23 5.2c.2-.9-.6-1.6-1-1.2ZM9.6 14.3l8.6-5.3-7 6.5-.3 3.3-1.3-4.5Z',
  mail: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm.5 2 7.5 5 7.5-5',
};
const Ic = ({ d, fill = true }: { d: string; fill?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 26 26" fill={fill ? 'currentColor' : 'none'} stroke={fill ? undefined : 'currentColor'} strokeWidth={fill ? undefined : 1.8} aria-hidden="true">
    <path d={d} />
  </svg>
);

/** Barre de partage de l'original : commentaire, réseaux, copie du message, version PDF. */
export function Partage({
  url,
  titre,
  accroche,
  hashtags = [],
  pdf,
  commentaires = true,
  className = '',
}: {
  url: string;
  titre: string;
  accroche?: string;
  hashtags?: string[];
  pdf?: string | null;
  commentaires?: boolean;
  className?: string;
}) {
  const [copie, setCopie] = useState(false);
  const tags = hashtags.map((h) => '#' + h.replace(/\s+/g, '')).join(' ');
  const message = [titre, accroche, tags, url].filter(Boolean).join('\n\n');
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(titre);
  const m = encodeURIComponent(message);
  const bouton = 'inline-flex h-9 w-9 items-center justify-center border border-ink/15 text-ink/70 transition-colors hover:border-terra hover:bg-terra hover:text-white';
  const liens: [string, string, string, boolean?][] = [
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`, I.fb],
    ['X', `https://x.com/intent/tweet?text=${encodeURIComponent((accroche ? accroche.slice(0, 200) + '… ' : titre + ' ') + tags)}&url=${u}`, I.x],
    ['WhatsApp', `https://api.whatsapp.com/send?text=${m}`, I.wa],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, I.li],
    ['Telegram', `https://t.me/share/url?url=${u}&text=${t}`, I.tg],
    ['Email', `mailto:?subject=${t}&body=${m}`, I.mail, false],
  ];
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const z = document.createElement('textarea');
      z.value = message;
      document.body.appendChild(z);
      z.select();
      document.execCommand('copy');
      z.remove();
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 2200);
  };
  return (
    <div className={`flex flex-wrap items-center gap-2 print:hidden ${className}`}>
      <span className="kicker mr-1">Partager</span>
      {commentaires && (
        <a className="inline-flex h-9 items-center gap-1.5 bg-terra px-3 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-terra-deep" href="#commentaires">
          <Ic d={I.com} />
          Commentaire
        </a>
      )}
      {liens.map(([nom, href, d, fill]) => (
        <a key={nom} aria-label={`Partager sur ${nom}`} className={bouton} href={href} target={nom === 'Email' ? undefined : '_blank'} rel="noreferrer">
          <Ic d={d} fill={fill !== false} />
        </a>
      ))}
      <button
        type="button"
        onClick={copier}
        title="Copier le texte complet avec les hashtags et le lien (pour Instagram, un groupe, etc.)"
        className={`h-9 border px-3 text-xs font-semibold uppercase tracking-wide transition-colors ${copie ? 'border-terra bg-terra text-white' : 'border-ink/15 text-ink/70 hover:border-terra hover:text-terra'}`}
      >
        {copie ? 'Message copié ✓' : 'Copier le message'}
      </button>
      {pdf !== undefined && (
        <a
          className="inline-flex h-9 items-center bg-ink px-3 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra"
          href={pdf || '#'}
          onClick={pdf ? undefined : (e) => { e.preventDefault(); window.print(); }}
          target={pdf ? '_blank' : undefined}
          rel="noreferrer"
        >
          Version PDF
        </a>
      )}
    </div>
  );
}

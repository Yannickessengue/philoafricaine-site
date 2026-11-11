import type { Metadata } from 'next';
import { BandeauCookies } from '@/components/Consentement';
import { partage } from '@/lib/apercu';

export const metadata: Metadata = {
  title: { default: 'Groupe JOGOO · African philosophy. Debates & questions', template: '%s · Groupe JOGOO' },
  description: 'Groupe JOGOO: a research network on African philosophy — journals, publishing house, archives, podcasts and an AI research assistant.',
  alternates: { languages: { fr: '/', en: '/en' } },
  ...partage('African philosophy. Debates & questions', 'Journals, publishing, archives, podcasts and an AI research assistant.', 'Groupe JOGOO · English', null, null, 'website'),
};

const NAV: [string, string][] = [
  ['/en', 'Home'],
  ['/en/about', 'About'],
  ['/en#sub-sites', 'Our projects'],
  ['/en/contribute', 'Contribute'],
  ['/podcasts', 'Podcasts'],
  ['/sous-sites/jogoo-ai', 'JOGOO AI'],
];

/** English section: its own header and footer, same visual identity as the French site. */
export default function LayoutAnglais({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <a href="/en" className="shrink-0" aria-label="Groupe JOGOO — home">
            <img src="/medias/site/jogoo/icone-jogoo.png" alt="" className="h-10 w-auto" />
          </a>
          <nav aria-label="Main" className="hidden flex-1 justify-center gap-6 lg:flex">
            {NAV.map(([h, t]) => (
              <a key={h} href={h} className="font-brand text-[0.92rem] font-semibold text-ink hover:text-terra">
                {t}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden font-brand text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink/40 sm:inline">Language</span>
            <span className="border border-ink/15 bg-ink px-2.5 py-1.5 font-brand text-[0.7rem] font-bold uppercase text-paper">EN</span>
            <a href="/" hrefLang="fr" className="border border-ink/15 px-2.5 py-1.5 font-brand text-[0.7rem] font-bold uppercase text-ink hover:border-terra hover:text-terra">
              FR
            </a>
          </div>
        </div>
        <nav aria-label="Main (mobile)" className="flex gap-5 overflow-x-auto border-t border-ink/10 px-5 py-2 lg:hidden [scrollbar-width:none]">
          {NAV.map(([h, t]) => (
            <a key={h} href={h} className="shrink-0 font-brand text-[0.8rem] font-semibold text-ink hover:text-terra">
              {t}
            </a>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t-2 border-gold bg-ink text-paper/75">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img src="/medias/site/jogoo/logo-jogoo-blanc.png" alt="Groupe JOGOO" className="h-11 w-auto" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Registered association under Cameroonian law (no. 00000423/RDA/JO6/BAPP, 15 March 2023), “Association of the Philosophers of the Rooster’s Crow”.
            </p>
          </div>
          <div>
            <p className="font-brand text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.slice(1).map(([h, t]) => (
                <li key={h}>
                  <a href={h} className="hover:text-gold">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-brand text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold">Contact</p>
            <p className="mt-4 text-sm">
              <a href="mailto:philoafricaine@gmail.com" className="hover:text-gold">
                philoafricaine@gmail.com
              </a>
            </p>
            <p className="mt-2 text-sm">
              <a href="https://www.facebook.com/Philosophie-africaine-D%C3%A9bats-et-questions-169580879726591/" target="_blank" rel="noreferrer" className="hover:text-gold">
                Facebook ↗︎
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs">
            <p>© Groupe JOGOO, African philosophy. Debates &amp; questions. Content under CC BY-NC-ND 3.0 FR unless stated otherwise.</p>
            <div className="flex gap-5 uppercase tracking-wide">
              <a href="/mentions-legales" className="hover:text-gold">
                Legal notice (FR)
              </a>
              <button type="button" data-action="cookies" className="uppercase tracking-wide hover:text-gold">
                Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>
      <BandeauCookies en />
    </div>
  );
}

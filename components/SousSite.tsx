import type { ReactNode } from 'react';

/* Gabarit commun aux sous-sites Philo Africaine Magazine, Éditions JOGOO et Sankofa Communications :
   bandeau propre (logo, devise, onglets, bouton principal), blocs de contenu, pied de sous-site.
   Les classes sont écrites en entier pour que Tailwind les génère. */

export type Theme = {
  bandeau: string; // fond + texte du bandeau
  bandeauLigne: string; // filet du bandeau
  surBandeau: string; // petite barre supérieure
  onglet: string; // onglet inactif
  ongletActif: string; // onglet actif
  bouton: string; // bouton principal
  boutonSecond: string; // bouton secondaire
  accent: string; // couleur de texte d'accent
  accentFond: string; // fond d'accent (pastilles)
  filet: string; // bordure d'accent
  carteHover: string; // survol des cartes
  kicker: string; // sur-titres
  titre: string; // police/couleur des grands titres
  fondDoux: string; // sections alternées
  pied: string; // pied du sous-site
  piedAccent: string;
};

export type Site = {
  base: string;
  nom: string;
  devise: string;
  logo: string;
  logoAlt: string;
  logoClasse: string;
  nomVisible?: string; // classes du nom écrit à côté du logo (facultatif)
  mention: string;
  onglets: [string, string][]; // [slug relatif, libellé]
  cta: [string, string]; // [href, libellé]
  email: string;
  theme: Theme;
  pied: { titre: string; liens: [string, string][] }[];
};

export function Bandeau({ site, actif }: { site: Site; actif: string }) {
  const t = site.theme;
  return (
    <header className={`border-b ${t.bandeau} ${t.bandeauLigne}`}>
      <div className={t.surBandeau}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-1.5">
          <p className="font-brand text-[0.66rem] font-semibold uppercase tracking-[0.16em] opacity-85">{site.mention}</p>
          <a className="group inline-flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] opacity-70 transition-opacity hover:opacity-100" href="/">
            Portail du Groupe JOGOO
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              ↗︎
            </span>
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-6 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <a className="flex items-center gap-5" href={site.base}>
            <img alt={site.logoAlt} src={site.logo} className={`w-auto shrink-0 ${site.logoClasse}`} />
            {site.nomVisible && <span className={site.nomVisible}>{site.nom}</span>}
            <span className="hidden min-w-0 border-l border-current/15 pl-5 md:block">
              <span className="block font-serif text-[0.95rem] italic leading-snug opacity-75">{site.devise}</span>
            </span>
          </a>
          <a className={`inline-flex w-fit shrink-0 items-center gap-2 px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.12em] transition-colors ${t.bouton}`} href={site.cta[0]}>
            {site.cta[1]}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <nav aria-label={`Sections — ${site.nom}`} className="border-t border-current/10">
        <ul className="mx-auto flex max-w-6xl gap-x-6 overflow-x-auto px-6 [scrollbar-width:none]">
          {site.onglets.map(([slug, libelle]) => {
            const href = slug ? `${site.base}/${slug}` : site.base;
            const on = slug === actif;
            return (
              <li key={slug} className="shrink-0">
                <a
                  href={href}
                  aria-current={on ? 'page' : undefined}
                  className={`block border-b-2 py-3 font-brand text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors ${on ? t.ongletActif : `border-transparent ${t.onglet}`}`}
                >
                  {libelle}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export function Pied({ site }: { site: Site }) {
  const t = site.theme;
  return (
    <section className={t.pied}>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {site.pied.map((c) => (
          <div key={c.titre}>
            <p className={`font-brand text-[0.7rem] font-bold uppercase tracking-[0.14em] ${t.piedAccent}`}>{c.titre}</p>
            <ul className="mt-3 space-y-1.5 text-sm opacity-85">
              {c.liens.map(([href, l]) => (
                <li key={l}>
                  {href ? (
                    <a className="hover:underline" href={href}>
                      {l}
                    </a>
                  ) : (
                    l
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ——— Blocs de contenu ——— */

export function Ouverture({ site, kicker, titre, chapeau, children }: { site: Site; kicker: string; titre: string; chapeau?: string; children?: ReactNode }) {
  const t = site.theme;
  return (
    <section className={`border-b border-ink/10 ${t.fondDoux}`}>
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <p className={`kicker ${t.kicker}`}>{kicker}</p>
        <h1 className={`mt-3 max-w-4xl text-[2.1rem] leading-[1.02] sm:text-5xl ${t.titre}`}>{titre}</h1>
        {chapeau && <p className="mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-ink/80">{chapeau}</p>}
        {children}
      </div>
    </section>
  );
}

export function Section({ site, kicker, titre, children, doux = false, id }: { site: Site; kicker?: string; titre?: string; children: ReactNode; doux?: boolean; id?: string }) {
  const t = site.theme;
  return (
    <section id={id} className={`scroll-mt-24 ${doux ? t.fondDoux : ''}`}>
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
        {kicker && <p className={`kicker ${t.kicker}`}>{kicker}</p>}
        {titre && <h2 className={`mt-2 text-2xl leading-tight sm:text-3xl ${t.titre}`}>{titre}</h2>}
        <div className={titre || kicker ? 'mt-6' : ''}>{children}</div>
      </div>
    </section>
  );
}

export function Texte({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-3xl space-y-4 text-[1.02rem] leading-relaxed text-ink-soft ${className}`}>{children}</div>;
}

export function Boutons({ site, liens }: { site: Site; liens: [string, string, boolean?][] }) {
  const t = site.theme;
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {liens.map(([href, l, second]) => (
        <a
          key={l}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
          className={`inline-flex items-center gap-2 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] transition-colors ${second ? t.boutonSecond : t.bouton}`}
        >
          {l}
          <span aria-hidden="true">→</span>
        </a>
      ))}
    </div>
  );
}

export type Carte = { surtitre?: string; titre: string; texte?: string; href?: string; image?: string; numero?: string };

export function Cartes({ site, items, colonnes = 3 }: { site: Site; items: Carte[]; colonnes?: 2 | 3 | 4 }) {
  const t = site.theme;
  const grille = colonnes === 2 ? 'sm:grid-cols-2' : colonnes === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid gap-4 ${grille}`}>
      {items.map((c) => {
        const corps = (
          <>
            {c.image && (
              <span className="cadre -mx-6 -mt-6 mb-5 block aspect-[16/10]">
                <img alt="" src={c.image} loading="lazy" className="transition duration-500 group-hover:scale-[1.03]" />
              </span>
            )}
            {c.numero && <span className={`font-serif text-2xl leading-none ${t.accent} opacity-60`}>{c.numero}</span>}
            {c.surtitre && <p className={`kicker ${c.numero ? 'mt-3' : ''} ${t.kicker}`}>{c.surtitre}</p>}
            <h3 className={`mt-1.5 font-brand text-[1.02rem] font-bold leading-snug text-ink ${c.href ? 'group-hover:underline' : ''}`}>{c.titre}</h3>
            {c.texte && <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-soft">{c.texte}</p>}
            {c.href && <span className={`mt-auto pt-4 text-sm font-semibold ${t.accent}`}>Lire →</span>}
          </>
        );
        const cls = `group flex flex-col overflow-hidden border border-ink/12 bg-white p-6 transition-colors ${c.href ? t.carteHover : ''}`;
        return c.href ? (
          <a key={c.titre} href={c.href} className={cls}>
            {corps}
          </a>
        ) : (
          <div key={c.titre} className={cls}>
            {corps}
          </div>
        );
      })}
    </div>
  );
}

export function Repere({ site, date, titre, texte, href }: { site: Site; date: string; titre: string; texte: string; href?: string }) {
  const t = site.theme;
  const Tag = href ? 'a' : 'div';
  return (
    <Tag href={href} className={`group flex gap-5 border-l-2 bg-white py-4 pl-5 pr-4 ${t.filet}`}>
      <span className="min-w-0">
        <span className={`block font-brand text-[0.7rem] font-bold uppercase tracking-[0.12em] ${t.accent}`}>{date}</span>
        <span className={`mt-1 block font-brand font-bold leading-snug text-ink ${href ? 'group-hover:underline' : ''}`}>{titre}</span>
        <span className="mt-1 block text-[0.93rem] leading-relaxed text-ink-soft">{texte}</span>
      </span>
    </Tag>
  );
}

export function Contact({ site, texte, whatsapp }: { site: Site; texte: string; whatsapp?: boolean }) {
  const t = site.theme;
  return (
    <div className={`mx-auto max-w-6xl px-6 pb-14`}>
      <div className={`flex flex-col gap-4 border p-6 sm:flex-row sm:items-center sm:justify-between ${t.filet} ${t.fondDoux}`}>
        <p className="text-sm leading-relaxed text-ink-soft">{texte}</p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a className={`inline-flex items-center px-4 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.12em] ${t.bouton}`} href={`mailto:${site.email}`}>
            Écrire
          </a>
          {whatsapp && (
            <a className={`inline-flex items-center px-4 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.12em] ${t.boutonSecond}`} href="https://wa.me/242064459909" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

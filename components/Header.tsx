import Link from 'next/link';

export const menu = [
  { href: '/', label: 'Accueil' },
  { href: '/le-groupe', label: 'Le Groupe' },
  { href: '/philosophie-africaine', label: 'Philosophie africaine' },
  { href: '/edito', label: 'Édito' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/publications', label: 'Publications' },
  { href: '/sous-sites/revue-jogoo', label: 'Revue JOGOO' },
  { href: '/recherche', label: 'Recherche' },
  { href: '/mediatheque', label: 'Médiathèque' },
  { href: '/contact', label: 'Contact' },
];

const aujourdhui = () => {
  const d = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date());
  return d.charAt(0).toUpperCase() + d.slice(1);
};

/** En-tête façon revue : bandeau daté, logo centré, menu en petites capitales entre deux filets. */
export function Header() {
  return (
    <header className="bg-paper">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center justify-between py-3 text-[0.7rem] text-mute">
          <span className="hidden sm:inline">{aujourdhui()}</span>
          <span className="font-serif italic">Philosophie africaine. Débats &amp; questions.</span>
          <Link href="/agenda" className="hidden hover:text-ink sm:inline">Agenda</Link>
        </div>
        <div className="flex items-center justify-between border-t border-line py-5 lg:justify-center">
          <Link href="/" aria-label="Groupe JOGOO, accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/medias/site/jogoo/logo-jogoo-header.png" alt="Groupe JOGOO" className="h-12 w-auto sm:h-16" />
          </Link>
          <details className="group/menu relative lg:hidden">
            <summary className="label cursor-pointer list-none !text-ink">Menu</summary>
            <nav className="absolute right-0 z-50 mt-4 w-64 bg-paper py-3 shadow-[0_18px_50px_-12px_rgb(23_20_15/.35)]" aria-label="Menu principal">
              {menu.map((m) => (
                <Link key={m.href} href={m.href} className="block px-6 py-2.5 font-serif text-[1.05rem] hover:text-terra">{m.label}</Link>
              ))}
            </nav>
          </details>
        </div>
        <nav className="hidden border-y border-ink lg:block" aria-label="Menu principal">
          <ul className="flex items-center justify-center gap-x-8 py-3">
            {menu.slice(1).map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="label !text-ink transition hover:!text-terra">{m.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

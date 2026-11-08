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

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3">
        <Link href="/" className="shrink-0" aria-label="Groupe JOGOO, accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/medias/site/jogoo/logo-jogoo-header.png" alt="Groupe JOGOO" className="h-10 w-auto sm:h-11" />
        </Link>
        <nav className="hidden lg:block" aria-label="Menu principal">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 font-brand text-[0.78rem] font-semibold">
            {menu.slice(1).map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="text-ink/80 transition hover:text-terra">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <details className="relative lg:hidden">
          <summary className="cursor-pointer list-none border border-ink/20 px-3 py-1.5 font-brand text-xs font-bold uppercase tracking-wider">
            Menu
          </summary>
          <ul className="absolute right-0 mt-2 w-60 border border-ink/10 bg-white p-2 shadow-lg">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="block px-3 py-2 font-brand text-sm font-semibold hover:bg-cream">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </header>
  );
}

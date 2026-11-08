import Link from 'next/link';

const sousSites = [
  { href: '/sous-sites/revue-jogoo', label: 'Revue JOGOO' },
  { href: '/sous-sites/editions-jogoo', label: 'Éditions JOGOO' },
  { href: '/sous-sites/fonds-eboussi-boulaga', label: 'Fonds Eboussi Boulaga' },
  { href: '/sous-sites/eboussi-studies', label: 'Eboussi Studies' },
  { href: '/sous-sites/sankofa-communications', label: 'Sankofa Communications' },
  { href: '/sous-sites/philo-africaine-magazine', label: 'Philo Africaine Magazine' },
];

export function Footer({ mention }: { mention?: string | null }) {
  return (
    <footer className="mt-20 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/medias/site/jogoo/logo-jogoo-blanc.png" alt="Groupe JOGOO" className="h-12 w-auto" />
          <p className="mt-4 max-w-xs font-serif text-sm italic text-paper/70">Philosophie africaine. Débats & questions.</p>
        </div>
        <div>
          <p className="kicker !text-gold">Sous-sites</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {sousSites.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-paper/80 hover:text-gold">{s.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker !text-gold">Le site</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link href="/agenda" className="text-paper/80 hover:text-gold">Agenda</Link></li>
            <li><Link href="/flash" className="text-paper/80 hover:text-gold">Flash</Link></li>
            <li><Link href="/plan-du-site" className="text-paper/80 hover:text-gold">Plan du site</Link></li>
            <li><Link href="/mentions-legales" className="text-paper/80 hover:text-gold">Mentions légales</Link></li>
            <li><Link href="/credits" className="text-paper/80 hover:text-gold">Crédits</Link></li>
            <li><Link href="/keystatic" className="text-paper/80 hover:text-gold">Espace rédaction</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-paper/50">
          {mention ?? 'Groupe JOGOO (ASPHICC-JOGOO). Association déclarée.'}
        </p>
      </div>
    </footer>
  );
}

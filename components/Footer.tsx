import Link from 'next/link';

const sousSites = [
  { href: '/sous-sites/revue-jogoo', label: 'Revue JOGOO' },
  { href: '/sous-sites/editions-jogoo', label: 'Éditions JOGOO' },
  { href: '/sous-sites/fonds-eboussi-boulaga', label: 'Fonds Eboussi Boulaga' },
  { href: '/sous-sites/eboussi-studies', label: 'Eboussi Studies' },
  { href: '/sous-sites/sankofa-communications', label: 'Sankofa Communications' },
  { href: '/sous-sites/philo-africaine-magazine', label: 'Philo Africaine Magazine' },
];

const rubriques = [
  { href: '/edito', label: 'Édito' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/publications', label: 'Publications' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/flash', label: 'Flash' },
  { href: '/mediatheque', label: 'Médiathèque' },
];

export function Footer({ mention, email }: { mention?: string | null; email?: string | null }) {
  return (
    <footer className="mt-28 bg-night text-paper">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-serif text-[1.9rem] leading-tight">
              Le coq chante à l’aube,<br /><em className="text-gold">pas au crépuscule.</em>
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/60">
              Groupe JOGOO — Association des Philosophes du Chant du Coq. Un projet de réflexion sur la pensée philosophique africaine, depuis 2010.
            </p>
            {email && <a href={`mailto:${email}`} className="mt-6 inline-block font-serif italic text-gold hover:text-paper">{email}</a>}
          </div>
          <div>
            <p className="label !text-paper/45">Rubriques</p>
            <ul className="mt-5 space-y-2.5 text-[0.95rem]">{rubriques.map((s) => <li key={s.href}><Link href={s.href} className="text-paper/80 hover:text-gold">{s.label}</Link></li>)}</ul>
          </div>
          <div>
            <p className="label !text-paper/45">Sous-sites</p>
            <ul className="mt-5 space-y-2.5 text-[0.95rem]">{sousSites.map((s) => <li key={s.href}><Link href={s.href} className="text-paper/80 hover:text-gold">{s.label}</Link></li>)}</ul>
          </div>
          <div>
            <p className="label !text-paper/45">Le site</p>
            <ul className="mt-5 space-y-2.5 text-[0.95rem]">
              <li><Link href="/le-groupe" className="text-paper/80 hover:text-gold">Le Groupe</Link></li>
              <li><Link href="/contact" className="text-paper/80 hover:text-gold">Contact</Link></li>
              <li><Link href="/plan-du-site" className="text-paper/80 hover:text-gold">Plan du site</Link></li>
              <li><Link href="/mentions-legales" className="text-paper/80 hover:text-gold">Mentions légales</Link></li>
              <li><Link href="/credits" className="text-paper/80 hover:text-gold">Crédits</Link></li>
              <li><Link href="/keystatic" className="text-paper/80 hover:text-gold">Espace rédaction</Link></li>
            </ul>
          </div>
        </div>
        <div className="aube aube-nuit mt-16" aria-hidden />
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-paper/45 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/medias/site/jogoo/logo-jogoo-blanc.png" alt="Groupe JOGOO" className="h-9 w-auto opacity-80" />
          <p className="text-center sm:text-right">{mention ?? 'Groupe JOGOO (ASPHICC-JOGOO), association déclarée.'}</p>
        </div>
      </div>
    </footer>
  );
}

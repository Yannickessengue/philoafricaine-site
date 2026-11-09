import Link from 'next/link';
import { Cadre, type Format } from './Cadre';

/** En-tête de rubrique : surtitre, grand titre en Baskerville, chapô. */
export function EnTete({ kicker, titre, intro, centre = false }: { kicker?: string; titre: string; intro?: string | null; centre?: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 sm:pt-20">
      <div className={centre ? 'mx-auto max-w-3xl text-center' : 'max-w-4xl'}>
        {kicker && <p className="label label-accent">{kicker}</p>}
        <h1 className="titre titre-xl mt-5">{titre}</h1>
        {intro && <p className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-ink-soft sm:text-xl">{intro}</p>}
      </div>
      <div className="aube mt-14" aria-hidden />
    </section>
  );
}

/** Carte éditoriale sans cadre ni bordure : image à format fixe, rubrique, titre, chapô. */
export function Carte({
  href, image, alt, kicker, titre, meta, texte, format = '4/3', grand = false,
}: {
  href: string; image?: string | null; alt?: string | null; kicker?: string; titre: string;
  meta?: string; texte?: string | null; format?: Format; grand?: boolean;
}) {
  return (
    <article className="group">
      <Link href={href} className="block">
        <Cadre src={image} alt={alt} format={format} />
        <div className="mt-5">
          {kicker && <p className="label label-accent">{kicker}</p>}
          <h3 className={`titre mt-2.5 ${grand ? 'titre-l' : 'titre-m'}`}><span className="lien">{titre}</span></h3>
          {meta && <p className="mt-2.5 text-[0.78rem] text-mute">{meta}</p>}
          {texte && <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{texte}</p>}
        </div>
      </Link>
    </article>
  );
}

/** Ligne d'index numérotée (listes de type sommaire). */
export function Index({ n, href, kicker, titre, meta, aside }: { n: number; href: string; kicker?: string; titre: string; meta?: string; aside?: React.ReactNode }) {
  return (
    <li className="group border-t border-line first:border-t-0">
      <Link href={href} className="grid grid-cols-[2.6rem_1fr] gap-4 py-6 sm:grid-cols-[3.4rem_1fr_auto] sm:items-baseline sm:gap-6">
        <span className="font-serif text-xl italic text-gold">{String(n).padStart(2, '0')}</span>
        <span>
          {kicker && <span className="label mb-1.5 block">{kicker}</span>}
          <span className="titre titre-s block"><span className="lien">{titre}</span></span>
          {meta && <span className="mt-1.5 block text-[0.82rem] text-mute">{meta}</span>}
        </span>
        {aside && <span className="col-start-2 sm:col-start-auto">{aside}</span>}
      </Link>
    </li>
  );
}

/** Mention d'état en petites capitales, précédée d'un point. */
export function Etat({ children, ton = 'terra' }: { children: React.ReactNode; ton?: 'terra' | 'gold' | 'mute' }) {
  const point = { terra: 'bg-terra', gold: 'bg-gold', mute: 'bg-mute' }[ton];
  return (
    <span className="label inline-flex items-center gap-2 whitespace-nowrap !text-ink-soft">
      <span className={`h-1.5 w-1.5 rounded-full ${point}`} aria-hidden />
      {children}
    </span>
  );
}

export function Section({ titre, lien, libelle, children, className = '' }: { titre: string; lien?: string; libelle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-7xl px-5 sm:px-8 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-ink pb-4">
        <h2 className="titre titre-l">{titre}</h2>
        {lien && <Link href={lien} className="fleche pb-2">{libelle ?? 'Tout voir'}</Link>}
      </div>
      <div className="pt-10">{children}</div>
    </section>
  );
}

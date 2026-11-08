import Link from 'next/link';
import { Cadre } from './Cadre';

export function EnTete({ kicker, titre, intro }: { kicker?: string; titre: string; intro?: string | null }) {
  return (
    <section className="border-b border-ink/10 bg-cream/60">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        {kicker && <p className="kicker mb-3">{kicker}</p>}
        <h1 className="display-title text-3xl text-terra sm:text-5xl">{titre}</h1>
        {intro && <p className="mt-4 max-w-2xl font-serif text-lg italic text-ink-soft">{intro}</p>}
      </div>
    </section>
  );
}

/** Carte à cadre d'image fixe (16:10), utilisée pour les actualités, éditos et publications. */
export function Carte({
  href, image, alt, kicker, titre, meta, texte, format = '16/10',
}: {
  href: string; image?: string | null; alt?: string | null; kicker?: string; titre: string;
  meta?: string; texte?: string | null; format?: '16/10' | '3/4' | '4/3';
}) {
  return (
    <article className="group flex flex-col border border-ink/10 bg-white">
      <Link href={href} className="block">
        <Cadre src={image} alt={alt} format={format} gris />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {kicker && <p className="kicker mb-2">{kicker}</p>}
        <h3 className="font-display text-lg font-extrabold uppercase leading-tight text-ink group-hover:text-terra">
          <Link href={href}>{titre}</Link>
        </h3>
        {meta && <p className="mt-1.5 text-xs text-ink/55">{meta}</p>}
        {texte && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{texte}</p>}
        <Link href={href} className="mt-auto pt-4 font-brand text-xs font-bold uppercase tracking-wider text-terra-deep">
          Lire la suite →
        </Link>
      </div>
    </article>
  );
}

export function Pastille({ children, ton = 'terra' }: { children: React.ReactNode; ton?: 'terra' | 'gold' | 'ink' }) {
  const c = { terra: 'bg-terra text-paper', gold: 'bg-gold text-ink', ink: 'bg-ink text-paper' }[ton];
  return <span className={`inline-block px-2 py-0.5 font-brand text-[0.65rem] font-bold uppercase tracking-wider ${c}`}>{children}</span>;
}

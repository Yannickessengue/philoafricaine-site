import Link from 'next/link';
import { dateFr, finEmbargo, sousEmbargo } from '@/lib/content';
import { Pastille } from './ui';

export function RevueBandeau() {
  const liens = [
    ['/sous-sites/revue-jogoo', 'Accueil'],
    ['/sous-sites/revue-jogoo/dossier-fondateur', 'N° 1'],
    ['/sous-sites/revue-jogoo/a-propos', 'À propos'],
    ['/sous-sites/revue-jogoo/comites', 'Comités'],
    ['/sous-sites/revue-jogoo/publier', 'Publier'],
  ];
  return (
    <div className="border-b border-ink/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/sous-sites/revue-jogoo" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/medias/site/jogoo/logo-revue-jogoo.png" alt="" className="h-9 w-auto bg-paper p-1" />
          <span className="font-display text-sm font-extrabold uppercase tracking-wide">Revue JOGOO <span className="block font-sans text-xs font-normal normal-case tracking-normal text-paper/60">Philosophie africaine & culture</span></span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 font-brand text-xs font-semibold uppercase tracking-wider">
          {liens.map(([h, l]) => <Link key={h} href={h} className="text-paper/80 hover:text-gold">{l}</Link>)}
        </nav>
      </div>
    </div>
  );
}

export function StatutAcces({ date, mois }: { date: string; mois: number | null }) {
  if (!sousEmbargo(date, mois)) return <Pastille ton="gold">Accès libre</Pastille>;
  return <Pastille>Sous embargo jusqu’au {dateFr(finEmbargo(date, mois).toISOString().slice(0, 10))}</Pastille>;
}

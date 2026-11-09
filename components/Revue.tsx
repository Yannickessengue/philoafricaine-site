import Link from 'next/link';
import { dateFr, finEmbargo, sousEmbargo } from '@/lib/content';
import { Etat } from './ui';

export function RevueBandeau() {
  const liens = [
    ['/sous-sites/revue-jogoo', 'La revue'],
    ['/sous-sites/revue-jogoo/dossier-fondateur', 'Numéro 1'],
    ['/sous-sites/revue-jogoo/a-propos', 'À propos'],
    ['/sous-sites/revue-jogoo/comites', 'Comités'],
    ['/sous-sites/revue-jogoo/publier', 'Publier'],
  ];
  return (
    <div className="bg-night text-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-3 px-5 py-5 sm:px-8">
        <Link href="/sous-sites/revue-jogoo" className="font-serif text-xl">
          JOGOO <em className="text-gold">Revue de philosophie africaine &amp; de culture</em>
        </Link>
        <nav className="flex flex-wrap gap-x-7 gap-y-2">
          {liens.map(([h, l]) => <Link key={h} href={h} className="label !text-paper/70 hover:!text-gold">{l}</Link>)}
        </nav>
      </div>
    </div>
  );
}

export function StatutAcces({ date, mois }: { date: string; mois: number | null }) {
  if (!sousEmbargo(date, mois)) return <Etat ton="gold">Accès libre</Etat>;
  return <Etat>Embargo jusqu’au {dateFr(finEmbargo(date, mois).toISOString().slice(0, 10))}</Etat>;
}

import Link from 'next/link';

/** En-tête d'article centré : retour, rubrique, titre, sous-titre, signature et date. */
export function ArticleTete({ retour, retourLabel, kicker, titre, soustitre, auteur, date }: {
  retour: string; retourLabel: string; kicker?: string; titre: string; soustitre?: string | null; auteur?: string | null; date?: string;
}) {
  return (
    <header className="mx-auto max-w-4xl px-5 pt-14 text-center sm:px-8">
      <Link href={retour} className="label hover:!text-terra">← {retourLabel}</Link>
      {kicker && <p className="label label-accent mt-10">{kicker}</p>}
      <h1 className="titre titre-xl mt-5">{titre}</h1>
      {soustitre && <p className="mx-auto mt-6 max-w-2xl font-serif text-xl italic leading-relaxed text-ink-soft">{soustitre}</p>}
      {(auteur || date) && (
        <p className="mt-8 text-sm text-mute">
          {auteur && <span className="font-serif italic text-ink">{auteur}</span>}
          {auteur && date && <span className="mx-3 text-line">|</span>}
          {date}
        </p>
      )}
    </header>
  );
}

export function Fin() {
  return <div className="aube mx-auto mt-16 max-w-[40rem]" aria-hidden />;
}

/** En-tête de page de l'original : filigrane du coq, pastille terracotta, sur-titre, grand titre, chapeau. */
export function EnTete({
  kicker,
  titre,
  intro,
  icone = 'tete',
  children,
}: {
  kicker: string;
  titre: string;
  intro?: React.ReactNode;
  icone?: 'tete' | 'book' | 'action' | 'oreille' | 'projet' | 'revue' | 'fonds' | 'sankofa' | null;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-ink/10 bg-cream/60">
      <img
        alt=""
        aria-hidden="true"
        src="/medias/site/jogoo/icone-jogoo.png"
        className="pointer-events-none absolute -right-10 -top-12 hidden opacity-[0.06] sm:block"
        style={{ width: 260, height: 'auto' }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className="flex items-center gap-3">
          {icone && (
            <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center bg-terra text-white" style={{ width: 34, height: 34 }}>
              <img alt="" src={`/medias/site/jogoo/icons/${icone}.png`} className="object-contain brightness-0 invert" style={{ maxWidth: 20, maxHeight: 20, width: 'auto', height: 'auto' }} />
            </span>
          )}
          <span className="kicker">{kicker}</span>
        </div>
        <h1 className="display-title mt-4 max-w-4xl break-words text-4xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">{titre}</h1>
        {intro && <p className="mt-6 max-w-2xl font-serif text-lg italic text-ink/80">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/** Titre de section de l'original (sur-titre + titre terracotta). */
export function TitreSection({ kicker, titre, className = '' }: { kicker?: string; titre: string; className?: string }) {
  return (
    <div className={className}>
      {kicker && <p className="kicker mb-2">{kicker}</p>}
      <h2 className="display-title text-3xl text-terra sm:text-4xl">{titre}</h2>
    </div>
  );
}

export const Lieu = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s7-7.1 7-12a7 7 0 1 0-14 0c0 4.9 7 12 7 12Z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="9" r="2.3" />
  </svg>
);

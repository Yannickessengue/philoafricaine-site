/** Fil défilant de l’accueil : dernières parutions et rendez-vous (pause au survol). */
export function Fil({ elements }: { elements: { etiquette: string; texte: string; href: string }[] }) {
  if (!elements.length) return null;
  const serie = (cache: boolean) =>
    elements.map((e, i) => (
      <a
        key={`${cache}-${i}`}
        href={e.href}
        tabIndex={cache ? -1 : undefined}
        aria-hidden={cache || undefined}
        className="group flex shrink-0 items-center gap-3 px-6 py-3 text-sm text-paper/85 hover:text-white"
      >
        <span className="bg-terra px-2 py-0.5 font-brand text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white">{e.etiquette}</span>
        <span className="whitespace-nowrap font-medium group-hover:underline group-hover:underline-offset-4">{e.texte}</span>
        <span className="text-gold" aria-hidden="true">✱</span>
      </a>
    ));
  return (
    <section aria-label="Les dernières nouvelles" className="fil relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-ink to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink to-transparent" aria-hidden="true" />
      <div className="fil-piste" style={{ ['--duree' as string]: `${Math.max(40, elements.length * 9)}s` }}>
        {serie(false)}
        {serie(true)}
      </div>
    </section>
  );
}

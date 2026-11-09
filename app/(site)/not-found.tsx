export default function Introuvable() {
  return (
    <section className="relative overflow-hidden bg-gold">
      <img
        alt=""
        aria-hidden="true"
        src="/medias/site/jogoo/coq-penseur.png"
        className="jogoo-loader-watermark pointer-events-none absolute -bottom-[6vh] -right-[12vh] h-[50vh] w-[50vh] max-w-none object-contain opacity-80"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <p className="eyebrow text-ink/70">Erreur 404</p>
        <h1 className="display-title mt-2 max-w-3xl text-[2.5rem] leading-[0.92] text-ink sm:text-6xl">Le coq n’a pas trouvé cette page</h1>
        <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-ink/80">
          L’adresse demandée n’existe pas ou a changé. Tous les contenus de l’ancien site ont été repris : passez par l’accueil, la recherche ou le plan du site.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="bg-ink px-5 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra" href="/">
            Retour à l’accueil
          </a>
          <a className="border border-ink px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper" href="/plan-du-site">
            Plan du site
          </a>
        </div>
      </div>
    </section>
  );
}

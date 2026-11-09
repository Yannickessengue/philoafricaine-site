import Link from 'next/link';

export default function Introuvable() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-10 pt-24 text-center sm:px-8">
      <p className="label label-accent">Erreur 404</p>
      <h1 className="titre titre-xl mt-5">Cette page s’est égarée avant l’aube.</h1>
      <p className="mx-auto mt-6 max-w-xl font-serif text-lg italic text-ink-soft">
        L’adresse demandée n’existe pas ou a changé. Les contenus de l’ancien site ont été repris : essayez le plan du site.
      </p>
      <div className="aube mx-auto mt-12 max-w-md" aria-hidden />
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Link href="/" className="bouton">Retour à l’accueil</Link>
        <Link href="/plan-du-site" className="bouton bouton-clair border border-ink">Plan du site</Link>
      </div>
    </section>
  );
}

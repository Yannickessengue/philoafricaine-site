import { dateFr } from '@/lib/content';
import { getMinutes, integrationVideo, MINUTE } from '@/lib/minutes';
import { partage } from '@/lib/apercu';

export const revalidate = 3600;

export const metadata = {
  title: MINUTE.titre,
  description: `${MINUTE.devise} Chaque épisode : un philosophe explique en vidéo un concept de la philosophie africaine.`,
  ...partage(MINUTE.titre, `${MINUTE.devise} Un rendez-vous vidéo du Groupe JOGOO.`, 'Nouvelle rubrique vidéo', '/medias/site/jogoo/coq-penseur.jpg', null, 'website'),
};

const PRINCIPE: [string, string, string][] = [
  ['01', 'Un concept', 'Ubuntu, Muntu, reprise de soi, ethnophilosophie, palabre… une notion clé de la philosophie africaine, à chaque fois.'],
  ['02', 'Un philosophe', 'Une chercheuse ou un chercheur qui la travaille, et qui l’explique en ses propres mots.'],
  ['03', 'Cinq minutes', 'Le temps d’un café : une vidéo courte, une fiche écrite, des références pour aller plus loin.'],
];

export default async function Minutes() {
  const episodes = await getMinutes();
  const [une, ...autres] = episodes;
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <img src="/medias/site/jogoo/coq-penseur-gauche.png" alt="" className="coq-flotte pointer-events-none absolute -bottom-8 right-[-4rem] -z-10 h-[105%] max-h-[30rem] opacity-90 sm:right-0" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_40%,rgba(168,54,27,0.45),transparent_60%)]" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <p className="flex items-center gap-3 font-brand text-xs font-bold uppercase tracking-[0.24em] text-gold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terra opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terra" />
            </span>
            Rubrique vidéo
          </p>
          <h1 className="mt-4 max-w-2xl font-brand text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
            Les 5 minutes
            <br />
            <span className="font-serif text-[1.05em] font-bold normal-case italic text-gold">du chant du coq</span>
          </h1>
          <p className="mt-5 max-w-lg font-serif text-xl italic text-paper/80">{MINUTE.devise}</p>
        </div>
      </section>

      {une ? (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <p className="kicker">Dernier épisode{une.entry.numero ? ` · n° ${une.entry.numero}` : ''}</p>
          <a href={`${MINUTE.base}/${une.slug}`} className="group mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div className="relative aspect-video overflow-hidden bg-ink shadow-[0_24px_50px_-28px_rgba(0,0,0,0.7)]">
              {(une.entry.affiche || integrationVideo(une.entry.video)?.vignette) && (
                <img src={une.entry.affiche || integrationVideo(une.entry.video)!.vignette!} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
              )}
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-terra text-white shadow-2xl transition-transform group-hover:scale-110" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7Z" />
                </svg>
              </span>
            </div>
            <div>
              <h2 className="display-title text-4xl text-ink group-hover:text-terra sm:text-5xl">{une.entry.titre}</h2>
              <p className="mt-3 font-brand text-sm font-bold text-ink">
                {une.entry.philosophe}
                {une.entry.duree && <span className="font-semibold text-ink-soft"> · {une.entry.duree}</span>}
              </p>
              {une.entry.fonction && <p className="text-sm text-ink-soft">{une.entry.fonction}</p>}
              {une.entry.definition && <p className="mt-5 font-serif text-lg italic leading-relaxed text-ink">{une.entry.definition}</p>}
              <span className="mt-6 inline-block font-brand text-xs font-bold uppercase tracking-[0.12em] text-terra-deep">Regarder l’épisode →</span>
            </div>
          </a>
          {autres.length > 0 && (
            <>
              <p className="kicker mb-4 mt-14">Tous les épisodes</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {autres.map((m) => {
                  const img = m.entry.affiche || integrationVideo(m.entry.video)?.vignette;
                  return (
                    <a key={m.slug} href={`${MINUTE.base}/${m.slug}`} className="group block">
                      <span className="relative block aspect-video overflow-hidden bg-ink">
                        {img && <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                        {m.entry.duree && <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 font-brand text-[0.65rem] font-bold text-white">{m.entry.duree}</span>}
                      </span>
                      <span className="mt-3 block font-brand text-lg font-bold text-ink group-hover:text-terra">{m.entry.titre}</span>
                      <span className="block text-sm text-ink-soft">
                        {m.entry.philosophe} · {dateFr(m.entry.date)}
                      </span>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-5 md:grid-cols-3">
            {PRINCIPE.map(([n, t, d]) => (
              <div key={n} className="bg-white p-7 shadow-[0_1px_2px_rgba(26,26,26,0.04),0_14px_34px_-22px_rgba(26,26,26,0.28)]">
                <p className="font-brand text-4xl font-black text-terra/80">{n}</p>
                <p className="mt-3 font-brand text-xl font-bold text-ink">{t}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 bg-gold p-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-brand text-2xl font-black uppercase text-ink">Premier épisode très bientôt</p>
              <p className="mt-1 text-ink/75">Il sera annoncé dans notre newsletter.</p>
            </div>
            <a
              href={`mailto:philoafricaine@gmail.com?subject=${encodeURIComponent('Les 5 minutes du chant du coq — proposition')}&body=${encodeURIComponent('Concept proposé :\nPhilosophe pressenti (vous, ou une autre personne) :\nQuelques mots sur l’angle choisi :\n')}`}
              className="bg-ink px-6 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-paper hover:bg-terra"
            >
              Proposer un concept ou intervenir
            </a>
          </div>
        </section>
      )}
    </>
  );
}

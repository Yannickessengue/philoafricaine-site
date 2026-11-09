import { getActualites, getEditos } from '@/lib/content';
import { SOUS_SITES } from '@/lib/liste-sous-sites';
import { NewsletterEn } from '@/components/NewsletterEn';

export const revalidate = 3600;

const BLURBS: Record<string, string> = {
  'Revue JOGOO': 'A peer-reviewed, semiannual journal of African philosophy and culture (double-blind review, open access).',
  'Éditions JOGOO': 'Our publishing house: essays, collective volumes and translations in African philosophy and the humanities.',
  'Fonds Eboussi Boulaga': 'Archives, bibliography and the journal Eboussi Studies, devoted to the Cameroonian philosopher Fabien Eboussi Boulaga.',
  'JOGOO AI': 'An AI research assistant that answers from the texts published by the Group, with verifiable sources. Ask in English.',
  'Sankofa Communications': 'Our communication agency, supporting researchers, events and publications.',
  'Philo Africaine Magazine': 'A general-audience magazine bringing African philosophy into public debate.',
};

const fr = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export default async function Accueil() {
  const [editos, actus] = await Promise.all([getEditos(), getActualites()]);
  const recents = [
    ...editos.slice(0, 3).map((e) => ({ t: e.entry.titre, u: `/edito/${e.slug}`, k: 'Editorial', d: e.entry.date })),
    ...actus.slice(0, 3).map((a) => ({ t: a.entry.titre, u: `/actualites/${a.slug}`, k: 'News', d: a.entry.date })),
  ];
  return (
    <>
      <section className="relative overflow-hidden bg-[#eabf31]">
        <img src="/medias/site/jogoo/coq-penseur-t.png" alt="" className="pointer-events-none absolute -bottom-10 right-0 hidden h-[115%] max-h-[34rem] lg:block" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <p className="font-brand text-xs font-bold uppercase tracking-[0.24em] text-ink/70">Groupe JOGOO</p>
          <h1 className="mt-4 max-w-3xl font-brand text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
            African philosophy.
            <br />
            Debates &amp; questions.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80">
            A research network founded in 2010 to reflect on philosophical thought as a whole, from Africa and its diaspora, through journals, books, archives and public debate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/en/about" className="bg-ink px-6 py-3 font-brand text-xs font-bold uppercase tracking-[0.14em] text-paper hover:bg-terra">
              About the Group →
            </a>
            <a href="/en/contribute" className="bg-white/70 px-6 py-3 font-brand text-xs font-bold uppercase tracking-[0.14em] text-ink hover:bg-white">
              Contribute
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <blockquote className="font-serif text-2xl italic leading-snug text-ink sm:text-3xl">
            “Unlike Hegel’s owl, a creature of dusk, the rooster is the animal of dawn: the one that wakes us up and sets us to work.”
          </blockquote>
          <p className="text-[1.02rem] leading-relaxed text-ink-soft">
            <em>Jogoo</em> means “rooster” in Swahili. The image was highlighted during the philosophy days organised by the philosophy department of Lubumbashi (DR Congo) on the teaching of philosophy. The Group gathers African and non-African researchers around the problems of the human, situating them in relation to Black thought.
          </p>
        </div>
      </section>

      <section id="sub-sites" className="scroll-mt-24 bg-cream/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="kicker">Six autonomous projects</p>
          <h2 className="display-title mt-2 text-3xl text-ink sm:text-4xl">What we do</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SOUS_SITES.map(([href, nom, logo, e]) => (
              <a key={href} href={href} className="group flex flex-col bg-white p-6 shadow-[0_1px_2px_rgba(26,26,26,0.04),0_14px_34px_-22px_rgba(26,26,26,0.28)] transition-all duration-300 hover:-translate-y-1">
                <span className="flex h-24 items-center">
                  <img src={logo} alt="" style={{ ['--e' as string]: e }} className="h-[calc(5rem*var(--e))] w-auto max-w-[14rem] object-contain" />
                </span>
                <span className="mt-5 font-brand text-lg font-bold text-ink group-hover:text-terra">{nom}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{BLURBS[nom]}</span>
                <span className="mt-4 font-brand text-[0.68rem] font-bold uppercase tracking-[0.12em] text-terra-deep">
                  Visit{nom === 'JOGOO AI' ? '' : ' (in French)'} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Latest from the French site</p>
            <h2 className="display-title mt-2 text-3xl text-ink sm:text-4xl">Recently published</h2>
          </div>
          <p className="text-sm text-ink-soft">Articles are in French. Use the language menu of the French site for an automatic translation.</p>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recents.map((r) => (
            <li key={r.u}>
              <a href={r.u} hrefLang="fr" className="group block h-full bg-white p-5 shadow-[0_1px_2px_rgba(26,26,26,0.04),0_14px_34px_-22px_rgba(26,26,26,0.28)]">
                <span className="font-brand text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terra">
                  {r.k} · FR {r.d ? `· ${fr(r.d)}` : ''}
                </span>
                <span lang="fr" className="mt-2 block font-serif text-lg font-bold leading-snug text-ink group-hover:text-terra-deep">
                  {r.t}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
          <a href="/podcasts" className="group flex items-center gap-5">
            <img src="/medias/podcasts/couverture-podcast.jpg" alt="" className="w-28 shrink-0" />
            <span>
              <span className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">Podcast · in French</span>
              <span className="mt-1 block font-brand text-2xl font-bold text-white group-hover:text-gold">Listen to African philosophy</span>
              <span className="mt-1 block text-sm text-paper/65">Readings from Marcien Towa and other thinkers.</span>
            </span>
          </a>
          <a href="/sous-sites/jogoo-ai" className="group flex items-center gap-5">
            <img src="/medias/site/jogoo/disque-jogoo-ai.png" alt="" className="w-28 shrink-0 rounded-full" />
            <span>
              <span className="font-brand text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold">JOGOO AI</span>
              <span className="mt-1 block font-brand text-2xl font-bold text-white group-hover:text-gold">Ask the rooster</span>
              <span className="mt-1 block text-sm text-paper/65">Questions in English are welcome; answers cite the Group’s texts.</span>
            </span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h2 className="display-title text-3xl text-terra sm:text-4xl">Newsletter</h2>
        <p className="mt-3 text-ink-soft">News, events, calls for papers and new publications from the Group and its sub-sites.</p>
        <NewsletterEn />
        <p className="mt-3 text-xs text-ink/50">The newsletter is written in French. Unsubscribe in one click.</p>
      </section>
    </>
  );
}

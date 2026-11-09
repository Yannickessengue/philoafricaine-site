import { partage } from '@/lib/apercu';

export const metadata = {
  title: 'Contribute',
  description: 'Publish with the Groupe JOGOO: Revue JOGOO, Eboussi Studies, Philo Africaine Magazine and Éditions JOGOO.',
  ...partage('Contribute', 'Publish in our journals, magazine and publishing house.', 'Groupe JOGOO · English', null, null, 'website'),
};

const VOIES = [
  {
    nom: 'Revue JOGOO',
    logo: '/medias/site/jogoo/logo-revue-jogoo.png',
    texte:
      'Semiannual journal of African philosophy and culture, general and non-thematic, in print and online. It welcomes research articles, translations, interviews and book reviews. Double-blind peer review by at least two specialists.',
    points: ['Articles: 6,000–9,000 words, notes and bibliography included', 'Reviews: 1,000–1,500 words', 'Title, abstract (150–250 words) and 5–6 keywords in French and English'],
    lien: '/sous-sites/revue-jogoo/publier',
  },
  {
    nom: 'Eboussi Studies',
    logo: '/medias/site/jogoo/logo-eboussi-studies.png',
    texte: 'Multilingual scientific journal of the Fonds Eboussi Boulaga, devoted to the work and legacy of Fabien Eboussi Boulaga and to the questions it opens: self-recovery, decolonisation of knowledge, democracy.',
    points: ['Calls for papers announced on the site', 'First issue: “Reprise de soi et décolonisation des savoirs” (2026)'],
    lien: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies',
  },
  {
    nom: 'Philo Africaine Magazine',
    logo: '/medias/site/jogoo/logo-philo-africaine-magazine.png',
    texte: 'A magazine for intellectual mediation: columns, interviews, portraits and dossiers that bring African philosophy to a wide audience.',
    points: ['Short, accessible formats', 'Columns, interviews, portraits, dossiers'],
    lien: '/sous-sites/philo-africaine-magazine/contribuer',
  },
  {
    nom: 'Éditions JOGOO',
    logo: '/medias/site/jogoo/logo-editions-jogoo.png',
    texte: 'Our publishing house welcomes book projects in African philosophy, the humanities, endogenous knowledge, decolonial studies and contemporary writing, as well as translations and co-publications.',
    points: ['Monographs, collective volumes, translations', 'Editorial support for researchers'],
    lien: '/sous-sites/editions-jogoo/publier',
  },
];

export default function Contribuer() {
  return (
    <>
      <header className="border-b border-ink/10 bg-cream/60">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <p className="kicker">Authors</p>
          <h1 className="display-title mt-2 text-4xl text-ink sm:text-5xl">Contribute</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Four ways to publish with the Group. Detailed guidelines are on each French page; you may write to us in English.
          </p>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-16 md:grid-cols-2">
        {VOIES.map((v) => (
          <article key={v.nom} className="flex flex-col bg-white p-7 shadow-[0_1px_2px_rgba(26,26,26,0.04),0_14px_34px_-22px_rgba(26,26,26,0.28)]">
            <img src={v.logo} alt="" className="h-16 w-auto self-start object-contain" />
            <h2 className="mt-5 font-brand text-xl font-bold text-ink">{v.nom}</h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{v.texte}</p>
            <ul className="mt-4 flex-1 space-y-1.5">
              {v.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm text-ink">
                  <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-terra" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
            <a href={v.lien} hrefLang="fr" className="mt-6 font-brand text-xs font-bold uppercase tracking-[0.12em] text-terra-deep hover:text-terra">
              Guidelines (in French) →
            </a>
          </article>
        ))}
      </div>
      <section className="bg-ink text-paper">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-5 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-brand text-2xl font-bold text-white">Calls for papers &amp; positions</h2>
            <p className="mt-1 text-paper/70">Open calls are published on the research pages of the French site.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/recherche/appels-a-contributions" hrefLang="fr" className="bg-gold px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-ink hover:bg-white">
              Calls for papers →
            </a>
            <a href="mailto:philoafricaine@gmail.com" className="bg-white/10 px-5 py-3 font-brand text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-white/20">
              Write to us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

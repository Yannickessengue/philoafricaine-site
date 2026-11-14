import { partage } from '@/lib/apercu';

export const metadata = {
  title: 'About the Group',
  description: 'Groupe JOGOO, “Association of the Philosophers of the Rooster’s Crow”: aims, means of action, research areas and governance.',
  alternates: { languages: { fr: '/le-groupe', en: '/en/about' } },
  ...partage('About the Group', 'Aims, means of action, research areas and governance.', 'Groupe JOGOO · English', null, null, 'website'),
};

const OBJECTIFS = [
  'Bring together all the human and intellectual resources interested in philosophical reflection in the African socio-cultural space and its diaspora.',
  'Stimulate and encourage scientific and critical debate.',
  'Demystify African and diasporic philosophical and intellectual production.',
  'Reclaim and make accessible the intellectual work of the thinkers who came before us.',
  'Encourage publishing projects in African philosophy.',
  'Support researchers in their editorial and publishing projects.',
];
const MOYENS = [
  'Publishing, conferences, seminars and webinars, with the means to disseminate and communicate them.',
  'Gathering the expertise needed — academics, researchers, field experts — with the support of a scientific committee.',
  'Partnerships with actors of intellectual life and research, public authorities, local bodies and the media.',
  'Cooperation between regions, to pool knowledge in an interdisciplinary spirit.',
  'Publishing assistance through the Group’s own publishing house.',
  'Participatory projects promoting research, dialogue between cultures, parity and education.',
  'Support and visibility for researchers through the Group’s communication agency.',
  'Surveys, research and national studies.',
];
const AXES = [
  'History, hermeneutics and phenomenology in African contexts',
  'Endogenous knowledge, epistemologies, rationalities, African cultures and societies',
  'Ontology and African philosophy of religion',
  'Philosophy of art and African aesthetics',
  'Politics, ethics, identity & gender, major contemporary issues',
];

export default function APropos() {
  return (
    <>
      <header className="border-b border-ink/10 bg-cream/60">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <p className="kicker">About</p>
          <h1 className="display-title mt-2 text-4xl text-ink sm:text-5xl">The Groupe JOGOO</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">“Association of the Philosophers of the Rooster’s Crow”: a project of reflection on philosophical thought as a whole.</p>
          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ['2010', 'Founded'],
              ['2023', 'Registered as an association'],
              ['6', 'Autonomous sub-sites'],
              ['10', 'Research areas'],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-brand text-3xl font-black text-terra">{n}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-16 px-5 py-16">
        <section>
          <h2 className="display-title text-3xl text-ink">The project</h2>
          <div className="mt-5 space-y-4 text-[1.02rem] leading-relaxed text-ink-soft">
            <p>
              Founded in 2010, the Groupe JOGOO was registered as an association under Cameroonian law on 15 March 2023 (no. 00000423/RDA/JO6/BAPP), under the acronym ASPHICC-JOGOO. It is a project of reflection on philosophical thought as a whole, which seeks to situate its stakes in relation to Black thought — by Africans and non-Africans alike — on the problems and questions of the human.
            </p>
            <p>
              <em>Jogoo</em> means “rooster” in Swahili. Unlike Hegel’s owl, a creature of dusk, the rooster is the animal of dawn: the one that wakes us up and sets us to work. The basic African colour palette — black, red, white and yellow ochre — shapes the Group’s visual identity.
            </p>
          </div>
        </section>

        <section className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="kicker">Six priorities</p>
            <h2 className="display-title mt-2 text-3xl text-ink">Aims</h2>
            <ol className="mt-5 space-y-3">
              {OBJECTIFS.map((o, i) => (
                <li key={i} className="flex gap-3 text-[0.97rem] leading-relaxed text-ink-soft">
                  <span className="font-brand text-sm font-black text-terra">{String(i + 1).padStart(2, '0')}</span>
                  {o}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="kicker">Levers</p>
            <h2 className="display-title mt-2 text-3xl text-ink">Means of action</h2>
            <ul className="mt-5 space-y-3">
              {MOYENS.map((m, i) => (
                <li key={i} className="flex gap-3 text-[0.97rem] leading-relaxed text-ink-soft">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="display-title text-3xl text-ink">Research areas</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {AXES.map((a) => (
              <li key={a} className="bg-white p-4 text-[0.95rem] text-ink shadow-[0_1px_2px_rgba(26,26,26,0.04),0_10px_26px_-20px_rgba(26,26,26,0.3)]">
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="display-title text-3xl text-ink">Editorial line</h2>
            <p className="mt-5 text-[0.97rem] leading-relaxed text-ink-soft">
              All content on this site is free to read — posts, short news, columns and peer-reviewed articles in the journal it hosts. The aim is to help disseminate African philosophy, too often undervalued because it is little or poorly known. Content is published under the intellectual authority of the Groupe JOGOO and, unless stated otherwise, under a Creative Commons Attribution – NonCommercial – NoDerivs 3.0 France licence.
            </p>
          </div>
          <div>
            <h2 className="display-title text-3xl text-ink">Governance</h2>
            <dl className="mt-5 space-y-3 text-[0.97rem]">
              <div>
                <dt className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-terra">President &amp; publication director</dt>
                <dd className="text-ink">Yannick Essengue</dd>
              </div>
              <div>
                <dt className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-terra">Vice-presidents</dt>
                <dd className="text-ink">Adoulou N. Bitang &amp; Sandrine Kongoue</dd>
              </div>
              <div>
                <dt className="font-brand text-xs font-bold uppercase tracking-[0.14em] text-terra">Secretary general</dt>
                <dd className="text-ink">Jean René Mabwilo</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm text-ink-soft">
              Scientific committee, statutes, membership and support:{' '}
              <a href="mailto:philoafricaine@gmail.com" className="font-semibold text-terra-deep underline underline-offset-2">
                philoafricaine@gmail.com
              </a>
            </p>
          </div>
        </section>

        <blockquote className="border-l-0 bg-ink p-8 text-paper">
          <p className="font-serif text-xl italic leading-relaxed">
            “Philosophy only begins with the decision to subject the philosophical and cultural heritage to an uncompromising critique.”
          </p>
          <footer className="mt-4 text-sm text-gold">— Marcien Towa, <em>Essai sur la problématique philosophique dans l’Afrique actuelle</em>, 1971 (our translation)</footer>
        </blockquote>
      </div>
    </>
  );
}

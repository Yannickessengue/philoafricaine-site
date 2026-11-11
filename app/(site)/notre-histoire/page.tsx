import { reader } from '@/lib/content';
import { EnTete } from '@/components/ui';
import { Galerie, AfficheZoom } from '@/components/Galerie';

export const metadata = {
  title: 'Notre histoire',
  description: 'Chronologie des activités du Groupe JOGOO depuis 2010 : conférences, colloques, journées d’étude, séminaires et webinaires, avec affiches et photos.',
};

const TYPES: Record<string, string> = {
  institution: 'Institution',
  fondation: 'Fondation',
  conference: 'Conférence',
  colloque: 'Colloque',
  journee: 'Journée d’étude',
  seminaire: 'Séminaire',
  webinaire: 'Webinaire',
  masterclass: 'MasterClass',
  hommage: 'Hommage',
  lancement: 'Lancement',
};

export default async function NotreHistoire() {
  const tous = (await reader.collections.chronologie.all()).sort((a, b) => (a.entry.date ?? '').localeCompare(b.entry.date ?? ''));
  const annees = new Map<string, typeof tous>();
  for (const e of tous) {
    const a = (e.entry.date ?? '').slice(0, 4);
    if (!annees.has(a)) annees.set(a, []);
    annees.get(a)!.push(e);
  }
  const presentiel = tous.filter((e) => /présentiel|hybride/i.test(e.entry.format ?? '')).length;

  return (
    <>
      <EnTete
        kicker="Le Groupe · Mémoire"
        titre="Notre histoire"
        intro={
          <>
            De « Philosophie africaine. Débats &amp; Questions » (2010) au Groupe JOGOO : {tous.length} rendez-vous, dont {presentiel} en présentiel ou en hybride, d’Abidjan à
            Yaoundé, de Cotonou à Toulouse et Montréal.
          </>
        }
        icone="sankofa"
      />
      <nav aria-label="Années" className="sticky top-[76px] z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 py-3">
          {[...annees.keys()].map((a) => (
            <a key={a} href={`#annee-${a}`} className="shrink-0 px-3 py-1 font-brand text-xs font-bold tracking-[0.12em] text-ink/60 transition-colors hover:bg-terra hover:text-white">
              {a}
            </a>
          ))}
        </div>
      </nav>
      <div className="mx-auto max-w-5xl px-5 py-14">
        <ol className="relative border-l-2 border-terra/30 pl-6 sm:pl-10">
          {[...annees.entries()].map(([annee, liste]) => (
            <li key={annee} id={`annee-${annee}`} className="mb-14 scroll-mt-32">
              <span className="absolute -left-[9px] mt-2 h-4 w-4 rounded-full border-2 border-paper bg-terra" aria-hidden />
              <h2 className="display-title text-4xl text-terra sm:text-5xl">{annee}</h2>
              <div className="mt-6 space-y-10">
                {liste.map(({ slug, entry: e }) => {
                  const enSalle = /présentiel|hybride/i.test(e.format ?? '');
                  return (
                    <article key={slug} id={slug} className="scroll-mt-32">
                      <div className={e.affiche ? 'grid gap-6 sm:grid-cols-[180px_1fr]' : ''}>
                        {e.affiche && (
                          <div className="max-w-[220px]">
                            <AfficheZoom src={e.affiche} titre={e.titre} />
                          </div>
                        )}
                        <div>
                          <p className="font-brand text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink/55">
                            <span className={enSalle ? 'text-terra' : ''}>{TYPES[e.categorie] ?? e.categorie}</span>
                            {e.format && e.format !== '—' && <> · {e.format}</>} · {e.dateAffichee}
                          </p>
                          <h3 className="mt-1 text-left font-brand text-xl font-bold leading-snug text-ink sm:text-2xl">{e.titre}</h3>
                          {e.lieu && e.lieu !== '—' && <p className="mt-1 text-sm text-ink/70">{e.lieu}</p>}
                          {e.presentation && <p className="mt-3 max-w-2xl text-left leading-relaxed text-ink/85">{e.presentation}</p>}
                          {e.intervenants && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">{e.intervenants}</p>}
                        </div>
                      </div>
                      {e.photos.length > 0 && <Galerie images={[...e.photos]} titre={e.titre} />}
                    </article>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm italic text-ink/55">
          Cette chronologie se complète au fil des archives retrouvées. Une photo, une affiche ou une date à ajouter ? Écrivez à philoafricaine@gmail.com.
        </p>
      </div>
    </>
  );
}

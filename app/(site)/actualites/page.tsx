import { getActualites, getAgenda, reader, dateFr, sansEmail } from '@/lib/content';
import { EnTete, TitreSection, Lieu } from '@/components/ui';
import { debut, rendre, type Classes } from '@/components/Prose';
import { Lateral } from '@/components/Lateral';

export const metadata = { title: 'Actualités', description: 'Ce qui vient de paraître, ce qui se prépare, ce qui se discute.' };
export const revalidate = 3600;

const prose: Classes = {};

function LiensRdv({ a }: { a: { slug: string; entry: { inscription?: boolean; fichier?: string | null; enDirect?: boolean } } }) {
  if (!a.entry.inscription && !a.entry.fichier && !a.entry.enDirect) return null;
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      {a.entry.inscription && (
        <a className="bg-terra px-3.5 py-1.5 font-brand text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white hover:bg-ink" href={`/inscription/${a.slug}`}>
          S’inscrire
        </a>
      )}
      {a.entry.fichier && (
        <a className="font-semibold text-terra-deep underline underline-offset-2 hover:text-terra" href={a.entry.fichier} target="_blank" rel="noreferrer">
          PDF
        </a>
      )}
      {a.entry.enDirect && (
        <a className="inline-flex items-center gap-1.5 font-semibold text-ink underline underline-offset-2 hover:text-terra" href="/direct">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e53935]" /> En direct sur le site
        </a>
      )}
    </p>
  );
}

export default async function Actualites() {
  const [actus, agenda, reglages] = await Promise.all([getActualites(), getAgenda(), reader.singletons.reglages.read()]);
  const mois = new Date().toISOString().slice(0, 7);
  const aVenir = agenda.filter((a) => a.entry.date!.slice(0, 7) >= mois);
  const passes = agenda.filter((a) => a.entry.date!.slice(0, 7) < mois).reverse();
  const [prochain, ...suite] = aVenir;
  const [une, ...autres] = actus;
  const textes = await Promise.all(actus.map(async (a) => (await a.entry.contenu()).node));
  const enCours = reglages?.enCours ?? [];

  const Meta = ({ a }: { a: (typeof actus)[number] }) => (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-ink/50">
      {a.entry.auteur && <span className="font-semibold text-terra-deep">{sansEmail(a.entry.auteur)}</span>}
      {a.entry.auteur && <span aria-hidden="true">·</span>}
      <time dateTime={a.entry.date ?? undefined}>{dateFr(a.entry.date)}</time>
    </p>
  );
  const Suite = ({ slug }: { slug: string }) => (
    <a href={`/actualites/${slug}`} className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-terra-deep hover:text-terra">
      Lire la suite
      <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
    </a>
  );

  return (
    <>
      <EnTete kicker="Portail · Suivre le Groupe" titre="Actualités" intro="Ce qui vient de paraître, ce qui se prépare, ce qui se discute." icone={null} />
      <div className="mx-auto max-w-6xl space-y-16 px-5 py-16">
        {prochain && (
          <section className="relative overflow-hidden border border-terra/25 bg-terra-deep text-paper">
            <div className={`relative grid gap-6 p-7 sm:p-10 md:items-center md:gap-10 ${prochain.entry.affiche ? 'md:grid-cols-[auto_1fr_auto]' : 'md:grid-cols-[auto_1fr]'}`}>
              <div className="shrink-0">
                <p className="font-brand text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gold">Prochain événement</p>
                <p className="mt-2 font-brand text-4xl font-black leading-none text-paper sm:text-5xl">
                  {prochain.entry.aConfirmer ? 'Date à confirmer' : prochain.entry.dateAffichee || dateFr(prochain.entry.date)}
                </p>
              </div>
              <div className="border-t border-paper/15 pt-5 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                <time className="text-sm font-semibold uppercase tracking-wide text-paper/70" dateTime={prochain.entry.date ?? undefined}>
                  {prochain.entry.dateAffichee || dateFr(prochain.entry.date)}
                </time>
                <p className="mt-2 max-w-2xl font-serif text-xl italic leading-snug text-paper sm:text-2xl">{prochain.entry.intitule}</p>
                {prochain.entry.lieu && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-paper/70">
                    <Lieu />
                    {[prochain.entry.heure, prochain.entry.lieu].filter(Boolean).join(' · ')}
                  </p>
                )}
                {prochain.entry.presentation && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper/80">{prochain.entry.presentation}</p>}
                <div className="mt-5 flex flex-wrap gap-3">
                  {prochain.entry.inscription && (
                    <a href={`/inscription/${prochain.slug}`} className="bg-paper px-4 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.08em] text-ink hover:bg-gold">
                      S’inscrire
                    </a>
                  )}
                  {prochain.entry.fichier && (
                    <a href={prochain.entry.fichier} target="_blank" rel="noreferrer" className="border border-paper/40 px-4 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.08em] text-paper hover:bg-paper hover:text-ink">
                      Télécharger le PDF
                    </a>
                  )}
                  {prochain.entry.enDirect && (
                    <a href="/direct" className="inline-flex items-center gap-2 border border-paper/40 px-4 py-2.5 font-brand text-xs font-bold uppercase tracking-[0.08em] text-paper hover:bg-paper hover:text-ink">
                      <span className="h-2 w-2 rounded-full bg-[#ff5a4f]" /> Suivre en direct
                    </a>
                  )}
                </div>
              </div>
              {prochain.entry.affiche && (
                <a href={prochain.entry.affiche} target="_blank" rel="noreferrer" className="block justify-self-center">
                  <img src={prochain.entry.affiche} alt={`Affiche : ${prochain.entry.intitule}`} decoding="async" className="max-h-80 w-auto max-w-full shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]" />
                </a>
              )}
            </div>
          </section>
        )}

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_19.5rem]">
        <div className="min-w-0 space-y-16">
        <section>
          <TitreSection kicker="Groupe JOGOO" titre="Actualités" />
          {une && (
            <div className="mt-8">
              <article className="overflow-hidden border border-ink/12 bg-white">
                <a href={`/actualites/${une.slug}`} className="cadre block aspect-[16/9]">
                  {une.entry.image && <img alt={une.entry.imageDescription ?? ''} src={une.entry.image} className="transition duration-500 hover:scale-[1.02]" />}
                </a>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <p className="kicker">À la une</p>
                  <h3 className="display-title mt-2 text-2xl text-ink sm:text-3xl">
                    <a href={`/actualites/${une.slug}`} className="hover:text-terra">
                      {une.entry.titre}
                    </a>
                  </h3>
                  <Meta a={une} />
                  {(() => {
                    const d = debut(textes[0], 900);
                    return (
                      <>
                        <div className="prose-jogoo prose-jogoo--flash mt-5 max-w-none">{rendre(d.noeuds, prose)}</div>
                        <Suite slug={une.slug} />
                      </>
                    );
                  })()}
                </div>
              </article>
            </div>
          )}
          {autres.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {autres.map((a, i) => {
                const d = debut(textes[i + 1], 420);
                return (
                  <article key={a.slug} className="flex flex-col border border-ink/12 bg-white">
                    {a.entry.image && (
                      <a href={`/actualites/${a.slug}`} className="cadre aspect-[16/10]">
                        <img alt={a.entry.imageDescription ?? ''} src={a.entry.image} loading="lazy" className="transition duration-500 hover:scale-[1.02]" />
                      </a>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="display-title text-xl text-ink">
                        <a href={`/actualites/${a.slug}`} className="hover:text-terra">
                          {a.entry.titre}
                        </a>
                      </h3>
                      <Meta a={a} />
                      <div className="prose-jogoo mt-4 max-w-none">{rendre(d.noeuds, prose)}</div>
                      <div className="mt-auto">{d.tronque && <Suite slug={a.slug} />}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {enCours.length > 0 && (
            <div className="mt-6 border border-terra/50 bg-cream/40 px-6 py-5 text-center">
              <p className="display-title text-lg text-terra">En cours</p>
              <div className="mt-2 text-sm text-ink-soft">
                <ul className="mt-1 space-y-1">
                  {enCours.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section id="agenda" className="scroll-mt-24">
          <hr className="rule-dotted mb-14" />
          <TitreSection kicker="Colloques, séminaires, journées d’étude" titre="Agenda" />
          <div className="mt-8">
            {suite.length > 0 ? (
              <ol className="border-l-2 border-terra/30">
                {suite.map((a) => (
                  <li key={a.slug} className="relative mb-8 pl-7 last:mb-0">
                    <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-terra" />
                    <time className="kicker text-terra-deep" dateTime={a.entry.date ?? undefined}>
                      {a.entry.dateAffichee || dateFr(a.entry.date)}
                      {a.entry.aConfirmer && <span className="ml-2 font-normal normal-case text-ink/45">· date à confirmer</span>}
                    </time>
                    <p className="mt-1 max-w-2xl text-[0.97rem] leading-snug text-ink">{a.entry.intitule}</p>
                    {(a.entry.lieu || a.entry.heure) && <p className="mt-0.5 text-sm text-ink/55">{[a.entry.heure, a.entry.lieu].filter(Boolean).join(' · ')}</p>}
                    {a.entry.presentation && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{a.entry.presentation}</p>}
                    <LiensRdv a={a} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-soft">Aucun autre rendez-vous annoncé pour le moment.</p>
            )}
            {passes.length > 0 && (
              <div className="mt-10">
                <details className="group border border-ink/10 bg-cream/40 open:bg-cream/60">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-brand text-sm font-semibold uppercase tracking-wide text-ink/60 transition-colors hover:text-terra-deep [&::-webkit-details-marker]:hidden">
                    <span>
                      Événements passés <span className="text-ink/35">({passes.length})</span>
                    </span>
                    <span aria-hidden="true" className="text-ink/40 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <ul className="divide-y divide-ink/10 px-5 pb-5">
                    {passes.map((a) => (
                      <li key={a.slug} className="flex flex-col gap-0.5 py-3 text-sm sm:flex-row sm:items-baseline sm:gap-4">
                        <time className="shrink-0 text-xs uppercase tracking-wide text-ink/45 sm:w-40" dateTime={a.entry.date ?? undefined}>
                          {a.entry.dateAffichee || dateFr(a.entry.date)}
                        </time>
                        <span className="text-ink/70">
                          {a.entry.intitule}
                          {a.entry.lieu && <span className="text-ink/45"> — {a.entry.lieu}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        </section>
        </div>
        <Lateral sansAgenda />
        </div>
      </div>
    </>
  );
}

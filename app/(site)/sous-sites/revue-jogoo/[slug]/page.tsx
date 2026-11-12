import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import { Partage } from '@/components/Partage';
import { partage } from '@/lib/apercu';
import { reader, getRevue, sousEmbargo, finEmbargo, dateFr, motsCles } from '@/lib/content';
import { Prose } from '@/components/Prose';
import { Html } from '@/components/Html';
import { fragment, pageStatique } from '@/lib/gabarits';

// Pages régénérées chaque jour : l'embargo se lève automatiquement à la date prévue.
export const revalidate = 86400;

const RUBRIQUES: Record<string, string> = { presentation: 'Présentation du numéro', archive: 'Texte d’archive', article: 'Article', recension: 'Recension' };
const LANGUES: Record<string, string> = { fr: 'Français', en: 'English', es: 'Español', pt: 'Português', ar: 'العربية' };
const FIXES = ['a-propos', 'comites', 'publier', 'dossier-fondateur'];

export async function generateStaticParams() {
  const articles = (await reader.collections.revue.list()).map((slug) => ({ slug }));
  return [...articles, ...FIXES.map((slug) => ({ slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.revue.read(slug);
  if (a) return { title: `${a.titre} · Revue JOGOO`, description: a.resume ?? undefined, ...partage(a.titre, a.resume, 'Revue JOGOO · N° 1', null, a.auteurs) };
  const s = pageStatique(`/sous-sites/revue-jogoo/${slug}`);
  return s ? { title: s.titre, description: s.description } : {};
}

const nbPages = (p?: string | null) => {
  const m = p?.match(/(\d+)\s*[-–]\s*(\d+)/);
  return m ? Number(m[2]) - Number(m[1]) + 1 : null;
};

export default async function RevuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.revue.read(slug);

  if (!a) {
    // Pages fixes de la revue (À propos, Comités, Publier, Numéro 1) : gabarit d'origine
    const s = pageStatique(`/sous-sites/revue-jogoo/${slug}`);
    if (!s) notFound();
    return <Html html={s.html} />;
  }

  const tous = await getRevue();
  const pos = tous.findIndex((x) => x.slug === slug);
  const precedent = pos > 0 ? tous[pos - 1] : undefined;
  const suivant = pos >= 0 ? tous[pos + 1] : undefined;
  const memeAuteur = tous.filter((x) => x.slug !== slug && x.entry.auteurs && x.entry.auteurs === a.auteurs);
  const embargo = sousEmbargo(a.datePublication!, a.embargoMois);
  const fin = dateFr(finEmbargo(a.datePublication!, a.embargoMois).toISOString().slice(0, 10));
  const { node } = await a.contenu();
  const aDuTexte = node.children.length > 0;
  const rubrique = a.section || RUBRIQUES[a.rubrique];
  const n = nbPages(a.pages);
  const pagination = a.pages?.replace(/^p\.\s*/, '');
  const [numeroTitre] = (a.numero ?? '').match(/«\s*([^»]+?)\s*»/)?.slice(1) ?? ['L’être africain'];
  const mots = motsCles(a.motsCles);
  const ancres = [['resume', 'Résumé'], ['texte', 'Texte intégral'], ['citer', 'Pour citer'], ['auteur', 'Auteur']].filter(
    ([id]) => (id === 'resume' ? a.resume : id === 'citer' ? a.citation : id === 'auteur' ? a.bio : true),
  );

  return (
    <>
      <Html html={fragment('revue-bandeau')} />
      <header className="border-b border-ink/10 bg-cream/60">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
          <p className="text-xs text-ink/55">
            <a className="hover:text-terra" href="/sous-sites/revue-jogoo/dossier-fondateur">
              {numeroTitre}
            </a>{' '}
            — {dateFr(a.datePublication, { month: 'long', year: 'numeric' }).replace(/^./, (c) => c.toUpperCase())}
          </p>
          <p className="kicker mt-6">{rubrique}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-[1.7rem] font-bold leading-[1.15] text-ink [text-wrap:balance] sm:text-[2.3rem]" lang={a.langue && a.langue !== 'fr' ? a.langue : undefined}>
            {a.titre}
          </h1>
          <div className="mt-5 border-l-2 border-terra pl-4">
            <p className="font-brand text-[0.95rem] font-bold text-ink">{a.auteurs}</p>
            {a.affiliation && <p className="text-sm italic text-ink/60">{a.affiliation}</p>}
          </div>
          <Partage url={`${SITE}/sous-sites/revue-jogoo/${slug}`} titre={a.titre} accroche={a.auteurs ?? undefined} hashtags={['RevueJOGOO', 'PhilosophieAfricaine']} commentaires={false} className="mt-6" />
        </div>
      </header>
      <nav aria-label="Sections de l’article" className="border-b border-ink/10 bg-cream/40">
        <ul className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-1 px-6 py-3">
          {ancres.map(([id, l]) => (
            <li key={id}>
              <a className="font-brand text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink/50 underline-offset-4 transition-colors hover:text-terra-deep hover:underline" href={`#${id}`}>
                {l}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
          <article className="min-w-0">
            {a.resume && (
              <div className="scroll-mt-28 space-y-4" id="resume">
                <section className="border border-ink/12 bg-white p-5 sm:p-6">
                  <p className="kicker">Résumé</p>
                  <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-ink-soft">{a.resume}</p>
                  {mots.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {mots.map((m) => (
                        <li key={m} className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-ink-soft">
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}

            <section className="mt-10 scroll-mt-28" id="texte">
              <div className="flex flex-col gap-3 border-b-2 border-terra/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="kicker">Texte intégral</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Fac-similé{n ? ` · ${n} page${n > 1 ? 's' : ''}` : ''}
                    {pagination ? ` · p. ${pagination}` : ''}
                  </p>
                </div>
                {a.pdf && !embargo && (
                  <a className="inline-flex shrink-0 items-center gap-2 bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra" href={a.pdf} target="_blank" rel="noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 3v13m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Télécharger le PDF
                  </a>
                )}
              </div>
              {a.pdf ? (
                <>
                  <object aria-label={`Texte intégral — ${a.titre}`} className="mt-4 h-[85vh] w-full border border-ink/12 bg-ink/[0.03]" data={embargo ? `${a.pdf}?lecture=1#toolbar=0&navpanes=0&view=FitH` : `${a.pdf}#navpanes=0&view=FitH`} type="application/pdf">
                    <div className="grid h-full place-items-center p-6 text-center text-sm text-ink-soft">
                      {embargo ? (
                        <p>L’aperçu du texte ne s’affiche pas dans ce navigateur. Essayez depuis un ordinateur ou un autre navigateur.</p>
                      ) : (
                        <p>
                          L’aperçu du PDF ne s’affiche pas dans ce navigateur.{' '}
                          <a className="font-semibold text-terra-deep underline" href={a.pdf} target="_blank" rel="noreferrer">
                            Télécharger le texte intégral
                          </a>
                          .
                        </p>
                      )}
                    </div>
                  </object>
                  <p className="mt-2 text-xs text-ink/45">
                    {embargo
                      ? <>Lecture en ligne libre dès la parution. Le téléchargement du PDF sera ouvert à partir du <strong className="text-ink/70">{fin}</strong>, six mois après la parution du numéro.</>
                      : 'Le fac-similé PDF fait foi. Sur mobile, utilisez le bouton « Télécharger ».'}
                  </p>
                </>
              ) : null}
              {aDuTexte && <Prose node={node} className="mt-8 !max-w-none" />}
            </section>

            {a.bio && (
              <section className="mt-10 scroll-mt-28" id="auteur">
                <p className="kicker">{a.auteurs}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.bio}</p>
              </section>
            )}
            {a.citation && (
              <section className="mt-10 scroll-mt-28" id="citer">
                <p className="kicker">Pour citer cet article</p>
                <p className="mt-2 border-l-2 border-terra bg-cream/40 px-4 py-3 text-sm leading-relaxed text-ink-soft">{a.citation}</p>
              </section>
            )}
            <p className="mt-8 text-xs leading-relaxed text-ink/45">
              Contribution parue dans le n° 1 de la revue, « {numeroTitre} » (Éditions JOGOO, {dateFr(a.datePublication, { month: 'long', year: 'numeric' })}). Voir la{' '}
              <a className="underline hover:text-terra" href="/sous-sites/revue-jogoo/a-propos">
                politique éditoriale et les mentions
              </a>
              .
            </p>
            <nav className="mt-10 grid gap-3 border-t border-ink/10 pt-6 sm:grid-cols-2">
              {precedent ? (
                <a className="group border border-ink/12 bg-white p-4 transition-colors hover:border-terra" href={`/sous-sites/revue-jogoo/${precedent.slug}`}>
                  <span className="kicker">← Précédent</span>
                  <span className="mt-1 block font-serif text-sm font-bold leading-snug text-ink group-hover:text-terra-deep">{precedent.entry.titre}</span>
                </a>
              ) : (
                <span className="hidden sm:block" />
              )}
              {suivant && (
                <a className="group border border-ink/12 bg-white p-4 transition-colors hover:border-terra sm:text-right" href={`/sous-sites/revue-jogoo/${suivant.slug}`}>
                  <span className="kicker">Suivant →</span>
                  <span className="mt-1 block font-serif text-sm font-bold leading-snug text-ink group-hover:text-terra-deep">{suivant.entry.titre}</span>
                </a>
              )}
            </nav>
          </article>

          <aside className="mt-12 space-y-7 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
            <div className="border border-ink/12 bg-white p-4">
              <p className="kicker">Cet article</p>
              <dl className="mt-2 space-y-1.5 text-xs">
                {pagination && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink/50">Pagination</dt>
                    <dd className="text-ink">p. {pagination}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/50">Langue</dt>
                  <dd className="text-ink">{LANGUES[a.langue ?? 'fr']}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/50">Rubrique</dt>
                  <dd className="text-right text-ink">{rubrique}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/50">Accès</dt>
                  <dd className={`text-right ${embargo ? 'text-terra-deep' : 'text-ink'}`}>{embargo ? `Lecture libre · PDF le ${fin}` : 'Libre'}</dd>
                </div>
              </dl>
              {a.pdf && !embargo && (
                <a className="mt-3 block bg-ink px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-terra" href={a.pdf} target="_blank" rel="noreferrer">
                  PDF{n ? ` (${n} p.)` : ''}
                </a>
              )}
            </div>
            {memeAuteur.length > 0 && (
              <div>
                <p className="kicker">Du même auteur</p>
                <ul className="mt-2 divide-y divide-ink/8">
                  {memeAuteur.map((x) => (
                    <li key={x.slug}>
                      <a className="group -mx-2 flex items-start gap-2 rounded-md px-2 py-2 transition-colors hover:bg-cream/70" href={`/sous-sites/revue-jogoo/${x.slug}`}>
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-[0.92rem] font-medium leading-snug text-terra-deep underline-offset-2 group-hover:underline">{x.entry.titre}</span>
                          <span className="text-xs text-ink/45">{x.entry.auteurs}</span>
                        </span>
                        <span aria-hidden="true" className="mt-0.5 shrink-0 text-terra/50 transition-all group-hover:translate-x-0.5 group-hover:text-terra">
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <a className="block text-xs font-semibold uppercase tracking-wide text-terra-deep hover:text-terra" href="/sous-sites/revue-jogoo/dossier-fondateur">
              ← Sommaire du volume
            </a>
          </aside>
        </div>
      </div>
      <Html html={fragment('revue-pied')} />
    </>
  );
}

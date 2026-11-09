import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getRevue, getPageByPath, sousEmbargo, finEmbargo, dateFr, motsCles } from '@/lib/content';
import { Prose, TexteSimple } from '@/components/Prose';
import { EnTete, Index } from '@/components/ui';
import { RevueBandeau, StatutAcces } from '@/components/Revue';

// Les pages sont régénérées chaque jour : l'embargo se lève automatiquement à la date prévue.
export const revalidate = 86400;

const rubriques: Record<string, string> = {
  presentation: 'Présentation du numéro', archive: 'Texte d’archive', article: 'Article', recension: 'Recension',
};

export async function generateStaticParams() {
  const articles = (await reader.collections.revue.list()).map((slug) => ({ slug }));
  const fixes = ['a-propos', 'comites', 'publier', 'dossier-fondateur'].map((slug) => ({ slug }));
  return [...articles, ...fixes];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.revue.read(slug);
  if (a) return { title: `${a.titre} · Revue JOGOO`, description: a.resume ?? undefined };
  const p = await getPageByPath(`/sous-sites/revue-jogoo/${slug}`);
  return p ? { title: `${p.entry.titre} · Revue JOGOO`, description: p.entry.description ?? undefined } : {};
}

export default async function RevuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await reader.collections.revue.read(slug);

  if (!a) {
    // Pages fixes de la revue (À propos, Comités, Publier, Numéro 1)
    const page = await getPageByPath(`/sous-sites/revue-jogoo/${slug}`);
    if (!page) notFound();
    const { node } = await page.entry.contenu();
    const sommaire = slug === 'dossier-fondateur' ? await getRevue() : [];
    return (
      <>
        <RevueBandeau />
        <EnTete kicker={slug === 'dossier-fondateur' ? 'Numéro 1 · Octobre 2026' : 'Revue JOGOO'} titre={page.entry.titre} intro={page.entry.description} />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {sommaire.length > 0 && (
            <section className="mb-20 space-y-14">
              {[...new Set(sommaire.map((x) => x.entry.section || rubriques[x.entry.rubrique]))].map((sec) => (
                <div key={sec} className="grid gap-6 md:grid-cols-12 md:gap-10">
                  <h2 className="titre titre-m italic md:col-span-4">{sec}</h2>
                  <ol className="border-t border-ink md:col-span-8">
                    {sommaire.filter((x) => (x.entry.section || rubriques[x.entry.rubrique]) === sec).map((x) => (
                      <Index key={x.slug} n={x.entry.ordre!} href={`/sous-sites/revue-jogoo/${x.slug}`}
                        titre={x.entry.titre} meta={[x.entry.auteurs, x.entry.pages].filter(Boolean).join(' · ')}
                        aside={<StatutAcces date={x.entry.datePublication!} mois={x.entry.embargoMois} />} />
                    ))}
                  </ol>
                </div>
              ))}
            </section>
          )}
          <Prose node={node} />
        </div>
      </>
    );
  }

  const embargo = sousEmbargo(a.datePublication!, a.embargoMois);
  const fin = dateFr(finEmbargo(a.datePublication!, a.embargoMois).toISOString().slice(0, 10));
  const { node } = await a.contenu();
  const aDuTexte = node.children.length > 0;
  return (
    <>
      <RevueBandeau />
      <article className="mx-auto max-w-4xl px-5 pt-14 sm:px-8">
        <div className="text-center">
          <Link href="/sous-sites/revue-jogoo/dossier-fondateur" className="label hover:!text-terra">← {a.numero}</Link>
          <p className="label label-accent mt-10">{a.section || rubriques[a.rubrique]}{a.pages && ` · ${a.pages}`}</p>
          <h1 className="titre titre-xl mt-5 !text-[clamp(2rem,4.4vw,3.6rem)]">{a.titre}</h1>
          <p className="mt-6 font-serif text-xl italic text-ink">{a.auteurs}</p>
          {a.affiliation && <p className="mt-2 text-sm text-mute">{a.affiliation}</p>}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <StatutAcces date={a.datePublication!} mois={a.embargoMois} />
            <span className="label">Paru en {dateFr(a.datePublication, { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="aube mt-14" aria-hidden />

        {a.resume && (
          <section className="mx-auto mt-14 max-w-[40rem]">
            <h2 className="label">Résumé</h2>
            <TexteSimple texte={a.resume} className="mt-4 [&>*]:!mx-0" />
            {motsCles(a.motsCles).length > 0 && <p className="mt-2 text-[0.82rem] text-mute"><span className="label mr-2">Mots-clés</span>{motsCles(a.motsCles).join(' · ')}</p>}
          </section>
        )}

        <section className="mx-auto mt-14 max-w-[40rem]">
          <h2 className="label">Texte intégral</h2>
          {embargo ? (
            <div className="mt-5 bg-paper-deep px-8 py-9 text-center">
              <p className="font-serif text-xl text-ink">Sous embargo jusqu’au <em>{fin}</em></p>
              <p className="mx-auto mt-4 max-w-md text-[0.92rem] leading-relaxed text-ink-soft">
                Le texte intégral sera en libre accès à cette date, six mois après la parution du numéro.
                D’ici là, le numéro peut être obtenu auprès des Éditions JOGOO.
              </p>
            </div>
          ) : (
            <>
              {a.pdf && <a href={a.pdf} className="bouton mt-5">Lire le PDF</a>}
              {aDuTexte && <Prose node={node} className="mt-10 [&>*]:!mx-0" />}
            </>
          )}
        </section>

        {a.bio && (
          <section className="mx-auto mt-14 max-w-[40rem] border-t border-line pt-8">
            <h2 className="label">L’auteur</h2>
            <p className="mt-3 leading-relaxed text-ink-soft"><span className="font-serif italic text-ink">{a.auteurs}</span> — {a.bio}</p>
          </section>
        )}
        {a.citation && (
          <section className="mx-auto mt-10 max-w-[40rem]">
            <h2 className="label">Pour citer cet article</h2>
            <p className="mt-3 font-serif text-[0.92rem] leading-relaxed text-ink-soft">{a.citation}</p>
          </section>
        )}
        <div className="aube mx-auto mt-16 max-w-[40rem]" aria-hidden />
      </article>
    </>
  );
}

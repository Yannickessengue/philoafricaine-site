import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader, getRevue, getPageByPath, sousEmbargo, finEmbargo, dateFr, motsCles } from '@/lib/content';
import { Prose } from '@/components/Prose';
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
    // Pages fixes de la revue (À propos, Comités, Publier, N° 1)
    const page = await getPageByPath(`/sous-sites/revue-jogoo/${slug}`);
    if (!page) notFound();
    const { node } = await page.entry.contenu();
    const sommaire = slug === 'dossier-fondateur' ? await getRevue() : [];
    return (
      <>
        <RevueBandeau />
        <div className="mx-auto max-w-4xl px-5 py-12">
          <h1 className="display-title text-3xl text-terra sm:text-4xl">{page.entry.titre}</h1>
          {sommaire.length > 0 && (
            <section className="my-10">
              <h2 className="kicker">Sommaire du numéro</h2>
              <ol className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                {sommaire.map((s) => (
                  <li key={s.slug} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
                    <div>
                      <p className="kicker !text-ink/50">{rubriques[s.entry.rubrique]}</p>
                      <Link href={`/sous-sites/revue-jogoo/${s.slug}`} className="font-serif text-lg text-ink hover:text-terra">{s.entry.titre}</Link>
                      <p className="text-sm text-ink/60">{s.entry.auteurs}{s.entry.pages && ` · ${s.entry.pages}`}</p>
                    </div>
                    <StatutAcces date={s.entry.datePublication!} mois={s.entry.embargoMois} />
                  </li>
                ))}
              </ol>
            </section>
          )}
          <Prose node={node} className="mt-8" />
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
      <article className="mx-auto max-w-3xl px-5 py-12">
        <Link href="/sous-sites/revue-jogoo/dossier-fondateur" className="kicker hover:text-terra">← {a.numero}</Link>
        <p className="kicker mt-6 !text-ink/50">{rubriques[a.rubrique]}</p>
        <h1 className="display-title mt-2 text-3xl text-ink sm:text-4xl">{a.titre}</h1>
        <p className="mt-3 font-serif text-lg italic text-ink-soft">{a.auteurs}</p>
        {a.affiliation && <p className="text-sm text-ink/60">{a.affiliation}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink/60">
          <StatutAcces date={a.datePublication!} mois={a.embargoMois} />
          <span>Publié en {dateFr(a.datePublication, { month: 'long', year: 'numeric' })}{a.pages && ` · ${a.pages}`}</span>
        </div>

        {a.resume && (
          <section className="mt-10">
            <h2 className="kicker">Résumé</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{a.resume}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {motsCles(a.motsCles).map((m) => <span key={m} className="bg-cream px-2 py-0.5 text-xs text-terra-deep">{m}</span>)}
            </div>
          </section>
        )}

        <section className="mt-10 border-y border-ink/10 py-8">
          <h2 className="kicker">Texte intégral</h2>
          {embargo ? (
            <div className="mt-4 bg-cream p-6">
              <p className="font-serif text-lg text-ink">Cet article est sous embargo jusqu’au <strong>{fin}</strong>.</p>
              <p className="mt-2 text-sm text-ink-soft">
                Le texte intégral et le PDF seront librement accessibles à cette date, six mois après la parution du numéro.
                Pour le consulter plus tôt, vous pouvez vous procurer le numéro auprès des Éditions JOGOO.
              </p>
            </div>
          ) : (
            <>
              {a.pdf && <a href={a.pdf} className="mt-4 inline-block bg-terra px-5 py-2.5 font-brand text-xs font-bold uppercase tracking-wider text-paper hover:bg-terra-deep">Télécharger le PDF</a>}
              {aDuTexte && <Prose node={node} className="mt-8" />}
            </>
          )}
        </section>

        {a.bio && (
          <section className="mt-8">
            <h2 className="kicker">Auteur</h2>
            <p className="mt-2 text-sm text-ink-soft"><strong className="text-ink">{a.auteurs}</strong> — {a.bio}</p>
          </section>
        )}
        {a.citation && (
          <section className="mt-8">
            <h2 className="kicker">Pour citer cet article</h2>
            <p className="mt-2 font-serif text-sm text-ink-soft">{a.citation}</p>
          </section>
        )}
      </article>
    </>
  );
}

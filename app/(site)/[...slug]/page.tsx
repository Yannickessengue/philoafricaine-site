import { notFound } from 'next/navigation';
import { getPages, getPageByPath } from '@/lib/content';
import { Prose } from '@/components/Prose';
import { Html } from '@/components/Html';
import { adressesStatiques, pageStatique } from '@/lib/gabarits';

const geresAilleurs = /^\/sous-sites\/revue-jogoo(\/[^/]+)?$/;

export async function generateStaticParams() {
  const adresses = new Set([...adressesStatiques(), ...(await getPages()).map((p) => p.entry.adresse ?? '')]);
  return [...adresses]
    .filter((a) => a && a !== '/' && !geresAilleurs.test(a))
    .map((a) => ({ slug: a.replace(/^\//, '').split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const adresse = '/' + (await params).slug.join('/');
  const s = pageStatique(adresse);
  if (s) return { title: s.titre, description: s.description };
  const p = await getPageByPath(adresse);
  return p ? { title: p.entry.titre, description: p.entry.description ?? undefined } : {};
}

export default async function PageFixe({ params }: { params: Promise<{ slug: string[] }> }) {
  const adresse = '/' + (await params).slug.join('/');
  // 1. Page d'origine, reproduite à l'identique
  const s = pageStatique(adresse);
  if (s) return <Html html={s.html} />;
  // 2. Page créée dans l'administration
  const page = await getPageByPath(adresse);
  if (!page) notFound();
  const { node } = await page.entry.contenu();
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <p className="kicker">Groupe JOGOO</p>
      <h1 className="display-title mt-2 text-4xl text-ink sm:text-5xl">{page.entry.titre}</h1>
      {page.entry.description && <p className="mt-4 max-w-2xl text-ink-soft">{page.entry.description}</p>}
      <div className="mt-10">
        <Prose node={node} />
      </div>
    </section>
  );
}

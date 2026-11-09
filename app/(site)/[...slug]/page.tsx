import { notFound } from 'next/navigation';
import { getPages, getPageByPath } from '@/lib/content';
import { Prose } from '@/components/Prose';
import { EnTete } from '@/components/ui';
import { RevueBandeau } from '@/components/Revue';

const geresAilleurs = /^\/sous-sites\/revue-jogoo\/[^/]+$/;

export async function generateStaticParams() {
  return (await getPages())
    .map((p) => p.entry.adresse ?? '')
    .filter((a) => a && a !== '/' && !geresAilleurs.test(a))
    .map((a) => ({ slug: a.replace(/^\//, '').split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const p = await getPageByPath('/' + (await params).slug.join('/'));
  return p ? { title: p.entry.titre, description: p.entry.description ?? undefined } : {};
}

export default async function PageFixe({ params }: { params: Promise<{ slug: string[] }> }) {
  const path = '/' + (await params).slug.join('/');
  const page = await getPageByPath(path);
  if (!page) notFound();
  const { node } = await page.entry.contenu();
  const revue = path.startsWith('/sous-sites/revue-jogoo');
  const rubrique = path.startsWith('/sous-sites') ? 'Sous-site' : path.startsWith('/philosophie-africaine') ? 'Philosophie africaine' : 'Groupe JOGOO';
  return (
    <>
      {revue && <RevueBandeau />}
      <EnTete kicker={rubrique} titre={page.entry.titre} intro={page.entry.description} />
      <div className="px-5 sm:px-8">
        <Prose node={node} />
        <div className="aube mx-auto mt-16 max-w-[40rem]" aria-hidden />
      </div>
    </>
  );
}

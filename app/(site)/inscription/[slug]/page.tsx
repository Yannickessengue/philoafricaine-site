import { notFound } from 'next/navigation';
import { getInscription, slugsInscription } from '@/lib/activites';
import { reader } from '@/lib/content';
import { PageActivite } from '@/components/PageActivite';

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await slugsInscription()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getInscription((await params).slug);
  return a ? { title: `Inscription · ${a.titre}`, description: `${a.quand} — ${a.lieu}` } : {};
}

export default async function Inscription({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getInscription(slug);
  if (!a) notFound();
  const e = await reader.collections.agenda.read(slug);
  return <PageActivite a={a} enDirect={Boolean(e?.enDirect)} />;
}

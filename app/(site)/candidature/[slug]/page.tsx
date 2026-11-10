import { notFound } from 'next/navigation';
import { getCandidature, slugsCandidature } from '@/lib/activites';
import { PageActivite } from '@/components/PageActivite';

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await slugsCandidature()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getCandidature((await params).slug);
  return a ? { title: `Candidature · ${a.titre}`, description: `${a.type} — ${a.limite}` } : {};
}

export default async function Candidature({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getCandidature(slug);
  if (!a) notFound();
  return <PageActivite a={a} />;
}

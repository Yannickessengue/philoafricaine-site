import { notFound } from 'next/navigation';
import KeystaticApp from './keystatic';
import { espaceRedactionOuvert } from '@/lib/espace-redaction';

export const metadata = { title: 'Espace rédaction', robots: { index: false, follow: false } };

export default function Layout() {
  if (!espaceRedactionOuvert) notFound();
  return <KeystaticApp />;
}

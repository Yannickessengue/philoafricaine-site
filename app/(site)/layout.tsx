import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { reader } from '@/lib/content';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const reglages = await reader.singletons.reglages.read();
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer mention={reglages?.mentionLegale} email={reglages?.email} />
    </>
  );
}

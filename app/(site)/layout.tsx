import { BarreSousSites } from '@/components/BarreSousSites';
import { Dock } from '@/components/Dock';
import { Html } from '@/components/Html';
import { Interactif } from '@/components/Interactif';
import { PiedAI } from '@/components/PiedAI';
import { fragment } from '@/lib/gabarits';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Html html={fragment('header')} />
      <BarreSousSites />
      <main className="flex-1">{children}</main>
      <PiedAI />
      <Html html={fragment('footer')} />
      <Interactif />
      <Dock />
    </>
  );
}

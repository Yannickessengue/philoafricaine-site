import { Dock } from '@/components/Dock';
import { Html } from '@/components/Html';
import { Interactif } from '@/components/Interactif';
import { fragment } from '@/lib/gabarits';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Html html={fragment('header')} />
      <main className="flex-1">{children}</main>
      <Html html={fragment('footer')} />
      <Interactif />
      <Dock />
    </>
  );
}

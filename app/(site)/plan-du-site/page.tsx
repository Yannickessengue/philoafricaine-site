import Link from 'next/link';
import { getPages, getEditos, getActualites, getPublications, getRevue } from '@/lib/content';
import { EnTete } from '@/components/ui';
import { menu } from '@/components/Header';

export const metadata = { title: 'Plan du site' };

export default async function Plan() {
  const [pages, editos, actus, pubs, revue] = await Promise.all([getPages(), getEditos(), getActualites(), getPublications(), getRevue()]);
  const Bloc = ({ titre, liens }: { titre: string; liens: [string, string][] }) => (
    <section>
      <h2 className="kicker">{titre}</h2>
      <ul className="mt-3 space-y-1.5 text-sm">{liens.map(([h, l]) => <li key={h}><Link href={h} className="text-ink-soft hover:text-terra">{l}</Link></li>)}</ul>
    </section>
  );
  return (
    <>
      <EnTete titre="Plan du site" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <Bloc titre="Rubriques" liens={[...menu.map((m) => [m.href, m.label] as [string, string]), ['/agenda', 'Agenda'], ['/flash', 'Flash'], ['/recherche/appels-a-postes', 'Appels à postes'], ['/recherche/appels-a-contributions', 'Appels à contributions']]} />
        <Bloc titre="Pages" liens={pages.map((p) => [p.entry.adresse ?? '/', p.entry.titre] as [string, string]).sort((a, b) => a[0].localeCompare(b[0]))} />
        <Bloc titre="Éditos" liens={editos.map((e) => [`/edito/${e.slug}`, e.entry.titre])} />
        <Bloc titre="Actualités" liens={actus.map((e) => [`/actualites/${e.slug}`, e.entry.titre])} />
        <Bloc titre="Publications" liens={pubs.map((e) => [`/publications/${e.slug}`, e.entry.titre])} />
        <Bloc titre="Revue JOGOO, n° 1" liens={revue.map((e) => [`/sous-sites/revue-jogoo/${e.slug}`, e.entry.titre])} />
      </div>
    </>
  );
}

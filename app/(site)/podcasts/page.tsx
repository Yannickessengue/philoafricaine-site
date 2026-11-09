import { EnTete } from '@/components/ui';
import { partage } from '@/lib/apercu';
import { LecteurPodcast } from '@/components/Medias';
import { getPodcasts } from '@/lib/podcasts';

export const metadata = {
  title: 'Podcasts',
  description: 'Écouter la philosophie africaine : lectures et extraits de Marcien Towa et d’autres penseurs, en accès libre.',
  alternates: { types: { 'application/rss+xml': '/podcasts/rss.xml' } },
  ...partage('Podcasts — Écouter la philosophie africaine', 'Lectures et extraits de Marcien Towa, en accès libre.', 'Médiathèque · Audio', '/medias/podcasts/couverture-podcast.jpg', null, 'website'),
};

export default async function Podcasts() {
  const episodes = await getPodcasts();
  const series = [...new Set(episodes.map((e) => e.serie).filter(Boolean))];
  return (
    <>
      <EnTete kicker="Médiathèque · Audio" titre="Podcasts" intro="Écouter la philosophie africaine, ses textes et ses voix." icone={null} />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="font-brand text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {episodes.length} épisode{episodes.length > 1 ? 's' : ''}
            {series.length > 0 && ` · ${series.join(' · ')}`}
          </p>
          <a href="/podcasts/rss.xml" className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-brand text-[0.7rem] font-bold uppercase tracking-[0.12em] text-paper hover:bg-terra">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="19" r="2" />
              <path d="M3 10a11 11 0 0 1 11 11h-3a8 8 0 0 0-8-8zM3 3a18 18 0 0 1 18 18h-3A15 15 0 0 0 3 6z" />
            </svg>
            S’abonner (RSS)
          </a>
        </div>
        <LecteurPodcast episodes={episodes} complet />
        <p className="mt-6 text-sm text-ink-soft">
          L’adresse du flux RSS permet d’ajouter ces épisodes à une application de podcasts (Apple Podcasts, Spotify, AntennaPod…).
        </p>
      </div>
    </>
  );
}

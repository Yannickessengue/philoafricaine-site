import fs from 'node:fs';
import path from 'node:path';
import { getPodcasts } from '@/lib/podcasts';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** « 7 min 58 » → « 07:58 » pour itunes:duration. */
const duree = (d?: string | null) => {
  const m = d?.match(/(\d+)\s*min\s*(\d+)?/);
  return m ? `${m[1].padStart(2, '0')}:${(m[2] ?? '0').padStart(2, '0')}` : '';
};

/** Flux RSS des podcasts, compatible avec les applications d’écoute. */
export async function GET() {
  const site = SITE;
  const episodes = await getPodcasts();
  const base = new Date('2026-11-09T12:00:00Z').getTime();
  const items = episodes
    .map((e, i) => {
      const fichier = path.join(process.cwd(), 'public', e.audio);
      const taille = fs.existsSync(fichier) ? fs.statSync(fichier).size : 0;
      const date = new Date(base - (episodes.length - i) * 60000).toUTCString();
      return `<item>
  <title>${x(e.titre)}</title>
  <description>${x([e.description, e.source].filter(Boolean).join(' — '))}</description>
  <enclosure url="${site}${e.audio}" length="${taille}" type="audio/mp4"/>
  <guid isPermaLink="false">philoafricaine-podcast-${e.slug}</guid>
  <pubDate>${date}</pubDate>
  <link>${site}/podcasts</link>
  ${duree(e.duree) ? `<itunes:duration>${duree(e.duree)}</itunes:duration>` : ''}
  <itunes:episode>${e.ordre}</itunes:episode>
</item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Falsafa ya Africa — Podcast du Groupe JOGOO</title>
  <link>${site}/podcasts</link>
  <atom:link href="${site}/podcasts/rss.xml" rel="self" type="application/rss+xml"/>
  <language>fr</language>
  <description>Écouter la philosophie africaine : textes, lectures et voix, par le Groupe JOGOO (philoafricaine.org).</description>
  <itunes:author>Groupe JOGOO</itunes:author>
  <itunes:owner><itunes:name>Groupe JOGOO</itunes:name><itunes:email>philoafricaine@gmail.com</itunes:email></itunes:owner>
  <itunes:image href="${site}/medias/podcasts/couverture-podcast.jpg"/>
  <image><url>${site}/medias/podcasts/couverture-podcast.jpg</url><title>Falsafa ya Africa — Podcast du Groupe JOGOO</title><link>${site}/podcasts</link></image>
  <itunes:category text="Society &amp; Culture"><itunes:category text="Philosophy"/></itunes:category>
  <itunes:explicit>false</itunes:explicit>
${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

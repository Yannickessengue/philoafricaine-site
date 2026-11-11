import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/site';
import { partage } from '@/lib/apercu';
import './globals.css';
import './fonds.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Groupe JOGOO · Philosophie africaine. Débats & questions', template: '%s · Groupe JOGOO' },
  description:
    'Portail du Groupe JOGOO : philosophie africaine, débats et questions. Éditos, actualités, publications, Revue JOGOO, Fonds Eboussi Boulaga.',
  icons: { icon: '/medias/site/icon.png' },
  ...partage('Philosophie africaine. Débats & questions', 'Portail du Groupe JOGOO : éditos, actualités, publications, revues, Fonds Eboussi Boulaga, JOGOO AI.', 'Groupe JOGOO', null, null, 'website'),
};
export const viewport: Viewport = { themeColor: '#eabf31' };

// Classe « js » (animations d'apparition) et intro déjà vue dans la session : posées avant l'affichage
const amorce = `try{var d=document.documentElement;d.classList.add('js');if(sessionStorage.getItem('jogoo-intro'))d.classList.add('intro-vue')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: amorce }} />
        {/* Polices critiques préchargées : le texte s'affiche dans sa police dès le premier rendu */}
        <link rel="preload" href="/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ubuntu-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}

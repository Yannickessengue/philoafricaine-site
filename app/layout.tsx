import type { Metadata, Viewport } from 'next';
import './globals.css';
import './fonds.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.philoafricaine.org'),
  title: { default: 'Groupe JOGOO · Philosophie africaine. Débats & questions', template: '%s · Groupe JOGOO' },
  description:
    'Portail du Groupe JOGOO : philosophie africaine, débats et questions. Éditos, actualités, publications, Revue JOGOO, Fonds Eboussi Boulaga.',
  icons: { icon: '/medias/site/icon.png' },
  openGraph: { siteName: 'Groupe JOGOO', locale: 'fr_FR', type: 'website' },
};
export const viewport: Viewport = { themeColor: '#eabf31' };

// Classe « js » (animations d'apparition) et intro déjà vue dans la session : posées avant l'affichage
const amorce = `try{var d=document.documentElement;d.classList.add('js');if(sessionStorage.getItem('jogoo-intro'))d.classList.add('intro-vue')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: amorce }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}

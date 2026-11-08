import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.philoafricaine.org'),
  title: { default: 'Groupe JOGOO · Philosophie africaine. Débats & questions', template: '%s · Groupe JOGOO' },
  description: 'Portail du Groupe JOGOO : philosophie africaine, débats et questions.',
  icons: { icon: '/medias/site/icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Contenus et PDF de la Revue lus à l'exécution (régénération quotidienne, embargo)
  outputFileTracingIncludes: {
    '/**/*': ['./content/**/*', './design/fragments/**/*'],
    '/revue/pdf/[file]': ['./revue-pdf/**/*'],
    '/magazine/pdf/[file]': ['./magazine-pdf/**/*'],
    '/podcasts/rss.xml': ['./public/medias/podcasts/**/*'],
    '/og': ['./lib/og/**/*'],
    '/api/jogoo-ai': ['./bibliotheque-chercheurs/**/*'],
    '/edito/[slug]/pdf': ['./lib/pdf/**/*'],
  },
  // Polices immuables : mises en cache un an par le navigateur
  async headers() {
    return [{ source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
  },
  async redirects() {
    return [
      { source: '/admin', destination: '/keystatic', permanent: false },
      { source: '/admin/:path*', destination: '/keystatic', permanent: false },
      // Eboussi Studies est désormais une rubrique du Fonds Eboussi Boulaga (redirections permanentes 301)
      { source: '/sous-sites/eboussi-studies', destination: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies', statusCode: 301 },
      { source: '/sous-sites/eboussi-studies/:path*', destination: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies', statusCode: 301 },
      // Anciennes adresses du site précédent (bascule du domaine philoafricaine.org)
      { source: '/palabre-bidima', destination: '/notre-histoire#palabre-autour-de-jean-godefroy-bidima-2026', statusCode: 301 },
      { source: '/edito/moderation', destination: '/keystatic', permanent: false },
      { source: '/newsletter/:path*', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;

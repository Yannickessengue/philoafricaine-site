import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Contenus et PDF de la Revue lus à l'exécution (régénération quotidienne, embargo)
  outputFileTracingIncludes: {
    '/**/*': ['./content/**/*', './design/fragments/**/*'],
    '/revue/pdf/[file]': ['./revue-pdf/**/*'],
    '/magazine/pdf/[file]': ['./magazine-pdf/**/*'],
    '/podcasts/rss.xml': ['./public/medias/podcasts/**/*'],
    '/og': ['./lib/og/**/*'],
  },
  async redirects() {
    return [
      { source: '/admin', destination: '/keystatic', permanent: false },
      { source: '/admin/:path*', destination: '/keystatic', permanent: false },
      // Eboussi Studies est désormais une rubrique du Fonds Eboussi Boulaga (redirections permanentes 301)
      { source: '/sous-sites/eboussi-studies', destination: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies', statusCode: 301 },
      { source: '/sous-sites/eboussi-studies/:path*', destination: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies', statusCode: 301 },
    ];
  },
};

export default nextConfig;

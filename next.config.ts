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
    // pdfkit charge Helvetica à la création du document : à inclure pour les routes PDF exécutées à la demande
    '/api/attestation': ['./lib/pdf/**/*', './node_modules/pdfkit/js/standard-fonts/**/*'],
  },
  // Polices immuables : mises en cache un an par le navigateur
  async headers() {
    return [{ source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
  },
  async redirects() {
    return [
      // Eboussi Studies est désormais une rubrique du Fonds Eboussi Boulaga (redirections permanentes 301)
      { source: '/sous-sites/eboussi-studies', destination: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies', statusCode: 301 },
      { source: '/sous-sites/eboussi-studies/:path*', destination: '/sous-sites/fonds-eboussi-boulaga/eboussi-studies', statusCode: 301 },
      // Anciennes adresses du site précédent (bascule du domaine philoafricaine.org)
      { source: '/palabre-bidima', destination: '/notre-histoire#palabre-autour-de-jean-godefroy-bidima-2026', statusCode: 301 },
      { source: '/edito/moderation', destination: '/keystatic', permanent: false },
      { source: '/newsletter/:path*', destination: '/', permanent: false },
      // « La minute du chant du coq » devient « Les 10 minutes du chant du coq »
      { source: '/la-minute-du-chant-du-coq', destination: '/les-10-minutes-du-chant-du-coq', statusCode: 301 },
      { source: '/la-minute-du-chant-du-coq/:slug*', destination: '/les-10-minutes-du-chant-du-coq/:slug*', statusCode: 301 },
      // La rubrique passe de cinq à dix minutes (novembre 2026)
      { source: '/les-5-minutes-du-chant-du-coq', destination: '/les-10-minutes-du-chant-du-coq', statusCode: 301 },
      { source: '/les-5-minutes-du-chant-du-coq/:slug*', destination: '/les-10-minutes-du-chant-du-coq/:slug*', statusCode: 301 },
    ];
  },
};

export default nextConfig;

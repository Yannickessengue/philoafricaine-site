import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Contenus et PDF de la Revue lus à l'exécution (régénération quotidienne, embargo)
  outputFileTracingIncludes: {
    '/**/*': ['./content/**/*', './design/fragments/**/*'],
    '/revue/pdf/[file]': ['./revue-pdf/**/*'],
  },
  async redirects() {
    return [
      { source: '/admin', destination: '/keystatic', permanent: false },
      { source: '/admin/:path*', destination: '/keystatic', permanent: false },
    ];
  },
};

export default nextConfig;

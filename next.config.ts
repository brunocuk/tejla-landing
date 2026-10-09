import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  async redirects() {
    /* Stariji / engleski oblici → 301 na hrvatske, da linkovi ne pucaju. */
    return [
      { source: '/privacy', destination: '/privatnost', permanent: true },
      { source: '/terms', destination: '/uvjeti', permanent: true },
      { source: '/contact', destination: '/kontakt', permanent: true },
    ];
  },
};

export default nextConfig;

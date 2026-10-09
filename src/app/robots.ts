import type { MetadataRoute } from 'next';
import { tejlaConfig } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* Odjavni linkovi iz mailova i API ruta nemaju što raditi u indeksu. */
      disallow: ['/odjava/', '/prijava'],
    },
    sitemap: `${tejlaConfig.url}/sitemap.xml`,
  };
}

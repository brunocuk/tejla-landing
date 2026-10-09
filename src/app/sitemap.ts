import type { MetadataRoute } from 'next';
import { tejlaConfig } from '@/lib/config';

/*
 * Privatnost i uvjeti su namjerno izostavljeni dok su noindex placeholderi;
 * dodati ih kad stignu finalni pravni tekstovi.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${tejlaConfig.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${tejlaConfig.url}/kontakt`, changeFrequency: 'monthly', priority: 0.4 },
  ];
}

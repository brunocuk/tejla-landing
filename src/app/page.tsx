import type { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';
import { tejlaConfig } from '@/lib/config';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/* Strukturirani podaci za tražilice (Organization + WebSite). */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Tejla',
      url: tejlaConfig.url,
      logo: `${tejlaConfig.url}/apple-icon.png`,
      email: tejlaConfig.contactEmail,
    },
    {
      '@type': 'WebSite',
      name: 'Tejla',
      url: tejlaConfig.url,
      inLanguage: 'hr',
      description:
        'Obiteljski organizator: poruke, papirići, termini i ideje. Tejla pamti. Ti živiš.',
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Bez JavaScripta nema reveal animacija pa sadržaj mora biti vidljiv odmah. */}
      <noscript>
        <style>{`[data-r]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <LandingClient ctaMode={tejlaConfig.ctaMode} appUrl={tejlaConfig.appUrl} />
    </>
  );
}

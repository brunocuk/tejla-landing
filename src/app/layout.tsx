import type { Metadata, Viewport } from 'next';
import { Inter, Lora } from 'next/font/google';
import { tejlaConfig } from '@/lib/config';
import './globals.css';

const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(tejlaConfig.url),
  title: 'Tejla — Tejla pamti. Ti živiš.',
  description:
    'Ne moraš sve držati u glavi. Poruke, papirići, termini i ideje — samo daj Tejli. Ona će znati što s tim.',
  openGraph: {
    type: 'website',
    title: 'Tejla pamti. Ti živiš.',
    description: 'Ne moraš sve držati u glavi. Tejla misli na ono što ti ne moraš.',
    locale: 'hr_HR',
    url: tejlaConfig.url,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F6F1EC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr" className={`${lora.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}

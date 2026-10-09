import type { Metadata } from 'next';
import PravnoLayout from '@/components/PravnoLayout';
import { tejlaConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Kontakt · Tejla',
  description: 'Javi nam se — Tejla tim.',
  alternates: { canonical: '/kontakt' },
};

export default function Kontakt() {
  return (
    <PravnoLayout>
      <p className="kicker">Tu smo</p>
      <h1>Kontakt</h1>
      <p className="updated">Odgovaramo obično u roku od jednog radnog dana.</p>

      <p>
        Za sve o Tejli — rani pristup, prijedlozi, problemi, pitanja o podacima — piši na{' '}
        <a href={`mailto:${tejlaConfig.contactEmail}`}>{tejlaConfig.contactEmail}</a>.
      </p>

      <h2>Rani pristup</h2>
      <p>
        Tejla je u zatvorenoj beti i pristup otvaramo postupno. Prijaviti se možeš{' '}
        <a href="/">na početnoj stranici</a>.
      </p>

      <h2>Podaci i privatnost</h2>
      <p>
        Za zahtjev za uvid, ispravak ili brisanje podataka javi se na istu adresu — detalji su u{' '}
        <a href="/privatnost">pravilima privatnosti</a>.
      </p>

      {/* Dopuni po potrebi: naziv obrta, OIB, sjedište, ime odgovorne osobe. */}
    </PravnoLayout>
  );
}

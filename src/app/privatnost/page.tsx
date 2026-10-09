import type { Metadata } from 'next';
import PravnoLayout from '@/components/PravnoLayout';
import { tejlaConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Pravila privatnosti · Tejla',
  description: 'Kako Tejla prikuplja, obrađuje i štiti tvoje podatke.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/privatnost' },
};

export default function Privatnost() {
  return (
    <PravnoLayout>
      <p className="kicker">Pravno</p>
      <h1>Pravila privatnosti</h1>
      <p className="updated">Zadnja izmjena: —</p>

      <div className="placeholder">
        <span className="tag">Tekst u pripremi</span>
        <p>
          Finalni tekst pravila privatnosti je u izradi. Do objave ova je stranica označena kao{' '}
          <code>noindex</code> pa je tražilice neće indeksirati.
        </p>
        <p>
          Za pitanja o obradi podataka piši nam na{' '}
          <a href={`mailto:${tejlaConfig.contactEmail}`}>{tejlaConfig.contactEmail}</a>.
        </p>
      </div>

      {/*
        UPUTA ZA POPUNJAVANJE
        Obriši .placeholder blok gore, makni robots noindex iz metadata
        i upiši tekst ispod. Struktura koju GDPR očekuje:

        1. Voditelj obrade
        2. Koje podatke prikupljamo
        3. Svrha i pravna osnova obrade
        4. Obrada pomoću umjetne inteligencije
        5. Dijeljenje s trećim stranama i podizvođači
        6. Rok čuvanja podataka
        7. Tvoja prava (pristup, ispravak, brisanje, prigovor)
        8. Kolačići
        9. Kontakt i pritužbe (AZOP)
      */}
    </PravnoLayout>
  );
}

import type { Metadata } from 'next';
import PravnoLayout from '@/components/PravnoLayout';
import { tejlaConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Uvjeti korištenja · Tejla',
  description: 'Uvjeti pod kojima koristiš Tejlu.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/uvjeti' },
};

export default function Uvjeti() {
  return (
    <PravnoLayout>
      <p className="kicker">Pravno</p>
      <h1>Uvjeti korištenja</h1>
      <p className="updated">Zadnja izmjena: —</p>

      <div className="placeholder">
        <span className="tag">Tekst u pripremi</span>
        <p>
          Finalni tekst uvjeta korištenja je u izradi. Do objave ova je stranica označena kao{' '}
          <code>noindex</code>.
        </p>
        <p>
          Pitanja: <a href={`mailto:${tejlaConfig.contactEmail}`}>{tejlaConfig.contactEmail}</a>.
        </p>
      </div>

      {/*
        Uobičajena struktura:
        1. Opće odredbe
        2. Opis usluge
        3. Korisnički račun
        4. Dopuštena i zabranjena upotreba
        5. Sadržaj koji korisnik unosi
        6. Ograničenja usluge tijekom bete
        7. Ograničenje odgovornosti
        8. Izmjene uvjeta i prestanak korištenja
        9. Mjerodavno pravo
      */}
    </PravnoLayout>
  );
}

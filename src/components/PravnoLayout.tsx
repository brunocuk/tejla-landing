/* Port pravno/layout.blade.php — ljuska pravnih stranica. */

import { tejlaConfig } from '@/lib/config';

export default function PravnoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="top">
        <a href="/" className="logo">
          tejla<span>.</span>
        </a>
        <a href="/" className="back">
          &larr; Natrag
        </a>
      </header>

      <main className="doc">{children}</main>

      <footer className="foot foot--doc">
        <ul className="foot__links">
          <li>
            <a href="/privatnost">Pravila privatnosti</a>
          </li>
          <li>
            <a href="/uvjeti">Uvjeti korištenja</a>
          </li>
          <li>
            <a href="/kontakt">Kontakt</a>
          </li>
          <li>
            <a href={tejlaConfig.appUrl}>Otvori Tejlu</a>
          </li>
        </ul>
        <p>Tejla pamti. Ti živiš. &nbsp;·&nbsp; &copy; {new Date().getFullYear()}</p>
      </footer>
    </>
  );
}

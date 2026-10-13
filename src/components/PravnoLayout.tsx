/* Port pravno/layout.blade.php — ljuska pravnih stranica. */

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
            <a href="/kontakt">Kontakt</a>
          </li>
        </ul>
        <p className="foot__legal">
          HAJDI, obrt za usluge &nbsp;·&nbsp; Zeleni vijenac 30, 10360 Sesvete &nbsp;·&nbsp; OIB:
          89980085111 &nbsp;·&nbsp; <a href="mailto:tejla@tejla.app">tejla@tejla.app</a>
        </p>
        <p>&copy; {new Date().getFullYear()}. HAJDI, obrt za usluge.</p>
      </footer>
    </>
  );
}

import type { Metadata } from 'next';
import PravnoLayout from '@/components/PravnoLayout';

/*
 * Tekst: Matejin dokument "Pravila privatnosti TEJLA LANDING" (13.10.2026.),
 * privremena verzija do odvjetnikove. [BRUNO] oznake iz dokumenta riješene su
 * ovako (v. docs/pravno-landing-2026-10-13/ i checklistu u DOKUMENTU 4):
 *  - popis podataka: potvrđen prema stvarnom insertu u /prijava rutu
 *  - kolačići i automatizirano odlučivanje: potvrđeno (nema kolačića ni
 *    storagea u kodu, nema Set-Cookie headera na produkciji, nema analitike)
 *  - lokacije i prijenosi: Vercel i Resend obrađuju u SAD-u; regiju Supabase
 *    projekta potvrditi u dashboardu pa po potrebi precizirati tekst
 *  - rokovi čuvanja: naši prijedlozi, potvrditi s Matejom prije objave
 *
 * Finalna verzija potvrđena (pravni paket zatvoren 29.10.2026.), stranica je
 * indeksabilna od 3.11.2026.
 */

export const metadata: Metadata = {
  title: 'Pravila privatnosti · Tejla',
  description: 'Kako Tejla prikuplja, obrađuje i štiti tvoje podatke.',
  alternates: { canonical: '/privatnost' },
};

const CONTACT = 'tejla@tejla.app';

export default function Privatnost() {
  return (
    <PravnoLayout>
      <p className="kicker">Pravno</p>
      <h1>Pravila privatnosti</h1>
      <p className="updated">Zadnja izmjena: 13. listopada 2026.</p>

      <h2>Ukratko</h2>
      <p>Tejla je aplikacija koja pomaže da ne moraš sve obveze držati u glavi.</p>
      <p>
        Na ovoj web stranici možeš se prijaviti kako bismo ti javili kada Tejla bude spremna za
        prve korisnike.
      </p>
      <p>
        Tvoju e-mail adresu koristimo za obavijesti o ranom pristupu. Odjaviti se možeš u bilo
        kojem trenutku.
      </p>
      <p>
        Ova Pravila privatnosti odnose se na web stranicu i listu za rani pristup, a ne na buduće
        korištenje aplikacije Tejla.
      </p>

      <h2>1. Tko je odgovoran za tvoje podatke?</h2>
      <p>Voditelj obrade osobnih podataka je:</p>
      <p>
        HAJDI, obrt za usluge
        <br />
        Vlasnik: Davor Hajdinjak
        <br />
        Sjedište: Zeleni vijenac 30, 10360 Sesvete, Hrvatska
        <br />
        OIB: 89980085111
        <br />
        Kontakt: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
      <p>
        Za sva pitanja o privatnosti i ostvarivanju svojih prava možeš nam pisati na navedenu
        e-mail adresu.
      </p>

      <h2>2. Koje podatke prikupljamo?</h2>
      <p>Kada se prijaviš na listu za rani pristup Tejli, prikupljamo:</p>
      <ul>
        <li>e-mail adresu</li>
        <li>datum i vrijeme prijave</li>
        <li>sigurnosni token za odjavu</li>
        <li>podatke o danoj privoli (verzija teksta, vrijeme i način davanja)</li>
        <li>IP adresu</li>
        <li>podatke o pregledniku</li>
        <li>podatak o stranici s koje je prijava stigla, ako je dostupan</li>
      </ul>
      <p>
        E-mail adresu daješ dobrovoljno. Određeni tehnički podaci prikupljaju se automatski radi
        zaštite prijavnog obrasca.
      </p>

      <h2>3. Zašto obrađujemo podatke?</h2>
      <p>
        <strong>Obavijesti o ranom pristupu.</strong> E-mail adresu i podatke potrebne za
        evidenciju prijave obrađujemo radi slanja potvrde prijave i obavijesti o ranom pristupu
        Tejli. Pravna osnova je tvoja privola prema članku 6. stavku 1. točki (a) Opće uredbe o
        zaštiti podataka (GDPR). Privolu možeš povući u bilo kojem trenutku.
      </p>
      <p>
        <strong>Zaštita od zlouporabe.</strong> IP adresu, podatke o pregledniku i izvoru prijave
        obrađujemo radi sprječavanja automatiziranih, lažnih i drugih zlouporabnih prijava te
        zaštite sigurnosti sustava. Pravna osnova je legitimni interes obrta HAJDI prema članku 6.
        stavku 1. točki (f) GDPR-a, nakon provedene procjene nužnosti i ravnoteže interesa.
      </p>
      <p>Podatke prikupljene za rani pristup ne koristimo za nepovezane marketinške kampanje.</p>

      <h2>4. Tko obrađuje podatke?</h2>
      <p>
        Pristup osobnim podacima imaju ovlaštene osobe obrta HAJDI i, u mjeri potrebnoj za
        tehničko održavanje, partner Ninefold.
      </p>
      <p>Za funkcioniranje stranice koristimo:</p>
      <ul>
        <li>Supabase (Supabase Pte. Ltd.) – pohrana i upravljanje prijavama</li>
        <li>Vercel (Vercel Inc.) – hosting i isporuka web stranice</li>
        <li>Resend (Plus Five Five, Inc.) – slanje e-mail poruka</li>
      </ul>
      <p>
        Podatke ne prodajemo niti ih ustupamo drugim društvima za njihove samostalne marketinške
        svrhe.
      </p>

      <h2>5. Gdje se podaci obrađuju?</h2>
      <p>
        Baza s prijavama (Supabase) nalazi se u Europskoj uniji, u regiji eu-west-1 (Irska). Web
        stranicu poslužuje Vercel, a e-mail poruke šalje Resend; ti pružatelji podatke mogu
        obrađivati i u Sjedinjenim Američkim Državama.
      </p>
      <p>
        Kada se podaci prenose izvan Europskog gospodarskog prostora, primjenjujemo odgovarajući
        mehanizam zaštite predviđen GDPR-om, poput standardnih ugovornih klauzula Europske
        komisije ili okvira EU-U.S. Data Privacy Framework. Informacije o primjenjivim zaštitnim
        mjerama i načinu dobivanja njihove kopije možeš zatražiti na{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>6. Koliko dugo čuvamo podatke?</h2>
      <p>
        Podatke s liste za rani pristup čuvamo dok su potrebni za tu svrhu, a najdulje 6 mjeseci
        nakon što Tejla postane javno dostupna ili dok se lista za rani pristup ne ugasi, ovisno o
        tome što nastupi ranije.
      </p>
      <p>Ako se odjaviš, tvoj zapis uklanja se iz aktivne baze prijava.</p>
      <p>
        Podaci u sigurnosnim kopijama i tehničkim zapisima mogu se zadržati tijekom ograničenog
        razdoblja, ovisno o njihovoj svrsi:
      </p>
      <ul>
        <li>sigurnosne kopije baze: najdulje 30 dana</li>
        <li>sigurnosni i pristupni zapisi: najdulje 30 dana</li>
        <li>
          evidencija privole vodi se kao dio samog zapisa prijave i briše se zajedno s njim
        </li>
        <li>zapisi pružatelja usluge slanja e-maila: najdulje 30 dana</li>
      </ul>
      <p>
        Po isteku primjenjivih rokova podaci se brišu ili anonimiziraju, osim ako postoji druga
        valjana pravna osnova za njihovo zadržavanje.
      </p>

      <h2>7. Kako se odjaviti?</h2>
      <p>
        U e-mail porukama koje šaljemo u vezi s ranim pristupom nalazi se poveznica za odjavu.
        Odjavom povlačiš privolu za primanje tih obavijesti i uklanjamo tvoju prijavu iz aktivne
        liste.
      </p>
      <p>
        Privolu možeš povući i slanjem zahtjeva na <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        Povlačenje privole ne utječe na zakonitost obrade provedene prije povlačenja.
      </p>

      <h2>8. Koja su tvoja prava?</h2>
      <p>U skladu s GDPR-om, ovisno o uvjetima pojedinog prava, možeš:</p>
      <ul>
        <li>zatražiti pristup svojim podacima</li>
        <li>zatražiti ispravak netočnih podataka</li>
        <li>zatražiti brisanje osobnih podataka</li>
        <li>zatražiti ograničenje obrade</li>
        <li>zatražiti prenosivost podataka</li>
        <li>uložiti prigovor na obradu koja se temelji na legitimnom interesu</li>
        <li>povući privolu u bilo kojem trenutku</li>
      </ul>
      <p>
        Zahtjev možeš poslati na <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Odgovorit ćemo bez
        nepotrebnog odgađanja, u pravilu najkasnije u roku od mjesec dana, u skladu s GDPR-om.
      </p>
      <p>
        Imaš pravo podnijeti pritužbu Agenciji za zaštitu osobnih podataka (AZOP),{' '}
        <a href="https://azop.hr" rel="noopener noreferrer" target="_blank">
          www.azop.hr
        </a>
        .
      </p>

      <h2>9. Moraš li nam dati svoje podatke?</h2>
      <p>Ne. Prijava za rani pristup potpuno je dobrovoljna i nije zakonska ili ugovorna obveza.</p>
      <p>
        Bez e-mail adrese ne možemo te dodati na listu niti ti poslati obavijest o ranom pristupu.
        Tehnički podaci potrebni za sigurnost obrasca obrađuju se automatski prilikom korištenja
        obrasca.
      </p>

      <h2>10. Kolačići i analitika</h2>
      <p>
        Tejlin landing ne koristi analitičke ni marketinške kolačiće niti alate za praćenje
        korisnika u marketinške svrhe.
      </p>
      <p>
        Stranica ne koristi kolačiće ili slične tehnologije za koje je potrebna prethodna privola.
      </p>
      <p>
        Ako se uvedu tehnologije za koje je potrebna privola, prije njihove uporabe osigurat ćemo
        odgovarajuće informiranje i mogućnost davanja ili odbijanja privole.
      </p>

      <h2>11. Automatizirano odlučivanje</h2>
      <p>
        Prijavu na listu za rani pristup ne koristimo za automatizirano donošenje odluka,
        uključujući profiliranje, koje bi proizvodilo pravne ili slično značajne učinke na
        prijavljene osobe.
      </p>

      <h2>12. Promjene Pravila privatnosti</h2>
      <p>
        Ova Pravila možemo ažurirati kada se promijeni način obrade osobnih podataka ili
        relevantni pravni zahtjevi. Važeća verzija bit će dostupna na ovoj stranici, uz datum
        posljednje izmjene.
      </p>
      <p>
        Za sva pitanja možeš nam se obratiti na <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
    </PravnoLayout>
  );
}

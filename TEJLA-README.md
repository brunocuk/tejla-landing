# tejla. — landing page (Next.js port)

Port Matejinog Laravel landinga (`../landing-laravel/`) u Next.js (App Router,
TypeScript). Ista kopija, isti CSS, isto ponašanje: infinite scroll s
beskonačnim repom fragmenata, demo video, waitlist forma s honeypotom,
pravne stranice, CTA mode waitlist|app.

## Struktura

```
src/lib/content.ts          SAV TEKST STRANICE (port TejlaContent.php)
src/lib/config.ts           env konfiguracija (port config/tejla.php)
src/lib/supabase.ts         server-side Supabase klijent (service role)
src/lib/mail.ts             GoDaddy SMTP + oba mail templatea
src/lib/throttle.ts         in-memory throttle za /prijava
src/components/
  LandingClient.tsx         port tejla.js: scroll, reveal, video, dock, dialog
  Section.tsx               port partials/section.blade.php
  FragmentsTail.tsx         port partials/fragments.blade.php
  Icon.tsx                  port partials/icon.blade.php
  PravnoLayout.tsx          ljuska pravnih stranica
src/app/
  page.tsx                  landing
  prijava/route.ts          POST prijava (port WaitlistController@store)
  odjava/[token]/page.tsx   odjava tokenom iz maila
  privatnost|uvjeti|kontakt pravne stranice (placeholderi, noindex)
public/video/               demo video (kopiran iz Laravel repoa)
supabase/waitlist.sql       DDL za tablicu waitlist_signups
```

## Razlike prema Laravel originalu

- Sekcije se ne dohvaćaju fetchom sa servera: renderiraju se iz lokalnog
  sadržaja, istom paginacijom (1 sekcija po stranici, 4 fragmenta po stranici
  repa, ciklički, MAX_AUTO_PAGES=40). Ponašanje za korisnika je identično,
  a stream radi i bez ijednog server poziva.
- Prijave idu u Supabase (tablica `waitlist_signups`, RLS bez policyja,
  pristup samo service role ključem) umjesto u SQLite.
- Mailovi se šalju nodemailerom kroz isti GoDaddy SMTP; ako MAIL_* varijable
  nisu postavljene, prijava se spremi a mail preskoči.
- Throttle za /prijava je in-memory po serverless instanci (mekši od
  Laravelovog), uz honeypot i dedup dovoljan za waitlist formu.
- /privacy, /terms, /contact su 308 redirecti (Next permanentRedirect).

## Lokalno pokretanje

```bash
npm install
cp .env.example .env.local   # upiši Supabase i SMTP vrijednosti
npm run dev                  # ili: npm run build && npm run start
```

Bez `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` forma vraća urednu grešku
(prijave se ne gube tiho). Prije produkcije pokrenuti `supabase/waitlist.sql`
u Supabase SQL editoru.

## Deploy (plan)

Vercel (ili Cloudflare Pages), env varijable iz `.env.example`.
DNS u GoDaddyju: tejla.app → landing, aplikacija prelazi na app.tejla.app.
CTA prebacivanje na launchu: `TEJLA_CTA_MODE=app` + redeploy.

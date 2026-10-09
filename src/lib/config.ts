/* Ekvivalent config/tejla.php: sve iz env varijabli, čita se samo server-side. */

export type CtaMode = 'waitlist' | 'app';

export const tejlaConfig = {
  /* Bazna adresa landinga. */
  url: process.env.TEJLA_URL ?? 'https://tejla.app',

  /* Adresa same aplikacije (PWA). Landing NIKAD ne dira ovu domenu, samo linka na nju. */
  appUrl: process.env.TEJLA_APP_URL ?? 'https://app.tejla.app',

  /*
   * Što rade glavni CTA gumbi:
   *   'waitlist' → otvaraju formu za rani pristup (zatvorena beta)
   *   'app'      → vode ravno na app.tejla.app (javni launch)
   * Prebacivanje je promjena env varijable + redeploy.
   */
  ctaMode: (process.env.TEJLA_CTA_MODE === 'app' ? 'app' : 'waitlist') as CtaMode,

  /* Kontakt adresa na /kontakt stranici. */
  contactEmail: process.env.TEJLA_CONTACT_EMAIL ?? 'info@tejla.app',

  /* Adresa na koju stiže obavijest o novoj prijavi. Prazno = bez internih obavijesti. */
  adminEmail: process.env.TEJLA_ADMIN_EMAIL ?? '',

  /* Ime proizvoda u mailovima. */
  brand: process.env.TEJLA_BRAND ?? 'Tejla',
};

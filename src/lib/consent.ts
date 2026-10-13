/*
 * Privola za e-mail obavijesti o ranom pristupu (AZOP dokazivost).
 *
 * Uz svaku prijavu spremamo verziju teksta privole, vrijeme i način
 * davanja. Tekst privole NIKAD ne mijenjati bez podizanja verzije:
 * stara verzija ostaje zabilježena ovdje u komentaru, pa se za svaki
 * zapis u bazi može rekonstruirati točan tekst koji je korisnik vidio.
 *
 * Povijest verzija:
 *   rani-pristup-v1-2026-10-13 — početni tekst (Matejin dokument 13.10.2026.)
 */

export const CONSENT_VERSION = 'rani-pristup-v1-2026-10-13';

export const CONSENT_TEXT =
  'Želim primati e-mail obavijesti o ranom pristupu Tejli. Znam da se mogu odjaviti u bilo kojem trenutku.';

/* Način davanja privole; za sada postoji samo web obrazac s checkboxom. */
export const CONSENT_METHOD = 'web-form-checkbox';

-- Dopuna žive tablice waitlist_signups stupcima za dokaz privole (AZOP).
-- Pokrenuti JEDNOM u Supabase SQL editoru na Matejinom projektu,
-- OBAVEZNO PRIJE deploya koda koji ove stupce upisuje.
--
-- Stupci su nullable: prijave nastale prije uvođenja checkboxa nemaju
-- zabilježenu privolu i to je točno stanje stvari. Nova ruta ih uvijek puni.

alter table public.waitlist_signups
    add column if not exists consent_version  text,
    add column if not exists consent_given_at timestamptz,
    add column if not exists consent_method   text;

comment on column public.waitlist_signups.consent_version is
    'Verzija teksta privole koju je korisnik potvrdio (src/lib/consent.ts u landing repou).';
comment on column public.waitlist_signups.consent_given_at is
    'Vrijeme davanja privole (checkbox potvrđen i obrazac poslan).';
comment on column public.waitlist_signups.consent_method is
    'Način davanja privole, npr. web-form-checkbox.';

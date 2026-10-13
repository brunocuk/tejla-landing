-- Lista čekanja za landing (ekvivalent Laravel migracije waitlist_signups).
-- Pokrenuti jednom u Supabase SQL editoru na Matejinom projektu.
--
-- RLS je uključen BEZ policyja: tablici pristupa isključivo landing
-- backend sa service role ključem. anon/authenticated ključevi ne
-- mogu ni čitati ni pisati.

create table if not exists public.waitlist_signups (
    id               uuid primary key default gen_random_uuid(),
    email            text not null unique,
    token            text not null unique,
    ip               text,
    user_agent       text,
    referrer         text,
    created_at       timestamptz not null default now(),
    -- Dokaz privole (AZOP): verzija teksta iz src/lib/consent.ts, vrijeme i
    -- način davanja. Nullable zbog prijava nastalih prije uvođenja checkboxa.
    consent_version  text,
    consent_given_at timestamptz,
    consent_method   text
);

alter table public.waitlist_signups enable row level security;

-- Backend (service role) treba eksplicitne grantove; anon i authenticated
-- ih namjerno NEMAJU, pa ni pogrešno dodana RLS policyja ne bi otvorila
-- tablicu prema browseru.
grant select, insert, delete on public.waitlist_signups to service_role;

comment on table public.waitlist_signups is
    'Prijave na listu čekanja s landinga (tejla.app). Pristup samo service role ključem.';

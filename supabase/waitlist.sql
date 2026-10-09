-- Lista čekanja za landing (ekvivalent Laravel migracije waitlist_signups).
-- Pokrenuti jednom u Supabase SQL editoru na Matejinom projektu.
--
-- RLS je uključen BEZ policyja: tablici pristupa isključivo landing
-- backend sa service role ključem. anon/authenticated ključevi ne
-- mogu ni čitati ni pisati.

create table if not exists public.waitlist_signups (
    id         uuid primary key default gen_random_uuid(),
    email      text not null unique,
    token      text not null unique,
    ip         text,
    user_agent text,
    referrer   text,
    created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

comment on table public.waitlist_signups is
    'Prijave na listu čekanja s landinga (tejla.app). Pristup samo service role ključem.';

-- Pozivnice u aplikaciju za prijave s liste čekanja (4.11.2026.).
-- Pokrenuti jednom u Supabase SQL editoru na Matejinom projektu,
-- NAKON zamjene __CRON_SECRET__ pravom tajnom (ista vrijednost koja je
-- na Vercelu kao CRON_SECRET projekta tejla-landing).
--
-- Što radi:
--   1. waitlist_signups dobiva invited_at (kada je pozivnica poslana);
--      service_role dobiva UPDATE (dosad je imao samo select/insert/delete).
--   2. Tajna ide u Vault pod svojim imenom (odvojeno od app cron tajne).
--   3. pg_cron svaki puni sat zove landing endpoint /api/pozivnice koji
--      odlučuje kome se šalje (postojeći nakon INVITE_SEND_START,
--      budući 24 h nakon prijave) i šalje kroz Resend.

-- 1. Stupac + grant.
alter table public.waitlist_signups
    add column if not exists invited_at timestamptz;

comment on column public.waitlist_signups.invited_at is
    'Kada je poslana pozivnica u aplikaciju (mail "Tejla te čeka"). NULL = još nije.';

grant update (invited_at) on public.waitlist_signups to service_role;

-- 2. Tajna u Vault (idempotentno).
delete from vault.secrets where name = 'tejla_landing_cron_secret';
select vault.create_secret('__CRON_SECRET__', 'tejla_landing_cron_secret');

-- 3. Satni job (unschedule ako postoji, pa schedule).
select cron.unschedule('tejla-landing-pozivnice')
where exists (select 1 from cron.job where jobname = 'tejla-landing-pozivnice');

select cron.schedule(
  'tejla-landing-pozivnice',
  '0 * * * *',
  $job$
  select net.http_post(
    url := 'https://tejla-landing.vercel.app/api/pozivnice',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'tejla_landing_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $job$
);

-- 4. Provjera.
select jobname, schedule, active from cron.job where jobname = 'tejla-landing-pozivnice';

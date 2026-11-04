import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { mailConfigured, sendInvite, INVITE_SUBJECT } from '@/lib/mail';
import { tejlaConfig } from '@/lib/config';

/*
 * Slanje pozivnica u aplikaciju (drugi mail nakon prijave na listu).
 *
 * Poziva ga pg_cron na Supabaseu svaki puni sat (x-cron-secret header).
 * Pravila (Matejina odluka, 4.11.2026.):
 *   - prijave koje su postojale prije INVITE_SEND_START dobivaju pozivnicu
 *     u prvom krugu nakon tog trenutka (prvi krug: 4.11.2026. u 21:00)
 *   - svaka kasnija prijava dobiva pozivnicu 24 sata nakon prijave
 * Za svakog primatelja kreira se jednokratni beta_invites token (ista
 * tablica koju koristi beta admin u aplikaciji), pa link vodi ravno na
 * registraciju: app.tejla.app/beta-invite/<token>.
 *
 * Bez CRON_SECRET env varijable ruta ne postoji (404, fail closed).
 * Body opcije: {"dryRun": true} vraća popis bez slanja;
 * {"testTo": "adresa"} šalje jedan probni mail s nevažećim tokenom,
 * bez diranja baze.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/* Gornja granica po pozivu: cron je satni pa se eventualni rep povlači u sljedećem krugu. */
const BATCH_LIMIT = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

function secretMatches(request: NextRequest, secret: string): boolean {
  const given = request.headers.get('x-cron-secret') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  if (!secretMatches(request, secret)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: { dryRun?: boolean; testTo?: string } = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ message: 'Neispravan body.' }, { status: 400 });
  }

  if (!mailConfigured()) {
    return NextResponse.json({ message: 'Mail nije konfiguriran.' }, { status: 503 });
  }

  /* Probni mail: pravi sadržaj, nasumičan token koji NIJE u bazi (link javlja
     da pozivnica ne vrijedi), bez ikakvog zapisa. Za pregled dizajna/dostave. */
  if (body.testTo) {
    const dummyToken = randomBytes(32).toString('hex');
    await sendInvite({
      email: body.testTo,
      inviteUrl: `${tejlaConfig.appUrl}/beta-invite/${dummyToken}`,
      unsubscribeToken: dummyToken,
    });
    return NextResponse.json({ test: body.testTo, subject: INVITE_SUBJECT });
  }

  /* Prije dogovorenog početka ne radi ništa; bez varijable fail closed. */
  const startMs = Date.parse(process.env.INVITE_SEND_START ?? '');
  const now = Date.now();
  if (!Number.isFinite(startMs) || now < startMs) {
    return NextResponse.json({ skipped: 'prije INVITE_SEND_START', sent: 0 });
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ message: 'Baza nije konfigurirana.' }, { status: 503 });
  }

  /* Tko je na redu: stariji od 24 h, a prijave nastale prije starta sve odjednom. */
  const cutoff = new Date(Math.max(startMs, now - DAY_MS)).toISOString();
  const { data: eligible, error } = await db
    .from('waitlist_signups')
    .select('id, email, token, created_at')
    .is('invited_at', null)
    .lte('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(BATCH_LIMIT);

  if (error) {
    console.error('[pozivnice] SELECT_FAILED', error.message);
    return NextResponse.json({ message: 'Čitanje liste nije uspjelo.' }, { status: 500 });
  }

  if (body.dryRun) {
    return NextResponse.json({
      dryRun: true,
      cutoff,
      eligible: (eligible ?? []).map((s) => ({ email: s.email, created_at: s.created_at })),
    });
  }

  const sent: string[] = [];
  const failed: string[] = [];

  for (const signup of eligible ?? []) {
    const inviteToken = randomBytes(32).toString('hex');

    const { error: insertError } = await db
      .from('beta_invites')
      .insert({ token: inviteToken, label: `waitlist: ${signup.email}` });
    if (insertError) {
      console.error('[pozivnice] INVITE_INSERT_FAILED', signup.email, insertError.message);
      failed.push(signup.email);
      continue;
    }

    try {
      await sendInvite({
        email: signup.email,
        inviteUrl: `${tejlaConfig.appUrl}/beta-invite/${inviteToken}`,
        unsubscribeToken: signup.token,
      });
    } catch (mailError) {
      console.error('[pozivnice] SEND_FAILED', signup.email, mailError);
      /* Token bez poslanog maila ne smije ostati aktivan; sljedeći krug šalje novi. */
      await db.from('beta_invites').update({ status: 'revoked' }).eq('token', inviteToken);
      failed.push(signup.email);
      continue;
    }

    const { error: markError } = await db
      .from('waitlist_signups')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', signup.id)
      .is('invited_at', null);
    if (markError) {
      /* Mail je otišao, a oznaka nije prošla: glasno u log da se ručno sredi
         prije sljedećeg kruga, inače osoba dobiva duplikat. */
      console.error('[pozivnice] MARK_FAILED', signup.email, markError.message);
      failed.push(signup.email);
      continue;
    }

    sent.push(signup.email);
  }

  return NextResponse.json({ sent: sent.length, failed, emails: sent });
}

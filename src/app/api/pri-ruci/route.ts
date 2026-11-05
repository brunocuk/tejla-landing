import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { mailConfigured, sendPriRuci, PRI_RUCI_SUBJECT } from '@/lib/mail';

/*
 * Jednokratno slanje maila "Da ti Tejla uvijek bude pri ruci" (Matejina
 * odluka, 5.11.2026.): ide SAMO onima koji su pozivnicu dobili prije nego
 * što je savjet o početnom zaslonu ušao u tekst same pozivnice. Nije na
 * cronu, poziva se ručno.
 *
 * Zaštita od duplikata: baza NEMA oznaku za ovaj mail (service_role smije
 * ažurirati samo invited_at), pa pravo slanje traži body
 *   {"send": true, "invitedBefore": "<ISO vrijeme>"}
 * gdje invitedBefore omeđuje krug na već pozvane do tog trenutka. Sve bez
 * send:true je dry run. {"testTo": "adresa"} šalje jedan probni mail bez
 * diranja baze. Bez CRON_SECRET env varijable ruta ne postoji (fail closed).
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH_LIMIT = 100;

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

  let body: { send?: boolean; testTo?: string; invitedBefore?: string } = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ message: 'Neispravan body.' }, { status: 400 });
  }

  if (!mailConfigured()) {
    return NextResponse.json({ message: 'Mail nije konfiguriran.' }, { status: 503 });
  }

  /* Probni mail: pravi sadržaj, nasumičan unsubscribe token (link javlja da
     prijava ne postoji), bez ikakvog zapisa. Za pregled dizajna/dostave. */
  if (body.testTo) {
    await sendPriRuci({ email: body.testTo, unsubscribeToken: 'probni-mail' });
    return NextResponse.json({ test: body.testTo, subject: PRI_RUCI_SUBJECT });
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ message: 'Baza nije konfigurirana.' }, { status: 503 });
  }

  /* Pravo slanje traži izričitu granicu; dry run bez nje gleda sve pozvane. */
  const beforeMs = Date.parse(body.invitedBefore ?? '');
  if (body.send && !Number.isFinite(beforeMs)) {
    return NextResponse.json(
      { message: 'Za slanje treba invitedBefore (ISO vrijeme).' },
      { status: 400 }
    );
  }
  const before = Number.isFinite(beforeMs)
    ? new Date(beforeMs).toISOString()
    : new Date().toISOString();

  const { data: eligible, error } = await db
    .from('waitlist_signups')
    .select('id, email, token, invited_at')
    .not('invited_at', 'is', null)
    .lt('invited_at', before)
    .order('invited_at', { ascending: true })
    .limit(BATCH_LIMIT);

  if (error) {
    console.error('[pri-ruci] SELECT_FAILED', error.message);
    return NextResponse.json({ message: 'Čitanje liste nije uspjelo.' }, { status: 500 });
  }

  if (!body.send) {
    return NextResponse.json({
      dryRun: true,
      invitedBefore: before,
      eligible: (eligible ?? []).map((s) => ({ email: s.email, invited_at: s.invited_at })),
    });
  }

  const sent: string[] = [];
  const failed: string[] = [];

  for (const signup of eligible ?? []) {
    try {
      await sendPriRuci({ email: signup.email, unsubscribeToken: signup.token });
      sent.push(signup.email);
    } catch (mailError) {
      console.error('[pri-ruci] SEND_FAILED', signup.email, mailError);
      failed.push(signup.email);
    }
  }

  return NextResponse.json({ sent: sent.length, failed, emails: sent });
}

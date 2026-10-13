import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { resolveMx } from 'node:dns/promises';
import { supabaseAdmin } from '@/lib/supabase';
import { throttled } from '@/lib/throttle';
import { mailConfigured, sendConfirmation, sendNotification, type SignupRecord } from '@/lib/mail';
import { CONSENT_VERSION, CONSENT_METHOD } from '@/lib/consent';

/* Port WaitlistController@store. */

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Ekvivalent Laravelovog email:dns pravila; ako DNS upit sam pukne, propuštamo. */
async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  try {
    const records = await Promise.race([
      resolveMx(domain),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (records === null) return true; /* timeout: ne rušimo prijavu zbog sporog DNS-a */
    return records.length > 0;
  } catch {
    return false; /* domena ne postoji ili nema MX */
  }
}

export async function POST(request: NextRequest) {
  let payload: { email?: string; website?: string; consent?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Nešto nije prošlo. Pokušaj ponovno.' }, { status: 400 });
  }

  /* Honeypot — botovi popune skriveno polje, ljudi ne. */
  if (payload.website) {
    return NextResponse.json({ message: 'Hvala ti. Javit ćemo se.' }, { status: 202 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (throttled(ip)) {
    return NextResponse.json({ message: 'Previše pokušaja. Pričekaj minutu.' }, { status: 429 });
  }

  const email = String(payload.email ?? '').trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: 'Upiši svoju e-mail adresu.' }, { status: 422 });
  }
  if (email.length > 180 || !EMAIL_RE.test(email) || !(await domainAcceptsMail(email))) {
    return NextResponse.json({ message: 'Ta adresa ne izgleda ispravno.' }, { status: 422 });
  }

  /* Privola je uvjet prijave: bez potvrđenog checkboxa nema zapisa (AZOP). */
  if (payload.consent !== true) {
    return NextResponse.json(
      { message: 'Za prijavu potvrdi da želiš primati obavijesti.' },
      { status: 422 }
    );
  }

  const db = supabaseAdmin();
  if (!db) {
    console.error('Tejla: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nisu postavljeni');
    return NextResponse.json({ message: 'Nešto nije prošlo. Pokušaj ponovno.' }, { status: 500 });
  }

  const { data: existing, error: selectError } = await db
    .from('waitlist_signups')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (selectError) {
    console.error('Tejla: čitanje liste nije uspjelo', selectError.message);
    return NextResponse.json({ message: 'Nešto nije prošlo. Pokušaj ponovno.' }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ message: 'Već si na listi. Tejla pamti. :)', status: 'existing' }, { status: 201 });
  }

  const signup: SignupRecord = {
    email,
    token: randomBytes(30).toString('base64url').slice(0, 40),
    ip: ip === 'unknown' ? null : ip,
    referrer: (request.headers.get('referer') ?? '').slice(0, 255) || null,
    created_at: new Date().toISOString(),
  };

  const { error: insertError } = await db.from('waitlist_signups').insert({
    ...signup,
    user_agent: (request.headers.get('user-agent') ?? '').slice(0, 255) || null,
    /* Dokaz privole: koja verzija teksta, kada i kako je dana. */
    consent_version: CONSENT_VERSION,
    consent_given_at: signup.created_at,
    consent_method: CONSENT_METHOD,
  });

  if (insertError) {
    /* Unique constraint znači da je netko bio brži s istim mailom: tretiraj kao dedup. */
    if (insertError.code === '23505') {
      return NextResponse.json({ message: 'Već si na listi. Tejla pamti. :)', status: 'existing' }, { status: 201 });
    }
    console.error('Tejla: spremanje prijave nije uspjelo', insertError.message);
    return NextResponse.json({ message: 'Nešto nije prošlo. Pokušaj ponovno.' }, { status: 500 });
  }

  if (!mailConfigured()) {
    /* Prijava je spremljena, mail preskačemo dok SMTP nije konfiguriran. */
    return NextResponse.json({ message: 'Gotovo. Na listi si.', status: 'created' }, { status: 201 });
  }

  try {
    await sendConfirmation(signup);

    const { count } = await db.from('waitlist_signups').select('*', { count: 'exact', head: true });
    await sendNotification(signup, count ?? 0);
  } catch (e) {
    /* Prijava je spremljena — mail je sekundaran. Ne rušimo korisničko iskustvo. */
    console.error('Tejla: slanje maila nije uspjelo', { email, error: (e as Error).message });
    return NextResponse.json(
      { message: 'Zapisali smo te. Potvrdni mail kasni, ali si na listi.', status: 'saved_mail_failed' },
      { status: 202 }
    );
  }

  return NextResponse.json(
    { message: 'Gotovo. Provjeri inbox — poslali smo ti potvrdu.', status: 'created' },
    { status: 201 }
  );
}

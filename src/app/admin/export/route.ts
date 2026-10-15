import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/* CSV export svih prijava; ruta je iza Basic Autha (src/middleware.ts). */

export const dynamic = 'force-dynamic';

function csvPolje(v: string | null): string {
  const s = v ?? '';
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const db = supabaseAdmin();
  if (!db) {
    return new NextResponse('Baza nije dostupna.', { status: 500 });
  }

  const { data, error } = await db
    .from('waitlist_signups')
    .select('email, created_at, consent_version, consent_given_at, consent_method, referrer, ip, user_agent')
    .order('created_at', { ascending: true });

  if (error) {
    return new NextResponse(`Čitanje nije uspjelo: ${error.message}`, { status: 500 });
  }

  const zaglavlje = ['email', 'prijava', 'privola_verzija', 'privola_vrijeme', 'privola_nacin', 'izvor', 'ip', 'preglednik'];
  const redovi = (data ?? []).map((r) =>
    [r.email, r.created_at, r.consent_version, r.consent_given_at, r.consent_method, r.referrer, r.ip, r.user_agent]
      .map(csvPolje)
      .join(',')
  );

  /* BOM da Excel ispravno otvori UTF-8 (č, ć, š...). */
  const csv = '﻿' + [zaglavlje.join(','), ...redovi].join('\r\n') + '\r\n';
  const datum = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tejla-prijave-${datum}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

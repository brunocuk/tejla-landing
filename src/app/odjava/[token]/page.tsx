import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

/* Port WaitlistController@unsubscribe + unsubscribed.blade.php. */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Odjava · Tejla',
  robots: { index: false, follow: false },
};

export default async function Odjava({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const db = supabaseAdmin();
  if (!db) notFound();

  const { data, error } = await db
    .from('waitlist_signups')
    .delete()
    .eq('token', token)
    .select('email');

  if (error || !data || data.length === 0) notFound();

  return (
    <div className="bye">
      <div>
        <h1>Uklonili smo te s liste.</h1>
        <p>
          Nema više mailova od nas. Ako se predomisliš, vrata su otvorena — <a href="/">tejla.app</a>.
        </p>
      </div>
    </div>
  );
}

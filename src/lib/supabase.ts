import { createClient, SupabaseClient } from '@supabase/supabase-js';

/*
 * Server-side Supabase klijent sa service role ključem. Tablica
 * waitlist_signups ima uključen RLS bez policyja pa joj se može
 * pristupiti isključivo odavde, nikad iz browsera.
 */

let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

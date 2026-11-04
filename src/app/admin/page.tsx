import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_COOKIE } from '@/lib/adminAuth';
import './admin.css';

/*
 * Mini CRM za Mateju: pregled prijava na listu ranog pristupa.
 * Rutu štiti src/proxy.ts (sesija kroz /admin/login); bez env
 * varijable TEJLA_ADMIN_PASSWORD cijeli /admin vraća 404.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Prijave · Tejla',
  robots: { index: false, follow: false },
};

type Signup = {
  id: string;
  email: string;
  created_at: string;
  referrer: string | null;
  consent_version: string | null;
  consent_given_at: string | null;
  consent_method: string | null;
  invited_at: string | null;
};

const datumFmt = new Intl.DateTimeFormat('hr-HR', {
  timeZone: 'Europe/Zagreb',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function izvorPrikaz(referrer: string | null): string {
  if (!referrer) return '·';
  try {
    const u = new URL(referrer);
    const host = u.host.replace(/^www\./, '');
    if (host === 'tejla.app') return 'tejla.app';
    return host;
  } catch {
    return referrer.slice(0, 40);
  }
}

async function odjaviSe() {
  'use server';
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

async function obrisiPrijavu(formData: FormData) {
  'use server';
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const db = supabaseAdmin();
  if (!db) return;
  const { error } = await db.from('waitlist_signups').delete().eq('id', id);
  if (error) console.error('Tejla admin: brisanje nije uspjelo', error.message);
  revalidatePath('/admin');
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const upit = (q ?? '').trim();

  const db = supabaseAdmin();
  if (!db) {
    return (
      <main className="adm">
        <p className="adm__error">Baza nije dostupna: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nisu postavljeni.</p>
      </main>
    );
  }

  const prije7dana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const prije24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [ukupnoRes, tjedanRes, danasRes, listaRes] = await Promise.all([
    db.from('waitlist_signups').select('*', { count: 'exact', head: true }),
    db.from('waitlist_signups').select('*', { count: 'exact', head: true }).gte('created_at', prije7dana),
    db.from('waitlist_signups').select('*', { count: 'exact', head: true }).gte('created_at', prije24h),
    (() => {
      let sel = db
        .from('waitlist_signups')
        .select('id, email, created_at, referrer, consent_version, consent_given_at, consent_method, invited_at')
        .order('created_at', { ascending: false })
        .limit(2000);
      if (upit) sel = sel.ilike('email', `%${upit.replace(/[%_]/g, '')}%`);
      return sel;
    })(),
  ]);

  const greska = listaRes.error?.message ?? null;
  const prijave = (listaRes.data ?? []) as Signup[];
  const ukupno = ukupnoRes.count ?? 0;
  const tjedan = tjedanRes.count ?? 0;
  const danas = danasRes.count ?? 0;

  return (
    <main className="adm">
      <header className="adm__top">
        <a href="/" className="logo">
          tejla<span>.</span>
        </a>
        <div className="adm__topright">
          <span className="adm__tag">Prijave na rani pristup</span>
          <form action={odjaviSe}>
            <button type="submit" className="adm__logout">Odjava</button>
          </form>
        </div>
      </header>

      <section className="adm__stats">
        <div className="adm__stat">
          <strong>{ukupno}</strong>
          <span>na listi</span>
        </div>
        <div className="adm__stat">
          <strong>{tjedan}</strong>
          <span>zadnjih 7 dana</span>
        </div>
        <div className="adm__stat">
          <strong>{danas}</strong>
          <span>zadnja 24 sata</span>
        </div>
      </section>

      <section className="adm__bar">
        <form method="get" action="/admin" className="adm__search">
          <input
            type="search"
            name="q"
            defaultValue={upit}
            placeholder="Traži po e-mail adresi…"
            aria-label="Pretraga po e-mail adresi"
          />
          <button type="submit" className="adm__btn">Traži</button>
          {upit ? (
            <a href="/admin" className="adm__clear">Poništi</a>
          ) : null}
        </form>
        <a href="/admin/export" className="adm__btn adm__btn--plum">Preuzmi CSV</a>
      </section>

      {greska ? <p className="adm__error">Čitanje liste nije uspjelo: {greska}</p> : null}

      <section className="adm__tablewrap">
        <table className="adm__table">
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Prijava</th>
              <th>Privola</th>
              <th>Pozivnica</th>
              <th>Izvor</th>
              <th aria-label="Radnje"></th>
            </tr>
          </thead>
          <tbody>
            {prijave.length === 0 ? (
              <tr>
                <td colSpan={6} className="adm__empty">
                  {upit ? `Nema prijava za "${upit}".` : 'Još nema prijava. Stižu.'}
                </td>
              </tr>
            ) : (
              prijave.map((p) => (
                <tr key={p.id}>
                  <td className="adm__email">{p.email}</td>
                  <td>{datumFmt.format(new Date(p.created_at))}</td>
                  <td>
                    {p.consent_version ? (
                      <span className="adm__ok" title={`${p.consent_version} · ${p.consent_method ?? ''}`}>
                        da
                      </span>
                    ) : (
                      <span className="adm__meh" title="Prijava nastala prije uvođenja checkboxa">
                        prije checkboxa
                      </span>
                    )}
                  </td>
                  <td>
                    {p.invited_at ? (
                      <span className="adm__ok" title={datumFmt.format(new Date(p.invited_at))}>
                        poslana
                      </span>
                    ) : (
                      <span className="adm__meh">čeka</span>
                    )}
                  </td>
                  <td>{izvorPrikaz(p.referrer)}</td>
                  <td className="adm__actions">
                    <details className="adm__del">
                      <summary>Obriši</summary>
                      <form action={obrisiPrijavu}>
                        <input type="hidden" name="id" value={p.id} />
                        <span>Sigurno? Briše se odmah i trajno.</span>
                        <button type="submit" className="adm__btn adm__btn--danger">
                          Da, obriši
                        </button>
                      </form>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {prijave.length >= 2000 ? (
        <p className="adm__note">Prikazano je zadnjih 2000 prijava; za sve koristi CSV.</p>
      ) : null}

      <footer className="adm__foot">
        <p>
          Brisanje uklanja prijavu trajno (koristi se i za zahtjeve za brisanje podataka).
          CSV sadrži i tehničke podatke kojih nema u tablici. Pristup imaju samo Mateja i Ninefold.
        </p>
      </footer>
    </main>
  );
}

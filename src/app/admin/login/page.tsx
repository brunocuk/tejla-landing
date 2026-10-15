import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { throttled } from '@/lib/throttle';
import {
  ADMIN_COOKIE,
  SESSION_DAYS,
  createSessionToken,
  provjeriLozinku,
  verifySessionToken,
} from '@/lib/adminAuth';
import '../admin.css';

/* Prijava u mini CRM. Ruta je jedina pod /admin koju proxy pušta bez sesije. */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Prijava · Tejla',
  robots: { index: false, follow: false },
};

async function prijaviSe(formData: FormData) {
  'use server';
  const lozinka = process.env.TEJLA_ADMIN_PASSWORD;
  if (!lozinka) redirect('/admin/login?e=1');

  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || 'unknown';
  if (throttled(ip, 5)) redirect('/admin/login?e=2');

  const unos = String(formData.get('lozinka') ?? '');
  if (!(await provjeriLozinku(unos, lozinka))) redirect('/admin/login?e=1');

  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionToken(lozinka), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect('/admin');
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;

  /* Već prijavljene vodi ravno na pregled. */
  const lozinka = process.env.TEJLA_ADMIN_PASSWORD;
  const store = await cookies();
  if (lozinka && (await verifySessionToken(lozinka, store.get(ADMIN_COOKIE)?.value))) {
    redirect('/admin');
  }

  return (
    <main className="login">
      <form className="login__card" action={prijaviSe}>
        <a href="/" className="logo login__logo">
          tejla<span>.</span>
        </a>
        <h1 className="login__title">Prijave na rani pristup</h1>
        <p className="login__hint">Interni pregled za Tejlin tim.</p>

        <label className="login__label" htmlFor="lozinka">
          Lozinka
        </label>
        <input
          id="lozinka"
          name="lozinka"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="login__input"
        />

        {e === '2' ? (
          <p className="login__error">Previše pokušaja. Pričekaj minutu pa pokušaj ponovno.</p>
        ) : e ? (
          <p className="login__error">Lozinka nije ispravna.</p>
        ) : null}

        <button type="submit" className="login__submit">
          Uđi
        </button>

        <p className="login__foot">Tejla pamti. Ti živiš.</p>
      </form>
    </main>
  );
}

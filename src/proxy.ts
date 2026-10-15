import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/adminAuth';

/*
 * Zaštita /admin ruta (Next proxy, bivši middleware): bez valjane sesije
 * preusmjerava na /admin/login. Bez postavljene env varijable ruta se
 * ponaša kao da ne postoji (fail closed). Kolačić je tehnički nužan,
 * postavlja se tek nakon uspješne prijave administratora, pa tvrdnje o
 * kolačićima u Pravilima privatnosti ostaju istinite.
 */

export const config = { matcher: ['/admin', '/admin/:path*'] };

export async function proxy(request: NextRequest) {
  const pass = process.env.TEJLA_ADMIN_PASSWORD;
  if (!pass) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const ok = await verifySessionToken(pass, request.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) {
    return NextResponse.next();
  }

  const login = request.nextUrl.clone();
  login.pathname = '/admin/login';
  login.search = '';
  return NextResponse.redirect(login);
}

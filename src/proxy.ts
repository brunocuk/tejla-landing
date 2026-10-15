import { NextRequest, NextResponse } from 'next/server';

/*
 * HTTP Basic Auth za /admin (Next proxy, bivši middleware). Namjerno bez kolačića i sessiona: Pravila
 * privatnosti jamče da landing ne koristi kolačiće, a preglednik vjerodajnice
 * drži u memoriji sam. Bez postavljenih env varijabli ruta se ponaša kao da
 * ne postoji (fail closed).
 */

export const config = { matcher: ['/admin', '/admin/:path*'] };

export function proxy(request: NextRequest) {
  const user = process.env.TEJLA_ADMIN_USER;
  const pass = process.env.TEJLA_ADMIN_PASSWORD;
  if (!user || !pass) {
    return new NextResponse('Not found', { status: 404 });
  }

  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    try {
      const [u, ...rest] = atob(encoded).split(':');
      if (u === user && rest.join(':') === pass) {
        return NextResponse.next();
      }
    } catch {
      /* neispravan base64 pada na 401 ispod */
    }
  }

  return new NextResponse('Prijava je potrebna.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Tejla", charset="UTF-8"' },
  });
}

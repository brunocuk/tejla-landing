/*
 * Admin sesija za /admin: HMAC-potpisani token u httpOnly kolačiću.
 * Web Crypto API, pa isti kod radi i u proxyju (edge) i u Node rutama.
 * Tajna se izvodi iz TEJLA_ADMIN_PASSWORD: promjena lozinke
 * automatski poništava sve aktivne sesije.
 */

const enc = new TextEncoder();

export const ADMIN_COOKIE = 'tejla_admin';
export const SESSION_DAYS = 30;

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(`tejla-admin:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* Usporedba neovisna o sadržaju, da usporedba potpisa ne curi kroz timing. */
function istiNiz(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sig = hex(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(String(exp))));
  return `${exp}.${sig}`;
}

export async function verifySessionToken(secret: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || !sig || exp < Date.now()) return false;
  const expected = hex(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(expStr)));
  return istiNiz(sig, expected);
}

/* I unos lozinke uspoređujemo preko HMAC-a, iz istog timing razloga. */
export async function provjeriLozinku(unos: string, lozinka: string): Promise<boolean> {
  const key = await hmacKey(lozinka);
  const a = hex(await crypto.subtle.sign('HMAC', key, enc.encode(unos)));
  const b = hex(await crypto.subtle.sign('HMAC', key, enc.encode(lozinka)));
  return istiNiz(a, b);
}

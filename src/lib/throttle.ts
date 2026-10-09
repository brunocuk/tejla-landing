/*
 * Jednostavan in-memory throttle po IP-u, ekvivalent Laravelovog
 * throttle:8,1. Na serverlessu je brojač po instanci pa je granica
 * mekša nego u Laravelu, ali u kombinaciji s honeypotom i dedupom
 * dovoljna za formu na listi čekanja.
 */

const hits = new Map<string, number[]>();

export function throttled(ip: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);

  if (list.length >= limit) {
    hits.set(ip, list);
    return true;
  }

  list.push(now);
  hits.set(ip, list);

  if (hits.size > 10_000) hits.clear();
  return false;
}

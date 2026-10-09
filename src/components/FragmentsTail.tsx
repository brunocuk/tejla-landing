/* Port partials/fragments.blade.php — jedna stranica beskonačnog repa. */

import { fragmentBatch } from '@/lib/content';

export default function FragmentsTail({ tailPage }: { tailPage: number }) {
  const { batch, cycle } = fragmentBatch(tailPage);
  const first = tailPage === 1;

  return (
    <>
      {first && (
        <section className="sec sec--cream sec--tail-intro" data-reveal>
          <p className="eyebrow" data-r>
            I dalje pamti
          </p>
          <h2 className="tail-title" data-r>
            Ovo je samo jedan tjedan.
          </h2>
          <p className="lead lead--tight" data-r>
            Nastavi listati koliko god želiš — sve ovo bi inače bilo u tvojoj glavi.
          </p>
        </section>
      )}

      <section className="sec sec--tail" data-cycle={cycle} data-reveal>
        {batch.map((f, i) => (
          <article key={i} className="frag" data-r style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
            <time>{f.time}</time>
            <p>{f.text}</p>
            <span className="frag__ok" aria-hidden="true">
              zapamćeno
            </span>
          </article>
        ))}
      </section>
    </>
  );
}

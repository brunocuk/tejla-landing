/* Port partials/section.blade.php — jedna sekcija streama. */

import Icon from './Icon';
import type { CtaMode } from '@/lib/config';
import type { SectionData } from '@/lib/content';

function nl2br(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

interface Props {
  section: SectionData;
  index: number;
  ctaMode: CtaMode;
  appUrl: string;
}

export default function Section({ section, index, ctaMode, appUrl }: Props) {
  const s = section;

  return (
    <section className={`sec sec--${s.theme} sec--${s.type}`} data-index={index} data-reveal>
      {s.mark && (
        <div className="mark" data-r>
          <span className="mark__t">t</span>
          <span className="mark__d"></span>
        </div>
      )}

      {s.eyebrow && (
        <p className="eyebrow" data-r>
          {s.eyebrow}
        </p>
      )}

      {s.ghost && (
        <h2 className="ghost" data-r>
          {nl2br(s.ghost)}
        </h2>
      )}

      {s.type === 'stream' && (
        <>
          <h2 className="title" data-r>
            {s.title}
          </h2>

          <div className="stream">
            {s.items!.map((item, i) => (
              <div key={i} className="chip" data-r style={{ '--d': `${120 + i * 130}ms` } as React.CSSProperties}>
                {item.text}
              </div>
            ))}

            <div
              className="resolve"
              data-r
              style={{ '--d': `${120 + s.items!.length * 130 + 160}ms` } as React.CSSProperties}
            >
              <strong>{s.resolve!.title}</strong>
              <span>{s.resolve!.subtitle}</span>
            </div>
          </div>
        </>
      )}

      {s.type === 'video' && (
        <>
          {s.title && (
            <h2 className="title title--center" data-r>
              {s.title}
            </h2>
          )}

          <div className="video" data-r style={{ '--ratio': s.ratio ?? '576 / 1024' } as React.CSSProperties}>
            <video
              className="video__el"
              muted
              playsInline
              loop
              autoPlay
              preload="none"
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              poster={s.poster}
              aria-label="Prikaz Tejle u upotrebi"
            >
              {s.sources!.map((src) => (
                <source key={src.src} src={src.src} type={src.type} />
              ))}
            </video>
            <button type="button" className="video__toggle" data-video-toggle aria-label="Pauziraj video">
              <span className="video__toggle-ico" aria-hidden="true"></span>
            </button>
          </div>
        </>
      )}

      {s.type === 'grid' && (
        <div className="grid">
          {s.cells!.map((cell, i) => (
            <div key={i} className="cell" data-r style={{ '--d': `${i * 110}ms` } as React.CSSProperties}>
              <h3>{cell.title}</h3>
              <p>{cell.body}</p>
            </div>
          ))}
        </div>
      )}

      {s.type === 'quote' && (
        <h2 className="quote" data-r>
          {s.title}
          <em>{s.subtitle}</em>
        </h2>
      )}

      {s.type === 'values' && (
        <ul className="values">
          {s.values!.map((v, i) => (
            <li key={i} data-r style={{ '--d': `${i * 90}ms` } as React.CSSProperties}>
              <span className="values__ico" aria-hidden="true">
                <Icon name={v.icon} />
              </span>
              <span>{v.text}</span>
            </li>
          ))}
        </ul>
      )}

      {s.lead && (
        <p className="lead" data-r>
          {s.lead}
        </p>
      )}

      {s.cta ? (
        <div className="cta-wrap" data-r>
          {ctaMode === 'app' ? (
            <a href={appUrl} className="btn btn--solid">
              Otvori Tejlu
            </a>
          ) : (
            <button type="button" className="btn btn--solid" data-open-form>
              {s.cta}
            </button>
          )}
          {s.note && <p className="note">{s.note}</p>}
        </div>
      ) : (
        s.note && (
          <p className="note" data-r>
            {s.note}
          </p>
        )
      )}
    </section>
  );
}

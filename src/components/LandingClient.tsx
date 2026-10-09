'use client';

/*
 * Port public/js/tejla.js + ljuske iz landing.blade.php:
 * infinite scroll, reveal animacije, nav tema, video autoplay/pauza,
 * sticky dock i dialog s prijavom na listu čekanja.
 *
 * Razlika prema Laravelu: sekcije se ne dohvaćaju fetchom nego se
 * renderiraju iz lokalnog sadržaja (isti podaci, isto ponašanje,
 * ista paginacija), pa stream radi i bez ijednog server poziva.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Section from './Section';
import FragmentsTail from './FragmentsTail';
import { PER_PAGE, sections, sectionPages } from '@/lib/content';
import type { CtaMode } from '@/lib/config';

/* Zaštita: ne učitavamo beskonačno bez interakcije korisnika. */
const MAX_AUTO_PAGES = 40;

interface Props {
  ctaMode: CtaMode;
  appUrl: string;
}

export default function LandingClient({ ctaMode, appUrl }: Props) {
  /* Prva stranica sekcija je odmah tu (SSR, SEO + brzi first paint). */
  const [sectionPagesLoaded, setSectionPagesLoaded] = useState(1);
  const [tailPages, setTailPages] = useState(0);
  const [loaderText, setLoaderText] = useState('Tejla pamti dalje…');

  const streamRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);

  const loadedPagesRef = useRef(0);
  const sectionPagesRef = useRef(1);
  const tailPagesRef = useRef(0);
  const observersRef = useRef<{
    reveal: IntersectionObserver;
    theme: IntersectionObserver;
    video: IntersectionObserver;
  } | null>(null);

  const [msg, setMsg] = useState<{ kind: '' | 'ok' | 'err'; text: string }>({ kind: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState('Prijavi se za rani pristup');

  /* ---------- infinite scroll ---------- */
  const loadMore = useCallback(() => {
    if (loadedPagesRef.current >= MAX_AUTO_PAGES) {
      setLoaderText('Dovoljno za danas.');
      return;
    }
    loadedPagesRef.current++;
    if (sectionPagesRef.current < sectionPages) {
      sectionPagesRef.current++;
      setSectionPagesLoaded(sectionPagesRef.current);
    } else {
      tailPagesRef.current++;
      setTailPages(tailPagesRef.current);
    }
  }, []);

  /* ---------- observeri (jednom) ---------- */
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navRef.current!;

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            reveal.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    const theme = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          nav.classList.toggle('on-dark', e.target.classList.contains('sec--ink'));
        });
      },
      { rootMargin: '-1px 0px -92% 0px', threshold: 0 }
    );

    /*
     * Autoplay radi samo ako je video muted + playsinline. Datoteke su
     * ionako bez audio streama, ali atribut mora ostati zbog Safarija.
     * Pauziramo kad izađe iz kadra da ne troši bateriju.
     */
    const video = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (v.dataset.userPaused === '1') return;
          if (e.isIntersecting && !reduceMotion) {
            const play = v.play();
            if (play && play.catch) play.catch(() => {/* autoplay odbijen */});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.35 }
    );

    observersRef.current = { reveal, theme, video };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '900px 0px' }
    );
    io.observe(sentinelRef.current!);

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 20);
      dockRef.current!.classList.toggle('is-on', y > window.innerHeight * 0.9);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* prva sekcija odmah vidljiva */
    const firstSec = document.querySelector('#stream .sec');
    if (firstSec) firstSec.classList.add('is-in');

    return () => {
      reveal.disconnect();
      theme.disconnect();
      video.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      observersRef.current = null;
    };
  }, [loadMore]);

  /* ---------- novi sadržaj → zakači observere i video kontrole ---------- */
  useEffect(() => {
    const stream = streamRef.current!;
    const obs = observersRef.current;
    if (!obs) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    stream.querySelectorAll('[data-reveal]').forEach((el) => {
      if ((el as HTMLElement).dataset.obs === '1') return;
      (el as HTMLElement).dataset.obs = '1';
      obs.reveal.observe(el);
      if (el.classList.contains('sec')) obs.theme.observe(el);
    });

    stream.querySelectorAll<HTMLVideoElement>('.video__el').forEach((v) => {
      if (v.dataset.init === '1') return;
      v.dataset.init = '1';
      v.muted = true; /* nužno za autoplay na iOS-u */
      v.removeAttribute('controls');
      obs.video.observe(v);

      const wrap = v.closest('.video');
      const toggle = wrap && wrap.querySelector('[data-video-toggle]');
      if (!toggle) return;

      if (reduceMotion) toggle.classList.add('is-paused');

      toggle.addEventListener('click', () => {
        if (v.paused) {
          v.dataset.userPaused = '0';
          v.play();
          toggle.classList.remove('is-paused');
          toggle.setAttribute('aria-label', 'Pauziraj video');
        } else {
          v.dataset.userPaused = '1';
          v.pause();
          toggle.classList.add('is-paused');
          toggle.setAttribute('aria-label', 'Pokreni video');
        }
      });
    });

    /*
     * Ako je sentinel i dalje unutar zone observera (viewport + 900px),
     * učitaj još: observer ne okida dok sentinel ne izađe i ponovno uđe,
     * pa bez ove provjere stream stane čim sekcija završi unutar margine.
     */
    const t = setTimeout(() => {
      const r = sentinelRef.current?.getBoundingClientRect();
      if (r && r.top < window.innerHeight + 900) loadMore();
    }, 220);
    return () => clearTimeout(t);
  }, [sectionPagesLoaded, tailPages, loadMore]);

  /* ---------- dialog ---------- */
  const openSheet = () => {
    const sheet = sheetRef.current!;
    if (typeof sheet.showModal === 'function') sheet.showModal();
    else sheet.setAttribute('open', '');
    setTimeout(() => emailRef.current?.focus(), 120);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-open-form]')) {
        e.preventDefault();
        openSheet();
        return;
      }
      if (target.closest('[data-close-form]')) {
        sheetRef.current?.close();
        return;
      }
      /* klik na backdrop */
      if (e.target === sheetRef.current) sheetRef.current?.close();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* ---------- slanje prijave ---------- */
  const resetBtn = () => {
    setSubmitting(false);
    setSubmitLabel('Prijavi se za rani pristup');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef.current!.value.trim();
    if (!email || email.indexOf('@') < 1) {
      setMsg({ kind: 'err', text: 'Upiši ispravnu e-mail adresu.' });
      emailRef.current!.focus();
      return;
    }

    setSubmitting(true);
    setSubmitLabel('Šaljem…');
    setMsg({ kind: '', text: '' });

    fetch('/prijava', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, website: websiteRef.current!.value }),
    })
      .then((r) => r.json().then((body) => ({ ok: r.ok, status: r.status, body })))
      .then((res) => {
        if (res.ok) {
          setMsg({ kind: 'ok', text: res.body.message || 'Gotovo. Na listi si.' });
          emailRef.current!.value = '';
          setSubmitLabel('Zapamćeno.');
          setTimeout(() => {
            sheetRef.current?.close();
            resetBtn();
          }, 2600);
          return;
        }

        let err = 'Nešto nije prošlo. Pokušaj ponovno.';
        if (res.status === 429) err = 'Previše pokušaja. Pričekaj minutu.';
        else if (res.body.message) err = res.body.message;
        setMsg({ kind: 'err', text: err });
        resetBtn();
      })
      .catch(() => {
        setMsg({ kind: 'err', text: 'Nema veze sa serverom. Provjeri internet.' });
        resetBtn();
      });
  };

  /* ---------- render ---------- */
  const visibleSections = sections.slice(0, sectionPagesLoaded * PER_PAGE);

  return (
    <>
      <nav className="nav" ref={navRef}>
        <a href="#" className="logo">
          tejla<span>.</span>
        </a>
        {ctaMode === 'app' ? (
          <a href={appUrl} className="btn btn--ghost">
            Otvori Tejlu
          </a>
        ) : (
          <button type="button" className="btn btn--ghost" data-open-form>
            Želim probati
          </button>
        )}
      </nav>

      <main id="stream" ref={streamRef}>
        {visibleSections.map((s, i) => (
          <Section key={i} section={s} index={i} ctaMode={ctaMode} appUrl={appUrl} />
        ))}
        {Array.from({ length: tailPages }, (_, i) => (
          <FragmentsTail key={`tail-${i}`} tailPage={i + 1} />
        ))}
      </main>

      <div className="loader">
        <div className="loader__dots">
          <i></i>
          <i></i>
          <i></i>
        </div>
        <p className="loader__txt">{loaderText}</p>
      </div>

      <div ref={sentinelRef} id="sentinel" aria-hidden="true"></div>

      <footer className="foot">
        <p className="sig">
          tejla<span>.</span>
        </p>

        <ul className="foot__links">
          <li>
            <a href="/privatnost">Pravila privatnosti</a>
          </li>
          <li>
            <a href="/uvjeti">Uvjeti korištenja</a>
          </li>
          <li>
            <a href="/kontakt">Kontakt</a>
          </li>
          <li>
            <a href={appUrl}>Otvori Tejlu</a>
          </li>
        </ul>

        <p>Tejla pamti. Ti živiš. &nbsp;·&nbsp; &copy; {new Date().getFullYear()}</p>
      </footer>

      <div className="dock" ref={dockRef}>
        {ctaMode === 'app' ? (
          <>
            <p>Tejla te čeka.</p>
            <a href={appUrl} style={{ textDecoration: 'none' }}>
              <button type="button">Otvori Tejlu</button>
            </a>
          </>
        ) : (
          <>
            <p>Tejla je u zatvorenoj beti.</p>
            <button type="button" data-open-form>
              Rani pristup
            </button>
          </>
        )}
      </div>

      <dialog className="sheet" ref={sheetRef}>
        <div className="sheet__inner">
          <button type="button" className="sheet__close" data-close-form aria-label="Zatvori">
            &times;
          </button>
          <h2>Želiš među prvima?</h2>
          <p className="sub">Ostavi mail i javit ćemo ti se kad otvorimo sljedeću grupu.</p>

          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="ti@primjer.hr"
              />
            </div>

            <input
              ref={websiteRef}
              type="text"
              name="website"
              className="hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <button type="submit" className="btn btn--solid" disabled={submitting}>
              {submitLabel}
            </button>
            <p className={`sheet__msg${msg.kind ? ` ${msg.kind}` : ''}`} role="status" aria-live="polite">
              {msg.text}
            </p>
            <p className="privacy">Sve što podijeliš je privatno i sigurno. Bez spama.</p>
          </form>
        </div>
      </dialog>
    </>
  );
}

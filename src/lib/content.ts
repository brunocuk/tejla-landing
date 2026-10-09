/*
 * Izvor sadržaja za landing page. Port iz landing-laravel/app/Support/TejlaContent.php.
 * Kopija je Matejina i prenosi se doslovno, uključujući interpunkciju.
 *
 * Sekcije se serviraju stranicu po stranicu (infinite scroll). Kad se "prave"
 * sekcije potroše, stream se nastavlja beskonačno karticama fragmenata.
 */

export type SectionTheme = 'cream' | 'ink' | 'sand' | 'sage';

export interface SectionData {
  type: 'ghost' | 'stream' | 'video' | 'grid' | 'quote' | 'values' | 'signup';
  theme: SectionTheme;
  eyebrow?: string;
  ghost?: string;
  lead?: string;
  cta?: string;
  note?: string;
  title?: string;
  subtitle?: string;
  mark?: boolean;
  items?: { text: string }[];
  resolve?: { title: string; subtitle: string };
  sources?: { src: string; type: string }[];
  poster?: string;
  ratio?: string;
  cells?: { title: string; body: string }[];
  values?: { icon: string; text: string }[];
}

/** Koliko sekcija ide u jednu "stranicu" infinite scrolla. */
export const PER_PAGE = 1;

/** Koliko fragmenata ide u jednu stranicu beskonačnog repa. */
export const FRAGMENTS_PER_PAGE = 4;

export const sections: SectionData[] = [
  {
    type: 'ghost',
    theme: 'cream',
    eyebrow: 'Ne još jedan organizator',
    ghost: 'Ne moraš sve\ndržati u glavi.',
    lead: 'Poruke. Papirići. Termini. Ideje. Ono čega se sjetiš usred vožnje. Samo daj Tejli. Ona će znati što s tim.',
    cta: 'Želim među prvima',
    note: 'Tejla je trenutno u zatvorenoj beti.',
  },
  {
    type: 'stream',
    theme: 'ink',
    title: 'Život ti informacije ne šalje uredno posložene.',
    items: [
      { text: '„Mama, u petak trebam donijeti 8 € za izlet."' },
      { text: 'Screenshot termina kod zubara · 14. 9. u 16:30' },
      { text: '„Podsjeti me sutra kupiti poklon za Anu."' },
    ],
    resolve: {
      title: 'Tejla je zapamtila.',
      subtitle: 'Ne moraš ti.',
    },
  },
  {
    // ── VIDEO ──────────────────────────────────────────────────
    // Poziciju mijenjaš tako da ovaj blok pomakneš gore/dolje
    // unutar ovog polja. Ništa drugo ne treba dirati.
    type: 'video',
    theme: 'sand',
    eyebrow: 'Ovako to izgleda',
    title: 'Jedna poruka. Ostalo Tejla složi sama.',
    sources: [
      { src: '/video/tejla-demo.webm', type: 'video/webm' },
      { src: '/video/tejla-demo.mp4', type: 'video/mp4' },
    ],
    poster: '/video/tejla-demo-poster.jpg',
    ratio: '576 / 1024',
  },
  {
    type: 'grid',
    theme: 'cream',
    eyebrow: 'Samo joj daj ono što ne želiš pamtiti',
    ghost: 'Bez prepisivanja\nživota u još jednu\naplikaciju.',
    cells: [
      { title: 'Pošalji.', body: 'Poruku ili tekst.' },
      { title: 'Slikaj.', body: 'Papirić, obavijest, termin.' },
      { title: 'Reci.', body: 'Dok ti je još u glavi.' },
      { title: 'Zaboravi.', body: 'Tejla neće.' },
    ],
  },
  {
    type: 'quote',
    theme: 'sage',
    title: 'Ne treba ti više discipline.',
    subtitle: 'Treba ti manje stvari u glavi.',
  },
  {
    type: 'ghost',
    theme: 'cream',
    ghost: 'Tejla nije mjesto\ngdje organiziraš\nživot.',
    lead: 'Tejla je mjesto kojem ga predaš. U pozadini može složiti termin, podsjetnik ili obvezu i povezati ono što treba. Ali ti ne bi trebala razmišljati o sustavu. Samo nastaviti sa svojim danom.',
  },
  {
    type: 'values',
    theme: 'sand',
    eyebrow: 'Tejla je tu da ti',
    values: [
      { icon: 'circle', text: 'pamti što je važno umjesto tebe' },
      { icon: 'clock', text: 'podsjeća na vrijeme kad zatreba' },
      { icon: 'leaf', text: 'povezuje obitelj i obveze' },
      { icon: 'lock', text: 'štiti tvoje informacije i privatnost' },
      { icon: 'heart', text: 'donosi mir u svaki dan' },
    ],
  },
  {
    type: 'signup',
    theme: 'cream',
    mark: true,
    ghost: 'Tejla pamti.\nTi živiš.',
    note: 'Prvi pristup Tejli otvaramo postupno.',
    cta: 'Prijavi se za rani pristup',
  },
];

/** Beskonačni rep: fragmenti koji se vrte u krug nakon zadnje sekcije. */
export const fragments: { time: string; text: string }[] = [
  { time: 'utorak, 07:40', text: 'Lucija treba bijelu majicu za priredbu.' },
  { time: 'srijeda, 12:15', text: 'Uplatiti izlet — 8 €, rok petak.' },
  { time: 'srijeda, 16:30', text: 'Ortodont, Ordinacija X.' },
  { time: 'četvrtak, 09:02', text: 'Kupiti tempere za Lari.' },
  { time: 'četvrtak, 18:00', text: 'Korina — gimnastika, Sportski centar.' },
  { time: 'petak, 07:15', text: 'Polazak na izlet. Voda, sendvič, kapa.' },
  { time: 'subota, 10:00', text: 'Lara — trening.' },
  { time: 'nedjelja, 19:20', text: 'Poklon za Anu — rođendan u ponedjeljak.' },
  { time: 'ponedjeljak, 08:05', text: 'Roditeljski sastanak, 20. u 17:00.' },
  { time: 'ponedjeljak, 21:40', text: '„Sjetila sam se dok sam prala suđe."' },
];

/** Ukupan broj stranica koje sadrže prave sekcije. */
export const sectionPages = Math.ceil(sections.length / PER_PAGE);

/** Batch fragmenata za stranicu repa (stranice nakon sectionPages), ciklički. */
export function fragmentBatch(tailPage: number) {
  const offset = (tailPage - 1) * FRAGMENTS_PER_PAGE;
  const batch = [];
  for (let i = 0; i < FRAGMENTS_PER_PAGE; i++) {
    batch.push(fragments[(offset + i) % fragments.length]);
  }
  return { batch, cycle: Math.floor(offset / fragments.length) + 1 };
}

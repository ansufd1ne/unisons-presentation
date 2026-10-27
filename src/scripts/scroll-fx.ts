// Effets liés au défilement (écrits pour ce site, sans bibliothèque) :
//  - data-scrub     : parallaxe / entrée de section, valeurs interpolées selon la position de la page
//  - data-highlight : texte qui passe de 50 % à 100 % d'opacité, mot après mot
//  - data-stack     : cartes empilées en 3D qui reculent l'une après l'autre (écran large)
// Rien ne s'exécute si « réduire les animations » est activé.

type Val = { v: number; u: string };
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const pair = (s?: string): [Val, Val] | null => {
  if (!s) return null;
  const parts = s.split(',').map((x) => x.trim());
  if (parts.length !== 2) return null;
  const p = (x: string): Val => ({ v: parseFloat(x), u: x.endsWith('px') ? 'px' : '%' });
  return [p(parts[0]), p(parts[1])];
};
const mix = (a: Val, b: Val, t: number) => a.v + (b.v - a.v) * t;

function init() {
  /* ---------- 1. scrub ---------- */
  interface Scrub {
    el: HTMLElement; trig: HTMLElement; range: string; k: number; cur: number;
    x: [Val, Val] | null; y: [Val, Val] | null; o: [Val, Val] | null; s: [Val, Val] | null; w: [number, number];
  }
  const scrubs: Scrub[] = [...document.querySelectorAll<HTMLElement>('[data-scrub]')].map((el) => {
    const w = (el.dataset.window ?? '0,1').split(',').map(parseFloat);
    return {
      el, trig: (el.dataset.trigger ? el.closest<HTMLElement>(el.dataset.trigger) : null) ?? el,
      range: el.dataset.range ?? 'enter-leave', k: el.dataset.smooth !== undefined ? parseFloat(el.dataset.smooth) : 0.12, cur: 0,
      x: pair(el.dataset.x), y: pair(el.dataset.y), o: pair(el.dataset.opacity), s: pair(el.dataset.scale), w: [w[0] || 0, w[1] || 1],
    };
  });

  const scrubTarget = (it: Scrub) => {
    const r = it.trig.getBoundingClientRect();
    const vh = innerHeight;
    const p = it.range === 'top-top' ? clamp(-r.top / Math.max(r.height, 1)) : clamp((vh - r.top) / (vh + r.height));
    return clamp((p - it.w[0]) / Math.max(it.w[1] - it.w[0], 0.0001));
  };
  const scrubApply = (it: Scrub) => {
    const t = it.cur;
    const parts: string[] = [];
    if (it.x || it.y) {
      const xs = it.x ? `${mix(it.x[0], it.x[1], t).toFixed(3)}${it.x[0].u}` : '0';
      const ys = it.y ? `${mix(it.y[0], it.y[1], t).toFixed(3)}${it.y[0].u}` : '0';
      parts.push(`translate3d(${xs}, ${ys}, 0)`);
    }
    if (it.s) parts.push(`scale(${mix(it.s[0], it.s[1], t).toFixed(4)})`);
    if (parts.length) it.el.style.transform = parts.join(' ');
    if (it.o) it.el.style.opacity = mix(it.o[0], it.o[1], t).toFixed(3);
  };
  scrubs.forEach((it) => { it.el.style.willChange = 'transform, opacity'; it.cur = scrubTarget(it); scrubApply(it); });

  /* ---------- 2. highlight ---------- */
  interface Hl { el: HTMLElement; words: HTMLElement[]; cur: number; }
  // Un texte déjà visible à l'ouverture de la page reste intact : l'effet n'a de sens que pour ce qui arrive en scrollant.
  const belowFold = (el: HTMLElement) => scrollY > 50 || el.getBoundingClientRect().top >= innerHeight * 0.7;
  const hls: Hl[] = [...document.querySelectorAll<HTMLElement>('[data-highlight]')].filter(belowFold).map((el) => {
    const text = el.textContent ?? '';
    el.textContent = '';
    const words: HTMLElement[] = [];
    text.split(/(\s+)/).forEach((part) => {
      if (!part.trim()) { el.append(document.createTextNode(part)); return; }
      const s = document.createElement('span');
      s.className = 'hl';
      s.textContent = part;
      el.append(s);
      words.push(s);
    });
    return { el, words, cur: 0 };
  });
  const hlTarget = (h: Hl) => {
    const r = h.el.getBoundingClientRect();
    return clamp((innerHeight - r.top) / (innerHeight * 0.5 + r.height));
  };
  const hlApply = (h: Hl) => {
    const n = h.words.length;
    // tant que le texte n'est pas entré à l'écran (sous le bas de la fenêtre), les mots restent à 100 %
    const below = h.el.getBoundingClientRect().top > innerHeight;
    h.words.forEach((w, i) => { w.style.opacity = below ? '1' : (0.7 + 0.3 * clamp((h.cur * (n + 4) - i) / 4)).toFixed(3); });
  };
  hls.forEach((h) => { h.cur = hlTarget(h); hlApply(h); });

  /* ---------- 3. empilement 3D ---------- */
  interface Stack { el: HTMLElement; cards: HTMLElement[]; cur: number; }
  const wide = matchMedia('(min-width: 901px)');
  // la dernière carte reste en place ; les autres reculent l'une après l'autre sur la course de la section, quel que soit leur nombre
  const slot = (n: number) => 0.72 / Math.max(n - 1, 1);
  const stacks: Stack[] = [...document.querySelectorAll<HTMLElement>('[data-stack]')].map((el) => ({ el, cards: [...el.querySelectorAll<HTMLElement>('[data-card]')], cur: 0 }));
  const stackTarget = (s: Stack) => {
    const r = s.el.getBoundingClientRect();
    return clamp(-r.top / Math.max(r.height - innerHeight, 1));
  };
  const stackApply = (s: Stack) => {
    s.cards.forEach((c, i) => {
      if (!wide.matches || i >= s.cards.length - 1) { c.style.transform = ''; c.style.opacity = ''; return; }
      const sl = slot(s.cards.length);
      const q = clamp((s.cur - (0.12 + i * sl)) / (sl * 0.95));
      c.style.opacity = (1 - q).toFixed(3);
      c.style.transform = `translate3d(0, ${(q * 25).toFixed(2)}%, ${(-q * innerWidth * 0.25).toFixed(1)}px)`;
    });
  };
  stacks.forEach((s) => { s.cur = stackTarget(s); stackApply(s); });

  /* ---------- boucle commune (lissage du scrub) ---------- */
  let raf = 0;
  const frame = () => {
    raf = 0;
    let moving = false;
    const vh = innerHeight;
    for (const it of scrubs) {
      const r = it.trig.getBoundingClientRect();
      const off = r.bottom < -vh || r.top > vh * 2;
      const t = scrubTarget(it);
      it.cur = off ? t : it.cur + (t - it.cur) * it.k;
      if (!off && Math.abs(t - it.cur) > 0.0008) moving = true; else it.cur = t;
      scrubApply(it);
    }
    for (const h of hls) {
      const t = hlTarget(h);
      h.cur += (t - h.cur) * 0.14;
      if (Math.abs(t - h.cur) > 0.0008) moving = true; else h.cur = t;
      hlApply(h);
    }
    for (const s of stacks) {
      const t = stackTarget(s);
      s.cur += (t - s.cur) * 0.18;
      if (Math.abs(t - s.cur) > 0.0008) moving = true; else s.cur = t;
      stackApply(s);
    }
    if (moving) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  wide.addEventListener('change', kick);
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) init();

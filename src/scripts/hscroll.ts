// Défilement horizontal piloté par le scroll vertical.
// La section ([data-hscroll]) reste épinglée à l'écran (sticky) pendant que la piste ([data-hscroll-track])
// glisse vers la gauche, au rythme du scroll. Quand la dernière carte est entièrement visible, la section
// se libère et la page reprend son défilement normal.
// Actif seulement sur écran large, sans « réduire les animations », et si le contenu tient dans la hauteur
// de l'écran. Sinon la piste garde son défilement horizontal natif (voir le CSS du composant).
// Durée : data-hscroll-ratio = pixels de scroll vertical par pixel de déplacement horizontal
// (1 = un pour un ; 0,5 = deux fois plus rapide ; 2 = deux fois plus lent).

const wide = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

interface H { sec: HTMLElement; pin: HTMLElement; track: HTMLElement; ratio: number; distance: number; length: number; avail: number; cur: number; on: boolean; }

const all: H[] = [...document.querySelectorAll<HTMLElement>('[data-hscroll]')].flatMap((sec) => {
  const pin = sec.querySelector<HTMLElement>('[data-hscroll-pin]');
  const track = sec.querySelector<HTMLElement>('[data-hscroll-track]');
  return pin && track ? [{ sec, pin, track, ratio: parseFloat(sec.dataset.hscrollRatio ?? '1') || 1, distance: 0, length: 0, avail: 0, cur: 0, on: false }] : [];
});

function off(h: H) {
  h.on = false;
  h.sec.classList.remove('hs-on');
  h.sec.style.removeProperty('--hs-distance');
  h.track.style.transform = '';
  if (!h.track.hasAttribute('tabindex')) h.track.setAttribute('tabindex', '0'); // zone défilable : accessible au clavier
}

function measure(h: H) {
  off(h);
  if (!wide.matches) return;
  h.sec.classList.add('hs-on');
  const pad = parseFloat(getComputedStyle(h.pin).paddingLeft) || 0;
  h.avail = h.pin.clientWidth - pad * 2;
  h.distance = Math.max(0, h.track.scrollWidth - h.avail);
  // rien à faire défiler, ou contenu plus haut que l'écran : on garde le défilement natif
  if (h.distance < 2 || h.pin.scrollHeight > h.pin.clientHeight + 2) { off(h); return; }
  h.length = Math.max(1, h.distance * h.ratio); // hauteur de scroll vertical consacrée au défilement
  h.sec.style.setProperty('--hs-distance', `${h.length}px`);
  h.track.removeAttribute('tabindex');
  h.on = true;
  h.cur = target(h);
  paint(h);
}

const target = (h: H) => clamp(-h.sec.getBoundingClientRect().top / Math.max(h.length, 1));
const paint = (h: H) => { h.track.style.transform = `translate3d(${(-h.cur * h.distance).toFixed(1)}px, 0, 0)`; };

let raf = 0;
function frame() {
  raf = 0;
  let moving = false;
  for (const h of all) {
    if (!h.on) continue;
    const t = target(h);
    h.cur += (t - h.cur) * 0.14;
    if (Math.abs(t - h.cur) > 0.0005) moving = true; else h.cur = t;
    paint(h);
  }
  if (moving) raf = requestAnimationFrame(frame);
}
const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

all.forEach((h) => {
  // Un focus clavier sur une carte cachée fait défiler la page jusqu'au point où elle devient visible.
  h.track.addEventListener('focusin', (e) => {
    if (!h.on) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('.card');
    if (!card) return;
    const left = card.offsetLeft - h.track.offsetLeft;
    const right = left + card.offsetWidth;
    const offset = h.cur * h.distance;
    let want = offset;
    if (left < offset) want = left; else if (right > offset + h.avail) want = right - h.avail;
    want = clamp(want, 0, h.distance);
    const top = h.sec.getBoundingClientRect().top + scrollY - h.cur * h.length; // position de début d'épinglage
    scrollTo({ top: top + want * h.ratio, behavior: 'auto' });
  });
  // le conteneur rogné ne doit jamais défiler de lui-même (un focus peut le provoquer)
  h.pin.addEventListener('scroll', () => { h.pin.scrollLeft = 0; h.pin.scrollTop = 0; });
});

const remeasure = () => { all.forEach(measure); kick(); };
remeasure();
document.fonts?.ready.then(remeasure);
wide.addEventListener('change', remeasure);
let t = 0;
addEventListener('resize', () => { clearTimeout(t); t = window.setTimeout(remeasure, 120); });
addEventListener('scroll', kick, { passive: true });

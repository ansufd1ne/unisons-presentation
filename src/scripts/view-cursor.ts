// Bouton « Voir » qui suit le curseur sur les images (écran avec souris uniquement).
// Il apparaît en grossissant à l'entrée, suit la souris de façon amortie (amplitude ±100 px
// autour du centre) et disparaît à la sortie. Le contraste de l'image change au survol (CSS).

const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RANGE = 100;

if (mouse && !reduced) {
  document.querySelectorAll<HTMLElement>('[data-view]').forEach((box) => {
    const view = box.querySelector<HTMLElement>('.view');
    if (!view) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const paint = () => { view.style.setProperty('--vx', `${cx.toFixed(1)}px`); view.style.setProperty('--vy', `${cy.toFixed(1)}px`); };
    const loop = () => {
      raf = 0;
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      paint();
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) raf = requestAnimationFrame(loop);
    };
    const target = (e: MouseEvent) => {
      const r = box.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width * 2 - 1) * RANGE;
      ty = ((e.clientY - r.top) / r.height * 2 - 1) * RANGE;
    };
    box.addEventListener('mouseenter', (e) => { target(e); cx = tx; cy = ty; paint(); box.classList.add('is-over'); });
    box.addEventListener('mousemove', (e) => { target(e); if (!raf) raf = requestAnimationFrame(loop); });
    box.addEventListener('mouseleave', () => box.classList.remove('is-over'));
  });
}

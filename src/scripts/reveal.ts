// Apparition au scroll : fondu + glissement, une seule fois, quand le haut de l'élément
// atteint 95 % de la hauteur de l'écran.
//   data-reveal="left | right | bottom | top | shrink | rise"
//   data-reveal-delay="200"   (millisecondes, optionnel)
// Au premier passage, les éléments déjà visibles s'affichent sans animation (aussi fait par un script en ligne
// à la fin de <main> dans Base.astro, pour ne pas attendre le chargement de celui-ci).
// Le CSS (global.css) ne masque rien tant que <html> n'a pas la classe `reveal-ready`
// (posée dans le <head>, jamais avec « réduire les animations »).

const LINE = 0.95;

const all = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
all.forEach((el) => {
  const d = el.dataset.revealDelay;
  if (d) el.style.setProperty('--reveal-delay', `${parseInt(d, 10) || 0}ms`);
});

function show(el: HTMLElement) {
  el.classList.add('is-revealed');
  // Une fois la transition finie, on retire l'attribut : l'élément retrouve ses styles normaux
  // (transitions de survol, etc.) sans changer d'apparence.
  const clean = (e: TransitionEvent) => {
    if (e.target !== el || e.propertyName !== 'opacity') return;
    el.removeEventListener('transitionend', clean);
    el.removeAttribute('data-reveal');
    el.classList.remove('is-revealed');
    el.style.removeProperty('--reveal-delay');
  };
  el.addEventListener('transitionend', clean);
}

if (document.documentElement.classList.contains('reveal-ready')) {
  let pending = all;
  let queued = false;

  let first = true; // premier passage : éléments déjà à l'écran, affichés sans animation (LCP)
  const check = () => {
    queued = false;
    const limit = window.innerHeight * LINE;
    const initial = first;
    first = false;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top <= limit) { if (initial) el.removeAttribute('data-reveal'); else show(el); return false; }
      return true;
    });
    if (!pending.length) {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  requestAnimationFrame(check); // éléments déjà visibles au chargement (ou page restaurée plus bas)
}

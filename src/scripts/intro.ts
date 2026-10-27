// Ouverture au chargement : les textes marqués data-intro="words" sont découpés en mots,
// chaque mot monte derrière un masque, les uns après les autres (0,2 s au total).
// data-intro="fade" : simple fondu. Rien n'est fait si « réduire les animations » est activé.

const TOTAL = 0.2;

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<HTMLElement>('[data-intro="words"]').forEach((el) => {
    const text = el.textContent ?? '';
    const words = text.split(/(\s+)/); // garde les espaces
    const count = words.filter((w) => w.trim()).length;
    const step = count > 1 ? TOTAL / (count - 1) : 0;
    // texte complet pour les lecteurs d'écran ; la version animée leur est masquée
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = text.trim();
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    let i = 0;
    for (const part of words) {
      if (!part.trim()) { vis.append(document.createTextNode(part)); continue; }
      const mask = document.createElement('span');
      mask.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'w-i';
      inner.style.setProperty('--i', String(i++));
      inner.style.setProperty('--step', `${step.toFixed(4)}s`);
      inner.textContent = part;
      mask.append(inner);
      vis.append(mask);
    }
    el.append(sr, vis);
    el.classList.add('is-split');
  });
}

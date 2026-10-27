// Effet « lettres qui défilent » au survol des liens.
// Chaque lien texte est dédoublé : la copie du dessous remplace le texte lettre par lettre.
// - Le texte d'origine reste lu par les lecteurs d'écran ; la version animée est masquée (aria-hidden).
// - L'effet n'est posé que sur les liens qui tiennent sur UNE ligne (sinon le texte reste normal et peut
//   passer à la ligne). Le calcul est refait au redimensionnement.

const SELECTORS = [
  'header.nav .links a',
  '.footer nav a',
  'a.bracket',
];
const TOTAL_STAGGER = 0.2; // secondes, réparties sur toutes les lettres

const el = (cls: string) => {
  const n = document.createElement('span');
  n.className = cls;
  return n;
};

const plainText = (t: HTMLElement) => t.dataset.rollText ?? t.textContent?.trim() ?? '';

function restore(t: HTMLElement) {
  if (t.dataset.roll === undefined) return;
  t.textContent = plainText(t);
  delete t.dataset.roll;
}

function oneLine(t: HTMLElement) {
  const cs = getComputedStyle(t);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  return t.getBoundingClientRect().height - padding <= lh * 1.5;
}

function build(t: HTMLElement, text: string) {
  const chars = Array.from(text);
  const step = chars.length > 1 ? TOTAL_STAGGER / (chars.length - 1) : 0;

  const sr = el('visually-hidden');
  sr.textContent = text;

  const roll = el('roll');
  roll.setAttribute('aria-hidden', 'true');
  roll.style.setProperty('--n', String(chars.length));
  roll.style.setProperty('--step', `${step.toFixed(4)}s`);

  for (const cls of ['roll__a', 'roll__b']) {
    const layer = el(cls);
    chars.forEach((c, i) => {
      const s = el('roll__c');
      s.style.setProperty('--i', String(i));
      s.textContent = c;
      layer.appendChild(s);
    });
    roll.appendChild(layer);
  }
  t.textContent = '';
  t.append(sr, roll);
  t.dataset.roll = '';
}

function sync(t: HTMLElement) {
  if (t.dataset.roll === undefined && t.children.length) return; // contient autre chose que du texte
  const text = plainText(t);
  if (!text) return;
  t.dataset.rollText = text;
  restore(t); // repart du texte simple pour mesurer
  if (!t.offsetParent) return; // masqué (menu fermé, mobile…) : sera recalculé au redimensionnement
  if (oneLine(t)) build(t, text);
}

const targets = () => [...document.querySelectorAll<HTMLElement>(SELECTORS.join(','))];
targets().forEach(sync);

let timer: number | undefined;
addEventListener('resize', () => {
  clearTimeout(timer);
  timer = window.setTimeout(() => targets().forEach(sync), 150);
});

// Les liens du menu plein écran sont masqués au chargement : on les traite à l'ouverture.
document.getElementById('menu-open')?.addEventListener('click', () => setTimeout(() => targets().forEach(sync), 0));

// Choix du visiteur par catégorie : mesure d'audience (Google Analytics) et contenus externes (carte Google Maps, vidéos YouTube).
// Mémorisé dans le navigateur (localStorage) pendant 6 mois, jamais envoyé à un serveur.
const KEY = 'consent-v2';
const DURATION = 1000 * 60 * 60 * 24 * 183;

export type Category = 'analytics' | 'media';
export type Choices = Record<Category, boolean>;

let memory: Choices | null = null; // repli si le stockage du navigateur est bloqué

export function getChoices(): Choices | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const { a, m, t } = JSON.parse(raw);
      if (typeof a === 'boolean' && typeof m === 'boolean' && Date.now() - t < DURATION) return { analytics: a, media: m };
      localStorage.removeItem(KEY);
    }
  } catch { /* stockage indisponible */ }
  return memory;
}

export function setChoices(c: Choices) {
  memory = c;
  try { localStorage.setItem(KEY, JSON.stringify({ a: c.analytics, m: c.media, t: Date.now() })); } catch { /* stockage indisponible */ }
  document.dispatchEvent(new CustomEvent('consent-change', { detail: c }));
}

export const hasConsent = (cat: Category) => getChoices()?.[cat] === true;

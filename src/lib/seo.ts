// Limites visées pour les balises SEO : titre 65 caractères au plus, description de 110 à 160 caractères.
export const TITLE_MAX = 65;
export const DESC_MIN = 110;
export const DESC_MAX = 160;

/** Premier des titres proposés qui tient dans TITLE_MAX (le dernier, tronqué au mot près, sinon). */
export function fitTitle(...candidates: string[]): string {
  const ok = candidates.find((t) => [...t].length <= TITLE_MAX);
  if (ok) return ok;
  const last = candidates[candidates.length - 1];
  return last.slice(0, TITLE_MAX - 1).replace(/\s+\S*$/, '') + '…';
}

/** Description ramenée à DESC_MAX : coupée à la dernière phrase entière, sinon au dernier mot. */
export function fitDescription(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if ([...t].length <= DESC_MAX) return t;
  const cut = t.slice(0, DESC_MAX);
  const sentence = cut.match(/^(.{80,}[.!?])(?=\s|$)/);
  if (sentence) return sentence[1];
  return cut.slice(0, DESC_MAX - 1).replace(/[\s,;:]+\S*$/, '') + '…';
}

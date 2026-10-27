// Typographie française : espaces insécables dans le HTML construit.
// - U+00A0 avant « : ; ? ! % € » » et après « « » (devant un nombre ou une lettre, jamais à l'intérieur d'une URL ou d'une adresse e-mail)
// - uniquement dans les nœuds de texte visibles : jamais dans les attributs, <script>, <style>, JSON-LD, <code>, <pre>, <textarea>, <title> ni <meta>
// - seules les espaces changent : le texte, une fois les U+00A0 remplacés par des espaces, reste identique.
// Variable UNISONS_NO_TYPO=1 : désactive l'intégration (comparaison avant/après).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NB = ' ';
// espace ordinaire (précédée d'un caractère non blanc, ou en début de nœud de texte) devant une ponctuation double
const AVANT = /(^|[^\s ]) ([:;?!»%€])(?=$|[\s .,;:!?)\]»<]|[^\w])/g;
const APRES = /(«) (?=\S)/g;
// ne rien toucher dans ces éléments (le contenu est lu comme du code ou du texte brut)
const BLOCS = /<(script|style|title|code|pre|textarea|kbd|samp)\b[\s\S]*?<\/\1\s*>/gi;

/** Espaces insécables dans un nœud de texte. */
export function fixText(t) {
  // heures écrites « 20 : 00 » : laissées telles quelles
  const avant = (m, a, p, off, str) => (p === ':' && /\d/.test(a) && /^[\s\u00a0]?\d/.test(str.slice(off + m.length)) ? m : `${a}${NB}${p}`);
  return t.replace(AVANT, avant).replace(AVANT, avant).replace(APRES, `$1${NB}`);
}

/** Applique fixText aux seuls nœuds de texte d'un document HTML. */
export function fixHtml(html) {
  return html.replace(new RegExp(`${BLOCS.source}|<!--[\\s\\S]*?-->|<[^>]*>|[^<]+`, 'gi'), (seg) => (seg.startsWith('<') ? seg : fixText(seg)));
}

export const frTypo = () => ({
  name: 'fr-typo',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (process.env.UNISONS_NO_TYPO) return;
      const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, e.name);
          if (e.isDirectory()) walk(p);
          else if (p.endsWith('.html')) {
            const src = fs.readFileSync(p, 'utf8');
            const out = fixHtml(src);
            if (out !== src) fs.writeFileSync(p, out);
          }
        }
      };
      walk(fileURLToPath(dir));
    },
  },
});

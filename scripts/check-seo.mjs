// Vérifie les titres (<= 65 caractères) et descriptions (110 à 160 caractères) du site construit (dist/).
// Usage : node scripts/check-seo.mjs [dossier]   (code de sortie 1 s'il reste des pages hors limites)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(x?)([0-9a-f]+);/gi, (_, x, n) => String.fromCodePoint(parseInt(n, x ? 16 : 10))).replace(/&#39;|&apos;/g, "'");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === '_astro' ? [] : walk(path.join(d, e.name))) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []);
let pages = 0, bad = 0;
for (const f of walk(root)) {
  const html = fs.readFileSync(f, 'utf8');
  if (/<meta[^>]+http-equiv="refresh"/i.test(html)) continue; // page de repli d'une redirection
  const title = decode(/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '');
  const desc = decode(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '');
  pages++;
  const problems = [];
  if (!title) problems.push('titre absent'); else if ([...title].length > 65) problems.push(`titre ${[...title].length} car.`);
  if (!desc) problems.push('description absente'); else if ([...desc].length < 110 || [...desc].length > 160) problems.push(`description ${[...desc].length} car.`);
  if (problems.length) { bad++; console.log(`${path.relative(root, f)} : ${problems.join(', ')}\n   ${title}\n   ${desc}`); }
}
console.log(`${pages} pages contrôlées, ${bad} hors limites`);
process.exit(bad ? 1 : 0);

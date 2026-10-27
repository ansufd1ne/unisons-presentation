import fs from 'node:fs'; import path from 'node:path';
const D = 'dist'; const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(D); const set = new Set(files.map((f) => '/' + path.relative(D, f)));
const exists = (u) => { u = decodeURIComponent(u.split('#')[0].split('?')[0]); if (!u) return true; const c = [u, u.replace(/\/$/, '') + '/index.html', u + '.html']; return c.some((x) => set.has(x)); };
const bad = []; let n = 0; const redir = JSON.parse(fs.readFileSync('redirects.json', 'utf8'));
for (const f of files.filter((f) => f.endsWith('.html'))) {
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/(?:href|src)="(\/[^"]*)"/g)) { const u = m[1]; if (u.startsWith('//')) continue; n++; if (!exists(u)) bad.push(f.replace('dist', '') + ' → ' + u); }
}
const staleLinks = [];
for (const f of files.filter((f) => f.endsWith('.html') && !/^dist\/(festival\/festival|festival\/informations-pratiques|festival\/programmation-festival|festival\/communique|informations-pratiques\/informations-pratiques-2|programmation-gratuite|sitemap)/.test(f))) {
  const h = fs.readFileSync(f, 'utf8');
  for (const old of Object.keys(redir)) if (h.includes(`href="${old}"`)) staleLinks.push(f + ' → ' + old);
}
console.log('liens internes testés :', n, '| cassés :', bad.length); bad.slice(0, 15).forEach((b) => console.log(' ', b));
console.log('liens vers anciennes URLs :', staleLinks.length); staleLinks.slice(0, 10).forEach((b) => console.log(' ', b));

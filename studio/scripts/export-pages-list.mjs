// Prépare studio/schemaTypes/pages-list.json : la liste des pages du site proposées dans le menu déroulant
// « Page visée » de « Pages d'une rubrique ». Source : builtPaths et labelFor de src/data/site.ts.
// À relancer quand le développeur ajoute une page au site (builtPaths). Usage : npm run export-pages
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(studio, '..');

const stubPlugin = {
  name: 'stubs',
  setup(b) {
    // le module cms (lecture Sanity) est remplacé par un bouchon : aucun appel réseau
    b.onResolve({ filter: /\/lib\/cms$/ }, () => ({ path: 'cms-stub', namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
      contents: `export * from './cms-mapping'; export const loadCms = async () => null; export const warn = () => {}; export const cmsProjectId = '';`,
      loader: 'js', resolveDir: resolve(root, 'src/lib'),
    }));
    // les images Astro ne servent à rien ici
    b.onResolve({ filter: /\.(jpe?g|png|webp|avif|gif|svg)$/i }, (a) => ({ path: resolve(a.resolveDir, a.path), namespace: 'img' }));
    b.onLoad({ filter: /.*/, namespace: 'img' }, (a) => ({ contents: `export default ${JSON.stringify({ src: a.path })};`, loader: 'js' }));
  },
};

const out = await build({
  entryPoints: [resolve(root, 'src/data/site.ts')], bundle: true, write: false, format: 'esm', platform: 'node',
  plugins: [stubPlugin], logLevel: 'silent',
});
const { builtPaths, labelFor } = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));

// libellés ambigus ou absents du fil d'Ariane : on précise le contexte pour que le menu reste lisible
const overrides = {
  '/': 'Accueil',
  '/agenda': 'Agenda (toutes les rubriques)',
  '/agenda/l-art-est-public': 'Agenda (L’art est public)',
  '/agenda/kosmik-club': 'Agenda (Kosmik Club)',
};

const pages = builtPaths.map((path) => ({ path, label: overrides[path] ?? labelFor(path) ?? path }));

// garde-fou : deux pages ne doivent pas avoir le même libellé dans le menu
const seen = new Map();
for (const p of pages) seen.set(p.label, [...(seen.get(p.label) ?? []), p.path]);
for (const [label, paths] of seen) if (paths.length > 1) console.log(`Attention : libellé « ${label} » en double (${paths.join(', ')}). Ajouter une entrée dans « overrides ».`);

writeFileSync(resolve(studio, 'schemaTypes/pages-list.json'), JSON.stringify(pages, null, 2) + '\n');
console.log(`pages-list.json : ${pages.length} pages.`);

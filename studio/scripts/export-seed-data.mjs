// Prépare studio/seed-data.json à partir de src/data/events.ts et src/data/pages.ts.
// Ces fichiers importent des images Astro : un plugin esbuild remplace chaque import d'image par { src: chemin absolu }.
// Usage : npm run export-seed
import { build } from 'esbuild';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(studio, '..');

const imagePlugin = {
  name: 'images',
  setup(b) {
    // le module cms (lecture Sanity) est remplacé par un bouchon : on veut les données locales du site
    b.onResolve({ filter: /\/lib\/cms$/ }, () => ({ path: 'cms-stub', namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
      // tout le mapping réel est repris ; seule la lecture réseau est neutralisée (données locales uniquement)
      contents: `export * from './cms-mapping'; export const loadCms = async () => null; export const warn = () => {}; export const cmsProjectId = '';`,
      loader: 'js', resolveDir: resolve(root, 'src/lib'),
    }));
    b.onResolve({ filter: /\.(jpe?g|png|webp|avif|gif|svg)$/i }, (a) => ({ path: resolve(a.resolveDir, a.path), namespace: 'img' }));
    b.onLoad({ filter: /.*/, namespace: 'img' }, (a) => ({ contents: `export default ${JSON.stringify({ src: a.path })};`, loader: 'js' }));
  },
};

const load = async (file) => {
  const out = await build({
    entryPoints: [resolve(root, file)], bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [imagePlugin], logLevel: 'silent',
  });
  return import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
};

// chemin relatif à la racine du site, vérifié sur disque
const rel = (img) => {
  if (!img) return undefined;
  if (!existsSync(img.src)) throw new Error('Image introuvable : ' + img.src);
  return relative(root, img.src);
};
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const { events } = await load('src/data/events.ts');
const { pages } = await load('src/data/pages.ts');

const evenements = events.map((e) => ({
  slug: e.slug, title: e.title, date: e.date, ...(e.endDate && { endDate: e.endDate }), pole: e.pole,
  venue: e.venue, ...(e.address && { address: e.address }), free: !!e.free,
  summary: e.summary, body: e.body.join('\n\n'),
  practical: (e.practical ?? []).map(([label, value]) => ({ label, value })),
  provisional: e.provisional, alt: e.alt, image: rel(e.image), heroImage: rel(e.hero),
}));

const team = pages['/l-association/equipe'].blocks.find((b) => b.t === 'team');
const membres = team.groups.flatMap((g) => g.people.map((p, i) => ({
  slug: slugify(p.name), name: p.name, role: p.role, groupe: g.title, order: i,
  ...(p.email && { email: p.email }), photo: rel(p.img),
})));

writeFileSync(resolve(studio, 'seed-data.json'), JSON.stringify({ evenements, membres }, null, 2) + '\n');
console.log(`seed-data.json : ${evenements.length} événements, ${membres.length} membres.`);

// ---------------------------------------------------------------------------------------------
// Rubriques gérées par la chargée de communication : expositions, librairie, podcast, téléchargements.
// Produit studio/seed-rubriques-data.json (lu par seed-rubriques.ts). Tolérant : un nom manquant
// dans expos.ts ou pages.ts est signalé, la rubrique concernée est simplement ignorée.
// ---------------------------------------------------------------------------------------------
const missing = []; // fichiers référencés mais introuvables, donc non importés
const notes = [];
const need = (mod, name, file) => {
  if (mod[name] === undefined) { notes.push(`${file} : export « ${name} » introuvable, rubrique ignorée.`); return false; }
  return true;
};
const relSafe = (img, what) => {
  if (!img) return undefined;
  if (!img.src || !existsSync(img.src)) { missing.push(`${what} : ${img?.src ?? 'image sans chemin'}`); return undefined; }
  return relative(root, img.src);
};

let exposMod = {};
try { exposMod = await load('src/data/expos.ts'); } catch (e) { notes.push('src/data/expos.ts illisible : ' + e.message); }
const expositions = [];
if (need(exposMod, 'current', 'expos.ts') && exposMod.current) {
  const c = exposMod.current;
  const imgs = (c.images ?? []).map((i) => ({ image: relSafe(i.src, 'exposition ' + c.title), alt: i.alt })).filter((i) => i.image);
  expositions.push({
    slug: slugify(c.title), title: c.title, artist: c.artist,
    start: c.start, end: c.end, vernissage: c.vernissage,
    about: (c.about ?? []).join('\n\n'), artistText: (c.artistText ?? []).join('\n\n'), author: c.author,
    poster: imgs[0], images: imgs, provisional: false,
    // le texte « à propos » parle de la personne honorée (« Hommage à X »), pas de l'artiste de l'exposition
    ...((c.artistHeading || /^Hommage à (.+)$/.exec(c.title)?.[1]) && { artistHeading: c.artistHeading || /^Hommage à (.+)$/.exec(c.title)[1] }),
  });
}
if (need(exposMod, 'past', 'expos.ts')) {
  const extra = need(exposMod, 'rewindPhotos', 'expos.ts') ? exposMod.rewindPhotos : [];
  for (const p of exposMod.past) {
    const provisional = /^Texte provisoire/i.test(p.text ?? '');
    const poster = p.image ? { image: relSafe(p.image, 'exposition ' + p.title), alt: p.alt } : undefined;
    const photos = p.slug === 'rewind' ? extra.map((i) => ({ image: relSafe(i.src, 'exposition ' + p.title), alt: i.alt })).filter((i) => i.image) : [];
    expositions.push({
      slug: p.slug ?? slugify(p.title), title: p.title, ...(p.year && { year: p.year }),
      ...(!provisional && p.text && { summary: p.text }),
      ...(poster?.image && { poster }), images: photos, provisional,
    });
  }
}

const podcastPage = pages['/l-art-est-public/podcast'];
let podcast;
if (!podcastPage) notes.push('pages.ts : entrée /l-art-est-public/podcast introuvable, podcast ignoré.');
else {
  const tb = podcastPage.blocks?.find((b) => b.t === 'text');
  podcast = { intro: (tb?.paras ?? []).join('\n\n'), provisional: true };
  if (!tb) notes.push('pages.ts : bloc texte du podcast introuvable, introduction vide.');
}
const librairie = { intro: '', provisional: true };
if (!pages['/l-art-est-public/librairie']) notes.push('pages.ts : entrée /l-art-est-public/librairie introuvable (la fiche vide est créée quand même).');

const telechargements = [];
const dlPage = pages['/infos-pratiques/telechargements'];
if (!dlPage) notes.push('pages.ts : entrée /infos-pratiques/telechargements introuvable, téléchargements ignorés.');
else {
  for (const b of dlPage.blocks.filter((x) => x.t === 'downloads')) {
    const category = /rapport/i.test(b.title) ? 'Rapport d’activité' : /logo/i.test(b.title) ? 'Logos' : /presse/i.test(b.title) ? 'Dossiers de presse' : 'Autres documents';
    b.items.forEach((it, i) => {
      const local = it.href.startsWith('/') ? resolve(root, 'public', it.href.slice(1)) : null;
      if (!local) {
        let host = ''; try { host = new URL(it.href).hostname; } catch {}
        if (['drive.google.com', 'docs.google.com'].includes(host)) telechargements.push({ slug: slugify(it.title), title: it.title, ...(it.desc && { description: it.desc.slice(0, 200) }), category, url: it.href, order: i });
        else missing.push(`téléchargement « ${it.title} » : lien externe (${it.href}) non repris`);
        return;
      }
      if (!existsSync(local)) { missing.push(`téléchargement « ${it.title} » : ${relative(root, local)} absent`); return; }
      telechargements.push({
        slug: slugify(it.title), title: it.title, ...(it.desc && { description: it.desc.slice(0, 200) }),
        category, file: relative(root, local), order: i,
      });
    });
  }
}

// Liste « Dans la rubrique » de L'art est public : enfants de l'entrée correspondante de `nav` (src/data/site.ts)
const siteMod = await load('src/data/site.ts');
const artTop = siteMod.nav.find((n) => n.href === '/l-art-est-public');
const rubriques = [];
if (!artTop?.children?.length) notes.push('site.ts : entrée « L’art est public » introuvable dans nav, rubrique ignorée.');
else rubriques.push({ cle: 'l-art-est-public', items: artTop.children.map((c) => ({ label: c.label, page: c.href })) });

writeFileSync(resolve(studio, 'seed-rubriques-data.json'), JSON.stringify({ expositions, librairie, podcast, telechargements, rubriques }, null, 2) + '\n');
console.log(`seed-rubriques-data.json : ${expositions.length} expositions, 1 librairie, ${podcast ? 1 : 0} podcast, ${telechargements.length} téléchargements, ${rubriques.length} rubrique (${rubriques[0]?.items.length ?? 0} liens).`);
console.log(missing.length ? 'Fichiers manquants (non importés) :\n- ' + missing.join('\n- ') : 'Aucun fichier manquant.');
notes.forEach((n) => console.log('Attention : ' + n));

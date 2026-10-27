// Importe galerie, librairie, podcast, téléchargements et la liste « Dans la rubrique : L'art est public » SANS RIEN ÉCRASER : createIfNotExists uniquement.
// Une fiche déjà présente (donc éventuellement modifiée dans le Studio) n'est jamais touchée.
// Préparation : npm run export-seed   Import : npx sanity exec seed-rubriques.ts --with-user-token
import { getCliClient } from 'sanity/cli';
import { readFileSync, createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const client = getCliClient({ apiVersion: '2026-10-01' });
const studioDir = import.meta.dirname;
const root = resolve(studioDir, '..');
const data = JSON.parse(readFileSync(resolve(studioDir, 'seed-rubriques-data.json'), 'utf8'));

const cache = new Map<string, string>();
const upload = async (kind: 'image' | 'file', rel?: string) => {
  if (!rel) return undefined;
  const k = kind + rel;
  if (cache.has(k)) return cache.get(k);
  const file = resolve(root, rel);
  if (!existsSync(file)) throw new Error(`Fichier introuvable : ${file}`);
  const asset = await client.assets.upload(kind as 'image', createReadStream(file), { filename: file.split('/').pop() });
  cache.set(k, asset._id);
  return asset._id;
};
const key = () => Math.random().toString(36).slice(2, 10);
const imgRef = (id: string | undefined, alt?: string) =>
  id ? { _type: 'image', asset: { _type: 'reference', _ref: id }, ...(alt && { alt }) } : undefined;

// on ne téléverse les fichiers que pour les documents absents, pour ne pas créer de fichiers orphelins
const exists = async (id: string) => !!(await client.fetch('defined(*[_id == $id][0]._id)', { id }));
const create = async (doc: { _id: string; _type: string }, build: () => Promise<Record<string, unknown>>) => {
  if (await exists(doc._id)) { console.log(`Déjà présent, ignoré : ${doc._id}`); return; }
  await client.createIfNotExists({ ...doc, ...(await build()) });
  console.log(`Créé : ${doc._id}`);
};

for (const e of data.expositions ?? []) {
  await create({ _id: `exposition-${e.slug}`, _type: 'exposition' }, async () => {
    const poster = e.poster && imgRef(await upload('image', e.poster.image), e.poster.alt);
    const images = [];
    for (const i of e.images ?? []) images.push({ ...imgRef(await upload('image', i.image), i.alt), _key: key() });
    return {
      title: e.title, slug: { _type: 'slug', current: e.slug },
      ...(e.artist && { artist: e.artist }), ...(e.start && { start: e.start }), ...(e.end && { end: e.end }),
      ...(e.vernissage && { vernissage: e.vernissage }), ...(e.year && { year: e.year }),
      ...(e.summary && { summary: e.summary }), ...(e.about && { about: e.about }),
      ...(e.artistText && { artistText: e.artistText }), ...(e.author && { author: e.author }),
      ...(e.artistHeading && { artistHeading: e.artistHeading }),
      ...(poster && { poster }), ...(images.length && { images }),
      provisional: !!e.provisional, hidden: false,
    };
  });
}

if (data.librairie) {
  await create({ _id: 'librairie', _type: 'librairie' }, async () => ({ intro: data.librairie.intro ?? '', provisional: data.librairie.provisional }));
}
if (data.podcast) {
  await create({ _id: 'podcast', _type: 'podcast' }, async () => ({ intro: data.podcast.intro ?? '', provisional: data.podcast.provisional }));
}

for (const t of data.telechargements ?? []) {
  await create({ _id: `telechargement-${t.slug}`, _type: 'telechargement' }, async () => {
    const id = t.file ? await upload('file', t.file) : undefined;
    return {
      title: t.title, ...(t.description && { description: t.description }), category: t.category,
      ...(id ? { file: { _type: 'file', asset: { _type: 'reference', _ref: id } } } : {}), ...(t.url && { url: t.url }),
      ...(t.year && { year: t.year }),
      order: t.order ?? 0, hidden: false,
    };
  });
}
for (const r of data.rubriques ?? []) {
  await create({ _id: `rubrique-${r.cle}`, _type: 'rubrique' }, async () => ({
    cle: r.cle,
    items: r.items.map((i: { label: string; page: string }) => ({ _key: key(), _type: 'lien', label: i.label, page: i.page })),
  }));
}
// champ ajouté après coup : complète les fiches déjà importées sans jamais écraser une valeur saisie dans le Studio
for (const e of data.expositions ?? []) {
  if (e.artistHeading && (await exists(`exposition-${e.slug}`))) {
    await client.patch(`exposition-${e.slug}`).setIfMissing({ artistHeading: e.artistHeading }).commit();
    console.log(`Titre « À propos » complété si absent : exposition-${e.slug}`);
  }
}
console.log('Import terminé (rien n’a été écrasé).');

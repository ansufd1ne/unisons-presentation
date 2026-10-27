// Importe le contenu actuel du site (events.ts, pages.ts via seed-data.json) dans Sanity.
// Préparation : npm run export-seed   Import : npx sanity exec seed.ts --with-user-token
import { getCliClient } from 'sanity/cli';
import { readFileSync, createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const client = getCliClient({ apiVersion: '2026-10-01' });
const studioDir = import.meta.dirname;
const root = resolve(studioDir, '..');
const data = JSON.parse(readFileSync(resolve(studioDir, 'seed-data.json'), 'utf8'));

const cache = new Map<string, string>();
const upload = async (rel?: string) => {
  if (!rel) return undefined;
  if (cache.has(rel)) return cache.get(rel);
  const file = resolve(root, rel);
  if (!existsSync(file)) throw new Error(`Image introuvable : ${file}`);
  const asset = await client.assets.upload('image', createReadStream(file), { filename: file.split('/').pop() });
  cache.set(rel, asset._id);
  return asset._id;
};
const img = (id: string | undefined, alt?: string) =>
  id ? { _type: 'image', asset: { _type: 'reference', _ref: id }, ...(alt && { alt }) } : undefined;
const key = () => Math.random().toString(36).slice(2, 10);

const tx = client.transaction();
for (const e of data.evenements) {
  const image = img(await upload(e.image), e.alt);
  const heroImage = img(await upload(e.heroImage), e.alt);
  tx.createOrReplace({
    _id: `evenement-${e.slug}`, _type: 'evenement',
    title: e.title, slug: { _type: 'slug', current: e.slug }, date: e.date, ...(e.endDate && { endDate: e.endDate }),
    pole: e.pole, venue: e.venue, ...(e.address && { address: e.address }), free: e.free,
    summary: e.summary, body: e.body, provisional: e.provisional, hidden: false,
    practical: e.practical.map((p: any) => ({ _type: 'info', _key: key(), ...p })),
    ...(image && { image }), ...(heroImage && { heroImage }),
  });
}
for (const m of data.membres) {
  const photo = img(await upload(m.photo));
  tx.createOrReplace({
    _id: `membre-${m.slug}`, _type: 'membre', name: m.name, role: m.role, groupe: m.groupe, order: m.order, hidden: false,
    ...(m.email && { email: m.email }), ...(photo && { photo }),
  });
}
await tx.commit();
console.log(`Importé : ${data.evenements.length} événements, ${data.membres.length} membres.`);

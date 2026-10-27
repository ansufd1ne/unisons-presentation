import { createClient } from '@sanity/client';

// Contenu édité dans Sanity (agenda et équipe). Sans SANITY_PROJECT_ID, le site retombe sur les
// fichiers locaux (src/data/events.ts, bloc team de src/data/pages.ts) : le build marche sans compte Sanity.
// Si Sanity est configuré mais injoignable, le build échoue exprès : Vercel garde alors
// la version en ligne au lieu de publier un site à moitié vide.
const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
// Aperçu des brouillons (dev uniquement) : actif seulement si SANITY_PREVIEW_TOKEN est défini.
const previewToken = import.meta.env.DEV ? (import.meta.env.SANITY_PREVIEW_TOKEN as string | undefined) : undefined;
export const cmsEnabled = Boolean(projectId);
/** Identifiant du projet : sert à n'accepter que les fichiers hébergés dans CE projet Sanity */
export const cmsProjectId = projectId ?? '';

const client = projectId
  ? createClient({
      projectId,
      dataset: (import.meta.env.SANITY_DATASET as string | undefined) || 'production',
      apiVersion: '2026-10-01',
      useCdn: false,
      ...(previewToken ? { token: previewToken, perspective: 'drafts' as const } : { perspective: 'published' as const }),
    })
  : null;

const img = `{ "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, alt }`;

export const query = `{
  "events": *[_type == "evenement" && hidden != true] | order(date asc){
    "slug": slug.current, title, date, endDate, pole, venue, address, "free": coalesce(free, false),
    summary, body, "practical": practical[]{ label, value }, "provisional": coalesce(provisional, false),
    "image": image${img}, "heroImage": heroImage${img}
  },
  "team": *[_type == "membre" && hidden != true] | order(order asc, name asc){
    name, role, groupe, order, "email": email, "photo": photo${img}
  },
  "expositions": *[_type == "exposition" && hidden != true]{
    "slug": slug.current, title, artist, start, end, vernissage, year, summary, about, artistText, artistHeading, author,
    "provisional": coalesce(provisional, false), "poster": poster${img}, "images": images[]${img}
  },
  "librairie": *[_id == "librairie"][0]{
    intro, "photo": photo${img}, "practical": practical[]{ label, value },
    "selection": selection[]{ title, author, description, "cover": cover${img} },
    "provisional": coalesce(provisional, true)
  },
  "podcast": *[_id == "podcast"][0]{
    intro, "cover": cover${img}, "listenLinks": listenLinks[]{ label, url }, "provisional": coalesce(provisional, true)
  },
  "episodes": *[_type == "episode" && hidden != true] | order(date desc){
    "slug": slug.current, number, title, date, youtubeUrl, description, guests, guestRole, duration, "image": image${img}
  },
  "downloads": *[_type == "telechargement" && hidden != true] | order(order asc, title asc){
    title, description, category, year, order, url,
    "file": file{ "url": asset->url, "size": asset->size, "extension": asset->extension, "originalFilename": asset->originalFilename }
  },
  "rubriques": *[_type == "rubrique"]{ cle, "items": items[]{ label, page } }
}`;

export interface CmsData {
  events: unknown[]; team: unknown[]; expositions: unknown[]; librairie: unknown; podcast: unknown; episodes: unknown[]; downloads: unknown[]; rubriques: unknown[];
}

let cache: Promise<CmsData | null> | undefined;
/** Documents bruts de Sanity (à passer à mapEvents / mapTeam / mapExpositions / mapLibrairie / mapPodcast / mapEpisodes / mapDownloads), ou null sans SANITY_PROJECT_ID. */
export const loadCms = (): Promise<CmsData | null> => {
  if (!client) return Promise.resolve(null);
  // en dev on relit Sanity à chaque évaluation du module : une publication se voit sans redémarrer
  if (import.meta.env.DEV) cache = undefined;
  cache ??= client.fetch(query).then((r: any) => ({
    events: r?.events ?? [], team: r?.team ?? [], expositions: r?.expositions ?? [], librairie: r?.librairie ?? null,
    podcast: r?.podcast ?? null, episodes: r?.episodes ?? [], downloads: r?.downloads ?? [], rubriques: r?.rubriques ?? [],
  }));
  return cache;
};

/** Avertissement visible dans le journal du build */
export const warn = (m: string) => console.warn(`[cms] ${m}`);

export * from './cms-mapping';

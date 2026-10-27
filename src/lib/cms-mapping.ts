import type { ImageMetadata } from 'astro';
import type { Block } from '../data/blocks';

// Mapping pur (sans Astro, sans réseau) des documents Sanity vers les types du site.
// Tout texte venu de Sanity est traité comme du texte : il est seulement nettoyé (caractères de
// contrôle) et borné en longueur. Les composants l'affichent par interpolation, jamais en HTML.
// Une entrée invalide est ignorée avec un avertissement, elle ne fait jamais échouer le build.

export const POLE_IDS = ['l-art-est-public', 'kosmik-club'] as const;
export type CmsPoleId = (typeof POLE_IDS)[number];

export const TEAM_GROUPS = [
  'Présidence et direction', 'Administration', 'Communication', 'Cohésion sociale',
  'Médiation culturelle et sociale', 'Insertion et formation', 'Actions éducatives', 'Ateliers hip-hop',
] as const;

export const LIMITS = {
  title: 120, venue: 160, address: 240, summary: 400, paragraph: 3000, paragraphs: 30,
  practicalItems: 12, practicalLabel: 80, practicalValue: 400, alt: 200, name: 120, role: 200, email: 120,
  artist: 160, author: 120, year: 20, images: 12, bookDescription: 600, books: 24, linkLabel: 60, links: 8, url: 300,
  guests: 200, duration: 30, description: 300, episodes: 200, downloads: 100,
} as const;

export interface RawImage { src?: string | null; width?: number | null; height?: number | null; alt?: string | null }
export interface MappedEvent {
  slug: string; title: string; date: string; endDate?: string; pole: CmsPoleId;
  venue: string; address?: string; free: boolean; summary: string; body: string[]; practical?: [string, string][];
  provisional: boolean; image: ImageMetadata; hero: ImageMetadata; alt: string; heroAlt: string;
}
export interface MappedPerson { name: string; role: string; img?: ImageMetadata; email?: string }
export interface MappedGroup { title: string; people: MappedPerson[] }
export type Warn = (message: string) => void;

const SLUG = /^[a-z0-9-]{1,80}$/;
const EMAIL = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/;
const SANITY_IMAGE = /^https:\/\/cdn\.sanity\.io\/images\/[\w./%-]+$/;
// caractères de contrôle (sauf \n et \t) et séparateurs Unicode de ligne/paragraphe
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F\u2028\u2029]/g;

/** Texte sur une ligne : espaces réduits, caractères de contrôle retirés, longueur bornée */
export const oneLine = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim().slice(0, max).trim() : '';

/** Texte en paragraphes : séparés par une ligne vide, chacun sur une ligne, bornés */
export const paragraphs = (v: unknown): string[] =>
  typeof v === 'string'
    ? v.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map((p) => oneLine(p, LIMITS.paragraph)).filter(Boolean).slice(0, LIMITS.paragraphs)
    : [];

export const isValidDate = (s: unknown): s is string => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T12:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const isValidEmail = (s: unknown): s is string => typeof s === 'string' && s.length <= LIMITS.email && EMAIL.test(s);

// Images distantes reconnues sans lire `src` : lire `src` d'un import local ferait copier l'original dans dist/
const remote = new WeakSet<object>();

/** Image Sanity -> ImageMetadata ; null si l'URL n'est pas celle du CDN Sanity ou si les dimensions manquent */
export const toImageMetadata = (i: RawImage | null | undefined): ImageMetadata | null => {
  if (!i || typeof i.src !== 'string' || !SANITY_IMAGE.test(i.src)) return null;
  const width = Number(i.width), height = Number(i.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return null;
  const meta: ImageMetadata = { src: i.src, width: Math.round(width), height: Math.round(height), format: 'jpg' };
  remote.add(meta);
  return meta;
};

const asArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);

export function mapEvents(raw: unknown, opts: { pending: string[]; warn?: Warn }): MappedEvent[] {
  const warn = opts.warn ?? (() => {});
  const seen = new Set<string>();
  const out: MappedEvent[] = [];
  for (const r of asArray(raw)) {
    if (!r || typeof r !== 'object') continue;
    const slug = typeof r.slug === 'string' ? r.slug : '';
    const label = `événement « ${oneLine(r.title, 60) || slug || '?'} »`;
    if (r.hidden === true) continue;
    if (!SLUG.test(slug)) { warn(`${label} ignoré : slug invalide (${JSON.stringify(oneLine(slug, 40))})`); continue; }
    if (seen.has(slug)) { warn(`${label} ignoré : slug en double (${slug})`); continue; }
    const title = oneLine(r.title, LIMITS.title);
    if (!title) { warn(`événement ${slug} ignoré : titre manquant`); continue; }
    if (!isValidDate(r.date)) { warn(`${label} ignoré : date invalide`); continue; }
    if (!(POLE_IDS as readonly string[]).includes(r.pole)) { warn(`${label} ignoré : pôle inconnu`); continue; }
    const image = toImageMetadata(r.image);
    if (!image) { warn(`${label} ignoré : image absente ou invalide`); continue; }
    const hero = toImageMetadata(r.heroImage) ?? image;
    const heroSource = toImageMetadata(r.heroImage) ? r.heroImage : r.image;
    let endDate: string | undefined;
    if (r.endDate != null && r.endDate !== '') {
      if (isValidDate(r.endDate) && r.endDate >= r.date) endDate = r.endDate;
      else warn(`${label} : date de fin invalide ou antérieure, ignorée`);
    }
    const provisional = r.provisional === true;
    let body = paragraphs(r.body);
    if (provisional && body.length === 0) body = [...opts.pending];
    const practical = asArray(r.practical)
      .map((p) => [oneLine(p?.label, LIMITS.practicalLabel), oneLine(p?.value, LIMITS.practicalValue)] as [string, string])
      .filter(([k, v]) => k && v)
      .slice(0, LIMITS.practicalItems);
    const address = oneLine(r.address, LIMITS.address);
    seen.add(slug);
    out.push({
      slug, title, date: r.date, ...(endDate ? { endDate } : {}), pole: r.pole,
      venue: oneLine(r.venue, LIMITS.venue) || 'Montpellier', ...(address ? { address } : {}),
      free: r.free === true,
      summary: oneLine(r.summary, LIMITS.summary) || `${title}, rendez-vous de l’agenda d’UNi’SONS.`,
      body, ...(practical.length ? { practical } : {}), provisional,
      image, hero,
      alt: oneLine(r.image?.alt, LIMITS.alt) || title,
      heroAlt: oneLine(heroSource?.alt, LIMITS.alt) || title,
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
}

export function mapTeam(raw: unknown, opts: { warn?: Warn } = {}): MappedGroup[] {
  const warn = opts.warn ?? (() => {});
  const byGroup = new Map<string, { order: number; person: MappedPerson }[]>();
  for (const r of asArray(raw)) {
    if (!r || typeof r !== 'object' || r.hidden === true) continue;
    const name = oneLine(r.name, LIMITS.name);
    if (!name) { warn('membre ignoré : nom manquant'); continue; }
    if (!(TEAM_GROUPS as readonly string[]).includes(r.groupe)) { warn(`membre « ${name} » ignoré : groupe inconnu`); continue; }
    const person: MappedPerson = { name, role: oneLine(r.role, LIMITS.role) };
    const img = toImageMetadata(r.photo);
    if (img) person.img = img;
    if (r.email != null && r.email !== '') {
      if (isValidEmail(r.email)) person.email = r.email;
      else warn(`membre « ${name} » : e-mail invalide, ignoré`);
    }
    const order = Number.isFinite(Number(r.order)) && r.order !== null && r.order !== '' ? Number(r.order) : 9999;
    const list = byGroup.get(r.groupe) ?? [];
    list.push({ order, person });
    byGroup.set(r.groupe, list);
  }
  return TEAM_GROUPS.filter((g) => byGroup.has(g)).map((title) => ({
    title,
    people: byGroup.get(title)!.sort((a, b) => a.order - b.order || a.person.name.localeCompare(b.person.name, 'fr')).map((x) => x.person),
  }));
}

/** JSON pour <script type="application/ld+json"> : `<` échappé pour qu'aucune balise ne puisse fermer le script */
export const safeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

/** Picture reçoit soit l'import local (ImageMetadata), soit l'URL distante avec ses dimensions (repli en jpg, pas en png) */
export const isRemote = (i: ImageMetadata) => remote.has(i);
export const picProps = (i: ImageMetadata) => (isRemote(i) ? { src: i.src, width: i.width, height: i.height, fallbackFormat: 'jpg' as const } : { src: i });
export const absUrl = (base: string, i: ImageMetadata) => (isRemote(i) ? i.src : `${base}${i.src}`);
/** Les images distantes ne sont pas plafonnées par Astro : on retire les largeurs supérieures à l'original */
export const widthsFor = (i: ImageMetadata, list: number[]) => {
  if (!isRemote(i)) return list;
  const w = list.filter((x) => x <= i.width);
  return w.length ? w : [i.width];
};


// ---------------------------------------------------------------------------------------------
// Rubriques de L'art est public et infos pratiques : expositions, librairie, podcast, téléchargements.
// Mêmes règles : texte brut uniquement, entrées invalides ignorées avec avertissement, jamais d'échec du build.
// Seuls liens issus de Sanity : fichiers du projet (téléchargements), plateformes d'écoute en liste blanche et
// vidéo YouTube d'un épisode (jamais l'URL fournie : seul l'identifiant de 11 caractères est conservé).

export const DOWNLOAD_CATEGORIES = ['Rapport d’activité', 'Logos', 'Dossiers de presse', 'Autres documents'] as const;
export const DOWNLOAD_EXTENSIONS = ['pdf', 'zip', 'svg', 'png', 'jpg', 'mp3', 'm4a', 'wav'] as const;
export const LISTEN_HOSTS = [
  'open.spotify.com', 'podcasts.apple.com', 'music.apple.com', 'www.youtube.com', 'youtube.com', 'music.youtube.com',
  'youtu.be', 'www.deezer.com', 'deezer.com', 'soundcloud.com', 'castbox.fm', 'podcastaddict.com',
] as const;
export const PAST_PENDING = 'Exemple de texte : la présentation de l’exposition (artiste, démarche, dates), rédigée par l’équipe, apparaît ici.';

export interface MappedPhoto { src: ImageMetadata; alt: string }
export interface MappedExpo {
  slug: string; title: string; artist: string; start?: string; end?: string; vernissage?: string; year?: string;
  summary: string; about: string[]; artistText: string[]; author: string;
  poster?: MappedPhoto; images: MappedPhoto[]; provisional: boolean;
  /** titre de la section « À propos de l’artiste » ; par défaut le nom d’artiste avant la première virgule */
  artistHeading?: string;
}
export interface PastExpo { slug: string; title: string; year?: string; text: string; image?: ImageMetadata; alt?: string; photos: MappedPhoto[] }
export interface MappedLibrairie {
  provisional: boolean; live: boolean; intro: string[]; photo?: MappedPhoto;
  practical: [string, string][]; selection: { title: string; author?: string; description?: string; cover?: MappedPhoto }[];
}
export interface MappedPodcast { provisional: boolean; intro: string[]; cover?: MappedPhoto; listenLinks: { label: string; href: string }[] }
export interface MappedEpisode {
  slug: string; title: string; number?: number; date: string; paras: string[]; guests?: string; guestRole?: string; duration?: string;
  /** identifiant YouTube validé (11 caractères) ; absent = épisode affiché sans vidéo */
  youtubeId?: string; image?: MappedPhoto;
}
export interface MappedDownload { title: string; desc: string; href: string; meta: string; external?: boolean }
export interface MappedDownloadGroup { category: (typeof DOWNLOAD_CATEGORIES)[number]; items: MappedDownload[] }
export interface CmsOpts { warn?: Warn; projectId?: string }

const photo = (i: RawImage | null | undefined, fallbackAlt: string): MappedPhoto | null => {
  const src = toImageMetadata(i);
  return src ? { src, alt: oneLine(i?.alt, LIMITS.alt) || fallbackAlt } : null;
};
const optionalDate = (v: unknown) => (v == null || v === '' ? null : isValidDate(v) ? v : false);
const frCollator = new Intl.Collator('fr');

/** Fichier hébergé par le projet Sanity du site, avec une extension autorisée ; sinon null */
export const fileUrl = (url: unknown, projectId: string | undefined, exts: readonly string[]): { href: string; ext: string } | null => {
  if (typeof url !== 'string' || !projectId || !/^[a-z0-9]{3,30}$/.test(projectId)) return null;
  const m = new RegExp(`^https://cdn\\.sanity\\.io/files/${projectId}/[A-Za-z0-9_-]{1,64}/[A-Za-z0-9_-]{1,128}\\.([a-z0-9]{2,5})$`).exec(url);
  return m && exts.includes(m[1]) ? { href: url, ext: m[1] } : null;
};

/** Lien d'écoute : https, hôte de la liste blanche, sans identifiants ni port ; renvoie l'URL normalisée ou null */
export const listenUrl = (v: unknown): string | null => {
  if (typeof v !== 'string' || v.length > LIMITS.url || /[\s\u0000-\u001F\u007F]/.test(v)) return null;
  let u: URL;
  try { u = new URL(v); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
  return (LISTEN_HOSTS as readonly string[]).includes(u.hostname) ? u.href : null;
};

export const YOUTUBE_HOSTS = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'] as const;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
/** Identifiant YouTube d'une URL : https, sans identifiants ni port, hôte YouTube ; watch?v=ID, youtu.be/ID, /embed/ID ou /shorts/ID. Sinon null. */
export const youtubeId = (v: unknown): string | null => {
  if (typeof v !== 'string' || v.length > LIMITS.url || /[\s\u0000-\u001F\u007F]/.test(v)) return null;
  let u: URL;
  try { u = new URL(v); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
  if (!(YOUTUBE_HOSTS as readonly string[]).includes(u.hostname)) return null;
  let id: string | null | undefined;
  if (u.hostname === 'youtu.be') id = /^\/([^/]+)\/?$/.exec(u.pathname)?.[1];
  else if (u.pathname === '/watch') id = u.searchParams.get('v');
  else id = /^\/(?:embed|shorts)\/([^/]+)\/?$/.exec(u.pathname)?.[1];
  return id && YOUTUBE_ID.test(id) ? id : null;
};
/** Lecteur : toujours youtube-nocookie, jamais l'URL fournie. Lien de repli : page YouTube de la même vidéo. */
export const youtubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
/** « 32 min » -> « PT32M » (ISO 8601) ; null si le texte n'est pas de la forme « N min » */
export const isoDuration = (d: unknown): string | null => {
  const m = typeof d === 'string' ? /^(\d{1,4})\s*(?:min|mn|minutes?)$/i.exec(d.trim()) : null;
  return m && Number(m[1]) > 0 ? `PT${Number(m[1])}M` : null;
};

/** Documents hébergés chez Google (rapport d'activité) : seul lien externe accepté pour un téléchargement */
export const DOWNLOAD_EXTERNAL_HOSTS = ['drive.google.com', 'docs.google.com'] as const;
export const externalDownloadUrl = (v: unknown): string | null => {
  if (typeof v !== 'string' || v.length > LIMITS.url || /[\s\u0000-\u001F\u007F]/.test(v)) return null;
  let u: URL;
  try { u = new URL(v); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
  return (DOWNLOAD_EXTERNAL_HOSTS as readonly string[]).includes(u.hostname) ? u.href : null;
};

export function mapExpositions(raw: unknown, opts: CmsOpts = {}): MappedExpo[] {
  const warn = opts.warn ?? (() => {});
  const seen = new Set<string>();
  const out: MappedExpo[] = [];
  for (const r of asArray(raw)) {
    if (!r || typeof r !== 'object' || r.hidden === true) continue;
    const slug = typeof r.slug === 'string' ? r.slug : '';
    const label = `exposition « ${oneLine(r.title, 60) || slug || '?'} »`;
    if (!SLUG.test(slug)) { warn(`${label} ignorée : slug invalide (${JSON.stringify(oneLine(slug, 40))})`); continue; }
    if (seen.has(slug)) { warn(`${label} ignorée : slug en double (${slug})`); continue; }
    const title = oneLine(r.title, LIMITS.title);
    if (!title) { warn(`exposition ${slug} ignorée : titre manquant`); continue; }
    const start = optionalDate(r.start), end = optionalDate(r.end);
    if (start === false || end === false) { warn(`${label} ignorée : date de début ou de fin invalide`); continue; }
    if (start && end && end < start) { warn(`${label} ignorée : date de fin antérieure au début`); continue; }
    let vernissage = optionalDate(r.vernissage);
    if (vernissage === false) { warn(`${label} : date de vernissage invalide, ignorée`); vernissage = null; }
    const year = oneLine(r.year, LIMITS.year) || (end ? end.slice(0, 4) : '');
    const poster = r.poster ? photo(r.poster, title) : null;
    if (r.poster && !poster) warn(`${label} : affiche absente ou hors cdn.sanity.io, ignorée`);
    const images: MappedPhoto[] = [];
    for (const im of asArray(r.images).slice(0, LIMITS.images)) {
      const p = photo(im, title);
      if (p) images.push(p); else warn(`${label} : image invalide ignorée`);
    }
    seen.add(slug);
    out.push({
      slug, title, artist: oneLine(r.artist, LIMITS.artist),
      ...(start ? { start } : {}), ...(end ? { end } : {}), ...(vernissage ? { vernissage } : {}), ...(year ? { year } : {}),
      summary: oneLine(r.summary, LIMITS.summary), about: paragraphs(r.about), artistText: paragraphs(r.artistText),
      author: oneLine(r.author, LIMITS.author), ...(poster ? { poster } : {}), images, provisional: r.provisional === true,
      ...(oneLine(r.artistHeading, 90) ? { artistHeading: oneLine(r.artistHeading, 90) } : {}),
    });
  }
  return out;
};

const dayOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Classement à la date du build : en cours = début et fin présents, aujourd'hui compris entre les deux ;
 * à venir = début futur ; passée = fin passée, ou aucune date. Une exposition aux dates incomplètes qui
 * ne rentre dans aucun cas (début passé sans fin, fin future sans début) est écartée avec un avertissement.
 * `featured` = l'exposition en cours, sinon la prochaine à venir, sinon null.
 */
export function classifyExpositions(list: MappedExpo[], now: Date = new Date(), warn: Warn = () => {}) {
  const today = dayOf(now);
  const current: MappedExpo[] = [], upcoming: MappedExpo[] = [], past: MappedExpo[] = [];
  for (const e of list) {
    if (e.start && e.end && e.start <= today && today <= e.end) current.push(e);
    else if (e.start && e.start > today) upcoming.push(e);
    else if (e.end && e.end < today) past.push(e);
    else if (!e.start && !e.end) past.push(e);
    else warn(`exposition « ${e.title} » ignorée : dates incomplètes (début sans fin, ou fin sans début)`);
  }
  const byStart = (a: MappedExpo, b: MappedExpo) => (a.start ?? '').localeCompare(b.start ?? '') || frCollator.compare(a.title, b.title);
  current.sort(byStart); upcoming.sort(byStart);
  past.sort((a, b) => (b.end ?? '').localeCompare(a.end ?? '') || frCollator.compare(a.title, b.title));
  const featured = current[0] ?? upcoming[0] ?? null;
  return { current, upcoming, past, featured, started: current.length > 0 };
}

/** Exposition passée -> entrée des rétrospectives (image = affiche, sinon première photo) */
export const toPastExpo = (e: MappedExpo): PastExpo => {
  const main = e.poster ?? e.images[0];
  return {
    slug: e.slug, title: e.title, ...(e.year ? { year: e.year } : {}), text: e.summary || PAST_PENDING,
    ...(main ? { image: main.src, alt: main.alt } : {}), photos: e.images,
  };
};

export function mapLibrairie(raw: unknown, opts: CmsOpts = {}): MappedLibrairie | null {
  const warn = opts.warn ?? (() => {});
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as any;
  const intro = paragraphs(r.intro);
  const ph = r.photo ? photo(r.photo, 'La librairie de L’art est public') : null;
  if (r.photo && !ph) warn('librairie : photo absente ou hors cdn.sanity.io, ignorée');
  const practical = asArray(r.practical)
    .map((p) => [oneLine(p?.label, LIMITS.practicalLabel), oneLine(p?.value, LIMITS.practicalValue)] as [string, string])
    .filter(([k, v]) => k && v).slice(0, LIMITS.practicalItems);
  const selection: MappedLibrairie['selection'] = [];
  for (const b of asArray(r.selection).slice(0, LIMITS.books)) {
    const title = oneLine(b?.title, LIMITS.title);
    if (!title) { warn('librairie : livre sans titre ignoré'); continue; }
    const author = oneLine(b?.author, LIMITS.author), description = oneLine(b?.description, LIMITS.bookDescription);
    const cover = b?.cover ? photo(b.cover, `Couverture de « ${title} »`) : null;
    selection.push({ title, ...(author ? { author } : {}), ...(description ? { description } : {}), ...(cover ? { cover } : {}) });
  }
  const provisional = r.provisional !== false;
  const empty = !intro.length && !ph && !practical.length && !selection.length;
  return { provisional, live: !provisional && !empty, intro, ...(ph ? { photo: ph } : {}), practical, selection };
}

export function mapPodcast(raw: unknown, opts: CmsOpts = {}): MappedPodcast | null {
  const warn = opts.warn ?? (() => {});
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as any;
  const cover = r.cover ? photo(r.cover, 'Visuel du podcast de L’art est public') : null;
  if (r.cover && !cover) warn('podcast : visuel absent ou hors cdn.sanity.io, ignoré');
  const listenLinks: MappedPodcast['listenLinks'] = [];
  for (const l of asArray(r.listenLinks)) {
    const label = oneLine(l?.label, LIMITS.linkLabel);
    const href = listenUrl(l?.url);
    if (!label || !href) { warn(`podcast : lien d’écoute ignoré (${JSON.stringify(oneLine(l?.label, 40))}) : plateforme non autorisée ou URL invalide`); continue; }
    if (listenLinks.some((x) => x.href === href)) { warn(`podcast : lien d’écoute en double ignoré (${label})`); continue; }
    if (listenLinks.length < LIMITS.links) listenLinks.push({ label, href });
  }
  return { provisional: r.provisional !== false, intro: paragraphs(r.intro), ...(cover ? { cover } : {}), listenLinks };
}

export function mapEpisodes(raw: unknown, opts: CmsOpts = {}): MappedEpisode[] {
  const warn = opts.warn ?? (() => {});
  const seen = new Set<string>();
  const out: MappedEpisode[] = [];
  for (const r of asArray(raw)) {
    if (!r || typeof r !== 'object' || r.hidden === true) continue;
    const slug = typeof r.slug === 'string' ? r.slug : '';
    const label = `épisode « ${oneLine(r.title, 60) || slug || '?'} »`;
    if (!SLUG.test(slug)) { warn(`${label} ignoré : slug invalide (${JSON.stringify(oneLine(slug, 40))})`); continue; }
    if (seen.has(slug)) { warn(`${label} ignoré : slug en double (${slug})`); continue; }
    const title = oneLine(r.title, LIMITS.title);
    if (!title) { warn(`épisode ${slug} ignoré : titre manquant`); continue; }
    if (!isValidDate(r.date)) { warn(`${label} ignoré : date invalide`); continue; }
    // un épisode sans lien YouTube valide reste affiché, sans vidéo
    const id = youtubeId(r.youtubeUrl);
    if (!id) warn(`${label} : lien YouTube ${r.youtubeUrl ? 'invalide ou hors YouTube' : 'absent'}, épisode affiché sans vidéo`);
    let number: number | undefined;
    if (r.number != null && r.number !== '') {
      if (typeof r.number === 'number' && Number.isInteger(r.number) && r.number >= 1 && r.number <= 9999) number = r.number;
      else warn(`${label} : numéro invalide (entier de 1 à 9999 attendu), ignoré`);
    }
    const image = r.image ? photo(r.image, title) : null;
    if (r.image && !image) warn(`${label} : vignette absente ou hors cdn.sanity.io, ignorée`);
    const guests = oneLine(r.guests, LIMITS.guests), guestRole = oneLine(r.guestRole, LIMITS.role), duration = oneLine(r.duration, LIMITS.duration);
    seen.add(slug);
    out.push({
      slug, title, ...(number ? { number } : {}), date: r.date, paras: paragraphs(r.description),
      ...(guests ? { guests } : {}), ...(guestRole ? { guestRole } : {}), ...(duration ? { duration } : {}),
      ...(id ? { youtubeId: id } : {}), ...(image ? { image } : {}),
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || (b.number ?? 0) - (a.number ?? 0) || frCollator.compare(a.title, b.title)).slice(0, LIMITS.episodes);
}

/** « 65 Ko », « 1,2 Mo » */
export const formatSize = (bytes: unknown): string => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 1024) return `${Math.round(n)} o`;
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} Ko`;
  return `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
};

export function mapDownloads(raw: unknown, opts: CmsOpts = {}): MappedDownloadGroup[] {
  const warn = opts.warn ?? (() => {});
  const seen = new Set<string>();
  const byCat = new Map<string, { order: number; item: MappedDownload }[]>();
  let count = 0;
  for (const r of asArray(raw)) {
    if (!r || typeof r !== 'object' || r.hidden === true) continue;
    const title = oneLine(r.title, LIMITS.title);
    const label = `téléchargement « ${title || '?'} »`;
    if (!title) { warn('téléchargement ignoré : titre manquant'); continue; }
    if (!(DOWNLOAD_CATEGORIES as readonly string[]).includes(r.category)) { warn(`${label} ignoré : catégorie inconnue`); continue; }
    const file = fileUrl(r.file?.url, opts.projectId, DOWNLOAD_EXTENSIONS);
    const external = file ? null : externalDownloadUrl(r.url);
    if (!file && !external) { warn(`${label} ignoré : fichier absent, hors du projet Sanity ou d’un format non autorisé, et aucun lien Google Drive valide`); continue; }
    if (file && typeof r.file?.extension === 'string' && r.file.extension.toLowerCase() !== file.ext) { warn(`${label} ignoré : extension incohérente`); continue; }
    const href = file ? file.href : external!;
    if (seen.has(href)) { warn(`${label} ignoré : document en double`); continue; }
    if (count >= LIMITS.downloads) { warn(`${label} ignoré : trop de documents (maximum ${LIMITS.downloads})`); continue; }
    seen.add(href); count++;
    const year = oneLine(r.year, LIMITS.year);
    const meta = (file ? [file.ext.toUpperCase(), formatSize(r.file?.size), year] : ['Google Drive', year]).filter(Boolean).join(', ');
    const order = Number.isFinite(Number(r.order)) && r.order !== null && r.order !== '' ? Number(r.order) : 9999;
    const list = byCat.get(r.category) ?? [];
    list.push({ order, item: { title, desc: oneLine(r.description, LIMITS.description), href, meta, ...(external ? { external: true } : {}) } });
    byCat.set(r.category, list);
  }
  return DOWNLOAD_CATEGORIES.filter((c) => byCat.has(c)).map((category) => ({
    category,
    items: byCat.get(category)!.sort((a, b) => a.order - b.order || frCollator.compare(a.item.title, b.item.title)).map((x) => x.item),
  }));
}

// ---- Blocs de page (affichés en texte brut : `plain`, jamais de set:html pour ce qui vient de Sanity)

const GROUP_HEADINGS: Record<(typeof DOWNLOAD_CATEGORIES)[number], [string, string]> = {
  'Rapport d’activité': ['Association', 'Rapport d’activité'],
  Logos: ['Presse et partenaires', 'Logos UNi’SONS'],
  'Dossiers de presse': ['Presse et partenaires', 'Dossiers de presse'],
  'Autres documents': ['Documents', 'Autres documents'],
};
export const downloadBlocks = (groups: MappedDownloadGroup[]): Block[] =>
  groups.map((g) => ({ t: 'downloads', label: GROUP_HEADINGS[g.category][0], title: GROUP_HEADINGS[g.category][1], items: g.items }));

export const librairieBlocks = (l: MappedLibrairie): Block[] => {
  const blocks: Block[] = [];
  if (l.intro.length) blocks.push({ t: 'text', label: 'La librairie', title: 'La librairie', paras: l.intro, plain: true });
  if (l.photo) blocks.push({ t: 'image', img: l.photo.src, alt: l.photo.alt });
  if (l.practical.length) blocks.push({ t: 'facts', label: 'Infos pratiques', title: 'Comment venir ?', items: l.practical, plain: true });
  if (l.selection.length) blocks.push({ t: 'shelf', label: 'Sélection', title: 'À lire en ce moment', items: l.selection.map((b) => ({ title: b.title, author: b.author, text: b.description, img: b.cover?.src, alt: b.cover?.alt })) });
  return blocks;
};

export const fullDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
/** Résumé borné (~160 caractères), coupé à un mot */
export const shorten = (t: string, max = 160): string => {
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 1)).replace(/[\s,;:.!?-]+$/, '') + '…';
};
export const PODCAST_MARQUEE = ['Podcast', 'Rencontres', 'Musique', 'L’art est public'];
export const PODCAST_PATH = '/l-art-est-public/podcast';
export const OTHER_EPISODES_MAX = 6;
/** « #12 Titre » (ou « Titre » sans numéro) */
export const episodeTitle = (e: Pick<MappedEpisode, 'title' | 'number'>) => (e.number ? `#${e.number} ${e.title}` : e.title);
export const episodePath = (slug: string) => `${PODCAST_PATH}/${slug}`;
/** Description de l'épisode (méta) : 160 caractères au plus, avec un texte de repli */
export const episodeDescription = (e: Pick<MappedEpisode, 'paras' | 'title'>) =>
  shorten(e.paras.join(' ')) || `Épisode du podcast de L’art est public : ${e.title}.`;
/** Autres épisodes (déjà triés du plus récent au plus ancien), l'épisode courant exclu */
export const otherEpisodes = (eps: MappedEpisode[], slug: string, max = OTHER_EPISODES_MAX) => eps.filter((x) => x.slug !== slug).slice(0, max);
/** Page podcast : introduction, épisodes (image de l'épisode, sinon visuel du podcast), bandeau, liens d'écoute */
export const podcastBlocks = (p: MappedPodcast, episodes: MappedEpisode[]): Block[] => {
  const blocks: Block[] = [];
  if (p.intro.length) blocks.push({ t: 'text', label: 'Le podcast', paras: p.intro, plain: true });
  blocks.push({
    t: 'episodes', label: 'Épisodes', title: 'Les épisodes',
    items: episodes.map((e) => {
      const im = e.image ?? p.cover;
      return {
        id: `ep-${e.slug}`, title: episodeTitle(e), meta: [fullDate(e.date), e.duration, e.guests && `Avec ${e.guests}`].filter(Boolean).join(' · '),
        short: shorten(e.paras.join(' ')), href: episodePath(e.slug), img: im?.src, alt: im ? (e.image ? im.alt : '') : undefined,
      };
    }),
  });
  blocks.push({ t: 'marquee', words: PODCAST_MARQUEE });
  if (p.listenLinks.length) blocks.push({ t: 'listen', label: 'Écouter', title: 'Où nous écouter', items: p.listenLinks });
  return blocks;
};

export const RUBRIQUE_KEYS = ['l-art-est-public', 'kosmik-hip-hop', 'education-artistique', 'l-association', 'infos-pratiques'] as const;
export const RUBRIQUE_MAX_ITEMS = 12;
export interface MappedRubriqueItem { label: string; href: string }

/** Rubriques du menu éditées dans Sanity -> { cle: [{ label, href }] }.
 *  `page` n'est accepté que s'il est EXACTEMENT un des chemins de `builtPaths` (jamais '/', jamais la page de la rubrique elle-même) :
 *  aucun lien externe ni URL libre. `label` est un texte brut d'une ligne (60 caractères au plus, affiché sans HTML).
 *  Doublon de page : le second est ignoré ; 12 entrées au plus. Une rubrique dont la liste validée est vide est absente du résultat
 *  (le code garde alors ses enfants) ; une clé inconnue ou en double est ignorée. */
export const mapRubriques = (
  raw: unknown, opts: { warn: Warn; builtPaths: readonly string[]; keys?: readonly string[] },
): Record<string, MappedRubriqueItem[]> => {
  const { warn, builtPaths } = opts;
  const keys = opts.keys ?? RUBRIQUE_KEYS;
  const out: Record<string, MappedRubriqueItem[]> = {};
  const seen = new Set<string>();
  for (const r of Array.isArray(raw) ? raw : []) {
    const cle = r && typeof (r as any).cle === 'string' ? (r as any).cle : '';
    if (!keys.includes(cle)) { warn(`rubrique ignorée : clé inconnue (${oneLine(cle, 60) || 'vide'})`); continue; }
    if (seen.has(cle)) { warn(`rubrique « ${cle} » en double : la première est conservée`); continue; }
    seen.add(cle);
    const items: MappedRubriqueItem[] = [];
    const pages = new Set<string>();
    const rawItems = Array.isArray((r as any).items) ? (r as any).items : [];
    for (const it of rawItems) {
      if (items.length >= RUBRIQUE_MAX_ITEMS) { warn(`rubrique « ${cle} » : plus de ${RUBRIQUE_MAX_ITEMS} pages, les suivantes sont ignorées`); break; }
      const page = it && typeof it.page === 'string' ? it.page : '';
      if (page === '/' || page === '/' + cle || !builtPaths.includes(page)) { warn(`rubrique « ${cle} » : page refusée (${oneLine(page, 80) || 'vide'}), elle doit être une page du site hors accueil et hors la rubrique elle-même`); continue; }
      if (pages.has(page)) { warn(`rubrique « ${cle} » : page en double (${page}), la seconde est ignorée`); continue; }
      const full = typeof it.label === 'string' ? oneLine(it.label, 10_000) : '';
      const label = oneLine(it.label, LIMITS.linkLabel);
      if (!label) { warn(`rubrique « ${cle} » : libellé vide pour ${page}, entrée ignorée`); continue; }
      if (full.length > label.length) warn(`rubrique « ${cle} » : libellé de ${page} raccourci à ${LIMITS.linkLabel} caractères`);
      pages.add(page);
      items.push({ label, href: page });
    }
    if (!items.length) { warn(`rubrique « ${cle} » : aucune page valide, la liste du code est conservée`); continue; }
    out[cle] = items;
  }
  return out;
};

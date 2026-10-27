import type { ImageMetadata } from 'astro';
import darwich1 from '../assets/photos/expo-darwich-1.jpg';
import darwich2 from '../assets/photos/expo-darwich-2.jpg';
import darwich3 from '../assets/photos/expo-darwich-3.jpg';
import demaone from '../assets/photos/expo-demaone.jpg';
import rewindPoster from '../assets/photos/expo-rewind.jpg';
import oum from '../assets/photos/expo-oum.jpg';
import yoriyas from '../assets/photos/expo-yoriyas.jpg';
import emir from '../assets/photos/expo-emir.jpg';
import ypb from '../assets/photos/expo-ypb.jpg';
import rewind1 from '../assets/photos/rewind-1.jpg';
import rewind2 from '../assets/photos/rewind-2.jpg';
import rewind3 from '../assets/photos/rewind-3.jpg';
import { loadCms, mapExpositions, classifyExpositions, toPastExpo, warn, cmsProjectId, type MappedExpo, type PastExpo } from '../lib/cms';

// Exposition en cours ou à venir (texte repris du site actuel)
export const current = {
  title: 'Hommage à Mahmoud Darwich',
  artist: 'Ernest Pignon-Ernest, artiste plasticien',
  start: '2026-12-03', end: '2027-05-03', vernissage: '2026-12-03',
  images: [
    { src: darwich1, alt: 'Collage d’Ernest Pignon-Ernest représentant Mahmoud Darwich sur un mur détruit, en Palestine' },
    { src: darwich2, alt: 'Le portrait de Mahmoud Darwich collé sur un mur d’un marché, au milieu des passants' },
    { src: darwich3, alt: 'Le portrait de Mahmoud Darwich sur un mur de rue, des enfants au premier plan' },
  ] as { src: ImageMetadata; alt: string }[],
  about: [
    'L’artiste cherche à bousculer les mentalités et à ouvrir les regards sur les réalités du monde en collant, dans les rues des villes et des villages à travers le monde, des sérigraphies grandeur nature issues de ses dessins.',
    'En écho à son parcours De Ramallah à Gaza, il confie : « J’ai conçu un parcours autour de Mahmoud Darwich, avec une image accompagnée de ses textes calligraphiés, apposés dans des lieux symboliques. Tous les Palestiniens, quel que soit leur âge, connaissent sa poésie et s’y reconnaissent. (...) Jamais mes images n’ont, comme là-bas, exprimé avec autant de force la présence et l’absence. »',
    'Les photographies de ces collages, progressivement altérées par le temps, constituent de véritables « mémoires de l’éphémère », témoignant à la fois de la fragilité de l’œuvre et de la permanence de son message.',
  ],
  artistText: [
    'Il est des moments de l’Histoire, moments le plus souvent cruels, troublés, qui semblent sans issue, où un artiste rencontre et traduit tout un peuple, où sa parole invente les mots-tocsins qui ne cesseront de résonner, d’inspirer, de mobiliser, de tenir en alerte. Pour la Palestine, Mahmoud Darwich fut et demeure celui-là. Dès ses premiers écrits, l’auteur de La terre nous est étroite se trouva en quelque sorte marqué par le destin, avec ce que cela comporte d’élans, de ferveurs, de contraintes, et d’entraves aussi.',
    'Ernest Pignon-Ernest connaissait Mahmoud Darwich et entretenait avec lui des liens d’amitié. Il l’avait déjà portraituré avant de le recevoir dans son atelier d’Ivry en octobre 2007. La mort du poète en août 2008 changea brutalement le sens de la visite, mais Ernest Pignon-Ernest n’ajourna pas son voyage en Palestine. Très vite, il prit la décision de défier l’absence en usant comme toujours de la seule arme en son pouvoir : le dessin.',
    'Imposer la présence de Darwich en des lieux symboliques, c’était non seulement relayer ses combats et son message, c’était également exorciser l’exil qui avait si longtemps envahi sa vie. Cet homme debout, calme, déterminé, surgissant de l’autre côté du destin, affirmait simplement son droit à être là.',
  ],
  author: 'André Velter',
};

// Expositions passées : seuls les titres, REWIND (2024) et quelques visuels sont connus pour l'instant
export interface Past { slug: string; title: string; year?: string; text: string; image?: ImageMetadata; alt?: string; }
const tbd = 'Texte provisoire : la présentation de cette exposition sera ajoutée dès réception des informations.';
export const past: Past[] = [
  { slug: 'demaone', title: 'DEMAONE', text: tbd, image: demaone, alt: 'Un artiste peint de la calligraphie arabe sur un mur turquoise, affiche de l’exposition DEMAONE' },
  { slug: 'rewind', title: 'REWIND', year: '2024', text: 'Exposition REWIND d’Alain Garnier, présentée à la galerie de L’art est public en 2024.', image: rewindPoster, alt: 'Trois jeunes posent devant l’objectif en noir et blanc, affiche de l’exposition REWIND' },
  { slug: 'yoriyas', title: 'YORIYAS', text: tbd, image: yoriyas, alt: 'Un cheval blanc sellé devant un parasol rose et jaune sur une plage, visuel de l’exposition YORIYAS' },
  { slug: 'emir-abd-el-kader', title: 'Emir Abd el Kader', text: tbd, image: emir, alt: 'Portrait peint de l’émir Abd el Kader, visuel de l’exposition' },
  { slug: 'ya-pas-bons-cliches', title: 'Ya pas bons clichés', text: tbd, image: ypb, alt: 'Affiche de l’exposition Ya pas bons clichés : un fez rouge sur fond jaune' },
  { slug: 'oum-kalthoum', title: 'Oum Kalthoum', text: 'Une exposition consacrée à la chanteuse Oum Kalthoum, présentée à la galerie de L’art est public.', image: oum, alt: 'Des visiteuses regardent des documents d’archives accrochés au mur de l’exposition Oum Kalthoum' },
];
export const rewindPhotos = [
  { src: rewind1, alt: 'Deux visiteurs devant les panneaux photographiques de l’exposition REWIND' },
  { src: rewind2, alt: 'Un visiteur lit un panneau de l’exposition REWIND à la galerie de L’art est public' },
  { src: rewind3, alt: 'Salle de l’exposition REWIND : un grand totem de photographies en noir et blanc' },
];

// ---- Ce que lisent les pages Galerie et Rétrospectives (les exports ci-dessus restent le contenu local, inchangé).
// Une seule lecture de Sanity par build. Sans SANITY_PROJECT_ID, ou si Sanity ne contient aucune exposition :
// le contenu local ci-dessus, présenté exactement comme avant.
const localCurrent: MappedExpo = {
  slug: 'hommage-mahmoud-darwich', title: current.title, artist: current.artist,
  start: current.start, end: current.end, vernissage: current.vernissage,
  summary: 'Du 3 décembre 2026 au 3 mai 2027, la galerie de L’art est public accueille l’exposition d’Ernest Pignon-Ernest en hommage à Mahmoud Darwich. Entrée libre.',
  about: current.about, artistText: current.artistText, author: current.author, images: current.images, provisional: false,
  artistHeading: 'Mahmoud Darwich',
};
const localPast: PastExpo[] = past.map((x) => ({ slug: x.slug, title: x.title, ...(x.year ? { year: x.year } : {}), text: x.text, image: x.image, alt: x.alt, photos: x.slug === 'rewind' ? rewindPhotos : [] }));

const cms = await loadCms();
const useCms = Boolean(cms && cms.expositions.length > 0);
if (cms && !useCms) warn('aucune exposition dans Sanity : expositions locales conservées');
const sorted = useCms
  ? classifyExpositions(mapExpositions(cms!.expositions, { warn, projectId: cmsProjectId }), new Date(), warn)
  : classifyExpositions([localCurrent], new Date(), warn);

/** Exposition mise en avant sur /l-art-est-public/galerie : en cours, sinon la prochaine à venir, sinon null */
export const galleryFeatured: MappedExpo | null = sorted.featured;
/** true si elle est en cours, false si elle est à venir */
export const galleryStarted: boolean = sorted.started;
/** Expositions passées (rétrospectives) : triées par fin décroissante puis titre avec Sanity, ordre local sinon */
export const pastExpos: PastExpo[] = useCms ? sorted.past.map(toPastExpo) : localPast;

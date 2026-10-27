import type { ImageMetadata } from 'astro';
import halim from '../assets/photos/evt-halim.jpg';
import mehdi from '../assets/photos/evt-mehdi.jpg';
import ekloz from '../assets/photos/evt-ekloz.jpg';
import darwich from '../assets/photos/evt-darwich.jpg';
import scene from '../assets/photos/scene.jpg';
import heroHalim from '../assets/photos/hero-halim.jpg';
import heroMehdi from '../assets/photos/hero-mehdi.jpg';
import heroEkloz from '../assets/photos/hero-ekloz.jpg';
import heroDarwich from '../assets/photos/expo-darwich-1.jpg';
import { loadCms, mapEvents, warn } from '../lib/cms';

// Agenda de l'association. Un événement = une fiche /agenda/<slug>, un fichier .ics et un balisage Event.
// Source des dates : agenda du site actuel (octobre 2026). Les fiches `provisional` n'ont pas encore de présentation.
export type PoleId = 'l-art-est-public' | 'kosmik-club';
export const agendaPoles: Record<PoleId, { label: string; href: string; intro: string }> = {
  'l-art-est-public': { label: 'L’art est public', href: '/agenda/l-art-est-public', intro: 'Concerts, rencontres et expositions à L’art est public, le lieu d’UNi’SONS à Montpellier.' },
  'kosmik-club': { label: 'Kosmik Club', href: '/agenda/kosmik-club', intro: 'Les soirées hip-hop du Kosmik Club, organisées par UNi’SONS à Montpellier.' },
};

export interface Evt {
  slug: string; title: string; date: string; endDate?: string; pole: PoleId;
  venue: string; address?: string; free?: boolean;
  summary: string; body: string[]; practical?: [string, string][];
  provisional: boolean;
  image: ImageMetadata; hero: ImageMetadata; alt: string; heroAlt?: string;
}
const addressArt = '475 avenue du Comté de Nice, 34080 Montpellier';
const pending = ['Texte provisoire. La présentation de l’artiste, le lieu exact et l’horaire seront ajoutés à cette fiche dès réception des informations.'];

const localEvents: Evt[] = [
  { slug: 'halim-mahmoudi', title: 'Halim Mahmoudi', date: '2026-11-05', pole: 'l-art-est-public', venue: 'Montpellier',
    summary: 'Halim Mahmoudi, rendez-vous de l’agenda d’UNi’SONS le jeudi 5 novembre 2026, à Montpellier.', body: pending, provisional: true,
    image: halim, hero: heroHalim, alt: 'Ambiance d’un concert UNi’SONS : le public lève les téléphones devant la scène' },
  { slug: 'mehdi-badrou', title: 'Mehdi & Badrou', date: '2026-11-10', pole: 'l-art-est-public', venue: 'Montpellier',
    summary: 'Mehdi & Badrou, rendez-vous de l’agenda d’UNi’SONS le mardi 10 novembre 2026, à Montpellier.', body: pending, provisional: true,
    image: mehdi, hero: heroMehdi, alt: 'Un artiste sur la scène d’une salle UNi’SONS' },
  { slug: 'guerta-ekloz', title: 'Guerta + Ekloz', date: '2026-11-26', pole: 'l-art-est-public', venue: 'Montpellier',
    summary: 'Guerta + Ekloz, rendez-vous de l’agenda d’UNi’SONS le jeudi 26 novembre 2026, à Montpellier.', body: pending, provisional: true,
    image: ekloz, hero: heroEkloz, alt: 'Ekloz au micro, en maillot rose et marron' },
  { slug: 'hommage-mahmoud-darwich', title: 'Hommage à Mahmoud Darwich', date: '2026-12-03', endDate: '2027-05-03', pole: 'l-art-est-public',
    venue: 'La galerie, L’art est public', address: addressArt, free: true,
    summary: 'Vernissage de l’exposition d’Ernest Pignon-Ernest, à la galerie de L’art est public, du 3 décembre 2026 au 3 mai 2027.',
    body: [
      'L’artiste cherche à bousculer les mentalités et à ouvrir les regards sur les réalités du monde en collant, dans les rues des villes et des villages à travers le monde, des sérigraphies grandeur nature issues de ses dessins.',
      'Les photographies de ces collages, progressivement altérés par le temps, constituent de véritables « mémoires de l’éphémère », témoignant à la fois de la fragilité de l’œuvre et de la permanence de son message.',
    ],
    practical: [['Exposition', 'Du 3 décembre 2026 au 3 mai 2027'], ['Horaires', 'Du lundi au vendredi, de 14h30 à 18h00. Le premier samedi du mois sous réservation'], ['Entrée', 'Libre']],
    provisional: false, image: darwich, hero: heroDarwich, alt: 'Collage d’Ernest Pignon-Ernest représentant Mahmoud Darwich sur un mur en Palestine' },
];

// Une seule lecture de Sanity par build (top-level await). Sans SANITY_PROJECT_ID : les événements ci-dessus.
const cms = await loadCms();
const demoK: Evt[] = [
  { slug: 'kosmik-club-exemple-1', title: 'Kosmik Club : soirée d’exemple', date: '2026-11-14', pole: 'kosmik-club', venue: 'L’art est public', address: addressArt, free: true,
    summary: 'Exemple de fiche : une soirée hip-hop avec les jeunes artistes accompagnés par UNi’SONS.',
    body: ['Exemple de texte : la présentation de la soirée, des artistes et du déroulé sera rédigée par l’équipe depuis le Studio.'],
    practical: [['Date', 'Samedi 14 novembre 2026'], ['Horaire', '20h00'], ['Entrée', 'Libre']], provisional: false, image: scene, hero: scene, alt: 'Scène violette d’une soirée Kosmik Club' },
  { slug: 'kosmik-club-exemple-2', title: 'Kosmik Club : plateau freestyle (exemple)', date: '2026-12-12', pole: 'kosmik-club', venue: 'L’art est public', address: addressArt, free: false,
    summary: 'Exemple de fiche : un plateau freestyle ouvert aux artistes des ateliers.',
    body: ['Exemple de texte : la présentation du plateau sera rédigée par l’équipe depuis le Studio.'],
    practical: [['Date', 'Samedi 12 décembre 2026'], ['Horaire', '20h30'], ['Tarif', '5 €']], provisional: false, image: scene, hero: scene, alt: 'Scène violette d’une soirée Kosmik Club' },
];
const fillDemo = (e: Evt): Evt => e.provisional ? { ...e, provisional: false, body: ['Exemple de texte : la présentation de l’artiste, du lieu et du déroulé de la soirée, rédigée par l’équipe depuis le Studio.'], practical: [['Date', new Date(e.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })], ['Lieu', 'L’art est public'], ['Horaire', '20h00']] } : e;
export const events: Evt[] = [...(cms ? mapEvents(cms.events, { pending, warn }) : localEvents), ...demoK].map(fillDemo);

export const bySlug = (slug: string) => events.find((e) => e.slug === slug);
const noon = (iso: string) => new Date(iso + 'T12:00:00');
/** Événements à venir ou en cours à la date du build */
export const upcoming = (now = new Date()) =>
  events.filter((e) => noon(e.endDate ?? e.date).getTime() + 12 * 3600e3 >= now.getTime()).sort((a, b) => a.date.localeCompare(b.date));
export const longDate = (iso: string) => noon(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const shortDay = (iso: string) => noon(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
export const badge = (iso: string) => iso.slice(8, 10) + '.' + iso.slice(5, 7);
export const monthKey = (iso: string) => iso.slice(0, 7);
export const monthLabel = (key: string) => {
  const s = noon(key + '-15').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
/** Période lisible : « jeudi 5 novembre 2026 » ou « du 3 décembre 2026 au 3 mai 2027 » */
export const period = (e: Evt) => (e.endDate ? `Du ${shortDay(e.date)} au ${shortDay(e.endDate)}` : longDate(e.date));

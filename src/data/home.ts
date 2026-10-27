import type { ImageMetadata } from 'astro';
import poleKosmik from '../assets/photos/pole-kosmik.jpg';
import poleArt from '../assets/photos/pole-art.jpg';
import poleEdu from '../assets/photos/pole-edu.jpg';
import poleArabesques from '../assets/photos/pole-arabesques.jpg';
import wkExpo from '../assets/photos/wk-expo.jpg';
import wkElias from '../assets/photos/wk-elias.jpg';
import wkHiphop from '../assets/photos/wk-hiphop.jpg';
import wkNum from '../assets/photos/wk-num.jpg';
import { site } from './site';

// Mots du bandeau défilant
export const marquee = ['Hip-hop', 'Arabesques', 'Éducation', 'Expositions', 'Accompagnement'];

export { events, upcoming, longDate, badge } from './events';

// Rendez-vous réguliers
export const weekly = [
  { title: 'Exposition', text: 'Du lundi au samedi.', href: '/l-art-est-public/galerie', img: wkExpo, alt: 'Visiteurs dans l’exposition REWIND à L’art est public' },
  { title: 'Espace Elias Belassal', text: 'Du lundi au vendredi.', href: '/agenda', img: wkElias, alt: 'Des habitantes en visite avec la médiatrice' },
  { title: 'Session hip-hop', text: 'Tous les mercredis.', href: '/agenda/kosmik-club', img: wkHiphop, alt: 'Un artiste hip-hop sur scène, écran rouge en fond' },
  { title: 'Atelier numérique', text: 'Tous les jeudis.', href: '/agenda', img: wkNum, alt: 'Table de mixage et écrans du studio d’UNi’SONS' },
];

// Les pôles d'UNi'SONS
export const poles = [
  { id: 'kosmik', name: 'Kosmik Hip-Hop', text: 'Ateliers, Kosmik Club et accompagnement artistique.', href: '/kosmik-hip-hop', img: poleKosmik, alt: 'Scène violette d’une soirée Hip-hop du monde' },
  { id: 'art', name: 'L’art est public', text: 'Le lieu, la galerie, la librairie et le podcast.', href: '/l-art-est-public', img: poleArt, alt: 'Un rappeur au micro devant la bannière UNi’SONS L’art est public' },
  { id: 'edu', name: 'Éducation artistique', text: 'Renc’Art, Jeunesses en Arabesque et Coulisses Solidaires.', href: '/education-artistique', img: poleEdu, alt: 'Une chorale de jeunes en tee-shirts blancs sur la scène d’un théâtre' },
  { id: 'arabesques', name: 'Arabesques', text: 'Les cultures du monde arabe à Montpellier, chaque année en septembre.', href: site.festival + '/', external: true, img: poleArabesques, alt: 'Le public sous l’arche du festival Arabesques' },
];

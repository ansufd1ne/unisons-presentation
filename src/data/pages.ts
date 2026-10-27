import type { ImageMetadata } from 'astro';
import galerieDemo from '../assets/photos/galerie-lieu.jpg';
import videosDemo from './videos.json';
import type { PageDef } from './blocks';
import { loadCms, mapTeam, mapLibrairie, mapPodcast, mapEpisodes, mapDownloads, librairieBlocks, podcastBlocks, downloadBlocks, cmsProjectId, warn } from '../lib/cms';
import atelierHero from '../assets/photos/atelier-hero.jpg';
import studio1 from '../assets/photos/studio-1.jpg';
import studio2 from '../assets/photos/studio-2.jpg';
import studio3 from '../assets/photos/studio-3.jpg';
import consoleImg from '../assets/photos/console.jpg';
import scene from '../assets/photos/scene.jpg';
import galerieLieu from '../assets/photos/galerie-lieu.jpg';
import lanceur from '../assets/photos/lanceur.jpg';
import alchimix from '../assets/photos/alchimix.jpg';
import nooba from '../assets/photos/nooba.jpg';
import rencart from '../assets/photos/rencart.jpg';
import rencart2 from '../assets/photos/rencart-2.jpg';
import jeaProcession from '../assets/photos/jea-procession.jpg';
import jeaCollege from '../assets/photos/jea-college.jpg';
import jeaDecors from '../assets/photos/jea-decors.jpg';
import coulisses from '../assets/photos/coulisses.jpg';
import accmus from '../assets/photos/accmus.jpg';
import opera from '../assets/photos/opera.jpg';
import histoire1 from '../assets/photos/histoire-1.jpg';
import histoire2 from '../assets/photos/histoire-2.jpg';
import ueCofinance from '../assets/photos/ue-cofinance.png';
import popoSound from '../assets/photos/pole-kosmik.jpg';
import poleArt from '../assets/photos/pole-art.jpg';
import wkExpo from '../assets/photos/wk-expo.jpg';
import teamFadelha from '../assets/photos/team-fadelha.jpg';
import teamHabib from '../assets/photos/team-habib.jpg';
import teamFlorian from '../assets/photos/team-florian.jpg';
import teamAmandine from '../assets/photos/team-amandine.jpg';
import teamTitouan from '../assets/photos/team-titouan.jpg';
import teamAbdou from '../assets/photos/team-abdou.jpg';
import chorale from '../assets/photos/chorale.jpg';
import wkHiphop from '../assets/photos/wk-hiphop.jpg';
import rewind1 from '../assets/photos/rewind-1.jpg';
import teamMosaic from '../assets/photos/team-mosaic.jpg';
import cardLogos from '../assets/photos/card-logos.jpg';
import teamEstelle from '../assets/photos/team-estelle.jpg';
import teamNasser from '../assets/photos/team-nasser.jpg';
import teamMalika from '../assets/photos/team-malika.jpg';
import teamDelhia from '../assets/photos/team-delhia.jpg';
import teamEloise from '../assets/photos/team-eloise.jpg';
import teamChloe from '../assets/photos/team-chloe.jpg';
import teamLionel from '../assets/photos/team-lionel.jpg';
import teamYohaquim from '../assets/photos/team-yohaquim.jpg';
import teamKarim from '../assets/photos/team-karim.jpg';
import teamEvan from '../assets/photos/team-evan.jpg';
import teamMarina from '../assets/photos/team-marina.jpg';

const lionel = '<a href="mailto:l.serin@unisons.fr">l.serin@unisons.fr</a>, <a href="tel:+33467100486">04 67 10 04 86</a>';
const provisoire = (what: string) => `Texte provisoire : ${what} sera ajoutée dès réception des informations.`;

// Équipe : lue dans Sanity si SANITY_PROJECT_ID est défini (une seule lecture par build), sinon la liste locale.
// Si Sanity ne contient encore aucun membre, la liste locale est conservée (avertissement dans le journal).
const localTeam: { title: string; people: { name: string; role: string; img?: ImageMetadata; email?: string }[] }[] = [
  { title: 'Présidence et direction', people: [
    { name: 'Fadelha Benammar-Koly', role: 'Présidente', img: teamFadelha, email: 'f.benammar@unisons.fr' },
    { name: 'Habib Dechraoui', role: 'Directeur général', img: teamHabib, email: 'h.dechraoui@unisons.fr' },
    { name: 'Amandine Thomas', role: 'Assistante du directeur', img: teamAmandine, email: 'a.thomas@unisons.fr' },
    { name: 'Florian Oliveres', role: 'Directeur délégué', img: teamFlorian, email: 'f.oliveres@unisons.fr' },
  ] },
  { title: 'Administration', people: [{ name: 'Estelle Bardiot', role: 'Directrice administrative et financière', img: teamEstelle, email: 'e.bardiot@unisons.fr' }] },
  { title: 'Communication', people: [
    { name: 'Delhia Prothon Djob', role: 'Chargée de communication', img: teamDelhia, email: 'd.prothon@unisons.fr' },
    { name: 'Evan Drammeh', role: 'Alternant en communication', img: teamEvan },
    { name: 'Marina Da Silva', role: 'Service civique en vidéo', img: teamMarina },
  ] },
  { title: 'Cohésion sociale', people: [{ name: 'Nasser Benammar', role: 'Conseiller socio-éducatif', img: teamNasser, email: 'n.benammar@unisons.fr' }] },
  { title: 'Médiation culturelle et sociale', people: [
    { name: 'Malika Aboubeker', role: 'Médiatrice culturelle et sociale', img: teamMalika, email: 'm.aboubeker@unisons.fr' },
    { name: 'Yohaquim Faafae', role: 'Médiateur culturel et social', img: teamYohaquim },
    { name: 'Karim Larbi Cherif', role: 'Médiateur culturel et social', img: teamKarim, email: 'k.larbicherif@unisons.fr' },
  ] },
  { title: 'Insertion et formation', people: [{ name: 'Eloïse Renard', role: 'Chargée d’accompagnement socio-professionnel des musiciens', img: teamEloise, email: 'e.renard@unisons.fr' }] },
  { title: 'Actions éducatives', people: [
    { name: 'Chloé Didier', role: 'Chargée de l’action éducative artistique et culturelle', img: teamChloe, email: 'c.didier@unisons.fr' },
    { name: 'Abdou Bayou', role: 'Service éducatif', img: teamAbdou },
  ] },
  { title: 'Ateliers hip-hop', people: [
    { name: 'Lionel Serin', role: 'Référent des ateliers', img: teamLionel, email: 'l.serin@unisons.fr' },
    { name: 'Titouan Ramade', role: 'Technicien du son', img: teamTitouan },
  ] },
];
const cms = await loadCms();
const teamGroups = cms && cms.team.length > 0 ? mapTeam(cms.team, { warn }) : localTeam;
if (cms && cms.team.length === 0) warn('aucun membre dans Sanity : équipe locale conservée');


const dph = (src: ImageMetadata, alt: string) => ({ src, alt });
const DEMO: any = {
  librairie: { provisional: false, live: true,
    intro: ['La librairie de L’art est public propose une sélection de livres sur les cultures du monde arabe, le hip-hop et les arts visuels. Exemple de texte : la présentation réelle sera rédigée par l’équipe.'],
    photo: dph(galerieDemo, 'La librairie, au rez-de-chaussée de L’art est public'),
    practical: [['Horaires', 'Du lundi au vendredi, de 14h30 à 18h00'], ['Accès', '475 avenue du Comté de Nice, 34080 Montpellier'], ['Entrée', 'Libre']],
    selection: [
      { title: 'Titre d’exemple 1', author: 'Auteur d’exemple', description: 'Une courte description du livre, rédigée par l’équipe.', cover: dph(rewind1, 'Couverture d’exemple') },
      { title: 'Titre d’exemple 2', author: 'Autrice d’exemple', description: 'Une courte description du livre, rédigée par l’équipe.', cover: dph(studio3, 'Couverture d’exemple') },
      { title: 'Titre d’exemple 3', author: 'Auteur d’exemple', description: 'Une courte description du livre, rédigée par l’équipe.', cover: dph(scene, 'Couverture d’exemple') },
    ] },
  podcast: { provisional: false, intro: ['Le podcast de L’art est public donne la parole aux artistes, aux jeunes et aux équipes de l’association. Exemple de texte : la présentation réelle sera rédigée par l’équipe.'],
    cover: dph(studio2, 'Visuel du podcast'),
    listenLinks: [{ label: 'YouTube', href: 'https://www.youtube.com/' }, { label: 'Spotify', href: 'https://open.spotify.com/' }] },
  episodes: [
    { slug: 'episode-exemple-3', number: 3, title: 'Épisode d’exemple', date: '2026-10-15', paras: ['Description d’exemple de l’épisode : le sujet abordé, l’invité et ce qu’on y apprend.'], guests: 'Invité d’exemple', guestRole: 'Artiste', duration: '42 min', youtubeId: (videosDemo as any[])[0].id, image: dph(studio1, 'Vignette d’exemple') },
    { slug: 'episode-exemple-2', number: 2, title: 'Deuxième épisode d’exemple', date: '2026-09-24', paras: ['Description d’exemple de l’épisode : le sujet abordé, l’invité et ce qu’on y apprend.'], guests: 'Invitée d’exemple', duration: '38 min', youtubeId: (videosDemo as any[])[1].id, image: dph(consoleImg, 'Vignette d’exemple') },
    { slug: 'episode-exemple-1', number: 1, title: 'Premier épisode d’exemple', date: '2026-09-03', paras: ['Description d’exemple de l’épisode : le sujet abordé, l’invité et ce qu’on y apprend.'], duration: '35 min', youtubeId: (videosDemo as any[])[2].id, image: dph(atelierHero, 'Vignette d’exemple') },
  ],
  downloads: [
    { category: 'Rapport d’activité', items: [{ title: 'Rapport d’activité 2025 (exemple)', desc: 'Le bilan de l’année : actions, chiffres clés et perspectives.', href: '/infos-pratiques/telechargements', meta: 'PDF, 2,4 Mo, 2025' }] },
    { category: 'Logos', items: [{ title: 'Logos UNi’SONS (exemple)', desc: 'Logos en couleur et en noir et blanc, pour la presse et les partenaires.', href: '/infos-pratiques/telechargements', meta: 'ZIP, 1,1 Mo' }] },
    { category: 'Dossiers de presse', items: [{ title: 'Dossier de presse (exemple)', desc: 'Présentation de l’association et de ses pôles.', href: '/infos-pratiques/telechargements', meta: 'PDF, 3,8 Mo, 2026' }] },
  ],
};


// Librairie, podcast, téléchargements : le contenu Sanity remplace la page locale seulement s'il est publiable
// (voir la fin du fichier). Sinon, les pages restent exactement celles ci-dessous.
const librairie: any = DEMO.librairie;
const podcast: any = DEMO.podcast;
const episodes: any[] = DEMO.episodes;
const downloadGroups: any[] = DEMO.downloads;
const librairieLive = Boolean(librairie?.live);
const podcastLive = Boolean(podcast && !podcast.provisional && episodes.length > 0);
/** Données des pages /l-art-est-public/podcast/<slug> : vides tant que le podcast n'est pas publiable (aucune page d'épisode) */
export const podcastEpisodes = podcastLive ? episodes : [];
export const podcastInfo = podcastLive ? podcast : null;


export const pages: Record<string, PageDef> = {
  // ---------------------------------------------------------------- Kosmik Hip-Hop
  '/kosmik-hip-hop': {
    label: 'Kosmik Hip-Hop', title: 'Kosmik Hip-Hop', sub: 'Ateliers, scène et accompagnement des artistes',
    seo: { title: 'Kosmik Hip-Hop | Ateliers et Kosmik Club | UNi’SONS', description: 'Le hip-hop à UNi’SONS : ateliers gratuits pour les 12-26 ans à Montpellier, soirées du Kosmik Club et accompagnement artistique des jeunes musiciens.' },
    hero: { img: popoSound, alt: 'Scène violette d’une soirée Hip-hop du monde' },
    blocks: [
      { t: 'lead', text: 'Action emblématique d’UNi’SONS, le hip-hop a tracé l’identité de l’association depuis son origine : écrire, composer, enregistrer et monter sur scène.' },
      { t: 'cards', label: 'Dans cette rubrique', items: [
        { title: 'Atelier Hip Hop', text: 'Écriture, musique, live et vidéo, chaque mercredi, pour les 12-26 ans. Gratuit.', href: '/kosmik-hip-hop/atelier-hip-hop', img: atelierHero },
        { title: 'Accompagnement artistique', text: 'Repérer et professionnaliser de jeunes talents de 16 à 25 ans.', href: '/kosmik-hip-hop/accompagnement-artistique', img: alchimix },
        { title: 'Agenda Kosmik Club', text: 'Les prochaines soirées du Kosmik Club.', href: '/agenda/kosmik-club', img: scene },
      ] },
      { t: 'text', label: 'Kosmik Club', title: 'La scène du hip-hop', paras: ['Le Kosmik Club est la scène hip-hop d’UNi’SONS : des soirées où les jeunes artistes accompagnés par l’association montent sur scène aux côtés d’artistes confirmés. Rap, DJ sets et freestyles, dans une ambiance ouverte à tous.', 'Exemple de texte : la programmation, le lieu et les horaires réels seront rédigés par l’équipe depuis le Studio.'], links: [{ label: 'Agenda Kosmik Club', href: '/agenda/kosmik-club' }] },
    ],
  },
  '/kosmik-hip-hop/atelier-hip-hop': {
    label: 'Kosmik Hip-Hop', title: 'Atelier Hip Hop', sub: 'Écriture, musique, live, vidéo',
    seo: { title: 'Ateliers hip-hop gratuits à Montpellier, 12-26 ans | UNi’SONS', description: 'Ateliers hip-hop gratuits chaque mercredi de 14h à 19h pour les 12-26 ans : écriture, composition, studio d’enregistrement et clips. Ateliers itinérants aussi.' },
    hero: { img: atelierHero, alt: 'Un artiste enregistre au micro dans le studio d’UNi’SONS' },
    blocks: [
      { t: 'text', label: 'Les ateliers', title: 'Plonger dans l’univers des musiques urbaines', paras: [
        'Action emblématique d’UNi’SONS, les ateliers hip-hop ont tracé l’identité de l’association depuis son origine. Chaque année, ils offrent à des jeunes la possibilité de plonger dans l’univers des musiques urbaines, de se familiariser avec l’art du rap et de perfectionner leurs compétences dans un domaine qui les passionne.',
        'De l’analyse de textes aux premières performances sur scène, en passant par la composition de chansons et la réalisation de clips vidéo, ces ateliers sont des espaces de travail propices à la créativité, collective ou individuelle.',
      ] },
      { t: 'facts', label: 'Infos pratiques', title: 'Les ateliers à UNi’SONS', items: [
        ['Pour qui ?', 'Jeunes artistes de 12 à 26 ans, tous niveaux. Les animateurs s’adaptent aux besoins de chaque participant, de la mise en scène à l’aide à la composition et à l’écriture.'],
        ['Quand ?', 'Tous les mercredis après-midi, de 14h à 19h.'],
        ['Où ?', 'UNi’SONS, 475 avenue du Comté de Nice, Montpellier. Tram, arrêt Hauts de Massane puis 15 min à pied, ou bus 19, arrêt Jacques Prévert. À vélo : piste cyclable jusqu’en haut des Hauts de Massane.'],
        ['Tarif', 'Gratuit, ouvert à toutes et à tous.'],
        ['S’inscrire', `Lionel Serin, animateur : ${lionel}`],
      ] },
      { t: 'text', label: 'Les équipements', title: 'Un vrai studio à disposition', items: [
        'Un studio d’enregistrement professionnel, avec cabine et régie',
        'Un studio de post-production et de beatmaking',
        'Une salle de concert et de répétition, avec régie',
      ] },
      { t: 'gallery', cols: 3, items: [
        { img: studio1, alt: 'La cabine d’enregistrement d’UNi’SONS, tabouret et micro' },
        { img: studio3, alt: 'Le studio de post-production : clavier, enceintes et ordinateur' },
        { img: consoleImg, alt: 'La console de mixage et les écrans du studio' },
      ] },
      { t: 'text', label: 'Ateliers itinérants', title: 'Les ateliers viennent jusqu’à vous', paras: [
        'Les ateliers hip-hop se déplacent dans les établissements scolaires (classes ULIS, classes relais), les foyers, les IME, les ITEP, les MECS ou la PJJ, en lien étroit avec les équipes socio-éducatives. Ils se construisent avec des structures spécialisées et leurs équipes pluridisciplinaires, scolaires, sociales, médicales ou judiciaires.',
        'Contenu : production et analyse de morceaux rap, écriture de textes, mise en musique et interprétation. L’objectif est d’enregistrer une ou plusieurs œuvres collectives dans les studios d’UNi’SONS, en suivant toutes les étapes de la création musicale : musique assistée par ordinateur, écriture, répétitions, enregistrement.',
        '<strong>Objectifs.</strong>',
      ], items: [
        '<strong>Sociaux :</strong> remobilisation, renforcement des savoirs de base, travail sur la construction de la réflexion, acquisition d’une méthode de travail',
        '<strong>Éducatifs :</strong> travailler l’écoute, développer l’expression orale, accéder aux outils numériques',
        '<strong>Artistiques :</strong> développer la créativité',
      ], after: [
        '<strong>Tarification.</strong> Différents packs peuvent être proposés selon le groupe et les objectifs fixés par l’équipe porteuse du projet. Pour établir un devis, contactez Lionel Serin, animateur culturel et social : ' + lionel + '.',
      ] },
      { t: 'videos', label: 'Atelier itinérant', title: 'Session avec les jeunes d’UTOA', ids: ['iAZXhuqdvnE'] },
      { t: 'videos', label: 'Les clips produits', title: 'Les morceaux nés des ateliers', ids: ['rrlCybMkrMk', 'GcfVEZNhei4', 'MwSvFcXHF8M', 'qvnrHP2pTmM'] },
    ],
  },
  '/kosmik-hip-hop/accompagnement-artistique': {
    label: 'Kosmik Hip-Hop', title: 'Accompagnement artistique', sub: 'Jeunes musiciens de 16 à 25 ans',
    seo: { title: 'Accompagnement artistique des jeunes musiciens | UNi’SONS', description: 'UNi’SONS repère et professionnalise de jeunes talents de 16 à 25 ans : accompagnement artistique modulable, studio d’enregistrement et pépinière d’artistes.' },
    hero: { img: accmus, alt: 'Un chanteur sur scène devant un rideau rouge, photographie d’un concert accompagné par UNi’SONS' },
    blocks: [
      { t: 'text', label: 'Le dispositif', title: 'Repérer de nouveaux talents et les professionnaliser', paras: [
        'Ce dispositif vise à repérer de nouveaux talents et à les professionnaliser. UNi’SONS accompagne prioritairement les jeunes de 16 à 25 ans, avec pour objectif d’accroître leur visibilité et leur professionnalisation. Il se compose de deux volets.',
        '<strong>Le premier volet</strong> est un accompagnement artistique adapté et modulable selon l’avancée des projets et leurs objectifs, avec une visée professionnelle. UNi’SONS met à disposition ses compétences : ingénieur du son, directeur artistique, chargée de communication, administratrice, photographe, vidéaste. L’association dispose aussi de locaux adaptés, avec un studio d’enregistrement et des logiciels de MAO et de PAO.',
        '<strong>Le second volet</strong> est une pépinière qui réunit de jeunes artistes autour d’ateliers réguliers de pratiques artistiques (écriture, composition, enregistrement en studio, mixage) : une passerelle vers la professionnalisation.',
      ] },
      { t: 'gallery', title: 'Artistes accompagnés', cols: 3, items: [
        { img: lanceur, alt: 'Pochette du projet Le Lanceur de dés', caption: 'Le Lanceur de dés. Mise en musique et en voix du poème éponyme du Palestinien Mahmoud Darwich.' },
        { img: alchimix, alt: 'Le groupe Alchimix en concert', caption: 'Alchimix. À la voix gnawa et au guembri de Selim se mêlent les envolées du Hang de Théo et les rythmes explosifs de Mic-Lee, human beatbox.' },
        { img: nooba, alt: 'Visuel du projet Nooba !', caption: 'Nooba ! Du raï « tal bled » rhabillé de synthés analogiques, de l’électro dub aux mélopées bédouines, de la transe aux karkabous électriques.' },
      ] },
      { t: 'text', label: 'Avec Arabesques', paras: [
        'Depuis sa création en 2006, le festival Arabesques (Montpellier) est devenu le principal festival en Europe dédié aux arts du monde arabe, où se retrouvent artistes émergents et « légendes vivantes ». Conscient de l’enjeu d’une nouvelle scène dynamique, Arabesques accompagne en parallèle des créations inspirées des cultures traditionnelles du monde arabe, ouvertes sur la modernité et le reste du monde.',
      ], links: [{ label: 'Le festival Arabesques', href: 'https://arabesques-presentation.vercel.app/', external: true }, { label: 'Accompagnement des musiciens', href: '/l-association/accompagnement-des-musiciens' }] },
    ],
  },

  // ---------------------------------------------------------------- L'art est public
  '/l-art-est-public': {
    label: 'L’art est public', title: 'L’art est public', sub: 'Le tiers-lieu d’UNi’SONS aux Hauts de Massane',
    seo: { title: 'L’art est public | Tiers-lieu culturel à Montpellier | UNi’SONS', description: 'L’art est public, tiers-lieu d’UNi’SONS à Montpellier : galerie d’exposition, studios, scène, librairie, podcast et actions de cohésion sociale.' },
    hero: { img: galerieLieu, alt: 'La galerie de L’art est public : collages et photographies aux murs' },
    blocks: [
      { t: 'lead', text: 'Un lieu ouvert au cœur des Hauts de Massane : galerie, studios, scène et services de proximité, aménagé avec les jeunes et les habitantes du quartier.' },
      { t: 'text', label: 'Le projet', paras: [
        'Dernière création en date : en 2020, UNi’SONS a inauguré « L’art est public », un lieu devenu un point de convergence culturelle au cœur des Hauts de Massane. Il offre une galerie d’exposition pionnière dans le quartier, des ateliers hip-hop, des récitals, des projections et des services publics essentiels, favorisant l’unité et la cohésion sociale.',
        'Symbole d’ouverture, L’art est public a été aménagé par les jeunes du quartier à travers des chantiers éducatifs. Les mamans du quartier sont associées à son fonctionnement depuis le début. À l’écoute des usagers, la convivialité en est le maître mot : chacun peut y trouver sa place, puis devenir acteur de sa vie culturelle.',
      ], links: [{ label: 'Le lieu', href: '/l-art-est-public/le-lieu' }] },
      { t: 'cards', label: 'Dans cette rubrique', items: [
        { title: 'Agenda', text: 'Concerts, rencontres et expositions.', href: '/agenda/l-art-est-public', img: scene },
        { title: 'Galerie', text: 'L’exposition en cours et les rétrospectives.', href: '/l-art-est-public/galerie', img: wkExpo },
        { title: 'Le lieu', text: 'Studios, galerie, scène : les équipements.', href: '/l-art-est-public/le-lieu', img: galerieLieu },
        { title: 'Librairie', text: librairieLive ? 'Sélection et infos pratiques.' : 'Bientôt en ligne.', href: '/l-art-est-public/librairie', img: rewind1 },
        { title: 'Uni’Jeunes Social School', text: 'Se (re)construire par l’engagement.', href: '/l-art-est-public/uni-jeunes-social-school', img: coulisses },
        { title: 'Podcast', text: podcastLive ? 'Épisodes et liens d’écoute.' : 'Bientôt en ligne.', href: '/l-art-est-public/podcast', img: studio2 },
      ] },
    ],
  },
  '/l-art-est-public/le-lieu': {
    label: 'L’art est public', title: 'Le lieu', sub: 'Studios, galerie et scène aux Hauts de Massane',
    seo: { title: 'Le lieu : studios, galerie et scène | UNi’SONS Montpellier', description: 'Les équipements de L’art est public à Montpellier : deux studios d’enregistrement, une galerie d’exposition et une salle de concert avec régie.' },
    blocks: [
      { t: 'text', label: 'Présentation', paras: [
        'L’art est public réunit sous un même toit les équipements d’UNi’SONS : des studios pour enregistrer, une galerie pour exposer et une scène pour jouer. Le lieu est ouvert sur le quartier des Hauts de Massane et accueille les ateliers, les rencontres, les projections et les expositions de l’association.',
      ], links: [{ label: 'Comment venir', href: '/infos-pratiques' }, { label: 'Agenda', href: '/agenda/l-art-est-public' }] },
      { t: 'gallery', title: 'Les studios', cols: 3, items: [
        { img: studio1, alt: 'La cabine d’enregistrement' },
        { img: studio2, alt: 'La régie et son clavier' },
        { img: studio3, alt: 'Le studio de post-production' },
      ] },
      { t: 'facts', label: 'Studios', items: [
        ['Enregistrement', 'Un studio professionnel avec cabine et régie.'],
        ['Post-production', 'Un studio de post-production et de beatmaking.'],
        ['Usage', 'Ateliers hip-hop, accompagnement artistique, enregistrement de projets collectifs.'],
      ] },
      { t: 'image', img: galerieLieu, alt: 'La galerie de L’art est public pendant l’exposition REWIND', caption: 'La galerie, pendant l’exposition REWIND (2024).' },
      { t: 'text', label: 'La galerie', paras: ['Une galerie d’exposition pionnière dans le quartier, en entrée libre. Elle accueille une exposition à la fois, avec des visites commentées pour les groupes et les scolaires.'], links: [{ label: 'Voir la galerie', href: '/l-art-est-public/galerie' }] },
      { t: 'image', img: scene, alt: 'La salle de concert d’UNi’SONS : micros, percussions et claviers sur scène', caption: 'La scène : une salle de concert et de répétition avec régie.' },
    ],
  },
  '/l-art-est-public/librairie': {
    noindex: true, // page en préparation : repasse à false quand le contenu Sanity est publié (voir plus bas)
    label: 'L’art est public', title: 'Librairie', sub: 'Page en préparation',
    seo: { title: 'Librairie | L’art est public | UNi’SONS', description: 'La librairie de L’art est public à Montpellier : présentation, sélection et horaires à venir. Page en préparation sur le site d’UNi’SONS.' },
    blocks: [{ t: 'text', label: 'À venir', title: 'La librairie', paras: [], note: provisoire('la présentation de la librairie (sélection, horaires, accès)'), links: [{ label: 'Le lieu', href: '/l-art-est-public/le-lieu' }, { label: 'Agenda', href: '/agenda/l-art-est-public' }] }],
  },
  '/l-art-est-public/uni-jeunes-social-school': {
    noindex: true, // présentation en cours de rédaction : retirer cette ligne quand le texte est validé
    label: 'L’art est public', title: 'Uni’Jeunes Social School', sub: 'Remobilisation par l’engagement',
    seo: { title: 'Uni’Jeunes Social School | UNi’SONS Montpellier', description: 'Uni’Jeunes Social School : des jeunes de 16 à 25 ans se remobilisent en participant à l’organisation d’événements culturels. Présentation en cours de rédaction.' },
    blocks: [{ t: 'text', label: 'À venir', title: 'Social School', paras: [
      'Les actions « #Social School » d’UNi’SONS sont déjà présentées dans la rubrique Éducation artistique, à la page Les Coulisses Solidaires : des jeunes de 16 à 25 ans s’engagent dans l’organisation d’événements culturels.',
    , 'Exemple de texte : des jeunes de 16 à 25 ans préparent la communication, l’accueil et la logistique des événements, et gagnent en confiance et en compétences. Les inscriptions se font auprès de l’équipe.'], links: [{ label: 'Les Coulisses Solidaires', href: '/education-artistique/coulisses-solidaires' }] }],
  },
  '/l-art-est-public/podcast': {
    noindex: true, // page en préparation : repasse à false quand le podcast est publié (voir plus bas)
    label: 'L’art est public', title: 'Podcast', sub: 'Page en préparation',
    seo: { title: 'Podcast | L’art est public | UNi’SONS', description: 'Le podcast de L’art est public à Montpellier : épisodes en vidéo, invités et liens d’écoute, bientôt en ligne sur le site d’UNi’SONS.' },
    blocks: [{ t: 'text', label: 'À venir', title: 'Le podcast', paras: ['Les épisodes seront publiés ici en vidéo, chacun sur sa page avec sa description et ses liens d’écoute.'], note: provisoire('la présentation du podcast et ses épisodes en vidéo'), links: [{ label: 'Agenda', href: '/agenda/l-art-est-public' }] }],
  },

  // ---------------------------------------------------------------- Éducation artistique
  '/education-artistique': {
    label: 'Éducation artistique', title: 'Éducation artistique', sub: 'Rencontres, parcours et projets citoyens',
    seo: { title: 'Éducation artistique à Montpellier | UNi’SONS', description: 'Les actions éducatives d’UNi’SONS à Montpellier : Renc’Art, Jeunesses en Arabesque, Coulisses Solidaires et Programme de réussite éducative, jusqu’à 25 ans.' },
    hero: { img: opera, alt: 'Une chorale de jeunes en tee-shirts blancs sur la scène de l’Opéra, un rappeur au premier plan' },
    blocks: [
      { t: 'lead', text: 'Depuis la création d’Arabesques, UNi’SONS crée du dialogue interculturel par des actions artistiques et éducatives, dans les établissements scolaires et dans les quartiers.' },
      { t: 'cards', label: 'Dans cette rubrique', items: [
        { title: 'Renc’Art', text: 'Des rencontres entre les jeunes et des personnalités de la musique, du cinéma, du sport et du théâtre.', href: '/education-artistique/renc-art', img: rencart },
        { title: 'Jeunesses en Arabesque', text: 'Parcours culturels, concerts surprises et construction de décors, de la maternelle à l’université.', href: '/education-artistique/jeunesses-en-arabesque', img: jeaProcession },
        { title: 'Les Coulisses Solidaires', text: 'Des jeunes de 16 à 25 ans se (re)construisent par l’engagement.', href: '/education-artistique/coulisses-solidaires', img: coulisses },
        { title: 'Programme de réussite éducative', text: 'Un suivi personnalisé pour éviter le détachement scolaire.', href: '/education-artistique/programme-de-reussite-educative', img: chorale },
      ] },
    ],
  },
  '/education-artistique/renc-art': {
    label: 'Éducation artistique', title: 'Renc’Art', sub: 'Rencontres culturelles, artistiques et éducatives',
    seo: { title: 'Renc’Art : rencontres entre jeunes et artistes | UNi’SONS', description: 'Les Renc’Art d’UNi’SONS : rencontres éducatives entre les jeunes et des personnalités de la musique, du cinéma, du sport et du théâtre.' },
    hero: { img: rencart, alt: 'Deux invités en discussion sur scène lors d’un Renc’Art, devant la bannière UNi’SONS' },
    blocks: [
      { t: 'text', label: 'Le principe', title: 'Un espace d’échange unique', paras: [
        'UNi’SONS s’investit pleinement dans l’éducation en organisant les Renc’Art, des rencontres éducatives qui sensibilisent les jeunes à l’art, à la culture et à leur environnement social.',
        'Elles offrent un espace d’échange entre les jeunes et des personnalités de la musique, du cinéma, du sport et du théâtre, choisies pour leur proximité avec les jeunes, leur engagement en faveur de valeurs positives et leur envie de transmettre. Ces artistes partagent leurs expériences et échangent sur leurs parcours.',
        'Les Renc’Art encouragent un dialogue actif et suscitent des débats citoyens responsables. En déconstruisant les stéréotypes médiatiques et en explorant les réalités des milieux artistique et sportif, elles aident les jeunes à développer leur sens critique.',
      ] },
      { t: 'text', label: 'Objectifs', items: [
        'Favoriser la socialisation des jeunes à travers des échanges constructifs.',
        'Éveiller la curiosité artistique en les initiant à diverses formes culturelles.',
        'Stimuler la réflexion citoyenne, déconstruire les stéréotypes et développer l’esprit critique.',
      ] },
      { t: 'text', label: 'Renc’Art scolaire', title: 'Une méthode en quatre temps', items: [
        'Sélection de l’artiste et définition d’un axe de médiation.',
        'Sessions préparatoires pour les participants.',
        'Intervention de l’artiste, suivie d’un débat animé par un médiateur d’UNi’SONS.',
        'Bilan collectif et valorisation des productions issues de l’événement.',
      ] },
      { t: 'text', label: 'Ils sont venus', title: 'Ils ont participé aux Renc’Art', paras: [
        '<strong>Musique :</strong> Youssoupha, Médine, Kery James, Rim K (113), Diam’s, Lyna Mahyem, Saïan Supa Crew, Zaho, Sefyu, Kenza Farah, Assassin, Tunisiano, Psy 4 de la Rime, Sniper, Sinik, Fababy, Kayna Samet, Bakar, Leck, Axiom, HK, OGB, Rost, Alibi Montana, Al Peco, Rocca, La Rumeur, Nassi, Denzo, Georgio, Oum, Amelle Chahbi, Zebda et Magyd Cherfi, Wallen, N3MS, Vin’S, Solo, Melan…',
        '<strong>Cinéma :</strong> Shaïn Boumedine, Agnès Pizzini, Alexandre Amiel, Jean-François Richet, Éric Pittard, Rabah Ameur-Zaïmeche, Carmine Paternoster…',
        '<strong>Sport :</strong> Téji Savanier, Khalil Fayad, Jamel Saïhi, Daniel Congré, Jonas Martin, Benjamin Stambouli…',
        '<strong>Autres :</strong> Djamil le Shlag, Malik Bentalha, Berthet One…',
      ] },
      { t: 'videos', label: 'En images', title: 'Les Renc’Art en vidéo', ids: ['yKI1ncMaIIU', 'oodGqIEz5ss', 'X5da09FeeV8'] },
    ],
  },
  '/education-artistique/jeunesses-en-arabesque': {
    label: 'Éducation artistique', title: 'Jeunesses en Arabesque', sub: 'L’héritage artistique du monde arabe dans l’éducation',
    seo: { title: 'Jeunesses en Arabesque | Parcours culturels | UNi’SONS', description: 'Jeunesses en Arabesque : parcours culturels, concerts surprises, Jeunes voix d’Arabesques et construction de décors, de la maternelle à l’université.' },
    hero: { img: jeaProcession, alt: 'Une déambulation de percussionnistes en costumes traditionnels devant des enfants' },
    blocks: [
      { t: 'text', label: 'Le programme', title: 'Un dialogue interculturel à l’école', paras: [
        'Depuis la création d’Arabesques, UNi’SONS s’attache à créer du dialogue interculturel par des actions artistiques et éducatives au sein des établissements scolaires.',
        'Jeunesses en Arabesque fait vivre aux jeunes des expériences artistiques humanistes et citoyennes, porteuses de respect, d’ouverture et de vivre ensemble. L’action favorise l’acceptation des différences et la reconnaissance des multiples identités, en permettant aux élèves d’explorer le Maghreb et l’Orient par leur culture, leurs expressions scéniques, leur langue, leur musique, leurs arts visuels, mais aussi leur histoire et leur géographie.',
        'Le programme s’adresse à toutes les institutions scolaires et éducatives, de la maternelle à l’université, avec une attention particulière pour les quartiers prioritaires et les zones rurales.',
      ] },
      { t: 'text', label: 'Parcours culturels', paras: [
        'Un programme éducatif proposé tout au long de l’année scolaire. UNi’SONS accompagne les élèves, parfois avec leurs parents, dans un périple de découvertes artistiques : tarifs préférentiels pour les spectacles, guides pédagogiques, sessions de médiation, visites de lieux culturels, projections et expositions dédiées.',
        'Des ateliers encadrés par des artistes renommés font rencontrer aux élèves diverses formes artistiques du monde arabe (conte, musique, théâtre, arts plastiques) et se concluent par des représentations publiques.',
      ] },
      { t: 'text', label: 'Jeunes voix d’Arabesques', title: 'Promouvoir l’interculturalité', paras: [
        'Des élèves aux horizons variés collaborent sur un projet lié à la diversité culturelle de la Méditerranée, sous la supervision de divers intervenants. La démarche passe par l’écriture : les jeunes adoptent le point de vue d’autres personnes et d’autres contextes, ce qui renforce leur empathie et leur capacité à interagir avec autrui.',
        'L’écriture leur fait aborder autrement la structure d’une chanson (rimes, couplets, refrains, syntaxe), dans une formation qui va de l’initiation musicale à la performance sur scène, encadrée par une équipe pédagogique et artistique. Les élèves travaillent leur voix, leur écoute et leur sens du rythme, et réfléchissent à un monde où le dialogue interculturel est possible.',
      ] },
      { t: 'videos', label: 'En images', title: 'Jeunes voix d’Arabesques', ids: ['owgmDf_O1ro', 'bj1tQklpAx4'] },
      { t: 'text', label: 'Concerts surprises', paras: ['Pendant le festival Arabesques, les écoles maternelles, élémentaires, collèges et lycées accueillent une troupe de musiciens dans leurs cours de récréation. Ces événements « surprises » permettent aux élèves de découvrir, depuis leur environnement quotidien, la richesse des instruments de la musique méditerranéenne.'] },
      { t: 'image', img: jeaProcession, alt: 'Des musiciens en tenue traditionnelle jouent des tambours devant des élèves' },
      { t: 'text', label: 'Parcours du jeune spectateur', paras: ['UNi’SONS favorise la rencontre des artistes et du jeune public en leur permettant d’assister à de nombreuses représentations de la Caravane et du festival Arabesques. Chacune est préparée en classe avec les professionnels d’UNi’SONS (médiateur socioculturel et service éducatif).'], links: [{ label: 'Le festival Arabesques', href: 'https://arabesques-presentation.vercel.app/', external: true }] },
      { t: 'image', img: jeaCollege, alt: 'Des collégiens avec la chanteuse Souad Massi lors d’une rencontre', narrow: true },
      { t: 'text', label: 'Le CFA', title: 'Construction des décors du festival', paras: [
        'UNi’SONS s’est associée à plusieurs établissements : le CFA Hérault (bois et métallerie), le CFA de Méjannes-lès-Alès (peinture) et le lycée professionnel Léonard de Vinci de Montpellier (travail du bois). Élèves et apprentis ont collaboré toute l’année scolaire pour créer des décors utilisés au festival Arabesques, au Domaine d’O. Le projet met en avant les arts du monde arabe et les architectures traditionnelles de la région.',
      ] },
      { t: 'image', img: jeaDecors, alt: 'Le montage des décors du festival Arabesques au Domaine d’O', narrow: true },
      { t: 'text', label: 'Le PREAC', title: 'Pôle ressource en Occitanie', paras: [
        'Le Pôle ressource pour l’éducation artistique et culturelle (PREAC) réunit la DRAC, les académies locales, l’Opéra Orchestre national de Montpellier, l’Orchestre du Capitole, l’abbaye de Sylvanes et UNi’SONS autour d’une thématique centrale : « chant et dialogues des cultures ».',
      ] },
    ],
  },
  '/education-artistique/coulisses-solidaires': {
    label: 'Éducation artistique', title: 'Les Coulisses Solidaires', sub: '#Social School : se (re)construire par l’engagement',
    seo: { title: 'Les Coulisses Solidaires | Jeunes de 16 à 25 ans | UNi’SONS', description: 'Chaque année, des jeunes de 16 à 25 ans en décrochage scolaire ou sans emploi participent à la réalisation d’événements culturels avec UNi’SONS.' },
    hero: { img: coulisses, alt: 'Un jeune monte une arche décorative du festival Arabesques sur une échelle' },
    blocks: [
      { t: 'text', label: 'Le projet', title: 'Se (re)construire par l’engagement', paras: [
        'Chaque année, un groupe de jeunes de 16 à 25 ans, confrontés à des difficultés comme le décrochage scolaire, le chômage ou une panne d’orientation, s’engage dans l’organisation d’actions culturelles. Leur implication va de la préparation au démontage lors des événements, avec un éducateur socio-éducatif et des professionnels expérimentés.',
        'Ces projets citoyens reposent sur la conviction que le festival Arabesques est un événement singulier, résolument centré sur l’humain. Les jeunes y développent le travail en équipe et intègrent des valeurs d’apprentissage, de partage et de respect, indispensables à la réussite de leurs projets professionnels.',
        'Les retombées sont nettes : confiance en soi, compétences nouvelles, objectifs professionnels renforcés. Les participants peuvent aussi obtenir le financement de leur BAFA, de leur permis de conduire ou de tout autre besoin lié à leur projet personnel.',
        'Depuis 2016, UNi’SONS prolonge la dynamique avec un partenariat avec le festival de cinéma méditerranéen Cinemed, à Montpellier, et avec le festival Détours du Monde, en Lozère. Ces collaborations élargissent les expériences professionnelles des jeunes.',
      ] },
      { t: 'facts', label: 'Infos pratiques', items: [
        ['Pour qui ?', 'Jeunes de 16 à 25 ans en décrochage scolaire ou sans emploi.'],
        ['Accès', 'Libre et gratuit.'],
        ['Contact', 'Nasser Benammar, conseiller socio-éducatif : <a href="mailto:n.benammar@unisons.fr">n.benammar@unisons.fr</a>, <a href="tel:+33499772807">04 99 77 28 07</a>'],
      ] },
      { t: 'videos', label: 'Court-métrage', title: 'Se construire avec Arabesques', ids: ['EkH20AXrF7o'] },
      { t: 'funding', img: ueCofinance, alt: 'Cofinancé par l’Union européenne', text: 'Ce projet est cofinancé par l’Union européenne.' },
    ],
  },
  '/education-artistique/programme-de-reussite-educative': {
    label: 'Éducation artistique', title: 'Programme de réussite éducative', sub: 'Éviter le détachement scolaire avec UNi’SONS',
    seo: { title: 'Programme de réussite éducative | Mosson | UNi’SONS', description: 'Programme de réussite éducative : suivi personnalisé des enfants et des jeunes de la Mosson et des Hauts de Massane, sessions pendant les vacances.' },
    blocks: [
      { t: 'text', label: 'Le programme', paras: [
        'Le Programme de réussite éducative (PRE) vise à remédier aux difficultés qui peuvent entraver la progression des enfants et des jeunes. Il offre un suivi personnalisé, inscrit dans une trajectoire de réussite éducative. Les bénéficiaires sont les enfants, les jeunes et leurs familles qui résident dans les quartiers Mosson et Hauts de Massane, quartiers prioritaires de la politique de la ville, ou qui fréquentent des établissements relevant de l’éducation prioritaire.',
        'À UNi’SONS, les actions sont conduites par un éducateur socio-éducatif, en réponse à des besoins identifiés pour chaque enfant : santé, accompagnement scolaire et éducatif, prévention du décrochage, soutien à la parentalité, initiatives culturelles.',
        'L’association soutient les jeunes de la Mosson dans leur parcours éducatif et participe au renforcement du réseau de la plateforme, en travaillant avec les équipes éducatives et en orientant les jeunes et leurs familles vers d’autres structures si nécessaire.',
      ] },
      { t: 'text', label: 'Les Chemins de la Réussite', title: 'Des sessions renforcées pendant les vacances', paras: [
        'Depuis 2025, UNi’SONS propose des sessions renforcées d’accompagnement, « Les Chemins de la Réussite », pendant les vacances scolaires. Pendant une semaine, un groupe de jeunes volontaires suit un planning aménagé qui alterne le champ éducatif, la culture et les visites d’institutions et de lieux ressources, avec la photographie, le podcast, les ateliers d’écriture et la vidéo pour supports. Des visites extérieures complètent le dispositif, par exemple à la Maison de l’Orientation ou à la Maison des Adolescents.',
        'Le dernier jour, les parents sont invités à une restitution des travaux. Ce temps permet aussi d’aborder des sujets essentiels : santé mentale, estime de soi, projection dans l’avenir.',
      ] },
      { t: 'videos', label: 'En vidéo', title: 'Les Chemins de la Réussite', ids: ['En8lv5aDpAU'] },
    ],
  },

  // ---------------------------------------------------------------- L'association
  '/l-association': {
    label: 'L’association', title: 'L’association', sub: 'Le hip-hop et les arts du monde arabe, depuis 2000',
    seo: { title: 'L’association UNi’SONS | Hip-hop et arts du monde arabe', description: 'UNi’SONS, association montpelliéraine fondée en 2000 : hip-hop, festival Arabesques, L’art est public, éducation artistique et accompagnement des musiciens.' },
    hero: { img: histoire2, alt: 'Deux rappeurs sur la scène d’UNi’SONS' },
    blocks: [
      { t: 'lead', text: 'UNi’SONS place la culture au cœur de ses missions, du hip-hop aux arts du monde arabe, avec une conviction : la diversité se cultive par l’art et par l’engagement.' },
      { t: 'cards', label: 'Dans cette rubrique', items: [
        { title: 'L’histoire', text: 'De 2000 à aujourd’hui : les dates et les valeurs de l’association.', href: '/l-association/histoire', img: histoire1 },
        { title: 'L’équipe', text: 'Les membres d’UNi’SONS et leurs missions.', href: '/l-association/equipe', img: teamMosaic },
        { title: 'Accompagnement des musiciens', text: 'Music Social Club : un accompagnement socio-professionnel et un incubateur de talents.', href: '/l-association/accompagnement-des-musiciens', img: accmus },
      ] },
      { t: 'facts', label: 'Identité', items: [
        ['Statut', 'Association loi 1901'],
        ['Présidente', 'Fadelha Benammar-Koly'],
        ['Direction', 'Habib Dechraoui'],
        ['Adresse', '475 avenue du Comté de Nice, 34080 Montpellier'],
        ['Contact', '<a href="tel:+33467100679">04 67 10 06 79</a>, <a href="mailto:administration@unisons.fr">administration@unisons.fr</a>'],
        ['Rapport d’activité', '<a href="/infos-pratiques/telechargements">Voir les téléchargements</a>'],
      ] },
    ],
  },
  '/l-association/accompagnement-des-musiciens': {
    label: 'L’association', title: 'Accompagnement des musiciens', sub: 'Music Social Club : artistique et social',
    seo: { title: 'Accompagnement des musiciens | Music Social Club | UNi’SONS', description: 'Music Social Club : accompagnement des musiciens bénéficiaires du RSA, avec suivi individualisé de 6 mois, ateliers collectifs, incubateur de talents.' },
    hero: { img: accmus, alt: 'Un chanteur sur scène, guitare à la main, devant un rideau rouge' },
    blocks: [
      { t: 'text', label: 'Le dispositif', title: 'Un accompagnement humain et personnalisé', paras: [
        'Conçu par UNi’SONS, ce dispositif d’accompagnement socio-professionnel s’adresse aux artistes, en particulier aux musiciens qui souhaitent donner une dimension professionnelle à leur art. Il est conçu pour les artistes bénéficiaires du RSA, dans le cadre d’un contrat d’engagement réciproque (CER).',
        'Ensemble, UNi’SONS et le musicien évaluent ses ambitions artistiques et construisent un projet sur mesure, puis le concrétisent en surmontant les obstacles. L’association aide à tirer le meilleur des ressources disponibles pour que l’artiste se consacre à sa pratique.',
        'Chaque musicien bénéficie d’un suivi individualisé : une phase de définition d’un à trois mois, puis un suivi sur 6 mois, renouvelable selon les besoins. Il comprend des entretiens individuels, des ateliers collectifs et des rencontres professionnelles choisis selon les besoins : droits d’auteur et régime de l’intermittence, techniques d’enregistrement, préparation à la scène.',
      ] },
      { t: 'facts', label: 'Contact', items: [['Référente', 'Éloïse Renard, chargée d’accompagnement socio-professionnel des musiciens : <a href="mailto:e.renard@unisons.fr">e.renard@unisons.fr</a>']] },
      { t: 'text', label: 'Incubateur', title: '… mais aussi incubateur de talents', paras: [
        'UNi’SONS cultive aussi l’éclosion de l’artiste par une série de rencontres, de séances d’enregistrement, de premières expériences scéniques et de captations vidéo, qui lui permettent d’explorer et d’affiner son identité artistique. L’association repère les talents dans les ateliers d’écriture hip-hop et à travers les initiatives d’Arabesques. Ces musiciens sont invités à rejoindre l’incubateur Music Social Club.',
        'L’accompagnement va au-delà de la découverte artistique. UNi’SONS joue un rôle de mentor et élabore une stratégie globale : image de l’artiste, visibilité auprès du public, formation, compétences techniques et réseau professionnel. L’objectif est d’aider l’artiste à atteindre un statut professionnel où son talent est pleinement reconnu.',
      ], links: [{ label: 'Accompagnement artistique des jeunes musiciens', href: '/kosmik-hip-hop/accompagnement-artistique' }] },
    ],
  },
  '/l-association/histoire': {
    label: 'L’association', title: 'L’histoire', sub: 'Cultiver la diversité par l’art et l’engagement',
    seo: { title: 'L’histoire d’UNi’SONS | De 2000 à aujourd’hui', description: 'Fondée en 2000 à Montpellier, UNi’SONS développe le hip-hop et les arts du monde arabe : festival Arabesques, L’art est public, éducation artistique, insertion.' },
    hero: { img: histoire1, alt: 'Le public sous l’arche du festival Arabesques, la nuit' },
    blocks: [
      { t: 'timeline', label: 'Les grandes dates', title: 'Vingt-six ans de projets', items: [
        { year: '2000', title: 'Naissance d’UNi’SONS', text: 'Fondée en 2000, l’association joue un rôle de premier plan dans le paysage artistique et socioculturel. Elle se consacre au hip-hop et aux arts du monde arabe.' },
        { year: '2006', title: 'Le festival Arabesques', text: 'UNi’SONS crée à Montpellier le festival Arabesques, devenu le principal festival en Europe dédié aux arts du monde arabe. <a href="https://arabesques-presentation.vercel.app/" target="_blank" rel="noopener">Le site du festival<span class="visually-hidden"> (nouvel onglet)</span></a>' },
        { year: '2016', title: 'Partenariat avec Cinemed', text: 'Les chantiers citoyens se prolongent avec le festival de cinéma méditerranéen Cinemed, à Montpellier.' },
        { year: '2020', title: 'L’art est public', text: 'UNi’SONS inaugure son tiers-lieu aux Hauts de Massane : galerie, studios et scène, aménagés avec les jeunes du quartier. <a href="/l-art-est-public">Découvrir le lieu</a>' },
        { year: '2024', title: 'REWIND', text: 'La galerie de L’art est public présente l’exposition REWIND d’Alain Garnier. <a href="/l-art-est-public/retrospectives">Les rétrospectives</a>' },
        { year: '2025', title: 'Les Chemins de la Réussite', text: 'De nouvelles sessions d’accompagnement renforcé pendant les vacances scolaires. <a href="/education-artistique/programme-de-reussite-educative">Le programme</a>' },
        { year: '2026', title: 'Arabesques, puis Darwich', text: 'Édition 2026 du festival du 8 au 20 septembre, puis vernissage de l’exposition Hommage à Mahmoud Darwich le 3 décembre. <a href="/l-art-est-public/galerie">La galerie</a>' },
      ] },
      { t: 'text', label: 'Nos valeurs', title: 'Cultiver la diversité par l’art et l’engagement', paras: [
        'Le cœur battant d’UNi’SONS est une approche artistique affirmée. L’association sert de terreau aux jeunes créatifs : un espace de liberté d’expression où la musique, le son et l’écriture révèlent l’originalité de chacun. Les ateliers hip-hop en sont l’exemple : les artistes en herbe y plongent dans la culture du hip-hop, perfectionnent leurs compétences et cultivent leur identité.',
        'Cette approche va au-delà de l’épanouissement individuel. Elle encourage la singularité collective, notamment par les Renc’Art, ces rencontres qui réunissent les cultures en un point de convergence où la célébration des différences est source d’inspiration.',
        'La diversité rayonne aussi à travers le Music Social Club, un incubateur qui accueille les jeunes talents et les guide dans le développement professionnel de leur identité artistique, comme un espace où chaque voix singulière trouve une tribune.',
      ], links: [{ label: 'Atelier Hip Hop', href: '/kosmik-hip-hop/atelier-hip-hop' }, { label: 'Renc’Art', href: '/education-artistique/renc-art' }, { label: 'Accompagnement des musiciens', href: '/l-association/accompagnement-des-musiciens' }] },
      { t: 'image', img: histoire2, alt: 'Deux rappeurs en concert sur la scène d’UNi’SONS' },
      { t: 'text', label: 'Arabesques et Caravane', paras: [
        'Le festival Arabesques célèbre la richesse des arts du monde arabe et révèle les nuances de cette mosaïque culturelle : l’originalité de chaque performance se fond dans un ensemble dont la variété est le fil conducteur.',
        'La Caravane Arabesques est une programmation itinérante, qui explore les quartiers, les écoles et les lieux culturels de la région. Chaque étape est l’occasion de partager et d’explorer l’individualité artistique sous toutes ses facettes.',
      ], links: [{ label: 'Le festival Arabesques', href: 'https://arabesques-presentation.vercel.app/', external: true }, { label: 'Caravane Arabesques', href: 'https://arabesques-presentation.vercel.app/caravane-arabesques', external: true }] },
      { t: 'text', label: 'Cohésion sociale', paras: [
        'À L’art est public, UNi’SONS met aussi en place des actions de cohésion sociale et d’insertion socio-professionnelle, pour que chaque usager devienne acteur de sa vie culturelle et de sa place dans la société.',
      ], links: [{ label: 'Les Coulisses Solidaires', href: '/education-artistique/coulisses-solidaires' }] },
    ],
  },
  '/l-association/equipe': {
    label: 'L’association', title: 'L’équipe', sub: 'Les membres d’UNi’SONS',
    seo: { title: 'L’équipe d’UNi’SONS | Direction, médiation, ateliers', description: 'Les membres de l’équipe d’UNi’SONS à Montpellier : direction, administration, communication, médiation, insertion, actions éducatives et ateliers hip-hop.' },
    blocks: [
      { t: 'team', groups: teamGroups },
      { t: 'text', label: 'Nous rejoindre', paras: ['UNi’SONS recrute régulièrement. Pour candidater ou proposer un stage, écrivez à <a href="mailto:administration@unisons.fr">administration@unisons.fr</a>.'] },
    ],
  },

  // ---------------------------------------------------------------- Infos pratiques
  '/infos-pratiques': {
    label: 'Avant de venir', title: 'Infos pratiques', sub: 'Adresse, accès et contacts',
    seo: { title: 'Infos pratiques | Adresse et accès d’UNi’SONS, Montpellier', description: 'UNi’SONS, L’art est public : 475 avenue du Comté de Nice, Montpellier. Tram arrêt Hauts de Massane, bus 19, piste cyclable. Téléphone, e-mail et réservations.' },
    blocks: [
      { t: 'text', label: 'Nous trouver', title: 'UNi’SONS, L’art est public', paras: ['475 avenue du Comté de Nice, 34080 Montpellier'], links: [{ label: 'Ouvrir dans Google Maps', href: 'https://www.google.com/maps/search/?api=1&query=UNi%E2%80%99SONS%20L%E2%80%99art%20est%20public%2C%20475%20avenue%20du%20Comt%C3%A9%20de%20Nice%2C%2034080%20Montpellier', external: true }, { label: 'Itinéraire', href: 'https://www.google.com/maps/dir/?api=1&destination=UNi%E2%80%99SONS%20L%E2%80%99art%20est%20public%2C%20475%20avenue%20du%20Comt%C3%A9%20de%20Nice%2C%2034080%20Montpellier', external: true }] },
      { t: 'map', query: 'UNi’SONS L’art est public, 475 avenue du Comté de Nice, 34080 Montpellier', address: '475 avenue du Comté de Nice, 34080 Montpellier', title: 'Carte Google Maps : UNi’SONS, L’art est public, Montpellier' },
      { t: 'facts', label: 'Comment venir ?', items: [
        ['En tram', 'Arrêt Hauts de Massane, puis 15 minutes à pied.'],
        ['En bus', 'Ligne 19, arrêt Jacques Prévert.'],
        ['À vélo', 'Piste cyclable jusqu’en haut des Hauts de Massane.'],
      ] },
      { t: 'facts', label: 'Nous contacter', items: [
        ['Téléphone', '<a href="tel:+33467100679">04 67 10 06 79</a>'],
        ['E-mail', '<a href="mailto:administration@unisons.fr">administration@unisons.fr</a>'],
        ['Réservations', '<a href="tel:+33499770017">04 99 77 00 17</a>'],
        ['Galerie', 'Du lundi au vendredi, de 14h30 à 18h00 pendant l’exposition en cours. Entrée libre.'],
      ], },
      { t: 'cards', label: 'À lire aussi', items: [
        { title: 'Agenda', text: 'Les prochains rendez-vous.', href: '/agenda', img: wkHiphop },
        { title: 'Téléchargements', text: 'Rapport d’activité et logos.', href: '/infos-pratiques/telechargements', img: cardLogos },
        { title: 'Contact', text: 'Écrire à l’association.', href: '/contact', img: galerieLieu },
      ] },
    ],
  },
  '/infos-pratiques/telechargements': {
    label: 'Infos pratiques', title: 'Téléchargements', sub: 'Rapport d’activité et logos',
    seo: { title: 'Téléchargements | Rapport d’activité et logos UNi’SONS', description: 'Téléchargez le rapport d’activité d’UNi’SONS et les logos de l’association (SVG et PNG) à l’usage des partenaires et de la presse.' },
    blocks: [
      { t: 'downloads', label: 'Association', title: 'Rapport d’activité', items: [
        { title: 'Rapport d’activité', desc: 'Le bilan des actions de l’association (document hébergé sur Google Drive).', href: 'https://drive.google.com/file/d/1wtCG2lm6CPK3Pue341ugTY7bM_Ktkj6L/view?usp=sharing', meta: 'PDF, Google Drive', external: true },
      ] },
      { t: 'downloads', label: 'Presse et partenaires', title: 'Logos UNi’SONS', items: [
        { title: 'Kit de logos complet', desc: 'Version couleur, version pour fonds sombres et version noire, en SVG et en PNG.', href: '/telechargements/logos-unisons.zip', meta: 'ZIP, 65 Ko' },
        { title: 'Logo couleur', desc: 'À utiliser sur fond clair.', href: '/telechargements/unisons-couleur.svg', meta: 'SVG, 4 Ko' },
        { title: 'Logo pour fonds sombres', desc: '« UNi » en or, « SONS » en blanc.', href: '/telechargements/unisons-fond-sombre.svg', meta: 'SVG, 4 Ko' },
        { title: 'Logo noir', desc: 'Version monochrome.', href: '/telechargements/unisons-noir.svg', meta: 'SVG, 4 Ko' },
      ] },
      { t: 'text', label: 'Usage', paras: ['Merci de ne pas déformer ni recolorer les logos. Pour un autre format ou une demande de visuels, écrivez à <a href="mailto:administration@unisons.fr">administration@unisons.fr</a>.'] },
    ],
  },

  // ---------------------------------------------------------------- Pages légales
  '/mentions-legales': {
    label: 'Informations légales', title: 'Mentions légales',
    seo: { title: 'Mentions légales | UNi’SONS', description: 'Éditeur, coordonnées, forme juridique, licences d’entrepreneur de spectacles et protection des données de l’association UNi’SONS, Montpellier.' },
    blocks: [
      { t: 'facts', label: 'Éditeur', items: [
        ['Éditeur', 'Association UNi’SONS'],
        ['Adresse', '475 avenue du Comté de Nice, 34080 Montpellier'],
        ['Contact', '04 67 10 06 79 / <a href="mailto:administration@unisons.fr">administration@unisons.fr</a>'],
        ['Réservations', '04 99 77 00 17'],
        ['Forme juridique', 'Association loi 1901'],
        ['Présidente', 'Fadelha Benammar-Koly'],
        ['Direction', 'Habib Dechraoui'],
        ['SIRET', '411 968 647 000 49'],
        ['Licences d’entrepreneur de spectacles', 'n° 2-1033722 et n° 3-1033723'],
        ['Hébergement', 'À compléter selon l’hébergeur retenu pour le nouveau site.'],
        ['Photographies', 'Luc Jennepin, EsterPics, 2L, Hoo, Grizz Visuals et autres photographes (liste à compléter et à valider avec eux).'],
      ] },
      { t: 'text', label: 'Propriété intellectuelle', paras: ['En application de la loi du 11 mars 1957 (art. 41) et du code de la propriété intellectuelle du 1er juillet 1992, toute reproduction partielle ou totale à usage collectif est interdite sans autorisation de l’association UNi’SONS.',
        'Les logos, visuels et marques présents sur ce site sont la propriété de leur détenteur respectif.',
        'Ce site peut, à l’insu de l’association, avoir été relié à d’autres sites par des liens hypertextes. UNi’SONS décline toute responsabilité pour les informations présentées sur ces autres sites. L’internaute reconnaît que l’utilisation du site d’UNi’SONS est régie par le droit français.',
      ] },
      { t: 'text', label: 'Données personnelles', paras: [
        'Les données personnelles recueillies sur le site proviennent de la communication volontaire d’une adresse e-mail (formulaire de contact, newsletter). UNi’SONS les conserve de manière confidentielle et ne les cède pas. Elles ne servent qu’à transmettre les informations demandées.',
        'Vous disposez d’un droit d’accès, de modification, de rectification et de suppression des données qui vous concernent (loi « Informatique et libertés » n° 78-17 du 6 janvier 1978 modifiée, et RGPD). Vous pouvez l’exercer à l’adresse <a href="mailto:rgpd@unisons.fr">rgpd@unisons.fr</a>. Voir aussi la <a href="/politique-de-confidentialite">politique de confidentialité</a>.',
        'La page Infos pratiques propose une carte Google Maps, chargée seulement si vous acceptez les contenus externes dans la boîte de dialogue d’arrivée (ou avec le bouton « Afficher la carte ») : Google reçoit alors votre adresse IP et peut déposer des cookies. Les vidéos YouTube se lisent sur la page seulement après votre accord et votre clic ; sinon elles s’ouvrent sur YouTube. Le détail figure dans la <a href="/politique-de-confidentialite">politique de confidentialité</a>.',
      ] },
    ],
  },
  '/politique-de-confidentialite': {
    label: 'Informations légales', title: 'Politique de confidentialité',
    seo: { title: 'Politique de confidentialité | UNi’SONS', description: 'Comment le site d’UNi’SONS traite vos données : newsletter, formulaire de contact, mesure d’audience, vidéos YouTube, carte Google Maps, choix sur les cookies.' },
    blocks: [
      { t: 'text', label: 'Version provisoire', paras: [], note: 'Ce texte décrit le fonctionnement actuel du site. Il doit être relu et validé par l’association avant la mise en ligne.' },
      { t: 'text', label: 'Responsable', title: 'Qui traite vos données ?', paras: ['L’association UNi’SONS, 475 avenue du Comté de Nice, 34080 Montpellier. Contact : <a href="mailto:rgpd@unisons.fr">rgpd@unisons.fr</a>.'] },
      { t: 'text', label: 'Ce que nous collectons', title: 'Quelles données, pour quoi faire ?', items: [
        '<strong>Newsletter :</strong> votre adresse e-mail et votre consentement, pour vous envoyer les informations d’UNi’SONS. L’envoi est assuré par Brevo. Vous pouvez vous désinscrire à tout moment depuis chaque message.',
        '<strong>Formulaire de contact :</strong> votre nom, votre adresse e-mail et votre message, pour vous répondre.',
      ], after: ['Les adresses collectées ne sont ni vendues ni cédées.'] },
      { t: 'text', label: 'Cookies et services tiers', title: 'Ce que le site charge chez d’autres', items: [
        '<strong>Vidéos YouTube :</strong> elles ne se lisent sur la page que si vous avez accepté les contenus externes et cliqué, via le mode sans cookies de YouTube (youtube-nocookie.com) ; sinon elles s’ouvrent sur YouTube.',
        '<strong>Carte Google Maps :</strong> la page Infos pratiques propose une carte Google Maps. Elle ne se charge qu’avec votre accord (boîte de dialogue affichée à votre première visite, ou bouton « Afficher la carte ») ; Google reçoit alors votre adresse IP et peut déposer des cookies. Votre choix est mémorisé 6 mois dans votre navigateur et modifiable avec « Gérer les contenus externes » en bas de page. Vous pouvez aussi ouvrir l’itinéraire directement dans Google Maps.',
        '<strong>Mesure d’audience (Google Analytics) :</strong> si vous l’acceptez dans la boîte de dialogue, le site utilise Google Analytics 4 pour compter les visites et les pages consultées. Google reçoit alors votre adresse IP (anonymisée) et dépose des cookies (_ga). Les signaux publicitaires sont désactivés. Sans votre accord, aucun script Google n’est chargé. Les données sont conservées 14 mois au plus (réglage à vérifier dans le compte Google Analytics).',
        '<strong>Vos choix :</strong> la boîte de dialogue s’affiche à votre première visite. Votre choix est mémorisé 6 mois dans votre navigateur (aucun serveur ne le reçoit) et vous pouvez le modifier à tout moment avec « Gérer les cookies » en bas de page. Si vous retirez votre accord, les cookies de mesure sont effacés.',
        '<strong>Newsletter :</strong> le formulaire ne dépose aucun cookie. Votre adresse e-mail n’est transmise à Brevo qu’au moment où vous validez le formulaire, avec votre case de consentement.',
        '<strong>Publicité :</strong> le site n’en utilise pas et ne dépose aucun cookie publicitaire.',
      ] },
      { t: 'text', label: 'Vos droits', title: 'Accéder, rectifier, supprimer', paras: ['Vous pouvez demander l’accès, la rectification ou la suppression de vos données, ou vous opposer à leur traitement, en écrivant à <a href="mailto:rgpd@unisons.fr">rgpd@unisons.fr</a>. Vous pouvez aussi saisir la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener">cnil.fr<span class="visually-hidden"> (nouvel onglet)</span></a>).'] },
    ],
  },
};

// ---- Remplacements par le contenu Sanity (sans SANITY_PROJECT_ID, ou contenu non publiable : rien ne change).
// Les entrées ci-dessus gardent leur clé ; seuls sub, seo et blocks de ces trois pages sont remplacés.
if (librairie && librairieLive) {
  const p = pages['/l-art-est-public/librairie'];
  p.noindex = false;
  p.sub = 'Sélection et infos pratiques';
  p.seo = { title: p.seo.title, description: 'La librairie de L’art est public à Montpellier : présentation, sélection et informations pratiques, aux Hauts de Massane.' };
  p.blocks = librairieBlocks(librairie);
}
if (podcast && podcastLive) {
  const p = pages['/l-art-est-public/podcast'];
  p.noindex = false;
  p.label = 'Podcast';
  p.sub = 'Épisodes et liens d’écoute';
  p.seo = { title: p.seo.title, description: 'Le podcast de L’art est public à Montpellier : épisodes en vidéo, invités et liens d’écoute, par l’association UNi’SONS.' };
  p.blocks = podcastBlocks(podcast, episodes);
}
if (downloadGroups.length > 0) {
  const p = pages['/infos-pratiques/telechargements'];
  const usage = p.blocks[p.blocks.length - 1]; // « Usage » : texte local, avec son lien mailto
  p.blocks = [...downloadBlocks(downloadGroups), usage];
}

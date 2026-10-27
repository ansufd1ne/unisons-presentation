export const site = {
  name: 'UNi’SONS',
  url: 'https://www.unisons.fr',
  org: 'UNi’SONS',
  tagline: 'L’école du son',
  address: ['475 Avenue du Comté de Nice', '34080 Montpellier'],
  phone: '04 67 10 06 79',
  festival: 'https://arabesques-presentation.vercel.app',
};

export interface NavItem { label: string; href: string; external?: boolean; bar?: boolean; children?: NavItem[]; }

// Plan de site cible (31 entrées du plan fourni + 2 pages conservées de l’ancien site).
// « Arabesques » renvoie directement vers le site du festival : aucune page interne.
export const nav: NavItem[] = [
  { label: 'Agenda', href: '/agenda', bar: true },
  { label: 'Arabesques', href: site.festival + '/', external: true, bar: true },
  { label: 'Kosmik Hip-Hop', href: '/kosmik-hip-hop', bar: true, children: [
    { label: 'Agenda Kosmik Club', href: '/agenda/kosmik-club' },
    { label: 'Atelier Hip Hop', href: '/kosmik-hip-hop/atelier-hip-hop' },
    { label: 'Accompagnement artistique', href: '/kosmik-hip-hop/accompagnement-artistique' },
  ] },
  { label: 'L’art est public', href: '/l-art-est-public', bar: true, children: [
    { label: 'Agenda', href: '/agenda/l-art-est-public' },
    { label: 'Le lieu', href: '/l-art-est-public/le-lieu' },
    { label: 'Galerie', href: '/l-art-est-public/galerie' },
    { label: 'Librairie', href: '/l-art-est-public/librairie' },
    { label: 'Uni’Jeunes Social School', href: '/l-art-est-public/uni-jeunes-social-school' },
    { label: 'Podcast', href: '/l-art-est-public/podcast' },
    { label: 'Rétrospectives', href: '/l-art-est-public/retrospectives' },
  ] },
  { label: 'Éducation artistique', href: '/education-artistique', children: [
    { label: 'Renc’Art', href: '/education-artistique/renc-art' },
    { label: 'Jeunesses en Arabesque', href: '/education-artistique/jeunesses-en-arabesque' },
    { label: 'Les Coulisses Solidaires', href: '/education-artistique/coulisses-solidaires' },
    { label: 'Programme de réussite éducative', href: '/education-artistique/programme-de-reussite-educative' },
  ] },
  { label: 'L’association', href: '/l-association', children: [
    { label: 'L’histoire', href: '/l-association/histoire' },
    { label: 'L’équipe', href: '/l-association/equipe' },
    { label: 'Accompagnement des musiciens', href: '/l-association/accompagnement-des-musiciens' },
  ] },
  { label: 'Infos pratiques', href: '/infos-pratiques', children: [
    { label: 'Téléchargements', href: '/infos-pratiques/telechargements' },
  ] },
];

// Pages hors menu (pied de page)
export const legal: NavItem[] = [
  { label: 'Contact', href: '/contact' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
];

export const social = [
  { label: 'Facebook', href: 'https://www.facebook.com/unisonsfr/' },
  { label: 'YouTube', href: 'https://www.youtube.com/user/unisons34' },
  { label: 'SoundCloud', href: 'https://soundcloud.com/unisons-music' },
  { label: 'Instagram', href: 'https://www.instagram.com/unisons_music/' },
];

// Libellés des fils d’Ariane, déduits de l’arborescence (reconstruits par setRubriqueChildren)
const labels = new Map<string, string>();
// Libellés d’origine (code) : une page retirée d’une rubrique par Sanity garde son nom dans son fil d’Ariane
const baseLabels = new Map<string, string>();
const collect = (into: Map<string, string>) => {
  const walk = (items: NavItem[]) => items.forEach((i) => { if (!i.external) into.set(i.href, i.label); if (i.children) walk(i.children); });
  walk(nav); walk(legal);
  into.set('/agenda/kosmik-club', 'Agenda Kosmik Club');
};
collect(baseLabels);
const rebuildLabels = () => { labels.clear(); baseLabels.forEach((v, k) => labels.set(k, v)); collect(labels); };
rebuildLabels();
/** Remplace en place les enfants d’une rubrique (menu, pied de page, section « Dans la rubrique », fils d’Ariane).
 *  Appelée une seule fois par build, par src/data/nav-cms.ts, avant tout rendu. Retourne false si la rubrique n’existe pas. */
export const setRubriqueChildren = (href: string, children: NavItem[]): boolean => {
  const top = nav.find((n) => n.href === href && n.children);
  if (!top || !children.length) return false;
  top.children = children.map((c) => ({ label: c.label, href: c.href }));
  rebuildLabels();
  return true;
};
export const labelFor = (path: string) => labels.get(path);
export const parentOf = (path: string): string | undefined => {
  for (const top of nav) for (const c of top.children ?? []) if (c.href === path) return top.href;
};

// Pages réellement construites (phase par phase). Les autres adresses du plan de site affichent une page d'attente
// (noindex, hors sitemap) générée par src/pages/[...slug].astro. Ajouter ici chaque nouvelle page terminée.
export const builtPaths: string[] = [
  '/', '/agenda', '/agenda/kosmik-club', '/agenda/l-art-est-public', '/l-art-est-public/galerie', '/l-art-est-public/retrospectives',
  '/kosmik-hip-hop', '/kosmik-hip-hop/atelier-hip-hop', '/kosmik-hip-hop/accompagnement-artistique',
  '/l-art-est-public', '/l-art-est-public/le-lieu', '/l-art-est-public/librairie', '/l-art-est-public/uni-jeunes-social-school', '/l-art-est-public/podcast',
  '/education-artistique', '/education-artistique/renc-art', '/education-artistique/jeunesses-en-arabesque', '/education-artistique/coulisses-solidaires', '/education-artistique/programme-de-reussite-educative',
  '/l-association', '/l-association/histoire', '/l-association/equipe', '/l-association/accompagnement-des-musiciens',
  '/infos-pratiques', '/infos-pratiques/telechargements', '/contact', '/mentions-legales', '/politique-de-confidentialite',
];
export const plannedPaths = (): string[] => {
  const out: string[] = [];
  const walk = (items: NavItem[]) => items.forEach((i) => { if (!i.external) out.push(i.href); if (i.children) walk(i.children); });
  walk(nav); walk(legal);
  return [...new Set(out)].filter((p) => !builtPaths.includes(p));
};

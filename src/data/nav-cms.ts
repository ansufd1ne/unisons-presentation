import { nav, builtPaths, setRubriqueChildren } from './site';
import { loadCms, mapRubriques, warn } from '../lib/cms';

// Rubriques du menu éditées dans Sanity (document `rubrique`) : remplace en place les enfants de `nav`
// (src/data/site.ts) AVANT tout rendu. Importé en tête de src/layouts/Base.astro, donc évalué avant Navbar, Footer
// et les pages : menu, pied de page, section « Dans la rubrique » et fils d'Ariane lisent la même liste.
// Sans SANITY_PROJECT_ID, ou pour une rubrique absente/invalide dans Sanity, les enfants du code sont conservés.
// (site.ts reste sans import de cms.ts : astro.config.mjs l'importe en contexte Node.)
const cms = await loadCms();
if (cms) {
  const keys = nav.filter((n) => n.children).map((n) => n.href.slice(1));
  const rubriques = mapRubriques(cms.rubriques, { warn, builtPaths, keys });
  for (const [cle, items] of Object.entries(rubriques)) setRubriqueChildren('/' + cle, items);
}
export {};

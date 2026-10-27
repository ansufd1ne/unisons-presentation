// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import redirects from './redirects.json' with { type: 'json' };
import { builtPaths, site as siteData } from './src/data/site.ts';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { frTypo } from './scripts/fr-typo.mjs'; // espaces insécables (typographie française) dans le HTML construit

// Retire du sitemap les pages construites avec <meta name="robots" content="noindex">
// (pages en préparation, politique de confidentialité provisoire...) : elles repassent seules dans le sitemap
// dès que leur contenu est publié et que le noindex disparaît.
const sitemapSansNoindex = () => ({
  name: 'sitemap-sans-noindex',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      for (const f of fs.readdirSync(root).filter((n) => /^sitemap-\d+\.xml$/.test(n))) {
        const xml = fs.readFileSync(root + f, 'utf8');
        const out = xml.replace(/<url>[\s\S]*?<\/url>/g, (bloc) => {
          const loc = /<loc>([^<]+)<\/loc>/.exec(bloc)?.[1];
          if (!loc) return bloc;
          const chemin = new URL(loc).pathname.replace(/\/$/, '').slice(1) || 'index';
          const page = [root + chemin + '.html', root + chemin + '/index.html'].find((c) => fs.existsSync(c));
          return page && /<meta[^>]+name="robots"[^>]+noindex/i.test(fs.readFileSync(page, 'utf8')) ? '' : bloc;
        });
        if (out !== xml) fs.writeFileSync(root + f, out);
      }
    },
  },
});

// Les redirections 301 réelles sont dans vercel.json (généré par `npm run redirects`).
// Astro génère en plus des pages de repli (meta refresh) pour les hébergeurs statiques.
export default defineConfig({
  site: 'https://www.unisons.fr',
  trailingSlash: 'ignore',
  // Une page = un fichier .html : Cloudflare Pages la sert sans barre finale, sans redirection 308 en plus du 301
  build: { format: 'file' },
  redirects,
  // Images de Sanity (agenda, équipe) : téléchargées et optimisées au build
  image: { domains: ['cdn.sanity.io'] },
  // Le sitemap ne liste que les pages terminées (voir builtPaths dans src/data/site.ts), plus les pages générées
  // depuis Sanity : fiches de l'agenda et épisodes du podcast (absents du build tant que le podcast n'est pas publié)
  integrations: [sitemap({ serialize: (item) => ({ ...item, url: item.url.replace(/(.)\/$/, '$1') }), filter: (page) => { const p = new URL(page).pathname.replace(/\/$/, '') || '/'; return builtPaths.includes(p) || p.startsWith('/agenda/') || p.startsWith('/l-art-est-public/podcast/'); } }), sitemapSansNoindex(), frTypo()],
});

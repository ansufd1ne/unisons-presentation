// Génère, à partir de redirects.json, les redirections 301 et les en-têtes de sécurité pour l'hébergeur :
//   - vercel.json            (Vercel)
//   - public/_redirects      (Cloudflare Pages et Netlify)
//   - public/_headers        (Cloudflare Pages et Netlify)
// Lancé par `npm run build` avant `astro build`.
import fs from 'node:fs';

const map = JSON.parse(fs.readFileSync('redirects.json', 'utf8'));
const pairs = Object.entries(map);

// ---- Redirections : avec et sans barre finale
const redirectLines = pairs.flatMap(([from, to]) => [`${from} ${to} 301`, `${from}/ ${to} 301`]);
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/_redirects', '# Généré par scripts-redirects.mjs depuis redirects.json : ne pas modifier à la main.\n' + redirectLines.join('\n') + '\n');

// ---- Politique de sécurité (CSP) : seules les sources connues sont autorisées, ce qui bloque aussi tout script
// ou iframe étranger injecté dans une page. Les points d'envoi des formulaires viennent des variables PUBLIC_*.
const origin = (u) => { try { return u ? new URL(u).origin : ''; } catch { return ''; } };
const formOrigins = [process.env.PUBLIC_CONTACT_ENDPOINT, process.env.PUBLIC_NEWSLETTER_ENDPOINT, 'https://af694aaf.sibforms.com'].map(origin).filter(Boolean);
const uniq = (a) => [...new Set(a)];
// Google Analytics : autorisé dans la CSP seulement si un identifiant de mesure est fourni au build.
const ga = /^G-[A-Z0-9]{4,}$/.test((process.env.PUBLIC_GA_ID || '').trim());
const gaScript = ga ? ['https://www.googletagmanager.com'] : [];
const gaConnect = ga ? ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com'] : [];
const gaImg = ga ? ['https://www.googletagmanager.com', 'https://*.google-analytics.com'] : [];
const csp = [
  "default-src 'self'",
  `script-src ${["'self'", "'unsafe-inline'", ...gaScript].join(' ')}`,   // Astro place de petits scripts en ligne
  "style-src 'self' 'unsafe-inline'",
  `img-src ${["'self'", 'data:', ...gaImg].join(' ')}`,
  "font-src 'self' data:",   // Astro peut intégrer de petites polices dans le CSS (data:)
  `frame-src ${uniq(["https://www.youtube-nocookie.com", "https://www.google.com"]).join(' ')}`,
  `connect-src ${uniq(["'self'", ...formOrigins, ...gaConnect]).join(' ')}`,
  `form-action ${uniq(["'self'", ...formOrigins]).join(' ')}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': csp,
};
const immutable = 'public, max-age=31536000, immutable';

fs.writeFileSync('public/_headers',
  '# Généré par scripts-redirects.mjs : ne pas modifier à la main.\n/*\n' +
  Object.entries(securityHeaders).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
  `\n/_astro/*\n  Cache-Control: ${immutable}\n`);

// ---- Vercel (conservé pour pouvoir changer d'hébergeur)
const config = {
  cleanUrls: true,
  trailingSlash: false,
  redirects: pairs.flatMap(([source, destination]) => [
    { source, destination, permanent: true },
    { source: source + '/', destination, permanent: true },
  ]),
  headers: [
    { source: '/(.*)', headers: Object.entries(securityHeaders).map(([key, value]) => ({ key, value })) },
    { source: '/_astro/(.*)', headers: [{ key: 'Cache-Control', value: immutable }] },
  ],
};
fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
console.log(`redirections : ${pairs.length} (vercel.json, public/_redirects), en-têtes : public/_headers, CSP form-action/connect-src : ${formOrigins.join(', ') || 'aucune origine externe'}`);

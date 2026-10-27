// Test du mapping Sanity -> site, sans compte Sanity : `node scripts/test-cms-mapping.mjs`
import assert from 'node:assert/strict';
import {
  mapEvents, mapTeam, safeJsonLd, isValidEmail, picProps, widthsFor, absUrl,
  mapExpositions, classifyExpositions, toPastExpo, mapLibrairie, mapPodcast, mapEpisodes, mapDownloads, formatSize,
  listenUrl, fileUrl, shorten, librairieBlocks, podcastBlocks, downloadBlocks, PAST_PENDING, mapRubriques,
  youtubeId, youtubeEmbedUrl, youtubeWatchUrl, isoDuration, episodeTitle, episodePath, episodeDescription, otherEpisodes, fullDate,
} from '../src/lib/cms-mapping.ts';

const cdn = (n, w = 2000, h = 1000, alt) => ({ src: `https://cdn.sanity.io/images/abc123/production/${n}-${w}x${h}.jpg`, width: w, height: h, ...(alt !== undefined ? { alt } : {}) });
const pending = ['Texte provisoire.'];
const warnings = [];
const warn = (m) => warnings.push(m);

const rawEvents = [
  { slug: 'concert-a', title: 'Concert A', date: '2026-11-05', pole: 'l-art-est-public', venue: 'Montpellier', free: false, summary: 'Résumé A', body: '', provisional: true, image: cdn('a', 2000, 1000, 'Alt A') },
  { slug: 'expo-b', title: 'Expo B', date: '2026-12-03', endDate: '2027-05-03', pole: 'l-art-est-public', venue: 'Galerie', address: '475 avenue du Comté de Nice', free: true, summary: 'Résumé B', body: 'Premier paragraphe.\n\nSecond paragraphe\nsur deux lignes.\r\n\r\nTroisième.', practical: [{ label: 'Horaires', value: '14h' }, { label: '', value: 'vide' }, { label: 'Entrée', value: 'Libre' }], provisional: false, image: cdn('b'), heroImage: cdn('bh', 3000, 1500, 'Alt hero B') },
  { slug: 'masque-c', title: 'Masqué', date: '2026-11-10', pole: 'kosmik-club', venue: 'x', summary: 'x', body: 'x', provisional: false, hidden: true, image: cdn('c') },
  { slug: 'Mauvais Slug!', title: 'Slug invalide', date: '2026-11-11', pole: 'kosmik-club', venue: 'x', summary: 'x', body: 'x', provisional: false, image: cdn('d') },
  { slug: 'injection-e', title: 'Titre <script>alert(1)</script>', date: '2026-11-12', pole: 'kosmik-club', venue: '<b>Salle</b>', summary: 'Voir <a href="https://casino.example">casino</a>', body: '<a href="https://casino.example/x">gagner</a>\n\n<script>evil()</script></script><img src=x onerror=1>', practical: [{ label: '<i>L</i>', value: '<a href="//evil">V</a>' }], provisional: false, image: cdn('e') },
  { slug: 'date-ko', title: 'Date KO', date: '2026-02-31', pole: 'kosmik-club', venue: 'x', summary: 'x', body: 'x', provisional: false, image: cdn('f') },
  { slug: 'pole-ko', title: 'Pôle KO', date: '2026-11-13', pole: 'autre', venue: 'x', summary: 'x', body: 'x', provisional: false, image: cdn('g') },
  { slug: 'image-ko', title: 'Image KO', date: '2026-11-14', pole: 'kosmik-club', venue: 'x', summary: 'x', body: 'x', provisional: false, image: { src: 'https://evil.example/a.jpg', width: 10, height: 10 } },
  { slug: 'concert-a', title: 'Doublon', date: '2026-11-15', pole: 'kosmik-club', venue: 'x', summary: 'x', body: 'x', provisional: false, image: cdn('h') },
  { slug: 'fin-ko', title: 'Fin KO', date: '2026-11-20', endDate: '2026-11-01', pole: 'kosmik-club', venue: 'x', summary: 'x', body: 'x', provisional: false, image: cdn('i') },
  { slug: 'long-j', title: 'T'.repeat(500), date: '2026-11-21', pole: 'kosmik-club', venue: 'x', summary: 'S'.repeat(5000), body: 'P'.repeat(9000), provisional: false, image: cdn('j') },
];
const ev = mapEvents(rawEvents, { pending, warn });
const bySlug = Object.fromEntries(ev.map((e) => [e.slug, e]));

// exclusion : masqué, slug invalide, date invalide, pôle inconnu, image hors CDN, doublon
assert.deepEqual(ev.map((e) => e.slug).sort(), ['concert-a', 'expo-b', 'fin-ko', 'injection-e', 'long-j']);
assert.ok(warnings.some((w) => /slug invalide/.test(w)), 'avertissement slug');
assert.ok(warnings.some((w) => /date invalide/.test(w)));
assert.ok(warnings.some((w) => /pôle inconnu/.test(w)));
assert.ok(warnings.some((w) => /image absente ou invalide/.test(w)));
assert.ok(warnings.some((w) => /en double/.test(w)));
assert.ok(!warnings.some((w) => /Masqué/.test(w)), 'un masqué n’est pas une erreur');
// tri par date
assert.deepEqual(ev.map((e) => e.date), [...ev.map((e) => e.date)].sort());
// repli : provisoire sans texte => texte provisoire ; alt manquant => titre ; hero absent => image
assert.deepEqual(bySlug['concert-a'].body, pending);
assert.equal(bySlug['concert-a'].alt, 'Alt A');
assert.equal(bySlug['concert-a'].hero, bySlug['concert-a'].image);
assert.equal(bySlug['expo-b'].alt, 'Expo B');
assert.equal(bySlug['expo-b'].heroAlt, 'Alt hero B');
assert.equal(bySlug['expo-b'].hero.width, 3000);
// corps en paragraphes, infos pratiques en paires, items vides retirés
assert.deepEqual(bySlug['expo-b'].body, ['Premier paragraphe.', 'Second paragraphe sur deux lignes.', 'Troisième.']);
assert.deepEqual(bySlug['expo-b'].practical, [['Horaires', '14h'], ['Entrée', 'Libre']]);
assert.equal(bySlug['expo-b'].endDate, '2027-05-03');
assert.equal(bySlug['fin-ko'].endDate, undefined, 'fin antérieure ignorée');
assert.equal(bySlug['expo-b'].free, true);
// le texte hostile reste du texte (aucune transformation en HTML, aucun lien créé)
const inj = bySlug['injection-e'];
assert.equal(inj.title, 'Titre <script>alert(1)</script>');
assert.equal(inj.summary, 'Voir <a href="https://casino.example">casino</a>');
assert.equal(inj.body[1], '<script>evil()</script></script><img src=x onerror=1>');
assert.equal(typeof inj.image.src, 'string');
// longueurs bornées
assert.equal(bySlug['long-j'].title.length, 120);
assert.equal(bySlug['long-j'].summary.length, 400);
assert.equal(bySlug['long-j'].body[0].length, 3000);
// JSON-LD : `<` échappé, JSON toujours valide et identique une fois relu
const ld = safeJsonLd({ name: inj.title, description: inj.body[1] });
assert.ok(!ld.includes('<'), 'aucun < dans le JSON-LD');
assert.equal(JSON.parse(ld).name, inj.title);
// images distantes : picProps / widthsFor / absUrl
assert.deepEqual(picProps(bySlug['expo-b'].image), { src: bySlug['expo-b'].image.src, width: 2000, height: 1000, fallbackFormat: 'jpg' });
assert.deepEqual(widthsFor(bySlug['concert-a'].image, [640, 1080, 1320, 1800, 2400]), [640, 1080, 1320, 1800]);
assert.equal(absUrl('https://www.unisons.fr', bySlug['concert-a'].image), bySlug['concert-a'].image.src);
const local = { src: '/_astro/x.jpg', width: 100, height: 100, format: 'jpg' };
assert.deepEqual(picProps(local), { src: local });
assert.deepEqual(widthsFor(local, [240, 480]), [240, 480]);
assert.equal(absUrl('https://www.unisons.fr', local), 'https://www.unisons.fr/_astro/x.jpg');

// ---- équipe
const tw = [];
const rawTeam = [
  { name: 'Zoé Dernière', role: 'Médiatrice', groupe: 'Médiation culturelle et sociale', order: 2, email: 'z@unisons.fr', photo: cdn('z', 800, 800) },
  { name: 'Anna Première', role: 'Présidente', groupe: 'Présidence et direction', order: 1, email: 'anna@unisons.fr' },
  { name: 'Bob Sans Photo', role: 'Directeur', groupe: 'Présidence et direction', order: 1, email: 'bob@unisons.fr' },
  { name: 'Cléo Masquée', role: 'x', groupe: 'Communication', order: 1, hidden: true },
  { name: 'Dan Mail Faux', role: 'Alternant', groupe: 'Administration', order: 1, email: 'pas un mail' },
  { name: 'Eve <script>x()</script>', role: '<a href="https://casino.example">Casino</a>', groupe: 'Administration', order: 2, email: 'eve@unisons.fr"><script>' },
  { name: 'Fred Groupe Inconnu', role: 'x', groupe: 'Autre', order: 1 },
  { name: 'Gil Premier', role: 'Hip-hop', groupe: 'Ateliers hip-hop', order: 0, photo: { src: 'http://cdn.sanity.io/images/x/y/z.jpg', width: 1, height: 1 } },
  { name: 'Hana Ordre', role: 'Directrice', groupe: 'Présidence et direction', order: 0 },
];
const team = mapTeam(rawTeam, { warn: (m) => tw.push(m) });
assert.deepEqual(team.map((g) => g.title), ['Présidence et direction', 'Administration', 'Médiation culturelle et sociale', 'Ateliers hip-hop'], 'ordre fixe des groupes, groupes vides omis');
assert.deepEqual(team[0].people.map((p) => p.name), ['Hana Ordre', 'Anna Première', 'Bob Sans Photo'], 'tri par order puis nom');
assert.equal(team[0].people[2].img, undefined, 'membre sans photo => pas d’image (initiale affichée)');
assert.ok(team[2].people[0].img && team[2].people[0].img.width === 800);
const adm = team[1].people;
assert.equal(adm[0].email, undefined, 'e-mail invalide ignoré');
assert.equal(adm[1].email, undefined, 'e-mail avec injection ignoré');
assert.equal(adm[1].name, 'Eve <script>x()</script>');
assert.equal(adm[1].role, '<a href="https://casino.example">Casino</a>');
assert.equal(team[3].people[0].img, undefined, 'photo hors CDN https ignorée');
assert.ok(!team.flatMap((g) => g.people).some((p) => /Cléo|Fred/.test(p.name)), 'masqué et groupe inconnu exclus');
assert.ok(tw.some((w) => /groupe inconnu/.test(w)) && tw.filter((w) => /e-mail invalide/.test(w)).length === 2);
for (const ok of ['a@b.fr', 'f.benammar@unisons.fr', 'x+y@sub.domain.org']) assert.ok(isValidEmail(ok), ok);
for (const ko of ['', 'a@b', 'a b@c.fr', 'a@b.fr<x>', '"a"@b.fr', 'javascript:alert(1)', 'a@b.fr,c@d.fr', 12]) assert.ok(!isValidEmail(ko), String(ko));


// ---- expositions : classement à la date du build (simulée), exclusions, textes hostiles
const ew = [];
const projectId = 'abc123xyz';
const rawExpos = [
  { slug: 'en-cours', title: 'En cours', artist: 'Artiste A, plasticien', start: '2026-10-01', end: '2026-12-31', vernissage: '2026-10-01', summary: 'Résumé', about: 'P1\n\nP2', artistText: 'Texte artiste', author: 'Auteur', poster: cdn('p', 800, 600, 'Affiche'), images: [cdn('i1', 2000, 1000, 'Image 1'), cdn('i2'), { src: 'https://evil.example/x.jpg', width: 5, height: 5 }] },
  { slug: 'a-venir', title: 'À venir proche', start: '2027-01-10', end: '2027-03-01' },
  { slug: 'a-venir-lointain', title: 'À venir lointain', start: '2027-09-01', end: '2027-10-01' },
  { slug: 'debut-seul-futur', title: 'Début seul futur', start: '2027-02-01' },
  { slug: 'passee-recente', title: 'Passée récente', start: '2026-03-01', end: '2026-06-30', year: '2026', summary: 'Texte passé', images: [cdn('r1'), cdn('r2')] },
  { slug: 'passee-ancienne', title: 'Zéro ancienne', start: '2024-03-01', end: '2024-06-30' },
  { slug: 'passee-ancienne-b', title: 'Alpha ancienne', start: '2024-02-01', end: '2024-06-30', poster: cdn('q') },
  { slug: 'sans-dates', title: 'Sans dates' },
  { slug: 'sans-dates-2', title: '<b>Balisée</b>', summary: '<a href="https://casino.example">jouer</a>', about: '<script>x()</script>' },
  { slug: 'debut-passe-sans-fin', title: 'Début passé sans fin', start: '2026-05-01' },
  { slug: 'fin-future-sans-debut', title: 'Fin future sans début', end: '2027-05-01' },
  { slug: 'masquee', title: 'Masquée', start: '2026-10-01', end: '2026-12-31', hidden: true },
  { slug: 'Slug Invalide', title: 'Slug KO' },
  { slug: 'en-cours', title: 'Doublon' },
  { slug: 'date-ko', title: 'Date KO', start: '2026-13-45' },
  { slug: 'fin-avant-debut', title: 'Fin avant début', start: '2026-12-01', end: '2026-11-01' },
];
const expos = mapExpositions(rawExpos, { warn: (m) => ew.push(m), projectId });
assert.ok(!expos.some((e) => ['masquee', 'Slug Invalide', 'date-ko', 'fin-avant-debut'].includes(e.slug)), 'masquée, slug, date, fin avant début exclus');
assert.equal(expos.filter((e) => e.slug === 'en-cours').length, 1, 'doublon exclu');
assert.ok(ew.some((w) => /slug invalide/.test(w)) && ew.some((w) => /en double/.test(w)) && ew.some((w) => /date de début ou de fin invalide/.test(w)) && ew.some((w) => /antérieure/.test(w)));
assert.ok(!ew.some((w) => /Masquée/.test(w)), 'une exposition masquée n’est pas une erreur');
assert.equal(expos.find((e) => e.slug === 'en-cours').images.length, 2, 'image hors CDN ignorée');
assert.ok(ew.some((w) => /image invalide/.test(w)));
assert.deepEqual(expos.find((e) => e.slug === 'en-cours').about, ['P1', 'P2']);
assert.equal(expos.find((e) => e.slug === 'passee-recente').year, '2026');
assert.equal(expos.find((e) => e.slug === 'passee-ancienne').year, '2024', 'année déduite de la fin');
assert.equal(expos.find((e) => e.slug === 'sans-dates').year, undefined);
const hostile = expos.find((e) => e.slug === 'sans-dates-2');
assert.equal(hostile.title, '<b>Balisée</b>');
assert.equal(hostile.summary, '<a href="https://casino.example">jouer</a>');

const cw = [];
const at = (d) => classifyExpositions(expos, new Date(d + 'T10:00:00'), (m) => cw.push(m));
let c = at('2026-10-15');
assert.equal(c.featured.slug, 'en-cours'); assert.equal(c.started, true);
assert.deepEqual(c.upcoming.map((e) => e.slug), ['a-venir', 'debut-seul-futur', 'a-venir-lointain']);
assert.equal(c.past.length, 5);
assert.deepEqual(c.past.slice(0, 3).map((e) => e.slug), ['passee-recente', 'passee-ancienne-b', 'passee-ancienne'], 'fin décroissante puis titre (Alpha avant Zéro)');
assert.deepEqual(c.past.slice(3).map((e) => e.slug), ['sans-dates-2', 'sans-dates'], 'sans date en dernier, par titre');
assert.ok(c.past.every((e) => !['a-venir', 'en-cours'].includes(e.slug)));
assert.ok(cw.some((w) => /Fin future sans début/.test(w)), 'dates incomplètes écartées avec avertissement');
// bornes : le dernier jour est encore « en cours », le lendemain non
assert.equal(at('2026-12-31').featured.slug, 'en-cours');
c = at('2027-01-01');
assert.equal(c.started, false); assert.equal(c.featured.slug, 'a-venir', 'plus rien en cours : la prochaine à venir');
assert.ok(c.past.some((e) => e.slug === 'en-cours'), 'l’exposition terminée passe en rétrospective');
assert.equal(at('2026-10-01').featured.slug, 'en-cours', 'premier jour');
assert.equal(at('2026-09-30').started, false, 'veille du début : à venir');
assert.equal(at('2026-09-30').featured.slug, 'en-cours');
c = at('2028-01-01');
assert.equal(c.featured, null, 'rien en cours ni à venir => état « aucune exposition en cours »');
assert.equal(classifyExpositions([], new Date()).featured, null);
// rétrospective : affiche ou première photo, texte provisoire par défaut, photos
const pe = toPastExpo(expos.find((e) => e.slug === 'passee-recente'));
assert.equal(pe.text, 'Texte passé'); assert.equal(pe.photos.length, 2); assert.equal(pe.image, pe.photos[0].src);
assert.equal(toPastExpo(expos.find((e) => e.slug === 'passee-ancienne')).text, PAST_PENDING);
assert.equal(toPastExpo(expos.find((e) => e.slug === 'passee-ancienne-b')).image.width, 2000);

// ---- liens et fichiers
for (const ok of ['https://open.spotify.com/show/abc', 'https://podcasts.apple.com/fr/podcast/x/id1', 'https://youtu.be/abc', 'https://www.deezer.com/show/1', 'https://castbox.fm/x']) assert.ok(listenUrl(ok), ok);
for (const ko of ['http://open.spotify.com/x', 'https://casino.example/spotify', 'https://open.spotify.com.evil.example/x', 'https://evil.example/?u=open.spotify.com', 'https://user:pw@open.spotify.com/x', 'https://open.spotify.com:8443/x', 'javascript:alert(1)', '//open.spotify.com/x', 'https://open.spotify.com/x y', ' https://open.spotify.com/x', 'https://open.spotify.com/\n', 'https://sub.open.spotify.com/x', 12, null]) assert.ok(!listenUrl(ko), String(ko));
const f = (u, e = ['pdf', 'zip']) => fileUrl(u, projectId, e);
assert.ok(f(`https://cdn.sanity.io/files/${projectId}/production/0123abcd.pdf`));
for (const ko of [`https://cdn.sanity.io/files/autreprojet/production/0123abcd.pdf`, `http://cdn.sanity.io/files/${projectId}/production/a.pdf`, `https://cdn.sanity.io.evil.example/files/${projectId}/production/a.pdf`, `https://evil.example/https://cdn.sanity.io/files/${projectId}/production/a.pdf`, `https://cdn.sanity.io/files/${projectId}/production/a.exe`, `https://cdn.sanity.io/files/${projectId}/production/a.pdf?x=1`, `https://cdn.sanity.io/images/${projectId}/production/a.pdf`, `https://cdn.sanity.io/files/${projectId}/production/a.pdf"onclick=1`, `https://cdn.sanity.io/files/${projectId}/production/a.html`, '']) assert.ok(!f(ko), ko);
assert.ok(!fileUrl(`https://cdn.sanity.io/files/${projectId}/production/a.pdf`, '', ['pdf']), 'sans identifiant de projet : tout refusé');
assert.ok(!fileUrl(`https://cdn.sanity.io/files/x/production/a.pdf`, '.*', ['pdf']), 'identifiant de projet invalide refusé');
assert.equal(formatSize(66560), '65 Ko'); assert.equal(formatSize(4096), '4 Ko'); assert.equal(formatSize(1258291), '1,2 Mo'); assert.equal(formatSize(900), '900 o'); assert.equal(formatSize(undefined), '');
assert.equal(shorten('court'), 'court'); assert.ok(shorten('mot '.repeat(80)).length <= 161 && shorten('mot '.repeat(80)).endsWith('…'));

// ---- téléchargements
const dw = [];
const furl = (n, e = 'pdf') => `https://cdn.sanity.io/files/${projectId}/production/${n}.${e}`;
const rawDl = [
  { title: 'Logos zip', description: 'Kit', category: 'Logos', order: 2, file: { url: furl('a1', 'zip'), size: 66560, extension: 'zip' } },
  { title: 'Logo SVG', category: 'Logos', order: 1, file: { url: furl('a2', 'svg'), size: 4096, extension: 'svg' }, year: '2026' },
  { title: 'Rapport 2025', category: 'Rapport d’activité', order: 1, file: { url: furl('b1'), size: 2500000, extension: 'pdf' } },
  { title: 'Dossier presse', category: 'Dossiers de presse', file: { url: furl('c1'), size: 100, extension: 'pdf' } },
  { title: 'Autre', category: 'Autres documents', order: 5, file: { url: furl('d1', 'png'), extension: 'png' } },
  { title: 'Autre A', category: 'Autres documents', order: 5, file: { url: furl('d2', 'jpg'), extension: 'jpg' } },
  { title: 'Exécutable', category: 'Logos', file: { url: furl('e1', 'exe'), extension: 'exe' } },
  { title: 'Script', category: 'Logos', file: { url: furl('e2', 'html'), extension: 'html' } },
  { title: 'Hors projet', category: 'Logos', file: { url: 'https://cdn.sanity.io/files/autre/production/x.pdf', extension: 'pdf' } },
  { title: 'Casino', category: 'Logos', file: { url: 'https://casino.example/x.pdf', extension: 'pdf' } },
  { title: 'Catégorie inconnue', category: 'Divers', file: { url: furl('f1'), extension: 'pdf' } },
  { title: 'Extension incohérente', category: 'Logos', file: { url: furl('g1'), extension: 'zip' } },
  { title: 'Doublon', category: 'Logos', file: { url: furl('a1', 'zip'), extension: 'zip' } },
  { title: 'Masqué', category: 'Logos', hidden: true, file: { url: furl('h1'), extension: 'pdf' } },
  { title: '<script>x()</script>', description: '<a href="https://casino.example">c</a>', category: 'Autres documents', order: 9, file: { url: furl('i1'), size: 2048, extension: 'pdf' } },
  { category: 'Logos', file: { url: furl('j1'), extension: 'pdf' } },
];
const groups = mapDownloads(rawDl, { warn: (m) => dw.push(m), projectId });
assert.deepEqual(groups.map((g) => g.category), ['Rapport d’activité', 'Logos', 'Dossiers de presse', 'Autres documents'], 'ordre fixe des catégories');
assert.deepEqual(groups[1].items.map((i) => i.title), ['Logo SVG', 'Logos zip'], 'tri par order puis titre');
assert.equal(groups[1].items[1].meta, 'ZIP, 65 Ko'); assert.equal(groups[1].items[0].meta, 'SVG, 4 Ko, 2026'); assert.equal(groups[0].items[0].meta, 'PDF, 2,4 Mo');
assert.deepEqual(groups[3].items.map((i) => i.title), ['Autre', 'Autre A', '<script>x()</script>'], 'order puis titre');
assert.equal(groups[3].items.at(-1).title, '<script>x()</script>', 'texte hostile conservé comme texte');
assert.equal(groups[3].items.at(-1).desc, '<a href="https://casino.example">c</a>');
const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));
assert.ok(allHrefs.every((h) => h.startsWith(`https://cdn.sanity.io/files/${projectId}/`)), 'aucun lien hors du projet Sanity');
assert.equal(allHrefs.length, 7, 'exécutable, script, hors projet, casino, catégorie inconnue, extension incohérente, doublon, masqué et sans titre exclus');
for (const re of [/fichier absent, hors du projet/, /catégorie inconnue/, /extension incohérente/, /document en double/, /titre manquant/]) assert.ok(dw.some((w) => re.test(w)), String(re));
assert.ok(!dw.some((w) => /Masqué/.test(w)));
assert.deepEqual(mapDownloads(rawDl, { projectId: '' }), [], 'sans identifiant de projet aucun fichier n’est accepté');
const dBlocks = downloadBlocks(groups);
assert.equal(dBlocks.length, 4); assert.ok(dBlocks.every((b) => b.t === 'downloads'));
assert.equal(dBlocks[0].title, 'Rapport d’activité');

// ---- lien Google Drive pour un téléchargement (rapport d'activité) et titre « à propos »
{
  const w = [];
  const g = mapDownloads([
    { title: 'Rapport', category: 'Rapport d’activité', url: 'https://drive.google.com/file/d/abc123/view?usp=sharing', year: '2025' },
    { title: 'Rapport doublon', category: 'Rapport d’activité', url: 'https://drive.google.com/file/d/abc123/view?usp=sharing' },
    { title: 'Casino', category: 'Autres documents', url: 'https://casino-canada.example/promo.pdf' },
    { title: 'Faux Drive', category: 'Autres documents', url: 'https://drive.google.com.evil.example/x' },
    { title: 'Http', category: 'Autres documents', url: 'http://drive.google.com/file/d/x' },
    { title: 'Identifiants', category: 'Autres documents', url: 'https://user:pw@drive.google.com/file/d/x' },
    { title: 'Javascript', category: 'Autres documents', url: 'javascript:alert(1)' },
  ], { warn: (m) => w.push(m), projectId });
  assert.equal(g.length, 1, 'seul le lien Google Drive valide est retenu');
  assert.deepEqual(g[0].items.map((i) => [i.title, i.external, i.meta]), [['Rapport', true, 'Google Drive, 2025']]);
  assert.ok(g[0].items[0].href.startsWith('https://drive.google.com/'));
  assert.ok(w.filter((m) => /aucun lien Google Drive valide/.test(m)).length === 5 && w.some((m) => /document en double/.test(m)));
  const e = mapExpositions([{ title: 'Hommage', slug: 'hommage', artistHeading: 'Mahmoud <b>Darwich</b>', start: '2026-12-03', end: '2027-05-03', poster: cdn('p', 800, 600, 'a') }], { projectId });
  assert.equal(e[0]?.artistHeading, 'Mahmoud <b>Darwich</b>', 'titre repris comme texte brut');
}

// ---- librairie
const lw = [];
const lib = mapLibrairie({
  intro: 'Intro <b>x</b>\n\nSuite', photo: cdn('lib', 1200, 800, 'Rayons'), practical: [{ label: 'Horaires', value: '<a href="https://casino.example">14h</a>' }, { label: '', value: 'x' }],
  selection: [{ title: 'Livre 1', author: 'Auteur', description: 'D', cover: cdn('c1', 600, 800) }, { title: '', author: 'x' }, { title: 'Livre 2', cover: { src: 'https://evil.example/c.jpg', width: 1, height: 1 } }], provisional: false,
}, { warn: (m) => lw.push(m) });
assert.equal(lib.live, true); assert.deepEqual(lib.intro, ['Intro <b>x</b>', 'Suite']);
assert.deepEqual(lib.practical, [['Horaires', '<a href="https://casino.example">14h</a>']]);
assert.deepEqual(lib.selection.map((b) => b.title), ['Livre 1', 'Livre 2']); assert.equal(lib.selection[1].cover, undefined);
assert.ok(lw.some((w) => /sans titre/.test(w)));
const lb = librairieBlocks(lib);
assert.deepEqual(lb.map((b) => b.t), ['text', 'image', 'facts', 'shelf']);
assert.ok(lb.filter((b) => b.t === 'text' || b.t === 'facts').every((b) => b.plain === true), 'texte Sanity toujours rendu en texte brut');
assert.equal(mapLibrairie({ intro: 'x' }).live, false, 'provisional absent = provisoire (défaut true)');
assert.equal(mapLibrairie({ intro: 'x', provisional: true }).live, false);
assert.equal(mapLibrairie({ provisional: false }).live, false, 'document vide = mention « bientôt en ligne »');
assert.equal(mapLibrairie(null), null);

// ---- podcast et épisodes
const pw = [];
const pod = mapPodcast({
  intro: 'Intro', cover: cdn('pc', 1000, 1000, 'Visuel'), provisional: false,
  listenLinks: [
    { label: 'Spotify', url: 'https://open.spotify.com/show/1' }, { label: 'Casino', url: 'https://casino.example/x' }, { label: 'Clair', url: 'http://soundcloud.com/x' },
    { label: 'Spotify bis', url: 'https://open.spotify.com/show/1' }, { label: '<b>Apple</b>', url: 'https://podcasts.apple.com/fr/podcast/x/id1' }, { label: '', url: 'https://youtu.be/x' },
  ],
}, { warn: (m) => pw.push(m) });
assert.deepEqual(pod.listenLinks.map((l) => l.label), ['Spotify', '<b>Apple</b>'], 'seules les plateformes autorisées, sans doublon');
assert.equal(pw.filter((w) => /lien d’écoute ignoré/.test(w)).length, 3); assert.ok(pw.some((w) => /en double/.test(w)));
assert.equal(mapPodcast({ intro: 'x' }).provisional, true, 'provisional absent = provisoire');
assert.equal(mapPodcast(null), null);
const ow = [];
const YT = 'aqz-KE-bpKQ';
const rawEps = [
  { slug: 'ep-1', number: 1, title: 'Épisode 1', date: '2026-09-01', description: 'D1\n\nSuite', guests: 'Invitée <i>x</i>', guestRole: 'Directrice <b>du lieu</b>', duration: '42 min', youtubeUrl: `https://www.youtube.com/watch?v=${YT}`, image: cdn('ei', 800, 800, 'Image ép. 1') },
  { slug: 'ep-2', number: 12, title: 'Épisode 2', date: '2026-10-05', description: 'D2', youtubeUrl: `https://youtu.be/${YT}?t=5` },
  { slug: 'ep-3', title: 'Épisode 3 sans lien', date: '2026-08-01', description: 'D3' },
  { slug: 'ep-4', title: 'Domaine piégé', date: '2026-07-01', youtubeUrl: `https://www.youtube.com.evil.example/watch?v=${YT}` },
  { slug: 'ep-5', title: 'Lien http', date: '2026-06-01', youtubeUrl: `http://www.youtube.com/watch?v=${YT}` },
  { slug: 'ep-6', title: 'Lien javascript', date: '2026-05-01', youtubeUrl: 'javascript:alert(1)' },
  { slug: 'ep-7', title: 'Identifiant trop court', date: '2026-04-02', youtubeUrl: 'https://www.youtube.com/watch?v=abc' },
  { slug: 'ep-8', title: 'Hôte étranger', date: '2026-04-01', youtubeUrl: `https://vimeo.com/watch?v=${YT}` },
  { slug: 'ep-9', title: 'Identifiants dans l’URL', date: '2026-03-01', youtubeUrl: `https://user:pw@www.youtube.com/watch?v=${YT}` },
  { slug: 'ep-1', title: 'Doublon', date: '2026-09-02', youtubeUrl: `https://youtu.be/${YT}` },
  { slug: 'Mauvais Slug', title: 'Slug KO', date: '2026-09-02', youtubeUrl: `https://youtu.be/${YT}` },
  { slug: 'date-ko', title: 'Date KO', date: '2026-02-30', youtubeUrl: `https://youtu.be/${YT}` },
  { slug: 'masque', title: 'Masqué', date: '2026-09-03', youtubeUrl: `https://youtu.be/${YT}`, hidden: true },
  { slug: 'ep-10', title: 'Image hors CDN', date: '2026-02-01', youtubeUrl: `https://youtu.be/${YT}`, image: { src: 'https://evil.example/a.jpg', width: 10, height: 10 } },
  { slug: 'ep-11', title: 'Numéro nul', number: 0, date: '2026-01-05', youtubeUrl: `https://youtu.be/${YT}` },
  { slug: 'ep-12', title: 'Numéro décimal', number: 1.5, date: '2026-01-04', youtubeUrl: `https://youtu.be/${YT}` },
  { slug: 'ep-13', title: 'Numéro texte', number: '7', date: '2026-01-03', youtubeUrl: `https://youtu.be/${YT}` },
  { slug: 'ep-14', title: 'Numéro énorme', number: 10000, date: '2026-01-02', youtubeUrl: `https://youtu.be/${YT}` },
  { slug: 'ep-15', title: 'Balises <script>alert(1)</script> <img src=x onerror=1>', date: '2026-01-01', description: '<a href="https://casino.example">gagner</a>\n\n<script>x()</script>', guests: '<b>Invité</b> <script>y()</script>', guestRole: '<i>Rôle</i>', duration: '<u>9 min</u>', youtubeUrl: `https://youtu.be/${YT}` },
];
const eps = mapEpisodes(rawEps, { warn: (m) => ow.push(m), projectId });
const epBy = Object.fromEntries(eps.map((e) => [e.slug, e]));
assert.deepEqual(eps.map((e) => e.slug), ['ep-2', 'ep-1', 'ep-3', 'ep-4', 'ep-5', 'ep-6', 'ep-7', 'ep-8', 'ep-9', 'ep-10', 'ep-11', 'ep-12', 'ep-13', 'ep-14', 'ep-15'], 'du plus récent au plus ancien');
assert.deepEqual(epBy['ep-1'].paras, ['D1', 'Suite']);
assert.equal(epBy['ep-1'].youtubeId, YT); assert.equal(epBy['ep-2'].youtubeId, YT);
assert.equal(epBy['ep-1'].number, 1); assert.equal(epBy['ep-2'].number, 12); assert.equal(epBy['ep-3'].number, undefined);
assert.equal(epBy['ep-1'].guests, 'Invitée <i>x</i>', 'texte brut conservé tel quel (affiché par interpolation)'); assert.equal(epBy['ep-1'].guestRole, 'Directrice <b>du lieu</b>');
assert.equal(epBy['ep-1'].duration, '42 min'); assert.equal(epBy['ep-1'].image.alt, 'Image ép. 1'); assert.equal(epBy['ep-2'].image, undefined);
// pas de champ `audio` ni d'URL brute conservée
for (const e of eps) { assert.ok(!('audio' in e) && !('mime' in e) && !('youtubeUrl' in e), `${e.slug} : aucun champ audio ni URL brute`); assert.ok(e.youtubeId === undefined || /^[A-Za-z0-9_-]{11}$/.test(e.youtubeId)); }
// épisodes sans vidéo valide : affichés sans vidéo, avec avertissement
for (const k of ['ep-3', 'ep-4', 'ep-5', 'ep-6', 'ep-7', 'ep-8', 'ep-9']) assert.equal(epBy[k].youtubeId, undefined, `${k} : affiché sans vidéo`);
assert.equal(ow.filter((w) => /épisode affiché sans vidéo/.test(w)).length, 7);
assert.ok(ow.some((w) => /lien YouTube absent/.test(w)) && ow.some((w) => /lien YouTube invalide/.test(w)));
// numéros invalides ignorés, épisode conservé
for (const k of ['ep-11', 'ep-12', 'ep-13', 'ep-14']) { assert.ok(epBy[k], `${k} conservé`); assert.equal(epBy[k].number, undefined, `${k} : numéro ignoré`); }
assert.equal(ow.filter((w) => /numéro invalide/.test(w)).length, 4);
assert.equal(epBy['ep-10'].image, undefined); assert.ok(ow.some((w) => /vignette absente ou hors cdn\.sanity\.io/.test(w)));
assert.ok(!eps.some((e) => ['masque', 'date-ko', 'Mauvais Slug'].includes(e.slug)) && eps.filter((e) => e.slug === 'ep-1').length === 1);
assert.ok(ow.some((w) => /slug invalide/.test(w)) && ow.some((w) => /date invalide/.test(w)) && ow.some((w) => /en double/.test(w)));
assert.ok(!ow.some((w) => /Masqué/.test(w)));
// balises : texte brut seulement (jamais interprété), longueurs bornées
assert.equal(epBy['ep-15'].paras[0], '<a href="https://casino.example">gagner</a>'); assert.equal(epBy['ep-15'].duration, '<u>9 min</u>');
assert.equal(isoDuration(epBy['ep-15'].duration), null, 'durée non parsable : pas de duration ISO');
const longEp = mapEpisodes([{ slug: 'long', title: 'T'.repeat(500), date: '2026-01-01', description: 'P'.repeat(9000), guests: 'G'.repeat(900), guestRole: 'R'.repeat(900), duration: 'D'.repeat(90) }], { projectId })[0];
assert.equal(longEp.title.length, 120); assert.equal(longEp.paras[0].length, 3000); assert.equal(longEp.guests.length, 200); assert.equal(longEp.guestRole.length, 200); assert.equal(longEp.duration.length, 30);
assert.deepEqual(mapEpisodes('nope'), []); assert.deepEqual(mapEpisodes(null), []);
// tri : à date égale, numéro décroissant puis titre
assert.deepEqual(mapEpisodes([
  { slug: 'a', title: 'B', date: '2026-01-01' }, { slug: 'b', title: 'A', number: 3, date: '2026-01-01' }, { slug: 'c', title: 'C', number: 5, date: '2026-01-01' },
]).map((e) => e.slug), ['c', 'b', 'a']);

// ---- identifiants YouTube
for (const ok of [
  `https://www.youtube.com/watch?v=${YT}`, `https://youtube.com/watch?v=${YT}&t=3s`, `https://m.youtube.com/watch?feature=share&v=${YT}`,
  `https://youtu.be/${YT}`, `https://youtu.be/${YT}?si=abc`, `https://www.youtube.com/embed/${YT}`, `https://www.youtube.com/shorts/${YT}`, `https://youtube.com/shorts/${YT}/`,
]) assert.equal(youtubeId(ok), YT, ok);
for (const ko of [
  `https://www.youtube.com.evil.example/watch?v=${YT}`, `https://evil.example/?u=https://www.youtube.com/watch?v=${YT}`, `https://evilyoutube.com/watch?v=${YT}`,
  `https://sub.www.youtube.com/watch?v=${YT}`, `http://www.youtube.com/watch?v=${YT}`, `javascript:alert(1)//youtube.com/watch?v=${YT}`, 'javascript:alert(1)',
  `//www.youtube.com/watch?v=${YT}`, `https://user:pw@www.youtube.com/watch?v=${YT}`, `https://user@youtu.be/${YT}`, `https://www.youtube.com:8443/watch?v=${YT}`,
  'https://www.youtube.com/watch?v=abc', `https://www.youtube.com/watch?v=${YT}x`, 'https://www.youtube.com/watch?v=aqz-KE-bp"K', 'https://www.youtube.com/watch?v=aqz KE-bpKQ',
  'https://www.youtube.com/watch', 'https://www.youtube.com/', 'https://youtu.be/', `https://youtu.be/${YT}/extra`, `https://www.youtube.com/embed/${YT}/x`, `https://www.youtube.com/playlist?list=${YT}`,
  `https://www.youtube.com/channel/${YT}`, `https://music.youtube.com/watch?v=${YT}`, `https://www.youtube-nocookie.com/embed/${YT}`, `https://vimeo.com/${YT}`,
  ` https://youtu.be/${YT}`, `https://youtu.be/${YT}\n`, `https://youtu.be/${YT}"onload="x`, 'x'.repeat(400), '', null, undefined, 12, {}, [`https://youtu.be/${YT}`],
]) assert.equal(youtubeId(ko), null, String(ko));
assert.equal(youtubeEmbedUrl(YT), `https://www.youtube-nocookie.com/embed/${YT}`); assert.equal(youtubeWatchUrl(YT), `https://www.youtube.com/watch?v=${YT}`);
// durée ISO 8601
assert.equal(isoDuration('32 min'), 'PT32M'); assert.equal(isoDuration('5min'), 'PT5M'); assert.equal(isoDuration(' 90 Min '), 'PT90M');
for (const ko of ['1h05', 'environ 30 min', '0 min', '-3 min', '32', '', 'min', '32 min <b>', 12345, null]) assert.equal(isoDuration(ko), null, String(ko));
// titre, description, chemins, autres épisodes
assert.equal(episodeTitle(epBy['ep-2']), '#12 Épisode 2'); assert.equal(episodeTitle(epBy['ep-3']), 'Épisode 3 sans lien');
assert.equal(episodePath('ep-2'), '/l-art-est-public/podcast/ep-2');
assert.equal(episodeDescription({ title: 'T', paras: [] }), 'Épisode du podcast de L’art est public : T.');
assert.ok(episodeDescription({ title: 'T', paras: ['mot '.repeat(100)] }).length <= 161);
assert.equal(fullDate('2026-09-01'), '1 septembre 2026');
const oth = otherEpisodes(eps, 'ep-1');
assert.equal(oth.length, 6, '6 autres épisodes au plus'); assert.ok(!oth.some((e) => e.slug === 'ep-1')); assert.equal(oth[0].slug, 'ep-2', 'du plus récent');
assert.deepEqual(otherEpisodes([eps[0]], eps[0].slug), [], 'épisode unique : aucun autre épisode');

// page podcast : 0, 1 et plusieurs épisodes
const base = { provisional: false, intro: ['Intro'], listenLinks: pod.listenLinks, cover: pod.cover };
const pb = podcastBlocks(base, eps);
assert.deepEqual(pb.map((b) => b.t), ['text', 'episodes', 'marquee', 'listen']);
assert.deepEqual(pb[2].words, ['Podcast', 'Rencontres', 'Musique', 'L’art est public']);
const items = pb[1].items;
assert.equal(items.length, 15); assert.equal(items[0].id, 'ep-ep-2'); assert.equal(items[0].title, '#12 Épisode 2');
assert.equal(items[0].href, '/l-art-est-public/podcast/ep-2'); assert.ok(items.every((i) => /^\/l-art-est-public\/podcast\/[a-z0-9-]+$/.test(i.href)), 'liens internes uniquement');
assert.ok(items.every((i) => !('audio' in i) && !('paras' in i)));
assert.equal(items[0].img, pod.cover.src, 'sans image d’épisode : visuel du podcast'); assert.equal(items[0].alt, '');
assert.equal(items[1].img, epBy['ep-1'].image.src, 'image de l’épisode');
assert.equal(items[1].meta, '1 septembre 2026 · 42 min · Avec Invitée <i>x</i>');
assert.ok(items.every((i) => i.short.length <= 161));
const one = podcastBlocks({ ...base, listenLinks: [], cover: undefined }, [eps[0]]);
assert.deepEqual(one.map((b) => b.t), ['text', 'episodes', 'marquee'], 'sans lien d’écoute : pas de section « Où nous écouter »');
assert.equal(one[1].items.length, 1); assert.equal(one[1].items[0].img, undefined, 'ni image d’épisode ni visuel : aplat noir avec le titre');
assert.equal(podcastBlocks(base, [])[1].items.length, 0, '0 épisode : liste vide (la page locale « bientôt en ligne » reste utilisée côté pages.ts)');

// ---- Rubriques du menu (document `rubrique`) ----
const built = ['/', '/agenda', '/agenda/kosmik-club', '/l-art-est-public', '/l-art-est-public/galerie', '/l-art-est-public/librairie', '/l-art-est-public/podcast', '/l-art-est-public/le-lieu', '/kosmik-hip-hop'];
const rw = []; const rwarn = (m) => rw.push(m);
const mr = (raw) => { rw.length = 0; return mapRubriques(raw, { warn: rwarn, builtPaths: built }); };
const it = (page, label = 'L') => ({ page, label });
// cas nominal : renommer, réordonner, retirer, ajouter une page d'une autre rubrique
let r = mr([{ cle: 'l-art-est-public', items: [it('/l-art-est-public/galerie', 'Expositions'), it('/l-art-est-public/le-lieu', 'Le lieu'), it('/agenda/kosmik-club', 'Kosmik Club')] }]);
assert.deepEqual(r, { 'l-art-est-public': [
  { label: 'Expositions', href: '/l-art-est-public/galerie' }, { label: 'Le lieu', href: '/l-art-est-public/le-lieu' }, { label: 'Kosmik Club', href: '/agenda/kosmik-club' }] });
assert.equal(rw.length, 0);
// pages refusées : hors builtPaths, '/', URL externe, javascript:, protocole relatif, variantes de casse/espaces/slash final/requête, page de la rubrique elle-même
r = mr([{ cle: 'l-art-est-public', items: [
  it('/inconnue'), it('/'), it('https://evil.example/x'), it('//evil.example'), it('javascript:alert(1)'), it('data:text/html,x'),
  it('/L-art-est-public/galerie'), it(' /l-art-est-public/galerie'), it('/l-art-est-public/galerie/'), it('/l-art-est-public/galerie?x=1'), it('/l-art-est-public/galerie#a'),
  it('/l-art-est-public'), { label: 'x' }, { page: 42, label: 'x' }, null, 'texte', it('/l-art-est-public/podcast', 'Podcast')] }]);
assert.deepEqual(r['l-art-est-public'], [{ label: 'Podcast', href: '/l-art-est-public/podcast' }]);
assert.equal(rw.filter((w) => /page refusée/.test(w)).length, 16);
// libellés : balises gardées comme texte brut (jamais du HTML : l'interpolation Astro les échappe), une ligne, 60 caractères
r = mr([{ cle: 'l-association', items: [
  { page: '/l-art-est-public/galerie', label: '<b>Gras</b>\n<script>alert(1)</script>' },
  { page: '/l-art-est-public/librairie', label: 'M'.repeat(200) },
  { page: '/l-art-est-public/podcast', label: '   ' },
  { page: '/l-art-est-public/le-lieu', label: 42 }] }], );
assert.deepEqual(r['l-association'].map((i) => i.href), ['/l-art-est-public/galerie', '/l-art-est-public/librairie']);
assert.equal(r['l-association'][0].label, '<b>Gras</b> <script>alert(1)</script>'.slice(0, 60));
assert.ok(r['l-association'].every((i) => i.label.length <= 60 && !/[\n\r]/.test(i.label)));
assert.equal(r['l-association'][1].label, 'M'.repeat(60));
assert.ok(rw.some((w) => /raccourci/.test(w)) && rw.filter((w) => /libellé vide/.test(w)).length === 2);
// doublons : le second est ignoré
r = mr([{ cle: 'kosmik-hip-hop', items: [it('/agenda', 'Un'), it('/agenda/kosmik-club', 'Deux'), it('/agenda', 'Trois')] }]);
assert.deepEqual(r['kosmik-hip-hop'].map((i) => i.label), ['Un', 'Deux']); assert.ok(rw.some((w) => /en double/.test(w)));
// plus de 12 items : les 12 premiers seulement
const wide = ['/a', '/b', '/c', '/d', '/e', '/f', '/g', '/h', '/i', '/j', '/k', '/l', '/m', '/n', '/o'];
rw.length = 0;
const r12 = mapRubriques([{ cle: 'l-art-est-public', items: wide.map((p) => it(p, p)) }], { warn: rwarn, builtPaths: wide });
assert.deepEqual(r12['l-art-est-public'].map((i) => i.href), wide.slice(0, 12)); assert.ok(rw.some((w) => /plus de 12/.test(w)));
// clé inconnue, clé en double, entrée invalide, valeur non tableau
r = mr([{ cle: 'inconnue', items: [it('/agenda')] }, { cle: '/l-art-est-public', items: [it('/agenda')] }, { items: [it('/agenda')] }, null, 7,
  { cle: 'kosmik-hip-hop', items: [it('/agenda', 'A')] }, { cle: 'kosmik-hip-hop', items: [it('/agenda/kosmik-club', 'B')] }]);
assert.deepEqual(Object.keys(r), ['kosmik-hip-hop']); assert.equal(r['kosmik-hip-hop'][0].label, 'A');
assert.equal(rw.filter((w) => /clé inconnue/.test(w)).length, 5); assert.ok(rw.some((w) => /en double/.test(w)));
for (const bad of [null, undefined, 'x', 3, {}, { cle: 'kosmik-hip-hop' }]) assert.deepEqual(mr(bad), {});
// liste vide ou entièrement invalide => la rubrique est absente (le code garde ses enfants) + avertissement
r = mr([{ cle: 'l-art-est-public', items: [] }, { cle: 'kosmik-hip-hop', items: null }, { cle: 'l-association', items: [it('https://evil.example')] }]);
assert.deepEqual(r, {}); assert.equal(rw.filter((w) => /liste du code est conservée/.test(w)).length, 3);
// rubrique absente : rien (les autres rubriques gardent leurs enfants)
assert.deepEqual(mr([]), {});
// clé n'ayant pas d'enfants dans nav : refusée via `keys`
assert.deepEqual(mapRubriques([{ cle: 'agenda', items: [it('/agenda')] }], { warn: rwarn, builtPaths: built }), {});
assert.deepEqual(mapRubriques([{ cle: 'agenda', items: [it('/agenda/kosmik-club')] }], { warn: rwarn, builtPaths: built, keys: ['agenda'] }), { agenda: [{ label: 'L', href: '/agenda/kosmik-club' }] });

console.log('test-cms-mapping : OK (' + ev.length + ' événements, ' + team.length + ' groupes, ' + expos.length + ' expositions, ' + groups.length + ' catégories de téléchargements, ' + eps.length + ' épisodes)');

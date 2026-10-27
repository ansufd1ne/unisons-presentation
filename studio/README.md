# Studio UNi'SONS (Sanity)

Back-office du site : l'agenda (événements), l'équipe, la galerie et les rétrospectives, la librairie, le podcast (présentation et épisodes) et les téléchargements se modifient ici, sans toucher au code. Délhia (chargée de communication) édite tout dans le Studio : le site se met à jour à la publication.

## Lancer en local

```bash
cd studio
cp .env.example .env     # puis renseigner SANITY_STUDIO_PROJECT_ID
npm install
npm run dev              # http://localhost:3333
```

## Importer le contenu actuel du site

Le fichier `seed-data.json` (relisible, versionné) reprend les 4 événements de `src/data/events.ts` et l'équipe de `src/data/pages.ts`. Pour le régénérer après une modification de ces fichiers : `npm run export-seed`.

1. Créer un jeton **Editor** temporaire dans sanity.io/manage (API, Tokens) et le mettre dans `studio/.env` (`SANITY_AUTH_TOKEN`).
2. Lancer `npx sanity exec seed.ts --with-user-token`.
3. L'import est rejouable : les identifiants sont fixes (`evenement-<slug>`, `membre-<nom>`), les fiches sont remplacées, pas dupliquées. Attention : une modification faite dans le Studio sur une de ces fiches est écrasée à chaque nouvel import.
4. Supprimer le jeton ensuite.

## Importer les rubriques (galerie, librairie, podcast, téléchargements)

`seed-rubriques-data.json` (relisible) est produit par `npm run export-seed` à partir de `src/data/expos.ts` et `src/data/pages.ts`. Contenu : 7 expositions (la courante et 6 passées, dont REWIND avec ses photos), la fiche Librairie et la fiche Podcast (toutes deux en préparation), et les logos à télécharger (les fichiers de `public/telechargements/` sont téléversés).

1. Même jeton Editor temporaire que ci-dessus.
2. `npm run seed-rubriques` (équivaut à `npx sanity exec seed-rubriques.ts --with-user-token`).
3. **Aucun écrasement** : le script utilise `createIfNotExists`. Une fiche déjà présente, même modifiée dans le Studio, est ignorée. Identifiants : `exposition-<adresse>`, `librairie`, `podcast`, `telechargement-<adresse>`. Pour réimporter une fiche, la supprimer d'abord dans le Studio.
4. Le rapport d'activité est un lien Google Drive, il n'est pas importé : ajouter le PDF à la main dans « Téléchargements » (catégorie « Rapport d'activité »).
5. La Librairie et le Podcast sont des fiches uniques (non duplicables, non supprimables). Tant que « Page en préparation » est cochée, le site affiche « bientôt en ligne ».

## Liste « Dans la rubrique : L'art est public »

Le Studio propose l'entrée « Dans la rubrique : L'art est public » : c'est la liste de liens entre crochets en bas des pages de la rubrique. On peut y réordonner (glisser-déposer), renommer ou retirer des liens ; chaque lien pointe vers une page du site choisie dans un menu (aucune adresse libre). Retirer une ligne ne supprime pas la page. Le type « Pages d'une rubrique » prévoit aussi les autres rubriques, non exposées dans le bureau pour l'instant.

- **Menu des pages** : `schemaTypes/pages-list.json` (relisible, versionné) est produit par `npm run export-pages` à partir de `builtPaths` et `labelFor` dans `src/data/site.ts`. **À relancer chaque fois que le développeur ajoute une page au site (`builtPaths`)**, puis redéployer le Studio. Les libellés ambigus (les trois « Agenda ») sont précisés dans `scripts/export-pages-list.mjs` ; le script signale tout nouveau doublon.
- **Import initial** : `npm run export-seed` ajoute la rubrique (7 liens repris de `nav`) à `seed-rubriques-data.json`, puis `npm run seed-rubriques` crée `rubrique-l-art-est-public` s'il n'existe pas (`createIfNotExists`, rien n'est écrasé).
- La fiche est unique : non supprimable, non duplicable. Ajouter `"rubrique"` au filtre du webhook de reconstruction.

## Déployer le Studio

```bash
npm run deploy
```

Le Studio est publié sur `unisons-cms.sanity.studio`.

## Le podcast (vidéo)

Le podcast d'UNi'SONS est un podcast vidéo. Dans le Studio, « Podcast » contient la « Présentation » (texte, couverture, autres plateformes) et « Épisodes (vidéos YouTube) ».

- Un épisode = un **lien YouTube** (on colle simplement le lien de la vidéo) + une **vignette** (paysage 16/9, 1 280 px de large minimum). Sans vignette, la couverture du podcast est utilisée.
- Il n'y a **plus de fichier audio** : rien à téléverser dans le Studio.
- Chaque épisode a sa page : `/l-art-est-public/podcast/<adresse de la page>`. Ne plus changer l'adresse une fois l'épisode en ligne.
- La vidéo ne se charge que si le visiteur clique sur lecture.
- Le webhook de reconstruction (ci-dessous) inclut déjà le type `episode`.
- Aucun épisode n'est importé par le seed : ils se créent à la main dans le Studio.

## Reconstruction automatique du site

Le site est statique : il doit être reconstruit à chaque publication dans Sanity.

1. Créer un **deploy hook** chez l'hébergeur du site (Vercel : Settings, Git, Deploy Hooks).
2. Dans sanity.io/manage, onglet API, Webhooks : créer un webhook vers l'adresse du deploy hook, méthode POST, dataset `production`, déclenché à la création, la modification et la suppression.
3. Filtre : `_type in ["evenement", "membre", "exposition", "librairie", "podcast", "episode", "telechargement", "rubrique"]`.

## Compte à remplacer avant la livraison

Le projet actuel est rattaché à un compte de test. Avant la remise à l'association :

1. créer le projet sur le **compte officiel d'UNi'SONS** et inviter les personnes concernées (Members) ;
2. remplacer `SANITY_STUDIO_PROJECT_ID` (ici et côté site) ;
3. relancer l'import, puis `npm run deploy` ;
4. recréer le webhook de reconstruction ;
5. supprimer le jeton d'import et l'ancien projet de test.

## Sauvegarde du contenu

`npm run backup` (ou `sh scripts/backup.sh [dossier]`) exporte tout le contenu Sanity, documents et fichiers, dans une archive datée `unisons-AAAA-MM-JJ-HHMM.tar.gz`. Par défaut elle est rangée dans `~/dev/unisons-sanity-backups/`, hors du dépôt, et les 12 dernières sont conservées. Il faut être connecté (`npx sanity login`) ou avoir `SANITY_AUTH_TOKEN` dans l'environnement.

- À lancer au moins une fois par mois et avant toute grosse modification du contenu.
- Les archives contiennent des données personnelles (équipe, e-mails) : ne jamais les mettre dans git ni les envoyer par e-mail.
- Restauration : créer un dataset de test (`npx sanity dataset create test-restauration`), puis `npx sanity dataset import archive.tar.gz test-restauration`, et vérifier le contenu avant de toucher à `production`. Une sauvegarde jamais restaurée n'est pas une sauvegarde : faire cet essai une fois.

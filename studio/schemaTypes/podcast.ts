import { defineArrayMember, defineField, defineType } from 'sanity';
import { altField } from './common';

const hotes = [
  'open.spotify.com', 'podcasts.apple.com', 'music.apple.com', 'www.youtube.com', 'youtube.com', 'music.youtube.com',
  'youtu.be', 'www.deezer.com', 'deezer.com', 'soundcloud.com', 'castbox.fm', 'podcastaddict.com',
];

export const podcast = defineType({
  name: 'podcast',
  title: 'Podcast (présentation)',
  type: 'document',
  fields: [
    defineField({ name: 'intro', title: 'Présentation du podcast', type: 'text', rows: 6, description: 'Séparez les paragraphes par une ligne vide.' }),
    defineField({
      name: 'cover', title: 'Visuel du podcast', type: 'image', options: { hotspot: true },
      description: 'Utilisée comme vignette par défaut des épisodes qui n’ont pas la leur. Facultatif.', fields: [altField],
    }),
    defineField({
      name: 'listenLinks', title: 'Autres plateformes où retrouver le podcast', type: 'array',
      description: 'Autres plateformes où retrouver le podcast (YouTube, Spotify, Apple Podcasts, Deezer, SoundCloud, Castbox, Podcast Addict).',
      of: [defineArrayMember({
        type: 'object', name: 'lien', title: 'Plateforme',
        fields: [
          defineField({ name: 'label', title: 'Nom affiché', type: 'string', description: 'Par exemple : Spotify.', validation: (r) => r.required() }),
          defineField({
            name: 'url', title: 'Lien', type: 'url', description: 'Adresse complète, qui commence par https://.',
            validation: (r) => r.required().custom((value) => {
              if (!value) return true;
              let u: URL;
              try { u = new URL(value as string); } catch { return 'Adresse non valide. Copiez le lien complet depuis la plateforme.'; }
              if (u.protocol !== 'https:') return 'Le lien doit commencer par https://.';
              return hotes.includes(u.hostname) ? true : `Plateforme non reconnue (${u.hostname}). Sont acceptés : Spotify, Apple Podcasts, YouTube, Deezer, SoundCloud, Castbox, Podcast Addict. Pour une autre plateforme, contactez la personne qui s’occupe du site.`;
            }),
          }),
        ],
        preview: { select: { title: 'label', subtitle: 'url' } },
      })],
    }),
    defineField({
      name: 'provisional', title: 'Page en préparation', type: 'boolean', initialValue: true,
      description: 'Tant que cette case est cochée, le site affiche la mention « bientôt en ligne ». Décochez-la quand la page est prête.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Podcast (présentation)' }) },
});

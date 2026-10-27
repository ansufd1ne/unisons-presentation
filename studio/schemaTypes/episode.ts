import { defineField, defineType } from 'sanity';
import { altField } from './common';
import { validateYoutubeUrl } from './youtube';

export const episode = defineType({
  name: 'episode',
  title: 'Épisode du podcast (vidéo)',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required().max(90) }),
    defineField({
      name: 'slug', title: 'Adresse de la page', type: 'slug', options: { source: 'title', maxLength: 60 },
      description: 'Générée à partir du titre. Elle devient l’adresse de la page de l’épisode : ne plus la changer une fois l’épisode en ligne.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'number', title: 'Numéro de l’épisode', type: 'number',
      description: 'Facultatif. Affiché « #12 » devant le titre.', validation: (r) => r.integer().min(1),
    }),
    defineField({ name: 'date', title: 'Date de publication', type: 'date', validation: (r) => r.required() }),
    defineField({
      name: 'youtubeUrl', title: 'Lien YouTube de la vidéo', type: 'url',
      description: 'Collez simplement le lien de la vidéo YouTube. La vidéo ne se charge que si le visiteur clique sur lecture.',
      validation: (r) => r.required().uri({ scheme: ['https'] }).custom((v) => validateYoutubeUrl(v)),
    }),
    defineField({
      name: 'description', title: 'À propos de l’épisode', type: 'text', rows: 8,
      description: 'Séparez les paragraphes par une ligne vide.', validation: (r) => r.max(2000),
    }),
    defineField({
      name: 'guests', title: 'Invité·es', type: 'string',
      description: 'Par exemple : Nadia Benali et Karim Haddad.', validation: (r) => r.max(200),
    }),
    defineField({
      name: 'guestRole', title: 'Fonction de l’invité·e', type: 'string',
      description: 'Facultatif. Par exemple : historienne de l’art.', validation: (r) => r.max(120),
    }),
    defineField({
      name: 'duration', title: 'Durée', type: 'string',
      description: 'Par exemple : 32 min.', validation: (r) => r.max(30),
    }),
    defineField({
      name: 'image', title: 'Vignette de l’épisode (affichée avant la lecture)', type: 'image', options: { hotspot: true },
      description: 'Format paysage 16/9 conseillé, 1 280 px de large minimum. Si vous ne mettez rien, la couverture du podcast est utilisée.',
      fields: [altField],
    }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false, description: 'Cache l’épisode sans le supprimer.' }),
  ],
  orderings: [{ title: 'Date, du plus récent au plus ancien', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', number: 'number', subtitle: 'date', media: 'image' },
    prepare: ({ title, number, subtitle, media }) => ({ title: number ? `#${number} ${title ?? ''}` : title, subtitle, media }),
  },
});

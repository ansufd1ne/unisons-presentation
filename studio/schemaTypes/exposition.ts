import { defineArrayMember, defineField, defineType } from 'sanity';
import { altField } from './common';

const fmt = (d?: string) => (d ? d.split('-').reverse().join('/') : '');

export const exposition = defineType({
  name: 'exposition',
  title: 'Exposition (galerie et rétrospectives)',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', description: '90 caractères au maximum.', validation: (r) => r.required().max(90) }),
    defineField({
      name: 'slug', title: 'Adresse de la page', type: 'slug', options: { source: 'title', maxLength: 60 },
      description: 'Générée à partir du titre. Ne plus la changer une fois l’exposition en ligne.', validation: (r) => r.required(),
    }),
    defineField({ name: 'artist', title: 'Artiste ou collectif', type: 'string', description: 'Par exemple : Ernest Pignon-Ernest, artiste plasticien.' }),
    defineField({
      name: 'start', title: 'Date de début', type: 'date',
      description: 'Facultatif. Une exposition est « en cours » si ses dates incluent aujourd’hui. Sinon, une fois passée, elle apparaît dans les rétrospectives. Si vous ne connaissez pas les dates, laissez vide.',
    }),
    defineField({
      name: 'end', title: 'Date de fin', type: 'date',
      description: 'Facultatif. L’exposition reste affichée comme « en cours » jusqu’à ce jour inclus, puis passe dans les rétrospectives.',
      validation: (r) => r.custom((value, ctx) => {
        const start = (ctx.document as { start?: string } | undefined)?.start;
        return !value || !start || value >= start ? true : 'La date de fin doit être le même jour ou après la date de début.';
      }),
    }),
    defineField({ name: 'vernissage', title: 'Date du vernissage', type: 'date', description: 'Facultatif.' }),
    defineField({
      name: 'year', title: 'Année (pour une exposition passée dont on ne connaît pas les dates)', type: 'string',
      description: 'Facultatif. Quatre chiffres, par exemple 2024. Inutile si les dates de début et de fin sont renseignées.',
      validation: (r) => r.regex(/^\d{4}$/, { name: 'année' }).error('Saisissez une année sur 4 chiffres, par exemple 2024.'),
    }),
    defineField({
      name: 'summary', title: 'Résumé', type: 'text', rows: 3,
      description: 'Une ou deux phrases, affichées dans les listes. 300 caractères au maximum. Facultatif.', validation: (r) => r.max(300),
    }),
    defineField({ name: 'about', title: 'Présentation de l’exposition', type: 'text', rows: 10, description: 'Séparez les paragraphes par une ligne vide.' }),
    defineField({ name: 'artistText', title: 'Texte sur l’artiste', type: 'text', rows: 10, description: 'Séparez les paragraphes par une ligne vide.' }),
    defineField({ name: 'artistHeading', title: 'Titre de la section « À propos de l’artiste »', type: 'string', description: 'Facultatif. Par défaut, le nom de l’artiste. À remplir si le texte parle d’une autre personne (par exemple le poète auquel l’exposition rend hommage).', validation: (r) => r.max(90) }),
    defineField({ name: 'author', title: 'Auteur du texte sur l’artiste', type: 'string', description: 'Facultatif. Par exemple : André Velter.' }),
    defineField({
      name: 'poster', title: 'Affiche ou visuel principal', type: 'image', options: { hotspot: true },
      description: 'Le cadrage se règle en cliquant sur la photo. Pensez à remplir la description.',
      fields: [{ ...altField, validation: (r) => r.required().error('Décrivez brièvement l’image.') }],
    }),
    defineField({
      name: 'images', title: 'Photos de l’exposition', type: 'array',
      description: 'Facultatif. Ajoutez autant de photos que vous le souhaitez, et glissez-les pour changer l’ordre.',
      of: [defineArrayMember({
        type: 'image', options: { hotspot: true },
        fields: [{ ...altField, validation: (r) => r.required().error('Décrivez brièvement la photo.') }],
      })],
    }),
    defineField({
      name: 'provisional', title: 'Texte provisoire', type: 'boolean', initialValue: false,
      description: 'Cochez si la présentation n’est pas encore prête : le site affichera la mention que la présentation sera ajoutée.',
    }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false, description: 'Cache l’exposition sans la supprimer.' }),
  ],
  orderings: [
    { title: 'Date de fin, de la plus récente à la plus ancienne', name: 'endDesc', by: [{ field: 'end', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', start: 'start', end: 'end', year: 'year', media: 'poster' },
    prepare: ({ title, start, end, year, media }) => ({
      title,
      subtitle: start && end ? `Du ${fmt(start)} au ${fmt(end)}` : start ? `À partir du ${fmt(start)}` : end ? `Jusqu’au ${fmt(end)}` : year || 'Dates à préciser',
      media,
    }),
  },
});

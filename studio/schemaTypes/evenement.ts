import { defineField, defineType } from 'sanity';

const altField = defineField({
  name: 'alt', title: 'Description de la photo', type: 'string',
  description: 'Une phrase qui décrit ce que l’on voit. Elle est lue aux personnes malvoyantes.',
});

export const evenement = defineType({
  name: 'evenement',
  title: 'Événement de l’agenda',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', description: '90 caractères au maximum.', validation: (r) => r.required().max(90) }),
    defineField({
      name: 'slug', title: 'Adresse de la page', type: 'slug', options: { source: 'title', maxLength: 60 },
      description: 'Générée à partir du titre. Ne plus la changer une fois l’événement en ligne.', validation: (r) => r.required(),
    }),
    defineField({ name: 'date', title: 'Date', type: 'date', description: 'Pour une exposition, le premier jour (vernissage).', validation: (r) => r.required() }),
    defineField({
      name: 'endDate', title: 'Date de fin', type: 'date', description: 'Facultatif. À remplir pour une exposition ou un événement sur plusieurs jours.',
      validation: (r) => r.custom((value, ctx) => {
        const start = (ctx.document as { date?: string } | undefined)?.date;
        return !value || !start || value >= start ? true : 'La date de fin doit être le même jour ou après la date de début.';
      }),
    }),
    defineField({
      name: 'pole', title: 'Pôle', type: 'string', initialValue: 'l-art-est-public',
      options: { layout: 'radio', list: [{ title: 'L’art est public', value: 'l-art-est-public' }, { title: 'Kosmik Club', value: 'kosmik-club' }] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'venue', title: 'Lieu', type: 'string', initialValue: 'Montpellier', description: 'Par exemple : La galerie, L’art est public.', validation: (r) => r.required() }),
    defineField({ name: 'address', title: 'Adresse', type: 'string', description: 'Facultatif. Numéro, rue, code postal, ville.' }),
    defineField({ name: 'free', title: 'Entrée libre', type: 'boolean', initialValue: false }),
    defineField({
      name: 'summary', title: 'Résumé (une ou deux phrases)', type: 'text', rows: 3,
      description: 'Affiché dans la liste de l’agenda. 300 caractères au maximum.', validation: (r) => r.required().max(300),
    }),
    defineField({ name: 'body', title: 'Présentation', type: 'text', rows: 10, description: 'Séparez les paragraphes par une ligne vide.' }),
    defineField({
      name: 'practical', title: 'Infos pratiques', type: 'array',
      description: 'Par exemple : Horaires, Entrée, Réservation. Une ligne par information.',
      of: [{
        type: 'object', name: 'info', title: 'Info pratique',
        fields: [
          defineField({ name: 'label', title: 'Intitulé', type: 'string', description: 'Par exemple : Horaires.', validation: (r) => r.required() }),
          defineField({ name: 'value', title: 'Information', type: 'string', description: 'Par exemple : 20h30, ouverture des portes à 19h30.', validation: (r) => r.required() }),
        ],
        preview: { select: { title: 'label', subtitle: 'value' } },
      }],
    }),
    defineField({
      name: 'provisional', title: 'Texte provisoire', type: 'boolean', initialValue: false,
      description: 'Cochez si la présentation n’est pas encore prête : le site affichera la mention que la présentation sera ajoutée.',
    }),
    defineField({
      name: 'image', title: 'Photo de la liste (carré ou paysage)', type: 'image', options: { hotspot: true },
      description: 'Carré ou paysage, 1 400 px de large minimum. Le cadrage se règle en cliquant sur la photo.',
      fields: [altField],
    }),
    defineField({
      name: 'heroImage', title: 'Grande photo de la fiche', type: 'image', options: { hotspot: true },
      description: 'Facultatif. Si vide, la photo de la liste est utilisée.',
      fields: [altField],
    }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false, description: 'Cache l’événement sans le supprimer.' }),
  ],
  orderings: [
    { title: 'Date, du plus récent au plus ancien', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Date, du plus ancien au plus récent', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'date', media: 'image' } },
});

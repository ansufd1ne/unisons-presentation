import { defineArrayMember, defineField, defineType } from 'sanity';
import { altField } from './common';

export const librairie = defineType({
  name: 'librairie',
  title: 'Librairie',
  type: 'document',
  fields: [
    defineField({ name: 'intro', title: 'Présentation de la librairie', type: 'text', rows: 8, description: 'Séparez les paragraphes par une ligne vide.' }),
    defineField({
      name: 'photo', title: 'Photo de la librairie', type: 'image', options: { hotspot: true },
      description: 'Facultatif. Le cadrage se règle en cliquant sur la photo.', fields: [altField],
    }),
    defineField({
      name: 'practical', title: 'Horaires, accès, contact', type: 'array',
      description: 'Une ligne par information, par exemple : Horaires, Accès, Téléphone.',
      of: [defineArrayMember({
        type: 'object', name: 'info', title: 'Information pratique',
        fields: [
          defineField({ name: 'label', title: 'Intitulé', type: 'string', description: 'Par exemple : Horaires.', validation: (r) => r.required() }),
          defineField({ name: 'value', title: 'Information', type: 'string', description: 'Par exemple : du mardi au samedi, 14h à 18h.', validation: (r) => r.required() }),
        ],
        preview: { select: { title: 'label', subtitle: 'value' } },
      })],
    }),
    defineField({
      name: 'selection', title: 'Sélection de livres', type: 'array',
      description: 'Facultatif. Les livres mis en avant sur la page.',
      of: [defineArrayMember({
        type: 'object', name: 'livre', title: 'Livre',
        fields: [
          defineField({ name: 'title', title: 'Titre du livre', type: 'string', validation: (r) => r.required() }),
          defineField({ name: 'author', title: 'Auteur ou autrice', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 4, description: 'Quelques phrases pour présenter le livre.' }),
          defineField({
            name: 'cover', title: 'Couverture', type: 'image', options: { hotspot: true },
            fields: [{ ...altField, title: 'Description de la couverture', validation: (r) => r.required().error('Décrivez brièvement la couverture.') }],
          }),
        ],
        preview: { select: { title: 'title', subtitle: 'author', media: 'cover' } },
      })],
    }),
    defineField({
      name: 'provisional', title: 'Page en préparation', type: 'boolean', initialValue: true,
      description: 'Tant que cette case est cochée, le site affiche la mention « bientôt en ligne ». Décochez-la quand la page est prête.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Librairie' }) },
});

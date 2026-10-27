import { defineArrayMember, defineField, defineType } from 'sanity';
import pages from './pages-list.json';

// Rubriques gérables (liste « Dans la rubrique » en bas des pages). Les autres rubriques sont prévues
// par le type mais pas encore exposées dans le bureau (voir sanity.config.ts).
export const rubriques = [
  { value: 'l-art-est-public', title: 'L’art est public' },
  { value: 'kosmik-hip-hop', title: 'Kosmik Hip-Hop' },
  { value: 'education-artistique', title: 'Éducation artistique' },
  { value: 'l-association', title: 'L’association' },
  { value: 'infos-pratiques', title: 'Infos pratiques' },
];

export const rubrique = defineType({
  name: 'rubrique',
  title: 'Pages d’une rubrique',
  type: 'document',
  fields: [
    defineField({
      name: 'cle', title: 'Rubrique', type: 'string',
      options: { list: rubriques, layout: 'radio' },
      readOnly: ({ document }) => !!document?._createdAt,
      description: 'La rubrique concernée. Ce choix ne peut plus être modifié une fois la fiche créée.',
      validation: (r) => r.required().error('Choisissez la rubrique.'),
    }),
    defineField({
      name: 'items', title: 'Pages de la rubrique, dans l’ordre d’affichage', type: 'array',
      description: 'Glissez-déposez les lignes pour changer l’ordre. Supprimer une ligne retire la page de la liste, mais la page reste accessible sur le site.',
      of: [defineArrayMember({
        type: 'object', name: 'lien', title: 'Page',
        fields: [
          defineField({
            name: 'label', title: 'Texte du lien', type: 'string',
            description: 'Le mot ou la courte expression affichée dans la liste.',
            validation: (r) => r.required().max(60).error('Indiquez un texte de 60 caractères au maximum.'),
          }),
          defineField({
            name: 'page', title: 'Page visée', type: 'string',
            options: { list: pages.map((p) => ({ value: p.path, title: p.label })) },
            description: 'Choisissez la page dans la liste.',
            validation: (r) => r.required().error('Choisissez la page visée.'),
          }),
        ],
        preview: { select: { title: 'label', subtitle: 'page' } },
      })],
      validation: (r) => r.required().min(1).max(12).custom((items) => {
        const pagesChoisies = ((items as { page?: string }[] | undefined) ?? []).map((i) => i.page).filter(Boolean);
        return new Set(pagesChoisies).size === pagesChoisies.length ? true : 'Une même page ne peut apparaître qu’une seule fois.';
      }),
    }),
  ],
  preview: {
    select: { cle: 'cle' },
    prepare: ({ cle }) => ({ title: `Dans la rubrique : ${rubriques.find((r) => r.value === cle)?.title ?? 'à choisir'}` }),
  },
});

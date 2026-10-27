import { defineField, defineType } from 'sanity';

const groupes = [
  'Présidence et direction', 'Administration', 'Communication', 'Cohésion sociale',
  'Médiation culturelle et sociale', 'Insertion et formation', 'Actions éducatives', 'Ateliers hip-hop',
];

export const membre = defineType({
  name: 'membre',
  title: 'Membre de l’équipe',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nom et prénom', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', title: 'Fonction', type: 'string', description: 'Par exemple : Chargée de communication.', validation: (r) => r.required() }),
    defineField({
      name: 'groupe', title: 'Équipe', type: 'string', description: 'Le groupe sous lequel la personne apparaît sur la page Équipe.',
      options: { list: groupes.map((g) => ({ title: g, value: g })) }, validation: (r) => r.required(),
    }),
    defineField({
      name: 'order', title: 'Ordre dans l’équipe', type: 'number', initialValue: 0,
      description: 'Classe les personnes d’une même équipe (0 = en premier, puis 1, 2...).',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'photo', title: 'Portrait carré, 600 px minimum', type: 'image', options: { hotspot: true },
      description: 'Facultatif. Photo carrée, 600 px de côté au minimum.',
      fields: [defineField({ name: 'alt', title: 'Description de la photo (facultatif)', type: 'string' })],
    }),
    defineField({
      name: 'email', title: 'Adresse e-mail', type: 'string', description: 'Facultatif. Affichée sur la page Équipe.',
      validation: (r) => r.custom((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string) ? true : 'Adresse e-mail non valide (exemple : prenom.nom@unisons.fr).'),
    }),
    defineField({
      name: 'hidden', title: 'Retirer de la page Équipe', type: 'boolean', initialValue: false,
      description: 'Cache la personne sans supprimer sa fiche, pratique en cas de départ.',
    }),
  ],
  orderings: [{ title: 'Équipe puis ordre', name: 'groupeOrder', by: [{ field: 'groupe', direction: 'asc' }, { field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});

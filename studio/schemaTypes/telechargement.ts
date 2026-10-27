import { defineField, defineType } from 'sanity';

const categories = ['Rapport d’activité', 'Logos', 'Dossiers de presse', 'Autres documents'];

export const telechargement = defineType({
  name: 'telechargement',
  title: 'Document à télécharger',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'string', description: '200 caractères au maximum.', validation: (r) => r.max(200) }),
    defineField({
      name: 'category', title: 'Catégorie', type: 'string',
      description: 'Détermine la section de la page Téléchargements où le document apparaît.',
      options: { layout: 'radio', list: categories.map((c) => ({ title: c, value: c })) },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'file', title: 'Fichier', type: 'file', options: { accept: '.pdf,.zip,.svg,.png,application/pdf,application/zip,image/svg+xml,image/png' },
      description: 'Formats acceptés : PDF, ZIP, SVG, PNG. À remplir, sauf si le document est sur Google Drive (voir le champ suivant).',
      validation: (r) => r.custom((v, ctx) => (v || (ctx.document as { url?: string } | undefined)?.url ? true : 'Ajoutez un fichier, ou un lien Google Drive')),
    }),
    defineField({
      name: 'url', title: 'Ou lien Google Drive', type: 'url',
      description: 'Pour un document hébergé sur Google Drive ou Google Docs (par exemple le rapport d’activité). Utilisé seulement s’il n’y a pas de fichier ci-dessus.',
      validation: (r) => r.uri({ scheme: ['https'] }).custom((v) => {
        if (!v) return true;
        try { return ['drive.google.com', 'docs.google.com'].includes(new URL(v).hostname) ? true : 'Seuls les liens Google Drive et Google Docs sont acceptés'; } catch { return 'Lien invalide'; }
      }),
    }),
    defineField({ name: 'year', title: 'Année', type: 'string', description: 'Facultatif. Par exemple : 2025.' }),
    defineField({
      name: 'order', title: 'Ordre dans la catégorie', type: 'number', initialValue: 0,
      description: 'Classe les documents d’une même catégorie (0 = en premier, puis 1, 2...).',
      validation: (r) => r.integer().min(0),
    }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false, description: 'Cache le document sans le supprimer.' }),
  ],
  orderings: [{ title: 'Catégorie puis ordre', name: 'catOrder', by: [{ field: 'category', direction: 'asc' }, { field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'category' } },
});

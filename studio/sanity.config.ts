import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { frFRLocale } from '@sanity/locale-fr-fr';
import { schemaTypes } from './schemaTypes';

// documents uniques : on interdit de les dupliquer ou de les supprimer
const singletons = ['librairie', 'podcast', 'rubrique'];

export default defineConfig({
  name: 'unisons',
  title: 'UNi’SONS',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: 'production',
  // interface du Studio en français (boutons, menus, messages)
  plugins: [
    frFRLocale(),
    structureTool({
      structure: (S) =>
        S.list().title('Contenu').items([
          S.documentTypeListItem('evenement').title('Agenda (événements)'),
          S.documentTypeListItem('membre').title('Équipe'),
          S.divider(),
          S.documentTypeListItem('exposition').title('Galerie et rétrospectives'),
          S.listItem().title('Librairie').id('librairie')
            .child(S.document().schemaType('librairie').documentId('librairie').title('Librairie')),
          S.listItem().title('Podcast').id('podcast').child(
            S.list().title('Podcast').items([
              S.listItem().title('Présentation').id('podcast-presentation')
                .child(S.document().schemaType('podcast').documentId('podcast').title('Podcast (présentation)')),
              S.documentTypeListItem('episode').title('Épisodes (vidéos YouTube)'),
            ]),
          ),
          S.documentTypeListItem('telechargement').title('Téléchargements'),
          S.divider(),
          S.listItem().title('Dans la rubrique : L’art est public').id('rubrique-l-art-est-public')
            .child(S.document().schemaType('rubrique').documentId('rubrique-l-art-est-public').title('Dans la rubrique : L’art est public')),
        ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.includes(schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) => (singletons.includes(schemaType) ? prev.filter(({ action }) => action !== 'delete' && action !== 'duplicate') : prev),
  },
});

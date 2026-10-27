import { defineField } from 'sanity';

export const altField = defineField({
  name: 'alt', title: 'Description de la photo', type: 'string',
  description: 'Une phrase qui décrit ce que l’on voit. Elle est lue aux personnes malvoyantes.',
});

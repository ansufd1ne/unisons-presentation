import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: process.env.SANITY_STUDIO_PROJECT_ID, dataset: 'production' },
  studioHost: 'unisons-cms',
  deployment: { appId: 'jjrm0u4ci3b9wmqv3gyikucn' },
});

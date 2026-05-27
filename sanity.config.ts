import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './sanity/schemaTypes';

export default defineConfig({
  name: 'adan-portfolio-cms',
  title: 'Adan Portfolio CMS',
  projectId: 'qmzsyvvx', // Reemplazar después
  dataset: 'production',
  schema: {
    types: schemaTypes,
  },
});

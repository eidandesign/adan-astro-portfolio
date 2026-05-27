import { createClient } from '@sanity/client';

const projectId = 'qmzsyvvx';
const dataset = 'production';
const apiVersion = '2024-01-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function getProjects() {
  try {
    return await client.fetch(`*[_type == "project"] | order(_createdAt desc)`);
  } catch (e) {
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    return await client.fetch(`*[_type == "project" && slug.current == $slug][0]`, { slug });
  } catch (e) {
    return null;
  }
}

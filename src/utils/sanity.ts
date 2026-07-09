import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = 'qmzsyvvx';
const dataset = 'production';
const apiVersion = '2024-01-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export const CONTACT_INFO = `*[_type == "contactInfo"][0]`;

export const PROJECTS_QUERY = `*[_type == "project"] | order(_createdAt desc)`;

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

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

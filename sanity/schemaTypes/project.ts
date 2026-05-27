export const projectType = {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Show on homepage',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Product Design', value: 'product-design' },
          { title: 'UI/UX Design', value: 'ui-ux' },
          { title: 'Branding', value: 'branding' },
          { title: 'Web Design', value: 'web-design' },
          { title: 'Design Systems', value: 'design-systems' },
          { title: 'AI Design', value: 'ai-design' },
        ],
      },
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
    },
    {
      name: 'client',
      title: 'Client/Company',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'role',
      title: 'My Role',
      type: 'string',
      description: 'e.g., Senior Product Designer, UX/UI Designer',
    },
    {
      name: 'team',
      title: 'Team Members',
      type: 'string',
      description: 'Other team members involved',
    },
    {
      name: 'techUsed',
      title: 'Technologies/Tools Used',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g., Figma, Webflow, React',
    },
    {
      name: 'challenge',
      title: 'Challenge / Problem',
      type: 'blockContent',
    },
    {
      name: 'keyOpportunities',
      title: 'Key Opportunities',
      type: 'blockContent',
    },
    {
      name: 'solution',
      title: 'Solution / Approach',
      type: 'blockContent',
    },
    {
      name: 'impact',
      title: 'Impact / Results',
      type: 'blockContent',
    },
    {
      name: 'images',
      title: 'Case Study Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      description: 'Images showcasing the project',
    },
    {
      name: 'caseStudyUrl',
      title: 'External Case Study Link',
      type: 'url',
      description: 'Optional: link to full case study elsewhere',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'heroImage',
    },
  },
};

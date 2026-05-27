export const contactInfoType = {
  name: 'contactInfo',
  title: 'Contact Information',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: any) => Rule.email(),
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      description: 'Include country code, e.g., +1234567890',
    },
    {
      name: 'calendlyUrl',
      title: 'Calendly URL',
      type: 'url',
      description: 'URL for scheduling calls',
    },
    {
      name: 'linkedin',
      title: 'LinkedIn Profile',
      type: 'url',
    },
    {
      name: 'twitter',
      title: 'Twitter/X Profile',
      type: 'url',
    },
    {
      name: 'behance',
      title: 'Behance Portfolio',
      type: 'url',
    },
    {
      name: 'dribbble',
      title: 'Dribbble Portfolio',
      type: 'url',
    },
    {
      name: 'instagram',
      title: 'Instagram Profile',
      type: 'url',
    },
    {
      name: 'github',
      title: 'GitHub Profile',
      type: 'url',
    },
    {
      name: 'whatsapp',
      title: 'WhatsApp Link',
      type: 'url',
      description: 'WhatsApp link for direct messaging',
    },
  ],
};

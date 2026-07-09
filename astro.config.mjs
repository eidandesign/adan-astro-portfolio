import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://www.adancareta.com',
  integrations: [
    react(),
    sitemap({
      // /contact and /portfolio are redirect stubs — keep them out of the sitemap
      filter: (page) => !page.endsWith('/contact/') && !page.endsWith('/portfolio/'),
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  vite: {
    ssr: {
      external: ['sanity']
    }
  }
});

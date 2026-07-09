import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.adancareta.com',
  integrations: [
    sitemap({
      // /contact and /portfolio are redirect stubs — keep them out of the sitemap
      filter: (page) => !page.endsWith('/contact/') && !page.endsWith('/portfolio/'),
    }),
  ],
  output: 'static',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});

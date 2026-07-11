import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.adancareta.com',
  integrations: [
    sitemap({
      // /contact and /portfolio are redirect stubs; /cotizador is a private
      // tool (noindex) — keep them out of the sitemap
      filter: (page) =>
        !page.endsWith('/contact/') &&
        !page.endsWith('/portfolio/') &&
        !page.includes('/cotizador/'),
    }),
  ],
  output: 'static',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});

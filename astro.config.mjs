// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ultiplay.net',

  // Note: `/download` is served by `src/pages/download.astro`, a branded
  // "your download is starting" page that triggers the actual installer
  // download (S3 object with Content-Disposition: attachment) and gives the
  // user a clear way back to the home screen — much friendlier than the bare
  // meta-refresh page Astro emits for static `redirects` entries.

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/thanks') && !page.includes('/download'),
    }),
  ]
});

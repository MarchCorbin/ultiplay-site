// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ultiplay.net',

  // Clean public URL for the installer. /download → S3 "latest" alias.
  // The S3 object responds with Content-Disposition: attachment so the browser
  // saves it as `Ultiplay_Setup.exe` instead of opening it.
  redirects: {
    '/download': 'https://ultiplay-updates.s3.us-east-1.amazonaws.com/releases/installer/Ultiplay_Setup_latest.exe',
  },

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

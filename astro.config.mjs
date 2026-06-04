// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';

// episode.lol 2026  Astro + React islands, deployed to Netlify.
// Pages are static shells; data is fetched client-side from /api/* server
// endpoints (Netlify Functions) so the TheTVDB v4 key never reaches the browser.
export default defineConfig({
  site: 'https://episode.lol',
  output: 'static',
  adapter: netlify(),
  integrations: [react()],
  vite: {
    build: { sourcemap: false },
  },
});

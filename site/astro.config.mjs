import { defineConfig } from 'astro/config';

// Base path + site URL are supplied by the deploy workflow for GitHub Pages.
// Locally they default to a root-served dev site.
const base = process.env.SITE_BASE ?? '/';
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});

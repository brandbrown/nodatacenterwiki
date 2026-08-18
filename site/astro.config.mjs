import { defineConfig } from 'astro/config';

// Base path + site URL are supplied by the deploy workflow for GitHub Pages.
// Locally they default to a root-served dev site. Always keep a trailing slash
// on `base` so `/nodatacenterwiki` + `wiki` does not become `/nodatacenterwikiwiki`.
function normalizeBase(raw) {
  if (!raw || raw === '/') return '/';
  const withLead = raw.startsWith('/') ? raw : `/${raw}`;
  return withLead.endsWith('/') ? withLead : `${withLead}/`;
}

const base = normalizeBase(process.env.SITE_BASE ?? '/');
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});

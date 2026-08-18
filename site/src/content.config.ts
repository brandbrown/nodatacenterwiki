import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The public knowledge base lives OUTSIDE the Astro app, in /content/wiki,
// so the agents can write plain Markdown without touching the site internals.
const wiki = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../content/wiki' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(99),
    domain: z.string().default('general'),
    updated: z.string().optional(),
    sources: z.array(z.string()).default([]),
  }),
});

export const collections = { wiki };

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()),
    github: z.string().optional(),
    year: z.string(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    order: z.number(),
    tags: z.array(z.string()),
    github: z.string().optional(),
    npm: z.string().optional(),
    year: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
  }),
});

export const collections = { projects, tools, blog };

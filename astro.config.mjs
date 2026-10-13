import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://ethanz11.com',
  integrations: [
    mdx(),
    sitemap(),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMermaid],
    }),
  },
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: { prefixDefaultLocale: true },
  },
  redirects: {
    '/': '/zh/',
  },
});

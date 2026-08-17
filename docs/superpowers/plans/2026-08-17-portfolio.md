# AI 个人作品集 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个中英双语、极简高级风的 AI Agent 应用开发者个人作品集网站，部署到 Cloudflare Pages。

**Architecture:** Astro 7 静态站 + i18n 双路由（`/zh/` `/en/`）+ 内容层集合（projects/tools/blog，双语双份）+ GSAP ScrollTrigger 克制动效 + @fontsource 自托管字体（Google Fonts 国内不可达）。

**Tech Stack:** Astro 7.2、TypeScript、MDX、GSAP 3.15、Vitest 4、@fontsource 5.3、Cloudflare Pages。

## Global Constraints

- Astro `^7.2.2`，TypeScript strict（`astro/tsconfigs/strict`）
- i18n：`locales: ['zh', 'en']`，`defaultLocale: 'zh'`，`routing: { prefixDefaultLocale: true }`，根路径 `/` 重定向到 `/zh/`
- 内容层：`src/content.config.ts` + `glob` loader，目录结构 `src/content/<collection>/<locale>/<slug>.mdx`，按 `id.startsWith(locale + '/')` 过滤
- 设计令牌（design tokens）唯一来源：`src/styles/design-tokens.css`，色值 `#FAFAF8` / `#111111` / `#666666` / `#4F7CFF` / `#E5E5E0` / `#0E0E0E`，圆角 14px，阴影 `0 1px 3px rgba(0,0,0,0.06)`
- 字体：Inter（正文）+ Space Grotesk（标题），全部经 @fontsource 自托管，禁止外链 Google Fonts
- 所有 UI 文案走 `src/lib/i18n.ts` 的 `t(locale, key)`，禁止在组件里硬编码文案
- 双语完整性：任何内容要么中英双份齐全，要么不发布
- 事实边界：Voyager 只写 runtime 已实现能力（D-Chat 主链路、MCP/Skills、三层记忆、HITL、OTel 接线），不写"完整企业级产品"、主动推送、完整用户态权限、质量评测门禁；所有数字必须有可核验口径；不收录 RAG 系列、资讯平台、VLM
- 每个任务结束必须 `npm run check` + `npm run build` 通过后提交

---

### Task 1: 项目脚手架 + i18n + 内容层

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/content.config.ts`
- Create: `src/lib/i18n.ts`
- Create: `src/lib/i18n.test.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/[lang]/index.astro`（最小占位页）
- Create: `public/favicon.svg`

**Interfaces:**
- Produces: `t(locale, key)` / `getLangFromUrl(url)` / `Locale` / `UiKey`（Task 3-7 的组件全部依赖）；内容集合 `projects` / `tools` / `blog`（Task 4-5 依赖）

- [ ] **Step 1: 写 package.json**

```json
{
  "name": "portfolio",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "@astrojs/mdx": "^7.0.5",
    "@astrojs/sitemap": "^3.7.3",
    "@fontsource/inter": "^5.3.0",
    "@fontsource/space-grotesk": "^5.3.0",
    "astro": "^7.2.2",
    "gsap": "^3.15.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.10",
    "typescript": "^5.9.0",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: 写 astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://portfolio.pages.dev',
  integrations: [mdx(), sitemap()],
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: { prefixDefaultLocale: true },
  },
  redirects: {
    '/': '/zh/',
  },
});
```

- [ ] **Step 3: 写 tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: 写 .gitignore**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 5: 写 src/content.config.ts**

```ts
import { defineCollection, z } from 'astro:content';
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
```

- [ ] **Step 6: 写 src/lib/i18n.ts**

```ts
export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

export const ui = {
  zh: {
    'nav.projects': '作品',
    'nav.blog': '方法论',
    'nav.about': '关于',
    'hero.role': 'AI Agent 应用开发工程师',
    'hero.tagline': '用 AI 构建 Agent，也用 AI 构建一切。',
    'hero.cta.work': '看作品',
    'hero.cta.resume': '下载简历',
    'section.projects': 'AI 实践作品',
    'section.projects.desc': '用 AI 协作构建的产品与工具——每个作品都记录了我怎么用 AI 思考、选型和迭代。',
    'section.blog': 'AI 思维 / 方法论',
    'section.blog.desc': '关于 Loop Engineering、Agent Benchmark 与 AI Coding 的实践沉淀。',
    'section.about': '关于我',
    'footer.rights': '© 2026 赵一恒',
    'blog.all': '全部文章',
    'blog.back': '返回方法论',
    'project.back': '返回首页',
  },
  en: {
    'nav.projects': 'Work',
    'nav.blog': 'Thinking',
    'nav.about': 'About',
    'hero.role': 'AI Agent Application Engineer',
    'hero.tagline': 'Building agents with AI — and building everything with AI.',
    'hero.cta.work': 'View Work',
    'hero.cta.resume': 'Download Résumé',
    'section.projects': 'AI Practice',
    'section.projects.desc': 'Products and tools built with AI — each one documents how I think, choose, and iterate with AI.',
    'section.blog': 'AI Thinking',
    'section.blog.desc': 'Practical notes on Loop Engineering, Agent Benchmark, and AI Coding.',
    'section.about': 'About',
    'footer.rights': '© 2026 Yiheng Zhao',
    'blog.all': 'All Posts',
    'blog.back': 'Back to Thinking',
    'project.back': 'Back to Home',
  },
} as const;

export type UiKey = keyof typeof ui.zh;

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  return lang === 'en' ? 'en' : 'zh';
}

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
```

- [ ] **Step 7: 写 src/lib/i18n.test.ts（先写测试）**

```ts
import { describe, it, expect } from 'vitest';
import { getLangFromUrl, t, ui } from './i18n';

describe('i18n', () => {
  it('detects locale from URL', () => {
    expect(getLangFromUrl(new URL('https://x.com/zh/'))).toBe('zh');
    expect(getLangFromUrl(new URL('https://x.com/en/'))).toBe('en');
    expect(getLangFromUrl(new URL('https://x.com/'))).toBe('zh');
  });

  it('returns translation for both locales', () => {
    expect(t('zh', 'nav.projects')).toBe('作品');
    expect(t('en', 'nav.projects')).toBe('Work');
  });

  it('has identical key sets in both locales', () => {
    expect(Object.keys(ui.zh).sort()).toEqual(Object.keys(ui.en).sort());
  });
});
```

- [ ] **Step 8: 写 src/layouts/BaseLayout.astro**

```astro
---
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '../styles/global.css';
import { getLangFromUrl } from '../lib/i18n';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
const lang = getLangFromUrl(Astro.url);
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description ?? title} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 9: 写 src/pages/[lang]/index.astro（最小占位，Task 3 会替换）**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { t } from '../../lib/i18n';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params;
const locale = (lang === 'en' ? 'en' : 'zh') as 'zh' | 'en';
---
<BaseLayout title={t(locale, 'hero.role')}>
  <main>
    <h1>{t(locale, 'hero.role')}</h1>
  </main>
</BaseLayout>
```

- [ ] **Step 10: 写 public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0E0E0E"/>
  <circle cx="32" cy="32" r="10" fill="#4F7CFF"/>
</svg>
```

- [ ] **Step 11: 安装依赖并验证**

Run: `npm install`
Expected: 安装成功，无 peer 冲突报错

Run: `npm test`
Expected: 3 个 i18n 测试全部 PASS

Run: `npm run check`
Expected: 无类型错误

Run: `npm run build`
Expected: 构建成功，输出 `dist/`，包含 `/zh/` 与 `/en/` 两个页面

- [ ] **Step 12: 提交**

```bash
git add -A
git commit -m "feat: 脚手架 + i18n + 内容层"
```

---

### Task 2: 设计系统（design tokens + 全局样式）

**Files:**
- Create: `src/styles/design-tokens.css`
- Create: `src/styles/global.css`

**Interfaces:**
- Consumes: Task 1 的 `BaseLayout.astro`（已 import `global.css`）
- Produces: CSS 变量 `--bg` `--ink` `--ink-secondary` `--accent` `--line` `--dark` `--radius` `--shadow` `--font-sans` `--font-display` `--container` `--space-section`；工具类 `.container` `.section` `.section-head` `.reveal`（Task 3-4 组件使用）

- [ ] **Step 1: 写 src/styles/design-tokens.css**

```css
:root {
  --bg: #fafaf8;
  --ink: #111111;
  --ink-secondary: #666666;
  --accent: #4f7cff;
  --line: #e5e5e0;
  --dark: #0e0e0e;
  --radius: 14px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  --font-sans: 'Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
  --font-display: 'Space Grotesk', 'Inter', 'PingFang SC', sans-serif;
  --container: 1200px;
  --space-section: clamp(6rem, 10vw, 10rem);
}
```

- [ ] **Step 2: 写 src/styles/global.css**

```css
@import './design-tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

.container {
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 24px;
}

.section {
  padding: var(--space-section) 0;
}

.section-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 3rem;
}

.section-head .num {
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.08em;
}

.section-head h2 {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 600;
  line-height: 1.2;
}

.section-head .desc {
  color: var(--ink-secondary);
  font-size: 1rem;
  max-width: 560px;
}

@media (max-width: 768px) {
  .section-head {
    flex-direction: column;
    gap: 8px;
  }
}
```

- [ ] **Step 3: 验证构建**

Run: `npm run check && npm run build`
Expected: 无错误，构建成功

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: 设计系统 tokens 与全局样式"
```

---

### Task 3: 布局组件（Nav / Hero / SectionHeader / Footer / LanguageSwitcher）

**Files:**
- Create: `src/components/LanguageSwitcher.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Hero.astro`
- Create: `src/components/SectionHeader.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/pages/[lang]/index.astro`（组装 Hero + 空区块占位）

**Interfaces:**
- Consumes: `t()` / `getLangFromUrl()` / `Locale`（Task 1）；CSS 变量与工具类（Task 2）
- Produces: `Nav`（props: `locale: Locale`）、`Hero`（props: `locale: Locale`）、`SectionHeader`（props: `num: string; title: string; desc?: string`）、`Footer`（props: `locale: Locale`）、`LanguageSwitcher`（props: `locale: Locale`）——Task 4 的首页组装使用

- [ ] **Step 1: 写 src/components/LanguageSwitcher.astro**

```astro
---
import type { Locale } from '../lib/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const path = Astro.url.pathname;
const zhPath = path.replace(/^\/(zh|en)/, '/zh');
const enPath = path.replace(/^\/(zh|en)/, '/en');
---
<div class="lang-switch">
  <a href={zhPath} class:list={{ active: locale === 'zh' }}>中</a>
  <span class="sep">/</span>
  <a href={enPath} class:list={{ active: locale === 'en' }}>EN</a>
</div>

<style>
  .lang-switch {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .lang-switch a {
    color: var(--ink-secondary);
    transition: color 0.2s;
  }
  .lang-switch a:hover {
    color: var(--ink);
  }
  .lang-switch a.active {
    color: var(--accent);
  }
  .sep {
    color: var(--line);
  }
</style>
```

- [ ] **Step 2: 写 src/components/Nav.astro**

```astro
---
import type { Locale } from '../lib/i18n';
import { t } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher.astro';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const links = [
  { href: '#projects', label: t(locale, 'nav.projects') },
  { href: '#blog', label: t(locale, 'nav.blog') },
  { href: '#about', label: t(locale, 'nav.about') },
];
---
<header class="nav" id="site-nav">
  <div class="container nav-inner">
    <a href={`/${locale}/`} class="logo">Yiheng<span class="dot">.</span></a>
    <nav class="nav-links">
      {links.map((l) => <a href={l.href}>{l.label}</a>)}
      <LanguageSwitcher locale={locale} />
    </nav>
  </div>
</header>

<script>
  const nav = document.getElementById('site-nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
</script>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    transition: background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s;
  }
  .nav.scrolled {
    background: rgba(250, 250, 248, 0.85);
    backdrop-filter: blur(12px);
    box-shadow: 0 1px 0 var(--line);
  }
  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  .logo {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .logo .dot {
    color: var(--accent);
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
    font-size: 0.95rem;
  }
  .nav-links a {
    color: var(--ink-secondary);
    transition: color 0.2s;
  }
  .nav-links a:hover {
    color: var(--ink);
  }
  @media (max-width: 640px) {
    .nav-links {
      gap: 16px;
    }
  }
</style>
```

- [ ] **Step 3: 写 src/components/Hero.astro**

```astro
---
import type { Locale } from '../lib/i18n';
import { t } from '../lib/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
---
<section class="hero">
  <div class="container hero-inner">
    <p class="hero-kicker" data-hero-line>ZHAO YIHENG</p>
    <h1 class="hero-title">
      <span data-hero-line>{t(locale, 'hero.role')}</span>
    </h1>
    <p class="hero-tagline" data-hero-line>{t(locale, 'hero.tagline')}</p>
    <div class="hero-cta" data-hero-line>
      <a href="#projects" class="btn btn-primary">{t(locale, 'hero.cta.work')}</a>
      <a href="/resume.pdf" class="btn btn-ghost" target="_blank">{t(locale, 'hero.cta.resume')}</a>
    </div>
  </div>
</section>

<style>
  .hero {
    background: var(--dark);
    color: #f5f5f2;
    padding: clamp(9rem, 18vh, 13rem) 0 clamp(5rem, 10vh, 8rem);
  }
  .hero-inner {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .hero-kicker {
    font-family: var(--font-display);
    font-size: 0.85rem;
    letter-spacing: 0.35em;
    color: var(--accent);
  }
  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(3rem, 8vw, 6.5rem);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
    max-width: 14em;
  }
  .hero-tagline {
    font-size: clamp(1.05rem, 2vw, 1.3rem);
    color: rgba(245, 245, 242, 0.72);
    max-width: 34em;
  }
  .hero-cta {
    display: flex;
    gap: 16px;
    margin-top: 1rem;
  }
  .btn {
    display: inline-block;
    padding: 0.8rem 1.8rem;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 500;
    transition: transform 0.2s, opacity 0.2s;
  }
  .btn:hover {
    transform: translateY(-2px);
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-ghost {
    border: 1px solid rgba(245, 245, 242, 0.3);
    color: #f5f5f2;
  }
  .btn-ghost:hover {
    opacity: 0.8;
  }
</style>
```

- [ ] **Step 4: 写 src/components/SectionHeader.astro**

```astro
---
interface Props {
  num: string;
  title: string;
  desc?: string;
}

const { num, title, desc } = Astro.props;
---
<div class="section-head" data-reveal>
  <span class="num">{num}</span>
  <h2>{title}</h2>
  {desc && <p class="desc">{desc}</p>}
</div>
```

- [ ] **Step 5: 写 src/components/Footer.astro**

```astro
---
import type { Locale } from '../lib/i18n';
import { t } from '../lib/i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
---
<footer class="footer">
  <div class="container footer-inner">
    <p class="rights">{t(locale, 'footer.rights')}</p>
    <div class="social">
      <a href="https://github.com/Ethanz11-creat" target="_blank" rel="noopener">GitHub</a>
      <a href="mailto:zhaoyiheng@example.com">Email</a>
    </div>
  </div>
</footer>

<style>
  .footer {
    border-top: 1px solid var(--line);
    padding: 2.5rem 0;
  }
  .footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--ink-secondary);
  }
  .social {
    display: flex;
    gap: 20px;
  }
  .social a {
    transition: color 0.2s;
  }
  .social a:hover {
    color: var(--accent);
  }
  @media (max-width: 640px) {
    .footer-inner {
      flex-direction: column;
      gap: 12px;
    }
  }
</style>
```

- [ ] **Step 6: 替换 src/pages/[lang]/index.astro（组装 Hero + 空区块）**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Hero from '../../components/Hero.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import Footer from '../../components/Footer.astro';
import { t } from '../../lib/i18n';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params;
const locale = (lang === 'en' ? 'en' : 'zh') as 'zh' | 'en';
---
<BaseLayout title={t(locale, 'hero.role')}>
  <Nav locale={locale} />
  <Hero locale={locale} />
  <main>
    <section id="projects" class="section">
      <div class="container">
        <SectionHeader num="01" title={t(locale, 'section.projects')} desc={t(locale, 'section.projects.desc')} />
      </div>
    </section>
    <section id="blog" class="section">
      <div class="container">
        <SectionHeader num="02" title={t(locale, 'section.blog')} desc={t(locale, 'section.blog.desc')} />
      </div>
    </section>
    <section id="about" class="section">
      <div class="container">
        <SectionHeader num="03" title={t(locale, 'section.about')} />
      </div>
    </section>
  </main>
  <Footer locale={locale} />
</BaseLayout>
```

- [ ] **Step 7: 验证**

Run: `npm run check && npm run build`
Expected: 无错误

Run: `npm run dev`（后台），用浏览器访问 `http://localhost:4321/zh/` 与 `http://localhost:4321/en/`
Expected: 深色 Hero 区、导航栏、语言切换器正常渲染；切换「中/EN」URL 正确变化

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat: 布局组件 Nav/Hero/SectionHeader/Footer"
```

---

### Task 4: 内容组件与页面（ProjectCard / BlogCard / 详情页 / 博客列表 / 404）

**Files:**
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/BlogCard.astro`
- Create: `src/pages/[lang]/projects/[slug].astro`
- Create: `src/pages/[lang]/blog/index.astro`
- Create: `src/pages/[lang]/blog/[slug].astro`
- Create: `src/pages/404.astro`
- Modify: `src/pages/[lang]/index.astro`（接入项目/博客列表渲染）

**Interfaces:**
- Consumes: 内容集合 `projects` / `tools` / `blog`（Task 1）；`t()` / `Locale`；CSS 变量
- Produces: `ProjectCard`（props: `entry: CollectionEntry<'projects'>`）、`BlogCard`（props: `entry: CollectionEntry<'blog'>`）——首页与列表页使用

- [ ] **Step 1: 写 src/components/ProjectCard.astro**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  entry: CollectionEntry<'projects'>;
}

const { entry } = Astro.props;
const { title, subtitle, tags, github, featured, metrics } = entry.data;
const href = `/${entry.id.split('/')[0]}/projects/${entry.id.split('/')[1]}/`;
---
<a href={href} class:list={['project-card', { featured }]} data-reveal>
  <div class="card-head">
    <h3>{title}</h3>
    {github && <span class="gh">GitHub ↗</span>}
  </div>
  <p class="subtitle">{subtitle}</p>
  {metrics && (
    <ul class="metrics">
      {metrics.map((m) => (
        <li>
          <strong>{m.value}</strong>
          <span>{m.label}</span>
        </li>
      ))}
    </ul>
  )}
  <ul class="tags">
    {tags.map((tag) => <li>{tag}</li>)}
  </ul>
</a>

<style>
  .project-card {
    display: block;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 2rem;
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  }
  .project-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
    box-shadow: 0 8px 24px rgba(79, 124, 255, 0.12);
  }
  .project-card.featured {
    grid-column: span 2;
  }
  .card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 0.6rem;
  }
  .card-head h3 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .gh {
    font-size: 0.8rem;
    color: var(--accent);
    white-space: nowrap;
  }
  .subtitle {
    color: var(--ink-secondary);
    font-size: 0.98rem;
    margin-bottom: 1.2rem;
  }
  .metrics {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.2rem;
  }
  .metrics li {
    display: flex;
    flex-direction: column;
  }
  .metrics strong {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--ink);
  }
  .metrics span {
    font-size: 0.78rem;
    color: var(--ink-secondary);
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .tags li {
    font-size: 0.78rem;
    color: var(--ink-secondary);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
    transition: color 0.2s, border-color 0.2s;
  }
  .project-card:hover .tags li {
    color: var(--accent);
    border-color: var(--accent);
  }
  @media (max-width: 900px) {
    .project-card.featured {
      grid-column: span 1;
    }
  }
</style>
```

- [ ] **Step 2: 写 src/components/BlogCard.astro**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  entry: CollectionEntry<'blog'>;
}

const { entry } = Astro.props;
const { title, description, date, tags } = entry.data;
const locale = entry.id.split('/')[0];
const href = `/${locale}/blog/${entry.id.split('/')[1]}/`;
const dateStr = date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
---
<a href={href} class="blog-card" data-reveal>
  <time>{dateStr}</time>
  <h3>{title}</h3>
  <p>{description}</p>
  <ul class="tags">
    {tags.map((tag) => <li>{tag}</li>)}
  </ul>
</a>

<style>
  .blog-card {
    display: block;
    padding: 1.6rem 0;
    border-bottom: 1px solid var(--line);
    transition: padding-left 0.25s;
  }
  .blog-card:hover {
    padding-left: 12px;
  }
  .blog-card time {
    font-family: var(--font-display);
    font-size: 0.8rem;
    color: var(--accent);
    letter-spacing: 0.06em;
  }
  .blog-card h3 {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0.3rem 0 0.4rem;
    letter-spacing: -0.01em;
  }
  .blog-card p {
    color: var(--ink-secondary);
    font-size: 0.95rem;
    max-width: 640px;
  }
  .blog-card .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 0.8rem;
  }
  .blog-card .tags li {
    font-size: 0.75rem;
    color: var(--ink-secondary);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
  }
</style>
```

- [ ] **Step 3: 写 src/pages/[lang]/projects/[slug].astro**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import { t } from '../../../lib/i18n';

export async function getStaticPaths() {
  const entries = await getCollection('projects');
  return entries.map((entry) => {
    const [lang, slug] = entry.id.split('/');
    return { params: { lang, slug }, props: { entry } };
  });
}

const { entry } = Astro.props;
const locale = (entry.id.split('/')[0] === 'en' ? 'en' : 'zh') as 'zh' | 'en';
const { Content } = await render(entry);
const { title, subtitle, tags, github, metrics } = entry.data;
---
<BaseLayout title={title}>
  <Nav locale={locale} />
  <main class="project-page">
    <div class="container">
      <a href={`/${locale}/#projects`} class="back">← {t(locale, 'project.back')}</a>
      <header class="project-head" data-reveal>
        <h1>{title}</h1>
        <p class="subtitle">{subtitle}</p>
        {metrics && (
          <ul class="metrics">
            {metrics.map((m) => (
              <li><strong>{m.value}</strong><span>{m.label}</span></li>
            ))}
          </ul>
        )}
        <ul class="tags">
          {tags.map((tag) => <li>{tag}</li>)}
        </ul>
        {github && <a href={github} class="gh-link" target="_blank" rel="noopener">GitHub ↗</a>}
      </header>
      <article class="prose" data-reveal>
        <Content />
      </article>
    </div>
  </main>
  <Footer locale={locale} />
</BaseLayout>

<style>
  .project-page {
    padding-top: 7rem;
    padding-bottom: 5rem;
  }
  .back {
    display: inline-block;
    font-size: 0.9rem;
    color: var(--ink-secondary);
    margin-bottom: 2.5rem;
    transition: color 0.2s;
  }
  .back:hover {
    color: var(--accent);
  }
  .project-head {
    margin-bottom: 3rem;
  }
  .project-head h1 {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }
  .project-head .subtitle {
    color: var(--ink-secondary);
    font-size: 1.1rem;
    margin-top: 0.8rem;
    max-width: 640px;
  }
  .project-head .metrics {
    display: flex;
    gap: 2.5rem;
    margin-top: 1.6rem;
  }
  .project-head .metrics li {
    display: flex;
    flex-direction: column;
  }
  .project-head .metrics strong {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 600;
  }
  .project-head .metrics span {
    font-size: 0.8rem;
    color: var(--ink-secondary);
  }
  .project-head .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 1.4rem;
  }
  .project-head .tags li {
    font-size: 0.8rem;
    color: var(--ink-secondary);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.25rem 0.8rem;
  }
  .gh-link {
    display: inline-block;
    margin-top: 1.4rem;
    color: var(--accent);
    font-size: 0.95rem;
  }
  .prose {
    max-width: 720px;
  }
  .prose h2 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 2.5rem 0 1rem;
  }
  .prose p {
    margin-bottom: 1.2rem;
    color: #333;
  }
  .prose ul {
    list-style: disc;
    padding-left: 1.4rem;
    margin-bottom: 1.2rem;
  }
  .prose li {
    margin-bottom: 0.4rem;
  }
  .prose strong {
    font-weight: 600;
  }
</style>
```

- [ ] **Step 4: 写 src/pages/[lang]/blog/index.astro**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import BlogCard from '../../../components/BlogCard.astro';
import Footer from '../../../components/Footer.astro';
import { t } from '../../../lib/i18n';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params;
const locale = (lang === 'en' ? 'en' : 'zh') as 'zh' | 'en';
const posts = (await getCollection('blog', ({ id }) => id.startsWith(locale + '/')))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title={t(locale, 'section.blog')}>
  <Nav locale={locale} />
  <main class="blog-page">
    <div class="container">
      <a href={`/${locale}/#blog`} class="back">← {t(locale, 'blog.back')}</a>
      <h1 class="page-title">{t(locale, 'section.blog')}</h1>
      <div class="list">
        {posts.map((post) => <BlogCard entry={post} />)}
      </div>
    </div>
  </main>
  <Footer locale={locale} />
</BaseLayout>

<style>
  .blog-page {
    padding-top: 7rem;
    padding-bottom: 5rem;
  }
  .back {
    display: inline-block;
    font-size: 0.9rem;
    color: var(--ink-secondary);
    margin-bottom: 2rem;
    transition: color 0.2s;
  }
  .back:hover {
    color: var(--accent);
  }
  .page-title {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    margin-bottom: 2.5rem;
  }
  .list {
    max-width: 760px;
  }
</style>
```

- [ ] **Step 5: 写 src/pages/[lang]/blog/[slug].astro**

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Nav from '../../../components/Nav.astro';
import Footer from '../../../components/Footer.astro';
import { t } from '../../../lib/i18n';

export async function getStaticPaths() {
  const entries = await getCollection('blog');
  return entries.map((entry) => {
    const [lang, slug] = entry.id.split('/');
    return { params: { lang, slug }, props: { entry } };
  });
}

const { entry } = Astro.props;
const locale = (entry.id.split('/')[0] === 'en' ? 'en' : 'zh') as 'zh' | 'en';
const { Content } = await render(entry);
const { title, description, date, tags } = entry.data;
const dateStr = date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---
<BaseLayout title={title} description={description}>
  <Nav locale={locale} />
  <main class="post-page">
    <div class="container">
      <a href={`/${locale}/blog/`} class="back">← {t(locale, 'blog.back')}</a>
      <header class="post-head" data-reveal>
        <time>{dateStr}</time>
        <h1>{title}</h1>
        <p class="desc">{description}</p>
        <ul class="tags">
          {tags.map((tag) => <li>{tag}</li>)}
        </ul>
      </header>
      <article class="prose" data-reveal>
        <Content />
      </article>
    </div>
  </main>
  <Footer locale={locale} />
</BaseLayout>

<style>
  .post-page {
    padding-top: 7rem;
    padding-bottom: 5rem;
  }
  .back {
    display: inline-block;
    font-size: 0.9rem;
    color: var(--ink-secondary);
    margin-bottom: 2.5rem;
    transition: color 0.2s;
  }
  .back:hover {
    color: var(--accent);
  }
  .post-head {
    margin-bottom: 3rem;
  }
  .post-head time {
    font-family: var(--font-display);
    font-size: 0.85rem;
    color: var(--accent);
    letter-spacing: 0.06em;
  }
  .post-head h1 {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin: 0.6rem 0 1rem;
  }
  .post-head .desc {
    color: var(--ink-secondary);
    font-size: 1.05rem;
    max-width: 640px;
  }
  .post-head .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 1.2rem;
  }
  .post-head .tags li {
    font-size: 0.8rem;
    color: var(--ink-secondary);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.25rem 0.8rem;
  }
  .prose {
    max-width: 720px;
  }
  .prose h2 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 2.5rem 0 1rem;
  }
  .prose h3 {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 1.8rem 0 0.8rem;
  }
  .prose p {
    margin-bottom: 1.2rem;
    color: #333;
  }
  .prose ul {
    list-style: disc;
    padding-left: 1.4rem;
    margin-bottom: 1.2rem;
  }
  .prose li {
    margin-bottom: 0.4rem;
  }
  .prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.92rem;
  }
  .prose th,
  .prose td {
    border: 1px solid var(--line);
    padding: 0.6rem 0.9rem;
    text-align: left;
  }
  .prose th {
    background: #f2f2ee;
    font-weight: 600;
  }
  .prose blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 1.2rem;
    color: var(--ink-secondary);
    margin: 1.5rem 0;
  }
  .prose code {
    background: #f2f2ee;
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
    font-size: 0.88em;
  }
</style>
```

- [ ] **Step 6: 写 src/pages/404.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="404">
  <main class="nf">
    <div class="container">
      <h1>404</h1>
      <p>Page not found · 页面不存在</p>
      <a href="/zh/">← 返回首页</a>
    </div>
  </main>
</BaseLayout>

<style>
  .nf {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  .nf h1 {
    font-family: var(--font-display);
    font-size: 4rem;
    font-weight: 600;
  }
  .nf p {
    color: var(--ink-secondary);
    margin: 0.5rem 0 1.5rem;
  }
  .nf a {
    color: var(--accent);
  }
</style>
```

- [ ] **Step 7: 更新 src/pages/[lang]/index.astro（接入项目与博客列表）**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Nav from '../../components/Nav.astro';
import Hero from '../../components/Hero.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import BlogCard from '../../components/BlogCard.astro';
import Footer from '../../components/Footer.astro';
import { getCollection } from 'astro:content';
import { t } from '../../lib/i18n';

export function getStaticPaths() {
  return [{ params: { lang: 'zh' } }, { params: { lang: 'en' } }];
}

const { lang } = Astro.params;
const locale = (lang === 'en' ? 'en' : 'zh') as 'zh' | 'en';
const projects = (await getCollection('projects', ({ id }) => id.startsWith(locale + '/')))
  .sort((a, b) => a.data.order - b.data.order);
const tools = (await getCollection('tools', ({ id }) => id.startsWith(locale + '/')))
  .sort((a, b) => a.data.order - b.data.order);
const posts = (await getCollection('blog', ({ id }) => id.startsWith(locale + '/')))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);
---
<BaseLayout title={t(locale, 'hero.role')}>
  <Nav locale={locale} />
  <Hero locale={locale} />
  <main>
    <section id="projects" class="section">
      <div class="container">
        <SectionHeader num="01" title={t(locale, 'section.projects')} desc={t(locale, 'section.projects.desc')} />
        <div class="project-grid">
          {projects.map((p) => <ProjectCard entry={p} />)}
        </div>
      </div>
    </section>
    <section id="blog" class="section">
      <div class="container">
        <SectionHeader num="02" title={t(locale, 'section.blog')} desc={t(locale, 'section.blog.desc')} />
        <div class="blog-list">
          {posts.map((post) => <BlogCard entry={post} />)}
        </div>
        <a href={`/${locale}/blog/`} class="all-link">{t(locale, 'blog.all')} →</a>
      </div>
    </section>
    <section id="about" class="section">
      <div class="container">
        <SectionHeader num="03" title={t(locale, 'section.about')} />
      </div>
    </section>
  </main>
  <Footer locale={locale} />
</BaseLayout>

<style>
  .project-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .blog-list {
    max-width: 760px;
  }
  .all-link {
    display: inline-block;
    margin-top: 1.5rem;
    color: var(--accent);
    font-size: 0.95rem;
  }
  @media (max-width: 900px) {
    .project-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 8: 验证**

Run: `npm run check && npm run build`
Expected: 无错误；`dist/` 包含 `/zh/projects/`、`/en/projects/`、`/zh/blog/`、`/en/blog/` 路由（此时内容为空，页面渲染空列表属正常）

- [ ] **Step 9: 提交**

```bash
git add -A
git commit -m "feat: 内容组件与页面路由"
```

---

### Task 5: 双语内容填充

**Files:**
- Create: `src/content/projects/zh/flowtype.mdx`、`src/content/projects/en/flowtype.mdx`
- Create: `src/content/projects/zh/voyager.mdx`、`src/content/projects/en/voyager.mdx`
- Create: `src/content/tools/zh/feishu-skills.mdx`、`src/content/tools/en/feishu-skills.mdx`
- Create: `src/content/tools/zh/job-tracker.mdx`、`src/content/tools/en/job-tracker.mdx`
- Create: `src/content/blog/zh/loop-engineering.mdx`、`src/content/blog/en/loop-engineering.mdx`
- Create: `src/content/blog/zh/agent-benchmark.mdx`、`src/content/blog/en/agent-benchmark.mdx`
- Create: `src/content/blog/zh/ai-coding-sop.mdx`、`src/content/blog/en/ai-coding-sop.mdx`
- Create: `public/resume.pdf`（复制自 `/Users/yiheng/vibecoding/简历润色/秋招简历0719/zyh_秋招_0813.pdf`）

**Interfaces:**
- Consumes: Task 1 的集合 schema（frontmatter 字段必须完全匹配）
- Produces: 全部双语内容——Task 4 的页面渲染它们

**事实源（写作时必须对照）：**
- Flowtype：`https://github.com/Ethanz11-creat/Flowtype` 的 `flowtype-local` 分支 README
- Voyager：`/Users/yiheng/dd-work/product-claw` 的 `docs/README.md`；边界见 Global Constraints
- 博客：`/Users/yiheng/Library/Mobile Documents/iCloud~md~obsidian/Documents/dd-work/AI 分享/` 下对应文档

- [ ] **Step 1: 写 src/content/projects/zh/flowtype.mdx**

```mdx
---
title: Flowtype
subtitle: 语音转 prompt 的 macOS 应用——把口语化的想法一键变成结构化编码指令
order: 1
featured: true
tags: [Swift, MLX, Qwen3-ASR, LLM, SQLite]
github: https://github.com/Ethanz11-creat/Flowtype
year: '2026'
metrics:
  - value: '5'
    label: 流水线阶段
  - value: '0'
    label: Python 依赖
  - value: '300MB'
    label: 本地 4-bit 模型
---

## 做什么

Flowtype 是一个为 AI 编码工作流设计的 macOS 语音输入应用：双击 Command 开始录音，再按一次输出原始转写，双击结束则输出经 LLM 润色后的结构化 prompt，并直接注入当前聚焦的输入框。

## 怎么用 AI 做的

- **本地模型落地**：用 speech-swift（Qwen3-ASR via MLX，约 300MB 4-bit 量化）在 Swift 内直接完成转写，砍掉 Python 服务端，实现零 Python 依赖
- **模块化流水线**：Recording → ASR → PostProcess → Polish → Injection 五阶段，SessionContext 状态贯穿全程
- **产品闭环**：SQLite（GRDB）历史记录、统计面板、GitHub 风格热力图、隐私优先（音频不落盘）

## 技术要点

- Swift 6.2 / macOS 15+，SwiftUI
- Qwen3-ASR 本地推理（MLX），AppleSpeech 兜底
- 多 LLM Provider（OpenAI 兼容），词典与风格包
```

- [ ] **Step 2: 写 src/content/projects/en/flowtype.mdx（忠实翻译 zh 版）**

```mdx
---
title: Flowtype
subtitle: A macOS voice-to-prompt app — turning spoken, messy thoughts into structured coding prompts with one keypress
order: 1
featured: true
tags: [Swift, MLX, Qwen3-ASR, LLM, SQLite]
github: https://github.com/Ethanz11-creat/Flowtype
year: '2026'
metrics:
  - value: '5'
    label: Pipeline stages
  - value: '0'
    label: Python deps
  - value: '300MB'
    label: Local 4-bit model
---

## What it does

Flowtype is a macOS voice input app built for AI coding workflows: double-press Command to start recording, press once to output the raw transcript, or double-press to end and get an LLM-polished structured prompt injected directly into the focused field.

## How I built it with AI

- **Local model, no server**: transcription runs in Swift via speech-swift (Qwen3-ASR through MLX, ~300MB 4-bit), eliminating the Python server entirely — zero Python dependencies
- **Modular pipeline**: Recording → ASR → PostProcess → Polish → Injection, with SessionContext state flowing through every stage
- **Product loop**: SQLite (GRDB) history, stats dashboard, GitHub-style heatmap, privacy-first (audio never touches disk)

## Technical highlights

- Swift 6.2 / macOS 15+, SwiftUI
- Qwen3-ASR local inference (MLX), AppleSpeech fallback
- Multiple LLM providers (OpenAI-compatible), dictionary & style packs
```

- [ ] **Step 3: 写 src/content/projects/zh/voyager.mdx**

```mdx
---
title: Voyager Agent Runtime
subtitle: 基于 Go 与 Eino ADK 自研的企业智能分析 Agent Runtime
order: 2
featured: true
tags: [Go, Eino ADK, MCP, Skills, HITL, OTel]
github: https://github.com/Ethanz11-creat/product-claw
year: '2026'
metrics:
  - value: '3'
    label: 层记忆架构
  - value: '2'
    label: 会话形态
  - value: '1'
    label: 可执行闭环
---

## 做什么

Voyager 是一个面向企业内部多源信息查询的 Agent Runtime：从 D-Chat 请求接入、工具调用到会话持久化与运行审计的可执行闭环。

## Runtime 能力

- **工具治理**：ToolSpec、动态 ToolSearch、Policy 与 ToolGuard 统一工具发现、按轮装配与调用校验；循环检测、结果卸载与上下文压缩治理长链路查询
- **三层记忆**：L1 工作上下文、L2 用户长期记忆、L3 会话档案；按 user × surface 隔离，群聊与私聊的持久化、拆分与脱敏策略分离
- **可靠性与可观测性**：Orchestrator + 短路式 Pipeline 统一运行生命周期，Goal/Checkpoint、HITL 中断恢复、后台 Review；结构化 turn 审计、Stage Trace 与 OTel 接线

## 怎么用 AI 做的

- 全程 AI 结对：需求澄清 → 方案 → 计划 → 分阶段执行 → 测试验收
- 用 benchmark 思想建立回归基线，每次改动对照评测集验证
```

- [ ] **Step 4: 写 src/content/projects/en/voyager.mdx（忠实翻译 zh 版）**

```mdx
---
title: Voyager Agent Runtime
subtitle: A self-built enterprise intelligence Agent Runtime in Go with the Eino ADK
order: 2
featured: true
tags: [Go, Eino ADK, MCP, Skills, HITL, OTel]
github: https://github.com/Ethanz11-creat/product-claw
year: '2026'
metrics:
  - value: '3'
    label: Memory layers
  - value: '2'
    label: Session modes
  - value: '1'
    label: Executable loop
---

## What it is

Voyager is an Agent Runtime for enterprise multi-source information queries: an executable loop from D-Chat request intake and tool invocation to session persistence and run auditing.

## Runtime capabilities

- **Tool governance**: ToolSpec, dynamic ToolSearch, Policy and ToolGuard unify tool discovery, per-turn assembly and invocation validation; loop detection, result offloading and context compression tame long-horizon queries
- **Three-layer memory**: L1 working context, L2 user long-term memory, L3 session archive; isolated by user × surface, with separate persistence, splitting and desensitization policies for group vs. private chats
- **Reliability & observability**: Orchestrator + short-circuit Pipeline unify the run lifecycle — Goal/Checkpoint, HITL interrupt recovery, background Review; structured turn audit, Stage Trace and OTel wiring

## How I built it with AI

- Full AI pair-programming: requirements clarification → proposal → plan → staged execution → test acceptance
- Benchmark-driven regression: every change is validated against an evaluation set
```

- [ ] **Step 5: 写 src/content/tools/zh/feishu-skills.mdx**

```mdx
---
title: 飞书 MCP Skills 生态
subtitle: 为 Claude Code 构建的飞书全家桶 Skills——文档、表格、日历、IM、审批等 20+ 原子能力
order: 1
tags: [MCP, Skills, Claude Code, 飞书]
github: https://github.com/Ethanz11-creat
year: '2026'
---

## 做什么

围绕飞书开放平台构建的 lark-* Skills 集合：lark-doc、lark-sheets、lark-base、lark-im、lark-calendar、lark-approval 等，让 Agent 能直接读写飞书文档、表格、多维表格，收发消息，处理审批。

## 怎么用 AI 做的

- 每个 Skill 都是「API 调研 → 能力封装 → 边界测试 → 文档化」的 AI 协作产物
- 用真实场景回归（发消息、建表格、查日历）验证每个 Skill 的可靠性
```

- [ ] **Step 6: 写 src/content/tools/en/feishu-skills.mdx（忠实翻译 zh 版）**

```mdx
---
title: Feishu MCP Skills Ecosystem
subtitle: A family of lark-* Skills for Claude Code — docs, sheets, calendar, IM, approvals and 20+ atomic capabilities
order: 1
tags: [MCP, Skills, Claude Code, Feishu]
github: https://github.com/Ethanz11-creat
year: '2026'
---

## What it is

A collection of lark-* Skills built on the Feishu open platform: lark-doc, lark-sheets, lark-base, lark-im, lark-calendar, lark-approval and more — letting agents read and write Feishu docs, sheets, bitables, send messages and handle approvals.

## How I built it with AI

- Every Skill is an AI-collaborative artifact: API research → capability wrapping → boundary testing → documentation
- Reliability verified through real-scenario regressions (sending messages, creating sheets, checking calendars)
```

- [ ] **Step 7: 写 src/content/tools/zh/job-tracker.mdx**

```mdx
---
title: job-tracker / job-mail-watcher
subtitle: 秋招自动化：岗位投递追踪 + 招聘邮件监控提醒
order: 2
tags: [TypeScript, Python, 自动化]
github: https://github.com/Ethanz11-creat/job-tracker
year: '2026'
---

## 做什么

秋招期间自建的求职自动化工具链：job-tracker（TypeScript）管理投递状态与进度，job-mail-watcher（Python）监控招聘邮件并自动提醒。

## 怎么用 AI 做的

- 需求 → 方案 → 实现全程 AI 协作，两天内从零到可用
- 用 AI 做代码审查与边界测试，保证邮件解析的健壮性
```

- [ ] **Step 8: 写 src/content/tools/en/job-tracker.mdx（忠实翻译 zh 版）**

```mdx
---
title: job-tracker / job-mail-watcher
subtitle: Job-hunting automation — application tracking plus recruitment email monitoring
order: 2
tags: [TypeScript, Python, Automation]
github: https://github.com/Ethanz11-creat/job-tracker
year: '2026'
---

## What it is

A self-built automation toolchain for the campus recruiting season: job-tracker (TypeScript) manages application status and progress; job-mail-watcher (Python) monitors recruitment emails and alerts automatically.

## How I built it with AI

- Requirements → proposal → implementation, all AI-collaborative, from zero to usable in two days
- AI-assisted code review and edge-case testing keep email parsing robust
```

- [ ] **Step 9: 写 src/content/blog/zh/loop-engineering.mdx**

```mdx
---
title: 从 Loop 到 Loop Engineering
description: 从 Prompt Engineering 到 Loop Engineering——AI 连续自主工作时长变长，工程重点如何迁移
date: 2026-06-25
tags: [AI-Coding, Agent, Loop-Engineering]
---

## 核心观点

Loop Engineering 不是"把提示词重复执行"，而是设计一套替你提示、调度、验证和交接 Agent 的系统。你从直接提示 Agent 的参与者，转为设计 Agent 自运行工作流的系统设计者。

## 四个阶段

过去两年，AI 辅助开发持续变化的底层变量是：**AI 可连续自主工作的时长越来越长**。每一阶段都对应一个新的工程重点。

| 阶段 | 优化对象 | 工作单位 | 核心命题 | 连续自主时长 |
| --- | --- | --- | --- | --- |
| Prompt Engineering | 单条指令的措辞 | 一次手动对话 | 措辞更准，单次输出更好 | 一问一答 |
| Context Engineering | 进入上下文窗口的内容 | 围绕一次回答的环境 | 背景给对，难任务也能推理 | 数十步 |
| Harness Engineering | 单个任务的安全、可靠执行环境 | 一个自主会话 | 环境造好，Agent 可长时间自主运行 | 数小时 |
| Loop Engineering | 跨会话的自运行工作流 | 多轮、跨会话生命周期 | 系统造好，可无人值守持续交付 | 数天、数十实例并行 |

## 实践中的体会

- 每个阶段都有典型瓶颈：Prompt 阶段是输出质量，Context 阶段是上下文缺失或过载，Harness 阶段是单会话无人调度，Loop 阶段是过早停止、忽略错误、无法验证完成
- 从"参与者"到"系统设计者"的转变，是 AI 协作方式最重要的分水岭
- 设计 Loop 时，验证完成与错误处理比提示词本身更重要
```

- [ ] **Step 10: 写 src/content/blog/en/loop-engineering.mdx（忠实翻译 zh 版）**

```mdx
---
title: From Loop to Loop Engineering
description: From prompt engineering to loop engineering — as AI's continuous autonomous work span grows, the engineering focus shifts
date: 2026-06-25
tags: [AI-Coding, Agent, Loop-Engineering]
---

## The core thesis

Loop Engineering is not "repeating a prompt" — it is designing a system that prompts, schedules, validates and hands off agents on your behalf. You move from being a participant who prompts agents directly, to a system designer who builds self-running agent workflows.

## Four stages

The underlying variable driving AI-assisted development over the past two years: **AI's continuous autonomous work span keeps growing**. Each stage brings a new engineering focus.

| Stage | Optimizes | Unit of work | Core question | Autonomous span |
| --- | --- | --- | --- | --- |
| Prompt Engineering | Wording of a single instruction | One manual conversation | Better wording, better single output | One Q&A |
| Context Engineering | What enters the context window | The environment around one answer | Right context, hard tasks become tractable | Tens of steps |
| Harness Engineering | Safe, reliable execution environment for one task | One autonomous session | Build the environment, agents run long | Hours |
| Loop Engineering | Self-running workflows across sessions | Multi-round, cross-session lifecycle | Build the system, unattended continuous delivery | Days, dozens of parallel instances |

## Lessons from practice

- Each stage has a typical bottleneck: output quality at the Prompt stage, missing or overloaded context at the Context stage, unscheduled single sessions at the Harness stage, and premature stopping, ignored errors and unverifiable completion at the Loop stage
- The shift from "participant" to "system designer" is the most important watershed in AI collaboration
- When designing loops, completion verification and error handling matter more than the prompts themselves
```

- [ ] **Step 11: 写 src/content/blog/zh/agent-benchmark.mdx**

```mdx
---
title: Benchmark 怎么用：搭 Agent 的人该如何使用 benchmark
description: benchmark 不是考卷，是答案库——读榜选型、抄判分方法、切片诊断
date: 2026-07-08
tags: [Agent, Benchmark, 评测]
---

## 问题

搭 Agent 的团队几乎都经历过这个循环：改了一版，手动试三五个 case，感觉好多了，上线。过两天用户又报了一个新 badcase，再补丁式修改。

这个循环的问题不在于改得慢，在于**没有坐标系**：不知道这次修改让系统整体变好还是变坏，也不知道问题出在链路的哪一段。归结起来就是一个问题：**Agent 怎么知道自己做对了？**

## 正路：把循环倒过来

先定义"好"是什么（评测集 + 判分标准），再让每次修改对着评测集回归。修改的最小单位不再是"改了个功能"，而是"评测分从 61 → 68，退化 0 例"。

## 从 benchmark 身上拿三样东西

1. **读榜选型**：用公开榜单比较模型与方案
2. **抄判分方法**：借鉴公开 benchmark 的判分标准，建自己的评测集
3. **切片诊断**：出问题时，把单次执行拆成节点逐段定位

## 一次执行的 7 个节点

任何一个 Agent 系统，不管什么框架、什么模型，单次请求都可以拆成 7 个节点：输入理解与澄清、检索/工具调用、上下文组装、推理规划、执行、结果验证、输出。每个节点都有典型的坏法——该问不问、拿着歧义需求猛跑；检索结果不相关；验证缺失导致幻觉输出。

## 实践体会

- 评测集不是一次建完的：每发现一个 badcase，就把它沉淀进评测集
- 判分标准要可执行：能说清"什么算对"，才能让修改有方向
- 没有坐标系的迭代，只是看起来在进步
```

- [ ] **Step 12: 写 src/content/blog/en/agent-benchmark.mdx（忠实翻译 zh 版）**

```mdx
---
title: How to Use Benchmarks When Building Agents
description: A benchmark is not an exam — it is an answer bank. Read leaderboards to choose, copy scoring methods to build your own eval set, slice to diagnose
date: 2026-07-08
tags: [Agent, Benchmark, Evaluation]
---

## The problem

Almost every agent-building team has lived this loop: change a version, manually try three or five cases, it feels better, ship it. Two days later a user reports a new badcase, patch it again.

The problem is not that the changes are slow — it is that there is **no coordinate system**: you cannot tell whether a change made the system better or worse overall, nor which segment of the pipeline broke. It all reduces to one question: **how does an agent know it did the right thing?**

## The right path: flip the loop

First define what "good" means (an eval set + scoring criteria), then regress every change against the eval set. The smallest unit of change is no longer "changed a feature" but "eval score 61 → 68, zero regressions".

## Three things to take from public benchmarks

1. **Read leaderboards to choose**: compare models and approaches
2. **Copy scoring methods**: borrow public benchmark criteria to build your own eval set
3. **Slice to diagnose**: when something breaks, decompose a single run into nodes and localize the fault

## The 7 nodes of a single execution

Any agent system — regardless of framework or model — can decompose a single request into 7 nodes: input understanding & clarification, retrieval/tool calls, context assembly, reasoning & planning, execution, result verification, output. Each node has typical failure modes — asking nothing when it should, charging ahead with ambiguous requirements, irrelevant retrieval, missing verification that lets hallucinations through.

## Lessons from practice

- An eval set is never built once: every badcase you find gets distilled into it
- Scoring criteria must be executable: only when you can say what "correct" means do changes have direction
- Iteration without a coordinate system only looks like progress
```

- [ ] **Step 13: 写 src/content/blog/zh/ai-coding-sop.mdx**

```mdx
---
title: 零基础 AI Coding SOP：从一句话到可验收的交付
description: 不要直接让 AI 写代码——澄清、方案、计划、分阶段执行、测试验收
date: 2026-08-01
tags: [AI-Coding, SOP]
---

## 一句话方法论

**不要直接让 AI 写代码。** 先澄清需求，再给出方案、编写计划，分阶段执行，最后用测试与验收标准证明结果正确。

## 为什么不能直接让 AI 写

一句话把任务交给 AI，产出的是"看起来对"的代码：没有需求澄清，边界靠猜；没有方案评审，架构随缘；没有验收标准，正确性无法证明。流程化的输入，换来的是可验证的输出。

## SOP 五步

1. **澄清**：把模糊需求问清楚，明确边界与成功标准
2. **方案**：让 AI 给出 2-3 种方案与权衡，选定后写设计
3. **计划**：把设计拆成可独立验收的任务，每个任务有测试
4. **分阶段执行**：一个任务一个任务做，每步验证
5. **验收**：用测试与验收标准证明结果正确，而不是"看起来没问题"

## 实验框架

这套 SOP 的价值可以用对照实验验证：同一任务，一组"一句话交给 AI"，一组"按 SOP 流程化输入"，对比完成时间、返工次数与验收通过率。目标是形成可在团队内推广、且有数据论证的流程。

## 实践体会

- 澄清阶段花的时间，会在执行阶段十倍省回来
- 验收标准写不清楚，说明需求还没想清楚
- SOP 不是束缚，是把"碰运气"变成"可预期"
```

- [ ] **Step 14: 写 src/content/blog/en/ai-coding-sop.mdx（忠实翻译 zh 版）**

```mdx
---
title: A Zero-to-One AI Coding SOP: From One Sentence to Verifiable Delivery
description: Don't just tell AI to write code — clarify, propose, plan, execute in stages, and prove correctness with tests
date: 2026-08-01
tags: [AI-Coding, SOP]
---

## The one-sentence method

**Don't just tell AI to write code.** Clarify requirements first, then propose a solution, write a plan, execute in stages, and finally prove the result correct with tests and acceptance criteria.

## Why not just tell AI to write

Handing a task to AI in one sentence produces code that "looks right": no requirement clarification, so boundaries are guessed; no proposal review, so architecture is arbitrary; no acceptance criteria, so correctness is unprovable. Processed input buys verifiable output.

## The five-step SOP

1. **Clarify**: pin down vague requirements, define boundaries and success criteria
2. **Propose**: have AI present 2-3 approaches with trade-offs, then write the design
3. **Plan**: decompose the design into independently verifiable tasks, each with tests
4. **Execute in stages**: one task at a time, verifying each step
5. **Accept**: prove correctness with tests and acceptance criteria — not "looks fine"

## The experiment framework

The value of this SOP can be validated with a controlled experiment: the same task, one group "hands it to AI in one sentence", the other "feeds it through the SOP" — compare completion time, rework count and acceptance rate. The goal is a process that can be promoted within a team, backed by data.

## Lessons from practice

- Time spent clarifying is repaid tenfold during execution
- If you cannot write acceptance criteria, you have not thought the requirements through
- An SOP is not a constraint — it turns luck into predictability
```

- [ ] **Step 15: 复制简历 PDF**

Run:
```bash
cp "/Users/yiheng/vibecoding/简历润色/秋招简历0719/zyh_秋招_0813.pdf" /Users/yiheng/vibecoding/个人作品集/public/resume.pdf
```
Expected: `public/resume.pdf` 存在

- [ ] **Step 16: 验证**

Run: `npm run check && npm run build`
Expected: 无错误；`dist/` 包含全部 14 个内容页（2 项目 × 2 语言 + 2 工具 × 2 语言 + 3 博客 × 2 语言 + 首页/列表/404）

Run: `npm run dev`（后台），浏览器访问 `http://localhost:4321/zh/`、`http://localhost:4321/en/`、`http://localhost:4321/zh/projects/flowtype/`、`http://localhost:4321/en/blog/loop-engineering/`
Expected: 内容完整渲染，中英切换正常，无 404

- [ ] **Step 17: 提交**

```bash
git add -A
git commit -m "feat: 双语内容填充（项目/工具/博客）"
```

---

### Task 6: GSAP 动效

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/components/Motion.astro`
- Modify: `src/layouts/BaseLayout.astro`（引入 Motion 组件）

**Interfaces:**
- Consumes: 组件中已有的 `data-hero-line` / `data-reveal` 属性（Task 3-4 已埋点）
- Produces: `initMotion()`——页面加载后执行 Hero 进入、滚动揭示、数字滚动动画

- [ ] **Step 1: 写 src/lib/motion.ts**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMotion(): void {
  // Hero 进入：逐行 fade-up，200ms 交错
  const heroLines = gsap.utils.toArray<HTMLElement>('[data-hero-line]');
  if (heroLines.length > 0) {
    gsap.from(heroLines, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.1,
    });
  }

  // 滚动揭示：区块标题、卡片 fade-up
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // 指标数字：进入视口滚动计数
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (Number.isNaN(target)) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => {
        el.textContent = String(Math.round(obj.val));
      },
    });
  });
}
```

- [ ] **Step 2: 写 src/components/Motion.astro**

```astro
---
---
<script>
  import { initMotion } from '../lib/motion';
  initMotion();
</script>
```

- [ ] **Step 3: 修改 src/layouts/BaseLayout.astro（引入 Motion）**

在 frontmatter 的 import 区加入：

```astro
import Motion from '../components/Motion.astro';
```

在 `</body>` 前加入：

```astro
<Motion />
```

- [ ] **Step 4: 验证**

Run: `npm run check && npm run build`
Expected: 无错误；构建产物包含动效 JS bundle

Run: `npm run dev`（后台），浏览器访问 `http://localhost:4321/zh/`
Expected: Hero 文字逐行浮现；滚动时区块标题与卡片 fade-up；无控制台报错

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: GSAP 滚动动效"
```

---

### Task 7: 响应式打磨 + 部署上线

**Files:**
- Create: `README.md`
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs`（site 换成真实 pages.dev 域名）

**Interfaces:**
- Consumes: 全部既有代码
- Produces: 线上可访问的作品集

- [ ] **Step 1: 写 README.md**

```markdown
# Portfolio · 个人作品集

赵一恒（Yiheng Zhao）的个人作品集网站——AI Agent 应用开发工程师。

- 框架：Astro 7 + TypeScript
- 双语：/zh/ 与 /en/
- 动效：GSAP ScrollTrigger
- 部署：Cloudflare Pages

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run check
npm run build
```
```

- [ ] **Step 2: 写 .github/workflows/deploy.yml**

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=portfolio
```

- [ ] **Step 3: 响应式检查**

Run: `npm run dev`（后台），用浏览器分别以 1440px、768px、375px 宽度访问 `/zh/` 与 `/en/`
Expected: 无横向滚动；卡片单列/双列切换正确；导航不溢出；Hero 字号随视口缩放

- [ ] **Step 4: 创建 GitHub 仓库并推送**

Run:
```bash
cd /Users/yiheng/vibecoding/个人作品集
gh repo create Ethanz11-creat/portfolio --public --source . --push
```
Expected: 仓库创建成功，代码推送至 main 分支

- [ ] **Step 5: 配置 Cloudflare Pages（需要用户操作）**

请用户执行（交互式登录）：

```bash
! wrangler login
```

然后执行：
```bash
wrangler pages project create portfolio --production-branch main
```

- [ ] **Step 6: 配置 GitHub Actions 密钥（需要用户操作）**

在 Cloudflare 控制台创建 API Token（权限：Cloudflare Pages — Edit），然后：

```bash
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

- [ ] **Step 7: 更新 site 域名并触发部署**

修改 `astro.config.mjs` 中 `site` 为实际 pages.dev 域名（如 `https://portfolio.pages.dev`），提交推送：

```bash
git add -A
git commit -m "chore: 更新 site 域名"
git push
```

Expected: GitHub Actions 运行，Cloudflare Pages 部署成功

- [ ] **Step 8: 线上验收**

用浏览器访问线上域名 `/zh/` 与 `/en/`
Expected: 与本地一致；Lighthouse Performance ≥ 90；无 404 页面

- [ ] **Step 9: 提交收尾**

```bash
git add -A
git commit -m "docs: 部署说明" || true
```

---

## Self-Review 记录

- **Spec 覆盖**：设计文档第 2 节（信息架构）→ Task 3-5；第 3 节（技术栈）→ Task 1；第 4 节（视觉系统）→ Task 2-3；第 5 节（双语）→ Task 1/5；第 6 节（部署）→ Task 7；第 7 节（执行模型）→ 主 agent 验收流程；第 8 节（实施阶段）→ Task 1-7 一一对应；第 9 节（事实边界）→ Task 5 内容
- **占位符扫描**：无 TBD/TODO；所有代码步骤含完整代码
- **类型一致性**：`t(locale, key)` 签名在 Task 1 定义、Task 3-4 使用一致；`CollectionEntry<'projects'>` / `CollectionEntry<'blog'>` 与 Task 1 schema 一致；`data-reveal` / `data-hero-line` 属性在 Task 3-4 埋点、Task 6 消费一致

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
    'footer.email': '邮箱',
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
    'footer.email': 'Email',
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

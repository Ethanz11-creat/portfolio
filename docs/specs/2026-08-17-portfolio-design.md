# AI 个人作品集 · 设计文档

> 日期：2026-08-17
> 作者：赵一恒（Yiheng Zhao）
> 状态：已确认，待实施

## 1. 定位与目标

面向独立开发 / AI 构建者的**个人作品集网站**，定位是「用 AI 构建 Agent 与一切」的**能力展示**，而非简历镜像：

- **展示 AI coding 能力**：如何用 AI 协作构建产品（选型思考、AI 协作流程、迭代记录）
- **展示 AI 思维**：方法论沉淀（Loop Engineering、Agent Benchmark、AI Coding）
- **展示 Agent 工程能力**：runtime、MCP/Skills、自动化工作流
- 求职为主 + 预留长期品牌扩展（博客区天然可生长）

**明确不包含**：简历式的职责罗列；RAG 论文复现系列（课程产物，用户确认不收）；团队资讯平台（职责未确认）；VLM 评测（无个人归属）。Voyager 收录但聚焦自研 runtime，严格按 AGENTS.md 边界——只写已实现能力，不写未闭环指标。

## 2. 内容组织（信息架构）

```
首页（单页 + 锚点导航）
├── 01 Hero        — 名字「赵一恒 Yiheng Zhao」+ 定位「用 AI 构建 Agent，也构建一切」
│                    + 一句话价值主张 + CTA（看作品 / 下载简历 PDF）
├── 02 AI 实践作品（5 个，均为详情页）
│     ├── 旗舰: Flowtype Local — 语音转 prompt 的 macOS 应用（多章节详述：交互节奏/本地 ASR/五阶段流水线/产品闭环）
│     ├── 旗舰: VSA · Voyager Super Agent — 企业 Information Agent 项目与评测方法建设
│     ├── VLM 碰撞检测评测平台 — 让 VLM 当"专家裁判"的碰撞评测闭环（LLM-as-Judge + 人在回路）
│     ├── 实习 AI 工具链 — 市场周报 Agent（mkt-weekly）+ 内网 AI 资讯精选平台（ai-cool）
│     └── dsh-billing-tui — DeepSeek Harness 峰谷计费 TUI 插件（自研 vibe-coding，npm 分发）
│     └── 每张卡片双重视角：做了什么 + 怎么用 AI 做的（选型思考/AI 协作流程）
│     └── 已移除：feishu-skills、job-tracker
├── 03 AI 思维/方法论 — 博客区：5 篇
│     （Loop Engineering、Agent Benchmark、AI Coding SOP、
│      洗掉前端的 AI 味、我实践过的 12 个 AI 工具）+ 「全部文章」入口
├── 04 关于与联系 — 简介、技术栈总览、简历 PDF 下载、GitHub / 邮箱
└── 页脚 — 导航重述 + © 2026
```

每个作品的展示结构（STAR 变体 + AI 视角）：

```
项目名 + 一句话定位
├── 导语（2-3 句：问题 → 做法 → 结果）
├── 技术深度（3-4 个要点，具体技术名词）
├── AI 协作视角（怎么用 AI 做的：工具、流程、迭代）
├── 量化成果（可核验口径，不编造）
├── 技术栈标签 + 链接（GitHub）
```

## 3. 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | Astro 5 + TypeScript | 内容站最佳实践：i18n 路由、Content Collections、零 JS 默认、islands 按需交互 |
| 动效 | GSAP + ScrollTrigger | 与参考站 Made with Gsap 同源，只做克制用法 |
| 内容 | Content Collections (MDX)，双语双份 | 改内容不碰代码 |
| 部署 | GitHub 仓库 → Cloudflare Pages | 免费、全球 CDN、国内可访问、push 自动部署 |

### 目录结构

```
个人作品集/
├── src/
│   ├── content/
│   │   ├── zh/{projects, tools, blog}/
│   │   └── en/{projects, tools, blog}/
│   ├── components/       # Hero、Nav、ProjectCard、BlogCard、SectionHeader、Footer...
│   ├── layouts/          # 基础布局 + locale 包装
│   ├── styles/           # design-tokens.css、global.css
│   └── pages/            # zh/ 与 en/ 双路由
├── public/               # 头像、favicon、简历 PDF
├── astro.config.mjs      # i18n 配置
└── docs/specs/           # 设计文档
```

## 4. 视觉设计系统（极简高级风）

参考站：Minimal Gallery（极简排版）、Land-book（落地页结构）、Made with Gsap（动效参考）、Noiced（反例，不做实验先锋风）。

### 色彩

| 角色 | 色值 | 用途 |
|---|---|---|
| 背景 | `#FAFAF8` 暖白 | 主背景 |
| 墨色 | `#111111` | 主文字 |
| 次级文字 | `#666666` | 辅助信息 |
| 强调色 | `#4F7CFF` 电光蓝 | 链接、标签、CTA、代码高亮 |
| 细线 | `#E5E5E0` | 分隔线、卡片描边 |
| 深色区 | `#0E0E0E` | Hero / 页脚深色对比区 |

### 字体与排版

- 英文：Inter（正文）+ Space Grotesk（标题）
- 中文：系统栈 PingFang SC；标题粗体
- Hero 大标题：`clamp(3rem, 8vw, 6.5rem)`，字重 600，行距 1.1
- 正文 16-17px，行距 1.7，区块间留白 8-12rem

### 动效（克制）

1. Hero 进入：文字逐行 fade-up + 轻微错位（200ms 交错）
2. 滚动揭示：区块标题、卡片 fade-up，stagger 0.08s
3. 卡片 hover：上浮 4px + 强调色描边 + 标签点亮
4. 导航：滚动后收窄 + 半透明毛玻璃
5. 指标数字：进入视口滚动计数

### 布局语言

- 12 列网格，内容区最大 1200px，边距 24-48px
- 区块编号（01/02/03）装饰性排版元素
- 卡片圆角 12-16px，阴影极轻（`0 1px 3px rgba(0,0,0,0.06)`）
- 细线分隔保持连续性

## 5. 双语方案

- `/zh/`（默认）与 `/en/` 双路由（Astro i18n 内置）
- 每个项目/文章双语双份 MDX，frontmatter 字段一致
- 导航栏「中 / EN」切换器，localStorage 记忆
- 完整性约束：要么翻完要么不发布，双语均为完整版本

## 6. 部署

```
GitHub 仓库（Ethanz11-creat/portfolio）→ Cloudflare Pages 自动构建
→ xxx.pages.dev（免费域名）
```

- 首次用 wrangler CLI 或控制台连接仓库
- 后续可绑自定义域名

## 7. 执行模型与验收

- **主 agent**：任务分解、派发子 agent、验收、修复，把控设计一致性
- **子 agent（flash 模型）**：按任务单实现组件/页面/内容
- **验收清单**：
  1. 视觉一致性（间距/字号/颜色符合设计系统）
  2. 双语完整性（/zh/ /en/ 全页面）
  3. 响应式（桌面 + 手机宽度）
  4. 动效流畅性
  5. 内容核验（对照事实源，无编造指标）
  6. 部署后实际访问 + Lighthouse

## 8. 实施阶段

| 阶段 | 内容 | 验收产出 |
|---|---|---|
| P1 脚手架 | Astro + TS + i18n + Content Collections + 部署配置 | 可构建空站点 |
| P2 设计系统 | 色彩变量、字体、间距、动效基元（GSAP） | design-tokens + 动效组件 |
| P3 布局组件 | Nav、Hero、SectionHeader、Footer | 页面骨架 |
| P4 内容组件 | ProjectCard、BlogCard、项目详情页 | 组件库 |
| P5 内容填充 | 双语项目文案 + 3 篇博客 | 完整内容 |
| P6 打磨验收 | 动效细节、响应式、Lighthouse、部署上线 | 线上作品集 |

## 9. 事实边界（内容撰写时必须遵守）

- VSA：只写已实现能力（Eino ADK PoC、方案设计、评测维度与端到端评测集、信息查询/多群聊场景、三层记忆、HITL、OTel），不写未闭环指标
- VLM 碰撞检测评测平台：以项目报告为事实源（55,996 帧、召回率 0.812、10 轮迭代），所有数字必须可核验
- 实习 AI 工具链（mkt-weekly / ai-cool）：以代码与 docs 为事实源，只写已上线系统与模块能力
- dsh-billing-tui：以 GitHub/npm 为事实源，写真实实现的计费、TUI、小票、Web 能力
- 所有数字必须有可核验口径
- Flowtype：以 README（flowtype-local 分支）为事实源

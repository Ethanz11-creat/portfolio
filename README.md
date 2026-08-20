# Portfolio · 个人作品集

赵一恒（Yiheng Zhao）的个人作品集网站——用 AI 构建 Agent，也构建一切。

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

## 部署（Cloudflare Pages）

生产站点由 GitHub Actions 在 `main` 分支推送后自动部署到 Cloudflare Pages 项目
`portfolio`。工作流位于 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

部署凭据**不写入 `.env`、代码或 Git 历史**。它们只保存在 GitHub 仓库
`Ethanz11-creat/portfolio` 的 Actions secrets：

| Secret | 用途 | 状态 |
| --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号标识 | 已配置 |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions 调用 Cloudflare Pages 的最小权限令牌 | 需要一次性配置 |

### 一次性配置 API Token

1. 登录 Cloudflare 后打开 [API Tokens](https://dash.cloudflare.com/profile/api-tokens)，创建自定义 Token。
2. 在 **Account** 权限中添加 **Cloudflare Pages → Edit**，账号范围选择当前账号；创建后立即复制 Token（Cloudflare 只展示一次）。
3. 在本机终端运行下面命令，并在提示时粘贴 Token。输入不会显示，也不会写入本地文件：

   ```bash
   gh secret set CLOUDFLARE_API_TOKEN --repo Ethanz11-creat/portfolio
   ```

4. 用下面命令确认两个 Secret 都存在（只显示名称和更新时间，不会泄露值）：

   ```bash
   gh secret list --repo Ethanz11-creat/portfolio
   ```

随后推送任意提交到 `main`，或在 GitHub 的 **Actions → Deploy to Cloudflare Pages → Run workflow** 手动触发一次部署。部署记录可在 Actions 页面查看。

本机需要临时手动部署时，使用已登录的 Wrangler 身份即可：

```bash
npm run build
wrangler pages deploy dist --project-name=portfolio
```

这只使用本机 OAuth 登录态；它不会自动为 GitHub Actions 创建或更新 Secret。

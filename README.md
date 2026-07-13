# 安落滢 / Ray homepage

这是 Ray 的静态个人主页和工具入口。项目使用 **Vite + React + TypeScript** 构建，产物是纯静态文件；没有 API、数据库或 Worker。

## 当前站点结构

| 路径 | 用途 | 入口文件 |
| --- | --- | --- |
| `/` | 个人主页 | `src/App.tsx` → `HomePage` |
| `/tools/` | 工具目录 | `src/tools/ToolsIndex.tsx` |
| `/tools/vram-calculator` | LLM 推理显存计算器 | `src/tools/VramCalculator.tsx` |

`src/App.tsx` 根据浏览器路径渲染这三个静态 SPA 页面。`public/_redirects` 显式把两个 `/tools` 路径回退到 `index.html`，因此在 Cloudflare Pages 上直接打开或分享工具 URL 都能正常加载。

个人主页上的「器」入口地址维护在 [src/content/profile.ts](src/content/profile.ts)。

## LLM 显存计算器

计算器完全在浏览器中运行，配置会保存到当前浏览器的 `localStorage`；点击分享会把输入编码在 URL 的 `#c=` 片段中。该片段不会随 HTTP 请求发送到服务器，接收者打开链接后会在自己的浏览器重新计算。

核心逻辑位于：

- [src/lib/vram.ts](src/lib/vram.ts)：模型/GPU 轮廓、权重、KV Cache、workspace、余量、吞吐和模拟曲线
- [src/lib/share.ts](src/lib/share.ts)：URL-safe 配置编解码
- [src/tools/VramCalculator.tsx](src/tools/VramCalculator.tsx)：交互、推理模拟、FAQ 与结果卡

公式将权重和 KV 精度分开。普通 decoder-only 架构的 KV Cache 近似为：

```text
2 × layers × KV heads × head dim × cached tokens × KV bytes
```

这是一项部署前容量估算，不是兼容性或实测性能保证；请在目标模型、推理引擎、驱动和硬件上压测验证。

## 本地开发

要求：Node.js 20（与 CI/部署环境一致）。

```bash
npm ci
npm run dev
```

开发服务器默认是 `http://localhost:8080`。可直接访问：

```text
http://localhost:8080/
http://localhost:8080/tools/
http://localhost:8080/tools/vram-calculator
```

常用检查：

```bash
npm test          # 显存公式和分享编解码测试
npm run typecheck # TypeScript 检查
npm run build     # typecheck + Vite 生产构建到 dist/
npm run preview   # 本地预览 dist/
```

## 部署：GitHub Actions → Cloudflare Pages

这个仓库**不是**由 Cloudflare 的 Git 集成直接构建；它通过仓库内的 GitHub Actions 调用 Cloudflare API 发布。

部署链路如下：

```text
push 到 main
  → .github/workflows/ci.yml：npm ci → typecheck → test → build
  → .github/workflows/deploy.yml：npm ci → test → build → wrangler pages deploy dist
  → Cloudflare Pages 项目 r-home-frontend
```

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) 会在 `main` push 和所有 PR 上运行构建检查。
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 只在 `main` push 或手动触发时发布生产站点。
- 构建输出目录固定为 `dist`。
- Pages 项目名固定为 `r-home-frontend`。

### 首次或故障排查时需要确认的设置

在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中应存在：

| Secret | 用途 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token；至少要能编辑该账户的 Pages 项目 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID |

然后到 GitHub 的 **Actions** 页面检查最新的 `Deploy to Cloudflare Pages` 是否成功。这个仓库不保存 Cloudflare token、账户 ID、Pages 自定义域名或部署历史，因此仅从代码无法确认这些密钥今天是否仍有效；若 workflow 报认证或项目不存在错误，需要在上述两个 Secret 和 Cloudflare Pages 项目设置中修复。

如果尚未创建 Pages 项目：先在 Cloudflare Pages 创建名为 `r-home-frontend` 的项目和自定义域名，再配置两个 Secret；之后由 GitHub Actions 接管发布即可。

## 日常更新流程

```bash
git checkout main
git pull --ff-only origin main
npm ci
npm test && npm run build
git add src public README.md package.json package-lock.json
git commit -m "Add or update tool"
git push origin main
```

`main` 推送完成后，等待 GitHub Actions 中的 `Deploy to Cloudflare Pages` 变绿；该次构建的 `dist/` 会发布到现有 Pages 项目。PR 目前只做检查，不会自动创建 Cloudflare 预览部署。

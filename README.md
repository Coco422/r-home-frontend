# 安落滢 / Ray homepage

一个静态个人主页，主名用中文，副签名用 `Ray`。  
风格方向：水墨 + 电路 + 留白，GitHub 托管，Cloudflare Pages 部署。

## 本地运行

```bash
npm install
npm run dev
```

开发服务器默认在 `http://localhost:8080`

## 维护入口

链接配置在 `src/content/profile.ts`。

- 博客：`https://blog.anluoying.com`
- GitHub：`https://github.com/Coco422`

如果你要换博客地址，改这一处就够了。

## 部署

GitHub Actions 里已经放了两条流水线：

- `CI`：`typecheck + build`
- `Deploy to Cloudflare Pages`：构建后直接发布 `dist`

要让部署跑起来，只需要在 GitHub 仓库里设置两个 secret：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Pages 项目名当前是 `r-home-frontend`。

# 安落滢 / Ray homepage

这是 Ray 的静态个人主页和工具入口。项目使用 **Vite + React + TypeScript** 构建，产物是纯静态文件；没有 API、数据库或 Worker。

## 当前站点结构

| 路径                     | 用途               | 入口文件                       |
| ------------------------ | ------------------ | ------------------------------ |
| `/`                      | 个人主页           | `src/App.tsx` → `HomePage`     |
| `/tools/`                | 工具目录           | `src/tools/ToolsIndex.tsx`     |
| `/tools/vram-calculator` | LLM 推理显存计算器 | `src/tools/VramCalculator.tsx` |

`src/App.tsx` 根据浏览器路径渲染这三个静态 SPA 页面。`public/_redirects` 显式把两个 `/tools` 路径回退到 `index.html`，因此在 Cloudflare Pages 上直接打开或分享工具 URL 都能正常加载。

个人主页上的「器」入口地址维护在 [src/content/profile.ts](src/content/profile.ts)。

## LLM 显存计算器

计算器完全在浏览器中运行，配置会保存到当前浏览器的 `localStorage`；点击分享会把输入编码在 URL 的 `#c=` 片段中。该片段不会随 HTTP 请求发送到服务器，接收者打开链接后会在自己的浏览器重新计算。

核心逻辑位于：

- [src/lib/vram.ts](src/lib/vram.ts)：主流模型/GPU 轮廓、权重、KV Cache、workspace、余量与性能估算
- [src/lib/hardware-purchase.ts](src/lib/hardware-purchase.ts)：公开硬件购置价快照、主机平台 BOM 与整机预算
- [src/lib/share.ts](src/lib/share.ts)：URL-safe 配置编解码
- [src/tools/VramCalculator.tsx](src/tools/VramCalculator.tsx)：交互、预设、结果卡与设备选择
- [src/tools/SearchableSelect.tsx](src/tools/SearchableSelect.tsx)：模型与设备的分组搜索选择器
- [src/tools/InferenceExperience.tsx](src/tools/InferenceExperience.tsx)：问答 / Agent 打字机式推理体验
- [src/tools/HardwarePurchaseBudget.tsx](src/tools/HardwarePurchaseBudget.tsx)：GPU、服务器配件和来源展开卡

公式将权重和 KV 精度分开。普通 decoder-only 架构的 KV Cache 近似为：

```text
2 × layers × KV heads × head dim × cached tokens × KV bytes
```

这是一项部署前容量估算，不是兼容性或实测性能保证；请在目标模型、推理引擎、驱动和硬件上压测验证。

吞吐现在显示为区间，并把权重带宽 / 计算瓶颈、多卡并行效率和并发饱和度拆开；它仍不是 vLLM、TensorRT-LLM、llama.cpp 或具体网络拓扑的实测 benchmark。请求的输入 token、输出 token、批量和并发不设产品级上限，只有非负 / 正数和 JavaScript 安全整数约束；模型自身上下文窗口仍会单独提示超限。

「CPU 权重卸载」按分层权重卸载的容量近似计算：GPU 保留未卸载权重，CPU 内存承接卸载部分。紧凑、均衡、保守只代表显存碎片和安全余量，不会自动推导 PCIe / NVLink、层切分或具体引擎的传输速度。

模型目录当前提供 39 个常用 dense / MoE 档位；相同尺寸的旧代模型会让位给较新的代表项。最新加入的 [Qwen3.6 27B](https://huggingface.co/Qwen/Qwen3.6-27B)、[Qwen3.6 35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)、[DeepSeek-V4 Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)、[DeepSeek-V4 Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) 和 [GLM-5.2](https://huggingface.co/zai-org/GLM-5.2) 均以官方模型卡与 `config.json` 核验。混合注意力、压缩 KV 或循环状态模型会在选项中明确标记为近似估算，避免把普通 GQA 公式套用到不兼容架构。

硬件购置预算是静态参考数据，不是云租赁费：它按可核验的 GPU / 整机公开价加上服务器平台预留，拆开显示 CPU、内存、主板、SSD、机箱 / 电源 / 散热和基础网络。目录覆盖主流消费卡（4060 Ti、5060 Ti 16GB、4070 SUPER、4080 SUPER、4090、5070 / Ti、5080）、专业卡 / 数据中心卡（RTX A5000/A6000、RTX 6000 Ada、RTX PRO 4000–6000、A100 80GB、H100 PCIe、L40S）以及 Mac Studio M3 Ultra 96GB、M4 Max 64GB 和 ASUS DGX Spark（Ascent GX10）等精确 SKU。

每条来源都会显示原始币种金额、报价快照日、市场、口径和可点击链接；页面在 **2026-07-14** 汇总。海外美元零售价按固定 **¥7.18 / US$** 换算。只有准确 SKU 的公开成交 / 零售价会进入整机预算；历史发布价、报道价或混合 SKU 页面仍保留作参考，但不会被自动相加。库存、地区、税率、二手成色、进口、保修与整机配置都会改变成交价，必须以供应商书面报价为准。发现来源或价格有误可在页面底部提交 [GitHub Issue](https://github.com/Coco422/r-home-frontend/issues/new)。

对于统一内存设备、SXM / HGX、没有准确 SKU 的整机和多节点方案，计算器会明确显示「需询价」或「暂未收录」，不会把 GPU 单价线性相加，也不会用 ¥0 伪造总成本。

历史首发价、官方 MSRP 等非实时价格仍会展示原始金额与来源，但不会被自动相加为「整机总价」。

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

| Secret                  | 用途                                                  |
| ----------------------- | ----------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API Token；至少要能编辑该账户的 Pages 项目 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID                                    |

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

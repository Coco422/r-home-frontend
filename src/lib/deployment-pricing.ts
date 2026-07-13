import { GPUS, type GpuId } from "./vram";

export const DEPLOYMENT_PRICE_AS_OF = "2026-07-14";

export const DEPLOYMENT_PRICE_SOURCE = {
  provider: "Runpod",
  product: "Pods · Secure Cloud",
  billing: "按需 / 每 GPU·小时",
  url: "https://www.runpod.io/pricing",
  note: "公开参考价，非报价；多卡按单卡价线性估算。",
} as const;

type DeploymentPriceMetadata = {
  listedSku?: string;
  note?: string;
};

const DEPLOYMENT_PRICE_METADATA: Partial<
  Record<GpuId, DeploymentPriceMetadata>
> = {
  "rtx-3090-24": {},
  "rtx-4090": {},
  "rtx-5090": {},
  "rtx-a5000-24": {},
  "rtx-a6000-48": {},
  "rtx-6000-ada-48": {},
  "rtx-pro-6000-96": {},
  "a40-48": {},
  "l4-24": {},
  "l40s-48": {},
  "l40-48": {},
  "a100-80": { listedSku: "A100 SXM 80GB" },
  "h100-80": { listedSku: "H100 SXM 80GB" },
  "h100-pcie-80": { listedSku: "H100 PCIe 80GB" },
  "h100-nvl-94": { listedSku: "H100 NVL 94GB" },
  "h200-141": { listedSku: "H200 SXM" },
  "b200-192": {
    listedSku: "B200 180GB",
    note: "服务商页面列为 B200 180GB；本站设备目录沿用产品名义规格，单位口径不同。",
  },
  "b300-288": { listedSku: "B300 288GB" },
};

export type DeploymentCostEstimate = {
  metadata: DeploymentPriceMetadata;
  gpuCount: number;
  hourlyUsd: number;
  dailyUsd: number;
  monthlyUsd: number;
  minimumGpuCount: number | null;
  minimumHourlyUsd: number | null;
  minimumDailyUsd: number | null;
  minimumMonthlyUsd: number | null;
};

export function estimateDeploymentCost(
  gpuId: GpuId,
  gpuCount: number,
  minimumGpuCount: number | null,
): DeploymentCostEstimate | null {
  const metadata = DEPLOYMENT_PRICE_METADATA[gpuId];
  const priceUsdPerGpuHour = GPUS[gpuId].pricePerHour;
  if (!metadata || priceUsdPerGpuHour <= 0) return null;

  const hourlyUsd = priceUsdPerGpuHour * gpuCount;
  const minimumCount =
    minimumGpuCount && minimumGpuCount > gpuCount ? minimumGpuCount : null;

  return {
    metadata,
    gpuCount,
    hourlyUsd,
    dailyUsd: hourlyUsd * 24,
    monthlyUsd: hourlyUsd * 730,
    minimumGpuCount: minimumCount,
    minimumHourlyUsd: minimumCount
      ? priceUsdPerGpuHour * minimumCount
      : null,
    minimumDailyUsd: minimumCount
      ? priceUsdPerGpuHour * minimumCount * 24
      : null,
    minimumMonthlyUsd: minimumCount
      ? priceUsdPerGpuHour * minimumCount * 730
      : null,
  };
}

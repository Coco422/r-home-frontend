import {
  DEPLOYMENT_PRICE_AS_OF,
  DEPLOYMENT_PRICE_SOURCE,
  estimateDeploymentCost,
} from "../lib/deployment-pricing";
import type { GpuId } from "../lib/vram";

type Props = {
  gpuId: GpuId;
  gpuCount: number;
  minimumGpuCount: number | null;
  fits: boolean;
  contextExceedsWindow: boolean;
  cpuOffload: boolean;
};

export function DeploymentPrice({
  gpuId,
  gpuCount,
  minimumGpuCount,
  fits,
  contextExceedsWindow,
  cpuOffload,
}: Props) {
  const quote = estimateDeploymentCost(gpuId, gpuCount, minimumGpuCount);
  const minimumPlan = Boolean(
    !contextExceedsWindow && !fits && quote?.minimumGpuCount,
  );
  const plan = quote
    ? minimumPlan
      ? {
          gpuCount: quote.minimumGpuCount ?? gpuCount,
          hourlyUsd: quote.minimumHourlyUsd ?? quote.hourlyUsd,
          dailyUsd: quote.minimumDailyUsd ?? quote.dailyUsd,
          monthlyUsd: quote.minimumMonthlyUsd ?? quote.monthlyUsd,
        }
      : {
          gpuCount,
          hourlyUsd: quote.hourlyUsd,
          dailyUsd: quote.dailyUsd,
          monthlyUsd: quote.monthlyUsd,
        }
    : null;

  return (
    <section className="deployment-price" aria-labelledby="price-title">
      <div className="deployment-price-heading">
        <div>
          <h2 id="price-title">部署价格参考</h2>
          <p>{DEPLOYMENT_PRICE_SOURCE.product}</p>
        </div>
        <a
          href={DEPLOYMENT_PRICE_SOURCE.url}
          target="_blank"
          rel="noreferrer"
        >
          来源 ↗
        </a>
      </div>

      {quote && plan ? (
        <>
          <div className="deployment-price-main">
            <strong>约 {formatUsd(plan.hourlyUsd)}</strong>
            <span>USD / 小时 · {plan.gpuCount} GPU</span>
          </div>
          <div className="deployment-price-metrics">
            <div>
              <span>24h</span>
              <b>约 {formatUsd(plan.dailyUsd)}</b>
            </div>
            <div>
              <span>730h / 月</span>
              <b>约 {formatUsd(plan.monthlyUsd)}</b>
            </div>
          </div>
          {minimumPlan ? (
            <p className="deployment-price-minimum">
              当前 {quote.gpuCount} GPU 预计 OOM；已按至少{" "}
              {quote.minimumGpuCount} GPU 展示可用参考方案。当前组合约{" "}
              {formatUsd(quote.hourlyUsd)}/h。
            </p>
          ) : null}
          {contextExceedsWindow ? (
            <p className="deployment-price-warning">
              输入与输出 token 超过模型窗口；请先缩短上下文后再确定部署方案。
            </p>
          ) : !fits && !quote.minimumGpuCount ? (
            <p className="deployment-price-warning">
              当前配置预计 OOM；在此设备的 32 GPU 上限内未推导出可用方案。
            </p>
          ) : null}
          <p className="deployment-price-note">
            {DEPLOYMENT_PRICE_AS_OF} 抓取 · {DEPLOYMENT_PRICE_SOURCE.note}
            {cpuOffload ? " 已启用 CPU 卸载，仍只按 GPU 小时价估算。" : ""}
            {" 实例规格、存储、税费与运维以服务商结算页为准。"}
            {quote.metadata.listedSku ? ` ${quote.metadata.listedSku}。` : ""}
            {quote.metadata.note ? ` ${quote.metadata.note}` : ""}
          </p>
        </>
      ) : (
        <p className="deployment-price-unavailable">
          当前设备未纳入本期公开云端按需价目表；本地设备请另计购置、电力和运维成本。
        </p>
      )}
    </section>
  );
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

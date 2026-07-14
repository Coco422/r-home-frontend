import {
  HARDWARE_PURCHASE_AS_OF,
  estimatePurchaseBudget,
  getPurchaseSources,
  type PriceRange,
  type PurchasePlan,
  type PurchaseSource,
} from "../lib/hardware-purchase";
import type { GpuId } from "../lib/vram";

type Props = {
  gpuId: GpuId;
  gpuCount: number;
  minimumGpuCount: number | null;
  fits: boolean;
  contextExceedsWindow: boolean;
  cpuOffload: boolean;
  offloadedWeightsGiB: number;
};

export function HardwarePurchaseBudget({
  gpuId,
  gpuCount,
  minimumGpuCount,
  fits,
  contextExceedsWindow,
  cpuOffload,
  offloadedWeightsGiB,
}: Props) {
  const budget = estimatePurchaseBudget({
    gpuId,
    gpuCount,
    minimumGpuCount,
    fits,
    contextExceedsWindow,
    cpuOffload,
    offloadedWeightsGiB,
  });
  const usesMinimumPlan = budget.deployable != null;
  const plan = budget.deployable ?? budget.selected;
  const sources = getPurchaseSources(plan.sourceIds);

  return (
    <section className="hardware-purchase" aria-labelledby="purchase-title">
      <div className="hardware-purchase-heading">
        <div>
          <h2 id="purchase-title">硬件购置预算</h2>
          <p>一次性购置 · 人民币 · GPU 公开价 + 平台预留</p>
        </div>
        <span className="hardware-purchase-date">{HARDWARE_PURCHASE_AS_OF}</span>
      </div>

      {plan.total ? (
        <>
          <div className="hardware-purchase-main">
            <strong>约 {formatCny(plan.total.typicalCny)}</strong>
            <span>{formatRange(plan.total)} · 整机预算</span>
          </div>
          <p className="hardware-purchase-plan">{plan.planLabel}</p>
          <PurchaseBasis plan={plan} />
          {usesMinimumPlan ? (
            <p className="hardware-purchase-minimum">
              当前 {gpuCount} GPU 预计 OOM；已按最少 {plan.gpuCount} GPU 的可运行方案计算。
            </p>
          ) : null}
          <PurchaseLines plan={plan} />
          {plan.message ? (
            <p className="hardware-purchase-warning">{plan.message}</p>
          ) : null}
          <Scope plan={plan} />
        </>
      ) : (
        <>
          <p className="hardware-purchase-status">{statusTitle(plan)}</p>
          <p className="hardware-purchase-plan">{plan.planLabel}</p>
          <PurchaseBasis plan={plan} />
          {plan.message ? (
            <p className="hardware-purchase-warning">{plan.message}</p>
          ) : null}
          {plan.lines.length ? <PurchaseLines plan={plan} /> : null}
        </>
      )}

      {sources.length ? (
        <details className="hardware-purchase-sources">
          <summary>来源与口径 {sources.length} 条</summary>
          <ul>
            {sources.map(({ sourceId, source }) => (
              <li key={sourceId}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.seller} ↗
                </a>
                <b>{source.label}</b>
                <span>
                  {source.quotedPrice
                    ? `${formatQuotedPrice(source)} · `
                    : ""}
                  {source.quotedOn
                    ? `报价快照 ${source.quotedOn}`
                    : `整理 ${source.checkedOn}`} · {source.market} · {source.condition}
                </span>
                <small>{source.note}</small>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="hardware-purchase-note">
        价格整理于 {HARDWARE_PURCHASE_AS_OF}，仅供采购初筛；库存、地区、税率、二手成色、整机配置和服务都会改变最终成交价。
      </p>
    </section>
  );
}

function PurchaseLines({ plan }: { plan: PurchasePlan }) {
  return (
    <div className="hardware-purchase-lines" aria-label="购置明细">
      {plan.lines.map((line) => (
        <div key={line.id}>
          <span>
            {line.label}
            <small>
              {line.isEstimate ? "平台预留 · " : ""}
              × {line.quantity} {line.unit}
            </small>
          </span>
          <b>{formatRange(line.subtotal)}</b>
        </div>
      ))}
    </div>
  );
}

function Scope({ plan }: { plan: PurchasePlan }) {
  return (
    <div className="hardware-purchase-scope">
      <span>已含：{plan.included.join("、")}</span>
      <span>未含：{plan.excluded.join("、")}</span>
    </div>
  );
}

function PurchaseBasis({ plan }: { plan: PurchasePlan }) {
  if (!plan.priceBasis) return null;
  return (
    <p className="hardware-purchase-basis">
      {plan.priceBasis}；
      {plan.isAppliance
        ? "完整整机，不叠加服务器平台预算。"
        : "CPU、内存、存储和供电为静态平台预留。"}
    </p>
  );
}

function statusTitle(plan: PurchasePlan) {
  switch (plan.status) {
    case "blocked":
      return "无法以硬件补救";
    case "partial":
      return "预算待补全";
    case "requires-quote":
      return "需要整机询价";
    default:
      return "暂未收录可核验购置价";
  }
}

function formatCny(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRange(value: PriceRange) {
  if (value.lowCny === value.highCny) return formatCny(value.typicalCny);
  return `${formatCny(value.lowCny)}–${formatCny(value.highCny)}`;
}

function formatQuotedPrice(source: PurchaseSource) {
  const price = source.quotedPrice;
  if (!price) return "";
  const amount = price.amount.toLocaleString("zh-CN", {
    maximumFractionDigits: 2,
  });
  const currency = price.currency === "CNY" ? "¥" : "US$";
  return `${currency}${amount}${price.qualifier ? ` ${price.qualifier}` : ""}`;
}

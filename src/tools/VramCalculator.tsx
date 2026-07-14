import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { CalculatorFaq } from "./CalculatorFaq";
import { HardwarePurchaseBudget } from "./HardwarePurchaseBudget";
import { InferenceExperience } from "./InferenceExperience";
import {
  SearchableSelect,
  type SearchableOption,
} from "./SearchableSelect";
import {
  DEFAULT_CALCULATOR_INPUT,
  GPUS,
  GPU_CATEGORIES,
  MODEL_CATEGORIES,
  MODELS,
  PRECISIONS,
  RESERVES,
  estimateVram,
  exceedsContextWindow,
  formatGiB,
  formatTokens,
  normaliseInput,
  type CalculatorInput,
  type GpuId,
  type ModelId,
  type PrecisionId,
  type ReserveLevel,
} from "../lib/vram";
import { configFromHash, shareUrl } from "../lib/share";

type PresetId = "local" | "studio" | "spark" | "32b" | "70b" | "long";

const PRESETS: Record<PresetId, Partial<CalculatorInput>> = {
  local: {
    modelId: "qwen3-8b",
    weightPrecision: "int4",
    kvPrecision: "fp16",
    gpuId: "rtx-4060ti-16",
    gpuCount: 1,
    contextTokens: 8192,
    outputTokens: 1024,
    batchSize: 1,
    concurrency: 1,
  },
  studio: {
    modelId: "qwen3-32b",
    weightPrecision: "int4",
    kvPrecision: "fp16",
    gpuId: "mac-studio-m2-ultra-192",
    gpuCount: 1,
    contextTokens: 16384,
    outputTokens: 2048,
    batchSize: 1,
    concurrency: 1,
  },
  spark: {
    modelId: "llama-3-70b",
    weightPrecision: "int4",
    kvPrecision: "fp8",
    gpuId: "dgx-spark-128",
    gpuCount: 1,
    contextTokens: 16384,
    outputTokens: 2048,
    batchSize: 1,
    concurrency: 1,
  },
  "32b": {
    modelId: "qwen3-32b",
    weightPrecision: "int4",
    kvPrecision: "fp16",
    gpuId: "rtx-4090",
    gpuCount: 1,
    contextTokens: 8192,
    outputTokens: 1024,
    batchSize: 1,
    concurrency: 1,
  },
  "70b": {
    modelId: "llama-3-70b",
    weightPrecision: "int4",
    kvPrecision: "fp16",
    gpuId: "l40s-48",
    gpuCount: 2,
    contextTokens: 32768,
    outputTokens: 2048,
    batchSize: 1,
    concurrency: 4,
  },
  long: {
    modelId: "llama-3-8b",
    weightPrecision: "int4",
    kvPrecision: "fp8",
    gpuId: "rtx-5090",
    gpuCount: 1,
    contextTokens: 126976,
    outputTokens: 4096,
    batchSize: 1,
    concurrency: 1,
  },
};

const presetLabels: Record<PresetId, [string, string]> = {
  local: ["8B 本地", "16GB"],
  studio: ["Mac Studio", "32B"],
  spark: ["DGX Spark", "70B"],
  "32b": ["32B 高质量", "24GB"],
  "70b": ["70B 服务", "2 × 48GB"],
  long: ["长上下文", "128K"],
};

const statusLabels = {
  comfortable: "余量充足",
  caution: "接近上限",
  tight: "显存紧张",
  oom: "预计 OOM",
};

const MODEL_OPTIONS: SearchableOption<ModelId>[] = MODEL_CATEGORIES.flatMap(
  (category) =>
    Object.entries(MODELS).flatMap(([id, model]) =>
      model.category === category
        ? [
            {
              value: id as ModelId,
              label: model.label,
              group: category,
              keywords: `${model.attention} ${model.contextWindow}`,
            },
          ]
        : [],
    ),
);

const GPU_OPTIONS: SearchableOption<GpuId>[] = GPU_CATEGORIES.flatMap(
  (category) =>
    Object.entries(GPUS).flatMap(([id, gpu]) =>
      gpu.category === category
        ? [
            {
              value: id as GpuId,
              label: `${gpu.label} · ${gpu.memoryGiB} GiB${
                "memoryType" in gpu ? " UMA" : ""
              }`,
              group: category,
              keywords: `${category} ${gpu.memoryGiB} GiB ${gpu.memoryGiB}GB ${
                "memoryType" in gpu ? gpu.memoryType : ""
              }`,
            },
          ]
        : [],
    ),
);

function loadConfig() {
  const fromHash = configFromHash(window.location.hash);
  if (fromHash) return normaliseInput(fromHash);
  try {
    const stored = window.localStorage.getItem("ray-vram-config-v1");
    return stored
      ? normaliseInput(JSON.parse(stored) as Partial<CalculatorInput>)
      : DEFAULT_CALCULATOR_INPUT;
  } catch {
    return DEFAULT_CALCULATOR_INPUT;
  }
}

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    // HTTP previews may expose Clipboard but reject write access.
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function VramCalculator() {
  const [config, setConfig] = useState<CalculatorInput>(loadConfig);
  const [toast, setToast] = useState("");
  const estimate = useMemo(() => estimateVram(config), [config]);
  const selectedGpu = estimate.gpu;
  const contextExceedsWindow = exceedsContextWindow(config);
  const displaySafety =
    contextExceedsWindow && estimate.fits ? "caution" : estimate.safety;
  const isUnifiedMemory = selectedGpu.memoryType === "统一内存";

  const update = (next: Partial<CalculatorInput>) => {
    setConfig((current) => normaliseInput({ ...current, ...next }));
  };

  useEffect(() => {
    document.title = "LLM 推理显存计算器 / Ray";
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("ray-vram-config-v1", JSON.stringify(config));
    } catch {
      // The calculator remains usable when local storage is unavailable.
    }
  }, [config]);

  useEffect(() => {
    if (selectedGpu.supportsMultiGpu === false && config.gpuCount !== 1)
      update({ gpuCount: 1 });
  }, [config.gpuCount, selectedGpu.supportsMultiGpu]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const applyPreset = (preset: PresetId) => {
    update(PRESETS[preset]);
    setToast("已载入");
  };

  const copyShare = async () => {
    const url = shareUrl(config);
    await copyText(url);
    window.history.replaceState({}, "", url);
    setToast("链接已复制");
  };

  const copySummary = async () => {
    await copyText(
      `${estimate.model.label} · ${estimate.weightPrecision.label}\n${estimate.gpu.label} × ${config.gpuCount}\n${formatGiB(estimate.totalPerGpuGiB)} GiB / 设备`,
    );
    setToast("摘要已复制");
  };

  const parts = {
    weights: estimate.gpuWeightsGiB / config.gpuCount,
    kv: estimate.kvCacheGiB / config.gpuCount,
    workspace: estimate.workspaceGiB / config.gpuCount,
  };
  const runtime = Math.max(
    0,
    estimate.totalPerGpuGiB - parts.weights - parts.kv - parts.workspace,
  );
  const visualMax = Math.max(estimate.totalPerGpuGiB, estimate.gpu.memoryGiB);
  return (
    <div className="calculator-page">
      <header className="calculator-topbar calculator-shell">
        <a href="/tools/">← 工具</a>
        <h1>LLM 推理显存计算器</h1>
        <button
          type="button"
          onClick={() => void copyShare()}
          aria-label="复制分享链接"
        >
          分享 ↗
        </button>
      </header>

      <main className="calculator-shell">
        <section className="quick-presets" aria-labelledby="preset-title">
          <h2 id="preset-title">快速试算</h2>
          <div>
            {(Object.keys(PRESETS) as PresetId[]).map((preset) => (
              <Preset
                key={preset}
                label={presetLabels[preset]}
                onClick={() => applyPreset(preset)}
              />
            ))}
          </div>
        </section>

        <section className="calculator-grid" id="calculator">
          <section className="config-card" aria-label="推理配置">
            <ConfigSection title="模型">
              <div className="compact-fields three">
                <Field label="模型">
                  <SearchableSelect
                    value={config.modelId}
                    options={MODEL_OPTIONS}
                    placeholder="选择模型"
                    onChange={(modelId) => update({ modelId })}
                  />
                </Field>
                <Field label="权重">
                  <select
                    value={config.weightPrecision}
                    onChange={(event) =>
                      update({
                        weightPrecision: event.target.value as PrecisionId,
                      })
                    }
                  >
                    {Object.entries(PRECISIONS).map(([id, precision]) => (
                      <option key={id} value={id}>
                        {precision.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="KV Cache">
                  <select
                    value={config.kvPrecision}
                    onChange={(event) =>
                      update({ kvPrecision: event.target.value as PrecisionId })
                    }
                  >
                    {(["fp16", "fp8", "int8", "int4"] as PrecisionId[]).map(
                      (id) => (
                        <option key={id} value={id}>
                          {PRECISIONS[id].label}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              </div>
              {config.modelId === "custom" ? (
                <div className="compact-fields four custom-fields">
                  <Field label="参数 B">
                    <NumberInput
                      value={config.customParametersB}
                      min={0.1}
                      max={2000}
                      step={0.1}
                      onChange={(value) => update({ customParametersB: value })}
                    />
                  </Field>
                  <Field label="层">
                    <NumberInput
                      value={config.customLayers}
                      min={1}
                      max={512}
                      onChange={(value) => update({ customLayers: value })}
                    />
                  </Field>
                  <Field label="KV heads">
                    <NumberInput
                      value={config.customKvHeads}
                      min={1}
                      max={256}
                      onChange={(value) => update({ customKvHeads: value })}
                    />
                  </Field>
                  <Field label="head dim">
                    <NumberInput
                      value={config.customHeadDim}
                      min={8}
                      max={1024}
                      onChange={(value) => update({ customHeadDim: value })}
                    />
                  </Field>
                </div>
              ) : null}
            </ConfigSection>

            <ConfigSection title="设备">
              <div className="compact-fields two">
                <Field label="设备">
                  <SearchableSelect
                    value={config.gpuId}
                    options={GPU_OPTIONS}
                    placeholder="选择设备"
                    onChange={(gpuId) => update({ gpuId })}
                  />
                </Field>
                <Field label="数量">
                  <select
                    value={config.gpuCount}
                    disabled={selectedGpu.supportsMultiGpu === false}
                    onChange={(event) =>
                      update({ gpuCount: Number(event.target.value) })
                    }
                  >
                    {[1, 2, 4, 8, 16, 32].map((count) => (
                      <option key={count} value={count}>
                        {count} {isUnifiedMemory ? "台" : "张"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {config.gpuId === "custom" ? (
                <div className="compact-fields three custom-fields">
                  <Field label="显存 GiB">
                    <NumberInput
                      value={config.customGpuMemoryGiB}
                      min={1}
                      max={2048}
                      onChange={(value) =>
                        update({ customGpuMemoryGiB: value })
                      }
                    />
                  </Field>
                  <Field label="带宽 GB/s">
                    <NumberInput
                      value={config.customGpuBandwidthGBs}
                      min={10}
                      max={10000}
                      onChange={(value) =>
                        update({ customGpuBandwidthGBs: value })
                      }
                    />
                  </Field>
                  <Field label="TFLOPS">
                    <NumberInput
                      value={config.customGpuTflops}
                      min={1}
                      max={10000}
                      onChange={(value) => update({ customGpuTflops: value })}
                    />
                  </Field>
                </div>
              ) : null}
            </ConfigSection>

            <ConfigSection title="请求">
              <div className="compact-fields four">
                <Field label="输入 token">
                  <NumberInput
                    value={config.contextTokens}
                    min={64}
                    max={1_000_000}
                    step={512}
                    onChange={(value) => update({ contextTokens: value })}
                  />
                </Field>
                <Field label="输出 token">
                  <NumberInput
                    value={config.outputTokens}
                    min={1}
                    max={131072}
                    step={128}
                    onChange={(value) => update({ outputTokens: value })}
                  />
                </Field>
                <Field label="批量">
                  <NumberInput
                    value={config.batchSize}
                    min={1}
                    max={128}
                    onChange={(value) => update({ batchSize: value })}
                  />
                </Field>
                <Field label="并发">
                  <NumberInput
                    value={config.concurrency}
                    min={1}
                    max={128}
                    onChange={(value) => update({ concurrency: value })}
                  />
                </Field>
              </div>
              <div className="config-inline-actions">
                <label className="compact-toggle">
                  <input
                    type="checkbox"
                    checked={config.cpuOffload}
                    onChange={(event) =>
                      update({ cpuOffload: event.target.checked })
                    }
                  />
                  <span /> CPU 卸载
                </label>
                {config.cpuOffload ? (
                  <Field label="卸载 %">
                    <NumberInput
                      value={config.offloadPercent}
                      min={5}
                      max={95}
                      step={5}
                      onChange={(value) => update({ offloadPercent: value })}
                    />
                  </Field>
                ) : null}
                <Field label="余量">
                  <select
                    value={config.reserve}
                    onChange={(event) =>
                      update({ reserve: event.target.value as ReserveLevel })
                    }
                  >
                    {Object.entries(RESERVES).map(([id, reserve]) => (
                      <option key={id} value={id}>
                        {reserve.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </ConfigSection>
          </section>

          <div className="result-stack">
            <aside className="result-card" aria-live="polite">
              <div className="result-card-top">
                <span>
                  {contextExceedsWindow
                    ? "超过模型窗口"
                    : statusLabels[displaySafety]}
                </span>
                <button type="button" onClick={() => void copySummary()}>
                  复制
                </button>
              </div>
              <div className="result-main">
                <div
                  className="result-dial"
                  style={
                    {
                      "--dial": Math.min(1, estimate.utilization),
                      "--dial-color": dialColor(displaySafety),
                    } as CSSProperties
                  }
                >
                  <b>{Math.round(estimate.utilization * 100)}%</b>
                </div>
                <div>
                  <strong>
                    {formatGiB(estimate.totalPerGpuGiB)} <small>GiB</small>
                  </strong>
                  <p>
                    {estimate.gpu.label} × {config.gpuCount}
                  </p>
                </div>
              </div>
              <div className="result-bar">
                <i
                  className="weights"
                  style={{ width: size(parts.weights, visualMax) }}
                />
                <i
                  className="kv"
                  style={{ width: size(parts.kv, visualMax) }}
                />
                <i
                  className="workspace"
                  style={{ width: size(parts.workspace, visualMax) }}
                />
                <i
                  className="runtime"
                  style={{ width: size(runtime, visualMax) }}
                />
              </div>
              <div className="result-parts">
                <ResultPart label="权重" value={parts.weights} />
                <ResultPart label="KV" value={parts.kv} />
                <ResultPart label="工作区" value={parts.workspace} />
                <ResultPart label="运行时 / 预留" value={runtime} />
              </div>
              <div className="result-metrics">
                <Metric
                  label="总吞吐"
                  value={formatNumber(estimate.performance.totalTokensPerSecond)}
                  unit="tok/s"
                />
                <Metric
                  label="首 token"
                  value={formatNumber(estimate.performance.timeToFirstTokenMs)}
                  unit="ms"
                />
                <Metric
                  label="每用户"
                  value={formatNumber(
                    estimate.performance.perUserTokensPerSecond,
                  )}
                  unit="tok/s"
                />
              </div>
            </aside>
            <HardwarePurchaseBudget
              gpuId={config.gpuId}
              gpuCount={config.gpuCount}
              minimumGpuCount={estimate.minimumGpuCount}
              fits={estimate.fits}
              contextExceedsWindow={contextExceedsWindow}
              cpuOffload={config.cpuOffload}
              offloadedWeightsGiB={
                estimate.weightsGiB * (config.offloadPercent / 100)
              }
            />
          </div>
        </section>

        <InferenceExperience config={config} />
        <CalculatorFaq />
      </main>
      <footer className="calculator-footer calculator-shell">
        <a href="/tools/">Ray / 工具</a>
        <span>
          {estimate.minimumGpuCount
            ? `最少 ${estimate.minimumGpuCount} ${isUnifiedMemory ? "台" : "张"}`
            : ""}
        </span>
      </footer>
      <div
        className={`calculator-toast ${toast ? "is-visible" : ""}`}
        role="status"
      >
        {toast}
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="config-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const labelledChild = isValidElement<{ "aria-label"?: string }>(children)
    ? cloneElement(children, { "aria-label": label })
    : children;

  return (
    <div className="compact-field">
      <span>{label}</span>
      {labelledChild}
    </div>
  );
}

function NumberInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  "aria-label"?: string;
}) {
  return (
    <input
      type="number"
      aria-label={ariaLabel}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(clamp(event.target.value, min, max))}
    />
  );
}

function Preset({
  label,
  onClick,
}: {
  label: [string, string];
  onClick: () => void;
}) {
  return (
    <button className="quick-preset" type="button" onClick={onClick}>
      <b>{label[0]}</b>
      <span>{label[1]}</span>
    </button>
  );
}

function ResultPart({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <b>{formatGiB(value)}</b>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
      <small>{unit}</small>
    </div>
  );
}

function size(value: number, max: number) {
  return `${Math.max(value > 0 ? 0.5 : 0, Math.min(100, (value / max) * 100))}%`;
}

function clamp(value: string, min: number, max: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
}

function formatNumber(value: number) {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  });
}

function dialColor(safety: keyof typeof statusLabels) {
  if (safety === "oom" || safety === "tight") return "#ff7780";
  if (safety === "caution") return "#f6b74a";
  return "#bfef75";
}

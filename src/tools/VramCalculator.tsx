import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  DEFAULT_CALCULATOR_INPUT,
  GPUS,
  MODELS,
  PRECISIONS,
  RESERVES,
  buildSimulationTimeline,
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

type PresetId = "8b-local" | "32b-pro" | "70b-team" | "long-context";

const PRESETS: Record<PresetId, Partial<CalculatorInput>> = {
  "8b-local": {
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
  "32b-pro": {
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
  "70b-team": {
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
  "long-context": {
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

const verdicts = {
  comfortable: {
    icon: "✓",
    title: "有舒适余量",
    copy: "可以开始试跑，并为碎片化和临时峰值留下了空间。",
  },
  caution: {
    icon: "!",
    title: "可以运行，余量偏紧",
    copy: "建议先做短压测；部署服务时优先留出更多单卡空间。",
  },
  tight: {
    icon: "!",
    title: "逼近显存边界",
    copy: "很容易受到引擎、量化格式或 allocator 碎片影响，建议换更大显存或降低目标。",
  },
  oom: {
    icon: "×",
    title: "预计会显存不足",
    copy: "降低量化、上下文或并发；也可以按下方建议增加 GPU。",
  },
};

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
    // Local HTTP previews may expose Clipboard but reject write access.
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

function segmentWidth(value: number, max: number) {
  return `${Math.max(value > 0 ? 0.4 : 0, Math.min(100, (value / max) * 100))}%`;
}

export function VramCalculator() {
  const [config, setConfig] = useState<CalculatorInput>(loadConfig);
  const [toast, setToast] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const estimate = useMemo(() => estimateVram(config), [config]);
  const timeline = useMemo(() => buildSimulationTimeline(config), [config]);
  const currentPoint = timeline.points[simulationStep] ?? timeline.points[0];
  const contextExceedsWindow = exceedsContextWindow(config);
  const displayedSafety: keyof typeof verdicts =
    contextExceedsWindow && estimate.fits ? "caution" : estimate.safety;
  const verdict = contextExceedsWindow
    ? {
        icon: "!",
        title: "上下文超过模型窗口",
        copy: "显存可以放下不代表模型支持该长度；请换兼容模型或降低输入上下文。",
      }
    : verdicts[estimate.safety];

  useEffect(() => {
    document.title = "LLM 显存计算器 / Ray";
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("ray-vram-config-v1", JSON.stringify(config));
    } catch {
      // Storage is convenience only; the calculator works without it.
    }
    setSimulationStep(0);
    setSimulating(false);
  }, [config]);

  useEffect(() => {
    if (!simulating) return;
    const timer = window.setInterval(() => {
      setSimulationStep((step) => {
        if (step >= timeline.points.length - 1) {
          setSimulating(false);
          return step;
        }
        return step + 1;
      });
    }, 330);
    return () => window.clearInterval(timer);
  }, [simulating, timeline.points.length]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const update = (next: Partial<CalculatorInput>) => {
    setConfig((current) => normaliseInput({ ...current, ...next }));
  };

  const setPreset = (preset: PresetId) => {
    update(PRESETS[preset]);
    setToast("已载入场景；结果已重新计算");
    window.setTimeout(
      () =>
        document
          .querySelector(".vram-workbench")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };

  const copyShare = async () => {
    const url = shareUrl(config);
    await copyText(url);
    window.history.replaceState({}, "", url);
    setToast("可分享配置已复制：接收者会在自己的浏览器重新计算");
  };

  const copySummary = async () => {
    const summary = [
      `${estimate.model.label} · ${estimate.weightPrecision.label} 权重 / ${estimate.kvPrecision.label} KV`,
      `${estimate.gpu.label} × ${config.gpuCount} · ${formatTokens(config.contextTokens)} 上下文 · ${config.concurrency} 路并发`,
      `预计 ${formatGiB(estimate.totalPerGpuGiB)} GiB / GPU（可用 ${formatGiB(estimate.gpu.memoryGiB)} GiB，${estimate.fits ? "可运行" : "预计 OOM"}）`,
    ].join("\n");
    await copyText(summary);
    setToast("结果摘要已复制");
  };

  const componentValues = {
    weights: estimate.gpuWeightsGiB / config.gpuCount,
    kv: estimate.kvCacheGiB / config.gpuCount,
    workspace: estimate.workspaceGiB / config.gpuCount,
  };
  const componentValuesWithRuntime = {
    ...componentValues,
    runtime: Math.max(
      0,
      estimate.totalPerGpuGiB -
        componentValues.weights -
        componentValues.kv -
        componentValues.workspace,
    ),
  };
  const visualMax = Math.max(estimate.totalPerGpuGiB, estimate.gpu.memoryGiB);
  const chart = chartGeometry(
    timeline.points,
    estimate.gpu.memoryGiB,
    simulationStep,
  );

  return (
    <div className="vram-page">
      <header className="vram-topbar vram-shell">
        <a className="vram-brand" href="/tools/" aria-label="返回工具列表">
          <span className="vram-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>显存实验室</span>
          <small>VRAM LAB</small>
        </a>
        <nav aria-label="计算器导航">
          <a href="#calculator">计算器</a>
          <a href="#simulation">推理模拟</a>
          <a href="#method">方法</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="vram-home-link" href="/">
          Ray 主页 ↗
        </a>
      </header>

      <main>
        <section className="vram-hero vram-shell">
          <div>
            <p className="vram-eyebrow">
              <span /> 本地计算 · 不上传配置
            </p>
            <h1>
              让每一张显卡，
              <br />
              <em>都有可解释的答案。</em>
            </h1>
            <p>
              从权重、KV Cache 到运行时缓冲，一次看清 LLM
              推理真正需要的显存。把方案变成链接，团队可以复现同一组数字。
            </p>
          </div>
          <div className="vram-hero-object" aria-label="显存计算示意图">
            <div className="vram-orbit vram-orbit-a" />
            <div className="vram-orbit vram-orbit-b" />
            <div className="vram-chip">
              <span>显存</span>
              <b>
                {estimate.gpu.memoryGiB}
                <small> GiB</small>
              </b>
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="vram-float-card vram-float-card-a">
              <span className="dot dot-blue" />
              <b>KV Cache</b>
              <small>随上下文与并发增长</small>
            </div>
            <div className="vram-float-card vram-float-card-b">
              <span className="dot dot-mint" />
              <b>配置可复现</b>
              <small>链接不经过服务器</small>
            </div>
          </div>
        </section>

        <section className="vram-workbench vram-shell" id="calculator">
          <div className="vram-section-heading">
            <div>
              <p className="vram-eyebrow">
                <span /> 推理工作台
              </p>
              <h2>选择一个真实的推理场景</h2>
            </div>
            <span className="vram-local-status">
              <i /> 配置仅保留在此浏览器
            </span>
          </div>

          <div className="vram-workbench-grid">
            <section className="vram-config-card" aria-label="计算配置">
              <ConfigTitle number="01" title="模型与精度" />
              <div className="vram-field-grid two">
                <Field label="模型">
                  <select
                    value={config.modelId}
                    onChange={(event) =>
                      update({ modelId: event.target.value as ModelId })
                    }
                  >
                    {Object.entries(MODELS).map(([id, model]) => (
                      <option key={id} value={id}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="权重量化">
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
                        {precision.label} · {precision.bytesPerValue} bytes
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field
                label={
                  <>
                    KV Cache 精度{" "}
                    <Tooltip text="KV Cache 保存每层的历史 token。长上下文与高并发时，它往往会成为显存的主角。" />
                  </>
                }
                className="vram-field-full"
              >
                <select
                  value={config.kvPrecision}
                  onChange={(event) =>
                    update({ kvPrecision: event.target.value as PrecisionId })
                  }
                >
                  {(["fp16", "fp8", "int8", "int4"] as PrecisionId[]).map(
                    (id) => (
                      <option key={id} value={id}>
                        {PRECISIONS[id].label} · {PRECISIONS[id].description}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <div className="vram-model-meta">
                <span>
                  <b>{estimate.model.attention}</b> 注意力
                </span>
                <span>
                  <b>{estimate.model.layers}</b> 层
                </span>
                <span>
                  <b>{estimate.model.kvHeads}</b> KV heads
                </span>
                <span>
                  窗口 <b>{formatTokens(estimate.model.contextWindow)}</b>
                </span>
                {contextExceedsWindow ? (
                  <span className="vram-model-warning">
                    ! 当前输入超过模型窗口
                  </span>
                ) : null}
              </div>
              {config.modelId === "custom" ? (
                <div className="vram-advanced-grid">
                  <Field label="参数量 (B)">
                    <NumberInput
                      value={config.customParametersB}
                      min={0.1}
                      max={2000}
                      step={0.1}
                      onChange={(value) => update({ customParametersB: value })}
                    />
                  </Field>
                  <Field label="层数">
                    <NumberInput
                      value={config.customLayers}
                      min={1}
                      max={512}
                      onChange={(value) => update({ customLayers: value })}
                    />
                  </Field>
                  <Field label="KV Heads">
                    <NumberInput
                      value={config.customKvHeads}
                      min={1}
                      max={256}
                      onChange={(value) => update({ customKvHeads: value })}
                    />
                  </Field>
                  <Field label="Head Dim">
                    <NumberInput
                      value={config.customHeadDim}
                      min={8}
                      max={1024}
                      onChange={(value) => update({ customHeadDim: value })}
                    />
                  </Field>
                </div>
              ) : null}

              <div className="vram-divider" />
              <ConfigTitle number="02" title="硬件拓扑" />
              <div className="vram-field-grid two">
                <Field label="GPU">
                  <select
                    value={config.gpuId}
                    onChange={(event) =>
                      update({ gpuId: event.target.value as GpuId })
                    }
                  >
                    {Object.entries(GPUS).map(([id, gpu]) => (
                      <option key={id} value={id}>
                        {gpu.label} · {gpu.memoryGiB} GiB
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="GPU 数量">
                  <select
                    value={config.gpuCount}
                    onChange={(event) =>
                      update({ gpuCount: Number(event.target.value) })
                    }
                  >
                    {[1, 2, 4, 8].map((count) => (
                      <option key={count} value={count}>
                        {count} 张
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {config.gpuId === "custom" ? (
                <div className="vram-advanced-grid three">
                  <Field label="显存 (GiB)">
                    <NumberInput
                      value={config.customGpuMemoryGiB}
                      min={1}
                      max={2048}
                      onChange={(value) =>
                        update({ customGpuMemoryGiB: value })
                      }
                    />
                  </Field>
                  <Field label="带宽 (GB/s)">
                    <NumberInput
                      value={config.customGpuBandwidthGBs}
                      min={10}
                      max={10000}
                      onChange={(value) =>
                        update({ customGpuBandwidthGBs: value })
                      }
                    />
                  </Field>
                  <Field label="FP16 TFLOPS">
                    <NumberInput
                      value={config.customGpuTflops}
                      min={1}
                      max={10000}
                      onChange={(value) => update({ customGpuTflops: value })}
                    />
                  </Field>
                </div>
              ) : null}

              <div className="vram-divider" />
              <ConfigTitle number="03" title="请求形态" />
              <RangeControl
                label="输入上下文"
                value={config.contextTokens}
                min={512}
                max={131072}
                step={512}
                output={`${formatTokens(config.contextTokens)} tokens`}
                stops={["512", "8K", "32K", "128K"]}
                onChange={(value) => update({ contextTokens: value })}
              />
              <div className="vram-field-grid two vram-numeric-fields">
                <Field label="预留输出 token">
                  <NumberInput
                    value={config.outputTokens}
                    min={1}
                    max={131072}
                    step={128}
                    onChange={(value) => update({ outputTokens: value })}
                  />
                </Field>
                <Field label="批量大小">
                  <NumberInput
                    value={config.batchSize}
                    min={1}
                    max={128}
                    onChange={(value) => update({ batchSize: value })}
                  />
                </Field>
              </div>
              <RangeControl
                label="并发用户"
                value={config.concurrency}
                min={1}
                max={32}
                step={1}
                output={`${config.concurrency} 路`}
                stops={["1", "8", "16", "32"]}
                onChange={(value) => update({ concurrency: value })}
              />
              <p className="vram-field-note">
                <span>i</span> 有效序列数 = 批量大小 ×
                并发用户。两者一起增大时，KV Cache 会相乘。
              </p>

              <div className="vram-offload-box">
                <label className="vram-toggle-label">
                  <input
                    type="checkbox"
                    checked={config.cpuOffload}
                    onChange={(event) =>
                      update({ cpuOffload: event.target.checked })
                    }
                  />
                  <span className="vram-toggle" aria-hidden="true" />
                  <span>
                    <b>CPU / RAM 卸载</b>
                    <small>
                      将一部分权重放到系统内存，降低 GPU 显存，但会拖慢解码。
                    </small>
                  </span>
                </label>
                {config.cpuOffload ? (
                  <RangeControl
                    label="卸载比例"
                    value={config.offloadPercent}
                    min={5}
                    max={95}
                    step={5}
                    output={`${config.offloadPercent}%`}
                    onChange={(value) => update({ offloadPercent: value })}
                  />
                ) : null}
              </div>
              <Field label="运行时余量" className="vram-reserve-select">
                <select
                  value={config.reserve}
                  onChange={(event) =>
                    update({ reserve: event.target.value as ReserveLevel })
                  }
                >
                  {Object.entries(RESERVES).map(([id, reserve]) => (
                    <option key={id} value={id}>
                      {reserve.label} ·{" "}
                      {Math.round(reserve.fragmentationRate * 100)}% 分配器余量
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            <aside className="vram-result-card" aria-live="polite">
              <div className="vram-result-top">
                <div>
                  <p className="vram-eyebrow">
                    <span /> 峰值显存
                  </p>
                  <h2>配置结果</h2>
                </div>
                <button
                  className="vram-share-button"
                  type="button"
                  onClick={() => void copyShare()}
                  title="复制可分享配置"
                >
                  ↗
                </button>
              </div>
              <div className="vram-memory-hero">
                <div
                  className="vram-memory-dial"
                  style={
                    {
                      "--dial": Math.min(1, estimate.utilization),
                      "--dial-color":
                        displayedSafety === "oom" || displayedSafety === "tight"
                          ? "#ff7780"
                          : displayedSafety === "caution"
                            ? "#f6b74a"
                            : "#cafa86",
                    } as CSSProperties
                  }
                >
                  <div>
                    <b>{Math.round(estimate.utilization * 100)}%</b>
                    <span>单卡占用</span>
                  </div>
                </div>
                <div className="vram-memory-readout">
                  <b>
                    {formatGiB(estimate.totalPerGpuGiB)}{" "}
                    <small>GiB / GPU</small>
                  </b>
                  <p>
                    共 <strong>{formatGiB(estimate.capacityGiB)}</strong> GiB
                    可用显存
                  </p>
                  <span className={`vram-fit-badge ${displayedSafety}`}>
                    {contextExceedsWindow
                      ? "超出模型窗口"
                      : estimate.fits
                        ? "预计可运行"
                        : "预计 OOM"}
                  </span>
                </div>
              </div>
              <div className="vram-memory-bar" aria-label="显存组成">
                <i
                  className="weights"
                  style={{
                    width: segmentWidth(
                      componentValuesWithRuntime.weights,
                      visualMax,
                    ),
                  }}
                />
                <i
                  className="kv"
                  style={{
                    width: segmentWidth(
                      componentValuesWithRuntime.kv,
                      visualMax,
                    ),
                  }}
                />
                <i
                  className="workspace"
                  style={{
                    width: segmentWidth(
                      componentValuesWithRuntime.workspace,
                      visualMax,
                    ),
                  }}
                />
                <i
                  className="runtime"
                  style={{
                    width: segmentWidth(
                      componentValuesWithRuntime.runtime,
                      visualMax,
                    ),
                  }}
                />
              </div>
              <ul className="vram-memory-list">
                <MemoryLine
                  color="weights"
                  label={config.cpuOffload ? "GPU 驻留权重" : "权重"}
                  value={componentValuesWithRuntime.weights}
                />
                <MemoryLine
                  color="kv"
                  label="KV Cache"
                  value={componentValuesWithRuntime.kv}
                />
                <MemoryLine
                  color="workspace"
                  label="预填充工作区"
                  value={componentValuesWithRuntime.workspace}
                />
                <MemoryLine
                  color="runtime"
                  label="运行时 / 余量"
                  value={componentValuesWithRuntime.runtime}
                />
              </ul>
              <div className={`vram-verdict ${displayedSafety}`}>
                <span>{verdict.icon}</span>
                <div>
                  <b>{verdict.title}</b>
                  <p>{verdict.copy}</p>
                </div>
              </div>
              <div className="vram-performance-heading">
                <span>估算性能</span>
                <small>理论范围，不等于实测</small>
              </div>
              <div className="vram-performance-grid">
                <Metric
                  label="总吞吐"
                  value={formatNumber(
                    estimate.performance.totalTokensPerSecond,
                  )}
                  suffix="tok/s"
                />
                <Metric
                  label="首 token"
                  value={formatNumber(estimate.performance.timeToFirstTokenMs)}
                  suffix="ms"
                />
                <Metric
                  label="每用户"
                  value={formatNumber(
                    estimate.performance.perUserTokensPerSecond,
                  )}
                  suffix="tok/s"
                />
              </div>
              <div className="vram-result-footer">
                <span>
                  {estimate.minimumGpuCount
                    ? `同款 GPU 最少约需 ${estimate.minimumGpuCount} 张`
                    : "超过 32 张仍无法安全估算"}
                </span>
                <button type="button" onClick={() => void copySummary()}>
                  复制摘要
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="vram-presets vram-shell" aria-label="常见配置">
          <div>
            <p className="vram-eyebrow">
              <span /> 快速试算
            </p>
            <h2>从一个熟悉的配置开始</h2>
          </div>
          <div className="vram-preset-grid">
            <Preset
              title="8B 本地聊天"
              description="4-bit · 16GB · 8K"
              onClick={() => setPreset("8b-local")}
            />
            <Preset
              title="32B 高质量"
              description="4-bit · 24GB · 8K"
              onClick={() => setPreset("32b-pro")}
            />
            <Preset
              title="70B 团队服务"
              description="4-bit · 2 × 48GB · 32K"
              onClick={() => setPreset("70b-team")}
            />
            <Preset
              title="长上下文 RAG"
              description="Llama 8B · 4-bit · 32GB · 128K 总窗口"
              onClick={() => setPreset("long-context")}
            />
          </div>
        </section>

        <section className="vram-simulation vram-shell" id="simulation">
          <div className="vram-simulation-copy">
            <p className="vram-eyebrow">
              <span /> 推理模拟
            </p>
            <h2>显存不是一个静态数字。</h2>
            <p>
              模型加载后，预填充阶段迅速建立 Cache；随后每生成一个
              token，显存还会继续缓慢攀升。这里展示的是同一配置下的确定性内存轨迹，并不执行或上传模型。
            </p>
            <div className="vram-simulation-stat">
              <span>模拟终点</span>
              <b>{formatGiB(estimate.totalPerGpuGiB)}</b>
              <small>GiB / GPU</small>
            </div>
            <button
              className="vram-play-button"
              type="button"
              onClick={() => {
                setSimulationStep(0);
                setSimulating(true);
              }}
            >
              {simulating ? "模拟进行中…" : "▶ 运行 12 秒模拟"}
            </button>
            <small>
              {simulating
                ? `${currentPoint.phase === "prefill" ? "预填充" : "解码"} · 已生成 ${currentPoint.generatedTokens.toLocaleString("zh-CN")} token`
                : "教学模拟 / 估算，不会真的运行模型。"}
            </small>
          </div>
          <div className="vram-chart-card">
            <div className="vram-chart-header">
              <div>
                <b>每 GPU 显存轨迹</b>
                <span>容量线：{formatGiB(estimate.gpu.memoryGiB)} GiB</span>
              </div>
              <div>
                <span>
                  <i className="purple" />
                  预填充
                </span>
                <span>
                  <i className="mint" />
                  解码
                </span>
              </div>
            </div>
            <div className="vram-chart-frame">
              <svg
                viewBox="0 0 640 280"
                role="img"
                aria-label="显存随推理阶段变化的曲线"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="vram-chart-fill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#8b7cff" stopOpacity=".34" />
                    <stop offset="1" stopColor="#8b7cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g className="vram-chart-grid">
                  <line x1="42" y1="28" x2="616" y2="28" />
                  <line x1="42" y1="91" x2="616" y2="91" />
                  <line x1="42" y1="154" x2="616" y2="154" />
                  <line x1="42" y1="217" x2="616" y2="217" />
                </g>
                <path d={chart.areaPath} fill="url(#vram-chart-fill)" />
                <polyline
                  points={chart.polyline}
                  fill="none"
                  stroke="#8b7cff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="42"
                  x2="616"
                  y1={chart.capacityY}
                  y2={chart.capacityY}
                  className="vram-chart-capacity"
                />
                <circle
                  cx={chart.marker.x}
                  cy={chart.marker.y}
                  r="6"
                  className="vram-chart-marker"
                />
                <g className="vram-chart-labels">
                  <text x="3" y="32">
                    {formatGiB(chart.maxY)}{" "}
                  </text>
                  <text x="8" y="221">
                    0
                  </text>
                  <text x="42" y="258">
                    0s
                  </text>
                  <text x="316" y="258">
                    6s
                  </text>
                  <text x="588" y="258">
                    12s
                  </text>
                </g>
              </svg>
              <div
                className="vram-chart-bubble"
                style={{
                  left: `${chart.markerPercent}%`,
                  top: `${chart.markerTop}%`,
                }}
              >
                <b>{currentPoint.phase === "prefill" ? "预填充" : "解码"}</b>
                <span>{formatGiB(currentPoint.vramGiB)} GiB</span>
              </div>
            </div>
            <div className="vram-chart-footer">
              <span>0</span>
              <span>上下文已就绪</span>
              <span>
                生成{" "}
                <b>{currentPoint.generatedTokens.toLocaleString("zh-CN")}</b>{" "}
                token
              </span>
            </div>
          </div>
        </section>

        <section className="vram-method vram-shell" id="method">
          <div className="vram-method-heading">
            <p className="vram-eyebrow">
              <span /> 可解释的估算
            </p>
            <h2>先拆成四块，再判断能否运行。</h2>
            <p>
              我们把“需要多少显存”分解为可验证的组件，并额外预留运行时与分配器空间。这样你知道该降低什么，而不是只看到一个总数。
            </p>
          </div>
          <div className="vram-method-grid">
            <FormulaCard
              number="01"
              title="模型权重"
              body="参数量 × 权重精度。4-bit 理论上是 FP16 的四分之一，但量化格式仍会有元数据与运行时差异。"
              code="params × bytes / 2³⁰"
            />
            <FormulaCard
              number="02"
              title="KV Cache"
              body="按层、KV 宽度、缓存 token 与有效序列数累加。GQA/MQA 使用 KV heads，而不是 hidden size。"
              code="layers × KV width × tokens × batch"
            />
            <FormulaCard
              number="03"
              title="预填充工作区"
              body="推理时不保留训练激活值；这里保守近似注意力与引擎的临时 workspace。"
              code="workspace + attention buffer"
            />
            <FormulaCard
              number="04"
              title="运行时余量"
              body="给 CUDA、allocator 与多卡通信留空间；逼近 90% 时，真实环境更容易碎片化 OOM。"
              code="runtime + fragmentation"
            />
          </div>
          <div className="vram-method-note">
            <span>⌁</span>
            <p>
              <b>计算口径：</b>权重与 KV 精度独立，普通 decoder-only 模型按{" "}
              <code>2 × layers × KV heads × head dim × cached tokens</code> 估算
              KV。不同引擎、FlashAttention、PagedAttention、张量并行和模型实现会改变实际值，请以目标环境压测为准。
            </p>
            <a
              href="https://help.aliyun.com/zh/pai/product-overview/estimation-of-the-required-video-memory-for-the-model"
              target="_blank"
              rel="noreferrer"
            >
              阿里云估算说明 ↗
            </a>
          </div>
        </section>

        <section className="vram-faq vram-shell" id="faq">
          <div>
            <p className="vram-eyebrow">
              <span /> FAQ
            </p>
            <h2>部署前，常见的几个问题。</h2>
            <p>
              没有看到你的模型？选择自定义模型，或把实际运行数据作为一次校验样本。
            </p>
          </div>
          <div className="vram-faq-list">
            <Faq open question="这个结果和实际显存会差多少？">
              权重与 KV Cache
              是相对稳定的主体；工作区和运行时则取决于框架、算子、驱动、量化格式与并行策略。部署时建议至少额外保留
              10–20% 的单卡余量，并用目标引擎进行一次短压测。
            </Faq>
            <Faq question="为什么同为 8B，显存数字也不一样？">
              “8B”只描述总参数量。模型的层数、KV heads、head
              dimension、注意力结构和上下文窗口不同，KV Cache
              与工作区都会不同；量化文件的实际格式也会引入额外开销。
            </Faq>
            <Faq question="什么时候应该优先压缩 KV Cache？">
              当上下文很长、批量或并发较高时。权重通常是固定成本，而 Cache 随
              token 和有效序列数线性增长。先降低上下文、并发或 KV
              精度，往往比一味压缩权重更有效。
            </Faq>
            <Faq question="CPU / RAM 卸载为什么能运行却变慢？">
              它把部分权重从显卡挪到系统内存，减少 GPU 驻留，但每次推理需要经由
              PCIe 或统一内存搬运。它适合低频、本地试用，而不是高吞吐服务。
            </Faq>
            <Faq question="分享链接会把配置上传到服务器吗？">
              不会。配置经过 URL-safe 编码放在 <code>#c=</code>{" "}
              片段中；片段不会随 HTTP
              请求发送到静态站点。接收者打开链接后，在自己的浏览器中重新计算。
            </Faq>
            <Faq question="推理模拟会真的运行模型吗？">
              不会。它是一个由当前配置派生的内存轨迹，用来解释加载、预填充和解码阶段的显存变化。真实速度与延迟仍应在目标模型与硬件上测试。
            </Faq>
          </div>
        </section>
      </main>
      <footer className="vram-footer vram-shell">
        <a className="vram-brand" href="/tools/">
          <span className="vram-brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>显存实验室</span>
        </a>
        <p>一个可静态部署、可分享、可解释的 LLM 推理容量工具。</p>
        <a href="/">Ray / 主页</a>
      </footer>
      <div
        className={`vram-toast ${toast ? "is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </div>
  );
}

function ConfigTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="vram-config-title">
      <span>{number}</span>
      <h3>{title}</h3>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`vram-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span
      className="vram-help"
      data-tip={text}
      tabIndex={0}
      aria-label="KV Cache 说明"
    >
      ?
    </span>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  output,
  stops,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  output: string;
  stops?: string[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="vram-range">
      <div>
        <label>{label}</label>
        <output>{output}</output>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {stops ? (
        <p>
          {stops.map((stop) => (
            <span key={stop}>{stop}</span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

function MemoryLine({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <li>
      <i className={color} />
      <span>{label}</span>
      <b>{formatGiB(value)} GiB</b>
    </li>
  );
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
      <small>{suffix}</small>
    </div>
  );
}

function Preset({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="vram-preset" type="button" onClick={onClick}>
      <b>{title}</b>
      <span>{description}</span>
    </button>
  );
}

function FormulaCard({
  number,
  title,
  body,
  code,
}: {
  number: string;
  title: string;
  body: string;
  code: string;
}) {
  return (
    <article>
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{body}</p>
      <code>{code}</code>
    </article>
  );
}

function Faq({
  question,
  children,
  open = false,
}: {
  question: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open}>
      <summary>
        {question}
        <span>+</span>
      </summary>
      <p>{children}</p>
    </details>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  });
}

function chartGeometry(
  points: { vramGiB: number }[],
  capacity: number,
  activeIndex: number,
) {
  const left = 42;
  const right = 616;
  const top = 28;
  const bottom = 217;
  const maxY =
    Math.max(capacity, ...points.map((point) => point.vramGiB)) * 1.08;
  const pointAt = (point: { vramGiB: number }, index: number) => ({
    x: left + ((right - left) * index) / Math.max(1, points.length - 1),
    y: bottom - (point.vramGiB / maxY) * (bottom - top),
  });
  const coordinates = points.map(pointAt);
  const active = coordinates[Math.min(activeIndex, coordinates.length - 1)] ?? {
    x: left,
    y: bottom,
  };
  const polyline = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPath = `M ${left} ${bottom} L ${coordinates.map(({ x, y }) => `${x} ${y}`).join(" L ")} L ${right} ${bottom} Z`;
  const capacityY = bottom - (capacity / maxY) * (bottom - top);
  return {
    maxY,
    polyline,
    areaPath,
    capacityY,
    marker: active,
    markerPercent: (active.x / 640) * 100,
    markerTop: (active.y / 280) * 100,
  };
}

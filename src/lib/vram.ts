const GIB = 1024 ** 3;
const CACHE_BLOCK_TOKENS = 16;

export const PRECISIONS = {
  fp32: { label: "FP32", bytesPerValue: 4, description: "最高精度" },
  fp16: { label: "FP16 / BF16", bytesPerValue: 2, description: "通用默认" },
  fp8: { label: "FP8", bytesPerValue: 1, description: "需要引擎支持" },
  int8: { label: "INT8", bytesPerValue: 1, description: "常见量化" },
  int4: { label: "INT4", bytesPerValue: 0.5, description: "最低显存" },
} as const;

export type PrecisionId = keyof typeof PRECISIONS;

export const GPUS = {
  "rtx-3060-12": {
    label: "RTX 3060",
    memoryGiB: 12,
    bandwidthGBs: 360,
    tflops: 25,
    pricePerHour: 0.16,
  },
  "rtx-4060ti-16": {
    label: "RTX 4060 Ti",
    memoryGiB: 16,
    bandwidthGBs: 288,
    tflops: 35,
    pricePerHour: 0.24,
  },
  "rtx-4090": {
    label: "RTX 4090",
    memoryGiB: 24,
    bandwidthGBs: 1008,
    tflops: 83,
    pricePerHour: 0.65,
  },
  "rtx-5090": {
    label: "RTX 5090",
    memoryGiB: 32,
    bandwidthGBs: 1792,
    tflops: 105,
    pricePerHour: 1.15,
  },
  "l40s-48": {
    label: "NVIDIA L40S",
    memoryGiB: 48,
    bandwidthGBs: 864,
    tflops: 91,
    pricePerHour: 1.1,
  },
  "a100-80": {
    label: "NVIDIA A100 80GB",
    memoryGiB: 80,
    bandwidthGBs: 2039,
    tflops: 312,
    pricePerHour: 2.35,
  },
  "h100-80": {
    label: "NVIDIA H100 80GB",
    memoryGiB: 80,
    bandwidthGBs: 3350,
    tflops: 989,
    pricePerHour: 3.85,
  },
  "h200-141": {
    label: "NVIDIA H200 141GB",
    memoryGiB: 141,
    bandwidthGBs: 4800,
    tflops: 989,
    pricePerHour: 5.25,
  },
  custom: {
    label: "自定义 GPU",
    memoryGiB: 24,
    bandwidthGBs: 1000,
    tflops: 80,
    pricePerHour: 0,
  },
} as const;

export type GpuId = keyof typeof GPUS;

export const MODELS = {
  "qwen3-8b": {
    label: "Qwen3 8B",
    totalParametersB: 8.2,
    activeParametersB: 8.2,
    layers: 36,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 32_768,
  },
  "llama-3-8b": {
    label: "Llama 3.1 8B",
    totalParametersB: 8.03,
    activeParametersB: 8.03,
    layers: 32,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "qwen3-32b": {
    label: "Qwen3 32B",
    totalParametersB: 32.8,
    activeParametersB: 32.8,
    layers: 64,
    hiddenSize: 5120,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 32_768,
  },
  "llama-3-70b": {
    label: "Llama 3.3 70B",
    totalParametersB: 70.6,
    activeParametersB: 70.6,
    layers: 80,
    hiddenSize: 8192,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 131_072,
  },
  "deepseek-r1-32b": {
    label: "DeepSeek-R1-Distill-Qwen-32B",
    totalParametersB: 32.8,
    activeParametersB: 32.8,
    layers: 64,
    hiddenSize: 5120,
    kvHeads: 8,
    headDim: 128,
    attention: "GQA",
    contextWindow: 32_768,
  },
  "deepseek-v3": {
    label: "DeepSeek-V3 / R1 (MoE)",
    totalParametersB: 671,
    activeParametersB: 37,
    layers: 61,
    hiddenSize: 7168,
    kvHeads: 1,
    headDim: 1,
    // MLA retains a compact latent cache; it is not the standard K/V shape.
    kvElementsPerToken: 61 * 576,
    attention: "MLA",
    contextWindow: 163_840,
  },
  custom: {
    label: "自定义模型",
    totalParametersB: 8,
    activeParametersB: 8,
    layers: 32,
    hiddenSize: 4096,
    kvHeads: 8,
    headDim: 128,
    attention: "自定义",
    contextWindow: 32_768,
  },
} as const;

export type ModelId = keyof typeof MODELS;

export const RESERVES = {
  tight: { label: "紧凑", fragmentationRate: 0.1, fixedSafetyGiB: 0.25 },
  balanced: { label: "均衡", fragmentationRate: 0.15, fixedSafetyGiB: 0.5 },
  conservative: { label: "保守", fragmentationRate: 0.2, fixedSafetyGiB: 0.75 },
} as const;

export type ReserveLevel = keyof typeof RESERVES;
export type SafetyLevel = "comfortable" | "caution" | "tight" | "oom";

export type CalculatorInput = {
  modelId: ModelId;
  weightPrecision: PrecisionId;
  kvPrecision: PrecisionId;
  gpuId: GpuId;
  gpuCount: number;
  contextTokens: number;
  outputTokens: number;
  batchSize: number;
  concurrency: number;
  cpuOffload: boolean;
  offloadPercent: number;
  reserve: ReserveLevel;
  customParametersB: number;
  customLayers: number;
  customKvHeads: number;
  customHeadDim: number;
  customGpuMemoryGiB: number;
  customGpuBandwidthGBs: number;
  customGpuTflops: number;
};

export const DEFAULT_CALCULATOR_INPUT: CalculatorInput = {
  modelId: "qwen3-8b",
  weightPrecision: "fp16",
  kvPrecision: "fp16",
  gpuId: "rtx-4090",
  gpuCount: 1,
  contextTokens: 4096,
  outputTokens: 1024,
  batchSize: 1,
  concurrency: 1,
  cpuOffload: false,
  offloadPercent: 45,
  reserve: "balanced",
  customParametersB: 8,
  customLayers: 32,
  customKvHeads: 8,
  customHeadDim: 128,
  customGpuMemoryGiB: 24,
  customGpuBandwidthGBs: 1000,
  customGpuTflops: 80,
};

export type ModelDefinition = {
  label: string;
  totalParametersB: number;
  activeParametersB: number;
  layers: number;
  hiddenSize: number;
  kvHeads: number;
  headDim: number;
  attention: string;
  contextWindow: number;
  kvElementsPerToken?: number;
};

export type GpuDefinition = {
  label: string;
  memoryGiB: number;
  bandwidthGBs: number;
  tflops: number;
  pricePerHour: number;
};

function inRange(value: unknown, fallback: number, min: number, max: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? Math.min(Math.max(numeric, min), max)
    : fallback;
}

function idFrom<T extends Record<string, unknown>>(
  collection: T,
  value: unknown,
  fallback: keyof T,
) {
  return typeof value === "string" && value in collection
    ? (value as keyof T)
    : fallback;
}

export function normaliseInput(
  input: Partial<CalculatorInput> = {},
): CalculatorInput {
  const merged = { ...DEFAULT_CALCULATOR_INPUT, ...input };

  return {
    ...merged,
    modelId: idFrom(MODELS, merged.modelId, DEFAULT_CALCULATOR_INPUT.modelId),
    gpuId: idFrom(GPUS, merged.gpuId, DEFAULT_CALCULATOR_INPUT.gpuId),
    weightPrecision: idFrom(
      PRECISIONS,
      merged.weightPrecision,
      DEFAULT_CALCULATOR_INPUT.weightPrecision,
    ),
    kvPrecision: idFrom(
      PRECISIONS,
      merged.kvPrecision,
      DEFAULT_CALCULATOR_INPUT.kvPrecision,
    ),
    reserve: idFrom(RESERVES, merged.reserve, DEFAULT_CALCULATOR_INPUT.reserve),
    gpuCount: Math.round(inRange(merged.gpuCount, 1, 1, 32)),
    contextTokens: Math.round(
      inRange(merged.contextTokens, 4096, 64, 1_000_000),
    ),
    outputTokens: Math.round(inRange(merged.outputTokens, 1024, 1, 131_072)),
    batchSize: Math.round(inRange(merged.batchSize, 1, 1, 128)),
    concurrency: Math.round(inRange(merged.concurrency, 1, 1, 128)),
    offloadPercent: inRange(merged.offloadPercent, 45, 5, 95),
    customParametersB: inRange(merged.customParametersB, 8, 0.1, 2_000),
    customLayers: Math.round(inRange(merged.customLayers, 32, 1, 512)),
    customKvHeads: Math.round(inRange(merged.customKvHeads, 8, 1, 256)),
    customHeadDim: Math.round(inRange(merged.customHeadDim, 128, 8, 1_024)),
    customGpuMemoryGiB: inRange(merged.customGpuMemoryGiB, 24, 1, 2_048),
    customGpuBandwidthGBs: inRange(
      merged.customGpuBandwidthGBs,
      1000,
      10,
      10_000,
    ),
    customGpuTflops: inRange(merged.customGpuTflops, 80, 1, 10_000),
    cpuOffload: Boolean(merged.cpuOffload),
  };
}

export function getModel(
  modelId: ModelId,
  input: Partial<CalculatorInput> = {},
): ModelDefinition {
  const config = normaliseInput({ ...input, modelId });
  const model = MODELS[config.modelId];
  if (config.modelId !== "custom") return model;
  return {
    ...model,
    totalParametersB: config.customParametersB,
    activeParametersB: config.customParametersB,
    layers: config.customLayers,
    kvHeads: config.customKvHeads,
    headDim: config.customHeadDim,
  };
}

export function getGpu(
  gpuId: GpuId,
  input: Partial<CalculatorInput> = {},
): GpuDefinition {
  const config = normaliseInput({ ...input, gpuId });
  const gpu = GPUS[config.gpuId];
  if (config.gpuId !== "custom") return gpu;
  return {
    ...gpu,
    memoryGiB: config.customGpuMemoryGiB,
    bandwidthGBs: config.customGpuBandwidthGBs,
    tflops: config.customGpuTflops,
  };
}

export function exceedsContextWindow(input: Partial<CalculatorInput> = {}) {
  const config = normaliseInput(input);
  const model = getModel(config.modelId, config);
  return config.contextTokens + config.outputTokens > model.contextWindow;
}

function kvElementsPerToken(model: ModelDefinition) {
  return (
    model.kvElementsPerToken ?? 2 * model.layers * model.kvHeads * model.headDim
  );
}

function perGpuLayout({
  gpuWeightsGiB,
  kvCacheGiB,
  workspaceGiB,
  gpuCount,
  runtimePerGpuGiB,
  reserve,
}: {
  gpuWeightsGiB: number;
  kvCacheGiB: number;
  workspaceGiB: number;
  gpuCount: number;
  runtimePerGpuGiB: number;
  reserve: (typeof RESERVES)[ReserveLevel];
}) {
  const rawModelMemory = gpuWeightsGiB + kvCacheGiB + workspaceGiB;
  const fragmentationGiB = rawModelMemory * reserve.fragmentationRate;
  // TP has a small communication/allocator tax. This is explicitly an estimate.
  const parallelTax =
    gpuCount > 1 ? 1 + Math.min(0.12, 0.025 * (gpuCount - 1)) : 1;
  const distributableGiB = (rawModelMemory + fragmentationGiB) * parallelTax;
  const perGpu =
    distributableGiB / gpuCount + runtimePerGpuGiB + reserve.fixedSafetyGiB;
  return {
    fragmentationGiB,
    totalPerGpuGiB: perGpu,
    clusterGiB:
      distributableGiB + (runtimePerGpuGiB + reserve.fixedSafetyGiB) * gpuCount,
  };
}

function performanceEstimate({
  config,
  gpu,
  model,
  weightsGiB,
  totalPerGpuGiB,
}: {
  config: CalculatorInput;
  gpu: GpuDefinition;
  model: ModelDefinition;
  weightsGiB: number;
  totalPerGpuGiB: number;
}) {
  const precisionGain: Record<PrecisionId, number> = {
    fp32: 0.5,
    fp16: 1,
    fp8: 1.3,
    int8: 1.45,
    int4: 1.82,
  };
  const memoryBound =
    (gpu.bandwidthGBs *
      config.gpuCount *
      0.68 *
      precisionGain[config.weightPrecision]) /
    Math.max(weightsGiB, 0.1);
  const computeBound =
    (gpu.tflops * config.gpuCount * 500) /
    Math.max(model.activeParametersB, 0.1);
  const batchingGain =
    1 +
    Math.min(0.32, Math.log2(config.batchSize * config.concurrency) * 0.075);
  const contextPenalty =
    1 / (1 + Math.max(0, config.contextTokens - 4096) / 180_000);
  const offloadPenalty = config.cpuOffload
    ? 1 + (config.offloadPercent / 100) * 1.75
    : 1;
  const totalTokensPerSecond = Math.max(
    0.1,
    (Math.min(memoryBound, computeBound) * batchingGain * contextPenalty) /
      offloadPenalty,
  );
  const perUserTokensPerSecond = totalTokensPerSecond / config.concurrency;
  const timeToFirstTokenMs =
    Math.max(
      70,
      (config.contextTokens * model.activeParametersB * 0.95) /
        Math.max(gpu.tflops * config.gpuCount, 1) +
        (totalPerGpuGiB / gpu.memoryGiB) * 48,
    ) * offloadPenalty;

  return {
    totalTokensPerSecond,
    perUserTokensPerSecond,
    timeToFirstTokenMs,
    costPerMillionOutputTokens:
      gpu.pricePerHour > 0
        ? (gpu.pricePerHour * 1_000_000) /
          Math.max(totalTokensPerSecond * 3600, 1)
        : null,
  };
}

export function estimateVram(input: Partial<CalculatorInput> = {}) {
  const config = normaliseInput(input);
  const model = getModel(config.modelId, config);
  const gpu = getGpu(config.gpuId, config);
  const weightPrecision = PRECISIONS[config.weightPrecision];
  const kvPrecision = PRECISIONS[config.kvPrecision];
  const reserve = RESERVES[config.reserve];
  const effectiveSequences = config.batchSize * config.concurrency;
  const rawTokensPerSequence = config.contextTokens + config.outputTokens;
  const cachedTokensPerSequence =
    Math.ceil(rawTokensPerSequence / CACHE_BLOCK_TOKENS) * CACHE_BLOCK_TOKENS;
  const cachedTokens = cachedTokensPerSequence * effectiveSequences;
  const weightsGiB =
    (model.totalParametersB * 1e9 * weightPrecision.bytesPerValue) / GIB;
  const residentFraction = config.cpuOffload
    ? 1 - config.offloadPercent / 100
    : 1;
  const gpuWeightsGiB = weightsGiB * residentFraction;
  const kvCacheGiB =
    (kvElementsPerToken(model) * cachedTokens * kvPrecision.bytesPerValue) /
    GIB;
  // In inference mode activations are not retained layer-by-layer. Treat this
  // as a prefill/workspace approximation rather than a training activation formula.
  const attentionWorkspaceGiB =
    (model.hiddenSize * config.contextTokens * config.batchSize * 6) / GIB;
  const engineWorkspaceGiB =
    0.3 + Math.min(2.2, model.activeParametersB * 0.018);
  const workspaceGiB =
    attentionWorkspaceGiB + engineWorkspaceGiB + (config.cpuOffload ? 0.1 : 0);
  const runtimePerGpuGiB = 1 + Math.min(0.45, model.hiddenSize / 32_768);
  const layout = perGpuLayout({
    gpuWeightsGiB,
    kvCacheGiB,
    workspaceGiB,
    gpuCount: config.gpuCount,
    runtimePerGpuGiB,
    reserve,
  });
  const headroomPerGpuGiB = gpu.memoryGiB - layout.totalPerGpuGiB;

  let minimumGpuCount: number | null = null;
  for (let count = 1; count <= 32; count += 1) {
    const candidate = perGpuLayout({
      gpuWeightsGiB,
      kvCacheGiB,
      workspaceGiB,
      gpuCount: count,
      runtimePerGpuGiB,
      reserve,
    });
    if (candidate.totalPerGpuGiB <= gpu.memoryGiB) {
      minimumGpuCount = count;
      break;
    }
  }

  const utilization = Math.max(0, layout.totalPerGpuGiB / gpu.memoryGiB);
  const fits = utilization <= 1;
  const safety: SafetyLevel = !fits
    ? "oom"
    : utilization > 0.9
      ? "tight"
      : utilization > 0.72
        ? "caution"
        : "comfortable";
  const performance = performanceEstimate({
    config,
    gpu,
    model,
    weightsGiB,
    totalPerGpuGiB: layout.totalPerGpuGiB,
  });

  return {
    config,
    model,
    gpu,
    reserve,
    weightPrecision,
    kvPrecision,
    effectiveSequences,
    rawTokensPerSequence,
    cachedTokensPerSequence,
    cachedTokens,
    weightsGiB,
    gpuWeightsGiB,
    kvCacheGiB,
    workspaceGiB,
    attentionWorkspaceGiB,
    engineWorkspaceGiB,
    runtimePerGpuGiB,
    fragmentationGiB: layout.fragmentationGiB,
    totalPerGpuGiB: layout.totalPerGpuGiB,
    clusterGiB: layout.clusterGiB,
    capacityGiB: gpu.memoryGiB * config.gpuCount,
    headroomPerGpuGiB,
    headroomClusterGiB: gpu.memoryGiB * config.gpuCount - layout.clusterGiB,
    utilization,
    fits,
    safety,
    minimumGpuCount,
    performance,
  };
}

export function buildSimulationTimeline(
  input: Partial<CalculatorInput> = {},
  steps = 18,
) {
  const estimate = estimateVram(input);
  const kvPerGpu = estimate.kvCacheGiB / estimate.config.gpuCount;
  const workspacePerGpu = estimate.workspaceGiB / estimate.config.gpuCount;
  const staticPerGpu = estimate.totalPerGpuGiB - kvPerGpu - workspacePerGpu;
  const points = Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps;
    const promptProgress = Math.min(1, progress * 3.4);
    const generatedTokens = Math.round(
      estimate.config.outputTokens * Math.max(0, (progress - 0.28) / 0.72),
    );
    const cacheProgress =
      (estimate.config.contextTokens * promptProgress + generatedTokens) /
      estimate.cachedTokensPerSequence;
    return {
      second: Number((progress * 12).toFixed(1)),
      generatedTokens,
      phase: progress < 0.28 ? ("prefill" as const) : ("decode" as const),
      vramGiB: Math.min(
        estimate.totalPerGpuGiB,
        staticPerGpu +
          kvPerGpu * cacheProgress +
          workspacePerGpu * (0.35 + promptProgress * 0.65),
      ),
    };
  });

  return { estimate, points };
}

export function formatGiB(value: number, digits = 1) {
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatTokens(value: number) {
  return value >= 1000
    ? `${(value / 1000).toLocaleString("zh-CN", { maximumFractionDigits: 1 })}K`
    : value.toLocaleString("zh-CN");
}

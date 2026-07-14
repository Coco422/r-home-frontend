import { describe, expect, it } from "vitest";
import {
  estimateVram,
  exceedsContextWindow,
  getModel,
  GPUS,
  MODELS,
  normaliseInput,
  PRECISIONS,
} from "./vram";

const baseline = {
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
} as const;

describe("estimateVram", () => {
  it("keeps the model weight calculation transparent", () => {
    const model = getModel("qwen3-8b", baseline);
    const estimate = estimateVram(baseline);
    const expected =
      (model.totalParametersB * 1e9 * PRECISIONS.fp16.bytesPerValue) /
      1024 ** 3;

    expect(estimate.weightsGiB).toBeCloseTo(expected, 5);
    expect(estimate.effectiveSequences).toBe(1);
    expect(estimate.totalPerGpuGiB).toBeGreaterThan(estimate.weightsGiB);
  });

  it("makes KV cache scale with context and active sequence count", () => {
    const compact = estimateVram(baseline);
    const busy = estimateVram({
      ...baseline,
      contextTokens: 32768,
      outputTokens: 4096,
      batchSize: 2,
      concurrency: 4,
    });

    expect(busy.effectiveSequences).toBe(8);
    expect(busy.kvCacheGiB).toBeGreaterThan(compact.kvCacheGiB * 50);
  });

  it("reports a genuine capacity failure and a multi-GPU remedy", () => {
    const fit = estimateVram({ ...baseline, gpuId: "a100-80" });
    const oom = estimateVram({ ...baseline, gpuId: "rtx-3060-12" });

    expect(fit.fits).toBe(true);
    expect(fit.headroomPerGpuGiB).toBeGreaterThan(0);
    expect(oom.fits).toBe(false);
    expect(oom.minimumGpuCount).toBeGreaterThan(1);
  });

  it("separates quantized weight residency from KV precision", () => {
    const fp16 = estimateVram(baseline);
    const int4 = estimateVram({ ...baseline, weightPrecision: "int4" });
    const reducedKv = estimateVram({ ...baseline, kvPrecision: "fp8" });

    expect(int4.weightsGiB).toBeLessThan(fp16.weightsGiB / 3.5);
    expect(int4.kvCacheGiB).toBeCloseTo(fp16.kvCacheGiB, 6);
    expect(reducedKv.kvCacheGiB).toBeCloseTo(fp16.kvCacheGiB / 2, 6);
  });

  it("counts reserved output tokens when checking a model context window", () => {
    const windowEdge = {
      ...baseline,
      modelId: "llama-3-8b" as const,
      contextTokens: 126976,
      outputTokens: 4096,
    };

    expect(exceedsContextWindow(windowEdge)).toBe(false);
    expect(exceedsContextWindow({ ...windowEdge, outputTokens: 4097 })).toBe(
      true,
    );
  });

  it("keeps current flagship profiles while pruning redundant older sizes", () => {
    expect(Object.keys(MODELS)).toHaveLength(39);
    expect(MODELS["qwen3-coder-480b-a35b"].contextWindow).toBe(262_144);
    expect(MODELS["qwen3-6-27b"].kvElementsPerToken).toBe(32_768);
    expect(MODELS["qwen3-6-35b-a3b"].activeParametersB).toBe(3);
    expect(MODELS["qwen2-5-72b"].layers).toBe(80);
    expect(MODELS["llama-3-1-405b"].totalParametersB).toBeCloseTo(
      405.853,
    );
    expect(MODELS["deepseek-v4-flash"].totalParametersB).toBe(284);
    expect(MODELS["deepseek-v4-pro"].activeParametersB).toBe(49);
    expect(MODELS["deepseek-r1-32b"].totalParametersB).toBeCloseTo(32.764);
    expect(MODELS["glm-5-2"].contextWindow).toBe(1_048_576);
    expect(MODELS["glm-5-2"].kvElementsPerToken).toBe(47_616);
    expect(MODELS["ernie-4-5-300b-a47b"].category).toBe(
      "Hunyuan / ERNIE / MiniMax",
    );
    expect(MODELS["gpt-oss-20b"].kvElementsPerToken).toBe(
      2 * 12 * 8 * 64,
    );
    expect(MODELS["gemma-3-27b"].category).toBe("Gemma");
    expect("deepseek-v3" in MODELS).toBe(false);
    expect("glm-4-5" in MODELS).toBe(false);
  });

  it("keeps shared links usable after replacing old model presets", () => {
    const legacyConfig = JSON.parse(
      '{"modelId":"deepseek-v3"}',
    ) as Record<string, unknown>;

    expect(normaliseInput(legacyConfig).modelId).toBe("deepseek-v4-flash");
  });

  it("includes mainstream local, workstation, data-center, Apple and accelerator devices", () => {
    expect(GPUS["rtx-3090-24"].memoryGiB).toBe(24);
    expect(GPUS["rtx-6000-ada-48"].memoryGiB).toBe(48);
    expect(GPUS["mi300x-192"].memoryGiB).toBe(192);
    expect(GPUS["dgx-spark-128"].memoryGiB).toBe(128);
    expect(GPUS["mac-studio-m2-ultra-192"].memoryGiB).toBe(192);
    expect(GPUS["mac-studio-m2-ultra-192"].memoryType).toBe("统一内存");
    expect(GPUS["ryzen-ai-max-395-128"].memoryGiB).toBe(96);
    expect(GPUS["arc-a770-16"].memoryGiB).toBe(16);
  });

  it("normalises unified-memory devices to one machine", () => {
    const estimate = estimateVram({
      ...baseline,
      gpuId: "dgx-spark-128",
      gpuCount: 4,
    });

    expect(estimate.config.gpuCount).toBe(1);
  });

  it("does not suggest impossible multi-machine scaling for unified memory", () => {
    const estimate = estimateVram({
      ...baseline,
      modelId: "deepseek-v4-pro",
      weightPrecision: "int4",
      gpuId: "dgx-spark-128",
    });

    expect(estimate.minimumGpuCount).toBeNull();
  });
});

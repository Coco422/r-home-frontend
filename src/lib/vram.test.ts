import { describe, expect, it } from "vitest";
import {
  estimateVram,
  exceedsContextWindow,
  getModel,
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
});

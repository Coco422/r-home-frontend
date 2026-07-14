import { describe, expect, it } from "vitest";
import {
  estimatePurchaseBudget,
  getPurchaseSources,
} from "./hardware-purchase";

const available = {
  fits: true,
  contextExceedsWindow: false,
  cpuOffload: false,
  offloadedWeightsGiB: 0,
  minimumGpuCount: 1,
} as const;

describe("hardware purchase budget", () => {
  it("combines an exact-SKU GPU reference with a single-GPU host platform", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-5080-16",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(budget.selected.total?.typicalCny).toBe(21_899);
    expect(budget.selected.priceBasis).toContain("官方建议零售价");
    expect(budget.selected.lines.find((line) => line.kind === "gpu")).toMatchObject({
      quantity: 1,
      unitPrice: { typicalCny: 8_299 },
    });
    expect(budget.selected.lines.some((line) => line.kind === "memory")).toBe(
      true,
    );
  });

  it("multiplies only GPUs while the two-GPU platform is charged once", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-5080-16",
      gpuCount: 2,
    });

    const gpu = budget.selected.lines.find((line) => line.kind === "gpu");
    const cpu = budget.selected.lines.find((line) => line.kind === "cpu");

    expect(gpu).toMatchObject({ quantity: 2, subtotal: { typicalCny: 16_598 } });
    expect(cpu).toMatchObject({ quantity: 1 });
    expect(budget.selected.total?.typicalCny).toBe(48_048);
  });

  it("uses a four-GPU server platform for the minimum viable plan", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "l40s-48",
      gpuCount: 1,
      fits: false,
      minimumGpuCount: 4,
    });

    expect(budget.selected.gpuCount).toBe(1);
    expect(budget.deployable).toMatchObject({
      status: "priced",
      gpuCount: 4,
      planLabel: expect.stringContaining("4-GPU 服务器"),
      total: { typicalCny: 346_000 },
    });
  });

  it("does not manufacture a hardware plan when the model window is exceeded", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-5080-16",
      gpuCount: 1,
      contextExceedsWindow: true,
      fits: false,
      minimumGpuCount: 4,
    });

    expect(budget.selected.status).toBe("blocked");
    expect(budget.selected.total).toBeNull();
    expect(budget.deployable).toBeNull();
  });

  it("keeps appliance and unpriced devices out of a made-up BOM", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "mac-studio-m2-ultra-192",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("unavailable");
    expect(budget.selected.total).toBeNull();
    expect(budget.selected.lines).toHaveLength(0);
  });

  it("marks an offload configuration partial when its required memory tier lacks a quote", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-5080-16",
      gpuCount: 1,
      cpuOffload: true,
      offloadedWeightsGiB: 300,
    });

    expect(budget.selected.status).toBe("partial");
    expect(budget.selected.total).toBeNull();
    expect(budget.selected.message).toContain("512 GiB");
  });

  it("requires an exact multi-node quote above the catalogued platform size", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "l40s-48",
      gpuCount: 5,
    });

    expect(budget.selected.status).toBe("requires-quote");
    expect(budget.selected.total).toBeNull();
  });

  it("does not total a proxy or historical reference for a different SKU", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-4090",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("requires-quote");
    expect(budget.selected.total).toBeNull();
    expect(getPurchaseSources(budget.selected.sourceIds)).toHaveLength(1);
  });

  it("attaches a declared source to every priced line", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-5080-16",
      gpuCount: 1,
    });

    for (const line of budget.selected.lines) {
      expect(line.sourceIds.length).toBeGreaterThan(0);
      expect(getPurchaseSources(line.sourceIds)).toHaveLength(
        line.sourceIds.length,
      );
    }
  });
});

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
  it("combines a current public GPU reference with a single-GPU host platform", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-a5000-24",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(budget.selected.total?.typicalCny).toBe(32_756);
    expect(budget.selected.priceBasis).toContain("海外公开零售价");
    expect(budget.selected.lines.find((line) => line.kind === "gpu")).toMatchObject({
      quantity: 1,
      unitPrice: { typicalCny: 19_156 },
    });
    expect(budget.selected.lines.some((line) => line.kind === "memory")).toBe(
      true,
    );
  });

  it("multiplies only GPUs while the two-GPU platform is charged once", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-a5000-24",
      gpuCount: 2,
    });

    const gpu = budget.selected.lines.find((line) => line.kind === "gpu");
    const cpu = budget.selected.lines.find((line) => line.kind === "cpu");

    expect(gpu).toMatchObject({ quantity: 2, subtotal: { typicalCny: 38_312 } });
    expect(cpu).toMatchObject({ quantity: 1, isEstimate: true });
    expect(budget.selected.total?.typicalCny).toBe(69_762);
  });

  it("uses a four-GPU server platform for the minimum viable plan", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-6000-ada-48",
      gpuCount: 1,
      fits: false,
      minimumGpuCount: 4,
    });

    expect(budget.selected.gpuCount).toBe(1);
    expect(budget.deployable).toMatchObject({
      status: "priced",
      gpuCount: 4,
      planLabel: expect.stringContaining("4-GPU 服务器"),
      total: { typicalCny: 278_616 },
    });
  });

  it("keeps the spread of sourced A100 80GB channel quotes in the estimate", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "a100-80",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(budget.selected.lines.find((line) => line.kind === "gpu")).toMatchObject({
      unitPrice: {
        lowCny: 86_999,
        typicalCny: 148_000,
        highCny: 155_000,
      },
    });
    expect(budget.selected.total?.typicalCny).toBe(161_600);
    expect(getPurchaseSources(budget.selected.sourceIds)).toHaveLength(4);
  });

  it("does not manufacture a hardware plan when the model window is exceeded", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-a5000-24",
      gpuCount: 1,
      contextExceedsWindow: true,
      fits: false,
      minimumGpuCount: 4,
    });

    expect(budget.selected.status).toBe("blocked");
    expect(budget.selected.total).toBeNull();
    expect(budget.deployable).toBeNull();
  });

  it("keeps retired appliances out of a made-up BOM", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "mac-studio-m2-ultra-192",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("requires-quote");
    expect(budget.selected.total).toBeNull();
    expect(budget.selected.lines).toHaveLength(0);
    expect(getPurchaseSources(budget.selected.sourceIds)).toHaveLength(1);
  });

  it("marks an offload configuration partial when its required memory tier lacks a quote", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-a5000-24",
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
      gpuId: "rtx-6000-ada-48",
      gpuCount: 5,
    });

    expect(budget.selected.status).toBe("requires-quote");
    expect(budget.selected.total).toBeNull();
  });

  it("uses an exact-SKU RTX 4090 public price snapshot", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-4090",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(
      budget.selected.lines.find((line) => line.kind === "gpu"),
    ).toMatchObject({ unitPrice: { typicalCny: 22_489 } });
    expect(getPurchaseSources(budget.selected.sourceIds)).toHaveLength(2);
  });

  it("attaches a declared source to every priced line", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-a5000-24",
      gpuCount: 1,
    });

    for (const line of budget.selected.lines) {
      expect(line.sourceIds.length).toBeGreaterThan(0);
      expect(getPurchaseSources(line.sourceIds)).toHaveLength(
        line.sourceIds.length,
      );
    }
  });

  it("uses the named RTX 4060 Ti 16GB purchase snapshot in a complete budget", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-4060ti-16",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(budget.selected.total?.typicalCny).toBe(17_329.26);
    expect(budget.selected.priceBasis).toContain("报价快照 2025-02-24");
    expect(budget.selected.lines.find((line) => line.kind === "gpu")).toMatchObject({
      unitPrice: { typicalCny: 3_729.26 },
    });
  });

  it("covers named consumer GPU price snapshots across common 40 and 50 series cards", () => {
    const expectedPrices = {
      "rtx-4060ti-8": 3_382.01,
      "rtx-4060ti-16": 3_729.26,
      "rtx-4070super-12": 5_139,
      "rtx-4080super-16": 7_809.76,
      "rtx-5060ti-16": 3_678.51,
      "rtx-5070-12": 5_088,
      "rtx-5070ti-16": 7_882.96,
      "rtx-5080-16": 12_934.01,
    } as const;

    for (const [gpuId, price] of Object.entries(expectedPrices)) {
      const budget = estimatePurchaseBudget({
        ...available,
        gpuId: gpuId as keyof typeof expectedPrices,
        gpuCount: 1,
      });
      const gpu = budget.selected.lines.find((line) => line.kind === "gpu");

      expect(budget.selected.status).toBe("priced");
      expect(gpu?.unitPrice.typicalCny).toBe(price);
      expect(getPurchaseSources(budget.selected.sourceIds)).toHaveLength(2);
    }
  });

  it("keeps ambiguous, historical, and reported prices out of an automatic total", () => {
    const referenceOnlyGpuIds = [
      "rtx-4070ti-super-16",
      "rtx-2000-ada-16",
      "rtx-5000-ada-32",
      "h200-141",
    ] as const;

    for (const gpuId of referenceOnlyGpuIds) {
      const budget = estimatePurchaseBudget({ ...available, gpuId, gpuCount: 1 });
      expect(budget.selected.status).toBe("partial");
      expect(budget.selected.total).toBeNull();
      expect(budget.selected.lines.find((line) => line.kind === "gpu")).toBeDefined();
    }

    const proxyOnly = estimatePurchaseBudget({
      ...available,
      gpuId: "rtx-5090",
      gpuCount: 1,
    });
    expect(proxyOnly.selected.status).toBe("requires-quote");
    expect(proxyOnly.selected.total).toBeNull();
  });

  it("covers consumer, workstation and data-center purchase references", () => {
    const gpuIds = [
      "rtx-a5000-24",
      "rtx-a6000-48",
      "rtx-6000-ada-48",
      "rtx-pro-4000-24",
      "rtx-pro-4500-32",
      "rtx-pro-5000-48",
      "rtx-pro-6000-96",
      "l40s-48",
      "h100-pcie-80",
    ] as const;

    for (const gpuId of gpuIds) {
      const budget = estimatePurchaseBudget({ ...available, gpuId, gpuCount: 1 });
      expect(budget.selected.status).toBe("priced");
      expect(budget.selected.total?.typicalCny).toBeGreaterThan(0);
      expect(getPurchaseSources(budget.selected.sourceIds)).not.toHaveLength(0);
    }
  });

  it("treats a matching Mac Studio configuration as a complete appliance", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "mac-studio-m3-ultra-96",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(budget.selected.total).toEqual({
      lowCny: 44_999,
      typicalCny: 44_999,
      highCny: 44_999,
    });
    expect(budget.selected.lines).toMatchObject([
      { kind: "appliance", quantity: 1 },
    ]);
    expect(budget.selected.included).toContain("96GB 统一内存");
  });

  it("treats a matching M4 Max Mac Studio configuration as a complete appliance", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "mac-studio-m4-max-64",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(budget.selected.total?.typicalCny).toBe(25_249);
    expect(budget.selected.included).toContain("64GB 统一内存");
  });

  it("treats a matching DGX Spark system as a complete appliance", () => {
    const budget = estimatePurchaseBudget({
      ...available,
      gpuId: "dgx-spark-128",
      gpuCount: 1,
    });

    expect(budget.selected.status).toBe("priced");
    expect(budget.selected.total?.typicalCny).toBe(28_555);
    expect(budget.selected.included).toContain("128GB LPDDR5x");
    expect(getPurchaseSources(budget.selected.sourceIds)).toHaveLength(1);
  });
});

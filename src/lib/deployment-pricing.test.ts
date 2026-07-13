import { describe, expect, it } from "vitest";
import { estimateDeploymentCost } from "./deployment-pricing";

describe("deployment pricing", () => {
  it("estimates the selected hardware at an hourly and monthly rate", () => {
    const quote = estimateDeploymentCost("rtx-4090", 2, 2);

    expect(quote?.hourlyUsd).toBeCloseTo(1.38);
    expect(quote?.dailyUsd).toBeCloseTo(33.12);
    expect(quote?.monthlyUsd).toBeCloseTo(1007.4);
    expect(quote?.minimumGpuCount).toBeNull();
  });

  it("surfaces a minimum-capacity alternative without replacing the selection", () => {
    const quote = estimateDeploymentCost("h100-80", 1, 4);

    expect(quote?.minimumGpuCount).toBe(4);
    expect(quote?.minimumHourlyUsd).toBeCloseTo(11.96);
    expect(quote?.minimumMonthlyUsd).toBeCloseTo(8730.8);
  });

  it("uses the static reference price for other matching cloud GPUs", () => {
    const quote = estimateDeploymentCost("rtx-6000-ada-48", 1, 1);

    expect(quote?.hourlyUsd).toBeCloseTo(0.77);
  });

  it("only exposes explicitly listed cloud hardware", () => {
    expect(estimateDeploymentCost("rtx-3090ti-24", 1, 1)).toBeNull();
  });

  it("does not invent cloud pricing for hardware without a public reference", () => {
    expect(estimateDeploymentCost("mac-studio-m2-ultra-192", 1, 1)).toBeNull();
  });
});

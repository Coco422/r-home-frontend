import { describe, expect, it } from "vitest";
import { decodeConfig, encodeConfig } from "./share";
import { DEFAULT_CALCULATOR_INPUT } from "./vram";

describe("calculator share codec", () => {
  it("round-trips a complete browser-side configuration", () => {
    const config = {
      ...DEFAULT_CALCULATOR_INPUT,
      modelId: "qwen3-32b" as const,
      weightPrecision: "int4" as const,
      kvPrecision: "fp8" as const,
      gpuId: "rtx-5090" as const,
      gpuCount: 2,
      contextTokens: 16384,
      concurrency: 4,
    };

    expect(decodeConfig(encodeConfig(config))).toEqual(config);
  });

  it("rejects malformed configuration payloads", () => {
    expect(decodeConfig("this-is-not-config")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  filterSearchOptions,
  type SearchableOption,
} from "./SearchableSelect";

const options: SearchableOption[] = [
  {
    value: "qwen3-8b",
    label: "Qwen3 8B",
    group: "Qwen",
    keywords: "40K GQA",
  },
  {
    value: "rtx-4090",
    label: "GeForce RTX 4090 · 24 GiB",
    group: "NVIDIA · GeForce",
    keywords: "NVIDIA · GeForce",
  },
  {
    value: "l40s-48",
    label: "NVIDIA L40S · 48 GiB",
    group: "NVIDIA · 数据中心",
    keywords: "NVIDIA · 数据中心",
  },
  {
    value: "mac-studio-m3-ultra",
    label: "Mac Studio · M3 Ultra · 512 GiB UMA",
    group: "Apple Silicon",
  },
  {
    value: "hunyuan-a13b",
    label: "Hunyuan-A13B",
    group: "Hunyuan / ERNIE / MiniMax",
  },
  {
    value: "minimax-m2",
    label: "MiniMax M2 230B-A10B",
    group: "Hunyuan / ERNIE / MiniMax",
  },
];

describe("filterSearchOptions", () => {
  it("matches labels, groups and extra keywords without case sensitivity", () => {
    expect(filterSearchOptions(options, "qwen").map((item) => item.value)).toEqual(
      ["qwen3-8b"],
    );
    expect(filterSearchOptions(options, "nvidia").map((item) => item.value)).toEqual(
      ["rtx-4090", "l40s-48"],
    );
    expect(filterSearchOptions(options, "40k").map((item) => item.value)).toEqual(
      ["qwen3-8b"],
    );
    expect(filterSearchOptions(options, "qwen3-8b").map((item) => item.value)).toEqual(
      ["qwen3-8b"],
    );
    expect(filterSearchOptions(options, "rtx-4090").map((item) => item.value)).toEqual(
      ["rtx-4090"],
    );
  });

  it("ignores spacing and returns all options for an empty query", () => {
    expect(filterSearchOptions(options, "macstudio").map((item) => item.value)).toEqual(
      ["mac-studio-m3-ultra"],
    );
    expect(filterSearchOptions(options, "minimax").map((item) => item.value)).toEqual(
      ["minimax-m2"],
    );
    expect(filterSearchOptions(options, "  ")).toHaveLength(6);
  });
});

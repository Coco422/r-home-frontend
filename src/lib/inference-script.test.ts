import { describe, expect, it } from "vitest";
import { getInferenceSegments } from "./inference-script";

describe("inference experience scripts", () => {
  it("keeps a direct answer free of tool-call steps", () => {
    const segments = getInferenceSegments("chat");

    expect(segments.map((segment) => segment.kind)).toEqual(["assistant"]);
  });

  it("models an agent turn as a multi-step tool-use chain", () => {
    const segments = getInferenceSegments("agent");

    expect(segments.map((segment) => segment.kind)).toEqual([
      "assistant",
      "tool-call",
      "tool-result",
      "assistant",
      "tool-call",
      "tool-result",
      "assistant",
    ]);
  });
});

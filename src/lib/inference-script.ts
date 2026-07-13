export type ExperienceMode = "chat" | "agent";
export type ExperienceSegmentKind = "assistant" | "tool-call" | "tool-result";

export type ExperienceSegment = {
  kind: ExperienceSegmentKind;
  text: string;
};

const CHAT_SEGMENTS: ExperienceSegment[] = [
  {
    kind: "assistant",
    text: "本周重点：先收敛范围，再验证关键路径。\n\n1. 固定推理配置并压测首 token 延迟。\n2. 给长上下文场景保留 KV Cache 余量。\n3. 将可复现配置附在每次评审记录中。",
  },
];

const AGENT_SEGMENTS: ExperienceSegment[] = [
  {
    kind: "assistant",
    text: "我先检索项目风险和阻塞项。",
  },
  {
    kind: "tool-call",
    text: 'tools.search({ query: "本周 项目风险 阻塞" })',
  },
  {
    kind: "tool-result",
    text: "3 条结果 · GPU 资源排期 / API 延迟 / 上下文预算",
  },
  {
    kind: "assistant",
    text: "已整理优先级：\n\n• 今天确认 GPU 配额与替代机型。\n• 明天把 API 延迟拆成首 token 与生成阶段。\n• 发布前把长上下文策略改为可降级配置。",
  },
];

export function getInferenceSegments(
  mode: ExperienceMode,
): ExperienceSegment[] {
  const source = mode === "agent" ? AGENT_SEGMENTS : CHAT_SEGMENTS;
  return source.map((segment) => ({ ...segment }));
}

export function promptForMode(mode: ExperienceMode) {
  return mode === "agent"
    ? "找出本周项目风险，并给出下一步。"
    : "把本周项目进展压成三条行动项。";
}

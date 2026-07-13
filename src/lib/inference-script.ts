export type ExperienceMode = "chat" | "agent";
export type ExperienceSegmentKind = "assistant" | "tool-call" | "tool-result";

export type ExperienceSegment = {
  kind: ExperienceSegmentKind;
  text: string;
};

const CHAT_SEGMENTS: ExperienceSegment[] = [
  {
    kind: "assistant",
    text:
      "我把进展压成一组可以直接执行的动作。先不追求把所有事情都推进，而是让关键路径每天都有可验证的结果。\n\n【本周判断】\n目前最大的风险不是功能数量，而是推理配置、真实延迟和资源配额还没有被放在同一份可复现记录里。只要这三项存在偏差，后续的性能讨论就会变成猜测。\n\n【三条行动项】\n1. 今天固定一组模型、量化、上下文、并发与硬件配置；每次变更都生成分享链接。\n2. 明天跑一次短压测，分别记录首 token 延迟、稳定生成速度和峰值显存，不只看平均吞吐。\n3. 发布前给长上下文场景准备降级档：缩短输入、降低并发或切换 KV 精度。\n\n【验收信号】\n评审时能在五分钟内复现同一组数字，并清楚回答：哪一项最接近显存上限、哪一项最影响用户等待时间。",
  },
];

const AGENT_SEGMENTS: ExperienceSegment[] = [
  {
    kind: "assistant",
    text:
      "我先把主观进展和可观测指标分开：先找阻塞项，再确认它们是否已经影响到交付节奏。",
  },
  {
    kind: "tool-call",
    text:
      'tools.search({\n  query: "本周 项目风险 阻塞",\n  filters: ["GPU 资源", "API 延迟", "上下文预算"]\n})',
  },
  {
    kind: "tool-result",
    text:
      "命中 4 条记录\n• GPU 资源排期：周三前才确认可用配额。\n• API 延迟：只有端到端均值，尚未拆分首 token。\n• 上下文预算：RAG 场景曾出现 128K 输入。\n• 发布流程：缺少可复现的模型与量化配置链接。",
  },
  {
    kind: "assistant",
    text:
      "风险已经聚焦到三处：资源有时间不确定性，延迟指标不够可操作，长上下文缺少容量护栏。我再读取最近一次压测，确认先处理哪一个。",
  },
  {
    kind: "tool-call",
    text:
      'tools.getMetrics({\n  run: "latest-canary",\n  fields: ["ttft_ms", "tok_s", "peak_vram_gib", "context_tokens"]\n})',
  },
  {
    kind: "tool-result",
    text:
      "{\n  ttft_ms: 1820,\n  tok_s: 41.6,\n  peak_vram_gib: 43.8,\n  context_tokens: 98304,\n  capacity_gib: 48\n}",
  },
  {
    kind: "assistant",
    text:
      "结论：长上下文任务已经把 48 GiB 卡推到接近边界，优先级应是容量护栏，其次才是吞吐优化。\n\n【今天】\n• 确认 GPU 配额，并准备 L40S / H100 的替代机型。\n• 为 96K 以上输入设置降级条件：缩短检索片段、降低并发或改用更小模型。\n\n【明天】\n• 把延迟拆为首 token 与生成阶段；首 token 超过 1.5s 时单独报警。\n• 用同一组请求比较 FP8 与 FP16 KV Cache，记录质量与显存差异。\n\n【发布前】\n• 每个环境附上可分享配置、压测时间、驱动与引擎版本。\n• 若峰值显存超过单卡 85%，切到更大显存档，而不是等线上 OOM。\n\n我已经把最短的行动路径排好：先守住容量，再让性能数据可解释。",
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
    ? "找出本周项目风险，并给出可执行的下一步。"
    : "把本周项目进展压成三条行动项，并给出验收信号。";
}

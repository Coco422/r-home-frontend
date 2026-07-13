import { useEffect, useMemo, useRef, useState } from "react";
import {
  getInferenceSegments,
  promptForMode,
  type ExperienceMode,
  type ExperienceSegment,
} from "../lib/inference-script";
import { estimateVram, formatTokens, type CalculatorInput } from "../lib/vram";

type Phase =
  | "idle"
  | "prefill"
  | "typing"
  | "tool-wait"
  | "tool-result"
  | "complete";

type Props = {
  config: CalculatorInput;
};

export function InferenceExperience({ config }: Props) {
  const [mode, setMode] = useState<ExperienceMode>("chat");
  const modelEstimate = useMemo(() => estimateVram(config), [config]);
  const maxInputTokens = Math.max(
    64,
    modelEstimate.model.contextWindow - config.outputTokens,
  );
  const [inputTokens, setInputTokens] = useState(() =>
    Math.min(config.contextTokens, maxInputTokens),
  );
  const [tokensPerSecond, setTokensPerSecond] = useState(() =>
    playbackSpeed(modelEstimate.performance.perUserTokensPerSecond),
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [paused, setPaused] = useState(false);
  const visibleCharactersRef = useRef(0);

  const segments = useMemo(() => getInferenceSegments(mode), [mode]);
  const simulationEstimate = useMemo(
    () => estimateVram({ ...config, contextTokens: inputTokens }),
    [config, inputTokens],
  );
  const currentSegment = segments[segmentIndex];

  useEffect(() => {
    setInputTokens((current) => Math.min(current, maxInputTokens));
  }, [maxInputTokens]);

  useEffect(() => {
    setPhase("idle");
    setSegmentIndex(0);
    setVisibleCharacters(0);
    visibleCharactersRef.current = 0;
    setPaused(false);
  }, [mode, config]);

  useEffect(() => {
    visibleCharactersRef.current = visibleCharacters;
  }, [visibleCharacters]);

  useEffect(() => {
    if (phase !== "prefill" || paused) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const waitMs = reducedMotion
      ? 0
      : Math.min(
          1500,
          Math.max(180, simulationEstimate.performance.timeToFirstTokenMs),
        );
    const timer = window.setTimeout(() => setPhase("typing"), waitMs);
    return () => window.clearTimeout(timer);
  }, [paused, phase, simulationEstimate.performance.timeToFirstTokenMs]);

  useEffect(() => {
    if (phase !== "typing" || paused || !currentSegment) return;
    let animationFrame = 0;
    let previousTime = performance.now();
    let carry = 0;
    const charactersPerSecond = Math.max(3, tokensPerSecond * 1.55);

    const finishSegment = () => {
      if (currentSegment.kind === "tool-call") {
        setPhase("tool-wait");
      } else if (segmentIndex >= segments.length - 1) {
        setPhase("complete");
      } else {
        setSegmentIndex((current) => current + 1);
        setVisibleCharacters(0);
        visibleCharactersRef.current = 0;
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(() => {
        setVisibleCharacters(currentSegment.text.length);
        visibleCharactersRef.current = currentSegment.text.length;
        finishSegment();
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const frame = (now: number) => {
      const delta = now - previousTime;
      previousTime = now;
      carry += (delta / 1000) * charactersPerSecond;
      const increment = Math.floor(carry);
      if (increment > 0) {
        carry -= increment;
        const next = Math.min(
          currentSegment.text.length,
          visibleCharactersRef.current + increment,
        );
        visibleCharactersRef.current = next;
        setVisibleCharacters(next);
        if (next >= currentSegment.text.length) {
          finishSegment();
          return;
        }
      }
      animationFrame = window.requestAnimationFrame(frame);
    };

    animationFrame = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [
    currentSegment,
    paused,
    phase,
    segmentIndex,
    segments.length,
    tokensPerSecond,
  ]);

  useEffect(() => {
    if (phase !== "tool-wait" || paused) return;
    const waitMs = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 550;
    const timer = window.setTimeout(() => {
      setSegmentIndex((current) => current + 1);
      setPhase("tool-result");
    }, waitMs);
    return () => window.clearTimeout(timer);
  }, [paused, phase]);

  useEffect(() => {
    if (phase !== "tool-result" || paused || !currentSegment) return;
    const waitMs = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 520;
    setVisibleCharacters(currentSegment.text.length);
    visibleCharactersRef.current = currentSegment.text.length;
    const timer = window.setTimeout(() => {
      if (segmentIndex >= segments.length - 1) {
        setPhase("complete");
      } else {
        setSegmentIndex((current) => current + 1);
        setVisibleCharacters(0);
        visibleCharactersRef.current = 0;
        setPhase("typing");
      }
    }, waitMs);
    return () => window.clearTimeout(timer);
  }, [currentSegment, paused, phase, segmentIndex, segments.length]);

  const resetToIdle = () => {
    setPhase("idle");
    setSegmentIndex(0);
    setVisibleCharacters(0);
    visibleCharactersRef.current = 0;
    setPaused(false);
  };

  const reset = () => {
    resetToIdle();
    setPhase("prefill");
  };

  const switchMode = (nextMode: ExperienceMode) => {
    setMode(nextMode);
  };

  return (
    <section
      className="experience-card"
      id="simulation"
      aria-labelledby="experience-title"
    >
      <div className="experience-heading">
        <h2 id="experience-title">推理体验</h2>
        <span aria-live="polite">{statusText(phase, inputTokens)}</span>
      </div>

      <div className="experience-controls">
        <div className="experience-mode" role="group" aria-label="推理模式">
          <button
            className={mode === "chat" ? "is-active" : ""}
            type="button"
            aria-pressed={mode === "chat"}
            onClick={() => switchMode("chat")}
          >
            问答
          </button>
          <button
            className={mode === "agent" ? "is-active" : ""}
            type="button"
            aria-pressed={mode === "agent"}
            onClick={() => switchMode("agent")}
          >
            Agent
          </button>
        </div>
        <label>
          输入{" "}
          <input
            type="number"
            min={64}
            max={maxInputTokens}
            step={64}
            value={inputTokens}
            onChange={(event) => {
              resetToIdle();
              setInputTokens(
                clampNumber(event.target.value, 64, maxInputTokens),
              );
            }}
          />{" "}
          token
        </label>
        <label>
          生成{" "}
          <input
            type="number"
            min={1}
            max={1000}
            value={tokensPerSecond}
            onChange={(event) => {
              resetToIdle();
              setTokensPerSecond(clampNumber(event.target.value, 1, 1000));
            }}
          />{" "}
          tok/s
        </label>
        <button
          className="experience-run"
          type="button"
          onClick={
            phase === "typing" ||
            phase === "prefill" ||
            phase === "tool-wait" ||
            phase === "tool-result"
              ? () => setPaused((current) => !current)
              : reset
          }
        >
          {phase === "idle"
            ? "开始"
            : phase === "complete"
              ? "重播"
              : paused
                ? "继续"
                : "暂停"}
        </button>
      </div>

      <div className="experience-terminal">
        <div className="experience-terminal-bar">
          <span />
          <span />
          <span />
          <b>{mode === "agent" ? "agent.run" : "chat.completion"}</b>
          <small>
            {formatTokens(inputTokens)} · {tokensPerSecond} tok/s
          </small>
        </div>
        <div className="experience-messages">
          <article className="experience-user">
            <span>你</span>
            <p>{promptForMode(mode)}</p>
          </article>
          {phase === "prefill" ? (
            <article className="experience-pending">
              <span>模型</span>
              <p>读取 {formatTokens(inputTokens)} tokens…</p>
            </article>
          ) : null}
          {segments.slice(0, segmentIndex).map((segment, index) => (
            <Segment key={`${segment.kind}-${index}`} segment={segment} />
          ))}
          {phase !== "idle" && currentSegment ? (
            <Segment
              segment={currentSegment}
              visibleCharacters={
                phase === "tool-result"
                  ? currentSegment.text.length
                  : visibleCharacters
              }
              cursor={phase === "typing" && !paused}
            />
          ) : null}
          {phase === "idle" ? (
            <article className="experience-pending">
              <span>模型</span>
              <p>准备就绪</p>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Segment({
  segment,
  visibleCharacters,
  cursor = false,
}: {
  segment: ExperienceSegment;
  visibleCharacters?: number;
  cursor?: boolean;
}) {
  const text =
    visibleCharacters === undefined
      ? segment.text
      : segment.text.slice(0, visibleCharacters);
  if (segment.kind === "tool-call")
    return (
      <article className="experience-tool-call">
        <span>tools.call</span>
        <code>
          {text}
          {cursor ? <i aria-hidden="true" /> : null}
        </code>
      </article>
    );
  if (segment.kind === "tool-result")
    return (
      <article className="experience-tool-result">
        <span>tool result</span>
        <p>{text}</p>
      </article>
    );
  return (
    <article className="experience-assistant">
      <span>模型</span>
      <p>
        {text}
        {cursor ? <i aria-hidden="true" /> : null}
      </p>
    </article>
  );
}

function statusText(phase: Phase, inputTokens: number) {
  if (phase === "prefill") return `读取 ${formatTokens(inputTokens)} tokens`;
  if (phase === "tool-wait") return "tools.call";
  if (phase === "complete") return "完成";
  return "";
}

function clampNumber(value: string, min: number, max: number) {
  const next = Number(value);
  if (!Number.isFinite(next)) return min;
  return Math.min(max, Math.max(min, Math.round(next)));
}

function playbackSpeed(tokensPerSecond: number) {
  return Math.max(8, Math.min(60, Math.round(tokensPerSecond)));
}

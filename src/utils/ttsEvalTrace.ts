import type {
  TtsEvalMetricsSummary,
  TtsEvalTrace,
  TtsEvalTraceEvent,
  TtsEvalTraceSink,
} from "../types/eval";

declare global {
  interface Window {
    __BLURBY_TTS_EVAL_TRACE__?: {
      enabled?: boolean;
      events?: TtsEvalTraceEvent[];
      onEvent?: (event: TtsEvalTraceEvent) => void;
    };
  }
}

export function createWindowEvalTraceSink(): TtsEvalTraceSink | null {
  if (typeof window === "undefined") return null;
  const target = window.__BLURBY_TTS_EVAL_TRACE__;
  if (!target?.enabled) return null;
  if (!Array.isArray(target.events)) target.events = [];

  return {
    enabled: true,
    record: (event) => {
      const normalized: TtsEvalTraceEvent = {
        ...event,
        ts: typeof event.ts === "number" ? event.ts : Date.now(),
      } as TtsEvalTraceEvent;
      target.events!.push(normalized);
      target.onEvent?.(normalized);
    },
  };
}

export function validateTtsEvalTrace(trace: TtsEvalTrace): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (trace.schemaVersion !== "1.0") issues.push(`unsupported schemaVersion: ${trace.schemaVersion}`);
  if (!trace.runId) issues.push("missing runId");
  if (!trace.fixture?.id) issues.push("missing fixture.id");
  if (!Array.isArray(trace.events)) issues.push("events must be an array");

  const startEvent = trace.events.find((e) => e.kind === "lifecycle" && e.state === "start");
  const firstAudioEvent = trace.events.find((e) => e.kind === "lifecycle" && e.state === "first-audio");
  if (!startEvent) issues.push("missing lifecycle:start");
  if (!firstAudioEvent) issues.push("missing lifecycle:first-audio");
  if (startEvent && firstAudioEvent && firstAudioEvent.ts < startEvent.ts) {
    issues.push("lifecycle:first-audio must occur after lifecycle:start");
  }

  let pauseDepth = 0;
  for (const event of trace.events) {
    if (event.kind === "lifecycle" && event.state === "pause") pauseDepth += 1;
    if (event.kind === "lifecycle" && event.state === "resume") {
      if (pauseDepth === 0) issues.push("lifecycle:resume without preceding pause");
      else pauseDepth -= 1;
    }
  }
  if (pauseDepth !== 0) issues.push("unbalanced pause/resume lifecycle events");

  return { valid: issues.length === 0, issues };
}

export function summarizeTtsEvalTrace(trace: TtsEvalTrace): TtsEvalMetricsSummary {
  const lifecycle = trace.events.filter((e) => e.kind === "lifecycle");
  const words = trace.events.filter((e) => e.kind === "word");
  const flow = trace.events.filter((e) => e.kind === "flow-position");
  const transitions = trace.events.filter((e) => e.kind === "transition");

  const startEvent = lifecycle.find((e) => e.state === "start");
  const firstAudioEvent = lifecycle.find((e) => e.state === "first-audio");
  const startLatencyMs =
    firstAudioEvent && typeof firstAudioEvent.latencyMs === "number"
      ? firstAudioEvent.latencyMs
      : startEvent && firstAudioEvent
        ? Math.max(0, firstAudioEvent.ts - startEvent.ts)
        : null;
  const warmPreviewLatencyMs =
    startEvent && typeof startEvent.previewLatencyMs === "number"
      ? startEvent.previewLatencyMs
      : null;
  const warmFirstAudioLatencyMs = startLatencyMs;
  const startupSpikeThresholdMs =
    startEvent && typeof startEvent.spikeWarningThresholdMs === "number"
      ? startEvent.spikeWarningThresholdMs
      : null;
  const startupSpikeCount = startupSpikeThresholdMs == null
    ? 0
    : [warmPreviewLatencyMs, warmFirstAudioLatencyMs].filter(
        (latency) => typeof latency === "number" && latency > startupSpikeThresholdMs,
      ).length;
  const startupCacheMode = startEvent?.cacheMode ?? null;
  const openingChunkWordCounts = Array.isArray(startEvent?.openingChunkWordCounts)
    ? [...startEvent.openingChunkWordCounts]
    : [];

  const pauses = lifecycle.filter((e) => e.state === "pause").length;
  const resumes = lifecycle.filter((e) => e.state === "resume").length;
  const transitionCounts = {
    section: transitions.filter((e) => e.transition === "section").length,
    chapter: transitions.filter((e) => e.transition === "chapter").length,
    book: transitions.filter((e) => e.transition === "book").length,
    handoff: transitions.filter((e) => e.transition === "handoff").length,
  };
  const sectionHandoffLatencyMs =
    transitions.find(
      (e) => e.transition === "section" && typeof e.latencyMs === "number",
    )?.latencyMs ?? null;
  const crossBookResumeLatencyMs =
    transitions.find(
      (e) =>
        e.transition === "handoff"
        && typeof e.latencyMs === "number"
        && e.context?.includes("cross-book"),
    )?.latencyMs
    ?? transitions.find(
      (e) =>
        e.transition === "book"
        && typeof e.latencyMs === "number"
        && e.context?.includes("cross-book"),
    )?.latencyMs
    ?? null;
  const rateResponseLatencyMs =
    transitions.find(
      (e) =>
        e.transition === "rate-response"
        && typeof e.latencyMs === "number"
        && e.context?.includes("same-bucket"),
    )?.latencyMs
    ?? null;

  const failureClasses: TtsEvalMetricsSummary["failureClasses"] = [];
  if (startLatencyMs != null && startLatencyMs > 2500) failureClasses.push("start-latency");

  const maxDrift = flow.reduce((max, f) => {
    const nearWordEvents = words
      .filter((w) => Math.abs(w.ts - f.ts) <= 300)
      .map((w) => Math.abs(w.wordIndex - f.wordIndex));
    const localMax = nearWordEvents.length ? Math.max(...nearWordEvents) : 0;
    return Math.max(max, localMax);
  }, 0);
  if (maxDrift > 12) failureClasses.push("cursor-highlight-drift");

  if (transitionCounts.handoff === 0 && transitionCounts.book > 0) {
    failureClasses.push("handoff-error");
  }
  if (pauses !== resumes) failureClasses.push("pause-resume-error");

  return {
    startLatencyMs,
    warmPreviewLatencyMs,
    warmFirstAudioLatencyMs,
    startupSpikeThresholdMs,
    startupSpikeCount,
    wordEventCount: words.length,
    flowEventCount: flow.length,
    startupCacheMode,
    openingChunkWordCounts,
    pauseResumeIntegrity: {
      pauses,
      resumes,
      balanced: pauses === resumes,
    },
    transitionCounts,
    sectionHandoffLatencyMs,
    crossBookResumeLatencyMs,
    rateResponseLatencyMs,
    failureClasses,
  };
}

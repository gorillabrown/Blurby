export type TtsEvalSchemaVersion = "1.0";

export type TtsEvalSourceType = "prose" | "dialogue" | "punctuation" | "transition" | "pause-resume";

export interface TtsEvalFixtureMeta {
  id: string;
  title: string;
  sourceType: TtsEvalSourceType;
  notes?: string;
  expectedCoverage: string[];
}

export interface TtsEvalTraceBaseEvent {
  ts: number;
}

export interface TtsEvalLifecycleEvent extends TtsEvalTraceBaseEvent {
  kind: "lifecycle";
  state: "start" | "first-audio" | "pause" | "resume" | "stop";
  wordIndex?: number;
  latencyMs?: number;
  previewLatencyMs?: number;
  mode?: "page" | "focus" | "flow" | "narrate";
  isNarrating?: boolean;
  cacheMode?: "cached" | "uncached";
  openingChunkWordCounts?: number[];
  spikeWarningThresholdMs?: number;
  spikeWarning?: boolean;
}

export interface TtsEvalWordEvent extends TtsEvalTraceBaseEvent {
  kind: "word";
  wordIndex: number;
  source: "audio" | "flow" | "truth-sync";
  sectionIndex?: number;
}

export interface TtsEvalFlowPositionEvent extends TtsEvalTraceBaseEvent {
  kind: "flow-position";
  lineIndex: number;
  totalLines: number;
  wordIndex: number;
  totalWords: number;
  bookPct: number;
}

export interface TtsEvalTransitionEvent extends TtsEvalTraceBaseEvent {
  kind: "transition";
  transition: "section" | "chapter" | "book" | "handoff" | "rate-response";
  from?: string | number;
  to?: string | number;
  context?: string;
  latencyMs?: number;
}

export interface TtsEvalNanoSegmentEvent extends TtsEvalTraceBaseEvent {
  kind: "nano-segment";
  phase: "request" | "prefetch-start" | "prefetch-ready" | "prefetch-stale" | "prefetch-cancelled" | "playback";
  startIdx: number;
  endIdx: number;
  latencyMs?: number;
  cacheHit: boolean;
  prefetchReady: boolean;
  timingTruth: "segment-following";
  wordTimestamps: null;
  reason?: string;
}

export interface TtsEvalEngineSelectionEvent extends TtsEvalTraceBaseEvent {
  kind: "engine-selection";
  selectedEngine: "web" | "kokoro" | "qwen" | "nano" | "pocket-tts";
  source: "app-settings";
}

export interface TtsEvalFallbackPolicyEvent extends TtsEvalTraceBaseEvent {
  kind: "fallback-policy";
  policy: "explicit-only";
  selectedEngine: "nano" | "pocket-tts";
}

export interface TtsEvalNanoRuntimeEvent extends TtsEvalTraceBaseEvent {
  kind: "nano-runtime" | "nano-synthesis" | "pocket-runtime" | "pocket-synthesis";
  backend?: string | null;
  modelVariant?: string | null;
  syntheticAudio: boolean | null;
  status?: string | null;
}

// ── Rebuilt Narrate recorded output (NARRATE-REBUILD-1 P5: D3, D5, D6) ───────────────────────────────
// Clock fields: `*Ctx`, `startAt`, `endAt`, `at`, `latencyS`, `leadS` are seconds on the AudioContext clock;
// `t`, `requestT`, `otsPerf`, `frameDt` are milliseconds of performance.now(). Word fields are book-word indices.
// No text and no audio ever enter these records (diagnostics export guardrail).

export type TtsEvalNarrateRequestCause = "play" | "resume" | "click" | "speed" | "navigate";

/** One published cursor change: the unit at the playback sample, with its table boundary on the same clock. */
export interface TtsEvalNarrateCommitEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-commit";
  t: number;
  word: number;
  chunkStart: number;
  unit: number;
  boundaryCtx: number;
  /** The playback position the cursor was decided on (the heard sample's context time). */
  nowCtx: number;
  /** The scheduling head (AudioContext.currentTime) at the same instant; nowCtx lags it by the output latency. */
  headCtx: number;
  otsCtx: number | null;
  otsPerf: number | null;
  frameDt: number | null;
  speed: number;
  epoch: number;
}

/** A user request that leads to voiced samples: Play, resume, a word click, a speed change, a navigation. */
export interface TtsEvalNarrateRequestEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-request";
  t: number;
  cause: TtsEvalNarrateRequestCause;
  word: number;
  speed: number;
  ctxAtRequest: number;
  otsCtx: number | null;
  otsPerf: number | null;
}

/** The first scheduled voiced sample after a request: latencyS = startAt − ctxAtRequest on the playback clock. */
export interface TtsEvalNarrateFirstVoicedEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-first-voiced";
  t: number;
  cause: TtsEvalNarrateRequestCause;
  requestT: number;
  word: number;
  speed: number;
  ctxAtRequest: number;
  startAt: number;
  latencyS: number;
  /** The same interval in wall time: performance.now() from the request to the schedule, plus the scheduled lead (startAt − head). */
  latencyWallMs: number;
  leadS: number;
  trimSamples: number;
}

/** A chunk the engine refused (F4) or could not get: narration pauses on the last exactly-timed word. */
export interface TtsEvalNarrateFailureEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-failure";
  t: number;
  reason: string;
  atWord: number;
  detail: string | null;
  epoch: number;
}

// ── Section-load path diagnostics (NARRATE-REBUILD-1 P5, BUG-191): tracing only, no behaviour ───────────
/** A caller is about to change the displayed section (emitted BEFORE the call). `sectionIndex`/`targetSection` null when unknown. */
export interface TtsEvalNarrateSectionNavEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-section-nav";
  t: number;
  caller: string;
  word: number | null;
  sectionIndex: number | null;
  targetSection: number | null;
}

/** The view finished loading a section and wrapping its words. `wrapMs` null when no wrap call was measured. */
export interface TtsEvalNarrateSectionLoadEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-section-load";
  t: number;
  sectionIndex: number;
  words: number;
  wrapMs: number | null;
}

/** The view's layout, once at the first section and again on every container resize. */
export interface TtsEvalNarrateViewLayoutEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-view-layout";
  t: number;
  width: number;
  height: number;
  columns: number | null;
  dpr: number;
}

/** A chunk scheduled on the clock, with every unit's start word and table boundary. */
export interface TtsEvalNarrateScheduleEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-schedule";
  t: number;
  epoch: number;
  chunkStart: number;
  chunkEnd: number;
  startAt: number;
  endAt: number;
  offset: number;
  unitStarts: number[];
  unitBoundaryCtx: number[];
  /** performance.now() when the chunk was requested from the producer, and when its result arrived (D6 analysis). */
  requestedT?: number;
  resultT?: number;
  /** The producer's own generation time for the chunk (worker-side), when reported. */
  genMs?: number | null;
  /** Which producer worker generated it, and what that worker and the pool were running when it was assigned. */
  worker?: number | null;
  busyAtAssign?: { worker: number; pool: number; workers: number } | null;
  /** Epoch ms: the request leaving the renderer, main receiving it, main replying, the result reaching the engine. */
  hops?: { requested: number; mainRecv: number | null; mainReply: number | null; result: number; stages?: Record<string, number> | null } | null;
}

/** A scheduled chunk stopped before its natural end: at a pause, at a speed change (R7, at the unit's end) or dropped. */
export interface TtsEvalNarrateStopEvent extends TtsEvalTraceBaseEvent {
  kind: "narrate-stop";
  t: number;
  epoch: number;
  chunkStart: number;
  at: number;
  reason: "pause" | "speed" | "drop";
}

export type TtsEvalTraceEvent =
  | TtsEvalLifecycleEvent
  | TtsEvalWordEvent
  | TtsEvalFlowPositionEvent
  | TtsEvalTransitionEvent
  | TtsEvalNanoSegmentEvent
  | TtsEvalEngineSelectionEvent
  | TtsEvalFallbackPolicyEvent
  | TtsEvalNanoRuntimeEvent
  | TtsEvalNarrateCommitEvent
  | TtsEvalNarrateRequestEvent
  | TtsEvalNarrateFirstVoicedEvent
  | TtsEvalNarrateScheduleEvent
  | TtsEvalNarrateStopEvent
  | TtsEvalNarrateFailureEvent
  | TtsEvalNarrateSectionNavEvent
  | TtsEvalNarrateSectionLoadEvent
  | TtsEvalNarrateViewLayoutEvent;

export type TtsEvalTraceInputEvent = TtsEvalTraceEvent extends infer E
  ? E extends TtsEvalTraceEvent
    ? Omit<E, "ts"> & { ts?: number }
    : never
  : never;

export interface TtsEvalTrace {
  schemaVersion: TtsEvalSchemaVersion;
  runId: string;
  fixture: TtsEvalFixtureMeta;
  createdAt: string;
  events: TtsEvalTraceEvent[];
}

export interface TtsEvalMetricsSummary {
  startLatencyMs: number | null;
  warmPreviewLatencyMs: number | null;
  warmFirstAudioLatencyMs: number | null;
  startupSpikeThresholdMs: number | null;
  startupSpikeCount: number;
  wordEventCount: number;
  flowEventCount: number;
  startupCacheMode: "cached" | "uncached" | null;
  openingChunkWordCounts: number[];
  pauseResumeIntegrity: {
    pauses: number;
    resumes: number;
    balanced: boolean;
  };
  transitionCounts: {
    section: number;
    chapter: number;
    book: number;
    handoff: number;
  };
  sectionHandoffLatencyMs: number | null;
  crossBookResumeLatencyMs: number | null;
  rateResponseLatencyMs: number | null;
  nanoSegmentLatencyMs: {
    p50: number | null;
    p95: number | null;
    min: number | null;
    max: number | null;
  };
  nanoCache: {
    hits: number;
    misses: number;
    hitRate: number | null;
  };
  nanoPrefetch: {
    ready: number;
    stale: number;
    cancelled: number;
  };
  failureClasses: Array<"start-latency" | "cursor-highlight-drift" | "handoff-error" | "pause-resume-error">;
}

export interface TtsEvalTraceSink {
  enabled: boolean;
  captureMode?: "page" | "focus" | "flow" | "narrate";
  record: (event: TtsEvalTraceInputEvent) => void;
}

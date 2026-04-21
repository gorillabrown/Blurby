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
  mode?: "page" | "focus" | "flow";
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

export type TtsEvalTraceEvent =
  | TtsEvalLifecycleEvent
  | TtsEvalWordEvent
  | TtsEvalFlowPositionEvent
  | TtsEvalTransitionEvent;

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
  failureClasses: Array<"start-latency" | "cursor-highlight-drift" | "handoff-error" | "pause-resume-error">;
}

export interface TtsEvalTraceSink {
  enabled: boolean;
  record: (event: TtsEvalTraceInputEvent) => void;
}

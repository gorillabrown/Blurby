import { useState, useRef, useCallback, useEffect, useReducer, useMemo } from "react";
import { QWEN_DEFAULT_SPEAKER, TTS_CHUNK_SIZE, TTS_MAX_RATE, TTS_MIN_RATE, TTS_RATE_BASELINE_WPM, TTS_RATE_RESTART_DEBOUNCE_MS, resolveKokoroBucket } from "../constants";
import { applyPronunciationOverrides, mergeOverrides } from "../utils/pronunciationOverrides";
import type { KokoroStatusSnapshot, PronunciationOverride, QwenStatusSnapshot, ReaderMode, TtsEngine } from "../types";
import type { RhythmPauses } from "../types";
import { isSentenceEnd, type PauseConfig, DEFAULT_PAUSE_CONFIG } from "../utils/pauseDetection";
import {
  NarrationState as ReducerState,
  NarrationAction,
  narrationReducer,
  createInitialNarrationState,
  type PauseReason,
} from "../types/narration";
import { createWebSpeechStrategy } from "./narration/webSpeechStrategy";
import { createKokoroStrategy } from "./narration/kokoroStrategy";
import { createMossNanoStrategy } from "./narration/mossNanoStrategy";
import { createPocketTtsStrategy } from "./narration/pocketTtsStrategy";
import { createQwenStrategy } from "./narration/qwenStrategy";
import { createQwenStreamingStrategy } from "./narration/qwenStreamingStrategy";
import { selectPreferredVoice } from "../utils/voiceSelection";
import {
  createNarrationDiagnosticsBundle,
  recordSnapshot,
  recordDiagEvent,
  type NarrationDiagnosticsBundleInput,
} from "../utils/narrateDiagnostics";
import type { AudioProgressReport, ChunkBoundaryPayload } from "../utils/audioScheduler";
import type { TtsEvalTraceSink } from "../types/eval";
import { createTimingMetadataStore } from "../utils/timingMetadataStore";
import type { TimingMetadataChunk } from "../utils/timingMetadataStore";
import {
  createHighlightSyncController,
  type HighlightSyncResolveInput,
  type HighlightSyncDecision,
} from "../utils/highlightSyncController";
import {
  DEFAULT_KOKORO_STATUS_SNAPSHOT,
  getKokoroStatusError,
  normalizeKokoroStatusSnapshot,
  snapshotFromKokoroErrorResponse,
  snapshotFromLegacyKokoroDownloadError,
} from "../utils/kokoroStatus";
import {
  DEFAULT_QWEN_STATUS_SNAPSHOT,
  getQwenStatusError,
  normalizeQwenStatusSnapshot,
  snapshotFromQwenErrorResponse,
} from "../utils/qwenStatus";
import { resolveKokoroRatePlan } from "../utils/kokoroRatePlan";
import {
  findNextSentenceStart,
  findPreviousSentenceStart,
  syncMediaSession,
  type MediaSessionBookMetadata,
} from "../utils/mediaSessionBridge";

export interface FootnoteCue {
  afterWordIdx: number;
  text: string;
}

export interface NarrationState {
  speaking: boolean;
  pauseReason: PauseReason | null;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  rate: number; // 0.5-3.0
  kokoroReady: boolean;
  kokoroDownloading: boolean;
  kokoroDownloadProgress: number;
  kokoroVoices: string[];
  kokoroLoading: boolean;
  kokoroStatus: KokoroStatusSnapshot;
  kokoroError: string | null;
  qwenStatus: QwenStatusSnapshot;
  qwenError: string | null;
}

/** Calculate TTS rate from WPM. TTS_RATE_BASELINE_WPM = rate 1.0, scale linearly. */
function wpmToRate(wpm: number): number {
  const rate = wpm / TTS_RATE_BASELINE_WPM;
  return Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, rate));
}

function normalizeNarrationRate(rate: number, engine: TtsEngine): number {
  if (engine === "kokoro") {
    return resolveKokoroRatePlan(rate).selectedSpeed;
  }
  return Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, rate));
}

function kokoroBucketChanged(previousRate: number, nextRate: number): boolean {
  return resolveKokoroRatePlan(previousRate).generationBucket !== resolveKokoroRatePlan(nextRate).generationBucket;
}

/** Find sentence boundary in word array, returns end index (exclusive).
 *  Uses isSentenceEnd() for abbreviation-aware detection (Mr., Dr., etc.).
 *  Prefers shorter, sentence-aligned chunks so TTS speaks one sentence at a time
 *  with natural prosody at boundaries.
 *  If pageEnd is provided, never exceeds it (prevents reading across page boundaries). */
function findSentenceBoundary(words: string[], startIdx: number, chunkSize: number, pageEnd?: number | null): number {
  const hardMax = pageEnd != null ? Math.min(pageEnd + 1, words.length) : words.length;
  const maxEnd = Math.min(startIdx + chunkSize, hardMax);

  // Find the FIRST sentence ending — one sentence per chunk for natural pauses
  for (let i = startIdx; i < maxEnd; i++) {
    if (isSentenceEnd(words[i], i + 1 < words.length ? words[i + 1] : undefined)) {
      return Math.min(i + 1, hardMax);
    }
  }
  // No sentence ending within chunk — scan further (up to 2x) for one
  if (hardMax > maxEnd) {
    const extendedMax = Math.min(startIdx + chunkSize * 2, hardMax);
    for (let i = maxEnd; i < extendedMax; i++) {
      if (isSentenceEnd(words[i], i + 1 < words.length ? words[i + 1] : undefined)) {
        return Math.min(i + 1, hardMax);
      }
    }
  }
  // Hard policy: never break mid-sentence unless we truly hit the end of the available range.
  for (let i = maxEnd; i < hardMax; i++) {
    if (isSentenceEnd(words[i], i + 1 < words.length ? words[i + 1] : undefined)) {
      return Math.min(i + 1, hardMax);
    }
  }
  return hardMax;
}

const api = window.electronAPI;
const MOSS_NANO_DEFAULT_VOICE = "Junhao";
const POCKET_TTS_DEFAULT_VOICE = "default";

interface UseNarrationOptions {
  evalTrace?: TtsEvalTraceSink | null;
  experimentalNano?: boolean;
  getReadingMode?: () => ReaderMode;
}

export interface NarrationWordUpdateOptions {
  mode?: "passive" | "handoff";
}

type ExportNarrationDiagnosticsInput = Partial<Omit<NarrationDiagnosticsBundleInput, "session">> & {
  session?: Partial<NarrationDiagnosticsBundleInput["session"]>;
};

export default function useNarration(options: UseNarrationOptions = {}) {
  const experimentalNano = options.experimentalNano === true;
  // ── Reducer state machine ──────────────────────────────────────────────
  const [state, dispatch] = useReducer(narrationReducer, undefined, createInitialNarrationState);

  // Mirror reducer state into a ref for synchronous reads inside async callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── UI-bound state (not part of the state machine) ─────────────────────
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [kokoroVoices, setKokoroVoices] = useState<string[]>([]);
  const [kokoroStatus, setKokoroStatus] = useState<KokoroStatusSnapshot>(DEFAULT_KOKORO_STATUS_SNAPSHOT);
  const [kokoroError, setKokoroError] = useState<string | null>(null);
  const kokoroStatusRef = useRef<KokoroStatusSnapshot>(DEFAULT_KOKORO_STATUS_SNAPSHOT);
  const [qwenStatus, setQwenStatus] = useState<QwenStatusSnapshot>(DEFAULT_QWEN_STATUS_SNAPSHOT);
  const [qwenError, setQwenError] = useState<string | null>(null);
  const qwenStatusRef = useRef<QwenStatusSnapshot>(DEFAULT_QWEN_STATUS_SNAPSHOT);
  const [nanoError, setNanoError] = useState<unknown | null>(null);
  const [pocketError, setPocketError] = useState<unknown | null>(null);
  const [mediaSessionBook, setMediaSessionBookState] = useState<MediaSessionBookMetadata | null>(null);
  /** QWEN-STREAM-2: true when the streaming sidecar reported ready:true on mount. */
  const qwenStreamingReadyRef = useRef<boolean>(false);

  // ── Refs that need synchronous access ──────────────────────────────────
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onWordRef = useRef<((charIndex: number) => void) | null>(null);
  const allWordsRef = useRef<string[]>([]);
  const onWordAdvanceRef = useRef<((wordIndex: number) => void) | null>(null);
  /** Visual-only word-boundary callback — highlights the scheduler-authoritative word
   *  without updating narration anchors (no cursorWordIndex / lastConfirmedAudioWordRef writes). */
  const onTruthSyncRef = useRef<((wordIndex: number) => void) | null>(null);
  /** TTS-7Q: Visual-only chunk-boundary callback — updates narration chunk visuals only. */
  const onChunkBoundaryRef = useRef<((endIdx: number, metadata?: ChunkBoundaryPayload) => void) | null>(null);
  /** Visual-only audio-segment callback — lets Narrate chunk-only UI follow real audio starts. */
  const onSegmentStartRef = useRef<((wordIndex: number) => void) | null>(null);
  /** TTS-7R (BUG-145c): Canonical audio word position — updated only by the scheduler's
   *  confirmed boundary crossings. Used as the authoritative start index for chunk generation
   *  so that visual-advance callbacks cannot contaminate the pipeline's read head. */
  const lastConfirmedAudioWordRef = useRef<number>(0);
  /** TTS-7R Task-5 truth gate: trust only real timing for per-word visual updates. */
  const isTrustedWordTimingRef = useRef<boolean>(true);
  const kokoroBoundaryGateRef = useRef<{
    generationId: number;
    startIdx: number;
    requireExactFirstBoundary: boolean;
    firstBoundaryAccepted: boolean;
    lastAcceptedWordIndex: number;
  } | null>(null);
  const kokoroPlaybackGenerationRef = useRef(0);
  const nextKokoroExactStartRef = useRef<number | null>(null);
  /** Handoff marker — set when the next chunk chain must start fresh from a new global anchor. */
  const handoffPendingRef = useRef(false);
  const kokoroVoiceRef = useRef("af_bella");
  const rateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rhythmPausesRef = useRef<RhythmPauses | null>(null);
  const paragraphBreaksRef = useRef<Set<number>>(new Set());
  const pauseConfigRef = useRef<PauseConfig>(DEFAULT_PAUSE_CONFIG);
  const footnoteModeRef = useRef<"skip" | "read">("skip");
  const footnoteCuesRef = useRef<FootnoteCue[]>([]);
  const onSectionEndRef = useRef<(() => void) | null>(null);
  const bookIdRef = useRef<string>("");
  const qwenSpeakerRef = useRef(QWEN_DEFAULT_SPEAKER);
  const globalOverridesRef = useRef<PronunciationOverride[]>([]);
  const bookOverridesRef = useRef<PronunciationOverride[]>([]);
  /** Effective merged overrides (global + book) — recomputed on each setter call */
  const pronunciationOverridesRef = useRef<PronunciationOverride[]>([]);
  const evalTraceRef = useRef<TtsEvalTraceSink | null>(options.evalTrace ?? null);
  const evalStartTimeRef = useRef<number | null>(null);
  const evalFirstAudioCapturedRef = useRef(false);
  const nanoTraceKeysRef = useRef<Set<string>>(new Set());
  const pendingRateResponseTraceRef = useRef<{
    requestedAt: number;
    fromRate: number;
    toRate: number;
    context: string;
  } | null>(null);
  const lastCursorStartRef = useRef<{
    startWordIndex: number;
    wordsLength: number;
    startedAtMs: number;
  } | null>(null);
  const highlightSyncDecisionsRef = useRef<Record<string, unknown>[]>([]);
  const wordBoundaryEventsRef = useRef<Record<string, unknown>[]>([]);
  evalTraceRef.current = options.evalTrace ?? null;

  const timingMetadataStore = useMemo(() => createTimingMetadataStore(), []);
  const highlightSyncController = useMemo(
    () => createHighlightSyncController(timingMetadataStore),
    [timingMetadataStore],
  );
  const resolveHighlightSync = useCallback((input: HighlightSyncResolveInput): HighlightSyncDecision => {
    const decision = highlightSyncController.resolve(input);
    highlightSyncDecisionsRef.current.push({
      timestamp: Date.now(),
      input: { ...input },
      decision,
    });
    if (highlightSyncDecisionsRef.current.length > 50) {
      highlightSyncDecisionsRef.current.shift();
    }
    return decision;
  }, [highlightSyncController]);

  const shouldAcceptKokoroBoundary = useCallback((wordIndex: number): boolean => {
    const gate = kokoroBoundaryGateRef.current;
    if (!gate) return true;
    if (kokoroPlaybackGenerationRef.current !== gate.generationId) return false;

    if (!gate.firstBoundaryAccepted) {
      const boundaryIsTooEarly = gate.requireExactFirstBoundary
        ? wordIndex !== gate.startIdx
        : wordIndex < gate.startIdx;
      if (boundaryIsTooEarly) {
        if (import.meta.env.DEV) {
          console.debug(
            "[narrate] ignoring stale Kokoro boundary before selected start:",
            wordIndex,
            "expected:",
            gate.startIdx,
          );
        }
        return false;
      }
      gate.firstBoundaryAccepted = true;
      gate.lastAcceptedWordIndex = wordIndex;
      return true;
    }

    if (wordIndex < gate.lastAcceptedWordIndex) return false;
    gate.lastAcceptedWordIndex = wordIndex;
    return true;
  }, []);

  const exportNarrationDiagnosticsBundle = useCallback((input: ExportNarrationDiagnosticsInput = {}) => {
    const s = stateRef.current;
    const timingRecords = timingMetadataStore.listChunks();
    const timingSegmentIds = timingRecords
      .map((record) => record.segmentId)
      .filter((segmentId): segmentId is string => Boolean(segmentId));
    const selectedEngine = (input.session?.selectedEngine ?? s.engine) as TtsEngine;
    const segmentIds = input.session?.segmentIds ?? Array.from(new Set(timingSegmentIds));
    const voiceId =
      input.session?.voiceId
      ?? (selectedEngine === "kokoro"
        ? kokoroVoiceRef.current
        : selectedEngine === "qwen"
          ? qwenSpeakerRef.current
          : selectedEngine === "nano"
            ? MOSS_NANO_DEFAULT_VOICE
            : selectedEngine === "pocket-tts"
              ? POCKET_TTS_DEFAULT_VOICE
              : currentVoice?.name ?? null);
    const defaultSchedulerTruthEvents = wordBoundaryEventsRef.current.length > 0
      ? [...wordBoundaryEventsRef.current]
      : timingRecords.map((record) => ({
          source: selectedEngine,
          chunkId: record.chunkId,
          segmentId: record.segmentId,
          wordStartIndex: record.chunkStartIdx,
          wordEndIndex: record.chunkEndIdx,
          timingTruth: record.timingTruth,
          classification: record.hasTrustedWordTiming ? "trusted-word-timing" : record.timingClassification,
        }));

    return createNarrationDiagnosticsBundle({
      session: {
        bookId: bookIdRef.current || null,
        sessionId: null,
        profileId: null,
        rate: s.speed,
        ...input.session,
        selectedEngine,
        voiceId,
        segmentIds,
      },
      normalizedSegments: input.normalizedSegments ?? [],
      cacheEntries: input.cacheEntries ?? [],
      timingSidecars: input.timingSidecars ?? timingRecords.map((record) => ({
        chunkId: record.chunkId,
        segmentId: record.segmentId,
        timingTruth: record.timingTruth,
        durationMs: record.durationMs,
        wordTimestampCount: record.wordTimestamps?.length ?? 0,
        classification: record.hasTrustedWordTiming ? "trusted-word-timing" : record.timingClassification,
      })),
      schedulerTruthEvents: input.schedulerTruthEvents ?? defaultSchedulerTruthEvents,
      highlightSyncDecisions: input.highlightSyncDecisions ?? highlightSyncDecisionsRef.current,
      errors: input.errors ?? [],
    });
  }, [currentVoice, timingMetadataStore]);

  const emitEvalTrace = useCallback((event: Parameters<NonNullable<TtsEvalTraceSink>["record"]>[0]) => {
    if (!evalTraceRef.current?.enabled) return;
    evalTraceRef.current.record(event);
  }, []);

  const getEvalTraceMode = useCallback((): ReaderMode => options.getReadingMode?.() ?? "narrate", [options.getReadingMode]);

  const emitNanoSegmentTrace = useCallback((event: {
    phase: "request" | "prefetch-start" | "prefetch-ready" | "prefetch-stale" | "prefetch-cancelled" | "playback";
    startIdx: number;
    endIdx: number;
    latencyMs?: number;
    cacheHit?: boolean;
    prefetchReady?: boolean;
    reason?: string;
  }) => {
    const key = `${event.phase}:${event.startIdx}:${event.endIdx}:${event.reason ?? ""}`;
    if (nanoTraceKeysRef.current.has(key)) return;
    nanoTraceKeysRef.current.add(key);
    emitEvalTrace({
      kind: "nano-segment",
      phase: event.phase,
      startIdx: event.startIdx,
      endIdx: event.endIdx,
      latencyMs: event.latencyMs,
      cacheHit: event.cacheHit ?? false,
      prefetchReady: event.prefetchReady ?? false,
      timingTruth: "segment-following",
      wordTimestamps: null,
      reason: event.reason,
    } as Parameters<NonNullable<TtsEvalTraceSink>["record"]>[0]);
  }, [emitEvalTrace]);

  const clearPendingRateResponseTrace = useCallback(() => {
    pendingRateResponseTraceRef.current = null;
  }, []);

  const emitPendingRateResponseTrace = useCallback(() => {
    const pending = pendingRateResponseTraceRef.current;
    if (!pending) return;

    pendingRateResponseTraceRef.current = null;
    emitEvalTrace({
      kind: "transition",
      transition: "rate-response",
      from: pending.fromRate,
      to: pending.toRate,
      context: pending.context,
      latencyMs: Math.max(0, Date.now() - pending.requestedAt),
    });
  }, [emitEvalTrace]);

  const updateMergedOverrides = useCallback(() => {
    pronunciationOverridesRef.current = mergeOverrides(globalOverridesRef.current, bookOverridesRef.current);
  }, []);

  const applyKokoroStatusSnapshot = useCallback((snapshotLike?: Partial<KokoroStatusSnapshot> | null) => {
    const snapshot = normalizeKokoroStatusSnapshot(snapshotLike);
    kokoroStatusRef.current = snapshot;
    setKokoroStatus(snapshot);
    dispatch({ type: "SYNC_KOKORO_STATUS", snapshot });

    const error = getKokoroStatusError(snapshot);
    if (error) {
      setKokoroError(error);
      dispatch({ type: "ERROR", message: error });
      return;
    }

    if (stateRef.current.status === "error") {
      dispatch({ type: "STOP" });
    }
    if (snapshot.ready || snapshot.loading || snapshot.status === "idle") {
      setKokoroError(null);
    }
  }, []);

  const applyQwenStatusSnapshot = useCallback((snapshotLike?: Partial<QwenStatusSnapshot> | null) => {
    const snapshot = normalizeQwenStatusSnapshot(snapshotLike);
    qwenStatusRef.current = snapshot;
    setQwenStatus(snapshot);
    dispatch({ type: "SYNC_QWEN_STATUS", snapshot });

    const error = getQwenStatusError(snapshot);
    if (error) {
      setQwenError(error);
      return;
    }

    if (snapshot.ready || snapshot.loading || snapshot.status === "idle") {
      setQwenError(null);
    }
  }, []);

  /** TTS-7A: Capture a diagnostics snapshot of current narration state */
  const captureDiagSnapshot = useCallback(() => {
    const s = stateRef.current;
    recordSnapshot({
      engine: s.engine as "web" | "kokoro" | "qwen" | "nano" | "pocket-tts" | null,
      status: s.status,
      cursorWordIndex: s.cursorWordIndex,
      totalWords: allWordsRef.current.length,
      rate: s.speed,
      rateBucket: s.engine === "kokoro" ? resolveKokoroBucket(s.speed) : null,
      profileId: null,
      bookId: bookIdRef.current || null,
      extractionComplete: allWordsRef.current.length > 0,
      fellBack: false,
      fallbackReason: null,
    });
  }, []);

  /**
   * Synchronize the canonical narration cursor with a new global word index.
   * Optionally re-anchor the audio-confirmed cursor when this is an authoritative handoff.
   */
  const syncNarrationCursor = useCallback((wordIndex: number, options: { syncConfirmedAudioAnchor?: boolean } = {}) => {
    const s = stateRef.current;
    if (s.status === "idle") return s;
    if (options.syncConfirmedAudioAnchor) {
      lastConfirmedAudioWordRef.current = wordIndex;
    }
    dispatch({ type: "WORD_ADVANCE", wordIndex });
    stateRef.current = {
      ...stateRef.current,
      cursorWordIndex: wordIndex,
      chunkStart: wordIndex,
      chunkWords: [],
    };
    return s;
  }, []);

  // ── TTS Strategy instances ──────────────────────────────────────────────
  const webStrategy = useMemo(
    () => createWebSpeechStrategy(() => currentVoice),
    [currentVoice],
  );

  // Stable refs to break circular dependency (strategy → speakNextChunk → strategy).
  const speakNextChunkRef = useRef<() => void>(() => {});
  const speakNextChunkWebRef = useRef<() => void>(() => {});
  // TTS-7B: Ref to kokoroStrategy for fallback teardown (callback needs to call .stop())
  const kokoroStrategyRef = useRef<ReturnType<typeof createKokoroStrategy> | null>(null);
  const qwenStrategyRef = useRef<ReturnType<typeof createQwenStrategy> | ReturnType<typeof createQwenStreamingStrategy> | null>(null);
  const nanoStrategyRef = useRef<ReturnType<typeof createMossNanoStrategy> | null>(null);
  const pocketStrategyRef = useRef<ReturnType<typeof createPocketTtsStrategy> | null>(null);
  const nanoActiveRef = useRef(false);
  const nanoCallbackGenerationRef = useRef(0);
  const pocketActiveRef = useRef(false);
  const pocketCallbackGenerationRef = useRef(0);

  const claimNanoOwnership = useCallback(() => {
    const generation = nanoCallbackGenerationRef.current + 1;
    nanoCallbackGenerationRef.current = generation;
    nanoActiveRef.current = true;
    return generation;
  }, []);

  const clearNanoOwnership = useCallback(() => {
    nanoCallbackGenerationRef.current += 1;
    nanoActiveRef.current = false;
  }, []);

  const ownsNanoCallback = useCallback((generation: number) => (
    nanoActiveRef.current && nanoCallbackGenerationRef.current === generation
  ), []);

  const claimPocketOwnership = useCallback(() => {
    const generation = pocketCallbackGenerationRef.current + 1;
    pocketCallbackGenerationRef.current = generation;
    pocketActiveRef.current = true;
    return generation;
  }, []);

  const clearPocketOwnership = useCallback(() => {
    pocketCallbackGenerationRef.current += 1;
    pocketActiveRef.current = false;
  }, []);

  const ownsPocketCallback = useCallback((generation: number) => (
    pocketActiveRef.current && pocketCallbackGenerationRef.current === generation
  ), []);

  const reportNanoError = useCallback((error?: unknown) => {
    const detail =
      error && typeof error === "object" && "error" in error
        ? String((error as { error?: unknown }).error)
        : "MOSS Nano synthesis failed";
    clearNanoOwnership();
    setNanoError(error ?? detail);
    dispatch({ type: "ERROR", message: detail });
    stateRef.current = { ...stateRef.current, status: "error", pauseReason: null };
  }, [clearNanoOwnership]);

  const reportPocketError = useCallback((error?: unknown) => {
    const detail =
      error && typeof error === "object" && "error" in error
        ? String((error as { error?: unknown }).error)
        : "Pocket TTS synthesis failed";
    clearPocketOwnership();
    setPocketError(error ?? detail);
    dispatch({ type: "ERROR", message: detail });
    stateRef.current = { ...stateRef.current, status: "error", pauseReason: null };
  }, [clearPocketOwnership]);

  const kokoroStrategy = useMemo(
    () => createKokoroStrategy({
      getVoiceId: () => kokoroVoiceRef.current,
      getSpeed: () => stateRef.current.speed,
      getStatus: () => stateRef.current.status,
      getWords: () => allWordsRef.current,
      getBookId: () => bookIdRef.current,
      getPronunciationOverrides: () => pronunciationOverridesRef.current,
      // TTS-7N (BUG-136): Derive word-weight config from pause settings.
      // Higher sentenceMs → bigger sentence weight → cursor dwells longer on sentence endings.
      // Scale relative to defaults: 500ms sentence pause → 1.12x, 1000ms → ~1.24x, 0ms → 1.0x.
      getWeightConfig: () => {
        const cfg = pauseConfigRef.current;
        const DEFAULT_SENTENCE_MS = 500;
        const DEFAULT_CLAUSE_MS = 150;
        const BASE_SENTENCE = 1.12;
        const BASE_CLAUSE = 1.05;
        return {
          sentenceWeightFactor: cfg.sentenceMs > 0 ? 1 + (BASE_SENTENCE - 1) * (cfg.sentenceMs / DEFAULT_SENTENCE_MS) : 1.0,
          clauseWeightFactor: cfg.clauseMs > 0 ? 1 + (BASE_CLAUSE - 1) * (cfg.clauseMs / DEFAULT_CLAUSE_MS) : 1.0,
        };
      },
      // TTS-7O: Pass pause config for silence injection at chunk boundaries
      getPauseConfig: () => pauseConfigRef.current,
      // TTS-7P: Pass paragraph breaks for planner-aware silence injection
      getParagraphBreaks: () => paragraphBreaksRef.current,
      getFootnoteMode: () => footnoteModeRef.current,
      getFootnoteCues: () => footnoteCuesRef.current,
      onSegmentStart: (wordIndex: number) => {
        emitPendingRateResponseTrace();
        onSegmentStartRef.current?.(wordIndex);
      },
      onTimingMetadata: (metadata: TimingMetadataChunk) => {
        timingMetadataStore.upsertChunk(metadata);
      },
      // Event-driven word-boundary sync (TTS-EVENT-SYNC-1).
      onTruthSync: (event) => {
        if (stateRef.current.status === "idle") return;
        if (!shouldAcceptKokoroBoundary(event.resolvedWordIndex)) return;
        isTrustedWordTimingRef.current = event.isTrustedWordTiming;
        const syncDecision = resolveHighlightSync({
          wordIndex: event.resolvedWordIndex,
          followingEnabled: true,
          fallbackMode: "chunk",
        });
        wordBoundaryEventsRef.current.push({
          timestamp: Date.now(),
          source: "kokoro",
          sourceWordIndex: event.sourceWordIndex,
          resolvedWordIndex: event.resolvedWordIndex,
          isTrustedWordTiming: event.isTrustedWordTiming,
          alignmentCorrected: event.alignmentCorrected,
          timingTruth: event.timingTruth,
          syncDecision,
        });
        if (wordBoundaryEventsRef.current.length > 300) {
          wordBoundaryEventsRef.current.shift();
        }
        recordDiagEvent(
          "word-boundary-event",
          `sourceWordIndex=${event.sourceWordIndex ?? "null"} resolvedWordIndex=${event.resolvedWordIndex} alignmentCorrected=${event.alignmentCorrected ? 1 : 0} trusted=${event.isTrustedWordTiming ? 1 : 0}`,
        );
        if (!event.isTrustedWordTiming) return;
        // Narrate/Foliate installs a dedicated truth-sync callback that owns visual
        // cursor updates. In that mode we must avoid also firing onWordAdvance,
        // or dual callback paths can race and produce ahead-then-jump behavior.
        const hasTruthSyncCallback = Boolean(onTruthSyncRef.current);
        if (hasTruthSyncCallback) {
          try {
            onTruthSyncRef.current?.(event.resolvedWordIndex);
          } catch (error) {
            if (import.meta.env.DEV) console.warn("[narrate] onTruthSync callback failed:", error);
          }
        } else {
          try {
            onWordAdvanceRef.current?.(event.resolvedWordIndex);
          } catch (error) {
            if (import.meta.env.DEV) console.warn("[narrate] onWordAdvance callback failed:", error);
          }
        }
      },
      onChunkBoundary: (endIdx: number, metadata?: ChunkBoundaryPayload) => {
        onChunkBoundaryRef.current?.(endIdx, metadata);
      },
      onFallbackToWeb: () => {
        // TTS-7B: Stop Kokoro pipeline+scheduler before switching to Web Speech (BUG-109)
        kokoroStrategyRef.current?.stop();
        recordDiagEvent("fallback", "kokoro→web: stopped pipeline before Web Speech start");
        dispatch({ type: "SET_ENGINE", engine: "web" });
        // Yield a tick to let cleanup flush before starting Web Speech
        setTimeout(() => speakNextChunkWebRef.current(), 0);
      },
    }),
    [emitPendingRateResponseTrace, resolveHighlightSync, shouldAcceptKokoroBoundary, timingMetadataStore],
  );
  kokoroStrategyRef.current = kokoroStrategy;

  const qwenStrategy = useMemo(
    () => {
      const sharedDeps = {
        getSpeaker: () => qwenSpeakerRef.current,
        getSpeed: () => stateRef.current.speed,
        getWords: () => allWordsRef.current,
        getBookId: () => bookIdRef.current,
        getPronunciationOverrides: () => pronunciationOverridesRef.current,
        getPauseConfig: () => pauseConfigRef.current,
        getParagraphBreaks: () => paragraphBreaksRef.current,
        onError: () => {
          const detail =
            qwenError ||
            getQwenStatusError(qwenStatusRef.current) ||
            qwenStatusRef.current.detail ||
            "Qwen generation failed";
          dispatch({ type: "ERROR", message: detail });
          stateRef.current = { ...stateRef.current, status: "error", pauseReason: null };
        },
        onSegmentStart: (wordIndex: number) => {
          if (!evalFirstAudioCapturedRef.current && evalStartTimeRef.current != null) {
            evalFirstAudioCapturedRef.current = true;
            emitEvalTrace({
              kind: "lifecycle",
              state: "first-audio",
              wordIndex,
              latencyMs: Math.max(0, Date.now() - evalStartTimeRef.current),
            });
          }
          emitPendingRateResponseTrace();
        },
        onTruthSync: (wordIndex: number) => {
          if (onTruthSyncRef.current) onTruthSyncRef.current(wordIndex);
        },
      };

      // QWEN-STREAM-2: Use streaming strategy when sidecar is available,
      // fall back to non-streaming strategy otherwise.
      if (qwenStreamingReadyRef.current) {
        return createQwenStreamingStrategy(sharedDeps);
      }
      return createQwenStrategy({
        ...sharedDeps,
        getStatus: () => stateRef.current.status,
        getFootnoteMode: () => footnoteModeRef.current,
        getFootnoteCues: () => footnoteCuesRef.current,
      });
    },
    [emitEvalTrace, emitPendingRateResponseTrace, qwenError],
  );
  qwenStrategyRef.current = qwenStrategy;

  const nanoStrategy = useMemo(
    () => experimentalNano
      ? createMossNanoStrategy({
          getVoiceId: () => MOSS_NANO_DEFAULT_VOICE,
          getWords: () => allWordsRef.current,
          onSegmentTrace: emitNanoSegmentTrace,
          onRuntimeTrace: (event) => {
            emitEvalTrace(event as Parameters<NonNullable<TtsEvalTraceSink>["record"]>[0]);
          },
          onError: reportNanoError,
        })
      : null,
    [emitEvalTrace, emitNanoSegmentTrace, experimentalNano, reportNanoError],
  );
  nanoStrategyRef.current = nanoStrategy;

  const pocketStrategy = useMemo(
    () => createPocketTtsStrategy({
      getVoiceId: () => POCKET_TTS_DEFAULT_VOICE,
      getWords: () => allWordsRef.current,
      onRuntimeTrace: (event) => {
        emitEvalTrace(event as Parameters<NonNullable<TtsEvalTraceSink>["record"]>[0]);
      },
      onError: reportPocketError,
    }),
    [emitEvalTrace, reportPocketError],
  );
  pocketStrategyRef.current = pocketStrategy;

  // Check Kokoro model status on mount
  useEffect(() => {
    if (!api?.kokoroModelStatus) return;
    api.kokoroModelStatus().then((result) => {
      applyKokoroStatusSnapshot(result);
    }).catch(() => {});

    // Listen for download progress and loading state
    const cleanups: (() => void)[] = [];
    if (api.onKokoroDownloadProgress) {
      cleanups.push(api.onKokoroDownloadProgress((progress: number) => {
        dispatch({ type: "KOKORO_DOWNLOAD_PROGRESS", progress });
      }));
    }
    if (api.onKokoroEngineStatus) {
      cleanups.push(api.onKokoroEngineStatus((data) => {
        applyKokoroStatusSnapshot(data);
      }));
    }
    if (api.onKokoroDownloadError) {
      cleanups.push(api.onKokoroDownloadError((error: string) => {
        applyKokoroStatusSnapshot(
          snapshotFromLegacyKokoroDownloadError(kokoroStatusRef.current, error),
        );
      }));
    }
    return () => cleanups.forEach((c) => c());
  }, [applyKokoroStatusSnapshot]);

  useEffect(() => {
    if (!api?.qwenModelStatus) return;
    api.qwenModelStatus().then((result) => {
      applyQwenStatusSnapshot(result);
    }).catch(() => {});

    const cleanups: (() => void)[] = [];
    if (api.onQwenEngineStatus) {
      cleanups.push(api.onQwenEngineStatus((data) => {
        applyQwenStatusSnapshot(data);
      }));
    }
    if (api.onQwenRuntimeError) {
      cleanups.push(api.onQwenRuntimeError((error: string) => {
        applyQwenStatusSnapshot(snapshotFromQwenErrorResponse({
          error,
          status: qwenStatusRef.current.status === "warming" ? "unavailable" : "error",
          reason: qwenStatusRef.current.reason ?? "runtime-error",
          recoverable: true,
        }));
      }));
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [applyQwenStatusSnapshot]);

  // QWEN-STREAM-2: Probe streaming engine availability once on mount.
  // Result is stored in a ref (not state) — strategy selection reads it synchronously.
  useEffect(() => {
    if (!api?.qwenStreamStatus) return;
    api.qwenStreamStatus().then((status) => {
      qwenStreamingReadyRef.current = status?.ready === true;
    }).catch(() => {
      qwenStreamingReadyRef.current = false;
    });
  }, []);

  // Auto-start narration when Kokoro becomes ready while in warming state
  useEffect(() => {
    if (!state.kokoroReady) return;
    const s = stateRef.current;
    if (s.status === "warming" && s.engine === "kokoro") {
      if (import.meta.env.DEV) console.debug("[narrate] Kokoro ready — auto-starting from word:", s.cursorWordIndex);
      dispatch({ type: "START_CURSOR_DRIVEN", startIdx: s.cursorWordIndex, speed: s.speed });
      stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      speakNextChunkRef.current();
    }
  }, [state.kokoroReady]);

  useEffect(() => {
    if (!state.qwenReady) return;
    const s = stateRef.current;
    if (s.status === "warming" && s.engine === "qwen") {
      dispatch({ type: "START_CURSOR_DRIVEN", startIdx: s.cursorWordIndex, speed: s.speed });
      stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      speakNextChunkRef.current();
    }
  }, [state.qwenReady]);

  // Load Kokoro voices when ready
  useEffect(() => {
    if (!state.kokoroReady || !api?.kokoroVoices) return;
    api.kokoroVoices().then((result: { voices?: string[]; error?: string }) => {
      if (result.voices) setKokoroVoices(result.voices);
    }).catch(() => {});
  }, [state.kokoroReady]);

  // Load Web Speech API voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) {
        setVoices(v);
        const preferred = selectPreferredVoice(v);
        setCurrentVoice((prev) => prev || preferred || null);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  /** Set which engine to use */
  const setEngine = useCallback((engine: TtsEngine) => {
    const current = stateRef.current;
    if (current.engine === engine) return;

    if (rateDebounceRef.current) {
      clearTimeout(rateDebounceRef.current);
      rateDebounceRef.current = null;
    }

    clearPendingRateResponseTrace();
    handoffPendingRef.current = false;

    if (current.status !== "idle") {
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
      nanoStrategyRef.current?.stop();
      pocketStrategyRef.current?.stop();
      clearNanoOwnership();
      clearPocketOwnership();
      dispatch({ type: "STOP" });
      stateRef.current = {
        ...stateRef.current,
        status: "idle",
        pauseReason: null,
        chunkStart: 0,
        chunkWords: [],
      };
    }

    dispatch({ type: "SET_ENGINE", engine });
    stateRef.current = {
      ...stateRef.current,
      engine,
    };
  }, [clearPendingRateResponseTrace, clearNanoOwnership, clearPocketOwnership, kokoroStrategy, qwenStrategy, webStrategy]);

  /** Set the max word index for the current page — chunks won't cross this boundary */
  const setPageEndWord = useCallback((endIdx: number | null) => {
    dispatch({ type: "SET_PAGE_END", endIdx });
  }, []);

  /** Set Kokoro voice ID */
  const setKokoroVoice = useCallback((voiceId: string) => {
    const normalizedVoiceId = voiceId || "af_bella";
    if (kokoroVoiceRef.current === normalizedVoiceId) return;
    kokoroVoiceRef.current = normalizedVoiceId;
    const current = stateRef.current;
    if (current.engine !== "kokoro" || current.status !== "speaking") return;
    dispatch({ type: "PAUSE", reason: "voice-change" });
    stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "voice-change" };
    clearPendingRateResponseTrace();
    kokoroStrategy.stop();
    dispatch({ type: "RESUME" });
    stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
    speakNextChunkRef.current();
  }, [clearPendingRateResponseTrace, kokoroStrategy]);

  /** Set Qwen speaker ID */
  const setQwenVoice = useCallback((speakerId: string) => {
    const nextSpeaker = speakerId || QWEN_DEFAULT_SPEAKER;
    if (qwenSpeakerRef.current === nextSpeaker) return;
    qwenSpeakerRef.current = nextSpeaker;
    const current = stateRef.current;
    if (current.engine !== "qwen" || current.status !== "speaking") return;
    dispatch({ type: "PAUSE", reason: "voice-change" });
    stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "voice-change" };
    clearPendingRateResponseTrace();
    qwenStrategy.stop();
    dispatch({ type: "RESUME" });
    stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
    speakNextChunkRef.current();
  }, [clearPendingRateResponseTrace, qwenStrategy]);

  /** Download Kokoro model */
  const downloadKokoroModel = useCallback(async () => {
    if (!api?.kokoroDownload) return;
    dispatch({ type: "KOKORO_DOWNLOAD_PROGRESS", progress: 0 });
    setKokoroError(null);
    try {
      const result = await api.kokoroDownload();
      if (result.error) {
        applyKokoroStatusSnapshot(snapshotFromKokoroErrorResponse(result));
        return;
      }

      if (api.kokoroModelStatus) {
        const snapshot = await api.kokoroModelStatus();
        applyKokoroStatusSnapshot(snapshot);
      }
    } catch {
      applyKokoroStatusSnapshot(snapshotFromKokoroErrorResponse({}, "Download failed"));
    }
  }, [applyKokoroStatusSnapshot]);

  // ── Strategy-based chunk dispatch ─────────────────────────────────────

  /** Speak the next chunk using the Web Speech strategy. */
  const speakNextChunkWeb = useCallback(() => {
    const s = stateRef.current;
    if (!window.speechSynthesis || s.status === "idle") return;
    const words = allWordsRef.current;
    const startIdx = s.cursorWordIndex;
    if (startIdx >= words.length) {
      if (onSectionEndRef.current) {
        onSectionEndRef.current();
      } else {
        dispatch({ type: "STOP" });
      }
      return;
    }

    const endIdx = findSentenceBoundary(words, startIdx, TTS_CHUNK_SIZE, null);
    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = applyPronunciationOverrides(chunkWords.join(" "), pronunciationOverridesRef.current);
    const chunkStart = startIdx;

    webStrategy.speakChunk(
      chunkText,
      chunkWords,
      chunkStart,
      s.speed,
      (wordOffset) => {
        const globalIdx = chunkStart + wordOffset;
        if (!evalFirstAudioCapturedRef.current && evalStartTimeRef.current != null) {
          evalFirstAudioCapturedRef.current = true;
          emitEvalTrace({
            kind: "lifecycle",
            state: "first-audio",
            wordIndex: globalIdx,
            latencyMs: Math.max(0, Date.now() - evalStartTimeRef.current),
          });
        }
        emitEvalTrace({ kind: "word", source: "audio", wordIndex: globalIdx });
        dispatch({ type: "WORD_ADVANCE", wordIndex: globalIdx });
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(globalIdx);
      },
      () => {
        dispatch({ type: "CHUNK_COMPLETE", endIdx });
        stateRef.current = { ...stateRef.current, cursorWordIndex: endIdx };
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(endIdx);
        // TTS-7A: Snapshot on chunk delivery
        captureDiagSnapshot();
        const currentState = stateRef.current;
        if (currentState.status !== "idle" && currentState.status !== "holding") speakNextChunkWeb();
      },
      () => {
        dispatch({ type: "STOP" });
      },
    );
  }, [webStrategy, captureDiagSnapshot, emitEvalTrace]);

  const speakNextChunkNano = useCallback(() => {
    const strategy = nanoStrategyRef.current;
    const s = stateRef.current;
    if (!strategy || s.status === "idle") return;
    const words = allWordsRef.current;
    const startIdx = s.cursorWordIndex;
    if (startIdx >= words.length) {
      clearNanoOwnership();
      if (onSectionEndRef.current) {
        onSectionEndRef.current();
      } else {
        dispatch({ type: "STOP" });
      }
      return;
    }

    const endIdx = findSentenceBoundary(words, startIdx, TTS_CHUNK_SIZE, null);
    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = applyPronunciationOverrides(chunkWords.join(" "), pronunciationOverridesRef.current);
    const chunkStart = startIdx;
    const nanoGeneration = claimNanoOwnership();
    const scope = {
      bookId: bookIdRef.current || "active-book",
      sectionId: stateRef.current.pageEndWord ?? "active-section",
      generation: stateRef.current.generationId,
    };

    strategy.setContinuityScope(scope);
    emitNanoSegmentTrace({
      phase: "request",
      startIdx: chunkStart,
      endIdx,
      cacheHit: false,
      prefetchReady: false,
    });

    const prefetchStart = endIdx < words.length ? endIdx : (onSectionEndRef.current ? chunkStart : null);
    const prefetchReason = endIdx < words.length ? "next-segment" : "next-section";
    let prefetchStarted = false;
    let prefetchPromise: Promise<unknown> | null = null;
    const startPrefetchOnce = () => {
      if (prefetchStarted || prefetchStart == null) return prefetchPromise;
      prefetchStarted = true;
      const prefetchEnd = endIdx < words.length
        ? findSentenceBoundary(words, prefetchStart, TTS_CHUNK_SIZE, null)
        : endIdx;
      const prefetchWords = words.slice(prefetchStart, prefetchEnd);
      const prefetchText = applyPronunciationOverrides(prefetchWords.join(" "), pronunciationOverridesRef.current);
      emitNanoSegmentTrace({
        phase: "prefetch-start",
        startIdx: prefetchStart,
        endIdx: prefetchEnd,
        cacheHit: false,
        prefetchReady: false,
        reason: prefetchReason,
      });
      prefetchPromise = strategy.prefetchChunk(prefetchText, prefetchWords, prefetchStart, s.speed, {
        reason: prefetchReason,
      }).catch((error: unknown) => {
        if (import.meta.env.DEV) console.debug("[narrate] nano prefetch skipped", error);
      });
      return prefetchPromise;
    };

    strategy.speakChunk(
      chunkText,
      chunkWords,
      chunkStart,
      s.speed,
      (wordIndex) => {
        if (!ownsNanoCallback(nanoGeneration)) return;
        startPrefetchOnce();
        if (!evalFirstAudioCapturedRef.current && evalStartTimeRef.current != null) {
          evalFirstAudioCapturedRef.current = true;
          emitEvalTrace({
            kind: "lifecycle",
            state: "first-audio",
            wordIndex,
            latencyMs: Math.max(0, Date.now() - evalStartTimeRef.current),
          });
        }
        emitEvalTrace({ kind: "word", source: "audio", wordIndex });
        lastConfirmedAudioWordRef.current = wordIndex;
        dispatch({ type: "WORD_ADVANCE", wordIndex });
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(wordIndex);
      },
      () => {
        if (!ownsNanoCallback(nanoGeneration)) return;
        const playbackTrace = strategy.getLastPlaybackTrace();
        if (playbackTrace) {
          emitNanoSegmentTrace(playbackTrace);
        }
        const finishChunk = () => {
          if (!ownsNanoCallback(nanoGeneration)) return;
          dispatch({ type: "CHUNK_COMPLETE", endIdx });
          stateRef.current = { ...stateRef.current, cursorWordIndex: endIdx };
          lastConfirmedAudioWordRef.current = endIdx;
          if (onWordAdvanceRef.current) onWordAdvanceRef.current(endIdx);
          captureDiagSnapshot();
          const currentState = stateRef.current;
          if (currentState.status !== "idle" && currentState.status !== "holding" && endIdx < words.length) {
            speakNextChunkNano();
          } else if (onSectionEndRef.current) {
            clearNanoOwnership();
            onSectionEndRef.current();
          } else {
            dispatch({ type: "STOP" });
            clearNanoOwnership();
          }
        };
        if (prefetchPromise && endIdx < words.length) {
          void prefetchPromise.finally(finishChunk);
        } else {
          finishChunk();
        }
      },
      (error?: unknown) => {
        if (!ownsNanoCallback(nanoGeneration)) return;
        reportNanoError(error);
      },
    );
  }, [captureDiagSnapshot, claimNanoOwnership, clearNanoOwnership, emitEvalTrace, emitNanoSegmentTrace, ownsNanoCallback, reportNanoError]);

  const speakNextChunkPocket = useCallback(() => {
    const strategy = pocketStrategyRef.current;
    const s = stateRef.current;
    if (!strategy || s.status === "idle") return;
    const words = allWordsRef.current;
    const startIdx = s.cursorWordIndex;
    if (startIdx >= words.length) {
      clearPocketOwnership();
      if (onSectionEndRef.current) {
        onSectionEndRef.current();
      } else {
        dispatch({ type: "STOP" });
      }
      return;
    }

    const endIdx = findSentenceBoundary(words, startIdx, TTS_CHUNK_SIZE, null);
    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = applyPronunciationOverrides(chunkWords.join(" "), pronunciationOverridesRef.current);
    const pocketGeneration = claimPocketOwnership();

    strategy.setContinuityScope({
      bookId: bookIdRef.current || "active-book",
      sectionId: stateRef.current.pageEndWord ?? "active-section",
      generation: stateRef.current.generationId,
    });

    strategy.speakChunk(
      chunkText,
      chunkWords,
      startIdx,
      s.speed,
      (wordIndex) => {
        if (!ownsPocketCallback(pocketGeneration)) return;
        if (!evalFirstAudioCapturedRef.current && evalStartTimeRef.current != null) {
          evalFirstAudioCapturedRef.current = true;
          emitEvalTrace({
            kind: "lifecycle",
            state: "first-audio",
            wordIndex,
            latencyMs: Math.max(0, Date.now() - evalStartTimeRef.current),
          });
        }
        emitEvalTrace({ kind: "word", source: "audio", wordIndex });
        lastConfirmedAudioWordRef.current = wordIndex;
        dispatch({ type: "WORD_ADVANCE", wordIndex });
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(wordIndex);
      },
      () => {
        if (!ownsPocketCallback(pocketGeneration)) return;
        dispatch({ type: "CHUNK_COMPLETE", endIdx });
        stateRef.current = { ...stateRef.current, cursorWordIndex: endIdx };
        lastConfirmedAudioWordRef.current = endIdx;
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(endIdx);
        captureDiagSnapshot();
        const currentState = stateRef.current;
        if (currentState.status !== "idle" && currentState.status !== "holding" && endIdx < words.length) {
          speakNextChunkPocket();
        } else if (onSectionEndRef.current) {
          clearPocketOwnership();
          onSectionEndRef.current();
        } else {
          dispatch({ type: "STOP" });
          clearPocketOwnership();
        }
      },
      (error?: unknown) => {
        if (!ownsPocketCallback(pocketGeneration)) return;
        reportPocketError(error);
      },
    );
  }, [captureDiagSnapshot, claimPocketOwnership, clearPocketOwnership, emitEvalTrace, ownsPocketCallback, reportPocketError]);

  /** Speak using the Kokoro strategy (delegates to NAR-2 pipeline + scheduler). */
  const speakNextChunkKokoro = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "idle") return;
    const words = allWordsRef.current;
    // TTS-7R (BUG-145c): Read from audio-confirmed ref, NOT cursorWordIndex.
    // cursorWordIndex can be advanced by wall-clock visual callbacks; using it here
    // would cause the pipeline to restart from the wrong word after a stall.
    const startIdx = lastConfirmedAudioWordRef.current;
    const callbackGeneration = kokoroPlaybackGenerationRef.current + 1;
    kokoroPlaybackGenerationRef.current = callbackGeneration;
    const requireExactFirstBoundary = nextKokoroExactStartRef.current === startIdx;
    nextKokoroExactStartRef.current = null;
    kokoroBoundaryGateRef.current = {
      generationId: callbackGeneration,
      startIdx,
      requireExactFirstBoundary,
      firstBoundaryAccepted: false,
      lastAcceptedWordIndex: startIdx - 1,
    };
    if (startIdx >= words.length) {
      if (onSectionEndRef.current) {
        onSectionEndRef.current();
      } else {
        dispatch({ type: "STOP" });
      }
      return;
    }

    kokoroStrategy.speakChunk(
      "", // text not used — pipeline handles its own chunk sizing
      [],
      startIdx,
      s.speed,
      (wordIndex, isTrustedWordTiming = true) => {
        if (kokoroPlaybackGenerationRef.current !== callbackGeneration) return;
        if (stateRef.current.status === "idle") return;
        if (!shouldAcceptKokoroBoundary(wordIndex)) return;
        if (!evalFirstAudioCapturedRef.current && evalStartTimeRef.current != null) {
          evalFirstAudioCapturedRef.current = true;
          emitEvalTrace({
            kind: "lifecycle",
            state: "first-audio",
            wordIndex,
            latencyMs: Math.max(0, Date.now() - evalStartTimeRef.current),
          });
        }
        emitEvalTrace({ kind: "word", source: "audio", wordIndex });
        // TTS-7R (BUG-145c): Update canonical audio position on every scheduler
        // boundary crossing. This must happen before the dispatch so stateRef reads
        // are always behind or equal to the confirmed audio word.
        lastConfirmedAudioWordRef.current = wordIndex;
        stateRef.current = { ...stateRef.current, cursorWordIndex: wordIndex };
        dispatch({ type: "WORD_ADVANCE", wordIndex });
        isTrustedWordTimingRef.current = isTrustedWordTiming;
        if (import.meta.env.DEV) {
          const visualIdx = stateRef.current.cursorWordIndex;
          const delta = wordIndex - visualIdx;
          if (Math.abs(delta) > 5) {
            const words = allWordsRef.current;
            const audioWord = words[wordIndex] ?? "??";
            const visualWord = words[visualIdx] ?? "??";
            console.warn(
              `[TTS-7R] cursor divergence: audio=${wordIndex}("${audioWord}") visual=${visualIdx}("${visualWord}") ` +
              `delta=${delta} trusted=${isTrustedWordTiming}`
            );
          }
        }
      },
      () => {
        if (kokoroPlaybackGenerationRef.current !== callbackGeneration) return;
        kokoroBoundaryGateRef.current = null;
        // TTS-7A: Snapshot on Kokoro narration end (all chunks delivered)
        captureDiagSnapshot();
        // All words exhausted — if section-end callback is set (foliate mode),
        // fire it to advance to next section instead of stopping narration.
        if (onSectionEndRef.current) {
          onSectionEndRef.current();
        } else {
          dispatch({ type: "STOP" });
        }
      },
      () => {
        if (kokoroPlaybackGenerationRef.current !== callbackGeneration) return;
        kokoroBoundaryGateRef.current = null;
        dispatch({ type: "STOP" });
      },
    );
  }, [kokoroStrategy, captureDiagSnapshot, emitEvalTrace, shouldAcceptKokoroBoundary]);

  const speakNextChunkQwen = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "idle") return;
    const words = allWordsRef.current;
    const startIdx = lastConfirmedAudioWordRef.current;
    if (startIdx >= words.length) {
      if (onSectionEndRef.current) {
        onSectionEndRef.current();
      } else {
        dispatch({ type: "STOP" });
      }
      return;
    }

    qwenStrategy.speakChunk(
      "",
      [],
      startIdx,
      s.speed,
      (wordIndex) => {
        emitEvalTrace({ kind: "word", source: "audio", wordIndex });
        lastConfirmedAudioWordRef.current = wordIndex;
        dispatch({ type: "WORD_ADVANCE", wordIndex });
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(wordIndex);
      },
      () => {
        captureDiagSnapshot();
        if (onSectionEndRef.current) {
          onSectionEndRef.current();
        } else {
          dispatch({ type: "STOP" });
        }
      },
      () => {
        dispatch({ type: "STOP" });
      },
    );
  }, [captureDiagSnapshot, emitEvalTrace, qwenStrategy]);

  /** Dispatch to the correct engine's chunk speaker */
  const speakNextChunk = useCallback(() => {
    const s = stateRef.current;
    if (import.meta.env.DEV) console.debug("[narrate] chunk — engine:", s.engine, "kokoro:", s.kokoroReady, "status:", s.status, "cursor:", s.cursorWordIndex);
    handoffPendingRef.current = false;
    if (s.engine === "kokoro" && s.kokoroReady) {
      speakNextChunkKokoro();
    } else if (s.engine === "qwen" && s.qwenReady) {
      speakNextChunkQwen();
    } else if (s.engine === "qwen") {
      const detail =
        qwenError ||
        getQwenStatusError(qwenStatusRef.current) ||
        qwenStatusRef.current.detail ||
        "Qwen runtime is not ready";
      dispatch({ type: "ERROR", message: detail });
      stateRef.current = { ...stateRef.current, status: "error", pauseReason: null };
    } else if (s.engine === "nano" && experimentalNano && nanoStrategyRef.current) {
      speakNextChunkNano();
    } else if (s.engine === "nano") {
      const detail = "MOSS Nano is selected but the experimental Nano strategy is not enabled.";
      dispatch({ type: "ERROR", message: detail });
      stateRef.current = { ...stateRef.current, status: "error", pauseReason: null };
    } else if (s.engine === "pocket-tts") {
      speakNextChunkPocket();
    } else {
      speakNextChunkWeb();
    }
  }, [experimentalNano, qwenError, speakNextChunkKokoro, speakNextChunkNano, speakNextChunkPocket, speakNextChunkQwen, speakNextChunkWeb]);

  // Keep refs in sync for strategy callbacks that need to break circular deps
  speakNextChunkRef.current = speakNextChunk;
  speakNextChunkWebRef.current = speakNextChunkWeb;

  // ── Legacy speak (full text, independent TTS) ────────────────────────
  const speak = useCallback((text: string, startCharOffset = 0, onWord?: (charIndex: number) => void) => {
    if (!window.speechSynthesis) return;
    handoffPendingRef.current = false;
    dispatch({ type: "STOP" });
    window.speechSynthesis.cancel();

    const textToSpeak = text.slice(startCharOffset);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (currentVoice) utterance.voice = currentVoice;
    utterance.rate = state.speed;
    utterance.pitch = 1;
    onWordRef.current = onWord || null;

    utterance.onboundary = (event) => {
      if (event.name === "word" && onWordRef.current) {
        onWordRef.current(startCharOffset + event.charIndex);
      }
    };
    utterance.onend = () => { dispatch({ type: "STOP" }); utteranceRef.current = null; };
    utterance.onerror = () => { dispatch({ type: "STOP" }); utteranceRef.current = null; };

    utteranceRef.current = utterance;
    dispatch({ type: "START_CURSOR_DRIVEN", startIdx: 0, speed: state.speed });
    window.speechSynthesis.speak(utterance);
  }, [currentVoice, state.speed]);

  // ── Cursor-driven start ─────────────────────────────────────────────────

  const startCursorDriven = useCallback((
    words: string[],
    startWordIndex: number,
    wpm: number,
    onWordAdvance: (wordIndex: number) => void
  ): "started" | "warming" | "error" => {
    const nowMs = Date.now();
    const priorStart = lastCursorStartRef.current;
    const currentState = stateRef.current;
    // NARR-FIX-5: Guard against duplicate narrate start requests firing in the same
    // UI burst (button/key double dispatch, stale event replay). Re-entering here
    // tears down the active scheduler and causes audible boundary pops + cursor jumps.
    if (
      currentState.status === "speaking" &&
      priorStart &&
      priorStart.startWordIndex === startWordIndex &&
      priorStart.wordsLength === words.length &&
      nowMs - priorStart.startedAtMs < 1000
    ) {
      onWordAdvanceRef.current = onWordAdvance;
      if (import.meta.env.DEV) {
        console.debug(
          "[narrate] start deduped — ignoring duplicate startCursorDriven at word",
          startWordIndex,
        );
      }
      return "started";
    }

    // Stop any existing playback
    webStrategy.stop();
    kokoroStrategy.stop();
    qwenStrategy.stop();
    nanoStrategyRef.current?.stop();
    pocketStrategyRef.current?.stop();
    clearNanoOwnership();
    clearPocketOwnership();
    setNanoError(null);
    setPocketError(null);
    handoffPendingRef.current = false;
    clearPendingRateResponseTrace();

    allWordsRef.current = words;
    onWordAdvanceRef.current = onWordAdvance;
    isTrustedWordTimingRef.current = true;
    const newSpeed = normalizeNarrationRate(stateRef.current.speed, stateRef.current.engine);
    evalStartTimeRef.current = Date.now();
    evalFirstAudioCapturedRef.current = false;

    dispatch({ type: "STOP" }); // Reset all state first

    // If Kokoro is selected but not ready, enter warming state and wait
    const isKokoro = stateRef.current.engine === "kokoro";
    const isQwen = stateRef.current.engine === "qwen";
    const isNano = stateRef.current.engine === "nano";
    if (isQwen) {
      const detail =
        qwenError ||
        getQwenStatusError(qwenStatusRef.current) ||
        qwenStatusRef.current.detail ||
        "Qwen runtime is not ready";
      if (qwenStatusRef.current.status === "error" || qwenStatusRef.current.status === "unavailable") {
        emitEvalTrace({
          kind: "lifecycle",
          state: "start",
          wordIndex: startWordIndex,
        });
        dispatch({ type: "ERROR", message: detail });
        stateRef.current = {
          ...stateRef.current,
          status: "error",
          pauseReason: null,
          cursorWordIndex: startWordIndex,
          speed: newSpeed,
          chunkStart: startWordIndex,
          chunkWords: [],
        };
        recordDiagEvent("stop", `qwen-unavailable ${detail}`);
        captureDiagSnapshot();
        return "error";
      }

      if (!stateRef.current.qwenReady) {
        emitEvalTrace({
          kind: "lifecycle",
          state: "start",
          wordIndex: startWordIndex,
        });
        dispatch({ type: "QWEN_WARMING", startIdx: startWordIndex, speed: newSpeed });
        stateRef.current = {
          ...stateRef.current,
          status: "warming",
          pauseReason: null,
          cursorWordIndex: startWordIndex,
          speed: newSpeed,
          chunkStart: startWordIndex,
          chunkWords: [],
        };
        lastConfirmedAudioWordRef.current = startWordIndex;
        if (api?.qwenPreload) {
          api.qwenPreload().then((result) => {
            if (!result?.error) return;
            const snapshot = snapshotFromQwenErrorResponse(result, "Qwen runtime is not ready");
            applyQwenStatusSnapshot(snapshot);
            dispatch({ type: "ERROR", message: snapshot.detail || "Qwen runtime is not ready" });
            stateRef.current = {
              ...stateRef.current,
              status: "error",
              pauseReason: null,
              cursorWordIndex: startWordIndex,
              speed: newSpeed,
              chunkStart: startWordIndex,
              chunkWords: [],
            };
          }).catch(() => {
            const snapshot = snapshotFromQwenErrorResponse({
              error: "Qwen runtime check failed",
              status: "error",
              reason: "runtime-check-failed",
              recoverable: true,
            });
            applyQwenStatusSnapshot(snapshot);
            dispatch({ type: "ERROR", message: snapshot.detail || "Qwen runtime check failed" });
            stateRef.current = {
              ...stateRef.current,
              status: "error",
              pauseReason: null,
              cursorWordIndex: startWordIndex,
              speed: newSpeed,
              chunkStart: startWordIndex,
              chunkWords: [],
            };
          });
        }
        return "warming";
      }
    }
    if (isKokoro && !stateRef.current.kokoroReady) {
      emitEvalTrace({
        kind: "lifecycle",
        state: "start",
        wordIndex: startWordIndex,
      });
      dispatch({ type: "KOKORO_WARMING", startIdx: startWordIndex, speed: newSpeed });
      stateRef.current = {
        ...stateRef.current,
        status: "warming",
        pauseReason: null,
        cursorWordIndex: startWordIndex,
        speed: newSpeed,
        chunkStart: startWordIndex,
        chunkWords: [],
      };
      if (import.meta.env.DEV) console.debug("[narrate] warming — waiting for Kokoro, will auto-start from word:", startWordIndex);
      // TTS-7R (BUG-145c): Seed canonical audio ref in warming path too — the
      // auto-start effect reads lastConfirmedAudioWordRef via speakNextChunkKokoro.
      lastConfirmedAudioWordRef.current = startWordIndex;
      // Trigger prewarm if available
      if (api?.kokoroPreload) api.kokoroPreload().catch(() => {});
      return "warming";
    }
    if (isNano && !experimentalNano) {
      const detail = "MOSS Nano is selected but the experimental Nano strategy is not enabled.";
      emitEvalTrace({
        kind: "lifecycle",
        state: "start",
        wordIndex: startWordIndex,
      });
      dispatch({ type: "ERROR", message: detail });
      stateRef.current = {
        ...stateRef.current,
        status: "error",
        pauseReason: null,
        cursorWordIndex: startWordIndex,
        speed: newSpeed,
        chunkStart: startWordIndex,
        chunkWords: [],
      };
      recordDiagEvent("stop", `nano-disabled ${detail}`);
      captureDiagSnapshot();
      return "error";
    }

    dispatch({ type: "START_CURSOR_DRIVEN", startIdx: startWordIndex, speed: newSpeed });
    nanoTraceKeysRef.current.clear();
    if (isNano) {
      emitEvalTrace({ kind: "engine-selection", selectedEngine: "nano", source: "app-settings" });
      emitEvalTrace({ kind: "fallback-policy", policy: "explicit-only", selectedEngine: "nano" });
    }
    if (stateRef.current.engine === "pocket-tts") {
      emitEvalTrace({ kind: "engine-selection", selectedEngine: "pocket-tts", source: "app-settings" });
      emitEvalTrace({ kind: "fallback-policy", policy: "explicit-only", selectedEngine: "pocket-tts" });
    }
    emitEvalTrace({
      kind: "lifecycle",
      state: "start",
      wordIndex: startWordIndex,
      mode: getEvalTraceMode(),
    });

    // speakNextChunk reads from stateRef, but dispatch is async — update stateRef manually
    stateRef.current = {
      ...stateRef.current,
      status: "speaking",
      pauseReason: null,
      cursorWordIndex: startWordIndex,
      speed: newSpeed,
      chunkStart: startWordIndex,
      chunkWords: [],
    };
    if (import.meta.env.DEV) console.debug("[narrate] cursor-driven — words:", words.length, "start:", startWordIndex, "speed:", newSpeed, "engine:", stateRef.current.engine, "kokoro:", stateRef.current.kokoroReady);

    // TTS-7R (BUG-145c): Seed the canonical audio ref so the first Kokoro chunk
    // reads from the correct starting word rather than whatever the ref held before.
    lastConfirmedAudioWordRef.current = startWordIndex;
    lastCursorStartRef.current = {
      startWordIndex,
      wordsLength: words.length,
      startedAtMs: nowMs,
    };

    // TTS-7A: Diagnostics
    recordDiagEvent("start", `engine=${stateRef.current.engine} cursor=${startWordIndex} words=${words.length}`);
    captureDiagSnapshot();

    speakNextChunk();
    return "started";
  }, [qwenError, speakNextChunk, webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace, getEvalTraceMode, clearNanoOwnership, clearPocketOwnership]);

  const resyncToCursor = useCallback((wordIndex: number, wpm: number, pauseReason: PauseReason | null = null) => {
    const s = stateRef.current;
    if (s.status === "idle") return;
    if (pauseReason && s.status === "speaking") {
      dispatch({ type: "PAUSE", reason: pauseReason });
      stateRef.current = { ...stateRef.current, status: "paused", pauseReason };
    }
    webStrategy.stop();
    kokoroStrategy.stop();
    qwenStrategy.stop();
    nanoStrategyRef.current?.stop();
    pocketStrategyRef.current?.stop();
    clearNanoOwnership();
    clearPocketOwnership();
    handoffPendingRef.current = false;
    clearPendingRateResponseTrace();
    const newSpeed = normalizeNarrationRate(stateRef.current.speed, stateRef.current.engine);
    nextKokoroExactStartRef.current = wordIndex;
    syncNarrationCursor(wordIndex, { syncConfirmedAudioAnchor: true });
    if (pauseReason && stateRef.current.status === "paused" && stateRef.current.pauseReason === pauseReason) {
      dispatch({ type: "RESUME" });
    }
    dispatch({ type: "SET_SPEED", speed: newSpeed });
    // Update stateRef for immediate speakNextChunk
    stateRef.current = {
      ...stateRef.current,
      status: "speaking",
      pauseReason: null,
      speed: newSpeed,
      generationId: stateRef.current.generationId + 1,
    };
    speakNextChunk();
  }, [speakNextChunk, webStrategy, kokoroStrategy, qwenStrategy, syncNarrationCursor, clearPendingRateResponseTrace, clearNanoOwnership, clearPocketOwnership]);

  // HOTFIX-6: Replace word array and resync cursor to a global position.
  // Default "passive" mode preserves the existing non-disruptive behavior for cache syncs.
  // "handoff" mode is authoritative: it also re-anchors the confirmed-audio cursor and,
  // when narration is still active, starts a fresh chunk chain from the new global index.
  const updateWords = useCallback((
    words: string[],
    globalStartIdxOrOptions: number | NarrationWordUpdateOptions,
    maybeOptions: NarrationWordUpdateOptions = {},
  ) => {
    const globalStartIdx = typeof globalStartIdxOrOptions === "number"
      ? globalStartIdxOrOptions
      : stateRef.current.cursorWordIndex;
    const options = typeof globalStartIdxOrOptions === "number"
      ? maybeOptions
      : globalStartIdxOrOptions;
    allWordsRef.current = words;
    const isHandoff = options.mode === "handoff";
    const s = syncNarrationCursor(globalStartIdx, { syncConfirmedAudioAnchor: isHandoff });
    if (s.status === "idle") return;
    if (!isHandoff) {
      if (import.meta.env.DEV) console.debug("[narrate] updateWords — swapped to", words.length, "words at global idx", globalStartIdx, "(no restart)");
      return;
    }

    handoffPendingRef.current = true;
    clearPendingRateResponseTrace();
    if (s.status === "speaking" || s.status === "paused") {
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
      nanoStrategyRef.current?.stop();
      nanoStrategyRef.current?.clearCache({ reason: "handoff" });
      pocketStrategyRef.current?.stop();
      pocketStrategyRef.current?.clearCache({ reason: "handoff" });
      clearNanoOwnership();
      clearPocketOwnership();
    }
    if (s.status === "speaking") {
      queueMicrotask(() => {
        const current = stateRef.current;
        if (current.status !== "speaking") return;
        if (current.cursorWordIndex !== globalStartIdx) return;
        if (lastConfirmedAudioWordRef.current !== globalStartIdx) return;
        speakNextChunkRef.current();
      });
    }

    if (import.meta.env.DEV) {
      console.debug(
        "[narrate] updateWords — handoff to",
        words.length,
        "words at global idx",
        globalStartIdx,
        `(restart=${s.status === "speaking"})`,
      );
    }
  }, [syncNarrationCursor, webStrategy, kokoroStrategy, qwenStrategy, clearPendingRateResponseTrace, clearNanoOwnership, clearPocketOwnership]);

  const applyRateChange = useCallback((requestedRate: number, options: { debounceWeb: boolean }) => {
    const current = stateRef.current;
    const nextRate = normalizeNarrationRate(requestedRate, current.engine);
    if (nextRate === current.speed) return;

    const restartKokoroGeneration =
      current.engine === "kokoro" && kokoroBucketChanged(current.speed, nextRate);

    dispatch({ type: "SET_SPEED", speed: nextRate });
    // Mirror reducer speed changes synchronously for strategy getters and restart paths.
    stateRef.current = {
      ...stateRef.current,
      speed: nextRate,
      generationId: stateRef.current.generationId + 1,
    };

    const updated = stateRef.current;
    if (updated.status === "idle") return;
    const canAutoPause = updated.status === "speaking";

    if (updated.engine === "kokoro") {
      if (rateDebounceRef.current) {
        clearTimeout(rateDebounceRef.current);
        rateDebounceRef.current = null;
      }

      if (restartKokoroGeneration) {
        clearPendingRateResponseTrace();
        if (canAutoPause) {
          dispatch({ type: "PAUSE", reason: "rate-change" });
          stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "rate-change" };
        }
        kokoroStrategy.stop();
        if (canAutoPause && stateRef.current.status === "paused" && stateRef.current.pauseReason === "rate-change") {
          dispatch({ type: "RESUME" });
          stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
        }
        speakNextChunk();
        return;
      }

      if (import.meta.env.DEV) {
        const ratePlan = resolveKokoroRatePlan(nextRate);
        console.debug(
          "[narrate] Kokoro rate update — live tempo",
          "speed:",
          ratePlan.selectedSpeed,
          "bucket:",
          ratePlan.generationBucket,
          "tempo:",
          ratePlan.tempoFactor,
        );
      }
      pendingRateResponseTraceRef.current =
        updated.status === "speaking"
          ? {
              requestedAt: Date.now(),
              fromRate: current.speed,
              toRate: nextRate,
              context: "same-bucket-segmented-live-rate",
            }
          : null;
      kokoroStrategy.refreshBufferedTempo();
      return;
    }

    if (updated.engine === "qwen") {
      if (rateDebounceRef.current) {
        clearTimeout(rateDebounceRef.current);
        rateDebounceRef.current = null;
      }
      if (canAutoPause) {
        dispatch({ type: "PAUSE", reason: "rate-change" });
        stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "rate-change" };
      }
      qwenStrategy.stop();
      if (canAutoPause && stateRef.current.status === "paused" && stateRef.current.pauseReason === "rate-change") {
        dispatch({ type: "RESUME" });
        stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      }
      speakNextChunk();
      return;
    }

    clearPendingRateResponseTrace();
    if (experimentalNano && nanoStrategyRef.current && !nanoActiveRef.current) {
      return;
    }
    if (pocketActiveRef.current && pocketStrategyRef.current) {
      if (canAutoPause) {
        dispatch({ type: "PAUSE", reason: "rate-change" });
        stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "rate-change" };
      }
      pocketStrategyRef.current.stop();
      clearPocketOwnership();
      if (canAutoPause && stateRef.current.status === "paused" && stateRef.current.pauseReason === "rate-change") {
        dispatch({ type: "RESUME" });
        stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      }
      speakNextChunk();
      return;
    }
    if (nanoActiveRef.current && nanoStrategyRef.current) {
      if (rateDebounceRef.current) {
        clearTimeout(rateDebounceRef.current);
        rateDebounceRef.current = null;
      }
      if (canAutoPause) {
        dispatch({ type: "PAUSE", reason: "rate-change" });
        stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "rate-change" };
      }
      nanoStrategyRef.current.stop();
      clearNanoOwnership();
      if (canAutoPause && stateRef.current.status === "paused" && stateRef.current.pauseReason === "rate-change") {
        dispatch({ type: "RESUME" });
        stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      }
      speakNextChunk();
      return;
    }

    if (!options.debounceWeb) {
      if (canAutoPause) {
        dispatch({ type: "PAUSE", reason: "rate-change" });
        stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "rate-change" };
      }
      webStrategy.stop();
      if (canAutoPause && stateRef.current.status === "paused" && stateRef.current.pauseReason === "rate-change") {
        dispatch({ type: "RESUME" });
        stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      }
      speakNextChunk();
      return;
    }

    if (canAutoPause) {
      dispatch({ type: "PAUSE", reason: "rate-change" });
      stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "rate-change" };
    }
    if (rateDebounceRef.current) clearTimeout(rateDebounceRef.current);
    rateDebounceRef.current = setTimeout(() => {
      rateDebounceRef.current = null;
      webStrategy.stop();
      if (stateRef.current.status === "paused" && stateRef.current.pauseReason === "rate-change") {
        dispatch({ type: "RESUME" });
        stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      }
      speakNextChunk();
    }, TTS_RATE_RESTART_DEBOUNCE_MS);
  }, [speakNextChunk, webStrategy, kokoroStrategy, qwenStrategy, clearPendingRateResponseTrace, experimentalNano, clearNanoOwnership, clearPocketOwnership]);

  const updateWpm = useCallback((wpm: number) => {
    applyRateChange(wpmToRate(wpm), { debounceWeb: false });
  }, [applyRateChange]);

  const pause = useCallback((reason: PauseReason = "user-stop") => {
    const s = stateRef.current;
    if (s.status !== "speaking") return;
    clearPendingRateResponseTrace();
    if (pocketActiveRef.current && pocketStrategyRef.current) {
      pocketStrategyRef.current.pause();
    } else if (nanoActiveRef.current && nanoStrategyRef.current) {
      nanoStrategyRef.current.pause();
    } else if (s.engine === "kokoro") {
      kokoroStrategy.pause();
    } else if (s.engine === "qwen") {
      qwenStrategy.pause();
    } else {
      webStrategy.pause();
    }
    dispatch({ type: "PAUSE", reason });
    stateRef.current = { ...stateRef.current, status: "paused", pauseReason: reason };
    emitEvalTrace({
      kind: "lifecycle",
      state: "pause",
      wordIndex: s.cursorWordIndex,
      mode: getEvalTraceMode(),
    });
    // TTS-7A: Diagnostics
    recordDiagEvent("pause", `cursor=${s.cursorWordIndex}`);
    captureDiagSnapshot();
  }, [webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace, getEvalTraceMode, clearPendingRateResponseTrace]);

  const resume = useCallback((currentWordIndex?: number) => {
    const s = stateRef.current;

    // TTS-7B: If caller provides a cursor position that differs from where
    // we paused, the user moved the cursor during pause — resync instead of bare resume.
    if (currentWordIndex != null && currentWordIndex !== s.cursorWordIndex) {
      // Stop current strategies, resync to new position
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
      nanoStrategyRef.current?.stop();
      pocketStrategyRef.current?.stop();
      clearNanoOwnership();
      clearPocketOwnership();
      handoffPendingRef.current = false;
      clearPendingRateResponseTrace();
      const newSpeed = s.speed;
      dispatch({ type: "START_CURSOR_DRIVEN", startIdx: currentWordIndex, speed: newSpeed });
      stateRef.current = {
        ...stateRef.current,
        status: "speaking",
        pauseReason: null,
        cursorWordIndex: currentWordIndex,
        speed: newSpeed,
        chunkStart: currentWordIndex,
        chunkWords: [],
      };
      recordDiagEvent("resume", `resync cursor=${currentWordIndex} (was ${s.cursorWordIndex})`);
      captureDiagSnapshot();
      emitEvalTrace({
        kind: "lifecycle",
        state: "resume",
        wordIndex: currentWordIndex,
        mode: getEvalTraceMode(),
      });
      lastConfirmedAudioWordRef.current = currentWordIndex;
      speakNextChunkRef.current();
      return;
    }

    if (handoffPendingRef.current) {
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
      nanoStrategyRef.current?.stop();
      pocketStrategyRef.current?.stop();
      clearNanoOwnership();
      clearPocketOwnership();
      clearPendingRateResponseTrace();
      lastConfirmedAudioWordRef.current = s.cursorWordIndex;
      dispatch({ type: "RESUME" });
      stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      emitEvalTrace({
        kind: "lifecycle",
        state: "resume",
        wordIndex: s.cursorWordIndex,
        mode: getEvalTraceMode(),
      });
      recordDiagEvent("resume", `handoff cursor=${s.cursorWordIndex}`);
      captureDiagSnapshot();
      speakNextChunkRef.current();
      return;
    }

    // Bare resume from pause point
    clearPendingRateResponseTrace();
    if (pocketActiveRef.current && pocketStrategyRef.current) {
      pocketStrategyRef.current.resume();
    } else if (nanoActiveRef.current && nanoStrategyRef.current) {
      nanoStrategyRef.current.resume();
    } else if (s.engine === "kokoro") {
      kokoroStrategy.resume();
    } else if (s.engine === "qwen") {
      qwenStrategy.resume();
    } else {
      webStrategy.resume();
    }
    dispatch({ type: "RESUME" });
    stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
    emitEvalTrace({
      kind: "lifecycle",
      state: "resume",
      wordIndex: s.cursorWordIndex,
      mode: getEvalTraceMode(),
    });
    // TTS-7A: Diagnostics
    recordDiagEvent("resume", `cursor=${s.cursorWordIndex}`);
    captureDiagSnapshot();
  }, [webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace, getEvalTraceMode, clearPendingRateResponseTrace, clearNanoOwnership, clearPocketOwnership]);

  const stop = useCallback((reason: PauseReason = "user-stop") => {
    if (stateRef.current.status === "speaking" || stateRef.current.status === "holding" || stateRef.current.status === "warming") {
      dispatch({ type: "PAUSE", reason });
      stateRef.current = { ...stateRef.current, status: "paused", pauseReason: reason };
    }
    // TTS-7A: Diagnostics
    recordDiagEvent("stop", `cursor=${stateRef.current.cursorWordIndex}`);
    captureDiagSnapshot();
    emitEvalTrace({
      kind: "lifecycle",
      state: "stop",
      wordIndex: stateRef.current.cursorWordIndex,
      mode: getEvalTraceMode(),
    });
    clearPendingRateResponseTrace();
    webStrategy.stop();
    kokoroStrategy.stop();
    qwenStrategy.stop();
    nanoStrategyRef.current?.stop();
    pocketStrategyRef.current?.stop();
    clearNanoOwnership();
    clearPocketOwnership();
    handoffPendingRef.current = false;
    dispatch({ type: "STOP" });
    stateRef.current = { ...stateRef.current, status: "idle", pauseReason: null, chunkStart: 0, chunkWords: [] };
  }, [webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace, getEvalTraceMode, clearPendingRateResponseTrace, clearNanoOwnership, clearPocketOwnership]);

  const seekToWordIndex = useCallback((targetWordIndex: number, reason?: "forward-seek" | "backward-seek") => {
    const words = allWordsRef.current;
    if (words.length === 0) return;
    const clampedTarget = Math.max(0, Math.min(targetWordIndex, words.length - 1));
    const current = stateRef.current;
    if (clampedTarget === current.cursorWordIndex) return;
    const currentWpm = current.speed * TTS_RATE_BASELINE_WPM;
    const resolvedReason =
      reason
      ?? (clampedTarget >= current.cursorWordIndex ? "forward-seek" : "backward-seek");
    resyncToCursor(clampedTarget, currentWpm, resolvedReason);
  }, [resyncToCursor]);

  const handleMediaPlay = useCallback(() => {
    const status = stateRef.current.status;
    if (status === "paused" || status === "holding") {
      resume();
    }
  }, [resume]);

  const handleMediaPause = useCallback(() => {
    if (stateRef.current.status === "speaking") {
      pause("user-stop");
    }
  }, [pause]);

  const handleMediaStop = useCallback(() => {
    const status = stateRef.current.status;
    if (status !== "idle" && status !== "error") {
      stop();
    }
  }, [stop]);

  const handleMediaNextTrack = useCallback(() => {
    const words = allWordsRef.current;
    if (words.length === 0) return;
    const target = findNextSentenceStart(words, stateRef.current.cursorWordIndex);
    seekToWordIndex(target, "forward-seek");
  }, [seekToWordIndex]);

  const handleMediaPreviousTrack = useCallback(() => {
    const words = allWordsRef.current;
    if (words.length === 0) return;
    const target = findPreviousSentenceStart(words, stateRef.current.cursorWordIndex);
    seekToWordIndex(target, "backward-seek");
  }, [seekToWordIndex]);

  useEffect(() => {
    syncMediaSession({
      book: mediaSessionBook,
      status: state.status,
      pauseReason: state.pauseReason,
      handlers: {
        onPlay: handleMediaPlay,
        onPause: handleMediaPause,
        onStop: handleMediaStop,
        onNextTrack: handleMediaNextTrack,
        onPreviousTrack: handleMediaPreviousTrack,
      },
    });
  }, [
    mediaSessionBook,
    state.status,
    state.pauseReason,
    handleMediaPlay,
    handleMediaPause,
    handleMediaStop,
    handleMediaNextTrack,
    handleMediaPreviousTrack,
  ]);

  const hold = useCallback(() => { dispatch({ type: "HOLD" }); }, []);

  const resumeChaining = useCallback(() => {
    dispatch({ type: "RESUME_CHAINING" });
    const s = stateRef.current;
    if (s.status === "holding") {
      stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
      speakNextChunk();
    }
  }, [speakNextChunk]);

  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    const current = stateRef.current;
    const shouldRestart = current.engine === "web"
      && current.status === "speaking"
      && currentVoice?.name !== voice.name;
    setCurrentVoice(voice);
    if (!shouldRestart) return;
    dispatch({ type: "PAUSE", reason: "voice-change" });
    stateRef.current = { ...stateRef.current, status: "paused", pauseReason: "voice-change" };
    clearPendingRateResponseTrace();
    webStrategy.stop();
    dispatch({ type: "RESUME" });
    stateRef.current = { ...stateRef.current, status: "speaking", pauseReason: null };
    speakNextChunkRef.current();
  }, [clearPendingRateResponseTrace, currentVoice, webStrategy]);

  const adjustRate = useCallback((newRate: number) => {
    applyRateChange(newRate, { debounceWeb: true });
  }, [applyRateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
      nanoStrategyRef.current?.stop();
      pocketStrategyRef.current?.stop();
      clearNanoOwnership();
      clearPocketOwnership();
    };
  }, [webStrategy, kokoroStrategy, qwenStrategy, clearNanoOwnership, clearPocketOwnership]);

  // Referentially stable: useNarrationSync's MediaSession effect lists this in its
  // dependency array. An inline identity here re-runs that effect every render,
  // and its setMediaSessionBookState call then loops ("Maximum update depth").
  const setMediaSessionBook = useCallback((book: MediaSessionBookMetadata | null) => {
    if (!book || !book.title.trim()) {
      setMediaSessionBookState(null);
      return;
    }
    setMediaSessionBookState({
      title: book.title,
      author: book.author ?? null,
      coverArtUrl: book.coverArtUrl ?? null,
    });
  }, []);

  return {
    speaking: state.status === "speaking" || state.status === "holding",
    warming: state.status === "warming",
    status: state.status,
    pauseReason: state.pauseReason,
    cursorWordIndex: state.cursorWordIndex,
    voices,
    currentVoice,
    rate: state.speed,
    kokoroReady: state.kokoroReady,
    kokoroDownloading: state.kokoroDownloading,
    kokoroDownloadProgress: state.kokoroDownloadProgress,
    kokoroVoices,
    kokoroLoading: kokoroStatus.loading,
    kokoroStatus,
    kokoroError,
    qwenStatus,
    qwenError,
    nanoError,
    pocketError,
    speak,
    startCursorDriven,
    resyncToCursor,
    updateWords,
    updateWpm,
    pause,
    resume,
    stop,
    hold,
    resumeChaining,
    selectVoice,
    adjustRate,
    setEngine,
    setKokoroVoice,
    setQwenVoice,
    setPageEndWord,
    downloadKokoroModel,
    setRhythmPauses: (pauses: RhythmPauses | null, paragraphBreaks?: Set<number>) => {
      rhythmPausesRef.current = pauses;
      if (paragraphBreaks) paragraphBreaksRef.current = paragraphBreaks;
    },
    setPauseConfig: (config: PauseConfig) => {
      pauseConfigRef.current = config;
    },
    setFootnoteMode: (mode: "skip" | "read") => {
      footnoteModeRef.current = mode;
    },
    setFootnoteCues: (cues: FootnoteCue[]) => {
      footnoteCuesRef.current = cues;
    },
    setOnSectionEnd: (cb: (() => void) | null) => {
      onSectionEndRef.current = cb;
    },
    setBookId: (id: string) => {
      bookIdRef.current = id;
    },
    setMediaSessionBook,
    setPronunciationOverrides: (overrides: PronunciationOverride[]) => {
      globalOverridesRef.current = overrides;
      updateMergedOverrides();
    },
    setBookPronunciationOverrides: (overrides: PronunciationOverride[]) => {
      bookOverridesRef.current = overrides;
      updateMergedOverrides();
    },
    /**
     * Register a visual-only word-boundary callback for scheduler-authoritative highlight updates.
     * The callback must ONLY update visual state — it must NOT write narration anchors.
     */
    setOnTruthSync: (cb: ((wordIndex: number) => void) | null) => {
      onTruthSyncRef.current = cb;
    },
    /**
     * TTS-7Q: Register a visual-only chunk-boundary callback. Called when a Kokoro
     * generation chunk boundary is reached during playback. The callback is intended
     * for narration chunk-visual progress UI updates only.
     */
    setOnChunkBoundary: (cb: ((endIdx: number, metadata?: ChunkBoundaryPayload) => void) | null) => {
      onChunkBoundaryRef.current = cb;
    },
    /**
     * Register a visual-only audio segment-start callback. This is chunk-level
     * playback truth and must not mutate narration read-head anchors.
     */
    setOnSegmentStart: (cb: ((wordIndex: number) => void) | null) => {
      onSegmentStartRef.current = cb;
    },
    resolveHighlightSync,
    exportNarrationDiagnosticsBundle,
    warmUp: () => {
      kokoroStrategy.warmUp();
    },
    /**
     * TTS-7Q: Get continuous audio progress for Kokoro playback.
     * Returns null for Web Speech (no audio-clock model) or when not playing.
     * Visual overlay code should poll this in its RAF loop to drive smooth interpolation.
     * IMPORTANT: The returned wordIndex is the canonical audio cursor.
     * Do NOT write it back to pause anchors or saved progress — use the narration
     * state's cursorWordIndex for those operations.
     */
    getAudioProgress: (): AudioProgressReport | null => {
      const s = stateRef.current;
      if (s.status !== "speaking") return null;
      if (s.engine === "kokoro") {
        return kokoroStrategyRef.current?.getAudioProgress?.() ?? null;
      }
      if (s.engine === "qwen") {
        return qwenStrategyRef.current?.getAudioProgress?.() ?? null;
      }
      if (pocketActiveRef.current) {
        return pocketStrategyRef.current?.getAudioProgress?.() ?? null;
      }
      if (nanoActiveRef.current) {
        return nanoStrategyRef.current?.getAudioProgress?.() ?? null;
      }
      return null;
    },
  };
}

import { useState, useRef, useCallback, useEffect, useReducer, useMemo } from "react";
import { QWEN_DEFAULT_SPEAKER, TTS_CHUNK_SIZE, TTS_MAX_RATE, TTS_MIN_RATE, TTS_RATE_BASELINE_WPM, TTS_RATE_RESTART_DEBOUNCE_MS, resolveKokoroBucket } from "../constants";
import { applyPronunciationOverrides, mergeOverrides } from "../utils/pronunciationOverrides";
import type { KokoroStatusSnapshot, PronunciationOverride, QwenStatusSnapshot, TtsEngine } from "../types";
import type { RhythmPauses } from "../types";
import { isSentenceEnd, type PauseConfig, DEFAULT_PAUSE_CONFIG } from "../utils/pauseDetection";
import { NarrationState as ReducerState, NarrationAction, narrationReducer, createInitialNarrationState } from "../types/narration";
import { createWebSpeechStrategy } from "./narration/webSpeechStrategy";
import { createKokoroStrategy } from "./narration/kokoroStrategy";
import { createQwenStrategy } from "./narration/qwenStrategy";
import { createQwenStreamingStrategy } from "./narration/qwenStreamingStrategy";
import { selectPreferredVoice } from "../utils/voiceSelection";
import { recordSnapshot, recordDiagEvent } from "../utils/narrateDiagnostics";
import type { AudioProgressReport } from "../utils/audioScheduler";
import type { TtsEvalTraceSink } from "../types/eval";
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

export interface FootnoteCue {
  afterWordIdx: number;
  text: string;
}

export interface NarrationState {
  speaking: boolean;
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
  // Still no boundary — use the chunk size limit
  return maxEnd;
}

const api = window.electronAPI;

interface UseNarrationOptions {
  evalTrace?: TtsEvalTraceSink | null;
}

export interface NarrationWordUpdateOptions {
  mode?: "passive" | "handoff";
}

export default function useNarration(options: UseNarrationOptions = {}) {
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
  /** QWEN-STREAM-2: true when the streaming sidecar reported ready:true on mount. */
  const qwenStreamingReadyRef = useRef<boolean>(false);

  // ── Refs that need synchronous access ──────────────────────────────────
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onWordRef = useRef<((charIndex: number) => void) | null>(null);
  const allWordsRef = useRef<string[]>([]);
  const onWordAdvanceRef = useRef<((wordIndex: number) => void) | null>(null);
  /** TTS-7R: Visual-only truth-sync callback — highlights the word at the scheduler's
   *  authoritative position without updating narration state (no cursorWordIndex write,
   *  no lastConfirmedAudioWordRef update). Set by useReadingModeInstance for Foliate mode. */
  const onTruthSyncRef = useRef<((wordIndex: number) => void) | null>(null);
  /** TTS-7R (BUG-145c): Canonical audio word position — updated only by the scheduler's
   *  confirmed boundary crossings. Used as the authoritative start index for chunk generation
   *  so that visual-advance callbacks cannot contaminate the pipeline's read head. */
  const lastConfirmedAudioWordRef = useRef<number>(0);
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
  const pendingRateResponseTraceRef = useRef<{
    requestedAt: number;
    fromRate: number;
    toRate: number;
    context: string;
  } | null>(null);
  evalTraceRef.current = options.evalTrace ?? null;

  const emitEvalTrace = useCallback((event: Parameters<NonNullable<TtsEvalTraceSink>["record"]>[0]) => {
    if (!evalTraceRef.current?.enabled) return;
    evalTraceRef.current.record(event);
  }, []);

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
      engine: s.engine as "web" | "kokoro" | "qwen" | null,
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
      onSegmentStart: () => {
        emitPendingRateResponseTrace();
      },
      // TTS-7R: Route truth-sync through dedicated visual-only callback (no state writes)
      onTruthSync: (wordIndex: number) => {
        if (onTruthSyncRef.current) onTruthSyncRef.current(wordIndex);
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
    [], // stable — all deps accessed via refs/getters
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
          stateRef.current = { ...stateRef.current, status: "error" };
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
      stateRef.current = { ...stateRef.current, status: "speaking" };
      speakNextChunkRef.current();
    }
  }, [state.kokoroReady]);

  useEffect(() => {
    if (!state.qwenReady) return;
    const s = stateRef.current;
    if (s.status === "warming" && s.engine === "qwen") {
      dispatch({ type: "START_CURSOR_DRIVEN", startIdx: s.cursorWordIndex, speed: s.speed });
      stateRef.current = { ...stateRef.current, status: "speaking" };
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
      dispatch({ type: "STOP" });
      stateRef.current = {
        ...stateRef.current,
        status: "idle",
        chunkStart: 0,
        chunkWords: [],
      };
    }

    dispatch({ type: "SET_ENGINE", engine });
    stateRef.current = {
      ...stateRef.current,
      engine,
    };
  }, [clearPendingRateResponseTrace, kokoroStrategy, qwenStrategy, webStrategy]);

  /** Set the max word index for the current page — chunks won't cross this boundary */
  const setPageEndWord = useCallback((endIdx: number | null) => {
    dispatch({ type: "SET_PAGE_END", endIdx });
  }, []);

  /** Set Kokoro voice ID */
  const setKokoroVoice = useCallback((voiceId: string) => {
    kokoroVoiceRef.current = voiceId;
  }, []);

  /** Set Qwen speaker ID */
  const setQwenVoice = useCallback((speakerId: string) => {
    qwenSpeakerRef.current = speakerId || QWEN_DEFAULT_SPEAKER;
  }, []);

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

  /** Speak using the Kokoro strategy (delegates to NAR-2 pipeline + scheduler). */
  const speakNextChunkKokoro = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "idle") return;
    const words = allWordsRef.current;
    // TTS-7R (BUG-145c): Read from audio-confirmed ref, NOT cursorWordIndex.
    // cursorWordIndex can be advanced by wall-clock visual callbacks; using it here
    // would cause the pipeline to restart from the wrong word after a stall.
    const startIdx = lastConfirmedAudioWordRef.current;
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
      (wordIndex) => {
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
        dispatch({ type: "WORD_ADVANCE", wordIndex });
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(wordIndex);
        if (import.meta.env.DEV) {
          const visualIdx = stateRef.current.cursorWordIndex;
          if (Math.abs(wordIndex - visualIdx) > 5) {
            console.warn(`[TTS-7R] cursor divergence: audio=${wordIndex} visual=${visualIdx} delta=${wordIndex - visualIdx}`);
          }
        }
      },
      () => {
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
        dispatch({ type: "STOP" });
      },
    );
  }, [kokoroStrategy, captureDiagSnapshot, emitEvalTrace]);

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
      stateRef.current = { ...stateRef.current, status: "error" };
    } else {
      speakNextChunkWeb();
    }
  }, [qwenError, speakNextChunkKokoro, speakNextChunkQwen, speakNextChunkWeb]);

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
    // Stop any existing playback
    webStrategy.stop();
    kokoroStrategy.stop();
    qwenStrategy.stop();
    handoffPendingRef.current = false;
    clearPendingRateResponseTrace();

    allWordsRef.current = words;
    onWordAdvanceRef.current = onWordAdvance;
    const newSpeed = wpmToRate(wpm);
    evalStartTimeRef.current = Date.now();
    evalFirstAudioCapturedRef.current = false;

    dispatch({ type: "STOP" }); // Reset all state first

    // If Kokoro is selected but not ready, enter warming state and wait
    const isKokoro = stateRef.current.engine === "kokoro";
    const isQwen = stateRef.current.engine === "qwen";
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

    dispatch({ type: "START_CURSOR_DRIVEN", startIdx: startWordIndex, speed: newSpeed });
    emitEvalTrace({
      kind: "lifecycle",
      state: "start",
      wordIndex: startWordIndex,
    });

    // speakNextChunk reads from stateRef, but dispatch is async — update stateRef manually
    stateRef.current = {
      ...stateRef.current,
      status: "speaking",
      cursorWordIndex: startWordIndex,
      speed: newSpeed,
      chunkStart: startWordIndex,
      chunkWords: [],
    };
    if (import.meta.env.DEV) console.debug("[narrate] cursor-driven — words:", words.length, "start:", startWordIndex, "speed:", newSpeed, "engine:", stateRef.current.engine, "kokoro:", stateRef.current.kokoroReady);

    // TTS-7R (BUG-145c): Seed the canonical audio ref so the first Kokoro chunk
    // reads from the correct starting word rather than whatever the ref held before.
    lastConfirmedAudioWordRef.current = startWordIndex;

    // TTS-7A: Diagnostics
    recordDiagEvent("start", `engine=${stateRef.current.engine} cursor=${startWordIndex} words=${words.length}`);
    captureDiagSnapshot();

    speakNextChunk();
    return "started";
  }, [qwenError, speakNextChunk, webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace]);

  const resyncToCursor = useCallback((wordIndex: number, wpm: number) => {
    const s = stateRef.current;
    if (s.status === "idle") return;
    webStrategy.stop();
    kokoroStrategy.stop();
    qwenStrategy.stop();
    handoffPendingRef.current = false;
    clearPendingRateResponseTrace();
    const newSpeed = wpmToRate(wpm);
    syncNarrationCursor(wordIndex, { syncConfirmedAudioAnchor: true });
    dispatch({ type: "SET_SPEED", speed: newSpeed });
    // Update stateRef for immediate speakNextChunk
    stateRef.current = { ...stateRef.current, speed: newSpeed, generationId: stateRef.current.generationId + 1 };
    speakNextChunk();
  }, [speakNextChunk, webStrategy, kokoroStrategy, qwenStrategy, syncNarrationCursor, clearPendingRateResponseTrace]);

  // HOTFIX-6: Replace word array and resync cursor to a global position.
  // Default "passive" mode preserves the existing non-disruptive behavior for cache syncs.
  // "handoff" mode is authoritative: it also re-anchors the confirmed-audio cursor and,
  // when narration is still active, starts a fresh chunk chain from the new global index.
  const updateWords = useCallback((
    words: string[],
    globalStartIdx: number,
    options: NarrationWordUpdateOptions = {},
  ) => {
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
  }, [syncNarrationCursor, webStrategy, kokoroStrategy, qwenStrategy, clearPendingRateResponseTrace]);

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

    if (updated.engine === "kokoro") {
      if (rateDebounceRef.current) {
        clearTimeout(rateDebounceRef.current);
        rateDebounceRef.current = null;
      }

      if (restartKokoroGeneration) {
        clearPendingRateResponseTrace();
        kokoroStrategy.stop();
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
      qwenStrategy.stop();
      speakNextChunk();
      return;
    }

    clearPendingRateResponseTrace();
    if (!options.debounceWeb) {
      webStrategy.stop();
      speakNextChunk();
      return;
    }

    if (rateDebounceRef.current) clearTimeout(rateDebounceRef.current);
    rateDebounceRef.current = setTimeout(() => {
      rateDebounceRef.current = null;
      webStrategy.stop();
      speakNextChunk();
    }, TTS_RATE_RESTART_DEBOUNCE_MS);
  }, [speakNextChunk, webStrategy, kokoroStrategy, qwenStrategy, clearPendingRateResponseTrace]);

  const updateWpm = useCallback((wpm: number) => {
    applyRateChange(wpmToRate(wpm), { debounceWeb: false });
  }, [applyRateChange]);

  const pause = useCallback(() => {
    const s = stateRef.current;
    clearPendingRateResponseTrace();
    if (s.engine === "kokoro") {
      kokoroStrategy.pause();
    } else if (s.engine === "qwen") {
      qwenStrategy.pause();
    } else {
      webStrategy.pause();
    }
    dispatch({ type: "PAUSE" });
    stateRef.current = { ...stateRef.current, status: "paused" };
    emitEvalTrace({
      kind: "lifecycle",
      state: "pause",
      wordIndex: s.cursorWordIndex,
    });
    // TTS-7A: Diagnostics
    recordDiagEvent("pause", `cursor=${s.cursorWordIndex}`);
    captureDiagSnapshot();
  }, [webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace, clearPendingRateResponseTrace]);

  const resume = useCallback((currentWordIndex?: number) => {
    const s = stateRef.current;

    // TTS-7B: If caller provides a cursor position that differs from where
    // we paused, the user moved the cursor during pause — resync instead of bare resume.
    if (currentWordIndex != null && currentWordIndex !== s.cursorWordIndex) {
      // Stop current strategies, resync to new position
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
      handoffPendingRef.current = false;
      clearPendingRateResponseTrace();
      const newSpeed = s.speed;
      dispatch({ type: "START_CURSOR_DRIVEN", startIdx: currentWordIndex, speed: newSpeed });
      stateRef.current = {
        ...stateRef.current,
        status: "speaking",
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
      });
      lastConfirmedAudioWordRef.current = currentWordIndex;
      speakNextChunkRef.current();
      return;
    }

    if (handoffPendingRef.current) {
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
      clearPendingRateResponseTrace();
      lastConfirmedAudioWordRef.current = s.cursorWordIndex;
      dispatch({ type: "RESUME" });
      stateRef.current = { ...stateRef.current, status: "speaking" };
      emitEvalTrace({
        kind: "lifecycle",
        state: "resume",
        wordIndex: s.cursorWordIndex,
      });
      recordDiagEvent("resume", `handoff cursor=${s.cursorWordIndex}`);
      captureDiagSnapshot();
      speakNextChunkRef.current();
      return;
    }

    // Bare resume from pause point
    clearPendingRateResponseTrace();
    if (s.engine === "kokoro") {
      kokoroStrategy.resume();
    } else if (s.engine === "qwen") {
      qwenStrategy.resume();
    } else {
      webStrategy.resume();
    }
    dispatch({ type: "RESUME" });
    stateRef.current = { ...stateRef.current, status: "speaking" };
    emitEvalTrace({
      kind: "lifecycle",
      state: "resume",
      wordIndex: s.cursorWordIndex,
    });
    // TTS-7A: Diagnostics
    recordDiagEvent("resume", `cursor=${s.cursorWordIndex}`);
    captureDiagSnapshot();
  }, [webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace, clearPendingRateResponseTrace]);

  const stop = useCallback(() => {
    // TTS-7A: Diagnostics
    recordDiagEvent("stop", `cursor=${stateRef.current.cursorWordIndex}`);
    captureDiagSnapshot();
    emitEvalTrace({
      kind: "lifecycle",
      state: "stop",
      wordIndex: stateRef.current.cursorWordIndex,
    });
    clearPendingRateResponseTrace();
    webStrategy.stop();
    kokoroStrategy.stop();
    qwenStrategy.stop();
    handoffPendingRef.current = false;
    dispatch({ type: "STOP" });
  }, [webStrategy, kokoroStrategy, qwenStrategy, captureDiagSnapshot, emitEvalTrace, clearPendingRateResponseTrace]);

  const hold = useCallback(() => { dispatch({ type: "HOLD" }); }, []);

  const resumeChaining = useCallback(() => {
    dispatch({ type: "RESUME_CHAINING" });
    const s = stateRef.current;
    if (s.status === "holding") {
      stateRef.current = { ...stateRef.current, status: "speaking" };
      speakNextChunk();
    }
  }, [speakNextChunk]);

  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  const adjustRate = useCallback((newRate: number) => {
    applyRateChange(newRate, { debounceWeb: true });
  }, [applyRateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webStrategy.stop();
      kokoroStrategy.stop();
      qwenStrategy.stop();
    };
  }, [webStrategy, kokoroStrategy, qwenStrategy]);

  return {
    speaking: state.status === "speaking" || state.status === "holding",
    warming: state.status === "warming",
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
    setPronunciationOverrides: (overrides: PronunciationOverride[]) => {
      globalOverridesRef.current = overrides;
      updateMergedOverrides();
    },
    setBookPronunciationOverrides: (overrides: PronunciationOverride[]) => {
      bookOverridesRef.current = overrides;
      updateMergedOverrides();
    },
    /**
     * TTS-7R: Register a visual-only truth-sync callback. Called every ~12 words by the
     * audio scheduler to re-snap the narration overlay to the authoritative audio position.
     * The callback must ONLY update visual state — it must NOT write to cursorWordIndex
     * or any narration anchor used by chunk generation.
     */
    setOnTruthSync: (cb: ((wordIndex: number) => void) | null) => {
      onTruthSyncRef.current = cb;
    },
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
      return null;
    },
  };
}

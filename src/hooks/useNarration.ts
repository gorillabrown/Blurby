import { useState, useRef, useCallback, useEffect, useReducer, useMemo } from "react";
import { TTS_CHUNK_SIZE, TTS_MAX_RATE, TTS_MIN_RATE, TTS_RATE_BASELINE_WPM, TTS_RATE_RESTART_DEBOUNCE_MS, resolveKokoroBucket } from "../constants";
import { applyPronunciationOverrides, mergeOverrides } from "../utils/pronunciationOverrides";
import type { PronunciationOverride } from "../types";
import type { RhythmPauses } from "../types";
import { isSentenceEnd, type PauseConfig, DEFAULT_PAUSE_CONFIG } from "../utils/pauseDetection";
import { NarrationState as ReducerState, NarrationAction, narrationReducer, createInitialNarrationState } from "../types/narration";
import { createWebSpeechStrategy } from "./narration/webSpeechStrategy";
import { createKokoroStrategy } from "./narration/kokoroStrategy";
import { selectPreferredVoice } from "../utils/voiceSelection";
import { recordSnapshot, recordDiagEvent } from "../utils/narrateDiagnostics";
import type { AudioProgressReport } from "../utils/audioScheduler";

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
}

type TtsEngine = "web" | "kokoro";

/** Calculate TTS rate from WPM. TTS_RATE_BASELINE_WPM = rate 1.0, scale linearly. */
function wpmToRate(wpm: number): number {
  const rate = wpm / TTS_RATE_BASELINE_WPM;
  return Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, rate));
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

export default function useNarration() {
  // ── Reducer state machine ──────────────────────────────────────────────
  const [state, dispatch] = useReducer(narrationReducer, undefined, createInitialNarrationState);

  // Mirror reducer state into a ref for synchronous reads inside async callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── UI-bound state (not part of the state machine) ─────────────────────
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [kokoroVoices, setKokoroVoices] = useState<string[]>([]);
  const [kokoroLoading, setKokoroLoading] = useState(false);

  // ── Refs that need synchronous access ──────────────────────────────────
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onWordRef = useRef<((charIndex: number) => void) | null>(null);
  const allWordsRef = useRef<string[]>([]);
  const onWordAdvanceRef = useRef<((wordIndex: number) => void) | null>(null);
  const kokoroVoiceRef = useRef("af_bella");
  const rateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rhythmPausesRef = useRef<RhythmPauses | null>(null);
  const paragraphBreaksRef = useRef<Set<number>>(new Set());
  const pauseConfigRef = useRef<PauseConfig>(DEFAULT_PAUSE_CONFIG);
  const footnoteModeRef = useRef<"skip" | "read">("skip");
  const footnoteCuesRef = useRef<FootnoteCue[]>([]);
  const onSectionEndRef = useRef<(() => void) | null>(null);
  const bookIdRef = useRef<string>("");
  const globalOverridesRef = useRef<PronunciationOverride[]>([]);
  const bookOverridesRef = useRef<PronunciationOverride[]>([]);
  /** Effective merged overrides (global + book) — recomputed on each setter call */
  const pronunciationOverridesRef = useRef<PronunciationOverride[]>([]);

  const updateMergedOverrides = useCallback(() => {
    pronunciationOverridesRef.current = mergeOverrides(globalOverridesRef.current, bookOverridesRef.current);
  }, []);

  /** TTS-7A: Capture a diagnostics snapshot of current narration state */
  const captureDiagSnapshot = useCallback(() => {
    const s = stateRef.current;
    recordSnapshot({
      engine: s.engine as "web" | "kokoro" | null,
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

  // Check Kokoro model status on mount
  useEffect(() => {
    if (!api?.kokoroModelStatus) return;
    api.kokoroModelStatus().then((result: { ready: boolean }) => {
      if (result.ready) dispatch({ type: "KOKORO_READY" });
    }).catch(() => {});

    // Listen for download progress and loading state
    const cleanups: (() => void)[] = [];
    if (api.onKokoroDownloadProgress) {
      cleanups.push(api.onKokoroDownloadProgress((progress: number) => {
        dispatch({ type: "KOKORO_DOWNLOAD_PROGRESS", progress });
        if (progress >= 100) {
          dispatch({ type: "KOKORO_READY" });
        }
      }));
    }
    if (api.onKokoroLoading) {
      cleanups.push(api.onKokoroLoading((loading: boolean) => {
        setKokoroLoading(loading);
        if (!loading) dispatch({ type: "KOKORO_READY" });
      }));
    }
    if (api.onKokoroEngineStatus) {
      cleanups.push(api.onKokoroEngineStatus((data: { status: string; detail?: string | null }) => {
        if (data.status === "warming") setKokoroLoading(true);
        else if (data.status === "ready") {
          setKokoroLoading(false);
          dispatch({ type: "KOKORO_READY" });
        } else if (data.status === "error") {
          setKokoroLoading(false);
          dispatch({ type: "ERROR", message: data.detail || "Kokoro engine error" });
        }
      }));
    }
    return () => cleanups.forEach((c) => c());
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
    dispatch({ type: "SET_ENGINE", engine });
  }, []);

  /** Set the max word index for the current page — chunks won't cross this boundary */
  const setPageEndWord = useCallback((endIdx: number | null) => {
    dispatch({ type: "SET_PAGE_END", endIdx });
  }, []);

  /** Set Kokoro voice ID */
  const setKokoroVoice = useCallback((voiceId: string) => {
    kokoroVoiceRef.current = voiceId;
  }, []);

  /** Download Kokoro model */
  const downloadKokoroModel = useCallback(async () => {
    if (!api?.kokoroDownload) return;
    dispatch({ type: "KOKORO_DOWNLOAD_PROGRESS", progress: 0 });
    try {
      const result = await api.kokoroDownload();
      if (result.error) {
        dispatch({ type: "ERROR", message: result.error });
      } else {
        dispatch({ type: "KOKORO_READY" });
        // Load voices after download
        if (api.kokoroVoices) {
          const vResult = await api.kokoroVoices();
          if (vResult.voices) setKokoroVoices(vResult.voices);
        }
      }
    } catch {
      dispatch({ type: "ERROR", message: "Download failed" });
    }
  }, []);

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
  }, [webStrategy, captureDiagSnapshot]);

  /** Speak using the Kokoro strategy (delegates to NAR-2 pipeline + scheduler). */
  const speakNextChunkKokoro = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "idle") return;
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

    kokoroStrategy.speakChunk(
      "", // text not used — pipeline handles its own chunk sizing
      [],
      startIdx,
      s.speed,
      (wordIndex) => {
        dispatch({ type: "WORD_ADVANCE", wordIndex });
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(wordIndex);
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
  }, [kokoroStrategy, captureDiagSnapshot]);

  /** Dispatch to the correct engine's chunk speaker */
  const speakNextChunk = useCallback(() => {
    const s = stateRef.current;
    if (import.meta.env.DEV) console.debug("[narrate] chunk — engine:", s.engine, "kokoro:", s.kokoroReady, "status:", s.status, "cursor:", s.cursorWordIndex);
    if (s.engine === "kokoro" && s.kokoroReady) {
      speakNextChunkKokoro();
    } else {
      speakNextChunkWeb();
    }
  }, [speakNextChunkKokoro, speakNextChunkWeb]);

  // Keep refs in sync for strategy callbacks that need to break circular deps
  speakNextChunkRef.current = speakNextChunk;
  speakNextChunkWebRef.current = speakNextChunkWeb;

  // ── Legacy speak (full text, independent TTS) ────────────────────────
  const speak = useCallback((text: string, startCharOffset = 0, onWord?: (charIndex: number) => void) => {
    if (!window.speechSynthesis) return;
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
  ) => {
    // Stop any existing playback
    webStrategy.stop();
    kokoroStrategy.stop();

    allWordsRef.current = words;
    onWordAdvanceRef.current = onWordAdvance;
    const newSpeed = wpmToRate(wpm);

    dispatch({ type: "STOP" }); // Reset all state first

    // If Kokoro is selected but not ready, enter warming state and wait
    const isKokoro = stateRef.current.engine === "kokoro";
    if (isKokoro && !stateRef.current.kokoroReady) {
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
      // Trigger prewarm if available
      if (api?.kokoroPreload) api.kokoroPreload().catch(() => {});
      return;
    }

    dispatch({ type: "START_CURSOR_DRIVEN", startIdx: startWordIndex, speed: newSpeed });

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

    // TTS-7A: Diagnostics
    recordDiagEvent("start", `engine=${stateRef.current.engine} cursor=${startWordIndex} words=${words.length}`);
    captureDiagSnapshot();

    speakNextChunk();
  }, [speakNextChunk, webStrategy, kokoroStrategy, captureDiagSnapshot]);

  const resyncToCursor = useCallback((wordIndex: number, wpm: number) => {
    const s = stateRef.current;
    if (s.status === "idle") return;
    webStrategy.stop();
    kokoroStrategy.stop();
    const newSpeed = wpmToRate(wpm);
    dispatch({ type: "WORD_ADVANCE", wordIndex });
    dispatch({ type: "SET_SPEED", speed: newSpeed });
    // Update stateRef for immediate speakNextChunk
    stateRef.current = { ...stateRef.current, cursorWordIndex: wordIndex, speed: newSpeed };
    speakNextChunk();
  }, [speakNextChunk, webStrategy, kokoroStrategy]);

  // HOTFIX-6: Replace word array and resync cursor to a global position.
  // If narration is actively speaking, swap the array silently without interrupting
  // the current chunk — the next chunk will use the new array automatically.
  const updateWords = useCallback((words: string[], globalStartIdx: number) => {
    allWordsRef.current = words;
    const s = stateRef.current;
    if (s.status === "idle") return;
    // Update cursor position to the global index without stopping playback
    dispatch({ type: "WORD_ADVANCE", wordIndex: globalStartIdx });
    stateRef.current = { ...stateRef.current, cursorWordIndex: globalStartIdx, chunkStart: globalStartIdx };
    if (import.meta.env.DEV) console.debug("[narrate] updateWords — swapped to", words.length, "words at global idx", globalStartIdx, "(no restart)");
  }, []);

  const updateWpm = useCallback((wpm: number) => {
    const newRate = wpmToRate(wpm);
    dispatch({ type: "SET_SPEED", speed: newRate });
    // Update stateRef for immediate reads
    stateRef.current = { ...stateRef.current, speed: newRate, generationId: stateRef.current.generationId + 1 };
    const s = stateRef.current;
    if (s.status !== "idle") {
      if (s.engine === "web") {
        webStrategy.stop();
        speakNextChunk();
      } else {
        // Kokoro: flush the queue and re-generate at new rate
        kokoroStrategy.stop();
        speakNextChunk();
      }
    }
  }, [speakNextChunk, webStrategy, kokoroStrategy]);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.engine === "kokoro") {
      kokoroStrategy.pause();
    } else {
      webStrategy.pause();
    }
    dispatch({ type: "PAUSE" });
    stateRef.current = { ...stateRef.current, status: "paused" };
    // TTS-7A: Diagnostics
    recordDiagEvent("pause", `cursor=${s.cursorWordIndex}`);
    captureDiagSnapshot();
  }, [webStrategy, kokoroStrategy, captureDiagSnapshot]);

  const resume = useCallback((currentWordIndex?: number) => {
    const s = stateRef.current;

    // TTS-7B: If caller provides a cursor position that differs from where
    // we paused, the user moved the cursor during pause — resync instead of bare resume.
    if (currentWordIndex != null && currentWordIndex !== s.cursorWordIndex) {
      // Stop current strategies, resync to new position
      webStrategy.stop();
      kokoroStrategy.stop();
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
      speakNextChunkRef.current();
      return;
    }

    // Bare resume from pause point
    if (s.engine === "kokoro") {
      kokoroStrategy.resume();
    } else {
      webStrategy.resume();
    }
    dispatch({ type: "RESUME" });
    stateRef.current = { ...stateRef.current, status: "speaking" };
    // TTS-7A: Diagnostics
    recordDiagEvent("resume", `cursor=${s.cursorWordIndex}`);
    captureDiagSnapshot();
  }, [webStrategy, kokoroStrategy, captureDiagSnapshot]);

  const stop = useCallback(() => {
    // TTS-7A: Diagnostics
    recordDiagEvent("stop", `cursor=${stateRef.current.cursorWordIndex}`);
    captureDiagSnapshot();
    webStrategy.stop();
    kokoroStrategy.stop();
    dispatch({ type: "STOP" });
  }, [webStrategy, kokoroStrategy, captureDiagSnapshot]);

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
    const clamped = Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, newRate));
    dispatch({ type: "SET_SPEED", speed: clamped });
    // Update stateRef for immediate reads
    stateRef.current = { ...stateRef.current, speed: clamped, generationId: stateRef.current.generationId + 1 };

    const s = stateRef.current;
    if (s.status !== "idle") {
      if (s.engine === "kokoro") {
        // Kokoro: immediate stop + restart from current word at new native bucket — no debounce
        if (rateDebounceRef.current) { clearTimeout(rateDebounceRef.current); rateDebounceRef.current = null; }
        kokoroStrategy.stop();
        speakNextChunk();
      } else {
        // Web Speech: debounced restart (lets rapid slider adjustments settle)
        if (rateDebounceRef.current) clearTimeout(rateDebounceRef.current);
        rateDebounceRef.current = setTimeout(() => {
          rateDebounceRef.current = null;
          webStrategy.stop();
          speakNextChunk();
        }, TTS_RATE_RESTART_DEBOUNCE_MS);
      }
    }
  }, [speakNextChunk, webStrategy, kokoroStrategy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webStrategy.stop();
      kokoroStrategy.stop();
    };
  }, [webStrategy, kokoroStrategy]);

  return {
    speaking: state.status === "speaking" || state.status === "holding" || state.status === "warming",
    warming: state.status === "warming",
    voices,
    currentVoice,
    rate: state.speed,
    kokoroReady: state.kokoroReady,
    kokoroDownloading: state.kokoroDownloading,
    kokoroDownloadProgress: state.kokoroDownloadProgress,
    kokoroVoices,
    kokoroLoading,
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
      if (s.engine !== "kokoro" || s.status !== "speaking") return null;
      return kokoroStrategyRef.current?.getAudioProgress?.() ?? null;
    },
  };
}

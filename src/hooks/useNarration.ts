import { useState, useRef, useCallback, useEffect, useReducer, useMemo } from "react";
import { TTS_CHUNK_SIZE, TTS_MAX_RATE, TTS_MIN_RATE, TTS_RATE_BASELINE_WPM, TTS_RATE_RESTART_DEBOUNCE_MS, resolveKokoroBucket } from "../constants";
import type { RhythmPauses } from "../types";
import { isSentenceEnd, type PauseConfig, DEFAULT_PAUSE_CONFIG } from "../utils/pauseDetection";
import { NarrationState as ReducerState, NarrationAction, narrationReducer, createInitialNarrationState } from "../types/narration";
import { createWebSpeechStrategy } from "./narration/webSpeechStrategy";
import { createKokoroStrategy } from "./narration/kokoroStrategy";

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
  const onSectionEndRef = useRef<(() => void) | null>(null);
  const bookIdRef = useRef<string>("");

  // ── TTS Strategy instances ──────────────────────────────────────────────
  const webStrategy = useMemo(
    () => createWebSpeechStrategy(() => currentVoice),
    [currentVoice],
  );

  // Stable refs to break circular dependency (strategy → speakNextChunk → strategy).
  const speakNextChunkRef = useRef<() => void>(() => {});
  const speakNextChunkWebRef = useRef<() => void>(() => {});

  const kokoroStrategy = useMemo(
    () => createKokoroStrategy({
      getVoiceId: () => kokoroVoiceRef.current,
      getSpeed: () => stateRef.current.speed,
      getStatus: () => stateRef.current.status,
      getWords: () => allWordsRef.current,
      getBookId: () => bookIdRef.current,
      onFallbackToWeb: () => {
        dispatch({ type: "SET_ENGINE", engine: "web" });
        speakNextChunkWebRef.current();
      },
    }),
    [], // stable — all deps accessed via refs/getters
  );

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
    return () => cleanups.forEach((c) => c());
  }, []);

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
        const english = v.find((voice) => voice.lang === "en-US")
          || v.find((voice) => voice.lang === "en-GB")
          || v.find((voice) => voice.lang.startsWith("en"))
          || v[0];
        setCurrentVoice((prev) => prev || english);
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
    const chunkText = chunkWords.join(" ");
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
        const currentState = stateRef.current;
        if (currentState.status !== "idle" && currentState.status !== "holding") speakNextChunkWeb();
      },
      () => {
        dispatch({ type: "STOP" });
      },
    );
  }, [webStrategy]);

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
  }, [kokoroStrategy]);

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

    speakNextChunk();
  }, [speakNextChunk, webStrategy, kokoroStrategy]);

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

  // HOTFIX-6: Replace word array and resync pipeline to a new global position
  const updateWords = useCallback((words: string[], globalStartIdx: number) => {
    allWordsRef.current = words;
    const s = stateRef.current;
    if (s.status === "idle") return;
    // Stop current playback, update position, restart from global index
    webStrategy.stop();
    kokoroStrategy.stop();
    dispatch({ type: "WORD_ADVANCE", wordIndex: globalStartIdx });
    stateRef.current = { ...stateRef.current, cursorWordIndex: globalStartIdx, chunkStart: globalStartIdx };
    speakNextChunk();
  }, [speakNextChunk, webStrategy, kokoroStrategy]);

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
  }, [webStrategy, kokoroStrategy]);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (s.engine === "kokoro") {
      kokoroStrategy.resume();
    } else {
      webStrategy.resume();
    }
    dispatch({ type: "RESUME" });
    stateRef.current = { ...stateRef.current, status: "speaking" };
  }, [webStrategy, kokoroStrategy]);

  const stop = useCallback(() => {
    webStrategy.stop();
    kokoroStrategy.stop();
    dispatch({ type: "STOP" });
  }, [webStrategy, kokoroStrategy]);

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
    speaking: state.status === "speaking" || state.status === "holding",
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
    setOnSectionEnd: (cb: (() => void) | null) => {
      onSectionEndRef.current = cb;
    },
    setBookId: (id: string) => {
      bookIdRef.current = id;
    },
    warmUp: () => {
      kokoroStrategy.warmUp();
    },
  };
}

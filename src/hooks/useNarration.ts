import { useState, useRef, useCallback, useEffect, useReducer } from "react";
import { TTS_CHUNK_SIZE, TTS_MAX_RATE, TTS_MIN_RATE, TTS_RATE_BASELINE_WPM, PUNCTUATION_PAUSE_MS, TTS_PAUSE_COMMA_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS } from "../constants";
import { calculatePauseMs } from "../utils/rhythm";
import * as audioPlayer from "../utils/audioPlayer";
import type { RhythmPauses } from "../types";
import { NarrationState as ReducerState, NarrationAction, narrationReducer, createInitialNarrationState } from "../types/narration";

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
 *  Prefers shorter, sentence-aligned chunks so TTS speaks one sentence at a time
 *  with natural prosody at boundaries. Minimum 5 words to avoid tiny chunks.
 *  If pageEnd is provided, never exceeds it (prevents reading across page boundaries). */
function findSentenceBoundary(words: string[], startIdx: number, chunkSize: number, pageEnd?: number | null): number {
  const hardMax = pageEnd != null ? Math.min(pageEnd + 1, words.length) : words.length;
  const maxEnd = Math.min(startIdx + chunkSize, hardMax);

  // Find the FIRST sentence ending — one sentence per chunk for natural pauses
  // Start scanning from word 1 (allow at least 1 word per chunk)
  for (let i = startIdx; i < maxEnd; i++) {
    if (/[.!?]["'\u201D\u2019)]*$/.test(words[i])) return Math.min(i + 1, hardMax);
  }
  // No sentence ending within chunk — scan further (up to 2x) for one
  if (hardMax > maxEnd) {
    const extendedMax = Math.min(startIdx + chunkSize * 2, hardMax);
    for (let i = maxEnd; i < extendedMax; i++) {
      if (/[.!?]["'\u201D\u2019)]*$/.test(words[i])) return Math.min(i + 1, hardMax);
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
  const chunkPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        const english = v.find((voice) => voice.lang.startsWith("en")) || v[0];
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

  // ── Kokoro pre-buffer: generate next chunk while current plays ──────────

  const preBufferNextKokoro = useCallback(async (afterEndIdx: number) => {
    const s = stateRef.current;
    if (s.status === "idle" || !api?.kokoroGenerate) return;
    const words = allWordsRef.current;
    if (afterEndIdx >= words.length) return;
    // Pre-buffer ignores page boundary — looks ahead past current page for seamless page turns
    const nextEnd = findSentenceBoundary(words, afterEndIdx, TTS_CHUNK_SIZE, null);
    const text = words.slice(afterEndIdx, nextEnd).join(" ");
    const genId = s.generationId;
    try {
      const result = await api.kokoroGenerate(text, kokoroVoiceRef.current, stateRef.current.speed);
      // Discard pre-buffer result if rate changed during generation
      if (!result.error && stateRef.current.status !== "idle" && genId === stateRef.current.generationId) {
        dispatch({ type: "SET_PRE_BUFFER", buffer: { audio: result.audio, sampleRate: result.sampleRate, durationMs: result.durationMs, text } });
      }
    } catch { /* pre-buffer failed, will generate on-demand */ }
  }, []);

  // ── Kokoro cursor-driven chunk (with in-flight guard + pre-buffer) ─────

  const speakNextChunkKokoro = useCallback(async () => {
    const s = stateRef.current;
    if (s.status === "idle" || !api?.kokoroGenerate) return;
    if (s.kokoroInFlight) return;

    const words = allWordsRef.current;
    const startIdx = s.cursorWordIndex;
    if (startIdx >= words.length) {
      dispatch({ type: "STOP" });
      return;
    }

    // Don't limit chunks to page boundary — narration flows across pages seamlessly.
    // Word-advance callback triggers page turns when highlighted word crosses boundary.
    const endIdx = findSentenceBoundary(words, startIdx, TTS_CHUNK_SIZE, null);
    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = chunkWords.join(" ");
    // Store chunkStart/chunkWords locally — they are only used inside this callback chain
    const chunkStart = startIdx;

    dispatch({ type: "KOKORO_IN_FLIGHT", inFlight: true });
    const genId = s.generationId;
    try {
      // Check pre-buffer first
      let result;
      const buf = s.nextChunkBuffer;
      if (buf && buf.text === chunkText) {
        result = buf;
        dispatch({ type: "CLEAR_PRE_BUFFER" });
      } else {
        dispatch({ type: "CLEAR_PRE_BUFFER" });
        result = await api.kokoroGenerate(chunkText, kokoroVoiceRef.current, stateRef.current.speed);
      }

      if (result.error) {
        dispatch({ type: "SET_ENGINE", engine: "web" });
        speakNextChunkWeb();
        return;
      }
      if (stateRef.current.status === "idle") return;
      // Discard stale IPC result if rate changed during generation — re-generate at new rate
      if (genId !== stateRef.current.generationId) {
        speakNextChunk();
        return;
      }

      // Start pre-buffering next chunk while this one plays
      preBufferNextKokoro(endIdx);

      audioPlayer.playBuffer(
        result.audio,
        result.sampleRate,
        result.durationMs,
        chunkWords.length,
        (wordOffset: number) => {
          const globalIdx = chunkStart + wordOffset;
          dispatch({ type: "WORD_ADVANCE", wordIndex: globalIdx });
          if (onWordAdvanceRef.current) onWordAdvanceRef.current(globalIdx);
        },
        () => {
          dispatch({ type: "CHUNK_COMPLETE", endIdx });
          if (onWordAdvanceRef.current) onWordAdvanceRef.current(endIdx);
          const currentState = stateRef.current;
          if (currentState.status !== "idle" && currentState.status !== "holding") {
            // Rhythm pause at chunk boundaries: only add silence if pre-buffer is ready.
            // If not ready, generation time IS the natural pause — don't stack delays.
            const hasPreBuffer = currentState.nextChunkBuffer !== null;
            let pauseMs = 0;
            if (hasPreBuffer && rhythmPausesRef.current) {
              const lastWord = chunkWords[chunkWords.length - 1] || "";
              const lastWordGlobalIdx = chunkStart + chunkWords.length - 1;
              const isParagraphEnd = paragraphBreaksRef.current.has(lastWordGlobalIdx);
              if (isParagraphEnd && rhythmPausesRef.current.paragraphs) {
                pauseMs = TTS_PAUSE_PARAGRAPH_MS;
              } else if (/[.!?]["'\u201D\u2019)]*$/.test(lastWord) && rhythmPausesRef.current.sentences) {
                pauseMs = TTS_PAUSE_SENTENCE_MS;
              } else if (/[,;:]["'\u201D\u2019)]*$/.test(lastWord) && rhythmPausesRef.current.commas) {
                pauseMs = TTS_PAUSE_COMMA_MS;
              }
            }
            if (pauseMs > 0) {
              chunkPauseTimerRef.current = setTimeout(() => {
                chunkPauseTimerRef.current = null;
                const st = stateRef.current;
                if (st.status !== "idle" && st.status !== "holding") speakNextChunkKokoro();
              }, pauseMs);
            } else {
              speakNextChunkKokoro();
            }
          }
        },
      );
    } catch {
      dispatch({ type: "SET_ENGINE", engine: "web" });
      speakNextChunkWeb();
    } finally {
      dispatch({ type: "KOKORO_IN_FLIGHT", inFlight: false });
    }
  }, [preBufferNextKokoro]);

  // ── Web Speech cursor-driven chunk ──────────────────────────────────────

  const speakNextChunkWeb = useCallback(() => {
    const s = stateRef.current;
    if (!window.speechSynthesis || s.status === "idle") return;
    const words = allWordsRef.current;
    const startIdx = s.cursorWordIndex;
    if (startIdx >= words.length) {
      dispatch({ type: "STOP" });
      return;
    }

    // No page boundary limit — narration flows across pages seamlessly
    const endIdx = findSentenceBoundary(words, startIdx, TTS_CHUNK_SIZE, null);
    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = chunkWords.join(" ");
    const chunkStart = startIdx;

    const utterance = new SpeechSynthesisUtterance(chunkText);
    if (currentVoice) utterance.voice = currentVoice;
    utterance.rate = state.speed;
    utterance.pitch = 1;
    let wordInChunk = 0;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const globalIdx = chunkStart + wordInChunk;
        wordInChunk++;
        dispatch({ type: "WORD_ADVANCE", wordIndex: globalIdx });
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(globalIdx);
      }
    };

    utterance.onend = () => {
      utteranceRef.current = null;
      dispatch({ type: "CHUNK_COMPLETE", endIdx });
      if (onWordAdvanceRef.current) onWordAdvanceRef.current(endIdx);
      const currentState = stateRef.current;
      if (currentState.status !== "idle" && currentState.status !== "holding") speakNextChunkWeb();
    };

    utterance.onerror = () => {
      utteranceRef.current = null;
      dispatch({ type: "STOP" });
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentVoice, state.speed]);

  /** Dispatch to the correct engine's chunk speaker */
  const speakNextChunk = useCallback(() => {
    const s = stateRef.current;
    if (s.engine === "kokoro" && s.kokoroReady) {
      speakNextChunkKokoro();
    } else {
      speakNextChunkWeb();
    }
  }, [speakNextChunkKokoro, speakNextChunkWeb]);

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
    window.speechSynthesis?.cancel();
    audioPlayer.stop();

    allWordsRef.current = words;
    onWordAdvanceRef.current = onWordAdvance;
    const newSpeed = wpmToRate(wpm);

    dispatch({ type: "STOP" }); // Reset all state first
    dispatch({ type: "START_CURSOR_DRIVEN", startIdx: startWordIndex, speed: newSpeed });

    // speakNextChunk reads from stateRef, but dispatch is async — update stateRef manually
    // so the immediately-following speakNextChunk sees the new values.
    stateRef.current = {
      ...stateRef.current,
      status: "speaking",
      cursorWordIndex: startWordIndex,
      speed: newSpeed,
      chunkStart: startWordIndex,
      chunkWords: [],
      kokoroInFlight: false,
      nextChunkBuffer: null,
    };

    speakNextChunk();
  }, [speakNextChunk]);

  const resyncToCursor = useCallback((wordIndex: number, wpm: number) => {
    const s = stateRef.current;
    if (s.status === "idle") return;
    window.speechSynthesis?.cancel();
    audioPlayer.stop();
    const newSpeed = wpmToRate(wpm);
    dispatch({ type: "WORD_ADVANCE", wordIndex });
    dispatch({ type: "SET_SPEED", speed: newSpeed });
    // Update stateRef for immediate speakNextChunk
    stateRef.current = { ...stateRef.current, cursorWordIndex: wordIndex, speed: newSpeed };
    speakNextChunk();
  }, [speakNextChunk]);

  const updateWpm = useCallback((wpm: number) => {
    const newRate = wpmToRate(wpm);
    dispatch({ type: "SET_SPEED", speed: newRate });
    // Update stateRef for immediate reads
    stateRef.current = { ...stateRef.current, speed: newRate, generationId: stateRef.current.generationId + 1, nextChunkBuffer: null };
    const s = stateRef.current;
    if (s.status !== "idle") {
      if (s.engine === "web") {
        // Web Speech: cancel current utterance — new chunk will use updated rate immediately
        window.speechSynthesis?.cancel();
        speakNextChunk();
      } else if (!s.kokoroInFlight) {
        // Kokoro: no in-flight request — restart immediately at new rate
        audioPlayer.stop();
        speakNextChunk();
      }
      // Kokoro in-flight: generation ID increment above ensures the result is discarded
      // and speakNextChunk() is called with the new rate from within speakNextChunkKokoro
    }
  }, [speakNextChunk]);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.engine === "kokoro") {
      audioPlayer.pause();
    } else {
      window.speechSynthesis?.pause();
    }
    dispatch({ type: "PAUSE" });
  }, []);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (s.engine === "kokoro") {
      audioPlayer.resume();
    } else {
      window.speechSynthesis?.resume();
    }
    dispatch({ type: "RESUME" });
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    audioPlayer.stop();
    dispatch({ type: "STOP" });
    utteranceRef.current = null;
    if (chunkPauseTimerRef.current) { clearTimeout(chunkPauseTimerRef.current); chunkPauseTimerRef.current = null; }
  }, []);

  const hold = useCallback(() => { dispatch({ type: "HOLD" }); }, []);

  const resumeChaining = useCallback(() => {
    dispatch({ type: "RESUME_CHAINING" });
    // Need to check after dispatch — update stateRef and trigger chunk
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
    stateRef.current = { ...stateRef.current, speed: clamped, generationId: stateRef.current.generationId + 1, nextChunkBuffer: null };
    // Debounce the restart so rapid slider adjustments settle before triggering re-generation
    if (rateDebounceRef.current) clearTimeout(rateDebounceRef.current);
    rateDebounceRef.current = setTimeout(() => {
      rateDebounceRef.current = null;
      const s = stateRef.current;
      if (s.status !== "idle") {
        if (s.engine === "web") {
          window.speechSynthesis?.cancel();
          speakNextChunk();
        } else if (!s.kokoroInFlight) {
          audioPlayer.stop();
          speakNextChunk();
        }
        // Kokoro in-flight: generation ID increment ensures stale result is discarded on arrival
      }
    }, 500);
  }, [speakNextChunk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      audioPlayer.stop();
    };
  }, []);

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
  };
}

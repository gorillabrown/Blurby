import { useState, useRef, useCallback, useEffect } from "react";
import { TTS_CHUNK_SIZE, TTS_MAX_RATE, TTS_MIN_RATE, TTS_RATE_BASELINE_WPM, PUNCTUATION_PAUSE_MS } from "../constants";
import { calculatePauseMs } from "../utils/rhythm";
import * as audioPlayer from "../utils/audioPlayer";
import type { RhythmPauses } from "../types";

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

const api = (window as any).electronAPI;

export default function useNarration() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onWordRef = useRef<((charIndex: number) => void) | null>(null);

  // Kokoro state
  const [kokoroReady, setKokoroReady] = useState(false);
  const [kokoroDownloading, setKokoroDownloading] = useState(false);
  const [kokoroDownloadProgress, setKokoroDownloadProgress] = useState(0);
  const [kokoroVoices, setKokoroVoices] = useState<string[]>([]);
  const [kokoroLoading, setKokoroLoading] = useState(false);
  const engineRef = useRef<TtsEngine>("web");

  // Cursor-driven state
  const chunkStartRef = useRef(0);
  const chunkWordsRef = useRef<string[]>([]);
  const allWordsRef = useRef<string[]>([]);
  const onWordAdvanceRef = useRef<((wordIndex: number) => void) | null>(null);
  const isCursorDrivenRef = useRef(false);
  const cursorWordIndexRef = useRef(0);
  const holdRef = useRef(false);
  const kokoroVoiceRef = useRef("af_bella");
  const pageEndWordRef = useRef<number | null>(null); // max word index for current page (narration chunks stop here)
  const speedRef = useRef(1.0);
  const kokoroInFlightRef = useRef(false);
  const nextChunkBufferRef = useRef<{ audio: number[]; sampleRate: number; durationMs: number; text: string; endIdx: number } | null>(null);
  const rateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationIdRef = useRef(0);
  const rhythmPausesRef = useRef<RhythmPauses | null>(null);
  const paragraphBreaksRef = useRef<Set<number>>(new Set());
  const chunkPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check Kokoro model status on mount
  useEffect(() => {
    if (!api?.kokoroModelStatus) return;
    api.kokoroModelStatus().then((result: { ready: boolean }) => {
      setKokoroReady(result.ready);
    }).catch(() => {});

    // Listen for download progress and loading state
    const cleanups: (() => void)[] = [];
    if (api.onKokoroDownloadProgress) {
      cleanups.push(api.onKokoroDownloadProgress((progress: number) => {
        setKokoroDownloadProgress(progress);
        if (progress >= 100) {
          setKokoroReady(true);
          setKokoroDownloading(false);
        }
      }));
    }
    if (api.onKokoroLoading) {
      cleanups.push(api.onKokoroLoading((loading: boolean) => {
        setKokoroLoading(loading);
        if (!loading) setKokoroReady(true);
      }));
    }
    return () => cleanups.forEach((c) => c());
  }, []);

  // Load Kokoro voices when ready
  useEffect(() => {
    if (!kokoroReady || !api?.kokoroVoices) return;
    api.kokoroVoices().then((result: { voices?: string[]; error?: string }) => {
      if (result.voices) setKokoroVoices(result.voices);
    }).catch(() => {});
  }, [kokoroReady]);

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
    engineRef.current = engine;
  }, []);

  /** Set Kokoro voice ID */
  /** Set the max word index for the current page — chunks won't cross this boundary */
  const setPageEndWord = useCallback((endIdx: number | null) => {
    pageEndWordRef.current = endIdx;
  }, []);

  const setKokoroVoice = useCallback((voiceId: string) => {
    kokoroVoiceRef.current = voiceId;
  }, []);

  /** Download Kokoro model */
  const downloadKokoroModel = useCallback(async () => {
    if (!api?.kokoroDownload) return;
    setKokoroDownloading(true);
    setKokoroDownloadProgress(0);
    try {
      const result = await api.kokoroDownload();
      if (result.error) {
        setKokoroDownloading(false);
      } else {
        setKokoroReady(true);
        setKokoroDownloading(false);
        // Load voices after download
        if (api.kokoroVoices) {
          const vResult = await api.kokoroVoices();
          if (vResult.voices) setKokoroVoices(vResult.voices);
        }
      }
    } catch {
      setKokoroDownloading(false);
    }
  }, []);

  // ── Kokoro pre-buffer: generate next chunk while current plays ──────────

  const preBufferNextKokoro = useCallback(async (afterEndIdx: number) => {
    if (!isCursorDrivenRef.current || !api?.kokoroGenerate) return;
    const words = allWordsRef.current;
    if (afterEndIdx >= words.length) return;
    // Pre-buffer ignores page boundary — looks ahead past current page for seamless page turns
    const nextEnd = findSentenceBoundary(words, afterEndIdx, TTS_CHUNK_SIZE, null);
    const text = words.slice(afterEndIdx, nextEnd).join(" ");
    const genId = generationIdRef.current;
    try {
      const result = await api.kokoroGenerate(text, kokoroVoiceRef.current, speedRef.current);
      // Discard pre-buffer result if rate changed during generation
      if (!result.error && isCursorDrivenRef.current && genId === generationIdRef.current) {
        nextChunkBufferRef.current = { audio: result.audio, sampleRate: result.sampleRate, durationMs: result.durationMs, text, endIdx: nextEnd };
      }
    } catch { /* pre-buffer failed, will generate on-demand */ }
  }, []);

  // ── Kokoro cursor-driven chunk (with in-flight guard + pre-buffer) ─────

  const speakNextChunkKokoro = useCallback(async () => {
    if (!isCursorDrivenRef.current || !api?.kokoroGenerate) return;
    if (kokoroInFlightRef.current) return;

    const words = allWordsRef.current;
    const startIdx = cursorWordIndexRef.current;
    if (startIdx >= words.length) {
      setSpeaking(false);
      isCursorDrivenRef.current = false;
      return;
    }

    // Don't limit chunks to page boundary — narration flows across pages seamlessly.
    // Word-advance callback triggers page turns when highlighted word crosses boundary.
    const endIdx = findSentenceBoundary(words, startIdx, TTS_CHUNK_SIZE, null);
    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = chunkWords.join(" ");
    chunkStartRef.current = startIdx;
    chunkWordsRef.current = chunkWords;

    kokoroInFlightRef.current = true;
    const genId = generationIdRef.current;
    try {
      // Check pre-buffer first
      let result;
      const buf = nextChunkBufferRef.current;
      if (buf && buf.text === chunkText) {
        result = buf;
        nextChunkBufferRef.current = null;
      } else {
        nextChunkBufferRef.current = null;
        result = await api.kokoroGenerate(chunkText, kokoroVoiceRef.current, speedRef.current);
      }

      if (result.error) {
        engineRef.current = "web";
        speakNextChunkWeb();
        return;
      }
      if (!isCursorDrivenRef.current) return;
      // Discard stale IPC result if rate changed during generation — re-generate at new rate
      if (genId !== generationIdRef.current) {
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
          const globalIdx = chunkStartRef.current + wordOffset;
          cursorWordIndexRef.current = globalIdx;
          if (onWordAdvanceRef.current) onWordAdvanceRef.current(globalIdx);
        },
        () => {
          cursorWordIndexRef.current = endIdx;
          if (onWordAdvanceRef.current) onWordAdvanceRef.current(endIdx);
          if (isCursorDrivenRef.current && !holdRef.current) {
            // Rhythm pause at chunk boundaries: only add silence if pre-buffer is ready.
            // If not ready, generation time IS the natural pause — don't stack delays.
            const hasPreBuffer = nextChunkBufferRef.current !== null;
            let pauseMs = 0;
            if (hasPreBuffer && rhythmPausesRef.current) {
              const lastWord = chunkWords[chunkWords.length - 1] || "";
              const lastWordGlobalIdx = chunkStartRef.current + chunkWords.length - 1;
              const isParagraphEnd = paragraphBreaksRef.current.has(lastWordGlobalIdx);
              // Use calculatePauseMs with TTS-tuned base duration (250ms)
              // Kokoro handles within-chunk prosody; we only add between-chunk gaps
              pauseMs = calculatePauseMs(lastWord, rhythmPausesRef.current, 250, isParagraphEnd);
            }
            if (pauseMs > 0) {
              chunkPauseTimerRef.current = setTimeout(() => {
                chunkPauseTimerRef.current = null;
                if (isCursorDrivenRef.current && !holdRef.current) speakNextChunkKokoro();
              }, pauseMs);
            } else {
              speakNextChunkKokoro();
            }
          }
        },
      );
    } catch {
      engineRef.current = "web";
      speakNextChunkWeb();
    } finally {
      kokoroInFlightRef.current = false;
    }
  }, [preBufferNextKokoro]);

  // ── Web Speech cursor-driven chunk ──────────────────────────────────────

  const speakNextChunkWeb = useCallback(() => {
    if (!window.speechSynthesis || !isCursorDrivenRef.current) return;
    const words = allWordsRef.current;
    const startIdx = cursorWordIndexRef.current;
    if (startIdx >= words.length) {
      setSpeaking(false);
      isCursorDrivenRef.current = false;
      return;
    }

    // No page boundary limit — narration flows across pages seamlessly
    const endIdx = findSentenceBoundary(words, startIdx, TTS_CHUNK_SIZE, null);
    const chunkWords = words.slice(startIdx, endIdx);
    const chunkText = chunkWords.join(" ");
    chunkStartRef.current = startIdx;
    chunkWordsRef.current = chunkWords;

    const utterance = new SpeechSynthesisUtterance(chunkText);
    if (currentVoice) utterance.voice = currentVoice;
    utterance.rate = rate;
    utterance.pitch = 1;
    let wordInChunk = 0;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const globalIdx = chunkStartRef.current + wordInChunk;
        wordInChunk++;
        cursorWordIndexRef.current = globalIdx;
        if (onWordAdvanceRef.current) onWordAdvanceRef.current(globalIdx);
      }
    };

    utterance.onend = () => {
      utteranceRef.current = null;
      cursorWordIndexRef.current = endIdx;
      if (onWordAdvanceRef.current) onWordAdvanceRef.current(endIdx);
      if (isCursorDrivenRef.current && !holdRef.current) speakNextChunkWeb();
    };

    utterance.onerror = () => {
      utteranceRef.current = null;
      setSpeaking(false);
      isCursorDrivenRef.current = false;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentVoice, rate]);

  /** Dispatch to the correct engine's chunk speaker */
  const speakNextChunk = useCallback(() => {
    if (engineRef.current === "kokoro" && kokoroReady) {
      speakNextChunkKokoro();
    } else {
      speakNextChunkWeb();
    }
  }, [speakNextChunkKokoro, speakNextChunkWeb, kokoroReady]);

  // ── Legacy speak (full text, independent TTS) ────────────────────────
  const speak = useCallback((text: string, startCharOffset = 0, onWord?: (charIndex: number) => void) => {
    if (!window.speechSynthesis) return;
    isCursorDrivenRef.current = false;
    window.speechSynthesis.cancel();

    const textToSpeak = text.slice(startCharOffset);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (currentVoice) utterance.voice = currentVoice;
    utterance.rate = rate;
    utterance.pitch = 1;
    onWordRef.current = onWord || null;

    utterance.onboundary = (event) => {
      if (event.name === "word" && onWordRef.current) {
        onWordRef.current(startCharOffset + event.charIndex);
      }
    };
    utterance.onend = () => { setSpeaking(false); utteranceRef.current = null; };
    utterance.onerror = () => { setSpeaking(false); utteranceRef.current = null; };

    utteranceRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [currentVoice, rate]);

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
    kokoroInFlightRef.current = false;
    nextChunkBufferRef.current = null;

    isCursorDrivenRef.current = true;
    allWordsRef.current = words;
    cursorWordIndexRef.current = startWordIndex;
    onWordAdvanceRef.current = onWordAdvance;
    speedRef.current = wpmToRate(wpm);
    setRate(speedRef.current);

    setSpeaking(true);
    speakNextChunk();
  }, [speakNextChunk]);

  const resyncToCursor = useCallback((wordIndex: number, wpm: number) => {
    if (!isCursorDrivenRef.current) return;
    window.speechSynthesis?.cancel();
    audioPlayer.stop();
    cursorWordIndexRef.current = wordIndex;
    speedRef.current = wpmToRate(wpm);
    setRate(speedRef.current);
    speakNextChunk();
  }, [speakNextChunk]);

  const updateWpm = useCallback((wpm: number) => {
    const newRate = wpmToRate(wpm);
    speedRef.current = newRate;
    setRate(newRate);
    // Invalidate pre-buffer and increment generation ID to discard any in-flight IPC results
    nextChunkBufferRef.current = null;
    generationIdRef.current++;
    if (isCursorDrivenRef.current) {
      if (engineRef.current === "web") {
        // Web Speech: cancel current utterance — new chunk will use updated rate immediately
        window.speechSynthesis?.cancel();
        speakNextChunk();
      } else if (!kokoroInFlightRef.current) {
        // Kokoro: no in-flight request — restart immediately at new rate
        audioPlayer.stop();
        speakNextChunk();
      }
      // Kokoro in-flight: generation ID increment above ensures the result is discarded
      // and speakNextChunk() is called with the new rate from within speakNextChunkKokoro
    }
  }, [speakNextChunk]);

  const pause = useCallback(() => {
    if (engineRef.current === "kokoro") {
      audioPlayer.pause();
    } else {
      window.speechSynthesis?.pause();
    }
    setSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    if (engineRef.current === "kokoro") {
      audioPlayer.resume();
    } else {
      window.speechSynthesis?.resume();
    }
    setSpeaking(true);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    audioPlayer.stop();
    setSpeaking(false);
    utteranceRef.current = null;
    isCursorDrivenRef.current = false;
    holdRef.current = false;
    kokoroInFlightRef.current = false;
    nextChunkBufferRef.current = null;
    if (chunkPauseTimerRef.current) { clearTimeout(chunkPauseTimerRef.current); chunkPauseTimerRef.current = null; }
  }, []);

  const hold = useCallback(() => { holdRef.current = true; }, []);

  const resumeChaining = useCallback(() => {
    holdRef.current = false;
    if (isCursorDrivenRef.current) speakNextChunk();
  }, [speakNextChunk]);

  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  const adjustRate = useCallback((newRate: number) => {
    const clamped = Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, newRate));
    speedRef.current = clamped;
    setRate(clamped);
    // Invalidate pre-buffer immediately and increment generation ID to discard stale IPC results
    nextChunkBufferRef.current = null;
    generationIdRef.current++;
    // Debounce the restart so rapid slider adjustments settle before triggering re-generation
    if (rateDebounceRef.current) clearTimeout(rateDebounceRef.current);
    rateDebounceRef.current = setTimeout(() => {
      rateDebounceRef.current = null;
      if (isCursorDrivenRef.current) {
        if (engineRef.current === "web") {
          window.speechSynthesis?.cancel();
          speakNextChunk();
        } else if (!kokoroInFlightRef.current) {
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
    speaking,
    voices,
    currentVoice,
    rate,
    kokoroReady,
    kokoroDownloading,
    kokoroDownloadProgress,
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

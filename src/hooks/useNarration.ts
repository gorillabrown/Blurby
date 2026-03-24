import { useState, useRef, useCallback, useEffect } from "react";

export interface NarrationState {
  speaking: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  rate: number; // 0.5-3.0
}

const TTS_CHUNK_SIZE = 4; // Buffer 4 words per utterance for natural flow
const TTS_MAX_RATE = 2.0;
const TTS_MIN_RATE = 0.5;

/** Calculate TTS rate from WPM. ~150 WPM = rate 1.0, scale linearly. */
function wpmToRate(wpm: number): number {
  const rate = wpm / 150;
  return Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, rate));
}

export default function useNarration() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onWordRef = useRef<((charIndex: number) => void) | null>(null);

  // Cursor-driven state
  const chunkStartRef = useRef(0);
  const chunkWordsRef = useRef<string[]>([]);
  const allWordsRef = useRef<string[]>([]);
  const onWordAdvanceRef = useRef<((wordIndex: number) => void) | null>(null);
  const isCursorDrivenRef = useRef(false);
  const cursorWordIndexRef = useRef(0);

  // Load available voices
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

    utterance.onend = () => {
      setSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setSpeaking(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [currentVoice, rate]);

  // ── Cursor-driven speak (chunks synchronized to word cursor) ─────────

  /** Speak a chunk of words starting at wordIndex. Calls onWordAdvance for each word boundary. */
  const speakNextChunk = useCallback(() => {
    if (!window.speechSynthesis || !isCursorDrivenRef.current) return;
    const words = allWordsRef.current;
    const startIdx = cursorWordIndexRef.current;
    if (startIdx >= words.length) {
      setSpeaking(false);
      isCursorDrivenRef.current = false;
      return;
    }

    const endIdx = Math.min(startIdx + TTS_CHUNK_SIZE, words.length);
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
        if (onWordAdvanceRef.current) {
          onWordAdvanceRef.current(globalIdx);
        }
      }
    };

    utterance.onend = () => {
      utteranceRef.current = null;
      // Advance cursor past the chunk
      cursorWordIndexRef.current = endIdx;
      if (onWordAdvanceRef.current) {
        onWordAdvanceRef.current(endIdx);
      }
      // Speak next chunk
      if (isCursorDrivenRef.current) {
        speakNextChunk();
      }
    };

    utterance.onerror = () => {
      utteranceRef.current = null;
      setSpeaking(false);
      isCursorDrivenRef.current = false;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentVoice, rate]);

  /** Start cursor-driven TTS from a word index */
  const startCursorDriven = useCallback((
    words: string[],
    startWordIndex: number,
    wpm: number,
    onWordAdvance: (wordIndex: number) => void
  ) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    isCursorDrivenRef.current = true;
    allWordsRef.current = words;
    cursorWordIndexRef.current = startWordIndex;
    onWordAdvanceRef.current = onWordAdvance;
    setRate(wpmToRate(wpm));

    setSpeaking(true);
    speakNextChunk();
  }, [speakNextChunk]);

  /** Re-sync TTS to a new cursor position (e.g., when cursor falls out of sync) */
  const resyncToCursor = useCallback((wordIndex: number, wpm: number) => {
    if (!isCursorDrivenRef.current) return;
    window.speechSynthesis?.cancel();
    cursorWordIndexRef.current = wordIndex;
    setRate(wpmToRate(wpm));
    speakNextChunk();
  }, [speakNextChunk]);

  /** Update TTS rate when WPM changes mid-read */
  const updateWpm = useCallback((wpm: number) => {
    const newRate = wpmToRate(wpm);
    setRate(newRate);
    // Re-queue from current position with new rate
    if (isCursorDrivenRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speakNextChunk();
    }
  }, [speakNextChunk]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setSpeaking(true);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    utteranceRef.current = null;
    isCursorDrivenRef.current = false;
  }, []);

  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  const adjustRate = useCallback((newRate: number) => {
    setRate(Math.max(TTS_MIN_RATE, Math.min(TTS_MAX_RATE, newRate)));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    speaking,
    voices,
    currentVoice,
    rate,
    speak,
    startCursorDriven,
    resyncToCursor,
    updateWpm,
    pause,
    resume,
    stop,
    selectVoice,
    adjustRate,
  };
}

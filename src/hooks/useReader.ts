import { useState, useRef, useCallback } from "react";
import { MIN_WPM, MAX_WPM, INITIAL_PAUSE_MS, PUNCTUATION_PAUSE_MS, hasPunctuation } from "../utils/text";
import { calculatePauseMs } from "../utils/rhythm";
import { BlurbyDoc, RhythmPauses } from "../types";

const api = window.electronAPI;

export default function useReader(
  wpm: number,
  setWpm: (fn: (prev: number) => number) => void,
  initialPauseMs?: number,
  punctuationPauseMs?: number,
  rhythmPauses?: RhythmPauses,
  paragraphBreaks?: Set<number>
) {
  const initPause = initialPauseMs ?? INITIAL_PAUSE_MS;
  const punctPause = punctuationPauseMs ?? PUNCTUATION_PAUSE_MS;
  const rhythmPausesRef = useRef(rhythmPauses);
  const paragraphBreaksRef = useRef(paragraphBreaks);
  rhythmPausesRef.current = rhythmPauses;
  paragraphBreaksRef.current = paragraphBreaks;
  const [wordIndex, setWordIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [escPending, setEscPending] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const wordsRef = useRef<string[]>([]);
  const wordIndexRef = useRef(0);
  const playingRef = useRef(false);
  const wpmRef = useRef(wpm);
  const escTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStateSyncRef = useRef(0);
  wpmRef.current = wpm;

  // requestAnimationFrame-based playback loop
  const tick = useCallback((timestamp: number) => {
    if (!playingRef.current) return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    accumulatorRef.current += delta;

    const interval = 60000 / wpmRef.current;

    // Dwell longer based on rhythm pauses (granular) or fallback to simple punctuation check
    const currentWord = wordsRef.current[wordIndexRef.current] || "";
    let extraPause = 0;
    if (rhythmPausesRef.current) {
      extraPause = calculatePauseMs(
        currentWord,
        rhythmPausesRef.current,
        punctPause,
        paragraphBreaksRef.current?.has(wordIndexRef.current) || false
      );
    } else if (hasPunctuation(currentWord)) {
      extraPause = punctPause;
    }
    const effectiveInterval = interval + extraPause;

    while (accumulatorRef.current >= effectiveInterval) {
      accumulatorRef.current -= effectiveInterval;
      const next = wordIndexRef.current + 1;
      if (next >= wordsRef.current.length) {
        playingRef.current = false;
        setPlaying(false);
        accumulatorRef.current = 0;
        setWordIndex(wordIndexRef.current);
        return;
      }
      wordIndexRef.current = next;
      // Break after advancing so the *next* word's punctuation check
      // is evaluated on the next frame (prevents skipping pauses)
      break;
    }

    // Throttle React state syncs to ~100ms (10fps) for progress display
    const now = performance.now();
    if (now - lastStateSyncRef.current >= 100) {
      lastStateSyncRef.current = now;
      setWordIndex(wordIndexRef.current);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startPlayback = useCallback((initialPause = false) => {
    lastTimeRef.current = 0;
    // Negative accumulator creates a delay before the first word advances
    accumulatorRef.current = initialPause ? -initPause : 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopPlayback = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
    lastStateSyncRef.current = 0;
    // Sync final position to React state
    setWordIndex(wordIndexRef.current);
  }, []);

  const hasPlayedRef = useRef(false);

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      stopPlayback();
      setPlaying(false);
      playingRef.current = false;
    } else {
      if (wordIndexRef.current >= wordsRef.current.length - 1) {
        setWordIndex(0);
        wordIndexRef.current = 0;
      }
      // Initial 3-second pause on first play of this document
      const isFirstPlay = !hasPlayedRef.current;
      hasPlayedRef.current = true;
      setPlaying(true);
      playingRef.current = true;
      startPlayback(isFirstPlay);
    }
  }, [startPlayback, stopPlayback]);

  const adjustWpm = useCallback((delta: number) => {
    setWpm((prev: number) => {
      const next = Math.max(MIN_WPM, Math.min(MAX_WPM, prev + delta));
      wpmRef.current = next;
      return next;
    });
  }, [setWpm]);

  const seekWords = useCallback((delta: number) => {
    setWordIndex((prev) => {
      const next = Math.max(0, Math.min(wordsRef.current.length - 1, prev + delta));
      wordIndexRef.current = next;
      return next;
    });
  }, []);

  const jumpToWord = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(wordsRef.current.length - 1, index));
    wordIndexRef.current = clamped;
    setWordIndex(clamped);
  }, []);

  const requestExit = useCallback((activeDoc: (BlurbyDoc & { content?: string }) | null, onExit: (pos: number) => void) => {
    // If playing, require double-Esc
    if (playingRef.current && !escPending) {
      setEscPending(true);
      if (escTimerRef.current) clearTimeout(escTimerRef.current);
      escTimerRef.current = setTimeout(() => setEscPending(false), 2000);
      return;
    }
    if (escTimerRef.current) clearTimeout(escTimerRef.current);
    setEscPending(false);
    stopPlayback();
    setPlaying(false);
    playingRef.current = false;
    if (activeDoc) {
      api.updateDocProgress(activeDoc.id, wordIndexRef.current);
    }
    const finalPos = wordIndexRef.current;
    setWordIndex(0);
    wordIndexRef.current = 0;
    onExit(finalPos);
  }, [escPending, stopPlayback]);

  const initReader = useCallback((position: number) => {
    setWordIndex(position);
    wordIndexRef.current = position;
    setEscPending(false);
    hasPlayedRef.current = false;
  }, []);

  return {
    wordIndex,
    playing,
    escPending,
    wordsRef,
    wordIndexRef,
    togglePlay,
    adjustWpm,
    seekWords,
    jumpToWord,
    requestExit,
    initReader,
  };
}

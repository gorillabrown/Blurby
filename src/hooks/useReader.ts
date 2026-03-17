import { useState, useRef, useCallback } from "react";
import { MIN_WPM, MAX_WPM, WPM_STEP } from "../utils/text";

const api = window.electronAPI;

export default function useReader(wpm, setWpm) {
  const [wordIndex, setWordIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [escPending, setEscPending] = useState(false);

  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const wordsRef = useRef([]);
  const wordIndexRef = useRef(0);
  const playingRef = useRef(false);
  const wpmRef = useRef(wpm);
  const escTimerRef = useRef(null);
  wpmRef.current = wpm;

  // requestAnimationFrame-based playback loop
  const tick = useCallback((timestamp) => {
    if (!playingRef.current) return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    accumulatorRef.current += delta;

    const interval = 60000 / wpmRef.current;

    while (accumulatorRef.current >= interval) {
      accumulatorRef.current -= interval;
      const next = wordIndexRef.current + 1;
      if (next >= wordsRef.current.length) {
        playingRef.current = false;
        setPlaying(false);
        accumulatorRef.current = 0;
        setWordIndex(wordIndexRef.current);
        return;
      }
      wordIndexRef.current = next;
    }

    setWordIndex(wordIndexRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startPlayback = useCallback(() => {
    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopPlayback = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
  }, []);

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
      setPlaying(true);
      playingRef.current = true;
      startPlayback();
    }
  }, [startPlayback, stopPlayback]);

  const adjustWpm = useCallback((delta) => {
    setWpm((prev) => {
      const next = Math.max(MIN_WPM, Math.min(MAX_WPM, prev + delta));
      wpmRef.current = next;
      // rAF loop automatically uses new wpmRef value — no restart needed
      return next;
    });
  }, [setWpm]);

  const seekWords = useCallback((delta) => {
    setWordIndex((prev) => {
      const next = Math.max(0, Math.min(wordsRef.current.length - 1, prev + delta));
      wordIndexRef.current = next;
      return next;
    });
  }, []);

  const requestExit = useCallback((activeDoc, onExit) => {
    // If playing, require double-Esc
    if (playingRef.current && !escPending) {
      setEscPending(true);
      clearTimeout(escTimerRef.current);
      escTimerRef.current = setTimeout(() => setEscPending(false), 2000);
      return;
    }
    clearTimeout(escTimerRef.current);
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

  const initReader = useCallback((position) => {
    setWordIndex(position);
    wordIndexRef.current = position;
    setEscPending(false);
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
    requestExit,
    initReader,
  };
}

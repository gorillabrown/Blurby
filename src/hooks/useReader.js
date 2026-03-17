import { useState, useRef, useCallback } from "react";
import { MIN_WPM, MAX_WPM, WPM_STEP, REWIND_WORDS } from "../utils/text";

const api = window.electronAPI;

export default function useReader(wpm, setWpm) {
  const [wordIndex, setWordIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const intervalRef = useRef(null);
  const wordsRef = useRef([]);
  const wordIndexRef = useRef(0);
  const playingRef = useRef(false);
  const wpmRef = useRef(wpm);
  wpmRef.current = wpm;

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    const ms = Math.round(60000 / wpmRef.current);
    intervalRef.current = setInterval(() => {
      setWordIndex((prev) => {
        const next = prev + 1;
        if (next >= wordsRef.current.length) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          playingRef.current = false;
          return prev;
        }
        wordIndexRef.current = next;
        return next;
      });
    }, ms);
  }, []);

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      clearInterval(intervalRef.current);
      setPlaying(false);
      playingRef.current = false;
    } else {
      if (wordIndexRef.current >= wordsRef.current.length - 1) {
        setWordIndex(0);
        wordIndexRef.current = 0;
      }
      setPlaying(true);
      playingRef.current = true;
      startInterval();
    }
  }, [startInterval]);

  const adjustWpm = useCallback((delta) => {
    setWpm((prev) => {
      const next = Math.max(MIN_WPM, Math.min(MAX_WPM, prev + delta));
      wpmRef.current = next;
      if (playingRef.current) startInterval();
      return next;
    });
  }, [startInterval, setWpm]);

  const seekWords = useCallback((delta) => {
    setWordIndex((prev) => {
      const next = Math.max(0, Math.min(wordsRef.current.length - 1, prev + delta));
      wordIndexRef.current = next;
      return next;
    });
  }, []);

  const exitReader = useCallback((activeDoc, onExit) => {
    clearInterval(intervalRef.current);
    setPlaying(false);
    playingRef.current = false;
    if (activeDoc) {
      api.updateDocProgress(activeDoc.id, wordIndexRef.current);
    }
    const finalPos = wordIndexRef.current;
    setWordIndex(0);
    wordIndexRef.current = 0;
    onExit(finalPos);
  }, []);

  const initReader = useCallback((position) => {
    setWordIndex(position);
    wordIndexRef.current = position;
  }, []);

  return {
    wordIndex,
    playing,
    wordsRef,
    wordIndexRef,
    togglePlay,
    adjustWpm,
    seekWords,
    exitReader,
    initReader,
  };
}

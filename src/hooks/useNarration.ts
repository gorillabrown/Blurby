import { useState, useRef, useCallback, useEffect } from "react";

export interface NarrationState {
  speaking: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  rate: number; // 0.5-3.0
}

export default function useNarration() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onWordRef = useRef<((charIndex: number) => void) | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) {
        setVoices(v);
        // Default to first English voice
        const english = v.find((voice) => voice.lang.startsWith("en")) || v[0];
        setCurrentVoice((prev) => prev || english);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text: string, startCharOffset = 0, onWord?: (charIndex: number) => void) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const textToSpeak = text.slice(startCharOffset);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (currentVoice) utterance.voice = currentVoice;
    utterance.rate = rate;
    utterance.pitch = 1;

    onWordRef.current = onWord || null;

    utterance.onboundary = (event) => {
      if (event.name === "word" && onWordRef.current) {
        // charIndex is relative to the utterance text, add back the startCharOffset
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
  }, []);

  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  const adjustRate = useCallback((newRate: number) => {
    setRate(Math.max(0.5, Math.min(3.0, newRate)));
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
    pause,
    resume,
    stop,
    selectVoice,
    adjustRate,
  };
}

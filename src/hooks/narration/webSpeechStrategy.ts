// src/hooks/narration/webSpeechStrategy.ts — Web Speech API TTS strategy
import type { TtsStrategy } from "../../types/narration";

/**
 * Create a TtsStrategy backed by the Web Speech API.
 * @param getVoice — getter for the current SpeechSynthesisVoice (or null)
 */
export function createWebSpeechStrategy(
  getVoice: () => SpeechSynthesisVoice | null,
): TtsStrategy {
  let currentUtterance: SpeechSynthesisUtterance | null = null;

  return {
    speakChunk(text, words, _startIdx, speed, onWordAdvance, onEnd, onError) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = speed;
      utterance.pitch = 1;
      let wordInChunk = 0;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const offset = wordInChunk;
          wordInChunk++;
          onWordAdvance(offset);
        }
      };

      utterance.onend = () => {
        currentUtterance = null;
        onEnd();
      };

      utterance.onerror = () => {
        currentUtterance = null;
        onError();
      };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    },

    stop() {
      currentUtterance = null;
      window.speechSynthesis?.cancel();
    },

    pause() {
      window.speechSynthesis?.pause();
    },

    resume() {
      window.speechSynthesis?.resume();
    },
  };
}

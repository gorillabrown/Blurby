import type { ReadingMode, ModeConfig, ModeState } from "./ModeInterface";
import { TTS_RATE_BASELINE_WPM } from "../constants";

/**
 * NarrationInterface — subset of useNarration's return type needed by NarrateMode.
 * Extracted here to avoid importing the full hook (which is React-specific).
 */
export interface NarrationInterface {
  startCursorDriven: (
    words: string[],
    startIdx: number,
    wpm: number,
    onAdvance: (idx: number) => void
  ) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  adjustRate: (rate: number) => void;
  setRhythmPauses: (pauses: any, breaks: Set<number>) => void;
  setPageEndWord: (idx: number | null) => void;
  setEngine: (engine: "web" | "kokoro") => void;
  speaking: boolean;
}

/**
 * NarrateMode — TTS-driven reading with word highlight.
 *
 * Unlike Focus/Flow which use setInterval-based timers, NarrateMode
 * delegates all timing to the narration engine (useNarration hook).
 * Word advancement is driven by TTS word boundary events, not timers.
 *
 * Speed is controlled by TTS rate (0.5–2.0x), not WPM. The effective
 * WPM is derived as: ttsRate × TTS_RATE_BASELINE_WPM (150).
 *
 * Rhythm pauses between chunks (250ms comma, 400ms sentence, 750ms
 * paragraph) are handled by useNarration's chunk chaining logic.
 */
export class NarrateMode implements ReadingMode {
  readonly type = "narration" as const;
  private currentWord: number = 0;
  private config: ModeConfig;
  private narration: NarrationInterface;
  private ttsRate: number;
  private playing: boolean = false;

  constructor(config: ModeConfig, narration: NarrationInterface) {
    this.config = config;
    this.narration = narration;
    this.ttsRate = config.settings.ttsRate || 1.0;
  }

  start(wordIndex: number): void {
    console.debug("[NarrateMode] start word:", wordIndex, "/", this.config.words.length, "rate:", this.ttsRate);
    this.currentWord = wordIndex;
    this.playing = true;

    // Set rhythm pauses on the narration engine
    this.narration.setRhythmPauses(
      this.config.settings.rhythmPauses || null,
      this.config.paragraphBreaks
    );

    // Set rate BEFORE starting (adjustRate after start poisons generation ID)
    this.narration.adjustRate(this.ttsRate);

    // Start cursor-driven TTS
    const effectiveWpm = this.getEffectiveWpm();
    this.narration.startCursorDriven(
      this.config.words,
      wordIndex,
      effectiveWpm,
      (idx: number) => {
        this.currentWord = idx;
        this.config.callbacks.onWordAdvance(idx);
      }
    );
  }

  pause(): void {
    this.playing = false;
    this.narration.pause();
  }

  resume(): void {
    this.playing = true;
    this.narration.resume();
  }

  stop(): void {
    this.playing = false;
    this.narration.stop();
  }

  getCurrentWord(): number {
    return this.currentWord;
  }

  setSpeed(rate: number): void {
    this.ttsRate = Math.max(0.5, Math.min(2.0, rate));
    this.narration.adjustRate(this.ttsRate);
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = wordIndex;
    // If playing, restart narration from the new position
    if (this.playing) {
      this.narration.stop();
      this.start(wordIndex);
    } else {
      this.config.callbacks.onWordAdvance(wordIndex);
    }
  }

  getState(): ModeState {
    return {
      type: "narration",
      isPlaying: this.playing,
      currentWordIndex: this.currentWord,
      effectiveWpm: this.getEffectiveWpm(),
    };
  }

  /**
   * Update the word array when new EPUB sections load.
   * Keeps current position — only extends the available words.
   */
  updateWords(words: string[]): void {
    this.config.words = words;
  }

  destroy(): void {
    // NOTE: Do NOT call this.narration.stop() here.
    // destroy() is called from useEffect cleanup, which fires AFTER the new mode
    // instance has already been started. Calling stop() on the shared narration
    // object would dispatch STOP, resetting status to "idle" and causing the
    // Kokoro IPC result to be discarded. Narration cleanup is already handled
    // by stopAllModes() in useReaderMode before any new mode starts.
    this.playing = false;
  }

  /**
   * Get the effective WPM based on TTS rate.
   * TTS rate 1.0 ≈ 150 WPM natural speech.
   */
  getEffectiveWpm(): number {
    return Math.round(this.ttsRate * TTS_RATE_BASELINE_WPM);
  }

  /**
   * Estimate time remaining from current position.
   * Uses TTS-rate-derived WPM, not the visual reading WPM.
   */
  getTimeRemaining(totalWords: number): number {
    const wordsLeft = Math.max(0, totalWords - this.currentWord);
    return (wordsLeft / this.getEffectiveWpm()) * 60000;
  }

  /** Get the current TTS rate */
  getRate(): number {
    return this.ttsRate;
  }
}

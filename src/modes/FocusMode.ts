import type { ReadingMode, ModeConfig, ModeState } from "./ModeInterface";
import { calculatePauseMs } from "../utils/rhythm";
import { PUNCTUATION_PAUSE_MS } from "../constants";

/**
 * FocusMode — RSVP (Rapid Serial Visual Presentation).
 *
 * Displays one word at a time in the center of the screen at WPM speed.
 * Uses setTimeout chain (not setInterval) so each word can have a different
 * duration based on rhythm pauses (commas, sentences, paragraphs, numbers,
 * longer words).
 *
 * Visual rendering (centered word, ORP highlight, focus marks) is handled
 * by ReaderView.tsx via the onWordAdvance callback.
 */
export class FocusMode implements ReadingMode {
  readonly type = "focus" as const;
  private currentWord: number = 0;
  private config: ModeConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private playing: boolean = false;
  private paragraphBreaks: Set<number>;

  constructor(config: ModeConfig) {
    this.config = config;
    this.paragraphBreaks = config.paragraphBreaks || new Set();
  }

  start(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.playing = true;
    this.scheduleNext();
  }

  pause(): void {
    this.playing = false;
    this.clearTimer();
  }

  resume(): void {
    if (!this.playing) {
      this.playing = true;
      this.scheduleNext();
    }
  }

  stop(): void {
    this.playing = false;
    this.clearTimer();
  }

  getCurrentWord(): number {
    return this.currentWord;
  }

  setSpeed(wpm: number): void {
    this.config.wpm = wpm;
    // If playing, the next scheduled timeout will use the new speed
    // (no need to clear/restart — the current timeout is for the current word)
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.config.callbacks.onWordAdvance(wordIndex);
    // If playing, restart the timer chain from the new position
    if (this.playing) {
      this.clearTimer();
      this.scheduleNext();
    }
  }

  getState(): ModeState {
    return {
      type: "focus",
      isPlaying: this.playing,
      currentWordIndex: this.currentWord,
      effectiveWpm: this.config.wpm,
    };
  }

  destroy(): void {
    this.clearTimer();
    this.playing = false;
  }

  /**
   * Estimate time remaining from current position to end of document.
   */
  getTimeRemaining(totalWords: number): number {
    const wordsLeft = Math.max(0, totalWords - this.currentWord);
    const msPerWord = 60000 / this.config.wpm;
    // Add ~20% overhead for rhythm pauses (rough estimate)
    return wordsLeft * msPerWord * 1.2;
  }

  // ── Internal ─────────────────────────────────────────────────────

  private scheduleNext(): void {
    if (!this.playing) return;
    if (this.currentWord >= this.config.words.length - 1) {
      this.stop();
      this.config.callbacks.onComplete();
      return;
    }

    const word = this.config.words[this.currentWord];
    const baseMs = 60000 / this.config.wpm;
    const isParagraphEnd = this.paragraphBreaks.has(this.currentWord);

    // Calculate rhythm pause for current word
    let pauseMs = 0;
    if (this.config.settings.rhythmPauses) {
      pauseMs = calculatePauseMs(
        word,
        this.config.settings.rhythmPauses,
        PUNCTUATION_PAUSE_MS,
        isParagraphEnd
      );
    }

    const totalMs = baseMs + pauseMs;

    this.timer = setTimeout(() => {
      this.currentWord++;
      this.config.callbacks.onWordAdvance(this.currentWord);
      this.scheduleNext(); // Chain — next word may have different duration
    }, totalMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

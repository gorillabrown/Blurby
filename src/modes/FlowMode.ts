import type { ReadingMode, ModeConfig, ModeState } from "./ModeInterface";
import { calculatePauseMs } from "../utils/rhythm";
import { PUNCTUATION_PAUSE_MS } from "../constants";

/**
 * FlowMode — Sliding cursor underline across text at WPM speed.
 *
 * A visual cursor (underline or box) slides across the rendered text,
 * highlighting the current word and advancing at the configured WPM.
 * Uses setTimeout chain for variable-duration rhythm pauses.
 *
 * Visual rendering (cursor position, CSS transitions) is handled by
 * FlowCursorController (non-EPUB) or FoliatePageView overlay (EPUB).
 * This class manages timing and word advancement only.
 */
export class FlowMode implements ReadingMode {
  readonly type = "flow" as const;
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
    this.config.callbacks.onWordAdvance(wordIndex); // Highlight initial word
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
    // Current timeout runs out at old speed; next word uses new speed
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.config.callbacks.onWordAdvance(wordIndex);
    if (this.playing) {
      this.clearTimer();
      this.scheduleNext();
    }
  }

  getState(): ModeState {
    return {
      type: "flow",
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
   * Estimate time remaining from current position.
   */
  getTimeRemaining(totalWords: number): number {
    const wordsLeft = Math.max(0, totalWords - this.currentWord);
    const msPerWord = 60000 / this.config.wpm;
    return wordsLeft * msPerWord * 1.1; // ~10% overhead for rhythm pauses
  }

  /**
   * Jump to the start of the previous visual line.
   * Caller provides the word index of the line start.
   */
  prevLine(lineStartWordIndex: number): void {
    this.jumpTo(lineStartWordIndex);
  }

  /**
   * Jump to the start of the next visual line.
   * Caller provides the word index of the line start.
   */
  nextLine(lineStartWordIndex: number): void {
    this.jumpTo(lineStartWordIndex);
  }

  /**
   * Update the word array when new EPUB sections load.
   * Keeps current position — only extends the available words.
   */
  updateWords(words: string[]): void {
    this.config.words = words;
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

    // Flow rhythm pauses are shorter than Focus — halved for visual-only
    let pauseMs = 0;
    if (this.config.settings.rhythmPauses) {
      pauseMs = Math.round(
        calculatePauseMs(
          word,
          this.config.settings.rhythmPauses,
          PUNCTUATION_PAUSE_MS,
          isParagraphEnd
        ) * 0.5 // Half-duration for visual-only pauses
      );
    }

    const totalMs = baseMs + pauseMs;

    this.timer = setTimeout(() => {
      this.currentWord++;
      this.config.callbacks.onWordAdvance(this.currentWord);
      this.scheduleNext();
    }, totalMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

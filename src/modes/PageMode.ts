import type { ReadingMode, ModeConfig, ModeState } from "./ModeInterface";

/**
 * PageMode — Default paginated reading.
 *
 * No auto-advance. User reads at their own pace, clicks words,
 * turns pages manually. This is the "home" mode that all other
 * modes return to when paused.
 */
export class PageMode implements ReadingMode {
  readonly type = "page" as const;
  private currentWord: number = 0;
  private config: ModeConfig;

  constructor(config: ModeConfig) {
    this.config = config;
  }

  start(wordIndex: number): void {
    this.currentWord = wordIndex;
  }

  pause(): void { /* No-op */ }
  resume(): void { /* No-op */ }
  stop(): void { /* No-op */ }

  getCurrentWord(): number {
    return this.currentWord;
  }

  setSpeed(wpm: number): void {
    this.config.wpm = wpm;
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.config.callbacks.onWordAdvance(wordIndex);
  }

  getState(): ModeState {
    return {
      type: "page",
      isPlaying: false,
      currentWordIndex: this.currentWord,
      effectiveWpm: this.config.wpm,
    };
  }

  destroy(): void { /* Nothing to clean up */ }

  /**
   * Estimate time remaining from current position to end of document.
   */
  getTimeRemaining(totalWords: number): number {
    const wordsLeft = Math.max(0, totalWords - this.currentWord);
    return (wordsLeft / this.config.wpm) * 60000;
  }
}

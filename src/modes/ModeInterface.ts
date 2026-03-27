/**
 * ReadingMode — Uniform interface for all reading modes.
 *
 * Each mode is a self-contained module implementing this contract.
 * ReaderContainer orchestrates transitions between modes via useReaderMode.
 * The mode itself handles its internal state, rendering logic, and cleanup.
 *
 * Lifecycle:
 *   create → start(wordIdx) → [advance/pause/resume/setSpeed] → stop → destroy
 *
 * Modes:
 *   - PageMode:    Paginated reading, word click selection, no auto-advance
 *   - FocusMode:   RSVP word-at-a-time display at center screen
 *   - FlowMode:    Sliding cursor underline across text at WPM speed
 *   - NarrateMode: TTS-driven reading with word highlight + auto page turn
 */

export type ModeType = "page" | "focus" | "flow" | "narration";

export interface ModeState {
  /** Current mode type */
  type: ModeType;
  /** Whether the mode is actively advancing (playing) */
  isPlaying: boolean;
  /** Current word index in the document's word array */
  currentWordIndex: number;
  /** Words per minute (for visual modes) or derived from TTS rate (for narration) */
  effectiveWpm: number;
}

export interface ModeCallbacks {
  /** Called when the mode advances to a new word */
  onWordAdvance: (wordIndex: number) => void;
  /** Called when the mode needs to turn the page */
  onPageTurn: (direction: "next" | "prev") => void;
  /** Called when the mode completes (reached end of document) */
  onComplete: () => void;
  /** Called when the mode encounters an error */
  onError: (error: Error) => void;
}

export interface ReadingMode {
  /** The mode type identifier */
  readonly type: ModeType;

  /**
   * Start the mode from a specific word index.
   * For Focus: begins RSVP display.
   * For Flow: starts cursor sliding.
   * For Narrate: begins TTS playback.
   * For Page: no-op (page mode is always "started").
   */
  start(wordIndex: number): void;

  /**
   * Pause the mode without losing position.
   * For Focus/Flow: stops word advancement timer.
   * For Narrate: pauses TTS playback.
   * For Page: no-op.
   */
  pause(): void;

  /**
   * Resume from where pause() left off.
   */
  resume(): void;

  /**
   * Stop the mode completely. Cleans up timers, audio, DOM elements.
   * After stop(), the mode can be start()ed again from a new position.
   */
  stop(): void;

  /**
   * Get the current word index the mode is at.
   */
  getCurrentWord(): number;

  /**
   * Change the reading speed.
   * For Focus/Flow: sets WPM.
   * For Narrate: sets TTS rate (0.5–2.0).
   */
  setSpeed(value: number): void;

  /**
   * Jump to a specific word (e.g., user clicked a word).
   * The mode continues from the new position.
   */
  jumpTo(wordIndex: number): void;

  /**
   * Get the current state of the mode.
   */
  getState(): ModeState;

  /**
   * Clean up all resources. Called when the mode is being unmounted.
   * After destroy(), the mode instance should not be used again.
   */
  destroy(): void;
}

/**
 * Configuration passed to mode constructors.
 */
export interface ModeConfig {
  /** The full word array for the document */
  words: string[];
  /** Words per minute setting */
  wpm: number;
  /** Callbacks for mode events */
  callbacks: ModeCallbacks;
  /** Whether this is a foliate-rendered EPUB */
  isFoliate: boolean;
  /** Set of word indices that end a paragraph (for rhythm pauses) */
  paragraphBreaks: Set<number>;
  /** Settings relevant to the mode */
  settings: {
    rhythmPauses?: any;
    ttsRate?: number;
    ttsEngine?: string;
    ttsVoiceName?: string;
    focusSpan?: number;
    focusMarks?: boolean;
    flowWordsPerHighlight?: number;
    flowCursorStyle?: string;
  };
}

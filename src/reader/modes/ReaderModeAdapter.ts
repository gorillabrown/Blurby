/**
 * ReaderModeAdapter — Typed adapter contracts for the reader mode system.
 *
 * Each reader mode (page, focus, flow, narrate) implements ReaderModeAdapter.
 * The adapter expresses:
 *   - Mode identity (mode field)
 *   - Selected vs playing state
 *   - Current word position
 *   - Clock ownership (who is advancing the word cursor)
 *   - Lifecycle actions (select, start, pause, resume, stop, jumpToWord, destroy)
 *
 * Clock owners:
 *   "none"         — no active advancement; mode is idle or paused
 *   "wpm"          — WPM timer drives word advancement (focus/flow modes)
 *   "flow-engine"  — FlowScrollEngine drives word advancement (flow mode with scroll sync)
 *   "audio-truth"  — Audio playback position drives word advancement (narrate mode)
 */

export type ReaderModeId = "page" | "focus" | "flow" | "narrate";

export type ReaderModeStartCause =
  | "play-button"
  | "space"
  | "resume-after-section"
  | "resume-after-book"
  | "programmatic";

export interface ReaderModeStartRequest {
  mode: ReaderModeId;
  wordIndex: number;
  words: string[];
  paragraphBreaks: Set<number>;
  cause: ReaderModeStartCause;
}

export interface ReaderModeRuntimeSnapshot {
  mode: ReaderModeId;
  /** True when this mode is the currently active (selected) mode */
  selected: boolean;
  /** True when this mode is actively advancing the word cursor */
  playing: boolean;
  /** The word index this mode is currently at */
  currentWordIndex: number;
  /** What is driving word cursor advancement */
  clockOwner: "none" | "wpm" | "flow-engine" | "audio-truth";
}

export interface ReaderModeAdapter {
  /** The mode this adapter represents */
  readonly mode: ReaderModeId;

  /**
   * Mark this mode as selected (active) at a given word index.
   * Does not start advancement. Use start() to begin playing.
   */
  select(wordIndex: number): void;

  /**
   * Begin playing from a specified start request.
   * Any pending explicit-selection or resume anchor should be consumed before calling.
   */
  start(request: ReaderModeStartRequest): void;

  /**
   * Pause active advancement without losing position.
   * clockOwner transitions to "none".
   */
  pause(): void;

  /**
   * Resume from where pause() left off.
   * clockOwner returns to its prior owner.
   */
  resume(): void;

  /**
   * Stop the mode completely.
   * @param reason Why the mode is being stopped.
   */
  stop(
    reason: "mode-switch" | "user-stop" | "book-close" | "teardown"
  ): void;

  /**
   * Jump the word cursor to a new position.
   * The mode continues playing (if playing) from the new position.
   * @param wordIndex Target word index (0 is a valid value).
   * @param cause Why the jump is happening.
   */
  jumpToWord(
    wordIndex: number,
    cause: "hard-selection" | "navigation" | "restore"
  ): void;

  /**
   * Return a snapshot of this mode's current runtime state.
   * Must be a pure read — no side effects.
   */
  getSnapshot(): ReaderModeRuntimeSnapshot;

  /**
   * Release all resources. After destroy(), this adapter must not be used again.
   */
  destroy(): void;
}

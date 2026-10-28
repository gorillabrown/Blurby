/**
 * useCurrentWordAnchor — Plain factory that manages the current word anchor.
 *
 * Replaces ad hoc anchor ref ordering scattered across the reader.
 * Implemented as a plain factory function (no React) so it is testable without
 * a React environment.
 *
 * Anchor source priority (highest → lowest):
 *   1. explicit-selection  — user click/tap on a specific word
 *   2. hard-highlight      — programmatic highlight with specific word
 *   3. resume              — pause/reopen position
 *   4. navigation          — chapter/section jump
 *   5. mode-advance        — active mode's cursor advancement
 *   6. restore             — book-open position restore
 *   7. soft-visible        — passive first-visible-word scan
 *
 * CRITICAL: Word index 0 is valid. All checks use `!= null` or
 * `typeof x === "number"` — never truthiness (which would treat 0 as missing).
 *
 * Consumption semantics:
 *   explicit-selection and resume are one-shot: consumeForModeStart() returns
 *   the highest-priority value and clears those two anchors.
 *   All other anchors are persistent until explicitly replaced or cleared.
 *
 * clearTransient():
 *   Clears soft-visible and mode-advance but preserves explicit-selection,
 *   hard-highlight, resume, navigation, and restore anchors.
 */

import type { ReaderModeId } from "../modes/ReaderModeAdapter";

export type AnchorSource =
  | "explicit-selection"
  | "resume"
  | "hard-highlight"
  | "soft-visible"
  | "mode-advance"
  | "navigation"
  | "restore";

export interface CurrentWordAnchor {
  /**
   * Return the current best word index, respecting priority order.
   * Returns 0 if no anchor has ever been set (word 0 is always valid).
   */
  getCurrent(): number;

  /** User explicitly selected a word (highest priority). One-shot on consume. */
  setExplicitSelection(wordIndex: number): void;

  /** Programmatic highlight to a specific word (second priority). Persistent. */
  setHardHighlight(wordIndex: number): void;

  /** Pause or reopen position (third priority). One-shot on consume. */
  setResume(wordIndex: number): void;

  /** Chapter or section navigation jump (fourth priority). Persistent. */
  setNavigation(wordIndex: number): void;

  /**
   * Active mode cursor advancement (fifth priority).
   * Only accepted when `mode` matches the currently active mode set via
   * setActiveMode(). Inactive modes' advances are silently ignored.
   */
  setModeAdvance(mode: ReaderModeId, wordIndex: number): void;

  /** Book-open position restore (sixth priority). Persistent. */
  setRestore(wordIndex: number): void;

  /** Passive first-visible-word scan (lowest priority). Persistent. */
  setSoftVisible(wordIndex: number): void;

  /**
   * Declare which mode is currently active.
   * setModeAdvance() calls from other modes are ignored until this changes.
   */
  setActiveMode(mode: ReaderModeId | null): void;

  /**
   * Return the highest-priority anchor available and consume one-shot anchors
   * (explicit-selection and resume). Used by the start() path.
   */
  consumeForModeStart(mode: ReaderModeId): number;

  /**
   * Clear transient (ephemeral) anchors: soft-visible and mode-advance.
   * Preserves: explicit-selection, hard-highlight, resume, navigation, restore.
   */
  clearTransient(): void;
}

/** Internal state for the anchor service. */
interface AnchorState {
  explicitSelection: number | null;
  hardHighlight: number | null;
  resume: number | null;
  navigation: number | null;
  modeAdvance: number | null;
  restore: number | null;
  softVisible: number | null;
  activeMode: ReaderModeId | null;
}

/**
 * Return the highest-priority defined anchor value from state.
 * Priority: explicit-selection > hard-highlight > resume > navigation >
 *           mode-advance > restore > soft-visible > 0 (default)
 */
function resolveCurrent(state: AnchorState): number {
  if (typeof state.explicitSelection === "number") return state.explicitSelection;
  if (typeof state.hardHighlight === "number") return state.hardHighlight;
  if (typeof state.resume === "number") return state.resume;
  if (typeof state.navigation === "number") return state.navigation;
  if (typeof state.modeAdvance === "number") return state.modeAdvance;
  if (typeof state.restore === "number") return state.restore;
  if (typeof state.softVisible === "number") return state.softVisible;
  return 0;
}

/**
 * Create a CurrentWordAnchor service.
 *
 * @example
 * const anchor = createCurrentWordAnchor();
 * anchor.setExplicitSelection(42);
 * const startIndex = anchor.consumeForModeStart("focus"); // 42, clears explicit
 */
export function createCurrentWordAnchor(): CurrentWordAnchor {
  const state: AnchorState = {
    explicitSelection: null,
    hardHighlight: null,
    resume: null,
    navigation: null,
    modeAdvance: null,
    restore: null,
    softVisible: null,
    activeMode: null,
  };

  return {
    getCurrent(): number {
      return resolveCurrent(state);
    },

    setExplicitSelection(wordIndex: number): void {
      state.explicitSelection = wordIndex;
    },

    setHardHighlight(wordIndex: number): void {
      state.hardHighlight = wordIndex;
    },

    setResume(wordIndex: number): void {
      state.resume = wordIndex;
    },

    setNavigation(wordIndex: number): void {
      state.navigation = wordIndex;
    },

    setModeAdvance(mode: ReaderModeId, wordIndex: number): void {
      // Only accept advances from the currently active mode.
      if (state.activeMode !== mode) return;
      state.modeAdvance = wordIndex;
    },

    setRestore(wordIndex: number): void {
      state.restore = wordIndex;
    },

    setSoftVisible(wordIndex: number): void {
      state.softVisible = wordIndex;
    },

    setActiveMode(mode: ReaderModeId | null): void {
      if (state.activeMode !== mode) {
        state.modeAdvance = null;
      }
      state.activeMode = mode;
    },

    consumeForModeStart(_mode: ReaderModeId): number {
      const result = resolveCurrent(state);
      // Consume only the one-shot anchor that was the winner.
      // explicit-selection wins over resume, so clear whichever was highest.
      if (typeof state.explicitSelection === "number") {
        state.explicitSelection = null;
      } else if (typeof state.resume === "number") {
        state.resume = null;
      }
      return result;
    },

    clearTransient(): void {
      state.softVisible = null;
      state.modeAdvance = null;
    },
  };
}

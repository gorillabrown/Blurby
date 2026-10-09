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

import type { ComponentType } from "react";
import type { ReaderDocumentSnapshot, ReaderModeHandoff, ReaderSessionKey, ReaderSettingsSnapshot } from "../document/ReaderDocumentSnapshot";
import type { ReaderPorts } from "../ports/ReaderPorts";

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

// ── Runtime contract v1 (READER-MODE-SEPARATION-2, OC-2) ─────────────────────
// Sibling of ReaderModeAdapter: same seven lifecycle actions and snapshot semantics,
// but the start request carries no Set or word array (sets never cross a mode boundary).
// The legacy types above stay unchanged for the legacy adapters.

export const READER_MODE_RUNTIME_CONTRACT_VERSION = 1 as const;
export type ReaderModeStopReason = Parameters<ReaderModeAdapter["stop"]>[0];
export type ReaderModeJumpCause = Parameters<ReaderModeAdapter["jumpToWord"]>[1];

/** How the router entered this runtime; selects the legacy arrival effects. */
export type ReaderModeArrival = "select" | "pause-to-page" | "silent";

export interface ReaderModeStartRequestV1 {
  readonly cause: ReaderModeStartCause;
}

export type ReaderModeSpeed =
  | { readonly kind: "wpm"; readonly wpm: number }    // Focus, Flow
  | { readonly kind: "rate"; readonly rate: number }; // Narrate

export interface ReaderModeRuntimeSnapshotV1 extends ReaderModeRuntimeSnapshot {
  readonly contractVersion: typeof READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  /** Published highlight (legacy highlightedWordIndex state). */
  readonly highlightedWordIndex: number;
  /** Legacy persistentWordIndex state. */
  readonly publishedWordIndex: number;
  /** Legacy persistentWordIndexRef.current. */
  readonly canonicalWordIndex: number;
  readonly isBrowsedAway: boolean;
  /** Narrate session flag (legacy isNarrating); always false in the other three modes. */
  readonly narrating: boolean;
  /** null in Page. */
  readonly speed: ReaderModeSpeed | null;
  /** Flow only; null elsewhere. */
  readonly flowProgress: Readonly<{ bookPct: number; estimatedMinutesLeft: number }> | null;
}

export type ReaderModeCommand =
  | { readonly kind: "seek-words"; readonly delta: number }                                      // Focus
  | { readonly kind: "flow-line"; readonly direction: "prev" | "next" }                         // Flow
  | { readonly kind: "move-selection"; readonly direction: "left" | "right" | "up" | "down" } // Page
  | { readonly kind: "paragraph"; readonly direction: "prev" | "next" }                         // Page
  | { readonly kind: "sentence"; readonly direction: "prev" | "next" }                          // Page
  | { readonly kind: "go-to-href"; readonly href: string };                                     // all (TOC jump)

export interface ReaderHardSelectInput {
  readonly cfi: string | null;
  readonly word: string;
  readonly sectionIndex?: number;
  readonly wordOffsetInSection?: number;
  readonly globalWordIndex?: number;
}

export interface ReaderModeRuntime {
  readonly mode: ReaderModeId;
  readonly contractVersion: typeof READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  // The seven lifecycle actions (snapshot semantics retained).
  select(wordIndex: number): void;
  start(request: ReaderModeStartRequestV1): void;
  pause(): void;
  resume(): void;
  /** Idempotent. */
  stop(reason: ReaderModeStopReason, context?: { readonly destination: ReaderModeId }): void;
  jumpToWord(wordIndex: number, cause: ReaderModeJumpCause): void;
  /** Pure: a new frozen object per call with equal values. */
  getSnapshot(): ReaderModeRuntimeSnapshotV1;
  /** Idempotent. */
  destroy(): void;
  // Router-issued user intents (same surface in all four modes; unsupported = no-op).
  togglePlay(): void;
  hardSelect(input: ReaderHardSelectInput): void;
  /** Chapter prev/next/jump (legacy commitSharedWordAnchor explicit-navigation). */
  navigateTo(wordIndex: number): void;
  /** Legacy handleJumpBackToPersistentWord. */
  jumpBack(): void;
  /** Legacy adjustSpeed (keyboard up/down). */
  adjustSpeed(delta: number): void;
  /** Speed dialog; Page ignores it. */
  setSpeed(speed: ReaderModeSpeed): void;
  /** Replaces this runtime's private settings copy only. */
  applySettings(next: ReaderSettingsSnapshot): void;
  handleCommand(command: ReaderModeCommand): void;
  /** Pure value export. */
  exportHandoff(capture: "persistent" | "capture-current"): ReaderModeHandoff;
  subscribe(listener: () => void): () => void;
}

export interface ReaderModeCreateInput {
  readonly key: ReaderSessionKey;
  readonly ports: ReaderPorts;
  readonly document: ReaderDocumentSnapshot;
  readonly settings: ReaderSettingsSnapshot;
  readonly handoff: ReaderModeHandoff;
  readonly arrival: ReaderModeArrival;
}

export interface ReaderModeViewProps {
  readonly runtime: ReaderModeRuntime;
}

export interface ReaderModeModule<M extends ReaderModeId = ReaderModeId> {
  readonly id: M;
  readonly contractVersion: typeof READER_MODE_RUNTIME_CONTRACT_VERSION;
  /** Must make no port calls and start no timers. */
  createRuntime(input: ReaderModeCreateInput): ReaderModeRuntime;
  readonly View: ComponentType<ReaderModeViewProps>;
}

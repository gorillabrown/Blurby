// Page mode state (READER-MODE-SEPARATION-2 design §B.0). Every field is Page's own copy of a legacy
// ref/state, built only from the frozen handoff. No module-level state.
import type { ReaderModeHandoff } from "../../document/ReaderDocumentSnapshot";
import type { PersistentReadingAnchorState } from "./helpers/usePersistentReadingAnchor";

export class PageModeState implements PersistentReadingAnchorState {
  canonicalWordIndex: number;
  publishedWordIndex: number;
  highlightedWordIndex: number;
  publishedHighlightedWordIndex: number;
  softWordIndex: number;
  explicitSelectionAnchor: number | null;
  resumeAnchor: number | null;
  cfi: string | null;
  /** Legacy userExplicitSelectionRef (TTS-7J / SELECTION-1). */
  userExplicitSelection = false;
  /** Page's copy of useProgressTracker hasEngagedRef (the shell is told through persistence.markEngaged). */
  hasEngaged = false;
  isBrowsedAway = false;
  /** Legacy foliateRenderVersion. */
  renderVersion = 0;
  selected = false;
  currentWordIndex: number;
  /** Bumped on every notify; the React binding subscribes to it. */
  version = 0;
  private readonly listeners = new Set<() => void>();

  constructor(handoff: ReaderModeHandoff) {
    this.canonicalWordIndex = handoff.canonicalWordIndex;
    this.publishedWordIndex = handoff.publishedWordIndex;
    this.highlightedWordIndex = handoff.highlightedWordIndex;
    this.publishedHighlightedWordIndex = handoff.highlightedWordIndex;
    this.softWordIndex = handoff.softWordIndex;
    this.explicitSelectionAnchor = handoff.explicitSelectionAnchor;
    // OBS-A3-2 (decision #12): arriving from another mode, seed the resume anchor so the fresh view's
    // first relocate cannot overwrite the handed-off highlight with floor(fraction × wordCount).
    this.resumeAnchor = handoff.resumeAnchor ?? (handoff.source !== null ? handoff.highlightedWordIndex : null);
    this.cfi = handoff.cfi;
    this.currentWordIndex = handoff.canonicalWordIndex;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  notify(): void {
    this.version += 1;
    for (const listener of [...this.listeners]) listener();
  }
}

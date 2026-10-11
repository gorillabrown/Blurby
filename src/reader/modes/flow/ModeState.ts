// Flow mode state (READER-MODE-SEPARATION-2 design §B.0). Every field is Flow's own copy of a legacy
// ref/state, built only from the frozen handoff. No module-level state.
import type { ReaderModeHandoff } from "../../document/ReaderDocumentSnapshot";
import type { ReaderModeRuntimeSnapshotV1 } from "../ReaderModeAdapter";
import type { ChunkReadingVisualState } from "../../../types/chunkReading";
import type { PersistentReadingAnchorState } from "./helpers/usePersistentReadingAnchor";

export class FlowModeState implements PersistentReadingAnchorState {
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
  /** Flow's copy of useProgressTracker hasEngagedRef, seeded from the handoff (persists per document). */
  engaged: boolean;
  isBrowsedAway = false;
  /** Legacy foliateRenderVersion. */
  renderVersion = 0;
  selected = false;
  currentWordIndex: number;
  /** Legacy flowPlaying. */
  playing = false;
  /** Legacy useReadingModeInstance.pendingResumeRef (Flow pause-on-miss). */
  pendingResume: number | null = null;
  /** Design §F.2: a start that waits for this mode's view to load its first section. */
  pendingStartOnLoad = false;
  /** Legacy useFoliateSync effect 3 refs (currentNarrationSectionRef starts at -1). */
  currentSection = -1;
  lastGoToSectionTime = 0;
  /** Legacy ReaderContainer flowProgress (FlowScrollEngine onProgressUpdate). */
  flowProgress: ReaderModeRuntimeSnapshotV1["flowProgress"] = null;
  /** Legacy ReaderContainer chunkReadingVisualState, Flow's publisher (publishFlowVisualState). */
  chunkVisualState: ChunkReadingVisualState | null = null;
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
    this.resumeAnchor = handoff.resumeAnchor;
    this.cfi = handoff.cfi;
    this.engaged = handoff.engaged;
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

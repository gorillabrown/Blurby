// Narrate mode state (NARRATE-REBUILD-1 P4; READER-MODE-SEPARATION-2 design §B.0). Every field is Narrate's
// own copy of a legacy ref/state, built only from the frozen handoff, plus the rebuilt engine's published
// facts. No module-level state.
import type { ReaderModeHandoff } from "../../document/ReaderDocumentSnapshot";
import type { PersistentReadingAnchorState } from "./helpers/usePersistentReadingAnchor";
import type { EngineFailure } from "./engine/narrateEngine";

export class NarrateModeState implements PersistentReadingAnchorState {
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
  /** Narrate's copy of useProgressTracker hasEngagedRef, seeded from the handoff (persists per document). */
  engaged: boolean;
  isBrowsedAway = false;
  /** Legacy foliateRenderVersion. */
  renderVersion = 0;
  selected = false;
  currentWordIndex: number;
  /** The engine is playing (its clock owns the cursor). */
  playing = false;
  /** A narration session exists (playing or paused by the user); cleared on stop. */
  narrating = false;
  /** F5: a start was requested and no word has been scheduled yet (the voice may be loading). */
  loading = false;
  /** F4: the engine refused a chunk; narration is paused on the last exactly-timed word. */
  failure: EngineFailure | null = null;
  /** Legacy useReadingModeInstance.pendingResumeRef (section-miss resume). */
  pendingResume: number | null = null;
  /** Design §F.2: a start that waits for this mode's view to load its first section. */
  pendingStartOnLoad = false;
  /** Legacy useFoliateSync effect 3 refs (currentNarrationSectionRef starts at -1). */
  currentSection = -1;
  /** BUG-191: the section a navigation is heading to; at most one in flight, cleared when its goToSection settles. */
  sectionNavInFlight: number | null = null;
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

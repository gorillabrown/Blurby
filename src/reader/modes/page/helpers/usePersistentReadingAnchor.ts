// Page-private copy of src/hooks/usePersistentReadingAnchor.ts (READER-MODE-SEPARATION-2 design §B.0).
// The hook became a non-hook over this mode's own state: refs and state setters are fields of
// PersistentReadingAnchorState, `jumpToWord` is the mode-local display jump, IPC and diagnostics go
// through the session's ports. The bodies are the legacy ones. The legacy book-open effect is
// createInitialHandoff (src/reader/document/ReaderDocumentSnapshot.ts) and is not re-run per mount.
import type { ReaderDiagnosticsPort, ReaderPersistencePort } from "../../../ports/ReaderPorts";
import { clampPersistentWordIndex } from "./persistentReadingAnchor";

export type PersistentAnchorCause =
  | "book-open"
  | "hard-selection"
  | "mode-advance"
  | "explicit-navigation"
  | "jump-back";

export interface CommitPersistentWordOptions {
  cfi?: string | null;
  navigate?: boolean;
  publishState?: boolean;
  persist?: boolean;
  syncVisual?: boolean;
}

/** The mode-owned fields the anchor writes (legacy refs and state, one copy per mode). */
export interface PersistentReadingAnchorState {
  /** persistentWordIndexRef.current */
  canonicalWordIndex: number;
  /** persistentWordIndex state */
  publishedWordIndex: number;
  /** highlightedWordIndexRef.current */
  highlightedWordIndex: number;
  /** highlightedWordIndex state (setHighlightedWordIndex) */
  publishedHighlightedWordIndex: number;
  softWordIndex: number;
  explicitSelectionAnchor: number | null;
  resumeAnchor: number | null;
  /** This mode's copy of activeDoc.cfi. */
  cfi: string | null;
}

export interface PersistentReadingAnchorDeps {
  readonly documentId: string;
  totalWordCount(): number;
  /** Legacy useReader.jumpToWord; a mode-local display jump (OC-3). */
  jumpDisplayToWord(wordIndex: number): void;
  readonly persistence: ReaderPersistencePort;
  readonly diagnostics: ReaderDiagnosticsPort;
}

export interface PersistentReadingAnchor {
  commitPersistentWordIndex(wordIndex: number, cause: PersistentAnchorCause, options?: CommitPersistentWordOptions): number;
  syncVisualToPersistentWord(options?: { navigate?: boolean }): number;
}

export function createPersistentReadingAnchor(
  state: PersistentReadingAnchorState,
  deps: PersistentReadingAnchorDeps,
): PersistentReadingAnchor {
  const writeRefs = (wordIndex: number, cause: PersistentAnchorCause) => {
    state.canonicalWordIndex = wordIndex;
    state.highlightedWordIndex = wordIndex;
    state.softWordIndex = wordIndex;
    if (cause !== "mode-advance") {
      state.resumeAnchor = wordIndex;
      // NARRATE-DUAL-SOURCE-DIAG-1: resumeAnchor:set (usePersistentReadingAnchor)
      deps.diagnostics.transition("resumeAnchor:set", () => ({
        resumeAnchor: wordIndex,
        source: `usePersistentReadingAnchor:writeRefs:${cause}`,
      }));
    }
    if (cause === "hard-selection" || cause === "explicit-navigation") {
      state.explicitSelectionAnchor = wordIndex;
    } else if (cause === "book-open") {
      state.explicitSelectionAnchor = null;
    }
  };

  const commitPersistentWordIndex = (
    wordIndex: number,
    cause: PersistentAnchorCause,
    options: CommitPersistentWordOptions = {},
  ): number => {
    const clamped = clampPersistentWordIndex(wordIndex, deps.totalWordCount());
    writeRefs(clamped, cause);
    const shouldPublishState = options.publishState ?? cause !== "mode-advance";
    if (shouldPublishState) {
      state.publishedWordIndex = clamped;
    }

    if (options.syncVisual !== false) {
      state.publishedHighlightedWordIndex = clamped;
    }
    if (options.navigate !== false) {
      deps.jumpDisplayToWord(clamped);
    }

    const shouldPersist = options.persist ?? (cause === "hard-selection" || cause === "explicit-navigation");
    if (shouldPersist) {
      const cfi = options.cfi ?? state.cfi ?? undefined;
      deps.persistence.updateDocProgress(deps.documentId, clamped, cfi);
      deps.persistence.updateProgress(deps.documentId, clamped);
    }

    return clamped;
  };

  const syncVisualToPersistentWord = (options: { navigate?: boolean } = {}): number => {
    const clamped = clampPersistentWordIndex(state.canonicalWordIndex, deps.totalWordCount());
    writeRefs(clamped, "jump-back");
    state.publishedWordIndex = clamped;
    state.publishedHighlightedWordIndex = clamped;
    if (options.navigate !== false) {
      deps.jumpDisplayToWord(clamped);
    }
    return clamped;
  };

  return { commitPersistentWordIndex, syncVisualToPersistentWord };
}

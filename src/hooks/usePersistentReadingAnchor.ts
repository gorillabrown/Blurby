import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { clampPersistentWordIndex } from "../utils/persistentReadingAnchor";
import { logDualSourceTransition } from "../utils/dualSourceDiag";

type PersistentAnchorCause =
  | "book-open"
  | "hard-selection"
  | "mode-advance"
  | "explicit-navigation"
  | "jump-back";

interface ActiveAnchorDoc {
  id: string;
  position?: number | null;
  wordCount?: number | null;
  cfi?: string | null;
}

interface CommitPersistentWordOptions {
  cfi?: string | null;
  navigate?: boolean;
  publishState?: boolean;
  persist?: boolean;
  syncVisual?: boolean;
}

interface UsePersistentReadingAnchorParams {
  activeDoc: ActiveAnchorDoc;
  totalWordCount: number;
  highlightedWordIndexRef: MutableRefObject<number>;
  softWordIndexRef: MutableRefObject<number | null>;
  explicitSelectionAnchorRef: MutableRefObject<number | null>;
  resumeAnchorRef: MutableRefObject<number | null>;
  setHighlightedWordIndex: Dispatch<SetStateAction<number>>;
  jumpToWord: (wordIndex: number) => void;
  onUpdateProgress: (docId: string, position: number) => void;
}

interface UsePersistentReadingAnchorReturn {
  persistentWordIndex: number;
  persistentWordIndexRef: MutableRefObject<number>;
  commitPersistentWordIndex: (
    wordIndex: number,
    cause: PersistentAnchorCause,
    options?: CommitPersistentWordOptions,
  ) => number;
  syncVisualToPersistentWord: (options?: { navigate?: boolean }) => number;
}

export function usePersistentReadingAnchor({
  activeDoc,
  totalWordCount,
  highlightedWordIndexRef,
  softWordIndexRef,
  explicitSelectionAnchorRef,
  resumeAnchorRef,
  setHighlightedWordIndex,
  jumpToWord,
  onUpdateProgress,
}: UsePersistentReadingAnchorParams): UsePersistentReadingAnchorReturn {
  const initialWordIndex = clampPersistentWordIndex(activeDoc.position ?? 0, totalWordCount);
  const persistentWordIndexRef = useRef(initialWordIndex);
  const [persistentWordIndex, setPersistentWordIndex] = useState(initialWordIndex);

  const writeRefs = useCallback((wordIndex: number, cause: PersistentAnchorCause) => {
    persistentWordIndexRef.current = wordIndex;
    highlightedWordIndexRef.current = wordIndex;
    softWordIndexRef.current = wordIndex;
    resumeAnchorRef.current = wordIndex;
    // NARRATE-DUAL-SOURCE-DIAG-1: resumeAnchor:set (usePersistentReadingAnchor)
    logDualSourceTransition("resumeAnchor:set", () => ({
      resumeAnchor: wordIndex,
      source: `usePersistentReadingAnchor:writeRefs:${cause}`,
    }));
    if (cause === "hard-selection" || cause === "explicit-navigation") {
      explicitSelectionAnchorRef.current = wordIndex;
    } else if (cause === "book-open") {
      explicitSelectionAnchorRef.current = null;
    }
  }, [
    explicitSelectionAnchorRef,
    highlightedWordIndexRef,
    persistentWordIndexRef,
    resumeAnchorRef,
    softWordIndexRef,
  ]);

  useEffect(() => {
    const restoredWordIndex = clampPersistentWordIndex(activeDoc.position ?? 0, totalWordCount);
    writeRefs(restoredWordIndex, "book-open");
    setPersistentWordIndex(restoredWordIndex);
    setHighlightedWordIndex(restoredWordIndex);
  }, [activeDoc.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const commitPersistentWordIndex = useCallback((
    wordIndex: number,
    cause: PersistentAnchorCause,
    options: CommitPersistentWordOptions = {},
  ): number => {
    const clamped = clampPersistentWordIndex(wordIndex, totalWordCount);
    writeRefs(clamped, cause);
    const shouldPublishState = options.publishState ?? cause !== "mode-advance";
    if (shouldPublishState) {
      setPersistentWordIndex(clamped);
    }

    if (options.syncVisual !== false) {
      setHighlightedWordIndex(clamped);
    }
    if (options.navigate !== false) {
      jumpToWord(clamped);
    }

    const shouldPersist = options.persist ?? (cause === "hard-selection" || cause === "explicit-navigation");
    if (shouldPersist) {
      const cfi = options.cfi ?? activeDoc.cfi ?? undefined;
      window.electronAPI.updateDocProgress(activeDoc.id, clamped, cfi);
      onUpdateProgress(activeDoc.id, clamped);
    }

    return clamped;
  }, [
    activeDoc.cfi,
    activeDoc.id,
    jumpToWord,
    onUpdateProgress,
    setHighlightedWordIndex,
    totalWordCount,
    writeRefs,
  ]);

  const syncVisualToPersistentWord = useCallback((options: { navigate?: boolean } = {}): number => {
    const clamped = clampPersistentWordIndex(persistentWordIndexRef.current, totalWordCount);
    writeRefs(clamped, "jump-back");
    setPersistentWordIndex(clamped);
    setHighlightedWordIndex(clamped);
    if (options.navigate !== false) {
      jumpToWord(clamped);
    }
    return clamped;
  }, [jumpToWord, setHighlightedWordIndex, totalWordCount, writeRefs]);

  return {
    persistentWordIndex,
    persistentWordIndexRef,
    commitPersistentWordIndex,
    syncVisualToPersistentWord,
  };
}

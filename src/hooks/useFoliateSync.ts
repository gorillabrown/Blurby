import { useState, useEffect, useRef } from "react";
import { FOLIATE_BROWSING_CHECK_INTERVAL_MS } from "../constants";
import { findSectionForWord, type BookWordArray } from "../types/narration";
import type { FoliateViewAPI } from "../components/FoliatePageView";

// Minimal narration interface needed by this hook
interface NarrationForFoliateSync {
  stop: () => void;
  resyncToCursor: (wordIndex: number, wpm: number) => void;
  setOnSectionEnd: (cb: (() => void) | null) => void;
}

// Chapter shape as used in ReaderContainer docChapters state
interface DocChapter {
  title: string;
  charOffset: number;
  href?: string;
  depth?: number;
  sectionIndex?: number;
  [key: string]: unknown;
}

export interface UseFoliateSyncParams {
  /** Whether the active doc uses the foliate EPUB renderer */
  useFoliate: boolean;
  /** Current reading mode */
  readingMode: "page" | "focus" | "flow";
  /** Flow-layer narration state */
  isNarrating: boolean;
  /** Currently highlighted word index (Page/Flow/Narration position) */
  highlightedWordIndex: number;
  /** Full-book word metadata (sections + totalWords), null until extraction completes */
  bookWordMeta: { sections: BookWordArray["sections"]; totalWords: number } | null;
  /** Narration hook (stop, resyncToCursor, setOnSectionEnd) */
  narration: NarrationForFoliateSync;
  /** Ref to the live Foliate view API */
  foliateApiRef: React.MutableRefObject<FoliateViewAPI | null>;
  /** Ref to the full-book word array (null until extracted) */
  bookWordsRef: React.MutableRefObject<BookWordArray | null>;
  /** Ref to the active word strings array (shared with useReader) */
  wordsRef: React.MutableRefObject<string[]>;
  /** Tracks which section narration is currently in (avoids redundant goToSection calls) */
  currentNarrationSectionRef: React.MutableRefObject<number>;
  /** Throttle ref — timestamp of last goToSection call */
  lastGoToSectionTimeRef: React.MutableRefObject<number>;
  /** Setter for the docChapters state in ReaderContainer */
  setDocChapters: React.Dispatch<React.SetStateAction<DocChapter[]>>;
  /** Callback to extract words from foliate DOM (used in section-end fallback) */
  extractFoliateWords: () => void;
  /** Effective WPM (used when resyncing narration after section advance) */
  effectiveWpm: number;
  /** Active document word count (used when resolving TOC word indices) */
  activeDocWordCount?: number;
}

export interface UseFoliateSyncReturn {
  /** Whether the user has browsed away from the narration position in Foliate */
  isBrowsedAway: boolean;
  /** Setter — allows ReaderContainer / useReaderMode to clear the browsed-away flag */
  setIsBrowsedAway: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Resolve the word index for a TOC entry from section metadata or a linear fraction.
 *
 * Mirrors the private `resolveTocWordIndex` helper in ReaderContainer.tsx.
 * Kept here as a pure utility so the effect that syncs chapter charOffsets can use it
 * without reaching back into the component.
 */
function resolveTocWordIndex(
  item: { sectionIndex?: number },
  idx: number,
  totalWords: number,
  flatLength: number,
  sections?: BookWordArray["sections"],
): number {
  if (item.sectionIndex != null && sections?.length) {
    const match = sections.find((section) => section.sectionIndex === item.sectionIndex);
    if (match) return match.startWordIdx;
  }
  const sectionFraction = idx / Math.max(flatLength, 1);
  return Math.floor(sectionFraction * Math.max(totalWords, 1));
}

/**
 * useFoliateSync — foliate-specific synchronization effects extracted from ReaderContainer.
 *
 * Bundles 4 foliate sync useEffect hooks:
 *   1. Browse-away detection: polls foliateApiRef.isUserBrowsing on an interval during
 *      narration mode and reflects the result as `isBrowsedAway` state.
 *   2. Chapter charOffset sync: when bookWordMeta arrives, re-maps each chapter's
 *      charOffset to the corresponding global word index so the chapter dropdown
 *      and progress bar use real word positions instead of character fractions.
 *   3. Section navigation (focus/flow): when highlightedWordIndex crosses a section
 *      boundary while in focus or flow mode, calls foliateApiRef.goToSection() to
 *      keep the renderer in sync. Throttled to 200 ms per call.
 *   4. Section-end wiring: registers narration.setOnSectionEnd so the narration engine
 *      can advance to the next section when the end of a section is reached. Falls back
 *      to a DOM-extract + resync sequence when full-book words are not yet available.
 *
 * All 4 effects are pure refactors — no behavior changes from ReaderContainer.
 */
export function useFoliateSync({
  useFoliate,
  readingMode,
  isNarrating,
  highlightedWordIndex,
  bookWordMeta,
  narration,
  foliateApiRef,
  bookWordsRef,
  wordsRef,
  currentNarrationSectionRef,
  lastGoToSectionTimeRef,
  setDocChapters,
  extractFoliateWords,
  effectiveWpm,
  activeDocWordCount,
}: UseFoliateSyncParams): UseFoliateSyncReturn {
  const ownsSectionEndCallbackRef = useRef(false);
  const hasFullBookWordMeta = Boolean(bookWordMeta?.sections?.length);

  // ── 1. Browse-away detection ─────────────────────────────────────────────
  // Polls foliateApiRef.isUserBrowsing on an interval while narration is active.
  // When narration is inactive (or useFoliate is false) the flag
  // is reset to false immediately.
  const [isBrowsedAway, setIsBrowsedAway] = useState(false);

  useEffect(() => {
    if (!useFoliate || !isNarrating) {
      if (isBrowsedAway) setIsBrowsedAway(false);
      return;
    }
    const checkBrowsing = () => {
      const browsing = foliateApiRef.current?.isUserBrowsing?.() ?? false;
      setIsBrowsedAway(browsing);
    };
    const timer = setInterval(checkBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [useFoliate, isNarrating]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Chapter charOffset sync ───────────────────────────────────────────
  // Once bookWordMeta arrives, replace each chapter's charOffset with the
  // resolved global word index so chapter navigation uses real positions.
  useEffect(() => {
    if (!useFoliate || !bookWordMeta?.sections?.length) return;
    setDocChapters((prev) =>
      prev.map((chapter, idx, all) => ({
        ...chapter,
        charOffset: resolveTocWordIndex(
          chapter,
          idx,
          bookWordMeta.totalWords || activeDocWordCount || 1,
          all.length,
          bookWordMeta.sections,
        ),
      })),
    );
  }, [useFoliate, bookWordMeta, activeDocWordCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Section navigation for focus/flow modes ───────────────────────────
  // NAR-3: When word index crosses a section boundary, navigate foliate.
  // TTS-7J (BUG-128): DISABLED during narration — miss-recovery owns section nav.
  // TTS-7K (BUG-133): DISABLED during page mode — page turning is owned by foliate's
  // next()/prev(). This effect's goToSection() calls interfered with manual page
  // navigation, preventing users from advancing past the third page.
  // Only active for focus and flow modes which need section tracking.
  useEffect(() => {
    if (!useFoliate || !bookWordsRef.current?.complete) return;
    // TTS-7K: Only focus/flow modes need this section-sync effect
    if (readingMode !== "focus" && readingMode !== "flow") return;

    const bookWords = bookWordsRef.current;
    const sec = findSectionForWord(bookWords.sections, highlightedWordIndex);
    if (!sec) return;

    // Only navigate if the section changed AND throttle to max once per 200ms
    if (sec.sectionIndex !== currentNarrationSectionRef.current) {
      const now = Date.now();
      if (now - lastGoToSectionTimeRef.current < 200) return;
      currentNarrationSectionRef.current = sec.sectionIndex;
      lastGoToSectionTimeRef.current = now;
      foliateApiRef.current?.goToSection(sec.sectionIndex).catch(() => {});
    }
  }, [useFoliate, readingMode, highlightedWordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 4. Section-end callback wiring ──────────────────────────────────────
  // Foliate only owns section-end handling outside active flow narration.
  // In flow+narration, useFlowScrollSync is the sole runtime owner.
  useEffect(() => {
    // bookWordsRef.current is a mutable ref, so React won't rerun this effect when
    // extraction completes unless we also key off the React-owned metadata signal.
    const flowNarrationOwnsSectionEnd = readingMode === "flow" && isNarrating;
    const foliateOnlyOwnsFallbackSectionEnd =
      useFoliate
      && !flowNarrationOwnsSectionEnd
      && !hasFullBookWordMeta
      && !bookWordsRef.current?.complete;

    if (!foliateOnlyOwnsFallbackSectionEnd) {
      if (ownsSectionEndCallbackRef.current) {
        narration.setOnSectionEnd(null);
        ownsSectionEndCallbackRef.current = false;
      }
      return;
    }

    ownsSectionEndCallbackRef.current = true;
    narration.setOnSectionEnd(() => {
      // If full-book words are loaded, foliate must stay passive and leave narration alone.
      if (bookWordsRef.current?.complete) {
        return;
      }
      // Fallback for when extraction is still in progress.
      const api = foliateApiRef.current;
      if (!api) return;
      api.next();
      const checkAndRestart = () => {
        setTimeout(() => {
          try {
            extractFoliateWords();
            const newWords = wordsRef.current;
            if (newWords.length > 0) {
              narration.resyncToCursor(0, effectiveWpm);
            }
          } catch (err) {
            console.error("[ReaderContainer] extractFoliateWords failed during section-end fallback:", err);
          }
        }, 300);
      };
      checkAndRestart();
    });
    return () => {
      if (ownsSectionEndCallbackRef.current) {
        narration.setOnSectionEnd(null);
        ownsSectionEndCallbackRef.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFoliate, readingMode, isNarrating, narration, effectiveWpm, hasFullBookWordMeta]);

  return { isBrowsedAway, setIsBrowsedAway };
}

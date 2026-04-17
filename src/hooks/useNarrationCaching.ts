import { useEffect, useRef } from "react";
import { createBackgroundCacher, type BackgroundCacher } from "../utils/backgroundCacher";
import { mergeOverrides } from "../utils/pronunciationOverrides";
import { resolveKokoroBucket } from "../constants";
import { recordDiagEvent } from "../utils/narrateDiagnostics";
import { wrapWordsInSpans, unwrapWordSpans } from "../components/FoliatePageView";
import type { BlurbyDoc, BlurbySettings } from "../types";
import type { BookWordArray } from "../types/narration";

const api = window.electronAPI;

// TTS-7C: In-flight extraction dedupe — prevent concurrent duplicate IPC calls (BUG-112)
let _extractionPromise: Promise<any> | null = null;
let _extractionBookId: string | null = null;

function dedupeExtractWords(bookId: string): Promise<any> {
  if (!api.extractEpubWords) return Promise.resolve({ error: "extractEpubWords not available" });
  if (_extractionPromise && _extractionBookId === bookId) return _extractionPromise;
  _extractionBookId = bookId;
  _extractionPromise = api.extractEpubWords(bookId).finally(() => {
    if (_extractionBookId === bookId) { _extractionPromise = null; _extractionBookId = null; }
  });
  return _extractionPromise;
}

type ReadingMode = "page" | "focus" | "flow";

interface NarrationUpdateWords {
  updateWords: (words: string[], cursorIdx: number) => void;
}

interface UseNarrationCachingParams {
  activeDoc: BlurbyDoc;
  settings: BlurbySettings;
  wordsRef: React.MutableRefObject<string[]>;
  narrationWarmUp: () => void;
  /** Whether this is a foliate-rendered EPUB */
  useFoliate: boolean;
  /** Current reading mode — effect 2 only fires during narration */
  readingMode: ReadingMode;
  /** Flow-layer narration state */
  isNarrating: boolean;
  /** Ref to full-book word array (shared mutable, written by effects 1 & 2) */
  bookWordsRef: React.MutableRefObject<BookWordArray | null>;
  /** Ref to footnote cues (shared mutable, written by effects 1 & 2) */
  footnoteCuesRef: React.MutableRefObject<Array<{ afterWordIdx: number; text: string }>>;
  /** Ref tracking whether full-book extraction is complete */
  bookWordsCompleteRef: React.MutableRefObject<boolean>;
  /** State setter for book word metadata (sections + totalWords) */
  setBookWordMeta: React.Dispatch<React.SetStateAction<{ sections: BookWordArray["sections"]; totalWords: number } | null>>;
  /** Ref to highlighted word index (current value, avoids stale closure) */
  highlightedWordIndexRef: React.MutableRefObject<number>;
  /** Foliate API ref — needed for DOM restamping in effect 2 */
  foliateApiRef: React.MutableRefObject<any>;
  /** Narration hook — updateWords method for effect 2 */
  narration: NarrationUpdateWords;
}

/**
 * Manages TTS background caching: Kokoro preload/warm-up on mount,
 * background cacher lifecycle, entry coverage queueing, and active-book sync.
 *
 * Extracted from ReaderContainer — 4 useEffect hooks.
 */
export function useNarrationCaching({
  activeDoc,
  settings,
  wordsRef,
  narrationWarmUp,
  useFoliate,
  readingMode,
  isNarrating,
  bookWordsRef,
  footnoteCuesRef,
  bookWordsCompleteRef,
  setBookWordMeta,
  highlightedWordIndexRef,
  foliateApiRef,
  narration,
}: UseNarrationCachingParams): React.MutableRefObject<BackgroundCacher | null> {
  const backgroundCacherRef = useRef<BackgroundCacher | null>(null);

  // NAR-2: Pre-warm Kokoro model + AudioContext on reader mount
  useEffect(() => {
    if (settings.ttsEngine === "kokoro") {
      if (api?.kokoroPreload) api.kokoroPreload().catch(() => {});
      // NAR-5: Preload marathon worker in parallel (background caching)
      if (api?.kokoroPreloadMarathon) api.kokoroPreloadMarathon().catch(() => {});
      // Warm up AudioContext so first play has zero audio driver latency
      narrationWarmUp();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // NAR-5: Background cacher — marathon worker fills disk cache ahead of reading position
  useEffect(() => {
    if (settings.ttsEngine !== "kokoro" || settings.ttsCacheEnabled === false) return;
    if (!api?.kokoroGenerateMarathon) return;

    const cacher = createBackgroundCacher({
      generateFn: async (text, voiceId, speed) => {
        const result = await api.kokoroGenerateMarathon(text, voiceId, speed);
        if (result.error || !result.audio || !result.sampleRate) {
          return { error: result.error || "no audio returned" };
        }
        const durationMs = (result as any).durationMs ?? (result.audio.length / result.sampleRate) * 1000;
        return { audio: result.audio, sampleRate: result.sampleRate, durationMs };
      },
      getVoiceId: () => settings.ttsVoiceName || "af_bella",
      isCacheEnabled: () => settings.ttsCacheEnabled !== false,
      getRateBucket: () => resolveKokoroBucket(settings.ttsRate || 1.0),
      getPronunciationOverrides: () => mergeOverrides(settings.pronunciationOverrides || [], activeDoc.pronunciationOverrides || []),
    });
    backgroundCacherRef.current = cacher;
    cacher.start();

    return () => {
      cacher.stop();
      backgroundCacherRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ttsEngine, settings.ttsCacheEnabled, settings.ttsVoiceName, settings.ttsRate]);

  // TTS-7F: Queue entry-coverage for the opened book on reader mount (cruise warm)
  useEffect(() => {
    const cacher = backgroundCacherRef.current;
    if (!cacher) return;
    const words = wordsRef.current;
    if (words.length > 0 && settings.ttsEngine === "kokoro" && settings.ttsCacheEnabled !== false) {
      cacher.queueEntryCoverage({
        id: activeDoc.id,
        words,
        position: activeDoc.position || 0,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc.id, settings.ttsEngine]);

  // NAR-5: Set active book on the background cacher when text is available
  useEffect(() => {
    const cacher = backgroundCacherRef.current;
    if (!cacher) return;
    const words = wordsRef.current;
    if (words.length > 0) {
      cacher.setActiveBook({
        id: activeDoc.id,
        words,
        position: activeDoc.position || 0,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc.id, wordsRef.current.length]);

  // ── TTS-6O: Background pre-extraction — extract full-book words ahead of narration start ──
  useEffect(() => {
    if (!useFoliate || !api?.extractEpubWords) return;
    if (bookWordsRef.current && bookWordsRef.current.complete) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      dedupeExtractWords(activeDoc.id).then((result) => {
        if (cancelled || !result.words || !result.sections) return;
        // Only store if narration hasn't already extracted (avoid overwrite race)
        if (bookWordsRef.current && bookWordsRef.current.complete) return;
        bookWordsRef.current = {
          words: result.words,
          sections: result.sections,
          totalWords: result.totalWords ?? result.words.length,
          complete: true,
        };
        footnoteCuesRef.current = result.footnoteCues || [];
        bookWordsCompleteRef.current = true;
        setBookWordMeta({
          sections: result.sections,
          totalWords: result.totalWords ?? result.words.length,
        });
        if (import.meta.env.DEV) console.debug(`[TTS-6O] background pre-extraction complete: ${result.words.length} words`);
      }).catch(() => {});
    }, activeDoc.wordCount > 100000 ? 2000 : 1000); // BUG-149: larger delay for big EPUBs
    return () => { cancelled = true; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFoliate, activeDoc.id]);

  // ── HOTFIX-6: Extract full-book words via main-process IPC (no foliate navigation) ──
  useEffect(() => {
    if (!useFoliate || !isNarrating) return;
    // Already extracted for this book?
    if (bookWordsRef.current && bookWordsRef.current.complete) return;
    if (!api?.extractEpubWords) return;

    let cancelled = false;

    const currentSectionIdx = foliateApiRef.current?.getWords()?.[0]?.sectionIndex ?? 0;

    api.extractEpubWords(activeDoc.id).then(async (result: any) => {
      if (cancelled || !result.words || !result.sections) return;

      // TTS-7C: Phase 1 — Build bookWords object
      const bookWords: BookWordArray = {
        words: result.words,
        sections: result.sections,
        totalWords: result.totalWords ?? result.words.length,
        complete: true,
      };
      footnoteCuesRef.current = result.footnoteCues || [];

      // TTS-7C: Yield between extraction result processing and ref updates
      await new Promise(r => setTimeout(r, 0));
      if (cancelled) return;

      // TTS-7C: Phase 2 — Update refs and narration state
      bookWordsRef.current = bookWords;
      bookWordsCompleteRef.current = true;
      setBookWordMeta({
        sections: bookWords.sections,
        totalWords: bookWords.totalWords,
      });
      wordsRef.current = bookWords.words;

      // Convert section-local highlightedWordIndex to global (use ref for current value, not stale closure)
      // Do this BEFORE DOM restamping — narration uses the word array, not DOM spans
      const currentSection = bookWords.sections.find(s => s.sectionIndex === currentSectionIdx);
      const currentLocalIdx = highlightedWordIndexRef.current;
      if (currentSection && currentLocalIdx >= 0) {
        const globalIdx = currentSection.startWordIdx + currentLocalIdx;
        // Update narration to use the global word array (non-disruptive — no stop/restart)
        narration.updateWords(bookWords.words, globalIdx);
      }

      // HOTFIX-10: Re-stamp all loaded foliate sections with global indices.
      // Deferred via requestIdleCallback to avoid blocking the renderer during active narration.
      const restampSections = () => {
        if (cancelled) return;
        const contents = foliateApiRef.current?.getView()?.renderer?.getContents?.() ?? [];
        for (const { doc: sectionDoc, index: sectionIndex } of contents) {
          const sec = bookWords.sections.find(s => s.sectionIndex === sectionIndex);
          if (sec && sectionDoc?.body) {
            unwrapWordSpans(sectionDoc);
            wrapWordsInSpans(sectionDoc, sectionIndex, sec.startWordIdx);
          }
        }
      };
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(restampSections, { timeout: 2000 });
      } else {
        setTimeout(restampSections, 0);
      }

      if (import.meta.env.DEV) console.debug(`[HOTFIX-6] main-process extraction complete: ${bookWords.totalWords} words, ${bookWords.sections.length} sections`);
    }).catch((err: any) => {
      console.warn("[HOTFIX-6] main-process extraction failed:", err);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFoliate, isNarrating, activeDoc.id]);

  return backgroundCacherRef;
}

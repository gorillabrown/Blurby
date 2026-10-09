// ReaderContainer — the reader shell (READER-MODE-SEPARATION-2 design §A.7, step E1).
//
// The shell owns document identity and session stats, the toolbar (ReaderBottomBar), keyboard
// (useReaderKeys), TTS infrastructure (useNarration, warm-up, background cacher), the progress tracker,
// e-ink, the chapter list and the cross-book overlay. It owns no reading-mode behavior: page, focus,
// flow and narrate reading each run in their own runtime (src/reader/modes/<mode>/), reached only
// through the thin router (useReaderModeOrchestrator). The shell renders exactly one active mode view,
// keyed by session, and hands the runtimes infrastructure through the owner-checking port broker.
// Only Narrate is issued the audio port (DD-3); the mode-independent TTS warm-up stays here (DD-7).
import { useState, useCallback, useRef, useMemo, useEffect, type ComponentType } from "react";
import { tokenizeWithMeta, detectChapters, chaptersFromCharOffsets, currentChapterIndex as getCurChIdx } from "../utils/text";
import {
  CROSS_BOOK_TRANSITION_FALLBACK_TIMEOUT_MS,
  DEFAULT_EINK_WPM_CEILING,
  DEFAULT_FOCUS_TEXT_SIZE,
  FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS,
  MAX_FOCUS_TEXT_SIZE,
  MIN_FOCUS_TEXT_SIZE,
} from "../constants";
import { useEinkController } from "../hooks/useEinkController";
import { useProgressTracker } from "../hooks/useProgressTracker";
import { READER_MODE_MODULES, useReaderModeOrchestrator } from "../reader/useReaderModeOrchestrator";
import useNarration from "../hooks/useNarration";
import { recordDiagEvent, type NarrateDiagEvent } from "../utils/narrateDiagnostics";
import { logDualSourceTransition } from "../utils/dualSourceDiag";
import type { BlurbyDoc, BlurbySettings, ReaderMode } from "../types";
import { useReaderKeys } from "../hooks/useKeyboardShortcuts";
import ErrorBoundary from "./ErrorBoundary";
import ReaderBottomBar, { ChapterListHandle } from "./ReaderBottomBar";
import EinkRefreshOverlay from "./EinkRefreshOverlay";
import BacktrackPrompt from "./BacktrackPrompt";
import ReturnToReadingPill from "./ReturnToReadingPill";
import MenuFlap from "./MenuFlap";
import { useSettings } from "../contexts/SettingsContext";
import { useToast } from "../contexts/ToastContext";
import { createWindowEvalTraceSink } from "../utils/ttsEvalTrace";
import { resolveKokoroRatePlan } from "../utils/kokoroRatePlan";
import { useReadingGoals } from "../hooks/useReadingGoals";
import { calculateHighWaterPagesReadDelta } from "../utils/readingGoals";
import { createBackgroundCacher, type BackgroundCacher } from "../utils/backgroundCacher";
import { mergeOverrides, overrideHash } from "../utils/pronunciationOverrides";
import { getNextQueuedBook } from "../utils/queue";
import {
  createReaderDocumentSnapshot,
  createReaderSettingsSnapshot,
  setToNumberArray,
  type ReaderBookWordsValue,
  type ReaderDocumentSnapshot,
  type ReaderSettingsSnapshot,
} from "../reader/document/ReaderDocumentSnapshot";
import type { ReaderPortInfrastructure } from "../reader/ports/createReaderPorts";
import type { ReaderAudioConfig } from "../reader/ports/ReaderPorts";
import type { ReaderModeRuntime, ReaderModeViewProps } from "../reader/modes/ReaderModeAdapter";

const api = window.electronAPI;

type DocWithContent = BlurbyDoc & { content: string };

type DocChapter = { title: string; charOffset: number; href?: string; depth?: number; sectionIndex?: number };

interface ReaderContainerProps {
  activeDoc: DocWithContent;
  library: BlurbyDoc[];
  wpm: number;
  setWpm: React.Dispatch<React.SetStateAction<number>>;
  platform: string;
  menuFlapOpen: boolean;
  toggleMenuFlap: () => void;
  setMenuFlapOpen: React.Dispatch<React.SetStateAction<boolean>>;
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
  onExitReader: (finalPos: number) => void;
  onUpdateProgress: (docId: string, position: number) => void;
  onArchiveDoc: (docId: string) => void;
  onToggleFavorite: (docId: string) => void;
  onOpenDocById: (docId: string) => void;
  settingsPage?: string | null;
  onClearSettingsPage?: () => void;
}

/** Shell callbacks a mode view may offer (Focus's RSVP overlay: ESC button and menu button). */
interface ReaderModeShellCallbacks {
  readonly exitReader?: () => void;
  readonly onToggleFlap?: () => void;
}

/** Recursively flatten foliate's TOC tree into a depth-annotated flat list. */
function flattenToc(items: any[], depth = 0): Array<{ title: string; href: string; depth: number; sectionIndex?: number }> {
  const result: Array<{ title: string; href: string; depth: number; sectionIndex?: number }> = [];
  for (const item of items) {
    const title = item.label || item.title || "";
    const href = item.href || "";
    const sectionIndex = typeof item.sectionIndex === "number" ? item.sectionIndex : undefined;
    const children = item.subitems || item.children || [];
    if (href) {
      result.push({ title, href, depth, sectionIndex });
    }
    if (children.length > 0) {
      result.push(...flattenToc(children, depth + 1));
    }
  }
  return result;
}

function resolveTocWordIndex(
  item: { sectionIndex?: number },
  idx: number,
  totalWords: number,
  flatLength: number,
  sections?: ReaderBookWordsValue["sections"],
): number {
  if (item.sectionIndex != null && sections?.length) {
    const match = sections.find((section) => section.sectionIndex === item.sectionIndex);
    if (match) return match.startWordIdx;
  }
  const sectionFraction = idx / Math.max(flatLength, 1);
  return Math.floor(sectionFraction * Math.max(totalWords, 1));
}

/** The one active mode view. The shell keys it by session, so React unmounts the old view on every transition. */
function ActiveModeView({ runtime, shell }: { runtime: ReaderModeRuntime; shell: ReaderModeShellCallbacks }) {
  const View = READER_MODE_MODULES[runtime.mode].View as ComponentType<ReaderModeViewProps & { readonly shell?: ReaderModeShellCallbacks }>;
  return <View runtime={runtime} shell={shell} />;
}

export default function ReaderContainer({
  activeDoc,
  library,
  wpm,
  setWpm,
  platform,
  menuFlapOpen,
  toggleMenuFlap,
  setMenuFlapOpen,
  siteLogins,
  onSiteLogin,
  onSiteLogout,
  onExitReader,
  onUpdateProgress,
  onArchiveDoc,
  onToggleFavorite,
  onOpenDocById,
  settingsPage,
  onClearSettingsPage,
}: ReaderContainerProps) {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const isEink = settings.einkMode === true;
  const readingGoals = useReadingGoals({ settings, updateSettings });

  const [focusTextSize, setFocusTextSize] = useState(
    settings.focusTextSize || DEFAULT_FOCUS_TEXT_SIZE
  );
  const evalTraceSink = useMemo(() => createWindowEvalTraceSink(), []);

  // FLOW-INF-C: Cross-book continuous reading state (document-level; the Flow runtime only reports book end).
  const [crossBookTransition, setCrossBookTransition] = useState<{
    finishedTitle: string;
    nextTitle: string;
    nextDocId: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const pendingFlowResumeRef = useRef(false);

  // E-ink ghosting prevention (extracted to useEinkController hook)
  const {
    showEinkRefresh,
    triggerEinkRefresh,
    handleEinkPageTurn,
    handleEinkContentChange,
  } = useEinkController(settings);

  const [docChapters, setDocChapters] = useState<DocChapter[]>([]);

  // 21N: Active reading session timer (Focus/Flow/Narrate playing, not Page)
  const activeReadingMsRef = useRef(0);
  const activeReadingStartRef = useRef<number | null>(null);
  // Session tracking (copied from useDocumentLifecycle's shell half).
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartWordRef = useRef(0);
  const hasShownRestoreToastRef = useRef(false);

  // Detect if this is an EPUB with filepath (use foliate-js for rendering)
  const useFoliate = Boolean(activeDoc?.filepath && activeDoc?.ext === ".epub");
  // Foliate's book fraction (0.0–1.0), reported by the active mode's view. The ref is the single
  // authority for saves; state is synced for UI rendering only.
  const foliateFractionRef = useRef(0);
  const [foliateFraction, setFoliateFraction] = useState(0);

  // Tokenize content (document preparation; immutable value handed to the modes in the snapshot)
  const tokenized = useMemo(() => {
    if (!activeDoc?.content) return { words: [] as string[], paragraphBreaks: new Set<number>() };
    return tokenizeWithMeta(activeDoc.content);
  }, [activeDoc?.content]);
  const words = tokenized.words;

  // Enforce e-ink WPM ceiling
  const effectiveWpm = isEink ? Math.min(wpm, settings.einkWpmCeiling || DEFAULT_EINK_WPM_CEILING) : wpm;

  // ── TTS infrastructure (DD-3): one useNarration per shell; only Narrate is issued its port ──
  const readingModeRef = useRef<ReaderMode>("page");
  const narration = useNarration({
    evalTrace: evalTraceSink,
    experimentalNano: settings.ttsEngine === "nano",
    getReadingMode: () => evalTraceSink?.captureMode ?? readingModeRef.current,
  });
  const narrationRef = useRef(narration);
  narrationRef.current = narration;
  const backgroundCacherRef = useRef<BackgroundCacher | null>(null);

  // ── Document infrastructure: full-book words (TTS-6O / HOTFIX-6 extraction behind the document port) ──
  const [bookWordsState, setBookWordsState] = useState<{ docId: string; value: ReaderBookWordsValue } | null>(null);
  const bookWords = bookWordsState && bookWordsState.docId === activeDoc.id ? bookWordsState.value : null;
  // TTS-7C: in-flight extraction dedupe per shell (BUG-112); replaces the old module-level cache (Q-D).
  const extractionRef = useRef<{ docId: string; promise: Promise<ReaderBookWordsValue | null> } | null>(null);
  const extractedBookWordsRef = useRef<{ docId: string; value: ReaderBookWordsValue } | null>(null);
  const bookBytesRef = useRef<{ key: string; promise: Promise<ArrayBuffer> } | null>(null);
  const documentGenerationRef = useRef(0);
  const documentListenersRef = useRef(new Set<(snapshot: ReaderDocumentSnapshot) => void>());

  const totalWordCount = bookWords?.totalWords || activeDoc.wordCount || words.length;

  // Document snapshot: rebuilt only when its inputs change (bookWords arrival, content, a new open).
  const documentSnapshotCacheRef = useRef<{ inputs: unknown[]; snapshot: ReaderDocumentSnapshot } | null>(null);
  const liveDocRef = useRef({ activeDoc, tokenized, useFoliate, bookWords });
  liveDocRef.current = { activeDoc, tokenized, useFoliate, bookWords };
  const getDocument = useCallback((): ReaderDocumentSnapshot => {
    const { activeDoc: doc, tokenized: tok, useFoliate: foliate, bookWords: book } = liveDocRef.current;
    const generation = documentGenerationRef.current;
    const inputs = [doc.id, generation, tok, foliate, book];
    const cached = documentSnapshotCacheRef.current;
    if (cached && cached.inputs.every((value, i) => value === inputs[i])) return cached.snapshot;
    const snapshot = createReaderDocumentSnapshot({
      documentId: doc.id,
      documentGeneration: generation,
      title: doc.title || "",
      author: doc.authorFull || doc.author || null,
      coverPath: doc.coverPath || null,
      filepath: doc.filepath || null,
      useFoliate: foliate,
      wordCount: doc.wordCount || 0,
      position: doc.position || 0,
      cfi: doc.cfi || null,
      tokenWords: tok.words,
      paragraphBreaks: setToNumberArray(tok.paragraphBreaks),
      bookWords: book,
      pronunciationOverrides: doc.pronunciationOverrides || [],
    });
    documentSnapshotCacheRef.current = { inputs, snapshot };
    return snapshot;
  }, []);

  // Settings snapshot: the private copy every runtime receives (applySettings forwards it to the active one).
  const settingsSnapshot = useMemo(() => createReaderSettingsSnapshot({
    settings,
    wpm,
    effectiveWpm,
    focusTextSize,
    isEink,
    isMac: platform === "darwin",
  }), [settings, wpm, effectiveWpm, focusTextSize, isEink, platform]);
  const settingsSnapshotRef = useRef<ReaderSettingsSnapshot>(settingsSnapshot);
  settingsSnapshotRef.current = settingsSnapshot;
  const getSettings = useCallback(() => settingsSnapshotRef.current, []);

  // ── Live values the (stable) infrastructure object forwards to ────────────────
  const shellRef = useRef({
    activeDoc,
    library,
    settings,
    updateSettings,
    setWpm,
    onUpdateProgress,
    onOpenDocById,
    recordPages: readingGoals.recordPages,
    markEngaged: () => {},
    markPageActivity: () => {},
    finishReadingWithoutExit: (_idx: number) => {},
    handleEinkPageTurn,
    handleEinkContentChange,
    requestCompletionToPage: () => {},
    // useProgressTracker's refs (stable objects), bound after the tracker runs.
    pageSaveTimerRef: { current: null } as React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    furthestPositionRef: { current: 0 } as React.MutableRefObject<number>,
    lastSavedPosRef: { current: 0 } as React.MutableRefObject<number>,
  });
  const mediaSessionRequestRef = useRef(0);

  const ensureBookWords = useCallback((): Promise<ReaderBookWordsValue | null> => {
    const doc = liveDocRef.current.activeDoc;
    const extracted = extractedBookWordsRef.current;
    const known = liveDocRef.current.bookWords ?? (extracted && extracted.docId === doc.id ? extracted.value : null);
    if (known) return Promise.resolve(known);
    if (!liveDocRef.current.useFoliate || !api?.extractEpubWords) return Promise.resolve(null);
    const inFlight = extractionRef.current;
    if (inFlight && inFlight.docId === doc.id) return inFlight.promise;
    const docId = doc.id;
    const promise = api.extractEpubWords(docId).then((result) => {
      if (!result?.words || !result.sections) return null;
      const value: ReaderBookWordsValue = Object.freeze({
        words: Object.freeze([...result.words]),
        sections: Object.freeze(result.sections.map((section) => Object.freeze({ ...section }))),
        totalWords: result.totalWords ?? result.words.length,
        footnoteCues: Object.freeze((result.footnoteCues || []).map((cue) => Object.freeze({ ...cue }))),
      });
      if (extractedBookWordsRef.current?.docId === docId) return extractedBookWordsRef.current.value;
      extractedBookWordsRef.current = { docId, value };
      setBookWordsState({ docId, value });
      return value;
    }).finally(() => {
      if (extractionRef.current?.docId === docId) extractionRef.current = null;
    });
    extractionRef.current = { docId, promise };
    return promise;
  }, []);

  // The broker forwards accepted port calls here. Built once; every method reads the latest shell values.
  const [infrastructure] = useState<ReaderPortInfrastructure>(() => ({
    settings: {
      read: () => settingsSnapshotRef.current,
      update: (patch) => shellRef.current.updateSettings(patch as Partial<BlurbySettings>),
      setWpm: (value) => shellRef.current.setWpm(value),
    },
    persistence: {
      updateDocProgress: (docId, wordIndex, cfi) => { void api.updateDocProgress(docId, wordIndex, cfi); },
      updateProgress: (docId, wordIndex) => shellRef.current.onUpdateProgress(docId, wordIndex),
      // Legacy `activeDoc.cfi = cfi` (position restoration on reopen).
      recordCfi: (cfi) => { shellRef.current.activeDoc.cfi = cfi; },
      markEngaged: () => shellRef.current.markEngaged(),
      markPageActivity: () => shellRef.current.markPageActivity(),
      // Legacy onRelocate save half: high-water pages and the debounced CFI save.
      scheduleRelocateSave: ({ wordIndex, cfi }) => {
        const live = shellRef.current;
        const pageDelta = calculateHighWaterPagesReadDelta(live.furthestPositionRef.current, wordIndex);
        live.furthestPositionRef.current = pageDelta.highWater;
        if (pageDelta.pages > 0) live.recordPages(pageDelta.pages);
        // Debounced save of CFI for resume on reopen
        const docId = live.activeDoc.id;
        if (live.pageSaveTimerRef.current) clearTimeout(live.pageSaveTimerRef.current);
        live.pageSaveTimerRef.current = setTimeout(() => {
          void api.updateDocProgress(docId, wordIndex, cfi);
          live.onUpdateProgress(docId, wordIndex);
          live.lastSavedPosRef.current = wordIndex;
        }, FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS);
      },
    },
    document: {
      snapshot: () => getDocument(),
      readBookBytes: () => {
        const doc = liveDocRef.current.activeDoc;
        const key = `${doc.id}#${documentGenerationRef.current}`;
        if (bookBytesRef.current?.key !== key) {
          // A failed read is not cached: the next view mount retries (B0 read once per view load).
          const promise = api.readFileBuffer(doc.filepath!).catch((error: unknown) => {
            if (bookBytesRef.current?.promise === promise) bookBytesRef.current = null;
            throw error;
          });
          bookBytesRef.current = { key, promise };
        }
        return bookBytesRef.current.promise;
      },
      ensureBookWords,
      subscribe: (listener) => {
        documentListenersRef.current.add(listener);
        return () => { documentListenersRef.current.delete(listener); };
      },
    },
    audio: {
      readState: () => {
        const n = narrationRef.current;
        return {
          status: n.status,
          speaking: n.speaking,
          warming: n.warming,
          kokoroLoading: n.kokoroLoading,
          cursorWordIndex: n.cursorWordIndex,
          pauseReason: n.pauseReason,
          rate: n.rate,
        };
      },
      start: (startWords, wordIndex, rate, onWord) => narrationRef.current.startCursorDriven([...startWords], wordIndex, rate, onWord),
      pause: (reason) => narrationRef.current.pause(reason),
      resume: () => narrationRef.current.resume(),
      stop: (reason) => narrationRef.current.stop(reason),
      setOnTruthSync: (cb) => narrationRef.current.setOnTruthSync(cb),
      setPageEndWord: (wordIndex) => narrationRef.current.setPageEndWord(wordIndex),
      resync: (wordIndex, rate) => narrationRef.current.resyncToCursor(wordIndex, rate),
      setOnChunkBoundary: (cb) => narrationRef.current.setOnChunkBoundary?.(cb),
      setOnSegmentStart: (cb) => narrationRef.current.setOnSegmentStart?.(cb),
      setOnSectionEnd: (cb) => narrationRef.current.setOnSectionEnd(cb),
      updateWords: (nextWords, globalStartIdx, options) => narrationRef.current.updateWords([...nextWords], globalStartIdx, options),
      adjustRate: (rate) => narrationRef.current.adjustRate(rate),
      resolveHighlightSync: (input) => narrationRef.current.resolveHighlightSync?.(input),
      getAudioProgress: () => narrationRef.current.getAudioProgress(),
      // TTS-7A: the background cacher follows the live narration cursor.
      updateCacheCursor: (wordIndex) => backgroundCacherRef.current?.updateCursorPosition(wordIndex),
      // useNarrationSync bridge (one call per changed field group).
      configure: (config: ReaderAudioConfig) => {
        const n = narrationRef.current;
        if (config.bookId !== undefined) n.setBookId(config.bookId);
        if (config.engine !== undefined) n.setEngine(config.engine);
        if (config.pauseConfig !== undefined) n.setPauseConfig({ ...config.pauseConfig });
        if (config.footnoteMode !== undefined) n.setFootnoteMode(config.footnoteMode);
        if (config.footnoteCues !== undefined) n.setFootnoteCues(config.footnoteCues.map((cue) => ({ ...cue })));
        if (config.pronunciationOverrides !== undefined) n.setPronunciationOverrides(config.pronunciationOverrides.map((o) => ({ ...o })));
        if (config.bookPronunciationOverrides !== undefined) n.setBookPronunciationOverrides(config.bookPronunciationOverrides.map((o) => ({ ...o })));
        if (config.voiceName !== undefined) {
          // useNarrationSync effect 5: the engine-specific voice pick stays in TTS infrastructure.
          if (shellRef.current.settings.ttsEngine === "kokoro" && config.voiceName) {
            n.setKokoroVoice(config.voiceName);
          } else if (config.voiceName && n.voices.length > 0) {
            const voice = n.voices.find((v) => v.name === config.voiceName);
            if (voice && voice.name !== n.currentVoice?.name) n.selectVoice(voice);
          }
        }
        if (config.mediaSessionBook !== undefined) {
          // useNarrationSync effect 1a: resolve the cover into the MediaSession art (latest request wins).
          const book = config.mediaSessionBook;
          const request = ++mediaSessionRequestRef.current;
          const commit = (coverArtUrl: string | null) => {
            if (request !== mediaSessionRequestRef.current) return;
            narrationRef.current.setMediaSessionBook(book ? { ...book, coverArtUrl } : null);
          };
          const coverPath = config.mediaSessionCoverPath;
          if (!book || !coverPath || !window.electronAPI?.getCoverImage) {
            commit(book?.coverArtUrl ?? null);
          } else {
            window.electronAPI.getCoverImage(coverPath).then((src) => commit(src || null)).catch(() => commit(null));
          }
        }
      },
    },
    diagnostics: {
      record: (kind, detail) => { recordDiagEvent(kind as NarrateDiagEvent["event"], detail); },
      transition: (name, payload) => logDualSourceTransition(name, payload),
      trace: (event) => { if (evalTraceSink?.enabled) evalTraceSink.record(event); },
    },
    shell: {
      // Fraction + e-ink page turn.
      reportRelocate: ({ fraction }) => {
        shellRef.current.handleEinkPageTurn();
        foliateFractionRef.current = fraction;
        setFoliateFraction(fraction);
      },
      reportToc: (toc) => {
        const flat = flattenToc(toc as any[]);
        // Resolve TOC hrefs to proportional word positions via section index
        const live = liveDocRef.current;
        const total = live.bookWords?.totalWords || live.activeDoc.wordCount || live.tokenized.words.length || 1;
        setDocChapters(flat.map((item, idx) => ({
          title: item.title || `Chapter ${idx + 1}`,
          charOffset: resolveTocWordIndex(item, idx, total, flat.length, live.bookWords?.sections),
          href: item.href,
          depth: item.depth,
          sectionIndex: item.sectionIndex,
        })));
      },
      reportEinkContentChange: (estimate) => shellRef.current.handleEinkContentChange(estimate),
      requestCompletionToPage: () => shellRef.current.requestCompletionToPage(),
      // Flow book end. The shell owns the queue, overlay, finish and next-document open; with no queued
      // book, the end of the book is a completion to Page (legacy setFlowPlaying(false); setReadingMode("page")).
      requestCrossBook: ({ finishedWordIndex }) => {
        const live = shellRef.current;
        const doc = live.activeDoc;
        const nextDoc = getNextQueuedBook(doc.id, live.library);
        if (!nextDoc) {
          live.requestCompletionToPage();
          return;
        }
        const tid = setTimeout(() => {
          setCrossBookTransition(null);
        }, CROSS_BOOK_TRANSITION_FALLBACK_TIMEOUT_MS);
        setCrossBookTransition({
          finishedTitle: doc.title || "Untitled",
          nextTitle: nextDoc.title || "Untitled",
          nextDocId: nextDoc.id,
          timeoutId: tid,
        });
        live.finishReadingWithoutExit(finishedWordIndex);
        void api.removeFromQueue(doc.id);
        pendingFlowResumeRef.current = true;
        live.onOpenDocById(nextDoc.id);
      },
    },
  }));

  // ── Mode transitions: the thin router (one runtime at a time) ──────────────────
  const modeHook = useReaderModeOrchestrator({
    infrastructure,
    getDocument,
    getSettings,
    lastReadingMode: settings.lastReadingMode,
    updateSettings,
    evalTrace: evalTraceSink,
  });
  const {
    router,
    snapshot: toolbar,
    active,
    handleTogglePlay, handlePauseToPage,
    handleEnterFocus, handleEnterFlow, handleEnterNarrate, handleToggleNarration,
    handleExitToPage, handleNavigateTo, handleJumpBack, adjustSpeed, handleCommand,
    handleCycleMode, handleCycleAndStart,
  } = modeHook;

  const readingMode: ReaderMode = toolbar?.readingMode ?? "page";
  readingModeRef.current = readingMode;
  const isNarrating = toolbar?.narrating ?? false;
  const isBrowsedAway = toolbar?.isBrowsedAway ?? false;
  const highlightedWordIndex = toolbar?.highlightedWordIndex ?? (activeDoc.position || 0);
  // Canonical anchor (legacy persistentWordIndex state) for the toolbar, progress and exit.
  const canonicalWordAnchor = toolbar?.currentWordIndex ?? (activeDoc.position || 0);
  const flowProgress = toolbar?.flowProgress ?? null;
  const isScrolledSurfaceMode = readingMode === "focus" || readingMode === "flow" || readingMode === "narrate";
  // Narrate's playing indicator is TTS truth (narration.speaking); Focus/Flow report their own clocks.
  const modePlaying = readingMode === "narrate" ? narration.speaking : (toolbar?.playing ?? false);
  const isActivelyReading = modePlaying;
  // useProgressTracker: the Focus display position while Focus is active.
  const focusWordIndex = active?.mode === "focus" ? active.runtime.getSnapshot().currentWordIndex : canonicalWordAnchor;

  // ── Progress tracking (extracted to useProgressTracker hook) ─────────
  const progress = useProgressTracker({
    activeDoc,
    wordIndex: focusWordIndex,
    anchorWordIndex: canonicalWordAnchor,
    readingMode,
    useFoliate,
    foliateFractionRef,
    wpm,
    wordsLength: words.length,
    totalWords: totalWordCount,
    sessionStartWordRef,
    activeReadingMsRef,
    activeReadingStartRef,
    onUpdateProgress,
    onArchiveDoc,
    onExitReader,
    onPagesRead: readingGoals.recordPages,
    onActiveReadingTime: readingGoals.recordActiveReadingMs,
    onBookCompleted: readingGoals.recordCompletedBook,
  });
  const { hasEngagedRef, markPageActivity } = progress;
  const { finishReading, finishReadingWithoutExit, showBacktrackPrompt, backtrackPages, checkBacktrack } = progress;

  const requestCompletionToPage = useCallback(() => {
    const current = router.getActive();
    if (current) router.requestCompletionToPage(current.key);
  }, [router]);

  shellRef.current = {
    activeDoc,
    library,
    settings,
    updateSettings,
    setWpm,
    onUpdateProgress,
    onOpenDocById,
    recordPages: readingGoals.recordPages,
    markEngaged: () => { hasEngagedRef.current = true; },
    markPageActivity,
    finishReadingWithoutExit,
    handleEinkPageTurn,
    handleEinkContentChange,
    requestCompletionToPage,
    pageSaveTimerRef: progress.pageSaveTimerRef,
    furthestPositionRef: progress.furthestPositionRef,
    lastSavedPosRef: progress.lastSavedPosRef,
  };

  // ── Document identity: a new document opens a new generation in Page ──────────
  const appliedSettingsRef = useRef<ReaderSettingsSnapshot | null>(null);
  useEffect(() => {
    documentGenerationRef.current += 1;
    hasShownRestoreToastRef.current = false; // BUG-148: Reset toast gate on doc change
    sessionStartRef.current = Date.now();
    sessionStartWordRef.current = activeDoc.position || 0;
    appliedSettingsRef.current = settingsSnapshotRef.current;
    router.openDocument(getDocument());
    if (pendingFlowResumeRef.current) {
      // useFlowScrollSync effect 2 (Flow part): auto-resume Flow in the next book of the queue.
      pendingFlowResumeRef.current = false;
      router.resumeFlowAfterBookOpen();
    }
  }, [activeDoc.id, getDocument, router]);

  // Settings changes reach only the active runtime's private copy.
  useEffect(() => {
    if (appliedSettingsRef.current === settingsSnapshot) return;
    appliedSettingsRef.current = settingsSnapshot;
    router.applySettings(settingsSnapshot);
  }, [router, settingsSnapshot]);

  // Document-port subscribers see each new snapshot (full-book words arriving).
  useEffect(() => {
    const snapshot = getDocument();
    for (const listener of [...documentListenersRef.current]) listener(snapshot);
  }, [bookWords, getDocument]);

  // ── Document lifecycle (shell half of useDocumentLifecycle) ─────────────────
  // Restore toast + chapters + delayed Kokoro prewarm on mount / doc change.
  useEffect(() => {
    api.getDocChapters(activeDoc.id).then((ch: any) => setDocChapters(ch || [])).catch(() => setDocChapters([]));
    // BUG-148: Inform the user their reading position was restored. Fire once per book open,
    // only when position > 0 (not a fresh start). Timer is cancelled on doc change so a rapid
    // book switch cannot fire the toast for the old book.
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    if ((activeDoc.position || 0) > 0) {
      restoreTimer = setTimeout(() => {
        if (!hasShownRestoreToastRef.current) {
          hasShownRestoreToastRef.current = true;
          showToast("Restored to your last position", 2000);
        }
      }, 500);
    }
    // Delayed prewarm: start Kokoro model load 2s after reader opens (never startup-blocking)
    let prewarmTimer: ReturnType<typeof setTimeout> | undefined;
    const preloadTtsEngine =
      settings.ttsEngine === "kokoro"
        ? api.kokoroPreload
        : null;
    if (preloadTtsEngine) {
      prewarmTimer = setTimeout(() => preloadTtsEngine().catch(() => {}), 2000);
    }
    return () => {
      clearTimeout(restoreTimer);
      clearTimeout(prewarmTimer);
    };
  }, [activeDoc.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Active reading timer: accumulates while a mode is actively reading.
  useEffect(() => {
    if (isActivelyReading) {
      activeReadingStartRef.current = Date.now();
    } else {
      if (activeReadingStartRef.current) {
        activeReadingMsRef.current += Date.now() - activeReadingStartRef.current;
        activeReadingStartRef.current = null;
      }
    }
  }, [isActivelyReading]);

  // Persist focusTextSize changes.
  const prevFocusTextSizeRef = useRef(focusTextSize);
  useEffect(() => {
    if (prevFocusTextSizeRef.current !== focusTextSize) {
      prevFocusTextSizeRef.current = focusTextSize;
      api.saveSettings({ focusTextSize });
    }
  }, [focusTextSize]);

  // FLOW-INF-C: Cleanup cross-book transition timeout on unmount
  useEffect(() => {
    return () => {
      if (crossBookTransition) clearTimeout(crossBookTransition.timeoutId);
    };
  }, [crossBookTransition]);

  // useFlowScrollSync effect 2: the "Up next" overlay stays until Flow is actually running in the next book.
  const flowRunning = readingMode === "flow" && (toolbar?.playing ?? false);
  useEffect(() => {
    if (!crossBookTransition || !flowRunning || activeDoc.id !== crossBookTransition.nextDocId) return;
    clearTimeout(crossBookTransition.timeoutId);
    setCrossBookTransition(null);
  }, [activeDoc.id, crossBookTransition, flowRunning]);

  // Chapter charOffset sync (useFoliateSync effect 2): once full-book words arrive, re-map each
  // chapter's charOffset to its global word index so chapter navigation uses real positions.
  useEffect(() => {
    if (!useFoliate || !bookWords?.sections.length) return;
    setDocChapters((prev) =>
      prev.map((chapter, idx, all) => ({
        ...chapter,
        charOffset: resolveTocWordIndex(
          chapter,
          idx,
          bookWords.totalWords || activeDoc.wordCount || 1,
          all.length,
          bookWords.sections,
        ),
      })),
    );
  }, [useFoliate, bookWords, activeDoc.wordCount]);

  // ── TTS infrastructure (useNarrationCaching effects 1–4, DD-7) ──────────────────
  const effectiveOverrides = mergeOverrides(settings.pronunciationOverrides || [], activeDoc.pronunciationOverrides || []);
  const effectiveOverrideKey = overrideHash(effectiveOverrides);
  const rateBucket = resolveKokoroRatePlan(settings.ttsRate || 1.0).generationBucket;
  // The cacher's word source: full-book words once extracted, else the tokenized text (non-EPUB).
  const cacheWords = bookWords ? bookWords.words : (useFoliate ? [] : words);
  const cacheWordsRef = useRef(cacheWords);
  cacheWordsRef.current = cacheWords;
  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;

  // NAR-2: Pre-warm Kokoro model + AudioContext on reader mount
  useEffect(() => {
    if (settings.ttsEngine === "kokoro") {
      if (api?.kokoroPreload) api.kokoroPreload().catch(() => {});
      // NAR-5: Preload marathon worker in parallel (background caching)
      if (api?.kokoroPreloadMarathon) api.kokoroPreloadMarathon().catch(() => {});
      // Warm up AudioContext so first play has zero audio driver latency
      narration.warmUp();
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
      getRateBucket: () => rateBucket,
      getPronunciationOverrides: () => effectiveOverrides,
    });
    backgroundCacherRef.current = cacher;
    cacher.start();

    return () => {
      cacher.stop();
      backgroundCacherRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc.id, effectiveOverrideKey, rateBucket, settings.ttsCacheEnabled, settings.ttsEngine, settings.ttsVoiceName]);

  // TTS-START-1: Queue entry coverage using the current opening-ramp start identity.
  useEffect(() => {
    const cacher = backgroundCacherRef.current;
    if (!cacher) return;
    const cacheBookWords = cacheWordsRef.current;
    if (cacheBookWords.length > 0 && settings.ttsEngine === "kokoro" && settings.ttsCacheEnabled !== false) {
      const startPosition = highlightedWordIndexRef.current ?? activeDoc.position ?? 0;
      cacher.queueEntryCoverage({
        id: activeDoc.id,
        words: [...cacheBookWords],
        position: startPosition,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc.id, effectiveOverrideKey, rateBucket, settings.ttsCacheEnabled, settings.ttsEngine, settings.ttsVoiceName]);

  // NAR-5: Set active book on the background cacher when text is available
  useEffect(() => {
    const cacher = backgroundCacherRef.current;
    if (!cacher) return;
    const cacheBookWords = cacheWordsRef.current;
    if (cacheBookWords.length > 0) {
      const startPosition = highlightedWordIndexRef.current ?? activeDoc.position ?? 0;
      cacher.setActiveBook({
        id: activeDoc.id,
        words: [...cacheBookWords],
        position: startPosition,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc.id, effectiveOverrideKey, rateBucket, settings.ttsVoiceName, cacheWords.length]);

  // TTS-6O: Background pre-extraction — full-book words ahead of any mode that needs them.
  useEffect(() => {
    if (!useFoliate || !api?.extractEpubWords) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      ensureBookWords().catch(() => {});
    }, activeDoc.wordCount > 100000 ? 2000 : 1000); // BUG-149: larger delay for big EPUBs
    return () => { cancelled = true; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFoliate, activeDoc.id]);

  // ── Shell handlers ──────────────────────────────────────────────────────────
  // Exit reader — uses the router and the progress hook
  const handleExitReader = useCallback(() => {
    const exitAnchor = canonicalWordAnchor;
    // FLOW-INF-C: Cancel cross-book transition and exit
    if (crossBookTransition) {
      clearTimeout(crossBookTransition.timeoutId);
      setCrossBookTransition(null);
      finishReading(exitAnchor);
      return;
    }
    if (readingMode === "page") {
      const totalWords = totalWordCount || 1;
      if (checkBacktrack(exitAnchor, totalWords, useFoliate)) return;
      finishReading(exitAnchor);
    } else {
      handleExitToPage();
    }
  }, [canonicalWordAnchor, checkBacktrack, crossBookTransition, finishReading, handleExitToPage, readingMode, totalWordCount, useFoliate]);

  const { handleSaveAtCurrent, handleKeepFurthest } = progress;

  const adjustFocusTextSize = useCallback((delta: number) => {
    if (!isFinite(delta)) { setFocusTextSize(DEFAULT_FOCUS_TEXT_SIZE); return; }
    setFocusTextSize((prev) => Math.max(MIN_FOCUS_TEXT_SIZE, Math.min(MAX_FOCUS_TEXT_SIZE, prev + delta)));
  }, []);

  const handleToggleFavoriteReader = useCallback(() => {
    onToggleFavorite(activeDoc.id);
  }, [activeDoc, onToggleFavorite]);

  const handleEnterPageMode = useCallback(() => {
    handlePauseToPage();
  }, [handlePauseToPage]);

  // Chapter navigation (explicit navigation of the canonical anchor in the active mode)
  const handlePrevChapter = useCallback(() => {
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs.length < 2) return;
    const curIdx = getCurChIdx(chs, canonicalWordAnchor);
    const targetIdx = curIdx > 0 ? chs[curIdx - 1].wordIndex : chs[0].wordIndex;
    handleNavigateTo(targetIdx);
  }, [activeDoc, docChapters, words, canonicalWordAnchor, handleNavigateTo]);

  const handleNextChapter = useCallback(() => {
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs.length < 2) return;
    const curIdx = getCurChIdx(chs, canonicalWordAnchor);
    if (curIdx < chs.length - 1) {
      handleNavigateTo(chs[curIdx + 1].wordIndex);
    }
  }, [activeDoc, docChapters, words, canonicalWordAnchor, handleNavigateTo]);

  const handleJumpToChapter = useCallback((chapterIndex: number) => {
    hasEngagedRef.current = true;
    markPageActivity();
    const chapterWordIdx = docChapters[chapterIndex]?.charOffset;
    if (typeof chapterWordIdx === "number" && chapterWordIdx >= 0) {
      handleNavigateTo(chapterWordIdx);
    }
    // For foliate EPUBs, navigate using the href from the TOC (the active mode's own view)
    const href = docChapters[chapterIndex]?.href;
    if (useFoliate && href) {
      handleCommand({ kind: "go-to-href", href });
      return;
    }
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs[chapterIndex]) {
      handleNavigateTo(chs[chapterIndex].wordIndex);
    }
  }, [activeDoc, docChapters, words, useFoliate, markPageActivity, handleCommand, handleNavigateTo, hasEngagedRef]);

  // ── Keyboard callbacks (each forwards to the active runtime through the router) ──
  // Page turns are owned by each mode's Foliate view (its own keydown); the shell records engagement.
  const handlePrevPage = useCallback(() => { hasEngagedRef.current = true; markPageActivity(); }, [hasEngagedRef, markPageActivity]);
  const handleNextPage = useCallback(() => { hasEngagedRef.current = true; markPageActivity(); }, [hasEngagedRef, markPageActivity]);
  const seekWords = useCallback((delta: number) => handleCommand({ kind: "seek-words", delta }), [handleCommand]);
  const handleFlowPrevLine = useCallback(() => handleCommand({ kind: "flow-line", direction: "prev" }), [handleCommand]);
  const handleFlowNextLine = useCallback(() => handleCommand({ kind: "flow-line", direction: "next" }), [handleCommand]);
  const handleMoveWordSelection = useCallback((direction: "left" | "right" | "up" | "down") => {
    handleCommand({ kind: "move-selection", direction });
  }, [handleCommand]);
  const handleParagraphPrev = useCallback(() => handleCommand({ kind: "paragraph", direction: "prev" }), [handleCommand]);
  const handleParagraphNext = useCallback(() => handleCommand({ kind: "paragraph", direction: "next" }), [handleCommand]);
  const handleSentencePrev = useCallback(() => handleCommand({ kind: "sentence", direction: "prev" }), [handleCommand]);
  const handleSentenceNext = useCallback(() => handleCommand({ kind: "sentence", direction: "next" }), [handleCommand]);

  const handleDefineWord = useCallback(() => {
    const word = words[highlightedWordIndex];
    if (word) {
      window.electronAPI.defineWord(word);
    }
  }, [words, highlightedWordIndex]);

  const handleMakeNote = useCallback(() => {
    // Note-making handled by the reader's context menu — dispatch custom event
    window.dispatchEvent(new CustomEvent("blurby:make-note", { detail: highlightedWordIndex }));
  }, [highlightedWordIndex]);

  // Keyboard shortcuts — fully mode-aware
  const chapterListRef = useRef<ChapterListHandle | null>(null);
  const handleOpenChapterList = useCallback(() => { chapterListRef.current?.toggle(); }, []);
  useReaderKeys("reader", readingMode, handleTogglePlay, seekWords, adjustSpeed, handleExitReader, adjustFocusTextSize, toggleMenuFlap, handleToggleFavoriteReader, handleEnterFocus, handlePrevChapter, handleNextChapter, handleToggleNarration, handlePrevPage, handleNextPage, handleEnterFlow, handleMoveWordSelection, handleDefineWord, handleMakeNote, handleParagraphPrev, handleParagraphNext, handleFlowPrevLine, handleFlowNextLine, handleOpenChapterList, handleCycleMode, handleCycleAndStart, handleSentencePrev, handleSentenceNext, handleEnterNarrate);

  const menuFlap = (
    <MenuFlap
      open={menuFlapOpen}
      onClose={() => { setMenuFlapOpen(false); onClearSettingsPage?.(); }}
      docs={library}
      settings={settings}
      onOpenDoc={onOpenDocById}
      onSettingsChange={updateSettings}
      siteLogins={siteLogins}
      onSiteLogin={onSiteLogin}
      onSiteLogout={onSiteLogout}
      targetView={settingsPage}
    />
  );

  // Focus's RSVP overlay offers the ESC and menu buttons (legacy ReaderView props).
  const modeShellCallbacks = useMemo<ReaderModeShellCallbacks>(() => ({
    exitReader: handleExitReader,
    onToggleFlap: toggleMenuFlap,
  }), [handleExitReader, toggleMenuFlap]);

  // Determine current word index for bottom bar
  const currentWordIndex = canonicalWordAnchor;

  // ── Render ─────────────────────────────────────────────────────────────

  const renderView = () => {
    // EPUBs: exactly one active mode view, each with its own Foliate view.
    if (useFoliate) {
      return active
        ? <ActiveModeView key={active.key.session} runtime={active.runtime} shell={modeShellCallbacks} />
        : null;
    }

    // Non-EPUB error fallback (all docs should be EPUB since EPUB-2B)
    return (
      <div className="reader-error reader-error-inner">
        <p className="reader-error-msg">
          This document needs to be re-imported to be read in the current version of Blurby.
        </p>
        <button
          onClick={() => finishReading(0)}
          className="reader-error-btn"
        >
          Return to Library
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Thin drag region at top for window dragging */}
      <div className="reader-drag-handle" />
      <div className="reader-layout">
        <div className="reader-view-area">
          <ErrorBoundary onReset={() => onExitReader(currentWordIndex)}>
            {renderView()}
          </ErrorBoundary>
          {/* Narration engine warming/loading indicator */}
          {(narration.warming || narration.kokoroLoading) && (
            <div className="kokoro-loading-toast" role="status" aria-live="polite">
              {narration.warming
                ? settings.ttsEngine === "kokoro"
                  ? "Starting Kokoro..."
                  : "Starting narration..."
                : "Loading voice model..."}
            </div>
          )}
        </div>

        {/* Unified bottom bar — rendered at container level */}
        <ReaderBottomBar
          activeDoc={activeDoc}
          words={words}
          wordIndex={currentWordIndex}
          wpm={effectiveWpm}
          focusTextSize={focusTextSize}
          readingMode={readingMode}
          isNarrating={isNarrating && narration.speaking && !narration.warming}
          playing={modePlaying}
          isEink={isEink}
          chapters={docChapters}
          onSetWpm={setWpm}
          flowProgress={isScrolledSurfaceMode ? flowProgress ?? undefined : undefined}
          currentChapterName={(() => {
            if (!isScrolledSurfaceMode || docChapters.length === 0) return undefined;
            const idx = getCurChIdx(chaptersFromCharOffsets(activeDoc.content, docChapters), currentWordIndex);
            return docChapters[idx]?.title;
          })()}
          onAdjustFocusTextSize={adjustFocusTextSize}
          onEnterPage={handleEnterPageMode}
          onEnterFocus={handleEnterFocus}
          onEnterFlow={handleEnterFlow}
          onToggleNarration={handleEnterNarrate}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          onJumpToChapter={handleJumpToChapter}
          onEinkRefresh={triggerEinkRefresh}
          onTogglePlay={handleTogglePlay}
          chapterListRef={chapterListRef}
          lastReadingMode={settings.lastReadingMode || "flow"}
          ttsRate={settings.ttsRate || 1.0}
          onSetTtsRate={(rate) => {
            // Narrate applies the stored rate to the audio session (its settings bridge).
            updateSettings({ ttsRate: rate });
          }}
          ttsEngine={settings.ttsEngine || "kokoro"}
          foliateFraction={useFoliate ? foliateFraction : undefined}
          narrationWordIndex={narration.speaking ? narration.cursorWordIndex : null}
          flowZoneLines={settings.flowZoneLines}
          onSetFlowZoneLines={(lines) => updateSettings({ flowZoneLines: lines })}
        />
      </div>

      {menuFlap}
      <ReturnToReadingPill
        visible={isBrowsedAway && isScrolledSurfaceMode && !narration.speaking}
        activeOverlay={menuFlapOpen || showBacktrackPrompt}
        onReturn={handleJumpBack}
      />
      {showEinkRefresh && <EinkRefreshOverlay />}
      {showBacktrackPrompt && (
        <BacktrackPrompt
          currentPage={backtrackPages.current}
          furthestPage={backtrackPages.furthest}
          onSaveAtCurrent={handleSaveAtCurrent}
          onKeepFurthest={handleKeepFurthest}
        />
      )}
      {crossBookTransition && (
        <div className="cross-book-overlay" onClick={() => {
          clearTimeout(crossBookTransition.timeoutId);
          setCrossBookTransition(null);
          handleExitReader();
        }}>
          <div className="cross-book-overlay__card" onClick={e => e.stopPropagation()}>
            <p className="cross-book-overlay__finished">Finished <strong>{crossBookTransition.finishedTitle}</strong></p>
            <p className="cross-book-overlay__next">Up next: <strong>{crossBookTransition.nextTitle}</strong></p>
            <div className="cross-book-overlay__progress">
              <div className="cross-book-overlay__bar" />
            </div>
            <p className="cross-book-overlay__hint">Press Escape to cancel</p>
          </div>
        </div>
      )}
    </>
  );
}

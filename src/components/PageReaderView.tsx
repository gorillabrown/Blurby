import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { tokenizeWithMeta, formatDisplayTitle } from "../utils/text";
import { PAGE_TRANSITION_MS, TOAST_DEFAULT_DURATION_MS, PAGE_REPAINT_DELAY_MS } from "../constants";
import { FlowCursorController } from "../utils/FlowCursorController";
import { BlurbyDoc, LayoutSpacing } from "../types";
import HighlightMenu from "./HighlightMenu";
import DefinitionPopup from "./DefinitionPopup";
import NotePopover from "./NotePopover";

const api = window.electronAPI;

interface PageSettings {
  flowTextSize?: number;
  layoutSpacing?: LayoutSpacing;
  fontFamily?: string | null;
  isEink?: boolean;
  flowWordSpan?: number; // 3-5, how many words highlighted at once in Flow
  flowCursorStyle?: "underline" | "highlight";
}

interface PageReaderViewProps {
  activeDoc: BlurbyDoc & { content: string };
  wpm: number;
  focusTextSize: number;
  settings?: PageSettings;
  highlightedWordIndex: number;
  onHighlightedWordChange: (index: number) => void;
  onEnterFocus: () => void;
  onEnterFlow: () => void;
  onExit: (position: number) => void;
  onToggleFlap?: () => void;
  notes?: Map<number, string>; // wordIndex → note preview
  pageNavRef?: React.MutableRefObject<{ prevPage: () => void; nextPage: () => void; goToPage: (page: number) => void; returnToHighlight: () => void; getCurrentPageStart: () => number }>;
  flowNavRef?: React.MutableRefObject<{ prevLine: () => void; nextLine: () => void }>;
  flowPlaying: boolean; // Flow mode: word highlight advances at WPM within page view
  ttsActive?: boolean; // When true, TTS drives cursor — skip RAF advancement
  onPageEndWordChange?: (endWordIndex: number) => void; // Reports current page's last word index
  onUserBrowsed?: (isBrowsed: boolean) => void; // Called when user manually browses away from NM position
}

// ── Pagination helpers ────────────────────────────────────────────────────

/** Split words into pages based on viewport height. Returns arrays of word ranges. */
function paginateWords(
  words: string[],
  paragraphBreaks: Set<number>,
  containerHeight: number,
  lineHeight: number,
  fontSize: number,
  charsPerLine: number
): Array<{ start: number; end: number }> {
  if (words.length === 0 || containerHeight <= 0) return [{ start: 0, end: 0 }];

  // Track height in pixels for accuracy.
  // Paragraph margin-bottom is 1em (= fontSize), not a full lineHeight.
  const paraMargin = fontSize;
  const pages: Array<{ start: number; end: number }> = [];
  let usedHeight = lineHeight; // First line is already present
  let lineChars = 0;
  let pageStart = 0;

  for (let i = 0; i < words.length; i++) {
    const wordLen = words[i].length + 1; // +1 for space
    lineChars += wordLen;

    if (lineChars > charsPerLine) {
      // Word wraps to new line
      usedHeight += lineHeight;
      lineChars = wordLen;
    }

    // Paragraph break adds margin
    if (paragraphBreaks.has(i)) {
      usedHeight += paraMargin;
      lineChars = 0;
    }

    if (usedHeight > containerHeight) {
      pages.push({ start: pageStart, end: Math.max(pageStart, i - 1) });
      pageStart = i;
      usedHeight = lineHeight; // New page starts with first line
      lineChars = words[i].length + 1;
    }
  }

  // Last page
  if (pageStart < words.length) {
    pages.push({ start: pageStart, end: words.length - 1 });
  }

  return pages.length > 0 ? pages : [{ start: 0, end: words.length - 1 }];
}

/** Find which page contains a given word index. */
function pageForWord(pages: Array<{ start: number; end: number }>, wordIndex: number): number {
  for (let i = 0; i < pages.length; i++) {
    if (wordIndex >= pages[i].start && wordIndex <= pages[i].end) return i;
  }
  return pages.length - 1;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PageReaderView({
  activeDoc,
  wpm,
  focusTextSize,
  settings,
  highlightedWordIndex,
  onHighlightedWordChange,
  onEnterFocus,
  onEnterFlow,
  onExit,
  onToggleFlap,
  notes,
  pageNavRef,
  flowNavRef,
  flowPlaying,
  ttsActive,
  onPageEndWordChange,
  onUserBrowsed,
}: PageReaderViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const flowCursorRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(800);
  const [currentPage, setCurrentPage] = useState(0);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;
  const [transitioning, setTransitioning] = useState(false);

  // NM browsing — user manually navigated away from narration page
  const [userBrowsing, setUserBrowsing] = useState(false);
  const ttsTargetPageRef = useRef(0);

  const prevTtsActiveRef = useRef(ttsActive);

  // Highlight menu state
  const [highlightWord, setHighlightWord] = useState<string | null>(null);
  const [highlightPos, setHighlightPos] = useState({ x: 0, y: 0 });
  const [showDefinition, setShowDefinition] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const closeHighlight = useCallback(() => {
    setHighlightWord(null);
    setShowDefinition(false);
  }, []);

  // Note popover state
  const [noteWordIndex, setNoteWordIndex] = useState<number | null>(null);
  const [notePos, setNotePos] = useState({ x: 200, y: 200 });
  const [savedNotes, setSavedNotes] = useState<Map<number, string>>(new Map());

  // Listen for make-note events (from Shift+N or context menu)
  useEffect(() => {
    const handler = (e: Event) => {
      const wordIdx = (e as CustomEvent).detail as number;
      // Find the word element to anchor the popover
      const el = document.querySelector(`[data-word-index="${wordIdx}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setNotePos({ x: rect.left, y: rect.bottom });
      }
      setNoteWordIndex(wordIdx);
      closeHighlight();
    };
    window.addEventListener("blurby:make-note", handler);
    return () => window.removeEventListener("blurby:make-note", handler);
  }, [closeHighlight]);

  const handleNoteSaved = useCallback((note: string) => {
    if (noteWordIndex !== null) {
      setSavedNotes((prev) => new Map(prev).set(noteWordIndex, note));
    }
    setNoteWordIndex(null);
    setToast("Note saved to Reading Notes.docx");
    setTimeout(() => setToast(null), TOAST_DEFAULT_DURATION_MS);
  }, [noteWordIndex]);

  // Tokenize content
  const { words, paragraphBreaks } = useMemo(
    () => tokenizeWithMeta(activeDoc.content || ""),
    [activeDoc.content]
  );

  // Compute layout constants
  const scale = (focusTextSize || 100) / 100;
  const fontSize = 18 * scale;
  const lineHeight = fontSize * (settings?.layoutSpacing?.line || 1.8);
  // Detect two-column mode (CSS column-count: 2 at ≥1280px)
  const isMultiColumn = containerWidth >= 1280 - 240; // 1280px viewport minus page padding
  const columnWidth = isMultiColumn ? (containerWidth - 48) / 2 : containerWidth;
  // Conservative char width (0.52) prevents overflow — better to under-fill than lose content
  const charsPerLine = Math.max(20, Math.floor(columnWidth / (fontSize * 0.52)));
  // Two columns = 2x the available height for pagination, with 5% safety margin
  const effectiveHeight = isMultiColumn ? containerHeight * 2 * 0.95 : containerHeight * 0.95;

  // Compute pages
  const pages = useMemo(
    () => paginateWords(words, paragraphBreaks, effectiveHeight, lineHeight, fontSize, charsPerLine),
    [words, paragraphBreaks, effectiveHeight, lineHeight, fontSize, charsPerLine]
  );

  // Measure the content area (not the outer view with padding/header)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      setContainerHeight(el.clientHeight);
      setContainerWidth(el.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Navigate to page containing highlighted word — fires on every word advance
  // This is the primary page-turn mechanism for Narration and TTS-driven modes.
  // When user is browsing (manually navigated during NM), track TTS page but don't navigate.
  useEffect(() => {
    if (pages.length <= 1) return;
    const targetPage = pageForWord(pages, highlightedWordIndex);
    ttsTargetPageRef.current = targetPage;

    if (userBrowsing && ttsActive) {
      // User is browsing away from NM — don't yank. But if TTS catches up to user's page, clear browsing.
      if (targetPage === currentPage) {
        setUserBrowsing(false);
        onUserBrowsed?.(false);
      }
    } else if (userBrowsing && !ttsActive) {
      // NM was paused while user was browsing — stay on browsed page, clear browsing flag
      setUserBrowsing(false);
      onUserBrowsed?.(false);
    } else if (targetPage !== currentPage) {
      currentPageRef.current = targetPage;
      setCurrentPage(targetPage);
    }
    // Report current page's end word to narration system (prevents cross-page chunks)
    if (onPageEndWordChange && pages[targetPage]) {
      onPageEndWordChange(pages[targetPage].end);
    }
  }, [highlightedWordIndex, pages, currentPage, onPageEndWordChange, userBrowsing, ttsActive]);

  // Page navigation — saves progress on every page turn
  // During active narration, manual navigation sets browsing mode (NM continues independently)
  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, page));
    if (clamped === currentPage) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentPage(clamped);
      currentPageRef.current = clamped;
      setTransitioning(false);
      if (ttsActive) {
        // Don't change highlighted word — NM continues reading independently
        // Only mark as browsed away if the destination page differs from the TTS highlight page
        const isOnHighlightPage = clamped === ttsTargetPageRef.current;
        setUserBrowsing(!isOnHighlightPage);
        onUserBrowsed?.(!isOnHighlightPage);
      } else {
        // Save progress: first word of the new page becomes the saved position
        const pageStart = pages[clamped]?.start ?? 0;
        onHighlightedWordChange(pageStart);
      }
    }, PAGE_TRANSITION_MS);
  }, [currentPage, pages.length, pages, onHighlightedWordChange, ttsActive]);

  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);

  // Navigate back to the TTS target page (the page containing the highlight)
  const returnToHighlight = useCallback(() => {
    const targetPage = ttsTargetPageRef.current;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentPage(targetPage);
      currentPageRef.current = targetPage;
      setTransitioning(false);
      setUserBrowsing(false);
      onUserBrowsed?.(false);
    }, PAGE_TRANSITION_MS);
  }, [onUserBrowsed]);

  // Register page nav callbacks for keyboard hook
  useEffect(() => {
    if (pageNavRef) {
      pageNavRef.current = {
        prevPage, nextPage, goToPage, returnToHighlight,
        // TTS-7B: Expose current page's start word for browse-away reconciliation
        getCurrentPageStart: () => pages[currentPageRef.current]?.start ?? 0,
      };
    }
  }, [pageNavRef, prevPage, nextPage, goToPage, returnToHighlight]);

  // ── Flow mode: imperative controller handles everything ──────────────
  const flowControllerRef = useRef<FlowCursorController | null>(null);
  const flowStopPosRef = useRef<number | null>(null);

  useEffect(() => {
    if (!flowPlaying) {
      if (flowControllerRef.current) {
        const finalPos = flowControllerRef.current.stop();
        flowStopPosRef.current = finalPos; // Save in ref (bypasses React batching)
        onHighlightedWordChange(finalPos);
        flowControllerRef.current = null;
      }
      return;
    }

    // When TTS is active, it drives word position — skip the cursor controller.
    // TTS fires onWordAdvance → setHighlightedWordIndex → page-sync effect handles page turns.
    if (ttsActive) return;

    // Resume position: ref is authoritative (avoids stale state from React batching)
    const startPos = flowStopPosRef.current ?? highlightedWordIndex;
    flowStopPosRef.current = null;

    // Navigate to page containing the reading position
    const targetPage = pageForWord(pages, startPos);
    if (targetPage !== currentPage) {
      currentPageRef.current = targetPage;
      setCurrentPage(targetPage);
    }

    const startController = () => {
      const cursorEl = flowCursorRef.current;
      if (!cursorEl) return;
      const ctrl = new FlowCursorController({
        cursorStyle: settings?.flowCursorStyle || "underline",
        onPageTurn: (nextIdx) => {
          currentPageRef.current = nextIdx; // Immediate update for controller
          setCurrentPage(nextIdx);          // React update for render
        },
        getPageCount: () => pages.length,
        getCurrentPageIdx: () => currentPageRef.current, // Always fresh via ref
      });
      ctrl.start(startPos, wpm, cursorEl);
      flowControllerRef.current = ctrl;
    };

    // No delay when already on the right page
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (targetPage !== currentPage) {
      // Page change needed — wait for DOM to repaint
      timer = setTimeout(startController, PAGE_REPAINT_DELAY_MS);
    } else {
      // Same page — start immediately (forced reflow in controller handles layout)
      startController();
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (flowControllerRef.current) {
        const finalPos = flowControllerRef.current.stop();
        flowStopPosRef.current = finalPos;
        onHighlightedWordChange(finalPos);
        flowControllerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowPlaying, ttsActive]);

  // Sync WPM changes to controller
  useEffect(() => {
    if (flowControllerRef.current?.isRunning()) {
      flowControllerRef.current.setWpm(wpm);
    }
  }, [wpm]);

  // Expose flow line navigation to parent via ref
  useEffect(() => {
    if (flowNavRef) {
      flowNavRef.current = {
        prevLine: () => flowControllerRef.current?.prevLine(),
        nextLine: () => flowControllerRef.current?.nextLine(),
      };
    }
  }, [flowNavRef]);

  // Side buttons for page navigation (replacing click-zone approach)

  // Wheel handler — scroll word-by-word in page mode (not during flow/focus playing)
  const lastWheelRef = useRef(0);
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (flowPlaying) return; // Don't interfere with Flow mode
    const now = Date.now();
    if (now - lastWheelRef.current < 80) return; // Throttle: one word per 80ms
    lastWheelRef.current = now;
    const delta = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (delta === 0) return;
    const newIdx = Math.max(0, Math.min(words.length - 1, highlightedWordIndex + delta));
    if (newIdx !== highlightedWordIndex) {
      onHighlightedWordChange(newIdx);
    }
  }, [flowPlaying, words.length, highlightedWordIndex, onHighlightedWordChange]);

  // Word click handler — set highlight anchor; during flow, jump controller
  const handleWordClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (flowControllerRef.current?.isRunning()) {
      flowControllerRef.current.jumpTo(index);
    } else {
      // Clear browsing state — user chose a new position, TTS will resync
      if (userBrowsing) setUserBrowsing(false);
      onHighlightedWordChange(index);
    }
  }, [onHighlightedWordChange, userBrowsing]);

  // Right-click context menu
  const handleWordContextMenu = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHighlightedWordChange(index);
    const raw = words[index] || "";
    const cleaned = raw.replace(/^[^\w]+|[^\w]+$/g, "") || raw;
    setHighlightWord(cleaned);
    setHighlightPos({ x: e.clientX, y: e.clientY });
  }, [words, onHighlightedWordChange]);

  // Handle highlight save
  const handleSaveHighlight = useCallback(async () => {
    if (!highlightWord) return;
    const result = await api.saveHighlight({
      docTitle: activeDoc.title,
      text: highlightWord,
      wordIndex: highlightedWordIndex,
      totalWords: words.length,
    });
    if (result?.ok) {
      setToast("Highlight saved");
      setTimeout(() => setToast(null), TOAST_DEFAULT_DURATION_MS);
    }
    closeHighlight();
  }, [activeDoc.title, highlightWord, highlightedWordIndex, words.length, closeHighlight]);

  // Handle define
  const handleDefine = useCallback(() => {
    setShowDefinition(true);
  }, []);

  // Always render only the current page's words — flow mode uses paginated
  // rendering with the controller driving page turns at end-of-page.
  const page = pages[currentPage] || { start: 0, end: 0 };
  const visibleStart = page.start;
  const visibleEnd = page.end;
  const visibleWords = words.slice(visibleStart, visibleEnd + 1);
  const progress = words.length > 0
    ? ((flowPlaying ? highlightedWordIndex : page.end + 1) / words.length) * 100
    : 0;

  // Build rendered paragraphs
  const renderedParagraphs = useMemo(() => {
    const paragraphs: Array<Array<{ word: string; globalIndex: number }>> = [];
    let currentPara: Array<{ word: string; globalIndex: number }> = [];

    for (let localIdx = 0; localIdx < visibleWords.length; localIdx++) {
      const globalIdx = visibleStart + localIdx;
      currentPara.push({ word: visibleWords[localIdx], globalIndex: globalIdx });

      if (paragraphBreaks.has(globalIdx) || localIdx === visibleWords.length - 1) {
        paragraphs.push(currentPara);
        currentPara = [];
      }
    }
    if (currentPara.length > 0) paragraphs.push(currentPara);
    return paragraphs;
  }, [visibleWords, visibleStart, paragraphBreaks]);

  return (
    <div
      className="page-reader-view"
      ref={containerRef}
      role="document"
      aria-label={`Reading ${formatDisplayTitle(activeDoc.title)}`}
    >
      {/* Header */}
      <div className="page-reader-header">
        <span className="page-reader-title">{formatDisplayTitle(activeDoc.title)}</span>
        {activeDoc.source === "url" && activeDoc.sourceDomain && (
          <span className="page-reader-provenance">
            {activeDoc.authorFull && `${activeDoc.authorFull}. `}
            {(() => {
              const dateStr = activeDoc.publishedDate || (activeDoc.created ? new Date(activeDoc.created).toISOString() : null);
              if (!dateStr) return "";
              try {
                const d = new Date(dateStr);
                return `(${d.getFullYear()}, ${d.toLocaleString("en-US", { month: "long" })} ${d.getDate()}). `;
              } catch { return ""; }
            })()}
            <span
              className="page-reader-source-link"
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (activeDoc.sourceUrl) api.openDocSource(activeDoc.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (activeDoc.sourceUrl) api.openDocSource(activeDoc.id);
                }
              }}
              aria-label={`Open source: ${activeDoc.sourceDomain}`}
            >
              {activeDoc.sourceDomain}
            </span>
          </span>
        )}
        {activeDoc.source !== "url" && activeDoc.author && (
          <span className="page-reader-author">by {activeDoc.author}</span>
        )}
      </div>

      {/* Page content */}
      <div
        ref={contentRef}
        className={`page-reader-content ${transitioning ? "page-reader-content--transitioning" : ""}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          letterSpacing: settings?.layoutSpacing?.character ? `${settings.layoutSpacing.character}px` : undefined,
          wordSpacing: settings?.layoutSpacing?.word ? `${settings.layoutSpacing.word}px` : undefined,
          fontFamily: settings?.fontFamily || undefined,
        }}
        onWheel={handleWheel}
      >
        {/* React-owned cursor div — controller styles it, React owns the DOM node */}
        <div
          ref={flowCursorRef}
          className="flow-highlight-cursor"
          aria-hidden="true"
        />
        {renderedParagraphs.map((para, pIdx) => (
          <p key={pIdx} className="page-reader-paragraph">
            {para.map(({ word, globalIndex }) => {
              // Show word highlight in Page mode always, and in Flow when TTS drives position
              const isHighlighted = (!flowPlaying || ttsActive) && globalIndex === highlightedWordIndex;
              const noteText = savedNotes.get(globalIndex) || notes?.get(globalIndex);
              const hasNote = !!noteText;
              return (
                <span
                  key={globalIndex}
                  className={[
                    "page-word",
                    isHighlighted ? "page-word--highlighted" : "",
                    hasNote ? "page-word--noted" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={(e) => handleWordClick(globalIndex, e)}
                  onContextMenu={(e) => handleWordContextMenu(globalIndex, e)}
                  data-word-index={globalIndex}
                  role="button"
                  tabIndex={-1}
                  title={hasNote ? noteText : undefined}
                  aria-label={isHighlighted ? `${word} (selected)` : hasNote ? `${word} (has note)` : word}
                >
                  {word}{" "}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      {/* Page indicator */}
      <div className="page-reader-footer" aria-live="polite">
        <span className="page-reader-page-num">
          {currentPage + 1} / {pages.length}
        </span>
        <span className="page-reader-progress">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Page navigation side buttons */}
      {currentPage > 0 && (
        <button
          className="page-nav-btn page-nav-btn--left"
          onClick={prevPage}
          aria-label="Previous page"
          title="Previous page (←)"
        >
          ‹
        </button>
      )}
      {currentPage < pages.length - 1 && (
        <button
          className="page-nav-btn page-nav-btn--right"
          onClick={nextPage}
          aria-label="Next page"
          title="Next page (→)"
        >
          ›
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="page-reader-toast" role="status">
          {toast}
          {toast.includes("Reading Notes") && (
            <button
              className="page-reader-toast-action"
              onClick={() => {
                api.openReadingNotes(activeDoc.id);
                setToast(null);
              }}
            >
              Open
            </button>
          )}
        </div>
      )}

      {/* Return to narration button — shown when user browsed away during NM */}
      {userBrowsing && ttsActive && (
        <button
          className="return-to-narration-btn"
          onClick={() => {
            const targetPage = ttsTargetPageRef.current;
            setCurrentPage(targetPage);
            currentPageRef.current = targetPage;
            setUserBrowsing(false);
          }}
          aria-label="Return to current narration position"
        >
          ↩ Return to narration
        </button>
      )}

      {/* Highlight menu */}
      {highlightWord && !showDefinition && (
        <HighlightMenu
          word={highlightWord}
          position={highlightPos}
          onSave={handleSaveHighlight}
          onDefine={handleDefine}
          onClose={closeHighlight}
          onMakeNote={() => {
            window.dispatchEvent(new CustomEvent("blurby:make-note", { detail: highlightedWordIndex }));
            closeHighlight();
          }}
        />
      )}

      {/* Definition popup */}
      {showDefinition && highlightWord && (
        <DefinitionPopup
          word={highlightWord}
          position={highlightPos}
          onSaveWithDefinition={(text) => {
            api.saveHighlight({
              docTitle: activeDoc.title,
              text,
              wordIndex: highlightedWordIndex,
              totalWords: words.length,
            });
            closeHighlight();
          }}
          onClose={closeHighlight}
        />
      )}

      {/* Note popover */}
      {noteWordIndex !== null && (
        <NotePopover
          word={words[noteWordIndex] || ""}
          wordIndex={noteWordIndex}
          docId={activeDoc.id}
          docTitle={activeDoc.title}
          author={activeDoc.authorFull || activeDoc.author}
          sourceUrl={activeDoc.sourceUrl}
          publishedDate={activeDoc.publishedDate}
          position={notePos}
          onSave={handleNoteSaved}
          onClose={() => setNoteWordIndex(null)}
        />
      )}
    </div>
  );
}

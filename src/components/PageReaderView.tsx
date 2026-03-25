import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { tokenizeWithMeta, formatDisplayTitle, hasPunctuation } from "../utils/text";
import { PAGE_TRANSITION_MS, TOAST_DEFAULT_DURATION_MS, PAGE_FLOW_SENTENCE_PAUSE_MS, PAGE_FLOW_CLAUSE_PAUSE_MS, ANIMATION_DISABLE_WPM, FLOW_PAGE_TURN_PAUSE_MS } from "../constants";
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
  pageNavRef?: React.MutableRefObject<{ prevPage: () => void; nextPage: () => void }>;
  flowPlaying: boolean; // Flow mode: word highlight advances at WPM within page view
  ttsActive?: boolean; // When true, TTS drives cursor — skip RAF advancement
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

  const linesPerPage = Math.max(1, Math.floor(containerHeight / lineHeight));
  const pages: Array<{ start: number; end: number }> = [];
  let lineCount = 0;
  let lineChars = 0;
  let pageStart = 0;

  for (let i = 0; i < words.length; i++) {
    const wordLen = words[i].length + 1; // +1 for space
    lineChars += wordLen;

    if (lineChars > charsPerLine) {
      lineCount++;
      lineChars = wordLen;
    }

    // Paragraph break adds an extra line
    if (paragraphBreaks.has(i)) {
      lineCount++;
      lineChars = 0;
    }

    if (lineCount >= linesPerPage) {
      pages.push({ start: pageStart, end: i });
      pageStart = i + 1; // next page starts AFTER this word
      lineCount = 0;
      lineChars = 0;
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
  flowPlaying,
  ttsActive,
}: PageReaderViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(800);
  const [currentPage, setCurrentPage] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

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
  const charsPerLine = Math.max(20, Math.floor(containerWidth / (fontSize * 0.55)));

  // Compute pages
  const pages = useMemo(
    () => paginateWords(words, paragraphBreaks, containerHeight - 40, lineHeight, fontSize, charsPerLine),
    [words, paragraphBreaks, containerHeight, lineHeight, fontSize, charsPerLine]
  );

  // Measure container on mount/resize
  useEffect(() => {
    const el = containerRef.current;
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

  // Navigate to page containing highlighted word on mount or mode return
  useEffect(() => {
    if (pages.length > 1) {
      const page = pageForWord(pages, highlightedWordIndex);
      if (page !== currentPage) setCurrentPage(page);
    }
  }, [activeDoc.id, highlightedWordIndex, pages]); // Runs on doc change AND on return from Focus/Flow

  // Page navigation
  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, page));
    if (clamped === currentPage) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentPage(clamped);
      setTransitioning(false);
    }, PAGE_TRANSITION_MS);
  }, [currentPage, pages.length]);

  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);

  // Register page nav callbacks for keyboard hook
  useEffect(() => {
    if (pageNavRef) {
      pageNavRef.current = { prevPage, nextPage };
    }
  }, [pageNavRef, prevPage, nextPage]);

  // ── Flow highlight cursor (smooth sliding overlay) ──────────────────
  const flowCursorRef = useRef<HTMLDivElement>(null);
  const flowCursorLastY = useRef(0);

  const wordSpan = Math.max(3, settings?.flowWordSpan || 3);

  // Hide cursor when not in flow mode
  useEffect(() => {
    if (!flowPlaying && flowCursorRef.current) {
      flowCursorRef.current.style.display = "none";
    }
  }, [flowPlaying]);

  // ── Flow mode: continuous line-level bar slide at WPM speed ─────────────
  const flowRafRef = useRef<number | null>(null);
  const flowPagePausingRef = useRef(false);
  const ttsActiveRef = useRef(ttsActive || false);
  ttsActiveRef.current = ttsActive || false;
  const flowWpmRef = useRef(wpm);
  const flowPagesRef = useRef(pages);
  const flowCurrentPageRef = useRef(currentPage);
  const flowWordsRef = useRef(words);
  const flowHighlightRef = useRef(highlightedWordIndex);
  const onHighlightRef = useRef(onHighlightedWordChange);
  flowWpmRef.current = wpm;
  flowPagesRef.current = pages;
  flowCurrentPageRef.current = currentPage;
  flowWordsRef.current = words;
  flowHighlightRef.current = highlightedWordIndex;
  onHighlightRef.current = onHighlightedWordChange;

  /** Build a line map from rendered word elements on the current page */
  const buildLineMap = useCallback(() => {
    const container = document.querySelector(".page-reader-content") as HTMLElement;
    if (!container) return [];
    const cRect = container.getBoundingClientRect();
    const wordEls = container.querySelectorAll("[data-word-index]");
    if (wordEls.length === 0) return [];

    type LineInfo = { y: number; bottom: number; left: number; right: number; firstWord: number; lastWord: number; wordCount: number };
    const lines: LineInfo[] = [];
    let currentLine: LineInfo | null = null;

    wordEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const wordIdx = parseInt(el.getAttribute("data-word-index") || "0", 10);
      const relTop = rect.top - cRect.top + container.scrollTop;
      const relBottom = rect.bottom - cRect.top + container.scrollTop;
      const relLeft = rect.left - cRect.left + container.scrollLeft;
      const relRight = rect.right - cRect.left + container.scrollLeft;

      if (!currentLine || Math.abs(relTop - currentLine.y) > rect.height * 0.5) {
        // New line
        currentLine = { y: relTop, bottom: relBottom, left: relLeft, right: relRight, firstWord: wordIdx, lastWord: wordIdx, wordCount: 1 };
        lines.push(currentLine);
      } else {
        // Same line — extend
        currentLine.right = relRight;
        currentLine.lastWord = wordIdx;
        currentLine.wordCount++;
      }
    });
    return lines;
  }, []);

  useEffect(() => {
    if (!flowPlaying) {
      if (flowRafRef.current) cancelAnimationFrame(flowRafRef.current);
      flowRafRef.current = null;
      return;
    }

    const cursor = flowCursorRef.current;
    if (!cursor) return;

    // Build line map for current page
    let lines = buildLineMap();
    if (lines.length === 0) return;

    // Find starting line based on current highlighted word
    const startWordIdx = flowHighlightRef.current;
    let lineIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (startWordIdx >= lines[i].firstWord && startWordIdx <= lines[i].lastWord) {
        lineIdx = i;
        break;
      }
    }

    const isUnderline = (settings?.flowCursorStyle || "underline") === "underline";
    const barWidth = 60; // fixed bar width in pixels
    let lineStartTime = performance.now();
    let currentLineIdx = lineIdx;

    // Calculate how long a line takes: (wordCount / WPM) * 60000 ms
    const getLineDurationMs = (line: typeof lines[0]) => (line.wordCount / flowWpmRef.current) * 60000;

    const positionOnLine = (line: typeof lines[0], progress: number) => {
      const lineWidth = line.right - line.left;
      const x = line.left + progress * (lineWidth - barWidth);
      const y = isUnderline ? line.bottom - 3 : line.y;
      const h = isUnderline ? 3 : (line.bottom - line.y);
      cursor.style.transition = "none";
      cursor.className = "flow-highlight-cursor" + (isUnderline ? "" : " flow-highlight-cursor--box");
      cursor.style.transform = `translate3d(${Math.max(line.left, x)}px, ${y}px, 0)`;
      cursor.style.width = `${Math.min(barWidth, lineWidth)}px`;
      cursor.style.height = `${h}px`;
      cursor.style.display = "";
    };

    const tick = (timestamp: number) => {
      if (flowPagePausingRef.current || ttsActiveRef.current) {
        lineStartTime = timestamp - (timestamp - lineStartTime); // preserve offset
        flowRafRef.current = requestAnimationFrame(tick);
        return;
      }

      const line = lines[currentLineIdx];
      if (!line) return;

      const elapsed = timestamp - lineStartTime;
      const duration = getLineDurationMs(line);
      const progress = Math.min(1, elapsed / duration);

      positionOnLine(line, progress);

      // Update word index based on progress through the line
      const wordInLine = Math.floor(progress * line.wordCount);
      const globalWordIdx = Math.min(line.firstWord + wordInLine, line.lastWord);
      onHighlightRef.current(globalWordIdx);

      if (progress >= 1) {
        // Line complete — move to next line
        currentLineIdx++;
        lineStartTime = timestamp;

        if (currentLineIdx >= lines.length) {
          // End of page — check for next page
          const curPageIdx = flowCurrentPageRef.current;
          const nextPageIdx = curPageIdx + 1;
          if (nextPageIdx < flowPagesRef.current.length) {
            flowPagePausingRef.current = true;
            setTimeout(() => {
              setCurrentPage(nextPageIdx);
              flowCurrentPageRef.current = nextPageIdx;
              setTimeout(() => {
                // Rebuild line map for new page
                lines = buildLineMap();
                currentLineIdx = 0;
                lineStartTime = performance.now();
                flowPagePausingRef.current = false;
              }, PAGE_TRANSITION_MS + 50);
            }, FLOW_PAGE_TURN_PAUSE_MS);
          } else {
            // End of document
            return;
          }
        }
      }

      flowRafRef.current = requestAnimationFrame(tick);
    };

    // Initial position
    if (lines[currentLineIdx]) {
      positionOnLine(lines[currentLineIdx], 0);
    }

    flowRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (flowRafRef.current) cancelAnimationFrame(flowRafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowPlaying, buildLineMap, settings?.flowCursorStyle]);

  // Click on left/right halves of screen
  const handlePageClick = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    // Don't navigate if clicking on a word
    if ((e.target as HTMLElement).closest(".page-word")) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) prevPage();
    else nextPage();
  }, [prevPage, nextPage]);

  // Word click handler — set highlight anchor
  const handleWordClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onHighlightedWordChange(index);
  }, [onHighlightedWordChange]);

  // Right-click context menu
  const handleWordContextMenu = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onHighlightedWordChange(index);
    setHighlightWord(words[index] || null);
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

  // In Flow mode, render ALL words for continuous scrolling.
  // In Page mode, render only the current page's words.
  const page = pages[currentPage] || { start: 0, end: 0 };
  const visibleStart = flowPlaying ? 0 : page.start;
  const visibleEnd = flowPlaying ? words.length - 1 : page.end;
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
      onClick={handlePageClick}
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
              onClick={(e) => {
                e.stopPropagation();
                if (activeDoc.sourceUrl) api.openDocSource(activeDoc.id);
              }}
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
        className={`page-reader-content ${transitioning ? "page-reader-content--transitioning" : ""} ${flowPlaying ? "page-reader-content--flow" : ""}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          letterSpacing: settings?.layoutSpacing?.character ? `${settings.layoutSpacing.character}px` : undefined,
          wordSpacing: settings?.layoutSpacing?.word ? `${settings.layoutSpacing.word}px` : undefined,
          fontFamily: settings?.fontFamily || undefined,
        }}
      >
        {/* Flow highlight cursor — positioned via direct DOM, CSS transition for smooth glide */}
        {flowPlaying && <div ref={flowCursorRef} className="flow-highlight-cursor" style={{ display: "none" }} />}
        {renderedParagraphs.map((para, pIdx) => (
          <p key={pIdx} className="page-reader-paragraph">
            {para.map(({ word, globalIndex }) => {
              // During flow with underline cursor, no word background — underline handles it
              // With highlight cursor, show word backgrounds as before
              const useHighlightCursor = settings?.flowCursorStyle === "highlight";
              const isHighlighted = flowPlaying
                ? (useHighlightCursor && globalIndex >= highlightedWordIndex && globalIndex < highlightedWordIndex + wordSpan)
                : globalIndex === highlightedWordIndex;
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

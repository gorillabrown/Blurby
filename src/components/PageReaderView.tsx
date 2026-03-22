import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { tokenizeWithMeta, formatDisplayTitle } from "../utils/text";
import { BlurbyDoc, LayoutSpacing } from "../types";
import HighlightMenu from "./HighlightMenu";
import DefinitionPopup from "./DefinitionPopup";

const api = window.electronAPI;

interface PageSettings {
  flowTextSize?: number;
  layoutSpacing?: LayoutSpacing;
  fontFamily?: string | null;
  isEink?: boolean;
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
      pageStart = i;
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

  // Navigate to page containing highlighted word on mount
  useEffect(() => {
    if (highlightedWordIndex > 0 && pages.length > 1) {
      const page = pageForWord(pages, highlightedWordIndex);
      setCurrentPage(page);
    }
  }, [activeDoc.id]); // Only on doc change

  // Page navigation
  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, page));
    if (clamped === currentPage) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentPage(clamped);
      setTransitioning(false);
    }, 100);
  }, [currentPage, pages.length]);

  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);

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
      setTimeout(() => setToast(null), 2000);
    }
    closeHighlight();
  }, [activeDoc.title, highlightWord, highlightedWordIndex, words.length, closeHighlight]);

  // Handle define
  const handleDefine = useCallback(() => {
    setShowDefinition(true);
  }, []);

  // Render current page's words
  const page = pages[currentPage] || { start: 0, end: 0 };
  const pageWords = words.slice(page.start, page.end + 1);
  const progress = words.length > 0 ? ((page.end + 1) / words.length) * 100 : 0;

  // Build rendered paragraphs for current page
  const renderedParagraphs = useMemo(() => {
    const paragraphs: Array<Array<{ word: string; globalIndex: number }>> = [];
    let currentPara: Array<{ word: string; globalIndex: number }> = [];

    for (let localIdx = 0; localIdx < pageWords.length; localIdx++) {
      const globalIdx = page.start + localIdx;
      currentPara.push({ word: pageWords[localIdx], globalIndex: globalIdx });

      if (paragraphBreaks.has(globalIdx + 1) || localIdx === pageWords.length - 1) {
        paragraphs.push(currentPara);
        currentPara = [];
      }
    }
    if (currentPara.length > 0) paragraphs.push(currentPara);
    return paragraphs;
  }, [pageWords, page.start, paragraphBreaks]);

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
            {activeDoc.publishedDate ? (() => {
              try {
                const d = new Date(activeDoc.publishedDate);
                return `(${d.getFullYear()}, ${d.toLocaleString("en-US", { month: "long" })} ${d.getDate()}). `;
              } catch { return "(n.d.). "; }
            })() : "(n.d.). "}
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
        className={`page-reader-content ${transitioning ? "page-reader-content--transitioning" : ""}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          letterSpacing: settings?.layoutSpacing?.character ? `${settings.layoutSpacing.character}px` : undefined,
          wordSpacing: settings?.layoutSpacing?.word ? `${settings.layoutSpacing.word}px` : undefined,
          fontFamily: settings?.fontFamily || undefined,
        }}
      >
        {renderedParagraphs.map((para, pIdx) => (
          <p key={pIdx} className="page-reader-paragraph">
            {para.map(({ word, globalIndex }) => {
              const isHighlighted = globalIndex === highlightedWordIndex;
              const hasNote = notes?.has(globalIndex);
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
                  aria-label={isHighlighted ? `${word} (selected)` : word}
                >
                  {word}
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
      {toast && <div className="page-reader-toast" role="status">{toast}</div>}

      {/* Highlight menu */}
      {highlightWord && !showDefinition && (
        <HighlightMenu
          word={highlightWord}
          position={highlightPos}
          onSave={handleSaveHighlight}
          onDefine={handleDefine}
          onClose={closeHighlight}
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
    </div>
  );
}

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { tokenizeWithMeta, formatTime, formatDisplayTitle } from "../utils/text";
import { FOCUS_TEXT_SIZE_STEP, DOUBLE_ESC_WINDOW_MS, SCROLL_SAVE_DEBOUNCE_MS, FLOW_SCROLL_THROTTLE_MS, FLOW_PROGRESS_SAVE_MS, FLOW_STATE_SYNC_MS, TOAST_DEFAULT_DURATION_MS, EINK_LINES_PER_PAGE } from "../constants";
import { calculatePauseMs } from "../utils/rhythm";
import { BlurbyDoc, LayoutSpacing, RhythmPauses } from "../types";

/** Sliced settings for scroll/flow reader — only fields it actually uses */
interface ScrollSettings {
  flowTextSize?: number;
  layoutSpacing?: LayoutSpacing;
  rhythmPauses?: RhythmPauses;
  punctuationPauseMs?: number;
  readingRuler?: boolean;
  fontFamily?: string | null;
  isEink?: boolean;
  einkRefreshInterval?: number;
}
import ProgressBar from "./ProgressBar";
import HighlightMenu from "./HighlightMenu";
import DefinitionPopup from "./DefinitionPopup";
import VirtualScrollText from "./VirtualScrollText";
import FlowText from "./FlowText";

const api = window.electronAPI;

interface ScrollReaderViewProps {
  activeDoc: BlurbyDoc & { content: string };
  wpm: number;
  focusTextSize: number;
  isMac: boolean;
  settings?: ScrollSettings;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onExit: (position: number) => void;
  onProgressUpdate: (position: number) => void;
  onSwitchToFocus?: () => void;
  onToggleFlap?: () => void;
  onPageTurn?: () => void;
}

export default function ScrollReaderView({ activeDoc, wpm, focusTextSize, isMac, settings, onSetWpm, onAdjustFocusTextSize, onExit, onProgressUpdate, onSwitchToFocus, onToggleFlap, onPageTurn }: ScrollReaderViewProps) {
  const { words, paragraphBreaks } = useMemo(
    () => tokenizeWithMeta(activeDoc.content || ""),
    [activeDoc.content]
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Double-escape exit confirmation
  const [escPending, setEscPending] = useState(false);
  const escTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEscTimeRef = useRef(0);

  // Highlight menu state
  const [highlightWord, setHighlightWord] = useState<string | null>(null);
  const [highlightPos, setHighlightPos] = useState({ x: 0, y: 0 });
  const [showDefinition, setShowDefinition] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeHighlight = useCallback(() => {
    setHighlightWord(null);
    setShowDefinition(false);
  }, []);

  const clampedPosRef = useRef(0);

  // E-ink paginated mode state (declarations that don't depend on displayBlocks)
  const isEink = settings?.isEink || false;
  const [einkPage, setEinkPage] = useState(0);
  const einkLinesPerPage = EINK_LINES_PER_PAGE; // approximate lines per "page"

  // Flow mode state
  const [flowPlaying, setFlowPlaying] = useState(false);
  const [flowWordIndex, setFlowWordIndex] = useState(activeDoc.position || 0);
  const flowAccRef = useRef(0);
  const flowRafRef = useRef<number | null>(null);
  const flowLastTimeRef = useRef(0);
  const flowWordRef = useRef<HTMLSpanElement | null>(null);
  const flowWordIndexRef = useRef(flowWordIndex);
  const flowLastStateSyncRef = useRef(0);

  // Split content into paragraphs for natural rendering (passive scroll)
  const displayBlocks = useMemo(() => {
    const paragraphs = (activeDoc.content || "").split(/\n{2,}/).filter((p) => p.trim());
    return paragraphs.length > 1
      ? paragraphs
      : (activeDoc.content || "").split(/\n/).filter((p) => p.trim());
  }, [activeDoc.content]);

  // E-ink paginated mode (displayBlocks-dependent)
  const einkTotalPages = useMemo(() => {
    if (!isEink) return 0;
    return Math.max(1, Math.ceil(displayBlocks.length / einkLinesPerPage));
  }, [isEink, displayBlocks.length]);
  const einkPageBlocks = useMemo(() => {
    if (!isEink) return displayBlocks;
    const start = einkPage * einkLinesPerPage;
    return displayBlocks.slice(start, start + einkLinesPerPage);
  }, [isEink, einkPage, displayBlocks]);

  const einkPageForward = useCallback(() => {
    if (!isEink) return;
    setEinkPage((prev) => {
      const next = Math.min(prev + 1, einkTotalPages - 1);
      if (next !== prev) onPageTurn?.();
      const pos = Math.round(((next + 1) / einkTotalPages) * words.length);
      onProgressUpdate(Math.min(pos, Math.max(0, words.length - 1)));
      return next;
    });
  }, [isEink, einkTotalPages, words.length, onProgressUpdate, onPageTurn]);

  const einkPageBack = useCallback(() => {
    if (!isEink) return;
    setEinkPage((prev) => {
      const next = Math.max(prev - 1, 0);
      if (next !== prev) onPageTurn?.();
      const pos = Math.round(((next + 1) / einkTotalPages) * words.length);
      onProgressUpdate(Math.min(pos, Math.max(0, words.length - 1)));
      return next;
    });
  }, [isEink, einkTotalPages, words.length, onProgressUpdate, onPageTurn]);

  const currentPosition = flowPlaying || flowWordIndex > 0 ? flowWordIndex : Math.round(scrollPct * words.length);
  const clampedPosition = Math.min(currentPosition, Math.max(0, words.length - 1));
  const pct = words.length > 0 ? Math.round((clampedPosition / words.length) * 100) : 0;
  const remaining = formatTime(Math.max(0, words.length - clampedPosition), wpm);

  clampedPosRef.current = clampedPosition;

  const handleSaveHighlight = useCallback(async (text?: string) => {
    const wordToSave = text || highlightWord;
    if (!wordToSave) return;
    const result = await api.saveHighlight({
      docTitle: activeDoc.title,
      text: wordToSave,
      wordIndex: clampedPosRef.current,
      totalWords: words.length,
    });
    if (result?.ok) {
      setToast("Saved to highlights");
      setTimeout(() => setToast(null), TOAST_DEFAULT_DURATION_MS);
    }
    closeHighlight();
  }, [highlightWord, activeDoc.title, words.length, closeHighlight]);

  const scale = ((settings?.flowTextSize || focusTextSize) || 100) / 100;
  const spacing = settings?.layoutSpacing;

  // Scroll to initial position on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !words.length) return;
    requestAnimationFrame(() => {
      const startPct = (activeDoc.position || 0) / words.length;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        el.scrollTop = startPct * maxScroll;
      }
    });
  }, []); // only on mount

  // Track scroll position for progress (passive scroll mode)
  const handleScroll = useCallback(() => {
    if (flowPlaying) return; // Don't track scroll when flow is active
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) { setScrollPct(0); return; }
    const pct = Math.min(1, Math.max(0, el.scrollTop / maxScroll));
    setScrollPct(pct);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const pos = Math.round(pct * words.length);
      onProgressUpdate(pos);
    }, SCROLL_SAVE_DEBOUNCE_MS);
  }, [words.length, onProgressUpdate, flowPlaying]);

  // Flow mode RAF tick
  const flowTick = useCallback((timestamp: number) => {
    if (!flowLastTimeRef.current) flowLastTimeRef.current = timestamp;
    const delta = timestamp - flowLastTimeRef.current;
    flowLastTimeRef.current = timestamp;

    flowAccRef.current += delta;
    const interval = 60000 / wpm;

    const currentWord = words[flowWordIndexRef.current] || "";
    const extraPause = settings?.rhythmPauses
      ? calculatePauseMs(currentWord, settings.rhythmPauses, settings?.punctuationPauseMs || 1000, paragraphBreaks.has(flowWordIndexRef.current))
      : 0;
    const effectiveInterval = interval + extraPause;

    if (flowAccRef.current >= effectiveInterval) {
      flowAccRef.current -= effectiveInterval;
      const next = flowWordIndexRef.current + 1;
      if (next >= words.length) {
        setFlowWordIndex(flowWordIndexRef.current);
        setFlowPlaying(false);
      } else {
        flowWordIndexRef.current = next;
        // Throttle React state sync (DOM highlighting is ref-based)
        const now = performance.now();
        if (now - flowLastStateSyncRef.current >= FLOW_STATE_SYNC_MS) {
          flowLastStateSyncRef.current = now;
          setFlowWordIndex(next);
        }
      }
    }

    flowRafRef.current = requestAnimationFrame(flowTick);
  }, [wpm, words, settings?.rhythmPauses, settings?.punctuationPauseMs, paragraphBreaks]);

  // Start/stop flow loop
  useEffect(() => {
    if (flowPlaying) {
      flowLastTimeRef.current = 0;
      flowAccRef.current = 0;
      flowRafRef.current = requestAnimationFrame(flowTick);
    } else if (flowRafRef.current) {
      cancelAnimationFrame(flowRafRef.current);
      flowRafRef.current = null;
      // Sync final word position when stopping
      setFlowWordIndex(flowWordIndexRef.current);
    }
    return () => { if (flowRafRef.current) cancelAnimationFrame(flowRafRef.current); };
  }, [flowPlaying, flowTick]);

  // Auto-scroll to keep highlighted word visible during flow (throttled to avoid jank)
  const lastScrollRef = useRef(0);
  useEffect(() => {
    if (flowPlaying && flowWordRef.current) {
      const now = performance.now();
      // Only scroll every FLOW_SCROLL_THROTTLE_MS to prevent smooth-scroll queuing
      if (now - lastScrollRef.current > FLOW_SCROLL_THROTTLE_MS) {
        lastScrollRef.current = now;
        flowWordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [flowWordIndex, flowPlaying]);

  // Save flow progress (throttled to every 5s)
  const lastProgressSaveRef = useRef(0);
  useEffect(() => {
    if (flowPlaying && flowWordIndex > 0) {
      const now = Date.now();
      if (now - lastProgressSaveRef.current >= FLOW_PROGRESS_SAVE_MS) {
        lastProgressSaveRef.current = now;
        onProgressUpdate(flowWordIndex);
      }
    }
  }, [flowWordIndex, flowPlaying, onProgressUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        onToggleFlap?.();
      } else if (e.code === "Space" && e.shiftKey) {
        e.preventDefault();
        setFlowPlaying((prev) => !prev);
      } else if (e.code === "Space" && !e.shiftKey) {
        e.preventDefault();
        onSwitchToFocus?.();
      } else if (e.code === "Escape") {
        e.preventDefault();
        if (flowPlaying) {
          // First Escape during flow playback: pause
          setFlowPlaying(false);
          // Start double-escape window
          lastEscTimeRef.current = Date.now();
          setEscPending(true);
          if (escTimerRef.current) clearTimeout(escTimerRef.current);
          escTimerRef.current = setTimeout(() => setEscPending(false), DOUBLE_ESC_WINDOW_MS);
        } else if (escPending && Date.now() - lastEscTimeRef.current < DOUBLE_ESC_WINDOW_MS) {
          // Second Escape within 2s: exit
          if (escTimerRef.current) clearTimeout(escTimerRef.current);
          setEscPending(false);
          onExit(clampedPosition);
        } else {
          // Not playing, no pending: exit immediately
          onExit(clampedPosition);
        }
      } else if (e.code === "Equal" || e.code === "NumpadAdd") {
        e.preventDefault();
        onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP);
      } else if (e.code === "Minus" || e.code === "NumpadSubtract") {
        e.preventDefault();
        onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP);
      } else if (isEink && (e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "PageDown")) {
        e.preventDefault();
        einkPageForward();
      } else if (isEink && (e.code === "ArrowLeft" || e.code === "ArrowUp" || e.code === "PageUp")) {
        e.preventDefault();
        einkPageBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit, clampedPosition, onAdjustFocusTextSize, onToggleFlap, onSwitchToFocus, flowPlaying, escPending, isEink, einkPageForward, einkPageBack]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (escTimerRef.current) clearTimeout(escTimerRef.current);
    };
  }, []);

  const isFlowActive = flowPlaying || flowWordIndex > 0;

  return (
    <div ref={containerRef} id="main-content" className={`scroll-reader${isMac ? " scroll-reader--mac" : ""}`} role="region" aria-label="Scroll reader">
      {escPending && (
        <div className="esc-confirm" role="alert">
          Press Esc again to exit
        </div>
      )}
      {/* Top bar */}
      <div className={`scroll-reader-top${isMac ? " scroll-reader-top--mac" : ""}`}>
        <div className="reader-top-left">
          <button onClick={() => onExit(clampedPosition)} className="reader-esc-btn" aria-label="Exit reader">ESC</button>
          <span className="reader-doc-title">{formatDisplayTitle(activeDoc.title)}</span>
          {activeDoc.source === "url" && (activeDoc.authorFull || activeDoc.sourceDomain) && (
            <span className="reader-apa-citation">
              {activeDoc.authorFull && <span>{activeDoc.authorFull} </span>}
              {activeDoc.publishedDate ? (() => {
                try {
                  const d = new Date(activeDoc.publishedDate);
                  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                  return <span>({d.getFullYear()}, {months[d.getMonth()]} {d.getDate()}). </span>;
                } catch { return <span>(n.d.). </span>; }
              })() : (activeDoc.authorFull ? <span>(n.d.). </span> : null)}
              {activeDoc.sourceDomain && activeDoc.sourceUrl ? (
                <a className="reader-apa-source-link" href="#" onClick={(e) => { e.preventDefault(); window.electronAPI.openDocSource(activeDoc.id); }}>{activeDoc.sourceDomain}</a>
              ) : activeDoc.sourceDomain ? (
                <span>{activeDoc.sourceDomain}</span>
              ) : null}
            </span>
          )}
        </div>
        <div className="scroll-reader-top-right">
          <button
            className={`btn reader-mode-btn${flowPlaying ? " active" : ""}`}
            onClick={() => setFlowPlaying((prev) => !prev)}
            aria-label={flowPlaying ? "Pause flow reading" : "Start flow reading"}
          >
            {flowPlaying ? "pause" : "flow"}
          </button>
          <div className="reader-font-controls">
            <button className="reader-font-btn" onClick={() => onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP)} aria-label="Decrease font size">A-</button>
            <span className="reader-font-label">{Math.round(scale * 100)}%</span>
            <button className="reader-font-btn" onClick={() => onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP)} aria-label="Increase font size">A+</button>
          </div>
          {onSwitchToFocus && (
            <button className="btn reader-mode-btn" onClick={onSwitchToFocus} aria-label="Switch to focus reading mode">
              focus mode
            </button>
          )}
          <span className="scroll-reader-page">{pct}%</span>
        </div>
      </div>

      {/* Full scrollable content — paginated in e-ink mode */}
      {isEink && !isFlowActive ? (
        <div
          className="scroll-reader-content eink-paginated"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Tab") { e.preventDefault(); e.stopPropagation(); onToggleFlap?.(); }
          }}
          onClick={(e) => {
            // Tap right half = forward, left half = back
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            if (e.clientX > rect.left + rect.width / 2) einkPageForward();
            else einkPageBack();
          }}
        >
          <VirtualScrollText
            displayBlocks={einkPageBlocks}
            scale={scale}
            spacing={spacing}
            scrollRef={scrollRef}
          />
          <div className="eink-page-indicator" aria-live="polite">
            Page {einkPage + 1} of {einkTotalPages}
          </div>
        </div>
      ) : (
        <div
          className="scroll-reader-content"
          ref={scrollRef}
          onScroll={handleScroll}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Tab") { e.preventDefault(); e.stopPropagation(); onToggleFlap?.(); }
          }}
        >
          {isFlowActive ? (
            <FlowText
              words={words}
              paragraphBreaks={paragraphBreaks}
              flowWordIndex={flowWordIndex}
              flowWordIndexRef={flowWordIndexRef}
              flowPlaying={flowPlaying}
              flowWordRef={flowWordRef}
              scale={scale}
              spacing={spacing}
              containerRef={containerRef}
              onClickWord={(idx) => { flowWordIndexRef.current = idx; setFlowWordIndex(idx); }}
              onHighlight={(word, pos) => { setHighlightWord(word); setHighlightPos(pos); setShowDefinition(false); }}
            />
          ) : (
            <VirtualScrollText
              displayBlocks={displayBlocks}
              scale={scale}
              spacing={spacing}
              scrollRef={scrollRef}
            />
          )}
        </div>
      )}

      {settings?.readingRuler && (
        <div className="reading-ruler" aria-hidden="true" />
      )}

      {/* Bottom bar removed — unified ReaderBottomBar rendered by ReaderContainer */}

      {/* Highlight menu + definition popup */}
      {highlightWord && (
        <HighlightMenu
          word={highlightWord}
          position={highlightPos}
          onSave={() => handleSaveHighlight()}
          onDefine={() => setShowDefinition(true)}
          onClose={closeHighlight}
        />
      )}
      {showDefinition && highlightWord && (
        <DefinitionPopup
          word={highlightWord}
          position={highlightPos}
          onSaveWithDefinition={(text) => handleSaveHighlight(text)}
          onClose={() => setShowDefinition(false)}
        />
      )}

      {/* Screen reader flow word announcement */}
      {flowPlaying && (
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {words[flowWordIndex] || ""}
        </div>
      )}

      {toast && <div className="highlight-toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

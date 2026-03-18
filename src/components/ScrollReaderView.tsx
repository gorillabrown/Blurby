import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { tokenize, tokenizeWithMeta, formatTime, formatDisplayTitle, FOCUS_TEXT_SIZE_STEP } from "../utils/text";
import { calculatePauseMs } from "../utils/rhythm";
import { BlurbyDoc, BlurbySettings } from "../types";
import ProgressBar from "./ProgressBar";

const BLOCK_THRESHOLD = 200; // virtualize when > 200 paragraphs
const BLOCK_WINDOW = 60;    // render 60 blocks at a time

function VirtualScrollText({ displayBlocks, scale, spacing, scrollRef }: {
  displayBlocks: string[];
  scale: number;
  spacing?: { line?: number; character?: number; word?: number };
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: Math.min(BLOCK_WINDOW, displayBlocks.length) });
  const useVirtual = displayBlocks.length > BLOCK_THRESHOLD;

  useEffect(() => {
    if (!useVirtual) return;
    const el = scrollRef.current;
    if (!el) return;
    const observer = () => {
      const scrollFraction = el.scrollHeight > el.clientHeight
        ? el.scrollTop / (el.scrollHeight - el.clientHeight)
        : 0;
      const centerBlock = Math.floor(scrollFraction * displayBlocks.length);
      const half = Math.floor(BLOCK_WINDOW / 2);
      const start = Math.max(0, centerBlock - half);
      const end = Math.min(displayBlocks.length, centerBlock + half);
      setVisibleRange((prev) => {
        if (prev.start === start && prev.end === end) return prev;
        return { start, end };
      });
    };
    el.addEventListener("scroll", observer, { passive: true });
    return () => el.removeEventListener("scroll", observer);
  }, [useVirtual, displayBlocks.length, scrollRef]);

  const estBlockHeight = 24 * scale * (spacing?.line || 1.8);
  const blocks = useVirtual ? displayBlocks.slice(visibleRange.start, visibleRange.end) : displayBlocks;

  return (
    <div className="scroll-reader-text" style={{
      fontSize: `${18 * scale}px`,
      lineHeight: spacing?.line || undefined,
      letterSpacing: spacing?.character ? `${spacing.character}px` : undefined,
      wordSpacing: spacing?.word ? `${spacing.word}px` : undefined,
    }}>
      {useVirtual && <div style={{ height: visibleRange.start * estBlockHeight }} aria-hidden="true" />}
      {blocks.map((block, i) => (
        <p key={useVirtual ? visibleRange.start + i : i} className="scroll-reader-paragraph">{block}</p>
      ))}
      {useVirtual && <div style={{ height: (displayBlocks.length - visibleRange.end) * estBlockHeight }} aria-hidden="true" />}
    </div>
  );
}

interface ScrollReaderViewProps {
  activeDoc: BlurbyDoc & { content: string };
  wpm: number;
  focusTextSize: number;
  isMac: boolean;
  settings?: BlurbySettings;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onExit: (position: number) => void;
  onProgressUpdate: (position: number) => void;
  onSwitchToFocus?: () => void;
  onToggleFlap?: () => void;
}

export default function ScrollReaderView({ activeDoc, wpm, focusTextSize, isMac, settings, onSetWpm, onAdjustFocusTextSize, onExit, onProgressUpdate, onSwitchToFocus, onToggleFlap }: ScrollReaderViewProps) {
  const { words, paragraphBreaks } = useMemo(
    () => tokenizeWithMeta(activeDoc.content || ""),
    [activeDoc.content]
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flow mode state
  const [flowPlaying, setFlowPlaying] = useState(false);
  const [flowWordIndex, setFlowWordIndex] = useState(activeDoc.position || 0);
  const flowAccRef = useRef(0);
  const flowRafRef = useRef<number | null>(null);
  const flowLastTimeRef = useRef(0);
  const flowWordRef = useRef<HTMLSpanElement | null>(null);
  const flowWordIndexRef = useRef(flowWordIndex);

  // Split content into paragraphs for natural rendering (passive scroll)
  const displayBlocks = useMemo(() => {
    const paragraphs = (activeDoc.content || "").split(/\n{2,}/).filter((p) => p.trim());
    return paragraphs.length > 1
      ? paragraphs
      : (activeDoc.content || "").split(/\n/).filter((p) => p.trim());
  }, [activeDoc.content]);

  const currentPosition = flowPlaying || flowWordIndex > 0 ? flowWordIndex : Math.round(scrollPct * words.length);
  const clampedPosition = Math.min(currentPosition, Math.max(0, words.length - 1));
  const pct = words.length > 0 ? Math.round((clampedPosition / words.length) * 100) : 0;
  const remaining = formatTime(Math.max(0, words.length - clampedPosition), wpm);

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
    }, 300);
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
        setFlowPlaying(false);
      } else {
        flowWordIndexRef.current = next;
        setFlowWordIndex(next);
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
    }
    return () => { if (flowRafRef.current) cancelAnimationFrame(flowRafRef.current); };
  }, [flowPlaying, flowTick]);

  // Auto-scroll to keep highlighted word visible during flow
  useEffect(() => {
    if (flowPlaying && flowWordRef.current) {
      flowWordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [flowWordIndex, flowPlaying]);

  // Save flow progress
  useEffect(() => {
    if (flowPlaying && flowWordIndex > 0) {
      onProgressUpdate(flowWordIndex);
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
        if (flowPlaying) setFlowPlaying(false);
        else onExit(clampedPosition);
      } else if (e.code === "Equal" || e.code === "NumpadAdd") {
        e.preventDefault();
        onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP);
      } else if (e.code === "Minus" || e.code === "NumpadSubtract") {
        e.preventDefault();
        onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit, clampedPosition, onAdjustFocusTextSize, onToggleFlap, onSwitchToFocus, flowPlaying]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const isFlowActive = flowPlaying || flowWordIndex > 0;

  return (
    <div className="scroll-reader" style={{ paddingTop: isMac ? 48 : 32 }}>
      {/* Top bar */}
      <div className="scroll-reader-top" style={{ paddingTop: isMac ? 36 : 16 }}>
        <div className="reader-top-left">
          <button onClick={() => onExit(clampedPosition)} className="reader-esc-btn" aria-label="Exit reader">ESC</button>
          <span className="reader-doc-title">{formatDisplayTitle(activeDoc.title)}</span>
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

      {/* Full scrollable content */}
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
          (() => {
            // Virtual windowing: only render ~3000 words around current position for large docs
            const VIRT_THRESHOLD = 10000;
            const WINDOW_HALF = 1500;
            const useVirtual = words.length > VIRT_THRESHOLD;
            const windowStart = useVirtual ? Math.max(0, flowWordIndex - WINDOW_HALF) : 0;
            const windowEnd = useVirtual ? Math.min(words.length, flowWordIndex + WINDOW_HALF) : words.length;
            const visibleWords = useVirtual ? words.slice(windowStart, windowEnd) : words;
            // Estimate spacer height for words before the window (approx 6 chars/word + space, ~14px per line of ~10 words)
            const estLinesAbove = useVirtual ? Math.ceil(windowStart / 10) : 0;
            const spacerHeight = estLinesAbove * (18 * scale * (spacing?.line || 1.8));

            return (
              <div className="scroll-reader-text flow-text" style={{
                fontSize: `${18 * scale}px`,
                lineHeight: spacing?.line || undefined,
                letterSpacing: spacing?.character ? `${spacing.character}px` : undefined,
                wordSpacing: spacing?.word ? `${spacing.word}px` : undefined,
              }}>
                {useVirtual && <div style={{ height: spacerHeight }} aria-hidden="true" />}
                {visibleWords.map((word, vi) => {
                  const globalIdx = windowStart + vi;
                  return (
                    <span
                      key={globalIdx}
                      ref={globalIdx === flowWordIndex ? flowWordRef : undefined}
                      className={globalIdx === flowWordIndex ? "flow-word-active" : ""}
                      onClick={() => { flowWordIndexRef.current = globalIdx; setFlowWordIndex(globalIdx); }}
                    >
                      {word}{" "}
                    </span>
                  );
                })}
                {useVirtual && <div style={{ height: Math.ceil((words.length - windowEnd) / 10) * (18 * scale * (spacing?.line || 1.8)) }} aria-hidden="true" />}
              </div>
            );
          })()
        ) : (
          <VirtualScrollText
            displayBlocks={displayBlocks}
            scale={scale}
            spacing={spacing}
            scrollRef={scrollRef}
          />
        )}
      </div>

      {settings?.readingRuler && (
        <div className="reading-ruler" aria-hidden="true" />
      )}

      {/* Bottom bar */}
      <div className="scroll-reader-bottom">
        <ProgressBar current={clampedPosition} total={words.length} />
        <div className="reader-bottom-info">
          <span>{pct}%</span>
          <span className="scroll-reader-hint">
            {flowPlaying ? "Shift+Space pause" : "Shift+Space flow"} &middot; Space focus &middot; Esc exit
          </span>
          <span>{remaining} left</span>
        </div>
      </div>
    </div>
  );
}

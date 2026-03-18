import { useRef, useEffect, useState, useCallback } from "react";
import { tokenize, formatTime, formatDisplayTitle, FOCUS_TEXT_SIZE_STEP } from "../utils/text";
import { BlurbyDoc } from "../types";
import ProgressBar from "./ProgressBar";

interface ScrollReaderViewProps {
  activeDoc: BlurbyDoc & { content: string };
  wpm: number;
  focusTextSize: number;
  isMac: boolean;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onExit: (position: number) => void;
  onProgressUpdate: (position: number) => void;
  onSwitchToFocus?: () => void;
  onToggleFlap?: () => void;
}

export default function ScrollReaderView({ activeDoc, wpm, focusTextSize, isMac, onSetWpm, onAdjustFocusTextSize, onExit, onProgressUpdate, onSwitchToFocus, onToggleFlap }: ScrollReaderViewProps) {
  const words = tokenize(activeDoc.content || "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Split content into paragraphs for natural rendering
  const paragraphs = (activeDoc.content || "").split(/\n{2,}/).filter((p) => p.trim());
  // If no paragraph breaks, split on single newlines
  const displayBlocks = paragraphs.length > 1
    ? paragraphs
    : (activeDoc.content || "").split(/\n/).filter((p) => p.trim());

  const wordPosition = Math.round(scrollPct * words.length);
  const clampedPosition = Math.min(wordPosition, Math.max(0, words.length - 1));
  const pct = words.length > 0 ? Math.round((clampedPosition / words.length) * 100) : 0;
  const remaining = formatTime(Math.max(0, words.length - clampedPosition), wpm);

  const scale = (focusTextSize || 100) / 100;

  // Scroll to initial position on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !words.length) return;
    // Wait a frame for content to render
    requestAnimationFrame(() => {
      const startPct = (activeDoc.position || 0) / words.length;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        el.scrollTop = startPct * maxScroll;
      }
    });
  }, []); // only on mount

  // Track scroll position for progress
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setScrollPct(0);
      return;
    }
    const pct = Math.min(1, Math.max(0, el.scrollTop / maxScroll));
    setScrollPct(pct);

    // Debounce progress save
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const pos = Math.round(pct * words.length);
      onProgressUpdate(pos);
    }, 300);
  }, [words.length, onProgressUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        onToggleFlap?.();
      } else if (e.code === "Escape") {
        e.preventDefault();
        onExit(clampedPosition);
      } else if (e.code === "Equal" || e.code === "NumpadAdd") {
        e.preventDefault();
        onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP);
      } else if (e.code === "Minus" || e.code === "NumpadSubtract") {
        e.preventDefault();
        onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP);
      }
      // Let arrow keys / space / page up/down work naturally for scrolling
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit, clampedPosition, onAdjustFocusTextSize, onToggleFlap]);

  // Cleanup save timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <div className="scroll-reader" style={{ paddingTop: isMac ? 48 : 32 }}>
      {/* Top bar */}
      <div className="scroll-reader-top" style={{ paddingTop: isMac ? 36 : 16 }}>
        <div className="reader-top-left">
          <button onClick={() => onExit(clampedPosition)} className="reader-esc-btn" aria-label="Exit reader">ESC</button>
          <span className="reader-doc-title">{formatDisplayTitle(activeDoc.title)}</span>
        </div>
        <div className="scroll-reader-top-right">
          <div className="reader-font-controls">
            <button className="reader-font-btn" onClick={() => onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP)} aria-label="Decrease font size">A-</button>
            <span className="reader-font-label">{focusTextSize}%</span>
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
      >
        <div className="scroll-reader-text" style={{ fontSize: `${18 * scale}px` }}>
          {displayBlocks.map((block, i) => (
            <p key={i} className="scroll-reader-paragraph">{block}</p>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="scroll-reader-bottom">
        <ProgressBar current={clampedPosition} total={words.length} />
        <div className="reader-bottom-info">
          <span>{pct}%</span>
          <span className="scroll-reader-hint">scroll to read &middot; Esc to exit &middot; +/- font</span>
          <span>{remaining} left</span>
        </div>
      </div>
    </div>
  );
}

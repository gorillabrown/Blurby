import { useMemo, useState, useEffect } from "react";
import type { LayoutSpacing } from "../types";
import { SCROLL_EDGE_THRESHOLD_PX } from "../constants";

/** Sliced settings for RSVP reader pause view */
interface RsvpSettings {
  focusSpan?: number;
  focusMarks?: boolean;
  layoutSpacing?: LayoutSpacing;
  fontFamily?: string | null;
}

const PAUSE_PARA_WINDOW = 10; // render ~20 paragraphs around current word

interface PausedTextViewProps {
  paragraphs: string[];
  paraStartIndices: number[];
  wordIndex: number;
  highlightIdx: number;
  currentWordRef: React.RefObject<HTMLSpanElement | null>;
  scrollBodyRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  settings?: RsvpSettings;
  onJumpToWord: (index: number) => void;
  onHighlight: (word: string, idx: number, pos: { x: number; y: number }) => void;
  togglePlay: () => void;
}

export default function PausedTextView({ paragraphs, paraStartIndices, wordIndex, highlightIdx, currentWordRef, scrollBodyRef, containerRef, settings, onJumpToWord, onHighlight, togglePlay }: PausedTextViewProps) {
  // Find which paragraph the current word is in
  const activePara = useMemo(() => {
    for (let i = paraStartIndices.length - 1; i >= 0; i--) {
      if (wordIndex >= paraStartIndices[i]) return i;
    }
    return 0;
  }, [wordIndex, paraStartIndices]);

  // Expand window when user scrolls
  const [extraRange, setExtraRange] = useState(0);
  const windowSize = PAUSE_PARA_WINDOW + extraRange;
  const paraStart = Math.max(0, activePara - windowSize);
  const paraEnd = Math.min(paragraphs.length, activePara + windowSize + 1);

  // Load more paragraphs when user scrolls near the edge
  useEffect(() => {
    const el = scrollBodyRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const nearTop = scrollTop < SCROLL_EDGE_THRESHOLD_PX;
      const nearBottom = scrollHeight - scrollTop - clientHeight < SCROLL_EDGE_THRESHOLD_PX;
      if ((nearTop && paraStart > 0) || (nearBottom && paraEnd < paragraphs.length)) {
        setExtraRange((prev) => Math.min(prev + 10, Math.ceil(paragraphs.length / 2)));
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [paraStart, paraEnd, paragraphs.length, scrollBodyRef]);

  // Reset extra range when word position changes significantly
  useEffect(() => { setExtraRange(0); }, [activePara]);

  const estParaHeight = 40; // rough estimate per paragraph

  return (
    <div
      ref={scrollBodyRef}
      className="reader-pause-text"
      onClick={(e) => e.stopPropagation()}
      style={{
        lineHeight: settings?.layoutSpacing?.line || undefined,
        letterSpacing: settings?.layoutSpacing?.character ? `${settings.layoutSpacing.character}px` : undefined,
        wordSpacing: settings?.layoutSpacing?.word ? `${settings.layoutSpacing.word}px` : undefined,
      }}
    >
      {paraStart > 0 && <div style={{ height: paraStart * estParaHeight }} aria-hidden="true" />}
      {paragraphs.slice(paraStart, paraEnd).map((para, pi) => {
        const paraIdx = paraStart + pi;
        const paraWords = para.split(/\s+/).filter(Boolean);
        const paraWordStart = paraStartIndices[paraIdx];
        return (
          <p key={paraIdx} className="reader-pause-paragraph">
            {paraWords.map((word, wIdx) => {
              const globalIdx = paraWordStart + wIdx;
              const isCurrent = globalIdx === wordIndex;
              const isHighlighted = globalIdx === highlightIdx;
              return (
                <span
                  key={wIdx}
                  ref={isCurrent ? currentWordRef : undefined}
                  className={isHighlighted ? "reader-pause-word-highlighted" : isCurrent ? "reader-pause-word-current" : "reader-pause-word"}
                  onClick={() => onJumpToWord(globalIdx)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const container = containerRef.current?.getBoundingClientRect();
                    if (container) {
                      onHighlight(word, globalIdx, {
                        x: rect.left + rect.width / 2 - container.left,
                        y: rect.top - container.top,
                      });
                    }
                  }}
                >
                  {word}{" "}
                </span>
              );
            })}
          </p>
        );
      })}
      {paraEnd < paragraphs.length && <div style={{ height: (paragraphs.length - paraEnd) * estParaHeight }} aria-hidden="true" />}
      <div className="reader-pause-text-end">
        <button className="reader-resume-btn" onClick={togglePlay}>
          resume reading
        </button>
      </div>
    </div>
  );
}

import { useRef, useEffect, useMemo } from "react";

interface FlowTextProps {
  words: string[];
  paragraphBreaks: Set<number>;
  flowWordIndex: number;
  flowWordIndexRef: React.RefObject<number>;
  flowPlaying: boolean;
  flowWordRef: React.RefObject<HTMLSpanElement | null>;
  scale: number;
  spacing?: { line?: number; character?: number; word?: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClickWord: (idx: number) => void;
  onHighlight: (word: string, pos: { x: number; y: number }) => void;
}

// Flow mode: renders words grouped by paragraphs with a small virtual window for performance.
// During playback, word highlighting is done via direct DOM class swaps (bypasses React).
export default function FlowText({ words, paragraphBreaks, flowWordIndex, flowWordIndexRef, flowPlaying, flowWordRef, scale, spacing, containerRef, onClickWord, onHighlight }: FlowTextProps) {
  // Build paragraph ranges once
  const paragraphs = useMemo(() => {
    const paras: { start: number; end: number }[] = [];
    let start = 0;
    for (let i = 0; i < words.length; i++) {
      if (paragraphBreaks.has(i) || i === words.length - 1) {
        paras.push({ start, end: i + 1 });
        start = i + 1;
      }
    }
    return paras;
  }, [words.length, paragraphBreaks]);

  // Find which paragraph the current word is in
  const activePara = useMemo(() => {
    for (let i = 0; i < paragraphs.length; i++) {
      if (flowWordIndex < paragraphs[i].end) return i;
    }
    return paragraphs.length - 1;
  }, [paragraphs, flowWordIndex]);

  // Virtual window: render ~15 paragraphs around the active one
  const PARA_WINDOW = 7;
  const paraStart = Math.max(0, activePara - PARA_WINDOW);
  const paraEnd = Math.min(paragraphs.length, activePara + PARA_WINDOW + 1);

  // Ref-based DOM class swaps during flow playback
  const flowTextContainerRef = useRef<HTMLDivElement>(null);
  const prevHighlightRef = useRef<HTMLElement | null>(null);

  // Direct DOM highlight update -- runs on RAF outside React
  useEffect(() => {
    if (!flowPlaying) return;
    let rafId: number;
    let lastIdx = -1;

    const updateHighlight = () => {
      const currentIdx = flowWordIndexRef.current;
      if (currentIdx !== lastIdx && flowTextContainerRef.current) {
        // Remove previous highlight
        if (prevHighlightRef.current) {
          prevHighlightRef.current.classList.remove("flow-word-active");
        }
        // Find new word span by data attribute
        const span = flowTextContainerRef.current.querySelector(`[data-widx="${currentIdx}"]`) as HTMLElement | null;
        if (span) {
          span.classList.add("flow-word-active");
          prevHighlightRef.current = span;
          // Update flowWordRef for auto-scroll
          (flowWordRef as React.MutableRefObject<HTMLSpanElement | null>).current = span as HTMLSpanElement;
        }
        lastIdx = currentIdx;
      }
      rafId = requestAnimationFrame(updateHighlight);
    };
    rafId = requestAnimationFrame(updateHighlight);
    return () => cancelAnimationFrame(rafId);
  }, [flowPlaying, flowWordIndexRef, flowWordRef]);

  // Cleanup highlight class when stopping
  useEffect(() => {
    if (!flowPlaying && prevHighlightRef.current) {
      prevHighlightRef.current.classList.remove("flow-word-active");
      prevHighlightRef.current = null;
    }
  }, [flowPlaying]);

  return (
    <div ref={flowTextContainerRef} className="scroll-reader-text flow-text" style={{
      fontSize: `${18 * scale}px`,
      lineHeight: spacing?.line || undefined,
      letterSpacing: spacing?.character ? `${spacing.character}px` : undefined,
      wordSpacing: spacing?.word ? `${spacing.word}px` : undefined,
    }}>
      {paraStart > 0 && <div style={{ height: paraStart * 2.4 * 18 * scale }} aria-hidden="true" />}
      {paragraphs.slice(paraStart, paraEnd).map((para, pi) => (
        <p key={paraStart + pi} className="scroll-reader-paragraph">
          {words.slice(para.start, para.end).map((word, wi) => {
            const globalIdx = para.start + wi;
            const isActive = !flowPlaying && globalIdx === flowWordIndex;
            return (
              <span
                key={globalIdx}
                data-widx={globalIdx}
                ref={isActive ? flowWordRef : undefined}
                className={isActive ? "flow-word-active" : ""}
                onClick={() => onClickWord(globalIdx)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  const container = containerRef.current?.getBoundingClientRect();
                  if (container) {
                    onHighlight(word, { x: rect.left + rect.width / 2 - container.left, y: rect.top - container.top });
                  }
                }}
              >
                {word}{" "}
              </span>
            );
          })}
        </p>
      ))}
      {paraEnd < paragraphs.length && <div style={{ height: (paragraphs.length - paraEnd) * 2.4 * 18 * scale }} aria-hidden="true" />}
    </div>
  );
}

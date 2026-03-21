import { useState, useEffect } from "react";

const BLOCK_THRESHOLD = 50;  // virtualize when > 50 paragraphs
const BLOCK_WINDOW = 30;    // render 30 blocks at a time

interface VirtualScrollTextProps {
  displayBlocks: string[];
  scale: number;
  spacing?: { line?: number; character?: number; word?: number };
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export default function VirtualScrollText({ displayBlocks, scale, spacing, scrollRef }: VirtualScrollTextProps) {
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

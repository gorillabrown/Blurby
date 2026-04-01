/**
 * FlowScrollView -- Non-EPUB fallback for Flow Mode infinite scroll.
 * Renders all document words in a continuous scroll container.
 * Since EPUB-2B, all documents are EPUBs -- this is a safety fallback.
 * React only calls start/stop on FlowScrollEngine (per LL-014).
 */
import { useRef, useEffect, useCallback, useMemo } from "react";
import { tokenizeWithMeta } from "../utils/text";
import { FlowScrollEngine } from "../utils/FlowScrollEngine";
import type { BlurbyDoc } from "../types";

interface FlowScrollViewProps {
  activeDoc: BlurbyDoc & { content: string };
  wpm: number;
  isEink: boolean;
  onWordAdvance: (wordIndex: number) => void;
  onComplete: () => void;
  startWordIndex: number;
  playing: boolean;
}

export default function FlowScrollView({
  activeDoc, wpm, isEink, onWordAdvance, onComplete, startWordIndex, playing
}: FlowScrollViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FlowScrollEngine | null>(null);

  const { words, paragraphBreaks } = useMemo(
    () => tokenizeWithMeta(activeDoc.content || ""),
    [activeDoc.content]
  );

  // Create engine once
  useEffect(() => {
    const engine = new FlowScrollEngine({ onWordAdvance, onComplete });
    engineRef.current = engine;
    return () => { engine.destroy(); engineRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start/stop based on playing prop
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !containerRef.current || !cursorRef.current) return;
    if (playing) {
      engine.start(containerRef.current, cursorRef.current, startWordIndex, wpm, paragraphBreaks, isEink);
    } else {
      engine.pause();
    }
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync WPM changes
  useEffect(() => {
    engineRef.current?.setWpm(wpm);
  }, [wpm]);

  return (
    <div className="flow-scroll-container" ref={containerRef} style={{ position: "relative" }}>
      <div className="flow-scroll-content">
        {words.map((word, i) => {
          const isParagraphEnd = paragraphBreaks.has(i);
          return (
            <span key={i}>
              <span className="page-word" data-word-index={i}>{word}</span>
              {isParagraphEnd ? <><br /><br /></> : " "}
            </span>
          );
        })}
      </div>
      <div ref={cursorRef} className="flow-shrink-cursor" style={{ display: "none" }} />
    </div>
  );
}

import { useRef, useEffect, useMemo } from "react";
import { focusChar, formatTime, MIN_WPM, MAX_WPM, WPM_STEP, FOCUS_TEXT_SIZE_STEP } from "../utils/text";
import { BlurbyDoc } from "../types";
import ProgressBar from "./ProgressBar";
import WpmGauge from "./WpmGauge";

interface ReaderViewProps {
  activeDoc: BlurbyDoc & { content: string };
  words: string[];
  wordIndex: number;
  wpm: number;
  focusTextSize: number;
  playing: boolean;
  escPending: boolean;
  isMac: boolean;
  togglePlay: () => void;
  exitReader: () => void;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onSwitchToScroll: () => void;
  onJumpToWord: (index: number) => void;
  onToggleFlap?: () => void;
}

export default function ReaderView({ activeDoc, words, wordIndex, wpm, focusTextSize, playing, escPending, isMac, togglePlay, exitReader, onSetWpm, onAdjustFocusTextSize, onSwitchToScroll, onJumpToWord, onToggleFlap }: ReaderViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => containerRef.current?.focus(), 50);
  }, []);

  // Auto-scroll to the current word when pausing
  useEffect(() => {
    if (!playing && currentWordRef.current && scrollBodyRef.current) {
      currentWordRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [playing, wordIndex]);

  const currentWord = words[wordIndex] || "";
  const { before, focus, after } = focusChar(currentWord);
  const pct = words.length > 0 ? Math.round((wordIndex / words.length) * 100) : 0;
  const remaining = formatTime(words.length - wordIndex, wpm);
  const scale = (focusTextSize || 100) / 100;

  // Build content paragraphs from the raw content for the pause view
  const paragraphs = useMemo(() => {
    if (!activeDoc.content) return [];
    return activeDoc.content.split(/\n\s*\n/).filter((p) => p.trim());
  }, [activeDoc.content]);

  // Build a mapping: for each paragraph, its starting global word index
  const paraStartIndices = useMemo(() => {
    const starts: number[] = [];
    let globalIdx = 0;
    paragraphs.forEach((para) => {
      starts.push(globalIdx);
      const paraWords = para.split(/\s+/).filter(Boolean);
      globalIdx += paraWords.length;
    });
    return starts;
  }, [paragraphs]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="reader-container"
      style={{ paddingTop: isMac ? 36 : 16 }}
      onClick={playing ? togglePlay : undefined}
      role="application"
      aria-label="RSVP speed reader"
      aria-live="off"
    >
      {escPending && (
        <div className="esc-confirm" role="alert">
          Press Esc again to exit
        </div>
      )}

      {/* Top bar */}
      <div
        className="reader-top-bar"
        style={{ paddingTop: isMac ? 36 : 16, opacity: playing ? 0.12 : 0.55 }}
      >
        <div className="reader-top-left">
          <button
            onClick={(e) => { e.stopPropagation(); exitReader(); }}
            className="reader-esc-btn"
            aria-label="Exit reader"
          >ESC</button>
          <span className="reader-doc-title">{activeDoc.title}</span>
        </div>
        <WpmGauge wpm={wpm} />
        {onToggleFlap && (
          <button className="hamburger-btn" onClick={(e) => { e.stopPropagation(); onToggleFlap(); }} aria-label="Open menu" title="Menu (Tab)">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {playing ? (
        /* RSVP word display during playback */
        <div className="reader-word-area" style={{ transform: `scale(${scale})` }}>
          <div className="reader-guide-line reader-guide-top" />
          <div className="reader-word-display" aria-live="off" aria-atomic="true">
            <span className="reader-word-before">
              {before.split("").reverse().join("")}
            </span>
            <span className="reader-word-focus">{focus}</span>
            <span className="reader-word-after">{after}</span>
          </div>
          <div className="reader-guide-line reader-guide-bottom" />
        </div>
      ) : (
        /* Scrollable full text when paused */
        <div
          ref={scrollBodyRef}
          className="reader-pause-text"
          onClick={(e) => e.stopPropagation()}
        >
          {paragraphs.map((para, paraIdx) => {
            const paraWords = para.split(/\s+/).filter(Boolean);
            const paraStart = paraStartIndices[paraIdx];
            return (
              <p key={paraIdx} className="reader-pause-paragraph">
                {paraWords.map((word, wIdx) => {
                  const globalIdx = paraStart + wIdx;
                  const isCurrent = globalIdx === wordIndex;
                  return (
                    <span
                      key={wIdx}
                      ref={isCurrent ? currentWordRef : undefined}
                      className={isCurrent ? "reader-pause-word-current" : "reader-pause-word"}
                      onClick={() => onJumpToWord(globalIdx)}
                    >
                      {word}{" "}
                    </span>
                  );
                })}
              </p>
            );
          })}
          <div className="reader-pause-text-end">
            <button className="reader-resume-btn" onClick={togglePlay}>
              resume reading
            </button>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="reader-bottom-bar" style={{ opacity: playing ? 0.08 : 0.6 }}>
        <ProgressBar current={wordIndex} total={words.length} />

        {!playing && (
          <div className="reader-pause-controls" onClick={(e) => e.stopPropagation()}>
            <div className="reader-wpm-slider">
              <span className="reader-wpm-label">{wpm} wpm</span>
              <input
                type="range"
                min={MIN_WPM} max={MAX_WPM} step={WPM_STEP}
                value={wpm}
                onChange={(e) => onSetWpm(Number(e.target.value))}
                className="reader-speed-slider"
                aria-label="Reading speed"
              />
            </div>
            <div className="reader-font-controls">
              <button
                className="reader-font-btn"
                onClick={() => onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP)}
                aria-label="Decrease font size"
              >A-</button>
              <span className="reader-font-label">{focusTextSize}%</span>
              <button
                className="reader-font-btn"
                onClick={() => onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP)}
                aria-label="Increase font size"
              >A+</button>
            </div>
            <button
              className="reader-mode-switch"
              onClick={onSwitchToScroll}
              title="Switch to scroll reading"
            >scroll mode</button>
          </div>
        )}

        <div className="reader-bottom-info">
          <span>{pct}%</span>
          <span className="reader-controls-hint">
            <span>&larr; &rarr; rewind</span>
            <span>&uarr; &darr; speed</span>
            <span>+/- font</span>
            <span>space {playing ? "pause" : "play"}</span>
          </span>
          <span>{remaining} left</span>
        </div>
      </div>
    </div>
  );
}

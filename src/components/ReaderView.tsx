import { useRef, useEffect } from "react";
import { focusChar, formatTime, MIN_WPM, MAX_WPM, WPM_STEP, FONT_SIZE_STEP } from "../utils/text";
import ProgressBar from "./ProgressBar";
import WpmGauge from "./WpmGauge";

export default function ReaderView({ activeDoc, words, wordIndex, wpm, fontSize, playing, escPending, isMac, togglePlay, exitReader, onSetWpm, onAdjustFontSize, onSwitchToScroll }) {
  const containerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => containerRef.current?.focus(), 50);
  }, []);

  const currentWord = words[wordIndex] || "";
  const { before, focus, after } = focusChar(currentWord);
  const pct = words.length > 0 ? Math.round((wordIndex / words.length) * 100) : 0;
  const remaining = formatTime(words.length - wordIndex, wpm);
  const scale = (fontSize || 100) / 100;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="reader-container"
      style={{ paddingTop: isMac ? 36 : 16 }}
      onClick={togglePlay}
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
      </div>

      {/* Word display */}
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
                onClick={() => onAdjustFontSize(-FONT_SIZE_STEP)}
                aria-label="Decrease font size"
              >A-</button>
              <span className="reader-font-label">{fontSize}%</span>
              <button
                className="reader-font-btn"
                onClick={() => onAdjustFontSize(FONT_SIZE_STEP)}
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
            <span>← → rewind</span>
            <span>↑ ↓ speed</span>
            <span>+/- font</span>
            <span>space {playing ? "pause" : "play"}</span>
          </span>
          <span>{remaining} left</span>
        </div>
      </div>
    </div>
  );
}

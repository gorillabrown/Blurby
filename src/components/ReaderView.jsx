import { useRef, useEffect } from "react";
import { tokenize, focusChar, formatTime } from "../utils/text";
import ProgressBar from "./ProgressBar";
import WpmGauge from "./WpmGauge";

export default function ReaderView({ activeDoc, words, wordIndex, wpm, playing, isMac, togglePlay, exitReader }) {
  const containerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => containerRef.current?.focus(), 50);
  }, []);

  const currentWord = words[wordIndex] || "";
  const { before, focus, after } = focusChar(currentWord);
  const pct = words.length > 0 ? Math.round((wordIndex / words.length) * 100) : 0;
  const remaining = formatTime(words.length - wordIndex, wpm);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="reader-container"
      style={{ paddingTop: isMac ? 36 : 16 }}
      onClick={togglePlay}
    >
      {/* Top bar */}
      <div
        className="reader-top-bar"
        style={{
          paddingTop: isMac ? 36 : 16,
          opacity: playing ? 0.12 : 0.55,
        }}
      >
        <div className="reader-top-left">
          <button
            onClick={(e) => { e.stopPropagation(); exitReader(); }}
            className="reader-esc-btn"
          >ESC</button>
          <span className="reader-doc-title">{activeDoc.title}</span>
        </div>
        <WpmGauge wpm={wpm} />
      </div>

      {/* Word display */}
      <div className="reader-word-area">
        <div className="reader-guide-line reader-guide-top" />
        <div className="reader-word-display">
          <span className="reader-word-before">
            {before.split("").reverse().join("")}
          </span>
          <span className="reader-word-focus">{focus}</span>
          <span className="reader-word-after">{after}</span>
        </div>
        <div className="reader-guide-line reader-guide-bottom" />
      </div>

      {/* Bottom bar */}
      <div
        className="reader-bottom-bar"
        style={{ opacity: playing ? 0.08 : 0.45 }}
      >
        <ProgressBar current={wordIndex} total={words.length} />
        <div className="reader-bottom-info">
          <span>{pct}%</span>
          <span className="reader-controls-hint">
            <span>← → rewind</span>
            <span>↑ ↓ speed</span>
            <span>space {playing ? "pause" : "play"}</span>
          </span>
          <span>{remaining} left</span>
        </div>
      </div>
    </div>
  );
}

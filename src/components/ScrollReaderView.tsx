import { useRef, useEffect, useState, useCallback } from "react";
import { tokenize, formatTime, MIN_WPM, MAX_WPM, WPM_STEP, FONT_SIZE_STEP } from "../utils/text";
import ProgressBar from "./ProgressBar";

const WORDS_PER_PAGE = 250;

export default function ScrollReaderView({ activeDoc, wpm, fontSize, isMac, onSetWpm, onAdjustFontSize, onExit, onProgressUpdate }) {
  const words = tokenize(activeDoc.content || "");
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(
    Math.max(0, Math.floor((activeDoc.position || 0) / WORDS_PER_PAGE))
  );

  const totalPages = Math.max(1, Math.ceil(words.length / WORDS_PER_PAGE));

  // Build pages of text
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    const start = i * WORDS_PER_PAGE;
    const end = Math.min(start + WORDS_PER_PAGE, words.length);
    pages.push(words.slice(start, end).join(" "));
  }

  // Progress = index of first word on current page
  const wordPosition = currentPage * WORDS_PER_PAGE;
  const clampedPosition = Math.min(wordPosition, words.length - 1);
  const pct = words.length > 0 ? Math.round((clampedPosition / words.length) * 100) : 0;
  const remaining = formatTime(words.length - clampedPosition, wpm);

  const scale = (fontSize || 100) / 100;

  const goToPage = useCallback((page) => {
    const next = Math.max(0, Math.min(totalPages - 1, page));
    setCurrentPage(next);
    // Report position as the first word of the new page
    const pos = next * WORDS_PER_PAGE;
    onProgressUpdate(pos);
  }, [totalPages, onProgressUpdate]);

  useEffect(() => {
    const handler = (e) => {
      if (e.code === "ArrowRight" || e.code === "Space") { e.preventDefault(); goToPage(currentPage + 1); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); goToPage(currentPage - 1); }
      else if (e.code === "Escape") { e.preventDefault(); onExit(clampedPosition); }
      else if (e.code === "Equal" || e.code === "NumpadAdd") { e.preventDefault(); onAdjustFontSize(FONT_SIZE_STEP); }
      else if (e.code === "Minus" || e.code === "NumpadSubtract") { e.preventDefault(); onAdjustFontSize(-FONT_SIZE_STEP); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentPage, goToPage, onExit, clampedPosition, onAdjustFontSize]);

  return (
    <div className="scroll-reader" style={{ paddingTop: isMac ? 48 : 32 }}>
      {/* Top bar */}
      <div className="scroll-reader-top" style={{ paddingTop: isMac ? 36 : 16 }}>
        <div className="reader-top-left">
          <button onClick={() => onExit(clampedPosition)} className="reader-esc-btn" aria-label="Exit reader">ESC</button>
          <span className="reader-doc-title">{activeDoc.title}</span>
        </div>
        <div className="scroll-reader-top-right">
          <div className="reader-font-controls">
            <button className="reader-font-btn" onClick={() => onAdjustFontSize(-FONT_SIZE_STEP)} aria-label="Decrease font size">A-</button>
            <span className="reader-font-label">{fontSize}%</span>
            <button className="reader-font-btn" onClick={() => onAdjustFontSize(FONT_SIZE_STEP)} aria-label="Increase font size">A+</button>
          </div>
          <span className="scroll-reader-page">{currentPage + 1} / {totalPages}</span>
        </div>
      </div>

      {/* Page content */}
      <div className="scroll-reader-content" ref={scrollRef}>
        <div className="scroll-reader-text" style={{ fontSize: `${18 * scale}px` }}>
          {pages[currentPage] || ""}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="scroll-reader-bottom">
        <ProgressBar current={clampedPosition} total={words.length} />
        <div className="reader-bottom-info">
          <span>{pct}%</span>
          <div className="scroll-reader-nav">
            <button
              className="scroll-reader-nav-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 0}
            >prev</button>
            <button
              className="scroll-reader-nav-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >next</button>
          </div>
          <span>{remaining} left</span>
        </div>
      </div>
    </div>
  );
}

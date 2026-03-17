import { useRef, useEffect, useState, useCallback } from "react";
import { tokenize, formatTime, focusChar, MIN_WPM, MAX_WPM, WPM_STEP } from "../utils/text";
import ProgressBar from "./ProgressBar";

const WORDS_PER_PAGE = 250;

export default function ScrollReaderView({ activeDoc, wpm, isMac, onSetWpm, onExit, onProgressUpdate }) {
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

  const wordPosition = Math.min(currentPage * WORDS_PER_PAGE, words.length - 1);
  const pct = words.length > 0 ? Math.round((wordPosition / words.length) * 100) : 0;
  const remaining = formatTime(words.length - wordPosition, wpm);

  const goToPage = useCallback((page) => {
    const next = Math.max(0, Math.min(totalPages - 1, page));
    setCurrentPage(next);
    const pos = next * WORDS_PER_PAGE;
    onProgressUpdate(pos);
  }, [totalPages, onProgressUpdate]);

  useEffect(() => {
    const handler = (e) => {
      if (e.code === "ArrowRight" || e.code === "Space") { e.preventDefault(); goToPage(currentPage + 1); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); goToPage(currentPage - 1); }
      else if (e.code === "Escape") { e.preventDefault(); onExit(wordPosition); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentPage, goToPage, onExit, wordPosition]);

  return (
    <div className="scroll-reader" style={{ paddingTop: isMac ? 48 : 32 }}>
      {/* Top bar */}
      <div className="scroll-reader-top" style={{ paddingTop: isMac ? 36 : 16 }}>
        <div className="reader-top-left">
          <button onClick={() => onExit(wordPosition)} className="reader-esc-btn" aria-label="Exit reader">ESC</button>
          <span className="reader-doc-title">{activeDoc.title}</span>
        </div>
        <span className="scroll-reader-page">{currentPage + 1} / {totalPages}</span>
      </div>

      {/* Page content */}
      <div className="scroll-reader-content" ref={scrollRef}>
        <div className="scroll-reader-text">
          {pages[currentPage] || ""}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="scroll-reader-bottom">
        <ProgressBar current={wordPosition} total={words.length} />
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

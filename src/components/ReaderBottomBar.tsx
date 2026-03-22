import { useState, useCallback, useMemo } from "react";
import { MIN_WPM, MAX_WPM, FOCUS_TEXT_SIZE_STEP, formatTime, detectChapters, chaptersFromCharOffsets, currentChapterIndex } from "../utils/text";
import { BlurbyDoc } from "../types";
import ProgressBar from "./ProgressBar";

interface ReaderBottomBarProps {
  activeDoc: BlurbyDoc & { content: string };
  words: string[];
  wordIndex: number;
  wpm: number;
  focusTextSize: number;
  readingMode: "page" | "focus" | "flow";
  playing: boolean;
  isEink: boolean;
  chapters: Array<{ title: string; charOffset: number }>;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onEnterFocus: () => void;
  onEnterFlow: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  onJumpToChapter?: (chapterIndex: number) => void;
  onEinkRefresh?: () => void;
}

const HINT_TEXT: Record<string, string> = {
  page: "← → page  ↑ ↓ speed  space focus  ⇧space flow  M menu",
  focus: "← → rewind  ↑ ↓ speed  space pause  M menu",
  flow: "← → seek  ↑ ↓ speed  space pause  M menu",
};

export default function ReaderBottomBar({
  activeDoc,
  words,
  wordIndex,
  wpm,
  focusTextSize,
  readingMode,
  playing,
  isEink,
  chapters,
  onSetWpm,
  onAdjustFocusTextSize,
  onEnterFocus,
  onEnterFlow,
  onPrevChapter,
  onNextChapter,
  onJumpToChapter,
  onEinkRefresh,
}: ReaderBottomBarProps) {
  const [chapterDropdownOpen, setChapterDropdownOpen] = useState(false);

  // Progress
  const progress = words.length > 0 ? (wordIndex / words.length) * 100 : 0;

  // Time remaining
  const wordsRemaining = Math.max(0, words.length - wordIndex);
  const timeRemaining = formatTime(wordsRemaining, wpm);

  // Chapter info
  const chapterList = useMemo(() => {
    if (chapters.length > 0) {
      return chaptersFromCharOffsets(activeDoc.content, chapters);
    }
    return detectChapters(activeDoc.content, words);
  }, [activeDoc.content, chapters, words]);

  const curChapterIdx = useMemo(
    () => currentChapterIndex(chapterList, wordIndex),
    [chapterList, wordIndex]
  );
  const currentChapter = chapterList[curChapterIdx];

  // Font size percentage
  const fontPct = focusTextSize || 100;

  // Always fully visible
  const opacity = 1;

  // WPM slider
  const handleWpmSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSetWpm(parseInt(e.target.value, 10));
  }, [onSetWpm]);

  return (
    <div
      className="reader-bottom-bar"
      style={{ opacity }}
      role="toolbar"
      aria-label="Reader controls"
    >
      {/* Row 1: Progress bar */}
      <div className="reader-bottom-bar-progress">
        <ProgressBar
          current={wordIndex}
          total={words.length}
        />
      </div>

      {/* Row 2: Controls */}
      <div className="reader-bottom-bar-controls">
        {/* WPM */}
        <div className="rbb-wpm-group">
          <span className="rbb-wpm-label">{wpm} wpm</span>
          <input
            type="range"
            className="rbb-wpm-slider"
            min={MIN_WPM}
            max={MAX_WPM}
            step={25}
            value={wpm}
            onChange={handleWpmSlider}
            aria-label="Words per minute"
          />
        </div>

        {/* Font size */}
        <div className="rbb-font-group">
          <button
            className="rbb-font-btn"
            onClick={() => onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP)}
            aria-label="Decrease font size"
          >
            A-
          </button>
          <span className="rbb-font-pct">{fontPct}%</span>
          <button
            className="rbb-font-btn"
            onClick={() => onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP)}
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>

        {/* Mode buttons */}
        <div className="rbb-mode-group">
          <button
            className={`rbb-mode-btn ${readingMode === "focus" ? "rbb-mode-btn--active" : ""}`}
            onClick={onEnterFocus}
            aria-label="Focus mode"
            aria-pressed={readingMode === "focus"}
          >
            Focus
          </button>
          <button
            className={`rbb-mode-btn ${readingMode === "flow" ? "rbb-mode-btn--active" : ""}`}
            onClick={onEnterFlow}
            aria-label="Flow mode"
            aria-pressed={readingMode === "flow"}
          >
            Flow
          </button>
        </div>

        {/* Chapter nav */}
        {chapterList.length > 1 && (
          <div className="rbb-chapter-group">
            <button
              className="rbb-chapter-arrow"
              onClick={onPrevChapter}
              disabled={curChapterIdx <= 0}
              aria-label="Previous chapter"
            >
              ‹
            </button>
            <button
              className="rbb-chapter-name"
              onClick={() => setChapterDropdownOpen((p) => !p)}
              aria-haspopup="listbox"
              aria-expanded={chapterDropdownOpen}
            >
              {currentChapter?.title || `Ch. ${curChapterIdx + 1}`}
            </button>
            <button
              className="rbb-chapter-arrow"
              onClick={onNextChapter}
              disabled={curChapterIdx >= chapterList.length - 1}
              aria-label="Next chapter"
            >
              ›
            </button>

            {chapterDropdownOpen && (
              <ul className="rbb-chapter-dropdown" role="listbox" aria-label="Chapters">
                {chapterList.map((ch, i) => (
                  <li
                    key={i}
                    role="option"
                    aria-selected={i === curChapterIdx}
                    className={`rbb-chapter-option ${i === curChapterIdx ? "rbb-chapter-option--active" : ""}`}
                    onClick={() => {
                      onJumpToChapter?.(i);
                      setChapterDropdownOpen(false);
                    }}
                  >
                    {ch.title || `Chapter ${i + 1}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* E-ink refresh */}
        {isEink && (
          <button
            className="rbb-eink-refresh"
            onClick={onEinkRefresh}
            aria-label="Refresh e-ink display"
          >
            ↻
          </button>
        )}
      </div>

      {/* Row 3: Info line */}
      <div className="reader-bottom-bar-info">
        <span className="rbb-info-progress">{Math.round(progress)}%</span>
        <span className="rbb-info-hint">{HINT_TEXT[readingMode] || ""}</span>
        <span className="rbb-info-time">{timeRemaining}</span>
      </div>
    </div>
  );
}

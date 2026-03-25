import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { formatTime, detectChapters, chaptersFromCharOffsets, currentChapterIndex } from "../utils/text";
import { MIN_WPM, MAX_WPM, FOCUS_TEXT_SIZE_STEP } from "../constants";
import { BlurbyDoc } from "../types";
import ProgressBar from "./ProgressBar";

interface ReaderBottomBarProps {
  activeDoc: BlurbyDoc & { content: string };
  words: string[];
  wordIndex: number;
  wpm: number;
  focusTextSize: number;
  readingMode: "page" | "focus" | "flow" | "narration";
  playing: boolean;
  isEink: boolean;
  chapters: Array<{ title: string; charOffset: number }>;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onEnterFocus: () => void;
  onEnterFlow: () => void;
  ttsActive?: boolean;
  onToggleTts?: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  onJumpToChapter?: (chapterIndex: number) => void;
  onEinkRefresh?: () => void;
  onTogglePlay?: () => void;
  chapterListRef?: React.MutableRefObject<{ toggle: () => void } | null>;
  lastReadingMode?: "focus" | "flow" | "narration";
  ttsRate?: number;
  onSetTtsRate?: (rate: number) => void;
}

const HINT_TEXT: Record<string, string> = {
  page: "← → page  ↑ ↓ speed  space flow  ⇧space focus  tab menu",
  focus: "← → rewind  ↑ ↓ speed  space pause  M menu",
  narration: "← → page  ↑ ↓ speed  space pause  N narration  M menu",
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
  ttsActive,
  onToggleTts,
  onPrevChapter,
  onNextChapter,
  onJumpToChapter,
  onEinkRefresh,
  onTogglePlay,
  chapterListRef,
  lastReadingMode = "flow",
  ttsRate = 1.0,
  onSetTtsRate,
}: ReaderBottomBarProps) {
  const [chapterDropdownOpen, setChapterDropdownOpen] = useState(false);
  const [rateStatus, setRateStatus] = useState<"idle" | "confirming" | "set">("idle");
  const rateStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show CONFIRMED → SET sequence when TTS rate changes
  const handleSetTtsRate = useCallback((newRate: number) => {
    if (onSetTtsRate) onSetTtsRate(newRate);
    setRateStatus("confirming");
    if (rateStatusTimerRef.current) clearTimeout(rateStatusTimerRef.current);
    rateStatusTimerRef.current = setTimeout(() => {
      setRateStatus("set");
      rateStatusTimerRef.current = setTimeout(() => {
        setRateStatus("idle");
        rateStatusTimerRef.current = null;
      }, 1200);
    }, 500);
  }, [onSetTtsRate]);

  // Expose toggle to parent via ref (for C hotkey)
  useEffect(() => {
    if (chapterListRef) {
      chapterListRef.current = { toggle: () => setChapterDropdownOpen((p) => !p) };
    }
  }, [chapterListRef]);

  // Progress
  const progress = words.length > 0 ? (wordIndex / words.length) * 100 : 0;

  // Time remaining — use TTS-derived WPM when narration is selected
  const isNarrationSelected = readingMode === "narration" || (readingMode === "page" && lastReadingMode === "narration");
  const effectiveWpm = isNarrationSelected ? Math.round(ttsRate * 150) : wpm;
  const wordsRemaining = Math.max(0, words.length - wordIndex);
  const timeRemaining = formatTime(wordsRemaining, effectiveWpm);

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

  // Chapter time remaining
  const chapterTimeRemaining = useMemo(() => {
    if (chapterList.length <= 1) return null;
    const chEnd = curChapterIdx + 1 < chapterList.length
      ? chapterList[curChapterIdx + 1].wordIndex
      : words.length;
    const chWordsLeft = Math.max(0, chEnd - wordIndex);
    return formatTime(chWordsLeft, wpm);
  }, [chapterList, curChapterIdx, wordIndex, words.length, wpm]);

  // Font size percentage
  const fontPct = focusTextSize || 100;

  // Bar always fully visible — all modes need access to controls
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
        {/* WPM or TTS Rate — show TTS rate when narration is selected (active or paused) */}
        {(readingMode === "narration" || (readingMode === "page" && lastReadingMode === "narration")) && onSetTtsRate ? (
          <div className="rbb-wpm-group">
            <span className="rbb-wpm-label">{ttsRate.toFixed(1)}x</span>
            <input
              type="range"
              className="rbb-wpm-slider"
              min={0.5}
              max={2.0}
              step={0.1}
              value={ttsRate}
              onChange={(e) => handleSetTtsRate(Number(e.target.value))}
              aria-label="Speech rate"
            />
            {rateStatus !== "idle" && (
              <span className={`rbb-rate-status ${rateStatus === "set" ? "rbb-rate-status--set" : ""}`}>
                {rateStatus === "confirming" ? "CONFIRMED" : "SET"}
              </span>
            )}
          </div>
        ) : (
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
        )}

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

        {/* Play/Pause button — visible in all modes */}
        {onTogglePlay && (
          <button
            className={`rbb-play-btn ${playing ? "rbb-play-btn--active" : ""}`}
            onClick={onTogglePlay}
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause (Space)" : "Play (Space)"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
        )}

        {/* Mode buttons — all four modes in one group */}
        <div className="rbb-mode-group">
          <button
            className={`rbb-mode-btn ${readingMode === "focus" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "focus" ? " rbb-mode-btn--last" : ""}`}
            onClick={onEnterFocus}
            aria-label="Focus mode"
            aria-pressed={readingMode === "focus"}
          >
            Focus
          </button>
          <button
            className={`rbb-mode-btn ${readingMode === "flow" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "flow" ? " rbb-mode-btn--last" : ""}`}
            onClick={onEnterFlow}
            aria-label="Flow mode"
            aria-pressed={readingMode === "flow"}
          >
            Flow
          </button>
          {onToggleTts && (
            <button
              className={`rbb-mode-btn ${readingMode === "narration" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "narration" ? " rbb-mode-btn--last" : ""}`}
              onClick={onToggleTts}
              aria-label={readingMode === "narration" ? "Stop narration" : "Start narration"}
              aria-pressed={readingMode === "narration"}
              title="Narration (N)"
            >
              Narrate
            </button>
          )}
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
        <span className="rbb-info-time">
          {chapterTimeRemaining ? `Ch: ${chapterTimeRemaining} | Doc: ${timeRemaining}` : timeRemaining}
        </span>
      </div>
    </div>
  );
}

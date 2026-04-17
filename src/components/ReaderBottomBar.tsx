import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { formatTime, detectChapters, chaptersFromCharOffsets, currentChapterIndex } from "../utils/text";
import { MIN_WPM, MAX_WPM, FOCUS_TEXT_SIZE_STEP, TTS_RATE_BASELINE_WPM, TTS_RATE_CONFIRMING_MS, TTS_RATE_SET_DISPLAY_MS, KOKORO_RATE_BUCKETS, resolveKokoroBucket } from "../constants";
import { BlurbyDoc } from "../types";
import ProgressBar from "./ProgressBar";
import { triggerCoachHint } from "./HotkeyCoach";

export interface ChapterListHandle {
  toggle: () => void;
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

interface ReaderBottomBarProps {
  activeDoc: BlurbyDoc & { content: string };
  words: string[];
  wordIndex: number;
  wpm: number;
  focusTextSize: number;
  readingMode: "page" | "focus" | "flow";
  isNarrating?: boolean;
  playing: boolean;
  isEink: boolean;
  chapters: Array<{ title: string; charOffset: number; depth?: number }>;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onEnterFocus: () => void;
  onEnterFlow: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  onJumpToChapter?: (chapterIndex: number) => void;
  onEinkRefresh?: () => void;
  onTogglePlay?: () => void;
  chapterListRef?: React.MutableRefObject<ChapterListHandle | null>;
  lastReadingMode?: "focus" | "flow";
  ttsRate?: number;
  onSetTtsRate?: (rate: number) => void;
  ttsEngine?: "web" | "kokoro";
  /** For foliate EPUBs: authoritative progress fraction (0.0–1.0) from foliate's relocate event */
  foliateFraction?: number;
  /** When narration is active, the narration cursor word index — used to track current chapter.
   *  null when narration is not speaking (falls back to wordIndex). */
  narrationWordIndex?: number | null;
  flowZonePosition?: number;
  flowZoneLines?: number;
  onSetFlowZonePosition?: (pos: number) => void;
  onSetFlowZoneLines?: (lines: number) => void;
  flowProgress?: {
    bookPct: number;
    estimatedMinutesLeft: number;
  } | null;
  currentChapterName?: string;
}

const HINT_TEXT: Record<string, string> = {
  page: "← → page  ↑ ↓ speed  space flow  ⇧space focus  tab menu",
  focus: "← → rewind  ↑ ↓ speed  space pause  M menu",
  flow: "← → speed  ↑ ↓ line  N narration  space pause  M menu",
};

export default function ReaderBottomBar({
  activeDoc,
  words,
  wordIndex,
  wpm,
  focusTextSize,
  readingMode,
  isNarrating = false,
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
  onTogglePlay,
  chapterListRef,
  lastReadingMode = "flow",
  ttsRate = 1.0,
  onSetTtsRate,
  ttsEngine = "web",
  foliateFraction,
  narrationWordIndex = null,
  flowZonePosition,
  flowZoneLines,
  onSetFlowZonePosition,
  onSetFlowZoneLines,
  flowProgress,
  currentChapterName,
}: ReaderBottomBarProps) {
  const [chapterDropdownOpen, setChapterDropdownOpen] = useState(false);
  const [focusedChapterIdx, setFocusedChapterIdx] = useState(0);
  const [rateStatus, setRateStatus] = useState<"idle" | "confirming" | "set">("idle");
  const rateStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chapterGroupRef = useRef<HTMLDivElement | null>(null);

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
      }, TTS_RATE_SET_DISPLAY_MS);
    }, TTS_RATE_CONFIRMING_MS);
  }, [onSetTtsRate]);

  // Expose toggle to parent via ref (for C hotkey)
  useEffect(() => {
    if (chapterListRef) {
      chapterListRef.current = {
        toggle: () => setChapterDropdownOpen((p) => !p),
        open: () => setChapterDropdownOpen(true),
        close: () => setChapterDropdownOpen(false),
        isOpen: () => chapterDropdownOpen,
      };
    }
  }, [chapterListRef, chapterDropdownOpen]);

  // Progress — for foliate EPUBs use the authoritative fraction, else word-based
  const progress = foliateFraction != null && foliateFraction >= 0
    ? foliateFraction * 100
    : words.length > 0 ? (wordIndex / words.length) * 100 : 0;

  // Time remaining — use TTS-derived WPM when narration is selected
  const isNarrationSelected = readingMode === "flow" && isNarrating;
  const effectiveWpm = isNarrationSelected ? Math.round(ttsRate * TTS_RATE_BASELINE_WPM) : wpm;
  // Doc time: for foliate EPUBs, use whole-book word count × fraction remaining
  // instead of section words (which only covers the current chapter)
  const docWordsRemaining = foliateFraction != null && activeDoc.wordCount > 0
    ? Math.max(0, Math.round(activeDoc.wordCount * (1 - foliateFraction)))
    : Math.max(0, words.length - wordIndex);
  const timeRemaining = formatTime(docWordsRemaining, effectiveWpm);

  // Chapter info
  const chapterList = useMemo(() => {
    if (chapters.length > 0) {
      // Foliate EPUB chapters store proportional word indices in charOffset —
      // use them directly instead of scanning through content string
      if ((chapters[0] as any)?.href) {
        return chapters.map(ch => ({ title: ch.title, wordIndex: ch.charOffset }));
      }
      return chaptersFromCharOffsets(activeDoc.content, chapters);
    }
    return detectChapters(activeDoc.content, words);
  }, [activeDoc.content, chapters, words]);

  // Use narration cursor position when narration is speaking; fall back to reading position
  const curChapterIdx = useMemo(
    () => currentChapterIndex(chapterList, narrationWordIndex ?? wordIndex),
    [chapterList, narrationWordIndex, wordIndex]
  );
  const currentChapter = chapterList[curChapterIdx];

  useEffect(() => {
    setFocusedChapterIdx(curChapterIdx >= 0 ? curChapterIdx : 0);
  }, [curChapterIdx]);

  useEffect(() => {
    if (!chapterDropdownOpen) return;

    const closeMenu = () => setChapterDropdownOpen(false);
    const selectChapter = (idx: number) => {
      if (idx < 0 || idx >= chapterList.length) return;
      onJumpToChapter?.(idx);
      setChapterDropdownOpen(false);
    };

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!chapterGroupRef.current?.contains(target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!chapterDropdownOpen) return;
      if (e.code === "ArrowDown" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        setFocusedChapterIdx((prev) => Math.min(prev + 1, chapterList.length - 1));
        return;
      }
      if (e.code === "ArrowUp" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        setFocusedChapterIdx((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.code === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        selectChapter(focusedChapterIdx);
        return;
      }
      if (e.code === "Space" || e.code === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      }
    };

    window.addEventListener("mousedown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [chapterDropdownOpen, chapterList.length, focusedChapterIdx, onJumpToChapter]);

  // Chapter time remaining
  const chapterTimeRemaining = useMemo(() => {
    if (chapterList.length <= 1) return null;
    const chEnd = curChapterIdx + 1 < chapterList.length
      ? chapterList[curChapterIdx + 1].wordIndex
      : words.length;
    const chWordsLeft = Math.max(0, chEnd - wordIndex);
    return formatTime(chWordsLeft, effectiveWpm);
  }, [chapterList, curChapterIdx, wordIndex, words.length, effectiveWpm]);

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
          current={foliateFraction != null ? Math.round(foliateFraction * 1000) : wordIndex}
          total={foliateFraction != null ? 1000 : words.length}
        />
      </div>

      {/* Row 2: Controls */}
      <div className="reader-bottom-bar-controls">
        {/* WPM or TTS Rate — show TTS rate when narration is selected (active or paused) */}
        {isNarrationSelected && onSetTtsRate ? (
          <div className="rbb-wpm-group">
            <span className="rbb-wpm-label" aria-label={ttsEngine === "kokoro" ? "Kokoro rate" : "Speech rate"}>
              {ttsRate.toFixed(1)}x
            </span>
            {ttsEngine === "kokoro" ? (
              <div className="rbb-rate-buttons" role="radiogroup" aria-label="Kokoro narration speed">
                {KOKORO_RATE_BUCKETS.map((bucket) => (
                  <button
                    key={bucket}
                    onClick={() => handleSetTtsRate(bucket)}
                    className={`rbb-bucket-btn${resolveKokoroBucket(ttsRate) === bucket ? " active" : ""}`}
                    aria-checked={resolveKokoroBucket(ttsRate) === bucket}
                    role="radio"
                    aria-label={`${bucket.toFixed(1)}x speed`}
                  >{bucket.toFixed(1)}x</button>
                ))}
              </div>
            ) : (
              <input
                type="range"
                className="rbb-wpm-slider"
                min={0.5}
                max={2.0}
                step={0.1}
                value={ttsRate}
                onChange={(e) => handleSetTtsRate(Number(e.target.value))}
                aria-label="Speech rate"
                aria-valuemin={0.5}
                aria-valuemax={2.0}
                aria-valuenow={ttsRate}
                aria-valuetext={`${ttsRate.toFixed(1)}x speed`}
              />
            )}
            {rateStatus !== "idle" && (
              <span className={`rbb-rate-status ${rateStatus === "set" ? "rbb-rate-status--set" : ""}`} role="status" aria-live="polite">
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
              aria-valuemin={MIN_WPM}
              aria-valuemax={MAX_WPM}
              aria-valuenow={wpm}
              aria-valuetext={`${wpm} words per minute`}
            />
          </div>
        )}

        {/* Font size */}
        <div className="rbb-font-group" role="group" aria-label="Font size controls">
          <button
            className="rbb-font-btn"
            onClick={() => { triggerCoachHint("fontSize"); onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP); }}
            aria-label="Decrease font size"
          >
            A-
          </button>
          <span className="rbb-font-pct" aria-live="polite">{fontPct}%</span>
          <button
            className="rbb-font-btn"
            onClick={() => { triggerCoachHint("fontSize"); onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP); }}
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>

        {/* Play/Pause button — visible in all modes */}
        {onTogglePlay && (
          <button
            className={`rbb-play-btn ${playing ? "rbb-play-btn--active" : ""}`}
            onClick={() => { triggerCoachHint("play"); onTogglePlay(); }}
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause (Space)" : "Play (Space)"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
        )}

        {/* Mode buttons */}
        <div className="rbb-mode-group" role="group" aria-label="Reading modes">
          <button
            className={`rbb-mode-btn ${readingMode === "focus" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "focus" ? " rbb-mode-btn--last" : ""}`}
            onClick={() => { triggerCoachHint("enterFocus"); onEnterFocus(); }}
            aria-label="Focus mode"
            aria-pressed={readingMode === "focus"}
          >
            Focus
          </button>
          <button
            className={`rbb-mode-btn ${readingMode === "flow" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "flow" ? " rbb-mode-btn--last" : ""}`}
            onClick={() => { triggerCoachHint("enterFlow"); onEnterFlow(); }}
            aria-label="Flow mode"
            aria-pressed={readingMode === "flow"}
          >
            Flow
          </button>
        </div>

        {/* Flow zone controls and progress — visible in flow mode only */}
        {readingMode === "flow" && (
          <>
            <div className="rbb-flow-zone-controls">
              {isNarrating && (
                <span className="rbb-flow-progress-text">Narrating</span>
              )}
              <label className="rbb-flow-zone-label">
                Zone
                <select
                  className="rbb-flow-zone-select"
                  value={flowZonePosition ?? 0.25}
                  onChange={(e) => onSetFlowZonePosition?.(parseFloat(e.target.value))}
                >
                  <option value={0.15}>Top</option>
                  <option value={0.25}>Upper</option>
                  <option value={0.35}>Center</option>
                  <option value={0.55}>Bottom</option>
                </select>
              </label>
              <label className="rbb-flow-zone-label">
                Lines
                <input
                  type="range"
                  className="rbb-flow-zone-slider"
                  min={3}
                  max={8}
                  step={1}
                  value={flowZoneLines ?? 5}
                  onChange={(e) => onSetFlowZoneLines?.(parseInt(e.target.value, 10))}
                />
                <span className="rbb-flow-zone-value">{flowZoneLines ?? 5}</span>
              </label>
            </div>
            {flowProgress && (
              <div className="rbb-flow-progress">
                <span className="rbb-flow-progress-text">
                  {isNarrating ? "Narrating · " : ""}{currentChapterName ? `${currentChapterName} · ` : ""}{Math.round(flowProgress.bookPct * 100)}%{flowProgress.estimatedMinutesLeft > 0 ? ` · ~${Math.ceil(flowProgress.estimatedMinutesLeft)} min left` : ""}
                </span>
              </div>
            )}
          </>
        )}

        {/* Chapter nav */}
        {chapterList.length > 1 && (
          <div className="rbb-chapter-group" ref={chapterGroupRef}>
            <button
              className="rbb-chapter-arrow"
              onClick={() => { triggerCoachHint("prevChapter"); onPrevChapter?.(); }}
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
              onClick={() => { triggerCoachHint("nextChapter"); onNextChapter?.(); }}
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
                    aria-selected={i === focusedChapterIdx}
                    className={`rbb-chapter-option ${i === focusedChapterIdx ? "rbb-chapter-option--active" : ""}`}
                    style={{ paddingLeft: `${((chapters[i] as any)?.depth || 0) * 16 + 8}px` }}
                    onMouseEnter={() => setFocusedChapterIdx(i)}
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
        <span className="rbb-info-hint" aria-label="Keyboard shortcuts hint">{HINT_TEXT[readingMode] || ""}</span>
        <span className="rbb-info-time">
          {chapterTimeRemaining ? `Ch: ${chapterTimeRemaining} | Doc: ${timeRemaining}` : timeRemaining}
        </span>
      </div>
    </div>
  );
}

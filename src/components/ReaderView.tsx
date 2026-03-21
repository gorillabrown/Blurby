import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { focusChar, calculateFocusOpacity, formatTime, formatDisplayTitle, detectChapters, chaptersFromCharOffsets, currentChapterIndex, MIN_WPM, MAX_WPM, WPM_STEP, FOCUS_TEXT_SIZE_STEP, Chapter } from "../utils/text";
import { BlurbyDoc, LayoutSpacing } from "../types";
import type { WordUpdateCallback } from "../hooks/useReader";

/** Sliced settings for RSVP reader — only fields it actually uses */
interface RsvpSettings {
  focusSpan?: number;
  focusMarks?: boolean;
  layoutSpacing?: LayoutSpacing;
  fontFamily?: string | null;
}
import ProgressBar from "./ProgressBar";
import WpmGauge from "./WpmGauge";
import HighlightMenu from "./HighlightMenu";
import DefinitionPopup from "./DefinitionPopup";
import PausedTextView from "./PausedTextView";

const api = window.electronAPI;

interface ReaderViewProps {
  activeDoc: BlurbyDoc & { content: string };
  words: string[];
  wordIndex: number;
  wpm: number;
  focusTextSize: number;
  playing: boolean;
  escPending: boolean;
  isMac: boolean;
  settings?: RsvpSettings;
  externalChapters?: Array<{ title: string; charOffset: number }>;
  onWordUpdateRef?: React.MutableRefObject<WordUpdateCallback | null>;
  togglePlay: () => void;
  exitReader: () => void;
  onSetWpm: (wpm: number) => void;
  onAdjustFocusTextSize: (delta: number) => void;
  onSwitchToScroll: () => void;
  onJumpToWord: (index: number) => void;
  onToggleFlap?: () => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export default function ReaderView({ activeDoc, words, wordIndex, wpm, focusTextSize, playing, escPending, isMac, settings, externalChapters, onWordUpdateRef, togglePlay, exitReader, onSetWpm, onAdjustFocusTextSize, onSwitchToScroll, onJumpToWord, onToggleFlap, onPrevChapter, onNextChapter }: ReaderViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const [chapterListOpen, setChapterListOpen] = useState(false);

  // Refs for direct DOM RSVP updates (bypass React on hot path)
  const beforeRef = useRef<HTMLSpanElement>(null);
  const focusRef = useRef<HTMLSpanElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);
  const focusMarkTopRef = useRef<HTMLSpanElement>(null);
  const focusMarkBottomRef = useRef<HTMLSpanElement>(null);
  // For focus-span mode (per-character opacity)
  const charContainerRef = useRef<HTMLDivElement>(null);

  // Register direct DOM update callback with useReader's RAF loop
  useEffect(() => {
    if (!onWordUpdateRef) return;
    onWordUpdateRef.current = (word: string, _index: number) => {
      if (!playing) return;
      const { before: b, focus: f, after: a } = focusChar(word);
      const useFocusSpan = settings?.focusSpan != null && settings.focusSpan < 1;

      if (useFocusSpan && charContainerRef.current) {
        // Per-character opacity mode: rebuild children
        const pivotIndex = b.length;
        const chars = word.split("");
        const container = charContainerRef.current;
        // Reuse existing spans if count matches, otherwise rebuild
        if (container.childNodes.length === chars.length) {
          chars.forEach((char, i) => {
            const span = container.childNodes[i] as HTMLSpanElement;
            span.textContent = char;
            span.style.opacity = String(calculateFocusOpacity(i, pivotIndex, word.length, settings!.focusSpan!));
            span.className = i === pivotIndex ? "reader-word-focus" : "reader-word-char";
          });
        } else {
          container.innerHTML = "";
          chars.forEach((char, i) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.opacity = String(calculateFocusOpacity(i, pivotIndex, word.length, settings!.focusSpan!));
            span.className = i === pivotIndex ? "reader-word-focus" : "reader-word-char";
            container.appendChild(span);
          });
        }
      } else {
        // Standard ORP mode: update before/focus/after spans
        if (beforeRef.current) beforeRef.current.textContent = b.split("").reverse().join("");
        if (focusRef.current) focusRef.current.textContent = f;
        if (afterRef.current) afterRef.current.textContent = a;
      }

      // Update focus mark positions
      const pivotIndex = b.length;
      const orpPercent = word.length > 0 ? ((pivotIndex + 0.5) / word.length) * 100 : 50;
      if (focusMarkTopRef.current) focusMarkTopRef.current.style.left = `${orpPercent}%`;
      if (focusMarkBottomRef.current) focusMarkBottomRef.current.style.left = `${orpPercent}%`;
    };
    return () => { onWordUpdateRef.current = null; };
  }, [onWordUpdateRef, playing, settings?.focusSpan]);

  // Highlight menu state
  const [highlightWord, setHighlightWord] = useState<string | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [highlightPos, setHighlightPos] = useState({ x: 0, y: 0 });
  const [showDefinition, setShowDefinition] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const closeHighlight = useCallback(() => {
    setHighlightWord(null);
    setHighlightIdx(-1);
    setShowDefinition(false);
  }, []);

  // Close highlight menu when playback starts
  useEffect(() => { if (playing) closeHighlight(); }, [playing, closeHighlight]);

  const handleSaveHighlight = useCallback(async (text?: string) => {
    const wordToSave = text || highlightWord;
    if (!wordToSave) return;
    const result = await api.saveHighlight({
      docTitle: activeDoc.title,
      text: wordToSave,
      wordIndex: highlightIdx >= 0 ? highlightIdx : wordIndex,
      totalWords: words.length,
    });
    if (result?.ok) {
      setToast("Saved to highlights");
      setTimeout(() => setToast(null), 1600);
    }
    closeHighlight();
  }, [highlightWord, highlightIdx, wordIndex, words.length, activeDoc.title, closeHighlight]);

  // H key: save current word during RSVP, or open menu when paused with selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== "KeyH" || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (playing) {
        // Save current word without pausing
        e.preventDefault();
        api.saveHighlight({
          docTitle: activeDoc.title,
          text: words[wordIndex] || "",
          wordIndex,
          totalWords: words.length,
        }).then((r: any) => {
          if (r?.ok) { setToast("Saved to highlights"); setTimeout(() => setToast(null), 1600); }
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playing, wordIndex, words, activeDoc.title]);

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

  // Chapter detection: prefer EPUB TOC chapters, fall back to regex detection
  const chapters = useMemo(() => {
    if (externalChapters && externalChapters.length > 0) {
      return chaptersFromCharOffsets(activeDoc.content, externalChapters);
    }
    return detectChapters(activeDoc.content, words);
  }, [activeDoc.content, words, externalChapters]);
  const chIdx = currentChapterIndex(chapters, wordIndex);
  const hasChapters = chapters.length > 1;
  const chapterInfo = useMemo(() => {
    if (!hasChapters || chIdx < 0) return null;
    const chStart = chapters[chIdx].wordIndex;
    const chEnd = chIdx + 1 < chapters.length ? chapters[chIdx + 1].wordIndex : words.length;
    const chWords = chEnd - chStart;
    const chWordsRead = wordIndex - chStart;
    const chPct = chWords > 0 ? Math.round((chWordsRead / chWords) * 100) : 0;
    const chRemaining = formatTime(chEnd - wordIndex, wpm);
    return {
      title: chapters[chIdx].title,
      num: chIdx + 1,
      total: chapters.length,
      pct: chPct,
      remaining: chRemaining,
    };
  }, [hasChapters, chIdx, chapters, wordIndex, words.length, wpm]);

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
      id="main-content"
      className="reader-container"
      style={{ paddingTop: isMac ? 36 : 16 }}
      onClick={playing ? togglePlay : undefined}
      onKeyDown={(e) => {
        if (e.key === "Tab") { e.preventDefault(); e.stopPropagation(); onToggleFlap?.(); }
        if (e.code === "KeyC" && !e.shiftKey && !e.ctrlKey && !e.metaKey && hasChapters) {
          e.preventDefault(); e.stopPropagation(); setChapterListOpen((v) => !v);
        }
        if (e.key === "Escape" && chapterListOpen) {
          e.preventDefault(); e.stopPropagation(); setChapterListOpen(false);
        }
      }}
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
          {onToggleFlap && (
            <button className="hamburger-btn" onClick={(e) => { e.stopPropagation(); onToggleFlap(); }} aria-label="Open menu" title="Menu (Tab)">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); exitReader(); }}
            className="reader-esc-btn"
            aria-label="Exit reader"
          >ESC</button>
          <span className="reader-doc-title">{formatDisplayTitle(activeDoc.title)}</span>
        </div>
        <WpmGauge wpm={wpm} />
      </div>

      {playing ? (
        /* RSVP word display during playback — DOM updated directly via refs */
        (() => {
          const pivotIndex = before.length;
          const orpPercent = currentWord.length > 0 ? ((pivotIndex + 0.5) / currentWord.length) * 100 : 50;
          const useFocusSpan = settings?.focusSpan != null && settings.focusSpan < 1;
          return (
            <div className="reader-word-area" style={{ transform: `scale(${scale})` }}>
              <div className="reader-guide-line reader-guide-top" aria-hidden="true">
                {settings?.focusMarks && <span ref={focusMarkTopRef} className="focus-mark" style={{ left: `${orpPercent}%` }}>&#x25BC;</span>}
              </div>
              <div className="reader-word-display" aria-live="off" aria-atomic="true">
                {useFocusSpan ? (
                  <div ref={charContainerRef}>
                    {currentWord.split("").map((char, i) => (
                      <span
                        key={i}
                        className={i === pivotIndex ? "reader-word-focus" : "reader-word-char"}
                        style={{ opacity: calculateFocusOpacity(i, pivotIndex, currentWord.length, settings!.focusSpan!) }}
                      >{char}</span>
                    ))}
                  </div>
                ) : (
                  <>
                    <span ref={beforeRef} className="reader-word-before">
                      {before.split("").reverse().join("")}
                    </span>
                    <span ref={focusRef} className="reader-word-focus">{focus}</span>
                    <span ref={afterRef} className="reader-word-after">{after}</span>
                  </>
                )}
              </div>
              <div className="reader-guide-line reader-guide-bottom" aria-hidden="true">
                {settings?.focusMarks && <span ref={focusMarkBottomRef} className="focus-mark" style={{ left: `${orpPercent}%` }}>&#x25B2;</span>}
              </div>
            </div>
          );
        })()
      ) : (
        /* Scrollable full text when paused — virtualized to ~20 paragraphs around current word */
        <PausedTextView
          paragraphs={paragraphs}
          paraStartIndices={paraStartIndices}
          wordIndex={wordIndex}
          highlightIdx={highlightIdx}
          currentWordRef={currentWordRef}
          scrollBodyRef={scrollBodyRef}
          containerRef={containerRef}
          settings={settings}
          onJumpToWord={onJumpToWord}
          onHighlight={(word, idx, pos) => {
            setHighlightWord(word);
            setHighlightIdx(idx);
            setHighlightPos(pos);
            setShowDefinition(false);
          }}
          togglePlay={togglePlay}
        />
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
              aria-label="Switch to scroll reading mode"
            >scroll mode</button>
          </div>
        )}

        <div className="reader-bottom-info">
          <span>{pct}%</span>
          <span className="reader-controls-hint" aria-hidden="true">
            <span>&larr; &rarr; rewind</span>
            <span>&uarr; &darr; speed</span>
            <span>+/- font</span>
            <span>space {playing ? "pause" : "play"}</span>
            {hasChapters && <span>C chapters</span>}
          </span>
          <span>{remaining} left</span>
        </div>
        {chapterInfo && (
          <div className="reader-chapter-info" onClick={(e) => e.stopPropagation()}>
            {onPrevChapter && chapterInfo.num > 1 && (
              <button className="chapter-nav-btn" onClick={onPrevChapter} aria-label="Previous chapter" title="Previous chapter ([)">&lsaquo;</button>
            )}
            <button
              className="chapter-label-btn"
              onClick={() => setChapterListOpen(!chapterListOpen)}
              title="Jump to chapter (click to open list)"
              aria-expanded={chapterListOpen}
              aria-haspopup="listbox"
            >
              Ch. {chapterInfo.num}/{chapterInfo.total}: {chapterInfo.title.length > 30 ? chapterInfo.title.slice(0, 30) + "…" : chapterInfo.title}
            </button>
            <span className="reader-chapter-pct">{chapterInfo.pct}%</span>
            <span className="reader-chapter-remaining">{chapterInfo.remaining} to ch. end</span>
            {onNextChapter && chapterInfo.num < chapterInfo.total && (
              <button className="chapter-nav-btn" onClick={onNextChapter} aria-label="Next chapter" title="Next chapter (])">&rsaquo;</button>
            )}
            {chapterListOpen && (
              <div className="chapter-list-dropdown" role="listbox" aria-label="Chapter list">
                {chapters.map((ch, i) => (
                  <button
                    key={i}
                    className={`chapter-list-item${i === chIdx ? " chapter-list-active" : ""}`}
                    role="option"
                    aria-selected={i === chIdx}
                    onClick={() => { onJumpToWord(ch.wordIndex); setChapterListOpen(false); }}
                  >
                    <span className="chapter-list-num">{i + 1}.</span>
                    <span className="chapter-list-title">{ch.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Highlight menu + definition popup */}
      {highlightWord && (
        <HighlightMenu
          word={highlightWord}
          position={highlightPos}
          onSave={() => handleSaveHighlight()}
          onDefine={() => setShowDefinition(true)}
          onClose={closeHighlight}
        />
      )}
      {showDefinition && highlightWord && (
        <DefinitionPopup
          word={highlightWord}
          position={highlightPos}
          onSaveWithDefinition={(text) => handleSaveHighlight(text)}
          onClose={() => setShowDefinition(false)}
        />
      )}

      {/* Screen reader announcement of current word */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {playing ? currentWord : ""}
      </div>

      {/* Toast notification */}
      {toast && <div className="highlight-toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

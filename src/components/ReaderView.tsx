import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { focusChar, calculateFocusOpacity, formatTime, formatDisplayTitle, detectChapters, chaptersFromCharOffsets, currentChapterIndex, Chapter } from "../utils/text";
import { MIN_WPM, MAX_WPM, WPM_STEP, FOCUS_TEXT_SIZE_STEP, ANIMATION_DISABLE_WPM, HIGHLIGHT_TOAST_DISMISS_MS } from "../constants";
import { BlurbyDoc, LayoutSpacing } from "../types";
import type { WordUpdateCallback } from "../hooks/useReader";

/** Sliced settings for RSVP reader — only fields it actually uses */
interface RsvpSettings {
  focusSpan?: number;
  focusMarks?: boolean;
  layoutSpacing?: LayoutSpacing;
  fontFamily?: string | null;
  isEink?: boolean;
  einkPhraseGrouping?: boolean;
  einkWpmCeiling?: number;
}
import ProgressBar from "./ProgressBar";
import WpmGauge from "./WpmGauge";
import HighlightMenu from "./HighlightMenu";
import DefinitionPopup from "./DefinitionPopup";
import PausedTextView from "./PausedTextView";
import blurbyIcon from "../assets/blurby-icon.png";

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
  onEinkRefresh?: () => void;
}

export default function ReaderView({ activeDoc, words, wordIndex, wpm, focusTextSize, playing, escPending, isMac, settings, externalChapters, onWordUpdateRef, togglePlay, exitReader, onSetWpm, onAdjustFocusTextSize, onSwitchToScroll, onJumpToWord, onToggleFlap, onPrevChapter, onNextChapter, onEinkRefresh }: ReaderViewProps) {
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
  // Word transition animation container
  const wordDisplayRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef(0);
  // WPM ref for RAF callback (avoids stale closure)
  const wpmRefLocal = useRef(wpm);
  wpmRefLocal.current = wpm;

  // E-ink phrase grouping: build a phrase of 2-3 words at natural boundaries
  const buildEinkPhrase = useCallback((index: number): string => {
    if (!settings?.einkPhraseGrouping || !settings?.isEink) return words[index] || "";
    const maxWords = 3;
    const phrase: string[] = [];
    for (let i = index; i < Math.min(index + maxWords, words.length); i++) {
      phrase.push(words[i]);
      // Break at natural boundaries: punctuation at end of word, or conjunctions
      if (i > index && /[.!?,;:\u2014]$/.test(words[i])) break;
      if (i + 1 < words.length && /^(and|but|or|the|a|an|in|on|at|to|for|of|is|was|are|were)$/i.test(words[i + 1]) && phrase.length >= 2) break;
    }
    return phrase.join(" ");
  }, [words, settings?.einkPhraseGrouping, settings?.isEink]);

  // Register direct DOM update callback with useReader's RAF loop
  useEffect(() => {
    if (!onWordUpdateRef) return;
    onWordUpdateRef.current = (word: string, _index: number) => {
      if (!playing) return;
      // In e-ink phrase mode, display the phrase instead of a single word
      const displayWord = settings?.isEink && settings?.einkPhraseGrouping ? buildEinkPhrase(_index) : word;
      const { before: b, focus: f, after: a } = focusChar(displayWord);
      const useFocusSpan = settings?.focusSpan != null && settings.focusSpan < 1;

      // Trigger word transition animation (disabled at WPM > ANIMATION_DISABLE_WPM)
      const currentWpm = wpmRefLocal.current;
      if (currentWpm <= ANIMATION_DISABLE_WPM && wordDisplayRef.current) {
        const container = wordDisplayRef.current;
        const interval = 60000 / currentWpm;
        const transitionMs = Math.min(30, Math.floor(interval * 0.15));
        container.style.setProperty("--focus-transition-ms", `${transitionMs}ms`);
        // Toggle animation by incrementing a counter to force re-trigger
        animFrameRef.current++;
        container.classList.remove("reader-word-layer--entering");
        // Force reflow to restart animation
        void container.offsetWidth;
        container.classList.add("reader-word-layer--entering");
      }

      if (useFocusSpan && charContainerRef.current) {
        // Per-character opacity mode: rebuild children
        const pivotIndex = b.length;
        const chars = displayWord.split("");
        const container = charContainerRef.current;
        // Reuse existing spans if count matches, otherwise rebuild
        const focusSpanVal = settings?.focusSpan ?? 0.5;
        if (container.childNodes.length === chars.length) {
          chars.forEach((char, i) => {
            const span = container.childNodes[i] as HTMLSpanElement | null;
            if (!span) return;
            span.textContent = char;
            span.style.opacity = String(calculateFocusOpacity(i, pivotIndex, displayWord.length, focusSpanVal));
            span.className = i === pivotIndex ? "reader-word-focus" : "reader-word-char";
          });
        } else {
          // Clear children safely without innerHTML (avoids React reconciliation conflicts)
          while (container.firstChild) container.removeChild(container.firstChild);
          chars.forEach((char, i) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.opacity = String(calculateFocusOpacity(i, pivotIndex, displayWord.length, focusSpanVal));
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
      const orpPercent = displayWord.length > 0 ? ((pivotIndex + 0.5) / displayWord.length) * 100 : 50;
      if (focusMarkTopRef.current) focusMarkTopRef.current.style.left = `${orpPercent}%`;
      if (focusMarkBottomRef.current) focusMarkBottomRef.current.style.left = `${orpPercent}%`;
    };
    return () => { onWordUpdateRef.current = null; };
  }, [onWordUpdateRef, playing, settings?.focusSpan, settings?.isEink, settings?.einkPhraseGrouping, buildEinkPhrase]);

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
      setTimeout(() => setToast(null), HIGHLIGHT_TOAST_DISMISS_MS);
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
          if (r?.ok) { setToast("Saved to highlights"); setTimeout(() => setToast(null), HIGHLIGHT_TOAST_DISMISS_MS); }
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

      {/* Top bar — hidden during e-ink playback to reduce refreshes */}
      <div
        className={`reader-top-bar${settings?.isEink && playing ? " eink-toolbar-hidden" : ""}`}
        style={{ paddingTop: isMac ? 36 : 16, opacity: playing && !settings?.isEink ? 0.12 : settings?.isEink ? 1 : 0.55 }}
      >
        <div className="reader-top-left">
          {onToggleFlap && (
            <button className="hamburger-btn" onClick={(e) => { e.stopPropagation(); onToggleFlap(); }} aria-label="Open menu" title="Menu (Tab)">
              <img src={blurbyIcon} alt="" width="48" height="48" style={{ borderRadius: 8, display: "block" }} aria-hidden="true" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); exitReader(); }}
            className="reader-esc-btn"
            aria-label="Exit reader"
          >ESC</button>
          <span className="reader-doc-title">{formatDisplayTitle(activeDoc.title)}</span>
          {activeDoc.source === "url" && (activeDoc.authorFull || activeDoc.sourceDomain) && (
            <span className="reader-apa-citation">
              {activeDoc.authorFull && <span>{activeDoc.authorFull} </span>}
              {activeDoc.publishedDate ? (() => {
                try {
                  const d = new Date(activeDoc.publishedDate);
                  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                  return <span>({d.getFullYear()}, {months[d.getMonth()]} {d.getDate()}). </span>;
                } catch { return <span>(n.d.). </span>; }
              })() : (activeDoc.authorFull ? <span>(n.d.). </span> : null)}
              {activeDoc.sourceDomain && activeDoc.sourceUrl ? (
                <a className="reader-apa-source-link" href="#" onClick={(e) => { e.preventDefault(); window.electronAPI.openDocSource(activeDoc.id); }}>{activeDoc.sourceDomain}</a>
              ) : activeDoc.sourceDomain ? (
                <span>{activeDoc.sourceDomain}</span>
              ) : null}
            </span>
          )}
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
              <div ref={wordDisplayRef} className="reader-word-display reader-word-layer" aria-live="off" aria-atomic="true">
                {useFocusSpan ? (
                  /* Children managed entirely by RAF callback via direct DOM —
                     React must NOT render children here to avoid removeChild conflicts */
                  <div ref={charContainerRef} />
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

      {/* Bottom bar removed — unified ReaderBottomBar rendered by ReaderContainer */}

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

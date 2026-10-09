// Focus mode view (READER-MODE-SEPARATION-2 design §B.0, §B.2): the mode root, this mode's own
// FoliateView and, while Focus plays, the RSVP overlay — Focus's copy of src/components/ReaderView.tsx
// with rm-focus-* classes (DD-6). Removed from the copy (Q-A): the PausedTextView branch, unreachable
// because the overlay renders only while Focus plays, and what only that branch fed (paragraph maps,
// the paused auto-scroll, onJumpToWord). The chapter detection that gated the C/Escape chapter-list
// keys is dropped too: its list was never rendered and the document snapshot carries no text content
// (for EPUBs the legacy chapters were always empty). The ESC confirm (useReader.requestExit) is dead
// in this path (OC-9) and not copied. Non-EPUB documents render nothing here; the shell keeps the
// re-import fallback (Q-A).
import { useCallback, useEffect, useRef, useState } from "react";
import { focusChar, calculateFocusOpacity, formatDisplayTitle } from "../../../utils/text";
import { ANIMATION_DISABLE_WPM, HIGHLIGHT_TOAST_DISMISS_MS } from "../../../constants";
import WpmGauge from "../../../components/WpmGauge";
import HighlightMenu from "../../../components/HighlightMenu";
import DefinitionPopup from "../../../components/DefinitionPopup";
import blurbyIcon from "../../../assets/blurby-icon.png";
import type { ReaderModeViewProps } from "../ReaderModeAdapter";
import FocusFoliateView from "./FoliateView";
import { FocusModeRuntime } from "./ModeRuntime";
import { useFocusModeBindings } from "./useModeBindings";
import { buildEinkFocusPhrase } from "./helpers/einkErgonomics";
import "./mode.css";

/** Shell callbacks the overlay offers (legacy ReaderView props); wired by the shell at E1. */
export interface FocusOverlayShellCallbacks {
  readonly exitReader?: () => void;
  readonly onToggleFlap?: () => void;
}

export interface FocusModeViewProps extends ReaderModeViewProps {
  readonly shell?: FocusOverlayShellCallbacks;
}

function FocusRsvpOverlay({ runtime, shell }: { runtime: FocusModeRuntime; shell?: FocusOverlayShellCallbacks }) {
  const { wordIndex, words } = runtime.getDisplay();
  const settingsSnapshot = runtime.settings;
  const wpm = settingsSnapshot.effectiveWpm;
  const focusTextSize = settingsSnapshot.focusTextSize;
  const isMac = settingsSnapshot.isMac;
  const settings = {
    focusSpan: settingsSnapshot.settings.focusSpan,
    focusMarks: settingsSnapshot.settings.focusMarks,
    isEink: settingsSnapshot.isEink,
    einkPhraseGrouping: settingsSnapshot.settings.einkPhraseGrouping,
  };
  const docTitle = runtime.document.title;
  // The overlay renders only while Focus plays.
  const playing = true;
  const togglePlay = () => runtime.togglePlay();
  const exitReader = shell?.exitReader;
  const onToggleFlap = shell?.onToggleFlap;

  const containerRef = useRef<HTMLDivElement>(null);

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

  const buildEinkPhrase = useCallback((index: number): string => buildEinkFocusPhrase(words as string[], index, {
    isEink: settings?.isEink,
    phraseGrouping: settings?.einkPhraseGrouping,
  }), [words, settings?.einkPhraseGrouping, settings?.isEink]);

  // Register the direct DOM update callback with this runtime's engine callback
  useEffect(() => {
    runtime.setWordUpdateCallback((word: string, _index: number) => {
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
        // Toggle animation by removing class, then re-adding on next frame
        animFrameRef.current++;
        container.classList.remove("rm-focus-word-layer--entering");
        requestAnimationFrame(() => {
          container.classList.add("rm-focus-word-layer--entering");
        });
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
            span.className = i === pivotIndex ? "rm-focus-word-focus" : "rm-focus-word-char";
          });
        } else {
          // Clear children safely without innerHTML (avoids React reconciliation conflicts)
          while (container.firstChild) container.removeChild(container.firstChild);
          chars.forEach((char, i) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.opacity = String(calculateFocusOpacity(i, pivotIndex, displayWord.length, focusSpanVal));
            span.className = i === pivotIndex ? "rm-focus-word-focus" : "rm-focus-word-char";
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
    });
    return () => { runtime.setWordUpdateCallback(null); };
  }, [runtime, playing, settings?.focusSpan, settings?.isEink, settings?.einkPhraseGrouping, buildEinkPhrase]);

  // Highlight menu state
  const [highlightWord, setHighlightWord] = useState<string | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [highlightPos] = useState({ x: 0, y: 0 });
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
    const result = await window.electronAPI.saveHighlight({
      docTitle,
      text: wordToSave,
      wordIndex: highlightIdx >= 0 ? highlightIdx : wordIndex,
      totalWords: words.length,
    });
    if (result?.ok) {
      setToast("Saved to highlights");
      setTimeout(() => setToast(null), HIGHLIGHT_TOAST_DISMISS_MS);
    }
    closeHighlight();
  }, [highlightWord, highlightIdx, wordIndex, words.length, docTitle, closeHighlight]);

  // H key: save current word during RSVP, or open menu when paused with selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== "KeyH" || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (playing) {
        // Save current word without pausing
        e.preventDefault();
        window.electronAPI.saveHighlight({
          docTitle,
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
  }, [playing, wordIndex, words, docTitle]);

  useEffect(() => {
    const timer = setTimeout(() => containerRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const currentWord = words[wordIndex] || "";
  const { before, focus, after } = focusChar(currentWord);
  const scale = (focusTextSize || 100) / 100;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      id="main-content"
      className={`rm-focus-container ${isMac ? "rm-focus-container--mac" : ""}`}
      onClick={playing ? togglePlay : undefined}
      onKeyDown={(e) => {
        if (e.key === "Tab") { e.preventDefault(); e.stopPropagation(); onToggleFlap?.(); }
      }}
      role="application"
      aria-label="RSVP speed reader"
      aria-live="off"
    >
      {/* Top bar — hidden during e-ink playback to reduce refreshes */}
      <div
        className={`rm-focus-top-bar${settings?.isEink && playing ? " rm-focus-eink-toolbar-hidden" : ""}${isMac ? " rm-focus-top-bar--mac" : ""}${playing && !settings?.isEink ? " rm-focus-top-bar--playing" : settings?.isEink ? " rm-focus-top-bar--eink" : " rm-focus-top-bar--paused"}`}
      >
        <div className="rm-focus-top-left">
          {onToggleFlap && (
            <button className="rm-focus-hamburger-btn" onClick={(e) => { e.stopPropagation(); onToggleFlap(); }} aria-label="Open menu" title="Menu (Tab)">
              <img src={blurbyIcon} alt="" width="48" height="48" className="rm-focus-hamburger-icon" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); exitReader?.(); }}
            className="rm-focus-esc-btn"
            aria-label="Exit reader"
          >ESC</button>
          <span className="rm-focus-doc-title">{formatDisplayTitle(docTitle)}</span>
        </div>
        <WpmGauge wpm={wpm} />
      </div>

      {/* RSVP word display during playback — DOM updated directly via refs */}
      {(() => {
        const pivotIndex = before.length;
        const orpPercent = currentWord.length > 0 ? ((pivotIndex + 0.5) / currentWord.length) * 100 : 50;
        const useFocusSpan = settings?.focusSpan != null && settings.focusSpan < 1;
        return (
          <div className="rm-focus-word-area" style={{ '--word-area-scale': scale } as React.CSSProperties}>
            <div className="rm-focus-guide-line rm-focus-guide-top" aria-hidden="true">
              {settings?.focusMarks && <span ref={focusMarkTopRef} className="rm-focus-mark" style={{ '--focus-mark-left': `${orpPercent}%` } as React.CSSProperties}>&#x25BC;</span>}
            </div>
            <div ref={wordDisplayRef} className="rm-focus-word-display rm-focus-word-layer" aria-live="off" aria-atomic="true">
              {useFocusSpan ? (
                /* Children managed entirely by the direct DOM callback —
                   React must NOT render children here to avoid removeChild conflicts */
                <div ref={charContainerRef} />
              ) : (
                <>
                  <span ref={beforeRef} className="rm-focus-word-before">
                    {before.split("").reverse().join("")}
                  </span>
                  <span ref={focusRef} className="rm-focus-word-focus">{focus}</span>
                  <span ref={afterRef} className="rm-focus-word-after">{after}</span>
                </>
              )}
            </div>
            <div className="rm-focus-guide-line rm-focus-guide-bottom" aria-hidden="true">
              {settings?.focusMarks && <span ref={focusMarkBottomRef} className="rm-focus-mark" style={{ '--focus-mark-left': `${orpPercent}%` } as React.CSSProperties}>&#x25B2;</span>}
            </div>
          </div>
        );
      })()}

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
      <div className="rm-focus-sr-only" aria-live="assertive" aria-atomic="true">
        {playing ? currentWord : ""}
      </div>

      {/* Toast notification */}
      {toast && <div className="rm-focus-highlight-toast" role="status" aria-live="polite">{toast}</div>}
    </div>
  );
}

function FocusModeBody({ runtime, shell }: { runtime: FocusModeRuntime; shell?: FocusOverlayShellCallbacks }) {
  const { useFoliate, playing, viewProps } = useFocusModeBindings(runtime);
  return (
    <div className="rm-focus-root">
      {useFoliate && <FocusFoliateView {...viewProps} />}
      {useFoliate && playing && (
        <div className="rm-focus-overlay">
          <FocusRsvpOverlay runtime={runtime} shell={shell} />
        </div>
      )}
    </div>
  );
}

export function FocusModeView({ runtime, shell }: FocusModeViewProps) {
  if (!(runtime instanceof FocusModeRuntime)) throw new Error(`FocusModeView cannot render a ${runtime.mode} runtime`);
  return <FocusModeBody runtime={runtime} shell={shell} />;
}

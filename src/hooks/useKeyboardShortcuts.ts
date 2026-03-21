import { useEffect, useRef } from "react";
import { WPM_STEP, REWIND_WORDS, FOCUS_TEXT_SIZE_STEP } from "../utils/text";

const URL_REGEX = /^https?:\/\/[^\s]+$/;

interface ReaderKeysState {
  view: string;
  readerMode: string;
  togglePlay: () => void;
  seekWords: (delta: number) => void;
  adjustWpm: (delta: number) => void;
  exitReader: () => void;
  adjustFocusTextSize: (delta: number) => void;
  toggleFlap?: () => void;
  toggleFavorite?: () => void;
  switchMode?: () => void;
  prevChapter?: () => void;
  nextChapter?: () => void;
  toggleNarration?: () => void;
}

export function useReaderKeys(
  view: string,
  readerMode: string,
  togglePlay: () => void,
  seekWords: (delta: number) => void,
  adjustWpm: (delta: number) => void,
  exitReader: () => void,
  adjustFocusTextSize: (delta: number) => void,
  toggleFlap?: () => void,
  toggleFavorite?: () => void,
  switchMode?: () => void,
  prevChapter?: () => void,
  nextChapter?: () => void,
  toggleNarration?: () => void
) {
  const stateRef = useRef<ReaderKeysState>({
    view, readerMode, togglePlay, seekWords, adjustWpm, exitReader,
    adjustFocusTextSize, toggleFlap, toggleFavorite, switchMode,
    prevChapter, nextChapter, toggleNarration,
  });

  // Update ref on every render so the handler always sees current values
  stateRef.current = {
    view, readerMode, togglePlay, seekWords, adjustWpm, exitReader,
    adjustFocusTextSize, toggleFlap, toggleFavorite, switchMode,
    prevChapter, nextChapter, toggleNarration,
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.view !== "reader") return;
      // Tab toggles flap in any reader mode
      if (e.key === "Tab") { e.preventDefault(); s.toggleFlap?.(); return; }
      // T toggles narration in any reader mode
      if (e.code === "KeyT" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.toggleNarration?.(); return; }
      // B toggles favorite in any reader mode
      if (e.code === "KeyB" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.toggleFavorite?.(); return; }
      // Shift+F toggles reading mode (focus ↔ scroll)
      if (e.code === "KeyF" && e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.switchMode?.(); return; }
      // Ctrl/Cmd+, opens settings (handled by useGlobalKeys)
      // [ / ] for chapter navigation
      if (e.code === "BracketLeft" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.prevChapter?.(); return; }
      if (e.code === "BracketRight" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.nextChapter?.(); return; }
      // Shift+Up/Down for coarse WPM adjustment (±100)
      if (e.code === "ArrowUp" && e.shiftKey) { e.preventDefault(); s.adjustWpm(100); return; }
      if (e.code === "ArrowDown" && e.shiftKey) { e.preventDefault(); s.adjustWpm(-100); return; }
      // Other keys only work in speed/focus mode
      if (s.readerMode !== "speed") return;
      if (e.code === "Space") { e.preventDefault(); s.togglePlay(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); s.seekWords(-REWIND_WORDS); }
      else if (e.code === "ArrowRight") { e.preventDefault(); s.seekWords(REWIND_WORDS); }
      else if (e.code === "ArrowUp") { e.preventDefault(); s.adjustWpm(WPM_STEP); }
      else if (e.code === "ArrowDown") { e.preventDefault(); s.adjustWpm(-WPM_STEP); }
      else if (e.code === "Equal" || e.code === "NumpadAdd") { e.preventDefault(); s.adjustFocusTextSize(FOCUS_TEXT_SIZE_STEP); }
      else if (e.code === "Minus" || e.code === "NumpadSubtract") { e.preventDefault(); s.adjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP); }
      else if (e.code === "Escape") { e.preventDefault(); s.exitReader(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // Attach once — handler reads from ref
}

export function useGlobalKeys({ toggleFlap, openSettings, view }: { toggleFlap: () => void; openSettings?: () => void; view: string }) {
  const stateRef = useRef({ toggleFlap, openSettings, view });
  stateRef.current = { toggleFlap, openSettings, view };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;
      // Ctrl/Cmd+, opens settings in any view
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        s.openSettings?.();
        return;
      }
      // Only handle Tab in library view — reader view has its own Tab handler in useReaderKeys
      if (s.view === "reader") return;
      if (e.key === "Tab" && !(e.target as HTMLElement)?.closest?.("input, textarea, select")) {
        e.preventDefault();
        s.toggleFlap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // Attach once — handler reads from ref
}

// Smart import: Alt+V detects URL vs text and shows confirmation dialog
export function useSmartImport(view: string, onImport: (content: string, isUrl: boolean) => void) {
  const stateRef = useRef({ view, onImport });
  stateRef.current = { view, onImport };

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (!((e.altKey || e.metaKey) && e.code === "KeyV")) return;
      const s = stateRef.current;
      if (s.view !== "library") return;
      e.preventDefault();

      // Try clipboard first, fall back to selection
      let text = "";
      try {
        text = await navigator.clipboard.readText();
      } catch {
        text = window.getSelection()?.toString() || "";
      }
      text = text.trim();
      if (!text) {
        text = window.getSelection()?.toString().trim() || "";
      }
      if (!text) return;

      const isUrl = URL_REGEX.test(text);
      s.onImport(text, isUrl);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // Attach once — handler reads from ref
}

import { useEffect } from "react";
import { WPM_STEP, REWIND_WORDS, FOCUS_TEXT_SIZE_STEP } from "../utils/text";

const URL_REGEX = /^https?:\/\/[^\s]+$/;

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
  nextChapter?: () => void
) {
  useEffect(() => {
    if (view !== "reader") return;
    const handler = (e: KeyboardEvent) => {
      // Tab toggles flap in any reader mode
      if (e.key === "Tab") { e.preventDefault(); toggleFlap?.(); return; }
      // B toggles favorite in any reader mode
      if (e.code === "KeyB" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleFavorite?.(); return; }
      // Shift+F toggles reading mode (focus ↔ scroll)
      if (e.code === "KeyF" && e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); switchMode?.(); return; }
      // Ctrl/Cmd+, opens settings (handled by useGlobalKeys)
      // [ / ] for chapter navigation
      if (e.code === "BracketLeft" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); prevChapter?.(); return; }
      if (e.code === "BracketRight" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); nextChapter?.(); return; }
      // Shift+Up/Down for coarse WPM adjustment (±100)
      if (e.code === "ArrowUp" && e.shiftKey) { e.preventDefault(); adjustWpm(100); return; }
      if (e.code === "ArrowDown" && e.shiftKey) { e.preventDefault(); adjustWpm(-100); return; }
      // Other keys only work in speed/focus mode
      if (readerMode !== "speed") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); seekWords(-REWIND_WORDS); }
      else if (e.code === "ArrowRight") { e.preventDefault(); seekWords(REWIND_WORDS); }
      else if (e.code === "ArrowUp") { e.preventDefault(); adjustWpm(WPM_STEP); }
      else if (e.code === "ArrowDown") { e.preventDefault(); adjustWpm(-WPM_STEP); }
      else if (e.code === "Equal" || e.code === "NumpadAdd") { e.preventDefault(); adjustFocusTextSize(FOCUS_TEXT_SIZE_STEP); }
      else if (e.code === "Minus" || e.code === "NumpadSubtract") { e.preventDefault(); adjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP); }
      else if (e.code === "Escape") { e.preventDefault(); exitReader(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, readerMode, togglePlay, seekWords, adjustWpm, exitReader, adjustFocusTextSize, toggleFlap, toggleFavorite, switchMode, prevChapter, nextChapter]);
}

export function useGlobalKeys({ toggleFlap, openSettings, view }: { toggleFlap: () => void; openSettings?: () => void; view: string }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd+, opens settings in any view
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        openSettings?.();
        return;
      }
      // Only handle Tab in library view — reader view has its own Tab handler in useReaderKeys
      if (view === "reader") return;
      if (e.key === "Tab" && !(e.target as HTMLElement)?.closest?.("input, textarea, select")) {
        e.preventDefault();
        toggleFlap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleFlap, openSettings, view]);
}

// Smart import: Alt+V detects URL vs text and shows confirmation dialog
export function useSmartImport(view: string, onImport: (content: string, isUrl: boolean) => void) {
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (!((e.altKey || e.metaKey) && e.code === "KeyV")) return;
      if (view !== "library") return;
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
      onImport(text, isUrl);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, onImport]);
}

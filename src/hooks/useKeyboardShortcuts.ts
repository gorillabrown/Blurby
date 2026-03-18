import { useEffect } from "react";
import { WPM_STEP, REWIND_WORDS, FONT_SIZE_STEP } from "../utils/text";

const URL_REGEX = /^https?:\/\/[^\s]+$/;

export function useReaderKeys(
  view: string,
  readerMode: string,
  togglePlay: () => void,
  seekWords: (delta: number) => void,
  adjustWpm: (delta: number) => void,
  exitReader: () => void,
  adjustFontSize: (delta: number) => void
) {
  useEffect(() => {
    if (view !== "reader" || readerMode !== "speed") return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); seekWords(-REWIND_WORDS); }
      else if (e.code === "ArrowRight") { e.preventDefault(); seekWords(REWIND_WORDS); }
      else if (e.code === "ArrowUp") { e.preventDefault(); adjustWpm(WPM_STEP); }
      else if (e.code === "ArrowDown") { e.preventDefault(); adjustWpm(-WPM_STEP); }
      else if (e.code === "Equal" || e.code === "NumpadAdd") { e.preventDefault(); adjustFontSize(FONT_SIZE_STEP); }
      else if (e.code === "Minus" || e.code === "NumpadSubtract") { e.preventDefault(); adjustFontSize(-FONT_SIZE_STEP); }
      else if (e.code === "Escape") { e.preventDefault(); exitReader(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, readerMode, togglePlay, seekWords, adjustWpm, exitReader, adjustFontSize]);
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

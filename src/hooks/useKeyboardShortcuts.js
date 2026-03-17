import { useEffect } from "react";
import { WPM_STEP, REWIND_WORDS } from "../utils/text";

const api = window.electronAPI;

export function useReaderKeys(view, togglePlay, seekWords, adjustWpm, exitReader) {
  useEffect(() => {
    if (view !== "reader") return;
    const handler = (e) => {
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowLeft") { e.preventDefault(); seekWords(-REWIND_WORDS); }
      else if (e.code === "ArrowRight") { e.preventDefault(); seekWords(REWIND_WORDS); }
      else if (e.code === "ArrowUp") { e.preventDefault(); adjustWpm(WPM_STEP); }
      else if (e.code === "ArrowDown") { e.preventDefault(); adjustWpm(-WPM_STEP); }
      else if (e.code === "Escape") { e.preventDefault(); exitReader(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, togglePlay, seekWords, adjustWpm, exitReader]);
}

export function useQuickRead(view, openDoc) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.altKey || e.metaKey) && e.code === "KeyV") {
        e.preventDefault();
        const sel = window.getSelection().toString().trim();
        if (sel && view === "library") {
          (async () => {
            const title = sel.slice(0, 40) + (sel.length > 40 ? "..." : "");
            const doc = await api.addManualDoc(title, sel);
            openDoc(doc);
          })();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, openDoc]);
}

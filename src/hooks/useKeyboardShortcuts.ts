import { useEffect, useRef, useCallback, useState } from "react";
import { WPM_STEP, REWIND_WORDS, FOCUS_TEXT_SIZE_STEP } from "../utils/text";

const URL_REGEX = /^https?:\/\/[^\s]+$/;
const G_SEQUENCE_TIMEOUT = 2000;

// ── Types ────────────────────────────────────────────────────────────────

export type OverlayId =
  | "commandPalette"
  | "librarySearch"
  | "shortcuts"
  | "highlights"
  | "quickSettings"
  | "snoozePicker"
  | "tagPicker"
  | "collectionPicker"
  | null;

export type LibraryFilter =
  | "all"
  | "unread"
  | "starred"
  | "reading"
  | "importedToday"
  | "snoozed"
  | "favorites"
  | "archive"
  | "queue"
  | "recent"
  | "collections";

export interface GoToState {
  pending: boolean;
}

export interface LibraryKeyboardState {
  focusedIndex: number;
  selectedIds: Set<string>;
  activeFilter: LibraryFilter;
  activeOverlay: OverlayId;
  goTo: GoToState;
  focusZone: "search" | "grid" | "sidebar";
}

interface ReaderKeysState {
  view: string;
  readerMode: string; // "page" | "speed" | "scroll"
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
  // Page-mode specific callbacks
  prevPage?: () => void;
  nextPage?: () => void;
  enterFlow?: () => void;
  moveWordSelection?: (direction: "left" | "right" | "up" | "down") => void;
  defineWord?: () => void;
  makeNote?: () => void;
}

// ── Library Keyboard Actions ──────────────────────────────────────────────

export interface LibraryKeyboardActions {
  onArchive?: (docId: string) => void;
  onUnarchive?: (docId: string) => void;
  onToggleStar?: (docId: string) => void;
  onTrash?: (docId: string) => void;
  onToggleUnread?: (docId: string) => void;
  onResume?: (docId: string) => void;
  onOpenSource?: (docId: string) => void;
  onOpenDoc?: (docId: string) => void;
  onSnooze?: (docId: string) => void;
  onAddTag?: (docId: string) => void;
  onMoveCollection?: (docId: string) => void;
  onFocusSearch?: () => void;
  onNavigateFilter?: (filter: LibraryFilter) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  getDocIdAtIndex?: (index: number) => string | undefined;
  getVisibleDocCount?: () => number;
  showUndoToast?: (message: string, undoFn: () => void) => void;
}

// ── useReaderKeys (updated with Sprint 20 changes) ────────────────────────

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
  toggleNarration?: () => void,
  prevPage?: () => void,
  nextPage?: () => void,
  enterFlow?: () => void,
  moveWordSelection?: (direction: "left" | "right" | "up" | "down") => void,
  defineWord?: () => void,
  makeNote?: () => void
) {
  const stateRef = useRef<ReaderKeysState>({
    view, readerMode, togglePlay, seekWords, adjustWpm, exitReader,
    adjustFocusTextSize, toggleFlap, toggleFavorite, switchMode,
    prevChapter, nextChapter, toggleNarration,
    prevPage, nextPage, enterFlow, moveWordSelection, defineWord, makeNote,
  });

  stateRef.current = {
    view, readerMode, togglePlay, seekWords, adjustWpm, exitReader,
    adjustFocusTextSize, toggleFlap, toggleFavorite, switchMode,
    prevChapter, nextChapter, toggleNarration,
    prevPage, nextPage, enterFlow, moveWordSelection, defineWord, makeNote,
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.view !== "reader") return;
      const isPage = s.readerMode === "page";

      // ── Universal keys (all modes) ─────────────────────────────────
      // M toggles menu flap
      if (e.code === "KeyM" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.toggleFlap?.(); return; }
      // Tab cycles reading mode
      if (e.key === "Tab" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.switchMode?.(); return; }
      // T toggles narration
      if (e.code === "KeyT" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.toggleNarration?.(); return; }
      // S toggles favorite
      if (e.code === "KeyS" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.toggleFavorite?.(); return; }
      // [ ] N P chapter navigation (N/P not in page mode — conflict with Shift+N note)
      if (e.code === "BracketLeft" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.prevChapter?.(); return; }
      if (e.code === "BracketRight" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.nextChapter?.(); return; }
      if (!isPage && e.code === "KeyN" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.nextChapter?.(); return; }
      if (!isPage && e.code === "KeyP" && !e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.prevChapter?.(); return; }
      // Ctrl font size
      if ((e.ctrlKey || e.metaKey) && (e.code === "Equal" || e.code === "NumpadAdd")) { e.preventDefault(); s.adjustFocusTextSize(FOCUS_TEXT_SIZE_STEP); return; }
      if ((e.ctrlKey || e.metaKey) && (e.code === "Minus" || e.code === "NumpadSubtract")) { e.preventDefault(); s.adjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP); return; }
      if ((e.ctrlKey || e.metaKey) && e.code === "Digit0") { e.preventDefault(); return; }
      // Ctrl+Up/Down jump to top/bottom
      if (e.ctrlKey && e.code === "ArrowUp") { e.preventDefault(); s.seekWords(-Infinity); return; }
      if (e.ctrlKey && e.code === "ArrowDown") { e.preventDefault(); s.seekWords(Infinity); return; }
      // Escape
      if (e.code === "Escape") { e.preventDefault(); s.exitReader(); return; }

      // ── Page-mode specific keys ────────────────────────────────────
      if (isPage) {
        // Space → enter Focus
        if (e.code === "Space" && !e.shiftKey) { e.preventDefault(); s.togglePlay(); return; }
        // Shift+Space → enter Flow
        if (e.code === "Space" && e.shiftKey) { e.preventDefault(); s.enterFlow?.(); return; }
        // ←/→ flip pages
        if (e.code === "ArrowLeft" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.prevPage?.(); return; }
        if (e.code === "ArrowRight" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.nextPage?.(); return; }
        // Shift+arrows move word selection
        if (e.shiftKey && !e.ctrlKey) {
          if (e.code === "ArrowLeft") { e.preventDefault(); s.moveWordSelection?.("left"); return; }
          if (e.code === "ArrowRight") { e.preventDefault(); s.moveWordSelection?.("right"); return; }
          if (e.code === "ArrowUp") { e.preventDefault(); s.moveWordSelection?.("up"); return; }
          if (e.code === "ArrowDown") { e.preventDefault(); s.moveWordSelection?.("down"); return; }
        }
        // Shift+D define
        if (e.code === "KeyD" && e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.defineWord?.(); return; }
        // Shift+N make note
        if (e.code === "KeyN" && e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.makeNote?.(); return; }
        // Up/Down WPM in Page view
        if (e.code === "ArrowUp" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.adjustWpm(WPM_STEP); return; }
        if (e.code === "ArrowDown" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.adjustWpm(-WPM_STEP); return; }
        return;
      }

      // ── Focus/Flow mode keys ───────────────────────────────────────
      // Space = pause → return to Page
      if (e.code === "Space") { e.preventDefault(); s.togglePlay(); return; }
      // ←/→ seek words
      if (e.code === "ArrowLeft" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.seekWords(-REWIND_WORDS); return; }
      if (e.code === "ArrowRight" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.seekWords(REWIND_WORDS); return; }
      // Up/Down WPM
      if (e.code === "ArrowUp" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.adjustWpm(WPM_STEP); return; }
      if (e.code === "ArrowDown" && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.adjustWpm(-WPM_STEP); return; }
      // Shift+Up/Down coarse WPM (Focus/Flow only)
      if (e.code === "ArrowUp" && e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.adjustWpm(100); return; }
      if (e.code === "ArrowDown" && e.shiftKey && !e.ctrlKey) { e.preventDefault(); s.adjustWpm(-100); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}

// ── useGlobalKeys (updated with Sprint 20) ────────────────────────────────

export function useGlobalKeys({ toggleFlap, openSettings, view, activeOverlay, setActiveOverlay }: {
  toggleFlap: () => void;
  openSettings?: () => void;
  view: string;
  activeOverlay?: OverlayId;
  setActiveOverlay?: (overlay: OverlayId) => void;
}) {
  const stateRef = useRef({ toggleFlap, openSettings, view, activeOverlay, setActiveOverlay });
  stateRef.current = { toggleFlap, openSettings, view, activeOverlay, setActiveOverlay };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;

      // Ctrl+K: Command palette (any view)
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyK") {
        e.preventDefault();
        s.setActiveOverlay?.(s.activeOverlay === "commandPalette" ? null : "commandPalette");
        return;
      }

      // Ctrl+, opens settings (any view)
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        s.openSettings?.();
        return;
      }

      // Ctrl+Shift+, opens quick settings
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ",") {
        e.preventDefault();
        s.setActiveOverlay?.(s.activeOverlay === "quickSettings" ? null : "quickSettings");
        return;
      }

      // ? shows shortcuts overlay (not in input fields)
      if (e.key === "?" && !(e.target as HTMLElement)?.closest?.("input, textarea, select")) {
        e.preventDefault();
        s.setActiveOverlay?.(s.activeOverlay === "shortcuts" ? null : "shortcuts");
        return;
      }

      // ; shows highlights overlay (not in input fields)
      if (e.key === ";" && !e.ctrlKey && !e.metaKey && !(e.target as HTMLElement)?.closest?.("input, textarea, select")) {
        e.preventDefault();
        s.setActiveOverlay?.(s.activeOverlay === "highlights" ? null : "highlights");
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}

// ── useLibraryKeyboard (NEW — Sprint 20 library keyboard navigation) ──────

export function useLibraryKeyboard(
  view: string,
  actions: LibraryKeyboardActions
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  const [activeOverlay, setActiveOverlay] = useState<OverlayId>(null);
  const [goToPending, setGoToPending] = useState(false);
  const [focusZone, setFocusZone] = useState<"search" | "grid" | "sidebar">("grid");
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const goToTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear G-sequence timeout
  const clearGoTo = useCallback(() => {
    setGoToPending(false);
    if (goToTimerRef.current) {
      clearTimeout(goToTimerRef.current);
      goToTimerRef.current = null;
    }
  }, []);

  // Start G-sequence with timeout
  const startGoTo = useCallback(() => {
    setGoToPending(true);
    goToTimerRef.current = setTimeout(() => {
      setGoToPending(false);
    }, G_SEQUENCE_TIMEOUT);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (view !== "library") return;

      const a = actionsRef.current;
      const target = e.target as HTMLElement;
      const inInput = target?.closest?.("input, textarea, select");

      // Escape layering (priority order)
      if (e.code === "Escape") {
        e.preventDefault();
        if (activeOverlay) { setActiveOverlay(null); return; }
        if (inInput) { (target as HTMLInputElement)?.blur?.(); return; }
        if (selectedIds.size > 0) { setSelectedIds(new Set()); return; }
        if (activeFilter !== "all") { setActiveFilter("all"); a.onNavigateFilter?.("all"); return; }
        return;
      }

      // Don't handle other keys when in input fields (except Escape above)
      if (inInput) return;

      // G-sequence handler
      if (goToPending) {
        clearGoTo();
        e.preventDefault();
        const key = e.code;
        if (key === "KeyL") { setActiveFilter("all"); a.onNavigateFilter?.("all"); }
        else if (key === "KeyF") { setActiveFilter("favorites"); a.onNavigateFilter?.("favorites"); }
        else if (key === "KeyA") { setActiveFilter("archive"); a.onNavigateFilter?.("archive"); }
        else if (key === "KeyQ") { setActiveFilter("queue"); a.onNavigateFilter?.("queue"); }
        else if (key === "KeyR") { setActiveFilter("recent"); a.onNavigateFilter?.("recent"); }
        else if (key === "KeyS") { /* navigate to stats — handled by caller */ }
        else if (key === "KeyH") { setActiveFilter("snoozed"); a.onNavigateFilter?.("snoozed"); }
        else if (key === "KeyC") { setActiveFilter("collections"); a.onNavigateFilter?.("collections"); }
        else if (key === "KeyM") { /* toggle menu handled by caller */ }
        return;
      }

      // G starts go-to sequence
      if (e.code === "KeyG" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        startGoTo();
        return;
      }

      const docCount = a.getVisibleDocCount?.() ?? 0;
      const currentDocId = a.getDocIdAtIndex?.(focusedIndex);

      // J/K navigation
      if (e.code === "KeyJ" && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, docCount - 1));
        return;
      }
      if (e.code === "KeyK" && !e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // Arrow keys for grid nav
      if (e.code === "ArrowDown" && !e.ctrlKey) { e.preventDefault(); setFocusedIndex((prev) => Math.min(prev + 1, docCount - 1)); return; }
      if (e.code === "ArrowUp" && !e.ctrlKey) { e.preventDefault(); setFocusedIndex((prev) => Math.max(prev - 1, 0)); return; }

      // Ctrl+Up/Down jump to top/bottom
      if (e.ctrlKey && e.code === "ArrowUp") { e.preventDefault(); setFocusedIndex(0); a.onScrollToTop?.(); return; }
      if (e.ctrlKey && e.code === "ArrowDown") { e.preventDefault(); setFocusedIndex(docCount - 1); a.onScrollToBottom?.(); return; }

      // Enter opens focused doc
      if (e.code === "Enter" && currentDocId) { e.preventDefault(); a.onOpenDoc?.(currentDocId); return; }

      // X toggles selection
      if (e.code === "KeyX" && currentDocId) {
        e.preventDefault();
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(currentDocId)) next.delete(currentDocId);
          else next.add(currentDocId);
          return next;
        });
        return;
      }

      // Ctrl+Shift+A select all
      if (e.ctrlKey && e.shiftKey && e.code === "KeyA") {
        e.preventDefault();
        a.onSelectAll?.();
        return;
      }

      // / opens library search overlay (Sprint 20X)
      if (e.key === "/" && !e.ctrlKey) {
        e.preventDefault();
        setActiveOverlay("librarySearch");
        return;
      }

      // Tab cycles focus zones
      if (e.key === "Tab") {
        e.preventDefault();
        const zones: Array<"search" | "grid" | "sidebar"> = ["search", "grid", "sidebar"];
        const currentIdx = zones.indexOf(focusZone);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + zones.length) % zones.length
          : (currentIdx + 1) % zones.length;
        setFocusZone(zones[nextIdx]);
        return;
      }

      // Single-key actions on focused doc
      if (currentDocId) {
        // E archive (auto-advance)
        if (e.code === "KeyE" && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onArchive?.(currentDocId);
          return;
        }
        // Shift+E restore from archive
        if (e.code === "KeyE" && e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onUnarchive?.(currentDocId);
          return;
        }
        // S star/favorite
        if (e.code === "KeyS" && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onToggleStar?.(currentDocId);
          return;
        }
        // # trash (Shift+3)
        if (e.key === "#") {
          e.preventDefault();
          a.onTrash?.(currentDocId);
          return;
        }
        // U toggle unread
        if (e.code === "KeyU" && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onToggleUnread?.(currentDocId);
          return;
        }
        // R resume reading
        if (e.code === "KeyR" && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onResume?.(currentDocId);
          return;
        }
        // O open source
        if (e.code === "KeyO" && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onOpenSource?.(currentDocId);
          return;
        }
        // H snooze
        if (e.code === "KeyH" && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onSnooze?.(currentDocId);
          return;
        }
        // L tag picker
        if (e.code === "KeyL" && !e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          a.onAddTag?.(currentDocId);
          return;
        }
        // V collection picker
        if (e.code === "KeyV" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          a.onMoveCollection?.(currentDocId);
          return;
        }
      }

      // Z undo (while undo action is available)
      if (e.code === "KeyZ" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        if (undoAction) {
          undoAction();
          setUndoAction(null);
        }
        return;
      }

      // Filter shortcuts
      if (e.shiftKey && !e.ctrlKey) {
        if (e.code === "KeyU") {
          e.preventDefault();
          setActiveFilter((prev) => prev === "unread" ? "all" : "unread");
          a.onNavigateFilter?.(activeFilter === "unread" ? "all" : "unread");
          return;
        }
        if (e.code === "KeyS") {
          e.preventDefault();
          setActiveFilter((prev) => prev === "starred" ? "all" : "starred");
          a.onNavigateFilter?.(activeFilter === "starred" ? "all" : "starred");
          return;
        }
        if (e.code === "KeyR") {
          e.preventDefault();
          setActiveFilter((prev) => prev === "reading" ? "all" : "reading");
          a.onNavigateFilter?.(activeFilter === "reading" ? "all" : "reading");
          return;
        }
        if (e.code === "KeyI") {
          e.preventDefault();
          setActiveFilter((prev) => prev === "importedToday" ? "all" : "importedToday");
          a.onNavigateFilter?.(activeFilter === "importedToday" ? "all" : "importedToday");
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, focusedIndex, selectedIds, activeFilter, activeOverlay, goToPending, focusZone, undoAction, clearGoTo, startGoTo]);

  return {
    focusedIndex,
    setFocusedIndex,
    selectedIds,
    setSelectedIds,
    activeFilter,
    setActiveFilter,
    activeOverlay,
    setActiveOverlay,
    goToPending,
    focusZone,
    setFocusZone,
    undoAction,
    setUndoAction,
  };
}

// ── useSmartImport (unchanged) ────────────────────────────────────────────

export function useSmartImport(view: string, onImport: (content: string, isUrl: boolean) => void) {
  const stateRef = useRef({ view, onImport });
  stateRef.current = { view, onImport };

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (!((e.altKey || e.metaKey) && e.code === "KeyV")) return;
      const s = stateRef.current;
      if (s.view !== "library") return;
      e.preventDefault();

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
  }, []);
}

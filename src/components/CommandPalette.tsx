import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { BlurbyDoc } from "../types";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface PaletteItem {
  type: "doc" | "action" | "setting" | "shortcut";
  label: string;
  sublabel?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  library: BlurbyDoc[];
  onSelect: (docId: string) => void;
  onAction: (action: () => void) => void;
  onClose: () => void;
  onOpenSettings: (page?: string) => void;
  /** "commands" shows actions/settings/shortcuts only; "library" shows documents only */
  mode?: "commands" | "library";
}

// Simple scored fuzzy match — no external deps.
// Returns a score >= 0 if the query matches, or -1 if not.
function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  // Exact substring: highest score
  if (t.includes(q)) return 100 - (t.indexOf(q) / t.length) * 10;
  // Character-by-character subsequence match
  let qi = 0;
  let score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 1;
      qi++;
    }
  }
  if (qi < q.length) return -1; // not all chars matched
  return (score / q.length) * 50;
}

const RECENT_ACTIONS_KEY = "blurby_palette_recent";

function getRecentActions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_ACTIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

function recordRecentAction(label: string) {
  try {
    const recent = getRecentActions().filter((r) => r !== label);
    recent.unshift(label);
    localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(recent.slice(0, 5)));
  } catch {
    // ignore
  }
}

export default function CommandPalette({
  library,
  onSelect,
  onAction,
  onClose,
  onOpenSettings,
  mode = "commands",
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Build action registry
  const buildActions = useCallback((): PaletteItem[] => {
    // Helper: execute action then close palette.
    const act = (fn: () => void) => () => { fn(); onClose(); };

    return [
      { type: "action", label: "Open Settings", sublabel: "Ctrl+,", onSelect: act(() => onOpenSettings()) },
      {
        type: "action",
        label: "Open Reading Notes",
        sublabel: "Open .docx notes file in default editor",
        onSelect: act(() => {
          window.electronAPI.openReadingNotes().then((result) => {
            if (result?.error) alert(result.error);
          });
        }),
      },
      { type: "action", label: "Open Reading Log", sublabel: "Open .xlsx reading log in spreadsheet app", onSelect: act(() => window.electronAPI.openReadingLog()) },
      { type: "action", label: "Export Library", sublabel: "Save library to JSON file", onSelect: act(() => window.electronAPI.exportLibrary()) },
      { type: "action", label: "Import Library", sublabel: "Merge library from JSON file", onSelect: act(() => window.electronAPI.importLibrary()) },
      // Settings pages
      { type: "setting", label: "Settings: Theme", sublabel: "Dark, light, e-ink, system themes", onSelect: act(() => onOpenSettings("theme")) },
      { type: "setting", label: "Settings: Layout", sublabel: "Page layout and spacing", onSelect: act(() => onOpenSettings("layout")) },
      { type: "setting", label: "Settings: Speed Reading", sublabel: "WPM, pauses, flow word span", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Settings: Hotkeys", sublabel: "Keyboard shortcut reference", onSelect: act(() => onOpenSettings("hotkeys")) },
      { type: "setting", label: "Settings: Connectors", sublabel: "Site logins and integrations", onSelect: act(() => onOpenSettings("connectors")) },
      { type: "setting", label: "Settings: Help", sublabel: "Adding content, updates", onSelect: act(() => onOpenSettings()) },
      { type: "setting", label: "Settings: Text Size", sublabel: "Adjust reading text size", onSelect: act(() => onOpenSettings("text-size")) },
      { type: "setting", label: "Settings: Cloud Sync", sublabel: "OneDrive / Google Drive sync", onSelect: act(() => onOpenSettings("cloud-sync")) },
      // Sub-sections within Speed Reading
      { type: "setting", label: "Reading Mode", sublabel: "Switch between Focus and Flow", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Focus Mode Options", sublabel: "Focus marks, reading ruler, focus span", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Flow Mode Options", sublabel: "Words per highlight, cursor style", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Rhythm Pauses", sublabel: "Commas, sentences, paragraphs, numbers", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Narration (TTS)", sublabel: "Enable TTS, voice engine, Kokoro AI", onSelect: act(() => onOpenSettings("speed-reading")) },
      // Sub-sections within Theme
      { type: "setting", label: "Accent Color", sublabel: "Change app accent color", onSelect: act(() => onOpenSettings("theme")) },
      { type: "setting", label: "Font", sublabel: "Change reading font family", onSelect: act(() => onOpenSettings("theme")) },
      // Sub-sections within Layout
      { type: "setting", label: "Line Spacing", sublabel: "Adjust line height", onSelect: act(() => onOpenSettings("layout")) },
      { type: "setting", label: "Character Spacing", sublabel: "Adjust letter spacing", onSelect: act(() => onOpenSettings("layout")) },
      { type: "setting", label: "Word Spacing", sublabel: "Adjust word gap", onSelect: act(() => onOpenSettings("layout")) },
      { type: "setting", label: "Focus Text Size", sublabel: "Adjust focus reader text size", onSelect: act(() => onOpenSettings("layout")) },
      { type: "setting", label: "Flow Text Size", sublabel: "Adjust flow reader text size", onSelect: act(() => onOpenSettings("layout")) },
      // Library Layout
      { type: "setting", label: "Settings: Library Layout", sublabel: "Sort, grid/list, card size, spacing", onSelect: act(() => onOpenSettings("library-layout")) },
      { type: "setting", label: "Default Sort Order", sublabel: "Closest to done, A-Z, newest, oldest", onSelect: act(() => onOpenSettings("library-layout")) },
      { type: "setting", label: "Library View Mode", sublabel: "Grid or list view", onSelect: act(() => onOpenSettings("library-layout")) },
      { type: "setting", label: "Card Size", sublabel: "Small, medium, large cards", onSelect: act(() => onOpenSettings("library-layout")) },
      { type: "setting", label: "Card Spacing", sublabel: "Compact, cozy, roomy", onSelect: act(() => onOpenSettings("library-layout")) },
      // Sub-sections within Theme (additional)
      { type: "setting", label: "Theme Mode", sublabel: "Blurby, dark, light, e-ink, system", onSelect: act(() => onOpenSettings("theme")) },
      { type: "setting", label: "E-Ink Phrase Grouping", sublabel: "2-3 words per tick on e-ink displays", onSelect: act(() => onOpenSettings("theme")) },
      { type: "setting", label: "E-Ink WPM Ceiling", sublabel: "Max reading speed for e-ink", onSelect: act(() => onOpenSettings("theme")) },
      { type: "setting", label: "E-Ink Screen Refresh", sublabel: "Refresh interval for e-ink ghosting", onSelect: act(() => onOpenSettings("theme")) },
      // Sub-sections within Speed Reading (individual settings)
      { type: "setting", label: "Focus Marks", sublabel: "Toggle ORP focus marks", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Reading Ruler", sublabel: "Toggle reading ruler line", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Focus Span", sublabel: "Adjust focus area width", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Words Per Highlight", sublabel: "Flow mode highlight word count", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Flow Cursor Style", sublabel: "Underline or highlight cursor", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Comma Pauses", sublabel: "Pause on commas, colons, semicolons", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Sentence Pauses", sublabel: "Pause at sentence endings", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Paragraph Pauses", sublabel: "Pause at paragraph breaks", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Number Pauses", sublabel: "Pause on numbers", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Long Word Pauses", sublabel: "Pause on words longer than 8 chars", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Enable TTS", sublabel: "Turn text-to-speech on/off", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Voice Engine", sublabel: "System or Kokoro AI voices", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "TTS Voice", sublabel: "Choose narration voice", onSelect: act(() => onOpenSettings("speed-reading")) },
      { type: "setting", label: "Speech Rate", sublabel: "Adjust TTS playback speed", onSelect: act(() => onOpenSettings("speed-reading")) },
      // Sub-sections within Cloud Sync
      { type: "setting", label: "Sync Interval", sublabel: "How often to sync (1/5/15/30 min, manual)", onSelect: act(() => onOpenSettings("cloud-sync")) },
      { type: "setting", label: "Microsoft Account", sublabel: "Connect OneDrive for sync", onSelect: act(() => onOpenSettings("cloud-sync")) },
      { type: "setting", label: "Google Account", sublabel: "Connect Google Drive for sync", onSelect: act(() => onOpenSettings("cloud-sync")) },
      // Connectors
      { type: "setting", label: "Site Login", sublabel: "Add authenticated site for article import", onSelect: act(() => onOpenSettings("connectors")) },
      // Help
      { type: "setting", label: "Check for Updates", sublabel: "Check if a newer version is available", onSelect: act(() => onOpenSettings()) },
      {
        type: "shortcut",
        label: "Shortcut: ? — Show keyboard shortcuts",
        onSelect: () => onClose(),
      },
      {
        type: "shortcut",
        label: "Shortcut: J / K — Navigate library",
        onSelect: () => onClose(),
      },
      {
        type: "shortcut",
        label: "Shortcut: Space — Pause / resume reader",
        onSelect: () => onClose(),
      },
      {
        type: "shortcut",
        label: "Shortcut: G then G — Jump to top",
        onSelect: () => onClose(),
      },
      {
        type: "shortcut",
        label: "Shortcut: G then I — Go to inbox (unread)",
        onSelect: () => onClose(),
      },
      {
        type: "shortcut",
        label: "Shortcut: H — Snooze document",
        onSelect: () => onClose(),
      },
      {
        type: "shortcut",
        label: "Shortcut: L — Tag document",
        onSelect: () => onClose(),
      },
      {
        type: "shortcut",
        label: "Shortcut: ; — Browse highlights",
        onSelect: () => onClose(),
      },
    ];
  }, [onAction, onClose, onOpenSettings]);

  // Build doc items — sublabel includes extra fields for richer fuzzy matching in library mode
  const buildDocItems = useCallback((): PaletteItem[] => {
    return library.map((doc) => ({
      type: "doc" as const,
      label: doc.title,
      sublabel: [
        doc.author,
        doc.authorFull,
        doc.sourceDomain,
        ...(doc.tags ?? []),
      ].filter(Boolean).join(" · "),
      onSelect: () => { onSelect(doc.id); onClose(); },
    }));
  }, [library, onSelect, onClose]);

  // Scored, filtered results — scoped by mode
  const results: PaletteItem[] = useCallback(() => {
    const actions = buildActions();
    const docs = buildDocItems();

    // Pick the candidate pool based on mode
    const pool = mode === "library" ? docs : actions;

    if (!query.trim()) {
      if (mode === "library") {
        // Show first 12 docs when library search is empty
        return docs.slice(0, 12);
      }
      // Show recent actions when command search is empty
      const recent = getRecentActions();
      const recentItems = recent
        .map((label) => actions.find((a) => a.label === label))
        .filter((a): a is PaletteItem => !!a);
      return recentItems.length > 0 ? recentItems : actions.slice(0, 8);
    }

    return pool
      .map((item) => {
        const searchTarget = [item.label, item.sublabel].filter(Boolean).join(" ");
        const score = fuzzyScore(query, searchTarget);
        return { item, score };
      })
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 12);
  }, [query, mode, buildActions, buildDocItems])();

  // Reset focus when results change
  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  // Autofocus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll focused item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const focused = list.children[focusedIndex] as HTMLElement | undefined;
    focused?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = results[focusedIndex];
        if (item) {
          recordRecentAction(item.label);
          item.onSelect();
        }
      }
    },
    [results, focusedIndex, onClose]
  );

  const TYPE_BADGE: Record<PaletteItem["type"], string> = {
    doc: "Doc",
    action: "Action",
    setting: "Setting",
    shortcut: "Shortcut",
  };

  // Close on any click outside the dialog
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => window.addEventListener("click", handler), 50);
    return () => { clearTimeout(timer); window.removeEventListener("click", handler); };
  }, [onClose]);

  useFocusTrap(dialogRef, [results]);

  return createPortal(
    <div
      className="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        ref={dialogRef}
        className="command-palette-container"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="command-palette-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "library"
              ? "Search readings by title, author, source..."
              : "Search actions, settings, shortcuts..."
          }
          role="combobox"
          aria-label="Command palette search"
          aria-expanded={results.length > 0}
          aria-autocomplete="list"
          aria-controls="command-palette-results"
          aria-activedescendant={
            results[focusedIndex] ? `palette-item-${focusedIndex}` : undefined
          }
          spellCheck={false}
          autoComplete="off"
        />

        {results.length === 0 ? (
          <div className="command-palette-empty" role="status">
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <ul
            id="command-palette-results"
            ref={listRef}
            className="command-palette-results"
            role="listbox"
            aria-label="Palette results"
          >
            {results.map((item, i) => (
              <li
                key={`${item.type}-${item.label}-${i}`}
                id={`palette-item-${i}`}
                role="option"
                aria-selected={i === focusedIndex}
                className={[
                  "command-palette-item",
                  i === focusedIndex ? "command-palette-item--focused" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setFocusedIndex(i)}
                onClick={() => {
                  recordRecentAction(item.label);
                  item.onSelect();
                }}
              >
                <span
                  className={`command-palette-badge command-palette-badge--${item.type}`}
                  aria-label={`Type: ${TYPE_BADGE[item.type]}`}
                >
                  {TYPE_BADGE[item.type]}
                </span>
                <span className="command-palette-label">{item.label}</span>
                {item.sublabel && (
                  <span className="command-palette-sublabel">{item.sublabel}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body
  );
}

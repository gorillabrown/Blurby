import React, { useState, useEffect, useRef, useCallback } from "react";
import { BlurbyDoc } from "../types";

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
  onOpenSettings: () => void;
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
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Build action registry
  const buildActions = useCallback((): PaletteItem[] => {
    return [
      {
        type: "action",
        label: "Open Settings",
        sublabel: "Ctrl+,",
        onSelect: () => { onAction(onOpenSettings); onClose(); },
      },
      {
        type: "action",
        label: "Toggle Theme",
        sublabel: "Cycle dark / light / e-ink",
        onSelect: () => {
          onAction(() => {
            window.electronAPI.getState().then(({ settings }) => {
              const themes: Array<"dark" | "light" | "eink" | "system"> = ["dark", "light", "eink", "system"];
              const next = themes[(themes.indexOf(settings.theme) + 1) % themes.length];
              window.electronAPI.saveSettings({ theme: next });
            });
          });
          onClose();
        },
      },
      {
        type: "action",
        label: "Export Library",
        sublabel: "Save library to JSON file",
        onSelect: () => { onAction(() => window.electronAPI.exportLibrary()); onClose(); },
      },
      {
        type: "action",
        label: "Import Library",
        sublabel: "Merge library from JSON file",
        onSelect: () => { onAction(() => window.electronAPI.importLibrary()); onClose(); },
      },
      {
        type: "setting",
        label: "Settings: Cloud Sync",
        sublabel: "Manage OneDrive / Google Drive sync",
        onSelect: () => { onAction(onOpenSettings); onClose(); },
      },
      {
        type: "setting",
        label: "Settings: Reading Speed",
        sublabel: "Adjust WPM and pauses",
        onSelect: () => { onAction(onOpenSettings); onClose(); },
      },
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

  // Build doc items
  const buildDocItems = useCallback((): PaletteItem[] => {
    return library.map((doc) => ({
      type: "doc" as const,
      label: doc.title,
      sublabel: [doc.author || doc.authorFull, doc.sourceDomain].filter(Boolean).join(" · "),
      onSelect: () => { onSelect(doc.id); onClose(); },
    }));
  }, [library, onSelect, onClose]);

  // Scored, filtered results
  const results: PaletteItem[] = useCallback(() => {
    const actions = buildActions();
    const docs = buildDocItems();
    const all = [...docs, ...actions];

    if (!query.trim()) {
      // Show recent actions when query is empty
      const recent = getRecentActions();
      const recentItems = recent
        .map((label) => actions.find((a) => a.label === label))
        .filter((a): a is PaletteItem => !!a);
      return recentItems.length > 0 ? recentItems : actions.slice(0, 8);
    }

    return all
      .map((item) => {
        const searchTarget = [item.label, item.sublabel].filter(Boolean).join(" ");
        const score = fuzzyScore(query, searchTarget);
        return { item, score };
      })
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 12);
  }, [query, buildActions, buildDocItems])();

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

  return (
    <div
      className="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      <div
        className="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="command-palette-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search documents, actions, settings..."
          aria-label="Command palette search"
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
    </div>
  );
}

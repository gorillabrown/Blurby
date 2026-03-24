import React, { useEffect, useCallback, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface ShortcutsOverlayProps {
  onClose: () => void;
  context: string; // "library" | "reader-page" | "reader-rsvp" | "reader-scroll" | "global"
}

interface ShortcutRow {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  contextKey: string;
  rows: ShortcutRow[];
}

const SECTIONS: ShortcutSection[] = [
  {
    title: "Global",
    contextKey: "global",
    rows: [
      { keys: ["Ctrl", "K"], description: "Open command palette" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: [";"], description: "Browse all highlights" },
      { keys: ["Ctrl", "Shift", ","], description: "Quick settings popover" },
      { keys: ["Ctrl", ","], description: "Open full settings" },
      { keys: ["Ctrl", "="], description: "Increase font / WPM" },
      { keys: ["Ctrl", "-"], description: "Decrease font / WPM" },
      { keys: ["Ctrl", "0"], description: "Reset font / WPM to default" },
    ],
  },
  {
    title: "Library",
    contextKey: "library",
    rows: [
      { keys: ["J"], description: "Move focus down" },
      { keys: ["K"], description: "Move focus up" },
      { keys: ["Enter"], description: "Open focused document" },
      { keys: ["X"], description: "Select / deselect document" },
      { keys: ["E"], description: "Archive focused document" },
      { keys: ["Shift", "E"], description: "Unarchive focused document" },
      { keys: ["S"], description: "Star / favorite focused document" },
      { keys: ["#"], description: "Delete focused document" },
      { keys: ["U"], description: "Mark as unread" },
      { keys: ["R"], description: "Reset reading progress" },
      { keys: ["O"], description: "Open source URL in browser" },
      { keys: ["H"], description: "Snooze document" },
      { keys: ["L"], description: "Tag document" },
      { keys: ["V"], description: "Move to collection" },
      { keys: ["/"], description: "Focus search input" },
      { keys: ["Tab"], description: "Cycle library tabs (All / Unread / Favorites / Archive)" },
      { keys: ["Z"], description: "Undo last action" },
      { keys: ["G", "G"], description: "Jump to top of list" },
      { keys: ["G", "I"], description: "Go to inbox (unread)" },
      { keys: ["G", "S"], description: "Go to starred / favorites" },
      { keys: ["G", "A"], description: "Go to archive" },
      { keys: ["G", "Q"], description: "Go to reading queue" },
      { keys: ["Shift", "U"], description: "Mark all selected as unread" },
      { keys: ["Shift", "S"], description: "Star all selected" },
      { keys: ["Shift", "R"], description: "Reset progress for all selected" },
      { keys: ["Shift", "I"], description: "Import document" },
      { keys: ["Ctrl", "↑"], description: "Move document up in queue" },
      { keys: ["Ctrl", "↓"], description: "Move document down in queue" },
      { keys: ["Ctrl", "Shift", "A"], description: "Select all documents" },
    ],
  },
  {
    title: "Reader (Page view)",
    contextKey: "reader-page",
    rows: [
      { keys: ["Space"], description: "Enter Focus mode at highlighted word" },
      { keys: ["Shift", "Space"], description: "Enter Flow mode at highlighted word" },
      { keys: ["←"], description: "Previous page" },
      { keys: ["→"], description: "Next page" },
      { keys: ["Shift", "←"], description: "Move word selection left" },
      { keys: ["Shift", "→"], description: "Move word selection right" },
      { keys: ["Shift", "↑"], description: "Move word selection up" },
      { keys: ["Shift", "↓"], description: "Move word selection down" },
      { keys: ["Shift", "D"], description: "Define selected word" },
      { keys: ["Shift", "N"], description: "Make note on selected word" },
      { keys: ["M"], description: "Toggle menu" },
      { keys: ["↑"], description: "Adjust WPM (+25)" },
      { keys: ["↓"], description: "Adjust WPM (-25)" },
      { keys: ["Shift", "↑"], description: "Adjust WPM (+100)" },
      { keys: ["Shift", "↓"], description: "Adjust WPM (-100)" },
      { keys: ["Escape"], description: "Exit reader" },
    ],
  },
  {
    title: "Reader (Focus mode)",
    contextKey: "reader-rsvp",
    rows: [
      { keys: ["Space"], description: "Pause and return to Page view" },
      { keys: ["←"], description: "Rewind one word" },
      { keys: ["→"], description: "Forward one word" },
      { keys: ["↑"], description: "Adjust WPM (+25)" },
      { keys: ["↓"], description: "Adjust WPM (-25)" },
      { keys: ["Shift", "↑"], description: "Adjust WPM (+100)" },
      { keys: ["Shift", "↓"], description: "Adjust WPM (-100)" },
      { keys: ["S"], description: "Save current word as highlight" },
      { keys: ["M"], description: "Toggle menu" },
      { keys: ["N"], description: "Next chapter" },
      { keys: ["P"], description: "Previous chapter" },
      { keys: ["["], description: "Previous chapter" },
      { keys: ["]"], description: "Next chapter" },
      { keys: ["Ctrl", "="], description: "Increase focus text size" },
      { keys: ["Ctrl", "-"], description: "Decrease focus text size" },
      { keys: ["Ctrl", "0"], description: "Reset focus text size" },
      { keys: ["Escape"], description: "Exit reader" },
    ],
  },
  {
    title: "Reader (Flow mode)",
    contextKey: "reader-scroll",
    rows: [
      { keys: ["Space"], description: "Pause and return to Page view" },
      { keys: ["S"], description: "Save highlighted word" },
      { keys: ["M"], description: "Toggle menu" },
      { keys: ["N"], description: "Next chapter" },
      { keys: ["P"], description: "Previous chapter" },
      { keys: ["["], description: "Previous chapter" },
      { keys: ["]"], description: "Next chapter" },
      { keys: ["↑"], description: "Adjust WPM (+25)" },
      { keys: ["↓"], description: "Adjust WPM (-25)" },
      { keys: ["Shift", "↑"], description: "Adjust WPM (+100)" },
      { keys: ["Shift", "↓"], description: "Adjust WPM (-100)" },
      { keys: ["Escape"], description: "Exit to Page view" },
    ],
  },
  {
    title: "Overlays",
    contextKey: "overlays",
    rows: [
      { keys: ["Escape"], description: "Close any overlay" },
      { keys: ["↑", "↓"], description: "Navigate list items" },
      { keys: ["Enter"], description: "Select focused item" },
      { keys: ["1-5"], description: "Select snooze option (in Snooze picker)" },
    ],
  },
];

// Contexts that map to section contextKeys for highlighting
const CONTEXT_SECTION_MAP: Record<string, string[]> = {
  "library": ["global", "library", "overlays"],
  "reader-page": ["global", "reader-page", "overlays"],
  "reader-rsvp": ["global", "reader-rsvp", "overlays"],
  "reader-scroll": ["global", "reader-scroll", "overlays"],
  "global": ["global"],
};

export default function ShortcutsOverlay({ onClose, context }: ShortcutsOverlayProps) {
  const relevantContexts = CONTEXT_SECTION_MAP[context] ?? ["global"];
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="shortcuts-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="shortcuts-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcuts-header">
          <span className="shortcuts-title">Keyboard Shortcuts</span>
          <button
            className="shortcuts-close"
            onClick={onClose}
            aria-label="Close shortcuts overlay"
            autoFocus
          >
            <span className="shortcuts-key">Esc</span>
          </button>
        </div>

        <div className="shortcuts-body">
          {SECTIONS.map((section) => {
            const isRelevant = relevantContexts.includes(section.contextKey);
            return (
              <section
                key={section.contextKey}
                className={[
                  "shortcuts-section",
                  isRelevant ? "shortcuts-section--relevant" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={section.title}
              >
                <h3 className="shortcuts-section-title">{section.title}</h3>
                <ul className="shortcuts-list">
                  {section.rows.map((row, i) => (
                    <li key={i} className="shortcuts-row">
                      <span className="shortcuts-keys" aria-label={row.keys.join(" + ")}>
                        {row.keys.map((k, ki) => (
                          <React.Fragment key={ki}>
                            {ki > 0 && (
                              <span className="shortcuts-key-sep" aria-hidden="true">
                                {" "}+{" "}
                              </span>
                            )}
                            <kbd className="shortcuts-key">{k}</kbd>
                          </React.Fragment>
                        ))}
                      </span>
                      <span className="shortcuts-desc">{row.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

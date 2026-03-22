import React, { useEffect, useCallback } from "react";

interface ShortcutsOverlayProps {
  onClose: () => void;
  context: string; // "library" | "reader-rsvp" | "reader-scroll" | "global"
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
    title: "Reader (RSVP / Focus mode)",
    contextKey: "reader-rsvp",
    rows: [
      { keys: ["Space"], description: "Pause / resume playback" },
      { keys: ["←"], description: "Step back one word" },
      { keys: ["→"], description: "Step forward one word" },
      { keys: ["↑"], description: "Increase WPM by 10" },
      { keys: ["↓"], description: "Decrease WPM by 10" },
      { keys: ["Shift", "↑"], description: "Increase WPM by 50" },
      { keys: ["Shift", "↓"], description: "Decrease WPM by 50" },
      { keys: ["S"], description: "Save current word as highlight" },
      { keys: ["T"], description: "Toggle reading mode (focus / flow)" },
      { keys: ["Shift", "F"], description: "Toggle fullscreen" },
      { keys: ["["], description: "Previous chapter" },
      { keys: ["]"], description: "Next chapter" },
      { keys: ["N"], description: "Next document in queue" },
      { keys: ["P"], description: "Previous document in queue" },
      { keys: ["Ctrl", "="], description: "Increase focus text size" },
      { keys: ["Ctrl", "-"], description: "Decrease focus text size" },
      { keys: ["Ctrl", "0"], description: "Reset focus text size" },
      { keys: ["Escape"], description: "Exit reader" },
    ],
  },
  {
    title: "Reader (Scroll / Flow mode)",
    contextKey: "reader-scroll",
    rows: [
      { keys: ["Escape", "Escape"], description: "Exit reader (double-press)" },
      { keys: ["S"], description: "Save highlighted word" },
      { keys: ["T"], description: "Toggle reading mode (focus / flow)" },
      { keys: ["Shift", "F"], description: "Toggle fullscreen" },
      { keys: ["["], description: "Previous chapter" },
      { keys: ["]"], description: "Next chapter" },
      { keys: ["N"], description: "Next document in queue" },
      { keys: ["P"], description: "Previous document in queue" },
      { keys: ["Ctrl", "↑"], description: "Scroll up faster" },
      { keys: ["Ctrl", "↓"], description: "Scroll down faster" },
      { keys: ["Tab"], description: "Cycle chapter navigation" },
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
  "reader-rsvp": ["global", "reader-rsvp", "overlays"],
  "reader-scroll": ["global", "reader-scroll", "overlays"],
  "global": ["global"],
};

export default function ShortcutsOverlay({ onClose, context }: ShortcutsOverlayProps) {
  const relevantContexts = CONTEXT_SECTION_MAP[context] ?? ["global"];

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
        className="shortcuts-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcuts-header">
          <span className="shortcuts-title">Keyboard Shortcuts</span>
          <button
            className="shortcuts-close"
            onClick={onClose}
            aria-label="Close shortcuts overlay"
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

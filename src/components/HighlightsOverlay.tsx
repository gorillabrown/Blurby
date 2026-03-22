import { useState, useEffect, useRef, useCallback } from "react";

interface Highlight {
  text: string;
  docTitle: string;
  docId: string;
  wordIndex: number;
  totalWords: number;
  date: string;
}

interface HighlightsOverlayProps {
  onClose: () => void;
  onJumpTo: (docId: string) => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function HighlightsOverlay({ onClose, onJumpTo }: HighlightsOverlayProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    window.electronAPI
      .getAllHighlights()
      .then((data) => {
        // Sort newest first
        const sorted = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHighlights(sorted);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load highlights";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = highlights.filter((h) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      h.text.toLowerCase().includes(q) ||
      h.docTitle.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[focusedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  const handleSelect = useCallback(
    (h: Highlight) => {
      onJumpTo(h.docId);
      onClose();
    },
    [onJumpTo, onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const h = filtered[focusedIndex];
        if (h) handleSelect(h);
      }
    },
    [onClose, filtered, focusedIndex, handleSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="highlights-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="All highlights"
      onClick={onClose}
    >
      <div
        className="highlights-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="highlights-header">
          <span className="highlights-title">Highlights</span>
          <span className="highlights-count" aria-live="polite">
            {loading ? "Loading..." : `${filtered.length} of ${highlights.length}`}
          </span>
        </div>

        <input
          ref={inputRef}
          className="highlights-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search highlights..."
          aria-label="Search highlights"
          aria-autocomplete="list"
          aria-controls="highlights-list"
          aria-activedescendant={
            filtered[focusedIndex] ? `highlight-item-${focusedIndex}` : undefined
          }
          spellCheck={false}
          autoComplete="off"
        />

        {loading && (
          <div className="highlights-status" role="status" aria-live="polite">
            Loading highlights&hellip;
          </div>
        )}

        {error && (
          <div className="highlights-status highlights-status--error" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="highlights-status" role="status">
            {query ? `No highlights matching "${query}"` : "No highlights saved yet"}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul
            id="highlights-list"
            ref={listRef}
            className="highlights-list"
            role="listbox"
            aria-label="Highlights"
          >
            {filtered.map((h, i) => (
              <li
                key={`${h.docId}-${h.wordIndex}-${i}`}
                id={`highlight-item-${i}`}
                role="option"
                aria-selected={i === focusedIndex}
                className={[
                  "highlights-item",
                  i === focusedIndex ? "highlights-item--focused" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setFocusedIndex(i)}
                onClick={() => handleSelect(h)}
              >
                <span className="highlights-item-text">&ldquo;{h.text}&rdquo;</span>
                <span className="highlights-item-meta">
                  <span className="highlights-item-doc">{h.docTitle}</span>
                  <span className="highlights-item-date">{formatDate(h.date)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

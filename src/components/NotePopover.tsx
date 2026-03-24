import { useState, useRef, useEffect, useCallback } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface NotePopoverProps {
  word: string;
  wordIndex: number;
  docId: string;
  docTitle: string;
  author?: string | null;
  sourceUrl?: string | null;
  publishedDate?: string | null;
  position: { x: number; y: number };
  onSave: (note: string) => void;
  onClose: () => void;
}

/** Build an APA-style citation from doc metadata. */
function buildCitation(
  author: string | null | undefined,
  title: string,
  sourceUrl: string | null | undefined,
  publishedDate: string | null | undefined
): string {
  const parts: string[] = [];
  if (author) parts.push(author);
  if (publishedDate) {
    try {
      const d = new Date(publishedDate);
      parts.push(`(${d.getFullYear()}).`);
    } catch {
      parts.push("(n.d.).");
    }
  } else {
    parts.push("(n.d.).");
  }
  parts.push(title + ".");
  if (sourceUrl) parts.push(sourceUrl);
  return parts.join(" ");
}

export default function NotePopover({
  word,
  wordIndex,
  docId,
  docTitle,
  author,
  sourceUrl,
  publishedDate,
  position,
  onSave,
  onClose,
}: NotePopoverProps) {
  const [text, setText] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useFocusTrap(popoverRef);

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const citation = buildCitation(author, docTitle, sourceUrl, publishedDate);

    window.electronAPI.saveReadingNote({
      docId,
      highlight: word,
      note: trimmed,
      citation,
    }).then((result) => {
      if (result?.ok) {
        onSave(trimmed);
      }
    });
  }, [text, word, docId, docTitle, author, sourceUrl, publishedDate, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }, [handleSave, onClose]);

  // Position the popover near the word
  const style: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y + 20, window.innerHeight - 200),
  };

  return (
    <div
      ref={popoverRef}
      className="note-popover"
      style={style}
      role="dialog"
      aria-modal="false"
      aria-label="Add note"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="note-popover-header">
        <span className="note-popover-highlight">&ldquo;{word}&rdquo;</span>
      </div>
      <textarea
        ref={inputRef}
        className="note-popover-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your note..."
        rows={3}
        aria-label="Note text"
      />
      <div className="note-popover-actions">
        <button
          className="note-popover-save"
          onClick={handleSave}
          disabled={!text.trim()}
        >
          Save
        </button>
        <button className="note-popover-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

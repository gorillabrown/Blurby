import { useEffect, useRef } from "react";

interface HighlightMenuProps {
  word: string;
  phrase?: string;
  position: { x: number; y: number };
  onSave: () => void;
  onDefine: () => void;
  onClose: () => void;
  onMakeNote?: () => void;
}

export default function HighlightMenu({ word, phrase, position, onSave, onDefine, onClose, onMakeNote }: HighlightMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Keyboard shortcuts: S=save, D=define, Escape=close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "KeyS" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); onSave(); }
      else if (e.code === "KeyD" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); onDefine(); }
      else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onDefine, onClose]);

  return (
    <div
      ref={menuRef}
      className="highlight-menu"
      style={{
        left: Math.min(position.x, window.innerWidth - 180),
        top: position.y < 120 ? position.y + 30 : position.y - 10,
      }}
      role="menu"
      aria-label="Highlight actions"
    >
      <button className="highlight-menu-btn" onClick={onSave} role="menuitem">
        Save
      </button>
      <button className="highlight-menu-btn" onClick={onDefine} role="menuitem">
        Define
      </button>
      {onMakeNote && (
        <button className="highlight-menu-btn" onClick={onMakeNote} role="menuitem">
          Make Note
        </button>
      )}
      <div className="highlight-menu-caret" aria-hidden="true" />
    </div>
  );
}

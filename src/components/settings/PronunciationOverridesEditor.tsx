import { useState, useCallback } from "react";
import type { PronunciationOverride } from "../../types";
import { MAX_PRONUNCIATION_OVERRIDES } from "../../constants";
import { applyPronunciationOverrides } from "../../utils/pronunciationOverrides";

interface PronunciationOverridesEditorProps {
  globalOverrides: PronunciationOverride[];
  onGlobalChange: (overrides: PronunciationOverride[]) => void;
  bookOverrides?: PronunciationOverride[];
  onBookChange?: (overrides: PronunciationOverride[]) => void;
  activeBookTitle?: string;
}

/** Pronunciation overrides editor with Global / This Book scope toggle (TTS-6I) */
export function PronunciationOverridesEditor({
  globalOverrides,
  onGlobalChange,
  bookOverrides,
  onBookChange,
  activeBookTitle,
}: PronunciationOverridesEditorProps) {
  const hasBookScope = !!onBookChange;
  const [scope, setScope] = useState<"global" | "book">("global");
  const overrides = scope === "book" && bookOverrides ? bookOverrides : globalOverrides;
  const onChange = scope === "book" && onBookChange ? onBookChange : onGlobalChange;

  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [previewText, setPreviewText] = useState("The CEO of NASA gave a TED talk.");
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    if (!newFrom.trim() || overrides.length >= MAX_PRONUNCIATION_OVERRIDES) return;
    const id = `po-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    onChange([...overrides, { id, from: newFrom.trim(), to: newTo.trim(), enabled: true }]);
    setNewFrom("");
    setNewTo("");
  }, [newFrom, newTo, overrides, onChange]);

  const handleRemove = useCallback((id: string) => {
    onChange(overrides.filter(o => o.id !== id));
  }, [overrides, onChange]);

  const handleToggle = useCallback((id: string) => {
    onChange(overrides.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o));
  }, [overrides, onChange]);

  const handleMoveUp = useCallback((idx: number) => {
    if (idx <= 0) return;
    const next = [...overrides];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }, [overrides, onChange]);

  // Preview uses the effective merged set (global + book)
  const effectiveOverrides = hasBookScope && bookOverrides
    ? [...globalOverrides, ...bookOverrides]
    : globalOverrides;

  const handlePreview = useCallback(() => {
    setPreviewResult(applyPronunciationOverrides(previewText, effectiveOverrides));
  }, [previewText, effectiveOverrides]);

  return (
    <>
      <div className="settings-section-label">Pronunciation Overrides</div>
      <div className="tts-pron-intro">
        Replace words before TTS speaks them. Global overrides apply to all books. Book overrides apply only to the current book.
      </div>

      {/* Scope toggle */}
      {hasBookScope && (
        <div className="settings-mode-toggle tts-pron-scope-toggle">
          <button
            className={`settings-mode-btn${scope === "global" ? " active" : ""}`}
            onClick={() => setScope("global")}
          >Global</button>
          <button
            className={`settings-mode-btn${scope === "book" ? " active" : ""}`}
            onClick={() => setScope("book")}
          >{activeBookTitle ? `This Book` : "Book"}</button>
        </div>
      )}
      {scope === "book" && activeBookTitle && (
        <div className="tts-pron-book-note">
          Overrides for: {activeBookTitle}
        </div>
      )}

      {overrides.map((o, idx) => (
        <div key={o.id} className="tts-pron-override-row">
          <button
            onClick={() => handleToggle(o.id)}
            className={`tts-pron-toggle-btn${o.enabled ? " tts-pron-toggle-btn--active" : ""}`}
            title={o.enabled ? "Disable" : "Enable"}
            aria-label={o.enabled ? "Disable override" : "Enable override"}
          >{o.enabled ? "✓" : ""}</button>
          <span
            className={`tts-pron-override-label${o.enabled ? " tts-pron-override-label--active" : ""}`}
          >
            {o.from} → {o.to || "(remove)"}
          </span>
          <button
            onClick={() => handleMoveUp(idx)}
            disabled={idx === 0}
            className="tts-pron-move-up-btn"
            title="Move up"
            aria-label="Move up"
          >↑</button>
          <button
            onClick={() => handleRemove(o.id)}
            className="tts-pron-remove-btn"
            title="Remove"
            aria-label="Remove override"
          >×</button>
        </div>
      ))}

      {overrides.length === 0 && (
        <div className="tts-pron-empty">
          No {scope === "book" ? "book-specific" : "global"} overrides yet.
        </div>
      )}

      {overrides.length < MAX_PRONUNCIATION_OVERRIDES && (
        <div className="tts-pron-add-row">
          <input
            type="text"
            placeholder="From"
            value={newFrom}
            onChange={(e) => setNewFrom(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            className="tts-pron-text-input"
            aria-label="Word to replace"
          />
          <input
            type="text"
            placeholder="Speak as"
            value={newTo}
            onChange={(e) => setNewTo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            className="tts-pron-text-input"
            aria-label="Replacement pronunciation"
          />
          <button
            onClick={handleAdd}
            disabled={!newFrom.trim()}
            className="tts-pron-action-btn"
          >Add</button>
        </div>
      )}

      {/* Preview uses effective merged overrides */}
      <div className="tts-pron-preview-row">
        <input
          type="text"
          value={previewText}
          onChange={(e) => { setPreviewText(e.target.value); setPreviewResult(null); }}
          className="tts-pron-text-input"
          aria-label="Preview text"
        />
        <button
          onClick={handlePreview}
          className="tts-pron-action-btn"
        >Preview</button>
      </div>
      {previewResult !== null && (
        <div className="tts-pron-preview-result">
          TTS will read: "{previewResult}"
        </div>
      )}
    </>
  );
}

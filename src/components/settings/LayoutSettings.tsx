import type { BlurbySettings } from "../../types";

interface LayoutSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function LayoutSettings({ settings, onSettingsChange }: LayoutSettingsProps) {
  const sp = settings.layoutSpacing;

  return (
    <div>
      {/* Text Size (merged from TextSizeSettings) */}
      <div className="settings-section-label">Text Size</div>

      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>
        Focus Reader: {settings.focusTextSize}%
      </div>
      <input
        type="range"
        className="settings-slider"
        min={60}
        max={200}
        step={10}
        value={settings.focusTextSize}
        onChange={(e) => onSettingsChange({ focusTextSize: Number(e.target.value) })}
        aria-label="Focus text size"
      />

      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4, marginTop: 12 }}>
        Flow Reader: {settings.flowTextSize}%
      </div>
      <input
        type="range"
        className="settings-slider"
        min={60}
        max={200}
        step={10}
        value={settings.flowTextSize}
        onChange={(e) => onSettingsChange({ flowTextSize: Number(e.target.value) })}
        aria-label="Flow text size"
      />

      {/* Spacing */}
      <div className="settings-section-label" style={{ marginTop: 20 }}>Spacing</div>

      <div className="settings-toggle-label" style={{ fontSize: 12, marginBottom: 4 }}>
        Line Spacing: {sp.line.toFixed(1)}
      </div>
      <input
        type="range"
        className="settings-slider"
        min={1}
        max={3}
        step={0.1}
        value={sp.line}
        onChange={(e) => onSettingsChange({ layoutSpacing: { ...sp, line: Number(e.target.value) } })}
        aria-label="Line spacing"
      />

      <div className="settings-toggle-label" style={{ fontSize: 12, marginBottom: 4, marginTop: 12 }}>
        Character Spacing: {sp.character.toFixed(1)}px
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={10}
        step={0.5}
        value={sp.character}
        onChange={(e) => onSettingsChange({ layoutSpacing: { ...sp, character: Number(e.target.value) } })}
        aria-label="Character spacing"
      />

      <div className="settings-toggle-label" style={{ fontSize: 12, marginBottom: 4, marginTop: 12 }}>
        Word Spacing: {sp.word.toFixed(1)}px
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={10}
        step={0.5}
        value={sp.word}
        onChange={(e) => onSettingsChange({ layoutSpacing: { ...sp, word: Number(e.target.value) } })}
        aria-label="Word spacing"
      />

      {/* Text Alignment */}
      <div className="settings-section-label" style={{ marginTop: 20 }}>Alignment</div>
      <label className="settings-toggle-row">
        <span className="settings-toggle-label">Justified text</span>
        <input
          type="checkbox"
          className="settings-checkbox"
          checked={settings.justifiedText !== false}
          onChange={(e) => onSettingsChange({ justifiedText: e.target.checked })}
          aria-label="Justified text"
        />
      </label>
    </div>
  );
}

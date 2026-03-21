import type { BlurbySettings } from "../../types";

interface LayoutSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function LayoutSettings({ settings, onSettingsChange }: LayoutSettingsProps) {
  const sp = settings.layoutSpacing;

  return (
    <div>
      <div className="settings-section-label">Spacing</div>

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
    </div>
  );
}

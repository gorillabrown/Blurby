import type { BlurbySettings } from "../../types";

interface TextSizeSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function TextSizeSettings({ settings, onSettingsChange }: TextSizeSettingsProps) {
  return (
    <div>
      <div className="settings-section-label">Focus Reader</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>
        Text size: {settings.focusTextSize}%
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

      <div className="settings-section-label" style={{ opacity: 0.4 }}>Flow Reader</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4, opacity: 0.4 }}>
        Coming soon
      </div>
      <input
        type="range"
        className="settings-slider"
        min={60}
        max={200}
        step={10}
        value={100}
        disabled
        aria-label="Flow text size (coming soon)"
        style={{ opacity: 0.4 }}
      />
    </div>
  );
}

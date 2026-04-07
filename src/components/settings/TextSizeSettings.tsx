import type { BlurbySettings } from "../../types";

interface TextSizeSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function TextSizeSettings({ settings, onSettingsChange }: TextSizeSettingsProps) {
  return (
    <div>
      <div className="settings-section-label">Focus Reader</div>
      <div className="settings-slider-label">
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

      <div className="settings-section-label">Flow Reader</div>
      <div className="settings-slider-label">
        Text size: {settings.flowTextSize}%
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
    </div>
  );
}

import type { BlurbySettings } from "../../types";

const ACCENT_PRESETS = [
  { label: "gold", value: "#c4a882" },
  { label: "blue", value: "#5b8fb9" },
  { label: "green", value: "#6b9f6b" },
  { label: "rose", value: "#c47882" },
  { label: "purple", value: "#9b82c4" },
  { label: "teal", value: "#5ba8a0" },
];

const FONT_PRESETS: { label: string; value: string | null }[] = [
  { label: "system", value: null },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Mono", value: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace" },
  { label: "Literata", value: "'Literata', Georgia, serif" },
  { label: "OpenDyslexic", value: "'OpenDyslexic', sans-serif" },
];

interface ThemeSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function ThemeSettings({ settings, onSettingsChange }: ThemeSettingsProps) {
  const themes: BlurbySettings["theme"][] = ["dark", "light", "eink", "system"];

  const isPresetAccent = ACCENT_PRESETS.some((p) => p.value === settings.accentColor);
  const customColor =
    settings.accentColor && !isPresetAccent ? settings.accentColor : "#888888";

  return (
    <div>
      <div className="settings-section-label">Theme</div>
      <div className="settings-mode-toggle">
        {themes.map((t) => (
          <button
            key={t}
            className={`settings-mode-btn${settings.theme === t ? " active" : ""}`}
            onClick={() => onSettingsChange({ theme: t })}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="settings-section-label">Accent Color</div>
      <div className="appearance-row" style={{ marginBottom: 16 }}>
        {ACCENT_PRESETS.map((preset) => (
          <button
            key={preset.value}
            className={`accent-swatch${settings.accentColor === preset.value ? " accent-swatch-active" : ""}`}
            style={{ background: preset.value }}
            title={preset.label}
            onClick={() => onSettingsChange({ accentColor: preset.value })}
            aria-label={`Accent color: ${preset.label}`}
          />
        ))}
        <label className="accent-custom" title="Custom color">
          <input
            type="color"
            className="accent-color-input"
            value={customColor}
            onChange={(e) => onSettingsChange({ accentColor: e.target.value })}
            aria-label="Custom accent color"
          />
          <span className="accent-custom-label">custom</span>
        </label>
      </div>

      <div className="settings-section-label">Font</div>
      <div className="appearance-row">
        {FONT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            className={`font-preset${settings.fontFamily === preset.value ? " font-preset-active" : ""}`}
            style={preset.value ? { fontFamily: preset.value } : undefined}
            onClick={() => onSettingsChange({ fontFamily: preset.value })}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

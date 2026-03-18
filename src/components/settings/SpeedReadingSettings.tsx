import type { BlurbySettings } from "../../types";

interface SpeedReadingSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function SpeedReadingSettings({ settings, onSettingsChange }: SpeedReadingSettingsProps) {
  return (
    <div>
      <div className="settings-section-label">Reading Mode</div>
      <div className="settings-mode-toggle">
        <button
          className={`settings-mode-btn${settings.readingMode === "focus" ? " active" : ""}`}
          onClick={() => onSettingsChange({ readingMode: "focus" })}
        >
          Focus
        </button>
        <button
          className={`settings-mode-btn${settings.readingMode === "flow" ? " active" : ""}`}
          onClick={() => onSettingsChange({ readingMode: "flow" })}
        >
          Flow
        </button>
      </div>

      <div className="settings-section-label">Focus Mode Options</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Marks</span>
        <div className="settings-toggle disabled" aria-disabled="true">
          <div className="settings-toggle-thumb" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted, #666)", marginBottom: 8 }}>Coming soon</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Reading Ruler</span>
        <div className="settings-toggle disabled" aria-disabled="true">
          <div className="settings-toggle-thumb" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted, #666)", marginBottom: 8 }}>Coming soon</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Span</span>
        <div className="settings-toggle disabled" aria-disabled="true">
          <div className="settings-toggle-thumb" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted, #666)", marginBottom: 8 }}>Coming soon</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Rhythm Pauses</span>
        <div className="settings-toggle disabled" aria-disabled="true">
          <div className="settings-toggle-thumb" />
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted, #666)", marginBottom: 8 }}>Coming soon</div>
    </div>
  );
}

import type { BlurbySettings } from "../../types";

interface SpeedReadingSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function SpeedReadingSettings({ settings, onSettingsChange }: SpeedReadingSettingsProps) {
  const rp = settings.rhythmPauses;

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
        <div
          className={`settings-toggle${settings.focusMarks ? " active" : ""}`}
          onClick={() => onSettingsChange({ focusMarks: !settings.focusMarks })}
          role="switch"
          aria-checked={settings.focusMarks}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Reading Ruler</span>
        <div
          className={`settings-toggle${settings.readingRuler ? " active" : ""}`}
          onClick={() => onSettingsChange({ readingRuler: !settings.readingRuler })}
          role="switch"
          aria-checked={settings.readingRuler}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Span</span>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{Math.round(settings.focusSpan * 100)}%</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0.1}
        max={1}
        step={0.1}
        value={settings.focusSpan}
        onChange={(e) => onSettingsChange({ focusSpan: Number(e.target.value) })}
        aria-label="Focus span"
      />

      <div className="settings-section-label" style={{ marginTop: 16 }}>Rhythm Pauses</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Commas, colons, semicolons</span>
        <div
          className={`settings-toggle${rp.commas ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, commas: !rp.commas } })}
          role="switch"
          aria-checked={rp.commas}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Sentence endings</span>
        <div
          className={`settings-toggle${rp.sentences ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, sentences: !rp.sentences } })}
          role="switch"
          aria-checked={rp.sentences}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Paragraph breaks</span>
        <div
          className={`settings-toggle${rp.paragraphs ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, paragraphs: !rp.paragraphs } })}
          role="switch"
          aria-checked={rp.paragraphs}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Numbers</span>
        <div
          className={`settings-toggle${rp.numbers ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, numbers: !rp.numbers } })}
          role="switch"
          aria-checked={rp.numbers}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Longer words (&gt;8 chars)</span>
        <div
          className={`settings-toggle${rp.longerWords ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, longerWords: !rp.longerWords } })}
          role="switch"
          aria-checked={rp.longerWords}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>
    </div>
  );
}

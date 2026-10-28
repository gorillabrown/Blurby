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

      <div className="settings-section-label settings-section-label--mt">EPUB Renderer</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Use legacy renderer</span>
        <div
          className={`settings-toggle${settings.useLegacyRenderer ? " active" : ""}`}
          onClick={() => onSettingsChange({ useLegacyRenderer: !settings.useLegacyRenderer })}
          role="switch"
          tabIndex={0}
          aria-checked={!!settings.useLegacyRenderer}
          aria-label="Use legacy renderer"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ useLegacyRenderer: !settings.useLegacyRenderer }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>
      <div className="settings-hint">
        Fall back to word-by-word text rendering instead of the EPUB reader.
      </div>

      <div className="settings-section-label">Focus Mode Options</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Marks</span>
        <div
          className={`settings-toggle${settings.focusMarks ? " active" : ""}`}
          onClick={() => onSettingsChange({ focusMarks: !settings.focusMarks })}
          role="switch"
          tabIndex={0}
          aria-checked={settings.focusMarks}
          aria-label="Focus Marks"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ focusMarks: !settings.focusMarks }); } }}
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
          tabIndex={0}
          aria-checked={settings.readingRuler}
          aria-label="Reading Ruler"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ readingRuler: !settings.readingRuler }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Focus Span</span>
        <span className="settings-value-label">{Math.round(settings.focusSpan * 100)}%</span>
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

      <div className="settings-section-label settings-section-label--mt">Flow Mode Options</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Words per highlight</span>
        <span className="settings-value-label">{Math.max(3, settings.flowWordSpan || 3)} words</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={3}
        max={5}
        step={1}
        value={Math.max(3, settings.flowWordSpan || 3)}
        onChange={(e) => onSettingsChange({ flowWordSpan: Number(e.target.value) })}
        aria-label="Flow mode words per highlight"
      />
      <div className="settings-hint">
        How many words the sliding cursor spans. The highlight advances one word at a time.
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Cursor style</span>
        <select
          className="settings-select"
          value={settings.flowCursorStyle || "underline"}
          onChange={(e) => onSettingsChange({ flowCursorStyle: e.target.value as "underline" | "highlight" })}
          aria-label="Flow cursor style"
        >
          <option value="underline">Underline</option>
          <option value="highlight">Highlight</option>
        </select>
      </div>

      {/* TTS-7C: Hide rhythm pause controls when Kokoro is active (BUG-110).
          Kokoro handles prosody natively — these toggles only affect Web Speech
          and non-narration reading modes (Focus, Flow). */}
      {settings.ttsEngine === "kokoro" ? (
        <div className="settings-note settings-note--kokoro">
          Kokoro handles prosody natively. Rhythm pause controls are available when using Web Speech.
        </div>
      ) : (
      <>
      <div className="settings-section-label settings-section-label--mt">Rhythm Pauses</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Commas, colons, semicolons</span>
        <div
          className={`settings-toggle${rp.commas ? " active" : ""}`}
          onClick={() => onSettingsChange({ rhythmPauses: { ...rp, commas: !rp.commas } })}
          role="switch"
          tabIndex={0}
          aria-checked={rp.commas}
          aria-label="Commas, colons, semicolons"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, commas: !rp.commas } }); } }}
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
          tabIndex={0}
          aria-checked={rp.sentences}
          aria-label="Sentence endings"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, sentences: !rp.sentences } }); } }}
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
          tabIndex={0}
          aria-checked={rp.paragraphs}
          aria-label="Paragraph breaks"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, paragraphs: !rp.paragraphs } }); } }}
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
          tabIndex={0}
          aria-checked={rp.numbers}
          aria-label="Numbers"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, numbers: !rp.numbers } }); } }}
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
          tabIndex={0}
          aria-checked={rp.longerWords}
          aria-label="Longer words"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSettingsChange({ rhythmPauses: { ...rp, longerWords: !rp.longerWords } }); } }}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>
      </>
      )}

    </div>
  );
}

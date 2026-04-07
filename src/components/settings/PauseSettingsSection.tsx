import type { BlurbySettings } from "../../types";
import { TTS_PAUSE_COMMA_MS, TTS_PAUSE_CLAUSE_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS, TTS_DIALOGUE_SENTENCE_THRESHOLD, TTS_FOOTNOTE_MODE } from "../../constants";

interface PauseSettingsSectionProps {
  settings: BlurbySettings;
  onTtsChange: (updates: Partial<BlurbySettings>) => void;
}

/** Pause timing controls — comma, clause, sentence, paragraph pauses, dialogue threshold, and footnote mode */
export function PauseSettingsSection({ settings, onTtsChange }: PauseSettingsSectionProps) {
  return (
    <>
      <div className="settings-section-label">Pause Timing</div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Comma pause</span>
        <span className="tts-pause-value">{settings.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={500}
        step={25}
        value={settings.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS}
        onChange={(e) => onTtsChange({ ttsPauseCommaMs: Number(e.target.value) })}
        aria-label="Comma pause duration"
      />

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Clause pause</span>
        <span className="tts-pause-value">{settings.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={500}
        step={25}
        value={settings.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS}
        onChange={(e) => onTtsChange({ ttsPauseClauseMs: Number(e.target.value) })}
        aria-label="Clause pause duration"
      />
      <div className="tts-pause-clause-hint">
        Pause after colons and closing parentheses.
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Sentence pause</span>
        <span className="tts-pause-value">{settings.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={1500}
        step={50}
        value={settings.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS}
        onChange={(e) => onTtsChange({ ttsPauseSentenceMs: Number(e.target.value) })}
        aria-label="Sentence pause duration"
      />

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Paragraph pause</span>
        <span className="tts-pause-value">{settings.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS}ms</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={2000}
        step={50}
        value={settings.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS}
        onChange={(e) => onTtsChange({ ttsPauseParagraphMs: Number(e.target.value) })}
        aria-label="Paragraph pause duration"
      />

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Dialogue threshold</span>
        <span className="tts-pause-value">{settings.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD} sentences</span>
      </div>
      <input
        type="range"
        className="settings-slider"
        min={1}
        max={5}
        step={1}
        value={settings.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD}
        onChange={(e) => onTtsChange({ ttsDialogueSentenceThreshold: Number(e.target.value) })}
        aria-label="Dialogue sentence threshold"
      />
      <div className="tts-pause-dialogue-hint">
        Paragraphs with this many sentences or fewer are treated as dialogue and get a shorter pause.
      </div>

      <div className="settings-toggle-row">
        <span className="settings-toggle-label">Footnotes</span>
        <select
          className="settings-select tts-pause-footnote-select"
          value={settings.ttsFootnoteMode ?? TTS_FOOTNOTE_MODE}
          onChange={(e) => onTtsChange({ ttsFootnoteMode: e.target.value as "skip" | "read" })}
          aria-label="Footnote narration behavior"
        >
          <option value="skip">Skip markers and footnotes</option>
          <option value="read">Read footnote immediately</option>
        </select>
      </div>
      <div className="tts-pause-footnote-hint">
        Default is skip. "Read immediately" inserts the note into narration when the reference is reached.
      </div>
    </>
  );
}

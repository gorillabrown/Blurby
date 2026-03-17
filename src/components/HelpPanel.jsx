import { REWIND_WORDS, WPM_STEP } from "../utils/text";

export default function HelpPanel({ isMac }) {
  return (
    <div className="help-panel">
      <div className="help-panel-title">Keyboard shortcuts</div>
      <div className="help-panel-grid">
        <span className="help-key">Space</span><span>Play / Pause</span>
        <span className="help-key">← / →</span><span>Rewind / Forward {REWIND_WORDS} words</span>
        <span className="help-key">↑ / ↓</span><span>Speed ±{WPM_STEP} wpm</span>
        <span className="help-key">Esc</span><span>Exit reader (auto-saves position)</span>
        <span className="help-key">{isMac ? "⌥" : "Alt"}+V</span><span>Quick-read selected text</span>
      </div>
      <div className="help-panel-section">
        <div className="help-panel-title">Folder sync</div>
        <span>Click "folder" to pick a directory. Files (.txt, .md) are auto-imported and watched for changes.</span>
      </div>
    </div>
  );
}

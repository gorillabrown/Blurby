import { REWIND_WORDS, WPM_STEP } from "../../utils/text";

interface HelpSettingsProps {
  isMac: boolean;
}

export function HelpSettings({ isMac }: HelpSettingsProps) {
  return (
    <div>
      <div className="settings-section-label">Keyboard Shortcuts</div>
      <div className="hotkey-grid" style={{ marginBottom: 20 }}>
        <span className="hotkey-action">Play / Pause</span>
        <span className="hotkey-key">Space</span>
        <span className="hotkey-action">Rewind {REWIND_WORDS} words</span>
        <span className="hotkey-key">&larr;</span>
        <span className="hotkey-action">Forward {REWIND_WORDS} words</span>
        <span className="hotkey-key">&rarr;</span>
        <span className="hotkey-action">Speed +{WPM_STEP} wpm</span>
        <span className="hotkey-key">&uarr;</span>
        <span className="hotkey-action">Speed -{WPM_STEP} wpm</span>
        <span className="hotkey-key">&darr;</span>
        <span className="hotkey-action">Exit reader</span>
        <span className="hotkey-key">Esc (double-tap while playing)</span>
        <span className="hotkey-action">Quick-read selected text</span>
        <span className="hotkey-key">{isMac ? "⌥" : "Alt"}+V</span>
      </div>

      <div className="settings-section-label">Adding Content</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 8px" }}>
          <b>Folder:</b> Pick a directory to auto-import .txt, .md, .epub, .pdf, .html files.
        </p>
        <p style={{ margin: "0 0 8px" }}>
          <b>URL:</b> Paste a web article link to extract readable text.
        </p>
        <p style={{ margin: 0 }}>
          <b>Drop:</b> Drag files onto the window to import.
        </p>
      </div>
    </div>
  );
}

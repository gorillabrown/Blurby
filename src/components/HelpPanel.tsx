import { REWIND_WORDS, WPM_STEP } from "../utils/text";

interface HelpPanelProps {
  isMac: boolean;
}

export default function HelpPanel({ isMac }: HelpPanelProps) {
  return (
    <div className="help-panel" role="complementary" aria-label="Keyboard shortcuts">
      <div className="help-panel-title">Keyboard shortcuts</div>
      <div className="help-panel-grid">
        <span className="help-key">Space</span><span>Play / Pause</span>
        <span className="help-key">&larr; / &rarr;</span><span>Rewind / Forward {REWIND_WORDS} words</span>
        <span className="help-key">&uarr; / &darr;</span><span>Speed &plusmn;{WPM_STEP} wpm</span>
        <span className="help-key">Esc</span><span>Exit reader (double-tap while playing)</span>
        <span className="help-key">{isMac ? "\u2325" : "Alt"}+V</span><span>Quick-read selected text</span>
      </div>
      <div className="help-panel-section">
        <div className="help-panel-title">Adding content</div>
        <span>
          <b>Folder:</b> Pick a directory to auto-import .txt, .md, .epub, .pdf, .html files.{" "}
          <b>URL:</b> Paste a web article link to extract readable text.{" "}
          <b>Drop:</b> Drag files onto the window to import.
        </span>
      </div>
    </div>
  );
}

import type { TtsEngine } from "../../types";

interface TtsEngineSelectorProps {
  engine: TtsEngine;
  qwenDisabled: boolean;
  nanoSelectable: boolean;
  pocketSelectable: boolean;
  onSelect: (engine: TtsEngine) => void;
}

export function TtsEngineSelector({
  engine,
  qwenDisabled,
  nanoSelectable,
  pocketSelectable,
  onSelect,
}: TtsEngineSelectorProps) {
  return (
    <div className="settings-mode-toggle tts-engine-toggle">
      <button
        className={`settings-mode-btn${engine === "qwen" ? " active" : ""}`}
        onClick={() => {}}
        disabled={qwenDisabled}
        aria-disabled={qwenDisabled}
      >
        Qwen AI
      </button>
      <button
        className={`settings-mode-btn${engine === "web" ? " active" : ""}`}
        onClick={() => onSelect("web")}
      >
        System
      </button>
      <button
        className={`settings-mode-btn${engine === "kokoro" ? " active" : ""}`}
        onClick={() => onSelect("kokoro")}
      >
        Kokoro AI (Legacy)
      </button>
      <button
        className={`settings-mode-btn${engine === "nano" ? " active" : ""}`}
        onClick={() => onSelect("nano")}
        disabled={!nanoSelectable}
        aria-disabled={!nanoSelectable}
      >
        Nano AI (Recommended opt-in)
      </button>
      <button
        className={`settings-mode-btn${engine === "pocket-tts" ? " active" : ""}`}
        onClick={() => onSelect("pocket-tts")}
        disabled={!pocketSelectable}
        aria-disabled={!pocketSelectable}
      >
        Pocket TTS (Opt-in)
      </button>
    </div>
  );
}

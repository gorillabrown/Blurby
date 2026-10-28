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
    <div className="settings-mode-toggle tts-engine-toggle" role="group" aria-label="Narration voice engine">
      <button
        className={`settings-mode-btn${engine === "qwen" ? " active" : ""}`}
        onClick={() => {}}
        disabled={qwenDisabled}
        aria-disabled={qwenDisabled}
        aria-pressed={engine === "qwen"}
      >
        Qwen AI (Retired)
      </button>
      <button
        className={`settings-mode-btn${engine === "web" ? " active" : ""}`}
        onClick={() => onSelect("web")}
        aria-pressed={engine === "web"}
      >
        System
      </button>
      <button
        className={`settings-mode-btn${engine === "kokoro" ? " active" : ""}`}
        onClick={() => onSelect("kokoro")}
        aria-pressed={engine === "kokoro"}
      >
        Kokoro (Default)
      </button>
      <button
        className={`settings-mode-btn${engine === "nano" ? " active" : ""}`}
        onClick={() => onSelect("nano")}
        disabled={!nanoSelectable}
        aria-disabled={!nanoSelectable}
        aria-pressed={engine === "nano"}
      >
        MOSS-Nano (Recommended opt-in)
      </button>
      <button
        className={`settings-mode-btn${engine === "pocket-tts" ? " active" : ""}`}
        onClick={() => onSelect("pocket-tts")}
        disabled={!pocketSelectable}
        aria-disabled={!pocketSelectable}
        aria-pressed={engine === "pocket-tts"}
      >
        Pocket TTS (Opt-in)
      </button>
    </div>
  );
}

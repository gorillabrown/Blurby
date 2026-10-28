import type { TtsEngine } from "../../types";
import { getTtsProviderOrThrow } from "../../utils/ttsProviderRegistry";

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
  const providers = (["qwen", "web", "kokoro", "nano", "pocket-tts"] as const).map(getTtsProviderOrThrow);
  const disabledByEngine = (id: TtsEngine) => {
    if (id === "qwen") return qwenDisabled;
    if (id === "nano") return !nanoSelectable;
    if (id === "pocket-tts") return !pocketSelectable;
    return false;
  };

  return (
    <div className="settings-mode-toggle tts-engine-toggle" role="group" aria-label="Narration voice engine">
      {providers.map((provider) => {
        const disabled = disabledByEngine(provider.id) || !provider.capabilities.selectable;
        return (
          <button
            key={provider.id}
            className={`settings-mode-btn${engine === provider.id ? " active" : ""}`}
            onClick={() => {
              if (!disabled) onSelect(provider.id);
            }}
            disabled={disabled}
            aria-disabled={disabled}
            aria-pressed={engine === provider.id}
          >
            {provider.copy.buttonLabel}
          </button>
        );
      })}
    </div>
  );
}

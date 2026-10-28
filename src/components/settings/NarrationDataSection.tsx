import type { BlurbySettings } from "../../types";
import { exportNarrationData, validateNarrationImport, applyNarrationImport, resetNarrationData } from "../../utils/narrationPortability";

interface NarrationDataSectionProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

export function NarrationDataSection({
  settings,
  onSettingsChange,
}: NarrationDataSectionProps) {
  const profiles = settings.narrationProfiles || [];

  return (
    <>
      <div className="settings-section-label">Narration Data</div>
      <div className="tts-data-action-row">
        <button
          className="settings-btn-secondary tts-data-action-btn"
          onClick={() => {
            const payload = exportNarrationData(settings);
            const json = JSON.stringify(payload, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `blurby-narration-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export
        </button>
        <button
          className="settings-btn-secondary tts-data-action-btn"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                const validation = validateNarrationImport(data, settings);
                if (!validation.valid) {
                  alert("Import failed:\n" + validation.errors.join("\n"));
                  return;
                }
                const msg = `Import ${validation.profileCount} profile(s) and ${validation.overrideCount} override(s)?`
                  + (validation.warnings.length > 0 ? "\n\n" + validation.warnings.join("\n") : "");
                if (!confirm(msg)) return;
                const updates = applyNarrationImport(data, settings, "merge");
                onSettingsChange(updates);
              } catch {
                alert("Import failed: invalid JSON file.");
              }
            };
            input.click();
          }}
        >
          Import
        </button>
      </div>
      <div className="tts-data-hint">
        Export or import narration profiles and pronunciation overrides as JSON.
      </div>
      <div className="tts-data-reset-row">
        {profiles.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Delete all narration profiles? This cannot be undone.")) {
                onSettingsChange(resetNarrationData("profiles"));
              }
            }}
            className="tts-data-reset-btn"
          >
            Reset profiles
          </button>
        )}
        {(settings.pronunciationOverrides?.length ?? 0) > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all global pronunciation overrides? This cannot be undone.")) {
                onSettingsChange(resetNarrationData("overrides"));
              }
            }}
            className="tts-data-reset-btn"
          >
            Reset overrides
          </button>
        )}
      </div>
    </>
  );
}

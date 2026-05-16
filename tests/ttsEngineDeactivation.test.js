import { createRequire } from "module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const migrations = require("../main/migrations.js");

describe("TTS engine deactivation migration", () => {
  it("migrates persisted dormant engine settings to selectable Kokoro", () => {
    const settings = {
      schemaVersion: 11,
      ttsEngine: "nano",
      ttsVoiceName: "default",
      narrationProfiles: [
        { id: "np-qwen", name: "Old Qwen", ttsEngine: "qwen", ttsVoiceName: "Ryan" },
        { id: "np-nano", name: "Old Nano", ttsEngine: "nano", ttsVoiceName: "default" },
        { id: "np-pocket", name: "Old Pocket", ttsEngine: "pocket-tts", ttsVoiceName: "default" },
        { id: "np-kokoro", name: "Kokoro", ttsEngine: "kokoro", ttsVoiceName: "af_bella" },
      ],
    };

    const migrated = migrations.runMigrations(
      settings,
      migrations.settingsMigrations,
      migrations.CURRENT_SETTINGS_SCHEMA,
    );

    expect(migrations.CURRENT_SETTINGS_SCHEMA).toBeGreaterThanOrEqual(12);
    expect(migrated.ttsEngine).toBe("kokoro");
    expect(migrated.ttsVoiceName).toBeNull();
    expect(migrated.narrationProfiles[0]).toMatchObject({
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });
    expect(migrated.narrationProfiles[1]).toMatchObject({
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });
    expect(migrated.narrationProfiles[2]).toMatchObject({
      ttsEngine: "kokoro",
      ttsVoiceName: null,
    });
    expect(migrated.narrationProfiles[3]).toMatchObject({
      ttsEngine: "kokoro",
      ttsVoiceName: "af_bella",
    });
  });
});

import { createRequire } from "module";
import { describe, expect, it } from "vitest";

// NARRATE-REMOVE-1, Done-when 6 (F1, migration v13): positive control (LL-138).
// Fails on the base (CURRENT_SETTINGS_SCHEMA is 12, there is no v12 -> v13 entry)
// and passes once the v13 migration lands.

const require = createRequire(import.meta.url);
const migrations = require("../main/migrations.js");
const { CURRENT_SETTINGS_SCHEMA, settingsMigrations, runMigrations } = migrations;

const upgrade = (data) => runMigrations(data, settingsMigrations, CURRENT_SETTINGS_SCHEMA);

// A realistic v12 profile: every narration-adjacent field the migration must leave alone.
function v12Full() {
  return {
    schemaVersion: 12,
    readingMode: "narrate",
    lastReadingMode: "narrate",
    isNarrating: true,
    ttsEngine: "kokoro",
    ttsVoiceName: "af_bella",
    ttsRate: 1.25,
    pronunciationOverrides: { Blurby: "blur-bee", GIF: "jif" },
    narrationProfiles: [
      { id: "np-1", name: "Evening", ttsEngine: "kokoro", ttsVoiceName: "af_bella", ttsRate: 1.1 },
    ],
    wpm: 300,
  };
}

describe("settings migration v12 -> v13 (Narrate removed)", () => {
  it("bumps the settings schema to 13 with a v12 -> v13 entry", () => {
    expect(CURRENT_SETTINGS_SCHEMA).toBe(13);
    expect(settingsMigrations.length).toBe(13);
  });

  it("(a) migrates a saved narrate mode to flow and stamps schemaVersion 13", () => {
    const migrated = upgrade({ schemaVersion: 12, readingMode: "narrate", lastReadingMode: "narrate" });
    expect(migrated.readingMode).toBe("flow");
    expect(migrated.lastReadingMode).toBe("flow");
    expect(migrated.schemaVersion).toBe(13);
  });

  it("(b) leaves page and focus modes unchanged", () => {
    const migrated = upgrade({ schemaVersion: 12, readingMode: "page", lastReadingMode: "focus" });
    expect(migrated.readingMode).toBe("page");
    expect(migrated.lastReadingMode).toBe("focus");
    expect(migrated.schemaVersion).toBe(13);
  });

  it("(c) leaves narration and TTS preferences deep-equal before and after", () => {
    // structuredClone first: the migrations mutate their input in place.
    const before = structuredClone(v12Full());
    const migrated = upgrade(v12Full());
    expect(migrated.schemaVersion).toBe(13);
    for (const key of [
      "isNarrating",
      "ttsEngine",
      "ttsVoiceName",
      "ttsRate",
      "pronunciationOverrides",
      "narrationProfiles",
    ]) {
      expect(migrated[key], key).toEqual(before[key]);
    }
  });

  it("(d) a repeat run on the v13 result returns it deep-equal", () => {
    const v13 = upgrade(v12Full());
    expect(v13.schemaVersion).toBe(13);
    const snapshot = structuredClone(v13);
    const again = upgrade(v13);
    expect(again).toEqual(snapshot);
    expect(again.readingMode).toBe("flow");
  });

  it("(e) downgrade: the reverted runner (first 12 migrations, target 12) leaves the v13 result alone", () => {
    const v13 = upgrade(v12Full());
    const snapshot = structuredClone(v13);
    const down = runMigrations(v13, settingsMigrations.slice(0, 12), 12);
    expect(down).toEqual(snapshot);
    expect(down.schemaVersion).toBe(13);
    expect(down.readingMode).toBe("flow");
    expect(down.lastReadingMode).toBe("flow");
  });
});

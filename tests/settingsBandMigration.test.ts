import { createRequire } from "module";
import { describe, expect, it } from "vitest";

// BAND-ALIGN-2 R8 (owner ruling 2026-10-30; Blurby.Brain1 ruling 4): the band covers the cursor's paragraph and the Lines
// count is dropped. Settings schema v13 → v14 turns flowZoneLines into flowBandEnabled: a stored Off (0) stays off, any
// line count is on, and a file without flowZoneLines gains no key (absent = on). Main stores flowBandEnabled, not
// flowZoneLines (s1–s6); a first-run settings.json is unchanged (t4c, control).
const require = createRequire(import.meta.url);
const { SETTINGS_DEFAULTS, loadSettingsData, pickUserSettings } = require("../main/migrations.js");

// JSON.stringify(SETTINGS_DEFAULTS) without schemaVersion on R8's base (R7a tip 3977540e): undefined keys are dropped.
const TIP_DEFAULTS_JSON = '{"wpm":300,"focusTextSize":100,"sourceFolder":null,"folderName":"My reading list","recentFolders":[],"theme":"dark","launchAtLogin":false,"accentColor":null,"fontFamily":null,"compactMode":false,"readingMode":"focus","focusMarks":true,"readingRuler":false,"focusSpan":0.4,"flowTextSize":100,"rhythmPauses":{"commas":true,"sentences":true,"paragraphs":true,"numbers":false,"longerWords":false},"layoutSpacing":{"line":1.5,"character":0,"word":0},"initialPauseMs":3000,"punctuationPauseMs":1000,"viewMode":"list","einkMode":false,"einkWpmCeiling":250,"einkRefreshInterval":20,"einkPhraseGrouping":true,"ttsEnabled":false,"ttsEngine":"kokoro","ttsVoiceName":null,"ttsRate":1,"syncIntervalMinutes":5,"syncOnMeteredConnection":false,"readingGoals":[]}';

// SETTINGS-KEY-TRUST-1's PRE_ITEM_MAIN_DEFAULTS shape at schema 13.
const V13 = {
  schemaVersion: 13, wpm: 300, focusTextSize: 100,
  sourceFolder: null, folderName: "My reading list", recentFolders: [],
  theme: "dark", launchAtLogin: false, accentColor: null, fontFamily: null,
  compactMode: false, readingMode: "focus", focusMarks: true, readingRuler: false,
  focusSpan: 0.4, flowTextSize: 100,
  rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
  layoutSpacing: { line: 1.5, character: 0, word: 0 },
  initialPauseMs: 3000, punctuationPauseMs: 1000, viewMode: "list",
  einkMode: false, einkWpmCeiling: 250, einkRefreshInterval: 20, einkPhraseGrouping: true,
  ttsEnabled: false, ttsEngine: "kokoro", ttsVoiceName: null, ttsRate: 1.0,
  syncIntervalMinutes: 5, syncOnMeteredConnection: false,
  readingGoals: [],
};

describe("BAND-ALIGN-2 R8: settings v13 → v14 (flowZoneLines → flowBandEnabled)", () => {
  it("(s1) Off stays off", () => {
    const out = loadSettingsData({ schemaVersion: 13, flowZoneLines: 0 });
    expect({ flowBandEnabled: out.flowBandEnabled, hasLines: Object.hasOwn(out, "flowZoneLines"), schemaVersion: out.schemaVersion })
      .toEqual({ flowBandEnabled: false, hasLines: false, schemaVersion: 14 });
  });

  it("(s2) a line count is on: 3, 5, 7 and a legacy 6", () => {
    for (const lines of [3, 5, 7, 6]) {
      const out = loadSettingsData({ schemaVersion: 13, flowZoneLines: lines });
      expect({ flowBandEnabled: out.flowBandEnabled, hasLines: Object.hasOwn(out, "flowZoneLines") }, `lines ${lines}`)
        .toEqual({ flowBandEnabled: true, hasLines: false });
    }
  });

  it("(s3) no old key, no new key", () => {
    const out = loadSettingsData({ schemaVersion: 13, wpm: 300 });
    expect({ hasBand: Object.hasOwn(out, "flowBandEnabled"), wpm: out.wpm, schemaVersion: out.schemaVersion })
      .toEqual({ hasBand: false, wpm: 300, schemaVersion: 14 });
  });

  it("(s4) an old settings file loads cleanly", () => {
    const input = { ...structuredClone(V13), flowZonePosition: 1 / 3, flowZoneLines: 7 };
    const expected: Record<string, unknown> = { ...structuredClone(input), flowBandEnabled: true, schemaVersion: 14 };
    delete expected.flowZoneLines;
    let out: Record<string, unknown> = {};
    expect(() => { out = loadSettingsData(input); }).not.toThrow();
    expect(out).toEqual(expected);
    expect(Object.hasOwn(out, "flowZoneLines")).toBe(false);
    const picked = pickUserSettings(out);
    expect({ flowBandEnabled: picked.flowBandEnabled, flowZonePosition: picked.flowZonePosition }).toEqual({ flowBandEnabled: true, flowZonePosition: 1 / 3 });
  });

  it("(s5) the oldest file runs every migration and keeps Off", () => {
    const out = loadSettingsData({ flowZoneLines: 0 });
    expect({ flowBandEnabled: out.flowBandEnabled, schemaVersion: out.schemaVersion }).toEqual({ flowBandEnabled: false, schemaVersion: 14 });
  });

  it("(s6) main stores flowBandEnabled, not flowZoneLines", () => {
    expect(Object.hasOwn(SETTINGS_DEFAULTS, "flowBandEnabled")).toBe(true);
    expect(Object.hasOwn(SETTINGS_DEFAULTS, "flowZoneLines")).toBe(false);
    expect(Object.hasOwn(pickUserSettings({ flowZoneLines: 3 }), "flowZoneLines")).toBe(false);
  });

  it("(t4c) control: a first-run settings.json is byte-identical", () => {
    const { schemaVersion: _v, ...rest } = SETTINGS_DEFAULTS;
    expect(JSON.stringify(rest)).toBe(TIP_DEFAULTS_JSON);
  });
});

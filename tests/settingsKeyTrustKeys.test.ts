import { createRequire } from "module";
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import type { BlurbySettings } from "../src/types";

// SETTINGS-KEY-TRUST-1: save-settings and cloud sync take only SETTINGS_DEFAULTS' keys (main/migrations.js).
// TYPE_KEYS is checked by the compiler: typecheck fails when BlurbySettings gains or loses a key until this list
// changes, and (t1) then fails until main has the key, so a new setting cannot be dropped silently.
const require = createRequire(import.meta.url);
const { SETTINGS_DEFAULTS, CURRENT_SETTINGS_SCHEMA } = require("../main/migrations.js");

const TYPE_KEYS = {
  schemaVersion: true, wpm: true, focusWpm: true, flowWpm: true, sourceFolder: true, folderName: true,
  recentFolders: true, theme: true, launchAtLogin: true, focusTextSize: true, accentColor: true, fontFamily: true,
  compactMode: true, readingMode: true, focusMarks: true, readingRuler: true, focusSpan: true, flowTextSize: true,
  rhythmPauses: true, layoutSpacing: true, justifiedText: true, initialPauseMs: true, punctuationPauseMs: true,
  viewMode: true, flowWordSpan: true, flowCursorStyle: true, flowZonePosition: true, flowZoneLines: true,
  einkMode: true, einkWpmCeiling: true, einkRefreshInterval: true, einkPhraseGrouping: true,
  ttsEnabled: true, ttsEngine: true, ttsVoiceName: true, ttsRate: true,
  ttsPauseCommaMs: true, ttsPauseClauseMs: true, ttsPauseSentenceMs: true, ttsPauseParagraphMs: true,
  ttsDialogueSentenceThreshold: true, ttsFootnoteMode: true, lastReadingMode: true, isNarrating: true,
  syncIntervalMinutes: true, syncOnMeteredConnection: true, firstRunCompleted: true, defaultSort: true,
  defaultViewMode: true, libraryCardSize: true, libraryCardSpacing: true, useLegacyRenderer: true,
  ttsCacheEnabled: true, pronunciationOverrides: true, narrationProfiles: true, activeNarrationProfileId: true,
  readingGoals: true,
} satisfies Record<keyof BlurbySettings, true>;
const UNTYPED_UI_KEYS = ["sortBy"];

// main.js's settings literal before this item; a first-run settings.json must stay byte-identical (ruled).
const PRE_ITEM_MAIN_DEFAULTS = {
  schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100,
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

describe("SETTINGS-KEY-TRUST-1 main's settings keys", () => {
  const mainKeys = () => new Set(Object.keys(SETTINGS_DEFAULTS));

  it("(t1) every BlurbySettings key is one of main's settings keys", () => {
    expect(Object.keys(TYPE_KEYS).filter((k) => !mainKeys().has(k))).toEqual([]);
  });

  it("(t2) every renderer DEFAULT_SETTINGS key is one of main's settings keys", () => {
    expect(Object.keys(DEFAULT_SETTINGS).filter((k) => !mainKeys().has(k))).toEqual([]);
  });

  it("(t3) main has no other key, no _-prefixed key and no prototype name", () => {
    const allowed = new Set([...Object.keys(TYPE_KEYS), ...UNTYPED_UI_KEYS]);
    const keys = Object.keys(SETTINGS_DEFAULTS);
    expect(keys.filter((k) => !allowed.has(k))).toEqual([]);
    expect(keys.filter((k) => k.startsWith("_") || ["__proto__", "constructor", "prototype"].includes(k))).toEqual([]);
    expect(Object.getPrototypeOf(SETTINGS_DEFAULTS)).toBe(Object.prototype);
  });

  it("(t4) a first-run settings.json is byte-identical to before this item", () => {
    expect(JSON.stringify(SETTINGS_DEFAULTS)).toBe(JSON.stringify(PRE_ITEM_MAIN_DEFAULTS));
  });
});

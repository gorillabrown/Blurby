// Model of spec ROADMAP.md:466-468 appended to the real main/migrations.js; simulates a crash after migration, before write.
const assert = require("assert");
const m = require(process.argv[2]);
function normalizeReaderModes(d) { let c = false; for (const k of ["readingMode", "lastReadingMode"]) if (d[k] === "narrate") { d[k] = "flow"; c = true; } return c; }
const migs = [...m.settingsMigrations, (d) => { normalizeReaderModes(d); d.schemaVersion = 13; return d; }];
const loadSettingsData = (raw) => { const s = m.runMigrations(raw, migs, 13); normalizeReaderModes(s); return s; };
const diskV12 = JSON.stringify({ schemaVersion: 12, readingMode: "narrate", lastReadingMode: "narrate", ttsRate: 1.2, wpm: 300 });
const launch1 = loadSettingsData(JSON.parse(diskV12)); // crash here: write never completes, disk unchanged
const launch2 = loadSettingsData(JSON.parse(diskV12)); // next launch re-reads the same v12 bytes
assert.deepStrictEqual(launch2, launch1);
console.log("rerun after lost write identical:", JSON.stringify(launch2));
const diskV13Narrate = { schemaVersion: 13, readingMode: "narrate", lastReadingMode: "narrate" };
console.log("schema-13 file still holding narrate normalizes every load:", JSON.stringify(loadSettingsData(diskV13Narrate)));
console.log("real settingsMigrations length (v0..v12 entries):", m.settingsMigrations.length, "CURRENT:", m.CURRENT_SETTINGS_SCHEMA);

const assert = require("assert");
function normalizeReaderModes(data) { let c = false; for (const k of ["readingMode", "lastReadingMode"]) if (data[k] === "narrate") { data[k] = "flow"; c = true; } return c; } // ROADMAP.md:466
function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, data); normalizeReaderModes(settings); ctx.saveSettings(); return settings; } // ROADMAP.md:473 verbatim
const s = { schemaVersion: 13, lastReadingMode: "flow", wpm: 300 }, saved = [];
applyCloudSettings({ getSettings: () => s, saveSettings: () => saved.push(structuredClone(s)) }, { lastReadingMode: "narrate", fontSize: 20 });
assert.strictEqual(saved.length, 1);
assert.deepStrictEqual(saved[0], { schemaVersion: 13, lastReadingMode: "flow", wpm: 300, fontSize: 20 });
console.log("Done-when 7(b) satisfied by prescribed helper");

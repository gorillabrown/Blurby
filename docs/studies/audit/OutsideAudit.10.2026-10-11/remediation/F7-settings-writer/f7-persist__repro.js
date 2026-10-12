// F7 reproduction: evaluates the verbatim main.js source of writeJSON (55-60),
// saveSettingsFn (130) and loadState's settings half (289-293) with injected fakes.
// Usage: node repro.js <path-to-main.js> <scratch-dir-for-real-fs-control>
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const lines = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const L = (a, b) => lines.slice(a - 1, b).join("\n");
const writeJSONSrc = L(55, 60);
const saveSrc = L(130, 130);
const loadStateSrc = L(289, 293) + "\n}";
assert(writeJSONSrc.startsWith("async function writeJSON(filepath, data) {"));
assert(writeJSONSrc.trimEnd().endsWith("}"));
assert.strictEqual(saveSrc, "function saveSettingsFn() { writeJSON(getSettingsPath(), settings); }");
assert(loadStateSrc.startsWith("async function loadState() {"));
assert(lines[292].trim() === "await saveSettingsFn();");
console.log("extracted main.js:55-60, 130, 289-293 verbatim");

const FIXED_SAVE = "function saveSettingsFn() { return writeJSON(getSettingsPath(), settings); }";

function build(fsPromises, events, saveVariant) {
  const body = `
    let settings = {};
    const CURRENT_SETTINGS_SCHEMA = 13;
    const settingsMigrations = [];
    function getSettingsPath() { return "FAKE/settings.json"; }
    async function readJSON() { return { schemaVersion: 13, readingMode: "narrate", lastReadingMode: "narrate", wpm: 300 }; }
    async function backupFile() { events.push("backup"); }
    // stands in for the proposed loadSettingsData (normalize after migrations)
    function runMigrations(s) { for (const k of ["readingMode", "lastReadingMode"]) if (s[k] === "narrate") s[k] = "flow"; return s; }
    ${writeJSONSrc}
    ${saveVariant || saveSrc}
    ${loadStateSrc}
    return { writeJSON, saveSettingsFn, loadState, getSettings: () => settings };
  `;
  return new Function("fsPromises", "events", body)(fsPromises, events);
}

function fakeFs(mode, events) {
  let release;
  const gate = new Promise((r) => (release = r));
  const written = [];
  return {
    written,
    release: () => release(),
    fs: {
      writeFile: async (_p, data) => {
        events.push("write-start");
        written.push(data);
        if (mode === "reject") throw Object.assign(new Error("EACCES: fake"), { code: "EACCES" });
        if (mode === "deferred") await gate;
        events.push("write-done");
      },
      rename: async () => { events.push("rename-done"); },
    },
  };
}

const tick = () => new Promise((r) => setImmediate(r));
const unhandled = [];
process.on("unhandledRejection", (e) => unhandled.push(e && e.code));

(async () => {
  // C1: return value of the production saveSettingsFn
  {
    const ev = []; const f = fakeFs("immediate", ev);
    const api = build(f.fs, ev);
    const ret = api.saveSettingsFn();
    console.log("C1 saveSettingsFn() returns:", ret === undefined ? "undefined" : typeof ret);
    await tick();
  }
  // C2: production loadState await vs deferred write completion
  {
    const ev = []; const f = fakeFs("deferred", ev);
    const api = build(f.fs, ev);
    await api.loadState();
    ev.push("loadState-resolved");
    const atResolve = ev.slice();
    f.release(); await tick(); await tick();
    console.log("C2 events at loadState resolve:", JSON.stringify(atResolve));
    console.log("C2 events after release:       ", JSON.stringify(ev));
  }
  // C3: serialization snapshot timing (what the clone sink actually models)
  {
    const ev = []; const f = fakeFs("deferred", ev);
    const api = build(f.fs, ev);
    await api.loadState();
    api.getSettings().wpm = 999; // mutate after save call, before write completes
    f.release(); await tick(); await tick();
    const persisted = JSON.parse(f.written[0]);
    console.log("C3 bytes handed to writeFile:", JSON.stringify(persisted), "| in-memory wpm now:", api.getSettings().wpm);
  }
  // C4: write failure with production code
  {
    const ev = []; const f = fakeFs("reject", ev);
    const api = build(f.fs, ev);
    let threw = null;
    try { await api.loadState(); } catch (e) { threw = e.code; }
    await tick(); await tick();
    console.log("C4 loadState threw:", threw, "| unhandledRejection codes:", JSON.stringify(unhandled));
    unhandled.length = 0;
  }
  // C5: positive control, one-word fix (return the promise)
  {
    const ev = []; const f = fakeFs("deferred", ev);
    const api = build(f.fs, ev, FIXED_SAVE);
    const p = api.loadState().then(() => ev.push("loadState-resolved"));
    await tick(); const before = ev.slice();
    f.release(); await p;
    console.log("C5 fixed: before release:", JSON.stringify(before), "| final:", JSON.stringify(ev));
    const ev2 = []; const f2 = fakeFs("reject", ev2);
    const api2 = build(f2.fs, ev2, FIXED_SAVE);
    let threw = null;
    try { await api2.loadState(); } catch (e) { threw = e.code; }
    await tick(); await tick();
    console.log("C5 fixed failure: loadState threw:", threw, "| unhandledRejection codes:", JSON.stringify(unhandled));
    unhandled.length = 0;
  }
  // C6: real filesystem, overlapping un-awaited writes to one path (existing behavior)
  {
    const dir = process.argv[3];
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, "settings.json");
    const real = require("fs/promises");
    const api = build(real, []);
    const tally = {};
    let badFinal = 0;
    for (let round = 0; round < 20; round++) {
      const big = "x".repeat(200000);
      const res = await Promise.allSettled(
        Array.from({ length: 8 }, (_, i) => api.writeJSON(target, { round, i, big }))
      );
      for (const r of res) {
        const k = r.status === "fulfilled" ? "ok" : (r.reason.code || "err");
        tally[k] = (tally[k] || 0) + 1;
      }
      try { JSON.parse(fs.readFileSync(target, "utf8")); } catch { badFinal++; }
    }
    console.log("C6 real-fs 20 rounds x 8 overlapping writeJSON: outcomes", JSON.stringify(tally), "| unparseable final files:", badFinal);
  }
})();

const Module = require("module"); const assert = require("assert"); const path = require("path");
const orig = Module._load; let handlers, timers, saved, enq;
function load(file) {
  handlers = new Map(); timers = []; saved = []; enq = [];
  Module._load = function (req, parent, isMain) {
    if (req === "electron") return { ipcMain: { handle: (c, h) => handlers.set(c, h) } };
    if (req === "../window-manager") return { getSystemTheme: () => "light", updateWindowTheme: () => {} };
    if (req === "../sync-engine") return { getSyncStatus: () => ({ revision: 7 }) };
    if (req === "../sync-queue") return { enqueue: async (op, p) => { enq.push([op, p]); } };
    return orig.call(this, req, parent, isMain);
  };
  const p = path.resolve(file); delete require.cache[p];
  const realST = global.setTimeout; global.setTimeout = (fn) => { timers.push(fn); return 0; };
  const s = { schemaVersion: 13, readingMode: "flow", lastReadingMode: "focus", wpm: 300, ttsVoiceName: "af_bella" };
  require(p).register({ getSettings: () => s, getLibrary: () => [], getMainWindow: () => null, saveSettings: () => saved.push(structuredClone(s)) });
  return { s, restore: () => { global.setTimeout = realST; Module._load = orig; } };
}
const out = {};
for (const [label, file] of [["base", "main/ipc/state.js"], ["fixed", "main/ipc/state.fixed.js"]]) {
  const { s, restore } = load(file);
  handlers.get("save-settings")({}, { readingMode: "narrate", lastReadingMode: "narrate", wpm: 410 });
  const getState = handlers.get("get-state")().settings;
  const before = structuredClone(getState);
  timers.at(-1)();
  restore();
  out[label] = { getStateBeforeDebounce: before, saved, enq };
}
console.log(JSON.stringify(out, null, 1));
assert.equal(out.base.saved[0].readingMode, "narrate");
assert.deepStrictEqual(out.fixed.saved, [{ schemaVersion: 13, readingMode: "flow", lastReadingMode: "flow", wpm: 410, ttsVoiceName: "af_bella" }]);
assert.equal(out.fixed.getStateBeforeDebounce.readingMode, "flow");
console.log("self-check: base persists narrate (omission control fails); fixed persists flow/flow with unrelated keys kept");

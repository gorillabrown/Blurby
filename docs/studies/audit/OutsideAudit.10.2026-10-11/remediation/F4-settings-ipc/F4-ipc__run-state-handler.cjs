// Control: load the real main/ipc/state.js with in-memory fakes and drive save-settings.
const Module = require("module");
const path = require("path");
const target = process.argv[2];
const handlers = {};
const enqueued = [];
const fakes = {
  electron: { ipcMain: { handle: (ch, fn) => { handlers[ch] = fn; } }, app: {} },
  "../window-manager": { getSystemTheme: () => "light", updateWindowTheme: () => {} },
  "../constants": { MAX_RECENT_FOLDERS: 10 },
  "../sync-engine": { getSyncStatus: () => ({ revision: 7 }) },
  "../sync-queue": { enqueue: async (k, p) => { enqueued.push([k, p]); } },
};
const origLoad = Module._load;
Module._load = function (req, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(fakes, req)) return fakes[req];
  return origLoad.apply(this, arguments);
};
const timers = [];
global.setTimeout = (fn, ms) => { timers.push(fn); return timers.length; };
global.clearTimeout = () => {};
const state = require(path.resolve(target));
const settings = { schemaVersion: 13, readingMode: "flow", lastReadingMode: "focus", wpm: 300 };
const saved = [];
state.register({ getSettings: () => settings, saveSettings: () => saved.push(structuredClone(settings)), getMainWindow: () => null });
handlers["save-settings"]({}, { readingMode: "narrate", lastReadingMode: "narrate" });
const inMemoryBeforeFlush = structuredClone(settings);
timers.at(-1)();
console.log(JSON.stringify({ inMemoryBeforeFlush, saved, enqueued }));

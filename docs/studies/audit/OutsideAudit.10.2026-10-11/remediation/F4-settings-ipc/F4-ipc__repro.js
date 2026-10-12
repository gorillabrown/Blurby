"use strict";
// F4 reproduction: load the REAL main/ipc/state.js with stubbed electron/window-manager/sync deps,
// capture the registered "save-settings" handler, fire its debounce, record what reaches the writer.
// Read-only on the repo. Writes only under this scratch dir.
const Module = require("module");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const REPO = "C:/Projects/Blurby";
const STATE_JS = path.join(REPO, "main/ipc/state.js");
const MAIN_JS = path.join(REPO, "main.js");
const OUT = __dirname;

// --- real writer: extract writeJSON verbatim from main.js (lines 55-60) ---
const mainSrc = fs.readFileSync(MAIN_JS, "utf8");
const wj = mainSrc.match(/async function writeJSON\(filepath, data\) \{[\s\S]*?\n\}/)[0];
const writeJSON = vm.runInNewContext(`(${wj})`, { fsPromises });

// --- stubs ---
const handlers = new Map();
const enqueued = [];
const themeCalls = [];
const stubs = {
  electron: { ipcMain: { handle: (ch, fn) => handlers.set(ch, fn) } },
  "../window-manager": { getSystemTheme: () => "dark", updateWindowTheme: (...a) => themeCalls.push(a) },
  "../sync-engine": { getSyncStatus: () => ({ revision: 7 }) },
  "../sync-queue": { enqueue: (op, p) => { enqueued.push({ op, p }); return Promise.resolve(); } },
};
const origLoad = Module._load;
Module._load = function (req, parent, isMain) {
  if (parent && /state\.js$/.test(parent.filename) && Object.prototype.hasOwnProperty.call(stubs, req)) return stubs[req];
  return origLoad.apply(this, arguments);
};

function loadState(srcTransform) {
  handlers.clear();
  let mod;
  if (!srcTransform) {
    delete require.cache[require.resolve(STATE_JS)];
    mod = require(STATE_JS);
  } else {
    // modeled variant: same file, transformed source, compiled as a module with the same filename
    const src = srcTransform(fs.readFileSync(STATE_JS, "utf8"));
    const m = new Module(STATE_JS, module);
    m.filename = STATE_JS;
    m.paths = Module._nodeModulePaths(path.dirname(STATE_JS));
    m._compile(src, STATE_JS);
    mod = m.exports;
  }
  return mod;
}

// capture setTimeout so the debounce can be fired deterministically
const timers = [];
const realSetTimeout = global.setTimeout, realClear = global.clearTimeout;
function withCapturedTimers(fn) {
  global.setTimeout = (cb, ms) => { const t = { cb, ms, cleared: false }; timers.push(t); return t; };
  global.clearTimeout = (t) => { if (t && typeof t === "object" && "cleared" in t) t.cleared = true; };
  try { return fn(); } finally { global.setTimeout = realSetTimeout; global.clearTimeout = realClear; }
}

function makeCtx(initial, file) {
  const settings = initial;
  const writes = [];
  return {
    writes,
    getSettings: () => settings,
    getLibrary: () => [],
    getMainWindow: () => null,
    // mirrors main.js:130 saveSettingsFn: writeJSON(getSettingsPath(), settings) -- not awaited
    saveSettings: () => { writes.push(JSON.stringify(settings)); writeJSON(file, settings); },
  };
}

const schema13 = () => ({ schemaVersion: 13, readingMode: "flow", lastReadingMode: "focus", wpm: 300, ttsVoiceName: "af_bella", ttsRate: 1.2 });

async function scenario(name, payloads, srcTransform) {
  timers.length = 0; enqueued.length = 0;
  const file = path.join(OUT, `settings.${name}.json`);
  try { fs.unlinkSync(file); } catch {}
  const ctx = makeCtx(schema13(), file);
  loadState(srcTransform).register(ctx);
  const h = handlers.get("save-settings");
  const getState = handlers.get("get-state");
  const res = { name, registered: [...handlers.keys()] };
  withCapturedTimers(() => { for (const p of payloads) h({}, p); });
  res.inMemoryBeforeDebounce = JSON.parse(JSON.stringify(getState().settings));
  res.writesBeforeDebounce = ctx.writes.length;
  const live = timers.filter((t) => !t.cleared);
  res.timersScheduled = timers.length; res.timersLive = live.length; res.debounceMs = live.map((t) => t.ms);
  for (const t of live) t.cb();
  await new Promise((r) => realSetTimeout(r, 50));
  res.writerReceived = ctx.writes.map((w) => JSON.parse(w));
  res.fileOnDisk = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  res.syncEnqueued = JSON.parse(JSON.stringify(enqueued));
  return res;
}

// modeled D12 normalizer (main/migrations.js does not yet contain it; text from ROADMAP.md:348)
const normalizerSrc = `
function normalizeReaderModes(data) {
  let changed = false;
  if (data.readingMode === "narrate") { data.readingMode = "flow"; changed = true; }
  if (data.lastReadingMode === "narrate") { data.lastReadingMode = "flow"; changed = true; }
  return changed;
}
`;
const fixTransform = (src) => {
  const anchor = "    Object.assign(settings, newSettings);\n";
  assert(src.includes(anchor), "anchor present");
  return src.replace(anchor, anchor + "    normalizeReaderModes(settings);\n") + normalizerSrc;
};

(async () => {
  const out = [];
  out.push(await scenario("A_both_narrate", [{ readingMode: "narrate", lastReadingMode: "narrate" }]));
  out.push(await scenario("B_control_flow", [{ readingMode: "focus", lastReadingMode: "flow" }]));
  out.push(await scenario("C_last_only_narrate", [{ lastReadingMode: "narrate" }]));
  out.push(await scenario("D_coalesce", [{ readingMode: "narrate" }, { wpm: 450 }]));
  out.push(await scenario("E_modeled_fix", [{ readingMode: "narrate", lastReadingMode: "narrate", wpm: 410 }], fixTransform));
  fs.writeFileSync(path.join(OUT, "repro-result.json"), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));

  // assertions (self-check)
  const [A, B, C, D, E] = out;
  assert.strictEqual(A.writerReceived.length, 1);
  assert.strictEqual(A.writerReceived[0].readingMode, "narrate");
  assert.strictEqual(A.writerReceived[0].lastReadingMode, "narrate");
  assert.strictEqual(A.fileOnDisk.readingMode, "narrate");
  assert.strictEqual(A.inMemoryBeforeDebounce.readingMode, "narrate");
  assert.strictEqual(A.writesBeforeDebounce, 0);
  assert.strictEqual(B.writerReceived[0].lastReadingMode, "flow");
  assert.strictEqual(C.writerReceived[0].lastReadingMode, "narrate");
  assert.strictEqual(D.timersLive, 1);
  assert.strictEqual(D.writerReceived[0].readingMode, "narrate");
  assert.strictEqual(D.writerReceived[0].wpm, 450);
  assert.strictEqual(E.writerReceived[0].readingMode, "flow");
  assert.strictEqual(E.writerReceived[0].lastReadingMode, "flow");
  assert.strictEqual(E.writerReceived[0].ttsVoiceName, "af_bella");
  assert.strictEqual(E.writerReceived[0].wpm, 410);
  assert.strictEqual(E.inMemoryBeforeDebounce.readingMode, "flow");
  console.log("ALL ASSERTIONS PASSED");
})().catch((e) => { console.error(e); process.exit(1); });

// ELECTRON-42-UPGRADE-1 C1: minimal positive control for the Windows x64 shutdown crash (nodejs/node#56645, fixed
// by nodejs/node#61999, in Electron 42.10.0+). A bare Electron main loads the app's real Narrate producer, runs a few
// generations (espeak-ng WebAssembly, per-word phonemize), shuts the producer down, then exits. On x64 Electron
// 41.10.7 some launches exit 0x80000003 after "PostQueuedCompletionStatus: (6) The handle is invalid."; on 42 none
// should. Run it through run.ps1. Env: MINI_GENS (generations, default 2); NARRATE_MODELS_ROOT (models folder).
const path = require("path");
const wt = require("worker_threads");
const { app } = require("electron");

const REPO = path.resolve(__dirname, "..", "..", "..");
// x64 Electron on an ARM64 host has no x64 sharp binary, and Kokoro never uses sharp. Inside the producer's workers,
// resolve it to the stub the packaged app uses (main/sharp-stub.js). Patched before the producer loads.
const SHARP_STUB = path.join(REPO, "main", "sharp-stub.js");
const BaseWorker = wt.Worker;
wt.Worker = class extends BaseWorker {
  constructor(file, opts = {}) {
    const boot = `const M = require("module"), r = M._resolveFilename;
M._resolveFilename = function (q, ...a) { return q === "sharp" ? ${JSON.stringify(SHARP_STUB)} : r.call(this, q, ...a); };
require(${JSON.stringify(String(file))});`;
    super(boot, { ...opts, eval: true });
  }
};
const producer = require(path.join(REPO, "main", "narrate", "producer.js"));

// A throwaway profile, never the app's: run.ps1 passes a fresh folder per launch.
if (process.env.BLURBY_USER_DATA_DIR) app.setPath("userData", process.env.BLURBY_USER_DATA_DIR);
const mark = (s) => process.stderr.write(`[mini] ${s} ${Date.now()}\n`);
app.whenReady().then(async () => {
  mark("ready");
  await producer.ensureReady();
  mark("producer ready");
  const n = Number(process.env.MINI_GENS || 2);
  for (let i = 0; i < n; i++) await producer.generate("The quick brown fox jumps over the lazy dog, again and again.", { priority: "request" });
  mark("gens done");
  await producer.shutdown();
  mark("shutdown");
  setTimeout(() => { mark("exit"); app.exit(0); }, 500);
});
app.on("window-all-closed", () => {});

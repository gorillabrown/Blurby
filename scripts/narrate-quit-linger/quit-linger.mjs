// NARRATE-QUIT-LINGER-1 — measure the quit linger with Narrate (L), the outcome of a relaunch made during it (R), and
// the window detector's controls (C), on a packaged Blurby build. Base and after runs use this same script (LL-152).
// Dev tooling only: scripts/ is not in package.json build.files, and vitest does not collect a .mjs here. Node 24
// built-ins only. Patterned on scripts/ui-sweep/sweep.mjs (Cdp, the launch line, the profile preflight, LL-165).
//
//   node scripts/narrate-quit-linger/quit-linger.mjs --exe release\win-arm64-unpacked\Blurby.exe --out <dir>
//        [--runs-paused 5] [--runs-playing 3] [--deltas 0.5,1.0,2.0] [--relaunch-runs 3] [--only L,R,C] [--break]
//        [--port 9480] [--models <NARRATE_MODELS_ROOT>] [--runs-staged 3]
//   node scripts/narrate-quit-linger/quit-linger.mjs --gaps <p5-latency-e2e --out dir>   (post-resume gaps, Done-when 2/7)
//
// Every launch gets a fresh scratch profile under --out (--user-data-dir plus BLURBY_USER_DATA_DIR) and
// NARRATE_PRODUCER_LOG=1; before the first action the main process's app.getPath('userData'), read over the Node
// inspector, must be that profile, and the live %APPDATA%\blurby hashes must not have moved (exit 4 otherwise).
// (L) open Meditations, Narrate, Play 15 s after the first voiced chunk; "paused": Pause, 1.5 s, app.quit(); "playing":
//     app.quit(). The inspector is detached at once (an attached inspector holds app.quit()). Records quit → exit, the
//     exit code, and the producer "post" lines whose epoch time is after the pause press.
// (R) the paused route, then the same exe, profile and arguments launched Δ s after app.quit(). Counted only if the old
//     process is alive at the relaunch (replaced otherwise, at most 10 cycles per Δ). Records whether a Blurby window
//     (a process on the exe path with a main window titled "Blurby…") appears within 20 s after the old process exits,
//     relaunch → window, the Blurby main processes afterwards, and the old exit code. Every window the detector reports
//     is verified: its process proves the scratch profile over the inspector (the relaunched process inherits the
//     argv, --inspect included) and the scratch blurby-data is touched after the relaunch.
// (C) c1: a launch 15 s after a full exit shows a window the detector must see; c2: a second launch while the app is
//     open and idle leaves exactly one Blurby window and one main process.
// (S) staged pause (--only S, re-dispatch 2026-10-30): the (L) paused route, but the pause is pressed only when a
//     generation is running in a worker and a prefetch is queued in main. A speed step (ArrowUp/ArrowDown) abandons a
//     running prefetch (stale epoch), the new request takes the other worker, and the next prefetch then waits behind
//     the reserved worker. Running = producer posts minus results in the log; queued = getStatus().pending minus
//     running, read over the main inspector. Records the state at the pause and the producer posts after it.
// --break (LL-151): the detector reports a window that is not there for the first (R) run; its verification must fail
//     and the run must exit 1.
// Exit: 0 when the run completes and the controls hold; 1 when a control or a window verification fails; 4 on a
// preflight failure or moved live hashes; 2 on bad arguments.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const args = { runsStaged: 3, runsPaused: 5, runsPlaying: 3, deltas: [0.5, 1.0, 2.0], relaunchRuns: 3, port: 9480, only: ["L", "R", "C"], models: process.env.NARRATE_MODELS_ROOT || "C:/Projects/Blurby-artifacts/narrate-quit-linger-1/models" };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i], v = () => argv[++i];
  if (a === "--exe") args.exe = path.resolve(v());
  else if (a === "--out") args.out = path.resolve(v());
  else if (a === "--runs-paused") args.runsPaused = Number(v());
  else if (a === "--runs-playing") args.runsPlaying = Number(v());
  else if (a === "--runs-staged") args.runsStaged = Number(v());
  else if (a === "--deltas") args.deltas = v().split(",").map(Number);
  else if (a === "--relaunch-runs") args.relaunchRuns = Number(v());
  else if (a === "--only") args.only = v().split(",");
  else if (a === "--port") args.port = Number(v());
  else if (a === "--models") args.models = v();
  else if (a === "--break") args.break = true;
  else if (a === "--trace-quit") args.traceQuit = true;
  else if (a === "--gaps") args.gaps = path.resolve(v());
  else { console.error(`unknown argument ${a}`); process.exit(2); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const log = (...m) => console.log(new Date().toISOString().slice(11, 23), ...m);
const LIVE = path.join(process.env.APPDATA || "", "blurby");
const LIVE_DATA = path.join(LIVE, "blurby-data");
const hashLive = () => Object.fromEntries(["library.json", "settings.json"].map((f) => { const p = path.join(LIVE_DATA, f); return [f, fs.existsSync(p) ? sha(fs.readFileSync(p)) : "(absent)"]; }));
const DOC = "sample-meditations";
const QUIT_EXIT_WAIT_MS = 45000;
const WINDOW_WAIT_MS = 20000;
const MAX_CYCLES_PER_DELTA = 10;

// ── post-resume gaps (Done-when 2 and 7) ────────────────────────────────────────────────────────────────────────
// Every narrate-schedule record in the same epoch within 10 s after a narrate-request with cause "resume", whose
// startAt exceeds the previous chunk's endAt by more than 0.05 s. A narrate-request record carries no epoch: its epoch
// is that of the first narrate-schedule after it, and "the previous chunk" is the previous schedule record of that
// epoch after the request (a chunk scheduled before the pause is rescheduled on resume, never a gap).
function traceRecords(file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const list = Array.isArray(raw) ? raw : raw.events || raw.records || raw.trace || [];
  return list.map((e) => e.payload && e.payload.kind ? { ...e.payload, t: e.payload.t ?? e.t } : e).filter((e) => e && e.kind);
}
export function postResumeGaps(records) {
  const gaps = [];
  let resumes = 0, pairs = 0;
  const reqs = records.filter((r) => r.kind === "narrate-request" && r.cause === "resume");
  for (const req of reqs) {
    resumes += 1;
    const tReq = req.t;
    const first = records.find((r) => r.kind === "narrate-schedule" && r.t >= tReq);
    if (!first) continue;
    const sched = records.filter((r) => r.kind === "narrate-schedule" && r.epoch === first.epoch && r.t >= tReq && r.t <= tReq + 10000);
    pairs += Math.max(0, sched.length - 1);
    for (let i = 1; i < sched.length; i++) {
      const s = sched[i], prev = sched[i - 1];
      if (s.startAt - prev.endAt > 0.05) gaps.push({ epoch: s.epoch, chunkStart: s.chunkStart, gapS: +(s.startAt - prev.endAt).toFixed(3), afterResumeMs: Math.round(s.t - tReq) });
    }
  }
  return { resumes, pairs, count: gaps.length, worstS: gaps.reduce((m, g) => Math.max(m, g.gapS), 0), gaps };
}
if (args.gaps) {
  const dir = path.join(args.gaps, "traces");
  const out = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".trace.json")).sort()) {
    const recs = traceRecords(path.join(dir, f));
    const kinds = {}; for (const r of recs) kinds[r.kind] = (kinds[r.kind] || 0) + 1;
    out[f] = { kinds, ...postResumeGaps(recs) };
  }
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}
if (!args.exe || !args.out) { console.error("--exe and --out are required"); process.exit(2); }
fs.mkdirSync(path.join(args.out, "profiles"), { recursive: true });
fs.mkdirSync(path.join(args.out, "logs"), { recursive: true });

const rec = { exe: args.exe, args: { ...args, exe: undefined, out: undefined }, started: new Date().toISOString(), liveBefore: hashLive(), L: [], S: [], R: [], C: {}, controls: [] };
const recFile = path.join(args.out, "quit-linger.json");
const save = () => fs.writeFileSync(recFile, JSON.stringify(rec, null, 2));
const control = (name, ok, detail) => { rec.controls.push({ name, ok, detail }); log(`control ${name}: ${ok ? "PASS" : "FAIL"}`, detail ? JSON.stringify(detail).slice(0, 300) : ""); save(); };

// ── CDP / inspector client ──────────────────────────────────────────────────────────────────────────────────────
class Cdp {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); }
  async open() {
    this.ws = new WebSocket(this.url);
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = () => rej(new Error("CDP websocket error")); });
    this.ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && this.pending.has(d.id)) { const p = this.pending.get(d.id); this.pending.delete(d.id); d.error ? p.reject(new Error(`${p.method}: ${d.error.message}`)) : p.resolve(d.result); } };
    this.ws.onclose = () => { for (const p of this.pending.values()) p.reject(new Error("CDP closed")); this.pending.clear(); this.closed = true; };
  }
  send(method, params = {}, timeoutMs = 15000) {
    if (this.closed) return Promise.reject(new Error("CDP closed"));
    const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject, method }); setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`${method}: timeout`)); } }, timeoutMs); });
  }
  async eval(expr, timeoutMs = 10000) {
    const r = await this.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, timeout: timeoutMs }, timeoutMs + 2000);
    if (r.exceptionDetails) throw new Error(`eval: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch { /* gone */ } }
}
async function inspector(port, tries = 80) {
  for (let i = 0; i < tries; i++) {
    try { const node = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json())[0]; const c = new Cdp(node.webSocketDebuggerUrl); await c.open(); return c; } catch { await sleep(250); }
  }
  return null;
}
const USERDATA = "process.mainModule.require('electron').app.getPath('userData')";

// ── window detector: one long-lived pwsh loop, a snapshot every ~250 ms ─────────────────────────────────────────
// windows: processes on the exe path with MainWindowHandle -ne 0 and MainWindowTitle starting "Blurby";
// mains: Blurby main processes on the exe path (no --type= in the command line).
class Detector {
  constructor(exe) { this.exe = exe; this.snaps = []; }
  start() {
    const exe = this.exe.replace(/'/g, "''");
    const ps = `$exe = '${exe}'; $n = 0; while ($true) { $w = @(Get-Process -Name Blurby -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path -ieq $exe -and $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like 'Blurby*' } | ForEach-Object { @{ id = $_.Id; title = $_.MainWindowTitle } }); $m = $null; if (($n % 4) -eq 0) { $m = @(Get-CimInstance Win32_Process -Filter "Name='Blurby.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.ExecutablePath -ieq $exe -and $_.CommandLine -notmatch '--type=' } | ForEach-Object { [int]$_.ProcessId }) }; $n++; [Console]::Out.WriteLine((@{ t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); windows = $w; mains = $m } | ConvertTo-Json -Compress -Depth 4)); Start-Sleep -Milliseconds 200 }`;
    this.child = spawn("pwsh", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: ["ignore", "pipe", "ignore"], windowsHide: true });
    let buf = "";
    this.child.stdout.on("data", (d) => {
      buf += d; let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        try { const s = JSON.parse(line); s.windows = [].concat(s.windows || []).filter(Boolean); if (s.mains !== null && s.mains !== undefined) { s.mains = [].concat(s.mains).filter((x) => x !== null); this.lastMains = s.mains; } this.snaps.push(s); if (this.snaps.length > 4000) this.snaps.splice(0, 2000); } catch { /* partial */ }
      }
    });
  }
  async ready() { for (let i = 0; i < 100 && (!this.snaps.length || this.lastMains === undefined); i++) await sleep(100); }
  latest() { return this.snaps.at(-1) || { t: 0, windows: [] }; }
  /** The first snapshot at or after `since` (epoch ms) with a window, waiting until `until`. */
  async firstWindow(since, until) {
    while (Date.now() < until) { const s = this.snaps.find((x) => x.t >= since && x.windows.length); if (s) return s; await sleep(100); }
    return this.snaps.find((x) => x.t >= since && x.windows.length) || null;
  }
  /** Main-process ids from a snapshot taken after `since`. */
  async mainsAfter(since) { for (let i = 0; i < 60; i++) { const s = [...this.snaps].reverse().find((x) => x.t >= since && Array.isArray(x.mains)); if (s) return s.mains; await sleep(100); } return null; }
  stop() { try { this.child.kill(); } catch { /* gone */ } }
}
const detector = new Detector(args.exe);

// ── launch, preflight ───────────────────────────────────────────────────────────────────────────────────────────
const launchArgs = (profile) => [`--remote-debugging-port=${args.port}`, `--inspect=${args.port + 1000}`, `--user-data-dir=${profile}`];
function launch(profile, label) {
  const env = { ...process.env, BLURBY_USER_DATA_DIR: profile, NARRATE_MODELS_ROOT: args.models, NARRATE_PRODUCER_LOG: "1" };
  delete env.ELECTRON_RUN_AS_NODE;
  const logFile = path.join(args.out, "logs", `${label}.log`);
  const out = fs.createWriteStream(logFile);
  const proc = spawn(args.exe, launchArgs(profile), { env, stdio: ["ignore", "pipe", "pipe"] });
  const lines = [];
  const onData = (d) => { out.write(d); for (const l of String(d).split(/\r?\n/)) if (l) lines.push(l); };
  proc.stdout.on("data", onData); proc.stderr.on("data", onData);
  const app = { proc, pid: proc.pid, lines, logFile, label, profile, launchedAt: Date.now(), exitCode: undefined };
  app.exited = new Promise((r) => proc.on("exit", (code) => { app.exitCode = code; app.exitAt = Date.now(); out.end(); r(code); }));
  return app;
}
function freshProfile(label) {
  const p = path.join(args.out, "profiles", `${label}-${Date.now()}`);
  const want = p.toLowerCase(), live = LIVE.toLowerCase();
  if (want === live || want.startsWith(live + path.sep)) { console.error("refusing: profile under the live profile"); process.exit(4); }
  fs.mkdirSync(p, { recursive: true });
  return p;
}
async function abort(why, app) {
  log("ABORT (preflight):", why); rec.abort = why; try { app?.proc.kill(); } catch { /* gone */ }
  rec.liveAfter = hashLive(); rec.liveUnchanged = JSON.stringify(rec.liveAfter) === JSON.stringify(rec.liveBefore); save(); detector.stop(); process.exit(4);
}
/** LL-165: before the first action, userData read over the inspector is the scratch profile and the live hashes have not moved. */
async function preflight(app) {
  const main = await inspector(args.port + 1000);
  if (!main) return abort("could not attach the main-process inspector", app);
  let userData = null;
  for (let i = 0; i < 40 && !userData; i++) { try { userData = await main.eval(USERDATA); } catch { await sleep(250); } }
  if (!userData) return abort("could not read app.getPath('userData')", app);
  const ud = path.resolve(userData).toLowerCase(), live = LIVE.toLowerCase();
  if (ud === live || ud.startsWith(live + path.sep)) return abort(`userData is the live profile (${userData})`, app);
  if (ud !== app.profile.toLowerCase()) return abort(`userData is ${userData}, not ${app.profile}`, app);
  let covers = false;
  for (let i = 0; i < 60 && !covers; i++) { covers = fs.existsSync(path.join(app.profile, "blurby-data", "covers")); if (!covers) await sleep(500); }
  if (!covers) return abort("the scratch blurby-data/covers did not appear", app);
  if (JSON.stringify(hashLive()) !== JSON.stringify(rec.liveBefore)) return abort("the live profile hashes moved", app);
  app.main = main; app.userData = userData;
  return main;
}
async function attachPage(app) {
  let target;
  for (let i = 0; i < 240 && !target; i++) {
    try { const list = await (await fetch(`http://127.0.0.1:${args.port}/json/list`)).json(); target = list.find((t) => t.type === "page" && !/^devtools:/.test(t.url)); } catch { /* not up */ }
    if (!target) await sleep(250);
  }
  if (!target) throw new Error("no CDP page target");
  const page = new Cdp(target.webSocketDebuggerUrl); await page.open();
  await page.send("Runtime.enable"); await page.send("Page.enable");
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
  app.page = page;
  return page;
}
async function startApp(label) {
  const profile = freshProfile(label);
  const app = launch(profile, label);
  log(`[${label}] launched pid ${app.pid}`);
  await preflight(app);
  await attachPage(app);
  return app;
}

// ── page actions ────────────────────────────────────────────────────────────────────────────────────────────────
const has = (page, sel) => page.eval(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })()`).catch(() => false);
async function waitFor(page, sel, ms = 30000) { const end = Date.now() + ms; while (Date.now() < end) { if (await has(page, sel)) return true; await sleep(250); } return false; }
async function clickSel(page, sel) {
  const b = await page.eval(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; el.scrollIntoView({ block: 'center', inline: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  if (!b) throw new Error(`${sel} not found`);
  for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await page.send("Input.dispatchMouseEvent", { type, x: b.x, y: b.y, button: "left", clickCount: 1 });
}
const playLabel = (page) => page.eval(`document.querySelector('.rbb-play-btn')?.getAttribute('aria-label') ?? null`).catch(() => null);
async function waitLibrary(page) {
  if (!(await waitFor(page, ".library-container", 60000))) throw new Error("library did not appear");
  await sleep(800);
  if (await has(page, ".onboarding-btn-skip")) { await clickSel(page, ".onboarding-btn-skip"); await sleep(800); }
}
const postsAfter = (app, t) => app.lines.filter((l) => /\[narrate-producer\] (\d+) post /.test(l) && Number(l.match(/\[narrate-producer\] (\d+) post /)[1]) > t);
const results = (app) => app.lines.filter((l) => /\[narrate-producer\] \d+ result /.test(l));

const posts = (app) => app.lines.filter((l) => /\[narrate-producer\] \d+ post /.test(l));
const PRODUCER_STATUS = "process.mainModule.require('./main/narrate/producer').getStatus()";
/** Running in a worker (log posts minus results) and queued in main (status pending minus running). */
async function producerState(app) {
  const running = posts(app).length - results(app).length;
  const st = await app.main.eval(PRODUCER_STATUS, 3000).catch(() => null);
  return { running, pending: st ? st.pending : null, queued: st ? st.pending - running : null, lastPost: posts(app).at(-1) ?? null };
}
async function pressKey(page, code, vk) {
  for (const type of ["rawKeyDown", "keyUp"]) await page.send("Input.dispatchKeyEvent", { type, code, key: code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
}
/** (S): from playing, step the speed while a prefetch is running until one is running and one is queued; then Pause. */
async function stagePause(app, t) {
  const page = app.page; t.attempts = [];
  for (let attempt = 1; attempt <= 12; attempt++) {
    // Wait for a prefetch to be running (posted, no result yet).
    let end = Date.now() + 15000, st = await producerState(app);
    while (Date.now() < end && !(st.running >= 1 && / prefetch /.test(st.lastPost || ""))) { await sleep(50); st = await producerState(app); }
    const up = attempt % 2 === 1;
    await pressKey(page, up ? "ArrowUp" : "ArrowDown", up ? 38 : 40);
    const a = { attempt, key: up ? "ArrowUp" : "ArrowDown", at: Date.now(), before: st };
    end = Date.now() + 8000;
    while (Date.now() < end) {
      st = await producerState(app);
      if (st.running >= 1 && st.queued >= 1) {
        t.pausePress = Date.now();
        await clickSel(page, ".rbb-play-btn");
        a.atPause = st; t.attempts.push(a); t.staged = st;
        return;
      }
      await sleep(40);
    }
    a.timedOut = st; t.attempts.push(a);
  }
  throw new Error("could not stage a running generation with a queued prefetch in 12 attempts");
}

/** Open Meditations, enter Narrate, Play; 15 s after the first voiced chunk returns. "paused": Pause, then 1.5 s. */
async function narrateRoute(app, mode) {
  const page = app.page; const t = {};
  await waitLibrary(page);
  if (!(await has(page, ".doc-list"))) { await clickSel(page, ".view-toggle-btn"); await sleep(400); }
  const card = `.doc-card[data-doc-id="${DOC}"]`;
  if (!(await waitFor(page, card, 20000))) throw new Error("Meditations card not found");
  await clickSel(page, card);
  if (!(await waitFor(page, ".reader-layout", 45000))) throw new Error("reader did not open");
  await sleep(1500);
  await clickSel(page, 'button[aria-label="Narrate mode"]');
  if (!(await waitFor(page, ".rm-narrate-root", 30000))) throw new Error("Narrate mode root did not appear");
  await sleep(2500);
  t.playPress = Date.now();
  await clickSel(page, ".rbb-play-btn");
  const end = Date.now() + 120000;
  while (Date.now() < end && !results(app).length) await sleep(200);
  if (!results(app).length) throw new Error("no producer result within 120 s of Play");
  t.firstResult = Date.now();
  if ((await playLabel(page)) !== "Pause") throw new Error(`not playing after the first result (button: ${await playLabel(page)})`);
  await sleep(mode === "staged" ? 3000 : 15000);
  if (mode === "paused" || mode === "staged") {
    if (mode === "staged") await stagePause(app, t);
    else { t.pausePress = Date.now(); await clickSel(page, ".rbb-play-btn"); }
    await sleep(300);
    t.labelAfterPause = await playLabel(page);
    if (t.labelAfterPause !== "Play") throw new Error(`pause did not take (button: ${t.labelAfterPause})`);
    await sleep(1200);
  }
  t.position = await page.eval(`window.electronAPI.getState().then((s) => (s.library.find((d) => d.id === ${JSON.stringify(DOC)}) || {}).position ?? null)`).catch(() => null);
  return t;
}
/** app.quit() through the main inspector, detached at once (an attached inspector holds app.quit()). */
// --trace-quit (diagnostic runs only, never a measured one): before the quit, wrap the producer shutdown, worker
// terminate and exit, and the app's quit events with timestamped stdout lines ("[quit-trace] <epoch ms> …").
const TRACE_QUIT = String.raw`(() => { const r = process.mainModule.require; const { app } = r("electron"); const { Worker } = r("worker_threads");
  const t = (...a) => console.log("[quit-trace]", Date.now(), ...a);
  const p = r("./main/narrate/producer"); // the module main.js calls at quit (resolved from the main module)
  const sd = p.shutdown; p.shutdown = () => { t("shutdown start"); return sd().then((v) => { t("shutdown done"); return v; }); };
  const term = Worker.prototype.terminate; Worker.prototype.terminate = function () { t("worker terminate", this.threadId); return term.call(this); };
  const emit = Worker.prototype.emit; Worker.prototype.emit = function (n, ...a) { if (n === "exit") t("worker exit", this.threadId, a[0]); return emit.call(this, n, ...a); };
  for (const e of ["before-quit", "will-quit", "quit"]) app.on(e, () => t("app " + e));
  process.on("exit", (c) => t("process exit", c)); return "traced"; })()`;
function quit(app) {
  if (args.traceQuit) app.main.send("Runtime.evaluate", { expression: TRACE_QUIT, returnByValue: true }).catch(() => {});
  const at = Date.now();
  app.main.send("Runtime.evaluate", { expression: "process.mainModule.require('electron').app.quit()", returnByValue: true }).catch(() => {});
  setTimeout(() => { app.main.close(); app.page?.close(); }, 0);
  return at;
}
async function waitExit(app, ms = QUIT_EXIT_WAIT_MS) {
  const code = await Promise.race([app.exited, sleep(ms).then(() => "timeout")]);
  if (code === "timeout") { try { app.proc.kill(); } catch { /* gone */ } await Promise.race([app.exited, sleep(5000)]); return { timedOut: true, code: app.exitCode }; }
  return { timedOut: false, code };
}
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
async function killPid(pid) { try { process.kill(pid); } catch { /* gone */ } for (let i = 0; i < 50 && alive(pid); i++) await sleep(100); }
/** Quit a process we did not spawn (the relaunched one) through its inspector, or kill it. */
async function quitForeign(pid, main) {
  if (main) { main.send("Runtime.evaluate", { expression: "process.mainModule.require('electron').app.quit()" }).catch(() => {}); setTimeout(() => main.close(), 0); }
  for (let i = 0; i < 300 && alive(pid); i++) await sleep(100);
  if (alive(pid)) await killPid(pid);
}
function newestMtime(dir) {
  let m = 0;
  const walk = (d, depth) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); const st = fs.statSync(p); m = Math.max(m, st.mtimeMs); if (e.isDirectory() && depth < 2) walk(p, depth + 1); } };
  try { walk(dir, 0); } catch { /* none */ }
  return m;
}
const isCrash = (code) => code === 3221226505 || code === 2147483651 || code === -1073740791 || code === -2147483645;

// ── (L) ─────────────────────────────────────────────────────────────────────────────────────────────────────────
async function runL(mode, n) {
  const label = `L-${mode}-${n}`;
  const app = await startApp(label);
  let row = { run: label, mode };
  try {
    const t = await narrateRoute(app, mode);
    const quitAt = quit(app);
    const ex = await waitExit(app);
    const ref = mode === "playing" ? quitAt : t.pausePress;
    const posts = postsAfter(app, ref);
    row = { ...row, ...t, quitAt, exitAt: app.exitAt, lingerS: +((app.exitAt - quitAt) / 1000).toFixed(2), exitCode: ex.code, timedOut: ex.timedOut, postsAfterPause: mode === "playing" ? null : posts.length, postLines: posts, results: results(app).length };
  } catch (err) {
    row.error = err.message; try { app.proc.kill(); } catch { /* gone */ } await Promise.race([app.exited, sleep(5000)]);
  }
  (mode === "staged" ? rec.S : rec.L).push(row); save();
  log(`[${label}] linger ${row.lingerS}s exit ${row.exitCode} postsAfterPause ${row.postsAfterPause}${row.error ? " ERROR " + row.error : ""}`);
  if (isCrash(row.exitCode) || row.timedOut) log(`[${label}] QUIT-CRASH CLASS or terminate: stop (Failure handling)`);
  return row;
}

// ── (R) ─────────────────────────────────────────────────────────────────────────────────────────────────────────
let breakPlanted = false;
async function runR(delta, n, cycle) {
  const label = `R-${delta}-${n}-c${cycle}`;
  const app = await startApp(label);
  const row = { run: label, delta, counted: false };
  try {
    const t = await narrateRoute(app, "paused");
    Object.assign(row, { pausePress: t.pausePress });
    const quitAt = quit(app);
    row.quitAt = quitAt;
    await sleep(Math.max(0, quitAt + delta * 1000 - Date.now()));
    row.oldAliveAtRelaunch = app.exitCode === undefined && alive(app.pid);
    row.relaunchAt = Date.now();
    const second = launch(app.profile, `${label}-relaunch`);
    row.secondPid = second.pid;
    const ex = await waitExit(app);
    row.oldExitCode = ex.code; row.oldTimedOut = ex.timedOut; row.oldExitAt = app.exitAt; row.lingerS = +((app.exitAt - quitAt) / 1000).toFixed(2);
    row.postsAfterPause = postsAfter(app, t.pausePress).length;
    await Promise.race([second.exited, sleep(10000)]);
    row.secondExitCode = second.exitCode ?? "running";
    let win = await detector.firstWindow(row.relaunchAt, app.exitAt + WINDOW_WAIT_MS);
    if (args.break && !breakPlanted) { breakPlanted = true; win = { t: Date.now(), windows: [{ id: 999999, title: "Blurby (planted by --break)" }], planted: true }; }
    row.window = !!win;
    if (win) {
      const w = win.windows[0];
      Object.assign(row, { windowPid: w.id, windowTitle: w.title, relaunchToWindowS: +((win.t - row.relaunchAt) / 1000).toFixed(2), oldExitToWindowS: +((win.t - app.exitAt) / 1000).toFixed(2), planted: !!win.planted });
      // Verify the window: its process is alive, proves the scratch profile over the inspector, and touched blurby-data.
      const v = { alive: alive(w.id) };
      const main = v.alive ? await inspector(args.port + 1000, 40) : null;
      v.userData = main ? await main.eval(USERDATA).catch(() => null) : null;
      v.scratchProfile = !!v.userData && path.resolve(v.userData).toLowerCase() === app.profile.toLowerCase();
      v.pidMatches = main ? (await main.eval("process.pid").catch(() => null)) === w.id : false;
      await sleep(3000);
      v.blurbyDataTouched = newestMtime(path.join(app.profile, "blurby-data")) > row.relaunchAt;
      v.ok = v.alive && v.scratchProfile && v.pidMatches && v.blurbyDataTouched;
      row.windowVerified = v;
      await sleep(1000);
      row.windowsAfter = detector.latest().windows.length;
      row.mainsAfter = (await detector.mainsAfter(Date.now()))?.length ?? null;
      if (!v.ok) control(`window verification ${label}`, false, v);
      if (v.alive) await quitForeign(w.id, main); else main?.close();
    } else {
      row.windowsAfter = detector.latest().windows.length;
      row.mainsAfter = (await detector.mainsAfter(Date.now()))?.length ?? null;
    }
    row.counted = row.oldAliveAtRelaunch;
    for (const pid of (await detector.mainsAfter(Date.now())) || []) await killPid(pid); // leave nothing running for the next run
  } catch (err) {
    row.error = err.message; try { app.proc.kill(); } catch { /* gone */ } await Promise.race([app.exited, sleep(5000)]);
  }
  rec.R.push(row); save();
  log(`[${label}] counted ${row.counted} window ${row.window} relaunch→window ${row.relaunchToWindowS ?? "-"}s mains ${row.mainsAfter} oldExit ${row.oldExitCode}${row.error ? " ERROR " + row.error : ""}`);
  return row;
}

// ── (C) ─────────────────────────────────────────────────────────────────────────────────────────────────────────
async function runC() {
  const a = await startApp("C-first");
  await waitLibrary(a.page);
  quit(a); const ex = await waitExit(a);
  rec.C.firstExit = ex;
  log("[C] first launch quit; waiting 15 s");
  await sleep(15000);
  // c1: a launch 15 s after a full exit shows a window the detector must see.
  const b = launch(a.profile, "C-c1");
  const at = Date.now();
  await preflight(b);
  const win = await detector.firstWindow(at, at + 30000);
  rec.C.c1 = { window: !!win, launchToWindowS: win ? +((win.t - at) / 1000).toFixed(2) : null, pid: win?.windows[0]?.id ?? null, expectedPid: b.pid };
  control("c1 window seen after a full exit", !!win && win.windows.some((w) => w.id === b.pid), rec.C.c1);
  // c2: a second launch while the app is open and idle leaves exactly one Blurby window.
  await attachPage(b); await waitLibrary(b.page); await sleep(2000);
  const c = launch(a.profile, "C-c2-second");
  const at2 = Date.now();
  await Promise.race([c.exited, sleep(15000)]);
  await sleep(3000);
  const windows = detector.latest().windows;
  const mains = await detector.mainsAfter(Date.now());
  rec.C.c2 = { secondExitCode: c.exitCode ?? "running", secondExitS: c.exitAt ? +((c.exitAt - at2) / 1000).toFixed(2) : null, windows, mains };
  control("c2 second launch while open leaves one window", windows.length === 1 && windows[0].id === b.pid && Array.isArray(mains) && mains.length === 1, rec.C.c2);
  quit(b); await waitExit(b);
  if (c.exitCode === undefined) { try { c.proc.kill(); } catch { /* gone */ } }
}

// ── main ────────────────────────────────────────────────────────────────────────────────────────────────────────
const isMain = !!process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  detector.start(); await detector.ready();
  const pre = detector.latest();
  if (pre.windows.length || (detector.lastMains || []).length) { console.error(`refusing: a Blurby on ${args.exe} is already running`, JSON.stringify(pre)); detector.stop(); process.exit(2); }
  log("live hashes", JSON.stringify(rec.liveBefore));
  if (args.only.includes("C")) await runC();
  if (args.only.includes("S")) for (let i = 1; i <= args.runsStaged; i++) await runL("staged", i);
  if (args.only.includes("L")) {
    for (let i = 1; i <= args.runsPaused; i++) await runL("paused", i);
    for (let i = 1; i <= args.runsPlaying; i++) await runL("playing", i);
  }
  if (args.only.includes("R")) {
    for (const delta of args.deltas) {
      let counted = 0, cycle = 0;
      while (counted < args.relaunchRuns && cycle < MAX_CYCLES_PER_DELTA) { cycle += 1; const r = await runR(delta, counted + 1, cycle); if (r.counted && !r.error) counted += 1; }
      rec[`R-${delta}-counted`] = counted;
    }
  }
  rec.liveAfter = hashLive(); rec.liveUnchanged = JSON.stringify(rec.liveAfter) === JSON.stringify(rec.liveBefore);
  rec.finished = new Date().toISOString();
  save(); detector.stop();
  if (!rec.liveUnchanged) { log("live hashes moved"); process.exit(4); }
  const failed = rec.controls.filter((c) => !c.ok);
  log(`done: ${rec.controls.length} controls, ${failed.length} failed; ${recFile}`);
  process.exit(failed.length ? 1 : 0);
}

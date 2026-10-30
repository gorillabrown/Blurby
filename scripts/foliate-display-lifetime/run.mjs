// FOLIATE-DISPLAY-LIFETIME-1 RodneySr job: the launcher that replaces launch.ps1 (SHA 96042b41…) on RodneySr x64.
// Kept from launch.ps1: a fresh scratch profile through BLURBY_USER_DATA_DIR, --remote-debugging-port, a 4 s settle after
// the page answers, the route script run as `node <script> <port> <args>` with {ERRLOG}/{OUT} placeholders, CloseMainWindow
// then 6 s then force-stop, and the error.log census for "ResizeObserver loop" and "Cannot destructure property 'style'".
// Added for this host (Brain, 2026-10-30): --user-data-dir, scratch APPDATA/LOCALAPPDATA, --inspect with the LL-165 proof
// (userData, data path, arch, isPackaged, exe, pid) before any input, a no-other-Blurby check, live-profile hashes, the
// optional owned91 seed, stdout/stderr and crash-dump census, and a JSON receipt.
// node run.mjs --exe <Blurby.exe> --label <name> --out <dir> --port <n> [--seed owned91 --fixture <dir>] -- <script> [args…]
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const argv = process.argv.slice(2);
const dd = argv.indexOf("--");
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 && (dd < 0 || i < dd) ? argv[i + 1] : undefined; };
const exe = opt("--exe"), label = opt("--label"), outRoot = opt("--out"), port = Number(opt("--port")), seed = opt("--seed"), fixture = opt("--fixture");
const [script, ...scriptArgs] = argv.slice(dd + 1);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const live = path.join(process.env.APPDATA, "blurby", "blurby-data");
const liveHash = () => Object.fromEntries(["library.json", "settings.json"].map((f) => [f, sha(path.join(live, f))]));
const blurbys = () => execFileSync("tasklist", ["/FI", "IMAGENAME eq Blurby.exe", "/FO", "CSV", "/NH"], { encoding: "utf8" }).split(/\r?\n/).filter((l) => l.startsWith('"Blurby.exe"'));

const dir = path.join(outRoot, label);
fs.mkdirSync(dir, { recursive: true });
const rec = { label, exe, exeSha: sha(exe), asarSha: sha(path.join(path.dirname(exe), "resources", "app.asar")), port, seed: seed || null, script, scriptArgs, startedAt: new Date().toISOString() };
const finish = (code) => { rec.finishedAt = new Date().toISOString(); fs.writeFileSync(path.join(dir, "receipt.json"), JSON.stringify(rec, null, 2)); console.log(JSON.stringify({ label, verdictInputs: rec.census, proof: rec.proof, live: rec.live?.unchanged, scriptExit: rec.scriptExit })); process.exit(code); };

rec.otherBlurby = blurbys();
if (rec.otherBlurby.length) { rec.abort = "another Blurby is running"; finish(3); }
rec.live = { before: liveHash() };

const profile = path.join(dir, "profile"), appdata = path.join(dir, "appdata"), localappdata = path.join(dir, "localappdata");
for (const d of [profile, appdata, localappdata]) { if (fs.existsSync(d)) { rec.abort = `scratch folder exists: ${d}`; finish(3); } fs.mkdirSync(d, { recursive: true }); }
const dataDir = path.join(profile, "blurby-data");
const errLog = path.join(dataDir, "error.log");

if (seed === "owned91" || seed === "owned91-initial") {
  // The fixture's three filepath fields name the investigator's profile; rewrite only those to this profile's copy.
  fs.mkdirSync(dataDir, { recursive: true });
  const epub = path.join(dataDir, "owned91.epub");
  fs.copyFileSync(path.join(fixture, "owned91.epub"), epub);
  fs.copyFileSync(path.join(fixture, "settings.json"), path.join(dataDir, "settings.json"));
  const lib = JSON.parse(fs.readFileSync(path.join(fixture, "library.json"), "utf8"));
  rec.seedRewrites = lib.docs.map((d) => { const from = d.filepath; d.filepath = epub; return { id: d.id, from, to: epub }; });
  if (seed === "owned91-initial") {
    // The visibility item's INITIAL state (Blurby.Brain 2026-10-30): the fixture holds the later exit state, so restore
    // owned-complete to 91/91 unarchived; owned-archive and owned-control are left as supplied.
    const c = lib.docs.find((d) => d.id === "owned-complete");
    rec.seedInitial = { from: { position: c.position, archived: c.archived, archivedAt: c.archivedAt ?? null } };
    c.position = 91; c.archived = false; delete c.archivedAt;
    rec.seedInitial.to = { position: 91, archived: false, archivedAt: null };
  }
  fs.writeFileSync(path.join(dataDir, "library.json"), JSON.stringify(lib, null, 2));
  rec.seedHashes = { before: Object.fromEntries(["library.json", "settings.json", "owned91.epub"].map((f) => [f, sha(path.join(fixture, f))])), seeded: Object.fromEntries(["library.json", "settings.json", "owned91.epub"].map((f) => [f, sha(path.join(dataDir, f))])) };
}

const inspectPort = port + 1000;
const env = { ...process.env, BLURBY_USER_DATA_DIR: profile, APPDATA: appdata, LOCALAPPDATA: localappdata };
delete env.ELECTRON_RUN_AS_NODE;
const p = spawn(exe, [`--remote-debugging-port=${port}`, `--inspect=${inspectPort}`, `--user-data-dir=${profile}`], { env, stdio: ["ignore", "pipe", "pipe"] });
const std = fs.createWriteStream(path.join(dir, "stdio.log"));
const lines = [];
const onData = (d) => { std.write(d); lines.push(...String(d).split(/\r?\n/).filter(Boolean)); };
p.stdout.on("data", onData); p.stderr.on("data", onData);
let exited = null; p.on("exit", (c) => { exited = c; });
rec.pid = p.pid;

// LL-165: prove the profile over the main inspector before any input.
const proofExpr = `(() => { const { app } = process.mainModule.require("electron"); const path = process.mainModule.require("path");
  return { userData: app.getPath("userData"), dataPath: path.join(app.getPath("userData"), "blurby-data"), arch: process.arch, isPackaged: app.isPackaged, execPath: process.execPath, pid: process.pid }; })()`;
let proof = null;
for (let i = 0; i < 120 && !proof && exited === null; i++) {
  try {
    const t = (await (await fetch(`http://127.0.0.1:${inspectPort}/json/list`)).json())[0];
    const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    proof = await new Promise((r) => { ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) r(d.result?.result?.value ?? null); }; ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: proofExpr, returnByValue: true } })); });
    ws.close();
  } catch { await sleep(250); }
}
rec.proof = { ...proof, scratch: !!proof && path.resolve(proof.userData).toLowerCase() === profile.toLowerCase(), pidMatches: proof?.pid === p.pid };
if (!rec.proof.scratch || !rec.proof.isPackaged || rec.proof.arch !== "x64") { rec.abort = "profile proof failed"; try { execFileSync("taskkill", ["/PID", String(p.pid), "/T", "/F"]); } catch {} finish(4); }

for (let i = 0; i < 60; i++) { try { await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; } catch { await sleep(500); } }
await sleep(4000);

const args2 = scriptArgs.map((a) => a.replace("{ERRLOG}", errLog).replace("{OUT}", dir));
const t0 = Date.now();
rec.scriptExit = await new Promise((res) => {
  const s = spawn(process.execPath, [script, String(port), ...args2], { stdio: ["ignore", "pipe", "pipe"] });
  const so = fs.createWriteStream(path.join(dir, "script.log"));
  s.stdout.on("data", (d) => { so.write(d); process.stdout.write(d); }); s.stderr.on("data", (d) => { so.write(d); process.stderr.write(d); });
  s.on("exit", res);
});
rec.scriptSeconds = +((Date.now() - t0) / 1000).toFixed(1);
rec.aliveAfterScript = exited === null;

try { execFileSync("powershell", ["-NoProfile", "-Command", `Get-Process -Id ${p.pid} -ErrorAction SilentlyContinue | ForEach-Object { $_.CloseMainWindow() | Out-Null }`]); } catch {}
await sleep(6000);
rec.exitedAfterClose = exited;
if (exited === null) { try { execFileSync("taskkill", ["/PID", String(p.pid), "/T", "/F"]); } catch {} rec.forceStopped = true; await sleep(2000); }
rec.leftover = blurbys();

const errLines = fs.existsSync(errLog) ? fs.readFileSync(errLog, "utf8").split(/\r?\n/).filter(Boolean) : null;
const dumpDirs = [path.join(profile, "Crashpad", "reports"), path.join(profile, "Crashpad", "pending"), path.join(localappdata, "CrashDumps")];
const dumps = dumpDirs.flatMap((d) => (fs.existsSync(d) ? fs.readdirSync(d).map((f) => path.join(d, f)) : []));
const has = (arr, s) => (arr || []).filter((l) => l.includes(s)).length;
rec.census = {
  errorLog: errLines === null ? "none written" : { lines: errLines.length, styleNull: has(errLines, "Cannot destructure property 'style'"), resizeObserverLoop: has(errLines, "ResizeObserver loop"), other: errLines.filter((l) => !l.includes("Cannot destructure property 'style'") && !l.includes("ResizeObserver loop")).slice(0, 20) },
  stdio: { lines: lines.length, styleNull: has(lines, "Cannot destructure property 'style'"), resizeObserverLoop: has(lines, "ResizeObserver loop"), flagged: lines.filter((l) => /error|unhandled|rejection|crash|exception/i.test(l)).slice(0, 40) },
  crashDumps: dumps,
};
if (fs.existsSync(path.join(dataDir, "settings.json"))) { rec.exitSettings = JSON.parse(fs.readFileSync(path.join(dataDir, "settings.json"), "utf8")); for (const k of Object.keys(rec.exitSettings)) if (k.startsWith("_")) delete rec.exitSettings[k]; }
if (errLines) fs.copyFileSync(errLog, path.join(dir, "error.log"));
rec.live.after = liveHash();
rec.live.unchanged = JSON.stringify(rec.live.before) === JSON.stringify(rec.live.after);
finish(0);

// NARRATE-FRAME-GATE-1 (F-036) — the display precondition for frame-sensitive sessions. An Electron main script:
//   electron display-probe.cjs --out <file> [--break]
// Opens a visible, always-on-top BrowserWindow on an inline blank page, records requestAnimationFrame intervals and
// document.visibilityState for 5 s, and writes { at, electron, displayFrequency, visibilityState, frames, p50, p90, max,
// limitMs, valid, invalidReasons, modernStandby }. Valid = visibilityState "visible", p90 within 1.5 x the primary
// display's refresh interval (screen.getPrimaryDisplay().displayFrequency), and the host not in Modern Standby (Brain1
// addendum, F-036: a never-shown window can read "visible" with ~18 ms timer frames and no display at all). invalidReasons
// holds any of "not-visible", "p90-over-limit", "modern-standby". Exit 0 valid, 7 invalid, 8 could not run (also invalid).
// --break creates the window with show:false, so visibilityState is "hidden" and it must exit 7 (standing rule 55).
// modernStandby is the latest Kernel-Power 506 (entered) or 507 (left) event, read through pwsh. Last event 506 makes the
// probe invalid; a failed read records null with its error and does not by itself invalidate the probe.
const { app, BrowserWindow, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");

const PROBE_MS = 5000;
const P90_FACTOR = 1.5;
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const OUT = arg("--out");
const BREAK = process.argv.includes("--break");

function modernStandby() {
  try {
    const ps = "$e = Get-WinEvent -FilterHashtable @{LogName='System';ProviderName='Microsoft-Windows-Kernel-Power';Id=506,507} -MaxEvents 1 -ErrorAction Stop; [Console]::Out.Write((@{ id = $e.Id; at = $e.TimeCreated.ToUniversalTime().ToString('o') } | ConvertTo-Json -Compress))";
    const raw = execFileSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", ps], { encoding: "utf8", windowsHide: true, timeout: 20000 });
    const e = JSON.parse(raw);
    return { lastEvent: e.id, state: e.id === 506 ? "entered" : "left", at: e.at, error: null };
  } catch (err) {
    return { lastEvent: null, state: null, at: null, error: String((err && err.message) || err).slice(0, 300) };
  }
}

function write(result, code) {
  if (OUT) { fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(result, null, 2)); }
  console.log(JSON.stringify(result));
  app.exit(code);
}

if (!OUT) { console.error("usage: electron display-probe.cjs --out <file> [--break]"); process.exit(8); }
app.setPath("userData", fs.mkdtempSync(path.join(os.tmpdir(), "blurby-display-probe-")));
app.whenReady().then(async () => {
  const base = { at: new Date().toISOString(), electron: process.versions.electron, break: BREAK ? "minimized" : false };
  try {
    const displayFrequency = screen.getPrimaryDisplay().displayFrequency || null;
    const w = new BrowserWindow({ width: 320, height: 200, show: true, alwaysOnTop: true, title: "display probe", webPreferences: { backgroundThrottling: true } });
    await w.loadURL("data:text/html,<body>display probe</body>");
    // NARRATE-FRAME-GATE-1 negative control: a shown window, then minimized (awaiting its event), then measured.
    if (BREAK) { const m = new Promise((res) => w.once("minimize", res)); w.minimize(); await m; }
    const r = await w.webContents.executeJavaScript(`new Promise((res) => {
      const dts = []; let last = performance.now(); const end = last + ${PROBE_MS};
      const done = () => res({ dts, visibilityState: document.visibilityState });
      const tick = () => { const n = performance.now(); dts.push(n - last); last = n; if (n < end) requestAnimationFrame(tick); else done(); };
      requestAnimationFrame(tick);
      setTimeout(() => { if (performance.now() >= end) { dts.push(performance.now() - last); done(); } }, ${PROBE_MS} + 1000);
    })`);
    w.destroy();
    const s = [...r.dts].sort((a, b) => a - b);
    const q = (p) => (s.length ? +s[Math.min(s.length - 1, Math.floor(s.length * p))].toFixed(2) : null);
    const limitMs = displayFrequency ? +((1000 / displayFrequency) * P90_FACTOR).toFixed(2) : null;
    const p90 = q(0.9);
    const standby = modernStandby();
    const invalidReasons = [];
    if (r.visibilityState !== "visible") invalidReasons.push("not-visible");
    if (limitMs === null || p90 === null || p90 > limitMs) invalidReasons.push("p90-over-limit");
    if (standby.lastEvent === 506) invalidReasons.push("modern-standby");
    const valid = invalidReasons.length === 0;
    write({ ...base, displayFrequency, visibilityState: r.visibilityState, frames: s.length, p50: q(0.5), p90, max: s.length ? +s[s.length - 1].toFixed(2) : null, limitMs, valid, invalidReasons, modernStandby: standby }, valid ? 0 : 7);
  } catch (err) {
    write({ ...base, displayFrequency: null, visibilityState: null, frames: 0, p50: null, p90: null, max: null, limitMs: null, valid: false, invalidReasons: ["could-not-run"], modernStandby: modernStandby(), error: String((err && err.stack) || err) }, 8);
  }
});

// UI-SWEEP-1 — press every control on every screen of a packaged Blurby build over CDP, and record what each press did.
// Dev tooling only: scripts/ is not in package.json build.files, so this never ships. Node 24 built-ins only
// (fetch, the global WebSocket, child_process, fs, crypto). Usage: see scripts/ui-sweep/README.md.
//
//   node scripts/ui-sweep/sweep.mjs --exe <copy of release\win-*-unpacked\Blurby.exe> --profile <scratch dir>
//        --seed <file>[,<file>...] --artifacts <dir> --report <report.md> [--port 9350] [--only <surface,...>]
//        [--live-profile <dir with library.json/settings.json to hash, never opened>] [--timebox-min 120]
//   node scripts/ui-sweep/sweep.mjs --dry-run --browser <msedge.exe> --artifacts <dir> --report <report.md>
//
// Results per control: OK (DOM/state changed or navigation, no error), ERROR (exception, console error or error.log
// growth), NO-EFFECT, SKIPPED-SAFETY (denylist), SKIPPED-DIALOG (a native dialog opened; dismissed), UNREACHABLE.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

// ── arguments ───────────────────────────────────────────────────────────────────────────────────────────────────
const args = parseArgs(process.argv.slice(2));
function parseArgs(argv) {
  const out = { port: 9350, timeboxMin: 120 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i];
    if (a === "--exe") out.exe = val();
    else if (a === "--profile") out.profile = val();
    else if (a === "--seed") out.seed = val().split(",").filter(Boolean);
    else if (a === "--artifacts") out.artifacts = val();
    else if (a === "--report") out.report = val();
    else if (a === "--port") out.port = Number(val());
    else if (a === "--only") out.only = val().split(",");
    else if (a === "--live-profile") out.liveProfile = val();
    else if (a === "--timebox-min") out.timeboxMin = Number(val());
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--browser") out.browser = val();
    else if (a === "--models") out.modelsRoot = val();
    else throw new Error(`unknown argument ${a}`);
  }
  if (!out.artifacts || !out.report) throw new Error("--artifacts and --report are required");
  if (!out.dryRun && (!out.exe || !out.profile)) throw new Error("--exe and --profile are required (or --dry-run)");
  return out;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

// ── CDP client (one page target; the global WebSocket) ─────────────────────────────────────────────────────────
class Cdp {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); this.handlers = new Map(); }
  async open() {
    this.ws = new WebSocket(this.url);
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = () => rej(new Error("CDP websocket error")); });
    this.ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && this.pending.has(d.id)) {
        const p = this.pending.get(d.id); this.pending.delete(d.id);
        d.error ? p.reject(new Error(`${p.method}: ${d.error.message}`)) : p.resolve(d.result);
      } else if (d.method) (this.handlers.get(d.method) || []).forEach((fn) => fn(d.params));
    };
    this.ws.onclose = () => { for (const p of this.pending.values()) p.reject(new Error("CDP closed")); this.pending.clear(); this.closed = true; };
  }
  send(method, params = {}, timeoutMs = 15000) {
    if (this.closed) return Promise.reject(new Error("CDP closed"));
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(Object.assign(new Error(`${method}: timeout`), { hang: true })); } }, timeoutMs);
    });
  }
  on(event, fn) { if (!this.handlers.has(event)) this.handlers.set(event, []); this.handlers.get(event).push(fn); }
  close() { try { this.ws.close(); } catch { /* gone */ } }
  async eval(expr, timeoutMs = 10000) {
    const r = await this.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, timeout: timeoutMs }, timeoutMs + 2000);
    if (r.exceptionDetails) throw new Error(`eval: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
    return r.result.value;
  }
}

// ── in-page helpers (installed once per page load as window.__sweep) ────────────────────────────────────────────
const PAGE_HELPERS = String.raw`(() => {
  if (window.__sweep) return true;
  const SEL = 'button, [role=button], [role=menuitem], [role=tab], a[href], input, select, textarea, [tabindex="0"]';
  const shown = (el) => {
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false; }
    return !el.closest('[aria-hidden="true"], [inert]');
  };
  const label = (el) => {
    const t = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const by = el.getAttribute('aria-labelledby'); const lb = by ? t(by.split(/\s+/).map((id) => document.getElementById(id)?.innerText).join(' ')) : '';
    const own = el.labels && el.labels[0] ? t(el.labels[0].innerText) : '';
    return t(el.getAttribute('aria-label')) || lb || own || t(el.innerText).slice(0, 80) || t(el.getAttribute('title')) || t(el.getAttribute('placeholder'))
      || t(el.getAttribute('value')) || t(el.getAttribute('name')) || (el.id ? '#' + el.id : '') || '(' + el.tagName.toLowerCase() + (el.type ? ':' + el.type : '') + ')';
  };
  const cssPath = (el) => {
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && e !== document.documentElement; e = e.parentElement) {
      let s = e.tagName.toLowerCase();
      if (e.id && /^[A-Za-z][\w-]*$/.test(e.id) && document.querySelectorAll('#' + e.id).length === 1) { parts.unshift(s + '#' + e.id); break; }
      const p = e.parentElement;
      if (p) { const same = [...p.children].filter((c) => c.tagName === e.tagName); if (same.length > 1) s += ':nth-of-type(' + (same.indexOf(e) + 1) + ')'; }
      parts.unshift(s);
    }
    return parts.join(' > ');
  };
  const role = (el) => el.getAttribute('role') || ({ a: 'link', button: 'button', input: 'input:' + (el.type || 'text'), select: 'select', textarea: 'textarea' })[el.tagName.toLowerCase()] || el.tagName.toLowerCase();
  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
  const state = () => [...document.querySelectorAll(SEL + ', [aria-pressed], [aria-checked], [aria-selected], [aria-expanded]')].map((e) =>
    [e.getAttribute('aria-pressed'), e.getAttribute('aria-checked'), e.getAttribute('aria-selected'), e.getAttribute('aria-expanded'), e.checked, e.value, e.disabled].join('|')).join(';');
  const attrs = (e) => e ? [...e.attributes].map((a) => a.name + '=' + a.value).join(' ') : '';
  // Focus counts as an effect only when it lands on a text-entry control: a clicked button always takes focus.
  const entry = (e) => !!e && (e.isContentEditable || e.tagName === 'TEXTAREA' || e.tagName === 'SELECT' || (e.tagName === 'INPUT' && !/^(button|submit|reset|checkbox|radio|image|file|range|color)$/.test(e.type)));
  const foliate = () => [...document.querySelectorAll('foliate-view')].map((fv) => { try { return (fv.lastLocation && fv.lastLocation.cfi) || ''; } catch { return ''; } }).join(',');
  window.__sweep = {
    enumerate(scope) {
      const root = scope ? document.querySelector(scope) : document;
      if (!root) return null;
      return [...root.querySelectorAll(SEL)].filter(shown).map((el) => ({
        label: label(el), role: role(el), selector: cssPath(el), tag: el.tagName.toLowerCase(),
        href: el.getAttribute('href') || '', target: el.getAttribute('target') || '', disabled: !!(el.disabled || el.getAttribute('aria-disabled') === 'true'),
      }));
    },
    digest() {
      const body = document.body;
      return { count: document.querySelectorAll('*').length, text: hash(body ? body.innerText : ''), state: hash(state()),
        root: hash(attrs(document.documentElement) + '|' + attrs(body) + '|' + (body ? getComputedStyle(body).backgroundColor + getComputedStyle(body).color : '')),
        active: entry(document.activeElement) ? cssPath(document.activeElement) : '', href: location.href, foliate: foliate() };
    },
    has(sel) { const el = document.querySelector(sel); return !!el && shown(el); },
    box(selector) {
      const el = document.querySelector(selector); if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const top = document.elementFromPoint(x, y);
      return { x, y, covered: !!top && top !== el && !el.contains(top) && !top.contains(el), coveredBy: top ? cssPath(top) : '' };
    },
  };
  return true;
})()`;

// ── denylist and dialog heuristics ──────────────────────────────────────────────────────────────────────────────
// Never pressed: external URLs and mail, sign-in/OAuth/connect, update check/install, bug-report send/submit,
// publish/upload/share. Recorded SKIPPED-SAFETY with the control's label.
// Beyond the specification's list, three controls leave the sandbox and are denied with their reason:
// "start at login" (changes the OS login items), "Open Reading Log/Notes" (shell.openPath launches another app),
// and library key O / "Open source" (shell.openExternal). "restart" and "Install & restart" quit to install an update.
const DENY_LABEL = /\b(sign ?in|log ?in|sign ?out|log ?out|connect|disconnect|authori[sz]e|oauth|google|microsoft|onedrive|dropbox|box\.com|icloud|check for updates?|install update|install & restart|install and restart|update now|restart|send|submit|publish|upload|share|website|github|privacy policy|terms|contact|e-?mail us|mailto|open in browser|learn more|docs|documentation|fetch|new code|sync now|full sync|start at login|launch at login|open reading (log|notes)|open source|define)\b/i;
function denied(c) {
  if (/^(https?:|mailto:|tel:)/i.test(c.href) || c.target === "_blank") return `external link (${c.href || c.target})`;
  if (c.key && /^(Ctrl\+R|Ctrl\+Shift\+R|Ctrl\+W|Ctrl\+Shift\+I|Alt\+F4|F5)$/i.test(c.key)) return "Electron default menu accelerator (reload, close or devtools)";
  const m = c.label.match(DENY_LABEL);
  return m ? `label matches "${m[0]}"` : null;
}
const DESTRUCTIVE = /\b(delete|remove|clear|reset|erase|forget|unpair|wipe|discard|trash|normalize|apply)\b/i;
const DIALOG_HINT = /\b(browse|choose (a )?folder|select folder|open folder|import|add (a )?(book|file)s?|open file|export|save as|change folder|pick)\b/i;

// ── native dialog watcher (one persistent pwsh; EnumWindows by owner pid, class #32770) ─────────────────────────
class DialogWatcher {
  constructor() {
    if (process.platform !== "win32") return;
    this.ps = spawn("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "-"], { stdio: ["pipe", "pipe", "inherit"] });
    this.buf = ""; this.waiters = [];
    // pwsh writes CRLF on Windows: the marker line is "@@END\r\n" there, "@@END\n" elsewhere.
    this.ps.stdout.on("data", (d) => { this.buf += d; let m; while ((m = /@@END\r?\n/.exec(this.buf))) { const chunk = this.buf.slice(0, m.index); this.buf = this.buf.slice(m.index + m[0].length); const w = this.waiters.shift(); if (w) w(chunk.trim()); } });
    this.run(`Add-Type @'
using System; using System.Text; using System.Collections.Generic; using System.Runtime.InteropServices;
public static class SweepWin {
  delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern IntPtr PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  public static string Dialogs(uint pid, bool close) {
    var found = new List<string>();
    EnumWindows((h, l) => { uint p; GetWindowThreadProcessId(h, out p); if (p != pid || !IsWindowVisible(h)) return true;
      var c = new StringBuilder(256); GetClassName(h, c, 256); if (c.ToString() != "#32770") return true;
      var t = new StringBuilder(512); GetWindowText(h, t, 512); found.Add(t.ToString()); if (close) PostMessage(h, 0x0010, IntPtr.Zero, IntPtr.Zero); return true; }, IntPtr.Zero);
    return string.Join("|", found);
  }
}
'@`);
  }
  // A helper that never answers must not hang the sweep: after 20 s the call resolves empty (no dialog seen).
  run(cmd) {
    if (!this.ps) return Promise.resolve("");
    return new Promise((res) => {
      let done = false;
      const finish = (v) => { if (!done) { done = true; res(v); } };
      this.waiters.push(finish);
      setTimeout(() => { const i = this.waiters.indexOf(finish); if (i >= 0) this.waiters.splice(i, 1); finish(""); }, 20000);
      this.ps.stdin.write(`${cmd}\nWrite-Output '@@END'\n`);
    });
  }
  async dialogs(pid, close) { return pid ? (await this.run(`[SweepWin]::Dialogs(${pid}, $${close ? "true" : "false"})`)).split(/\r?\n/).pop() : ""; }
  stop() { try { this.ps?.stdin.end(); this.ps?.kill(); } catch { /* gone */ } }
}

// ── app session: launch (or attach), attach CDP, collect errors ────────────────────────────────────────────────
class Session {
  constructor(opts) { this.opts = opts; this.errors = []; this.navigations = 0; this.jsDialogs = []; }
  async start() {
    const { port } = this.opts;
    if (this.opts.dryRun) {
      this.proc = spawn(this.opts.browser, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(this.opts.artifacts, "edge-profile")}`, "--no-first-run", "--window-size=1280,800", this.opts.pageUrl], { stdio: "ignore" });
    } else {
      const env = { ...process.env, BLURBY_USER_DATA_DIR: this.opts.profile, ...(this.opts.modelsRoot ? { NARRATE_MODELS_ROOT: this.opts.modelsRoot } : {}) };
      delete env.ELECTRON_RUN_AS_NODE;
      this.proc = spawn(this.opts.exe, [`--remote-debugging-port=${port}`], { env, stdio: ["ignore", "pipe", "pipe"] });
      this.proc.stdout.on("data", () => {}); this.proc.stderr.on("data", () => {});
    }
    this.pid = this.proc.pid;
    this.exited = new Promise((r) => this.proc.on("exit", (code) => { this.exitCode = code; r(code); }));
    let target;
    for (let i = 0; i < 240 && !target; i++) {
      try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); target = list.find((t) => t.type === "page" && !/^devtools:/.test(t.url)); } catch { /* not up */ }
      if (!target) await sleep(500);
    }
    if (!target) throw new Error("no CDP page target");
    this.cdp = new Cdp(target.webSocketDebuggerUrl);
    await this.cdp.open();
    this.cdp.on("Runtime.exceptionThrown", (p) => this.errors.push({ kind: "exception", text: (p.exceptionDetails.exception?.description || p.exceptionDetails.text || "").split("\n")[0] }));
    this.cdp.on("Runtime.consoleAPICalled", (p) => { if (p.type === "error") this.errors.push({ kind: "console.error", text: p.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 300) }); });
    this.cdp.on("Page.frameNavigated", (p) => { if (!p.frame.parentId) this.navigations++; });
    this.cdp.on("Page.loadEventFired", () => { this.helpersOk = false; });
    // A page alert()/confirm() blocks the renderer: accept it and record it.
    this.cdp.on("Page.javascriptDialogOpening", (p) => { this.jsDialogs.push(`${p.type}: ${p.message}`.slice(0, 200)); this.cdp.send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {}); });
    this.mainTarget = target.id;
    await this.cdp.send("Runtime.enable"); await this.cdp.send("Page.enable");
    await this.helpers();
  }
  async helpers() { await this.cdp.eval(PAGE_HELPERS); this.helpersOk = true; }
  async sw(call, timeoutMs) { if (!this.helpersOk) await this.helpers(); return this.cdp.eval(`window.__sweep ? window.__sweep.${call} : (${PAGE_HELPERS}, window.__sweep.${call})`, timeoutMs); }
  // Other page targets (a second window opened by a press): close them and report their URLs.
  async closeExtraWindows() {
    try {
      const list = await (await fetch(`http://127.0.0.1:${this.opts.port}/json/list`)).json();
      const extra = list.filter((t) => t.type === "page" && t.id !== this.mainTarget && !/^devtools:/.test(t.url));
      for (const t of extra) await fetch(`http://127.0.0.1:${this.opts.port}/json/close/${t.id}`).catch(() => {});
      return extra.map((t) => t.url);
    } catch { return []; }
  }
  async stop() { this.cdp?.close(); try { this.proc.kill(); } catch { /* gone */ } await Promise.race([this.exited, sleep(5000)]); }
  async screenshot(file) {
    try { const r = await this.cdp.send("Page.captureScreenshot", { format: "png" }, 10000); fs.writeFileSync(file, Buffer.from(r.data, "base64")); return path.basename(file); } catch { return ""; }
  }
  async click(x, y) {
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) await this.cdp.send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  }
  async key(spec) {
    const k = parseKey(spec);
    await this.cdp.send("Input.dispatchKeyEvent", { type: k.text ? "keyDown" : "rawKeyDown", key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, modifiers: k.mods, text: k.text });
    await this.cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: k.key, code: k.code, windowsVirtualKeyCode: k.vk, modifiers: k.mods });
  }
}

// Key specs: "Escape", "Space", "ArrowRight", "Ctrl+K", "Shift+?", "a", "1".
function parseKey(spec) {
  const parts = spec.split("+").map((s) => s.trim()).filter(Boolean);
  let key = parts.pop() || spec; let mods = 0;
  for (const m of parts) { const l = m.toLowerCase(); if (l === "alt") mods |= 1; else if (l === "ctrl" || l === "control") mods |= 2; else if (l === "meta" || l === "cmd") mods |= 4; else if (l === "shift") mods |= 8; }
  const named = { escape: ["Escape", "Escape", 27], esc: ["Escape", "Escape", 27], enter: ["Enter", "Enter", 13], space: [" ", "Space", 32], tab: ["Tab", "Tab", 9],
    backspace: ["Backspace", "Backspace", 8], delete: ["Delete", "Delete", 46], home: ["Home", "Home", 36], end: ["End", "End", 35], pageup: ["PageUp", "PageUp", 33], pagedown: ["PageDown", "PageDown", 34],
    arrowleft: ["ArrowLeft", "ArrowLeft", 37], arrowup: ["ArrowUp", "ArrowUp", 38], arrowright: ["ArrowRight", "ArrowRight", 39], arrowdown: ["ArrowDown", "ArrowDown", 40],
    left: ["ArrowLeft", "ArrowLeft", 37], up: ["ArrowUp", "ArrowUp", 38], right: ["ArrowRight", "ArrowRight", 39], down: ["ArrowDown", "ArrowDown", 40],
    "←": ["ArrowLeft", "ArrowLeft", 37], "↑": ["ArrowUp", "ArrowUp", 38], "→": ["ArrowRight", "ArrowRight", 39], "↓": ["ArrowDown", "ArrowDown", 40] };
  const n = named[key.toLowerCase()];
  if (n) return { key: n[0], code: n[1], vk: n[2], mods, text: n[0] === " " && !(mods & 2) ? " " : n[0] === "Enter" ? "\r" : undefined };
  if (/^f([1-9]|1[0-2])$/i.test(key)) { const f = Number(key.slice(1)); return { key: key.toUpperCase(), code: key.toUpperCase(), vk: 111 + f, mods }; }
  const ch = key.length === 1 ? key : key[0];
  const upper = ch.toUpperCase();
  const shifted = { "?": ["Slash", 191], "/": ["Slash", 191], ",": ["Comma", 188], ".": ["Period", 190], "<": ["Comma", 188], ">": ["Period", 190], "[": ["BracketLeft", 219], "]": ["BracketRight", 221], "-": ["Minus", 189], "=": ["Equal", 187], "+": ["Equal", 187], "\\": ["Backslash", 220], ";": ["Semicolon", 186], "'": ["Quote", 222], "`": ["Backquote", 192] };
  shifted["#"] = ["Digit3", 51]; shifted["!"] = ["Digit1", 49]; shifted["@"] = ["Digit2", 50];
  if (shifted[ch]) { if ("?<>+#!@".includes(ch)) mods |= 8; return { key: ch, code: shifted[ch][0], vk: shifted[ch][1], mods, text: mods & 6 ? undefined : ch }; }
  if (/[0-9]/.test(ch)) return { key: ch, code: `Digit${ch}`, vk: ch.charCodeAt(0), mods, text: mods & 6 ? undefined : ch };
  const k = mods & 8 ? upper : ch.toLowerCase();
  return { key: k, code: `Key${upper}`, vk: upper.charCodeAt(0), mods, text: mods & 6 ? undefined : k };
}

// ── error.log tail ──────────────────────────────────────────────────────────────────────────────────────────────
function logSize(file) { try { return fs.statSync(file).size; } catch { return 0; } }
function logSince(file, from) {
  try { const fd = fs.openSync(file, "r"); const size = fs.fstatSync(fd).size; if (size <= from) { fs.closeSync(fd); return ""; } const b = Buffer.alloc(Math.min(size - from, 64 * 1024)); fs.readSync(fd, b, 0, b.length, from); fs.closeSync(fd); return b.toString("utf8"); } catch { return ""; }
}

// ── press one control and classify ──────────────────────────────────────────────────────────────────────────────
function changed(a, b) {
  if (!a || !b) return [];
  return ["count", "text", "state", "root", "active", "href", "foliate"].filter((k) => a[k] !== b[k]);
}
async function waitChange(s, before, maxMs = 1000) {
  const t0 = Date.now(); let after = before;
  while (Date.now() - t0 < maxMs) { await sleep(100); try { after = await s.sw("digest()", 4000); } catch (e) { if (e.hang) throw e; } if (changed(before, after).length) { await sleep(250); return s.sw("digest()", 4000); } }
  return after;
}

async function press(s, ctx, surface, c, how) {
  const row = { surface: surface.name, label: c.label, selector: c.selector || `key ${c.key}`, result: "", evidence: "" };
  const deny = c.key ? null : denied(c);
  if (deny) { row.result = "SKIPPED-SAFETY"; row.evidence = deny; return row; }
  const tag = `${ctx.counter++}`.padStart(4, "0");
  const errBefore = s.errors.length; const navBefore = s.navigations; const logFrom = logSize(ctx.errorLog); const jsBefore = s.jsDialogs.length;
  let box = null;
  try {
    if (!c.key) { box = await s.sw(`box(${JSON.stringify(c.selector)})`, 4000); if (!box) { row.result = "UNREACHABLE"; row.evidence = "control not found after reset"; return row; } }
    const before = await s.sw("digest()", 4000);
    const shotBefore = ctx.shots ? await s.screenshot(path.join(ctx.shotDir, `${tag}-before.png`)) : "";
    if (c.key) { for (const k of c.key.split(" then ")) { await s.key(k); await sleep(120); } } else await s.click(box.x, box.y);
    const after = await waitChange(s, before);
    const windows = ctx.dryRun ? [] : await s.closeExtraWindows();
    const alerts = s.jsDialogs.slice(jsBefore);
    const shotAfter = ctx.shots ? await s.screenshot(path.join(ctx.shotDir, `${tag}-after.png`)) : "";
    let dialogs = "";
    if (!ctx.dryRun && (DIALOG_HINT.test(c.label) || !changed(before, after).length)) {
      dialogs = await ctx.watcher.dialogs(s.pid, false);
      if (dialogs) { await ctx.watcher.dialogs(s.pid, true); await sleep(500); }
    }
    const errs = s.errors.slice(errBefore); const logAdded = logSince(ctx.errorLog, logFrom);
    const diff = changed(before, after); const nav = s.navigations > navBefore;
    const ev = [];
    if (errs.length) ev.push(...errs.slice(0, 3).map((e) => `${e.kind}: ${e.text}`));
    if (logAdded) ev.push(`error.log +${Buffer.byteLength(logAdded)} B: ${logAdded.replace(/\s+/g, " ").slice(0, 240)}`);
    if (dialogs) ev.push(`native dialog "${dialogs}" (dismissed)`);
    if (windows.length) ev.push(`opened window ${windows.join(", ")} (closed)`);
    if (alerts.length) ev.push(`page dialog ${alerts.join(" / ")} (accepted)`);
    if (diff.length) ev.push(`changed: ${diff.join(",")}`);
    if (nav) ev.push("navigated");
    if (c.disabled) ev.push("disabled");
    if (box?.covered) ev.push(`covered by ${box.coveredBy}`);
    if (shotBefore) ev.push(`shots ${shotBefore}, ${shotAfter}`);
    row.result = errs.length || logAdded ? "ERROR" : dialogs ? "SKIPPED-DIALOG" : diff.length || nav || windows.length || alerts.length ? "OK" : "NO-EFFECT";
    row.evidence = ev.join("; ");
    row.logText = logAdded; row.errTexts = errs.map((e) => e.text);
  } catch (e) {
    row.result = "ERROR"; row.evidence = e.hang ? `hang: ${e.message}` : `sweep: ${e.message}`; row.hang = !!e.hang;
  }
  return row;
}

// ── surfaces: enter from the start state, sweep, reset ──────────────────────────────────────────────────────────
const fill = (v, vars) => (typeof v === "string" ? v.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`) : v);
async function runSteps(s, steps, vars = {}) {
  for (const raw of steps) {
    const st = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, fill(v, vars)]));
    if (st.unless && (await s.sw(`has(${JSON.stringify(st.unless)})`))) continue;
    if (st.rightClick) {
      const b = await s.sw(`box(${JSON.stringify(st.rightClick)})`); if (!b) throw new Error(`step: ${st.rightClick} not found`);
      for (const type of ["mousePressed", "mouseReleased"]) await s.cdp.send("Input.dispatchMouseEvent", { type, x: b.x, y: b.y, button: "right", clickCount: 1 });
    } else if (st.clickText) {
      const sel = await s.cdp.eval(`(() => { const want = ${JSON.stringify(st.clickText)}.toLowerCase(); const el = [...document.querySelectorAll(${JSON.stringify(st.within || "*")})].find((e) => (e.innerText || "").trim().toLowerCase().startsWith(want)); if (!el) return null; el.setAttribute("data-sweep-step", "1"); return '[data-sweep-step="1"]'; })()`);
      if (!sel) throw new Error(`step: text "${st.clickText}" not found`);
      const b = await s.sw(`box(${JSON.stringify(sel)})`); await s.click(b.x, b.y);
      await s.cdp.eval(`document.querySelector('[data-sweep-step="1"]')?.removeAttribute("data-sweep-step")`).catch(() => {});
    } else if (st.click) {
      let ok = false;
      for (let i = 0; i < (st.waitMs ?? 8000) / 250 && !ok; i++) { ok = await s.sw(`has(${JSON.stringify(st.click)})`); if (!ok) await sleep(250); }
      if (!ok) throw new Error(`step: ${st.click} not found`);
      const b = await s.sw(`box(${JSON.stringify(st.click)})`); await s.click(b.x, b.y);
    } else if (st.key) await s.key(st.key);
    else if (st.wait) { let ok = false; for (let i = 0; i < (st.waitMs ?? 30000) / 250 && !ok; i++) { ok = await s.sw(`has(${JSON.stringify(st.wait)})`); if (!ok) await sleep(250); } if (!ok) throw new Error(`step: waited for ${st.wait}`); }
    else if (st.eval) await s.cdp.eval(st.eval, st.waitMs ?? 30000);
    if (st.sleep) await sleep(st.sleep);
  }
}
async function home(s, plan) {
  await s.cdp.send("Page.reload", { ignoreCache: false }).catch(() => {});
  s.helpersOk = false; await sleep(800);
  for (let i = 0; i < 120; i++) { try { await s.helpers(); if (await s.sw(`has(${JSON.stringify(plan.homeSignature)})`)) break; } catch { /* loading */ } await sleep(250); }
  // The onboarding surface clears firstRunCompleted; until a press completes it again, a reload shows the tour over
  // the library and blocks every route. Skip it here so later surfaces start from the library.
  if (plan.onboardingSkip) { try { if (await s.sw(`has(${JSON.stringify(plan.onboardingSkip)})`)) { const b = await s.sw(`box(${JSON.stringify(plan.onboardingSkip)})`); await s.click(b.x, b.y); await sleep(800); } } catch { /* no tour */ } }
  if (plan.homeSteps) await runSteps(s, plan.homeSteps, plan.vars);
}
async function enter(s, plan, surface) { await home(s, plan); await runSteps(s, surface.enter || [], plan.vars); if (surface.signature) await runSteps(s, [{ wait: surface.signature, waitMs: surface.waitMs ?? 30000 }], plan.vars); }
async function onSurface(s, surface, vars = {}) { if (!surface.signature) return true; try { return await s.sw(`has(${JSON.stringify(fill(surface.signature, vars))})`, 4000); } catch { return false; } }

async function sweepSurface(sess, ctx, plan, surface, deferred) {
  const out = { surface, rows: [], walk: [], unreachable: "" };
  if (surface.unreachable) { out.unreachable = surface.unreachable; return out; }
  if (surface.note) { out.note = surface.note; out.count = 0; return out; }
  try { await enter(sess.s, plan, surface); } catch (e) { out.unreachable = `${surface.unreachableIfMissing ? surface.unreachableIfMissing + " " : ""}(${e.message})`; return out; }
  out.walk.push(`entered: ${(surface.enter || []).map((st) => st.click || (st.key && "key " + st.key) || (st.wait && "wait " + st.wait) || "eval").join(" → ") || "(start state)"}`);
  let controls;
  if (surface.keys) {
    try { controls = typeof surface.keys === "function" ? await surface.keys(sess.s, plan) : surface.keys; }
    catch (e) { out.unreachable = `its key list could not be read (${e.message})`; return out; }
    controls = controls.map((k) => ({ key: k.key, label: k.label || k.key }));
    // Reading the key list may have left the surface (the Hotkey Map is a settings pane): enter it again.
    if (!(await onSurface(sess.s, surface, plan.vars))) { try { await enter(sess.s, plan, surface); } catch (e) { out.unreachable = `could not re-enter after reading its keys (${e.message})`; return out; } }
  } else {
    controls = (await sess.s.sw(`enumerate(${JSON.stringify(surface.scope || null)})`, 8000)) || [];
    const seen = new Set();
    controls = controls.filter((c) => { const id = `${c.label}|${c.role}`; if (seen.has(id)) return false; seen.add(id); return !(surface.exclude && surface.exclude.test(c.label)); });
  }
  out.count = controls.length;
  for (const c of controls) {
    if (ctx.timeUp()) { out.rows.push({ surface: surface.name, label: c.label, selector: c.selector || `key ${c.key}`, result: "UNREACHABLE", evidence: "run timebox reached before this control" }); continue; }
    if (DESTRUCTIVE.test(c.label) && !denied(c)) { deferred.push({ surface, c }); continue; }
    if (!(await onSurface(sess.s, surface, plan.vars))) { try { await enter(sess.s, plan, surface); } catch (e) { out.rows.push({ surface: surface.name, label: c.label, selector: c.selector, result: "UNREACHABLE", evidence: `could not re-enter surface: ${e.message}` }); continue; } }
    const row = await press(sess.s, ctx, surface, c);
    out.rows.push(row);
    log(`${surface.name} | ${row.result.padEnd(14)} | ${c.label.slice(0, 50)}`);
    if (row.hang || sess.s.exitCode !== undefined) { out.walk.push(`restart after "${c.label}" (${row.hang ? "hang" : "exit " + sess.s.exitCode})`); await sess.restart(false); continue; }
    if (!surface.noEscapeReset) { try { await sess.s.key("Escape"); await sleep(250); } catch { /* reset below */ } }
    if (!(await onSurface(sess.s, surface, plan.vars))) { try { await enter(sess.s, plan, surface); } catch { /* next control re-enters */ } }
  }
  return out;
}

// ── run ─────────────────────────────────────────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(args.artifacts, { recursive: true });
  const t0 = Date.now();
  const ctx = { counter: 1, shots: true, shotDir: path.join(args.artifacts, "shots"), dryRun: !!args.dryRun, watcher: args.dryRun ? null : new DialogWatcher(),
    // main.js: error.log is <userData>/blurby-data/error.log, and BLURBY_USER_DATA_DIR sets userData.
    errorLog: args.dryRun ? path.join(args.artifacts, "no-error.log") : path.join(args.profile, "blurby-data", "error.log"), timeUp: () => Date.now() - t0 > args.timeboxMin * 60000 };
  fs.mkdirSync(ctx.shotDir, { recursive: true });
  const live = hashLive(args.liveProfile);
  const plan = args.dryRun ? dryRunPlan(args) : blurbyPlan(args);
  const pristine = args.dryRun ? null : path.join(args.artifacts, "profile-pristine");
  const sess = {
    s: null,
    async restart(reseed) { if (this.s) await this.s.stop(); if (reseed && pristine) { fs.rmSync(args.profile, { recursive: true, force: true }); fs.cpSync(pristine, args.profile, { recursive: true }); } this.s = new Session({ ...args, pageUrl: plan.pageUrl }); await this.s.start(); },
  };
  await sess.restart(false);
  if (!args.dryRun && plan.seed) { await plan.seed(sess.s, args); await sess.s.stop(); fs.rmSync(pristine, { recursive: true, force: true }); fs.cpSync(args.profile, pristine, { recursive: true }); await sess.restart(false); }
  // Read what later surfaces need (the Hotkey Map's rows) once, from the clean start state.
  if (!args.dryRun && plan.prefetch) { try { await plan.prefetch(sess.s, plan); log("prefetched hotkey rows"); } catch (e) { log(`prefetch failed: ${e.message}`); } }
  const results = []; const deferred = [];
  for (const surface of plan.surfaces) {
    if (args.only && !args.only.includes(surface.name)) continue;
    log(`surface ${surface.name}`);
    // One surface's failure is recorded on that surface; the run goes on to the next.
    try { results.push(await sweepSurface(sess, ctx, plan, surface, deferred)); }
    catch (e) {
      log(`surface ${surface.name} failed: ${e.message}`);
      results.push({ surface, rows: [], walk: [], unreachable: `the sweep failed on this surface (${e.message})` });
      try { await sess.restart(false); } catch (e2) { log(`restart failed: ${e2.message}`); }
    }
  }
  // Destructive controls last, each on a freshly re-seeded scratch profile, so a delete cannot starve later surfaces.
  for (const { surface, c } of deferred) {
    if (ctx.timeUp()) { results.find((r) => r.surface === surface).rows.push({ surface: surface.name, label: c.label, selector: c.selector, result: "UNREACHABLE", evidence: "run timebox reached before this control" }); continue; }
    await sess.restart(true);
    const r = results.find((x) => x.surface === surface);
    try { await enter(sess.s, plan, surface); const row = await press(sess.s, ctx, surface, c); row.evidence = `destructive pass, fresh scratch copy; ${row.evidence}`; r.rows.push(row); log(`${surface.name} | ${row.result.padEnd(14)} | ${c.label.slice(0, 50)} (destructive)`); }
    catch (e) { r.rows.push({ surface: surface.name, label: c.label, selector: c.selector, result: "UNREACHABLE", evidence: `destructive pass: ${e.message}` }); }
  }
  await sess.s.stop(); ctx.watcher?.stop();
  const liveAfter = hashLive(args.liveProfile);
  const report = writeReport({ results, plan, live, liveAfter, minutes: (Date.now() - t0) / 60000 });
  fs.writeFileSync(args.report, report);
  const pc = plan.positiveControl ? plan.positiveControl(results) : { ok: true, text: "n/a" };
  log(`report: ${args.report}; positive control: ${pc.ok ? "PASS" : "FAIL"} (${pc.text})`);
  process.exit(pc.ok ? 0 : 3);
}
function hashLive(dir) {
  if (!dir) return null;
  const out = {};
  for (const f of ["library.json", "settings.json"]) { const p = path.join(dir, f); out[f] = fs.existsSync(p) ? sha(fs.readFileSync(p)) : "(absent)"; }
  return out;
}

// ── report ──────────────────────────────────────────────────────────────────────────────────────────────────────
const RESULTS = ["OK", "ERROR", "NO-EFFECT", "SKIPPED-SAFETY", "SKIPPED-DIALOG", "UNREACHABLE"];
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
function writeReport({ results, plan, live, liveAfter, minutes }) {
  const rows = results.flatMap((r) => r.rows);
  const totals = Object.fromEntries(RESULTS.map((k) => [k, rows.filter((x) => x.result === k).length]));
  const unknown = rows.filter((x) => !RESULTS.includes(x.result)).length;
  const L = [];
  L.push(`# ${plan.title}`, "", plan.preamble || "", "");
  L.push("## Totals", "", "| Result | Controls |", "|---|---|", ...RESULTS.map((k) => `| ${k} | ${totals[k]} |`), `| UNKNOWN | ${unknown} |`, `| **All** | ${rows.length} |`, "");
  L.push(`Run time: ${minutes.toFixed(1)} min. Surfaces: ${results.length}, of which unreachable: ${results.filter((r) => r.unreachable).length}.`, "");
  if (plan.positiveControl) { const pc = plan.positiveControl(results); L.push(`**Positive control:** ${pc.ok ? "PASS" : "FAIL"}. ${pc.text}`, ""); }
  if (live) {
    const same = JSON.stringify(live) === JSON.stringify(liveAfter);
    L.push("## Live profile", "", "| File | sha256 before | sha256 after |", "|---|---|---|", ...Object.keys(live).map((f) => `| ${f} | \`${live[f]}\` | \`${liveAfter[f]}\` |`), "", `Unchanged: ${same ? "yes" : "**NO**"}.`, "");
  }
  L.push("## Bug candidates", "");
  // A known defect whose evidence is the only error on a row is reported once, not per row.
  const knownOnly = (x, k) => x.result === "ERROR" && k.re.test((x.logText || "") + " " + (x.errTexts || []).join(" "))
    && !(x.errTexts || []).some((t) => !k.re.test(t)) && (x.logText || "").split(/\r?\n/).filter(Boolean).every((l) => k.re.test(l));
  for (const k of plan.known || []) {
    const hit = rows.filter((x) => knownOnly(x, k));
    if (hit.length) L.push(`**Known, reported once (${k.name}):** ${hit.length} row(s) whose only error evidence matches \`${k.re.source}\`: ${[...new Set(hit.map((x) => x.surface))].join(", ")}. Those rows are not repeated below.`, "");
  }
  // A surface unreachable for a code reason (dead code or broken wiring) is a bug candidate in its own right.
  const wiring = results.filter((r) => r.surface.candidate && r.unreachable);
  if (wiring.length) {
    L.push("**Unreachable for a code reason (dead code or broken wiring):**", "", "| # | Surface | Code reason | Suspected file |", "|---|---|---|---|");
    wiring.forEach((r, i) => L.push(`| W${i + 1} | ${esc(r.surface.name)} | ${esc(r.unreachable)} | ${esc(r.surface.files || "")} |`));
    L.push("");
  }
  const cands = rows.filter((x) => (x.result === "ERROR" && !(plan.known || []).some((k) => knownOnly(x, k)))
    || (x.result === "NO-EFFECT" && !/disabled/.test(x.evidence) && !/^\(input|^\(select|^\(textarea/.test(x.label)));
  if (!cands.length) L.push("None.", "");
  else {
    L.push("| # | Result | Surface | Control | Steps | Evidence | Suspected file |", "|---|---|---|---|---|---|---|");
    cands.forEach((x, i) => { const surf = plan.surfaces.find((s) => s.name === x.surface); L.push(`| ${i + 1} | ${x.result} | ${esc(x.surface)} | ${esc(x.label)} | ${esc(surf?.how || "")}; press "${esc(x.label)}" | ${esc(x.evidence)} | ${esc(surf?.files || "")} |`); });
    L.push("");
  }
  L.push("## Surfaces", "");
  for (const r of results) {
    L.push(`### ${r.surface.name}`, "");
    if (r.surface.how) L.push(`Reached: ${r.surface.how}`, "");
    if (r.unreachable) { L.push(`**UNREACHABLE:** ${esc(r.unreachable)}`, ""); continue; }
    if (r.note) { L.push(r.note, ""); continue; }
    L.push(`Controls enumerated: ${r.count}. Walk: ${r.walk.map(esc).join(" · ")}`, "");
    L.push("| Surface | Control | Selector | Result | Evidence |", "|---|---|---|---|---|");
    for (const x of r.rows) L.push(`| ${esc(x.surface)} | ${esc(x.label)} | \`${esc(x.selector)}\` | ${x.result} | ${esc(x.evidence)} |`);
    L.push("");
  }
  return L.join("\n");
}

// ── dry run: a local page with known controls, in headless Edge (no Blurby window) ──────────────────────────────
function dryRunPlan(a) {
  const page = path.join(a.artifacts, "dryrun.html");
  fs.writeFileSync(page, `<!doctype html><html><body>
<h1>Sweep dry run</h1><div id="out">0</div>
<button id="inc" onclick="document.getElementById('out').textContent++">Increment</button>
<button id="boom" onclick="throw new Error('dry-run boom')">Throw</button>
<button id="cerr" onclick="console.error('dry-run console error')">Console error</button>
<button id="noop">Nothing</button>
<button id="dis" disabled>Disabled</button>
<a id="ext" href="https://example.com" target="_blank">Website</a>
<button id="theme" onclick="document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'">Theme</button>
<button id="toggle" aria-pressed="false" onclick="this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') === 'true' ? 'false' : 'true')">Toggle</button>
<input id="name" placeholder="Name"><label><input id="chk" type="checkbox"> Check</label>
<button id="open" onclick="document.getElementById('modal').hidden = false">Open modal</button>
<div id="modal" hidden role="dialog"><button id="m-ok" onclick="document.getElementById('out').textContent = 'modal ok'">Modal action</button><button id="m-close" onclick="document.getElementById('modal').hidden = true">Close</button></div>
<script>addEventListener('keydown', (e) => { if (e.key === 'Escape') document.getElementById('modal').hidden = true; if (e.key === 'k' && e.ctrlKey) document.getElementById('out').textContent = 'ctrl-k'; });</script>
</body></html>`);
  return {
    title: "UI-SWEEP-1 dry run (headless Edge, local test page)", pageUrl: "file:///" + page.replace(/\\/g, "/"), homeSignature: "#out",
    preamble: "Expected: Increment, Theme, Toggle, Name, Check, Open modal, Modal action, Close and Ctrl+K are OK; Throw and Console error are ERROR; Nothing and Disabled are NO-EFFECT; Website is SKIPPED-SAFETY; Unknown key is NO-EFFECT.",
    surfaces: [
      { name: "page", how: "the page as loaded", scope: "body", exclude: /^(Modal action|Close)$/ },
      { name: "modal", how: "press Open modal", enter: [{ click: "#open" }], signature: "#modal:not([hidden])", scope: "#modal" },
      { name: "keyboard", how: "keys on the page", keys: [{ key: "Ctrl+K", label: "Ctrl+K" }, { key: "q", label: "Unknown key q" }] },
    ],
    positiveControl(results) {
      const rows = results.flatMap((r) => r.rows); const by = (l) => rows.find((x) => x.label === l)?.result;
      const expect = { Increment: "OK", Throw: "ERROR", "Console error": "ERROR", Nothing: "NO-EFFECT", Disabled: "NO-EFFECT", Website: "SKIPPED-SAFETY", Theme: "OK", Toggle: "OK", Name: "OK", Check: "OK", "Open modal": "OK", "Modal action": "OK", "Ctrl+K": "OK", "Unknown key q": "NO-EFFECT" };
      const bad = Object.entries(expect).filter(([l, v]) => by(l) !== v).map(([l, v]) => `${l}: expected ${v}, got ${by(l)}`);
      return { ok: !bad.length, text: bad.length ? bad.join("; ") : `all ${Object.keys(expect).length} expectations met` };
    },
  };
}

// ── the Blurby plan (selectors from the components on main @ 78f8e2ef; reviewed against 47ae6e1f's build) ──────────
function blurbyPlan(a) {
  const C = "src/components/";
  const book = '[data-doc-id="sample-meditations"]';
  const toList = { unless: ".doc-list", click: ".view-toggle-btn", sleep: 400 };
  const openBook = [toList, { click: `.doc-card${book}`, sleep: 300 }, { wait: ".reader-layout", waitMs: 45000, sleep: 1500 }];
  const mode = (m, label) => [...openBook, ...(m === "page" ? [] : [{ click: `[aria-label="${label} mode"]`, sleep: 1500 }]), { wait: `.rm-${m}-root`, waitMs: 45000 }];
  const flap = [{ click: ".library-hamburger-btn", sleep: 300 }, { wait: ".menu-flap.open" }];
  const settings = [...flap, { click: ".menu-flap-settings-btn", sleep: 300 }, { wait: ".settings-menu" }];
  const pane = (text) => [...settings, { clickText: text, within: ".settings-menu-item", sleep: 400 }, { wait: ".settings-subpage" }];
  // Keyboard rows come from the app's own Hotkey Map pane (HotkeyMapSettings.tsx renders .hotkey-section/.hotkey-row).
  const hotkeyRows = async (s, plan) => {
    if (!plan.hotkeys) {
      await home(s, plan); await runSteps(s, pane("Hotkey Map"), plan.vars);
      plan.hotkeys = await s.cdp.eval(`[...document.querySelectorAll('.hotkey-section')].map((sec) => ({ title: sec.querySelector('.hotkey-section-title')?.innerText.trim(), rows: [...sec.querySelectorAll('.hotkey-row')].map((r) => ({ action: r.querySelector('.hotkey-action')?.innerText.trim(), key: r.querySelector('.hotkey-key')?.innerText.trim() })) }))`);
    }
    return plan.hotkeys;
  };
  // "Ctrl + K" → "Ctrl+K"; "J / Down" → two keys; "G → L" → "G then L"; "1-5" → five keys; "Left Arrow" → "ArrowLeft".
  const toKeys = (spec) => spec.split(/\s+\/\s+/).flatMap((alt) => {
    const t = alt.replace(/\s*\+\s*/g, "+").replace(/(\w+) Arrow/g, "Arrow$1").replace(/\bEsc\b/, "Escape").trim();
    if (/^\d-\d$/.test(t)) { const [x, y] = t.split("-").map(Number); return Array.from({ length: y - x + 1 }, (_, i) => String(x + i)); }
    return [t.replace(/\s*→\s*/g, " then ")];
  });
  const keysFor = (sections, extra = []) => async (s, plan) => (await hotkeyRows(s, plan)).filter((sec) => sections.includes(sec.title))
    .flatMap((sec) => sec.rows.flatMap((r) => toKeys(r.key).map((k) => ({ key: k, label: `${r.action} (${k}) [${sec.title}]` })))).concat(extra);
  const reader = (m, label, files) => ({ name: `Reader — ${label}`, how: `open the sample book, ${m === "page" ? "Page (the default)" : `press "${label} mode"`}`, enter: mode(m, label), signature: `.rm-${m}-root`, scope: ".reader-layout", files: `${C}ReaderBottomBar.tsx, src/reader/modes/${m}/`, ...files });
  return {
    title: "UI-SWEEP-1 — every control on every screen (packaged build of 47ae6e1f)",
    preamble: "Method: each control is pressed over CDP at its box centre (or its key is sent), then classified from a DOM and state digest, uncaught exceptions, console errors and error.log growth (scripts/ui-sweep/sweep.mjs). Controls with destructive labels run last, each on a freshly re-seeded scratch profile. Escape resets after each press; when the surface is lost, the page reloads and the route is replayed.",
    homeSignature: ".library-container", homeSteps: [toList], vars: {}, onboardingSkip: ".onboarding-btn-skip",
    prefetch: (s, plan) => hotkeyRows(s, plan),
    known: [{ name: "BUG-187, ResizeObserver flood (FOLIATE-OBSERVER-LEAK-1 not merged at 47ae6e1f)", re: /ResizeObserver loop/i }],
    async seed(s, args) {
      for (let i = 0; i < 240; i++) { if (await s.sw('has(".onboarding-overlay")') || await s.sw('has(".library-container")')) break; await sleep(250); }
      // The onboarding overlay is swept as its own surface later; first run here takes "Skip tour".
      if (await s.sw('has(".onboarding-btn-skip")')) { const b = await s.sw('box(".onboarding-btn-skip")'); await s.click(b.x, b.y); await sleep(800); }
      if (args.seed?.length) await s.cdp.eval(`window.electronAPI.importDroppedFiles(${JSON.stringify(args.seed)})`, 120000);
      let docs = [];
      for (let i = 0; i < 120; i++) { const st = await s.cdp.eval("window.electronAPI.getState()", 20000); docs = st.library || st.docs || []; if (docs.length >= 1 + (args.seed?.length || 0)) break; await sleep(500); }
      // importDroppedFiles called over CDP skips the renderer's own add, so the library view shows the imports only
      // after a reload (main already holds them). Reload, then wait for the library to list them.
      if (args.seed?.length) {
        await s.cdp.send("Page.reload", {}); s.helpersOk = false; await sleep(1500);
        for (let i = 0; i < 120; i++) { try { if (await s.sw('has(".library-container")')) break; } catch { /* reloading */ } await sleep(250); }
      }
      // Every import is stored as <id>.epub (a PDF or text file is converted), so a seed is found by its own file name,
      // which the import keeps as the title.
      const find = (ext) => {
        const file = (args.seed || []).find((f) => path.extname(f).toLowerCase() === ext);
        if (!file) return undefined;
        const base = path.basename(file, path.extname(file));
        return docs.find((d) => d.id !== "sample-meditations" && [d.title, d.filename, d.originalFilename].filter(Boolean).some((n) => n.includes(base)))?.id;
      };
      this.vars = { epub: find(".epub"), pdf: find(".pdf"), txt: find(".txt") };
      this.seeded = docs.map((d) => `${d.id}: ${d.title} (${path.basename(d.filepath || d.filename || "")})`);
      log(`seeded ${docs.length} docs: ${JSON.stringify(this.vars)}; ${this.seeded.join(" | ")}`);
    },
    surfaces: [
      // Library
      { name: "Library — list view", how: "start state (list view)", signature: ".doc-list", files: `${C}LibraryView.tsx, ${C}DocCard.tsx` },
      { name: "Library — grid view", how: 'press "Grid view"', enter: [{ unless: ".doc-grid", click: ".view-toggle-btn", sleep: 400 }], signature: ".doc-grid", files: `${C}LibraryView.tsx, ${C}DocGridCard.tsx` },
      { name: "Library — grid card menu", how: "grid view, right-click the sample card", enter: [{ unless: ".doc-grid", click: ".view-toggle-btn", sleep: 400 }, { rightClick: `.doc-grid-card${book}`, sleep: 300 }], signature: ".doc-context-menu", scope: ".doc-context-menu", files: `${C}DocGridCard.tsx` },
      { name: "Library — MenuFlap and ReadingQueue", how: 'press "Open menu"', enter: flap, signature: ".menu-flap.open", scope: ".menu-flap.open", files: `${C}MenuFlap.tsx, ${C}ReadingQueue.tsx` },
      { name: "Library — folder button and RecentFolders", how: 'press "Select folder"', enter: [{ click: '[aria-label="Select folder"]', sleep: 300 }], signature: ".recent-folders", scope: ".recent-folders", noEscapeReset: true, files: `${C}RecentFolders.tsx` },
      { name: "Library — DeleteConfirmation", how: 'list view, press "Delete" on the .txt fixture card', enter: [{ click: '.doc-card[data-doc-id="{{txt}}"] [aria-label="Delete"]', sleep: 300 }], signature: ".delete-confirm", scope: ".delete-confirm", files: `${C}DeleteConfirmation.tsx` },
      { name: "Library — AddEditPanel", how: 'press "Add document"', enter: [{ click: '[aria-label="Add document"]', sleep: 300 }], signature: ".add-edit-panel .add-edit-title", scope: ".add-edit-panel", noEscapeReset: true, files: `${C}AddEditPanel.tsx` },
      { name: "Library — Add from URL panel", how: 'press "Add from URL"', enter: [{ click: '[aria-label="Add from URL"]', sleep: 300 }], signature: ".url-input-row", scope: ".add-edit-panel", noEscapeReset: true, files: `${C}LibraryView.tsx` },
      { name: "Library — StatsPanel", how: 'press "Show reading statistics"', enter: [{ click: '[aria-label="Show reading statistics"]', sleep: 400 }], signature: ".stats-panel", scope: ".stats-panel", noEscapeReset: true, files: `${C}StatsPanel.tsx` },
      { name: "Library — MetadataWizard", how: "Ctrl+Shift+M", enter: [{ key: "Ctrl+Shift+M", sleep: 800 }], signature: ".metadata-wizard-modal", scope: ".metadata-wizard-modal", files: `${C}MetadataWizard.tsx` },
      { name: "Library — ImportConfirmDialog", how: "put text on the clipboard, then Alt+V", enter: [{ eval: "navigator.clipboard.writeText('A short passage the UI sweep imports as text.').then(() => true)", sleep: 200 }, { key: "Alt+V", sleep: 600 }], signature: ".import-confirm-overlay", scope: ".import-confirm-overlay", noEscapeReset: true, files: `${C}ImportConfirmDialog.tsx` },
      { name: "Library — BugReportModal", how: "Ctrl+Shift+B (packaged: saves under the scratch profile's blurby-data/bug-reports)", enter: [{ key: "Ctrl+Shift+B", sleep: 1500 }], signature: ".bug-report-overlay", scope: ".bug-report-overlay", files: `${C}BugReportModal.tsx` },
      { name: "Library — CommandPalette", how: "Ctrl+K", enter: [{ key: "Ctrl+K", sleep: 400 }], signature: ".command-palette-overlay", scope: ".command-palette-overlay", files: `${C}CommandPalette.tsx` },
      { name: "Library — ShortcutsOverlay", how: "?", enter: [{ key: "?", sleep: 400 }], signature: ".shortcuts-overlay", scope: ".shortcuts-overlay", files: `${C}ShortcutsOverlay.tsx` },
      { name: "Library — HighlightsOverlay", how: ";", enter: [{ key: ";", sleep: 400 }], signature: ".highlights-overlay", scope: ".highlights-overlay", files: `${C}HighlightsOverlay.tsx` },
      { name: "Library — SnoozePickerOverlay", how: "J, then H", enter: [{ key: "j", sleep: 200 }, { key: "h", sleep: 400 }], signature: ".snooze-picker-overlay", scope: ".snooze-picker-overlay", files: `${C}SnoozePickerOverlay.tsx` },
      { name: "Library — TagPickerOverlay", how: "J, then L", enter: [{ key: "j", sleep: 200 }, { key: "l", sleep: 400 }], signature: ".tag-picker-overlay", scope: ".tag-picker-overlay", files: `${C}TagPickerOverlay.tsx` },
      { name: "Library — GoToIndicator", how: "G (it times out after 2 s; its key sequences are in Keyboard — Library)", enter: [{ key: "g", sleep: 200 }], signature: ".goto-indicator", scope: ".goto-indicator", files: `${C}GoToIndicator.tsx` },
      { name: "Library — FolderNoticeBanner", unreachable: "shown only when the main process reports an unreachable source folder; the scratch profile has no source folder, and the sweep does not fake one", files: `${C}FolderNoticeBanner.tsx` },
      { name: "Library — PairingBanner", unreachable: "shown only on a pairing push from the Chrome extension over the local WebSocket; the sandbox pairs nothing", files: `${C}PairingBanner.tsx` },
      // Settings
      { name: "Settings — menu (with HelpSettings inline)", how: 'MenuFlap, then "Go to settings"', enter: settings, signature: ".settings-menu", scope: ".menu-flap.open", files: `${C}SettingsMenu.tsx, ${C}settings/HelpSettings.tsx` },
      { name: "Settings — HelpSettings", note: "HelpSettings has no sub-page: it renders inline at the bottom of the settings menu (SettingsMenu.tsx), so its controls are rows of **Settings — menu (with HelpSettings inline)** above." },
      { name: "Settings — LayoutSettings (Reading Layout)", how: 'Settings, then "Reading Layout"', enter: pane("Reading Layout"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/LayoutSettings.tsx` },
      { name: "Settings — TextSizeSettings", candidate: true, unreachable: "not routed: TextSizeSettings.tsx is defined but no menu item opens it; its text-size sliders are part of LayoutSettings (Reading Layout)", files: `${C}settings/TextSizeSettings.tsx` },
      { name: "Settings — SpeedReadingSettings", how: 'Settings, then "Speed Reading"', enter: pane("Speed Reading"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/SpeedReadingSettings.tsx` },
      { name: "Settings — ThemeSettings", how: 'Settings, then "Theme"', enter: pane("Theme"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/ThemeSettings.tsx` },
      { name: "Settings — LibraryLayoutSettings", how: 'Settings, then "Library Layout"', enter: pane("Library Layout"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/LibraryLayoutSettings.tsx` },
      { name: "Settings — ReadingGoalsSettings", how: 'Settings, then "Reading Goals"', enter: pane("Reading Goals"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/ReadingGoalsSettings.tsx` },
      { name: "Library — GoalProgressWidget", how: "rendered when a reading goal exists (Reading Goals' controls ran first)", enter: [{ wait: ".goal-progress-widget", waitMs: 4000 }], signature: ".goal-progress-widget", unreachableIfMissing: "no reading goal exists in the scratch profile, so the widget does not render", files: `${C}GoalProgressWidget.tsx` },
      { name: "Settings — ConnectorsSettings", how: 'Settings, then "Connectors"', enter: pane("Connectors"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/ConnectorsSettings.tsx` },
      { name: "Settings — CloudSyncSettings", how: 'Settings, then "Cloud Sync"', enter: pane("Cloud Sync"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/CloudSyncSettings.tsx` },
      { name: "Settings — HotkeyMapSettings", how: 'Settings, then "Hotkey Map"', enter: pane("Hotkey Map"), signature: ".settings-subpage", scope: ".menu-flap.open", files: `${C}settings/HotkeyMapSettings.tsx` },
      // Reader
      reader("page", "Page"), reader("focus", "Focus"), reader("flow", "Flow"), reader("narrate", "Narrate"),
      { name: "Reader — ReaderSpeedDialog (Focus)", how: 'Focus, then the speed control', enter: [...mode("focus", "Focus"), { click: ".rbb-speed-trigger", sleep: 300 }], signature: ".rbb-speed-dialog", scope: ".rbb-speed-dialog", files: `${C}ReaderSpeedDialog.tsx` },
      { name: "Reader — ReaderSpeedDialog (Flow)", how: 'Flow, then the speed control', enter: [...mode("flow", "Flow"), { click: ".rbb-speed-trigger", sleep: 300 }], signature: ".rbb-speed-dialog", scope: ".rbb-speed-dialog", files: `${C}ReaderSpeedDialog.tsx` },
      { name: "Reader — chapter dropdown", how: "Page, then the chapter name", enter: [...mode("page", "Page"), { click: ".rbb-chapter-name", sleep: 300 }], signature: ".rbb-chapter-dropdown", scope: ".rbb-chapter-dropdown", noEscapeReset: true, files: `${C}ReaderBottomBar.tsx` },
      { name: "Reader — ShortcutsOverlay", how: "Page, then ?", enter: [...mode("page", "Page"), { key: "?", sleep: 400 }], signature: ".shortcuts-overlay", scope: ".shortcuts-overlay", files: `${C}ShortcutsOverlay.tsx` },
      { name: "Reader — HighlightsOverlay", how: "Page, then ; (Escape also leaves the reader here, so the route is replayed)", enter: [...mode("page", "Page"), { key: ";", sleep: 400 }], signature: ".highlights-overlay", scope: ".highlights-overlay", files: `${C}HighlightsOverlay.tsx` },
      { name: "Reader — BacktrackPrompt", how: "Page: next page ×4, previous ×2, then Escape", enter: [...mode("page", "Page"), ...Array(4).fill({ click: '[aria-label="Next page"]', sleep: 700 }), ...Array(2).fill({ click: '[aria-label="Previous page"]', sleep: 700 }), { key: "Escape", sleep: 500 }], signature: ".backtrack-prompt", scope: ".backtrack-prompt", files: `${C}BacktrackPrompt.tsx, src/hooks/useProgressTracker.ts` },
      { name: "Reader — ReturnToReadingPill", how: "Flow, then scroll the text well away from the cursor", enter: [...mode("flow", "Flow"), { eval: "(() => { const r = document.querySelector('.rm-flow-root'); const sc = [r, ...r.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 50); if (sc) sc.scrollTop += 4000; return !!sc; })()", sleep: 1200 }], signature: ".return-to-reading-pill", scope: ".return-to-reading-pill", unreachableIfMissing: "scrolling Flow's text did not show the pill", files: `${C}ReturnToReadingPill.tsx` },
      { name: "Reader — QuickSettingsPopover", candidate: true, unreachable: "no working route: its shortcut Ctrl+Shift+, tests e.key === ',' but Shift makes e.key '<' on a US layout (useKeyboardShortcuts.ts), and no button or palette entry opens it. The keyboard pass presses Ctrl+Shift+, and records what happens (bug candidate)", files: `${C}QuickSettingsPopover.tsx, src/hooks/useKeyboardShortcuts.ts` },
      { name: "Reader — HighlightMenu", unreachable: "not reachable in the main window: the Focus view never sets highlightWord; it renders only in the standalone reader window (PausedTextView)", files: `${C}HighlightMenu.tsx` },
      { name: "Reader — DefinitionPopup", unreachable: "not reachable in the main window (as HighlightMenu); its define action also fetches dictionaryapi.dev, which the denylist excludes", files: `${C}DefinitionPopup.tsx` },
      { name: "Reader — NotePopover", candidate: true, unreachable: "never rendered: the blurby:make-note event (ReaderContainer.tsx) has no listener", files: `${C}NotePopover.tsx, ${C}ReaderContainer.tsx` },
      { name: "Reader — GoToIndicator", note: "GoToIndicator is library-only (the G sequences are library keys); see **Library — GoToIndicator**." },
      { name: "Reader — SnoozePickerOverlay and TagPickerOverlay", note: "Not rendered in the reader; they are library surfaces (see **Library — SnoozePickerOverlay** and **Library — TagPickerOverlay**)." },
      // Onboarding: re-armed by clearing firstRunCompleted on the scratch profile, then the page reloads.
      { name: "Library — OnboardingOverlay", how: "clear firstRunCompleted on the scratch profile, reload", enter: [{ eval: "(async () => { const st = await window.electronAPI.getState(); await window.electronAPI.saveSettings({ ...st.settings, firstRunCompleted: false }); location.reload(); return true; })()", sleep: 2500 }], signature: ".onboarding-overlay", scope: ".onboarding-overlay", files: `${C}OnboardingOverlay.tsx, ${C}LibraryContainer.tsx` },
      // Keyboard: every shortcut the Hotkey Map lists, in each mode it applies to.
      { name: "Keyboard — Library", how: "library list view; Global, Library and Go-To rows of the Hotkey Map", signature: ".library-container", keys: keysFor(["Global", "Library", "Go-To Sequences (G then ...)"]), files: "src/hooks/useKeyboardShortcuts.ts" },
      { name: "Keyboard — Page", how: "sample book in Page; Global rows (the Hotkey Map lists no Page section)", enter: mode("page", "Page"), signature: ".rm-page-root", keys: keysFor(["Global"]), files: "src/hooks/useKeyboardShortcuts.ts, src/reader/modes/page/" },
      { name: "Keyboard — Focus", how: "sample book in Focus; Global and Reader — Focus rows", enter: mode("focus", "Focus"), signature: ".rm-focus-root", keys: keysFor(["Global", "Reader — Focus"]), files: "src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/" },
      { name: "Keyboard — Flow", how: "sample book in Flow; Global and Reader — Flow rows", enter: mode("flow", "Flow"), signature: ".rm-flow-root", keys: keysFor(["Global", "Reader — Flow"]), files: "src/hooks/useKeyboardShortcuts.ts, src/reader/modes/flow/" },
      { name: "Keyboard — Narrate", how: "sample book in Narrate; Global rows (no Narrate section)", enter: mode("narrate", "Narrate"), signature: ".rm-narrate-root", keys: keysFor(["Global"]), files: "src/hooks/useKeyboardShortcuts.ts, src/reader/modes/narrate/" },
      { name: "Keyboard — Overlays", how: "the CommandPalette open; the Overlays rows (the 1-5 snooze keys go to the snooze picker)", enter: [{ key: "Ctrl+K", sleep: 400 }], signature: ".command-palette-overlay", keys: async (s, plan) => (await keysFor(["Overlays"])(s, plan)).filter((k) => !/^[1-5]$/.test(k.key)), files: `${C}CommandPalette.tsx` },
      { name: "Keyboard — Snooze picker keys", how: "J, then H, then the 1-5 rows", enter: [{ key: "j", sleep: 200 }, { key: "h", sleep: 400 }], signature: ".snooze-picker-overlay", keys: async (s, plan) => (await keysFor(["Overlays"])(s, plan)).filter((k) => /^[1-5]$/.test(k.key)), files: `${C}SnoozePickerOverlay.tsx` },
    ],
    positiveControl(results) {
      const hit = results.flatMap((r) => r.rows).filter((x) => /Flow/.test(x.surface) && x.result === "ERROR" && /ResizeObserver/i.test(x.logText || ""));
      return { ok: hit.length > 0, text: hit.length ? `${hit.length} ERROR row(s) on Flow surfaces with error.log growth carrying the ResizeObserver message (BUG-187), e.g. "${hit[0].label}" on ${hit[0].surface}` : "no Flow ERROR row carries the ResizeObserver message: the detector is blind (Done-when 2)" };
    },
  };
}

main().catch((e) => { console.error(e); process.exit(1); });

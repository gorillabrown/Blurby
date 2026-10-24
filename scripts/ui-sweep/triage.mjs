// UI-SWEEP-TRIAGE-1 — re-test UI-SWEEP-1's NO-EFFECT candidates with a stronger detector, from a state where each
// control should act. Dev tooling only (scripts/ is not in build.files); Node 24 built-ins only. Reuses sweep.mjs's
// session, routes and plan.
//
//   node scripts/ui-sweep/triage.mjs --exe <copy of Blurby.exe> --profile <scratch dir> --seed <file>[,<file>...]
//        --report-in <UI-SWEEP-1 report.md> --out <results.json> [--port 9372] [--only 1,2,3] [--runs 2] [--control-only]
//        [--live-profile <dir to hash, never opened>] [--models <NARRATE_MODELS_ROOT>]
//
// Per candidate: enter its surface, run its preconditions, then probe A, wait, probe B (no press: anything that differs
// is noise and is ignored), press, probe C. The effect is what differs between B and C outside the noise. A candidate
// with no effect is run again (--runs), so a DEFECT is reproduced twice.
import fs from "node:fs";
import path from "node:path";
import { Session, DialogWatcher, runSteps, enter, home, blurbyPlan, sleep, log, logSize, logSince, hashLive } from "./sweep.mjs";

const args = (() => {
  const out = { port: 9372, runs: 2 }; const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i], v = () => a[++i];
    if (k === "--exe") out.exe = v(); else if (k === "--profile") out.profile = v(); else if (k === "--seed") out.seed = v().split(",").filter(Boolean);
    else if (k === "--report-in") out.reportIn = v(); else if (k === "--out") out.out = v(); else if (k === "--port") out.port = Number(v());
    else if (k === "--only") out.only = v().split(",").map(Number); else if (k === "--runs") out.runs = Number(v());
    else if (k === "--control-only") out.controlOnly = true; else if (k === "--live-profile") out.liveProfile = v(); else if (k === "--models") out.modelsRoot = v();
  }
  if (!out.exe || !out.profile || !out.out) throw new Error("--exe, --profile and --out are required");
  return out;
})();

// ── the stronger probe ───────────────────────────────────────────────────────────────────────────────────────────
// Facets: style (the :root custom properties and computed style, the reader iframe's body style and injected theme),
// settings (the settings object, by key), zoom, active (the focused element, any kind), scroll (every scrolled
// element), reader (foliate location, renderer page, the highlighted/cursor word indices, chapter label), library
// (the focused and selected cards, and each document's archived/deleted/favorite flags), dom (the sweep's digest).
const PROBE = String.raw`(async () => {
  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
  const path = (el) => { const p = []; for (let e = el; e && e.nodeType === 1 && e !== document.documentElement; e = e.parentElement) { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; else if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.'); p.unshift(s); } return p.slice(-4).join(' > '); };
  if (!window.__triageVars) {
    const names = new Set();
    for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; } for (const r of rules) { if (!r.style) continue; for (let i = 0; i < r.style.length; i++) { const n = r.style[i]; if (n.startsWith('--')) names.add(n); } } }
    window.__triageVars = [...names].sort();
  }
  const rcs = getComputedStyle(document.documentElement);
  const vars = Object.fromEntries(window.__triageVars.map((n) => [n, rcs.getPropertyValue(n).trim()]));
  const all = (cs) => { const o = []; for (let i = 0; i < cs.length; i++) o.push(cs[i] + ':' + cs.getPropertyValue(cs[i])); return o.join(';'); };
  const out = {};
  out.style = { vars, rootHash: hash(all(rcs)), bodyHash: document.body ? hash(all(getComputedStyle(document.body))) : '', rootAttrs: [...document.documentElement.attributes].map((a) => a.name + '=' + a.value).join(' ') };
  const fv = document.querySelector('foliate-view');
  const docs = []; try { for (const c of fv?.renderer?.getContents?.() || []) docs.push(c.doc); } catch {}
  out.iframe = docs.map((d) => { const b = d.body; if (!b) return ''; const cs = d.defaultView.getComputedStyle(b); return [cs.fontFamily, cs.fontSize, cs.lineHeight, cs.letterSpacing, cs.wordSpacing, cs.textAlign, cs.color, cs.backgroundColor, hash(d.getElementById('blurby-theme')?.textContent || '')].join('|'); }).join(' / ');
  let st = null; try { st = await window.electronAPI.getState(); } catch {}
  out.settings = st && st.settings ? Object.fromEntries(Object.entries(st.settings).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])) : {};
  const lib = st ? (st.library || st.docs || []) : [];
  out.libraryFlags = Object.fromEntries(lib.map((d) => [d.id, [d.archived ? 'A' : '', d.deleted || d.trashed ? 'T' : '', d.favorite || d.starred ? 'F' : '', d.unread ? 'U' : '', d.position ?? ''].join('')]));
  out.zoom = String(window.devicePixelRatio);
  const ae = document.activeElement; out.active = ae && ae !== document.body ? path(ae) : '(body)';
  const sc = []; for (const e of document.querySelectorAll('*')) { if (e.scrollTop > 0 || e.scrollLeft > 0) sc.push(path(e) + '@' + e.scrollTop + ',' + e.scrollLeft); }
  out.scroll = (window.scrollY ? 'win@' + window.scrollY + ';' : '') + sc.join(';');
  const words = (cls) => { const r = []; for (const d of docs) for (const e of d.querySelectorAll(cls)) r.push(Number(e.getAttribute('data-word-index'))); return r.length ? Math.min(...r) : null; };
  let rend = ''; try { const r = fv?.renderer; rend = r ? [r.page, r.pages, Math.round(r.start ?? -1), r.index ?? ''].join(',') : ''; } catch {}
  out.reader = { cfi: (() => { try { return fv?.lastLocation?.cfi || ''; } catch { return ''; } })(), renderer: rend,
    highlighted: words('.page-word--highlighted, .page-word--active-word'), flowCursor: words('.page-word--flow-cursor'), narrateCursor: words('.page-word--narrate-cursor'),
    chapter: document.querySelector('.rbb-chapter-name')?.innerText.trim() || '', focusWord: hash(document.querySelector('.rm-focus-root')?.innerText || ''),
    progress: [...document.querySelectorAll('[class*="progress"]')].map((e) => e.getAttribute('aria-valuenow') || e.style.width || '').join(',') };
  out.library = { focused: [...document.querySelectorAll('.doc-card-focused, .doc-grid-card-focused')].map((e) => e.getAttribute('data-doc-id')).join(','),
    selected: [...document.querySelectorAll('.doc-card-selected, .doc-grid-card-selected')].map((e) => e.getAttribute('data-doc-id')).join(','),
    paletteFocused: document.querySelector('.command-palette-item--focused')?.id || [...document.querySelectorAll('[aria-selected="true"]')].map(path).join(',') };
  // The menu flap stays mounted when closed (MenuFlap.tsx): its state is the .open class. Form values change in place.
  out.flapOpen = String(!!document.querySelector('.menu-flap.open'));
  out.forms = hash([...document.querySelectorAll('input, select, textarea')].map((e) => e.type === 'checkbox' || e.type === 'radio' ? String(e.checked) : e.value).join('|'));
  const body = document.body;
  out.dom = { count: document.querySelectorAll('*').length, text: hash(body ? body.innerText : ''), href: location.href, dialogs: [...document.querySelectorAll('[role=dialog], [class*="overlay"], [class*="modal"], .settings-subpage')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => (e.className || e.tagName).toString().split(' ')[0]).join(',') };
  return out;
})()`;

const flat = (o, pre = "", acc = {}) => { for (const [k, v] of Object.entries(o || {})) { const key = pre ? `${pre}.${k}` : k; if (v && typeof v === "object") flat(v, key, acc); else acc[key] = v; } return acc; };
const diffKeys = (a, b) => { const fa = flat(a), fb = flat(b); return [...new Set([...Object.keys(fa), ...Object.keys(fb)])].filter((k) => String(fa[k]) !== String(fb[k])); };

// ── candidates ───────────────────────────────────────────────────────────────────────────────────────────────────
function readCandidates(file) {
  const rows = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\| (\d+) \| NO-EFFECT \| ([^|]+) \| (.+?) \| (.+?) \| (?:destructive pass, fresh scratch copy; )?shots /);
    if (m) rows.push({ n: Number(m[1]), surface: m[2].trim(), label: m[3].trim().replace(/\\\|/g, "|"), steps: m[4].trim() });
  }
  return rows;
}
const keyOf = (label) => (label.match(/\(([^)]+)\) \[/) || [])[1];

// Precondition helpers (each a step list for runSteps, or a {label}/{key}/{fn} action run by act()).
const L = (label) => ({ label });
const K = (key) => ({ key });
const toc = (text) => [{ click: ".rbb-chapter-name", sleep: 600 }, { fn: `[...document.querySelectorAll("li.rbb-chapter-option")].find((x) => x.textContent.trim() === ${JSON.stringify(text)})?.click()`, sleep: 3000 }];
const other = (target, pool) => [L(pool.find((p) => p !== target))];
const THEMES = ["light theme", "dark theme", "blurby theme", "eink theme", "system theme"];
const ACCENTS = ["Accent color: gold", "Accent color: blurby blue", "Accent color: green", "Accent color: blurby coral", "Accent color: purple", "Accent color: teal"];
const FONTS = ["Georgia", "Merriweather", "Mono", "Literata", "OpenDyslexic", "system"];
const SIZES = ["Small", "Medium", "Large"]; const DENSITY = ["Compact", "Cozy", "Roomy"];

// What each candidate needs before its press, and how it is pressed when a plain click is not the action.
function recipe(c) {
  const k = keyOf(c.label);
  const r = { pre: [], act: k ? K(k) : L(c.label), restart: false };
  const reader = /^(Reader|Keyboard) — (Page|Focus|Flow|Narrate)$/.test(c.surface);
  // Reader rows start in text: the TOC jump works in Page (inside Focus or Flow the reader stays on the cover, where a
  // word seek has nothing to move), so they enter through Page, jump to INTRODUCTION, then switch to their mode.
  const mode = (c.surface.match(/— (Page|Focus|Flow|Narrate)$/) || [])[1];
  if (reader) { r.surface = "Reader — Page"; r.pre.push(...toc("INTRODUCTION")); if (mode !== "Page") r.pre.push({ steps: [{ click: `[aria-label="${mode} mode"]`, sleep: 4000 }] }); }
  const L2 = c.label;
  // "all (N)" is the status tab (all/new/favorites/archived), not the type filter.
  if (/^all \(\d+\)$/.test(L2)) { r.pre.push({ labelRe: "^favorites \\(" }); r.act = { labelRe: "^all \\(\\d+\\)$" }; }
  if (/^Prose-basic/.test(L2)) r.act = { labelRe: "^Prose-basic" };
  if (L2 === "all types") r.pre.push({ labelRe: "^articles \\(" });
  if (L2 === "Close menu") r.pre.push({ steps: [{ click: ".library-hamburger-btn", sleep: 400 }] });
  if (THEMES.includes(L2)) r.pre.push(...other(L2, THEMES));
  if (ACCENTS.includes(L2)) r.pre.push(...other(L2, ACCENTS));
  if (FONTS.includes(L2) && c.surface === "Settings — ThemeSettings") r.pre.push(...other(L2, FONTS));
  if (SIZES.includes(L2)) r.pre.push(...other(L2, SIZES));
  if (DENSITY.includes(L2)) r.pre.push(...other(L2, DENSITY));
  if (L2 === "Grid View") r.pre.push(L("List View")); if (L2 === "List View") r.pre.push(L("Grid View"));
  if (L2 === "Focus" || L2 === "Flow") r.pre.push(L(L2 === "Focus" ? "Flow" : "Focus"));
  if (L2 === "Add reading goal") r.pre.push({ type: "New goal target", text: "5" });
  if (L2 === "Previous page") r.pre.push({ steps: [{ click: '[aria-label="Next page"]', sleep: 1500 }] });
  if (L2 === "Previous chapter") r.pre.push({ steps: [{ click: '[aria-label="Next chapter"]', sleep: 2500 }] });
  if (k === "Ctrl+Up" || k === "Shift+Up" || k === "P") r.pre.push(K(k === "Ctrl+Up" ? "Ctrl+Down" : k === "Shift+Up" ? "Shift+Down" : "]"), { sleep: 1500 }, K(k === "Ctrl+Up" ? "Ctrl+Down" : k === "Shift+Up" ? "Shift+Down" : "]"), { sleep: 1500 });
  if (c.surface === "Keyboard — Library") {
    if (["K", "Up"].includes(k)) r.pre.push(K("j"), K("j"));
    if (k === "Ctrl+Up") r.pre.splice(0, r.pre.length, K("j"), K("j"));
    if (k === "Ctrl+0") r.pre.push(K("Ctrl+="));
    if (k === "E" || k === "#") { r.pre.push(K("j")); r.restart = true; }
    // G then A sets the keyboard hook's own filter, not LibraryView's tab: open the archived tab with its button.
    if (k === "Shift+E") { r.pre.push(K("j"), K("e"), { sleep: 800 }, { labelRe: "^archived \\(" }, { sleep: 800 }, K("j")); r.restart = true; }
  }
  if (c.surface === "Keyboard — Overlays" && k === "Up") r.pre.push(K("Down"), K("Down"));
  // Text fields: the press is a click; the field taking focus is the effect. Blur first.
  if (/title|URL|description|search|Filter or create tag|goal target/i.test(L2) && !/^Add/.test(L2)) r.pre.push({ fn: "document.activeElement && document.activeElement.blur()" });
  return r;
}

// ── run ──────────────────────────────────────────────────────────────────────────────────────────────────────────
async function findLabel(s, label, re) {
  return s.cdp.eval(`(() => {
    const list = window.__sweep.enumerate(null) || [];
    const want = ${JSON.stringify(label || "")}, rx = ${re ? `new RegExp(${JSON.stringify(re)}, "i")` : "null"};
    const c = list.find((x) => rx ? rx.test(x.label) : x.label === want) || (!rx && list.find((x) => x.label.replace(/ \\(\\d+\\)$/, "") === want.replace(/ \\(\\d+\\)$/, "")));
    if (!c) return null;
    const el = document.querySelector(c.selector);
    return { selector: c.selector, tag: el?.tagName.toLowerCase(), type: el?.type || "", label: c.label };
  })()`);
}
async function act(s, a) {
  if (a.sleep && Object.keys(a).length === 1) { await sleep(a.sleep); return "slept"; }
  if (a.steps) { await runSteps(s, a.steps); return "steps"; }
  if (a.click || a.wait || a.clickText || a.rightClick) { await runSteps(s, [a]); return `step ${a.click || a.wait || a.clickText || a.rightClick}`; }
  if (a.fn) { await s.cdp.eval(`(() => { ${a.fn}; return true; })()`); if (a.sleep) await sleep(a.sleep); return "fn"; }
  if (a.key) { for (const k of a.key.split(" then ")) { await s.key(k); await sleep(150); } return `key ${a.key}`; }
  if (a.type) {
    const f = await findLabel(s, a.type); if (!f) throw new Error(`precondition: field "${a.type}" not found`);
    await s.cdp.eval(`document.querySelector(${JSON.stringify(f.selector)}).focus()`);
    for (const ch of a.text) await s.key(ch);
    await sleep(300); return `typed ${a.text}`;
  }
  await s.sw("enumerate(null)");
  const f = await findLabel(s, a.label, a.labelRe);
  if (!f) throw new Error(`control "${a.label || a.labelRe}" not found`);
  // A select's press is choosing another option: focus it and press ArrowDown (Windows changes the value in place).
  if (f.tag === "select") { await s.cdp.eval(`document.querySelector(${JSON.stringify(f.selector)}).focus()`); await s.key("ArrowDown"); await sleep(400); return `select ${f.label}: ArrowDown`; }
  const b = await s.sw(`box(${JSON.stringify(f.selector)})`);
  await s.click(b.x, b.y);
  // A range's press moves its thumb: after the click, ArrowRight moves it one step from wherever the click put it.
  if (f.type === "range") { await sleep(200); await s.key("ArrowRight"); }
  await sleep(500);
  return `click ${f.label}${f.type ? ` (${f.type})` : ""}${b.covered ? ` [covered by ${b.coveredBy}]` : ""}`;
}
async function probe(s) { await s.sw("enumerate(null)").catch(() => {}); return s.cdp.eval(PROBE, 20000); }

async function runOne(sess, plan, ctx, c, run) {
  const r = recipe(c);
  const surface = plan.surfaces.find((x) => x.name === (r.surface || c.surface));
  const row = { n: c.n, run, surface: c.surface, label: c.label, pre: [], effect: [], noise: [], how: "", errors: [] };
  try {
    if (r.restart) await sess.restart(true);
    await enter(sess.s, plan, surface);
    for (const p of r.pre) row.pre.push(await act(sess.s, p));
    await sleep(800);
    const a = await probe(sess.s); await sleep(1200); const b = await probe(sess.s);
    row.noise = diffKeys(a, b);
    const errBefore = sess.s.errors.length, logFrom = logSize(ctx.errorLog);
    row.how = await act(sess.s, r.act);
    await sleep(1500);
    const dialogs = await ctx.watcher.dialogs(sess.s.pid, false); if (dialogs) { row.dialog = dialogs; await ctx.watcher.dialogs(sess.s.pid, true); await sleep(500); }
    const cc = await probe(sess.s);
    row.effect = diffKeys(b, cc).filter((k) => !row.noise.includes(k));
    const fb = flat(b), fc = flat(cc);
    row.detail = row.effect.slice(0, 12).map((k) => `${k}: ${String(fb[k]).slice(0, 60)} → ${String(fc[k]).slice(0, 60)}`);
    row.errors = sess.s.errors.slice(errBefore).map((e) => e.text).filter((t) => !/ResizeObserver/.test(t));
    const added = logSince(ctx.errorLog, logFrom); if (added && !/ResizeObserver loop/.test(added)) row.errors.push(`error.log: ${added.replace(/\s+/g, " ").slice(0, 200)}`);
    row.seen = row.effect.length > 0 || !!row.dialog;
    if (ctx.shots) row.shot = await sess.s.screenshot(path.join(ctx.shotDir, `${String(c.n).padStart(3, "0")}-r${run}.png`));
  } catch (e) { row.failed = e.message; }
  log(`#${c.n} r${run} ${c.surface} | ${c.label.slice(0, 40)} | ${row.failed ? `FAILED ${row.failed}` : row.seen ? `SEEN ${row.effect.slice(0, 4).join(",")}` : "nothing"}`);
  return row;
}

async function main() {
  const out = { started: new Date().toISOString(), control: null, rows: [] };
  const art = path.dirname(args.out); fs.mkdirSync(art, { recursive: true });
  const ctx = { watcher: new DialogWatcher(), errorLog: path.join(args.profile, "blurby-data", "error.log"), shots: true, shotDir: path.join(art, "shots") };
  fs.mkdirSync(ctx.shotDir, { recursive: true });
  out.liveBefore = hashLive(args.liveProfile);
  const plan = blurbyPlan({});
  const pristine = path.join(art, "profile-pristine");
  // The profile preflight (sweep.mjs Session.profilePreflight) runs on every launch and exits 4 if it fails.
  const sess = { s: null, async restart(reseed) { if (this.s) await this.s.stop(); if (reseed) { fs.rmSync(args.profile, { recursive: true, force: true }); fs.cpSync(pristine, args.profile, { recursive: true }); } this.s = new Session({ ...args }); await this.s.start();
} };
  fs.mkdirSync(args.profile, { recursive: true });
  await sess.restart(false);
  await plan.seed(sess.s, args); await sess.s.stop(); fs.rmSync(pristine, { recursive: true, force: true }); fs.cpSync(args.profile, pristine, { recursive: true }); await sess.restart(false);

  // Positive control (Done-when 2): two presses that work must register in the strong probe. "dark theme" from the
  // light theme is the specification's example (--bg). Library J moves the focused card by class only, which the
  // sweep's digest does not read: at least one control press must be invisible to that digest, or the stronger probe
  // proves nothing beyond preconditions. The sweep's digest is read alongside.
  const ctl = [];
  for (const [surfName, pre, press] of [["Settings — ThemeSettings", L("light theme"), L("dark theme")], ["Library — list view", { sleep: 300 }, K("j")]]) {
    await enter(sess.s, plan, plan.surfaces.find((x) => x.name === surfName)); await act(sess.s, pre); await sleep(800);
    const d0 = await sess.s.sw("digest()"), p0 = await probe(sess.s);
    await act(sess.s, press); await sleep(1200);
    const d1 = await sess.s.sw("digest()"), p1 = await probe(sess.s);
    const eff = diffKeys(p0, p1);
    ctl.push({ press: `${surfName}: ${pre.label || "-"} → ${press.label || press.key}`, sweepDigestChanged: ["count", "text", "state", "root", "active", "href", "foliate"].filter((k) => d0[k] !== d1[k]), strong: eff.slice(0, 10), bg: [p0.style.vars["--bg"], p1.style.vars["--bg"]], accent: [p0.style.vars["--accent"], p1.style.vars["--accent"]] });
  }
  out.control = { ok: ctl.every((x) => x.strong.length > 0) && ctl.some((x) => x.sweepDigestChanged.length === 0), rows: ctl };
  log(`positive control: ${out.control.ok ? "PASS" : "FAIL"} ${JSON.stringify(ctl)}`);
  fs.writeFileSync(args.out, JSON.stringify(out, null, 2));
  if (!out.control.ok || args.controlOnly) { await sess.s.stop(); ctx.watcher.stop(); process.exit(out.control.ok ? 0 : 3); }

  const cands = readCandidates(args.reportIn).filter((c) => !args.only || args.only.includes(c.n));
  log(`candidates: ${cands.length}`);
  for (const c of cands) {
    let row;
    for (let run = 1; run <= args.runs; run++) {
      row = await runOne(sess, plan, ctx, c, run);
      out.rows.push(row);
      if (row.failed) { try { await sess.restart(false); } catch (e) { log(`restart failed: ${e.message}`); } }
      if (row.seen && !row.failed) break;
    }
    fs.writeFileSync(args.out, JSON.stringify(out, null, 2));
  }
  await sess.s.stop(); ctx.watcher.stop();
  out.liveAfter = hashLive(args.liveProfile);
  out.finished = new Date().toISOString();
  fs.writeFileSync(args.out, JSON.stringify(out, null, 2));
  log(`done: ${out.rows.length} runs; live profile unchanged: ${JSON.stringify(out.liveBefore) === JSON.stringify(out.liveAfter)}`);
}
main().catch((e) => { console.error(e); process.exit(1); });

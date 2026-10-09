// Test-only G6 live-QA runner (READER-MODE-SEPARATION-2 design §D.7; adapted from admission/matrix.mjs).
// CDP-driven against an isolated-launch-g6.cjs profile. Drives both B0's DOM and the candidate's post-cutover DOM
// (target read from <profile>/isolation.json). DOM button clicks, foliate's public API (renderer.getContents, goTo)
// for word clicks/section navigation, CDP input for real mouse clicks, wheel and PageDown.
//   node matrix-g6.mjs --profile=<g6 profile> --fixture=epub|chapters|text --run=<unique-lowercase> [--only=a+b]
// Output: <profile>/captures/<run>/g6-cases.json (validator case shape), rows.ndjson (full evidence), shots/*.png.
//
// Never writes heardAudio and never writes known-defect: the eval trace is NOT audible evidence; heard audio and
// known-defect rulings are the owner's. result is "pass" or "fail" only.
//
// staleEffectCount (per case) = |T| + |C| + |D| for the case's destination owner `dest`, over the window
// W = [the click that hands control to `dest`, the measurement point before the harness's own probe action].
// For transition/same-mode cases the window opens at the destination mode-button click; for single-mode cases it
// opens when the case's mode is entered and closes at the case's final measurement.
//   T (eval trace, window.__BLURBY_TTS_EVAL_TRACE__ events recorded inside W):
//       word/source=flow and flow-position            when dest != flow
//       word/source=audio                             when dest != narrate
//       lifecycle start|resume|first-audio            when dest != narrate
//     Teardown of the outgoing owner (lifecycle stop/pause, transition/handoff records) is not an effect.
//   C (console, CDP Runtime.consoleAPICalled received inside W and >= 500 ms after it opens): messages whose text
//     starts with a mode-owned tag of a non-destination mode: "[narrate" / "[NARR-DIAG" (narrate),
//     "[FlowScrollEngine" (flow). Production builds strip most of these (import.meta.env.DEV), so C is usually 0.
//   D (DOM at the measurement point): a shown Focus RSVP word display when dest != focus (both targets);
//     candidate only: each mounted .rm-<m>-root with m != dest, plus foliate-view elements beyond one.
//     B0 renders every mode on one shared surface whose cursor classes do not identify an owner (paused Focus and
//     Narrate show page-word--flow-cursor on B0), so cursor classes are not attributed to modes on either target.
import fs from "node:fs/promises";
import path from "node:path";
import WebSocket from "ws";

const samePath = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
const arg = (name, fallback) => process.argv.find((v) => v.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const profile = path.resolve(arg("profile") ?? "");
const manifest = JSON.parse(await fs.readFile(path.join(profile, "isolation.json"), "utf8"));
if (manifest.harness !== "g6" || !samePath(manifest.profile, profile) || !manifest.readyIsolationVerifiedAt || !manifest.rendererIdentityInstalledAt || !manifest.productionInputsClean) {
  throw new Error("Profile is not a verified G6 launch (isolation + renderer identity)");
}
const target = manifest.target;
if (!["b0", "candidate"].includes(target)) throw new Error(`Unknown target ${target}`);
const fixture = arg("fixture", "epub");
const FIXTURES = { epub: { docId: "g0-public-epub", kind: "epub" }, chapters: { docId: "g0-converted-chapters", kind: "non-epub" }, text: { docId: "g0-converted-text", kind: "non-epub" } };
if (!FIXTURES[fixture]) throw new Error("Invalid --fixture");
const { docId, kind: documentKind } = FIXTURES[fixture];
const run = arg("run");
if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("A unique lowercase --run is required");
const only = arg("only");
const out = path.join(profile, "captures", run);
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.mkdir(out);
await fs.mkdir(path.join(out, "shots"));
const now = () => new Date().toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MODES = ["page", "focus", "flow", "narrate"];
const cap = (m) => m[0].toUpperCase() + m.slice(1);
const ANCHOR = 7;
// Per-target DOM. Bottom bar (rbb-*), return pill, Kokoro toast, cross-book overlay and word-span classes
// (page-word--*) are unchanged between B0 and the candidate; these differ:
const DOM = target === "b0"
  ? { focusDisplay: ".reader-word-display", shrink: ".flow-shrink-cursor", roots: null }
  : { focusDisplay: ".rm-focus-word-display", shrink: ".rm-flow-shrink-cursor", roots: { page: ".rm-page-root", focus: ".rm-focus-root", flow: ".rm-flow-root", narrate: ".rm-narrate-root" } };
const HOW = {
  owner: target === "b0" ? "active mode button (.rbb-mode-btn--active); B0 has no per-mode root" : "the single mounted .rm-<mode>-root, cross-checked against the active mode button",
  playback: "play button label (.rbb-play-btn aria-label: Pause = playing); '-warming' when the Kokoro toast shows",
  visibleCursorCount: `distinct page-word--{highlighted,soft-selected,flow-cursor,narrate-cursor,active-word} elements whose centre lies inside the foliate-view box and window, plus a shown ${DOM.shrink}, plus a shown ${DOM.focusDisplay}`,
};

class Cdp {
  constructor(url) { this.ws = new WebSocket(url); this.id = 1; this.pending = new Map(); }
  async connect() {
    this.ws.on("message", (raw) => {
      const m = JSON.parse(String(raw));
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); clearTimeout(p.t); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); return; }
      if (m.method === "Runtime.consoleAPICalled") consoleLog.push({ at: Date.now(), type: m.params.type, text: (m.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 400) });
      if (m.method === "Runtime.exceptionThrown") consoleErrors.push({ at: now(), text: (m.params?.exceptionDetails?.exception?.description || m.params?.exceptionDetails?.text || "").slice(0, 400) });
    });
    await new Promise((res, rej) => { this.ws.once("open", res); this.ws.once("error", rej); });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      const t = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout ${method}`)); }, 30000);
      this.pending.set(id, { resolve, reject, t });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async ev(fn, ...args) {
    const r = await this.send("Runtime.evaluate", { expression: `(${fn.toString()})(...${JSON.stringify(args)})`, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result?.value;
  }
}
const consoleLog = [];
const consoleErrors = [];
let c;

// ---- in-page functions (serialized into the renderer; must be self-contained) ----
function readState(DOM) {
  const CUR = ["page-word--highlighted", "page-word--soft-selected", "page-word--flow-cursor", "page-word--narrate-cursor", "page-word--active-word"];
  const views = [...document.querySelectorAll("foliate-view")];
  const docs = [];
  for (const v of views) { const clip = v.getBoundingClientRect(); for (const e of v.renderer?.getContents?.() || []) if (e.doc) docs.push({ doc: e.doc, index: e.index, clip }); }
  const visibleIn = (el, clip) => {
    const r = el.getBoundingClientRect(); const fe = el.ownerDocument.defaultView?.frameElement; const fr = fe ? fe.getBoundingClientRect() : { left: 0, top: 0 };
    const x = fr.left + r.left + r.width / 2, y = fr.top + r.top + r.height / 2;
    return r.width > 0 && r.height > 0 && x >= Math.max(0, clip.left) && x <= Math.min(innerWidth, clip.right) && y >= Math.max(0, clip.top) && y <= Math.min(innerHeight, clip.bottom);
  };
  const shown = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0; };
  const cursors = {}; const visibleEls = new Set();
  for (const cls of CUR) {
    cursors[cls] = [];
    for (const { doc, clip } of docs) for (const el of doc.querySelectorAll("." + cls)) { cursors[cls].push(Number(el.getAttribute("data-word-index"))); if (visibleIn(el, clip)) visibleEls.add(el); }
  }
  const shrink = [...document.querySelectorAll(DOM.shrink)].filter(shown).length;
  const focusEl = document.querySelector(DOM.focusDisplay);
  const focusVisible = shown(focusEl) ? 1 : 0;
  const roots = DOM.roots ? Object.entries(DOM.roots).filter(([, s]) => document.querySelector(s)).map(([m]) => m) : null;
  const title = views[0]?.book?.metadata?.title;
  return {
    at: Date.now(),
    mode: document.querySelector(".rbb-mode-btn--active")?.getAttribute("aria-label") ?? null,
    roots, foliateViews: views.length,
    play: document.querySelector(".rbb-play-btn")?.getAttribute("aria-label") ?? null,
    playDisabled: Boolean(document.querySelector(".rbb-play-btn")?.disabled),
    cursors, visibleCursorWordElements: visibleEls.size, shrinkVisible: shrink, focusVisible,
    visibleCursorCount: visibleEls.size + shrink + focusVisible,
    focusText: focusEl?.textContent?.trim() ?? null,
    chapter: document.querySelector(".rbb-chapter-name")?.textContent?.trim() ?? null,
    rate: [...document.querySelectorAll('[role="radio"][aria-checked="true"], .rbb-rate-btn--active')].map((n) => n.getAttribute("aria-label") || n.textContent.trim())[0] ?? null,
    sections: docs.map((d) => d.index),
    browsedAway: Boolean(document.querySelector(".return-to-reading-pill")),
    toast: document.querySelector(".kokoro-loading-toast")?.textContent?.trim() ?? null,
    crossBookNext: document.querySelector(".cross-book-overlay__next")?.textContent?.trim() ?? null,
    bookTitle: typeof title === "string" ? title : title ? JSON.stringify(title) : null,
    traceLen: (window.__BLURBY_TTS_EVAL_TRACE__?.getEvents?.() ?? []).length,
    wordSpans: docs.reduce((n, { doc }) => n + doc.querySelectorAll("[data-word-index]").length, 0),
  };
}
function visibleSpans() {
  const outv = [];
  for (const v of document.querySelectorAll("foliate-view")) {
    const clip = v.getBoundingClientRect();
    for (const e of v.renderer?.getContents?.() || []) for (const el of e.doc?.querySelectorAll("[data-word-index]") || []) {
      const r = el.getBoundingClientRect(); const fe = el.ownerDocument.defaultView?.frameElement; const fr = fe ? fe.getBoundingClientRect() : { left: 0, top: 0 };
      const x = fr.left + r.left + r.width / 2, y = fr.top + r.top + r.height / 2;
      if (r.width > 0 && r.height > 0 && x >= Math.max(0, clip.left) + 2 && x <= Math.min(innerWidth, clip.right) - 2 && y >= Math.max(0, clip.top) + 2 && y <= Math.min(innerHeight, clip.bottom) - 2) outv.push({ i: Number(el.getAttribute("data-word-index")), x, y, text: el.textContent });
    }
  }
  return outv.sort((a, b) => a.i - b.i);
}
function wordsInPage() {
  const outw = [];
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) for (const el of e.doc?.querySelectorAll("[data-word-index]") || []) outw.push([Number(el.getAttribute("data-word-index")), el.getAttribute("data-word-full") || el.textContent, e.index]);
  return outw;
}
function clickWordInPage(i, doClick) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    const el = e.doc?.querySelector(`[data-word-index="${i}"]`);
    if (el) { if (doClick) el.click(); return { text: el.textContent, section: e.index }; }
  }
  return null;
}
function wordCentre(i, scroll) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    const el = e.doc?.querySelector(`[data-word-index="${i}"]`); if (!el) continue;
    if (scroll) { el.scrollIntoView({ block: "center", inline: "nearest" }); return { scrolled: true }; }
    const clip = v.getBoundingClientRect(); const r = el.getBoundingClientRect(); const fe = el.ownerDocument.defaultView?.frameElement; const fr = fe ? fe.getBoundingClientRect() : { left: 0, top: 0 };
    const x = fr.left + r.left + r.width / 2, y = fr.top + r.top + r.height / 2;
    return { x, y, visible: r.width > 0 && x > Math.max(0, clip.left) + 2 && x < Math.min(innerWidth, clip.right) - 2 && y > Math.max(0, clip.top) + 2 && y < Math.min(innerHeight, clip.bottom) - 2 };
  }
  return null;
}
// True when the topmost element at (x, y) is the foliate view (not a toast/overlay above it).
function hitIsView(x, y) { const el = document.elementFromPoint(x, y); return Boolean(el && (el.tagName === "FOLIATE-VIEW" || el.closest?.("foliate-view"))); }
function lineStartOf(i) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    const el = e.doc?.querySelector(`[data-word-index="${i}"]`); if (!el) continue;
    const r0 = el.getBoundingClientRect(); const mid0 = (r0.top + r0.bottom) / 2; let start = i;
    for (let k = i - 1; k >= 0; k--) { const p = e.doc.querySelector(`[data-word-index="${k}"]`); if (!p) break; const r = p.getBoundingClientRect(); if (Math.abs((r.top + r.bottom) / 2 - mid0) > r0.height / 2) break; start = k; }
    return start;
  }
  return null;
}
function sectionBoundsOf(i) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    if (!e.doc?.querySelector(`[data-word-index="${i}"]`)) continue;
    const idx = [...e.doc.querySelectorAll("[data-word-index]")].map((el) => Number(el.getAttribute("data-word-index")));
    return { section: e.index, min: Math.min(...idx), max: Math.max(...idx) };
  }
  return null;
}
async function goToSection(k) {
  const v = document.querySelector("foliate-view");
  if (!v) return { ok: false, reason: "no foliate-view" };
  try { await v.goTo(k); return { ok: true, count: v.book?.sections?.length ?? null }; } catch (e) { return { ok: false, reason: String(e) }; }
}
function sectionInfo() { const v = document.querySelector("foliate-view"); return (v?.book?.sections || []).map((s, i) => ({ i, linear: s.linear ?? null })); }
function spansInSection(k) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    if (e.index !== k) continue;
    const idx = [...(e.doc?.querySelectorAll("[data-word-index]") || [])].map((el) => Number(el.getAttribute("data-word-index")));
    if (idx.length) return { section: k, min: Math.min(...idx), max: Math.max(...idx), count: idx.length };
  }
  return null;
}
function sectionStats(k) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    if (e.index !== k) continue;
    const els = [...(e.doc?.querySelectorAll("[data-word-index]") || [])]; if (!els.length) continue;
    const plain = els.filter((el) => !el.closest("a")).map((el) => Number(el.getAttribute("data-word-index")));
    const idx = els.map((el) => Number(el.getAttribute("data-word-index")));
    return { section: k, min: Math.min(...idx), max: Math.max(...idx), count: idx.length, linkFraction: 1 - plain.length / idx.length, lastPlain: plain.length ? Math.max(...plain.filter((i) => i <= Math.max(...idx) - 12)) : null };
  }
  return null;
}
function installFocusLog(sel) {
  if (window.__g6FocusObs) window.__g6FocusObs.disconnect();
  const log = []; window.__g6FocusLog = log; let last;
  // Both targets render the ORP word as <before (characters reversed)><focus><after>: rebuild reading order.
  const wordOf = (el) => { const part = (suffix) => el.querySelector(`[class$="word-${suffix}"]`); const b = part("before"), f = part("focus"), a = part("after"); return b && f && a ? [...b.textContent].reverse().join("") + f.textContent + a.textContent : el.textContent; };
  const read = () => { const el = document.querySelector(sel); const r = el?.getBoundingClientRect(); const t = el && r.width > 0 ? wordOf(el).trim() : null; if (t !== last) { last = t; log.push({ t: performance.now(), text: t }); } };
  const o = new MutationObserver(read); o.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true }); window.__g6FocusObs = o; read();
  return performance.now();
}
function focusLogAndClock() { return { log: window.__g6FocusLog || [], clock: performance.now() }; }
function traceSlice(from) { const ev = window.__BLURBY_TTS_EVAL_TRACE__?.getEvents?.() ?? []; return { len: ev.length, events: ev.slice(from) }; }
function clickOne(s) { const m = [...document.querySelectorAll(s)].filter((n) => n.getBoundingClientRect().width > 0); if (m.length !== 1) return `count ${m.length}`; if (m[0].disabled) return "disabled"; m[0].click(); return "ok"; }
function viewCentre() { const v = document.querySelector("foliate-view"); if (!v) return null; const r = v.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

// ---- driver helpers ----
const state = () => c.ev(readState, DOM);
const traceLen = async () => (await c.ev(traceSlice, 1e9)).len;
const traceSince = async (from) => (await c.ev(traceSlice, from)).events;
const WORDS = new Map();
async function captureWords() { for (const [i, t] of await c.ev(wordsInPage)) WORDS.set(i, t); }
async function waitFor(label, fn, timeoutMs = 20000, ...args) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) { const v = await c.ev(fn, ...args); if (v) return v; await sleep(150); }
  throw new Error(`Timed out: ${label}`);
}
async function clickSel(sel) { const r = await c.ev(clickOne, sel); if (r !== "ok") throw new Error(`click ${sel}: ${r}`); }
const clickMode = (m) => clickSel(`[aria-label="${cap(m)} mode"]`);
async function play() { const s = await state(); if (s.play === "Play") await clickSel(".rbb-play-btn"); }
async function pause() { const s = await state(); if (s.play === "Pause") await clickSel(".rbb-play-btn"); }
// A user selects a word they can see: scroll it into view, then a real mouse click (CDP Input) at its centre.
// Falls back to element.click() only if the word still is not inside the view box; the method is recorded.
async function clickWord(i) {
  const info = await c.ev(clickWordInPage, i, false); if (!info) throw new Error(`word ${i} not in loaded sections`);
  let p = await c.ev(wordCentre, i, false);
  if (!p?.visible) { await c.ev(wordCentre, i, true); await sleep(600); p = await c.ev(wordCentre, i, false); }
  if (p?.visible) {
    // The restore-position toast (shown on open when position > 0) can cover the top lines: wait for it to clear,
    // re-locating the word each time (the view may scroll meanwhile).
    const t = Date.now(); let clear = await c.ev(hitIsView, p.x, p.y);
    while (!clear && Date.now() - t < 8000) { await sleep(400); p = await c.ev(wordCentre, i, false); clear = Boolean(p?.visible) && await c.ev(hitIsView, p.x, p.y); }
    if (clear) {
      await mouseClick(p.x, p.y); await sleep(700);
      if ((await persisted()).position === i) return { ...info, method: "real mouse click (CDP Input) on the visible word", waitedForOverlayMs: Date.now() - t };
      await c.ev(clickWordInPage, i, true);
      return { ...info, method: "real mouse click did not persist the word; element.click() retry", waitedForOverlayMs: Date.now() - t };
    }
  }
  await c.ev(clickWordInPage, i, true); return { ...info, method: "element.click() (word not inside the view box)" };
}
async function waitTrace(from, pred, timeoutMs) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) { const ev = await traceSince(from); const hit = ev.find(pred); if (hit) return hit; await sleep(150); }
  return null;
}
async function key(k, code, vk) { for (const type of ["keyDown", "keyUp"]) await c.send("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: vk }); }
async function mouseClick(x, y) {
  await c.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await c.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await c.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
async function shot(name) {
  const s = await c.send("Page.captureScreenshot", { format: "png" });
  const file = `shots/${name}.png`;
  await fs.writeFile(path.join(out, file), Buffer.from(s.data, "base64"));
  return file;
}
async function persisted() {
  return c.ev(async (id) => { const s = await window.electronAPI.getState(); const d = s.library.find((x) => x.id === id); return { position: d?.position ?? null, queuePosition: d?.queuePosition ?? null, readingMode: s.settings.readingMode, lastReadingMode: s.settings.lastReadingMode }; }, docId);
}
async function libraryDocs() { return c.ev(async () => (await window.electronAPI.getState()).library.map((d) => ({ id: d.id, title: d.title, position: d.position, wordCount: d.wordCount, queuePosition: d.queuePosition }))); }
const spansLoaded = () => [...document.querySelectorAll("foliate-view")].some((v) => (v.renderer?.getContents?.() || []).some((e) => e.doc?.querySelector("[data-word-index]")));
async function openDoc() {
  await c.send("Page.navigate", { url: "http://localhost:5173/" });
  await waitFor("identity", () => Boolean(window.__BLURBY_G6_IDENTITY__));
  await waitFor("card", (id) => Boolean(document.querySelector(`[data-doc-id="${id}"]`)), 20000, docId);
  await clickSel(`[data-doc-id="${docId}"]`);
  await waitFor("reader", () => Boolean(document.querySelector('[aria-label="Reader controls"]')));
  await waitFor("section document", () => [...document.querySelectorAll("foliate-view")].some((v) => (v.renderer?.getContents?.() || []).some((e) => Boolean(e.doc?.body))), 20000);
  await sleep(2500); // full-book extraction re-indexes globally about 1 s after open
}
// After a mode click: the active button names `m`, (candidate) exactly one root and it is `m`, and word spans exist.
async function waitModeReady(m, timeoutMs = 10000) {
  const t = Date.now();
  const ready = await waitFor(`${m} ready`, (m, DOM) => {
    if (document.querySelector(".rbb-mode-btn--active")?.getAttribute("aria-label") !== m[0].toUpperCase() + m.slice(1) + " mode") return false;
    if (DOM.roots) { const mounted = Object.entries(DOM.roots).filter(([, s]) => document.querySelector(s)).map(([k]) => k); if (mounted.length !== 1 || mounted[0] !== m) return false; }
    return [...document.querySelectorAll("foliate-view")].some((v) => (v.renderer?.getContents?.() || []).some((e) => e.doc?.querySelector("[data-word-index]")));
  }, timeoutMs, m, DOM).then(() => true, () => false);
  const ms = Date.now() - t;
  await sleep(800);
  return { ready, ms };
}
async function ensureWordLoaded(i) {
  if (await c.ev(clickWordInPage, i, false)) return "already-loaded";
  for (let k = 0; k < 10; k++) {
    await c.ev(goToSection, k); await sleep(1500);
    if (await c.ev(clickWordInPage, i, false)) return `foliate goTo(${k})`;
  }
  throw new Error(`word ${i} could not be loaded`);
}
// Anchor where both targets support hard selection: a word click in paused Flow.
async function setAnchor(row, a) {
  await clickMode("flow");
  row.anchorFlowReady = await waitModeReady("flow");
  row.anchorLoad = await ensureWordLoaded(a);
  await captureWords();
  row.anchor = a;
  row.lineStart = await c.ev(lineStartOf, a);
  row.anchorWord = await clickWord(a);
  await sleep(700);
  row.anchorPersisted = await persisted();
}
const norm = (s) => (s || "").toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "");
// Focus exposes no index on either target: map each displayed text onto the captured span sequence.
function mapFocus(log, from) {
  // Frames shown < 120 ms are transitional (a word lasts ~240 ms at 250 wpm) and are not mapped.
  const res = []; let p = Math.max(0, from - 3);
  for (const [n, { t, text }] of log.entries()) {
    if (!text) continue;
    if (n + 1 < log.length && log[n + 1].t - t < 120) continue;
    let hit = null;
    for (let k = p; k <= p + 8; k++) if (WORDS.has(k) && norm(WORDS.get(k)) === norm(text) && norm(text)) { hit = k; break; }
    res.push({ t, text, index: hit });
    if (hit != null) p = hit + 1;
  }
  return res;
}
const owner = (s) => {
  const fromButton = s.mode ? s.mode.replace(/ mode$/, "").toLowerCase() : null;
  if (!s.roots) return fromButton ?? "none";
  if (s.roots.length === 1 && s.roots[0] === fromButton) return fromButton;
  return `mismatch(button=${fromButton};roots=${s.roots.join("+") || "none"})`;
};
const playback = (s) => `${s.play === "Pause" ? "playing" : "paused"}${s.toast ? "-warming" : ""}`;
const openWindow = async (row) => { row.window = { traceFrom: await traceLen(), at: Date.now() }; };
async function closeWindow(row, dest, s) {
  const events = await traceSince(row.window.traceFrom);
  const T = events.filter((e) =>
    (dest !== "flow" && ((e.kind === "word" && e.source === "flow") || e.kind === "flow-position")) ||
    (dest !== "narrate" && e.kind === "word" && e.source === "audio") ||
    (dest !== "narrate" && e.kind === "lifecycle" && ["start", "resume", "first-audio"].includes(e.state)));
  const tags = { narrate: /^\[(narrate|NARR-DIAG)/i, flow: /^\[FlowScrollEngine/ };
  const C = consoleLog.filter((m) => m.at >= row.window.at + 500 && Object.entries(tags).some(([mode, re]) => mode !== dest && re.test(m.text)));
  const D = [];
  if (dest !== "focus" && s.focusVisible) D.push("focus RSVP display shown");
  for (const m of s.roots || []) if (m !== dest) D.push(`.rm-${m}-root mounted`);
  if (s.foliateViews > 1) D.push(`${s.foliateViews} foliate-view elements`);
  row.stale = { dest, windowMs: s.at - row.window.at, traceEventsInWindow: events.length, trace: T.map((e) => ({ kind: e.kind, source: e.source, state: e.state, wordIndex: e.wordIndex })), console: C, dom: D, count: T.length + C.length + D.length };
  return row.stale.count;
}
async function probe(m, row) {
  if (m === "page") {
    const s = await state(); const hl = s.cursors["page-word--highlighted"];
    if (hl.length) return { index: hl[0], method: "page highlight (page-word--highlighted)" };
    return { index: (await persisted()).position, method: "persisted position (no page highlight in the DOM)" };
  }
  if (m === "flow") {
    const t0 = await traceLen(); await play();
    const w = await waitTrace(t0, (e) => e.kind === "word" && e.source === "flow", 8000);
    await pause();
    return { index: w?.wordIndex ?? null, method: "first flow word trace event after play" };
  }
  if (m === "narrate") {
    const t0 = await traceLen(); await play();
    const st = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "start" && e.wordIndex != null, 30000);
    const fa = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "first-audio", 40000);
    await sleep(800); await pause();
    return { index: st?.wordIndex ?? null, method: "narrate lifecycle start wordIndex", firstAudioSeen: Boolean(fa), firstAudioLatencyMs: fa?.latencyMs ?? null };
  }
  await c.ev(installFocusLog, DOM.focusDisplay); await play(); await sleep(1600); await pause();
  const { log } = await c.ev(focusLogAndClock);
  const mapped = mapFocus(log, row.anchor ?? 0);
  return { index: mapped.find((x) => x.index != null)?.index ?? null, method: "first Focus display text mapped onto the captured word-span sequence", mapped: mapped.slice(0, 12) };
}
// Environment probe (Decision #26): a hidden or occluded window makes Chromium stop animation frames and throttle
// timers, which silently breaks audio word events, pacing and input. Every step records visibility and a 200 ms
// frame count; a case with any throttled step is "invalid" (re-run it), never pass or fail.
function frameProbe(ms) {
  return new Promise((resolve) => {
    let frames = 0; const t0 = performance.now(); let done = false;
    const finish = () => { if (!done) { done = true; resolve({ frames, visibility: document.visibilityState, elapsedMs: Math.round(performance.now() - t0) }); } };
    const tick = () => { frames++; if (performance.now() - t0 < ms) requestAnimationFrame(tick); else finish(); };
    requestAnimationFrame(tick); setTimeout(finish, ms + 300);
  });
}
const PROBE_MS = 200, MIN_FRAMES = 3;
const step = async (row, label) => {
  const s = await state(); const env = await c.ev(frameProbe, PROBE_MS);
  if (env.visibility !== "visible" || env.frames < MIN_FRAMES) (row.throttledSteps ??= []).push({ label, ...env });
  row.steps.push({ label, ...s, env }); return s;
};
// Playing cursors can be intermittent (B0 Narrate drops page-word--active-word between chunks): sample n states
// 300 ms apart and keep the one with the most visible cursors; every sampled count is kept in row.cursorSamples.
async function sampledMeasure(row, label, n = 6) {
  let best = null; row.cursorSamples = [];
  for (let i = 0; i < n; i++) { const s = await step(row, `${label}-${i}`); row.cursorSamples.push(s.visibleCursorCount); if (!best || s.visibleCursorCount > best.visibleCursorCount) best = s; await sleep(300); }
  return best;
}
// After a handoff: poll up to 3 s for a visible cursor; the state at first sight (or at 3 s) is the measurement.
async function settledMeasure(row, label) {
  const t = Date.now(); let s = await state();
  while (s.visibleCursorCount < 1 && Date.now() - t < 3000) { await sleep(250); s = await state(); }
  row.cursorAppearMs = s.visibleCursorCount >= 1 ? Date.now() - t : null;
  row.steps.push({ label, ...s });
  return s;
}
const lastAudioWord = (events) => events.filter((e) => e.kind === "word" && e.source === "audio").at(-1)?.wordIndex ?? null;
const firstAudioWord = (events) => events.find((e) => e.kind === "word" && e.source === "audio")?.wordIndex ?? null;

const rows = [];
const cases = [];
async function caseRun(category, dest, fn) {
  if (only && !only.split("+").some((p) => category.startsWith(p))) return;
  const id = `${fixture}-${category}`;
  const row = { id, category, fixture, docId, documentKind, target, startedAt: now(), steps: [], checks: {}, expected: null, actual: null, methods: {} };
  try { await fn(row); row.status = "recorded"; } catch (e) { row.status = "error"; row.error = e.message; }
  try { const env = await c.ev(frameProbe, PROBE_MS); row.endEnv = env; if (env.visibility !== "visible" || env.frames < MIN_FRAMES) (row.throttledSteps ??= []).push({ label: "case-end", ...env }); } catch (e) { row.endEnvError = e.message; }
  try { row.screenshot = await shot(category); } catch (e) { row.screenshotError = e.message; }
  await pause().catch(() => {});
  if (row.status === "recorded" && !row.stale && row.measure) await closeWindow(row, dest, row.measure).catch((e) => { row.staleError = e.message; });
  row.finishedAt = now();
  const s = row.measure;
  const ok = row.status === "recorded" && Number.isInteger(row.expected) && row.expected === row.actual && row.stale?.count === 0 && Object.values(row.checks).every((v) => v === true);
  row.result = row.throttledSteps?.length ? "invalid" : ok ? "pass" : "fail";
  rows.push(row);
  await fs.appendFile(path.join(out, "rows.ndjson"), JSON.stringify(row) + "\n");
  cases.push({
    id, documentKind, category, fixture, docId,
    expectedCanonicalIndex: row.expected, actualCanonicalIndex: row.actual,
    owner: s ? owner(s) : "unmeasured", playback: s ? playback(s) : "unmeasured",
    visibleCursorCount: s ? s.visibleCursorCount : null,
    staleEffectCount: row.stale ? row.stale.count : null,
    result: row.result,
    lastAudioWord: row.lastAudio ?? null, // Decision #24: baseline-equal measure where B0 itself misses the ideal
    checks: row.checks,
    measurement: { target, expectedRule: row.methods.expected ?? null, actualMethod: row.methods.actual ?? null, ownerMethod: HOW.owner, playbackMethod: HOW.playback, visibleCursorMethod: HOW.visibleCursorCount, staleBreakdown: row.stale ? { trace: row.stale.trace.length, console: row.stale.console.length, dom: row.stale.dom.length } : null },
    ...(row.error ? { notes: `harness error: ${row.error}` } : {}),
    ...(row.throttledSteps ? { invalidReason: "page throttled (hidden/occluded): re-run required", throttledSteps: row.throttledSteps } : {}),
    screenshot: row.screenshot ? `captures/${run}/${row.screenshot}` : null,
    evidenceRef: `captures/${run}/rows.ndjson#${id}`,
  });
  console.log(`${id}: ${row.result}${row.error ? " ERROR " + row.error : ""} expected=${row.expected} actual=${row.actual} stale=${row.stale?.count ?? "-"} vis=${s?.visibleCursorCount ?? "-"} checks=${JSON.stringify(row.checks)}`);
}

// ---- cases ----
async function pageNavSelection(row) {
  await openDoc(); await openWindow(row);
  let spans = await c.ev(visibleSpans); let presses = 0;
  while (!spans.length && presses < 6) { await clickSel('[aria-label="Next page"]'); presses++; await sleep(1200); spans = await c.ev(visibleSpans); }
  if (!spans.length) throw new Error("no visible word spans in Page after 6 Next page");
  row.textPageAfterNextPresses = presses;
  const v0 = spans[0].i; await step(row, "text-page");
  await clickSel('[aria-label="Next page"]'); await sleep(1200);
  const v1 = (await c.ev(visibleSpans))[0]?.i ?? null; await step(row, "next-page");
  await clickSel('[aria-label="Previous page"]'); await sleep(1200);
  spans = await c.ev(visibleSpans); const v2 = spans[0]?.i ?? null; await step(row, "previous-page");
  row.nav = { v0, v1, v2 };
  row.checks.nextPageAdvances = v1 != null && v1 > v0;
  row.checks.previousPageReturns = v2 === v0;
  const t = spans[Math.min(10, spans.length - 1)];
  for (let i = 0; i < 20 && !(await c.ev(hitIsView, t.x, t.y)); i++) await sleep(400); // toast clear
  await mouseClick(t.x, t.y); await sleep(1000);
  row.expected = t.i; row.methods.expected = "data-word-index of the visible span under a real mouse click (CDP Input)";
  const s1 = await step(row, "after-click");
  row.actual = s1.cursors["page-word--highlighted"][0] ?? null; row.methods.actual = "page highlight (page-word--highlighted)";
  row.persistedAfterClick = await persisted();
  await sleep(2000); const s2 = await step(row, "static-2s");
  row.checks.pageStaticNoAutoAdvance = (s2.cursors["page-word--highlighted"][0] ?? null) === row.actual && ((await c.ev(visibleSpans))[0]?.i ?? null) === v2;
  row.checks.ownerIsPage = owner(s2) === "page";
  row.checks.oneVisibleCursor = s2.visibleCursorCount === 1;
  row.measure = s2;
}
async function focusPacing(row) {
  await openDoc(); await setAnchor(row, ANCHOR);
  await clickMode("focus"); row.ready = await waitModeReady("focus"); await openWindow(row);
  const t0 = await c.ev(installFocusLog, DOM.focusDisplay);
  await play(); await sleep(600); row.measure = await sampledMeasure(row, "playing"); await sleep(600);
  await pause(); const { clock: pausedAt } = await c.ev(focusLogAndClock);
  await sleep(1500); const sp = await step(row, "paused");
  const { clock: resumeAt } = await c.ev(focusLogAndClock);
  await play(); await sleep(2000); await pause(); await sleep(300);
  const { log } = await c.ev(focusLogAndClock);
  const before = mapFocus(log.filter((x) => x.t < pausedAt), row.anchor);
  const changedWhilePaused = log.filter((x) => x.t > pausedAt + 300 && x.t < resumeAt && x.text);
  const afterAll = mapFocus(log.filter((x) => x.t < resumeAt), row.anchor);
  const p = before.filter((x) => x.index != null).at(-1)?.index ?? null;
  const after = mapFocus(log.filter((x) => x.t >= resumeAt), p ?? row.anchor).filter((x) => x.index != null);
  const idx = before.filter((x) => x.index != null).map((x) => x.index);
  row.focus = { installedAt: t0, pausedAt, resumeAt, displayedBefore: before.length, mappedBefore: idx.length, lastBeforePause: p, firstAfterResume: after[0]?.index ?? null, changedWhilePaused: changedWhilePaused.length, sample: afterAll.slice(0, 8) };
  row.expected = row.anchor; row.methods.expected = "the anchor (hard-selected word clicked in paused Flow)";
  row.actual = idx[0] ?? null; row.methods.actual = "first Focus display text mapped onto the captured word-span sequence";
  row.checks.pacingAdvances = idx.length >= 4 && idx.every((v, i) => i === 0 || v > idx[i - 1]);
  row.checks.pauseHolds = changedWhilePaused.length === 0 && sp.play === "Play";
  row.checks.resumeContinues = p != null && after.length > 0 && after[0].index >= p && after[0].index <= p + 2;
  row.checks.ownerIsFocus = owner(row.measure) === "focus";
  row.checks.cursorVisible = row.measure.visibleCursorCount >= 1;
}
async function flowFollow(row) {
  await openDoc(); await setAnchor(row, ANCHOR); await openWindow(row);
  const t0 = await traceLen(); await play();
  for (let i = 0; i < 8; i++) { await sleep(500); const s = await step(row, `playing-${i}`); if (i === 3) row.measure = s; }
  const words = (await traceSince(t0)).filter((e) => e.kind === "word" && e.source === "flow").map((e) => e.wordIndex);
  row.expected = row.lineStart; row.methods.expected = "start of the visual line containing the anchor (Flow paces by line; B0 g0: 7->6 EPUB, 7->4 chapters)";
  row.actual = words[0] ?? null; row.methods.actual = "first flow word trace event after play";
  // B0 traces one flow word per play, so follow is read from the DOM flow cursor across the 8 samples.
  const cur = row.steps.filter((s) => s.label.startsWith("playing-")).map((s) => s.cursors["page-word--flow-cursor"][0] ?? null);
  row.follow = { traceWordEvents: words.length, firstTraceWord: words[0] ?? null, cursorPath: cur };
  row.checks.followAdvances = cur.every((v) => v != null) && new Set(cur).size >= 4 && cur.every((v, i) => i === 0 || v >= cur[i - 1]);
  row.checks.ownerIsFlow = owner(row.measure) === "flow";
  row.checks.playing = row.measure.play === "Pause";
}
async function flowBrowse(row, cross) {
  await openDoc(); await setAnchor(row, ANCHOR); await openWindow(row);
  await play(); await sleep(2500);
  const s0 = await step(row, "playing"); const before = s0.sections.join(",");
  const centre = await c.ev(viewCentre);
  await c.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: centre.x, y: centre.y, deltaX: 0, deltaY: 500 });
  await sleep(1200); let s = await step(row, "after-wheel");
  row.browseInput = [s.browsedAway ? "wheel (browsed away)" : "wheel (no browse-away)"];
  // The reading position at browse-away = the flow cursor in the first paused state (else the last cursor seen).
  let lastCursor = s0.cursors["page-word--flow-cursor"][0] ?? null, pausedCursor;
  const note = (st) => { const k = st.cursors["page-word--flow-cursor"][0]; if (st.play === "Play" && pausedCursor === undefined) pausedCursor = k ?? lastCursor; if (k != null) lastCursor = k; };
  note(s);
  let presses = 0;
  while (presses < (cross ? 30 : 3) && (cross ? s.sections.join(",") === before || !s.browsedAway : !s.browsedAway)) {
    await key("PageDown", "PageDown", 34); presses++; await sleep(cross ? 450 : 900); s = await state(); note(s);
  }
  row.browseInput.push(`PageDown x${presses}`);
  await sleep(1200); const away = await step(row, "browsed-away"); note(away);
  row.expected = pausedCursor ?? null; row.methods.expected = "flow cursor (page-word--flow-cursor) when browsing paused Flow (B0 traces one flow word per play, so the DOM cursor is the position source)";
  row.checks.browsedAway = away.browsedAway;
  row.checks.browsePausedFlow = away.play === "Play";
  row.checks[cross ? "crossedSection" : "stayedInSection"] = cross ? away.sections.join(",") !== before : away.sections.join(",") === before;
  await clickSel(".return-to-reading-pill");
  let r = null;
  for (let i = 0; i < 25; i++) { await sleep(250); r = await state(); if (r.cursors["page-word--flow-cursor"].length && !r.browsedAway) break; }
  await sleep(600); r = await step(row, "returned");
  row.actual = r.cursors["page-word--flow-cursor"][0] ?? null; row.methods.actual = "flow cursor (page-word--flow-cursor) after the return pill";
  row.checks.pillGoneAfterReturn = !r.browsedAway;
  row.checks.cursorVisibleAfterReturn = r.visibleCursorCount >= 1;
  row.checks.ownerIsFlow = owner(r) === "flow";
  row.measure = r;
}
async function narrateStart(row, a) {
  await openDoc(); await setAnchor(row, a);
  await clickMode("narrate"); row.ready = await waitModeReady("narrate"); await openWindow(row);
  const t0 = await traceLen(); await play();
  const st = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "start" && e.wordIndex != null, 30000);
  const fa = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "first-audio", 40000);
  await sleep(500); row.measure = await sampledMeasure(row, "speaking");
  row.expected = a; row.methods.expected = "the anchor (hard-selected word clicked in paused Flow)";
  row.actual = st?.wordIndex ?? null; row.methods.actual = "narrate lifecycle start wordIndex (eval trace)";
  row.firstAudio = fa ? { latencyMs: fa.latencyMs ?? null } : null;
  row.checks.firstAudioTraced = Boolean(fa);
  row.checks.ownerIsNarrate = owner(row.measure) === "narrate";
  row.checks.cursorVisible = row.measure.visibleCursorCount >= 1;
}
async function narrateStartedAt0(row) {
  await openDoc(); await setAnchor(row, 0);
  await clickMode("narrate"); row.ready = await waitModeReady("narrate"); await openWindow(row);
  const t0 = await traceLen(); await play();
  const fa = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "first-audio", 40000);
  row.checks.firstAudioTraced = Boolean(fa);
  return t0;
}
async function narratePauseResume(row) {
  const t0 = await narrateStartedAt0(row);
  await sleep(1200); row.measure = await sampledMeasure(row, "speaking");
  await pause(); await sleep(300);
  const tPaused = await traceLen();
  const L = lastAudioWord(await traceSince(t0));
  await sleep(1500); await step(row, "paused");
  const during = (await traceSince(tPaused)).filter((e) => e.kind === "word" && e.source === "audio");
  const t1 = await traceLen(); await play(); await sleep(2500); await step(row, "resumed");
  const resumed = await traceSince(t1);
  row.resume = { lastBeforePause: L, audioWordsWhilePaused: during.length, resumeEvents: resumed.filter((e) => e.kind === "lifecycle" && e.state === "resume").length, startEvents: resumed.filter((e) => e.kind === "lifecycle" && e.state === "start").length, firstAfterResume: firstAudioWord(resumed), wordsAfterResume: resumed.filter((e) => e.kind === "word" && e.source === "audio").map((e) => e.wordIndex).slice(0, 8) };
  row.expected = L == null ? null : L + 1; row.methods.expected = "next word after the last audio word event before pause";
  row.actual = row.resume.firstAfterResume; row.methods.actual = "first audio word trace event after resume";
  row.checks.noColdRestart = row.resume.resumeEvents >= 1 && row.resume.startEvents === 0;
  row.checks.silentWhilePaused = during.length === 0;
  row.checks.ownerIsNarrate = owner(row.measure) === "narrate";
  row.checks.cursorVisible = row.measure.visibleCursorCount >= 1;
}
async function narrateRate(row) {
  const t0 = await narrateStartedAt0(row);
  await sleep(200); row.measure = await sampledMeasure(row, "speaking-1.0");
  row.rate = [];
  for (const r of ["1.4", "1.0"]) {
    const tr = await traceLen(); const L = lastAudioWord(await traceSince(t0));
    await clickSel(`[aria-label="${r}x speed"]`);
    const clickAt = Date.now();
    // The re-seed's first audio word can take > 2.5 s (seen on B0 and the candidate); wait for it, record the gap.
    const firstWord = await waitTrace(tr, (e) => e.kind === "word" && e.source === "audio", 10000);
    const reseedGapMs = firstWord ? Date.now() - clickAt : null;
    const resp = (await traceSince(tr)).find((e) => e.kind === "transition" && e.transition === "rate-response") ?? null;
    await sleep(2500); await step(row, `speaking-${r}`);
    const after = await traceSince(tr);
    row.rate.push({ to: r, lastBefore: L, readout: (await state()).rate, response: resp ? { from: resp.from, to: resp.to, latencyMs: resp.latencyMs } : null, firstAfter: firstAudioWord(after), startEvents: after.filter((e) => e.kind === "lifecycle" && e.state === "start").length, reseedGapMs, wordsAfter: after.filter((e) => e.kind === "word" && e.source === "audio").map((e) => e.wordIndex).slice(0, 8) });
  }
  const [up, down] = row.rate;
  // A rate change re-seeds narration at the word being spoken (NARRATE-A5-RATE-RESEED-1); the rate-response
  // trace fires only on the same-bucket live-tempo path, so it is recorded but not required.
  row.expected = up.lastBefore; row.methods.expected = "the word being spoken at the 1.0->1.4 click (last audio word event before it; the rate re-seed restarts that word)";
  row.actual = up.firstAfter; row.methods.actual = "first audio word trace event after the 1.0->1.4 click";
  row.checks.readout14 = /^1\.4x/.test(up.readout ?? "");
  row.checks.downReseedsAtSpokenWord = down.lastBefore != null && down.firstAfter === down.lastBefore;
  row.checks.noColdRestart = up.startEvents === 0 && down.startEvents === 0;
  row.checks.ownerIsNarrate = owner(row.measure) === "narrate";
  row.checks.cursorVisible = row.measure.visibleCursorCount >= 1;
  const end = await step(row, "end"); row.rateLabelEnd = end.rate;
  row.checks.rateReadoutBackTo10 = /^1\.0x/.test(end.rate ?? "");
}
async function transitionCase(row, from, to) {
  await openDoc(); await setAnchor(row, ANCHOR); await step(row, "anchored-in-flow");
  if (from !== "flow") { await clickMode(from); row.fromReady = await waitModeReady(from); await step(row, `from-${from}`); }
  await openWindow(row);
  await clickMode(to); row.toReady = await waitModeReady(to);
  const s = await settledMeasure(row, `to-${to}`); row.measure = s;
  await closeWindow(row, to, s);
  row.probe = await probe(to, row);
  row.expected = to === "flow" ? row.lineStart : row.anchor;
  row.methods.expected = to === "flow" ? "start of the visual line containing anchor 7 (Flow paces by line)" : "anchor 7 (hard-selected word clicked in paused Flow)";
  row.actual = row.probe.index; row.methods.actual = row.probe.method;
  row.persistedAfter = await persisted();
  row.checks.destinationReady = row.toReady.ready;
  row.checks.ownerIsDestination = owner(s) === to;
  row.checks.enteredPaused = s.play === "Play";
  row.checks.oneVisibleCursor = s.visibleCursorCount === 1;
  if (to === "narrate") row.checks.firstAudioTraced = row.probe.firstAudioSeen === true;
}
async function sameModeCase(row, m) {
  await openDoc(); await setAnchor(row, ANCHOR);
  if (m !== "flow") { await clickMode(m); row.fromReady = await waitModeReady(m); }
  const s1 = await step(row, "before");
  await openWindow(row);
  await clickMode(m); await sleep(1200);
  const s2 = await settledMeasure(row, "after"); row.measure = s2;
  await closeWindow(row, m, s2);
  row.newTraceEvents = (await traceSince(row.window.traceFrom)).map((e) => ({ kind: e.kind, state: e.state, transition: e.transition }));
  row.probe = await probe(m, row);
  row.expected = m === "flow" ? row.lineStart : row.anchor;
  row.methods.expected = m === "flow" ? "start of the visual line containing anchor 7" : "anchor 7";
  row.actual = row.probe.index; row.methods.actual = row.probe.method;
  row.checks.modeUnchanged = s1.mode === s2.mode && owner(s2) === m;
  row.checks.cursorsUnchanged = JSON.stringify(s1.cursors) === JSON.stringify(s2.cursors);
  row.checks.stillPaused = s2.play === "Play";
  row.checks.oneVisibleCursor = s2.visibleCursorCount === 1;
}
async function narrateSection(row) {
  await openDoc(); await clickMode("flow"); await waitModeReady("flow");
  row.anchorLoad = await ensureWordLoaded(ANCHOR); await captureWords();
  // A prose section: the Meditations EPUB opens on a table of contents whose words are links (a click there
  // navigates instead of selecting), so walk forward to the first section with < 5 % linked words.
  const first = await c.ev(sectionBoundsOf, ANCHOR); let b = await c.ev(sectionStats, first.section);
  for (let k = first.section + 1; b.linkFraction >= 0.05 && k <= first.section + 6; k++) {
    await c.ev(goToSection, k); let st = null;
    for (let i = 0; i < 16 && !st; i++) { await sleep(250); st = await c.ev(sectionStats, k); }
    if (st) b = st;
  }
  row.sectionBounds = b; await captureWords();
  if (b.linkFraction >= 0.05 || b.lastPlain == null) throw new Error("no prose section found for the section-transition anchor");
  const a = b.lastPlain; row.anchor = a; row.anchorWord = await clickWord(a); await sleep(700); row.anchorPersisted = await persisted();
  await clickMode("narrate"); row.ready = await waitModeReady("narrate"); await openWindow(row);
  const before = await step(row, "narrate-paused");
  const t0 = await traceLen(); await play();
  const st = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "start" && e.wordIndex != null, 30000);
  const hit = await waitTrace(t0, (e) => e.kind === "word" && e.source === "audio" && e.wordIndex > b.max, 45000);
  // The narrate chunk-boundary mark (e.g. 5560 on the EPUB) comes and goes ~45 s in on B0 and the candidate;
  // 6 samples straddled it, so sample ~8 s past the boundary (max is the measurement, on both targets).
  row.measure = await sampledMeasure(row, "after-boundary", 24);
  const ev = await traceSince(t0);
  row.lastAudio = lastAudioWord(ev);
  row.section = { start: st?.wordIndex ?? null, sectionTransitionEvents: ev.filter((e) => e.kind === "transition" && e.transition === "section").length, chapters: [before.chapter, row.measure.chapter], audioWordsAcross: ev.filter((e) => e.kind === "word" && e.source === "audio").map((e) => e.wordIndex).filter((w) => w >= b.max - 2).slice(0, 8) };
  row.expected = b.max + 1; row.methods.expected = "first word of the next section (last word index of the anchor's section + 1)";
  row.actual = hit?.wordIndex ?? null; row.methods.actual = "first audio word trace event beyond the section's last word";
  row.checks.startedAtAnchor = st?.wordIndex === a;
  row.checks.ownerIsNarrate = owner(row.measure) === "narrate";
  row.checks.stillPlaying = row.measure.play === "Pause";
}
async function narrateBook(row) {
  await openDoc(); await clickMode("flow"); await waitModeReady("flow");
  const lib = await libraryDocs(); const me = lib.find((d) => d.id === docId);
  const next = lib.filter((d) => d.id !== docId && d.queuePosition != null && (d.wordCount <= 0 || d.position < d.wordCount)).sort((x, y) => x.queuePosition - y.queuePosition)[0] ?? null;
  row.expectedNext = next; row.library = lib;
  const secs = await c.ev(sectionInfo); let end = null;
  for (let k = secs.length - 1; k >= Math.max(0, secs.length - 8) && !end; k--) {
    if (secs[k].linear === "no") continue;
    await c.ev(goToSection, k);
    for (let i = 0; i < 16 && !end; i++) { await sleep(250); end = await c.ev(spansInSection, k); }
  }
  if (!end) throw new Error("no word spans in the last sections");
  row.lastSection = end; await captureWords();
  const a = Math.max(end.min, end.max - 10); row.anchor = a; row.anchorWord = await clickWord(a); await sleep(700); row.anchorPersisted = await persisted();
  await clickMode("narrate"); row.ready = await waitModeReady("narrate"); await openWindow(row);
  const s0 = await step(row, "narrate-paused");
  const t0 = await traceLen(); await play();
  const st = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "start" && e.wordIndex != null, 30000);
  let s = s0, overlay = null; const deadline = Date.now() + 90000;
  while (Date.now() < deadline) { await sleep(300); s = await state(); if (s.crossBookNext && !overlay) { overlay = s.crossBookNext; await step(row, "overlay"); } if (s.bookTitle && s.bookTitle !== s0.bookTitle) break; }
  row.bookTitles = { before: s0.bookTitle, after: s.bookTitle };
  // the next book's start: the first lifecycle start after the one that started this book's narration
  const startIdx = async () => { const ev = await traceSince(t0); const starts = ev.filter((e) => e.kind === "lifecycle" && e.state === "start"); return starts.length > 1 ? starts[1] : null; };
  let st2 = null; for (let i = 0; i < 60 && !st2; i++) { st2 = await startIdx(); if (!st2) await sleep(500); }
  row.measure = await sampledMeasure(row, "next-book");
  const ev = await traceSince(t0);
  row.lastAudio = lastAudioWord(ev);
  row.book = { firstStart: st?.wordIndex ?? null, overlay, nextStart: st2?.wordIndex ?? null, bookTransitionEvents: ev.filter((e) => e.kind === "transition" && (e.transition === "book" || e.transition === "handoff")).map((e) => ({ transition: e.transition, context: e.context, latencyMs: e.latencyMs })), flowWordsAfterOverlay: ev.filter((e) => e.kind === "word" && e.source === "flow").length };
  row.expected = next?.position ?? null; row.methods.expected = "the next queued book's persisted position at case start (seeded 0)";
  row.actual = st2?.wordIndex ?? null; row.methods.actual = "second narrate lifecycle start wordIndex (first start in the next book)";
  row.checks.nextBookExpected = Boolean(next);
  row.checks.overlayNamedNextBook = Boolean(overlay && next && overlay.includes(next.title));
  row.checks.nextBookOpened = Boolean(next && s.bookTitle && s.bookTitle !== s0.bookTitle);
  row.checks.ownerIsNarrate = owner(row.measure) === "narrate";
  row.checks.playingInNextBook = row.measure.play === "Pause";
  row.finishedDoc = (await libraryDocs()).find((d) => d.id === docId); row.startDoc = me;
}

try {
  const targets = (await (await fetch(`http://127.0.0.1:${manifest.cdpPort}/json/list`)).json()).filter((t) => t.type === "page" && /^http:\/\/localhost:5173/.test(t.url));
  if (targets.length !== 1) throw new Error(`Expected one renderer, found ${targets.length}`);
  c = new Cdp(targets[0].webSocketDebuggerUrl);
  await c.connect();
  await c.send("Runtime.enable"); await c.send("Page.enable");
  const identity = await c.ev(() => window.__BLURBY_G6_IDENTITY__ || null);
  if (!identity || identity.runId !== manifest.runId || identity.target !== target || identity.buildManifestSha256 !== manifest.buildManifestSha256) throw new Error("Renderer identity mismatch");

  await caseRun("page-nav-selection", "page", pageNavSelection);
  await caseRun("focus-pacing-pause-resume", "focus", focusPacing);
  await caseRun("flow-follow", "flow", flowFollow);
  await caseRun("flow-browse-same-section", "flow", (row) => flowBrowse(row, false));
  await caseRun("flow-browse-cross-section", "flow", (row) => flowBrowse(row, true));
  await caseRun("narrate-start-0", "narrate", (row) => narrateStart(row, 0));
  await caseRun("narrate-start-nonzero", "narrate", (row) => narrateStart(row, ANCHOR));
  await caseRun("narrate-pause-resume-no-cold-restart", "narrate", narratePauseResume);
  await caseRun("narrate-rate-1.0-1.4-1.0", "narrate", narrateRate);
  for (const from of MODES) for (const to of MODES) if (from !== to) await caseRun(`transition-${from}-${to}`, to, (row) => transitionCase(row, from, to));
  for (const m of MODES) await caseRun(`same-mode-${m}`, m, (row) => sameModeCase(row, m));
  // Last: these move the persisted position past the first section / finish the book and open the next one.
  await caseRun("narrate-section-transition", "narrate", narrateSection);
  await caseRun("narrate-book-transition", "narrate", narrateBook);
} catch (e) {
  rows.push({ id: "runner", status: "error", error: e.stack });
  process.exitCode = 1;
} finally {
  const doc = {
    schemaVersion: 1, harness: "g6", target, head: manifest.head, candidate: manifest.candidate, runId: manifest.runId, run, fixture, docId, documentKind,
    buildDir: manifest.buildDir, buildManifestSha256: manifest.buildManifestSha256,
    fixtureSha256: manifest.fixtures.find((f) => f.id === docId)?.sha256 ?? null,
    finishedAt: now(), how: HOW,
    staleEffectCountDefinition: "T+C+D over the window from the click that hands control to the destination to the measurement point: T = eval-trace flow word/flow-position (dest!=flow), audio word (dest!=narrate), lifecycle start|resume|first-audio (dest!=narrate); C = console messages >=500 ms into the window tagged [narrate/[NARR-DIAG (dest!=narrate) or [FlowScrollEngine (dest!=flow); D = shown Focus RSVP display (dest!=focus), candidate: mounted .rm-<m>-root (m!=dest) and foliate-view elements beyond one",
    heardAudio: "not recorded by this harness: the eval trace is not audible evidence; heard audio is the owner's observation",
    consoleErrors, runnerErrors: rows.filter((r) => r.id === "runner"),
    cases,
  };
  await fs.writeFile(path.join(out, "g6-cases.json"), JSON.stringify(doc, null, 2));
  console.log(JSON.stringify({ out, cases: cases.length, pass: cases.filter((x) => x.result === "pass").length, fail: cases.filter((x) => x.result === "fail").length, runnerError: rows.some((r) => r.id === "runner"), consoleErrors: consoleErrors.length }));
  c?.ws.close();
}

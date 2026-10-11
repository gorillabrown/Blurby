// Test-only G0 live-matrix runner (A3). CDP-driven: DOM button clicks, foliate's public renderer API for
// word clicks, CDP input only for wheel/PageDown. Reads window.__BLURBY_TTS_EVAL_TRACE__ for Flow/Narrate
// indices. Trace and DOM events are never audible evidence; heard audio is the owner's observation.
// node matrix.mjs --profile=<bootstrap profile> --fixture=epub|chapters --run=<unique-name>
import fs from "node:fs/promises";
import path from "node:path";
import WebSocket from "ws";

const expectedRoot = "C:/Projects/Blurby/.worktrees/reader-mode-separation-2";
const samePath = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
if (!samePath(process.cwd(), expectedRoot)) throw new Error("Refusing unexpected working directory");
const arg = (name, fallback) => process.argv.find((v) => v.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const profile = path.resolve(arg("profile") ?? "");
const manifest = JSON.parse(await fs.readFile(path.join(profile, "isolation.json"), "utf8"));
if (!samePath(manifest.profile, profile) || !manifest.readyIsolationVerifiedAt || !manifest.rendererIdentityInstalledAt || !manifest.productionMatchesPin) throw new Error("Bootstrap has not verified isolation and renderer identity");
const fixture = arg("fixture", "epub");
const docId = { epub: "g0-public-epub", chapters: "g0-converted-chapters", text: "g0-converted-text" }[fixture];
if (!docId) throw new Error("Invalid fixture");
const run = arg("run");
if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("A unique lowercase --run is required");
const only = arg("only"); // optional "+"-separated list of case-name prefixes
const out = path.join(profile, "captures", run);
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.mkdir(out);
await fs.mkdir(path.join(out, "shots"));
const now = () => new Date().toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MODES = ["page", "focus", "flow", "narrate"];
const cap = (m) => m[0].toUpperCase() + m.slice(1);

class Cdp {
  constructor(url) { this.ws = new WebSocket(url); this.id = 1; this.pending = new Map(); }
  async connect() {
    this.ws.on("message", (raw) => {
      const m = JSON.parse(String(raw));
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); clearTimeout(p.t); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
      else if (m.method === "Runtime.exceptionThrown" || (m.method === "Runtime.consoleAPICalled" && m.params?.type === "error")) consoleErrors.push({ at: now(), method: m.method, text: (m.params?.exceptionDetails?.exception?.description || m.params?.args?.map((a) => a.value ?? a.description).join(" ") || "").slice(0, 400) });
    });
    await new Promise((res, rej) => { this.ws.once("open", res); this.ws.once("error", rej); });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      const t = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout ${method}`)); }, 20000);
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
const consoleErrors = [];
let c;

// ---- in-page readers (serialized into the renderer) ----
function readState() {
  const CUR = ["page-word--highlighted", "page-word--soft-selected", "page-word--flow-cursor", "page-word--narrate-cursor", "page-word--active-word"];
  const docs = [];
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) if (e.doc) docs.push({ doc: e.doc, index: e.index });
  const cursors = {}; const visibleEls = new Set();
  const inView = (el) => { const r = el.getBoundingClientRect(); const w = el.ownerDocument.defaultView; return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < (w?.innerWidth || 0) && r.top < (w?.innerHeight || 0); };
  for (const cls of CUR) {
    cursors[cls] = [];
    for (const { doc } of docs) for (const el of doc.querySelectorAll("." + cls)) { cursors[cls].push(Number(el.getAttribute("data-word-index"))); if (inView(el)) visibleEls.add(el); }
  }
  const shrink = [...document.querySelectorAll(".flow-shrink-cursor")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length;
  const focusEl = document.querySelector(".reader-word-display");
  const focusVisible = focusEl && focusEl.getBoundingClientRect().width > 0 ? 1 : 0;
  const ev = window.__BLURBY_TTS_EVAL_TRACE__?.getEvents?.() ?? [];
  return {
    at: new Date().toISOString(),
    mode: document.querySelector(".rbb-mode-btn--active")?.getAttribute("aria-label") ?? null,
    play: document.querySelector(".rbb-play-btn")?.getAttribute("aria-label") ?? null,
    playDisabled: Boolean(document.querySelector(".rbb-play-btn")?.disabled),
    cursors, visibleCursorWordElements: visibleEls.size, flowShrinkCursors: shrink, focusDisplayVisible: focusVisible,
    visibleCursorCount: visibleEls.size + shrink + focusVisible,
    focusText: focusEl?.textContent?.trim() ?? null,
    chapter: document.querySelector(".rbb-chapter-name")?.textContent?.trim() ?? null,
    rate: document.querySelector(".rbb-wpm-label")?.textContent?.trim() ?? null,
    wpm: [...document.querySelectorAll(".reader-bottom-bar *")].map((n) => n.childElementCount === 0 ? n.textContent.trim() : "").find((t) => /\d+\s*wpm/i.test(t)) ?? null,
    sections: docs.map((d) => d.index),
    browsedAway: Boolean(document.querySelector(".return-to-reading-pill")),
    toast: document.querySelector(".kokoro-loading-toast")?.textContent?.trim() ?? null,
    traceLen: ev.length,
    wordSpans: docs.reduce((n, { doc }) => n + doc.querySelectorAll("[data-word-index]").length, 0),
  };
}
function clickWordInPage(i, doClick) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    const el = e.doc?.querySelector(`[data-word-index="${i}"]`);
    if (el) { if (doClick) el.click(); return { text: el.textContent, full: el.getAttribute("data-word-full"), section: e.index }; }
  }
  return null;
}
function traceSlice(from) { const ev = window.__BLURBY_TTS_EVAL_TRACE__?.getEvents?.() ?? []; return { len: ev.length, events: ev.slice(from) }; }

// ---- driver helpers ----
const state = () => c.ev(readState);
const traceLen = async () => (await c.ev(traceSlice, 1e9)).len;
const traceSince = async (from) => (await c.ev(traceSlice, from)).events;
async function waitFor(label, fn, timeoutMs = 20000, ...args) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) { const v = await c.ev(fn, ...args); if (v) return v; await sleep(150); }
  throw new Error(`Timed out: ${label}`);
}
async function clickSel(sel) {
  const r = await c.ev((s) => { const m = [...document.querySelectorAll(s)].filter((n) => n.getBoundingClientRect().width > 0); if (m.length !== 1) return `count ${m.length}`; if (m[0].disabled) return "disabled"; m[0].click(); return "ok"; }, sel);
  if (r !== "ok") throw new Error(`click ${sel}: ${r}`);
}
const clickMode = (m) => clickSel(`[aria-label="${cap(m)} mode"]`);
async function play() { const s = await state(); if (s.play === "Play") await clickSel(".rbb-play-btn"); }
async function pause() { const s = await state(); if (s.play === "Pause") await clickSel(".rbb-play-btn"); }
async function clickWord(i) { const r = await c.ev(clickWordInPage, i, true); if (!r) throw new Error(`word ${i} not in loaded sections`); return r; }
const wordText = (i) => c.ev(clickWordInPage, i, false);
async function openDoc() {
  await c.send("Page.navigate", { url: "http://localhost:5173/" });
  await waitFor("identity", () => Boolean(window.__BLURBY_G0_ADMISSION__));
  await waitFor("card", (id) => Boolean(document.querySelector(`[data-doc-id="${id}"]`)), 20000, docId);
  await clickSel(`[data-doc-id="${docId}"]`);
  await waitFor("reader", () => Boolean(document.querySelector('[aria-label="Reader controls"]')));
  // The Meditations EPUB opens in Page on its image-only cover: wait for any rendered section document.
  await waitFor("section document", () => [...document.querySelectorAll("foliate-view")].some((v) => (v.renderer?.getContents?.() || []).some((e) => Boolean(e.doc?.body))), 20000);
  await sleep(2500); // full-book extraction re-indexes globally about 1 s after open
}
async function persisted() {
  return c.ev(async (id) => { const s = await window.electronAPI.getState(); const d = s.library.find((x) => x.id === id); return { position: d?.position ?? null, cfi: d?.cfi ?? null, readingMode: s.settings.readingMode, lastReadingMode: s.settings.lastReadingMode }; }, docId);
}
// B0 Page mode renders no word spans, so the anchor is set where B0 supports selection: a click in paused Flow.
async function setAnchor(row, a) {
  await clickMode("flow");
  await waitFor("flow word spans", () => [...document.querySelectorAll("foliate-view")].some((v) => (v.renderer?.getContents?.() || []).some((e) => e.doc?.querySelector("[data-word-index]"))), 15000);
  await sleep(600);
  row.expected = a; row.expectedWord = await clickWord(a); await sleep(600);
  row.anchorPersisted = await persisted();
  row.anchorRoute = "page(open) -> flow(paused) -> click word (hard-selection)";
}
function wordRect(n) {
  for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) {
    const doc = e.doc; if (!doc?.body) continue;
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT); let count = 0, node;
    while ((node = walker.nextNode())) { const re = /\S+/g; let m;
      while ((m = re.exec(node.data))) { if (count === n) { const r = doc.createRange(); r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length); const rr = r.getBoundingClientRect(); const fr = doc.defaultView.frameElement.getBoundingClientRect(); if (!rr.width) return null; return { x: fr.left + rr.left + rr.width / 2, y: fr.top + rr.top + rr.height / 2, text: m[0] }; } count++; } }
  }
  return null;
}
async function mouseClick(x, y, clickCount) {
  for (let k = 1; k <= clickCount; k++) {
    await c.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: k });
    await c.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: k });
  }
}
async function shot(name) {
  const s = await c.send("Page.captureScreenshot", { format: "png" });
  const file = `shots/${name}.png`;
  await fs.writeFile(path.join(out, file), Buffer.from(s.data, "base64"));
  return file;
}
async function waitTrace(from, pred, timeoutMs) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) { const ev = await traceSince(from); const hit = ev.find(pred); if (hit) return hit; await sleep(150); }
  return null;
}
function staleEffects(events, to) {
  return events.filter((e) =>
    (e.kind === "word" && e.source === "flow" && to !== "flow") ||
    (e.kind === "word" && e.source === "audio" && to !== "narrate") ||
    (e.kind === "lifecycle" && ["start", "resume", "first-audio"].includes(e.state) && to !== "narrate"));
}
async function probeIndex(m) {
  const t0 = await traceLen();
  if (m === "page") { const s = await state(); const hl = s.cursors["page-word--highlighted"][0] ?? null; const p = await persisted(); return { method: hl != null ? "page-highlighted" : "persisted-position (no Page word spans on B0)", index: hl ?? p.position, highlighted: hl, persisted: p, softSelected: s.cursors["page-word--soft-selected"], wordSpans: s.wordSpans }; }
  if (m === "flow") {
    await play();
    const w = await waitTrace(t0, (e) => e.kind === "word" && e.source === "flow", 6000);
    const s = await state(); await pause();
    return { method: "flow-first-word-trace-event", index: w?.wordIndex ?? null, cursorAfter: s.cursors["page-word--flow-cursor"] };
  }
  if (m === "narrate") {
    await play();
    const start = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "start" && e.wordIndex != null, 30000);
    const first = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "first-audio", 30000);
    await sleep(1200);
    const s = await state(); await pause();
    return { method: "narrate-lifecycle-start", index: start?.wordIndex ?? null, firstAudio: first ? { latencyMs: first.latencyMs ?? null } : null, cursorAfter: s.cursors["page-word--narrate-cursor"], activeAfter: s.cursors["page-word--active-word"] };
  }
  await play(); await sleep(250);
  const s1 = await state(); await sleep(900); await pause();
  return { method: "focus-first-displayed-text (Focus exposes no index; text evidence only)", index: null, firstDisplayedText: s1.focusText };
}

const rows = [];
async function caseRun(name, fn) {
  if (only && !only.split("+").some((p) => name.startsWith(p))) return;
  const row = { case: name, fixture, docId, startedAt: now(), steps: [] };
  const t0 = await traceLen().catch(() => 0);
  try { await fn(row); row.status = "recorded"; } catch (e) { row.status = "error"; row.error = e.message; }
  try { row.screenshot = await shot(name); } catch (e) { row.screenshotError = e.message; }
  try { row.trace = await traceSince(t0); } catch { row.trace = null; }
  row.finishedAt = now();
  rows.push(row);
  await fs.appendFile(path.join(out, "rows.ndjson"), JSON.stringify(row) + "\n");
  await pause().catch(() => {});
  console.log(`${name}: ${row.status}${row.error ? " " + row.error : ""}${row.actual !== undefined ? ` expected=${row.expected} actual=${row.actual}` : ""}`);
}
const step = async (row, label) => { const s = await state(); row.steps.push({ label, ...s }); return s; };

try {
  const targets = (await (await fetch(`http://127.0.0.1:${manifest.cdpPort}/json/list`)).json()).filter((t) => t.type === "page" && /^http:\/\/localhost:5173/.test(t.url));
  if (targets.length !== 1) throw new Error(`Expected one renderer, found ${targets.length}`);
  c = new Cdp(targets[0].webSocketDebuggerUrl);
  await c.connect();
  await c.send("Runtime.enable"); await c.send("Page.enable");
  const identity = await c.ev(() => window.__BLURBY_G0_ADMISSION__ || null);
  if (!identity || identity.runId !== manifest.runId || identity.sourceManifestSha256 !== manifest.sourceManifestSha256) throw new Error("Renderer identity mismatch");

  // Page: static navigation and word selection
  await caseRun("page-navigation-selection", async (row) => {
    await openDoc();
    await step(row, "opened");
    await clickSel('[aria-label="Next page"]').catch((e) => row.steps.push({ label: "next-page-unavailable", error: e.message }));
    await sleep(900); await step(row, "next-page");
    await clickSel('[aria-label="Previous page"]').catch((e) => row.steps.push({ label: "prev-page-unavailable", error: e.message }));
    await sleep(900); await step(row, "previous-page");
    const target = await c.ev(wordRect, 12); row.clickTarget = target;
    if (target) { await mouseClick(target.x, target.y, 1); await sleep(900); row.afterSingleClick = { ...(await step(row, "single-click")), persisted: await persisted() }; await mouseClick(target.x, target.y, 2); await sleep(900); row.afterDoubleClick = { ...(await step(row, "double-click")), persisted: await persisted() }; }
    const s = await state();
    row.actual = s.cursors["page-word--highlighted"][0] ?? (await persisted()).position;
    await sleep(2000); const s2 = await step(row, "page-static-2s");
    row.pageAutoAdvanced = (s2.cursors["page-word--highlighted"][0] ?? null) !== row.actual;
  });

  // Focus: active pacing, pause, resume; anchor read back through Page's highlight
  await caseRun("focus-pacing-pause-resume", async (row) => {
    await openDoc(); await setAnchor(row, 7);
    await clickMode("focus"); await sleep(800); await step(row, "focus-paused");
    await play(); row.displayed = [];
    for (let i = 0; i < 12; i++) { await sleep(250); row.displayed.push((await state()).focusText); }
    await pause(); await sleep(1000); const p1 = await step(row, "paused");
    row.pausedHeld = p1.focusText === (await state()).focusText;
    await play(); for (let i = 0; i < 8; i++) { await sleep(250); row.displayed.push((await state()).focusText); }
    await pause(); await sleep(500);
    await clickMode("page"); await sleep(800);
    const s = await step(row, "back-to-page");
    row.actual = s.cursors["page-word--highlighted"][0] ?? null;
    row.note = "actual = Focus pause anchor read back as Page highlight after pacing (expected index is the start word; advancement is expected)";
  });

  // Flow: active follow, same-section browse away/return, cross-section browse away/return
  await caseRun("flow-follow-browse-return", async (row) => {
    await openDoc(); await setAnchor(row, 7); await step(row, "flow-paused");
    const t0 = await traceLen(); await play();
    for (let i = 0; i < 8; i++) { await sleep(500); await step(row, `playing-${i}`); }
    const words = (await traceSince(t0)).filter((e) => e.kind === "word" && e.source === "flow");
    row.actual = words[0]?.wordIndex ?? null; row.followLast = words.at(-1)?.wordIndex ?? null; row.flowWordEvents = words.length;
    await c.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 550, y: 380, deltaX: 0, deltaY: 500 });
    await sleep(1600); await step(row, "after-wheel-same-section");
    await clickSel(".return-to-reading-pill").catch(() => clickSel('[aria-label="Jump back to persistent last-read word"]')).catch((e) => row.steps.push({ label: "return-unavailable", error: e.message }));
    await sleep(1200); await step(row, "returned-same-section");
    await play(); await sleep(1500);
    const before = (await state()).sections.join(",");
    for (let i = 0; i < 14; i++) {
      await c.send("Input.dispatchKeyEvent", { type: "keyDown", key: "PageDown", code: "PageDown", windowsVirtualKeyCode: 34 });
      await c.send("Input.dispatchKeyEvent", { type: "keyUp", key: "PageDown", code: "PageDown", windowsVirtualKeyCode: 34 });
      await sleep(350);
      if ((await state()).sections.join(",") !== before) break;
    }
    await sleep(1200); const away = await step(row, "after-pagedown-cross-section"); row.crossSectionReached = away.sections.join(",") !== before;
    await clickSel(".return-to-reading-pill").catch(() => clickSel('[aria-label="Jump back to persistent last-read word"]')).catch((e) => row.steps.push({ label: "return-unavailable", error: e.message }));
    await sleep(1500); await step(row, "returned-cross-section");
  });

  // Narrate: exact start at 0, pause/resume without cold restart, rate 1.0 -> 1.4 -> 1.0, section transition
  await caseRun("narrate-start0-pause-resume-rate-section", async (row) => {
    await openDoc(); await setAnchor(row, 0);
    await clickMode("narrate"); await sleep(800); await step(row, "narrate-paused");
    const t0 = await traceLen(); await play();
    const start = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "start" && e.wordIndex != null, 30000);
    const first = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "first-audio", 40000);
    row.actual = start?.wordIndex ?? null; row.firstAudio = first;
    for (let i = 0; i < 4; i++) { await sleep(1000); await step(row, `speaking-${i}`); }
    await pause(); await sleep(1500); await step(row, "paused");
    const t1 = await traceLen(); await play(); await sleep(2500);
    const resumed = await traceSince(t1);
    row.resume = { resumeEvents: resumed.filter((e) => e.kind === "lifecycle" && e.state === "resume").length, startEvents: resumed.filter((e) => e.kind === "lifecycle" && e.state === "start").length };
    await step(row, "resumed");
    for (const r of ["1.4", "1.0"]) {
      await clickSel(`[aria-label="${r}x speed"]`).catch((e) => row.steps.push({ label: `rate-${r}-unavailable`, error: e.message }));
      for (let i = 0; i < 3; i++) { await sleep(1000); await step(row, `rate-${r}-${i}`); }
    }
    const t2 = await traceLen();
    await clickSel('[aria-label="Next chapter"]').catch((e) => row.steps.push({ label: "next-chapter-unavailable", error: e.message }));
    for (let i = 0; i < 5; i++) { await sleep(1000); await step(row, `after-next-chapter-${i}`); }
    row.sectionTrace = (await traceSince(t2)).filter((e) => e.kind === "transition" || e.kind === "lifecycle");
  });
  await caseRun("narrate-start7", async (row) => {
    await openDoc(); await setAnchor(row, 7);
    await clickMode("narrate"); await sleep(800);
    row.probe = await probeIndex("narrate"); row.actual = row.probe.index;
  });

  // Gap cases (A3 iteration 2)
  await caseRun("gap-page-select-text-page", async (row) => {
    await openDoc();
    await clickSel('[aria-label="Next page"]').catch((e) => row.steps.push({ label: "next-page-unavailable", error: e.message }));
    await sleep(1500); await step(row, "text-page");
    const target = await c.ev(wordRect, 12); row.clickTarget = target;
    if (!target) throw new Error("no word rect on the visible page");
    await mouseClick(target.x, target.y, 1); await sleep(1000);
    const s = await step(row, "single-click"); const p = await persisted();
    row.highlighted = s.cursors["page-word--highlighted"]; row.persisted = p.position; row.actual = s.cursors["page-word--highlighted"][0] ?? null;
    row.expected = row.persisted; row.note = "expected = the clicked word's persisted canonical index; actual = Page highlight";
  });
  await caseRun("gap-flow-wheel-margin", async (row) => {
    await openDoc(); await setAnchor(row, 7); await play(); await sleep(2000); await step(row, "playing");
    await c.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 1300, y: 450, deltaX: 0, deltaY: 400 });
    await sleep(1600); const s = await step(row, "after-margin-wheel"); row.browsedAway = s.browsedAway; row.pausedByBrowse = s.play === "Play";
    await clickSel(".return-to-reading-pill").catch((e) => row.steps.push({ label: "return-pill-unavailable", error: e.message }));
    await sleep(1200); const r = await step(row, "returned"); row.returnedCursor = r.cursors["page-word--flow-cursor"];
  });
  await caseRun("gap-narrate-section-natural", async (row) => {
    await openDoc(); await clickMode("flow");
    await waitFor("flow word spans", () => [...document.querySelectorAll("foliate-view")].some((v) => (v.renderer?.getContents?.() || []).some((e) => e.doc?.querySelector("[data-word-index]"))), 15000);
    await sleep(600);
    const last = await c.ev(() => { let mx = -1; for (const v of document.querySelectorAll("foliate-view")) for (const e of v.renderer?.getContents?.() || []) for (const el of e.doc?.querySelectorAll("[data-word-index]") || []) mx = Math.max(mx, Number(el.getAttribute("data-word-index"))); return mx; });
    row.sectionLastWord = last; const a = Math.max(0, last - 10);
    row.expected = a; row.expectedWord = await clickWord(a); await sleep(600); row.anchorPersisted = await persisted();
    await clickMode("narrate"); await sleep(800); await step(row, "narrate-paused");
    const t0 = await traceLen(); await play();
    const start = await waitTrace(t0, (e) => e.kind === "lifecycle" && e.state === "start" && e.wordIndex != null, 30000); row.actual = start?.wordIndex ?? null;
    const sec = await waitTrace(t0, (e) => e.kind === "transition" && e.transition === "section", 30000);
    row.sectionTransition = sec; for (let i = 0; i < 4; i++) { await sleep(1000); await step(row, `after-${i}`); }
    row.chapters = [...new Set(row.steps.map((s) => s.chapter))];
    row.audioWordsAfterLast = (await traceSince(t0)).filter((e) => e.kind === "word" && e.source === "audio" && e.wordIndex > last).map((e) => e.wordIndex).slice(0, 10);
  });
  await caseRun("gap-narrate-next-chapter-paused", async (row) => {
    await openDoc(); await setAnchor(row, 7); await clickMode("narrate"); await sleep(800);
    const b = await step(row, "before");
    await clickSel('[aria-label="Next chapter"]').catch((e) => row.steps.push({ label: "next-chapter-unavailable", error: e.message }));
    await sleep(2000); const a = await step(row, "after"); row.chapterChanged = a.chapter !== b.chapter; row.chapters = [b.chapter, a.chapter]; row.persistedAfter = await persisted();
  });

  // 12 ordered transitions at words 7 and 0, each on a freshly opened document (new generation)
  for (const a of [7, 0]) for (const from of MODES) for (const to of MODES) {
    if (from === to) continue;
    await caseRun(`t-${from}-${to}-w${a}`, async (row) => {
      await openDoc(); await setAnchor(row, a);
      await step(row, "anchored-in-flow");
      if (from !== "flow") { await clickMode(from); await sleep(800); await step(row, `from-${from}`); }
      const t0 = await traceLen();
      await clickMode(to); await sleep(1500);
      const s = await step(row, `to-${to}`);
      row.afterSwitch = { mode: s.mode, play: s.play, visibleCursorCount: s.visibleCursorCount };
      row.staleEffects = staleEffects(await traceSince(t0), to);
      row.probe = await probeIndex(to); row.actual = row.probe.index;
      row.persistedAfter = await persisted();
    });
  }
  // Four same-mode selections
  for (const m of MODES) {
    await caseRun(`same-${m}`, async (row) => {
      await openDoc(); await setAnchor(row, 7);
      if (m !== "flow") { await clickMode(m); await sleep(800); }
      const s1 = await step(row, "before"); const t0 = await traceLen();
      await clickMode(m); await sleep(1200);
      const s2 = await step(row, "after");
      row.modeUnchanged = s1.mode === s2.mode; row.cursorsUnchanged = JSON.stringify(s1.cursors) === JSON.stringify(s2.cursors);
      row.newTraceEvents = await traceSince(t0);
    });
  }
} catch (e) {
  rows.push({ case: "runner", status: "error", error: e.stack });
  process.exitCode = 1;
} finally {
  const settings = await c?.ev(async () => (await window.electronAPI.getState()).settings).catch(() => null);
  const summary = { run, fixture, docId, startedFromManifest: manifest.runId, finishedAt: now(), settings, consoleErrors, cases: rows.map((r) => ({ case: r.case, status: r.status, expected: r.expected, actual: r.actual, error: r.error })) };
  await fs.writeFile(path.join(out, "matrix.json"), JSON.stringify({ summary, rows }, null, 2));
  console.log(JSON.stringify({ out, cases: rows.length, errors: rows.filter((r) => r.status === "error").length, consoleErrors: consoleErrors.length }));
  c?.ws.close();
}

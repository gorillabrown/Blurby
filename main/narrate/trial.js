"use strict";
// main/narrate/trial.js — the in-app trial driver for the rebuilt Narrate (NARRATE-REBUILD-1 P5; Decision #16).
// Loaded by main.js only when BLURBY_NARRATE_TRIAL holds a JSON object. It waits for the first-run sample document,
// opens it from the main window's library and drives the reader through webContents.executeJavaScript — the bar's buttons, the reader's
// keyboard shortcuts (Space, ArrowUp/ArrowDown on the 0.05 speed grid) and a click on a word span inside the
// foliate section — then flushes the eval trace (BLURBY_TTS_EVAL_TRACE_DIR) and quits. Nothing here measures or
// estimates timing: the engine records the clock pairs; scripts/narrate-rebuild/p5-*.mjs read them.
//   { "kind": "session", "rate": 1.0, "minutes": 5 }                              D3: play N minutes at a rate
//   { "kind": "warm", "rate": 1.0, "repeat": 20 }                                   D6 warm: cycles of play, resume, click, speed
//   { "kind": "cold", "rate": 1.0, "type": "play" | "resume" | "click" | "speed" }  D6 cold: one entry path in a fresh process
// A summary JSON (steps, errors) is written to `out` when set.

const { app } = require("electron");
const fsPromises = require("fs/promises");
const path = require("path");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// D6 cold click (NARRATE-HARNESS-COLDCLICK-1): how long a click may take to become the engine's "click" request, and
// how far past the playing word the click lands (inside the playing section's spans, as a user would click).
const COLDCLICK_REQUEST_WAIT_MS = 2000;
const COLDCLICK_OFFSET_WORDS = 60;

function readConfig() {
  try { return JSON.parse(process.env.BLURBY_NARRATE_TRIAL || "null"); } catch { return null; }
}

async function waitFor(fn, { timeoutMs = 60000, everyMs = 200, what = "condition" } = {}) {
  const t0 = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - t0 > timeoutMs) throw new Error(`trial: timed out after ${timeoutMs} ms waiting for ${what}`);
    await sleep(everyMs);
  }
}

// Renderer-side helpers, installed once per window. Plain script; the DOM it reaches is the shell's bar, the reader
// keyboard (window keydown) and the foliate section document found by walking shadow roots to the iframe.
const HELPERS = `
(() => {
  if (window.__narrateTrial) return true;
  const h = {};
  h.click = (sel) => { const el = document.querySelector(sel); if (!el) return false; el.click(); return true; };
  h.key = (code) => !window.dispatchEvent(new KeyboardEvent("keydown", { code, key: code.replace(/^Key/, "").toLowerCase(), bubbles: true, cancelable: true }));
  h.sectionDoc = () => {
    const seen = new Set();
    const walk = (root) => {
      if (!root || seen.has(root)) return null;
      seen.add(root);
      for (const el of root.querySelectorAll("*")) {
        if (el.tagName === "IFRAME") { try { const d = el.contentDocument; if (d && d.querySelector("[data-word-index]")) return d; } catch (e) {} }
        if (el.shadowRoot) { const r = walk(el.shadowRoot); if (r) return r; }
      }
      return null;
    };
    return walk(document);
  };
  // The section documents through foliate's own renderer API (the paginator's shadow root is closed; this is the
  // path the app's FoliateView uses too).
  h.docs = () => { const fv = document.querySelector("foliate-view"); const c = fv && fv.renderer && fv.renderer.getContents ? fv.renderer.getContents() : []; return c.filter((e) => e && e.doc).map((e) => e.doc); };
  h.wordCount = () => h.docs().reduce((n, d) => n + d.querySelectorAll("[data-word-index]").length, 0);
  h.docState = () => JSON.stringify(h.docs().map((d) => ({ text: d.body ? d.body.textContent.length : -1, spans: d.querySelectorAll("[data-word-index]").length, pageWords: d.querySelectorAll(".page-word").length })));
  h.clickWord = (offset) => {
    for (const d of h.docs()) {
      const spans = Array.from(d.querySelectorAll("[data-word-index]"));
      if (!spans.length) continue;
      const el = spans[Math.min(spans.length - 1, Math.max(0, offset))];
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, view: d.defaultView }));
      return Number(el.getAttribute("data-word-index"));
    }
    return null;
  };
  // A word by its global index (data-word-index), across the loaded section documents.
  h.hasWord = (w) => h.docs().some((d) => !!d.querySelector('[data-word-index="' + Number(w) + '"]'));
  // Click the loaded word with the smallest index >= target, else the highest loaded word; the same click as clickWord.
  h.clickWordAt = (target) => {
    let at = null, top = null;
    for (const d of h.docs()) {
      for (const el of d.querySelectorAll("[data-word-index]")) {
        const w = Number(el.getAttribute("data-word-index"));
        if (w >= target && (!at || w < at.w)) at = { el, w, d };
        if (!top || w > top.w) top = { el, w, d };
      }
    }
    const pick = at || top;
    if (!pick) return null;
    pick.el.scrollIntoView({ block: "center" });
    const r = pick.el.getBoundingClientRect();
    pick.el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, view: pick.d.defaultView }));
    return pick.w;
  };
  h.events = () => (window.__BLURBY_TTS_EVAL_TRACE__ && window.__BLURBY_TTS_EVAL_TRACE__.getEvents) ? window.__BLURBY_TTS_EVAL_TRACE__.getEvents() : [];
  h.count = (kind, cause) => h.events().filter((e) => e.kind === kind && (!cause || e.cause === cause)).length;
  h.lastWord = () => { const c = h.events().filter((e) => e.kind === "narrate-commit"); return c.length ? c[c.length - 1].word : null; };
  h.flush = () => (window.__BLURBY_TTS_EVAL_TRACE__ && window.__BLURBY_TTS_EVAL_TRACE__.flush) ? window.__BLURBY_TTS_EVAL_TRACE__.flush() : Promise.resolve(null);
  h.playing = () => { const b = document.querySelector(".rbb-play-btn"); return !!b && b.getAttribute("aria-label") === "Pause"; };
  h.narrateOn = () => { const b = document.querySelector('[aria-label="Narrate mode"]'); return !!b && b.getAttribute("aria-pressed") === "true"; };
  h.speedText = () => { const b = document.querySelector(".rbb-speed-trigger"); return b ? b.textContent : null; };
  h.notice = () => { const n = document.querySelector(".rm-narrate-notice"); return n ? n.textContent : null; };
  h.probe = () => {
    const out = { narrateOn: h.narrateOn(), playing: h.playing(), notice: h.notice(), speed: h.speedText(), host: !!document.querySelector(".rm-narrate-host"), foliateView: !!document.querySelector("foliate-view"), iframes: [], words: 0, error: null };
    try {
      const seen = new Set();
      const walk = (root, depth) => {
        if (!root || seen.has(root) || depth > 12) return;
        seen.add(root);
        for (const el of root.querySelectorAll("*")) {
          if (el.tagName === "IFRAME") {
            const info = { src: String(el.getAttribute("src") || el.src || "").slice(0, 80), srcdoc: el.hasAttribute("srcdoc"), doc: null, words: 0 };
            try { const d = el.contentDocument; info.doc = d ? "ok" : "null"; if (d) info.words = d.querySelectorAll("[data-word-index]").length; } catch (e) { info.doc = "throws:" + e.message; }
            out.iframes.push(info);
          }
          if (el.shadowRoot) walk(el.shadowRoot, depth + 1);
        }
      };
      walk(document, 0);
      out.words = h.wordCount();
    } catch (e) { out.error = String(e); }
    return JSON.stringify(out);
  };
  window.__narrateTrial = h;
  return true;
})();
`;

// Renderer snippet run inside the section frame: click the span at `offset` among the frame's word spans.
const CLICK_WORD = (offset) => `
(() => {
  const spans = Array.from(document.querySelectorAll("[data-word-index]"));
  if (!spans.length) return null;
  const el = spans[Math.min(spans.length - 1, Math.max(0, ${Number(offset)}))];
  el.scrollIntoView({ block: "center" });
  const r = el.getBoundingClientRect();
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, view: window }));
  return Number(el.getAttribute("data-word-index"));
})();
`;

/** The foliate section frame (any frame below the main one with word spans), found through Electron's frame tree. */
async function sectionFrame(wc) {
  for (const f of wc.mainFrame.framesInSubtree) {
    if (f === wc.mainFrame) continue;
    try {
      const n = await f.executeJavaScript('document.querySelectorAll("[data-word-index]").length', true);
      if (n > 0) return { frame: f, words: n, url: f.url };
    } catch { /* a frame mid-navigation */ }
  }
  return null;
}

/** Why the opened profile is not the launcher's scratch profile (LL-165), or null when it is (or none was asked for). */
function profileMismatch(userData, env = process.env) {
  if (!env.BLURBY_USER_DATA_DIR) return null;
  const norm = (p) => path.resolve(p).replace(/[\\/]+$/, "").toLowerCase();
  const want = norm(env.BLURBY_USER_DATA_DIR);
  const got = norm(userData);
  if (got !== want) return { userData, expected: path.resolve(env.BLURBY_USER_DATA_DIR) };
  const live = env.APPDATA ? norm(path.join(env.APPDATA, "blurby")) : null;
  if (live && (got === live || got.startsWith(live + path.sep))) return { userData, live: path.join(env.APPDATA, "blurby") };
  return null;
}

async function run(ctx) {
  const cfg = readConfig();
  if (!cfg || typeof cfg !== "object") return;
  const summary = { config: cfg, startedAt: new Date().toISOString(), steps: [], error: null, tracePaths: null };
  const step = (name, detail, t) => { summary.steps.push({ t: t ?? Date.now(), name, detail: detail ?? null }); console.log("[narrate-trial]", name, detail ?? ""); };
  let exitCode = 0;
  // Profile proof (LL-165): before any action, the profile the app opened must be the scratch one the launcher set.
  const mismatch = profileMismatch(app.getPath("userData"));
  if (mismatch) { step("profile mismatch", mismatch); exitCode = 4; }
  if (!mismatch) try {
    // The main window: its library card opens the document in the reader shell (ReaderContainer with the bottom
    // bar). The "#reader/<id>" window is the legacy standalone reader without mode buttons, so it is not used.
    await waitFor(() => ctx.getDocById("sample-meditations"), { what: "the sample document", timeoutMs: 120000 });
    const win = await waitFor(() => { const w = ctx.getMainWindow(); return w && !w.isDestroyed() ? w : null; }, { what: "the main window" });
    const wc = win.webContents;
    // Renderer console lines go to the app log (the trial's only window into a failed book load).
    wc.on("console-message", (event, a, b, c, d) => {
      const m = a && typeof a === "object" ? a : { level: a, message: b, lineNumber: c, sourceId: d };
      const level = typeof m.level === "number" ? m.level : ({ info: 1, warning: 2, error: 3 })[m.level] ?? 1;
      if (level >= 1) console.log(`[renderer:${m.level}] ${String(m.message).slice(0, 400)} (${String(m.sourceId || "").slice(-50)}:${m.lineNumber})`);
    });
    await waitFor(() => !wc.isLoading() && wc.getURL(), { what: "the main window's load" });
    const js = (code) => wc.executeJavaScript(code, true);
    await js(HELPERS);
    await waitFor(() => js('!!document.querySelector(\'[data-doc-id="sample-meditations"]\')'), { what: "the library card", timeoutMs: 120000 });
    if (typeof cfg.position === "number") {
      // Open at a chosen book word (the reader resumes at the document's saved position): past the Gutenberg
      // header and the Introduction's bibliography, which hold years and symbols the producer fails closed on.
      await js(`window.electronAPI.updateDocProgress("sample-meditations", ${Math.floor(cfg.position)})`);
      await waitFor(() => js(`window.electronAPI.getState().then((s) => { const d = s.library.find((x) => x.id === "sample-meditations"); return !!d && d.position === ${Math.floor(cfg.position)}; })`), { what: "the saved position", timeoutMs: 20000 });
      // The renderer's library copy is the one it booted with: reload so the card opens at the new position.
      wc.reload();
      await sleep(500);
      await waitFor(() => !wc.isLoading() && wc.getURL(), { what: "the reload" });
      await js(HELPERS);
      await waitFor(() => js('!!document.querySelector(\'[data-doc-id="sample-meditations"]\')'), { what: "the library card after the reload", timeoutMs: 120000 });
      step("position", cfg.position);
    }
    await js('window.__narrateTrial.click(\'[data-doc-id="sample-meditations"]\')');
    await waitFor(() => js('!!document.querySelector(\'[aria-label="Narrate mode"]\')'), { what: "the reader's bottom bar", timeoutMs: 120000 });
    step("reader ready", wc.getURL());

    const timeoutMs = cfg.timeoutMs ?? 120000;
    const enterNarrate = async () => {
      await js('window.__narrateTrial.click(\'[aria-label="Narrate mode"]\')');
      if (cfg.diag) {
        // Timeline of the view's load, for the smoke runs: frames seen by Electron and the top frame's own view.
        step("extract probe", await js(`(async () => { const t0 = performance.now(); try { const r = await window.electronAPI.extractEpubWords("sample-meditations"); return JSON.stringify({ ms: Math.round(performance.now() - t0), keys: Object.keys(r || {}), words: r && r.words ? r.words.length : null, sections: r && r.sections ? r.sections.length : null, error: r && r.error ? String(r.error) : null }); } catch (e) { return "throws:" + e.message; } })()`));
        for (let i = 0; i < Math.round(timeoutMs / 1000); i++) {
          await sleep(1000);
          const frames = wc.mainFrame.framesInSubtree.map((f) => `${f.frameToken ? "" : ""}${String(f.url).slice(0, 60)}`);
          const view = await js(`(() => { const fv = document.querySelector("foliate-view"); if (!fv) return "no foliate-view"; const r = fv.renderer; const sr = r && r.shadowRoot; const ifr = sr && sr.querySelector("iframe"); let docState = null; try { docState = ifr ? (ifr.contentDocument ? "doc:" + ifr.contentDocument.querySelectorAll("[data-word-index]").length : "no-doc") : "no-iframe"; } catch (e) { docState = "throws:" + e.message; } return JSON.stringify({ book: !!fv.book, renderer: !!r, rendererTag: r && r.tagName, shadow: !!sr, iframe: !!ifr, iframeSrc: ifr ? String(ifr.src || ifr.getAttribute("srcdoc") ? "srcdoc" : "").slice(0, 40) : null, docState, narrateOn: window.__narrateTrial.narrateOn(), notice: window.__narrateTrial.notice() }); })()`);
          const docState = await js("window.__narrateTrial.docState()");
          step(`diag ${i + 1}s`, { frames, view, docState });
          const words = await js("window.__narrateTrial.wordCount()");
          if (words > 50) { step("words found", { words }); break; }
        }
      }
      try {
        // A fresh book opens on its cover (a few words, nothing to stamp). Play steps the view to the section that
        // holds the start word (the runtime's pending-resume path), so word spans are waited for after Play, not here.
        await waitFor(() => js("window.__narrateTrial.narrateOn() && window.__narrateTrial.docs().length > 0"), { what: "the Narrate view with a loaded section", timeoutMs });
        step("narrate view", { docs: await js("window.__narrateTrial.docState()") });
      } catch (err) {
        step("probe", { page: await js("window.__narrateTrial.probe()"), docState: await js("window.__narrateTrial.docState()"), frames: wc.mainFrame.framesInSubtree.map((f) => String(f.url).slice(0, 80)) });
        throw err;
      }
      await sleep(1200);
    };
    const clickWord = async (offset) => {
      const clicked = await js(`window.__narrateTrial.clickWord(${Number(offset)})`);
      if (clicked !== null) return clicked;
      const section = await sectionFrame(wc); // fallback: through Electron's frame tree
      return section ? section.frame.executeJavaScript(CLICK_WORD(offset), true) : null;
    };
    const toPage = async () => {
      await js('window.__narrateTrial.click(\'[aria-label="Page mode"]\')');
      await waitFor(() => js("!window.__narrateTrial.narrateOn()"), { what: "Page mode" });
      await sleep(800);
    };
    // From the rate the bar shows (the scratch profile keeps the last run's rate), then checked: a run at the wrong
    // rate is no evidence for its label.
    const shownRate = async () => parseFloat(String(await js("window.__narrateTrial.speedText()")).replace(/[^0-9.]/g, ""));
    const setRate = async (rate) => {
      const steps = Math.round((rate - (await shownRate())) / 0.05);
      for (let i = 0; i < Math.abs(steps); i++) { await js(`window.__narrateTrial.key(${steps > 0 ? '"ArrowUp"' : '"ArrowDown"'})`); await sleep(40); }
      await sleep(200);
      const shown = await shownRate();
      if (Math.abs(shown - rate) > 0.001) throw new Error(`trial: rate ${shown} shown, ${rate} wanted`);
      return js("window.__narrateTrial.speedText()");
    };
    const count = (cause) => js(`window.__narrateTrial.count("narrate-first-voiced", ${cause ? `"${cause}"` : "null"})`);
    const waitVoiced = async (cause, before, what) => {
      await waitFor(async () => (await count(cause)) > before, { what: `first voiced sample after ${what}`, timeoutMs: 30000, everyMs: 50 });
    };
    const press = (sel) => js(`window.__narrateTrial.click("${sel}")`);
    const waitWords = async () => {
      const words = await waitFor(async () => ((await js("window.__narrateTrial.wordCount()")) > 50 ? js("window.__narrateTrial.wordCount()") : null), { what: "word spans in the loaded section", timeoutMs });
      step("word spans", { words, docs: await js("window.__narrateTrial.docState()") });
    };

    await enterNarrate();
    step("narrate", await setRate(cfg.rate ?? 1.0));

    if (cfg.kind === "session") {
      const before = await count("play");
      await press(".rbb-play-btn");
      await waitVoiced("play", before, "Play");
      step("playing");
      await waitWords();
      await sleep((cfg.minutes ?? 5) * 60000 + 2000);
      // Read the notice before touching Play: after an F4 pause, Play starts a new request and the view shows "Voice loading…" (S5).
      const notice = await js("window.__narrateTrial.notice()");
      const wasPlaying = await js("window.__narrateTrial.playing()");
      if (wasPlaying) await press(".rbb-play-btn");
      await sleep(500);
      step("paused", { commits: await js('window.__narrateTrial.count("narrate-commit")'), notice, wasPlaying });
    } else if (cfg.kind === "warm") {
      const repeat = cfg.repeat ?? 20;
      // "Warm" as in P0-5: the voice and session are ready — every producer worker loaded, and one untimed generation
      // per worker at this rate (none of it is traced: the trace records only the mode's own requests).
      const producer = require("./producer");
      await producer.ensureReady();
      const C = require("./constants");
      await waitFor(async () => producer.getStatus().workersReady >= C.NARRATE_PRODUCER_WORKERS, { what: "every producer worker ready", timeoutMs: 120000, everyMs: 200 });
      await Promise.all(Array.from({ length: C.NARRATE_PRODUCER_WORKERS }, () => producer.generate("The warm-up is not measured.", { speed: cfg.rate ?? 1 })));
      step("warm-up done", producer.getStatus());
      for (let i = 0; i < repeat; i++) {
        if (i > 0) { await toPage(); await enterNarrate(); }
        let b = await count("play"); await press(".rbb-play-btn"); await waitVoiced("play", b, `Play ${i}`);
        if (i === 0) await waitWords();
        await sleep(2000);
        await press(".rbb-play-btn"); // pause
        await sleep(1000);
        b = await count("resume"); await press(".rbb-play-btn"); await waitVoiced("resume", b, `resume ${i}`);
        await sleep(2000);
        const offset = 40 + ((i * 37) % 120);
        b = await count("click"); const clicked = await clickWord(offset); await waitVoiced("click", b, `click ${i} (word ${clicked})`);
        await sleep(2000);
        // One step away from the trial's rate and back (down first at the top of the range, where up changes nothing).
        const [away, back] = (cfg.rate ?? 1) >= 2.0 ? ["ArrowDown", "ArrowUp"] : ["ArrowUp", "ArrowDown"];
        b = await count("speed"); await js(`window.__narrateTrial.key("${away}")`); await waitVoiced("speed", b, `speed ${away} ${i}`);
        await sleep(2000);
        b = await count("speed"); await js(`window.__narrateTrial.key("${back}")`); await waitVoiced("speed", b, `speed ${back} ${i}`);
        await sleep(1500);
        await press(".rbb-play-btn"); // pause before the mode switch
        await sleep(300);
        step(`cycle ${i + 1}/${repeat}`, { clicked, notice: await js("window.__narrateTrial.notice()") });
      }
    } else if (cfg.kind === "cold") {
      // One entry path in a fresh process; the first voiced sample of the process is the measurement, whatever
      // cause the engine records for it (the launcher reports both). play: Play. speed: ArrowUp, then Play.
      // resume: Play, pause at once (the model still loading), Play again. click: Play, then a click on a word while
      // it plays (below). Clicking while paused would only set where Play starts (cause "play"), and Play's own audio
      // would be the first voiced sample.
      const type = cfg.type ?? "play";
      if (type === "speed") { await js(`window.__narrateTrial.key("${(cfg.rate ?? 1) >= 2.0 ? "ArrowDown" : "ArrowUp"}")`); await sleep(100); }
      const b = await count(null);
      await press(".rbb-play-btn");
      if (type === "resume") { await sleep(60); await press(".rbb-play-btn"); await sleep(400); await press(".rbb-play-btn"); }
      // click: the view can open on a near-empty section (a cover page) and moves on only while playing; Play steps it to
      // the section that holds the start word and then starts the engine, whose "play" request is traced at that moment
      // (the section's words are stamped and Play is playing). The click goes in right then, before that request's first
      // chunk is voiced (a cold generation takes far longer than this 20 ms poll): engine.play(word, "click") starts a new
      // epoch, Play's chunk is dropped when it arrives, and the process's first voiced sample answers the click. A click
      // before the engine starts would only move where Play starts. voicedBeforeClick records a lost race (the launcher
      // flags the trial too: its first voiced sample would answer "play").
      // NARRATE-HARNESS-COLDCLICK-1: the click waits for the playing section's own spans (a user clicks only a word
      // on screen), lands COLDCLICK_OFFSET_WORDS past the playing word, and is confirmed as the engine's click request.
      if (type === "click") {
        const playReq = JSON.parse(await waitFor(() => js('(() => { const e = window.__narrateTrial.events().find((x) => x.kind === "narrate-request" && x.cause === "play"); return e ? JSON.stringify({ word: e.word, ts: e.ts }) : null; })()'), { what: "the Play's request (the engine started)", timeoutMs, everyMs: 20 }));
        const playWord = playReq.word;
        await waitFor(() => js(`window.__narrateTrial.hasWord(${Number(playWord)})`), { what: `the playing word ${playWord}'s span`, timeoutMs, everyMs: 20 });
        const spansReadyMs = typeof playReq.ts === "number" ? Date.now() - playReq.ts : null;
        const voicedBeforeClick = (await count(null)) > b;
        const clickT = Date.now();
        const clicked = await js(`window.__narrateTrial.clickWordAt(${Number(playWord) + COLDCLICK_OFFSET_WORDS})`);
        let clickRequested = true;
        try {
          await waitFor(async () => (await js('window.__narrateTrial.count("narrate-request", "click")')) > 0, { what: "the click's request", timeoutMs: COLDCLICK_REQUEST_WAIT_MS, everyMs: 20 });
        } catch { clickRequested = false; }
        step("clicked while playing", { playWord, clicked, spansReadyMs, voicedBeforeClick, clickRequested }, clickT);
      }
      await waitFor(async () => (await count(null)) > b, { what: `the first voiced sample (cold ${type})`, timeoutMs: 60000, everyMs: 50 });
      await sleep(1500);
      await press(".rbb-play-btn");
      step("cold done", { type, notice: await js("window.__narrateTrial.notice()") });
    } else {
      throw new Error(`trial: unknown kind ${cfg.kind}`);
    }

    summary.tracePaths = await js("window.__narrateTrial.flush()");
    step("flushed", summary.tracePaths);
  } catch (err) {
    summary.error = err && err.stack ? err.stack : String(err);
    console.error("[narrate-trial] error:", summary.error);
    exitCode = 1;
    // Leave the evidence of a failed run: the producer's state and whatever trace exists.
    try { step("producer status", JSON.stringify(require("./producer").getStatus())); } catch { /* not loaded */ }
    try {
      const w = ctx.getMainWindow();
      if (w && !w.isDestroyed()) {
        step("page", await w.webContents.executeJavaScript("window.__narrateTrial ? window.__narrateTrial.probe() : null", true));
        step("events", await w.webContents.executeJavaScript("window.__narrateTrial ? JSON.stringify(window.__narrateTrial.events().filter((e) => e.kind !== 'narrate-commit').slice(-12)) : null", true));
        summary.tracePaths = await w.webContents.executeJavaScript("window.__narrateTrial ? window.__narrateTrial.flush() : null", true);
      }
    } catch { /* the window is gone */ }
  }
  summary.endedAt = new Date().toISOString();
  if (cfg.out) {
    try {
      await fsPromises.mkdir(cfg.out, { recursive: true });
      const name = cfg.label ? `trial-${cfg.label}.json` : `trial-${cfg.kind}-${cfg.type ?? ""}${cfg.rate ?? ""}-${Date.now()}.json`;
      await fsPromises.writeFile(path.join(cfg.out, name), JSON.stringify(summary, null, 2));
    } catch (err) { console.error("[narrate-trial] summary write failed:", err.message); }
  }
  // app.exit skips will-quit: stop the producer workers here, so the exit code is the trial's, not a crash's.
  try { await require("./producer").shutdown(); } catch { /* not loaded */ }
  setTimeout(() => app.exit(exitCode), 500);
}

module.exports = { run, readConfig, HELPERS, profileMismatch };

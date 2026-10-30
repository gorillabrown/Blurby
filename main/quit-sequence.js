// main/quit-sequence.js — The will-quit flush. Electron does not await an async quit listener (LL-157), so the
// first quit is cancelled, the work is awaited, then the app quits again. A relaunch made during the flush (the new
// process lost the single-instance lock, so it arrives here as "second-instance") is taken over: app.relaunch() once,
// after the flush and before the final quit (NARRATE-QUIT-LINGER-1, BUG-207).
// CommonJS only — Electron main process
"use strict";
const { QUIT_FLUSH_TIMEOUT_MS } = require("./constants");

/** Run [name, fn] steps in order, each guarded. Resolves "done", or "timeout" if QUIT_FLUSH_TIMEOUT_MS passes first. Never rejects. */
async function runQuitSteps(steps) {
  let current = null;
  let timer;
  let cut = false;
  const cap = new Promise((resolve) => { timer = setTimeout(() => { cut = true; resolve("timeout"); }, QUIT_FLUSH_TIMEOUT_MS); });
  const run = (async () => {
    for (const [name, step] of steps) {
      if (cut) break; // past the cap the app is quitting: start nothing new
      current = name;
      try { await step(); } catch (err) { console.error("[quit] " + name + " failed:", err && err.message); }
    }
    return "done";
  })();
  const outcome = await Promise.race([run, cap]);
  clearTimeout(timer);
  if (outcome === "timeout") console.warn("[quit] flush cut at " + QUIT_FLUSH_TIMEOUT_MS + " ms during: " + current);
  return outcome;
}

function createWillQuitHandler({ app, stopNewWork, shutdownProducer, steps }) {
  let state = "idle"; // idle → flushing → done
  let relaunch = false;
  // The window is already gone during the flush, so main.js's own second-instance handler does nothing then.
  app.on?.("second-instance", () => { if (state === "flushing") relaunch = true; });
  return async function onWillQuit(event) {
    if (state === "done") return; // the handler's own final quit: everything already ran
    event.preventDefault();
    if (state === "flushing") return; // a quit during the flush waits for it
    state = "flushing";
    try { stopNewWork(); } catch (err) { console.error("[quit] stop failed:", err && err.message); }
    // Never cut at the cap: a worker ended under a live onnxruntime run takes the process down with 0xC0000409.
    const producer = Promise.resolve().then(shutdownProducer).catch(() => {});
    try {
      await runQuitSteps(steps);
    } catch (err) {
      console.error("[quit] flush failed:", err && err.message);
    } finally {
      await producer; // never rejects: awaited on every path, uncapped
      state = "done";
      if (relaunch) {
        try { app.relaunch(); } catch (err) { console.error("[quit] relaunch failed:", err && err.message); }
      }
      app.quit();
    }
  };
}

module.exports = { createWillQuitHandler, runQuitSteps };

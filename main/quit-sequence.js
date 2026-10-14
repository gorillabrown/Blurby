// main/quit-sequence.js — The will-quit flush. Electron does not await an async quit listener (LL-157), so the
// first quit is cancelled, the work is awaited, then the app quits again.
// CommonJS only — Electron main process
"use strict";
const { QUIT_FLUSH_TIMEOUT_MS } = require("./constants");

/** Run [name, fn] steps in order, each guarded. Resolves "done", or "timeout" if QUIT_FLUSH_TIMEOUT_MS passes first. Never rejects. */
async function runQuitSteps(steps) {
  let current = null;
  let timer;
  const cap = new Promise((resolve) => { timer = setTimeout(() => resolve("timeout"), QUIT_FLUSH_TIMEOUT_MS); });
  const run = (async () => {
    for (const [name, step] of steps) {
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
  return async function onWillQuit(event) {
    if (state === "done") return; // the handler's own final quit: everything already ran
    event.preventDefault();
    if (state === "flushing") return; // a quit during the flush waits for it
    state = "flushing";
    try { stopNewWork(); } catch (err) { console.error("[quit] stop failed:", err && err.message); }
    // Never cut at the cap: a worker ended under a live onnxruntime run takes the process down with 0xC0000409.
    const producer = Promise.resolve().then(shutdownProducer).catch(() => {});
    await runQuitSteps(steps);
    await producer;
    state = "done";
    app.quit();
  };
}

module.exports = { createWillQuitHandler, runQuitSteps };

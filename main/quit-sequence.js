// main/quit-sequence.js — The will-quit flush. Electron does not await an async quit listener (LL-157), so the
// first quit is cancelled, the work is awaited, then the app quits again.
// CommonJS only — Electron main process
"use strict";

// C1: the current will-quit behaviour, extracted verbatim (no cap, no guards). C2 replaces both bodies.
async function runQuitSteps(steps) {
  for (const [, s] of steps) await s();
  return "done";
}

function createWillQuitHandler({ app, stopNewWork, shutdownProducer, steps }) {
  let producerStopped = false;
  return async function onWillQuit(event) {
    if (!producerStopped) {
      producerStopped = true;
      event.preventDefault();
      try { await shutdownProducer(); } catch { /* ignore */ }
      app.quit();
      return;
    }
    stopNewWork();
    for (const [, step] of steps) await step();
  };
}

module.exports = { createWillQuitHandler, runQuitSteps };

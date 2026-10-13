"use strict";
// main/ipc/narrate.js — the rebuilt Narrate's narrow IPC surface (NARRATE-REBUILD-1 P3). Three channels, all
// to the producer in main/narrate/producer.js; the preload exposure is P4's. Results carry the exact table and
// the PCM (structured clone keeps the Float32Array); errors come back as { error } and are F4 in the renderer.

const { ipcMain } = require("electron");

function register() {
  const producer = require("../narrate/producer");

  ipcMain.handle("narrate-generate", async (_, text, voice, speed) => {
    try {
      const r = await producer.generate(text, { voice, speed });
      return { table: r.table, pcm: r.pcm, sampleRate: r.sampleRate, genMs: r.genMs, worker: r.worker, busyAtAssign: r.busyAtAssign };
    } catch (err) {
      console.error("[narrate] generate failed:", err?.message || String(err));
      return { error: err?.message || String(err) };
    }
  });

  ipcMain.handle("narrate-preload", async () => {
    try { return { ok: true, status: await producer.ensureReady() }; } catch (err) { return { ok: false, error: err?.message || String(err) }; }
  });

  ipcMain.handle("narrate-status", () => producer.getStatus());
}

module.exports = { register };

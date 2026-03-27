"use strict";
// main/ipc/tts.js — Kokoro TTS handlers

const { ipcMain } = require("electron");

function register(ctx) {
  const ttsEngine = require("../tts-engine");

  // Set up loading callback to notify renderer
  ttsEngine.setLoadingCallback((loading) => {
    const mainWindow = ctx.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("tts-kokoro-loading", loading);
    }
  });

  ipcMain.handle("tts-kokoro-generate", async (_, text, voice, speed) => {
    try {
      const result = await ttsEngine.generate(text, voice, speed);
      // audio is already an Array from the worker
      return {
        audio: result.audio,
        sampleRate: result.sampleRate,
        durationMs: result.durationMs,
      };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-kokoro-voices", async () => {
    try {
      return { voices: await ttsEngine.listVoices() };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-kokoro-model-status", () => {
    return { ready: ttsEngine.isModelReady() };
  });

  ipcMain.handle("tts-kokoro-download", async () => {
    try {
      await ttsEngine.downloadModel((progress) => {
        const mainWindow = ctx.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("tts-kokoro-download-progress", progress);
        }
      });
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  // Pre-load Kokoro model when reader opens (non-blocking)
  ipcMain.handle("tts-kokoro-preload", async () => {
    try {
      await ttsEngine.preload();
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });
}

module.exports = { register };

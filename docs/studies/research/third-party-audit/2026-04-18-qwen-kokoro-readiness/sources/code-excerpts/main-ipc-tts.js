"use strict";
// main/ipc/tts.js — Kokoro TTS handlers

const { ipcMain } = require("electron");

function toErrorResponse(err) {
  const error = err instanceof Error ? err : new Error(String(err || "Kokoro IPC failure"));
  return {
    error: error.message,
    reason: error.reason || null,
    status: error.status || null,
    recoverable: typeof error.recoverable === "boolean" ? error.recoverable : false,
  };
}

function register(ctx) {
  const ttsEngine = require("../tts-engine");

  // Set up loading callback to notify renderer
  ttsEngine.setLoadingCallback((loading) => {
    const mainWindow = ctx.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("tts-kokoro-loading", loading);
    }
  });

  ipcMain.handle("tts-kokoro-generate", async (_, text, voice, speed, words) => {
    try {
      const result = await ttsEngine.generate(text, voice, speed, words);
      // audio is already an Array from the worker
      return {
        audio: result.audio,
        sampleRate: result.sampleRate,
        durationMs: result.durationMs,
        wordTimestamps: result.wordTimestamps || null,
      };
    } catch (err) {
      return toErrorResponse(err);
    }
  });

  ipcMain.handle("tts-kokoro-voices", async () => {
    try {
      return { voices: await ttsEngine.listVoices() };
    } catch (err) {
      return toErrorResponse(err);
    }
  });

  ipcMain.handle("tts-kokoro-model-status", () => {
    if (typeof ttsEngine.getModelStatus === "function") {
      return ttsEngine.getModelStatus();
    }
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
      return toErrorResponse(err);
    }
  });

  // Pre-load Kokoro model when reader opens (non-blocking)
  ipcMain.handle("tts-kokoro-preload", async () => {
    try {
      await ttsEngine.preload();
      return { success: true };
    } catch (err) {
      return toErrorResponse(err);
    }
  });

  // ── Marathon Worker (NAR-5: background caching) ─────────────────────────
  const marathonEngine = require("../tts-engine-marathon");

  ipcMain.handle("tts-kokoro-generate-marathon", async (_, text, voice, speed) => {
    try {
      const result = await marathonEngine.generate(text, voice, speed);
      return {
        audio: result.audio,
        sampleRate: result.sampleRate,
        durationMs: result.durationMs,
      };
    } catch (err) {
      return toErrorResponse(err);
    }
  });

  ipcMain.handle("tts-kokoro-preload-marathon", async () => {
    try {
      await marathonEngine.preload();
      return { success: true };
    } catch (err) {
      return toErrorResponse(err);
    }
  });

  // ── EPUB Word Extraction (HOTFIX-6) ───────────────────────────────────
  const epubWordExtractor = require("../epub-word-extractor");

  ipcMain.handle("extract-epub-words", async (_, bookId) => {
    try {
      const doc = ctx.getLibrary().find((d) => d.id === bookId);
      if (!doc) return { error: "Document not found" };
      const epubPath = doc.convertedEpubPath || doc.filepath;
      if (!epubPath || !epubPath.toLowerCase().endsWith(".epub")) {
        return { error: "Not an EPUB document" };
      }
      const result = await epubWordExtractor.extractWords(epubPath);
      return result;
    } catch (err) {
      return { error: err.message };
    }
  });

  // ── TTS Cache (NAR-2) ─────────────────────────────────────────────────
  const ttsCache = require("../tts-cache");

  ipcMain.handle("tts-cache-read", async (_, bookId, voiceId, startIdx) => {
    try {
      const result = await ttsCache.readChunk(bookId, voiceId, startIdx);
      if (!result) return { miss: true };
      // TTS-7C: Return Float32Array directly — structured clone preserves typed arrays (BUG-113)
      const arr = result.audio instanceof Float32Array ? result.audio : new Float32Array(result.audio);
      return { audio: arr, sampleRate: result.sampleRate, durationMs: result.durationMs, wordCount: result.wordCount ?? null };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-cache-write", async (_, bookId, voiceId, startIdx, audioData, sampleRate, durationMs, wordCount) => {
    try {
      // TTS-7C: Accept Float32Array directly (or plain array for backward compat)
      const pcm = audioData instanceof Float32Array ? audioData : new Float32Array(audioData);
      await ttsCache.writeChunk(bookId, voiceId, startIdx, pcm, sampleRate, durationMs, wordCount);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-cache-has", (_, bookId, voiceId, startIdx) => {
    return ttsCache.hasChunk(bookId, voiceId, startIdx);
  });

  ipcMain.handle("tts-cache-chunks", (_, bookId, voiceId) => {
    return ttsCache.getCachedChunks(bookId, voiceId);
  });

  ipcMain.handle("tts-cache-evict-book", async (_, bookId) => {
    await ttsCache.evictBook(bookId);
    return { success: true };
  });

  ipcMain.handle("tts-cache-evict-voice", async (_, bookId, voiceId) => {
    await ttsCache.evictBookVoice(bookId, voiceId);
    return { success: true };
  });

  ipcMain.handle("tts-cache-info", () => {
    return ttsCache.getCacheInfo();
  });

  // TTS-7F: Opening coverage inspection (manifest-only, no PCM loads)
  ipcMain.handle("tts-cache-opening-coverage", (_, bookId, voiceId) => {
    return { coverageMs: ttsCache.getOpeningCoverageMs(bookId, voiceId) };
  });
}

module.exports = { register };

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
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-kokoro-preload-marathon", async () => {
    try {
      await marathonEngine.preload();
      return { success: true };
    } catch (err) {
      return { error: err.message };
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
      // Transfer audio as ArrayBuffer
      const arr = result.audio instanceof Float32Array ? result.audio : new Float32Array(result.audio);
      return { audio: Array.from(arr), sampleRate: result.sampleRate, durationMs: result.durationMs, wordCount: result.wordCount ?? null };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("tts-cache-write", async (_, bookId, voiceId, startIdx, audioArr, sampleRate, durationMs, wordCount) => {
    try {
      const pcm = new Float32Array(audioArr);
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
}

module.exports = { register };

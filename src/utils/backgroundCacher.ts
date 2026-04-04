// src/utils/backgroundCacher.ts — Background TTS cache builder for Reading Now books (NAR-4)
//
// Runs in the renderer, coordinates with the Kokoro generation pipeline.
// 3-slot priority system:
//   Ramp-up: all 3 slots → active book
//   Cruise:  slot 1 → active book forward, slots 2-3 → other Reading Now books
//   Idle:    all 3 slots → Reading Now books round-robin
//
// Respects the ttsCacheEnabled setting. When disabled, no background work runs.

import { TTS_CRUISE_CHUNK_WORDS, KOKORO_DEFAULT_RATE_BUCKET, type KokoroRateBucket } from "../constants";
import * as ttsCache from "./ttsCache";

const api = window.electronAPI;

export interface BackgroundCacherConfig {
  /** Generate audio for text (IPC to Kokoro) */
  generateFn: (text: string, voiceId: string, speed: number) => Promise<{
    audio?: Float32Array | number[];
    sampleRate?: number;
    durationMs?: number;
    error?: string;
  }>;
  /** Get current voice ID */
  getVoiceId: () => string;
  /** Get whether caching is enabled */
  isCacheEnabled: () => boolean;
  /** Get the active rate bucket — marathon warms only this bucket */
  getRateBucket?: () => KokoroRateBucket;
}

export interface CacheableBook {
  id: string;
  words: string[];
  position: number; // saved word position
}

export interface BackgroundCacher {
  /** Set the active book (gets priority 1) */
  setActiveBook: (book: CacheableBook | null) => void;
  /** Set all Reading Now books (for background caching) */
  setReadingNowBooks: (books: CacheableBook[]) => void;
  /** Start background caching */
  start: () => void;
  /** Stop all background work */
  stop: () => void;
  /** Check if a specific book is fully cached */
  isBookFullyCached: (bookId: string) => Promise<boolean>;
}

export function createBackgroundCacher(config: BackgroundCacherConfig): BackgroundCacher {
  let running = false;
  let activeBook: CacheableBook | null = null;
  let readingNowBooks: CacheableBook[] = [];
  let currentTask: Promise<void> | null = null;
  let abortController: AbortController | null = null;

  /**
   * Cache a single book from a start position forward, then backfill.
   * Returns when the book is fully cached or aborted.
   */
  async function cacheBook(book: CacheableBook, signal: AbortSignal): Promise<void> {
    const rawVoiceId = config.getVoiceId();
    const bucket = config.getRateBucket ? config.getRateBucket() : KOKORO_DEFAULT_RATE_BUCKET;
    const cacheVoiceId = `${rawVoiceId}/${bucket}`;
    const chunkSize = TTS_CRUISE_CHUNK_WORDS;
    const totalWords = book.words.length;
    if (totalWords === 0) return;

    // Phase 1: Forward from saved position
    let idx = book.position;
    while (idx < totalWords && !signal.aborted) {
      if (!config.isCacheEnabled()) return;

      const isCached = await ttsCache.isCached(book.id, cacheVoiceId, idx);
      if (!isCached) {
        const endIdx = Math.min(idx + chunkSize, totalWords);
        const chunkWords = book.words.slice(idx, endIdx);
        const text = chunkWords.join(" ");

        try {
          const result = await config.generateFn(text, rawVoiceId, bucket);
          if (signal.aborted) return;

          if (result.audio && result.sampleRate) {
            const audio = result.audio instanceof Float32Array
              ? result.audio : new Float32Array(result.audio);
            const durationMs = result.durationMs ?? (audio.length / result.sampleRate) * 1000;
            ttsCache.cacheChunk(book.id, cacheVoiceId, idx, audio, result.sampleRate, durationMs);
          }
        } catch {
          if (signal.aborted) return;
        }
      }
      idx += chunkSize;
    }

    // Phase 2: Backfill from beginning to saved position
    idx = 0;
    while (idx < book.position && !signal.aborted) {
      if (!config.isCacheEnabled()) return;

      const isCached = await ttsCache.isCached(book.id, cacheVoiceId, idx);
      if (!isCached) {
        const endIdx = Math.min(idx + chunkSize, book.position);
        const chunkWords = book.words.slice(idx, endIdx);
        const text = chunkWords.join(" ");

        try {
          const result = await config.generateFn(text, rawVoiceId, bucket);
          if (signal.aborted) return;

          if (result.audio && result.sampleRate) {
            const audio = result.audio instanceof Float32Array
              ? result.audio : new Float32Array(result.audio);
            const durationMs = result.durationMs ?? (audio.length / result.sampleRate) * 1000;
            ttsCache.cacheChunk(book.id, cacheVoiceId, idx, audio, result.sampleRate, durationMs);
          }
        } catch {
          if (signal.aborted) return;
        }
      }
      idx += chunkSize;
    }
  }

  /**
   * Main background loop — processes active book first, then round-robins
   * through Reading Now books.
   */
  async function runLoop(): Promise<void> {
    while (running) {
      if (!config.isCacheEnabled()) {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const abort = new AbortController();
      abortController = abort;

      try {
        // Priority 1: Active book
        if (activeBook && !abort.signal.aborted) {
          await cacheBook(activeBook, abort.signal);
        }

        // Priority 2-3: Other Reading Now books (round-robin)
        for (const book of readingNowBooks) {
          if (abort.signal.aborted || !running) break;
          if (book.id === activeBook?.id) continue; // skip active book (already done)
          await cacheBook(book, abort.signal);
        }
      } catch (err) {
        console.warn("[backgroundCacher] Error:", err);
      }

      abortController = null;

      // Wait before next round (prevents busy-loop when all books cached)
      if (running) {
        await new Promise(r => setTimeout(r, 10000));
      }
    }
  }

  function setActiveBook(book: CacheableBook | null): void {
    const changed = activeBook?.id !== book?.id;
    activeBook = book;
    // Preempt current work if active book changed
    if (changed && abortController) {
      abortController.abort();
    }
  }

  function setReadingNowBooks(books: CacheableBook[]): void {
    readingNowBooks = books;
  }

  function start(): void {
    if (running) return;
    running = true;
    currentTask = runLoop();
  }

  function stop(): void {
    running = false;
    if (abortController) abortController.abort();
  }

  async function isBookFullyCached(bookId: string): Promise<boolean> {
    const bucket = config.getRateBucket ? config.getRateBucket() : KOKORO_DEFAULT_RATE_BUCKET;
    const cacheVoiceId = `${config.getVoiceId()}/${bucket}`;
    const book = readingNowBooks.find(b => b.id === bookId) || (activeBook?.id === bookId ? activeBook : null);
    if (!book) return false;

    const cachedChunks = await ttsCache.getCachedChunks(bookId, cacheVoiceId);
    const chunkSize = TTS_CRUISE_CHUNK_WORDS;
    const expectedChunkCount = Math.ceil(book.words.length / chunkSize);
    return cachedChunks.length >= expectedChunkCount;
  }

  return { setActiveBook, setReadingNowBooks, start, stop, isBookFullyCached };
}

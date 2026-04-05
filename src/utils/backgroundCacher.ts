// src/utils/backgroundCacher.ts — Background TTS cache builder for Reading Now books (NAR-4)
//
// Runs in the renderer, coordinates with the Kokoro generation pipeline.
// Serial cacher: processes one book at a time — active book first, then
// round-robin through other Reading Now books. Simple and sufficient;
// parallel slots add complexity for marginal gain.
//
// TTS-7A: Tracks live narration cursor when narration is active, falls back
// to persisted position when not. Includes pronunciation override hash in
// cache key identity (matching kokoroStrategy).
//
// Respects the ttsCacheEnabled setting. When disabled, no background work runs.

import { TTS_CRUISE_CHUNK_WORDS, KOKORO_DEFAULT_RATE_BUCKET, ENTRY_COVERAGE_TARGET_MS, type KokoroRateBucket } from "../constants";
import * as ttsCache from "./ttsCache";
import { overrideHash } from "./pronunciationOverrides";
import type { PronunciationOverride } from "../types";

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
  /** Get current pronunciation overrides for cache identity (TTS-7A) */
  getPronunciationOverrides?: () => PronunciationOverride[];
}

export interface CacheableBook {
  id: string;
  words: string[];
  position: number; // saved word position
}

/** TTS-7F: Job type for background caching */
export type CacheJobType = "entry-coverage" | "cruise";

export interface BackgroundCacher {
  /** Set the active book (gets priority 1) */
  setActiveBook: (book: CacheableBook | null) => void;
  /** Set all Reading Now books (for background caching) */
  setReadingNowBooks: (books: CacheableBook[]) => void;
  /** TTS-7A: Update live narration cursor — warm ahead of this position */
  updateCursorPosition: (wordIndex: number) => void;
  /** TTS-7F: Queue an entry-coverage job (stops at 5-minute target) */
  queueEntryCoverage: (book: CacheableBook) => void;
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
  /** TTS-7A: Live narration cursor position (null = not narrating, use persisted) */
  let liveCursorPosition: number | null = null;
  /** TTS-7F: Entry-coverage job queue (books needing opening 5-min cache) */
  let entryCoverageQueue: CacheableBook[] = [];

  /**
   * Cache a single book from a start position forward, then backfill.
   * Returns when the book is fully cached or aborted.
   */
  /**
   * Cache a single book. If maxDurationMs is provided (entry-coverage job),
   * stop once that much audio has been generated from the start position.
   */
  async function cacheBook(book: CacheableBook, signal: AbortSignal, maxDurationMs?: number): Promise<void> {
    const rawVoiceId = config.getVoiceId();
    const bucket = config.getRateBucket ? config.getRateBucket() : KOKORO_DEFAULT_RATE_BUCKET;
    // TTS-7A: Include pronunciation override hash in cache key (matches kokoroStrategy identity)
    const oh = overrideHash(config.getPronunciationOverrides?.());
    const cacheVoiceId = oh ? `${rawVoiceId}/${bucket}/${oh}` : `${rawVoiceId}/${bucket}`;
    const chunkSize = TTS_CRUISE_CHUNK_WORDS;
    const totalWords = book.words.length;
    if (totalWords === 0) return;

    // TTS-7A: Use live narration cursor for active book, fall back to persisted position
    const startPosition = (book.id === activeBook?.id && liveCursorPosition != null)
      ? liveCursorPosition
      : book.position;

    // Phase 1: Forward from start position
    let idx = startPosition;
    let accumulatedDurationMs = 0; // TTS-7F: Track duration for entry-coverage cap
    while (idx < totalWords && !signal.aborted) {
      if (!config.isCacheEnabled()) return;
      // TTS-7F: Stop entry-coverage jobs once target is reached
      if (maxDurationMs != null && accumulatedDurationMs >= maxDurationMs) break;

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
            ttsCache.cacheChunk(book.id, cacheVoiceId, idx, audio, result.sampleRate, durationMs, chunkWords.length);
            accumulatedDurationMs += durationMs;
          }
        } catch {
          if (signal.aborted) return;
        }
      }
      idx += chunkSize;
    }
    // TTS-7F: Entry-coverage jobs don't backfill — only need opening audio
    if (maxDurationMs != null) return;

    // Phase 2: Backfill from beginning to start position
    idx = 0;
    while (idx < startPosition && !signal.aborted) {
      if (!config.isCacheEnabled()) return;

      const isCached = await ttsCache.isCached(book.id, cacheVoiceId, idx);
      if (!isCached) {
        const endIdx = Math.min(idx + chunkSize, startPosition);
        const chunkWords = book.words.slice(idx, endIdx);
        const text = chunkWords.join(" ");

        try {
          const result = await config.generateFn(text, rawVoiceId, bucket);
          if (signal.aborted) return;

          if (result.audio && result.sampleRate) {
            const audio = result.audio instanceof Float32Array
              ? result.audio : new Float32Array(result.audio);
            const durationMs = result.durationMs ?? (audio.length / result.sampleRate) * 1000;
            ttsCache.cacheChunk(book.id, cacheVoiceId, idx, audio, result.sampleRate, durationMs, chunkWords.length);
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
        // TTS-7F Priority 0: Entry-coverage jobs (stop at 5-minute target)
        while (entryCoverageQueue.length > 0 && !abort.signal.aborted) {
          const job = entryCoverageQueue.shift()!;
          await cacheBook(job, abort.signal, ENTRY_COVERAGE_TARGET_MS);
        }

        // Priority 1: Active book (full cruise)
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
    if (changed) liveCursorPosition = null; // reset cursor for new book
    // Preempt current work if active book changed
    if (changed && abortController) {
      abortController.abort();
    }
  }

  /** TTS-7A: Update live narration cursor — warm ahead of this position */
  function updateCursorPosition(wordIndex: number): void {
    liveCursorPosition = wordIndex;
  }

  /** TTS-7F: Queue an entry-coverage job (stops at 5-minute target) */
  function queueEntryCoverage(book: CacheableBook): void {
    // Avoid duplicates
    if (entryCoverageQueue.some(b => b.id === book.id)) return;
    entryCoverageQueue.push(book);
    // Preempt current work to process entry jobs first
    if (abortController) abortController.abort();
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
    const oh = overrideHash(config.getPronunciationOverrides?.());
    const cacheVoiceId = oh ? `${config.getVoiceId()}/${bucket}/${oh}` : `${config.getVoiceId()}/${bucket}`;
    const book = readingNowBooks.find(b => b.id === bookId) || (activeBook?.id === bookId ? activeBook : null);
    if (!book) return false;

    const cachedChunks = await ttsCache.getCachedChunks(bookId, cacheVoiceId);
    const chunkSize = TTS_CRUISE_CHUNK_WORDS;
    const expectedChunkCount = Math.ceil(book.words.length / chunkSize);
    return cachedChunks.length >= expectedChunkCount;
  }

  return { setActiveBook, setReadingNowBooks, updateCursorPosition, queueEntryCoverage, start, stop, isBookFullyCached };
}

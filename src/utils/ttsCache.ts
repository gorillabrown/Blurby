// src/utils/ttsCache.ts — Renderer-side TTS cache interface (NAR-2)
//
// Thin wrapper over the IPC cache API. Reads cached PCM chunks from disk
// via main process, provides them as ScheduledChunk objects ready for the
// audio scheduler.

import type { ScheduledChunk } from "./audioScheduler";

const api = window.electronAPI;

/**
 * Check if a chunk is cached on disk.
 */
export async function isCached(bookId: string, voiceId: string, startIdx: number): Promise<boolean> {
  if (!api?.ttsCacheHas) return false;
  return api.ttsCacheHas(bookId, voiceId, startIdx);
}

/**
 * Load a cached chunk from disk and return it as a ScheduledChunk.
 * Returns null on cache miss or error.
 */
export async function loadCachedChunk(
  bookId: string,
  voiceId: string,
  startIdx: number,
  words: string[],
): Promise<ScheduledChunk | null> {
  if (!api?.ttsCacheRead) return null;

  const result = await api.ttsCacheRead(bookId, voiceId, startIdx);
  if (!result || result.miss || result.error) return null;

  const audio = result.audio instanceof Float32Array
    ? result.audio
    : new Float32Array(result.audio);

  return {
    audio,
    sampleRate: result.sampleRate,
    durationMs: result.durationMs,
    words,
    startIdx,
  };
}

/**
 * Write a generated chunk to the disk cache (fire-and-forget).
 */
export function cacheChunk(
  bookId: string,
  voiceId: string,
  startIdx: number,
  audio: Float32Array,
  sampleRate: number,
  durationMs: number,
): void {
  if (!api?.ttsCacheWrite) return;
  // Convert to plain array for IPC (structured clone doesn't always preserve Float32Array)
  api.ttsCacheWrite(bookId, voiceId, startIdx, Array.from(audio), sampleRate, durationMs).catch(() => {});
}

/**
 * Get list of cached chunk start indices for a book+voice.
 */
export async function getCachedChunks(bookId: string, voiceId: string): Promise<number[]> {
  if (!api?.ttsCacheChunks) return [];
  return api.ttsCacheChunks(bookId, voiceId);
}

/**
 * Evict all cache for a book (all voices).
 */
export async function evictBook(bookId: string): Promise<void> {
  if (!api?.ttsCacheEvictBook) return;
  await api.ttsCacheEvictBook(bookId);
}

/**
 * Evict cache for a specific book+voice.
 */
export async function evictBookVoice(bookId: string, voiceId: string): Promise<void> {
  if (!api?.ttsCacheEvictVoice) return;
  await api.ttsCacheEvictVoice(bookId, voiceId);
}

/**
 * Get cache size info.
 */
export async function getCacheInfo(): Promise<{ totalBytes: number; totalMB: number; bookCount: number }> {
  if (!api?.ttsCacheInfo) return { totalBytes: 0, totalMB: 0, bookCount: 0 };
  return api.ttsCacheInfo();
}

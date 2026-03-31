// src/utils/generationPipeline.ts — Progressive chunk generation pipeline (NAR-2)
//
// Implements geometric ramp-up (13 → 44 → 148 words) with pipelined IPC.
// All three initial chunks are queued simultaneously. The Kokoro worker processes
// them sequentially (single ONNX session), but IPC round-trip serialization is
// eliminated — each chunk is requested before the previous one returns.
//
// Coordinates with audioScheduler for playback and ttsCache for disk persistence.

import {
  TTS_COLD_START_CHUNK_WORDS,
  TTS_CRUISE_CHUNK_WORDS,
} from "../constants";
import type { ScheduledChunk } from "./audioScheduler";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PipelineConfig {
  /** IPC wrapper: generate audio for text at given speed */
  generateFn: (text: string, voiceId: string, speed: number) => Promise<{
    audio?: Float32Array | number[];
    sampleRate?: number;
    durationMs?: number;
    error?: string;
  }>;
  /** Get all words for narration */
  getWords: () => string[];
  /** Get current voice ID */
  getVoiceId: () => string;
  /** Get current playback speed (e.g. 1.0, 1.5) */
  getSpeed: () => number;
  /** Called when a chunk is ready for scheduling */
  onChunkReady: (chunk: ScheduledChunk) => void;
  /** Called when a chunk should be cached to disk */
  onCacheChunk?: (startIdx: number, audio: Float32Array, sampleRate: number, durationMs: number) => void;
  /** Check if a chunk is already cached */
  isCached?: (startIdx: number) => Promise<boolean>;
  /** Load a cached chunk */
  loadCached?: (startIdx: number) => Promise<ScheduledChunk | null>;
  /** Called on generation error */
  onError: () => void;
  /** Called when all words have been generated/scheduled */
  onEnd: () => void;
}

export interface GenerationPipeline {
  /** Start generation from a word index */
  start: (startIdx: number) => void;
  /** Stop all generation */
  stop: () => void;
  /** Flush and restart from a new position */
  flush: (resumeFromIdx: number) => void;
  /** Check if the pipeline is active */
  isActive: () => boolean;
}

// ── Chunk Sizing ─────────────────────────────────────────────────────────────

/** Fixed doubling ramp-up sequence (NAR-5). Each chunk generates in ≤2x the time
 *  of the previous, keeping the sprint worker ahead of playback even at 1.5x speed. */
const RAMP_SEQUENCE = [
  TTS_COLD_START_CHUNK_WORDS, // 13
  TTS_COLD_START_CHUNK_WORDS * 2, // 26
  TTS_COLD_START_CHUNK_WORDS * 4, // 52
  TTS_COLD_START_CHUNK_WORDS * 8, // 104
];

/**
 * Get chunk size for a given chunk index in the ramp-up sequence.
 * Indices 0-3: doubling from 13 → 26 → 52 → 104
 * Index 4+: TTS_CRUISE_CHUNK_WORDS (148)
 */
export function getChunkSize(chunkIndex: number): number {
  if (chunkIndex < RAMP_SEQUENCE.length) return RAMP_SEQUENCE[chunkIndex];
  return TTS_CRUISE_CHUNK_WORDS;
}

// ── Implementation ───────────────────────────────────────────────────────────

export function createGenerationPipeline(config: PipelineConfig): GenerationPipeline {
  let active = false;
  let generationId = 0;
  let nextProduceIdx = 0;
  let chunkIndex = 0; // tracks position in ramp-up sequence

  /** Produce a chunk starting at startIdx. Returns actual words consumed (may differ from chunkSize on cache hit). */
  async function produceChunk(startIdx: number, chunkSize: number, myGenId: number): Promise<number> {
    if (!active || myGenId !== generationId) return chunkSize;

    const words = config.getWords();
    if (startIdx >= words.length) {
      config.onEnd();
      return chunkSize;
    }

    const endIdx = Math.min(startIdx + chunkSize, words.length);
    const chunkWords = words.slice(startIdx, endIdx);
    const text = chunkWords.join(" ");

    // Check cache first — cached chunk may be larger than requested (e.g. cruise-sized)
    if (config.isCached && config.loadCached) {
      try {
        const isCached = await config.isCached(startIdx);
        if (isCached && myGenId === generationId) {
          const cached = await config.loadCached(startIdx);
          if (cached && myGenId === generationId) {
            config.onChunkReady(cached);
            return cached.words.length; // Actual consumed count (may be > chunkSize)
          }
        }
      } catch { /* cache miss — generate normally */ }
    }

    if (!active || myGenId !== generationId) return;

    try {
      const result = await config.generateFn(text, config.getVoiceId(), config.getSpeed());

      if (!active || myGenId !== generationId) return;

      if (result.error || !result.audio || !result.sampleRate) {
        console.error("[pipeline] generation failed:", result.error || "no audio");
        config.onError();
        return;
      }

      const audio = result.audio instanceof Float32Array
        ? result.audio
        : new Float32Array(result.audio);
      const durationMs = result.durationMs ?? (audio.length / result.sampleRate) * 1000;

      const chunk: ScheduledChunk = {
        audio,
        sampleRate: result.sampleRate,
        durationMs,
        words: chunkWords,
        startIdx,
      };

      if (active && myGenId === generationId) {
        config.onChunkReady(chunk);

        // Cache to disk (fire-and-forget)
        if (config.onCacheChunk) {
          config.onCacheChunk(startIdx, audio, result.sampleRate, durationMs);
        }
      }
      return chunkWords.length;
    } catch (err) {
      console.error("[pipeline] generation error:", err);
      if (active && myGenId === generationId) config.onError();
      return chunkSize;
    }
  }

  /**
   * Run the continuous production loop.
   * During ramp-up: fire chunks sequentially with doubling sizes.
   * Cache hits may return more words than requested — skip remaining ramp-up.
   * During cruise: generate one chunk at a time, continuous.
   */
  async function runPipeline(startIdx: number, myGenId: number): Promise<void> {
    nextProduceIdx = startIdx;
    chunkIndex = 0;

    const words = config.getWords();
    if (nextProduceIdx >= words.length) {
      config.onEnd();
      return;
    }

    // ── Ramp-up phase: sequential with cache-alignment ──
    let rampDone = false;
    while (!rampDone && active && myGenId === generationId && nextProduceIdx < words.length) {
      const size = getChunkSize(chunkIndex);
      if (size >= TTS_CRUISE_CHUNK_WORDS) {
        rampDone = true; // Reached cruise size, switch to cruise loop
        break;
      }

      const idx = nextProduceIdx;
      const consumed = await produceChunk(idx, size, myGenId);
      if (!active || myGenId !== generationId) return;

      nextProduceIdx = Math.min(idx + consumed, words.length);
      chunkIndex++;

      // Cache hit returned cruise-sized chunk — skip remaining ramp-up
      if (consumed >= TTS_CRUISE_CHUNK_WORDS) {
        rampDone = true;
      }
    }

    if (!active || myGenId !== generationId) return;

    // ── Cruise phase: continuous generation ──
    while (active && myGenId === generationId && nextProduceIdx < words.length) {
      const size = TTS_CRUISE_CHUNK_WORDS;
      const idx = nextProduceIdx;

      const consumed = await produceChunk(idx, size, myGenId);
      if (!active || myGenId !== generationId) return;

      nextProduceIdx = Math.min(idx + consumed, words.length);
    }

    // All words generated — notify caller
    if (active && myGenId === generationId && nextProduceIdx >= words.length) {
      config.onEnd();
    }
  }

  function start(startIdx: number): void {
    stop();
    active = true;
    generationId++;
    runPipeline(startIdx, generationId);
  }

  function stop(): void {
    active = false;
    generationId++;
  }

  function flush(resumeFromIdx: number): void {
    stop();
    start(resumeFromIdx);
  }

  function isActive(): boolean {
    return active;
  }

  return { start, stop, flush, isActive };
}

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
  TTS_QUEUE_DEPTH,
  TTS_PLANNER_WINDOW_WORDS,
} from "../constants";
import type { ScheduledChunk } from "./audioScheduler";
import { isSentenceEnd, classifyChunkBoundary } from "./pauseDetection";
import {
  buildNarrationPlan,
  findPlannedChunk,
  planNeedsRebuild,
  type NarrationPlan,
} from "./narrationPlanner";

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
  /** TTS-7N: Optional word-weight config from pause settings (attached to each chunk) */
  getWeightConfig?: () => import("./audioScheduler").WordWeightConfig | undefined;
  /** TTS-7O: Get current pause config for silence injection at chunk boundaries */
  getPauseConfig?: () => import("./pauseDetection").PauseConfig | undefined;
  /** TTS-7P: Get paragraph break set for planner-aware silence injection */
  getParagraphBreaks?: () => Set<number>;
  /** Footnote narration behavior */
  getFootnoteMode?: () => "skip" | "read";
  /** Footnote cue insertion points */
  getFootnoteCues?: () => Array<{ afterWordIdx: number; text: string }>;
  /** Called when a chunk is ready for scheduling */
  onChunkReady: (chunk: ScheduledChunk) => void;
  /** Called when a chunk should be cached to disk (TTS-7A: includes wordCount) */
  onCacheChunk?: (startIdx: number, audio: Float32Array, sampleRate: number, durationMs: number, wordCount: number) => void;
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
  /** TTS-7B: Pause chunk emission (buffers internally, generation continues) */
  pause: () => void;
  /** TTS-7B: Resume chunk emission (flushes buffered chunks, then continues) */
  resume: () => void;
  /** TTS-7C: Acknowledge a consumed chunk (decrements backpressure counter) */
  acknowledgeChunk: () => void;
  /** TTS-7P: Get the current active narration plan (for testing/inspection) */
  getActivePlan: () => import("./narrationPlanner").NarrationPlan | null;
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

/**
 * TTS-7N (BUG-136): Snap a chunk boundary to the nearest sentence ending.
 * Searches backward from the target end index, then forward, within a tolerance
 * window. Prevents mid-sentence chunks that produce awkward pauses.
 *
 * @param words Full word array
 * @param startIdx Chunk start index
 * @param targetEndIdx Ideal chunk end index (startIdx + chunkSize)
 * @param tolerance Max words to search in each direction (default 15)
 * @returns Adjusted end index snapped to a sentence boundary, or targetEndIdx if none found
 */
export function snapToSentenceBoundary(
  words: string[],
  startIdx: number,
  targetEndIdx: number,
  tolerance = 15,
): number {
  const maxIdx = words.length;
  const clampedEnd = Math.min(targetEndIdx, maxIdx);
  // Don't snap very small chunks (ramp-up) — they're too short for sentence detection to help
  if (clampedEnd - startIdx <= 20) return clampedEnd;

  // Search backward first (prefer shorter chunk at sentence boundary)
  for (let i = clampedEnd - 1; i >= Math.max(startIdx + 10, clampedEnd - tolerance); i--) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1; // End AFTER the sentence-ending word
  }
  // Search forward within tolerance
  for (let i = clampedEnd; i < Math.min(maxIdx, clampedEnd + tolerance); i++) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1;
  }
  // TTS-7O: No boundary in tolerance window — expand search outward to prevent
  // mid-sentence chunk cuts. A chunk must NEVER end mid-sentence.
  // Search backward from tolerance limit to start
  for (let i = Math.max(startIdx + 10, clampedEnd - tolerance) - 1; i >= startIdx + 5; i--) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1;
  }
  // Search forward from tolerance limit to end of words
  for (let i = Math.min(maxIdx, clampedEnd + tolerance); i < maxIdx; i++) {
    const next = i + 1 < maxIdx ? words[i + 1] : undefined;
    if (isSentenceEnd(words[i], next)) return i + 1;
  }
  // Truly no sentence boundary in entire remaining text — use original (end of book)
  return clampedEnd;
}

// ── Implementation ───────────────────────────────────────────────────────────

export function createGenerationPipeline(config: PipelineConfig): GenerationPipeline {
  let active = false;
  let generationId = 0;
  let nextProduceIdx = 0;
  let nextEmitIdx = 0;
  let chunkIndex = 0; // tracks position in ramp-up sequence
  let lastEmittedStartIdx = -1; // TTS-6S: duplicate chunk guard
  // TTS-7B: Pause state — buffers chunks instead of emitting
  let paused = false;
  let pauseBuffer: ScheduledChunk[] = [];
  let reorderBuffer = new Map<number, ScheduledChunk>();
  // TTS-7C: Backpressure — hold emission when scheduler has too many buffered chunks (BUG-115)
  let pendingChunks = 0;
  let backpressureResolve: (() => void) | null = null;
  // TTS-7P: Rolling narration plan — single authority for chunk boundary decisions
  let activePlan: NarrationPlan | null = null;

  function buildChunkText(chunkWords: string[], startIdx: number, wordCount: number): string {
    if (config.getFootnoteMode?.() !== "read") return chunkWords.join(" ");
    const cues = config.getFootnoteCues?.() || [];
    if (cues.length === 0) return chunkWords.join(" ");

    const cueMap = new Map<number, string[]>();
    for (const cue of cues) {
      if (cue.afterWordIdx < startIdx - 1 || cue.afterWordIdx >= startIdx + wordCount) continue;
      const arr = cueMap.get(cue.afterWordIdx) || [];
      arr.push(cue.text);
      cueMap.set(cue.afterWordIdx, arr);
    }

    const parts: string[] = [];
    const prelude = cueMap.get(startIdx - 1);
    if (prelude) parts.push(...prelude);
    for (let i = 0; i < chunkWords.length; i++) {
      const globalIdx = startIdx + i;
      parts.push(chunkWords[i]);
      const cueTexts = cueMap.get(globalIdx);
      if (cueTexts) parts.push(...cueTexts);
    }
    return parts.join(" ");
  }

  async function flushOrderedChunks(myGenId: number): Promise<void> {
    while (active && myGenId === generationId) {
      const chunk = reorderBuffer.get(nextEmitIdx);
      if (!chunk) break;
      reorderBuffer.delete(nextEmitIdx);

      // TTS-6S: Skip duplicate chunk at same startIdx (prevents stall/spin)
      if (chunk.startIdx === lastEmittedStartIdx) {
        if (import.meta.env.DEV) console.warn("[pipeline] skipping duplicate chunk at idx", chunk.startIdx);
        nextEmitIdx = chunk.startIdx + chunk.words.length;
        continue;
      }
      lastEmittedStartIdx = chunk.startIdx;
      nextEmitIdx = chunk.startIdx + chunk.words.length;

      if (paused) {
        pauseBuffer.push(chunk);
        continue;
      }

      if (pendingChunks >= TTS_QUEUE_DEPTH) {
        await new Promise<void>(resolve => { backpressureResolve = resolve; });
        if (!active || myGenId !== generationId) return;
      }
      pendingChunks++;
      config.onChunkReady(chunk);
    }
  }

  async function queueChunkForEmission(chunk: ScheduledChunk, myGenId: number): Promise<void> {
    if (!active || myGenId !== generationId) return;
    reorderBuffer.set(chunk.startIdx, chunk);
    await flushOrderedChunks(myGenId);
  }

  /**
   * TTS-7P: Rebuild the rolling narration plan when needed.
   * The plan covers the forward window from `anchorIdx` and is the single
   * authority for chunk boundary positions and silence durations.
   */
  function refreshPlanIfNeeded(anchorIdx: number, words: string[]): void {
    if (!planNeedsRebuild(activePlan, anchorIdx)) return;
    const pauseConfig = config.getPauseConfig?.();
    const paragraphBreaks = config.getParagraphBreaks?.() ?? new Set<number>();
    activePlan = buildNarrationPlan(
      words,
      anchorIdx,
      TTS_CRUISE_CHUNK_WORDS,
      paragraphBreaks,
      pauseConfig,
      TTS_PLANNER_WINDOW_WORDS,
    );
    if (import.meta.env.DEV) {
      console.debug(`[pipeline] plan rebuilt at anchor=${anchorIdx}, chunks=${activePlan.chunks.length}, windowEnd=${activePlan.windowEnd}`);
    }
  }

  /**
   * TTS-7P: Resolve chunk end index using the active plan.
   *
   * The planner operates at cruise-chunk granularity. Ramp-up chunks (smaller than
   * TTS_CRUISE_CHUNK_WORDS) bypass the planner — they use the original sentence-snapping
   * logic to preserve exact cold-start sizing (13 → 26 → 52 → 104 words).
   *
   * For cruise chunks the plan is authoritative: its pre-computed boundary and
   * silence value are used directly, avoiding per-chunk re-classification.
   */
  function resolveChunkEnd(
    words: string[],
    startIdx: number,
    chunkSize: number,
  ): { endIdx: number; plannedSilenceMs: number; isDialogue: boolean } {
    // Ramp-up chunks: bypass planner, use sentence-snapping as before
    if (chunkSize < TTS_CRUISE_CHUNK_WORDS) {
      const rawEndIdx = Math.min(startIdx + chunkSize, words.length);
      const endIdx = snapToSentenceBoundary(words, startIdx, rawEndIdx);
      return { endIdx, plannedSilenceMs: -1, isDialogue: false }; // -1 = derive from classifyChunkBoundary
    }

    // Cruise phase: planner is authoritative
    const planned = activePlan ? findPlannedChunk(activePlan, startIdx) : undefined;
    if (planned) {
      return {
        endIdx: planned.endIdx,
        plannedSilenceMs: planned.silenceMs,
        isDialogue: planned.isDialogue,
      };
    }
    // Planner miss — use the original sentence snapping as fallback
    const rawEndIdx = Math.min(startIdx + chunkSize, words.length);
    const endIdx = snapToSentenceBoundary(words, startIdx, rawEndIdx);
    return { endIdx, plannedSilenceMs: -1, isDialogue: false }; // -1 = derive from classifyChunkBoundary
  }

  /** Produce a chunk starting at startIdx. Returns actual words consumed (may differ from chunkSize on cache hit). */
  async function produceChunk(startIdx: number, chunkSize: number, myGenId: number): Promise<number> {
    if (!active || myGenId !== generationId) return chunkSize;

    const words = config.getWords();
    if (startIdx >= words.length) {
      config.onEnd();
      return chunkSize;
    }

    // TTS-7P: Refresh the rolling plan for cruise-phase chunks (cheap if already current).
    // Ramp-up chunks (< cruise size) bypass the planner entirely.
    if (chunkSize >= TTS_CRUISE_CHUNK_WORDS) {
      refreshPlanIfNeeded(startIdx, words);
    }

    // TTS-7P: Resolve chunk end from plan (single boundary authority for cruise chunks).
    // Ramp-up chunks fall back to sentence-snapping to preserve cold-start sizing.
    const { endIdx, plannedSilenceMs, isDialogue } = resolveChunkEnd(words, startIdx, chunkSize);
    const chunkWords = words.slice(startIdx, endIdx);
    const text = buildChunkText(chunkWords, startIdx, chunkWords.length);

    // Check cache first — cached chunk may be larger than requested (e.g. cruise-sized)
    if (config.isCached && config.loadCached) {
      try {
        const isCached = await config.isCached(startIdx);
        if (isCached && myGenId === generationId) {
          const cached = await config.loadCached(startIdx);
          if (cached && myGenId === generationId) {
            await queueChunkForEmission(cached, myGenId);
            return cached.words.length; // Actual consumed count (may be > chunkSize)
          }
        }
      } catch (err) { if (import.meta.env.DEV) console.warn("[pipeline] cache read failed:", err); }
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

      // TTS-7P: Boundary type from planner (or fallback to classifyChunkBoundary)
      const boundaryType = classifyChunkBoundary(words, endIdx - 1);

      // TTS-7P: Silence injection — planner is the single authority.
      // plannedSilenceMs === -1 means planner miss; derive from classifyChunkBoundary as before.
      let finalAudio = audio;
      let finalDurationMs = durationMs;
      let silenceMs = 0;
      const pauseConfig = config.getPauseConfig?.();

      let resolvedSilenceMs = 0;
      if (plannedSilenceMs >= 0) {
        // Planner provided a definitive value
        resolvedSilenceMs = plannedSilenceMs;
      } else if (pauseConfig && boundaryType !== "none") {
        // Fallback: derive from boundary classification (TTS-7O behavior)
        resolvedSilenceMs =
          boundaryType === "paragraph" ? pauseConfig.paragraphMs :
          boundaryType === "sentence" ? pauseConfig.sentenceMs :
          boundaryType === "clause" ? pauseConfig.clauseMs :
          boundaryType === "comma" ? pauseConfig.commaMs : 0;
      }

      if (resolvedSilenceMs > 0) {
        silenceMs = resolvedSilenceMs;
        const silenceSamples = Math.round((resolvedSilenceMs / 1000) * result.sampleRate);
        const withSilence = new Float32Array(audio.length + silenceSamples);
        withSilence.set(audio, 0);
        finalAudio = withSilence;
        finalDurationMs = durationMs + resolvedSilenceMs;
      }

      if (import.meta.env.DEV && isDialogue && silenceMs > 0) {
        console.debug(`[pipeline] dialogue chunk at ${startIdx}: silence reduced to ${silenceMs}ms`);
      }

      const chunk: ScheduledChunk = {
        audio: finalAudio,
        sampleRate: result.sampleRate,
        durationMs: finalDurationMs,
        words: chunkWords,
        startIdx,
        weightConfig: config.getWeightConfig?.(),
        boundaryType,
        silenceMs,
      };

      if (active && myGenId === generationId) {
        await queueChunkForEmission(chunk, myGenId);

        // Cache to disk (fire-and-forget) — TTS-7A: store actual word count
        // Always cache regardless of pause state
        if (config.onCacheChunk) {
          config.onCacheChunk(startIdx, audio, result.sampleRate, durationMs, chunkWords.length);
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
    nextEmitIdx = startIdx;
    chunkIndex = 0;

    const words = config.getWords();
    if (nextProduceIdx >= words.length) {
      config.onEnd();
      return;
    }

    // ── Ramp-up phase: parallel prefetch for first 2 chunks (TTS-6S backlog fix) ──
    // Fire chunks 0 and 1 in parallel so chunk 1 is generating while chunk 0 plays.
    let rampDone = false;
    const firstSize = getChunkSize(0);
    const secondSize = getChunkSize(1);
    if (firstSize < TTS_CRUISE_CHUNK_WORDS && secondSize < TTS_CRUISE_CHUNK_WORDS && nextProduceIdx < words.length) {
      const idx0 = nextProduceIdx;
      const idx1 = Math.min(idx0 + firstSize, words.length);
      // Fire both requests concurrently
      const [consumed0, consumed1] = await Promise.all([
        produceChunk(idx0, firstSize, myGenId),
        idx1 < words.length ? produceChunk(idx1, secondSize, myGenId) : Promise.resolve(0),
      ]);
      if (!active || myGenId !== generationId) return;
      // Advance past both chunks
      const totalConsumed = (consumed0 || firstSize) + (consumed1 || 0);
      nextProduceIdx = Math.min(idx0 + totalConsumed, words.length);
      chunkIndex = 2;
      if (totalConsumed >= TTS_CRUISE_CHUNK_WORDS) rampDone = true;
    }

    // Continue sequential ramp-up for remaining ramp chunks
    while (!rampDone && active && myGenId === generationId && nextProduceIdx < words.length) {
      const size = getChunkSize(chunkIndex);
      if (size >= TTS_CRUISE_CHUNK_WORDS) {
        rampDone = true;
        break;
      }

      const idx = nextProduceIdx;
      const consumed = await produceChunk(idx, size, myGenId);
      if (!active || myGenId !== generationId) return;

      nextProduceIdx = Math.min(idx + consumed, words.length);
      chunkIndex++;

      if (consumed >= TTS_CRUISE_CHUNK_WORDS) rampDone = true;
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
    lastEmittedStartIdx = -1;
    nextEmitIdx = 0;
    paused = false;
    pauseBuffer = [];
    reorderBuffer = new Map();
    pendingChunks = 0;
    if (backpressureResolve) { backpressureResolve(); backpressureResolve = null; }
    // TTS-7P: Reset rolling plan on stop so retarget/flush starts with a fresh plan
    activePlan = null;
  }

  function flush(resumeFromIdx: number): void {
    stop();
    start(resumeFromIdx);
  }

  function isActive(): boolean {
    return active;
  }

  /** TTS-7B: Pause chunk emission — generation continues, chunks buffer internally */
  function pipelinePause(): void {
    paused = true;
  }

  /** TTS-7B: Resume chunk emission — flush buffered chunks, then continue */
  function pipelineResume(): void {
    paused = false;
    // Flush buffered chunks in order
    const buffered = pauseBuffer.splice(0);
    for (const chunk of buffered) {
      if (!active) break;
      pendingChunks++;
      config.onChunkReady(chunk);
    }
  }

  /** TTS-7C: Acknowledge a consumed chunk — releases backpressure if needed */
  function acknowledgeChunk(): void {
    if (pendingChunks > 0) pendingChunks--;
    if (pendingChunks < TTS_QUEUE_DEPTH && backpressureResolve) {
      backpressureResolve();
      backpressureResolve = null;
    }
  }

  return { start, stop, flush, isActive, pause: pipelinePause, resume: pipelineResume, acknowledgeChunk, getActivePlan: () => activePlan };
}

// src/utils/audioScheduler.ts — Pre-scheduled gapless audio playback (NAR-2)
//
// Replaces the callback-driven audioQueue with Web Audio pre-scheduling.
// Chunks are scheduled at precise future times via source.start(nextStartTime),
// eliminating the 5-20ms gap from the onended→consumeNext handover.
// Crossfade at chunk boundaries prevents splice artifacts.

import { KOKORO_SAMPLE_RATE, TTS_CROSSFADE_MS } from "../constants";

// ── Telemetry (TTS-6F) ─────────────────────────────────────────────────────

/** Per-chunk timing diagnostics — dev/test only, not emitted in production */
export interface ChunkTimingTelemetry {
  chunkStartIdx: number;
  wordCount: number;
  durationMs: number;
  /** Scheduled start time relative to AudioContext epoch */
  scheduledAtSec: number;
  /** Per-word timing weights (normalized, sum to 1.0) */
  wordWeights: number[];
}

/** Accumulated telemetry for the current session — read by tests via getTimingTelemetry() */
let _telemetry: ChunkTimingTelemetry[] = [];

/** Get accumulated telemetry (tests/dev only) */
export function getTimingTelemetry(): ChunkTimingTelemetry[] { return _telemetry; }
/** Clear accumulated telemetry */
export function clearTimingTelemetry(): void { _telemetry = []; }

// ── Word Timing Heuristic (TTS-6F) ─────────────────────────────────────────

/** Punctuation that typically adds a trailing micro-pause in TTS prosody */
const SENTENCE_END_RE = /[.!?]$/;
const CLAUSE_END_RE = /[,;:)]$/;

/**
 * Compute per-word timing weights based on token length and punctuation.
 * Longer words and words ending with punctuation get proportionally more time.
 * Returns normalized weights that sum to 1.0.
 */
export function computeWordWeights(words: string[]): number[] {
  if (words.length === 0) return [];
  if (words.length === 1) return [1.0];

  const raw: number[] = [];
  for (const word of words) {
    // Base weight: proportional to character count (clamped 2–20)
    let w = Math.min(20, Math.max(2, word.length));
    // TTS-6S: Reduced punctuation boosts — Kokoro already bakes prosodic pauses
    // into generated audio. Previous 40%/15% boosts caused double-pausing.
    if (SENTENCE_END_RE.test(word)) w *= 1.12;
    else if (CLAUSE_END_RE.test(word)) w *= 1.05;
    raw.push(w);
  }

  // Normalize so weights sum to 1.0
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map(w => w / total);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScheduledChunk {
  audio: Float32Array;
  sampleRate: number;
  durationMs: number;
  words: string[];
  startIdx: number;
}

export interface SchedulerCallbacks {
  onWordAdvance: (wordIndex: number) => void;
  onChunkBoundary: (endIdx: number) => void;
  onEnd: () => void;
  onError: () => void;
}

export interface AudioScheduler {
  /** Warm up the AudioContext (call on book open, before play) */
  warmUp: () => void;
  /** Schedule a chunk for playback. Chunks are queued and play in order. */
  scheduleChunk: (chunk: ScheduledChunk) => void;
  /** Start playback (resumes AudioContext if suspended) */
  play: () => void;
  /** Pause (suspends AudioContext — all scheduled sources freeze) */
  pause: () => void;
  /** Resume from pause */
  resume: () => void;
  /** Stop all playback, clear scheduled sources */
  stop: () => void;
  /** Get current playback state */
  isPlaying: () => boolean;
  /** Set callbacks for word advance, chunk boundary, end, error */
  setCallbacks: (cbs: SchedulerCallbacks) => void;
  /** Signal that the generation pipeline has produced all chunks */
  markPipelineDone: () => void;
  /** Get the AudioContext (for time-based calculations) */
  getContext: () => AudioContext | null;
}

// ── Implementation ───────────────────────────────────────────────────────────

export function createAudioScheduler(): AudioScheduler {
  let audioCtx: AudioContext | null = null;
  let callbacks: SchedulerCallbacks | null = null;
  let stopped = true;
  let schedulerEpoch = 0;
  let pipelineDone = false;

  // Timeline tracking
  let nextStartTime = 0;
  const crossfadeSec = TTS_CROSSFADE_MS / 1000;
  const crossfadeSamples = Math.round((TTS_CROSSFADE_MS / 1000) * KOKORO_SAMPLE_RATE);

  // Active sources for speed changes and cleanup
  let activeSources: { source: AudioBufferSourceNode; endTime: number; chunk: ScheduledChunk }[] = [];

  // Word timer state
  let wordTimerHandle: ReturnType<typeof setTimeout> | null = null;
  let currentWordBoundaries: { time: number; wordIndex: number }[] = [];
  let nextWordBoundaryIdx = 0;
  let playbackStartTime: number | null = null; // Set on first scheduleChunk — gates tick()

  function getAudioContext(): AudioContext {
    if (!audioCtx) {
      audioCtx = new AudioContext({ sampleRate: KOKORO_SAMPLE_RATE });
    }
    return audioCtx;
  }

  function clearWordTimer(): void {
    if (wordTimerHandle) { clearTimeout(wordTimerHandle); wordTimerHandle = null; }
  }

  /**
   * Apply crossfade to chunk audio.
   * Ramps up the first CROSSFADE_SAMPLES and ramps down the last CROSSFADE_SAMPLES.
   * Returns a new Float32Array (does not mutate input).
   */
  function applyCrossfade(pcm: Float32Array, fadeIn: boolean, fadeOut: boolean): Float32Array {
    if (crossfadeSamples <= 0 || pcm.length < crossfadeSamples * 2) return pcm;
    const result = new Float32Array(pcm);

    if (fadeIn) {
      for (let i = 0; i < crossfadeSamples; i++) {
        result[i] *= i / crossfadeSamples;
      }
    }
    if (fadeOut) {
      const start = result.length - crossfadeSamples;
      for (let i = 0; i < crossfadeSamples; i++) {
        result[start + i] *= (crossfadeSamples - i) / crossfadeSamples;
      }
    }
    return result;
  }

  /**
   * Pre-compute word boundary times using punctuation-aware/token-length-aware weights (TTS-6F).
   * Words are distributed across the chunk duration proportionally to their timing weight.
   */
  function computeWordBoundaries(chunk: ScheduledChunk, chunkStartTime: number): { time: number; wordIndex: number }[] {
    const wordCount = chunk.words.length;
    if (wordCount <= 0) return [];
    const chunkDurSec = chunk.durationMs / 1000;
    const weights = computeWordWeights(chunk.words);
    const boundaries: { time: number; wordIndex: number }[] = [];
    let cumulativeWeight = 0;
    for (let i = 0; i < wordCount; i++) {
      boundaries.push({
        time: chunkStartTime + cumulativeWeight * chunkDurSec,
        wordIndex: chunk.startIdx + i,
      });
      cumulativeWeight += weights[i];
    }

    // Emit telemetry in dev mode
    if (import.meta.env.DEV) {
      _telemetry.push({
        chunkStartIdx: chunk.startIdx,
        wordCount,
        durationMs: chunk.durationMs,
        scheduledAtSec: chunkStartTime,
        wordWeights: weights,
      });
    }

    return boundaries;
  }

  /**
   * Self-correcting word timer — uses AudioContext.currentTime to determine
   * which word boundary we've crossed, then schedules the next tick.
   */
  function startWordTimer(): void {
    clearWordTimer();
    if (!callbacks || !audioCtx || currentWordBoundaries.length === 0) return;

    function tick(): void {
      if (stopped || !callbacks || !audioCtx) return;
      const now = audioCtx.currentTime;

      // Don't process boundaries until audio has actually started playing
      if (playbackStartTime !== null && now < playbackStartTime) {
        const delay = Math.max(5, (playbackStartTime - now) * 1000);
        wordTimerHandle = setTimeout(tick, delay);
        return;
      }

      // Advance past ALL boundaries we've crossed in this tick (TTS-6S: cursor sync fix).
      // Previously only advanced one per tick, causing drift when setTimeout fires late.
      let lastAdvancedIdx = -1;
      while (nextWordBoundaryIdx < currentWordBoundaries.length &&
             currentWordBoundaries[nextWordBoundaryIdx].time <= now) {
        lastAdvancedIdx = nextWordBoundaryIdx;
        nextWordBoundaryIdx++;
      }
      // Fire onWordAdvance once for the latest crossed boundary (skip intermediate)
      if (lastAdvancedIdx >= 0) {
        callbacks.onWordAdvance(currentWordBoundaries[lastAdvancedIdx].wordIndex);

        // Sliding window: prune consumed boundaries to prevent unbounded growth
        if (nextWordBoundaryIdx >= 100) {
          currentWordBoundaries = currentWordBoundaries.slice(nextWordBoundaryIdx);
          nextWordBoundaryIdx = 0;
        }
      }

      // Schedule next tick
      if (nextWordBoundaryIdx < currentWordBoundaries.length) {
        const nextTime = currentWordBoundaries[nextWordBoundaryIdx].time;
        const delay = Math.max(5, (nextTime - now) * 1000);
        wordTimerHandle = setTimeout(tick, delay);
      }
    }

    tick();
  }

  /**
   * Clean up sources that have finished playing.
   */
  function pruneFinishedSources(): void {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    activeSources = activeSources.filter(s => s.endTime > now);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function warmUp(): void {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => { /* AudioContext resume may fail if already closing */ });
  }

  function scheduleChunk(chunk: ScheduledChunk): void {
    const ctx = getAudioContext();

    const isFirstChunk = activeSources.length === 0 && nextStartTime === 0;
    const pcm = chunk.audio instanceof Float32Array ? chunk.audio : new Float32Array(chunk.audio);

    // Apply crossfade (fade-in on all but first chunk, fade-out on all chunks)
    const processed = applyCrossfade(pcm, !isFirstChunk, true);

    // Create AudioBuffer
    const buffer = ctx.createBuffer(1, processed.length, chunk.sampleRate);
    buffer.copyToChannel(processed, 0);

    // Create source
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Determine start time
    if (isFirstChunk || nextStartTime <= ctx.currentTime) {
      nextStartTime = ctx.currentTime;
    }

    const chunkStartTime = nextStartTime;
    const chunkDurationSec = chunk.durationMs / 1000;

    // Track when audio actually starts (gates word timer)
    if (playbackStartTime === null) {
      playbackStartTime = chunkStartTime;
    }

    // Schedule playback
    source.start(chunkStartTime);

    const endTime = chunkStartTime + chunkDurationSec;
    activeSources.push({ source, endTime, chunk });

    // Update next start time (overlap by crossfade duration)
    nextStartTime = endTime - crossfadeSec;

    // Compute word boundaries and extend the timeline
    const boundaries = computeWordBoundaries(chunk, chunkStartTime);
    currentWordBoundaries.push(...boundaries);

    // If word timer isn't running, start it
    if (!wordTimerHandle && !stopped) {
      startWordTimer();
    }

    // Set up onended for bookkeeping — capture epoch to detect stale callbacks
    const myEpoch = schedulerEpoch;
    source.onended = () => {
      if (myEpoch !== schedulerEpoch || stopped || !callbacks) return;
      const endIdx = chunk.startIdx + chunk.words.length;
      callbacks.onChunkBoundary(endIdx);
      pruneFinishedSources();

      // Check if this was the last source AND pipeline has finished generating
      if (activeSources.length === 0 && pipelineDone) {
        callbacks.onEnd();
      }
    };
  }

  function play(): void {
    stopped = false;
    pipelineDone = false;
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => { /* AudioContext resume may fail if already closing */ });
    // Word timer is started by scheduleChunk() on first chunk arrival — not here.
    // Starting it here with no chunks causes a burst when boundaries arrive backdated.
  }

  function pause(): void {
    if (!audioCtx) return;
    clearWordTimer();
    audioCtx.suspend();
  }

  function resume(): void {
    if (!audioCtx) return;
    audioCtx.resume().then(() => {
      if (!stopped) startWordTimer();
    });
  }

  function stop(): void {
    stopped = true;
    pipelineDone = false;
    schedulerEpoch++;
    clearWordTimer();

    // Null onended, disconnect, then stop all active sources
    for (const s of activeSources) {
      s.source.onended = null;
      try { s.source.disconnect(); } catch { /* already disconnected */ }
      try { s.source.stop(); } catch { /* already stopped */ }
    }
    activeSources = [];
    currentWordBoundaries = [];
    nextWordBoundaryIdx = 0;
    nextStartTime = 0;
    playbackStartTime = null;
    callbacks = null;
  }

  function isPlaying(): boolean {
    return !stopped && audioCtx?.state === "running" && activeSources.length > 0;
  }

  function setCallbacks(cbs: SchedulerCallbacks): void {
    callbacks = cbs;
  }

  function markPipelineDone(): void {
    pipelineDone = true;
    // If all sources already finished, fire onEnd now
    pruneFinishedSources();
    if (activeSources.length === 0 && !stopped && callbacks) {
      callbacks.onEnd();
    }
  }

  function getContext(): AudioContext | null {
    return audioCtx;
  }

  return {
    warmUp,
    scheduleChunk,
    play,
    pause,
    resume,
    stop,
    isPlaying,
    setCallbacks,
    markPipelineDone,
    getContext,
  };
}

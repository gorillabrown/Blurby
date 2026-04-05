// src/utils/audioScheduler.ts — Pre-scheduled gapless audio playback (NAR-2)
//
// Replaces the callback-driven audioQueue with Web Audio pre-scheduling.
// Chunks are scheduled at precise future times via source.start(nextStartTime),
// eliminating the 5-20ms gap from the onended→consumeNext handover.
// Crossfade at chunk boundaries prevents splice artifacts.

import { KOKORO_SAMPLE_RATE, TTS_CROSSFADE_MS, TTS_CURSOR_TRUTH_SYNC_INTERVAL } from "../constants";

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

/** TTS-7N (BUG-136): Configurable punctuation weight factors.
 * When pauseConfig is provided, scale punctuation weights relative to defaults.
 * Higher sentence pause → larger sentence weight → cursor dwells longer on sentence endings. */
export interface WordWeightConfig {
  sentenceWeightFactor?: number; // default 1.12
  clauseWeightFactor?: number;   // default 1.05
}

/**
 * Compute per-word timing weights based on token length and punctuation.
 * Longer words and words ending with punctuation get proportionally more time.
 * Returns normalized weights that sum to 1.0.
 *
 * TTS-7N: When weightConfig is provided, punctuation weights scale with user
 * pause settings so cursor dwell time matches Kokoro's natural prosody.
 */
export function computeWordWeights(words: string[], weightConfig?: WordWeightConfig): number[] {
  if (words.length === 0) return [];
  if (words.length === 1) return [1.0];

  const sentenceFactor = weightConfig?.sentenceWeightFactor ?? 1.12;
  const clauseFactor = weightConfig?.clauseWeightFactor ?? 1.05;

  const raw: number[] = [];
  for (const word of words) {
    // Base weight: proportional to character count (clamped 2–20)
    let w = Math.min(20, Math.max(2, word.length));
    if (SENTENCE_END_RE.test(word)) w *= sentenceFactor;
    else if (CLAUSE_END_RE.test(word)) w *= clauseFactor;
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
  /** TTS-7N: Optional pause-derived weight config for cursor timing */
  weightConfig?: WordWeightConfig;
  /** TTS-7O: Boundary classification at chunk end (for silence injection) */
  boundaryType?: "comma" | "clause" | "sentence" | "paragraph" | "none";
  /** TTS-7O: Duration of injected silence at chunk end (ms) */
  silenceMs?: number;
}

export interface SchedulerCallbacks {
  onWordAdvance: (wordIndex: number) => void;
  onChunkBoundary: (endIdx: number) => void;
  onEnd: () => void;
  onError: () => void;
  /** TTS-7O: Periodic truth-sync — fires every N words and on chunk boundaries */
  onTruthSync?: (wordIndex: number) => void;
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
  let wordRafHandle: number | null = null;
  let currentWordBoundaries: { time: number; wordIndex: number }[] = [];
  let nextWordBoundaryIdx = 0;
  let playbackStartTime: number | null = null; // Set on first scheduleChunk — gates tick()

  // TTS-7O: Truth-sync state — fires onTruthSync every N words
  let truthSyncCounter = 0;
  const truthSyncInterval = TTS_CURSOR_TRUTH_SYNC_INTERVAL;

  function getAudioContext(): AudioContext {
    if (!audioCtx) {
      audioCtx = new AudioContext({ sampleRate: KOKORO_SAMPLE_RATE });
    }
    return audioCtx;
  }

  function clearWordTimer(): void {
    if (wordTimerHandle) { clearTimeout(wordTimerHandle); wordTimerHandle = null; }
    if (wordRafHandle != null) { cancelAnimationFrame(wordRafHandle); wordRafHandle = null; }
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
    // TTS-7O: Distribute word timing across SPEECH portion only, excluding injected silence tail
    const chunkDurSec = (chunk.durationMs - (chunk.silenceMs ?? 0)) / 1000;
    const weights = computeWordWeights(chunk.words, chunk.weightConfig);
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
        wordRafHandle = requestAnimationFrame(tick);
        return;
      }

      // Advance past ALL boundaries we've crossed in this tick.
      // TTS-7O follow smoothing: emit every crossed word boundary in order instead
      // of collapsing to the latest one. The old collapse behavior kept truth-sync
      // accurate enough for coarse correction, but it starved the Foliate narration
      // follower of the intermediate positions needed for a continuous glide.
      let advancedAny = false;
      while (nextWordBoundaryIdx < currentWordBoundaries.length &&
             currentWordBoundaries[nextWordBoundaryIdx].time <= now) {
        const advancedWordIndex = currentWordBoundaries[nextWordBoundaryIdx].wordIndex;
        callbacks.onWordAdvance(advancedWordIndex);
        advancedAny = true;
        nextWordBoundaryIdx++;

        truthSyncCounter++;
        if (truthSyncCounter >= truthSyncInterval) {
          truthSyncCounter = 0;
          callbacks.onTruthSync?.(advancedWordIndex);
        }
      }
      if (advancedAny) {
        // Sliding window: prune consumed boundaries to prevent unbounded growth
        if (nextWordBoundaryIdx >= 100) {
          currentWordBoundaries = currentWordBoundaries.slice(nextWordBoundaryIdx);
          nextWordBoundaryIdx = 0;
        }
      }

      // Keep polling on animation frames while boundaries remain. This is
      // smoother under renderer load than setTimeout-based wakeups and lets
      // AudioContext.currentTime remain the single source of truth.
      if (nextWordBoundaryIdx < currentWordBoundaries.length) {
        wordRafHandle = requestAnimationFrame(tick);
      }
    }

    wordRafHandle = requestAnimationFrame(tick);
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
      // TTS-7O: Truth-sync on chunk boundary
      truthSyncCounter = 0;
      callbacks.onTruthSync?.(endIdx - 1 >= chunk.startIdx ? endIdx - 1 : chunk.startIdx);
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
      if (!stopped) {
        startWordTimer();
        // TTS-7O: Truth-sync on resume — re-snap cursor position
        if (callbacks?.onTruthSync && nextWordBoundaryIdx > 0 && currentWordBoundaries.length > 0) {
          const lastIdx = Math.min(nextWordBoundaryIdx - 1, currentWordBoundaries.length - 1);
          if (lastIdx >= 0) callbacks.onTruthSync(currentWordBoundaries[lastIdx].wordIndex);
        }
      }
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
    truthSyncCounter = 0;
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

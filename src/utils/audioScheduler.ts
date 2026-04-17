// src/utils/audioScheduler.ts — Pre-scheduled gapless audio playback (NAR-2)
//
// Replaces the callback-driven audioQueue with Web Audio pre-scheduling.
// Chunks are scheduled at precise future times via source.start(nextStartTime),
// eliminating the 5-20ms gap from the onended→consumeNext handover.
// Crossfade at chunk boundaries prevents splice artifacts.

import { KOKORO_SAMPLE_RATE, TTS_CROSSFADE_MS, TTS_CURSOR_TRUTH_SYNC_INTERVAL, NARRATION_CURSOR_LAG_MS } from "../constants";

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
  /** NARR-TIMING: Real word timestamps from Kokoro duration tensor (null = use heuristic).
   *  startTime/endTime in seconds from chunk audio start. endTime = end of voiced portion
   *  (excludes trailing inter-word pause). Gap between word[i].endTime and word[i+1].startTime
   *  is silence. Currently only startTime is used for scheduling; endTime preserved for future
   *  silence-aware cursor hold (IDEAS.md H6). */
  wordTimestamps?: { word: string; startTime: number; endTime: number }[] | null;
}

export interface SchedulerCallbacks {
  onWordAdvance: (wordIndex: number) => void;
  onChunkBoundary: (endIdx: number) => void;
  onEnd: () => void;
  onError: () => void;
  /** TTS-7O: Periodic truth-sync — fires every N words and on chunk boundaries */
  onTruthSync?: (wordIndex: number) => void;
  /** TTS-7Q: Chunk handoff carry-over — fires at chunk boundary with the last
   *  audio-confirmed word so the visual band can continue from that position. */
  onChunkHandoff?: (lastConfirmedWordIndex: number) => void;
}

/** TTS-7Q: Continuous audio-progress report — fractional position within the current word span. */
export interface AudioProgressReport {
  /** The word index that audio has most recently reached (scheduler-authoritative). */
  wordIndex: number;
  /** Fractional progress within the interval [wordIndex, wordIndex+1) based on audio clock.
   *  0.0 = just started the word, 1.0 = reached the next word.
   *  Used by the visual overlay to interpolate between word positions. */
  fraction: number;
  /** AudioContext.currentTime at the time of this report. Monotonic, audio-clock-only. */
  audioTime: number;
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
  /**
   * TTS-7Q: Get continuous audio progress — fractional position within the current word span.
   * Returns null if not playing or no boundaries are scheduled.
   * Callers should poll this in a RAF loop to drive smooth visual interpolation.
   * IMPORTANT: The returned wordIndex is the canonical audio cursor — not the visual band.
   */
  getAudioProgress: () => AudioProgressReport | null;
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
   * NARR-TIMING: Validate real timestamps before accepting them.
   * Returns true if timestamps pass all checks; false triggers heuristic fallback.
   * Checks: length, finite/non-negative, endTime >= startTime, monotone startTimes,
   * word correspondence, scaled overshoot tolerance, zero-duration count.
   */
  function validateWordTimestamps(
    timestamps: { word: string; startTime: number; endTime: number }[],
    words: string[],
    chunkDurationSec: number,
  ): boolean {
    if (timestamps.length !== words.length) return false;

    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      if (!isFinite(ts.startTime) || !isFinite(ts.endTime)) return false;
      if (ts.startTime < 0 || ts.endTime < 0) return false;
      if (ts.endTime < ts.startTime) return false;
      if (i > 0 && ts.startTime < timestamps[i - 1].startTime) return false;
      if (ts.word !== words[i]) return false;
    }

    // Scaled overshoot tolerance: min(40ms, 5% of speech duration)
    const lastEnd = timestamps[timestamps.length - 1].endTime;
    const overshootToleranceSec = Math.min(0.040, chunkDurationSec * 0.05);
    if (lastEnd > chunkDurationSec + overshootToleranceSec) return false;

    // Too many zero-duration words suggests bad alignment
    const zeroDur = timestamps.filter(t => t.endTime === t.startTime).length;
    if (zeroDur > 2 && zeroDur > timestamps.length * 0.2) return false;

    return true;
  }

  /**
   * Pre-compute word boundary times using punctuation-aware/token-length-aware weights (TTS-6F).
   * Words are distributed across the chunk duration proportionally to their timing weight.
   */
  function computeWordBoundaries(chunk: ScheduledChunk, chunkStartTime: number): { time: number; wordIndex: number }[] {
    const wordCount = chunk.words.length;
    if (wordCount <= 0) return [];

    // ── NARR-TIMING: Use real timestamps if available and valid ────────────
    if (chunk.wordTimestamps) {
      // Real timestamps describe the speech portion only.
      // If chunk has appended silence (silenceMs), validate against speech duration.
      const speechDurationSec = (chunk.durationMs - (chunk.silenceMs ?? 0)) / 1000;

      if (validateWordTimestamps(chunk.wordTimestamps, chunk.words, speechDurationSec)) {
        const boundaries: { time: number; wordIndex: number }[] = [];
        for (let i = 0; i < wordCount; i++) {
          boundaries.push({
            time: chunkStartTime + chunk.wordTimestamps[i].startTime,
            wordIndex: chunk.startIdx + i,
          });
        }

        if (import.meta.env.DEV) {
          _telemetry.push({
            chunkStartIdx: chunk.startIdx,
            wordCount,
            durationMs: chunk.durationMs,
            scheduledAtSec: chunkStartTime,
            wordWeights: null,
            realTimestamps: chunk.wordTimestamps,
            timestampSource: "kokoro-duration-tensor",
          } as any);
        }

        return boundaries;
      }

      // Validation failed — log and fall through to heuristic
      if (import.meta.env.DEV) {
        console.warn(
          `[audioScheduler] Real timestamps failed validation for chunk at word ${chunk.startIdx}, falling back to heuristic`
        );
      }
    }

    // ── FALLBACK: Existing heuristic (unchanged) ──────────────────────────
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

    if (import.meta.env.DEV) {
      _telemetry.push({
        chunkStartIdx: chunk.startIdx,
        wordCount,
        durationMs: chunk.durationMs,
        scheduledAtSec: chunkStartTime,
        wordWeights: weights,
        timestampSource: "heuristic",
      } as any);
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

    // BUG-151: Lag offset — the cursor clock runs behind the audio clock by this
    // amount so the visual cursor never outpaces the actual spoken word.
    const cursorLagSec = NARRATION_CURSOR_LAG_MS / 1000;

    function tick(): void {
      if (stopped || !callbacks || !audioCtx) return;
      const now = audioCtx.currentTime;

      // Don't process boundaries until audio has actually started playing
      if (playbackStartTime !== null && now < playbackStartTime) {
        wordRafHandle = requestAnimationFrame(tick);
        return;
      }

      // BUG-151: Use lagged time for boundary comparison — cursor must not
      // exceed audioTime - cursorLagSec. This is the hard ceiling.
      const cursorNow = now - cursorLagSec;

      // Advance past ALL boundaries we've crossed in this tick.
      let advancedAny = false;
      while (nextWordBoundaryIdx < currentWordBoundaries.length &&
             currentWordBoundaries[nextWordBoundaryIdx].time <= cursorNow) {
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
    buffer.copyToChannel(new Float32Array(processed), 0);

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
      const lastConfirmedWordIdx = endIdx - 1 >= chunk.startIdx ? endIdx - 1 : chunk.startIdx;
      callbacks.onTruthSync?.(lastConfirmedWordIdx);
      // TTS-7Q: Chunk handoff carry-over — notify visual layer of the last audio-confirmed word
      // so it can continue the band from that position, not from a stale visual interpolation.
      callbacks.onChunkHandoff?.(lastConfirmedWordIdx);
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

  /**
   * TTS-7Q: Compute continuous audio progress from AudioContext.currentTime.
   *
   * Looks up the current and next word boundaries in the pre-computed timeline to
   * produce a fractional position [0.0, 1.0) within the current word interval.
   * This gives callers a continuous progress rail without any new DOM work or state.
   *
   * Returns null when:
   * - Not playing / no AudioContext
   * - No word boundaries have been scheduled yet
   * - Audio hasn't started (before playbackStartTime)
   *
   * The returned wordIndex is the CANONICAL audio cursor (scheduler-authoritative).
   * Visual band code must never write this back to pause/resume/save anchors.
   */
  function getAudioProgress(): AudioProgressReport | null {
    if (stopped || !audioCtx || currentWordBoundaries.length === 0) return null;
    if (playbackStartTime !== null && audioCtx.currentTime < playbackStartTime) return null;

    // BUG-151: Use lagged time — cursor must not exceed audioTime - lag.
    const cursorLagSec = NARRATION_CURSOR_LAG_MS / 1000;
    const now = Math.max(0, audioCtx.currentTime - cursorLagSec);
    // If lag pushes us before the first boundary, no progress to report yet
    if (currentWordBoundaries.length > 0 && now < currentWordBoundaries[0].time) return null;
    const boundaries = currentWordBoundaries;
    const total = boundaries.length;
    if (total === 0) return null;

    // Find the most recently crossed boundary (the word audio is currently speaking).
    // nextWordBoundaryIdx tracks the NEXT boundary not yet fired; so the current word
    // is at index (nextWordBoundaryIdx - 1), clamped to [0, total-1].
    const currentIdx = Math.max(0, Math.min(nextWordBoundaryIdx - 1, total - 1));
    const current = boundaries[currentIdx];

    // Compute fraction from current boundary start to next boundary start.
    const nextBoundary = currentIdx + 1 < total ? boundaries[currentIdx + 1] : null;
    let fraction = 0;
    if (nextBoundary) {
      const intervalSec = nextBoundary.time - current.time;
      if (intervalSec > 0) {
        fraction = Math.min(1, Math.max(0, (now - current.time) / intervalSec));
      }
    } else {
      // Last boundary — hold at 0 (no next word to interpolate toward)
      fraction = 0;
    }

    return {
      wordIndex: current.wordIndex,
      fraction,
      audioTime: now,
    };
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
    getAudioProgress,
  };
}

// src/utils/audioScheduler.ts — Pre-scheduled gapless audio playback (NAR-2)
//
// Replaces the callback-driven audioQueue with Web Audio pre-scheduling.
// Chunks are scheduled at precise future times via source.start(nextStartTime),
// eliminating the 5-20ms gap from the onended→consumeNext handover.
// Crossfade at chunk boundaries prevents splice artifacts.

import { KOKORO_SAMPLE_RATE, TTS_CROSSFADE_MS } from "../constants";

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
   * Pre-compute word boundary times for a chunk, accounting for playback rate.
   */
  function computeWordBoundaries(chunk: ScheduledChunk, chunkStartTime: number): { time: number; wordIndex: number }[] {
    const wordCount = chunk.words.length;
    if (wordCount <= 0) return [];
    const chunkDurSec = chunk.durationMs / 1000;
    const msPerWord = chunkDurSec / wordCount;
    const boundaries: { time: number; wordIndex: number }[] = [];
    for (let i = 0; i < wordCount; i++) {
      boundaries.push({
        time: chunkStartTime + i * msPerWord,
        wordIndex: chunk.startIdx + i,
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

      // Advance past all boundaries we've crossed — one at a time per tick
      if (nextWordBoundaryIdx < currentWordBoundaries.length &&
          currentWordBoundaries[nextWordBoundaryIdx].time <= now) {
        callbacks.onWordAdvance(currentWordBoundaries[nextWordBoundaryIdx].wordIndex);
        nextWordBoundaryIdx++;

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
    if (ctx.state === "suspended") ctx.resume();
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
    if (ctx.state === "suspended") ctx.resume();
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

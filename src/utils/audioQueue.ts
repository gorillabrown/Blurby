// src/utils/audioQueue.ts — Producer-consumer rolling audio queue for Kokoro TTS
//
// Replaces the single-chunk generate-play-repeat pipeline with a 3-chunk buffer.
// Producer generates continuously; consumer plays from queue head with manual pauses.

import { TTS_QUEUE_DEPTH, KOKORO_SAMPLE_RATE } from "../constants";
import { getChunkBoundaryPauseMs, countSentences, isSentenceEnd } from "./pauseDetection";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AudioChunk {
  audio: Float32Array | number[];
  sampleRate: number;
  durationMs: number;
  words: string[];
  startIdx: number;
  text: string;
}

export interface AudioQueueConfig {
  /** IPC wrapper: generate audio for text at given speed */
  generateFn: (text: string, voiceId: string, speed: number) => Promise<{
    audio?: Float32Array | number[];
    sampleRate?: number;
    durationMs?: number;
    error?: string;
  }>;
  /** Get all words */
  getWords: () => string[];
  /** Get current voice ID */
  getVoiceId: () => string;
  /** Get current speed */
  getSpeed: () => number;
  /** Find sentence-aligned chunk end index (exclusive) */
  findChunkEnd: (words: string[], startIdx: number) => number;
  /** Get paragraph break indices */
  getParagraphBreaks: () => Set<number>;
}

export interface AudioQueueCallbacks {
  onWordAdvance: (wordIndex: number) => void;
  onChunkBoundary: (endIdx: number) => void;
  onEnd: () => void;
  onError: () => void;
}

export interface AudioQueue {
  start: (startIdx: number, callbacks: AudioQueueCallbacks) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  flush: (resumeFromIdx: number) => void;
  isPlaying: () => boolean;
}

// ── Implementation ───────────────────────────────────────────────────────────

export function createAudioQueue(config: AudioQueueConfig): AudioQueue {
  // Queue state
  let queue: AudioChunk[] = [];
  let producing = false;
  let consuming = false;
  let stopped = true;
  let nextProduceIdx = 0;
  let generationId = 0;
  let callbacks: AudioQueueCallbacks | null = null;

  // Web Audio state (owned by queue)
  let audioCtx: AudioContext | null = null;
  let currentSource: AudioBufferSourceNode | null = null;
  let wordTimer: ReturnType<typeof setInterval> | null = null;
  let pauseTimer: ReturnType<typeof setTimeout> | null = null;

  // Pause/resume tracking
  let pausedWordOffset = 0;
  let currentWordCount = 0;
  let currentMsPerWord = 0;
  let playbackStartTime = 0;
  let currentDurationSec = 0;
  let currentChunkStartIdx = 0;

  // Precomputed sentence counts per paragraph (keyed by paragraph-end word index)
  let paragraphSentenceCounts: Map<number, number> = new Map();

  function getAudioContext(): AudioContext {
    if (!audioCtx) {
      audioCtx = new AudioContext({ sampleRate: KOKORO_SAMPLE_RATE });
    }
    return audioCtx;
  }

  function clearWordTimer(): void {
    if (wordTimer) { clearInterval(wordTimer); wordTimer = null; }
  }

  function clearPauseTimer(): void {
    if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }
  }

  /** Precompute sentence counts for each paragraph. */
  function precomputeParagraphSentenceCounts(): void {
    paragraphSentenceCounts = new Map();
    const words = config.getWords();
    const breaks = config.getParagraphBreaks();
    if (breaks.size === 0) return;

    const sortedBreaks = [...breaks].sort((a, b) => a - b);
    let paraStart = 0;
    for (const breakIdx of sortedBreaks) {
      const paraWords = words.slice(paraStart, breakIdx + 1);
      paragraphSentenceCounts.set(breakIdx, countSentences(paraWords));
      paraStart = breakIdx + 1;
    }
    // Last paragraph (after final break to end of words)
    if (paraStart < words.length) {
      const paraWords = words.slice(paraStart);
      paragraphSentenceCounts.set(words.length - 1, countSentences(paraWords));
    }
  }

  /** Get sentence count for the paragraph ending at the given word index. */
  function getSentenceCountAt(wordIdx: number): number {
    // Find the paragraph break at or before this index
    const breaks = config.getParagraphBreaks();
    if (breaks.has(wordIdx)) {
      return paragraphSentenceCounts.get(wordIdx) ?? 1;
    }
    // If the word index isn't exactly a break, find the nearest break at or after
    for (const [breakIdx, count] of paragraphSentenceCounts) {
      if (breakIdx >= wordIdx) return count;
    }
    return 1;
  }

  // ── Producer ──────────────────────────────────────────────────────────────

  async function produce(): Promise<void> {
    if (producing || stopped) return;
    producing = true;
    const myGenId = generationId;

    while (!stopped && myGenId === generationId) {
      // Queue full — wait for consumer to take one
      if (queue.length >= TTS_QUEUE_DEPTH) {
        producing = false;
        return;
      }

      const words = config.getWords();
      if (nextProduceIdx >= words.length) {
        producing = false;
        return;
      }

      const startIdx = nextProduceIdx;
      const endIdx = config.findChunkEnd(words, startIdx);
      const chunkWords = words.slice(startIdx, endIdx);
      const text = chunkWords.join(" ");
      nextProduceIdx = endIdx;

      try {
        const result = await config.generateFn(text, config.getVoiceId(), config.getSpeed());

        // Stale generation — discard
        if (myGenId !== generationId || stopped) {
          producing = false;
          return;
        }

        if (result.error || !result.audio || !result.sampleRate) {
          console.error("[audioQueue] generation failed:", result.error || "no audio");
          producing = false;
          if (callbacks) callbacks.onError();
          return;
        }

        const durationMs = result.durationMs ?? (result.audio.length / result.sampleRate) * 1000;

        queue.push({
          audio: result.audio,
          sampleRate: result.sampleRate,
          durationMs,
          words: chunkWords,
          startIdx,
          text,
        });

        console.debug(`[audioQueue] produced chunk ${startIdx}-${endIdx} (queue: ${queue.length}/${TTS_QUEUE_DEPTH})`);

        // Kick consumer if it was waiting
        if (!consuming && queue.length > 0) {
          consumeNext();
        }
      } catch (err) {
        console.error("[audioQueue] generation error:", err);
        producing = false;
        if (!stopped && callbacks) callbacks.onError();
        return;
      }
    }
    producing = false;
  }

  // ── Consumer ──────────────────────────────────────────────────────────────

  function consumeNext(): void {
    if (stopped || consuming || queue.length === 0) return;
    consuming = true;

    const chunk = queue.shift()!;
    console.debug(`[audioQueue] consuming chunk ${chunk.startIdx}-${chunk.startIdx + chunk.words.length} (queue: ${queue.length})`);

    // Signal producer to fill the slot we just freed
    if (!producing) produce();

    playChunk(chunk);
  }

  function playChunk(chunk: AudioChunk): void {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const pcm = chunk.audio instanceof Float32Array ? chunk.audio : new Float32Array(chunk.audio);
    const buffer = ctx.createBuffer(1, pcm.length, chunk.sampleRate);
    buffer.copyToChannel(new Float32Array(pcm.buffer as ArrayBuffer, pcm.byteOffset, pcm.length), 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    currentSource = source;

    // Word advance tracking
    currentWordCount = chunk.words.length;
    currentMsPerWord = currentWordCount > 0 ? chunk.durationMs / currentWordCount : 0;
    currentDurationSec = chunk.durationMs / 1000;
    playbackStartTime = ctx.currentTime;
    pausedWordOffset = 0;
    currentChunkStartIdx = chunk.startIdx;

    if (callbacks && currentWordCount > 0) {
      startWordTimer(0, chunk.startIdx);
    }

    source.onended = () => {
      clearWordTimer();
      currentSource = null;
      if (stopped) return;

      // Notify chunk boundary
      const endIdx = chunk.startIdx + chunk.words.length;
      if (callbacks) callbacks.onChunkBoundary(endIdx);

      // Check if we've reached the end of all words
      const words = config.getWords();
      if (endIdx >= words.length && queue.length === 0) {
        consuming = false;
        if (callbacks) callbacks.onEnd();
        return;
      }

      // Calculate pause before next chunk
      const lastWord = chunk.words[chunk.words.length - 1] || "";
      const lastWordGlobalIdx = chunk.startIdx + chunk.words.length - 1;
      const breaks = config.getParagraphBreaks();
      const isParagraphBreak = breaks.has(lastWordGlobalIdx);
      const sentenceCount = isParagraphBreak ? getSentenceCountAt(lastWordGlobalIdx) : 1;
      const nextWord = endIdx < words.length ? words[endIdx] : undefined;

      const pauseMs = getChunkBoundaryPauseMs(lastWord, nextWord, isParagraphBreak, sentenceCount);

      consuming = false;
      if (pauseMs > 0) {
        pauseTimer = setTimeout(() => {
          pauseTimer = null;
          consumeNext();
        }, pauseMs);
      } else {
        consumeNext();
      }
    };

    source.start(0);
  }

  function startWordTimer(fromOffset: number, chunkStartIdx: number): void {
    clearWordTimer();
    if (!callbacks || currentWordCount <= 0 || currentMsPerWord <= 0) return;

    pausedWordOffset = fromOffset;
    wordTimer = setInterval(() => {
      pausedWordOffset++;
      if (pausedWordOffset < currentWordCount && callbacks) {
        callbacks.onWordAdvance(chunkStartIdx + pausedWordOffset);
      }
      if (pausedWordOffset >= currentWordCount - 1) {
        clearWordTimer();
      }
    }, currentMsPerWord);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function start(startIdx: number, cbs: AudioQueueCallbacks): void {
    stopInternal();
    stopped = false;
    callbacks = cbs;
    nextProduceIdx = startIdx;
    generationId++;
    queue = [];

    precomputeParagraphSentenceCounts();
    produce();
  }

  function stopInternal(): void {
    stopped = true;
    producing = false;
    consuming = false;
    queue = [];
    clearWordTimer();
    clearPauseTimer();
    if (currentSource) {
      try { currentSource.stop(); } catch { /* already stopped */ }
      currentSource = null;
    }
    callbacks = null;
  }

  function stop(): void {
    stopInternal();
  }

  function pause(): void {
    if (!audioCtx || !currentSource) return;
    if (audioCtx.state === "suspended") return;

    // Calculate current word offset from AudioContext time
    const elapsed = audioCtx.currentTime - playbackStartTime;
    const progress = Math.min(elapsed / currentDurationSec, 1);
    pausedWordOffset = Math.min(Math.floor(progress * currentWordCount), currentWordCount - 1);

    clearWordTimer();
    clearPauseTimer();
    audioCtx.suspend();
  }

  function resume(): void {
    if (!audioCtx) return;

    const ctx = audioCtx;
    const suspendedAt = ctx.currentTime;

    ctx.resume().then(() => {
      if (!currentSource || stopped) return;

      // Recalculate start time for accurate elapsed tracking
      const elapsedBeforePause = (pausedWordOffset / currentWordCount) * currentDurationSec;
      playbackStartTime = suspendedAt - elapsedBeforePause;

      if (callbacks && currentWordCount > 0) {
        startWordTimer(pausedWordOffset, currentChunkStartIdx);
      }
    });
  }

  function flush(resumeFromIdx: number): void {
    // Cancel current playback and all queued chunks
    clearWordTimer();
    clearPauseTimer();
    if (currentSource) {
      try { currentSource.stop(); } catch { /* already stopped */ }
      currentSource = null;
    }
    queue = [];
    producing = false;
    consuming = false;
    nextProduceIdx = resumeFromIdx;
    generationId++;

    // Restart production from new position
    if (!stopped) {
      produce();
    }
  }

  function isPlaying(): boolean {
    return currentSource !== null && audioCtx?.state === "running";
  }

  return { start, stop, pause, resume, flush, isPlaying };
}

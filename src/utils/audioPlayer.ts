// src/utils/audioPlayer.ts — Web Audio API playback for Kokoro TTS PCM buffers

const KOKORO_SAMPLE_RATE = 24000;

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let onEndCallback: (() => void) | null = null;
let wordTimer: ReturnType<typeof setInterval> | null = null;

// Pause/resume state — tracks word position across suspend/resume cycles
let pausedWordOffset = 0;
let currentWordCount = 0;
let currentMsPerWord = 0;
let currentOnWordAdvance: ((wordOffset: number) => void) | null = null;
let playbackStartTime = 0; // AudioContext.currentTime when playback started
let currentDurationSec = 0; // Total duration of current buffer in seconds

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext({ sampleRate: KOKORO_SAMPLE_RATE });
  }
  return audioCtx;
}

function clearWordTimer(): void {
  if (wordTimer) {
    clearInterval(wordTimer);
    wordTimer = null;
  }
}

/** Start or restart the word advance timer from a given offset. */
function startWordTimer(fromOffset: number): void {
  clearWordTimer();
  if (!currentOnWordAdvance || currentWordCount <= 0 || currentMsPerWord <= 0) return;

  pausedWordOffset = fromOffset;
  wordTimer = setInterval(() => {
    pausedWordOffset++;
    if (pausedWordOffset < currentWordCount && currentOnWordAdvance) {
      currentOnWordAdvance(pausedWordOffset);
    }
    // Stop the timer when we've reached the last word
    if (pausedWordOffset >= currentWordCount - 1) {
      clearWordTimer();
    }
  }, currentMsPerWord);
}

/**
 * Play a PCM Float32Array buffer through Web Audio API.
 * Fires onWordAdvance at estimated intervals based on word count.
 */
export function playBuffer(
  pcmData: number[] | Float32Array,
  sampleRate: number,
  durationMs: number,
  wordCount: number,
  onWordAdvance?: (wordOffset: number) => void,
  onEnd?: () => void,
): void {
  stop(); // cancel any current playback

  const ctx = getAudioContext();
  if (import.meta.env.DEV) console.debug("[audio] play — samples:", pcmData?.length, "@", sampleRate, "Hz,", durationMs, "ms,", wordCount, "words, ctx:", ctx.state);
  if (ctx.state === "suspended") ctx.resume();

  const float32 = pcmData instanceof Float32Array ? pcmData : new Float32Array(pcmData);
  const buffer = ctx.createBuffer(1, float32.length, sampleRate);
  buffer.copyToChannel(new Float32Array(float32.buffer as ArrayBuffer), 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);

  currentSource = source;
  onEndCallback = onEnd || null;

  // Store state for pause/resume
  currentWordCount = wordCount;
  currentMsPerWord = wordCount > 0 ? durationMs / wordCount : 0;
  currentOnWordAdvance = onWordAdvance || null;
  currentDurationSec = durationMs / 1000;
  playbackStartTime = ctx.currentTime;
  pausedWordOffset = 0;

  // Start word advance timer
  if (onWordAdvance && wordCount > 0) {
    startWordTimer(0);
  }

  source.onended = () => {
    clearWordTimer();
    currentSource = null;
    currentOnWordAdvance = null;
    if (onEndCallback) onEndCallback();
  };

  source.start(0);
}

/** Stop current playback */
export function stop(): void {
  clearWordTimer();
  currentOnWordAdvance = null;
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
  onEndCallback = null;
}

/** Pause audio playback — saves word position for accurate resume */
export function pause(): void {
  if (!audioCtx || !currentSource) return;
  if (audioCtx.state === "suspended") return; // Already paused — avoid double-suspend drift

  // Calculate current word offset from AudioContext time (more accurate than timer)
  const elapsed = audioCtx.currentTime - playbackStartTime;
  const progress = Math.min(elapsed / currentDurationSec, 1);
  pausedWordOffset = Math.min(Math.floor(progress * currentWordCount), currentWordCount - 1);

  clearWordTimer();
  audioCtx.suspend();
}

/** Resume audio playback — restarts word timer from saved position */
export function resume(): void {
  if (!audioCtx) return;

  // Update playback start time to account for the pause gap
  // When we resume, AudioContext.currentTime continues from where it was suspended.
  // We need to adjust so our elapsed-time calculation stays correct.
  const ctx = audioCtx;
  const suspendedAt = ctx.currentTime;

  ctx.resume().then(() => {
    if (!currentSource) return; // Source was stopped during resume — don't restart timer

    // Recalculate start time: we know pausedWordOffset corresponds to suspendedAt
    const elapsedBeforePause = (pausedWordOffset / currentWordCount) * currentDurationSec;
    playbackStartTime = suspendedAt - elapsedBeforePause;

    // Restart word timer from where we left off
    if (currentOnWordAdvance && currentWordCount > 0) {
      startWordTimer(pausedWordOffset);
    }
  });
}

/** Check if audio is currently playing */
export function isPlaying(): boolean {
  return currentSource !== null && audioCtx?.state === "running";
}

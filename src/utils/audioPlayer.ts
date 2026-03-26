// src/utils/audioPlayer.ts — Web Audio API playback for Kokoro TTS PCM buffers

const KOKORO_SAMPLE_RATE = 24000;

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let onEndCallback: (() => void) | null = null;
let wordTimer: ReturnType<typeof setInterval> | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext({ sampleRate: KOKORO_SAMPLE_RATE });
  }
  return audioCtx;
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
  if (ctx.state === "suspended") ctx.resume();

  const float32 = pcmData instanceof Float32Array ? pcmData : new Float32Array(pcmData);
  const buffer = ctx.createBuffer(1, float32.length, sampleRate);
  buffer.copyToChannel(new Float32Array(float32.buffer as ArrayBuffer), 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);

  currentSource = source;
  onEndCallback = onEnd || null;

  // Time-based word advance estimation
  if (onWordAdvance && wordCount > 0) {
    const msPerWord = durationMs / wordCount;
    let wordOffset = 0;
    wordTimer = setInterval(() => {
      wordOffset++;
      if (wordOffset < wordCount && onWordAdvance) {
        onWordAdvance(wordOffset);
      }
    }, msPerWord);
  }

  source.onended = () => {
    clearWordTimer();
    currentSource = null;
    if (onEndCallback) onEndCallback();
  };

  source.start(0);
}

/** Stop current playback */
export function stop(): void {
  clearWordTimer();
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource = null;
  }
  onEndCallback = null;
}

/** Pause audio playback */
export function pause(): void {
  clearWordTimer();
  audioCtx?.suspend();
}

/** Resume audio playback */
export function resume(): void {
  audioCtx?.resume();
  // Note: word timer is not resumed — small sync drift is acceptable
}

/** Check if audio is currently playing */
export function isPlaying(): boolean {
  return currentSource !== null && audioCtx?.state === "running";
}

function clearWordTimer(): void {
  if (wordTimer) {
    clearInterval(wordTimer);
    wordTimer = null;
  }
}

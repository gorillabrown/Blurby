/**
 * Narrate engine — the one playback clock (NARRATE-REBUILD-1 P3; Core acceptance "one sample clock").
 *
 * AudioOutput is the seam between the engine and Web Audio: one AudioContext, sample-accurate scheduling of raw
 * PCM at a context time, and the context's output timestamp for the D3 log. The engine never reads any other
 * clock for the cursor. A test replaces it with a fake that advances time by hand.
 */

export interface ScheduledSource {
  /** Stop at a context time (the word in progress finishes; R7). */
  stop(at: number): void;
  /** Stop now and release. */
  cancel(): void;
}

export interface AudioOutput {
  readonly sampleRate: number;
  /** The context's current time, seconds. */
  now(): number;
  /** AudioContext.getOutputTimestamp(): the sample clock mapped to performance.now() (D3). null when unavailable. */
  outputTimestamp(): { readonly contextTime: number; readonly performanceTime: number } | null;
  /** Play pcm[offsetSamples..] starting exactly at context time startAt. */
  schedule(pcm: Float32Array, startAt: number, offsetSamples: number): ScheduledSource;
  close(): void;
}

/**
 * T6: the first sample of the first 1 ms window whose RMS reaches `ratio` (1 %) of the chunk's peak 1 ms RMS.
 * Used only to trim leading silence at playback by a known sample count; it never moves a table boundary.
 */
export function firstVoicedSample(pcm: Float32Array, sampleRate: number, options: { readonly windowMs?: number; readonly ratio?: number } = {}): number {
  const win = Math.max(1, Math.round((sampleRate / 1000) * (options.windowMs ?? 1)));
  const ratio = options.ratio ?? 0.01;
  const n = Math.floor(pcm.length / win);
  if (n === 0) return 0;
  const env = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < win; k++) { const v = pcm[i * win + k]; s += v * v; }
    env[i] = Math.sqrt(s / win);
    if (env[i] > peak) peak = env[i];
  }
  if (peak === 0) return 0;
  const threshold = ratio * peak;
  for (let i = 0; i < n; i++) if (env[i] >= threshold) return i * win;
  return 0;
}

/** Web Audio implementation: one AudioContext per instance; each chunk is one AudioBufferSourceNode. */
export class WebAudioOutput implements AudioOutput {
  private readonly ctx: AudioContext;
  readonly sampleRate: number;

  constructor(sampleRate: number, ctx?: AudioContext) {
    this.ctx = ctx ?? new AudioContext({ sampleRate });
    this.sampleRate = this.ctx.sampleRate;
  }

  now(): number {
    return this.ctx.currentTime;
  }

  outputTimestamp(): { readonly contextTime: number; readonly performanceTime: number } | null {
    const ts = this.ctx.getOutputTimestamp?.();
    if (!ts || ts.contextTime === undefined || ts.performanceTime === undefined) return null;
    return { contextTime: ts.contextTime, performanceTime: ts.performanceTime };
  }

  schedule(pcm: Float32Array, startAt: number, offsetSamples: number): ScheduledSource {
    const buffer = this.ctx.createBuffer(1, pcm.length, this.sampleRate);
    buffer.getChannelData(0).set(pcm);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(startAt, offsetSamples / this.sampleRate);
    let done = false;
    const release = () => { if (done) return; done = true; try { source.disconnect(); } catch { /* already released */ } };
    source.onended = release;
    return {
      stop: (at) => { try { source.stop(at); } catch { /* not started or already stopped */ } },
      cancel: () => { try { source.stop(); } catch { /* not started */ } release(); },
    };
  }

  close(): void {
    void this.ctx.close();
  }
}

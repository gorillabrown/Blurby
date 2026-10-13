// NARRATE-REBUILD-1 P3 test harness: a hand-advanced AudioOutput that records every scheduled source, so a test
// can assert the engine's scheduling (no overlapping voiced samples, exact resume offsets, stop times).
import type { AudioOutput, ScheduledSource } from "../../../src/reader/modes/narrate/engine/playbackClock";

export interface FakeSource {
  readonly id: number;
  readonly startAt: number;
  readonly offset: number;
  readonly samples: number;
  readonly pcm: Float32Array;
  stopAt: number | null;
  cancelledAt: number | null;
}

export class FakeAudioOutput implements AudioOutput {
  readonly sampleRate = 24000;
  readonly sources: FakeSource[] = [];
  private t = 0;

  now(): number { return this.t; }
  advance(seconds: number): void { this.t += seconds; }
  set(seconds: number): void { this.t = seconds; }
  outputTimestamp(): { readonly contextTime: number; readonly performanceTime: number } { return { contextTime: this.t, performanceTime: this.t * 1000 }; }
  close(): void { /* nothing to release */ }

  schedule(pcm: Float32Array, startAt: number, offsetSamples: number): ScheduledSource {
    const rec: FakeSource = { id: this.sources.length, startAt, offset: offsetSamples, samples: pcm.length, pcm, stopAt: null, cancelledAt: null };
    this.sources.push(rec);
    return {
      stop: (at) => { rec.stopAt = rec.stopAt === null ? at : Math.min(rec.stopAt, at); },
      cancel: () => { rec.cancelledAt = this.t; rec.stopAt = rec.stopAt === null ? this.t : Math.min(rec.stopAt, this.t); },
    };
  }

  /** The context-time interval each source actually sounds: [startAt, min(natural end, stopAt)). */
  intervals(): Array<{ readonly id: number; readonly start: number; readonly end: number }> {
    return this.sources
      .map((s) => ({ id: s.id, start: s.startAt, end: Math.min(s.startAt + (s.samples - s.offset) / this.sampleRate, s.stopAt ?? Infinity) }))
      .filter((i) => i.end > i.start)
      .sort((a, b) => a.start - b.start);
  }

  /** The sample ranges of each source that were sounded (by pcm identity), for drop/repeat checks. */
  playedSampleRanges(): Array<{ readonly pcm: Float32Array; readonly from: number; readonly to: number }> {
    return this.sources
      .map((s) => ({ pcm: s.pcm, from: s.offset, to: Math.min(s.samples, s.offset + Math.round(((s.stopAt ?? Infinity) - s.startAt) * this.sampleRate)) }))
      .filter((r) => r.to > r.from);
  }

  overlaps(): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    const iv = this.intervals();
    for (let i = 1; i < iv.length; i++) if (iv[i].start < iv[i - 1].end - 1e-9) out.push([iv[i - 1].id, iv[i].id]);
    return out;
  }
}

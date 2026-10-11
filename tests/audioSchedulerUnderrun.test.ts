// @vitest-environment jsdom
// READER-MODE-SEPARATION-2-S1 (G6, Decision #28). The word timer's animation-frame loop ended once every
// scheduled boundary had been delivered, but left wordRafHandle holding the spent frame id. After a playback
// underrun (the next chunk scheduled only after the timeline drained) the restart guards in scheduleChunk
// and startWordTimer saw a "live" timer, so no word event fired for the rest of the session while audio
// played on. Live G6: EPUB narrate-section-transition stopped at word 5479 on B0 and the candidate whenever
// chunk 2 (5480+) arrived after chunk 1's audio ended (e.g. candidate run xseccthree, 0.57 s late).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KOKORO_SAMPLE_RATE } from "../src/constants";
import { createAudioScheduler, type ScheduledChunk } from "../src/utils/audioScheduler";

let now = 0;
let frames: Array<() => void> = [];
let started = 0;

beforeEach(() => {
  now = 0; frames = []; started = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => { frames.push(cb); return frames.length; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  class Source {
    buffer: unknown = null; playbackRate = { value: 1 }; onended: (() => void) | null = null;
    connect() { return this; } start() { started++; } stop() {} disconnect() {}
  }
  class Context {
    sampleRate = KOKORO_SAMPLE_RATE; state = "running"; destination = {};
    get currentTime() { return now; }
    createBuffer(_c: number, length: number) { return { length, copyToChannel() {}, getChannelData: () => new Float32Array(length) }; }
    createBufferSource() { return new Source(); }
    createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {} }, connect() { return this; } }; }
    resume() { return Promise.resolve(); } suspend() { return Promise.resolve(); }
  }
  vi.stubGlobal("AudioContext", Context);
});
afterEach(() => { vi.unstubAllGlobals(); });

const chunk = (startIdx: number, n: number): ScheduledChunk => ({
  audio: new Float32Array(KOKORO_SAMPLE_RATE), sampleRate: KOKORO_SAMPLE_RATE, durationMs: 1000,
  words: Array.from({ length: n }, (_, i) => `w${startIdx + i}`), startIdx,
});
/** Advance the audio clock to `t` and run animation frames until the loop stops asking for more. */
const runFramesUntil = (t: number) => {
  now = t;
  for (let i = 0; i < 1000 && frames.length; i++) { const due = frames; frames = []; due.forEach((f) => f()); }
};

describe("audioScheduler word timer across a playback underrun", () => {
  it("restarts when the next chunk arrives after the timeline drained", () => {
    const words: number[] = [];
    const s = createAudioScheduler();
    s.setCallbacks({ onWordAdvance: (w: number) => words.push(w), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    s.play();
    s.scheduleChunk(chunk(0, 5));
    runFramesUntil(2.5); // chunk 1 played out and every boundary delivered: the loop ends
    expect(words).toEqual([0, 1, 2, 3, 4]);
    expect(frames).toHaveLength(0);
    s.scheduleChunk(chunk(5, 5)); // the late chunk (underrun)
    expect(started).toBe(2);
    runFramesUntil(5);
    expect(words).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    s.stop();
  });

  it("without an underrun the words run straight through (control)", () => {
    const words: number[] = [];
    const s = createAudioScheduler();
    s.setCallbacks({ onWordAdvance: (w: number) => words.push(w), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    s.play();
    s.scheduleChunk(chunk(0, 5));
    s.scheduleChunk(chunk(5, 5));
    runFramesUntil(5);
    expect(words).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    s.stop();
  });

  it("restarts after a second underrun too (the handle is cleared every time the loop ends)", () => {
    const words: number[] = [];
    const s = createAudioScheduler();
    s.setCallbacks({ onWordAdvance: (w: number) => words.push(w), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    s.play();
    s.scheduleChunk(chunk(0, 3));
    runFramesUntil(2.5);
    s.scheduleChunk(chunk(3, 3));
    runFramesUntil(5);
    s.scheduleChunk(chunk(6, 3));
    runFramesUntil(8);
    expect(words).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    s.stop();
  });
});

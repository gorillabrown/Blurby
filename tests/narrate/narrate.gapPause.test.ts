// NARRATE-GAP-PAUSE-1 (BUG-237): a pause that lands in the silence before a scheduled chunk resumes on that chunk's first
// word at now + lead. A real output's heard sample lags its scheduling head; LatentOutput models that lag (LL-173), which
// the stock fake (heard = head) hides. (g1)–(g3) reproduce D6's warm-2.00-3 pause 34 ms before a chunk; (c1)–(c4) are
// controls: a pause mid-chunk, a pause with nothing scheduled, the zero-latency gap, and contiguous chunks.
import { describe, expect, it, vi } from "vitest";
import { NarrateEngine, type EngineFailure, type EngineState, type ProducerPort } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { FakeAudioOutput, type FakeSource } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF } from "./harness/fakeProducer";

const WORDS = "Of my grandfather Verus I have learned to be gentle and meek. Of my mother I have learned to be religious, and bountiful; not only to do, but to intend any evil. Of my great grandfather I have learned to be frugal."
  .split(" ");
const FRAMES = 8; // 200 ms per word at 1.00x in the fake
const WORD_S = (FRAMES * SPF) / SAMPLE_RATE;
const LATENCY = 0.1;
const GAP_S = 0.034; // D6 warm-2.00-3: the pause landed 34 ms before the chunk on the heard clock

/** A real output: the heard sample lags the scheduling head by the output latency. */
class LatentOutput extends FakeAudioOutput {
  constructor(readonly latency: number) { super(); }
  playbackPosition(): number { return this.now() - this.latency; }
}

function harness(output: FakeAudioOutput, options: { hold?: boolean; framesPerWord?: number; prefetch?: number } = {}) {
  const producer = new FakeProducer({ hold: options.hold ?? false, framesPerWord: options.framesPerWord ?? FRAMES, leadFrames: 2, tailFrames: 1 });
  const cursor: number[] = [];
  const states: EngineState[] = [];
  const failures: EngineFailure[] = [];
  const diagnostics: string[] = [];
  const complete = vi.fn();
  const calls: Array<{ text: string; priority?: string; group?: string }> = [];
  const port: ProducerPort = { generate: (r) => { calls.push({ text: r.text, priority: r.priority, group: r.group }); return producer.generate(r); } };
  const engine = new NarrateEngine({
    words: WORDS, producer: port, output, voice: "af_bella", speed: 1.0, prefetch: options.prefetch ?? 1, leadSeconds: 0.03,
    events: { onCursor: (w) => cursor.push(w), onState: (s) => states.push(s), onFailure: (f) => failures.push(f), onComplete: complete, onDiagnostic: (k, d) => diagnostics.push(`${k}: ${d}`) },
  });
  return { engine, output, producer, calls, cursor, states, failures, diagnostics, complete };
}
type H = ReturnType<typeof harness>;

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

/** Advance the fake clock in display-frame steps, ticking the engine each step. */
function run(h: H, seconds: number, step = 1 / 60): void {
  const steps = Math.round(seconds / step);
  for (let i = 0; i < steps; i++) { h.output.advance(step); h.engine.tick(); }
}

const soundedS = (s: FakeSource) => (s.samples - s.offset) / SAMPLE_RATE;
const wordsIn = (s: FakeSource) => s.samples / SPF / FRAMES - 3 / FRAMES; // lead 2 + tail 1 frames around the words
const releaseHeld = async (h: H) => {
  for (const r of h.producer.requests) if (!r.settled) { r.release(); await flush(); }
};

/**
 * The BUG-237 scenario: chunk A (words 0–11) plays out, chunk B (from word 12) is scheduled after a gap at now + lead,
 * and the clock advances (no tick) until the heard sample is 34 ms before B, with the scheduling head already past B's
 * start. Then pause, resume, release everything held, and play B through.
 */
async function gapPause(latency: number) {
  const h = harness(new LatentOutput(latency), { hold: true, prefetch: 1 });
  h.engine.play(0);
  await flush();
  h.producer.requests[0].release();
  await flush();
  const srcA = h.output.sources[0];
  run(h, soundedS(srcA) + 0.3); // A has played out; B is still held
  h.producer.requests[1].release();
  await flush();
  const srcB = h.output.sources.at(-1)!;
  h.output.advance(Math.max(0, srcB.startAt - GAP_S + latency - h.output.now()));
  h.engine.pause();
  const tResume = h.output.now();
  const sourcesBefore = h.output.sources.length;
  const cursorBefore = h.cursor.length;
  h.engine.resume();
  await flush();
  await releaseHeld(h);
  await releaseHeld(h);
  run(h, wordsIn(srcB) * WORD_S + 0.5); // through the end of B
  const next = h.output.sources[sourcesBefore];
  return { h, srcA, srcB, tResume, next, after: h.cursor.slice(cursorBefore) };
}

describe("NARRATE-GAP-PAUSE-1: a pause in the gap before a scheduled chunk (BUG-237)", () => {
  it("(g1) a pause 34 ms before a scheduled chunk resumes on that chunk", async () => {
    const { srcB, next, h } = await gapPause(LATENCY);
    expect(h.output.playbackPosition()).toBeGreaterThan(0);
    expect(next, "a source is scheduled after the resume").toBeDefined();
    expect({ sameChunk: next.pcm === srcB.pcm, offset: next.offset }).toEqual({ sameChunk: true, offset: srcB.offset });
  });

  it("(g2) the first chunk after the resume starts at now + lead, not at the stopped chunk's end", async () => {
    const { next, tResume } = await gapPause(LATENCY);
    expect(next, "a source is scheduled after the resume").toBeDefined();
    expect(next.startAt - tResume).toBeLessThanOrEqual(0.03 + 1e-9);
  });

  it("(g3) no word of the chunk is skipped (by text, LL-161)", async () => {
    const { after, srcB, h } = await gapPause(LATENCY);
    expect(after[0]).toBe(12);
    expect(WORDS[after[0]]).toBe("Of");
    const nB = Math.round(wordsIn(srcB));
    expect(after.slice(0, nB)).toEqual(Array.from({ length: nB }, (_, i) => 12 + i));
    expect(h.output.overlaps()).toEqual([]);
  });

  it("(c1) a pause mid-chunk resumes at the paused unit", async () => {
    const h = harness(new LatentOutput(LATENCY), { hold: true, prefetch: 1 });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    const srcA = h.output.sources[0];
    run(h, LATENCY + 0.5); // the heard sample is ~0.5 s into A
    const heard = h.output.playbackPosition();
    const pausedSample = Math.floor((heard - srcA.startAt) * SAMPLE_RATE) + srcA.offset;
    h.engine.pause();
    const sourcesBefore = h.output.sources.length;
    h.engine.resume();
    await flush();
    const next = h.output.sources[sourcesBefore];
    expect({ sameChunk: next.pcm === srcA.pcm, offset: next.offset }).toEqual({ sameChunk: true, offset: pausedSample });
    await releaseHeld(h);
    run(h, 1.0);
    expect(h.cursor).toEqual([...Array(h.cursor.length).keys()]); // nothing repeated or skipped
  });

  it("(c2) a pause with no chunk scheduled restarts like a Play", async () => {
    const h = harness(new LatentOutput(LATENCY), { hold: true, prefetch: 1 });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    run(h, soundedS(h.output.sources[0]) + 0.3); // A has played out; B is held: nothing scheduled ahead
    h.engine.pause();
    const tResume = h.output.now();
    const requestsBefore = h.producer.requests.length;
    const sourcesBefore = h.output.sources.length;
    const cursorBefore = h.cursor.length;
    h.engine.resume();
    await flush();
    expect(h.producer.requests.length, "a new request is made").toBe(requestsBefore + 1);
    expect(h.calls.at(-1)!.text.split(" ")[0]).toBe(WORDS[12]);
    h.producer.requests.at(-1)!.release();
    await flush();
    const next = h.output.sources[sourcesBefore];
    expect(next.startAt).toBeLessThanOrEqual(tResume + 0.03 + 1e-9);
    run(h, 0.5);
    expect(h.cursor.slice(cursorBefore)[0]).toBe(12);
  });

  it("(c3) zero latency: the existing gap behaviour is unchanged", async () => {
    const { srcB, next, tResume } = await gapPause(0);
    expect({ sameChunk: next.pcm === srcB.pcm, offset: next.offset }).toEqual({ sameChunk: true, offset: srcB.offset });
    expect(next.startAt - tResume).toBeLessThanOrEqual(0.03 + 1e-9);
  });

  it("(c4) contiguous chunks without a pause still abut", async () => {
    const h = harness(new LatentOutput(LATENCY), { hold: true, prefetch: 1 });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    run(h, 0.5); // A is still sounding
    h.producer.requests[1].release();
    await flush();
    const srcA = h.output.sources[0], srcB = h.output.sources[1];
    expect(srcB.startAt).toBe(srcA.startAt + soundedS(srcA));
    expect(h.output.overlaps()).toEqual([]);
  });
});

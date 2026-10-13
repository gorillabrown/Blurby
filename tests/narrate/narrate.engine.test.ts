// NARRATE-REBUILD-1 P3 — D5-engine: one sample clock and one table lookup drive the cursor, every chunk handoff
// and resume; no two voiced samples overlap; no word is dropped or repeated across pause/resume, a mid-word
// click and speed changes; silence holds the last word (R6); a speed change finishes the unit in progress and
// starts the next word at the new speed (R7), rapid changes coalesce, stale results are dropped.
import { describe, expect, it, vi } from "vitest";
import { NarrateEngine, leadingTrim, type EngineFailure, type EngineState, type ProducerPort } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF, lawfulTable } from "./harness/fakeProducer";

const WORDS = "Of my grandfather Verus I have learned to be gentle and meek. Of my mother I have learned to be religious, and bountiful; not only to do, but to intend any evil. Of my great grandfather I have learned to be frugal."
  .split(" ");
const FRAMES = 8; // 200 ms per word at 1.00x in the fake
const WORD_S = (FRAMES * SPF) / SAMPLE_RATE;

function harness(options: { hold?: boolean; framesPerWord?: number; prefetch?: number; prefetchSeconds?: number; chunkRamp?: readonly number[] } = {}) {
  const output = new FakeAudioOutput();
  const producer = new FakeProducer({ hold: options.hold ?? false, framesPerWord: options.framesPerWord ?? FRAMES, leadFrames: 2, tailFrames: 1 });
  const cursor: number[] = [];
  const states: EngineState[] = [];
  const failures: EngineFailure[] = [];
  const diagnostics: string[] = [];
  const complete = vi.fn();
  // What the engine asked the producer for (the fake ignores priority and group): the same order as producer.requests.
  const calls: Array<{ text: string; priority?: string; group?: string }> = [];
  const port: ProducerPort = { generate: (r) => { calls.push({ text: r.text, priority: r.priority, group: r.group }); return producer.generate(r); } };
  const engine = new NarrateEngine({
    words: WORDS, producer: port, output, voice: "af_bella", speed: 1.0, prefetch: options.prefetch ?? 1, prefetchSeconds: options.prefetchSeconds, leadSeconds: 0.03, chunkRamp: options.chunkRamp,
    events: { onCursor: (w) => cursor.push(w), onState: (s) => states.push(s), onFailure: (f) => failures.push(f), onComplete: complete, onDiagnostic: (k, d) => diagnostics.push(`${k}: ${d}`) },
  });
  return { engine, output, producer, calls, cursor, states, failures, diagnostics, complete };
}

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

/** Advance the fake clock in display-frame steps, ticking the engine each step. */
function run(h: ReturnType<typeof harness>, seconds: number, step = 1 / 60): void {
  const steps = Math.round(seconds / step);
  for (let i = 0; i < steps; i++) { h.output.advance(step); h.engine.tick(); }
}

describe("narrate engine (D5-engine)", () => {
  it("plays from a word: the first chunk is one short sentence, scheduled once verified, trimmed of leading silence, and the next chunk is prefetched", async () => {
    const h = harness();
    h.engine.play(0);
    await flush();
    expect(h.states).toEqual(["playing"]);
    expect(h.producer.requests[0].text).toBe("Of my grandfather Verus I have learned to be gentle and meek."); // 12 words, one sentence
    expect(h.producer.requests[0].speed).toBe(1.0);
    const first = h.output.sources[0];
    expect(first.offset).toBe(2 * SPF); // T6: the two leading-silence frames are skipped by a known sample count
    expect(first.startAt).toBeCloseTo(0.03, 6);
    expect(h.producer.requests).toHaveLength(2); // prefetch 1: the second sentence is already requested …
    expect(h.producer.requests[1].text.startsWith("Of my mother")).toBe(true);
    expect(h.output.sources).toHaveLength(2); // … and, the fake answering at once, scheduled contiguously after the first
    expect(h.output.sources[1].startAt).toBeCloseTo(first.startAt + (first.samples - first.offset) / SAMPLE_RATE, 9);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("the chunk ramp (D6 lever) caps the first chunks of every request, then whole sentences pack; a click starts it again", async () => {
    const h = harness({ chunkRamp: [3, 5] });
    const words = (i: number) => h.producer.requests[i].text.split(" ").length;
    h.engine.play(0);
    await flush();
    expect(h.producer.requests[0].text).toBe("Of my grandfather"); // step 0: 3 words of a 12-word sentence, no pause mark
    expect(h.producer.requests[1].text).toBe("Verus I have learned to"); // step 1: 5 words
    run(h, 2.5);
    await flush();
    expect(h.producer.requests.length).toBeGreaterThan(2);
    expect(words(2)).toBeGreaterThan(5); // past the ramp: whole sentences under the token estimate (T2)
    const before = h.producer.requests.length;
    h.engine.play(25, "click");
    await flush();
    expect(h.producer.requests[before].text).toBe("to do,"); // a new request: the ramp starts again (3-word cap, cut at its pause mark)
    expect(h.output.overlaps()).toEqual([]);
  });

  it("the leading trim stops at the first voiced sample, but never past the first unit's last table frame (2.00x: no first-word drop)", () => {
    const o = { framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 };
    const { table, pcm } = lawfulTable(["Of", "my", "grandfather"], 1.0, o);
    expect(leadingTrim(pcm, SAMPLE_RATE, table)).toBe(2 * SPF); // voiced from the first word's first sample
    // The table's first unit ends before any sound (the VERDICT's early first word at >= 1.40x): silence through unit 0.
    const late = pcm.slice();
    late.fill(0, 0, table.units[1].sampleStart + 3 * SPF);
    const trim = leadingTrim(late, SAMPLE_RATE, table);
    expect(trim).toBe(table.units[0].sampleEnd - SPF);
    expect(trim).toBeLessThan(table.units[0].sampleEnd); // unit 0 still sounds (under the cursor) for one table frame
  });

  it("with no display frames (a hidden or covered window) the timer pump alone keeps the prefetch going to the end", async () => {
    const h = harness();
    h.engine.play(0);
    await flush();
    const total = WORDS.length * WORD_S + 2;
    for (let elapsed = 0; elapsed < total; elapsed += 0.25) { h.output.advance(0.25); h.engine.pump(); await flush(); }
    expect(h.producer.requests.map((r) => r.text).join(" ")).toBe(WORDS.join(" ")); // every word was generated
    expect(h.output.overlaps()).toEqual([]);
    expect(h.complete).toHaveBeenCalledTimes(1);
    expect(h.states.at(-1)).toBe("stopped");
  });

  it("a pause in a gap (the next chunk still generating) resumes at that chunk once it arrives: no word is skipped", async () => {
    const h = harness({ hold: true });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release(); // the first sentence (words 0-11)
    await flush();
    expect(h.producer.requests).toHaveLength(2); // the second sentence (from word 12) is generating, held
    run(h, 0.03 + 12 * WORD_S + 0.2); // the first chunk plays out: a gap, nothing scheduled
    h.engine.pause();
    h.producer.requests[1].release(); // it arrives while paused
    await flush();
    h.engine.resume();
    await flush();
    run(h, 0.5);
    expect(h.cursor).toContain(12); // the resume plays the chunk that arrived in the pause …
    expect(h.cursor.filter((w) => w > 11)[0]).toBe(12); // … from its first word, nothing skipped
    expect(h.output.overlaps()).toEqual([]);
  });

  it("a resume with nothing replayable starts like a Play: the stale prefetch is abandoned and the next request is the ramp's short first chunk, priority request (Decision #19)", async () => {
    const h = harness({ hold: true, chunkRamp: [3, 5] });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release(); // ramp step 0: "Of my grandfather"
    await flush();
    expect(h.calls.map((c) => c.priority)).toEqual(["request", "prefetch"]);
    expect(h.calls[1].text).toBe("Verus I have learned to"); // the step-1 prefetch, held: a long generation still running
    run(h, 0.8); // chunk 0 plays out (0.575 s): a gap, nothing scheduled ahead
    h.engine.pause();
    const epoch = h.engine.getSnapshot().epoch;
    h.engine.resume();
    await flush();
    expect(h.calls).toHaveLength(3); // the resume asked for a chunk; it did not wait behind the stale prefetch
    expect(h.calls[2].text).toBe("Verus I have"); // ramp step 0 from the first word not yet heard
    expect(h.calls[2].priority).toBe("request");
    expect(h.calls[2].group).not.toBe(h.calls[1].group); // a new epoch, so the producer drops older queued prefetch
    expect(h.engine.getSnapshot().epoch).toBeGreaterThan(epoch);
    expect(h.producer.requests[1].settled).toBe(false); // the old generation is still running, not waited for
    h.producer.requests[1].release(); // it arrives late
    await flush();
    expect(h.output.sources).toHaveLength(1); // dropped as stale, never scheduled
    expect(h.diagnostics.some((d) => d.startsWith("narrate:stale-result"))).toBe(true);
    h.producer.requests[2].release();
    await flush();
    expect(h.calls[3]).toMatchObject({ text: "learned to be gentle and", priority: "prefetch" }); // the ramp goes on from step 1
    run(h, 0.5);
    expect(h.cursor).toEqual([0, 1, 2, 3, 4, 5]); // speech continues at word 3: none skipped, none repeated
    expect(h.output.overlaps()).toEqual([]);
  });

  it("a resume that replays audio never regenerates: paused inside a chunk with the prefetch still generating", async () => {
    const h = harness({ hold: true, chunkRamp: [3, 5] });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    run(h, 0.03 + WORD_S * 1.5); // inside word 1; the step-1 prefetch is held
    h.engine.pause();
    const epoch = h.engine.getSnapshot().epoch;
    h.engine.resume();
    await flush();
    expect(h.calls).toHaveLength(2); // nothing asked again, nothing abandoned
    expect(h.engine.getSnapshot().epoch).toBe(epoch);
    h.producer.requests[1].release(); // the prefetch arrives and follows the replayed audio
    await flush();
    run(h, 1.0);
    expect(h.cursor).toEqual([...Array(h.cursor.length).keys()]);
    expect(h.cursor.at(-1)).toBeGreaterThanOrEqual(5);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("a resume while the request's own first chunk is still generating keeps it: no second request, and the ramp goes on from step 1", async () => {
    const h = harness({ hold: true, chunkRamp: [3, 5] });
    h.engine.play(0);
    await flush();
    h.engine.pause(); // before anything arrived: nothing to replay
    h.engine.resume();
    await flush();
    expect(h.calls).toHaveLength(1); // the in-flight chunk is already the request's step 0
    expect(h.calls[0]).toMatchObject({ text: "Of my grandfather", priority: "request" });
    h.producer.requests[0].release();
    await flush();
    expect(h.calls[1]).toMatchObject({ text: "Verus I have learned to", priority: "prefetch" }); // not a second step 0 labeled request
    run(h, 0.3);
    expect(h.cursor[0]).toBe(0);
    expect(h.output.sources).toHaveLength(1); // the step-1 prefetch is held
    expect(h.output.overlaps()).toEqual([]);
  });

  it("prefetch by seconds keeps that much audio scheduled ahead, however short the chunks (Decision #18)", async () => {
    const h = harness({ prefetchSeconds: 3, chunkRamp: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }); // one-word chunks, 0.2 s each
    h.engine.play(0);
    for (let i = 0; i < 40; i++) await flush();
    const ahead = Math.max(...h.output.sources.map((s) => s.startAt + (s.samples - s.offset) / SAMPLE_RATE)) - h.output.now();
    expect(ahead).toBeGreaterThanOrEqual(3);
    expect(h.producer.requests.length).toBeGreaterThan(10); // far more than one chunk ahead
    run(h, 1.0);
    await flush();
    const after = Math.max(...h.output.sources.map((s) => s.startAt + (s.samples - s.offset) / SAMPLE_RATE)) - h.output.now();
    expect(after).toBeGreaterThanOrEqual(2.8); // topped up as it plays
    expect(h.output.overlaps()).toEqual([]);
  });

  it("a speed change in a gap (the next chunk still generating) regenerates from that chunk's first word: none skipped", async () => {
    const h = harness({ hold: true });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release(); // words 0-11
    await flush();
    expect(h.producer.requests).toHaveLength(2); // words 12.. generating, held
    run(h, 0.03 + 12 * WORD_S + 0.2); // the first chunk plays out: a gap
    h.engine.setSpeed(1.5);
    await flush();
    const last = h.producer.requests.at(-1)!;
    expect(last.speed).toBe(1.5);
    expect(last.text.startsWith("Of my mother")).toBe(true); // word 12, not past the abandoned chunk
  });

  it("the cursor is the unit at the current playback sample, published once per change, in order", async () => {
    const h = harness();
    h.engine.play(0);
    await flush();
    run(h, 0.03 + WORD_S * 3 + 0.01);
    expect(h.cursor).toEqual([0, 1, 2, 3]);
    run(h, WORD_S * 9);
    expect(h.cursor).toEqual([...Array(12).keys()]);
    // The playhead crossed into the second chunk (already scheduled contiguously): the handoff is the same lookup.
    run(h, 0.5);
    expect(h.cursor.slice(12, 14)).toEqual([12, 13]);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("R6: silence between chunks holds the last word; the next chunk starts when it is ready, never early", async () => {
    const h = harness({ hold: true });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    run(h, 0.03 + WORD_S * 12 + 0.5); // past the end of chunk 1; chunk 2 is still held
    expect(h.cursor.at(-1)).toBe(11);
    expect(h.states).toEqual(["playing"]);
    const t = h.output.now();
    h.producer.requests[1].release();
    await flush();
    const second = h.output.sources[1];
    expect(second.startAt).toBeGreaterThanOrEqual(t); // scheduled at now + lead, after a recorded gap
    expect(h.diagnostics.some((d) => d.startsWith("narrate:gap"))).toBe(true);
    run(h, 0.03 + 0.01);
    expect(h.cursor.at(-1)).toBe(12);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("pause stops at the exact sample and resume continues from it: no word repeated, none dropped, no overlap", async () => {
    const h = harness();
    h.engine.play(0);
    await flush();
    run(h, 0.03 + WORD_S * 2.5); // mid-word 2
    expect(h.cursor.at(-1)).toBe(2);
    const pausedAt = h.output.now();
    h.engine.pause();
    expect(h.states.at(-1)).toBe("paused");
    const played = h.output.playedSampleRanges();
    expect(played).toHaveLength(1);
    const pausedSample = played[0].to;
    expect(pausedSample).toBeCloseTo(2 * SPF + Math.round((pausedAt - 0.03) * SAMPLE_RATE), -1);
    run(h, 1.0);
    expect(h.cursor.at(-1)).toBe(2); // nothing moves while paused
    h.engine.resume();
    expect(h.states.at(-1)).toBe("playing");
    const resumed = h.output.sources[h.output.sources.length - 2]; // chunk 1 rescheduled, then chunk 2
    expect(resumed.offset).toBe(pausedSample);
    run(h, 0.03 + 0.01);
    expect(h.cursor.at(-1)).toBe(2); // the same word continues
    run(h, WORD_S * 10);
    expect(h.cursor).toEqual([...Array(h.cursor.length).keys()]); // strictly ascending by one: no repeat, no drop
    expect(h.output.overlaps()).toEqual([]);
    // The union of sounded sample ranges of chunk 1's PCM is contiguous: [trim, pausedSample) + [pausedSample, end)
    const ranges = h.output.playedSampleRanges().filter((r) => r.pcm === h.output.sources[0].pcm).sort((a, b) => a.from - b.from);
    expect(ranges[0].from).toBe(2 * SPF);
    expect(ranges[1].from).toBe(ranges[0].to);
  });

  it("a click mid-word restarts from the clicked word in a new epoch; the old chunk is stopped and a stale result is dropped", async () => {
    const h = harness({ hold: true });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    run(h, 0.03 + WORD_S * 1.5);
    expect(h.producer.requests).toHaveLength(2); // chunk 2 in flight (held)
    h.engine.play(21); // click "and" (word 21: "… religious, and bountiful; …")
    await flush();
    expect(h.output.sources[0].stopAt).toBeCloseTo(h.output.now(), 6); // the old source is cancelled now
    expect(h.producer.requests).toHaveLength(3);
    expect(h.producer.requests[2].text.startsWith("and bountiful;")).toBe(true);
    h.producer.requests[1].release(); // the superseded chunk-2 result arrives late
    await flush();
    expect(h.output.sources).toHaveLength(1); // not scheduled
    expect(h.diagnostics.some((d) => d.startsWith("narrate:stale-result"))).toBe(true);
    h.producer.requests[2].release();
    await flush();
    expect(h.output.sources).toHaveLength(2);
    run(h, 0.03 + 0.01);
    expect(h.cursor.at(-1)).toBe(21);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("R7: a speed change finishes the unit in progress at the old speed and starts the next word at the new speed, with no overlap", async () => {
    const h = harness();
    h.engine.play(0);
    await flush();
    run(h, 0.03 + WORD_S * 4.4); // inside word 4
    expect(h.cursor.at(-1)).toBe(4);
    h.engine.setSpeed(2.0);
    await flush();
    const first = h.output.sources[0];
    const wordEnd = first.startAt + ((2 + 5 * FRAMES) * SPF - first.offset) / SAMPLE_RATE; // end of word 4's frames
    expect(first.stopAt).toBeCloseTo(wordEnd, 9);
    const regen = h.producer.requests.at(-1)!;
    expect(regen.speed).toBe(2.0);
    expect(regen.text.startsWith("have learned to be gentle")).toBe(true); // the next unplayed word after "I" (word 4)
    const next = h.output.sources.at(-1)!;
    expect(next.startAt).toBeGreaterThanOrEqual(wordEnd - 1e-9);
    run(h, WORD_S * 0.5); // still inside word 4, which finishes at the old speed
    expect(h.cursor.at(-1)).toBe(4);
    run(h, WORD_S * 0.2 + (FRAMES / 2) * SPF / SAMPLE_RATE); // word 4 ends; one word at 2.00x is half as long
    expect(h.cursor.at(-1)).toBeGreaterThanOrEqual(5);
    run(h, 2);
    expect(h.cursor).toEqual([...Array(h.cursor.length).keys()]);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("rapid speed changes coalesce on the latest speed with one regeneration in flight; a superseded result is regenerated, not played", async () => {
    const h = harness({ hold: true });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    run(h, 0.03 + WORD_S * 1.5);
    const before = h.producer.requests.length;
    h.engine.setSpeed(1.2);
    h.engine.setSpeed(1.4);
    h.engine.setSpeed(1.6);
    await flush();
    expect(h.producer.requests.length - before).toBe(1); // one regeneration for three changes
    const regen = h.producer.requests.at(-1)!;
    expect(regen.speed).toBe(1.2); // requested at the first change …
    regen.release();
    await flush();
    const again = h.producer.requests.at(-1)!;
    expect(again.speed).toBe(1.6); // … superseded on arrival and re-requested at the latest speed
    expect(h.output.sources).toHaveLength(1); // nothing at 1.2 was scheduled
    again.release();
    await flush();
    expect(h.output.sources).toHaveLength(2);
    expect(h.engine.getSnapshot().speed).toBe(1.6);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("completes at the end of the words and stops cleanly", async () => {
    const h = harness();
    h.engine.play(WORDS.length - 3);
    await flush();
    run(h, 0.03 + WORD_S * 3 + 0.3);
    expect(h.complete).toHaveBeenCalledTimes(1);
    expect(h.states.at(-1)).toBe("stopped");
    h.engine.stop();
    expect(h.engine.getSnapshot().state).toBe("stopped");
  });
});

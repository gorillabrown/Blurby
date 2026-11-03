// NARRATE-PAUSE-CANCEL-1 — a pause asks the producer to cancel this engine's queued Kokoro jobs; a cancelled prefetch
// is a rewind, not a failure, so the resume regenerates it from its first word; a chunk that arrived during the pause
// is kept; any other producer error is still F4; the cancel error is one string in main and in the renderer (k1).
import { createRequire } from "module";
import { describe, expect, it, vi } from "vitest";
import * as K from "../../src/constants";
import { NarrateEngine, type EngineFailure, type EngineState, type ProducerPort } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF } from "./harness/fakeProducer";
import { FIRST_CHUNK_MAX_WORDS } from "../../src/reader/modes/narrate/engine/chunkPlan";

const WORDS = "Of my grandfather Verus I have learned to be gentle and meek. Of my mother I have learned to be religious, and bountiful; not only to do, but to intend any evil. Of my great grandfather I have learned to be frugal."
  .split(" ");
const FRAMES = 8; // 200 ms per word at 1.00x in the fake

// harness(), flush and run as tests/narrate/narrate.engine.test.ts:15-39, with one change: the port carries a
// cancelQueued spy and is built without a ProducerPort annotation, so this file typechecks before the port has it.
function harness(options: { hold?: boolean; words?: readonly string[] } = {}) {
  const output = new FakeAudioOutput();
  const producer = new FakeProducer({ hold: options.hold ?? false, framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 });
  const cursor: number[] = [];
  const states: EngineState[] = [];
  const failures: EngineFailure[] = [];
  const diagnostics: string[] = [];
  const complete = vi.fn();
  const calls: Array<{ text: string; priority?: string; group?: string }> = [];
  const cancelQueued = vi.fn();
  const port = { generate: (r: Parameters<ProducerPort["generate"]>[0]) => { calls.push({ text: r.text, priority: r.priority, group: r.group }); return producer.generate(r); }, cancelQueued };
  const engine = new NarrateEngine({
    words: options.words ?? WORDS, producer: port, output, voice: "af_bella", speed: 1.0, prefetch: 1, leadSeconds: 0.03,
    events: { onCursor: (w) => cursor.push(w), onState: (s) => states.push(s), onFailure: (f) => failures.push(f), onComplete: complete, onDiagnostic: (k, d) => diagnostics.push(`${k}: ${d}`) },
  });
  return { engine, output, producer, calls, cancelQueued, cursor, states, failures, diagnostics, complete };
}

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

/** Advance the fake clock in display-frame steps, ticking the engine each step. */
function run(h: ReturnType<typeof harness>, seconds: number, step = 1 / 60): void {
  const steps = Math.round(seconds / step);
  for (let i = 0; i < steps; i++) { h.output.advance(step); h.engine.tick(); }
}

/** Playing, the first chunk released and scheduled, the prefetch ("Of my mother …") held in the producer; then pause. */
async function pausedWithPrefetchHeld() {
  const h = harness({ hold: true });
  h.engine.play(0);
  await flush();
  h.producer.requests[0].release();
  await flush();
  expect(h.producer.requests).toHaveLength(2);
  expect(h.calls[1].text.startsWith("Of my mother")).toBe(true);
  // RC-INTEGRATION-WINDOW (standing rule 50): under sentence-start resume (NARRATE-SENTENCE-RESUME-1, owner 2026-10-14)
  // only a pause on a sentence's first word resumes where it paused; chunk A is one sentence, so pause inside word 0,
  // after the trim (mid-unit, not the leading silence).
  run(h, 0.1);
  const srcA = h.output.sources[0];
  const pausedSample = Math.floor((h.output.playbackPosition() - srcA.startAt) * SAMPLE_RATE) + srcA.offset;
  expect(pausedSample).toBeGreaterThan(srcA.offset);
  expect(pausedSample).toBeLessThan(srcA.offset + FRAMES * SPF); // inside word 0
  h.engine.pause();
  return h;
}

/** Consecutive cursor values never repeat and never skip a word. */
function contiguous(cursor: number[]): boolean {
  return cursor.every((w, i) => i === 0 || w === cursor[i - 1] + 1);
}

describe("pause cancels queued producer work (NARRATE-PAUSE-CANCEL-1)", () => {
  it("(e1) pause asks the producer to cancel this engine's queued jobs", async () => {
    const h = await pausedWithPrefetchHeld();
    const group = h.calls.at(-1)!.group!;
    expect(h.cancelQueued).toHaveBeenCalledTimes(1);
    expect(h.cancelQueued).toHaveBeenCalledWith(group.slice(0, group.indexOf(":") + 1));
  });

  it("(e2) a cancelled prefetch rewinds, and the resume regenerates it from its first word", async () => {
    const h = await pausedWithPrefetchHeld();
    h.producer.requests[1].fail("narrate generation cancelled");
    await flush();
    expect(h.failures).toEqual([]);
    expect(h.states.at(-1)).toBe("paused");
    h.engine.resume();
    await flush();
    run(h, 0.5);
    expect(h.producer.requests.length).toBeGreaterThanOrEqual(3);
    expect(h.calls[2].text.startsWith("Of my mother")).toBe(true); // the cancelled chunk's first word, by text (LL-161)
    expect(contiguous(h.cursor)).toBe(true);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("(e3) a chunk that arrived while paused is kept and played without regeneration", async () => {
    const h = await pausedWithPrefetchHeld();
    h.producer.requests[1].release();
    await flush();
    h.engine.resume();
    await flush();
    // 3 s, not the spec's 0.5 s: at 200 ms a word, word 12 (the kept chunk's first) is heard about 2.4 s in.
    run(h, 3);
    expect(h.calls.slice(2).some((c) => c.text.startsWith("Of my mother"))).toBe(false);
    expect(h.cursor).toContain(12);
    expect(contiguous(h.cursor)).toBe(true);
  });

  it("(e3m) a chunk that arrived while paused but begins mid-sentence replays the sentence from its first word (new epoch)", async () => {
    // The first sentence is longer than the first chunk's cap, so chunk A is cut mid-sentence and chunk B continues it.
    const LONG_SENTENCE_WORDS = FIRST_CHUNK_MAX_WORDS + 5;
    const words = ["Of", ...Array.from({ length: LONG_SENTENCE_WORDS - 2 }, (_, i) => `word${i}`), "end.", ...WORDS.slice(12)];
    const h = harness({ hold: true, words });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    const srcA = h.output.sources[0];
    expect(srcA.samples / SPF).toBe(FIRST_CHUNK_MAX_WORDS * FRAMES + 3); // A holds the first FIRST_CHUNK_MAX_WORDS words
    run(h, (srcA.samples - srcA.offset) / SAMPLE_RATE + 0.3); // A has played out; B is held: the pause is in the gap
    h.engine.pause();
    expect(h.calls[1].text.startsWith(words[FIRST_CHUNK_MAX_WORDS])).toBe(true); // B begins mid-sentence
    h.producer.requests[1].release(); // B arrives while paused
    await flush();
    const callsBefore = h.calls.length;
    const cursorBefore = h.cursor.length;
    h.engine.resume();
    await flush();
    for (const r of h.producer.requests) if (!r.settled) { r.release(); await flush(); }
    run(h, 1);
    expect(h.calls[callsBefore].text.startsWith(words[0])).toBe(true); // regenerated from the sentence's first word
    const after = h.cursor.slice(cursorBefore);
    expect(after[0]).toBe(0);
    expect(words[after[0]]).toBe("Of"); // by text (LL-161)
  });

  it("(e4) any other producer error is still F4", async () => {
    const h = await pausedWithPrefetchHeld();
    h.producer.requests[1].fail("boom");
    await flush();
    expect(h.failures).toHaveLength(1);
    expect(h.failures[0].reason).toBe("producer-error");
  });

  it("(k1) the cancel error is one string in main and renderer", () => {
    const mainC = createRequire(import.meta.url)("../../main/narrate/constants.js");
    expect((K as Record<string, unknown>).NARRATE_CANCELLED_ERROR).toBe("narrate generation cancelled");
    expect(mainC.NARRATE_CANCELLED_ERROR).toBe("narrate generation cancelled");
  });
});

// NARRATE-QUIT-LINGER-1 (BUG-207) — a pause cancels the engine's jobs queued in main and not yet posted to a worker,
// so no Kokoro generation starts in a paused Narrate. A cancelled chunk rewinds the engine to its first word (it is
// planned again on resume), never fails it; a chunk that arrived during the pause is kept; any other producer error is
// still F4. The cancel message is one constant in main and the renderer (k1).
import { createRequire } from "module";
import { describe, expect, it, vi } from "vitest";
import * as rendererConstants from "../../src/constants";
import { NarrateEngine, type EngineFailure, type EngineState } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF } from "./harness/fakeProducer";

const require = createRequire(import.meta.url);
const WORDS = "Of my grandfather Verus I have learned to be gentle and meek. Of my mother I have learned to be religious, and bountiful; not only to do, but to intend any evil. Of my great grandfather I have learned to be frugal."
  .split(" ");
const FRAMES = 8; // 200 ms per word at 1.00x in the fake
const WORD_S = (FRAMES * SPF) / SAMPLE_RATE;
const CANCELLED = "narrate generation cancelled";

// The harness() of tests/narrate/narrate.engine.test.ts, with a port that also carries cancelQueued.
function harness(options: { hold?: boolean; framesPerWord?: number; prefetch?: number; prefetchSeconds?: number; chunkRamp?: readonly number[] } = {}) {
  const output = new FakeAudioOutput();
  const producer = new FakeProducer({ hold: options.hold ?? false, framesPerWord: options.framesPerWord ?? FRAMES, leadFrames: 2, tailFrames: 1 });
  const cursor: number[] = [];
  const states: EngineState[] = [];
  const failures: EngineFailure[] = [];
  const diagnostics: string[] = [];
  const complete = vi.fn();
  const calls: Array<{ text: string; priority?: string; group?: string }> = [];
  const cancelQueued = vi.fn();
  const port = { generate: (r: Parameters<FakeProducer["generate"]>[0] & { priority?: string; group?: string }) => { calls.push({ text: r.text, priority: r.priority, group: r.group }); return producer.generate(r); }, cancelQueued };
  const engine = new NarrateEngine({
    words: WORDS, producer: port, output, voice: "af_bella", speed: 1.0, prefetch: options.prefetch ?? 1, prefetchSeconds: options.prefetchSeconds, leadSeconds: 0.03, chunkRamp: options.chunkRamp,
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

/** Play from 0, release the first sentence, and pause inside it with the prefetch (from word 12) requested and held. */
async function pausedWithHeldPrefetch() {
  const h = harness({ hold: true });
  h.engine.play(0);
  await flush();
  h.producer.requests[0].release(); // words 0-11
  await flush();
  expect(h.calls).toHaveLength(2); // the prefetch of the second sentence, held
  expect(h.calls[1].text.startsWith("Of my mother")).toBe(true);
  run(h, 0.03 + WORD_S * 2.5); // inside word 2
  h.engine.pause();
  return h;
}

describe("pause cancels queued work (NARRATE-QUIT-LINGER-1)", () => {
  it("(e1) a pause asks the producer to cancel the engine's queued jobs, by its group prefix", async () => {
    const h = await pausedWithHeldPrefetch();
    const group = h.calls.at(-1)!.group!;
    expect(h.cancelQueued).toHaveBeenCalledTimes(1);
    expect(h.cancelQueued).toHaveBeenCalledWith(group.slice(0, group.indexOf(":") + 1));
  });

  it("(e2) a cancelled prefetch is not a failure: the engine stays paused and plans it again on resume, from its first word", async () => {
    const h = await pausedWithHeldPrefetch();
    h.producer.requests[1].fail(CANCELLED);
    await flush();
    expect(h.failures).toEqual([]);
    expect(h.states.at(-1)).toBe("paused");
    h.engine.resume();
    await flush();
    run(h, 0.5);
    await flush();
    expect(h.calls).toHaveLength(3); // a new generate for the cancelled chunk
    expect(h.calls[2].text.startsWith(WORDS.slice(12, 15).join(" "))).toBe(true); // from its first word, "Of my mother"
    expect(h.failures).toEqual([]);
  });

  it("(e3) control: a chunk released while paused is kept, played after resume with no new generate, no repeat or skip", async () => {
    const h = await pausedWithHeldPrefetch();
    h.producer.requests[1].release(); // it arrives while paused
    await flush();
    h.engine.resume();
    await flush();
    run(h, 0.5);
    await flush();
    h.producer.setHold(false);
    h.producer.requests.slice(2).forEach((r) => r.release());
    run(h, WORD_S * 14);
    await flush();
    expect(h.calls.filter((c) => c.text.startsWith("Of my mother"))).toHaveLength(1); // never generated again
    expect(h.cursor).toContain(12);
    expect(h.cursor).toEqual([...Array(h.cursor.length).keys()]); // strictly ascending by one
    expect(h.failures).toEqual([]);
    expect(h.output.overlaps()).toEqual([]);
  });

  it("(e4) control: any other producer error on a held prefetch is still one F4 producer-error", async () => {
    const h = harness({ hold: true });
    h.engine.play(0);
    await flush();
    h.producer.requests[0].release();
    await flush();
    h.producer.requests[1].fail("boom");
    await flush();
    expect(h.failures).toHaveLength(1);
    expect(h.failures[0]).toMatchObject({ kind: "F4", reason: "producer-error", detail: "boom" });
  });

  it("(k1) the cancel message is one constant in main and the renderer", () => {
    const main = require("../../main/narrate/constants.js").NARRATE_CANCELLED_ERROR;
    const renderer = (rendererConstants as Record<string, unknown>).NARRATE_CANCELLED_ERROR;
    expect(main).toBe(renderer);
    expect(renderer).toBe("narrate generation cancelled");
  });
});

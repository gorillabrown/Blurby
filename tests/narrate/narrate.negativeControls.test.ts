// NARRATE-REBUILD-1 P3 — D4 negative controls through the full path (producer result -> engine -> cursor):
// a missing table, a native-labelled table that does not match its words or its audio, and a fabricated,
// structurally valid, weight-shaped table each fail closed (F4): the chunk is never scheduled, narration pauses
// on the last exactly-timed word, a diagnostic names the rejection, and nothing is recorded as native.
// The last test is the positive control (LL-151, standing rule 43): with the trust gate bypassed, the forged table
// would be scheduled — which proves these assertions can fail and that the gate is what rejects it.
import { describe, expect, it, vi } from "vitest";
import { NarrateEngine, type EngineFailure, type EngineState } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF, type ControlKind } from "./harness/fakeProducer";

const WORDS = "Of my grandfather Verus I have learned to be gentle and meek. Of my mother I have learned to be religious, and bountiful; not only to do, but to intend any evil."
  .split(" ");
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

function harness(controls: ControlKind[]) {
  const output = new FakeAudioOutput();
  const producer = new FakeProducer({ framesPerWord: 8, leadFrames: 2, tailFrames: 1 });
  for (const c of controls) producer.nextControl(c);
  const cursor: number[] = [];
  const states: EngineState[] = [];
  const failures: EngineFailure[] = [];
  const diagnostics: string[] = [];
  const engine = new NarrateEngine({
    words: WORDS, producer, output, voice: "af_bella", speed: 1.0, prefetch: 1, leadSeconds: 0.03,
    events: { onCursor: (w) => cursor.push(w), onState: (s) => states.push(s), onFailure: (f) => failures.push(f), onComplete: () => {}, onDiagnostic: (k, d) => diagnostics.push(`${k}: ${d}`) },
  });
  return { engine, output, producer, cursor, states, failures, diagnostics };
}

function run(h: ReturnType<typeof harness>, seconds: number, step = 1 / 60): void {
  for (let i = 0; i < Math.round(seconds / step); i++) { h.output.advance(step); h.engine.tick(); }
}

const WORD_S = (8 * SPF) / SAMPLE_RATE;

describe("narrate F4 negative controls (D4)", () => {
  it.each([
    ["missing-table", "missing-table"],
    ["mismatch-words", "words-mismatch"],
    ["mismatch-audio", "law"],
    ["fabricated-weights", "provenance-not-native"],
  ] as const)("first chunk: %s is never scheduled, the engine pauses without a cursor, reason %s", async (control, reason) => {
    const h = harness([control]);
    h.engine.play(0);
    await flush();
    expect(h.output.sources).toHaveLength(0);
    expect(h.failures).toEqual([{ kind: "F4", reason, atWord: 0 }]);
    expect(h.states).toEqual(["playing", "paused"]);
    expect(h.cursor).toEqual([]);
    expect(h.diagnostics.filter((d) => d.startsWith("narrate:table-rejected"))).toHaveLength(1);
    expect(h.diagnostics.some((d) => /native/i.test(d) && !/not-native/.test(d))).toBe(false); // nothing recorded as native
    run(h, 2);
    expect(h.output.sources).toHaveLength(0);
    expect(h.cursor).toEqual([]);
  });

  it("second chunk mismatched: the first plays out, the cursor holds its last word, then narration pauses on it", async () => {
    const h = harness(["ok", "mismatch-audio"]);
    h.engine.play(0);
    await flush();
    expect(h.output.sources).toHaveLength(1); // chunk 1 scheduled; chunk 2 rejected on arrival
    expect(h.failures).toEqual([{ kind: "F4", reason: "law", atWord: 12 }]);
    expect(h.states).toEqual(["playing"]); // audio already scheduled plays out first
    run(h, 0.03 + WORD_S * 12 + 0.1);
    expect(h.cursor.at(-1)).toBe(11);
    expect(h.states.at(-1)).toBe("paused");
    run(h, 2);
    expect(h.cursor.at(-1)).toBe(11);
    expect(h.output.sources).toHaveLength(1);
  });

  it("a weight-shaped table with a forged native label still fails: its units do not match the producer's words", async () => {
    // The forged table's structure is lawful and its provenance says native; the only thing it cannot fake is
    // correspondence with what was actually sent: here the fake producer's forged units drop the final word.
    const h = harness(["forged-native-weights"]);
    h.producer.nextControl("ok");
    const producerGenerate = h.producer.generate.bind(h.producer);
    h.producer.generate = async (req) => {
      const r = await producerGenerate(req);
      return { ...r, table: r.table && { ...r.table, units: r.table.units.slice(0, -1) } };
    };
    h.engine.play(0);
    await flush();
    expect(h.output.sources).toHaveLength(0);
    expect(h.failures[0]).toMatchObject({ kind: "F4", reason: "words-mismatch" });
  });

  it("a producer error is F4 too", async () => {
    const h = harness(["error"]);
    h.engine.play(0);
    await flush();
    expect(h.output.sources).toHaveLength(0);
    expect(h.failures).toEqual([{ kind: "F4", reason: "producer-error", atWord: 0, detail: "producer failed" }]);
    expect(h.states.at(-1)).toBe("paused");
  });

  it("positive control (LL-151): with the trust gate bypassed the fabricated table would play — the gate is what rejects it", async () => {
    vi.resetModules();
    vi.doMock("../../src/reader/modes/narrate/engine/wordTable", async (importOriginal) => {
      const original = await importOriginal<typeof import("../../src/reader/modes/narrate/engine/wordTable")>();
      return { ...original, verifyTable: () => ({ ok: true as const }) };
    });
    try {
      const { NarrateEngine: Bypassed } = await import("../../src/reader/modes/narrate/engine/narrateEngine");
      const output = new FakeAudioOutput();
      const producer = new FakeProducer({ framesPerWord: 8, leadFrames: 2, tailFrames: 1 });
      producer.nextControl("fabricated-weights");
      const failures: EngineFailure[] = [];
      const engine = new Bypassed({ words: WORDS, producer, output, voice: "af_bella", speed: 1.0, events: { onCursor: () => {}, onState: () => {}, onFailure: (f) => failures.push(f), onComplete: () => {} } });
      engine.play(0);
      await flush();
      expect(output.sources.length).toBeGreaterThanOrEqual(1); // the control reaches the clock when the gate is gone
      expect(failures).toEqual([]);
    } finally {
      vi.doUnmock("../../src/reader/modes/narrate/engine/wordTable");
      vi.resetModules();
    }
  });
});

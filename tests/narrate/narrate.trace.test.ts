// NARRATE-REBUILD-1 P5 — D3/D6 recorded output at the engine seam. Every commit carries its unit's table boundary
// on the playback clock and lands within one frame step after it; a request (play, resume, click, speed) is closed
// by the first chunk scheduled after it, with the latency on the same clock; schedules and stops describe every
// sounding interval. Fake clock (no output latency), fake producer with lawful tables; nothing here is estimated.
import { describe, expect, it, vi } from "vitest";
import { NarrateEngine, type EngineFailure, type EngineTraceEvent } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF } from "./harness/fakeProducer";

const WORDS = "Of my grandfather Verus I have learned to be gentle and meek. Of my mother I have learned to be religious, and bountiful; not only to do, but to intend any evil. Of my great grandfather I have learned to be frugal."
  .split(" ");
const FRAMES = 8; // 200 ms per word at 1.00x in the fake
const WORD_S = (FRAMES * SPF) / SAMPLE_RATE;
const LEAD = 0.03;
const STEP = 1 / 60;

type Of<K extends EngineTraceEvent["kind"]> = Extract<EngineTraceEvent, { kind: K }>;

function harness(options: { trace?: boolean } = {}) {
  const output = new FakeAudioOutput();
  const producer = new FakeProducer({ framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 });
  const trace: EngineTraceEvent[] = [];
  const cursor: number[] = [];
  const failures: EngineFailure[] = [];
  const engine = new NarrateEngine({
    words: WORDS, producer, output, voice: "af_bella", speed: 1.0, leadSeconds: LEAD,
    events: {
      onCursor: (w) => cursor.push(w), onState: () => {}, onFailure: (f) => failures.push(f), onComplete: vi.fn(),
      ...(options.trace === false ? {} : { onTrace: (e) => trace.push(e) }),
    },
  });
  const of = <K extends EngineTraceEvent["kind"]>(kind: K) => trace.filter((e): e is Of<K> => e.kind === kind);
  return { engine, output, producer, trace, cursor, failures, of };
}

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
function run(h: ReturnType<typeof harness>, seconds: number): void {
  const n = Math.round(seconds / STEP);
  for (let i = 0; i < n; i++) { h.output.advance(STEP); h.engine.tick(); }
}

describe("narrate recorded output (D3 at the engine seam)", () => {
  it("every commit carries its unit's table boundary on the playback clock and lands within one frame step after it", async () => {
    const h = harness();
    h.engine.play(0);
    await flush();
    run(h, 3);
    const commits = h.of("narrate-commit");
    const schedules = h.of("narrate-schedule");
    expect(commits.length).toBeGreaterThan(10);
    expect(schedules.length).toBeGreaterThanOrEqual(2);
    for (const c of commits) {
      const s = [...schedules].reverse().find((x) => x.chunkStart === c.chunkStart && x.startAt <= c.nowCtx + 1e-9);
      expect(s, `schedule for the commit at word ${c.word}`).toBeDefined();
      expect(c.word).toBe(s!.unitStarts[c.unit]);
      expect(c.boundaryCtx).toBeCloseTo(s!.unitBoundaryCtx[c.unit], 9);
      const late = c.nowCtx - c.boundaryCtx;
      expect(late, `word ${c.word} lateness`).toBeGreaterThanOrEqual(-1e-9);
      expect(late, `word ${c.word} lateness`).toBeLessThanOrEqual(STEP + 1e-9);
      expect(c.headCtx).toBe(c.nowCtx); // the fake has no output latency
      expect(c.otsCtx).toBe(c.nowCtx);
      expect(c.otsPerf).toBeCloseTo(c.nowCtx * 1000, 6);
      expect(c.speed).toBe(1);
      expect(c.epoch).toBe(schedules[0].epoch);
    }
    // One record per cursor change, in order, equal to the cursor events; the frame interval is recorded from the second tick on.
    expect(commits.map((c) => c.word)).toEqual(h.cursor);
    expect(commits.slice(1).every((c, i) => typeof c.frameDt === "number" && c.frameDt >= 0 && commits[i].t <= c.t)).toBe(true);
  });

  it("each request is closed by the first chunk scheduled after it, with the latency on the playback clock: play, resume, click, speed", async () => {
    const h = harness();
    h.engine.play(0, "play");
    expect(h.of("narrate-request")).toEqual([expect.objectContaining({ cause: "play", word: 0, speed: 1, ctxAtRequest: 0, otsCtx: 0, otsPerf: 0 })]);
    await flush();
    expect(h.of("narrate-first-voiced")).toHaveLength(1);
    expect(h.of("narrate-first-voiced")[0]).toMatchObject({ cause: "play", word: 0, speed: 1, ctxAtRequest: 0, startAt: LEAD, latencyS: LEAD, leadS: LEAD, trimSamples: 2 * SPF });
    run(h, 0.5);

    // Pause at the heard sample: every sounding source stops now (the chunk playing and its prefetched successor).
    h.engine.pause();
    const pauseStops = h.of("narrate-stop").filter((s) => s.reason === "pause");
    expect(pauseStops.length).toBe(h.of("narrate-schedule").length);
    expect(pauseStops.every((s) => Math.abs(s.at - 0.5) < 1e-9)).toBe(true);
    h.output.advance(1);
    h.engine.resume();
    expect(h.of("narrate-request").at(-1)).toMatchObject({ cause: "resume", ctxAtRequest: 1.5, word: h.cursor.at(-1) });
    const resumed = h.of("narrate-first-voiced").at(-1)!;
    expect(resumed).toMatchObject({ cause: "resume", word: h.cursor.at(-1) });
    expect(resumed.startAt).toBeCloseTo(1.5 + LEAD, 9);
    expect(resumed.latencyS).toBeCloseTo(LEAD, 9);
    run(h, 0.3);

    // Click: a fresh epoch; the old sources are dropped now; the new chunk's first sample answers the click.
    const tClick = h.output.now();
    h.engine.play(20, "click");
    expect(h.of("narrate-stop").filter((s) => s.reason === "drop").length).toBeGreaterThan(0);
    expect(h.of("narrate-request").at(-1)).toMatchObject({ cause: "click", word: 20, ctxAtRequest: tClick });
    await flush();
    const clicked = h.of("narrate-first-voiced").at(-1)!;
    expect(clicked).toMatchObject({ cause: "click", word: 20 });
    expect(clicked.startAt).toBeCloseTo(tClick + LEAD, 9);
    expect(clicked.latencyS).toBeCloseTo(LEAD, 9);
    run(h, 0.35); // inside the second unit of the click's chunk

    // Speed: the unit in progress finishes (its source stops at the unit's end); the next word answers at the new speed.
    const heard = h.cursor.at(-1)!;
    const tSpeed = h.output.now();
    h.engine.setSpeed(2.0);
    const stop = h.of("narrate-stop").filter((s) => s.reason === "speed").at(-1)!;
    expect(stop).toBeDefined();
    expect(h.of("narrate-stop").at(-1)!.reason).toBe("drop"); // the prefetched successor at the old speed is dropped
    expect(stop.at).toBeGreaterThan(tSpeed);
    expect(stop.at - tSpeed).toBeLessThanOrEqual(WORD_S + 1e-9);
    expect(h.of("narrate-request").at(-1)).toMatchObject({ cause: "speed", speed: 2, ctxAtRequest: tSpeed, word: heard + 1 });
    await flush();
    const atSpeed = h.of("narrate-first-voiced").at(-1)!;
    expect(atSpeed).toMatchObject({ cause: "speed", speed: 2, word: heard + 1 });
    expect(atSpeed.startAt).toBeCloseTo(stop.at, 9);
    expect(atSpeed.latencyS).toBeCloseTo(stop.at - tSpeed, 9);
    // Nothing voiced overlaps across the change: the next schedule starts exactly where the stopped unit ends.
    expect(h.of("narrate-schedule").at(-1)!.startAt).toBeCloseTo(stop.at, 9);
  });

  it("a refused chunk closes no request and schedules nothing; the next Play is a new request", async () => {
    const h = harness();
    h.producer.nextControl("missing-table");
    h.engine.play(0);
    await flush();
    expect(h.failures).toHaveLength(1);
    expect(h.of("narrate-first-voiced")).toEqual([]);
    expect(h.of("narrate-schedule")).toEqual([]);
    h.engine.play(0);
    await flush();
    expect(h.of("narrate-request")).toHaveLength(2);
    expect(h.of("narrate-first-voiced")).toHaveLength(1);
  });

  it("generation keeps the prefetch window full as chunks finish: a long text plays through, chunk after chunk", async () => {
    const output = new FakeAudioOutput();
    const producer = new FakeProducer({ framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 });
    const cursor: number[] = [];
    const schedules: number[] = [];
    const long = [...WORDS, ...WORDS, ...WORDS, ...WORDS]; // 12 sentences, well past two chunks
    const engine = new NarrateEngine({
      words: long, producer, output, voice: "af_bella", speed: 1.0, leadSeconds: LEAD,
      events: { onCursor: (w) => cursor.push(w), onState: () => {}, onFailure: () => {}, onComplete: vi.fn(), onTrace: (e) => { if (e.kind === "narrate-schedule") schedules.push(e.chunkStart); } },
    });
    engine.play(0);
    for (let i = 0; i < Math.round(25 / STEP); i++) { output.advance(STEP); engine.tick(); await Promise.resolve(); }
    // 25 s at 0.2 s per word reaches past word 110; every chunk up to there was requested, scheduled and played.
    expect(cursor.at(-1)).toBeGreaterThan(110);
    expect(producer.requests.length).toBeGreaterThanOrEqual(3);
    expect(schedules.length).toBe(producer.requests.length);
    expect(cursor).toEqual([...new Set(cursor)]); // never a repeat
    for (let i = 1; i < cursor.length; i++) expect(cursor[i]).toBeGreaterThan(cursor[i - 1]);
  });

  it("without a trace listener the engine plays the same and builds no record", async () => {
    const h = harness({ trace: false });
    h.engine.play(0);
    await flush();
    run(h, 1);
    expect(h.cursor.length).toBeGreaterThan(3);
    expect(h.trace).toEqual([]);
  });
});

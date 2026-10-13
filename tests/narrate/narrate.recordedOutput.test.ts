// NARRATE-REBUILD-1 P5 — the D3 check script's analysis over a recorded session, and its positive controls.
// A real engine on the fake clock plays a 1,600-word text for more than five simulated minutes at 60 Hz, with
// performance.now bound to the same clock so the frame interval and the timestamp pair are consistent; the
// analysis must PASS, and each planted defect (a late commit, a broken clock mapping, a short session, an overlap,
// a dropped unit, a repeated unit) must be caught — a check that cannot fail proves nothing (LL-151).
import { afterEach, describe, expect, it, vi } from "vitest";
import { NarrateEngine, type EngineTraceEvent } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer } from "./harness/fakeProducer";
import { analyze, maxLineResidual, soundingIntervals, MAPPING_LIMIT_MS } from "../../scripts/narrate-rebuild/p5-recorded-output-check.mjs";

const STEP = 1 / 60;
const FRAMES = 8;
const WORDS = Array.from({ length: 1600 }, (_, i) => (i % 12 === 11 ? `w${i}.` : `w${i}`));

type Rec = Record<string, unknown> & { kind: string };
interface Analysis {
  readonly verdict: "PASS" | "FAIL" | "INCONCLUSIVE";
  readonly failures: string[];
  readonly holds: string[];
  readonly stats: Record<string, number | null | number[] | Record<string, number>> & { latency: Record<string, number> };
  readonly outside: unknown[];
}
const run = (events: Rec[], options?: { minMinutes?: number }): Analysis => analyze(events, options) as unknown as Analysis;
const commitsOf = (events: Rec[]) => events.filter((e) => e.kind === "narrate-commit") as unknown as (Rec & { t: number; otsPerf: number; word: number })[];

async function record(seconds: number, speed = 1.0): Promise<Rec[]> {
  const output = new FakeAudioOutput();
  const spy = vi.spyOn(performance, "now").mockImplementation(() => output.now() * 1000);
  try {
    const producer = new FakeProducer({ framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 });
    const trace: EngineTraceEvent[] = [];
    const engine = new NarrateEngine({
      words: WORDS, producer, output, voice: "af_bella", speed, leadSeconds: 0.03,
      events: { onCursor: () => {}, onState: () => {}, onFailure: () => {}, onComplete: () => {}, onTrace: (e) => trace.push(e) },
    });
    engine.play(0);
    await Promise.resolve();
    const steps = Math.round(seconds / STEP);
    for (let i = 0; i < steps; i++) {
      output.advance(STEP);
      engine.tick();
      await Promise.resolve(); // the fake producer resolves on the microtask queue: let prefetched results arrive
    }
    engine.stop();
    return trace.map((e) => ({ ...e })) as Rec[];
  } finally {
    spy.mockRestore();
  }
}

describe("p5-recorded-output-check analysis (D3, D5 in the app)", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("passes a five-minute recorded session and reports its refresh interval and clock mapping", async () => {
    const events = await record(5.2 * 60);
    const r = run(events, { minMinutes: 5 });
    expect(r.failures).toEqual([]);
    expect(r.holds).toEqual([]);
    expect(r.verdict).toBe("PASS");
    expect(r.stats.commits).toBeGreaterThan(1000);
    expect(r.stats.refreshMs).toBeCloseTo(STEP * 1000, 1);
    expect(r.stats.mappingSpreadMs).toBeLessThanOrEqual(0.01);
    expect(r.stats.outside).toBe(0);
    expect(r.stats.overlaps).toBe(0);
    expect(r.stats.drops).toBe(0);
    expect(r.stats.repeats).toBe(0);
    expect(r.stats.fullChunks).toBeGreaterThan(20); // many chunk handoffs; later chunks pack whole sentences (T2)
    expect(r.stats.latency.play).toBe(30);
  }, 60_000);

  it("catches a late commit, a broken clock mapping, a short session, an overlap, a drop and a repeat (positive controls)", async () => {
    const events = await record(5.2 * 60);
    expect(commitsOf(events).length).toBeGreaterThan(1000);

    // A commit 40 ms after its frame: outside one refresh interval.
    const late = structuredClone(events);
    commitsOf(late)[0].t += 40;
    const r1 = run(late);
    expect(r1.verdict).toBe("FAIL");
    expect(r1.stats.outside).toBe(1);

    // A clock mapping that jumps by 40 ms for half the session: INCONCLUSIVE, never a pass.
    const jumpy = structuredClone(events);
    const cs = commitsOf(jumpy);
    for (const c of cs.slice(Math.floor(cs.length / 2))) c.otsPerf += 40;
    const r2 = run(jumpy);
    expect(r2.verdict).not.toBe("PASS");
    expect(r2.holds.some((h) => h.includes("clock-mapping"))).toBe(true);
    expect(r2.stats.mappingSpreadMs as number).toBeGreaterThan(MAPPING_LIMIT_MS);

    // Too short: a clean one-minute session is not evidence.
    const r3 = run(await record(60));
    expect(r3.failures).toEqual([]);
    expect(r3.verdict).toBe("INCONCLUSIVE");
    expect(r3.holds.some((h) => h.includes("min <"))).toBe(true);

    // Two sounding intervals overlapping: the second schedule starts before the first ends.
    const overlapping = structuredClone(events);
    const scheds = overlapping.filter((e) => e.kind === "narrate-schedule") as unknown as { startAt: number; endAt: number }[];
    scheds[1].startAt = scheds[0].endAt - 0.05;
    const r4 = run(overlapping);
    expect(r4.stats.overlaps as number).toBeGreaterThan(0);
    expect(r4.verdict).toBe("FAIL");

    // A unit never committed inside a fully played chunk.
    const dropped = structuredClone(events);
    const victim = commitsOf(dropped)[30];
    dropped.splice(dropped.indexOf(victim), 1);
    const r5 = run(dropped);
    expect(r5.stats.drops as number).toBeGreaterThan(0);
    expect(r5.verdict).toBe("FAIL");

    // A unit committed twice.
    const repeated = structuredClone(events);
    const twice = commitsOf(repeated)[31];
    repeated.splice(repeated.indexOf(twice) + 1, 0, structuredClone(twice));
    const r6 = run(repeated);
    expect(r6.stats.repeats as number).toBeGreaterThan(0);
    expect(r6.verdict).toBe("FAIL");
  }, 60_000);

  it("helpers: a drifting but steady clock pair is one line; a stopped schedule ends at its stop", () => {
    const xs = Array.from({ length: 50 }, (_, i) => i);
    const ys = xs.map((x) => 1.0005 * x + 0.3);
    expect(maxLineResidual(xs, ys)).toBeLessThan(1e-9);
    const ysJump = ys.map((y, i) => (i > 25 ? y + 0.02 : y));
    expect(maxLineResidual(xs, ysJump)).toBeGreaterThan(0.005);
    const iv = soundingIntervals(
      [{ kind: "narrate-schedule", t: 0, chunkStart: 0, startAt: 1, endAt: 3, unitStarts: [0], unitBoundaryCtx: [1] }, { kind: "narrate-schedule", t: 1, chunkStart: 5, startAt: 3, endAt: 5, unitStarts: [5], unitBoundaryCtx: [3] }],
      [{ kind: "narrate-stop", t: 2, chunkStart: 0, at: 2, reason: "pause" }],
    ) as { start: number; end: number; stopped: boolean }[];
    expect(iv.map((i) => [i.start, i.end, i.stopped])).toEqual([[1, 2, true], [3, 5, false]]);
  });
});

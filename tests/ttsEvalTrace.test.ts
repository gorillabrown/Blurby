import { describe, expect, it } from "vitest";
import { summarizeTtsEvalTrace, validateTtsEvalTrace } from "../src/utils/ttsEvalTrace";
import type { TtsEvalTrace } from "../src/types/eval";

function makeBaseTrace(): TtsEvalTrace {
  const now = 1_700_000_000_000;
  return {
    schemaVersion: "1.0",
    runId: "trace-run-1",
    fixture: {
      id: "fixture-a",
      title: "Fixture A",
      sourceType: "prose",
      expectedCoverage: ["start-latency", "word-progression"],
    },
    createdAt: new Date(now).toISOString(),
    events: [
      { ts: now, kind: "lifecycle", state: "start", wordIndex: 0, mode: "flow", isNarrating: true },
      { ts: now + 320, kind: "lifecycle", state: "first-audio", wordIndex: 0, latencyMs: 320, mode: "flow", isNarrating: true },
      { ts: now + 380, kind: "word", source: "audio", wordIndex: 0 },
      { ts: now + 420, kind: "flow-position", lineIndex: 0, totalLines: 3, wordIndex: 0, totalWords: 12, bookPct: 0 },
      { ts: now + 600, kind: "word", source: "flow", wordIndex: 1 },
      { ts: now + 920, kind: "lifecycle", state: "stop", wordIndex: 11, mode: "flow", isNarrating: false },
    ],
  };
}

describe("tts eval trace integrity", () => {
  it("accepts a valid baseline trace", () => {
    const valid = validateTtsEvalTrace(makeBaseTrace());
    expect(valid.valid).toBe(true);
    expect(valid.issues).toEqual([]);
  });

  it("rejects unsupported schema versions", () => {
    const trace = makeBaseTrace();
    trace.schemaVersion = "0.9" as "1.0";
    const valid = validateTtsEvalTrace(trace);
    expect(valid.valid).toBe(false);
    expect(valid.issues.some((issue) => issue.includes("unsupported schemaVersion"))).toBe(true);
  });

  it("requires lifecycle start", () => {
    const trace = makeBaseTrace();
    trace.events = trace.events.filter((event) => !(event.kind === "lifecycle" && event.state === "start"));
    const valid = validateTtsEvalTrace(trace);
    expect(valid.valid).toBe(false);
    expect(valid.issues).toContain("missing lifecycle:start");
  });

  it("requires lifecycle first-audio", () => {
    const trace = makeBaseTrace();
    trace.events = trace.events.filter((event) => !(event.kind === "lifecycle" && event.state === "first-audio"));
    const valid = validateTtsEvalTrace(trace);
    expect(valid.valid).toBe(false);
    expect(valid.issues).toContain("missing lifecycle:first-audio");
  });

  it("enforces first-audio ordering after start", () => {
    const trace = makeBaseTrace();
    trace.events[1].ts = trace.events[0].ts - 50;
    const valid = validateTtsEvalTrace(trace);
    expect(valid.valid).toBe(false);
    expect(valid.issues).toContain("lifecycle:first-audio must occur after lifecycle:start");
  });

  it("requires resume to follow pause", () => {
    const trace = makeBaseTrace();
    trace.events.splice(2, 0, { ts: trace.events[0].ts + 100, kind: "lifecycle", state: "resume", wordIndex: 0 });
    const valid = validateTtsEvalTrace(trace);
    expect(valid.valid).toBe(false);
    expect(valid.issues).toContain("lifecycle:resume without preceding pause");
  });

  it("detects unbalanced pause and resume", () => {
    const trace = makeBaseTrace();
    trace.events.splice(2, 0, { ts: trace.events[0].ts + 100, kind: "lifecycle", state: "pause", wordIndex: 0 });
    const valid = validateTtsEvalTrace(trace);
    expect(valid.valid).toBe(false);
    expect(valid.issues).toContain("unbalanced pause/resume lifecycle events");
  });
});

describe("tts eval trace summary", () => {
  it("computes start latency from lifecycle", () => {
    const summary = summarizeTtsEvalTrace(makeBaseTrace());
    expect(summary.startLatencyMs).toBe(320);
  });

  it("counts words and flow samples", () => {
    const summary = summarizeTtsEvalTrace(makeBaseTrace());
    expect(summary.wordEventCount).toBe(2);
    expect(summary.flowEventCount).toBe(1);
  });

  it("marks pause/resume integrity as balanced by default", () => {
    const summary = summarizeTtsEvalTrace(makeBaseTrace());
    expect(summary.pauseResumeIntegrity).toEqual({ pauses: 0, resumes: 0, balanced: true });
  });

  it("flags start-latency when first audio is too slow", () => {
    const trace = makeBaseTrace();
    trace.events[1] = {
      ...(trace.events[1] as any),
      latencyMs: 3000,
      ts: trace.events[0].ts + 3000,
    };
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.failureClasses).toContain("start-latency");
  });

  it("flags drift when flow and word indices diverge heavily", () => {
    const trace = makeBaseTrace();
    trace.events.push({
      ts: trace.events[0].ts + 700,
      kind: "flow-position",
      lineIndex: 2,
      totalLines: 3,
      wordIndex: 30,
      totalWords: 50,
      bookPct: 0.6,
    });
    trace.events.push({
      ts: trace.events[0].ts + 710,
      kind: "word",
      source: "audio",
      wordIndex: 1,
    });
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.failureClasses).toContain("cursor-highlight-drift");
  });

  it("summarizes Nano segment cache, latency, and prefetch readiness without word timestamps", () => {
    const trace = makeBaseTrace();
    trace.events.push(
      {
        ts: trace.events[0].ts + 250,
        kind: "nano-segment",
        phase: "prefetch-ready",
        startIdx: 2,
        endIdx: 4,
        latencyMs: 75,
        cacheHit: false,
        prefetchReady: true,
        timingTruth: "segment-following",
        wordTimestamps: null,
      } as any,
      {
        ts: trace.events[0].ts + 330,
        kind: "nano-segment",
        phase: "playback",
        startIdx: 2,
        endIdx: 4,
        latencyMs: 12,
        cacheHit: true,
        prefetchReady: true,
        timingTruth: "segment-following",
        wordTimestamps: null,
      } as any,
    );

    const valid = validateTtsEvalTrace(trace);
    expect(valid.valid).toBe(true);

    const summary = summarizeTtsEvalTrace(trace);
    expect((summary as any).nanoSegmentLatencyMs).toEqual({
      p50: 43.5,
      p95: 71.85,
      min: 12,
      max: 75,
    });
    expect((summary as any).nanoCache).toEqual({
      hits: 1,
      misses: 1,
      hitRate: 0.5,
    });
    expect((summary as any).nanoPrefetch).toEqual({
      ready: 2,
      stale: 0,
      cancelled: 0,
    });
  });
});

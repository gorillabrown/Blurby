import { describe, expect, it } from "vitest";
import { summarizeTtsEvalTrace } from "../src/utils/ttsEvalTrace";
import type { TtsEvalTrace } from "../src/types/eval";

function makeLifecycleTrace(events: TtsEvalTrace["events"]): TtsEvalTrace {
  return {
    schemaVersion: "1.0",
    runId: "lifecycle-run",
    fixture: {
      id: "queued-handoff",
      title: "Queued Handoff",
      sourceType: "transition",
      expectedCoverage: ["handoff", "pause-resume"],
    },
    createdAt: "2026-04-16T00:00:00.000Z",
    events,
  };
}

describe("tts eval lifecycle and handoff accounting", () => {
  it("counts section transitions", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 200 },
      { ts: 3, kind: "transition", transition: "section", from: 0, to: 1 },
      { ts: 4, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.transitionCounts.section).toBe(1);
  });

  it("counts chapter transitions", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 210 },
      { ts: 3, kind: "transition", transition: "chapter", from: 1, to: 2 },
      { ts: 4, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.transitionCounts.chapter).toBe(1);
  });

  it("counts book transitions", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      { ts: 3, kind: "transition", transition: "book", from: "a", to: "b" },
      { ts: 4, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.transitionCounts.book).toBe(1);
  });

  it("counts explicit handoff transitions", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      { ts: 3, kind: "transition", transition: "handoff", from: "a", to: "b" },
      { ts: 4, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.transitionCounts.handoff).toBe(1);
  });

  it("records section and cross-book handoff latency when transition events include latency metrics", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      {
        ts: 3,
        kind: "transition",
        transition: "section",
        from: 0,
        to: 1,
        context: "flow-narration-section-handoff",
        latencyMs: 120,
      } as any,
      {
        ts: 4,
        kind: "transition",
        transition: "handoff",
        from: "book-a",
        to: "book-b",
        context: "cross-book-flow-narration",
        latencyMs: 480,
      } as any,
      { ts: 5, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect((summary as any).sectionHandoffLatencyMs).toBe(120);
    expect((summary as any).crossBookResumeLatencyMs).toBe(480);
  });

  it("records same-bucket segmented rate-response latency when transition events include live response metrics", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      {
        ts: 3,
        kind: "transition",
        transition: "rate-response",
        from: 1.0,
        to: 1.1,
        context: "same-bucket-segmented-live-rate",
        latencyMs: 95,
      } as any,
      { ts: 4, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect((summary as any).rateResponseLatencyMs).toBe(95);
  });

  it("flags handoff error when book transition has no handoff", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      { ts: 3, kind: "transition", transition: "book", from: "a", to: "b" },
      { ts: 4, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.failureClasses).toContain("handoff-error");
  });

  it("does not flag handoff error when both book and handoff are present", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      { ts: 3, kind: "transition", transition: "book", from: "a", to: "b" },
      { ts: 4, kind: "transition", transition: "handoff", from: "a", to: "b" },
      { ts: 5, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.failureClasses).not.toContain("handoff-error");
  });

  it("counts balanced pause and resume lifecycle", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      { ts: 3, kind: "lifecycle", state: "pause", wordIndex: 4 },
      { ts: 4, kind: "lifecycle", state: "resume", wordIndex: 4 },
      { ts: 5, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.pauseResumeIntegrity).toEqual({ pauses: 1, resumes: 1, balanced: true });
  });

  it("flags pause-resume errors when unbalanced", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      { ts: 3, kind: "lifecycle", state: "pause", wordIndex: 4 },
      { ts: 4, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.failureClasses).toContain("pause-resume-error");
  });

  it("returns null start latency when no first-audio exists", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.startLatencyMs).toBeNull();
  });

  it("counts zero transitions on pure lifecycle traces", () => {
    const trace = makeLifecycleTrace([
      { ts: 1, kind: "lifecycle", state: "start" },
      { ts: 2, kind: "lifecycle", state: "first-audio", latencyMs: 220 },
      { ts: 3, kind: "lifecycle", state: "stop" },
    ]);
    const summary = summarizeTtsEvalTrace(trace);
    expect(summary.transitionCounts).toEqual({
      section: 0,
      chapter: 0,
      book: 0,
      handoff: 0,
    });
  });
});

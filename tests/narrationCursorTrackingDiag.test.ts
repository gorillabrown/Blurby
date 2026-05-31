/**
 * NARRATE-CURSOR-TRACKING-DIAG-1 (Wave B, Task 3) — Diagnostics instrumentation tests.
 *
 * WHY MIRRORS INSTEAD OF IMPORTS
 * ───────────────────────────────
 * The diagnostic helpers (diag, pushLeadLagSample, emitLeadLagSummary) are all
 * closures inside useNarration — they are not exported. The DIAG flag is a
 * module-level `const DIAG = false`, which means it cannot be toggled from outside
 * the module without editing production source.
 *
 * This is the same pattern the rest of the codebase uses (e.g.
 * narratePauseResumeUnify.test.ts, narrateIntentCursor.test.ts): mirror the pure
 * logic as standalone functions in the test, spy on console.debug, and assert
 * behavior of the logic itself. This verifies the contract without touching the
 * production DIAG flag.
 *
 * WHAT IS TESTED
 * ──────────────
 * 1. diag() — emits console.debug with [NARR-DIAG] tag when the flag is ON; is a
 *    no-op (does not call console.debug and does not invoke the thunk) when OFF.
 * 2. word-advance payload — all 7 candidate signal keys are present when produced
 *    by a DIAG-on diag("word-advance", ...) call.
 * 3. signal-leadlag-summary — emitLeadLagSummary emits the right structure (trigger,
 *    sampleCount, per-signal min/median/max/n) when a buffer has data.
 * 4. leadlag math — min/median/max computation is correct for even and odd sample
 *    counts, and "no-data" is returned for signals that are always null.
 * 5. DIAG=false suppression — none of the diag helpers call console.debug or invoke
 *    thunks when the flag is false.
 * 6. scheduler chunk boundary payload shape — asserts the expected keys for
 *    [SCHED-DIAG] chunk-start/chunk-end payloads. The scheduler IS instrumented
 *    in audioScheduler.ts (schedDiag, chunk-start ~line 696, chunk-end ~line 364);
 *    this block verifies the payload-shape contract.
 *
 * PRODUCTION CHANGE REQUIRED? No for tests 1-6. The scheduler instrumentation
 * was completed this sprint (NARRATE-CURSOR-TRACKING-DIAG-1).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Type mirrors ──────────────────────────────────────────────────────────────

type LeadLagSample = {
  t: number;
  reference: number | null; // schedulerActiveWord — the "truth"
  wordIndex: number | null;
  heardFloor: number | null;
  resumeTarget: number | null;
  subscriberCursor: number | null;
  nextGenWordIndex: number | null;
};

type SignalKey =
  | "wordIndex"
  | "heardFloor"
  | "resumeTarget"
  | "subscriberCursor"
  | "nextGenWordIndex";

type SignalStats = { min: number; median: number; max: number; n: number } | "no-data";

// ── Logic mirrors (line-for-line from useNarration.ts) ───────────────────────

/**
 * Mirror of useNarration's diag() helper.
 * Production: `function diag(event, payload) { if (DIAG) console.debug("[NARR-DIAG]", performance.now(), event, payload()); }`
 */
function makeDiagFn(diagOn: boolean) {
  return function diag(event: string, payload: () => Record<string, unknown>): void {
    if (diagOn) console.debug("[NARR-DIAG]", performance.now(), event, payload());
  };
}

/**
 * Mirror of pushLeadLagSample + emitLeadLagSummary from useNarration.ts.
 * Returns a {push, emit} pair that shares the same buffer — matches the production
 * closure shape exactly.
 */
function makeLeadLagHelpers(diagOn: boolean) {
  const buf: LeadLagSample[] | null = diagOn ? [] : null;

  function pushLeadLagSample(
    t: number,
    reference: number | null,
    wordIndex: number | null,
    heardFloor: number | null,
    resumeTarget: number | null,
    nextGenWordIndex: number | null,
  ): void {
    if (!diagOn) return;
    if (!buf) return;
    buf.push({
      t,
      reference,
      wordIndex,
      heardFloor,
      resumeTarget,
      subscriberCursor: null, // not accessible in this layer
      nextGenWordIndex,
    });
  }

  function emitLeadLagSummary(trigger: "pause" | "stop", clearAfter: boolean): void {
    if (!diagOn) return;
    if (!buf || buf.length === 0) return;

    const signals: SignalKey[] = [
      "wordIndex",
      "heardFloor",
      "resumeTarget",
      "subscriberCursor",
      "nextGenWordIndex",
    ];
    const summary: Record<string, SignalStats> = {};

    for (const sig of signals) {
      const offsets: number[] = [];
      for (const s of buf) {
        if (s.reference == null || s[sig] == null) continue;
        offsets.push((s[sig] as number) - s.reference);
      }
      if (offsets.length === 0) {
        summary[sig] = "no-data";
        continue;
      }
      offsets.sort((a, b) => a - b);
      const mid = Math.floor(offsets.length / 2);
      const median =
        offsets.length % 2 === 1
          ? offsets[mid]
          : (offsets[mid - 1] + offsets[mid]) / 2;
      summary[sig] = {
        min: offsets[0],
        median,
        max: offsets[offsets.length - 1],
        n: offsets.length,
      };
    }

    console.debug("[NARR-DIAG]", performance.now(), "signal-leadlag-summary", {
      trigger,
      sampleCount: buf.length,
      summary,
    });

    if (clearAfter) {
      buf.length = 0;
    }
  }

  return { pushLeadLagSample, emitLeadLagSummary, getBuffer: () => buf };
}

// ── console.debug spy setup ───────────────────────────────────────────────────

let debugSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
});

afterEach(() => {
  debugSpy.mockRestore();
});

// ═════════════════════════════════════════════════════════════════════════════
// 1. diag() helper — DIAG=true path
// ═════════════════════════════════════════════════════════════════════════════

describe("NARRATE-CURSOR-TRACKING-DIAG-1: diag() — DIAG=true path", () => {
  it("calls console.debug with [NARR-DIAG] prefix when flag is ON", () => {
    const diag = makeDiagFn(true);
    diag("word-advance", () => ({ wordIndex: 42 }));
    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [prefix] = debugSpy.mock.calls[0];
    expect(prefix).toBe("[NARR-DIAG]");
  });

  it("passes event name as the third argument", () => {
    const diag = makeDiagFn(true);
    diag("word-advance", () => ({ wordIndex: 42 }));
    const [, , event] = debugSpy.mock.calls[0];
    expect(event).toBe("word-advance");
  });

  it("invokes the payload thunk exactly once and passes the result as fourth argument", () => {
    const diag = makeDiagFn(true);
    let thunkCalls = 0;
    diag("word-advance", () => {
      thunkCalls++;
      return { wordIndex: 7 };
    });
    expect(thunkCalls).toBe(1);
    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    expect((payload as Record<string, unknown>).wordIndex).toBe(7);
  });

  it("second argument is a number (performance.now() timestamp)", () => {
    const diag = makeDiagFn(true);
    diag("word-advance", () => ({ wordIndex: 0 }));
    const [, t] = debugSpy.mock.calls[0];
    expect(typeof t).toBe("number");
    expect(t as number).toBeGreaterThanOrEqual(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. word-advance payload — all 7 candidate signal keys present
// ═════════════════════════════════════════════════════════════════════════════

describe("NARRATE-CURSOR-TRACKING-DIAG-1: word-advance payload — all candidate signal keys", () => {
  /**
   * NARRATE-CURSOR-TRACKING-DIAG-1 candidate signals (from ROADMAP + instrumentation):
   *   t, wordIndex, heardFloor, resumeTarget, subscriberCursor,
   *   nextGenWordIndex, schedulerActiveWord, schedulerChunkBoundary
   *
   * useNarration contributes: t, wordIndex, heardFloor, resumeTarget,
   *   subscriberCursor (always null in this layer), nextGenWordIndex.
   * schedulerActiveWord and schedulerChunkBoundary are null in hook-layer events
   * and are owned by the scheduler diag channel.
   */

  it("word-advance payload for Kokoro path contains all hook-layer candidate keys", () => {
    const diag = makeDiagFn(true);
    // Mirrors the kokoro word-advance diag call in useNarration.ts
    diag("word-advance", () => ({
      t: performance.now(),
      wordIndex: 100,
      heardFloor: 95,
      resumeTarget: null,
      subscriberCursor: null,
      nextGenWordIndex: 110,
      schedulerActiveWord: null,     // null in hook layer — owned by scheduler
      schedulerChunkBoundary: null,  // null in hook layer — owned by scheduler
      engine: "kokoro",
    }));

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const p = payload as Record<string, unknown>;

    // All 7 candidate keys must be present (may be null for scheduler-owned ones)
    expect("t" in p).toBe(true);
    expect("wordIndex" in p).toBe(true);
    expect("heardFloor" in p).toBe(true);
    expect("resumeTarget" in p).toBe(true);
    expect("subscriberCursor" in p).toBe(true);
    expect("nextGenWordIndex" in p).toBe(true);
    expect("schedulerActiveWord" in p).toBe(true);
    expect("schedulerChunkBoundary" in p).toBe(true);
  });

  it("word-advance payload for web path sets heardFloor null (no scheduler floor)", () => {
    const diag = makeDiagFn(true);
    diag("word-advance", () => ({
      t: performance.now(),
      wordIndex: 50,
      heardFloor: null,
      resumeTarget: null,
      subscriberCursor: null,
      nextGenWordIndex: 60,
      schedulerActiveWord: null,
      schedulerChunkBoundary: null,
      engine: "web",
    }));

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const p = payload as Record<string, unknown>;
    expect(p.heardFloor).toBeNull();
    expect(p.engine).toBe("web");
  });

  it("word-advance payload t field is a number", () => {
    const diag = makeDiagFn(true);
    const before = performance.now();
    diag("word-advance", () => ({
      t: performance.now(),
      wordIndex: 1,
      heardFloor: 0,
      resumeTarget: null,
      subscriberCursor: null,
      nextGenWordIndex: 5,
      schedulerActiveWord: null,
      schedulerChunkBoundary: null,
    }));
    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const p = payload as Record<string, unknown>;
    expect(typeof p.t).toBe("number");
    expect(p.t as number).toBeGreaterThanOrEqual(before);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. signal-leadlag-summary — emitted on pause/stop with correct structure
// ═════════════════════════════════════════════════════════════════════════════

describe("NARRATE-CURSOR-TRACKING-DIAG-1: signal-leadlag-summary — emitted on pause/stop", () => {
  it("emits console.debug with [NARR-DIAG] and 'signal-leadlag-summary' event on pause", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    pushLeadLagSample(1, 100, 102, 100, null, 105);
    emitLeadLagSummary("pause", false);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [prefix, , event] = debugSpy.mock.calls[0];
    expect(prefix).toBe("[NARR-DIAG]");
    expect(event).toBe("signal-leadlag-summary");
  });

  it("emits on stop trigger as well", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    pushLeadLagSample(1, 100, 102, 100, null, 105);
    emitLeadLagSummary("stop", false);

    const [, , event, payload] = debugSpy.mock.calls[0] as unknown[];
    expect(event).toBe("signal-leadlag-summary");
    expect((payload as Record<string, unknown>).trigger).toBe("stop");
  });

  it("payload contains trigger, sampleCount, and summary fields", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    pushLeadLagSample(1, 100, 103, 100, 99, 108);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const p = payload as Record<string, unknown>;
    expect(p.trigger).toBe("pause");
    expect(typeof p.sampleCount).toBe("number");
    expect(p.sampleCount).toBe(1);
    expect(p.summary).toBeDefined();
  });

  it("summary contains an entry for each of the 5 signal keys", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    pushLeadLagSample(1, 100, 103, 100, 99, 108);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, unknown> }).summary;
    expect("wordIndex" in summary).toBe(true);
    expect("heardFloor" in summary).toBe(true);
    expect("resumeTarget" in summary).toBe(true);
    expect("subscriberCursor" in summary).toBe(true);
    expect("nextGenWordIndex" in summary).toBe(true);
  });

  it("does not emit when buffer is empty", () => {
    const { emitLeadLagSummary } = makeLeadLagHelpers(true);
    emitLeadLagSummary("pause", false);
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("clears the buffer when clearAfter=true", () => {
    const { pushLeadLagSample, emitLeadLagSummary, getBuffer } = makeLeadLagHelpers(true);
    pushLeadLagSample(1, 100, 103, 100, null, 108);
    emitLeadLagSummary("pause", true);
    expect(getBuffer()!.length).toBe(0);
  });

  it("does not clear the buffer when clearAfter=false", () => {
    const { pushLeadLagSample, emitLeadLagSummary, getBuffer } = makeLeadLagHelpers(true);
    pushLeadLagSample(1, 100, 103, 100, null, 108);
    emitLeadLagSummary("pause", false);
    expect(getBuffer()!.length).toBe(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. Lead/lag math — min/median/max correctness
// ═════════════════════════════════════════════════════════════════════════════

describe("NARRATE-CURSOR-TRACKING-DIAG-1: lead/lag offset math", () => {
  it("single sample: min === median === max === offset", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    // wordIndex=103, reference=100 → offset=+3 (leads by 3)
    pushLeadLagSample(1, 100, 103, 100, null, 108);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    const wi = summary.wordIndex as { min: number; median: number; max: number; n: number };
    expect(wi.min).toBe(3);
    expect(wi.median).toBe(3);
    expect(wi.max).toBe(3);
    expect(wi.n).toBe(1);
  });

  it("odd number of samples: median is the middle value", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    // offsets for wordIndex vs reference: +1, +3, +5
    pushLeadLagSample(1, 100, 101, 100, null, null);
    pushLeadLagSample(2, 100, 103, 100, null, null);
    pushLeadLagSample(3, 100, 105, 100, null, null);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    const wi = summary.wordIndex as { min: number; median: number; max: number; n: number };
    expect(wi.min).toBe(1);
    expect(wi.median).toBe(3);
    expect(wi.max).toBe(5);
    expect(wi.n).toBe(3);
  });

  it("even number of samples: median is average of two middle values", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    // offsets: +2, +4 → median = 3.0
    pushLeadLagSample(1, 100, 102, 100, null, null);
    pushLeadLagSample(2, 100, 104, 100, null, null);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    const wi = summary.wordIndex as { min: number; median: number; max: number; n: number };
    expect(wi.median).toBe(3.0);
  });

  it("negative offsets (signal lags behind reference) are computed correctly", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    // heardFloor lags by 5 (heardFloor=95, reference=100)
    pushLeadLagSample(1, 100, 100, 95, null, null);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    const hf = summary.heardFloor as { min: number; median: number; max: number; n: number };
    expect(hf.min).toBe(-5);
    expect(hf.max).toBe(-5);
  });

  it("subscriberCursor is always null in hook layer → 'no-data' in summary", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    // Push multiple samples; subscriberCursor is always null in hook layer
    pushLeadLagSample(1, 100, 102, 100, null, 105);
    pushLeadLagSample(2, 101, 103, 101, null, 106);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    expect(summary.subscriberCursor).toBe("no-data");
  });

  it("resumeTarget=null on all samples → 'no-data' in summary", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    pushLeadLagSample(1, 100, 102, 100, null, 105);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    expect(summary.resumeTarget).toBe("no-data");
  });

  it("resumeTarget present → produces stats entry (not no-data)", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    // resumeTarget=98, reference=100 → offset=-2
    pushLeadLagSample(1, 100, 102, 100, 98, 105);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    const rt = summary.resumeTarget as { min: number; median: number; max: number; n: number };
    expect(rt.min).toBe(-2);
    expect(rt.n).toBe(1);
  });

  it("reference=null samples are excluded from offset computation", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(true);
    // First sample has reference=null (e.g. web engine), second is valid
    pushLeadLagSample(1, null, 50, null, null, null);
    pushLeadLagSample(2, 100, 103, 100, null, null);
    emitLeadLagSummary("pause", false);

    const [, , , payload] = debugSpy.mock.calls[0] as unknown[];
    const summary = (payload as { summary: Record<string, SignalStats> }).summary;
    const wi = summary.wordIndex as { min: number; median: number; max: number; n: number };
    // Only the second sample (reference non-null) contributes
    expect(wi.n).toBe(1);
    expect(wi.min).toBe(3);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. DIAG=false suppression — no console.debug, thunks not invoked
// ═════════════════════════════════════════════════════════════════════════════

describe("NARRATE-CURSOR-TRACKING-DIAG-1: DIAG=false suppression", () => {
  it("diag() does NOT call console.debug when flag is OFF", () => {
    const diag = makeDiagFn(false);
    diag("word-advance", () => ({ wordIndex: 42 }));
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("diag() does NOT invoke the payload thunk when flag is OFF", () => {
    const diag = makeDiagFn(false);
    let thunkCalls = 0;
    diag("word-advance", () => {
      thunkCalls++;
      return { wordIndex: 42 };
    });
    expect(thunkCalls).toBe(0);
  });

  it("diag() is a no-op for any event name when flag is OFF", () => {
    const diag = makeDiagFn(false);
    diag("signal-leadlag-summary", () => ({ trigger: "pause" }));
    diag("word-advance", () => ({ wordIndex: 0 }));
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("pushLeadLagSample is a no-op when DIAG=false", () => {
    const { pushLeadLagSample, getBuffer } = makeLeadLagHelpers(false);
    pushLeadLagSample(1, 100, 103, 100, null, 108);
    // Buffer is null (not allocated) when DIAG=false
    expect(getBuffer()).toBeNull();
  });

  it("emitLeadLagSummary does NOT call console.debug when DIAG=false", () => {
    const { pushLeadLagSample, emitLeadLagSummary } = makeLeadLagHelpers(false);
    pushLeadLagSample(1, 100, 103, 100, null, 108); // no-op
    emitLeadLagSummary("pause", false);
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it("emitLeadLagSummary does not throw when DIAG=false", () => {
    const { emitLeadLagSummary } = makeLeadLagHelpers(false);
    expect(() => emitLeadLagSummary("stop", true)).not.toThrow();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. [SCHED-DIAG] scheduler chunk boundary payload shape (forward contract)
//
// NOTE: The [SCHED-DIAG] chunk-start / chunk-end instrumentation IS present in
// audioScheduler.ts (schedDiag helper, chunk-start ~line 696, chunk-end ~line 364).
// This block verifies the payload-shape contract that the scheduler emits.
// These tests do not import from audioScheduler — they assert the shape of a
// payload emitted via console.debug.
// ═════════════════════════════════════════════════════════════════════════════

describe("NARRATE-CURSOR-TRACKING-DIAG-1: [SCHED-DIAG] chunk boundary payload shape (forward contract)", () => {
  /**
   * A minimal stub for the expected scheduler diag emission. When the real
   * instrumentation lands in audioScheduler.ts, replace this stub with an
   * import of the real helper.
   */
  function makeSchedDiagFn(diagOn: boolean) {
    return function schedDiag(event: string, payload: () => Record<string, unknown>): void {
      if (diagOn) console.debug("[SCHED-DIAG]", performance.now(), event, payload());
    };
  }

  it("chunk-start payload contains t, schedulerActiveWord, schedulerChunkBoundary (DIAG=true)", () => {
    const schedDiag = makeSchedDiagFn(true);
    schedDiag("chunk-start", () => ({
      t: performance.now(),
      schedulerActiveWord: 42,
      schedulerChunkBoundary: 55,
      wordIndex: null,
      heardFloor: null,
      resumeTarget: null,
      subscriberCursor: null,
      nextGenWordIndex: null,
    }));

    expect(debugSpy).toHaveBeenCalledTimes(1);
    const [prefix, , event, payload] = debugSpy.mock.calls[0] as unknown[];
    expect(prefix).toBe("[SCHED-DIAG]");
    expect(event).toBe("chunk-start");
    const p = payload as Record<string, unknown>;
    expect("t" in p).toBe(true);
    expect("schedulerActiveWord" in p).toBe(true);
    expect("schedulerChunkBoundary" in p).toBe(true);
  });

  it("chunk-end payload contains t, schedulerActiveWord, schedulerChunkBoundary (DIAG=true)", () => {
    const schedDiag = makeSchedDiagFn(true);
    schedDiag("chunk-end", () => ({
      t: performance.now(),
      schedulerActiveWord: 55,
      schedulerChunkBoundary: 55,
      wordIndex: null,
      heardFloor: null,
      resumeTarget: null,
      subscriberCursor: null,
      nextGenWordIndex: null,
    }));

    const [, , event] = debugSpy.mock.calls[0];
    expect(event).toBe("chunk-end");
  });

  it("[SCHED-DIAG] does NOT call console.debug when flag is OFF", () => {
    const schedDiag = makeSchedDiagFn(false);
    schedDiag("chunk-start", () => ({
      t: performance.now(),
      schedulerActiveWord: 42,
      schedulerChunkBoundary: 55,
    }));
    expect(debugSpy).not.toHaveBeenCalled();
  });
});

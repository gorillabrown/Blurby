import { describe, it, expect, beforeEach } from "vitest";
import {
  perfStart,
  perfEnd,
  getPerfEntries,
  clearPerfEntries,
  getLastEntry,
} from "../src/utils/narratePerf";
import {
  NARRATE_STARTUP_BUDGET_MS,
  NARRATE_RESTART_BUDGET_MS,
  NARRATE_STEADY_STATE_BLOCK_MS,
  NARRATE_BG_EXTRACT_DELAY_MS,
} from "../src/constants";

describe("Narrate performance budget constants", () => {
  it("startup budget is defined and reasonable", () => {
    expect(NARRATE_STARTUP_BUDGET_MS).toBeGreaterThanOrEqual(1000);
    expect(NARRATE_STARTUP_BUDGET_MS).toBeLessThanOrEqual(5000);
  });

  it("restart budget is defined and less than startup", () => {
    expect(NARRATE_RESTART_BUDGET_MS).toBeGreaterThan(0);
    expect(NARRATE_RESTART_BUDGET_MS).toBeLessThanOrEqual(NARRATE_STARTUP_BUDGET_MS);
  });

  it("steady-state block budget is tight (50ms or less)", () => {
    expect(NARRATE_STEADY_STATE_BLOCK_MS).toBeLessThanOrEqual(50);
  });

  it("background extraction delay is positive", () => {
    expect(NARRATE_BG_EXTRACT_DELAY_MS).toBeGreaterThan(0);
  });
});

describe("Narrate performance instrumentation", () => {
  beforeEach(() => {
    clearPerfEntries();
  });

  it("records a startup measurement", () => {
    const entry = perfStart("startup");
    expect(entry.event).toBe("startup");
    expect(entry.startMs).toBeGreaterThan(0);
    expect(entry.endMs).toBeUndefined();

    const duration = perfEnd(entry);
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(entry.durationMs).toBe(duration);
  });

  it("accumulates entries across multiple measurements", () => {
    const e1 = perfStart("startup");
    perfEnd(e1);
    const e2 = perfStart("restart");
    perfEnd(e2);
    const e3 = perfStart("extraction");
    perfEnd(e3);

    expect(getPerfEntries()).toHaveLength(3);
    expect(getPerfEntries().map(e => e.event)).toEqual(["startup", "restart", "extraction"]);
  });

  it("getLastEntry returns the most recent matching entry", () => {
    const e1 = perfStart("startup");
    perfEnd(e1);
    const e2 = perfStart("startup");
    perfEnd(e2);

    const last = getLastEntry("startup");
    expect(last).toBe(e2);
  });

  it("getLastEntry returns undefined for unrecorded events", () => {
    expect(getLastEntry("restamp")).toBeUndefined();
  });

  it("clearPerfEntries resets the log", () => {
    perfStart("startup");
    perfStart("restart");
    expect(getPerfEntries()).toHaveLength(2);
    clearPerfEntries();
    expect(getPerfEntries()).toHaveLength(0);
  });
});

describe("TTS-7G: First-chunk response-path instrumentation", () => {
  beforeEach(() => {
    clearPerfEntries();
  });

  it("records first-chunk-response event with meta", () => {
    const entry = perfStart("first-chunk-response");
    entry.meta = { chunkWordCount: 13, startIdx: 0, isFirstChunk: true };
    const duration = perfEnd(entry);

    expect(duration).toBeGreaterThanOrEqual(0);
    expect(entry.event).toBe("first-chunk-response");
    expect(entry.meta?.isFirstChunk).toBe(true);
    expect(entry.meta?.chunkWordCount).toBe(13);
    expect(entry.meta?.startIdx).toBe(0);
  });

  it("records schedule-chunk event with meta", () => {
    const entry = perfStart("schedule-chunk");
    entry.meta = { chunkWordCount: 13, startIdx: 0, isFirstChunk: true };
    const duration = perfEnd(entry);

    expect(duration).toBeGreaterThanOrEqual(0);
    expect(entry.event).toBe("schedule-chunk");
    expect(entry.meta?.chunkWordCount).toBe(13);
  });

  it("first-chunk response path is bounded under steady-state budget", () => {
    // Simulate the full response-path measurement (no real audio work)
    const responseMark = perfStart("first-chunk-response");
    responseMark.meta = { chunkWordCount: 13, startIdx: 0, isFirstChunk: true };

    const scheduleMark = perfStart("schedule-chunk");
    scheduleMark.meta = { chunkWordCount: 13, startIdx: 0, isFirstChunk: true };
    // Simulate scheduleChunk work (synchronous, no real AudioContext)
    perfEnd(scheduleMark);

    perfEnd(responseMark);

    // Both measurements should be well under the 50ms steady-state budget
    expect(responseMark.durationMs).toBeLessThan(NARRATE_STEADY_STATE_BLOCK_MS);
    expect(scheduleMark.durationMs).toBeLessThan(NARRATE_STEADY_STATE_BLOCK_MS);
  });

  it("getLastEntry finds first-chunk-response entries", () => {
    const e1 = perfStart("first-chunk-response");
    e1.meta = { isFirstChunk: true };
    perfEnd(e1);
    const e2 = perfStart("first-chunk-response");
    e2.meta = { isFirstChunk: false };
    perfEnd(e2);

    const last = getLastEntry("first-chunk-response");
    expect(last).toBe(e2);
    expect(last?.meta?.isFirstChunk).toBe(false);
  });
});

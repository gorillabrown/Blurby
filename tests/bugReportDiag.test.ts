// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  installConsoleCapture,
  getConsoleBuffer,
  clearConsoleBuffer,
  formatConsoleBuffer,
} from "../src/utils/consoleCapture";
import { gatherAppState } from "../src/utils/bugReportState";
import { recordSnapshot, recordDiagEvent, clearDiagnostics, getLatestSnapshot, getDiagEvents } from "../src/utils/narrateDiagnostics";

describe("Console ring buffer", () => {
  beforeEach(() => clearConsoleBuffer());

  it("captures console.log entries", () => {
    // installConsoleCapture is idempotent — safe to call in tests
    installConsoleCapture();
    console.log("[test] hello");
    const buf = getConsoleBuffer();
    const match = buf.find(e => e.message.includes("[test] hello"));
    expect(match).toBeDefined();
    expect(match!.level).toBe("log");
  });

  it("captures console.warn entries", () => {
    installConsoleCapture();
    console.warn("[test] warning");
    const match = getConsoleBuffer().find(e => e.message.includes("[test] warning"));
    expect(match).toBeDefined();
    expect(match!.level).toBe("warn");
  });

  it("captures console.error entries", () => {
    installConsoleCapture();
    console.error("[test] error");
    const match = getConsoleBuffer().find(e => e.message.includes("[test] error"));
    expect(match).toBeDefined();
    expect(match!.level).toBe("error");
  });

  it("enforces ring buffer max size", () => {
    installConsoleCapture();
    clearConsoleBuffer();
    for (let i = 0; i < 250; i++) {
      console.debug(`[test] entry ${i}`);
    }
    // Buffer should cap at 200 entries
    expect(getConsoleBuffer().length).toBeLessThanOrEqual(200);
  });

  it("formatConsoleBuffer produces readable output", () => {
    installConsoleCapture();
    clearConsoleBuffer();
    console.log("[test] format check");
    const formatted = formatConsoleBuffer();
    expect(formatted).toContain("LOG:");
    expect(formatted).toContain("[test] format check");
  });
});

describe("BugReportAppState with diagnostics", () => {
  beforeEach(() => {
    clearDiagnostics();
    clearConsoleBuffer();
  });

  it("includes narration diagnostics when present", () => {
    const snap = recordSnapshot({
      engine: "kokoro", status: "speaking", cursorWordIndex: 42,
      totalWords: 1000, rate: 1.2, rateBucket: 1.2, profileId: null,
      bookId: "b1", extractionComplete: true, fellBack: false, fallbackReason: null,
    });
    recordDiagEvent("start", "word 0");

    const state = gatherAppState({
      narrateDiagSnapshot: getLatestSnapshot(),
      narrateDiagEvents: getDiagEvents(),
    });

    expect(state.narrateDiagSnapshot).toBeDefined();
    expect(state.narrateDiagSnapshot!.engine).toBe("kokoro");
    expect(state.narrateDiagSnapshot!.cursorWordIndex).toBe(42);
    expect(state.narrateDiagEvents).toHaveLength(1);
    expect(state.narrateDiagEvents![0].event).toBe("start");
  });

  it("includes console log when captured", () => {
    installConsoleCapture();
    clearConsoleBuffer();
    console.log("[test] bug report log");

    const buf = getConsoleBuffer();
    const state = gatherAppState({ consoleLog: buf });

    expect(state.consoleLog!.length).toBeGreaterThan(0);
    expect(state.consoleLog!.some(e => e.message.includes("[test] bug report log"))).toBe(true);
  });

  it("backward compat: no crash when diagnostics fields are absent", () => {
    const state = gatherAppState({});
    expect(state.narrateDiagSnapshot).toBeNull();
    expect(state.narrateDiagEvents).toEqual([]);
    expect(state.consoleLog).toEqual([]);
  });
});

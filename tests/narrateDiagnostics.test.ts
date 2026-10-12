import { describe, it, expect, beforeEach } from "vitest";
import {
  recordSnapshot,
  recordDiagEvent,
  getLatestSnapshot,
  getSnapshots,
  getDiagEvents,
  clearDiagnostics,
} from "../src/utils/narrateDiagnostics";

describe("Narrate diagnostics — snapshots and events", () => {
  beforeEach(() => clearDiagnostics());

  it("records and retrieves a snapshot", () => {
    const snap = recordSnapshot({
      engine: "kokoro", status: "speaking", cursorWordIndex: 100,
      totalWords: 5000, rate: 1.2, rateBucket: 1.2, profileId: null,
      bookId: "book-1", extractionComplete: true, fellBack: false, fallbackReason: null,
    });
    expect(snap.timestamp).toBeGreaterThan(0);
    expect(getLatestSnapshot()).toBe(snap);
    expect(getSnapshots()).toHaveLength(1);
  });

  it("caps snapshot history at 10", () => {
    for (let i = 0; i < 15; i++) {
      recordSnapshot({
        engine: "kokoro", status: "speaking", cursorWordIndex: i,
        totalWords: 100, rate: 1.0, rateBucket: 1.0, profileId: null,
        bookId: "b", extractionComplete: true, fellBack: false, fallbackReason: null,
      });
    }
    expect(getSnapshots()).toHaveLength(10);
    expect(getSnapshots()[0].cursorWordIndex).toBe(5); // first 5 shifted out
  });

  it("records and retrieves events", () => {
    recordDiagEvent("start", "word 0");
    recordDiagEvent("extraction-handoff", "swapped to 5000 words");
    expect(getDiagEvents()).toHaveLength(2);
    expect(getDiagEvents()[0].event).toBe("start");
  });

  it("clearDiagnostics resets everything", () => {
    recordSnapshot({ engine: "web", status: "idle", cursorWordIndex: 0, totalWords: 0, rate: 1.0, rateBucket: null, profileId: null, bookId: null, extractionComplete: false, fellBack: false, fallbackReason: null });
    recordDiagEvent("stop", "user stop");
    clearDiagnostics();
    expect(getSnapshots()).toHaveLength(0);
    expect(getDiagEvents()).toHaveLength(0);
  });
});

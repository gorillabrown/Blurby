import { describe, it, expect, beforeEach } from "vitest";
import {
  recordSnapshot,
  recordDiagEvent,
  getLatestSnapshot,
  getSnapshots,
  getDiagEvents,
  clearDiagnostics,
  checkBucketInvariant,
  checkCursorInvariant,
  checkExtractionHandoff,
} from "../src/utils/narrateDiagnostics";
import { KOKORO_RATE_BUCKETS, resolveKokoroBucket } from "../src/constants";

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

describe("Narrate invariant checks — bucket normalization", () => {
  it("passes for valid Kokoro buckets", () => {
    for (const bucket of KOKORO_RATE_BUCKETS) {
      expect(checkBucketInvariant(bucket, KOKORO_RATE_BUCKETS)).toBeNull();
    }
  });

  it("fails for continuous rate values", () => {
    expect(checkBucketInvariant(1.1, KOKORO_RATE_BUCKETS)).toMatch(/not a supported/);
    expect(checkBucketInvariant(0.8, KOKORO_RATE_BUCKETS)).toMatch(/not a supported/);
  });

  it("resolveKokoroBucket always returns a valid bucket", () => {
    for (const testRate of [0.3, 0.5, 0.8, 1.0, 1.1, 1.15, 1.3, 1.5, 2.0, 3.0]) {
      const resolved = resolveKokoroBucket(testRate);
      expect(checkBucketInvariant(resolved, KOKORO_RATE_BUCKETS)).toBeNull();
    }
  });
});

describe("Narrate invariant checks — cursor bounds", () => {
  it("passes for valid cursor positions", () => {
    expect(checkCursorInvariant(0, 1000)).toBeNull();
    expect(checkCursorInvariant(500, 1000)).toBeNull();
    expect(checkCursorInvariant(1000, 1000)).toBeNull();
  });

  it("fails for negative cursor", () => {
    expect(checkCursorInvariant(-1, 1000)).toMatch(/negative/);
  });

  it("fails for cursor beyond total", () => {
    expect(checkCursorInvariant(1001, 1000)).toMatch(/exceeds/);
  });
});

describe("Narrate invariant checks — extraction handoff", () => {
  it("passes when word count increases and cursor is valid", () => {
    expect(checkExtractionHandoff(100, 100, 500, 5000)).toBeNull();
  });

  it("fails when word count decreases", () => {
    expect(checkExtractionHandoff(100, 100, 5000, 500)).toMatch(/reduced word count/);
  });

  it("fails when post-cursor is out of bounds", () => {
    expect(checkExtractionHandoff(100, 6000, 500, 5000)).toMatch(/out of bounds/);
  });

  it("accepts cursor at exact end of new array", () => {
    expect(checkExtractionHandoff(100, 5000, 500, 5000)).toBeNull();
  });
});

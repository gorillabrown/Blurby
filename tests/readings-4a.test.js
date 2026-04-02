import { describe, it, expect } from "vitest";

import { formatBookDataLine } from "../src/utils/bookData.ts";
import { sortReadingQueue } from "../src/utils/queue.ts";

// ── Book Data Line Format ─────────────────────────────────────────────

describe("formatBookDataLine (READINGS-4A)", () => {
  it("should show page count and total time for unread docs", () => {
    const result = formatBookDataLine(62500, 0); // 250 pages, ~4.3h
    expect(result).toMatch(/^\d+p · \d/); // "250p · 4.3h"
    expect(result).not.toContain("left");
  });

  it("should show percentage and remaining time for in-progress docs", () => {
    const result = formatBookDataLine(62500, 28125); // 45%
    expect(result).toContain("45%");
    expect(result).toContain("left");
    expect(result).toContain("·");
  });

  it("should show '1%' for very small progress", () => {
    const result = formatBookDataLine(100000, 100); // 0.1%
    expect(result).toContain("1%");
    expect(result).toContain("left");
  });

  it("should format hours and minutes correctly", () => {
    // 30000 words remaining at 238 WPM ≈ 2h 6m
    const result = formatBookDataLine(60000, 30000); // 50%
    expect(result).toContain("50%");
    expect(result).toContain("left");
    expect(result).toMatch(/\d+h \d+m left|\d+h left|\d+m left/);
  });

  it("should show minutes only for short remaining time", () => {
    // 1000 words remaining at 238 WPM ≈ 4m
    const result = formatBookDataLine(1200, 200); // ~17%
    expect(result).toContain("left");
    expect(result).toMatch(/\d+m left/);
  });

  it("should handle zero word count gracefully", () => {
    const result = formatBookDataLine(0, 0);
    expect(typeof result).toBe("string");
  });
});

// ── sortReadingQueue with queuePosition ───────────────────────────────

describe("sortReadingQueue (READINGS-4A)", () => {
  const makeDocs = (overrides) =>
    overrides.map((o, i) => ({
      id: `doc-${i}`,
      position: 0,
      wordCount: 10000,
      lastReadAt: null,
      created: Date.now() - i * 1000,
      ...o,
    }));

  it("should sort queued docs first, by queuePosition", () => {
    const docs = makeDocs([
      { id: "a", position: 500, lastReadAt: 100 }, // in-progress, no queue
      { id: "b", position: 0, queuePosition: 2 },  // queued at 2
      { id: "c", position: 0, queuePosition: 0 },  // queued at 0
      { id: "d", position: 0, queuePosition: 1 },  // queued at 1
    ]);
    const sorted = sortReadingQueue(docs);
    expect(sorted[0].id).toBe("c"); // queuePosition 0
    expect(sorted[1].id).toBe("d"); // queuePosition 1
    expect(sorted[2].id).toBe("b"); // queuePosition 2
    expect(sorted[3].id).toBe("a"); // in-progress (not queued)
  });

  it("should preserve in-progress sort order for non-queued docs", () => {
    const docs = makeDocs([
      { id: "a", position: 500, lastReadAt: 200 },
      { id: "b", position: 300, lastReadAt: 100 },
      { id: "c", position: 100, lastReadAt: 300 },
    ]);
    const sorted = sortReadingQueue(docs);
    // Sorted by lastReadAt descending
    expect(sorted[0].id).toBe("c"); // lastReadAt: 300
    expect(sorted[1].id).toBe("a"); // lastReadAt: 200
    expect(sorted[2].id).toBe("b"); // lastReadAt: 100
  });

  it("should handle mixed queued and non-queued docs", () => {
    const docs = makeDocs([
      { id: "unread1", position: 0 },
      { id: "queued1", position: 0, queuePosition: 0 },
      { id: "reading1", position: 500, lastReadAt: 100 },
    ]);
    const sorted = sortReadingQueue(docs);
    expect(sorted[0].id).toBe("queued1"); // Queued first
    expect(sorted.length).toBe(3);
  });

  it("should exclude completed docs (100% progress)", () => {
    const docs = makeDocs([
      { id: "done", position: 10000, wordCount: 10000, lastReadAt: 500 },
      { id: "reading", position: 5000, lastReadAt: 100 },
    ]);
    const sorted = sortReadingQueue(docs);
    expect(sorted.length).toBe(1);
    expect(sorted[0].id).toBe("reading");
  });

  it("should handle docs without queuePosition (backward compatible)", () => {
    const docs = makeDocs([
      { id: "a", position: 0, created: 300 },
      { id: "b", position: 0, created: 100 },
      { id: "c", position: 0, created: 200 },
    ]);
    const sorted = sortReadingQueue(docs);
    // All unread, sorted by created descending
    expect(sorted[0].id).toBe("a");
    expect(sorted[1].id).toBe("c");
    expect(sorted[2].id).toBe("b");
  });

  it("should handle empty array", () => {
    const sorted = sortReadingQueue([]);
    expect(sorted).toEqual([]);
  });

  it("should treat queuePosition 0 as valid queue position", () => {
    const docs = makeDocs([
      { id: "not-queued", position: 500, lastReadAt: 999 },
      { id: "queued-zero", position: 0, queuePosition: 0 },
    ]);
    const sorted = sortReadingQueue(docs);
    expect(sorted[0].id).toBe("queued-zero"); // queuePosition 0 = first
  });
});

// ── Queue IPC Handler Logic ───────────────────────────────────────────

describe("Queue operations (conceptual)", () => {
  it("should assign next queuePosition on add", () => {
    // Simulate: existing docs have positions 0, 1, 2
    const existing = [0, 1, 2];
    const next = Math.max(...existing, -1) + 1;
    expect(next).toBe(3);
  });

  it("should handle add to empty queue", () => {
    const existing = [];
    const next = existing.length === 0 ? 0 : Math.max(...existing, -1) + 1;
    expect(next).toBe(0);
  });

  it("should compact positions after remove", () => {
    // Remove position 1 from [0, 1, 2] → [0, 1]
    const positions = [0, 1, 2];
    const removeIdx = 1;
    const compacted = positions
      .filter((_, i) => i !== removeIdx)
      .map((_, i) => i);
    expect(compacted).toEqual([0, 1]);
  });

  it("should reorder by inserting at new position", () => {
    // Move doc at position 0 to position 2: [A, B, C] → [B, C, A]
    const items = ["A", "B", "C"];
    const [moved] = items.splice(0, 1);
    items.splice(2, 0, moved);
    expect(items).toEqual(["B", "C", "A"]);
  });
});

import { describe, it, expect } from "vitest";
import { bubbleCount, sortReadingQueue, getNextQueuedBook } from "../src/utils/queue";

type TestDoc = {
  id: string;
  position: number;
  wordCount: number;
  lastReadAt?: number | null;
  created: number;
  queuePosition?: number;
};

function makeDoc(overrides: Partial<TestDoc> & { id: string }): TestDoc {
  return {
    id: overrides.id,
    position: 0,
    wordCount: 100,
    created: 0,
    ...overrides,
  };
}

describe("bubbleCount", () => {
  it("returns 0 for low progress", () => {
    expect(bubbleCount(0)).toBe(0);
    expect(bubbleCount(9.9)).toBe(0);
  });

  it("floors progress into ten-percent buckets", () => {
    expect(bubbleCount(10)).toBe(1);
    expect(bubbleCount(19.9)).toBe(1);
    expect(bubbleCount(29.9)).toBe(2);
  });

  it("handles progress above 100 percent", () => {
    expect(bubbleCount(105)).toBe(10);
  });
});

describe("sortReadingQueue", () => {
  it("returns an empty array for no docs", () => {
    expect(sortReadingQueue([])).toEqual([]);
  });

  it("orders queued docs by queuePosition ascending", () => {
    const docs = [
      makeDoc({ id: "c", queuePosition: 3, created: 3 }),
      makeDoc({ id: "a", queuePosition: 1, created: 1 }),
      makeDoc({ id: "b", queuePosition: 2, created: 2 }),
    ];

    expect(sortReadingQueue(docs).map((doc) => doc.id)).toEqual(["a", "b", "c"]);
  });

  it("treats null queuePosition values as queued docs and sorts them first", () => {
    const docs = [
      { id: "null-pos", position: 0, wordCount: 100, created: 1, queuePosition: null } as any,
      makeDoc({ id: "explicit-zero", queuePosition: 0, created: 2 }),
      makeDoc({ id: "later", queuePosition: 5, created: 3 }),
    ];

    expect(sortReadingQueue(docs as any).map((doc) => doc.id)).toEqual([
      "null-pos",
      "explicit-zero",
      "later",
    ]);
  });

  it("sorts in-progress docs by lastReadAt descending", () => {
    const docs = [
      makeDoc({ id: "old", position: 10, lastReadAt: 100 }),
      makeDoc({ id: "new", position: 20, lastReadAt: 300 }),
      makeDoc({ id: "mid", position: 30, lastReadAt: 200 }),
    ];

    expect(sortReadingQueue(docs).map((doc) => doc.id)).toEqual(["new", "mid", "old"]);
  });

  it("sorts unread docs by created descending", () => {
    const docs = [
      makeDoc({ id: "old", created: 100 }),
      makeDoc({ id: "new", created: 300 }),
      makeDoc({ id: "mid", created: 200 }),
    ];

    expect(sortReadingQueue(docs).map((doc) => doc.id)).toEqual(["new", "mid", "old"]);
  });

  it("filters completed docs out of the queue", () => {
    const docs = [
      makeDoc({ id: "complete-queued", position: 100, wordCount: 100, queuePosition: 1 }),
      makeDoc({ id: "complete-reading", position: 50, wordCount: 50, created: 2 }),
      makeDoc({ id: "active", queuePosition: 2, created: 3 }),
    ];

    expect(sortReadingQueue(docs).map((doc) => doc.id)).toEqual(["active"]);
  });

  it("returns an empty array when all docs are completed", () => {
    const docs = [
      makeDoc({ id: "done-1", position: 100, wordCount: 100, queuePosition: 1 }),
      makeDoc({ id: "done-2", position: 50, wordCount: 50, created: 2 }),
    ];

    expect(sortReadingQueue(docs)).toEqual([]);
  });
});

describe("getNextQueuedBook", () => {
  it("returns null when the queue is empty", () => {
    expect(getNextQueuedBook("current", [])).toBeNull();
  });

  it("returns null when all queued docs are completed", () => {
    const docs = [
      makeDoc({ id: "done-1", queuePosition: 1, position: 100, wordCount: 100 }),
      makeDoc({ id: "done-2", queuePosition: 2, position: 20, wordCount: 20 }),
    ];

    expect(getNextQueuedBook("current", docs)).toBeNull();
  });

  it("skips the current doc and returns the next queued doc", () => {
    const docs = [
      makeDoc({ id: "current", queuePosition: 1, created: 1 }),
      makeDoc({ id: "next", queuePosition: 2, created: 2 }),
    ];

    expect(getNextQueuedBook("current", docs)?.id).toBe("next");
  });

  it("skips completed docs when selecting the next queued book", () => {
    const docs = [
      makeDoc({ id: "done", queuePosition: 1, position: 100, wordCount: 100 }),
      makeDoc({ id: "active", queuePosition: 2, created: 2 }),
    ];

    expect(getNextQueuedBook("current", docs)?.id).toBe("active");
  });

  it("returns the lowest queuePosition among eligible docs", () => {
    const docs = [
      makeDoc({ id: "third", queuePosition: 3, created: 3 }),
      makeDoc({ id: "first", queuePosition: 1, created: 1 }),
      makeDoc({ id: "second", queuePosition: 2, created: 2 }),
    ];

    expect(getNextQueuedBook("current", docs)?.id).toBe("first");
  });
});

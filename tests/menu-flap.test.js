import { describe, it, expect } from "vitest";
import { sortReadingQueue, bubbleCount } from "../src/utils/queue.ts";

describe("bubbleCount", () => {
  it("returns 0 for 0% progress", () => {
    expect(bubbleCount(0)).toBe(0);
  });
  it("returns 7 for 70% progress", () => {
    expect(bubbleCount(70)).toBe(7);
  });
  it("returns 10 for 100% progress", () => {
    expect(bubbleCount(100)).toBe(10);
  });
  it("floors partial percentages", () => {
    expect(bubbleCount(15)).toBe(1);
    expect(bubbleCount(99)).toBe(9);
  });
});

describe("sortReadingQueue", () => {
  const docs = [
    { id: "1", title: "Unread New", position: 0, wordCount: 100, lastReadAt: null, created: 1710003000 },
    { id: "2", title: "In Progress Recent", position: 50, wordCount: 200, lastReadAt: 1710002000, created: 1710000000 },
    { id: "3", title: "In Progress Old", position: 30, wordCount: 100, lastReadAt: 1710001000, created: 1710000000 },
    { id: "4", title: "Unread Old", position: 0, wordCount: 100, lastReadAt: null, created: 1710001000 },
    { id: "5", title: "Completed", position: 100, wordCount: 100, lastReadAt: 1710003000, created: 1710000000 },
  ];

  it("excludes completed docs (progress >= 100%)", () => {
    const result = sortReadingQueue(docs);
    expect(result.find((d) => d.id === "5")).toBeUndefined();
  });

  it("puts in-progress docs before unread docs", () => {
    const result = sortReadingQueue(docs);
    const ids = result.map((d) => d.id);
    expect(ids).toEqual(["2", "3", "1", "4"]);
  });

  it("sorts in-progress by lastReadAt descending", () => {
    const result = sortReadingQueue(docs);
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
  });

  it("sorts unread by created descending", () => {
    const result = sortReadingQueue(docs);
    expect(result[2].id).toBe("1");
    expect(result[3].id).toBe("4");
  });

  it("returns empty array for empty input", () => {
    expect(sortReadingQueue([])).toEqual([]);
  });
});

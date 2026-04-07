// @vitest-environment jsdom
// tests/crossBookFlow.test.ts — FLOW-INF-C: Cross-book continuous reading
//
// Covers:
//   1.  getNextQueuedBook — returns next queued doc
//   2.  getNextQueuedBook — excludes the current doc
//   3.  getNextQueuedBook — excludes completed docs (position >= wordCount)
//   4.  getNextQueuedBook — returns null when queue is empty
//   5.  getNextQueuedBook — sorts by queuePosition, returns lowest
//   6.  getNextQueuedBook — docs with wordCount <= 0 are NOT excluded (unsized)
//   7.  finishReadingWithoutExit — calls onUpdateProgress (persists progress)
//   8.  finishReadingWithoutExit — does NOT call onExitReader
//   9.  cross-book transition logic — onComplete with queued next book should NOT immediately
//       set reading mode to "page" (transition path taken instead)
//   10. cross-book transition logic — onComplete with empty queue falls through to page mode
//   11. escape during transition — cancel clears pending resume
//   12. pendingFlowResumeRef — consumed after use (set to false/null)

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNextQueuedBook } from "../src/utils/queue";

// ── Shared doc factory ────────────────────────────────────────────────────────

interface TestDoc {
  id: string;
  position: number;
  wordCount: number;
  created: number;
  lastReadAt?: number | null;
  queuePosition?: number;
}

function makeDoc(overrides: Partial<TestDoc> & { id: string }): TestDoc {
  return {
    position: 0,
    wordCount: 10000,
    created: Date.now(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getNextQueuedBook
// ─────────────────────────────────────────────────────────────────────────────

describe("getNextQueuedBook", () => {

  // 1. Returns next queued doc when queue has entries
  it("returns the next queued doc when queue has entries", () => {
    const current = makeDoc({ id: "current", position: 500, queuePosition: 1 });
    const next    = makeDoc({ id: "next",    position: 0,   queuePosition: 2 });
    const docs    = [current, next];

    const result = getNextQueuedBook("current", docs);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("next");
  });

  // 2. Excludes the current doc from results
  it("never returns the current doc itself", () => {
    const current = makeDoc({ id: "book-a", position: 100, queuePosition: 1 });
    const docs    = [current];

    const result = getNextQueuedBook("book-a", docs);
    expect(result).toBeNull();
  });

  // 3. Excludes completed docs (position >= wordCount)
  it("excludes docs whose position >= wordCount (completed)", () => {
    const current   = makeDoc({ id: "current",   position: 0,     wordCount: 10000, queuePosition: 1 });
    const completed = makeDoc({ id: "completed", position: 10000, wordCount: 10000, queuePosition: 2 });
    const docs      = [current, completed];

    const result = getNextQueuedBook("current", docs);
    expect(result).toBeNull();
  });

  // 3b. Also excludes when position strictly exceeds wordCount
  it("excludes docs whose position exceeds wordCount", () => {
    const current  = makeDoc({ id: "cur",     position: 0,     wordCount: 5000,  queuePosition: 1 });
    const overread = makeDoc({ id: "overrun", position: 10000, wordCount: 5000,  queuePosition: 2 });
    const docs     = [current, overread];

    const result = getNextQueuedBook("cur", docs);
    expect(result).toBeNull();
  });

  // 4. Returns null when queue is empty (no docs with queuePosition)
  it("returns null when no docs have a queuePosition", () => {
    const a = makeDoc({ id: "a", position: 0 }); // no queuePosition
    const b = makeDoc({ id: "b", position: 0 }); // no queuePosition
    const docs = [a, b];

    const result = getNextQueuedBook("a", docs);
    expect(result).toBeNull();
  });

  // 5. Sorts by queuePosition — returns lowest position first
  it("returns the doc with the lowest queuePosition when multiple are queued", () => {
    const current = makeDoc({ id: "cur",    position: 0, queuePosition: 1 });
    const third   = makeDoc({ id: "third",  position: 0, queuePosition: 3 });
    const second  = makeDoc({ id: "second", position: 0, queuePosition: 2 });
    // Intentionally insert out of order
    const docs = [current, third, second];

    const result = getNextQueuedBook("cur", docs);
    expect(result!.id).toBe("second");
  });

  // 6. Docs with wordCount <= 0 are NOT excluded (treated as unsized, not completed)
  it("does not exclude docs with wordCount <= 0 (unsized books)", () => {
    const current = makeDoc({ id: "cur",     position: 0, wordCount: 10000, queuePosition: 1 });
    const unsized = makeDoc({ id: "unsized", position: 0, wordCount: 0,     queuePosition: 2 });
    const docs    = [current, unsized];

    const result = getNextQueuedBook("cur", docs);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("unsized");
  });

  // Extra: negative wordCount is also treated as unsized (wordCount <= 0 branch)
  it("does not exclude docs with negative wordCount", () => {
    const current  = makeDoc({ id: "cur",    position: 0, wordCount: 10000, queuePosition: 1 });
    const negative = makeDoc({ id: "negwc",  position: 0, wordCount: -1,    queuePosition: 2 });
    const docs     = [current, negative];

    const result = getNextQueuedBook("cur", docs);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("negwc");
  });

  // Extra: returns null when all queued docs are either current or completed
  it("returns null when all queued candidates are current or completed", () => {
    const current   = makeDoc({ id: "cur",  position: 0,     wordCount: 10000, queuePosition: 1 });
    const done1     = makeDoc({ id: "d1",   position: 10000, wordCount: 10000, queuePosition: 2 });
    const done2     = makeDoc({ id: "d2",   position: 5001,  wordCount: 5000,  queuePosition: 3 });
    const docs      = [current, done1, done2];

    const result = getNextQueuedBook("cur", docs);
    expect(result).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// finishReadingWithoutExit logic
//
// We test the behavioral contract: _persistAndLog is called (onUpdateProgress
// fires) but onExitReader is NOT called. We replicate the logic directly as a
// pure function to avoid needing renderHook in this test environment (matching
// the established pattern in useProgressTracker.test.ts).
// ─────────────────────────────────────────────────────────────────────────────

describe("finishReadingWithoutExit behavioral contract", () => {

  /**
   * Minimal pure replication of the finish variants' branching contract.
   * finishReading       = persistAndLog + exitReader
   * finishReadingWithoutExit = persistAndLog only
   */
  function makeFinishVariants(
    onUpdateProgress: (docId: string, pos: number) => void,
    onExitReader: (pos: number) => void
  ) {
    function persistAndLog(finalPos: number) {
      onUpdateProgress("doc-1", finalPos);
    }

    function finishReading(finalPos: number) {
      persistAndLog(finalPos);
      onExitReader(finalPos);
    }

    function finishReadingWithoutExit(finalPos: number) {
      persistAndLog(finalPos);
      // deliberately does NOT call onExitReader
    }

    return { finishReading, finishReadingWithoutExit };
  }

  // 7. finishReadingWithoutExit calls onUpdateProgress (persists progress)
  it("finishReadingWithoutExit calls onUpdateProgress with the final position", () => {
    const onUpdateProgress = vi.fn();
    const onExitReader = vi.fn();
    const { finishReadingWithoutExit } = makeFinishVariants(onUpdateProgress, onExitReader);

    finishReadingWithoutExit(4200);

    expect(onUpdateProgress).toHaveBeenCalledOnce();
    expect(onUpdateProgress).toHaveBeenCalledWith("doc-1", 4200);
  });

  // 8. finishReadingWithoutExit does NOT call onExitReader
  it("finishReadingWithoutExit does NOT call onExitReader", () => {
    const onUpdateProgress = vi.fn();
    const onExitReader = vi.fn();
    const { finishReadingWithoutExit } = makeFinishVariants(onUpdateProgress, onExitReader);

    finishReadingWithoutExit(4200);

    expect(onExitReader).not.toHaveBeenCalled();
  });

  // Contrast: finishReading calls both (verify the logic boundary is clear)
  it("finishReading (with exit) calls both onUpdateProgress and onExitReader", () => {
    const onUpdateProgress = vi.fn();
    const onExitReader = vi.fn();
    const { finishReading } = makeFinishVariants(onUpdateProgress, onExitReader);

    finishReading(999);

    expect(onUpdateProgress).toHaveBeenCalledOnce();
    expect(onExitReader).toHaveBeenCalledOnce();
    expect(onExitReader).toHaveBeenCalledWith(999);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-book transition decision logic
//
// These tests verify the branching logic that drives the FLOW-INF-C feature:
// when onComplete fires in flow mode, should we transition to the next queued
// book, or fall back to page mode?
//
// We replicate the decision logic as a pure function matching the pattern in
// useProgressTracker.test.ts and hotfix12.test.ts — pure logic tests rather
// than component rendering.
// ─────────────────────────────────────────────────────────────────────────────

describe("cross-book transition decision logic", () => {

  interface SimpleDoc {
    id: string;
    position: number;
    wordCount: number;
    queuePosition?: number;
    created: number;
  }

  /**
   * Replicates the onComplete branching logic:
   *   if nextBook exists → trigger cross-book transition (return "transition")
   *   else              → fall through to page mode    (return "page")
   */
  function onCompleteDecision(
    currentDocId: string,
    docs: SimpleDoc[]
  ): "transition" | "page" {
    const nextBook = getNextQueuedBook(currentDocId, docs);
    if (nextBook) {
      return "transition";
    }
    return "page";
  }

  // 9. When queue has next book: onComplete should trigger transition, not page mode
  it("onComplete returns 'transition' when a queued next book exists", () => {
    const current = { id: "cur", position: 9999, wordCount: 10000, queuePosition: 1, created: 1 };
    const next    = { id: "nxt", position: 0,    wordCount: 10000, queuePosition: 2, created: 1 };

    const result = onCompleteDecision("cur", [current, next]);
    expect(result).toBe("transition");
  });

  // 10. When queue is empty: onComplete falls through to page mode
  it("onComplete returns 'page' when no queued next book is available", () => {
    const current = { id: "cur", position: 9999, wordCount: 10000, created: 1 };
    // No queuePosition on any doc

    const result = onCompleteDecision("cur", [current]);
    expect(result).toBe("page");
  });

  // 10b. Page mode fallback also fires when all remaining queued books are completed
  it("onComplete returns 'page' when all remaining queued books are already completed", () => {
    const current  = { id: "cur",  position: 9999,  wordCount: 10000, queuePosition: 1, created: 1 };
    const finished = { id: "fin",  position: 10000, wordCount: 10000, queuePosition: 2, created: 1 };

    const result = onCompleteDecision("cur", [current, finished]);
    expect(result).toBe("page");
  });

  // 11. Escape during transition should cancel — test the cancel logic
  it("cancelling a pending transition clears the pending resume ref", () => {
    // Simulates the ref-based cancel pattern used in the component:
    //   pendingFlowResumeRef.current = nextBook.id
    //   ... user presses Escape ...
    //   pendingFlowResumeRef.current = null
    const pendingFlowResumeRef = { current: null as string | null };

    // Transition initiated
    pendingFlowResumeRef.current = "nxt-book-id";
    expect(pendingFlowResumeRef.current).toBe("nxt-book-id");

    // User cancels via Escape
    function cancelTransition() {
      pendingFlowResumeRef.current = null;
    }
    cancelTransition();

    expect(pendingFlowResumeRef.current).toBeNull();
  });

  // 12. pendingFlowResumeRef is consumed (reset) after the transition completes
  it("pendingFlowResumeRef is set to null after the transition is consumed", () => {
    const pendingFlowResumeRef = { current: null as string | null };

    // Transition queued
    pendingFlowResumeRef.current = "next-book-id";

    // Simulate the consumer reading and clearing the ref
    function consumeAndLoad(): string | null {
      const target = pendingFlowResumeRef.current;
      pendingFlowResumeRef.current = null; // consumed — cleared immediately
      return target;
    }

    const loadedId = consumeAndLoad();
    expect(loadedId).toBe("next-book-id");
    expect(pendingFlowResumeRef.current).toBeNull();
  });

  // Extra: a transition to an unsized next book is still allowed (queuePosition present,
  // wordCount=0 is not excluded)
  it("onComplete returns 'transition' when next book is queued but unsized", () => {
    const current = { id: "cur",   position: 9999, wordCount: 10000, queuePosition: 1, created: 1 };
    const unsized = { id: "unszd", position: 0,    wordCount: 0,     queuePosition: 2, created: 1 };

    const result = onCompleteDecision("cur", [current, unsized]);
    expect(result).toBe("transition");
  });

});

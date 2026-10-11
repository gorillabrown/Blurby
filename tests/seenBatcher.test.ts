import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSeenBatcher } from "../src/utils/seenBatcher";

const dwellMs = 1000;
const flushDelayMs = 400;

describe("LIBRARY-SETTINGS-FIX-1: seen batcher", () => {
  let onFlush: ReturnType<typeof vi.fn>;
  let batcher: ReturnType<typeof createSeenBatcher>;

  beforeEach(() => {
    vi.useFakeTimers();
    onFlush = vi.fn();
    batcher = createSeenBatcher({ dwellMs, flushDelayMs, onFlush });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("(1) does nothing before the dwell completes", () => {
    batcher.enter("a");
    vi.advanceTimersByTime(dwellMs - 1);
    expect(onFlush).not.toHaveBeenCalled();
  });

  it("(2) flushes once after dwell plus flush delay", () => {
    batcher.enter("a");
    vi.advanceTimersByTime(dwellMs + flushDelayMs);
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(["a"]);
  });

  it("(3) batches ids entered together into one flush", () => {
    batcher.enter("a");
    batcher.enter("b");
    vi.advanceTimersByTime(dwellMs + flushDelayMs);
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush.mock.calls[0][0].sort()).toEqual(["a", "b"]);
  });

  it("(4) leave before the dwell completes means no flush", () => {
    batcher.enter("a");
    vi.advanceTimersByTime(dwellMs - 1);
    batcher.leave("a");
    vi.advanceTimersByTime(dwellMs + flushDelayMs);
    expect(onFlush).not.toHaveBeenCalled();
  });

  it("(5) cancelPending after the dwell keeps the id for flush()", () => {
    batcher.enter("a");
    vi.advanceTimersByTime(dwellMs);
    batcher.cancelPending();
    batcher.flush();
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(["a"]);
    vi.advanceTimersByTime(flushDelayMs);
    expect(onFlush).toHaveBeenCalledTimes(1);
  });

  it("(6) dispose flushes a seen id immediately", () => {
    batcher.enter("a");
    vi.advanceTimersByTime(dwellMs);
    batcher.dispose();
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(["a"]);
  });

  it("(7) an id already flushed is not re-flushed on a second enter", () => {
    batcher.enter("a");
    vi.advanceTimersByTime(dwellMs + flushDelayMs);
    batcher.enter("a");
    vi.advanceTimersByTime(dwellMs + flushDelayMs);
    expect(onFlush).toHaveBeenCalledTimes(1);
  });
});

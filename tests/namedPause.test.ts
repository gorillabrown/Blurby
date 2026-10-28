import { describe, expect, it } from "vitest";
import {
  createInitialNarrationState,
  narrationReducer,
  type PauseReason,
} from "../src/types/narration";
import { resolveMediaSessionPlaybackState } from "../src/utils/mediaSessionBridge";

const ALL_REASONS: PauseReason[] = [
  "user-stop",
  "rate-change",
  "voice-change",
  "forward-seek",
  "backward-seek",
  "mode-switch",
  "book-end",
];

const AUTO_RESUME_REASONS: PauseReason[] = [
  "rate-change",
  "voice-change",
  "forward-seek",
  "backward-seek",
];

describe("named pause reducer semantics", () => {
  it.each(ALL_REASONS)("PAUSE from speaking stores pauseReason=%s", (reason) => {
    const start = {
      ...createInitialNarrationState(),
      status: "speaking" as const,
      cursorWordIndex: 42,
    };
    const next = narrationReducer(start, { type: "PAUSE", reason });
    expect(next.status).toBe("paused");
    expect(next.pauseReason).toBe(reason);
    expect(next.cursorWordIndex).toBe(42);
  });

  it.each(ALL_REASONS)("RESUME clears pauseReason after pauseReason=%s", (reason) => {
    const paused = {
      ...createInitialNarrationState(),
      status: "paused" as const,
      pauseReason: reason,
      cursorWordIndex: 7,
    };
    const resumed = narrationReducer(paused, { type: "RESUME" });
    expect(resumed.status).toBe("speaking");
    expect(resumed.pauseReason).toBeNull();
    expect(resumed.cursorWordIndex).toBe(7);
  });

  it("START_CURSOR_DRIVEN clears stale pauseReason", () => {
    const paused = {
      ...createInitialNarrationState(),
      status: "paused" as const,
      pauseReason: "mode-switch" as PauseReason,
    };
    const next = narrationReducer(paused, { type: "START_CURSOR_DRIVEN", startIdx: 9, speed: 1.3 });
    expect(next.status).toBe("speaking");
    expect(next.pauseReason).toBeNull();
    expect(next.cursorWordIndex).toBe(9);
  });

  it("STOP clears pauseReason", () => {
    const paused = {
      ...createInitialNarrationState(),
      status: "paused" as const,
      pauseReason: "book-end" as PauseReason,
      chunkWords: ["one"],
      chunkStart: 3,
    };
    const next = narrationReducer(paused, { type: "STOP" });
    expect(next.status).toBe("idle");
    expect(next.pauseReason).toBeNull();
    expect(next.chunkWords).toEqual([]);
    expect(next.chunkStart).toBe(0);
  });
});

describe("named pause MediaSession mapping", () => {
  it.each(AUTO_RESUME_REASONS)("auto-resume reason=%s reports playing", (reason) => {
    expect(resolveMediaSessionPlaybackState("paused", reason)).toBe("playing");
  });

  it("user-stop reports paused", () => {
    expect(resolveMediaSessionPlaybackState("paused", "user-stop")).toBe("paused");
  });

  it("mode-switch reports paused", () => {
    expect(resolveMediaSessionPlaybackState("paused", "mode-switch")).toBe("paused");
  });

  it("book-end reports paused", () => {
    expect(resolveMediaSessionPlaybackState("paused", "book-end")).toBe("paused");
  });

  it("holding and warming remain paused", () => {
    expect(resolveMediaSessionPlaybackState("holding")).toBe("paused");
    expect(resolveMediaSessionPlaybackState("warming")).toBe("paused");
  });
});

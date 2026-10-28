import { describe, it, expect } from "vitest";
import {
  narrationReducer,
  createInitialNarrationState,
  type NarrationState,
} from "../src/types/narration";

describe("narrationReducer", () => {
  // --- Initial state ---

  it("createInitialNarrationState returns idle status, web engine, all zeros/nulls", () => {
    const state = createInitialNarrationState();
    expect(state).toEqual({
      status: "idle",
      engine: "web",
      chunkStart: 0,
      chunkWords: [],
      cursorWordIndex: 0,
      kokoroReady: false,
      kokoroDownloading: false,
      kokoroDownloadProgress: 0,
      kokoroStatus: {
        status: "idle",
        detail: null,
        reason: null,
        ready: false,
        loading: false,
        recoverable: false,
      },
      qwenReady: false,
      qwenStatus: {
        status: "idle",
        detail: null,
        reason: null,
        ready: false,
        loading: false,
        recoverable: false,
      },
      generationId: 0,
      speed: 1.0,
      pageEndWord: null,
    });
  });

  // --- START_CURSOR_DRIVEN ---

  it("START_CURSOR_DRIVEN sets status to speaking, cursorWordIndex, speed, chunkStart, clears chunkWords", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "START_CURSOR_DRIVEN", startIdx: 10, speed: 1.5 });
    expect(next.status).toBe("speaking");
    expect(next.cursorWordIndex).toBe(10);
    expect(next.speed).toBe(1.5);
    expect(next.chunkStart).toBe(10);
    expect(next.chunkWords).toEqual([]);
  });

  // --- WORD_ADVANCE ---

  it("WORD_ADVANCE updates cursorWordIndex only", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "speaking", cursorWordIndex: 5 };
    const next = narrationReducer(state, { type: "WORD_ADVANCE", wordIndex: 8 });
    expect(next.cursorWordIndex).toBe(8);
    expect(next.status).toBe("speaking");
  });

  // --- CHUNK_COMPLETE ---

  it("CHUNK_COMPLETE sets cursorWordIndex to endIdx", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "speaking", cursorWordIndex: 5 };
    const next = narrationReducer(state, { type: "CHUNK_COMPLETE", endIdx: 20 });
    expect(next.cursorWordIndex).toBe(20);
  });

  // --- PAUSE guards ---

  it("PAUSE from speaking transitions to paused", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "speaking" };
    const next = narrationReducer(state, { type: "PAUSE" });
    expect(next.status).toBe("paused");
  });

  it("PAUSE from idle is a no-op", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "PAUSE" });
    expect(next).toBe(state); // same reference — guard returned state unchanged
  });

  it("PAUSE from paused is a no-op", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "paused" };
    const next = narrationReducer(state, { type: "PAUSE" });
    expect(next).toBe(state);
  });

  it("PAUSE from holding is a no-op", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "holding" };
    const next = narrationReducer(state, { type: "PAUSE" });
    expect(next).toBe(state);
  });

  // --- RESUME guards ---

  it("RESUME from paused transitions to speaking", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "paused" };
    const next = narrationReducer(state, { type: "RESUME" });
    expect(next.status).toBe("speaking");
  });

  it("RESUME from holding transitions to speaking", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "holding" };
    const next = narrationReducer(state, { type: "RESUME" });
    expect(next.status).toBe("speaking");
  });

  it("RESUME from idle is a no-op", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "RESUME" });
    expect(next).toBe(state);
  });

  it("RESUME from speaking is a no-op", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "speaking" };
    const next = narrationReducer(state, { type: "RESUME" });
    expect(next).toBe(state);
  });

  // --- STOP ---

  it("STOP resets to idle, clears chunkStart, chunkWords", () => {
    const state: NarrationState = {
      ...createInitialNarrationState(),
      status: "speaking",
      chunkStart: 15,
      chunkWords: ["hello", "world"],
      cursorWordIndex: 20,
    };
    const next = narrationReducer(state, { type: "STOP" });
    expect(next.status).toBe("idle");
    expect(next.chunkStart).toBe(0);
    expect(next.chunkWords).toEqual([]);
    // cursorWordIndex is NOT reset by STOP
    expect(next.cursorWordIndex).toBe(20);
  });

  // --- HOLD / RESUME_CHAINING ---

  it("HOLD from speaking transitions to holding", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "speaking" };
    const next = narrationReducer(state, { type: "HOLD" });
    expect(next.status).toBe("holding");
  });

  it("HOLD from idle is a no-op", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "HOLD" });
    expect(next).toBe(state);
  });

  it("RESUME_CHAINING from holding transitions to speaking", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "holding" };
    const next = narrationReducer(state, { type: "RESUME_CHAINING" });
    expect(next.status).toBe("speaking");
  });

  it("RESUME_CHAINING from idle is a no-op", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "RESUME_CHAINING" });
    expect(next).toBe(state);
  });

  // --- SET_SPEED ---

  it("SET_SPEED updates speed and increments generationId", () => {
    const state: NarrationState = {
      ...createInitialNarrationState(),
      speed: 1.0,
      generationId: 3,
    };
    const next = narrationReducer(state, { type: "SET_SPEED", speed: 2.0 });
    expect(next.speed).toBe(2.0);
    expect(next.generationId).toBe(4);
  });

  // --- SET_ENGINE / KOKORO_READY / KOKORO_DOWNLOAD_PROGRESS ---

  it("SET_ENGINE updates engine", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "SET_ENGINE", engine: "kokoro" });
    expect(next.engine).toBe("kokoro");
  });

  it("SET_ENGINE accepts qwen without coercing it away", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "SET_ENGINE", engine: "qwen" });
    expect(next.engine).toBe("qwen");
  });

  it("KOKORO_READY sets kokoroReady=true, kokoroDownloading=false", () => {
    const state: NarrationState = { ...createInitialNarrationState(), kokoroDownloading: true, kokoroDownloadProgress: 50 };
    const next = narrationReducer(state, { type: "KOKORO_READY" });
    expect(next.kokoroReady).toBe(true);
    expect(next.kokoroDownloading).toBe(false);
  });

  it("SYNC_KOKORO_STATUS follows the authoritative snapshot and clears stale ready state on error", () => {
    const readyState: NarrationState = narrationReducer(createInitialNarrationState(), { type: "KOKORO_READY" });
    expect(readyState.kokoroReady).toBe(true);

    const next = narrationReducer(readyState, {
      type: "SYNC_KOKORO_STATUS",
      snapshot: {
        status: "error",
        detail: "Warm-up failed",
        reason: "warm-up-failed",
        ready: false,
        loading: false,
        recoverable: false,
      },
    });

    expect(next.kokoroReady).toBe(false);
    expect(next.kokoroDownloading).toBe(false);
    expect(next.kokoroStatus).toMatchObject({
      status: "error",
      reason: "warm-up-failed",
      ready: false,
      loading: false,
      recoverable: false,
    });
  });

  it("SYNC_KOKORO_STATUS resets ready state back to idle without leaving stale readiness behind", () => {
    const readyState: NarrationState = narrationReducer(createInitialNarrationState(), { type: "KOKORO_READY" });
    const next = narrationReducer(readyState, {
      type: "SYNC_KOKORO_STATUS",
      snapshot: {
        status: "idle",
        detail: null,
        reason: null,
        ready: false,
        loading: false,
        recoverable: false,
      },
    });

    expect(next.kokoroReady).toBe(false);
    expect(next.kokoroStatus).toMatchObject({
      status: "idle",
      ready: false,
      loading: false,
      recoverable: false,
    });
  });

  // --- ERROR ---

  it("ERROR sets status to error", () => {
    const state: NarrationState = { ...createInitialNarrationState(), status: "speaking" };
    const next = narrationReducer(state, { type: "ERROR", message: "TTS failed" });
    expect(next.status).toBe("error");
  });

  // --- INCREMENT_GENERATION_ID ---

  it("INCREMENT_GENERATION_ID increments generationId", () => {
    const state: NarrationState = {
      ...createInitialNarrationState(),
      generationId: 5,
    };
    const next = narrationReducer(state, { type: "INCREMENT_GENERATION_ID" });
    expect(next.generationId).toBe(6);
  });

  // --- KOKORO_DOWNLOAD_PROGRESS ---

  it("KOKORO_DOWNLOAD_PROGRESS sets kokoroDownloading=true and progress", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "KOKORO_DOWNLOAD_PROGRESS", progress: 42 });
    expect(next.kokoroDownloading).toBe(true);
    expect(next.kokoroDownloadProgress).toBe(42);
  });

  // --- SET_PAGE_END ---

  it("SET_PAGE_END sets pageEndWord", () => {
    const state = createInitialNarrationState();
    const next = narrationReducer(state, { type: "SET_PAGE_END", endIdx: 100 });
    expect(next.pageEndWord).toBe(100);
    const next2 = narrationReducer(next, { type: "SET_PAGE_END", endIdx: null });
    expect(next2.pageEndWord).toBeNull();
  });
});

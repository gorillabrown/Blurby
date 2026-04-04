// @vitest-environment jsdom
// tests/kokoroStartupRecovery.test.ts — Tests for TTS-6D startup/recovery hardening
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  narrationReducer,
  createInitialNarrationState,
  type NarrationState,
} from "../src/types/narration";

// ── Warming State in Narration Reducer ──────────────────────────────────────

describe("narration reducer — warming state", () => {
  let initial: NarrationState;

  beforeEach(() => {
    initial = createInitialNarrationState();
  });

  it("KOKORO_WARMING sets status to warming and captures start position", () => {
    const state = narrationReducer(initial, {
      type: "KOKORO_WARMING",
      startIdx: 42,
      speed: 1.2,
    });
    expect(state.status).toBe("warming");
    expect(state.cursorWordIndex).toBe(42);
    expect(state.speed).toBe(1.2);
  });

  it("KOKORO_READY while warming preserves cursor position", () => {
    const warming = narrationReducer(initial, {
      type: "KOKORO_WARMING",
      startIdx: 100,
      speed: 1.0,
    });
    const ready = narrationReducer(warming, { type: "KOKORO_READY" });
    expect(ready.kokoroReady).toBe(true);
    // Position should be preserved so auto-resume starts from correct word
    expect(ready.cursorWordIndex).toBe(100);
    // Status stays warming — the useEffect in useNarration handles the transition to speaking
    expect(ready.status).toBe("warming");
  });

  it("STOP resets warming state to idle", () => {
    const warming = narrationReducer(initial, {
      type: "KOKORO_WARMING",
      startIdx: 50,
      speed: 1.0,
    });
    const stopped = narrationReducer(warming, { type: "STOP" });
    expect(stopped.status).toBe("idle");
    expect(stopped.cursorWordIndex).toBe(50); // position preserved in state
  });

  it("warming status is distinct from speaking and idle", () => {
    expect(initial.status).toBe("idle");

    const speaking = narrationReducer(initial, {
      type: "START_CURSOR_DRIVEN",
      startIdx: 0,
      speed: 1.0,
    });
    expect(speaking.status).toBe("speaking");

    const warming = narrationReducer(initial, {
      type: "KOKORO_WARMING",
      startIdx: 0,
      speed: 1.0,
    });
    expect(warming.status).toBe("warming");
    expect(warming.status).not.toBe("speaking");
    expect(warming.status).not.toBe("idle");
  });
});

// ── Engine Status Event Model ───────────────────────────────────────────────

describe("engine status event model", () => {
  it("NarrationStatus type includes warming", () => {
    // Type-level test: warming is a valid NarrationStatus value
    const state = createInitialNarrationState();
    const warming = narrationReducer(state, {
      type: "KOKORO_WARMING",
      startIdx: 0,
      speed: 1.0,
    });
    expect(["idle", "loading", "speaking", "paused", "holding", "error", "warming"]).toContain(warming.status);
  });

  it("ERROR action sets error status from any state", () => {
    const warming = narrationReducer(createInitialNarrationState(), {
      type: "KOKORO_WARMING",
      startIdx: 10,
      speed: 1.0,
    });
    const errored = narrationReducer(warming, { type: "ERROR", message: "Worker crashed" });
    expect(errored.status).toBe("error");
  });

  it("cold start sequence: idle → warming → ready → speaking", () => {
    let state = createInitialNarrationState();
    expect(state.status).toBe("idle");

    // User starts narration while Kokoro not ready
    state = narrationReducer(state, { type: "KOKORO_WARMING", startIdx: 0, speed: 1.0 });
    expect(state.status).toBe("warming");

    // Kokoro becomes ready
    state = narrationReducer(state, { type: "KOKORO_READY" });
    expect(state.kokoroReady).toBe(true);

    // useNarration effect transitions to speaking
    state = narrationReducer(state, { type: "START_CURSOR_DRIVEN", startIdx: 0, speed: 1.0 });
    expect(state.status).toBe("speaking");
  });
});

// ── Delayed Prewarm Behavior ────────────────────────────────────────────────

describe("delayed prewarm policy", () => {
  it("prewarm is a no-op when already ready", () => {
    // The main process ensureReady() returns immediately when modelReady=true
    // This test documents that contract
    let state = createInitialNarrationState();
    state = narrationReducer(state, { type: "KOKORO_READY" });
    expect(state.kokoroReady).toBe(true);
    // Starting narration from ready state goes directly to speaking
    state = narrationReducer(state, { type: "START_CURSOR_DRIVEN", startIdx: 0, speed: 1.0 });
    expect(state.status).toBe("speaking");
  });
});

// ── Recovery Path ───────────────────────────────────────────────────────────

describe("crash recovery path", () => {
  it("terminal failure surfaces error to narration state", () => {
    const state = narrationReducer(createInitialNarrationState(), {
      type: "ERROR",
      message: "Worker crashed after 3 attempts",
    });
    expect(state.status).toBe("error");
  });

  it("recovery after error: can re-enter warming", () => {
    let state = narrationReducer(createInitialNarrationState(), {
      type: "ERROR",
      message: "crash",
    });
    expect(state.status).toBe("error");

    // After STOP (user retries), can enter warming again
    state = narrationReducer(state, { type: "STOP" });
    state = narrationReducer(state, { type: "KOKORO_WARMING", startIdx: 0, speed: 1.0 });
    expect(state.status).toBe("warming");
  });
});

// ── Web Speech Unchanged ────────────────────────────────────────────────────

describe("Web Speech startup unchanged", () => {
  it("Web Speech goes directly to speaking (no warming state)", () => {
    let state = createInitialNarrationState();
    // Web Speech is the default engine — no kokoroReady check needed
    state = narrationReducer(state, { type: "START_CURSOR_DRIVEN", startIdx: 0, speed: 1.0 });
    expect(state.status).toBe("speaking");
    expect(state.engine).toBe("web");
  });
});

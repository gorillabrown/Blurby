/**
 * NARRATE-DUAL-SOURCE-DIAG-1 (Wave B) — Flag-gating unit tests
 *
 * Verifies the flag-gated no-op contract of dualSourceDiag.ts:
 *  (a) logDualSourceTransition does NOT call console.debug when the flag is unset
 *  (b) logDualSourceTransition DOES emit when localStorage.BLURBY_DUAL_SOURCE_DIAG === '1'
 *  (c) isDualSourceDiagEnabled returns false when localStorage throws
 *
 * These tests have ZERO production impact — they validate the diagnostic tooling only.
 * Remove this file in Wave C when the instrumentation is removed.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isDualSourceDiagEnabled, logDualSourceTransition } from "../src/utils/dualSourceDiag";

// ── localStorage mock helpers ──────────────────────────────────────────────

function mockLocalStorage(value: string | null): () => void {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const store: Record<string, string> = {};
  if (value !== null) {
    store["BLURBY_DUAL_SOURCE_DIAG"] = value;
  }
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      length: 0,
      key: () => null,
    },
  });
  return () => {
    if (original) {
      Object.defineProperty(globalThis, "localStorage", original);
    }
  };
}

function mockLocalStorageThrowing(): () => void {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("localStorage access denied (security context)");
    },
  });
  return () => {
    if (original) {
      Object.defineProperty(globalThis, "localStorage", original);
    }
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("dualSourceDiag — flag-gating contract", () => {
  let restoreDebug: () => void;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    restoreDebug = () => { debugSpy.mockRestore(); };
  });

  afterEach(() => {
    restoreDebug();
  });

  // (a) Flag unset — must be a complete no-op (thunk must NOT be invoked)
  it("does NOT call console.debug when flag is absent (localStorage returns null)", () => {
    const restore = mockLocalStorage(null);
    try {
      logDualSourceTransition("speakNextChunkKokoro:seed", () => ({ cursorWordIndex: 42 }));
      expect(debugSpy).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it("does NOT call console.debug when flag is '0'", () => {
    const restore = mockLocalStorage("0");
    try {
      logDualSourceTransition("pause:entry", () => ({ cursorWordIndex: 100 }));
      expect(debugSpy).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it("does NOT call console.debug when flag is 'true' (wrong value)", () => {
    const restore = mockLocalStorage("true");
    try {
      logDualSourceTransition("resume:bare", () => ({ engine: "kokoro" }));
      expect(debugSpy).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  // (a-key) Flag off — thunk must NEVER be invoked (regression guard for lazy-eval contract)
  it("does NOT invoke the thunk when flag is off", () => {
    const restore = mockLocalStorage(null);
    let thunkCallCount = 0;
    try {
      logDualSourceTransition("speakNextChunkKokoro:seed", () => {
        thunkCallCount++;
        return { cursorWordIndex: 42 };
      });
      expect(thunkCallCount).toBe(0);
      expect(debugSpy).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  // (b) Flag set to '1' — must emit structured log
  it("calls console.debug with [DUAL-SOURCE-DIAG] prefix when flag is '1'", () => {
    const restore = mockLocalStorage("1");
    try {
      logDualSourceTransition("speakNextChunkKokoro:seed", () => ({ cursorWordIndex: 42, startIdx: 42 }));
      expect(debugSpy).toHaveBeenCalledTimes(1);
      const [prefix, pathId, payload] = debugSpy.mock.calls[0];
      expect(prefix).toBe("[DUAL-SOURCE-DIAG]");
      expect(pathId).toBe("speakNextChunkKokoro:seed");
      expect(typeof payload).toBe("string");
      const parsed = JSON.parse(payload as string);
      expect(parsed.t).toBe("speakNextChunkKokoro:seed");
      expect(parsed.cursorWordIndex).toBe(42);
      expect(parsed.startIdx).toBe(42);
    } finally {
      restore();
    }
  });

  it("includes all provided fields in the JSON payload", () => {
    const restore = mockLocalStorage("1");
    try {
      logDualSourceTransition("resumeAnchor:consumed", () => ({
        resumeAnchor: null,
        source: "ReaderContainer:onWordClick:no-resolved-index",
      }));
      const payload = JSON.parse(debugSpy.mock.calls[0][2] as string);
      expect(payload.resumeAnchor).toBeNull();
      expect(payload.source).toBe("ReaderContainer:onWordClick:no-resolved-index");
    } finally {
      restore();
    }
  });

  // (c) localStorage throws — must return false and not throw
  it("isDualSourceDiagEnabled returns false when localStorage throws", () => {
    const restore = mockLocalStorageThrowing();
    try {
      const result = isDualSourceDiagEnabled();
      expect(result).toBe(false);
    } finally {
      restore();
    }
  });

  it("logDualSourceTransition does not throw when localStorage throws", () => {
    const restore = mockLocalStorageThrowing();
    try {
      expect(() => {
        logDualSourceTransition("resume:cursor-mismatch", () => ({ cursorWordIndex: 0 }));
      }).not.toThrow();
      expect(debugSpy).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });
});

describe("dualSourceDiag — isDualSourceDiagEnabled", () => {
  it("returns false when flag is not set", () => {
    const restore = mockLocalStorage(null);
    try {
      expect(isDualSourceDiagEnabled()).toBe(false);
    } finally {
      restore();
    }
  });

  it("returns true when flag is '1'", () => {
    const restore = mockLocalStorage("1");
    try {
      expect(isDualSourceDiagEnabled()).toBe(true);
    } finally {
      restore();
    }
  });

  it("returns false when flag is any other string", () => {
    for (const val of ["0", "true", "yes", "enabled", ""]) {
      const restore = mockLocalStorage(val);
      try {
        expect(isDualSourceDiagEnabled()).toBe(false);
      } finally {
        restore();
      }
    }
  });
});

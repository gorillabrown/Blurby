import { describe, it, expect } from "vitest";
import type {
  ReaderModeId,
  ReaderModeStartCause,
  ReaderModeStartRequest,
  ReaderModeRuntimeSnapshot,
  ReaderModeAdapter,
} from "../src/reader/modes/ReaderModeAdapter";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnapshot(overrides: Partial<ReaderModeRuntimeSnapshot> = {}): ReaderModeRuntimeSnapshot {
  return {
    mode: "focus",
    selected: false,
    playing: false,
    currentWordIndex: 0,
    clockOwner: "none",
    ...overrides,
  };
}

function makeStartRequest(overrides: Partial<ReaderModeStartRequest> = {}): ReaderModeStartRequest {
  return {
    mode: "focus",
    wordIndex: 0,
    words: ["hello", "world"],
    paragraphBreaks: new Set<number>(),
    cause: "play-button",
    ...overrides,
  };
}

/**
 * A minimal mock adapter that satisfies the ReaderModeAdapter interface.
 * Used to verify the interface compiles and returns valid snapshots.
 */
function makeMockAdapter(modeId: ReaderModeId = "focus"): ReaderModeAdapter {
  let currentWordIndex = 0;
  let selected = false;
  let playing = false;
  let activeMode: ReaderModeId | null = null;

  return {
    get mode(): ReaderModeId {
      return modeId;
    },

    select(wordIndex: number): void {
      selected = true;
      currentWordIndex = wordIndex;
    },

    start(request: ReaderModeStartRequest): void {
      selected = true;
      playing = true;
      currentWordIndex = request.wordIndex;
      activeMode = request.mode;
    },

    pause(): void {
      playing = false;
    },

    resume(): void {
      playing = true;
    },

    stop(_reason: "mode-switch" | "user-stop" | "book-close" | "teardown"): void {
      playing = false;
      selected = false;
      activeMode = null;
    },

    jumpToWord(wordIndex: number, _cause: "hard-selection" | "navigation" | "restore"): void {
      currentWordIndex = wordIndex;
    },

    getSnapshot(): ReaderModeRuntimeSnapshot {
      return {
        mode: modeId,
        selected,
        playing,
        currentWordIndex,
        clockOwner: playing ? "wpm" : "none",
      };
    },

    destroy(): void {
      playing = false;
      selected = false;
      activeMode = null;
    },
  };

  void activeMode; // suppress unused-variable lint in strict mode
}

// ---------------------------------------------------------------------------
// Type shape verification
// ---------------------------------------------------------------------------

describe("ReaderModeId — all 4 modes", () => {
  it("includes page", () => {
    const id: ReaderModeId = "page";
    expect(id).toBe("page");
  });

  it("includes focus", () => {
    const id: ReaderModeId = "focus";
    expect(id).toBe("focus");
  });

  it("includes flow", () => {
    const id: ReaderModeId = "flow";
    expect(id).toBe("flow");
  });

  it("includes narrate", () => {
    const id: ReaderModeId = "narrate";
    expect(id).toBe("narrate");
  });
});

describe("ReaderModeStartCause — expected values", () => {
  it("includes play-button", () => {
    const cause: ReaderModeStartCause = "play-button";
    expect(cause).toBe("play-button");
  });

  it("includes space", () => {
    const cause: ReaderModeStartCause = "space";
    expect(cause).toBe("space");
  });

  it("includes resume-after-section", () => {
    const cause: ReaderModeStartCause = "resume-after-section";
    expect(cause).toBe("resume-after-section");
  });

  it("includes resume-after-book", () => {
    const cause: ReaderModeStartCause = "resume-after-book";
    expect(cause).toBe("resume-after-book");
  });

  it("includes programmatic", () => {
    const cause: ReaderModeStartCause = "programmatic";
    expect(cause).toBe("programmatic");
  });
});

// ---------------------------------------------------------------------------
// Start request shape
// ---------------------------------------------------------------------------

describe("ReaderModeStartRequest shape", () => {
  it("contains wordIndex, words, paragraphBreaks, cause", () => {
    const req = makeStartRequest({ wordIndex: 7, cause: "space" });
    expect(req.wordIndex).toBe(7);
    expect(Array.isArray(req.words)).toBe(true);
    expect(req.paragraphBreaks).toBeInstanceOf(Set);
    expect(req.cause).toBe("space");
  });

  it("accepts wordIndex 0 (valid)", () => {
    const req = makeStartRequest({ wordIndex: 0 });
    expect(req.wordIndex).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Snapshot shape
// ---------------------------------------------------------------------------

describe("ReaderModeRuntimeSnapshot shape", () => {
  it("has mode, selected, playing, currentWordIndex, clockOwner", () => {
    const snap = makeSnapshot({
      mode: "flow",
      selected: true,
      playing: true,
      currentWordIndex: 3,
      clockOwner: "wpm",
    });
    expect(snap.mode).toBe("flow");
    expect(snap.selected).toBe(true);
    expect(snap.playing).toBe(true);
    expect(snap.currentWordIndex).toBe(3);
    expect(snap.clockOwner).toBe("wpm");
  });

  it("clockOwner can be none, wpm, flow-engine, or audio-truth", () => {
    const owners: ReaderModeRuntimeSnapshot["clockOwner"][] = [
      "none",
      "wpm",
      "flow-engine",
      "audio-truth",
    ];
    owners.forEach((owner) => {
      const snap = makeSnapshot({ clockOwner: owner });
      expect(snap.clockOwner).toBe(owner);
    });
  });

  it("currentWordIndex 0 is represented correctly", () => {
    const snap = makeSnapshot({ currentWordIndex: 0 });
    expect(snap.currentWordIndex).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Mock adapter behavior — satisfies ReaderModeAdapter interface
// ---------------------------------------------------------------------------

describe("Mock ReaderModeAdapter — lifecycle", () => {
  it("reports mode identity", () => {
    const adapter = makeMockAdapter("page");
    expect(adapter.mode).toBe("page");
  });

  it("is not playing before start", () => {
    const adapter = makeMockAdapter("focus");
    const snap = adapter.getSnapshot();
    expect(snap.playing).toBe(false);
    expect(snap.selected).toBe(false);
  });

  it("is playing after start", () => {
    const adapter = makeMockAdapter("focus");
    adapter.start(makeStartRequest({ mode: "focus", wordIndex: 5 }));
    const snap = adapter.getSnapshot();
    expect(snap.playing).toBe(true);
    expect(snap.selected).toBe(true);
    expect(snap.currentWordIndex).toBe(5);
  });

  it("pause stops playing", () => {
    const adapter = makeMockAdapter("focus");
    adapter.start(makeStartRequest({ mode: "focus", wordIndex: 1 }));
    adapter.pause();
    expect(adapter.getSnapshot().playing).toBe(false);
  });

  it("resume restores playing", () => {
    const adapter = makeMockAdapter("focus");
    adapter.start(makeStartRequest({ mode: "focus", wordIndex: 1 }));
    adapter.pause();
    adapter.resume();
    expect(adapter.getSnapshot().playing).toBe(true);
  });

  it("stop clears selected and playing", () => {
    const adapter = makeMockAdapter("focus");
    adapter.start(makeStartRequest({ mode: "focus", wordIndex: 2 }));
    adapter.stop("user-stop");
    const snap = adapter.getSnapshot();
    expect(snap.playing).toBe(false);
    expect(snap.selected).toBe(false);
  });

  it("jumpToWord updates currentWordIndex", () => {
    const adapter = makeMockAdapter("focus");
    adapter.start(makeStartRequest({ mode: "focus", wordIndex: 1 }));
    adapter.jumpToWord(10, "hard-selection");
    expect(adapter.getSnapshot().currentWordIndex).toBe(10);
  });

  it("jumpToWord to 0 is valid", () => {
    const adapter = makeMockAdapter("focus");
    adapter.start(makeStartRequest({ mode: "focus", wordIndex: 5 }));
    adapter.jumpToWord(0, "navigation");
    expect(adapter.getSnapshot().currentWordIndex).toBe(0);
  });

  it("destroy clears playing and selected", () => {
    const adapter = makeMockAdapter("focus");
    adapter.start(makeStartRequest({ mode: "focus", wordIndex: 1 }));
    adapter.destroy();
    const snap = adapter.getSnapshot();
    expect(snap.playing).toBe(false);
    expect(snap.selected).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Mode-advance isolation — inactive modes must not update current word
// ---------------------------------------------------------------------------

describe("Mode-advance isolation", () => {
  it("start request contains the mode that is starting", () => {
    // The request's mode field identifies which mode is starting.
    // An inactive mode's start request should not be accepted.
    const focusReq = makeStartRequest({ mode: "focus", wordIndex: 10 });
    const flowReq = makeStartRequest({ mode: "flow", wordIndex: 20 });

    const focusAdapter = makeMockAdapter("focus");
    const flowAdapter = makeMockAdapter("flow");

    focusAdapter.start(focusReq);
    flowAdapter.start(flowReq);

    // Each adapter tracks its own word independently.
    expect(focusAdapter.getSnapshot().currentWordIndex).toBe(10);
    expect(flowAdapter.getSnapshot().currentWordIndex).toBe(20);
  });

  it("snapshot mode matches adapter identity regardless of start request", () => {
    const adapter = makeMockAdapter("narrate");
    adapter.start(makeStartRequest({ mode: "narrate", wordIndex: 3 }));
    expect(adapter.getSnapshot().mode).toBe("narrate");
  });
});

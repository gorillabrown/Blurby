import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  NarrateModeAdapter,
  type NarrateModeAdapterConfig,
  type NarrationBridge,
} from "../src/reader/modes/NarrateModeAdapter";
import type { ReaderModeStartRequest } from "../src/reader/modes/ReaderModeAdapter";
import type { SurfaceCommand } from "../src/reader/surface/SurfaceCommand";

function makeBridge(overrides?: Partial<NarrationBridge>): NarrationBridge {
  return {
    startCursorDriven: vi.fn(() => "started" as const),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    setOnTruthSync: vi.fn(),
    setPageEndWord: vi.fn(),
    ...overrides,
  };
}

function makeConfig(overrides?: Partial<NarrateModeAdapterConfig>): NarrateModeAdapterConfig {
  return {
    wpm: 300,
    isFoliate: false,
    narration: makeBridge(),
    ...overrides,
  };
}

function makeRequest(overrides?: Partial<ReaderModeStartRequest>): ReaderModeStartRequest {
  return {
    mode: "narrate",
    wordIndex: 0,
    words: ["the", "quick", "brown", "fox", "jumps"],
    paragraphBreaks: new Set<number>(),
    cause: "play-button",
    ...overrides,
  };
}

describe("NarrateModeAdapter", () => {
  let bridge: NarrationBridge;
  let onWordAdvance: ReturnType<typeof vi.fn<(wordIndex: number) => void>>;
  let onTruthSync: ReturnType<typeof vi.fn<(wordIndex: number) => void>>;
  let onSurfaceCommand: ReturnType<typeof vi.fn<(cmd: SurfaceCommand) => void>>;
  let onBrowseAway: ReturnType<typeof vi.fn<() => void>>;
  let onStartResult: ReturnType<typeof vi.fn<(result: "started" | "warming" | "error") => void>>;
  let adapter: NarrateModeAdapter;

  beforeEach(() => {
    bridge = makeBridge();
    onWordAdvance = vi.fn<(wordIndex: number) => void>();
    onTruthSync = vi.fn<(wordIndex: number) => void>();
    onSurfaceCommand = vi.fn<(cmd: SurfaceCommand) => void>();
    onBrowseAway = vi.fn<() => void>();
    onStartResult = vi.fn<(result: "started" | "warming" | "error") => void>();
    adapter = new NarrateModeAdapter(makeConfig({
      narration: bridge,
      onWordAdvance,
      onTruthSync,
      onSurfaceCommand,
      onBrowseAway,
      onStartResult,
    }));
  });

  // ── Contract identity ────────────────────────────────────────────
  it("reports mode as narrate", () => {
    expect(adapter.mode).toBe("narrate");
  });

  // ── Select ───────────────────────────────────────────────────────
  it("select marks the adapter as selected without starting playback", () => {
    adapter.select(10);
    const snap = adapter.getSnapshot();
    expect(snap.selected).toBe(true);
    expect(snap.playing).toBe(false);
    expect(snap.currentWordIndex).toBe(10);
    expect(snap.clockOwner).toBe("none");
  });

  // ── Start ────────────────────────────────────────────────────────
  it("start transitions to selected + playing with audio-truth clock", () => {
    adapter.start(makeRequest({ wordIndex: 3 }));
    const snap = adapter.getSnapshot();
    expect(snap.selected).toBe(true);
    expect(snap.playing).toBe(true);
    expect(snap.currentWordIndex).toBe(3);
    expect(snap.clockOwner).toBe("audio-truth");
  });

  it("start from word 0 is valid and preserved", () => {
    adapter.start(makeRequest({ wordIndex: 0 }));
    expect(adapter.getSnapshot().currentWordIndex).toBe(0);
    expect(adapter.getSnapshot().playing).toBe(true);
  });

  it("start calls narration.startCursorDriven with correct args", () => {
    const words = ["a", "b", "c"];
    adapter.start(makeRequest({ wordIndex: 2, words }));
    expect(bridge.startCursorDriven).toHaveBeenCalledWith(
      words, 2, 300, expect.any(Function),
    );
  });

  it("start fires onStartResult callback", () => {
    adapter.start(makeRequest());
    expect(onStartResult).toHaveBeenCalledWith("started");
  });

  it("start with warming result keeps playing true", () => {
    bridge = makeBridge({ startCursorDriven: vi.fn(() => "warming" as const) });
    adapter = new NarrateModeAdapter(makeConfig({
      narration: bridge,
      onStartResult,
    }));
    adapter.start(makeRequest());
    expect(adapter.getSnapshot().playing).toBe(true);
    expect(adapter.lastStartResult).toBe("warming");
    expect(onStartResult).toHaveBeenCalledWith("warming");
  });

  it("start with error result sets playing to false", () => {
    bridge = makeBridge({ startCursorDriven: vi.fn(() => "error" as const) });
    adapter = new NarrateModeAdapter(makeConfig({
      narration: bridge,
      onStartResult,
    }));
    adapter.start(makeRequest());
    expect(adapter.getSnapshot().playing).toBe(false);
    expect(adapter.lastStartResult).toBe("error");
    expect(onStartResult).toHaveBeenCalledWith("error");
  });

  it("start emits a surface highlight command for the starting word via onWordAdvance", () => {
    let capturedAdvance: ((idx: number) => void) | undefined;
    bridge = makeBridge({
      startCursorDriven: vi.fn((words, start, wpm, onAdv) => {
        capturedAdvance = onAdv;
        return "started" as const;
      }),
    });
    adapter = new NarrateModeAdapter(makeConfig({
      narration: bridge,
      onWordAdvance,
      onSurfaceCommand,
    }));
    adapter.start(makeRequest({ wordIndex: 1 }));
    capturedAdvance!(1);
    expect(onSurfaceCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "highlight",
        wordIndex: 1,
        mode: "narrate",
        allowMotion: false,
      }),
    );
  });

  // ── Pause / Resume ──────────────────────────────────────────────
  it("pause stops advancement but keeps selection", () => {
    adapter.start(makeRequest());
    adapter.pause();
    const snap = adapter.getSnapshot();
    expect(snap.selected).toBe(true);
    expect(snap.playing).toBe(false);
    expect(snap.clockOwner).toBe("none");
    expect(bridge.pause).toHaveBeenCalled();
  });

  it("resume restarts advancement after pause", () => {
    adapter.start(makeRequest());
    adapter.pause();
    adapter.resume();
    const snap = adapter.getSnapshot();
    expect(snap.playing).toBe(true);
    expect(snap.clockOwner).toBe("audio-truth");
    expect(bridge.resume).toHaveBeenCalled();
  });

  it("resume without prior start is a no-op", () => {
    adapter.resume();
    expect(adapter.getSnapshot().playing).toBe(false);
    expect(bridge.resume).not.toHaveBeenCalled();
  });

  it("pause is idempotent", () => {
    adapter.start(makeRequest());
    adapter.pause();
    adapter.pause();
    expect(adapter.getSnapshot().playing).toBe(false);
    expect(bridge.pause).toHaveBeenCalledTimes(1);
  });

  // ── Stop ─────────────────────────────────────────────────────────
  it("stop clears both selected and playing", () => {
    adapter.start(makeRequest());
    adapter.stop("mode-switch");
    const snap = adapter.getSnapshot();
    expect(snap.selected).toBe(false);
    expect(snap.playing).toBe(false);
    expect(snap.clockOwner).toBe("none");
    expect(bridge.stop).toHaveBeenCalled();
  });

  it("stop after select (never started) clears selection", () => {
    adapter.select(5);
    adapter.stop("user-stop");
    expect(adapter.getSnapshot().selected).toBe(false);
  });

  it("stop clears browse-away state", () => {
    adapter.start(makeRequest());
    adapter.notifyBrowseAway();
    expect(adapter.browsedAway).toBe(true);
    adapter.stop("user-stop");
    expect(adapter.browsedAway).toBe(false);
  });

  // ── Jump ─────────────────────────────────────────────────────────
  it("jumpToWord updates currentWordIndex", () => {
    adapter.start(makeRequest({ wordIndex: 0 }));
    adapter.jumpToWord(3, "hard-selection");
    expect(adapter.getSnapshot().currentWordIndex).toBe(3);
  });

  it("jumpToWord to 0 is valid", () => {
    adapter.start(makeRequest({ wordIndex: 2 }));
    adapter.jumpToWord(0, "navigation");
    expect(adapter.getSnapshot().currentWordIndex).toBe(0);
  });

  // ── Destroy ──────────────────────────────────────────────────────
  it("destroy clears all state", () => {
    adapter.start(makeRequest());
    adapter.destroy();
    const snap = adapter.getSnapshot();
    expect(snap.selected).toBe(false);
    expect(snap.playing).toBe(false);
    expect(snap.clockOwner).toBe("none");
  });

  it("destroy is safe to call twice", () => {
    adapter.start(makeRequest());
    adapter.destroy();
    adapter.destroy();
    expect(adapter.getSnapshot().playing).toBe(false);
  });

  it("destroy emits a clear surface command", () => {
    adapter.start(makeRequest());
    onSurfaceCommand.mockClear();
    adapter.destroy();
    expect(onSurfaceCommand).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "clear", mode: "narrate" }),
    );
  });

  // ── Truth-sync lifecycle (SRL-073 core) ──────────────────────────
  describe("truth-sync lifecycle", () => {
    it("truth-sync is installed on start", () => {
      adapter.start(makeRequest());
      expect(bridge.setOnTruthSync).toHaveBeenCalledWith(expect.any(Function));
      expect(adapter.truthSyncInstalled).toBe(true);
    });

    it("truth-sync is cleared on stop", () => {
      adapter.start(makeRequest());
      (bridge.setOnTruthSync as ReturnType<typeof vi.fn>).mockClear();
      adapter.stop("mode-switch");
      expect(bridge.setOnTruthSync).toHaveBeenCalledWith(null);
      expect(adapter.truthSyncInstalled).toBe(false);
    });

    it("truth-sync is cleared on destroy", () => {
      adapter.start(makeRequest());
      (bridge.setOnTruthSync as ReturnType<typeof vi.fn>).mockClear();
      adapter.destroy();
      expect(bridge.setOnTruthSync).toHaveBeenCalledWith(null);
      expect(adapter.truthSyncInstalled).toBe(false);
    });

    it("truth-sync callback fires onTruthSync only while playing", () => {
      let truthCb: ((idx: number) => void) | null = null;
      bridge = makeBridge({
        setOnTruthSync: vi.fn((cb) => { truthCb = cb; }),
      });
      adapter = new NarrateModeAdapter(makeConfig({
        narration: bridge,
        onTruthSync,
      }));
      adapter.start(makeRequest());
      expect(truthCb).not.toBeNull();
      truthCb!(5);
      expect(onTruthSync).toHaveBeenCalledWith(5);
      expect(adapter.getSnapshot().currentWordIndex).toBe(5);
    });

    it("truth-sync callback is suppressed when not playing", () => {
      let truthCb: ((idx: number) => void) | null = null;
      bridge = makeBridge({
        setOnTruthSync: vi.fn((cb) => { truthCb = cb; }),
      });
      adapter = new NarrateModeAdapter(makeConfig({
        narration: bridge,
        onTruthSync,
      }));
      adapter.start(makeRequest());
      adapter.pause();
      onTruthSync.mockClear();
      truthCb!(10);
      expect(onTruthSync).not.toHaveBeenCalled();
    });

    it("truth-sync not installed before start", () => {
      expect(adapter.truthSyncInstalled).toBe(false);
    });
  });

  // ── Mode-advance anchor ownership (SRL-073) ─────────────────────
  describe("anchor ownership", () => {
    it("onWordAdvance fires only while playing", () => {
      let capturedAdvance: ((idx: number) => void) | undefined;
      bridge = makeBridge({
        startCursorDriven: vi.fn((words, start, wpm, onAdv) => {
          capturedAdvance = onAdv;
          return "started" as const;
        }),
      });
      adapter = new NarrateModeAdapter(makeConfig({
        narration: bridge,
        onWordAdvance,
      }));
      adapter.start(makeRequest());
      onWordAdvance.mockClear();
      capturedAdvance!(1);
      expect(onWordAdvance).toHaveBeenCalledWith(1);

      adapter.pause();
      onWordAdvance.mockClear();
      capturedAdvance!(2);
      expect(onWordAdvance).not.toHaveBeenCalled();
    });

    it("onWordAdvance does not fire after stop", () => {
      let capturedAdvance: ((idx: number) => void) | undefined;
      bridge = makeBridge({
        startCursorDriven: vi.fn((words, start, wpm, onAdv) => {
          capturedAdvance = onAdv;
          return "started" as const;
        }),
      });
      adapter = new NarrateModeAdapter(makeConfig({
        narration: bridge,
        onWordAdvance,
      }));
      adapter.start(makeRequest());
      onWordAdvance.mockClear();
      adapter.stop("mode-switch");
      capturedAdvance!(3);
      expect(onWordAdvance).not.toHaveBeenCalled();
    });
  });

  // ── SRL-073: Transition tests — cleanup on ownership change ─────
  describe("SRL-073 transition cleanup", () => {
    it("stop(mode-switch) calls narration.stop and clears truth-sync", () => {
      adapter.start(makeRequest());
      adapter.stop("mode-switch");
      expect(bridge.stop).toHaveBeenCalled();
      expect(adapter.truthSyncInstalled).toBe(false);
      expect(adapter.getSnapshot().selected).toBe(false);
      expect(adapter.getSnapshot().playing).toBe(false);
    });

    it("starting a new session after stop creates a fresh session", () => {
      adapter.start(makeRequest({ wordIndex: 2 }));
      adapter.stop("mode-switch");
      adapter.start(makeRequest({ wordIndex: 0 }));
      expect(adapter.getSnapshot().currentWordIndex).toBe(0);
      expect(adapter.getSnapshot().playing).toBe(true);
      expect(adapter.truthSyncInstalled).toBe(true);
    });

    it("re-select after stop resets to clean selected state", () => {
      adapter.start(makeRequest({ wordIndex: 3 }));
      adapter.stop("user-stop");
      adapter.select(7);
      const snap = adapter.getSnapshot();
      expect(snap.selected).toBe(true);
      expect(snap.playing).toBe(false);
      expect(snap.currentWordIndex).toBe(7);
    });
  });

  // ── SRL-073: No-op tests — same-owner re-select preserves state ─
  describe("SRL-073 same-owner no-op", () => {
    it("select while already selected updates word index without clearing", () => {
      adapter.select(5);
      adapter.select(10);
      const snap = adapter.getSnapshot();
      expect(snap.selected).toBe(true);
      expect(snap.currentWordIndex).toBe(10);
    });

    it("select while playing does not stop playback", () => {
      adapter.start(makeRequest({ wordIndex: 0 }));
      adapter.select(3);
      const snap = adapter.getSnapshot();
      expect(snap.selected).toBe(true);
      expect(snap.playing).toBe(true);
    });
  });

  // ── Cross-mode isolation ─────────────────────────────────────────
  describe("cross-mode isolation", () => {
    it("snapshot always reports mode as narrate", () => {
      adapter.select(0);
      expect(adapter.getSnapshot().mode).toBe("narrate");
      adapter.start(makeRequest());
      expect(adapter.getSnapshot().mode).toBe("narrate");
      adapter.pause();
      expect(adapter.getSnapshot().mode).toBe("narrate");
      adapter.stop("mode-switch");
      expect(adapter.getSnapshot().mode).toBe("narrate");
    });

    it("clockOwner is always none or audio-truth — never wpm or flow-engine", () => {
      const owners: string[] = [];
      adapter.select(0);
      owners.push(adapter.getSnapshot().clockOwner);
      adapter.start(makeRequest());
      owners.push(adapter.getSnapshot().clockOwner);
      adapter.pause();
      owners.push(adapter.getSnapshot().clockOwner);
      adapter.resume();
      owners.push(adapter.getSnapshot().clockOwner);
      adapter.stop("mode-switch");
      owners.push(adapter.getSnapshot().clockOwner);
      for (const owner of owners) {
        expect(owner === "none" || owner === "audio-truth").toBe(true);
      }
    });

    it("never starts with wpm clock owner", () => {
      adapter.start(makeRequest());
      expect(adapter.getSnapshot().clockOwner).toBe("audio-truth");
      expect(adapter.getSnapshot().clockOwner).not.toBe("wpm");
    });
  });

  // ── Browse-away ─────────────────────────────────────────────────
  describe("browse-away", () => {
    it("notifyBrowseAway pauses playback and sets browsed-away flag", () => {
      adapter.start(makeRequest());
      adapter.notifyBrowseAway();
      expect(adapter.browsedAway).toBe(true);
      expect(adapter.getSnapshot().playing).toBe(false);
    });

    it("notifyBrowseAway fires the onBrowseAway callback", () => {
      adapter.start(makeRequest());
      adapter.notifyBrowseAway();
      expect(onBrowseAway).toHaveBeenCalled();
    });

    it("notifyBrowseAway is a no-op when not playing", () => {
      adapter.select(5);
      adapter.notifyBrowseAway();
      expect(adapter.browsedAway).toBe(false);
      expect(onBrowseAway).not.toHaveBeenCalled();
    });

    it("clearBrowseAway resets the flag", () => {
      adapter.start(makeRequest());
      adapter.notifyBrowseAway();
      adapter.clearBrowseAway();
      expect(adapter.browsedAway).toBe(false);
    });

    it("resume after browse-away clears the flag", () => {
      adapter.start(makeRequest());
      adapter.notifyBrowseAway();
      expect(adapter.browsedAway).toBe(true);
      adapter.resume();
      expect(adapter.browsedAway).toBe(false);
      expect(adapter.getSnapshot().playing).toBe(true);
    });
  });

  // ── No-Flow-fallback ─────────────────────────────────────────────
  describe("no Flow fallback", () => {
    it("adapter never reports clockOwner as wpm or flow-engine", () => {
      adapter.start(makeRequest());
      expect(adapter.getSnapshot().clockOwner).toBe("audio-truth");
      adapter.pause();
      expect(adapter.getSnapshot().clockOwner).toBe("none");
      adapter.resume();
      expect(adapter.getSnapshot().clockOwner).toBe("audio-truth");
      adapter.destroy();
      expect(adapter.getSnapshot().clockOwner).toBe("none");
    });
  });
});

// ── Passive surface command types (structural) ───────────────────
describe("narrate adapter surface command types", () => {
  it("SurfaceCommand type file exists with expected exports", () => {
    const fs = require("fs");
    const path = require("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "..", "src/reader/surface/SurfaceCommand.ts"),
      "utf-8",
    );
    expect(src).toContain('kind: "highlight"');
    expect(src).toContain('kind: "scroll-to"');
    expect(src).toContain('kind: "clear"');
    expect(src).toContain("export type SurfaceCommand");
  });
});

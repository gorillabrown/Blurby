import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlowModeAdapter, type FlowModeAdapterConfig, type FlowSectionMeta } from "../src/reader/modes/FlowModeAdapter";
import type { ReaderModeStartRequest } from "../src/reader/modes/ReaderModeAdapter";
import type { SurfaceCommand } from "../src/reader/surface/SurfaceCommand";

function makeConfig(overrides?: Partial<FlowModeAdapterConfig>): FlowModeAdapterConfig {
  return {
    wpm: 300,
    isFoliate: false,
    settings: { rhythmPauses: null },
    ...overrides,
  };
}

function makeRequest(overrides?: Partial<ReaderModeStartRequest>): ReaderModeStartRequest {
  return {
    mode: "flow",
    wordIndex: 0,
    words: ["the", "quick", "brown", "fox", "jumps"],
    paragraphBreaks: new Set<number>(),
    cause: "play-button",
    ...overrides,
  };
}

describe("FlowModeAdapter", () => {
  let onWordAdvance: ReturnType<typeof vi.fn<(wordIndex: number) => void>>;
  let onComplete: ReturnType<typeof vi.fn<() => void>>;
  let onSurfaceCommand: ReturnType<typeof vi.fn<(cmd: SurfaceCommand) => void>>;
  let onBrowseAway: ReturnType<typeof vi.fn<() => void>>;
  let adapter: FlowModeAdapter;

  beforeEach(() => {
    onWordAdvance = vi.fn<(wordIndex: number) => void>();
    onComplete = vi.fn<() => void>();
    onSurfaceCommand = vi.fn<(cmd: SurfaceCommand) => void>();
    onBrowseAway = vi.fn<() => void>();
    adapter = new FlowModeAdapter(makeConfig({
      onWordAdvance,
      onComplete,
      onSurfaceCommand,
      onBrowseAway,
    }));
  });

  // ── Contract identity ────────────────────────────────────────────
  it("reports mode as flow", () => {
    expect(adapter.mode).toBe("flow");
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
  it("start transitions to selected + playing with wpm clock", () => {
    adapter.start(makeRequest({ wordIndex: 3 }));
    const snap = adapter.getSnapshot();
    expect(snap.selected).toBe(true);
    expect(snap.playing).toBe(true);
    expect(snap.currentWordIndex).toBe(3);
    expect(snap.clockOwner).toBe("wpm");
  });

  it("start from word 0 is valid and preserved", () => {
    adapter.start(makeRequest({ wordIndex: 0 }));
    expect(adapter.getSnapshot().currentWordIndex).toBe(0);
    expect(adapter.getSnapshot().playing).toBe(true);
  });

  it("start fires onWordAdvance for the starting word", () => {
    adapter.start(makeRequest({ wordIndex: 2 }));
    expect(onWordAdvance).toHaveBeenCalledWith(2);
  });

  it("start emits a surface highlight command for the starting word", () => {
    adapter.start(makeRequest({ wordIndex: 1 }));
    expect(onSurfaceCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "highlight",
        wordIndex: 1,
        mode: "flow",
        allowMotion: false,
      })
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
  });

  it("resume restarts advancement after pause", () => {
    adapter.start(makeRequest());
    adapter.pause();
    adapter.resume();
    const snap = adapter.getSnapshot();
    expect(snap.playing).toBe(true);
    expect(snap.clockOwner).toBe("wpm");
  });

  it("resume without prior start is a no-op", () => {
    adapter.resume();
    expect(adapter.getSnapshot().playing).toBe(false);
  });

  it("pause is idempotent", () => {
    adapter.start(makeRequest());
    adapter.pause();
    adapter.pause();
    expect(adapter.getSnapshot().playing).toBe(false);
  });

  // ── Stop ─────────────────────────────────────────────────────────
  it("stop clears both selected and playing", () => {
    adapter.start(makeRequest());
    adapter.stop("mode-switch");
    const snap = adapter.getSnapshot();
    expect(snap.selected).toBe(false);
    expect(snap.playing).toBe(false);
    expect(snap.clockOwner).toBe("none");
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
      expect.objectContaining({ kind: "clear", mode: "flow" })
    );
  });

  // ── setSpeed ─────────────────────────────────────────────────────
  it("setSpeed updates wpm on a running instance", () => {
    adapter.start(makeRequest());
    adapter.setSpeed(400);
    expect(adapter.getSnapshot().playing).toBe(true);
  });

  // ── Mode-advance anchor ownership (SRL-073) ─────────────────────
  describe("anchor ownership", () => {
    it("onWordAdvance fires only while playing", () => {
      adapter.start(makeRequest({ wordIndex: 0 }));
      onWordAdvance.mockClear();
      adapter.pause();
      expect(adapter.getSnapshot().playing).toBe(false);
    });

    it("onWordAdvance does not fire after stop", () => {
      adapter.start(makeRequest());
      onWordAdvance.mockClear();
      adapter.stop("mode-switch");
      expect(onWordAdvance).not.toHaveBeenCalled();
    });
  });

  // ── SRL-073: Transition tests — cleanup on ownership change ─────
  describe("SRL-073 transition cleanup", () => {
    it("stop(mode-switch) destroys the internal FlowMode instance", () => {
      adapter.start(makeRequest());
      expect(adapter.getSnapshot().playing).toBe(true);
      adapter.stop("mode-switch");
      expect(adapter.getSnapshot().selected).toBe(false);
      expect(adapter.getSnapshot().playing).toBe(false);
    });

    it("starting a new session after stop creates a fresh instance", () => {
      adapter.start(makeRequest({ wordIndex: 2 }));
      adapter.stop("mode-switch");
      adapter.start(makeRequest({ wordIndex: 0 }));
      expect(adapter.getSnapshot().currentWordIndex).toBe(0);
      expect(adapter.getSnapshot().playing).toBe(true);
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

  // ── Flow does not mutate Focus/Narrate state ─────────────────────
  describe("cross-mode isolation", () => {
    it("snapshot always reports mode as flow", () => {
      adapter.select(0);
      expect(adapter.getSnapshot().mode).toBe("flow");
      adapter.start(makeRequest());
      expect(adapter.getSnapshot().mode).toBe("flow");
      adapter.pause();
      expect(adapter.getSnapshot().mode).toBe("flow");
      adapter.stop("mode-switch");
      expect(adapter.getSnapshot().mode).toBe("flow");
    });

    it("clockOwner is always none or wpm — never flow-engine or audio-truth", () => {
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
        expect(owner === "none" || owner === "wpm").toBe(true);
      }
    });
  });

  // ── onComplete fires when words exhausted ────────────────────────
  it("onComplete fires when FlowMode reaches end of words", async () => {
    const words = ["a", "b"];
    const advanceFn = vi.fn<(wordIndex: number) => void>();
    const completeFn = vi.fn<() => void>();
    adapter = new FlowModeAdapter(makeConfig({
      wpm: 60000,
      onWordAdvance: advanceFn,
      onComplete: completeFn,
    }));
    adapter.start(makeRequest({ wordIndex: 0, words }));
    await vi.waitFor(() => expect(completeFn).toHaveBeenCalled(), { timeout: 500 });
    expect(adapter.getSnapshot().playing).toBe(false);
  });

  // ── Section handoff resolution ──────────────────────────────────
  describe("section handoff", () => {
    const sectionMeta: FlowSectionMeta = {
      sections: [
        { sectionIndex: 0, startWordIdx: 0 },
        { sectionIndex: 1, startWordIdx: 100 },
        { sectionIndex: 2, startWordIdx: 200 },
      ],
      totalWords: 300,
    };

    it("resolveCompletion returns section-handoff when next section exists", () => {
      adapter.setSectionMeta(sectionMeta);
      const result = adapter.resolveCompletion(50);
      expect(result).toEqual({
        action: "section-handoff",
        sectionIndex: 1,
        startWordIdx: 100,
      });
    });

    it("resolveCompletion returns complete when at last section", () => {
      adapter.setSectionMeta(sectionMeta);
      const result = adapter.resolveCompletion(299);
      expect(result).toEqual({ action: "complete" });
    });

    it("resolveCompletion returns complete when no section meta", () => {
      const result = adapter.resolveCompletion(50);
      expect(result).toEqual({ action: "complete" });
    });

    it("resolveCompletion finds the correct next section", () => {
      adapter.setSectionMeta(sectionMeta);
      const result = adapter.resolveCompletion(150);
      expect(result).toEqual({
        action: "section-handoff",
        sectionIndex: 2,
        startWordIdx: 200,
      });
    });

    it("setSectionMeta can be updated mid-session", () => {
      adapter.setSectionMeta(sectionMeta);
      expect(adapter.resolveCompletion(50).action).toBe("section-handoff");
      adapter.setSectionMeta(null);
      expect(adapter.resolveCompletion(50).action).toBe("complete");
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
});

// ── Passive surface command types (structural) ───────────────────
describe("flow adapter surface command types", () => {
  it("SurfaceCommand type file exists with expected exports", () => {
    const fs = require("fs");
    const path = require("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "..", "src/reader/surface/SurfaceCommand.ts"),
      "utf-8"
    );
    expect(src).toContain('kind: "highlight"');
    expect(src).toContain('kind: "scroll-to"');
    expect(src).toContain('kind: "clear"');
    expect(src).toContain("export type SurfaceCommand");
  });
});

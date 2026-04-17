import { describe, it, expect, vi } from "vitest";
import { FocusMode } from "../src/modes/FocusMode";
import { FlowMode } from "../src/modes/FlowMode";
import { PageMode } from "../src/modes/PageMode";
import type { ModeConfig } from "../src/modes/ModeInterface";

function makeConfig(overrides: Partial<ModeConfig> = {}): ModeConfig {
  return {
    words: ["a", "b", "c", "d"],
    wpm: 300,
    callbacks: {
      onWordAdvance: vi.fn(),
      onPageTurn: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    },
    isFoliate: false,
    paragraphBreaks: new Set<number>(),
    settings: {},
    ...overrides,
  };
}

describe("reading modes (3-mode model)", () => {
  it("FocusMode type is focus", () => {
    expect(new FocusMode(makeConfig()).type).toBe("focus");
  });

  it("FlowMode type is flow", () => {
    expect(new FlowMode(makeConfig()).type).toBe("flow");
  });

  it("PageMode type is page", () => {
    expect(new PageMode(makeConfig()).type).toBe("page");
  });

  it("FocusMode start emits initial word", () => {
    const config = makeConfig();
    const mode = new FocusMode(config);
    mode.start(2);
    expect(config.callbacks.onWordAdvance).toHaveBeenCalledWith(2);
    mode.destroy();
  });

  it("FlowMode start emits initial word", () => {
    const config = makeConfig();
    const mode = new FlowMode(config);
    mode.start(1);
    expect(config.callbacks.onWordAdvance).toHaveBeenCalledWith(1);
    mode.destroy();
  });

  it("PageMode jumpTo emits selected word", () => {
    const config = makeConfig();
    const mode = new PageMode(config);
    mode.jumpTo(3);
    expect(config.callbacks.onWordAdvance).toHaveBeenCalledWith(3);
  });
});

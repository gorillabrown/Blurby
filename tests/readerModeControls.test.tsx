// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ReaderBottomBar from "../src/components/ReaderBottomBar";

const activeDoc = {
  id: "doc-1",
  title: "Flow Controls",
  content: "alpha beta gamma delta",
  wordCount: 4,
} as any;

const baseProps = {
  activeDoc,
  words: ["alpha", "beta", "gamma", "delta"],
  wordIndex: 1,
  wpm: 250,
  focusTextSize: 100,
  readingMode: "flow" as const,
  isNarrating: false,
  playing: false,
  isEink: false,
  chapters: [],
  onSetWpm: vi.fn(),
  onAdjustFocusTextSize: vi.fn(),
  onEnterPage: vi.fn(),
  onEnterFocus: vi.fn(),
  onEnterFlow: vi.fn(),
  onToggleNarration: vi.fn(),
  onTogglePlay: vi.fn(),
};

describe("reader mode controls - Flow playback separation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("entering Flow selects Flow mode without pressing play", async () => {
    const props = {
      ...baseProps,
      playing: false,
      onEnterFlow: vi.fn(),
      onTogglePlay: vi.fn(),
    };

    await act(async () => {
      root.render(<ReaderBottomBar {...props} />);
    });

    const flowButton = container.querySelector('button[aria-label="Flow mode"]');
    await act(async () => {
      flowButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(props.onEnterFlow).toHaveBeenCalledTimes(1);
    expect(props.onTogglePlay).not.toHaveBeenCalled();
  });

  it("Play toggles Flow playback while the Flow mode button remains selected", async () => {
    const props = {
      ...baseProps,
      readingMode: "flow" as const,
      playing: false,
      onTogglePlay: vi.fn(),
    };

    await act(async () => {
      root.render(<ReaderBottomBar {...props} />);
    });

    const playButton = container.querySelector('button[aria-label="Play"]');
    await act(async () => {
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(props.onTogglePlay).toHaveBeenCalledTimes(1);
    expect(container.querySelector('button[aria-label="Flow mode"]')?.getAttribute("aria-pressed")).toBe("true");
  });
});

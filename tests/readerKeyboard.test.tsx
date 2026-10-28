// @vitest-environment jsdom

import React, { useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useReaderKeys } from "../src/hooks/useKeyboardShortcuts";

function KeyboardHarness({ onTogglePlay }: { onTogglePlay: () => void }) {
  const [mode, setMode] = useState<"flow" | "page">("flow");

  useReaderKeys(
    "reader",
    mode,
    onTogglePlay,
    vi.fn(),
    vi.fn(),
    vi.fn(),
    vi.fn(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    () => setMode("flow"),
  );

  return <div data-testid="mode">{mode}</div>;
}

describe("reader keyboard - Flow playback separation", () => {
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

  it("Space toggles play in Flow without leaving Flow mode", async () => {
    const onTogglePlay = vi.fn();

    await act(async () => {
      root.render(<KeyboardHarness onTogglePlay={onTogglePlay} />);
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true }));
    });

    expect(onTogglePlay).toHaveBeenCalledTimes(1);
    expect(container.querySelector("[data-testid='mode']")?.textContent).toBe("flow");
  });
});

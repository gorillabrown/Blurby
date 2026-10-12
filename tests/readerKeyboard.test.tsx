// @vitest-environment jsdom

import React, { useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useReaderKeys } from "../src/hooks/useKeyboardShortcuts";

// D8 (NARRATE-REMOVE-1): useReaderKeys no longer takes toggleNarration or enterNarrate, so enterFlow is the
// 15th argument (after seven optional ones). `onOther` stands in for the four required handlers after togglePlay.
function KeyboardHarness({ onTogglePlay, onOther = () => {} }: { onTogglePlay: () => void; onOther?: () => void }) {
  const [mode, setMode] = useState<"flow" | "page">("flow");

  useReaderKeys(
    "reader",
    mode,
    onTogglePlay,
    onOther,
    onOther,
    onOther,
    onOther,
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

  // NARRATE-REMOVE-1 Done-when 4: bare N had one binding (enter Narrate); in Flow it now resolves to no action.
  it("N does nothing in Flow: no handler runs, the key is not claimed, and Flow stays active", async () => {
    const onTogglePlay = vi.fn();
    const onOther = vi.fn();

    await act(async () => {
      root.render(<KeyboardHarness onTogglePlay={onTogglePlay} onOther={onOther} />);
    });

    let notClaimed = false;
    await act(async () => {
      notClaimed = window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyN", key: "n", bubbles: true, cancelable: true }));
    });

    // dispatchEvent returns false when a listener called preventDefault, which every handled key does.
    expect(notClaimed).toBe(true);
    expect(onTogglePlay).not.toHaveBeenCalled();
    expect(onOther).not.toHaveBeenCalled();
    expect(container.querySelector("[data-testid='mode']")?.textContent).toBe("flow");
  });
});

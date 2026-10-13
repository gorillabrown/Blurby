// @vitest-environment jsdom

import React, { useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useReaderKeys } from "../src/hooks/useKeyboardShortcuts";

// useReaderKeys positional surface: enterFlow is the 15th argument (after seven optional ones) and enterNarrate the
// 28th, the last (NARRATE-REBUILD-1 P4). `onOther` stands in for the four required handlers after togglePlay.
function KeyboardHarness({ onTogglePlay, onOther = () => {}, bindNarrate = true }: { onTogglePlay: () => void; onOther?: () => void; bindNarrate?: boolean }) {
  const [mode, setMode] = useState<"flow" | "page" | "narrate">("flow");

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
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    bindNarrate ? () => setMode("narrate") : undefined,
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

  // NARRATE-REBUILD-1 P4 (D7): bare N enters Narrate from Flow; the key is claimed and no other handler runs.
  it("N enters Narrate from Flow: the key is claimed, no other handler runs, and Narrate is active", async () => {
    const onTogglePlay = vi.fn();
    const onOther = vi.fn();

    await act(async () => {
      root.render(<KeyboardHarness onTogglePlay={onTogglePlay} onOther={onOther} />);
    });

    let notClaimed = true;
    await act(async () => {
      notClaimed = window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyN", key: "n", bubbles: true, cancelable: true }));
    });

    // dispatchEvent returns false when a listener called preventDefault, which every handled key does.
    expect(notClaimed).toBe(false);
    expect(onTogglePlay).not.toHaveBeenCalled();
    expect(onOther).not.toHaveBeenCalled();
    expect(container.querySelector("[data-testid='mode']")?.textContent).toBe("narrate");
  });

  it("N is not claimed when no enterNarrate handler is bound: no handler runs and Flow stays active", async () => {
    const onTogglePlay = vi.fn();
    const onOther = vi.fn();

    await act(async () => {
      root.render(<KeyboardHarness onTogglePlay={onTogglePlay} onOther={onOther} bindNarrate={false} />);
    });

    let notClaimed = false;
    await act(async () => {
      notClaimed = window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyN", key: "n", bubbles: true, cancelable: true }));
    });

    expect(notClaimed).toBe(true);
    expect(onTogglePlay).not.toHaveBeenCalled();
    expect(onOther).not.toHaveBeenCalled();
    expect(container.querySelector("[data-testid='mode']")?.textContent).toBe("flow");
  });

  it("Shift+N is not the Narrate key: Narrate is not entered from Flow", async () => {
    const onTogglePlay = vi.fn();

    await act(async () => {
      root.render(<KeyboardHarness onTogglePlay={onTogglePlay} />);
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyN", key: "N", shiftKey: true, bubbles: true, cancelable: true }));
    });

    expect(container.querySelector("[data-testid='mode']")?.textContent).toBe("flow");
  });
});

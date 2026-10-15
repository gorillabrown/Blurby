// @vitest-environment jsdom

import React, { useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { useReaderKeys } from "../src/hooks/useKeyboardShortcuts";

// useReaderKeys positional surface: enterFlow is the 15th argument (after seven optional ones) and enterNarrate the
// 28th (NARRATE-REBUILD-1 P4). lastReadingMode is the 29th, the last (UX-POLISH-1); enterFocus is the 10th and
// cycleMode the 24th. `onOther` stands in for the four required handlers after togglePlay.
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

  it("(i) a repeated Space in Flow does not toggle play, and the repeat is claimed", async () => {
    const onTogglePlay = vi.fn();

    await act(async () => {
      root.render(<KeyboardHarness onTogglePlay={onTogglePlay} />);
    });

    let notClaimed = true;
    await act(async () => {
      notClaimed = window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " ", repeat: true, bubbles: true, cancelable: true }));
    });

    expect(onTogglePlay).not.toHaveBeenCalled();
    expect(notClaimed).toBe(false);
    expect(container.querySelector("[data-testid='mode']")?.textContent).toBe("flow");
  });
});

type PageSpaceSpies = {
  togglePlay: () => void;
  enterFocus: () => void;
  enterFlow: () => void;
  cycleMode: () => void;
  enterNarrate: () => void;
};

function PageSpaceHarness({ spies, lastReadingMode, bindNarrate = true }: {
  spies: PageSpaceSpies;
  lastReadingMode?: "focus" | "flow" | "narrate";
  bindNarrate?: boolean;
}) {
  const noop = () => {};
  useReaderKeys(
    "reader",
    "page",
    spies.togglePlay,
    noop,
    noop,
    noop,
    noop,
    undefined,
    undefined,
    spies.enterFocus,
    undefined,
    undefined,
    undefined,
    undefined,
    spies.enterFlow,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    spies.cycleMode,
    undefined,
    undefined,
    undefined,
    bindNarrate ? spies.enterNarrate : undefined,
    lastReadingMode,
  );
  return <input data-testid="field" />;
}

describe("reader keyboard - Page Space enters the remembered mode (UX-POLISH-1)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let spies: { [K in keyof PageSpaceSpies]: Mock<() => void> };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    spies = { togglePlay: vi.fn(), enterFocus: vi.fn(), enterFlow: vi.fn(), cycleMode: vi.fn(), enterNarrate: vi.fn() };
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  async function renderAndPress(props: { lastReadingMode?: "focus" | "flow" | "narrate"; bindNarrate?: boolean }, init: KeyboardEventInit = {}) {
    await act(async () => {
      root.render(<PageSpaceHarness spies={spies} {...props} />);
    });
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true, cancelable: true, ...init }));
    });
  }

  function expectOnly(called: keyof PageSpaceSpies | null) {
    for (const name of Object.keys(spies) as (keyof PageSpaceSpies)[]) {
      expect(spies[name], name).toHaveBeenCalledTimes(name === called ? 1 : 0);
    }
  }

  it("(a) Space with lastReadingMode focus enters Focus only", async () => {
    await renderAndPress({ lastReadingMode: "focus" });
    expectOnly("enterFocus");
  });

  it("(b) Space with lastReadingMode flow enters Flow only", async () => {
    await renderAndPress({ lastReadingMode: "flow" });
    expectOnly("enterFlow");
  });

  it("(c) Space with lastReadingMode narrate enters Narrate only", async () => {
    await renderAndPress({ lastReadingMode: "narrate" });
    expectOnly("enterNarrate");
  });

  it("(d) Space with lastReadingMode unset enters Flow", async () => {
    await renderAndPress({ lastReadingMode: undefined });
    expectOnly("enterFlow");
  });

  it("(e) Space with lastReadingMode narrate but no enterNarrate bound falls back to Flow", async () => {
    await renderAndPress({ lastReadingMode: "narrate", bindNarrate: false });
    expectOnly("enterFlow");
  });

  it("(f) Shift+Space cycles the remembered mode and enters nothing", async () => {
    await renderAndPress({ lastReadingMode: "flow" }, { shiftKey: true });
    expectOnly("cycleMode");
  });

  it("(g) Space typed in an input calls no handler", async () => {
    await act(async () => {
      root.render(<PageSpaceHarness spies={spies} lastReadingMode="focus" />);
    });
    const field = container.querySelector("[data-testid='field']") as HTMLInputElement;
    await act(async () => {
      field.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true, cancelable: true }));
    });
    expectOnly(null);
  });

  // UX-POLISH-2: a held Space auto-repeats keydown; repeats are claimed and run nothing.
  it("(h) a repeated Space in Page calls no handler", async () => {
    await renderAndPress({ lastReadingMode: "flow" }, { repeat: true });
    expectOnly(null);
  });

  it("(j) a repeated Shift+Space in Page calls no handler", async () => {
    await renderAndPress({ lastReadingMode: "flow" }, { shiftKey: true, repeat: true });
    expectOnly(null);
  });
});

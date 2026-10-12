// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ReaderBottomBar from "../src/components/ReaderBottomBar";

const activeDoc = {
  id: "doc-1",
  title: "Meditations",
  content: "alpha beta gamma delta",
  wordCount: 4,
} as any;

const baseProps = {
  activeDoc,
  words: ["alpha", "beta", "gamma", "delta"],
  wordIndex: 1,
  wpm: 250,
  focusTextSize: 100,
  readingMode: "page" as const,
  playing: false,
  isEink: false,
  chapters: [],
  onSetWpm: vi.fn(),
  onAdjustFocusTextSize: vi.fn(),
  onEnterPage: vi.fn(),
  onEnterFocus: vi.fn(),
  onEnterFlow: vi.fn(),
  onTogglePlay: vi.fn(),
};

describe("ReaderBottomBar controls", () => {
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

  it("renders Page, Focus, and Flow controls and routes clicks", async () => {
    const props = {
      ...baseProps,
      onEnterPage: vi.fn(),
      onEnterFocus: vi.fn(),
      onEnterFlow: vi.fn(),
    };

    await act(async () => {
      root.render(<ReaderBottomBar {...props} />);
    });

    const pageButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Page",
    );
    const focusButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Focus",
    );
    const flowButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Flow",
    );

    expect(pageButton).toBeDefined();
    expect(focusButton).toBeDefined();
    expect(flowButton).toBeDefined();

    await act(async () => {
      pageButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      focusButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      flowButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(props.onEnterPage).toHaveBeenCalledTimes(1);
    expect(props.onEnterFocus).toHaveBeenCalledTimes(1);
    expect(props.onEnterFlow).toHaveBeenCalledTimes(1);
  });
});

// READER-4M-2 / NARRATE-REMOVE-1: three mode buttons — Group A tests
describe("ReaderBottomBar — three mode buttons (NARRATE-REMOVE-1)", () => {
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

  function getModeButtons(c: HTMLDivElement) {
    const group = c.querySelector('[aria-label="Reading modes"]');
    return group ? Array.from(group.querySelectorAll("button")) : [];
  }

  // Test 1 (NARRATE-REMOVE-1 Done-when 3): exactly the mode buttons Page, Focus and Flow, in that order
  it("renders exactly the mode buttons Page, Focus and Flow", async () => {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode="page" />);
    });

    expect(getModeButtons(container).map((button) => button.textContent?.trim())).toEqual(["Page", "Focus", "Flow"]);
  });

  // Test 1b (NARRATE-REMOVE-1 Done-when 3): no element's text contains "Narrat", in any reading mode
  it.each(["page", "focus", "flow"] as const)("renders no element whose text contains Narrat in %s mode", async (mode) => {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode={mode} />);
    });

    const withNarrateText = Array.from(container.querySelectorAll("*")).filter((el) => el.textContent?.includes("Narrat"));
    expect(withNarrateText).toEqual([]);
  });

  // Test 1c (NARRATE-REMOVE-1 Done-when 3, D11): in Page the remembered Flow is outlined as the last mode
  it("marks the Flow button rbb-mode-btn--last when readingMode is page and lastReadingMode is flow", async () => {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode="page" lastReadingMode="flow" />);
    });

    const buttons = getModeButtons(container);
    expect(buttons[2].textContent?.trim()).toBe("Flow");
    expect(buttons[2].classList.contains("rbb-mode-btn--last")).toBe(true);
    expect(buttons[1].classList.contains("rbb-mode-btn--last")).toBe(false);
  });

  // Test 2: Page button has aria-label "Page mode" and is active when readingMode === "page"
  it("Page button has aria-label 'Page mode' and is aria-pressed when readingMode is page", async () => {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode="page" />);
    });

    const buttons = getModeButtons(container);
    const pageBtn = buttons[0];
    expect(pageBtn.getAttribute("aria-label")).toBe("Page mode");
    expect(pageBtn.getAttribute("aria-pressed")).toBe("true");
    // Other buttons must not be pressed
    expect(buttons[1].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[2].getAttribute("aria-pressed")).toBe("false");
  });

  // Test 3: Focus button is active (aria-pressed true) when readingMode === "focus"
  it("Focus button is aria-pressed when readingMode is focus", async () => {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode="focus" />);
    });

    const buttons = getModeButtons(container);
    expect(buttons[1].getAttribute("aria-label")).toBe("Focus mode");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[2].getAttribute("aria-pressed")).toBe("false");
  });

  // Test 4: Flow button is active when readingMode === "flow"
  it("Flow button is aria-pressed when readingMode is flow", async () => {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode="flow" />);
    });

    const buttons = getModeButtons(container);
    expect(buttons[2].getAttribute("aria-label")).toBe("Flow mode");
    expect(buttons[2].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("false");
  });
});

describe("ReaderBottomBar — Page Play disabled", () => {
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

  it("disables Play in Page mode", async () => {
    const onTogglePlay = vi.fn();

    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode="page" onTogglePlay={onTogglePlay} />);
    });

    const playButton = container.querySelector(".rbb-play-btn") as HTMLButtonElement;
    expect(playButton).toBeTruthy();
    expect(playButton.disabled).toBe(true);
    expect(playButton.getAttribute("aria-disabled")).toBe("true");

    playButton.click();
    expect(onTogglePlay).not.toHaveBeenCalled();
  });

  it("keeps Play enabled for Focus and Flow", async () => {
    const onTogglePlay = vi.fn();

    for (const mode of ["focus", "flow"] as const) {
      await act(async () => {
        root.render(<ReaderBottomBar {...baseProps} readingMode={mode} onTogglePlay={onTogglePlay} />);
      });

      const playButton = container.querySelector(".rbb-play-btn") as HTMLButtonElement;
      expect(playButton.disabled).toBe(false);
    }
  });
});

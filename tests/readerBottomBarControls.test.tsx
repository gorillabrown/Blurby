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

  it("renders Page, Focus, Flow, and Narrate controls and routes clicks", async () => {
    const props = {
      ...baseProps,
      onEnterPage: vi.fn(),
      onEnterFocus: vi.fn(),
      onEnterFlow: vi.fn(),
      onToggleNarration: vi.fn(),
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
    const narrateButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Narrate",
    );

    expect(pageButton).toBeDefined();
    expect(focusButton).toBeDefined();
    expect(flowButton).toBeDefined();
    expect(narrateButton).toBeDefined();

    await act(async () => {
      pageButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      focusButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      flowButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      narrateButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(props.onEnterPage).toHaveBeenCalledTimes(1);
    expect(props.onEnterFocus).toHaveBeenCalledTimes(1);
    expect(props.onEnterFlow).toHaveBeenCalledTimes(1);
    expect(props.onToggleNarration).toHaveBeenCalledTimes(1);
  });

  it("keeps Narrate visibly selected even when narration is paused", async () => {
    await act(async () => {
      root.render(
        <ReaderBottomBar
          {...baseProps}
          readingMode="narrate"
          isNarrating={false}
          playing={false}
        />,
      );
    });

    const narrateButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Narrate",
    );
    const flowButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Flow",
    );

    expect(narrateButton?.getAttribute("aria-pressed")).toBe("true");
    expect(flowButton?.getAttribute("aria-pressed")).toBe("false");
  });
});

// READER-4M-2: Four mode buttons — Group A tests
describe("ReaderBottomBar — four mode buttons (READER-4M-2)", () => {
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

  // Test 1: all four mode buttons rendered in order Page / Focus / Flow / Narrate
  it("renders all four mode buttons: Page, Focus, Flow, Narrate — in that order", async () => {
    await act(async () => {
      root.render(<ReaderBottomBar {...baseProps} readingMode="page" />);
    });

    const buttons = getModeButtons(container);
    expect(buttons).toHaveLength(4);
    expect(buttons[0].textContent?.trim()).toBe("Page");
    expect(buttons[1].textContent?.trim()).toBe("Focus");
    expect(buttons[2].textContent?.trim()).toBe("Flow");
    expect(buttons[3].textContent?.trim()).toBe("Narrate");
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
    expect(buttons[3].getAttribute("aria-pressed")).toBe("false");
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
    expect(buttons[3].getAttribute("aria-pressed")).toBe("false");
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
    expect(buttons[3].getAttribute("aria-pressed")).toBe("false");
  });

  // Test 5: Narrate button is active when readingMode === "narrate"
  it("Narrate button is aria-pressed when readingMode is narrate", async () => {
    await act(async () => {
      root.render(
        <ReaderBottomBar {...baseProps} readingMode="narrate" isNarrating={false} />,
      );
    });

    const buttons = getModeButtons(container);
    expect(buttons[3].getAttribute("aria-label")).toBe("Narrate mode");
    expect(buttons[3].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[2].getAttribute("aria-pressed")).toBe("false");
  });
});

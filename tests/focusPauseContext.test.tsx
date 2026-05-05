// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PausedTextView from "../src/components/PausedTextView";

describe("Focus pause context", () => {
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

  it("keeps the current ORP word visible alongside the resume affordance", async () => {
    const togglePlay = vi.fn();
    const currentWordRef = React.createRef<HTMLSpanElement>();
    const scrollBodyRef = React.createRef<HTMLDivElement>();
    const containerRef = React.createRef<HTMLDivElement>();

    await act(async () => {
      root.render(
        <PausedTextView
          paragraphs={["alpha beta gamma", "delta epsilon zeta"]}
          paraStartIndices={[0, 3]}
          wordIndex={4}
          highlightIdx={-1}
          currentWordRef={currentWordRef}
          scrollBodyRef={scrollBodyRef}
          containerRef={containerRef}
          onJumpToWord={vi.fn()}
          onHighlight={vi.fn()}
          togglePlay={togglePlay}
        />,
      );
    });

    const context = container.querySelector(".reader-pause-context");
    const word = container.querySelector(".reader-pause-context-word");
    const resume = context?.querySelector("button");

    expect(context).not.toBeNull();
    expect(word?.textContent).toBe("epsilon");
    expect(resume?.textContent?.toLowerCase()).toContain("resume");

    await act(async () => {
      resume?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(togglePlay).toHaveBeenCalledTimes(1);
  });
});

// @vitest-environment jsdom

import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useNarration from "../src/hooks/useNarration";

function Harness() {
  useNarration();
  return null;
}

describe("useNarration mount", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    (window as any).electronAPI = {
      kokoroModelStatus: vi.fn().mockResolvedValue({ ready: false }),
    };

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
      },
    });
  });

  afterEach(() => {
    if (root) {
      flushSync(() => root?.unmount());
      root = null;
    }
    container.remove();
    delete (window as any).electronAPI;
  });

  it("does not throw during initial render", () => {
    expect(() => {
      root = createRoot(container);
      flushSync(() => {
        root?.render(<Harness />);
      });
    }).not.toThrow();
  });
});

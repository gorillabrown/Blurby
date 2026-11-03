// @vitest-environment jsdom

// OVERLAY-THEME-SWEEP-1: Escape on the highlights and quick-settings overlays closes only the overlay, and five
// panels plus the mode-button hover read theme tokens every theme defines. Helpers copied from helpSurfaces.test.tsx.

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import * as fs from "fs";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useReaderKeys } from "../src/hooks/useKeyboardShortcuts";
import HighlightsOverlay from "../src/components/HighlightsOverlay";
import QuickSettingsPopover from "../src/components/QuickSettingsPopover";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

function extractCssBlock(css: string, selector: string): string {
  const selectorIdx = css.indexOf(selector);
  if (selectorIdx === -1) return "";
  const openBrace = css.indexOf("{", selectorIdx);
  if (openBrace === -1) return "";
  let depth = 1;
  let pos = openBrace + 1;
  while (pos < css.length && depth > 0) {
    if (css[pos] === "{") depth++;
    else if (css[pos] === "}") depth--;
    pos++;
  }
  return css.slice(openBrace + 1, pos - 1);
}

// Number of ThemeProvider theme maps that define the variable (`"--name":`); a token every theme defines counts 4.
function definedInEveryTheme(name: string): number {
  return read("src/components/ThemeProvider.tsx").split(`"${name}":`).length - 1;
}

type Overlay = "none" | "highlights" | "quickSettings";

function OverlayHarness({ overlay, onClose, onJumpTo, exitReader }: { overlay: Overlay; onClose: () => void; onJumpTo: (docId: string) => void; exitReader: () => void }) {
  const noop = () => {};
  useReaderKeys("reader", "page", noop, noop, noop, exitReader, noop);
  if (overlay === "highlights") return <HighlightsOverlay onClose={onClose} onJumpTo={onJumpTo} />;
  if (overlay === "quickSettings") return <QuickSettingsPopover context="reader" settings={{}} onSettingsChange={noop} onClose={onClose} />;
  return null;
}

const escape = () => new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true });

describe("overlay Escape and theme tokens (OVERLAY-THEME-SWEEP-1)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let highlights: unknown[];

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    highlights = [];
    (window as unknown as { electronAPI: unknown }).electronAPI = { getAllHighlights: vi.fn(() => Promise.resolve(highlights)) };
    // jsdom has no scrollIntoView; the highlights list calls it when the focused row changes.
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  // Closed first, then open: the reader's window listener registers before the overlay's, as in the app.
  async function mount(overlay: Overlay, fns: { onClose: () => void; onJumpTo?: (docId: string) => void; exitReader: () => void }) {
    const onJumpTo = fns.onJumpTo ?? (() => {});
    await act(async () => {
      root.render(<OverlayHarness overlay="none" onClose={fns.onClose} onJumpTo={onJumpTo} exitReader={fns.exitReader} />);
    });
    await act(async () => {
      root.render(<OverlayHarness overlay={overlay} onClose={fns.onClose} onJumpTo={onJumpTo} exitReader={fns.exitReader} />);
    });
  }

  it("(k1) Escape in the highlights search closes only the highlights overlay", async () => {
    const onClose = vi.fn();
    const exitReader = vi.fn();
    await mount("highlights", { onClose, exitReader });

    const search = container.querySelector(".highlights-search") as HTMLInputElement;
    expect(search).toBeTruthy();
    await act(async () => {
      search.dispatchEvent(escape());
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(exitReader).not.toHaveBeenCalled();
  });

  it("(k2) Escape on the quick-settings popover closes only the popover", async () => {
    const onClose = vi.fn();
    const exitReader = vi.fn();
    await mount("quickSettings", { onClose, exitReader });

    const close = container.querySelector(".quick-settings-close") as HTMLButtonElement;
    expect(close).toBeTruthy();
    await act(async () => {
      close.dispatchEvent(escape());
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(exitReader).not.toHaveBeenCalled();
  });

  it("(k3) control: Escape with no overlay exits the reader", async () => {
    const onClose = vi.fn();
    const exitReader = vi.fn();
    await mount("none", { onClose, exitReader });

    await act(async () => {
      window.dispatchEvent(escape());
    });

    expect(exitReader).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("(k4) ArrowDown then Enter in the highlights search jumps to the second highlight", async () => {
    highlights = [
      { text: "newer", docTitle: "Book A", docId: "doc-a", wordIndex: 1, totalWords: 10, date: "2026-10-02T00:00:00Z" },
      { text: "older", docTitle: "Book B", docId: "doc-b", wordIndex: 2, totalWords: 10, date: "2026-10-01T00:00:00Z" },
    ];
    const onClose = vi.fn();
    const onJumpTo = vi.fn();
    const exitReader = vi.fn();
    await mount("highlights", { onClose, onJumpTo, exitReader });
    expect(container.querySelectorAll(".highlights-item").length).toBe(2);

    const search = container.querySelector(".highlights-search") as HTMLInputElement;
    await act(async () => {
      search.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", code: "ArrowDown", bubbles: true, cancelable: true }));
    });
    await act(async () => {
      search.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
    });

    expect(onJumpTo).toHaveBeenCalledTimes(1);
    expect(onJumpTo).toHaveBeenCalledWith("doc-b");
  });

  const tokenCheck = (block: string) => {
    expect(block).not.toBe("");
    const names = Array.from(block.matchAll(/var\((--[a-z0-9-]+)/g), (m) => m[1]);
    for (const name of names) {
      expect(name.startsWith("--color-"), name).toBe(false);
      expect(definedInEveryTheme(name), name).toBe(4);
    }
  };

  it("(t1) the five panels read only theme tokens every theme defines", () => {
    const css = read("src/styles/keyboard.css");
    const selectors = [
      ".goto-indicator {",
      ".highlights-container {", ".highlights-search {", ".highlights-item-text {", ".highlights-item-meta {",
      ".snooze-picker-container {", ".snooze-picker-title {", ".snooze-option {", ".snooze-option-key {",
      ".tag-picker-container {", ".tag-picker-input {",
      ".quick-settings-popover {", ".quick-settings-title {", ".quick-settings-row {", ".quick-settings-row select {",
    ];
    for (const selector of selectors) tokenCheck(extractCssBlock(css, selector));
  });

  it("(t2) each panel container sits on --bg-raised with a --border edge", () => {
    const css = read("src/styles/keyboard.css");
    for (const selector of [".goto-indicator {", ".highlights-container {", ".snooze-picker-container {", ".tag-picker-container {", ".quick-settings-popover {"]) {
      const block = extractCssBlock(css, selector);
      expect(block, selector).toContain("background: var(--bg-raised)");
      expect(block, selector).toContain("border: 1px solid var(--border)");
    }
  });

  it("(t3) the hovered mode button reads --border", () => {
    const css = read("src/styles/page-reader.css");
    expect(extractCssBlock(css, ".rbb-mode-btn:hover {")).toContain("background: var(--border)");
  });

  it("(t4) control: the shortcuts overlay (UX-POLISH-2) passes the token check", () => {
    const css = read("src/styles/keyboard.css");
    tokenCheck(extractCssBlock(css, ".shortcuts-container {"));
    tokenCheck(extractCssBlock(css, ".shortcuts-key {"));
  });
});

// @vitest-environment jsdom

// UX-POLISH-2: help surfaces (hotkey map, shortcuts overlay) and the theme tokens their styles read.

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import * as fs from "fs";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useReaderKeys } from "../src/hooks/useKeyboardShortcuts";
import ShortcutsOverlay from "../src/components/ShortcutsOverlay";
import { HotkeyMapSettings } from "../src/components/settings/HotkeyMapSettings";

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

function OverlayHarness({ open, onClose, exitReader }: { open: boolean; onClose: () => void; exitReader: () => void }) {
  const noop = () => {};
  useReaderKeys("reader", "page", noop, noop, noop, exitReader, noop);
  return open ? <ShortcutsOverlay onClose={onClose} context="reader-page" /> : null;
}

describe("help surfaces (UX-POLISH-2)", () => {
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
    vi.restoreAllMocks();
  });

  it("(m) the hotkey map renders with unique React keys", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      root.render(<HotkeyMapSettings />);
    });

    expect(container.querySelectorAll(".hotkey-row").length).toBe(83);
    const duplicateKeyCalls = errorSpy.mock.calls.filter((args) => String(args[0]).includes("same key"));
    expect(duplicateKeyCalls).toEqual([]);
  });

  it("(n) Escape on the open shortcuts overlay closes only the overlay", async () => {
    const onClose = vi.fn();
    const exitReader = vi.fn();

    // Closed first, then open: the reader's window listener registers before the overlay's, as in the app.
    await act(async () => {
      root.render(<OverlayHarness open={false} onClose={onClose} exitReader={exitReader} />);
    });
    await act(async () => {
      root.render(<OverlayHarness open={true} onClose={onClose} exitReader={exitReader} />);
    });

    const closeButton = container.querySelector(".shortcuts-close") as HTMLButtonElement;
    expect(closeButton).toBeTruthy();
    await act(async () => {
      closeButton.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(exitReader).not.toHaveBeenCalled();
  });

  it("(q) control: Escape with no overlay exits the reader", async () => {
    const onClose = vi.fn();
    const exitReader = vi.fn();

    await act(async () => {
      root.render(<OverlayHarness open={false} onClose={onClose} exitReader={exitReader} />);
    });
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true }));
    });

    expect(exitReader).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("(o) the shortcuts overlay reads only theme tokens every theme defines, and sets its text colour", () => {
    const css = read("src/styles/keyboard.css");
    const container_ = extractCssBlock(css, ".shortcuts-container {");
    const key = extractCssBlock(css, ".shortcuts-key {");
    expect(container_).not.toBe("");
    expect(key).not.toBe("");

    for (const block of [container_, key]) {
      const names = Array.from(block.matchAll(/var\((--[a-z0-9-]+)/g), (m) => m[1]);
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) {
        expect(definedInEveryTheme(name), name).toBe(4);
      }
    }
    expect(container_).toContain("color: var(--text)");
  });

  it("(p) the bottom bar mode buttons use quiet and strong borders from defined theme tokens", () => {
    const css = read("src/styles/page-reader.css");
    const button = extractCssBlock(css, ".rbb-mode-btn {");
    const last = extractCssBlock(css, ".rbb-mode-btn--last {");

    expect(button).toContain("border: 1px solid var(--border)");
    expect(last).toContain("border-color: var(--text-dim)");
    expect(definedInEveryTheme("--border")).toBe(4);
    expect(definedInEveryTheme("--text-dim")).toBe(4);
  });
});

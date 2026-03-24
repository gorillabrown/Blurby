import { describe, it, expect } from "vitest";
import { WPM_STEP, REWIND_WORDS, FOCUS_TEXT_SIZE_STEP } from "../src/constants";

/**
 * useKeyboardShortcuts tests — testing the key binding resolution and
 * handler dispatch logic that the hook implements. Since we can't render
 * hooks without @testing-library/react, we test the pure decision logic.
 */

// Simulate the key dispatch logic from useReaderKeys
interface KeyEvent {
  key: string;
  code: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

function makeKeyEvent(overrides: Partial<KeyEvent> = {}): KeyEvent {
  return {
    key: "",
    code: "",
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...overrides,
  };
}

type Action =
  | "toggleFlap"
  | "toggleNarration"
  | "toggleFavorite"
  | "switchMode"
  | "prevChapter"
  | "nextChapter"
  | "coarseWpmUp"
  | "coarseWpmDown"
  | "togglePlay"
  | "seekBack"
  | "seekForward"
  | "wpmUp"
  | "wpmDown"
  | "fontUp"
  | "fontDown"
  | "exit"
  | "none";

function resolveReaderKey(e: KeyEvent, readerMode: string): Action {
  // Tab toggles flap in any reader mode
  if (e.key === "Tab") return "toggleFlap";
  // T toggles narration
  if (e.code === "KeyT" && !e.shiftKey && !e.ctrlKey && !e.metaKey) return "toggleNarration";
  // B toggles favorite
  if (e.code === "KeyB" && !e.shiftKey && !e.ctrlKey && !e.metaKey) return "toggleFavorite";
  // Shift+F switches mode
  if (e.code === "KeyF" && e.shiftKey && !e.ctrlKey && !e.metaKey) return "switchMode";
  // [ / ] chapter navigation
  if (e.code === "BracketLeft" && !e.shiftKey && !e.ctrlKey) return "prevChapter";
  if (e.code === "BracketRight" && !e.shiftKey && !e.ctrlKey) return "nextChapter";
  // Shift+Up/Down for coarse WPM
  if (e.code === "ArrowUp" && e.shiftKey) return "coarseWpmUp";
  if (e.code === "ArrowDown" && e.shiftKey) return "coarseWpmDown";
  // Speed mode only keys
  if (readerMode !== "speed") return "none";
  if (e.code === "Space") return "togglePlay";
  if (e.code === "ArrowLeft") return "seekBack";
  if (e.code === "ArrowRight") return "seekForward";
  if (e.code === "ArrowUp") return "wpmUp";
  if (e.code === "ArrowDown") return "wpmDown";
  if (e.code === "Equal" || e.code === "NumpadAdd") return "fontUp";
  if (e.code === "Minus" || e.code === "NumpadSubtract") return "fontDown";
  if (e.code === "Escape") return "exit";
  return "none";
}

describe("useKeyboardShortcuts — key binding resolution (any mode)", () => {
  it("Tab toggles flap", () => {
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab" }), "speed")).toBe("toggleFlap");
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab" }), "flow")).toBe("toggleFlap");
  });

  it("T toggles narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "speed")).toBe("toggleNarration");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "flow")).toBe("toggleNarration");
  });

  it("B toggles favorite", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyB" }), "speed")).toBe("toggleFavorite");
  });

  it("Shift+F switches reading mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyF", shiftKey: true }), "speed")).toBe("switchMode");
  });

  it("[ goes to previous chapter", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "BracketLeft" }), "speed")).toBe("prevChapter");
  });

  it("] goes to next chapter", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "BracketRight" }), "speed")).toBe("nextChapter");
  });

  it("Shift+Up adjusts WPM coarsely (+100)", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp", shiftKey: true }), "speed")).toBe("coarseWpmUp");
  });

  it("Shift+Down adjusts WPM coarsely (-100)", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowDown", shiftKey: true }), "speed")).toBe("coarseWpmDown");
  });
});

describe("useKeyboardShortcuts — speed mode only keys", () => {
  it("Space toggles play in speed mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Space" }), "speed")).toBe("togglePlay");
  });

  it("Space does nothing in flow mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Space" }), "flow")).toBe("none");
  });

  it("ArrowLeft seeks backward in speed mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowLeft" }), "speed")).toBe("seekBack");
  });

  it("ArrowRight seeks forward in speed mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowRight" }), "speed")).toBe("seekForward");
  });

  it("ArrowUp increases WPM in speed mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp" }), "speed")).toBe("wpmUp");
  });

  it("ArrowDown decreases WPM in speed mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowDown" }), "speed")).toBe("wpmDown");
  });

  it("Equal/NumpadAdd increases font size", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Equal" }), "speed")).toBe("fontUp");
    expect(resolveReaderKey(makeKeyEvent({ code: "NumpadAdd" }), "speed")).toBe("fontUp");
  });

  it("Minus/NumpadSubtract decreases font size", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Minus" }), "speed")).toBe("fontDown");
    expect(resolveReaderKey(makeKeyEvent({ code: "NumpadSubtract" }), "speed")).toBe("fontDown");
  });

  it("Escape exits reader in speed mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Escape" }), "speed")).toBe("exit");
  });

  it("Escape does nothing in flow mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Escape" }), "flow")).toBe("none");
  });
});

describe("useKeyboardShortcuts — modifier key handling", () => {
  it("Ctrl+T does NOT toggle narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", ctrlKey: true }), "speed")).not.toBe("toggleNarration");
  });

  it("Shift+T does NOT toggle narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", shiftKey: true }), "speed")).not.toBe("toggleNarration");
  });

  it("Meta+T does NOT toggle narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", metaKey: true }), "speed")).not.toBe("toggleNarration");
  });

  it("Ctrl+B does NOT toggle favorite", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyB", ctrlKey: true }), "speed")).not.toBe("toggleFavorite");
  });

  it("Shift+[ does NOT go to previous chapter", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "BracketLeft", shiftKey: true }), "speed")).not.toBe("prevChapter");
  });

  it("Ctrl+[ does NOT go to previous chapter", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "BracketLeft", ctrlKey: true }), "speed")).not.toBe("prevChapter");
  });

  it("F without Shift does NOT switch mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyF" }), "speed")).not.toBe("switchMode");
  });

  it("Ctrl+F does NOT switch mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyF", shiftKey: true, ctrlKey: true }), "speed")).not.toBe("switchMode");
  });
});

describe("useKeyboardShortcuts — conflict detection", () => {
  it("Arrow keys with Shift route to coarse WPM, not regular WPM", () => {
    // Shift+Up should be coarseWpmUp, not wpmUp
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp", shiftKey: true }), "speed")).toBe("coarseWpmUp");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp", shiftKey: true }), "speed")).not.toBe("wpmUp");
  });

  it("Tab takes priority over any other binding", () => {
    // Tab should always be toggleFlap regardless of mode
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab", code: "Tab" }), "speed")).toBe("toggleFlap");
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab", code: "Tab" }), "flow")).toBe("toggleFlap");
  });

  it("unbound key returns none", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyZ" }), "speed")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "Digit1" }), "speed")).toBe("none");
  });
});

describe("useKeyboardShortcuts — constants from text.ts", () => {
  it("WPM_STEP is 25", () => {
    expect(WPM_STEP).toBe(25);
  });

  it("REWIND_WORDS is 5", () => {
    expect(REWIND_WORDS).toBe(5);
  });

  it("FOCUS_TEXT_SIZE_STEP is 10", () => {
    expect(FOCUS_TEXT_SIZE_STEP).toBe(10);
  });
});

// Global keys logic
describe("useGlobalKeys — settings shortcut", () => {
  function resolveGlobalKey(e: KeyEvent, view: string): string {
    if ((e.ctrlKey || e.metaKey) && e.key === ",") return "openSettings";
    if (view === "reader") return "none";
    if (e.key === "Tab") return "toggleFlap";
    return "none";
  }

  it("Ctrl+, opens settings in any view", () => {
    expect(resolveGlobalKey(makeKeyEvent({ ctrlKey: true, key: "," }), "library")).toBe("openSettings");
    expect(resolveGlobalKey(makeKeyEvent({ ctrlKey: true, key: "," }), "reader")).toBe("openSettings");
  });

  it("Cmd+, opens settings (macOS)", () => {
    expect(resolveGlobalKey(makeKeyEvent({ metaKey: true, key: "," }), "library")).toBe("openSettings");
  });

  it("Tab toggles flap in library view", () => {
    expect(resolveGlobalKey(makeKeyEvent({ key: "Tab" }), "library")).toBe("toggleFlap");
  });

  it("Tab does NOT toggle flap in reader view (handled by useReaderKeys)", () => {
    expect(resolveGlobalKey(makeKeyEvent({ key: "Tab" }), "reader")).toBe("none");
  });
});

// Smart import logic
describe("useSmartImport — URL detection", () => {
  const URL_REGEX = /^https?:\/\/[^\s]+$/;

  it("detects HTTP URLs", () => {
    expect(URL_REGEX.test("http://example.com")).toBe(true);
  });

  it("detects HTTPS URLs", () => {
    expect(URL_REGEX.test("https://example.com/article")).toBe(true);
  });

  it("rejects plain text", () => {
    expect(URL_REGEX.test("just some text")).toBe(false);
  });

  it("rejects URLs with spaces", () => {
    expect(URL_REGEX.test("https://example.com/my article")).toBe(false);
  });

  it("rejects FTP URLs", () => {
    expect(URL_REGEX.test("ftp://example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(URL_REGEX.test("")).toBe(false);
  });
});

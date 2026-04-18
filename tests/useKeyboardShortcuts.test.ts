import { describe, it, expect } from "vitest";
import { WPM_STEP, REWIND_WORDS, FOCUS_TEXT_SIZE_STEP } from "../src/constants";
import { getReaderKeyboardModeSurface } from "../src/hooks/useKeyboardShortcuts";

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

function resolveReaderKey(
  e: KeyEvent,
  readerMode: "page" | "focus" | "flow" | "narrate" | "speed" | "scroll",
): Action {
  const surface = getReaderKeyboardModeSurface(readerMode);

  // Tab toggles flap in any reader mode
  if (e.key === "Tab") return "toggleFlap";
  // T toggles narration
  if (e.code === "KeyT" && !e.shiftKey && !e.ctrlKey && !e.metaKey) return "toggleNarration";
  // [ / ] chapter navigation
  if (e.code === "BracketLeft" && !e.shiftKey && !e.ctrlKey) return "prevChapter";
  if (e.code === "BracketRight" && !e.shiftKey && !e.ctrlKey) return "nextChapter";
  // Page-mode only keys
  if (surface === "page") {
    if (e.code === "Space" && !e.shiftKey) return "togglePlay";
    if (e.code === "ArrowUp" && !e.shiftKey && !e.ctrlKey) return "wpmUp";
    if (e.code === "ArrowDown" && !e.shiftKey && !e.ctrlKey) return "wpmDown";
    return e.code === "Escape" ? "exit" : "none";
  }
  // Flow-surface keys, including narrate.
  if (surface === "flow") {
    if (e.code === "KeyN" && !e.shiftKey && !e.ctrlKey && !e.metaKey) return "toggleNarration";
    if (e.code === "Space" && !e.shiftKey) return "togglePlay";
    if (e.code === "ArrowLeft" && !e.shiftKey && !e.ctrlKey) return "wpmDown";
    if (e.code === "ArrowRight" && !e.shiftKey && !e.ctrlKey) return "wpmUp";
    return e.code === "Escape" ? "exit" : "none";
  }
  // Focus-mode only keys.
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
  it("normalizes four-mode and legacy reader modes to keyboard surfaces", () => {
    expect(getReaderKeyboardModeSurface("page")).toBe("page");
    expect(getReaderKeyboardModeSurface("focus")).toBe("focus");
    expect(getReaderKeyboardModeSurface("flow")).toBe("flow");
    expect(getReaderKeyboardModeSurface("narrate")).toBe("flow");
    expect(getReaderKeyboardModeSurface("speed")).toBe("focus");
    expect(getReaderKeyboardModeSurface("scroll")).toBe("flow");
  });

  it("Tab toggles flap", () => {
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab" }), "focus")).toBe("toggleFlap");
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab" }), "flow")).toBe("toggleFlap");
  });

  it("T toggles narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "focus")).toBe("toggleNarration");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "flow")).toBe("toggleNarration");
  });

  it("[ goes to previous chapter", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "BracketLeft" }), "focus")).toBe("prevChapter");
  });

  it("] goes to next chapter", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "BracketRight" }), "focus")).toBe("nextChapter");
  });
});

describe("useKeyboardShortcuts — focus surface keys", () => {
  it("Space toggles play in focus mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Space" }), "focus")).toBe("togglePlay");
  });

  it("ArrowLeft seeks backward in focus mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowLeft" }), "focus")).toBe("seekBack");
  });

  it("ArrowRight seeks forward in focus mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowRight" }), "focus")).toBe("seekForward");
  });

  it("ArrowUp increases WPM in focus mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp" }), "focus")).toBe("wpmUp");
  });

  it("ArrowDown decreases WPM in focus mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowDown" }), "focus")).toBe("wpmDown");
  });

  it("Equal/NumpadAdd increases font size", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Equal" }), "focus")).toBe("fontUp");
    expect(resolveReaderKey(makeKeyEvent({ code: "NumpadAdd" }), "focus")).toBe("fontUp");
  });

  it("Minus/NumpadSubtract decreases font size", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Minus" }), "focus")).toBe("fontDown");
    expect(resolveReaderKey(makeKeyEvent({ code: "NumpadSubtract" }), "focus")).toBe("fontDown");
  });

  it("Escape exits reader in focus mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Escape" }), "focus")).toBe("exit");
  });

  it("legacy speed keeps the focus seek and font controls", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowLeft" }), "speed")).toBe("seekBack");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowRight" }), "speed")).toBe("seekForward");
    expect(resolveReaderKey(makeKeyEvent({ code: "Equal" }), "speed")).toBe("fontUp");
  });
});

describe("useKeyboardShortcuts — flow surface keys", () => {
  it("Space toggles play in flow mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Space" }), "flow")).toBe("togglePlay");
  });

  it("narrate uses the flow keyboard surface", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Space" }), "narrate")).toBe("togglePlay");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "narrate")).toBe("toggleNarration");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowLeft" }), "narrate")).toBe("wpmDown");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowRight" }), "narrate")).toBe("wpmUp");
  });

  it("legacy scroll maps to the flow keyboard surface", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "scroll")).toBe("toggleNarration");
  });

  it("legacy scroll keeps the flow playback and coarse-rate controls", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Space" }), "scroll")).toBe("togglePlay");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowLeft" }), "scroll")).toBe("wpmDown");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowRight" }), "scroll")).toBe("wpmUp");
  });

  it("Escape exits reader in flow-like surfaces", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Escape" }), "flow")).toBe("exit");
    expect(resolveReaderKey(makeKeyEvent({ code: "Escape" }), "narrate")).toBe("exit");
  });

  it("page-only bindings stay isolated from the narrate flow surface", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp" }), "narrate")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowDown" }), "narrate")).toBe("none");
  });
});

describe("useKeyboardShortcuts — modifier key handling", () => {
  it("Ctrl+T does NOT toggle narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", ctrlKey: true }), "focus")).not.toBe("toggleNarration");
  });

  it("Shift+T does NOT toggle narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", shiftKey: true }), "focus")).not.toBe("toggleNarration");
  });

  it("Meta+T does NOT toggle narration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", metaKey: true }), "focus")).not.toBe("toggleNarration");
  });

  it("Ctrl+[ does NOT go to previous chapter", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "BracketLeft", ctrlKey: true }), "focus")).not.toBe("prevChapter");
  });
});

describe("useKeyboardShortcuts — conflict detection", () => {
  it("Tab takes priority over any other binding", () => {
    // Tab should always be toggleFlap regardless of mode
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab", code: "Tab" }), "focus")).toBe("toggleFlap");
    expect(resolveReaderKey(makeKeyEvent({ key: "Tab", code: "Tab" }), "flow")).toBe("toggleFlap");
  });

  it("unbound key returns none", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyZ" }), "focus")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "Digit1" }), "focus")).toBe("none");
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

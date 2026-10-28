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
  | "enterNarrate"
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
  // [ / ] chapter navigation (all modes)
  if (e.code === "BracketLeft" && !e.shiftKey && !e.ctrlKey) return "prevChapter";
  if (e.code === "BracketRight" && !e.shiftKey && !e.ctrlKey) return "nextChapter";
  // N (bare) enters narrate mode paused from any surface. Shift+N is handled per-surface below.
  if (e.code === "KeyN" && !e.shiftKey && !e.ctrlKey && !e.metaKey) return "enterNarrate";
  // Page-mode only keys
  if (surface === "page") {
    if (e.code === "Space" && !e.shiftKey) return "togglePlay";
    if (e.code === "ArrowUp" && !e.shiftKey && !e.ctrlKey) return "wpmUp";
    if (e.code === "ArrowDown" && !e.shiftKey && !e.ctrlKey) return "wpmDown";
    return e.code === "Escape" ? "exit" : "none";
  }
  // Flow-surface keys, including narrate.
  if (surface === "flow") {
    if (readerMode === "narrate") {
      if (e.code === "Space" && !e.shiftKey) return "togglePlay";
      if (e.code === "ArrowUp" && !e.shiftKey && !e.ctrlKey) return "wpmUp";
      if (e.code === "ArrowDown" && !e.shiftKey && !e.ctrlKey) return "wpmDown";
      return e.code === "Escape" ? "exit" : "none";
    }
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

  it("T is no longer bound to narration toggle (READER-4M-2)", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "focus")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "flow")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "narrate")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "page")).toBe("none");
  });

  it("N (bare) enters Narrate mode paused from any surface (READER-4M-2)", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "page")).toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "focus")).toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "flow")).toBe("enterNarrate");
    // N in narrate is idempotent at the hook layer — still resolves to enterNarrate;
    // handleSelectMode short-circuits the no-op transition.
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "narrate")).toBe("enterNarrate");
  });

  it("Shift+N is NOT captured by the universal enterNarrate binding", () => {
    // Page-mode uses Shift+N for make-note; the universal binding must require !shiftKey.
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN", shiftKey: true }), "page")).not.toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN", shiftKey: true }), "focus")).not.toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN", shiftKey: true }), "flow")).not.toBe("enterNarrate");
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

  it("narrate keeps the flow-family keyboard surface but moves speed to Up/Down", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "Space" }), "narrate")).toBe("togglePlay");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "narrate")).toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp" }), "narrate")).toBe("wpmUp");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowDown" }), "narrate")).toBe("wpmDown");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowLeft" }), "narrate")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowRight" }), "narrate")).toBe("none");
  });

  it("legacy scroll maps to the flow keyboard surface and resolves N to enterNarrate", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "scroll")).toBe("enterNarrate");
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

  it("page-only bindings stay isolated from narrate while narrate speed stays vertical", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowLeft" }), "narrate")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowRight" }), "narrate")).toBe("none");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowUp" }), "narrate")).toBe("wpmUp");
    expect(resolveReaderKey(makeKeyEvent({ code: "ArrowDown" }), "narrate")).toBe("wpmDown");
  });
});

describe("useKeyboardShortcuts — modifier key handling", () => {
  it("T is unbound — modifier variants must also not toggle narration", () => {
    // T no longer has a narration toggle binding in any variant.
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", ctrlKey: true }), "focus")).not.toBe("toggleNarration");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", shiftKey: true }), "focus")).not.toBe("toggleNarration");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT", metaKey: true }), "focus")).not.toBe("toggleNarration");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "focus")).not.toBe("toggleNarration");
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

// READER-4M-2: N key, T key, Space in-mode (Groups B–E)
describe("READER-4M-2 — N key enters narrate from any mode", () => {
  // Test 6: N (bare) calls enterNarrate when in page mode
  it("N (bare) resolves to enterNarrate in page mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "page")).toBe("enterNarrate");
  });

  // Test 7: N (bare) calls enterNarrate when in focus mode (not nextChapter)
  it("N (bare) resolves to enterNarrate in focus mode — not nextChapter", () => {
    const action = resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "focus");
    expect(action).toBe("enterNarrate");
    expect(action).not.toBe("nextChapter");
  });

  // Test 8: N (bare) calls enterNarrate when in flow mode (not toggleNarration)
  it("N (bare) resolves to enterNarrate in flow mode — not toggleNarration", () => {
    const action = resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "flow");
    expect(action).toBe("enterNarrate");
    expect(action).not.toBe("toggleNarration");
  });

  // Test 9: N (bare) when already in narrate mode still calls enterNarrate
  it("N (bare) resolves to enterNarrate when already in narrate mode", () => {
    // handleSelectMode is idempotent — the hook still calls enterNarrate; the
    // mode transition guard handles the no-op at the React layer.
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN" }), "narrate")).toBe("enterNarrate");
  });
});

describe("READER-4M-2 — Shift+N preserved as make-note (not enterNarrate)", () => {
  // Test 10: Shift+N does NOT call enterNarrate
  it("Shift+N does NOT resolve to enterNarrate in any mode", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN", shiftKey: true }), "page")).not.toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN", shiftKey: true }), "focus")).not.toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN", shiftKey: true }), "flow")).not.toBe("enterNarrate");
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyN", shiftKey: true }), "narrate")).not.toBe("enterNarrate");
  });
});

describe("READER-4M-2 — T key has no narration binding", () => {
  // Test 11: T key in page mode does NOT call toggleNarration
  it("T key in page mode does NOT resolve to toggleNarration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "page")).not.toBe("toggleNarration");
  });

  // Test 12: T key in flow mode does NOT call toggleNarration
  it("T key in flow mode does NOT resolve to toggleNarration", () => {
    expect(resolveReaderKey(makeKeyEvent({ code: "KeyT" }), "flow")).not.toBe("toggleNarration");
  });
});

describe("READER-4M-2 — Space stays in-mode (pause does not switch readingMode)", () => {
  // Test 13: Space in flow mode calls togglePlay but does NOT change readingMode
  it("Space in flow mode resolves to togglePlay — not a mode switch", () => {
    const action = resolveReaderKey(makeKeyEvent({ code: "Space" }), "flow");
    expect(action).toBe("togglePlay");
    // The action returned is togglePlay — it has no side-effect on readingMode.
    // A "page" action would be "exit" or "none"; this confirms no mode crossover.
    expect(action).not.toBe("exit");
    expect(action).not.toBe("none");
  });

  // Test 14: Space in narrate mode calls togglePlay but does NOT change readingMode
  it("Space in narrate mode resolves to togglePlay — not a mode switch", () => {
    const action = resolveReaderKey(makeKeyEvent({ code: "Space" }), "narrate");
    expect(action).toBe("togglePlay");
    expect(action).not.toBe("exit");
    expect(action).not.toBe("none");
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

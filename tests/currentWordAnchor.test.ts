import { describe, it, expect } from "vitest";
import { createCurrentWordAnchor } from "../src/reader/anchors/useCurrentWordAnchor";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("createCurrentWordAnchor — initial state", () => {
  it("getCurrent() returns 0 initially (word 0 is valid)", () => {
    const anchor = createCurrentWordAnchor();
    expect(anchor.getCurrent()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Explicit selection
// ---------------------------------------------------------------------------

describe("setExplicitSelection", () => {
  it("sets and returns the explicit selection", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setExplicitSelection(5);
    expect(anchor.getCurrent()).toBe(5);
  });

  it("preserves word index 0 as explicit selection", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(10);
    anchor.setExplicitSelection(0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("outranks resume anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(20);
    anchor.setExplicitSelection(7);
    expect(anchor.getCurrent()).toBe(7);
  });

  it("outranks soft visible anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(30);
    anchor.setExplicitSelection(3);
    expect(anchor.getCurrent()).toBe(3);
  });

  it("outranks hard-highlight anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setHardHighlight(15);
    anchor.setExplicitSelection(2);
    expect(anchor.getCurrent()).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Hard highlight
// ---------------------------------------------------------------------------

describe("setHardHighlight", () => {
  it("outranks resume anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(10);
    anchor.setHardHighlight(5);
    expect(anchor.getCurrent()).toBe(5);
  });

  it("is outranked by explicit selection", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setHardHighlight(5);
    anchor.setExplicitSelection(1);
    expect(anchor.getCurrent()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Resume anchor
// ---------------------------------------------------------------------------

describe("setResume", () => {
  it("outranks soft visible anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(25);
    anchor.setResume(12);
    expect(anchor.getCurrent()).toBe(12);
  });

  it("preserves resume at word 0", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(5);
    anchor.setResume(0);
    expect(anchor.getCurrent()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Navigation anchor
// ---------------------------------------------------------------------------

describe("setNavigation", () => {
  it("outranks mode-advance", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setActiveMode("focus");
    anchor.setModeAdvance("focus", 50);
    anchor.setNavigation(8);
    expect(anchor.getCurrent()).toBe(8);
  });

  it("is outranked by resume", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setNavigation(8);
    anchor.setResume(3);
    expect(anchor.getCurrent()).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Mode advance
// ---------------------------------------------------------------------------

describe("setModeAdvance", () => {
  it("updates current word when mode is active", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setActiveMode("focus");
    anchor.setModeAdvance("focus", 42);
    expect(anchor.getCurrent()).toBe(42);
  });

  it("does NOT update current word when mode is inactive", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setActiveMode("focus");
    anchor.setModeAdvance("flow", 99); // flow is not active
    expect(anchor.getCurrent()).toBe(0); // stays at default
  });

  it("is outranked by resume anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setActiveMode("focus");
    anchor.setModeAdvance("focus", 20);
    anchor.setResume(5);
    expect(anchor.getCurrent()).toBe(5);
  });

  it("is outranked by navigation anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setActiveMode("flow");
    anchor.setModeAdvance("flow", 30);
    anchor.setNavigation(7);
    expect(anchor.getCurrent()).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// Restore anchor
// ---------------------------------------------------------------------------

describe("setRestore", () => {
  it("outranks soft-visible", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(40);
    anchor.setRestore(6);
    expect(anchor.getCurrent()).toBe(6);
  });

  it("is outranked by mode-advance when active", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setRestore(6);
    anchor.setActiveMode("narrate");
    anchor.setModeAdvance("narrate", 11);
    expect(anchor.getCurrent()).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// Soft visible anchor
// ---------------------------------------------------------------------------

describe("setSoftVisible", () => {
  it("is used as fallback when nothing else is set", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(15);
    expect(anchor.getCurrent()).toBe(15);
  });

  it("is outranked by all other anchors", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(100);
    anchor.setRestore(1);
    expect(anchor.getCurrent()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// consumeForModeStart
// ---------------------------------------------------------------------------

describe("consumeForModeStart", () => {
  it("returns the highest-priority anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(20);
    anchor.setExplicitSelection(7);
    const result = anchor.consumeForModeStart("focus");
    expect(result).toBe(7);
  });

  it("consumes explicit-selection (one-shot)", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setExplicitSelection(5);
    const first = anchor.consumeForModeStart("focus");
    const second = anchor.consumeForModeStart("focus");
    expect(first).toBe(5);
    // After explicit-selection is consumed, falls back to 0 (default).
    expect(second).toBe(0);
  });

  it("consumes resume (one-shot)", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(12);
    const first = anchor.consumeForModeStart("focus");
    const second = anchor.consumeForModeStart("focus");
    expect(first).toBe(12);
    // After resume is consumed, falls back to 0 (default).
    expect(second).toBe(0);
  });

  it("does not consume hard-highlight on consume", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setHardHighlight(9);
    const first = anchor.consumeForModeStart("focus");
    const second = anchor.consumeForModeStart("focus");
    expect(first).toBe(9);
    // hard-highlight persists.
    expect(second).toBe(9);
  });

  it("does not consume soft-visible on consume", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(33);
    const first = anchor.consumeForModeStart("focus");
    const second = anchor.consumeForModeStart("focus");
    expect(first).toBe(33);
    expect(second).toBe(33);
  });

  it("falls back to lower-priority after explicit-selection is consumed", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(17);
    anchor.setExplicitSelection(42);
    anchor.consumeForModeStart("focus"); // consumes explicit-selection (42)
    // Now highest is resume (17).
    const result = anchor.consumeForModeStart("focus"); // consumes resume (17)
    expect(result).toBe(17);
    // Both one-shots gone, falls back to 0.
    expect(anchor.getCurrent()).toBe(0);
  });

  it("returns 0 when no anchors are set", () => {
    const anchor = createCurrentWordAnchor();
    expect(anchor.consumeForModeStart("focus")).toBe(0);
  });

  it("returns explicit-selection 0 correctly (not treated as missing)", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(10);
    anchor.setExplicitSelection(0);
    const result = anchor.consumeForModeStart("focus");
    expect(result).toBe(0);
    // After consuming, falls back to soft-visible.
    expect(anchor.getCurrent()).toBe(10);
  });

  it("returns resume 0 correctly (not treated as missing)", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(10);
    anchor.setResume(0);
    const result = anchor.consumeForModeStart("focus");
    expect(result).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// clearTransient
// ---------------------------------------------------------------------------

describe("clearTransient", () => {
  it("clears soft-visible", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(20);
    anchor.clearTransient();
    expect(anchor.getCurrent()).toBe(0);
  });

  it("clears mode-advance", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setActiveMode("page");
    anchor.setModeAdvance("page", 8);
    anchor.clearTransient();
    expect(anchor.getCurrent()).toBe(0);
  });

  it("preserves explicit-selection after clearTransient", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setExplicitSelection(5);
    anchor.setSoftVisible(30);
    anchor.clearTransient();
    expect(anchor.getCurrent()).toBe(5);
  });

  it("preserves resume after clearTransient", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(11);
    anchor.setSoftVisible(30);
    anchor.clearTransient();
    expect(anchor.getCurrent()).toBe(11);
  });

  it("preserves hard-highlight after clearTransient", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setHardHighlight(6);
    anchor.setSoftVisible(99);
    anchor.clearTransient();
    expect(anchor.getCurrent()).toBe(6);
  });

  it("preserves navigation after clearTransient", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setNavigation(4);
    anchor.setSoftVisible(50);
    anchor.clearTransient();
    expect(anchor.getCurrent()).toBe(4);
  });

  it("preserves restore after clearTransient", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setRestore(2);
    anchor.setSoftVisible(50);
    anchor.clearTransient();
    expect(anchor.getCurrent()).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Word index 0 preservation across all paths
// ---------------------------------------------------------------------------

describe("Word index 0 — valid throughout all paths", () => {
  it("explicit selection of 0 is preserved", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setExplicitSelection(0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("resume of 0 is preserved", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("hard-highlight of 0 is preserved", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setHardHighlight(0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("navigation to 0 is preserved", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setNavigation(0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("mode-advance to 0 is preserved", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setActiveMode("focus");
    anchor.setModeAdvance("focus", 0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("restore to 0 is preserved", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setRestore(0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("soft-visible at 0 is preserved", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(0);
    expect(anchor.getCurrent()).toBe(0);
  });

  it("consumeForModeStart with explicit-selection 0 returns 0", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setExplicitSelection(0);
    expect(anchor.consumeForModeStart("focus")).toBe(0);
  });

  it("consumeForModeStart with resume 0 returns 0", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(0);
    expect(anchor.consumeForModeStart("focus")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Priority ordering — comprehensive coverage
// ---------------------------------------------------------------------------

describe("Priority ordering", () => {
  it("explicit-selection beats hard-highlight beats resume beats navigation beats mode-advance beats restore beats soft-visible", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(7);
    expect(anchor.getCurrent()).toBe(7);

    anchor.setRestore(6);
    expect(anchor.getCurrent()).toBe(6);

    anchor.setActiveMode("flow");
    anchor.setModeAdvance("flow", 5);
    expect(anchor.getCurrent()).toBe(5);

    anchor.setNavigation(4);
    expect(anchor.getCurrent()).toBe(4);

    anchor.setResume(3);
    expect(anchor.getCurrent()).toBe(3);

    anchor.setHardHighlight(2);
    expect(anchor.getCurrent()).toBe(2);

    anchor.setExplicitSelection(1);
    expect(anchor.getCurrent()).toBe(1);
  });

  it("hard-selected word wins over resume anchor", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setResume(50);
    anchor.setHardHighlight(9);
    expect(anchor.getCurrent()).toBe(9);
  });

  it("when soft-visible exists and then hard-select is set, hard-select wins", () => {
    const anchor = createCurrentWordAnchor();
    anchor.setSoftVisible(22);
    expect(anchor.getCurrent()).toBe(22);
    anchor.setExplicitSelection(1);
    expect(anchor.getCurrent()).toBe(1);
  });
});

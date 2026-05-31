import { describe, it, expect } from "vitest";
import {
  shouldConsumeResumeAnchorOnAdvance,
  shouldPersistRelocateProgress,
} from "../src/utils/persistentReadingAnchor";

/**
 * NARRATE-INTENT-CURSOR-1 (the A4 fix) — resume-anchor CONSUME / CLEAR lifecycle.
 *
 * Root cause (NARRATE-DUAL-SOURCE-DIAG-1 verdict + A4-mechanism-addendum):
 * a reader-layer `resumeAnchorRef` is SET on hard-click and never CONSUMED/CLEARED,
 * so every pause→resume / mode re-entry re-seeds from the stale click (the
 * "gravity well"). Worse, while the anchor is non-null, onRelocate suppresses
 * progress-save (`shouldPersistRelocateProgress` is gated on `!hasResumeAnchor`),
 * freezing the persisted position at the click even as audio plays forward.
 *
 * Fix (this sprint, reader-layer only):
 *   1. CONSUME — null the anchor on the first live audio word-advance STRICTLY
 *      PAST it. Wired into BOTH reader-layer per-word handlers
 *      (ReaderContainer.applyNarrationActiveWord truth-sync path AND the focus/flow
 *      onWordAdvance handler) via the pure predicate
 *      `shouldConsumeResumeAnchorOnAdvance` (unit-tested directly here).
 *   2. CLEAR-before-SET — null any surviving anchor immediately before a fresh
 *      click writes a new one (design-memo option c). Wired into onWordClick.
 *
 * The single-action insight: nulling the anchor also un-gates progress-save,
 * because the onRelocate gate live-reads `resumeAnchorRef.current` each call.
 * That coupling is asserted here against the REAL `shouldPersistRelocateProgress`.
 *
 * The pure predicate is exercised against the real export. The stateful call-site
 * behavior is modeled by thin helpers that mirror production line-for-line. If a
 * call site changes, update its mirror.
 */

type AnchorRef = { current: number | null };

/**
 * Mirror of the CONSUME branch shared by ReaderContainer.applyNarrationActiveWord
 * (truth-sync) and the focus/flow onWordAdvance handler: when the predicate is
 * true, null the reader-owned anchor (single writer). Returns whether the anchor
 * was consumed on this call.
 */
function consumeOnAdvance(resumeAnchorRef: AnchorRef, advancedWordIndex: number): boolean {
  if (
    shouldConsumeResumeAnchorOnAdvance({
      resumeAnchor: resumeAnchorRef.current,
      advancedWordIndex,
    })
  ) {
    resumeAnchorRef.current = null;
    return true;
  }
  return false;
}

/**
 * Mirror of ReaderContainer.onWordClick CLEAR-before-SET (option c): null any
 * surviving anchor BEFORE writing the fresh click anchor. The SET is authoritative
 * for the click-driven start (A1).
 */
function clearBeforeClickSet(resumeAnchorRef: AnchorRef, clickedWordIndex: number): void {
  resumeAnchorRef.current = null; // CLEAR-on-fresh-start (backstop)
  resumeAnchorRef.current = clickedWordIndex; // SET (authoritative for A1)
}

/**
 * Mirror of onRelocate's progress-save gate. Production computes
 * `const hasResumeAnchor = resumeAnchorRef.current != null;` FRESH each call, then
 * feeds it into the real `shouldPersistRelocateProgress`. We call the real function
 * so the gravity-well coupling (anchor active → save suppressed; anchor null → save
 * restored) is asserted against production logic, not a re-implementation.
 */
function progressSaveEnabled(resumeAnchorRef: AnchorRef): boolean {
  const hasResumeAnchor = resumeAnchorRef.current != null;
  return shouldPersistRelocateProgress({
    mode: "narrate",
    hasEngaged: true,
    hasResumeAnchor,
    userBrowsing: false,
  });
}

describe("NARRATE-INTENT-CURSOR-1 — CONSUME predicate (shouldConsumeResumeAnchorOnAdvance)", () => {
  it("no-op when no anchor is set (null → one-shot / idempotent)", () => {
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: null, advancedWordIndex: 50 }),
    ).toBe(false);
  });

  it("no-op when the anchor is undefined (defensive)", () => {
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: undefined, advancedWordIndex: 50 }),
    ).toBe(false);
  });

  it("no-op AT the anchor itself (strict >, preserves A1's clicked-word start)", () => {
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: 66, advancedWordIndex: 66 }),
    ).toBe(false);
  });

  it("consumes on the first advance strictly past the anchor", () => {
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: 66, advancedWordIndex: 67 }),
    ).toBe(true);
  });

  it("fires at the A1 trace transition 66 → 77 (real-world advance gap)", () => {
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: 66, advancedWordIndex: 77 }),
    ).toBe(true);
  });

  it("no-op when the advance is below the anchor (backward / earlier word)", () => {
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: 66, advancedWordIndex: 40 }),
    ).toBe(false);
  });

  it("index-0 edge: anchor 0 consumes only on strictly positive advance", () => {
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: 0, advancedWordIndex: 0 }),
    ).toBe(false); // still on the clicked first word
    expect(
      shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: 0, advancedWordIndex: 1 }),
    ).toBe(true); // advanced past it
  });
});

describe("NARRATE-INTENT-CURSOR-1 — CONSUME lifecycle (mirrors both per-word handlers)", () => {
  it("CONSUME fires on first advance past anchor and anchor is null after", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 };
    expect(consumeOnAdvance(resumeAnchorRef, 67)).toBe(true);
    expect(resumeAnchorRef.current).toBeNull();
  });

  it("idempotent / one-shot: 2nd advance after consume is a no-op", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 };
    expect(consumeOnAdvance(resumeAnchorRef, 70)).toBe(true);
    expect(resumeAnchorRef.current).toBeNull();
    expect(consumeOnAdvance(resumeAnchorRef, 80)).toBe(false); // already null
    expect(resumeAnchorRef.current).toBeNull();
  });

  it("does not consume on equal or backward advance, only strictly past", () => {
    const resumeAnchorRef: AnchorRef = { current: 100 };
    expect(consumeOnAdvance(resumeAnchorRef, 90)).toBe(false);
    expect(consumeOnAdvance(resumeAnchorRef, 100)).toBe(false);
    expect(resumeAnchorRef.current).toBe(100);
    expect(consumeOnAdvance(resumeAnchorRef, 101)).toBe(true);
    expect(resumeAnchorRef.current).toBeNull();
  });
});

describe("NARRATE-INTENT-CURSOR-1 — A1 regression (click-to-narrate exact start preserved)", () => {
  it("starts at the clicked word; anchor only nulls after advancing past it", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 }; // hard click at 66 ("December")
    // Cold start seeds from the anchor — 66 is honored as the exact start.
    expect(resumeAnchorRef.current).toBe(66);
    // First spoken word IS the clicked word — strict > means NO consume yet.
    expect(consumeOnAdvance(resumeAnchorRef, 66)).toBe(false);
    expect(resumeAnchorRef.current).toBe(66);
    // Audio advances to the next word (A1 trace: 66 → 77) — consume now.
    expect(consumeOnAdvance(resumeAnchorRef, 77)).toBe(true);
    expect(resumeAnchorRef.current).toBeNull();
  });
});

describe("NARRATE-INTENT-CURSOR-1 — pause→resume no longer re-seeds from a stale anchor", () => {
  it("after consume during playback, a later resume seed has no stale anchor to read", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 };
    consumeOnAdvance(resumeAnchorRef, 66); // start at clicked word (no consume)
    consumeOnAdvance(resumeAnchorRef, 77); // advance past → consumed
    consumeOnAdvance(resumeAnchorRef, 120); // continued playback (already null, no-op)
    // Pause here. On resume, the seed chain live-reads resumeAnchorRef.current,
    // which is null — so it falls through to live/persisted progress, NOT the
    // stale click (the A4 gravity well is broken).
    expect(resumeAnchorRef.current).toBeNull();
  });
});

describe("NARRATE-INTENT-CURSOR-1 — gravity-well coupling (real shouldPersistRelocateProgress)", () => {
  it("progress-save is suppressed while the anchor is active, restored once consumed", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 };
    // Anchor active → onRelocate suppresses progress-save (frozen position).
    expect(progressSaveEnabled(resumeAnchorRef)).toBe(false);
    // The single CONSUME action nulls the anchor...
    expect(consumeOnAdvance(resumeAnchorRef, 100)).toBe(true);
    // ...which is ALSO the un-gate: the same null re-enables progress-save.
    expect(progressSaveEnabled(resumeAnchorRef)).toBe(true);
  });

  it("the un-gate is driven purely by the live anchor value (no separate branch)", () => {
    const resumeAnchorRef: AnchorRef = { current: null };
    // No anchor → save already enabled (live progress persists normally).
    expect(progressSaveEnabled(resumeAnchorRef)).toBe(true);
  });
});

describe("NARRATE-INTENT-CURSOR-1 — CLEAR-before-SET backstop (mirrors onWordClick)", () => {
  it("nulls a stale anchor before writing the fresh click anchor (new SET authoritative)", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 }; // stale from a prior cycle
    clearBeforeClickSet(resumeAnchorRef, 200); // fresh click at 200
    expect(resumeAnchorRef.current).toBe(200);
  });

  it("leaves no gravity-well carryover from the prior anchor", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 };
    clearBeforeClickSet(resumeAnchorRef, 200);
    expect(resumeAnchorRef.current).not.toBe(66);
  });

  it("works from a null starting state (no prior anchor)", () => {
    const resumeAnchorRef: AnchorRef = { current: null };
    clearBeforeClickSet(resumeAnchorRef, 200);
    expect(resumeAnchorRef.current).toBe(200);
  });
});

describe("NARRATE-INTENT-CURSOR-1 — superseded anchor (new SET overwrites before any advance)", () => {
  it("keys off the CURRENT anchor; the superseded value is never wrongly consumed", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 };
    // A new selection supersedes the old one before any advance.
    resumeAnchorRef.current = 200;
    // Advance to 100 is past the OLD 66 but NOT past the current 200 → no consume.
    expect(consumeOnAdvance(resumeAnchorRef, 100)).toBe(false);
    expect(resumeAnchorRef.current).toBe(200); // current value honored, not consumed
    // Only an advance past the current 200 consumes it.
    expect(consumeOnAdvance(resumeAnchorRef, 201)).toBe(true);
    expect(resumeAnchorRef.current).toBeNull();
  });
});

describe("NARRATE-INTENT-CURSOR-1 — consume-while-stopped no-op", () => {
  it("no advance fires while stopped, so the anchor is preserved for the next start", () => {
    const resumeAnchorRef: AnchorRef = { current: 66 };
    // While stopped, the per-word handlers are never invoked (consume rides on the
    // live audio word-advance, which does not tick without playback). The anchor
    // stays intact, ready to seed the next start.
    expect(resumeAnchorRef.current).toBe(66);
    // The first playback boundary lands ON the clicked word — still preserved.
    expect(consumeOnAdvance(resumeAnchorRef, 66)).toBe(false);
    expect(resumeAnchorRef.current).toBe(66);
  });
});

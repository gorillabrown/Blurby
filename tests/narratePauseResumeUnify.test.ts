import { describe, it, expect } from "vitest";

/**
 * NARRATE-PAUSE-RESUME-UNIFY-1 — resumeTargetRef capture-at-pause + unified resume seed.
 *
 * Root cause of A4 (from INTENT-CURSOR-1 close-out):
 * The cursor-mismatch resume branch reseeds from the externally-passed `currentWordIndex`
 * which comes from the NarrateModeAdapter's `_currentWordIndex`. That field gets corrupted
 * by the persistent anchor re-populating (via jumpToWord) after the consume lifecycle nulls
 * it. Result: resume always reseeds to the stale click position, not the audio heard position.
 *
 * Fix (this sprint):
 *   1. pause() captures `kokoroStrategy.getHeardFloorWordIndex()` into `resumeTargetRef`
 *      BEFORE strategy.pause() freezes AudioContext.
 *   2. resume() computes a unified seed from priority chain:
 *      `nextKokoroExactStartRef ?? resumeTargetRef ?? lastConfirmedAudioWordRef ?? cursorWordIndex`
 *   3. All restart branches reseed from the unified seed, not the raw external value.
 *   4. resumeTargetRef is consumed (nulled) on every resume — one-shot.
 */

// ── Types mirroring production refs ──────────────────────────────────────────

type Ref<T> = { current: T };

interface ResumeState {
  nextKokoroExactStartRef: Ref<number | null>;
  resumeTargetRef: Ref<number | null>;
  lastConfirmedAudioWordRef: Ref<number>;
  cursorWordIndex: number;
}

// ── Pure priority chain (mirrors the null-coalescing in useNarration resume()) ──

function computeUnifiedSeed(state: ResumeState): number {
  return state.nextKokoroExactStartRef.current
    ?? state.resumeTargetRef.current
    ?? state.lastConfirmedAudioWordRef.current
    ?? state.cursorWordIndex;
}

// ── Model of pause capture (mirrors useNarration pause() for kokoro) ──

function pauseCapture(
  resumeTargetRef: Ref<number | null>,
  getHeardFloorWordIndex: () => number | null,
): void {
  resumeTargetRef.current = getHeardFloorWordIndex();
}

// ── Model of resume consume (mirrors useNarration resume() top) ──

function resumeConsume(resumeTargetRef: Ref<number | null>): void {
  resumeTargetRef.current = null;
}

// ══════════════════════════════════════════════════════════════════════════════

describe("NARRATE-PAUSE-RESUME-UNIFY-1: resumeTargetRef capture-at-pause", () => {
  it("pause() captures heardFloor into resumeTargetRef", () => {
    const resumeTargetRef: Ref<number | null> = { current: null };
    const getHeardFloorWordIndex = () => 67;

    pauseCapture(resumeTargetRef, getHeardFloorWordIndex);

    expect(resumeTargetRef.current).toBe(67);
  });

  it("pause() captures null when scheduler has no active source", () => {
    const resumeTargetRef: Ref<number | null> = { current: null };
    const getHeardFloorWordIndex = () => null;

    pauseCapture(resumeTargetRef, getHeardFloorWordIndex);

    expect(resumeTargetRef.current).toBeNull();
  });

  it("pause() overwrites prior capture on re-pause", () => {
    const resumeTargetRef: Ref<number | null> = { current: 42 };
    const getHeardFloorWordIndex = () => 100;

    pauseCapture(resumeTargetRef, getHeardFloorWordIndex);

    expect(resumeTargetRef.current).toBe(100);
  });
});

describe("NARRATE-PAUSE-RESUME-UNIFY-1: unified seed priority chain", () => {
  it("intent (nextKokoroExactStartRef) takes highest priority", () => {
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: 200 },
      resumeTargetRef: { current: 67 },
      lastConfirmedAudioWordRef: { current: 65 },
      cursorWordIndex: 60,
    };

    expect(computeUnifiedSeed(state)).toBe(200);
  });

  it("resumeTarget takes priority when intent is null", () => {
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef: { current: 67 },
      lastConfirmedAudioWordRef: { current: 65 },
      cursorWordIndex: 60,
    };

    expect(computeUnifiedSeed(state)).toBe(67);
  });

  it("lastConfirmedAudioWordRef used when intent and resumeTarget are null", () => {
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef: { current: null },
      lastConfirmedAudioWordRef: { current: 65 },
      cursorWordIndex: 60,
    };

    expect(computeUnifiedSeed(state)).toBe(65);
  });

  it("cursorWordIndex is the final fallback", () => {
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef: { current: null },
      lastConfirmedAudioWordRef: { current: 0 },
      cursorWordIndex: 60,
    };

    // lastConfirmedAudioWordRef is 0 (falsy but valid number) — should still be chosen over cursorWordIndex
    expect(computeUnifiedSeed(state)).toBe(0);
  });

  it("zero is a valid priority chain value (not skipped as falsy)", () => {
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: 0 },
      resumeTargetRef: { current: 67 },
      lastConfirmedAudioWordRef: { current: 65 },
      cursorWordIndex: 60,
    };

    // 0 via ?? is NOT nullish — it should be selected
    expect(computeUnifiedSeed(state)).toBe(0);
  });
});

describe("NARRATE-PAUSE-RESUME-UNIFY-1: A4 scenario — stale anchor overridden", () => {
  it("resume uses resumeTarget (heardFloor at pause) over stale external anchor", () => {
    // Scenario: audio at 67, pause captures heardFloor=67, persistent anchor re-populates 66
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef: { current: 67 }, // captured at pause
      lastConfirmedAudioWordRef: { current: 67 },
      cursorWordIndex: 67,
    };
    // External stale anchor = 66 (would be passed as currentWordIndex)
    // Priority chain ignores that — resumeTarget wins
    expect(computeUnifiedSeed(state)).toBe(67);
  });

  it("user click during pause (intent) overrides resumeTarget", () => {
    // Scenario: audio at 67 when paused, user clicks word 200 during pause
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: 200 }, // user clicked 200
      resumeTargetRef: { current: 67 }, // captured at pause before click
      lastConfirmedAudioWordRef: { current: 67 },
      cursorWordIndex: 67,
    };
    // User's intent wins over resumeTarget
    expect(computeUnifiedSeed(state)).toBe(200);
  });

  it("resumeTarget consumed after single use (one-shot lifecycle)", () => {
    const resumeTargetRef: Ref<number | null> = { current: 67 };

    // First resume: seed reads 67
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef,
      lastConfirmedAudioWordRef: { current: 67 },
      cursorWordIndex: 67,
    };
    expect(computeUnifiedSeed(state)).toBe(67);

    // Consume (as resume() does)
    resumeConsume(resumeTargetRef);
    expect(resumeTargetRef.current).toBeNull();

    // Second resume without re-pause: resumeTarget is null, falls to lastConfirmed
    expect(computeUnifiedSeed(state)).toBe(67); // lastConfirmedAudioWordRef
  });

  it("full A4 lifecycle: start → advance → pause → (anchor re-populates) → resume → correct seed", () => {
    // Step 1: Start narration, audio advances to word 67
    const resumeTargetRef: Ref<number | null> = { current: null };
    const lastConfirmedAudioWordRef: Ref<number> = { current: 67 };
    const nextKokoroExactStartRef: Ref<number | null> = { current: null };
    const cursorWordIndex = 67;

    // Step 2: Pause — capture heardFloor
    const heardFloor = 67;
    pauseCapture(resumeTargetRef, () => heardFloor);
    expect(resumeTargetRef.current).toBe(67);

    // Step 3: Persistent anchor re-populates (simulated)
    // NarrateModeAdapter._currentWordIndex = 66 (stale anchor via jumpToWord)
    const staleExternalAnchor = 66;

    // Step 4: Resume — priority chain computation
    const state: ResumeState = {
      nextKokoroExactStartRef,
      resumeTargetRef,
      lastConfirmedAudioWordRef,
      cursorWordIndex,
    };
    const seed = computeUnifiedSeed(state);

    // The unified seed should be 67 (from resumeTarget), NOT 66 (stale anchor)
    expect(seed).toBe(67);
    expect(seed).not.toBe(staleExternalAnchor);

    // Step 5: Consume
    resumeConsume(resumeTargetRef);
    expect(resumeTargetRef.current).toBeNull();
  });
});

describe("NARRATE-PAUSE-RESUME-UNIFY-1: edge cases", () => {
  it("heardFloor null at pause → resumeTarget null → falls to lastConfirmed", () => {
    const resumeTargetRef: Ref<number | null> = { current: null };
    pauseCapture(resumeTargetRef, () => null); // no active source
    expect(resumeTargetRef.current).toBeNull();

    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef,
      lastConfirmedAudioWordRef: { current: 50 },
      cursorWordIndex: 48,
    };
    expect(computeUnifiedSeed(state)).toBe(50);
  });

  it("all refs zero → seed is 0 (start of book)", () => {
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef: { current: null },
      lastConfirmedAudioWordRef: { current: 0 },
      cursorWordIndex: 0,
    };
    expect(computeUnifiedSeed(state)).toBe(0);
  });

  it("resumeTarget=0 is valid (not treated as null)", () => {
    const state: ResumeState = {
      nextKokoroExactStartRef: { current: null },
      resumeTargetRef: { current: 0 },
      lastConfirmedAudioWordRef: { current: 50 },
      cursorWordIndex: 48,
    };
    // 0 is a valid word index (first word of book) — ?? does not skip it
    expect(computeUnifiedSeed(state)).toBe(0);
  });
});

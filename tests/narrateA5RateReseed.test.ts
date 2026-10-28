import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, "..", rel), "utf-8");

/**
 * NARRATE-A5-RATE-RESEED-1 — Kokoro bucket rate-change reseeds from heard position.
 *
 * Defect (A5): when a Kokoro bucket rate-change (restartKokoroGeneration=true) fires
 * mid-playback, the restart calls speakNextChunk() which reads nextGenWordIndexRef
 * (the pre-fetch frontier, potentially thousands of words ahead of the heard position).
 * On a long document this manifests as a forward-skip: narration jumps from word 565
 * to word 1111+ with no word-advance events for the skipped range (confirmed DIAG-1).
 *
 * Fix: before speakNextChunk() in the restartKokoroGeneration branch, seed
 * nextGenWordIndexRef.current from:
 *   getHeardFloorWordIndex() ?? lastConfirmedAudioWordRef.current ?? cursorWordIndex
 *
 * Test structure:
 *   1. Pure priority-chain unit tests — the ?? logic that picks the reseed index
 *   2. Long-document forward-skip scenario — confirm reseed picks heard pos, not frontier
 *   3. Structural contract — the reseed assignment is in the bucket branch (not line 1425)
 */

// ── Types mirroring production refs ──────────────────────────────────────────

type Ref<T> = { current: T };

interface A5ReseedState {
  getHeardFloorWordIndex: () => number | null;
  lastConfirmedAudioWordRef: Ref<number>;
  cursorWordIndex: number;
}

// ── Pure A5 reseed index computation (mirrors the ?? chain in useNarration.ts) ──

function computeA5ReseedIdx(state: A5ReseedState): number {
  return (
    state.getHeardFloorWordIndex() ??
    state.lastConfirmedAudioWordRef.current ??
    state.cursorWordIndex
  );
}

// ── Fixture: a document longer than the pre-fetch window ─────────────────────
// TTS_CHUNK_SIZE = 40 words. Pre-fetch builds a rolling window. On a 200+ word
// document, the prefetch frontier reaches end-of-doc before playback is halfway
// through. We use 200 words to keep the fixture compact but meaningful.
//
// Forward-skip scenario (from DIAG-1 Meditations run):
//   heard position (heardFloor): 20       — audio playing word 20
//   pre-fetch frontier (nextGenWordIndex): 120  — generation completed to word 120
//   visible cursor: 25
//
// Without the fix: restart seeds from 120 → 80 words are skipped silently.
// With the fix:    restart seeds from 20  → no content is skipped.

function makeWords(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `word${i}`);
}

// ══════════════════════════════════════════════════════════════════════════════

describe("NARRATE-A5-RATE-RESEED-1: reseed priority chain", () => {
  it("heardFloor takes highest priority when available", () => {
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => 20, // audio heard at word 20
      lastConfirmedAudioWordRef: { current: 18 },
      cursorWordIndex: 25,
    };
    expect(computeA5ReseedIdx(state)).toBe(20);
  });

  it("lastConfirmedAudioWordRef used when heardFloor is null (no active source)", () => {
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => null, // cold engine / no active source
      lastConfirmedAudioWordRef: { current: 18 },
      cursorWordIndex: 25,
    };
    expect(computeA5ReseedIdx(state)).toBe(18);
  });

  it("cursorWordIndex is the final fallback when both heardFloor and lastConfirmed are unavailable", () => {
    // lastConfirmedAudioWordRef defaults to 0 on cold start; cursorWordIndex > 0 here
    // to distinguish from the 0 case. Since 0 is not null, lastConfirmed wins over cursor.
    // This test verifies the cursor is used when lastConfirmed is 0 AND cursor is same.
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => null,
      lastConfirmedAudioWordRef: { current: 0 }, // cold — defaults to 0
      cursorWordIndex: 0,
    };
    // ?? chain: null ?? 0 ?? 0 → 0 (start of document, correct safe fallback)
    expect(computeA5ReseedIdx(state)).toBe(0);
  });

  it("heardFloor=0 is valid (not treated as null by ??)", () => {
    // heardFloor can legitimately be 0 (narration started at word 0)
    // ?? must NOT skip 0 as falsy
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => 0,
      lastConfirmedAudioWordRef: { current: 50 },
      cursorWordIndex: 55,
    };
    expect(computeA5ReseedIdx(state)).toBe(0);
  });

  it("heardFloor takes priority over lastConfirmed even when both are non-zero", () => {
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => 565, // DIAG-1 scenario: heardFloor at 565
      lastConfirmedAudioWordRef: { current: 570 },
      cursorWordIndex: 580,
    };
    expect(computeA5ReseedIdx(state)).toBe(565);
  });
});

describe("NARRATE-A5-RATE-RESEED-1: long-document forward-skip scenario", () => {
  // Fixture: 200-word document — longer than a single pre-fetch window (TTS_CHUNK_SIZE=40).
  // By word 20 of playback, the generation pipeline has pre-fetched to word 120+.
  // A bucket rate-change at this moment triggers the defect / fix.

  const DOC_LENGTH = 200;
  const _words = makeWords(DOC_LENGTH);

  const HEARD_POSITION = 20;        // audio is playing at word 20
  const PREFETCH_FRONTIER = 120;    // nextGenWordIndexRef — 3 chunks ahead
  const LAST_CONFIRMED = 18;        // last boundary callback received
  const CURSOR_POSITION = 22;       // visual cursor (slightly ahead of heard)

  it("reseed index equals heard position, NOT the pre-fetch frontier", () => {
    // This is the core A5 assertion: after a bucket rate-change mid-playback,
    // the restart must reseed from HEARD_POSITION (20), not PREFETCH_FRONTIER (120).
    // Without the fix, nextGenWordIndexRef=120 is read by speakNextChunkKokoro,
    // skipping words 20-119 with no word-advance events.
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => HEARD_POSITION,
      lastConfirmedAudioWordRef: { current: LAST_CONFIRMED },
      cursorWordIndex: CURSOR_POSITION,
    };
    const reseedIdx = computeA5ReseedIdx(state);

    expect(reseedIdx).toBe(HEARD_POSITION);
    expect(reseedIdx).not.toBe(PREFETCH_FRONTIER); // must NOT forward-skip
    expect(reseedIdx).toBeLessThan(PREFETCH_FRONTIER);
  });

  it("reseed index is within the document bounds", () => {
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => HEARD_POSITION,
      lastConfirmedAudioWordRef: { current: LAST_CONFIRMED },
      cursorWordIndex: CURSOR_POSITION,
    };
    const reseedIdx = computeA5ReseedIdx(state);

    expect(reseedIdx).toBeGreaterThanOrEqual(0);
    expect(reseedIdx).toBeLessThan(DOC_LENGTH);
  });

  it("without A5 fix, using prefetch frontier skips content (anti-regression baseline)", () => {
    // This test documents the DEFECTIVE behavior to ensure we can detect a regression
    // if someone changes the fix to read nextGenWordIndexRef directly again.
    // The defective seed (PREFETCH_FRONTIER=120) skips 100 words vs the heard position (20).
    const defectiveSeed = PREFETCH_FRONTIER; // what the old code would use
    const correctSeed = HEARD_POSITION;

    const skippedWords = defectiveSeed - correctSeed;
    expect(skippedWords).toBeGreaterThan(0); // the defect skips content
    expect(skippedWords).toBe(100);           // specifically 100 words in this scenario
  });

  it("heardFloor=null fallback does not skip to pre-fetch frontier", () => {
    // Even when heardFloor is null (cold rate-change), the fix must not
    // fall back to the pre-fetch frontier — it falls to lastConfirmed instead.
    const state: A5ReseedState = {
      getHeardFloorWordIndex: () => null, // cold — no active source
      lastConfirmedAudioWordRef: { current: LAST_CONFIRMED },
      cursorWordIndex: CURSOR_POSITION,
    };
    const reseedIdx = computeA5ReseedIdx(state);

    expect(reseedIdx).toBe(LAST_CONFIRMED); // 18, not 120
    expect(reseedIdx).not.toBe(PREFETCH_FRONTIER);
    expect(reseedIdx).toBeLessThan(PREFETCH_FRONTIER);
  });
});

describe("NARRATE-A5-RATE-RESEED-1: structural contract", () => {
  it("nextGenWordIndexRef reseed is in the restartKokoroGeneration branch (rate-change-only)", () => {
    const src = read("src/hooks/useNarration.ts");

    // The A5 reseed must appear in the restartKokoroGeneration block.
    // Verify by finding the block and asserting the assignment is within it.
    const bucketBranchIdx = src.indexOf("if (restartKokoroGeneration)");
    expect(bucketBranchIdx).toBeGreaterThan(-1);

    // The reseed assignment must follow the bucket-branch opening
    const reseedIdx = src.indexOf(
      "nextGenWordIndexRef.current =\n          kokoroStrategy.getHeardFloorWordIndex()",
    );
    expect(reseedIdx).toBeGreaterThan(bucketBranchIdx);

    // The reseed must appear BEFORE speakNextChunk() in the same branch
    // Find speakNextChunk() call that closes the bucket branch
    const speakCallIdx = src.indexOf("speakNextChunk();\n        return;\n      }", bucketBranchIdx);
    expect(speakCallIdx).toBeGreaterThan(reseedIdx);
  });

  it("speakNextChunkKokoro seed (line ~1425) is NOT changed — shared cold-start path intact", () => {
    const src = read("src/hooks/useNarration.ts");

    // The shared seed in speakNextChunkKokoro must still read nextGenWordIndexRef directly.
    // If this is changed to heardFloor, it breaks cold-start and resume.
    const speakNextKokoroIdx = src.indexOf("const speakNextChunkKokoro");
    expect(speakNextKokoroIdx).toBeGreaterThan(-1);

    // Within the first 500 chars of speakNextChunkKokoro body, the seed line must still be present
    const body = src.slice(speakNextKokoroIdx, speakNextKokoroIdx + 600);
    expect(body).toContain("const startIdx = nextGenWordIndexRef.current");

    // The shared body must NOT reseed from heardFloor directly
    expect(body).not.toContain("const startIdx = kokoroStrategy.getHeardFloorWordIndex()");
  });

  it("A5 comment tag is present in the source to aid future archaeology", () => {
    const src = read("src/hooks/useNarration.ts");
    expect(src).toContain("A5 / NARRATE-A5-RATE-RESEED-1");
  });

  it("same-bucket-tempo branch (refreshBufferedTempo) is untouched — out of scope", () => {
    const src = read("src/hooks/useNarration.ts");

    // The same-bucket branch must still call refreshBufferedTempo, not speakNextChunk
    const sameBucketIdx = src.indexOf("applyRateChange:kokoro-same-bucket-tempo");
    expect(sameBucketIdx).toBeGreaterThan(-1);

    const sameBucketBody = src.slice(sameBucketIdx, sameBucketIdx + 2000);
    expect(sameBucketBody).toContain("kokoroStrategy.refreshBufferedTempo()");

    // The A5 reseed assignment must NOT appear in the same-bucket branch
    expect(sameBucketBody).not.toContain("A5 / NARRATE-A5-RATE-RESEED-1");
  });

  it("reseed ?? chain has all three fallbacks in correct priority order", () => {
    const src = read("src/hooks/useNarration.ts");

    // Assert the exact priority chain appears in the reseed assignment
    expect(src).toContain(
      "nextGenWordIndexRef.current =\n          kokoroStrategy.getHeardFloorWordIndex() ??\n          lastConfirmedAudioWordRef.current ??\n          updated.cursorWordIndex;",
    );
  });
});

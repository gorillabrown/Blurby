// @vitest-environment jsdom
// NARRATE-REBUILD-1 P4 (D7) — Narrate runtime contract (READER-MODE-SEPARATION-2 design §D.3).
// Narrate is imported only through its index.ts, in a fresh module registry per test. Its two host seams are
// fakes (tests/narrate/harness/fakeNarrateHost): the AudioContext never advances by itself and the preload
// producer answers with lawful tables, so the cursor cannot move during these synchronous checks
// (advances: false). The clock owner after start is the audio truth, never a timer.
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import type { ReaderModeModule } from "../../src/reader/modes/ReaderModeAdapter";
import { assertLifecycle, assertNoLeak, assertSelectPausedAtZero } from "./harness/contractAssertions";
import { installFakeNarrateHost } from "../narrate/harness/fakeNarrateHost";

async function loadNarrate(): Promise<ReaderModeModule> {
  vi.resetModules();
  return (await import("../../src/reader/modes/narrate/index")).narrateMode;
}

describe("narrate mode runtime contract (G2)", () => {
  let restore: () => void = () => {};
  beforeEach(() => { restore = installFakeNarrateHost(); });
  afterEach(() => { restore(); });

  it("select is paused and word zero is valid", async () => {
    assertSelectPausedAtZero(await loadNarrate());
  });

  it("pause resume stop and destroy preserve their documented lifecycle", async () => {
    assertLifecycle(await loadNarrate(), { clockOwnerAfterStart: "audio-truth", playsAfterStart: true, advances: false });
  });

  it("snapshots and start inputs do not leak mutable state", async () => {
    assertNoLeak(await loadNarrate());
  });
});

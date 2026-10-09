// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G2 — Flow runtime contract (design §D.3).
// Flow is imported only through its index.ts, in a fresh module registry per test. The broker issues
// Flow a throwing audio port, so every lifecycle case below runs with throwing audio.
import { describe, it, vi } from "vitest";
import type { ReaderModeModule } from "../../src/reader/modes/ReaderModeAdapter";
import { assertLifecycle, assertNoLeak, assertSelectPausedAtZero } from "./harness/contractAssertions";

async function loadFlow(): Promise<ReaderModeModule> {
  vi.resetModules();
  return (await import("../../src/reader/modes/flow/index")).flowMode;
}

describe("flow mode runtime contract (G2)", () => {
  it("select is paused and word zero is valid", async () => {
    assertSelectPausedAtZero(await loadFlow());
  });

  it("pause resume stop and destroy preserve their documented lifecycle", async () => {
    // Flow plays on its own WPM word timer from the start. With no view mounted, the legacy
    // getEffectiveWords fallback (the tokenized words) feeds the timer and no highlight/pause-on-miss
    // runs (legacy: only with a mounted foliate API). 1 s keeps the 25-word fixture document short of
    // its end (completion would hand back to Page).
    assertLifecycle(await loadFlow(), { clockOwnerAfterStart: "wpm", playsAfterStart: true, advances: true, advanceMs: 1000 });
  });

  it("snapshots and start inputs do not leak mutable state", async () => {
    assertNoLeak(await loadFlow());
  });
});

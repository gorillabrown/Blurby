// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G2 — Focus runtime contract (design §D.3).
// Focus is imported only through its index.ts, in a fresh module registry per test (jsdom: the
// overlay's passive UI touches window at module load).
import { describe, it, vi } from "vitest";
import type { ReaderModeModule } from "../../src/reader/modes/ReaderModeAdapter";
import { assertLifecycle, assertNoLeak, assertSelectPausedAtZero } from "./harness/contractAssertions";

async function loadFocus(): Promise<ReaderModeModule> {
  vi.resetModules();
  return (await import("../../src/reader/modes/focus/index")).focusMode;
}

describe("focus mode runtime contract (G2)", () => {
  it("select is paused and word zero is valid", async () => {
    assertSelectPausedAtZero(await loadFocus());
  });

  it("pause resume stop and destroy preserve their documented lifecycle", async () => {
    // Focus plays on the WPM clock and advances after FOCUS_MODE_START_DELAY_MS. With no view mounted,
    // the legacy getEffectiveWords fallback (the tokenized words) feeds the engine. 1 s keeps the
    // 25-word fixture document short of its end (completion would hand back to Page).
    assertLifecycle(await loadFocus(), { clockOwnerAfterStart: "wpm", playsAfterStart: true, advances: true, advanceMs: 1000 });
  });

  it("snapshots and start inputs do not leak mutable state", async () => {
    assertNoLeak(await loadFocus());
  });
});

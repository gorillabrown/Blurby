// READER-MODE-SEPARATION-2 G2 — Page runtime contract (design §D.3).
// Page is imported only through its index.ts, in a fresh module registry per test.
import { describe, it, vi } from "vitest";
import type { ReaderModeModule } from "../../src/reader/modes/ReaderModeAdapter";
import { assertLifecycle, assertNoLeak, assertNoSpeed, assertSelectPausedAtZero } from "./harness/contractAssertions";

async function loadPage(): Promise<ReaderModeModule> {
  vi.resetModules();
  return (await import("../../src/reader/modes/page/index")).pageMode;
}

describe("page mode runtime contract (G2)", () => {
  it("select is paused and word zero is valid", async () => {
    assertSelectPausedAtZero(await loadPage());
  });

  it("pause resume stop and destroy preserve their documented lifecycle", async () => {
    // Page never plays: start is a no-op and the clock owner stays "none".
    assertLifecycle(await loadPage(), { clockOwnerAfterStart: "none", playsAfterStart: false, advances: false });
  });

  it("snapshots and start inputs do not leak mutable state", async () => {
    assertNoLeak(await loadPage());
  });

  it("exposes no speed and setSpeed is a no-op (speed amendment)", async () => {
    assertNoSpeed(await loadPage());
  });
});

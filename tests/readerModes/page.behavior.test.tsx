// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G4 — Page behavior replay against fixtures/page.baseline.json (design §D.4).
// Declared seams: Page's surface controller (recording fake), its anchor helper (real, wrapped to record
// commit/syncVisual/display-jump arguments at call) and its FoliateView (stub: jsdom cannot host foliate).
import { describe, expect, it, vi } from "vitest";
import { compareReplay, readFixtureText, replayFixture } from "./harness/fixtureReplay";
import { pageMode } from "../../src/reader/modes/page/index";

vi.mock("../../src/reader/modes/page/surface", async () =>
  (await import("./harness/fixtureReplay")).recordingSurfaceModule("createPageSurface"));
vi.mock("../../src/reader/modes/page/helpers/usePersistentReadingAnchor", async (importOriginal) =>
  (await import("./harness/fixtureReplay")).recordingAnchorModule(await importOriginal()));
vi.mock("../../src/reader/modes/page/FoliateView", async () =>
  (await import("./harness/fixtureReplay")).stubFoliateViewModule());

describe("page mode behavior (G4)", () => {
  it("preserves the recorded mode baseline", async () => {
    const result = await replayFixture("page", { page: pageMode });
    expect(result.errors).toEqual([]);
    expect(result.diff).toBeNull();
    // Q-F: the dropped cross-owner set equals the fixture expectation (page 6).
    expect(result.droppedEffects).toHaveLength(6);
    expect(result.droppedEffects.every((e) => e.channel.startsWith("audio."))).toBe(true);
    // OC-1: Page's baseline has no stale playing flags.
    expect(result.droppedObservations).toEqual([]);
    // Not vacuous: the hard selection was recorded at the seams; OC-3 re-attributes Page's display jump.
    expect(result.candidateScripts[0].commands[2].effects.map((e) => e.channel)).toEqual([
      "surface.clearSoftHighlight",
      "persistence.commitWordIndex",
      "page.jumpDisplayToWord",
      "persistence.updateDocProgress",
      "persistence.updateProgress",
      "surface.clearUserBrowsing",
    ]);
    expect(result.candidateScripts[0].commands[5].effects).toEqual([{ channel: "settings.update", args: [{ readingMode: "page" }] }]);

    // Negative controls: the comparator fails on a mutated copy of the committed fixture.
    const committed = readFixtureText("page");
    const shifted = JSON.parse(committed);
    shifted.scripts[0].commands[2].observation.highlightedWordIndex += 1;
    expect(compareReplay(JSON.stringify(shifted, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const droppedEffect = JSON.parse(committed);
    droppedEffect.scripts[1].commands[2].effects.splice(2, 1); // remove focusView.jumpToWord
    expect(compareReplay(JSON.stringify(droppedEffect, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const unflagged = JSON.parse(committed);
    delete unflagged.scripts[0].commands[5].effects[0].crossOwner;
    expect(compareReplay(JSON.stringify(unflagged, null, 2) + "\n", result.candidateScripts).errors).not.toEqual([]);
  });
});

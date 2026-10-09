// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G4 — Focus behavior replay against fixtures/focus.baseline.json (design §D.4).
// Router modules {page, focus}: every script opens in Page and Focus hands back to Page.
// Declared seams, for both registered modes: the surface controller (recording fake), the anchor helper
// (real, wrapped to record commit/syncVisual/display-jump arguments at call) and the FoliateView (stub:
// jsdom cannot host foliate). Focus's RSVP overlay renders for real while Focus plays.
import { describe, expect, it, vi } from "vitest";
import { compareReplay, readFixtureText, replayFixture } from "./harness/fixtureReplay";
import { createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { focusMode } from "../../src/reader/modes/focus/index";

vi.mock("../../src/reader/modes/page/surface", async () =>
  (await import("./harness/fixtureReplay")).recordingSurfaceModule("createPageSurface"));
vi.mock("../../src/reader/modes/page/helpers/usePersistentReadingAnchor", async (importOriginal) =>
  (await import("./harness/fixtureReplay")).recordingAnchorModule(await importOriginal(), "page"));
vi.mock("../../src/reader/modes/page/FoliateView", async () =>
  (await import("./harness/fixtureReplay")).stubFoliateViewModule());
vi.mock("../../src/reader/modes/focus/surface", async () =>
  (await import("./harness/fixtureReplay")).recordingSurfaceModule("createFocusSurface"));
vi.mock("../../src/reader/modes/focus/helpers/usePersistentReadingAnchor", async (importOriginal) =>
  (await import("./harness/fixtureReplay")).recordingAnchorModule(await importOriginal(), "focus"));
vi.mock("../../src/reader/modes/focus/FoliateView", async () =>
  (await import("./harness/fixtureReplay")).stubFoliateViewModule());

describe("focus mode behavior (G4)", () => {
  it("preserves the recorded mode baseline", async () => {
    const result = await replayFixture("focus", { page: pageMode, focus: focusMode });
    expect(result.errors).toEqual([]);
    expect(result.diff).toBeNull();
    // Q-F: the dropped cross-owner set equals the fixture expectation (focus 30), all audio.*.
    expect(result.droppedEffects).toHaveLength(30);
    expect(result.droppedEffects.every((e) => e.channel.startsWith("audio."))).toBe(true);
    // OC-1: Focus's baseline has no stale playing flags.
    expect(result.droppedObservations).toEqual([]);

    // Not vacuous: the start ran at the seams; OC-3 re-attributes the display jump to Focus's display.
    const [core7, core0, completion] = result.candidateScripts;
    expect(core7.commands[2].effects.map((e) => e.channel)).toEqual([
      "surface.clearSoftHighlight",
      "content.extractWords",
      "focus.jumpDisplayToWord",
      "settings.update",
    ]);
    expect(core0.commands[3].effects.at(-1)).toEqual({
      channel: "persistence.commitWordIndex",
      args: [0, "mode-advance", { persist: false, publishState: false, navigate: false, syncVisual: false }],
    });
    // Hard selection while playing retargets the engine (a second display jump + mode-advance commit).
    expect(core7.commands[9].effects.map((e) => e.channel)).toEqual([
      "surface.clearSoftHighlight",
      "persistence.commitWordIndex",
      "focus.jumpDisplayToWord",
      "persistence.updateDocProgress",
      "persistence.updateProgress",
      "focus.jumpDisplayToWord",
      "persistence.commitWordIndex",
      "surface.clearUserBrowsing",
    ]);
    // Completion hands Focus's position to Page through the router (no settings write, Page silent).
    expect(completion.commands[3].observation).toMatchObject({
      readingMode: "page", focusPlaying: false, highlightedWordIndex: 24, canonicalWordIndex: 24, publishedWordIndex: 7,
    });
    expect(core7.commands[12].effects).toEqual([{ channel: "settings.update", args: [{ readingMode: "page" }] }]);

    // Negative controls: the comparator fails on mutated copies of the committed fixture.
    const committed = readFixtureText("focus");
    const shifted = JSON.parse(committed);
    shifted.scripts[0].commands[4].observation.highlightedWordIndex += 1;
    expect(compareReplay(JSON.stringify(shifted, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const droppedEffect = JSON.parse(committed);
    droppedEffect.scripts[0].commands[2].effects.splice(6, 1); // remove focusView.jumpToWord
    expect(compareReplay(JSON.stringify(droppedEffect, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const unflagged = JSON.parse(committed);
    delete unflagged.scripts[0].commands[1].effects[0].crossOwner;
    expect(compareReplay(JSON.stringify(unflagged, null, 2) + "\n", result.candidateScripts).errors).not.toEqual([]);
  });

  it("hands its engagement to Page (legacy hasEngagedRef persists across mode switches)", () => {
    vi.useFakeTimers({ now: 0 });
    try {
      const fake = createFakeInfrastructure();
      const document = fake.infra.document.snapshot();
      const router = createReaderModeRouter({
        modules: { page: pageMode, focus: focusMode },
        broker: createReaderPorts(fake.infra),
        getDocument: () => document,
        getSettings: () => fake.infra.settings.read(),
      });
      router.openDocument(document);
      expect(router.getActive()!.runtime.exportHandoff("persistent").engaged).toBe(false);
      router.select("focus");
      expect(router.getActive()!.runtime.exportHandoff("persistent").engaged).toBe(false);
      router.togglePlay(); // startFocus: hasEngagedRef.current = true
      router.pauseToPage();
      expect(router.getActive()!.mode).toBe("page");
      expect(router.getActive()!.runtime.exportHandoff("persistent").engaged).toBe(true);
      router.destroy();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});

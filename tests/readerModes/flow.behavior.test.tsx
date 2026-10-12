// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G4 — Flow behavior replay against fixtures/flow.baseline.json (design §D.4).
// Router modules {page, focus, flow}. Declared seams, for every registered mode: the surface controller
// (recording fake), the anchor helper (real, wrapped to record commit/syncVisual/display-jump arguments
// at call) and the FoliateView (stub: jsdom cannot host foliate, so Flow's line pacer never finds its
// scroll surface — scroll.* is not mounted, as in B0).
import { describe, expect, it, vi } from "vitest";
import { compareReplay, readFixtureText, replayFixture } from "./harness/fixtureReplay";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { focusMode } from "../../src/reader/modes/focus/index";
import { flowMode } from "../../src/reader/modes/flow/index";

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
vi.mock("../../src/reader/modes/flow/surface", async () =>
  (await import("./harness/fixtureReplay")).recordingSurfaceModule("createFlowSurface"));
vi.mock("../../src/reader/modes/flow/helpers/usePersistentReadingAnchor", async (importOriginal) =>
  (await import("./harness/fixtureReplay")).recordingAnchorModule(await importOriginal(), "flow"));
vi.mock("../../src/reader/modes/flow/FoliateView", async () =>
  (await import("./harness/fixtureReplay")).stubFoliateViewModule());

const MODULES = { page: pageMode, focus: focusMode, flow: flowMode };

/** OC-1: completion leaves the legacy flowPlaying latch true while Page is active (flow-core-start-7 steps 7–9). */
const EXPECTED_DROPPED_OBSERVATIONS = [7, 8, 9].map((step) => ({ script: "flow-core-start-7", step, field: "flowPlaying", baseline: true }));

const START_CHANNELS = [
  "surface.clearSoftHighlight",
  "content.extractWords",
  "flow.jumpDisplayToWord",
  "surface.highlight",
  "settings.update",
  "persistence.commitWordIndex",
  "surface.highlight",
];

describe("flow mode behavior (G4)", () => {
  it("preserves the recorded mode baseline", async () => {
    const result = await replayFixture("flow", MODULES);
    expect(result.errors).toEqual([]);
    expect(result.diff).toBeNull();
    // Q-F: the dropped cross-owner set equals the fixture expectation (flow 35), all audio.*.
    expect(result.droppedEffects).toHaveLength(35);
    expect(result.droppedEffects.every((e) => e.channel.startsWith("audio."))).toBe(true);
    // OC-1: exactly the three stale flowPlaying observations after completion.
    expect(result.droppedObservations).toEqual(EXPECTED_DROPPED_OBSERVATIONS);

    // Not vacuous: the start ran at the seams; OC-3 re-attributes the display jump to Flow's display.
    const [core7, core0] = result.candidateScripts;
    expect(core7.commands[2].effects.map((e) => e.channel)).toEqual(START_CHANNELS);
    // Resume is a cold restart from the anchor (Q-G): step 6 repeats the start sequence at word 17.
    expect(core7.commands[6].effects.map((e) => e.channel)).toEqual(START_CHANNELS);
    expect(core7.commands[6].effects[2]).toEqual({ channel: "flow.jumpDisplayToWord", args: [17] });
    // Completion hands Flow's position to Page through the router (no settings write, Page silent).
    expect(core7.commands[7].observation).toMatchObject({
      readingMode: "page", flowPlaying: false, highlightedWordIndex: 24, canonicalWordIndex: 24, publishedWordIndex: 7,
    });
    // Hard selection while playing retargets the word timer (a mode-advance commit + flow highlight).
    expect(core0.commands[8].effects.map((e) => e.channel)).toEqual([
      "surface.clearSoftHighlight",
      "persistence.commitWordIndex",
      "flow.jumpDisplayToWord",
      "persistence.updateDocProgress",
      "persistence.updateProgress",
      "persistence.commitWordIndex",
      "surface.highlight",
      "surface.clearUserBrowsing",
    ]);
    expect(core0.commands[11].effects).toEqual([{ channel: "settings.update", args: [{ readingMode: "page" }] }]);

    // Negative controls: the comparator fails on mutated copies of the committed fixture.
    const committed = readFixtureText("flow");
    const shifted = JSON.parse(committed);
    shifted.scripts[0].commands[3].observation.highlightedWordIndex += 1;
    expect(compareReplay(JSON.stringify(shifted, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const droppedEffect = JSON.parse(committed);
    droppedEffect.scripts[0].commands[2].effects.splice(6, 1); // remove focusView.jumpToWord
    expect(compareReplay(JSON.stringify(droppedEffect, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const unflagged = JSON.parse(committed);
    delete unflagged.scripts[0].commands[1].effects[0].crossOwner;
    expect(compareReplay(JSON.stringify(unflagged, null, 2) + "\n", result.candidateScripts).errors).not.toEqual([]);

    // OC-1 is recomputed, not a blanket waiver: a stale flag the rule does not cover still fails.
    const staleFocus = JSON.parse(committed);
    staleFocus.scripts[0].commands[3].observation.flowPlaying = false;
    expect(compareReplay(JSON.stringify(staleFocus, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();
  });

  it("resumes Flow after a cross-book open without select arrival effects (useFlowScrollSync effect 2)", () => {
    vi.useFakeTimers({ now: 0 });
    try {
      // Tokenized document path: outside a replay the recording surface reports no loaded foliate words.
      const fake = createFakeInfrastructure({ document: createFakeDocument({ useFoliate: false, filepath: null }) });
      const document = fake.infra.document.snapshot();
      const router = createReaderModeRouter({
        modules: MODULES,
        broker: createReaderPorts(fake.infra),
        getDocument: () => document,
        getSettings: () => fake.infra.settings.read(),
      });
      router.openDocument(document);
      fake.effects.length = 0;
      router.resumeFlowAfterBookOpen();
      expect(router.getActive()!.mode).toBe("flow");
      expect(router.getActive()!.runtime.getSnapshot()).toMatchObject({ playing: true, clockOwner: "wpm", canonicalWordIndex: 7 });
      // startFlow from Page: settings without the isNarrating key, no syncVisual/arrival writes.
      expect(fake.effects.filter((c) => c.method === "settings.update").map((c) => c.args[0])).toEqual([
        { readingMode: "flow", lastReadingMode: "flow" },
      ]);
      // Only from Page: a second call while Flow is active changes nothing.
      const key = router.getActive()!.key;
      router.resumeFlowAfterBookOpen();
      expect(router.getActive()!.key).toBe(key);
      router.destroy();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});

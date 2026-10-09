// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G4 — Narrate behavior replay against fixtures/narrate.baseline.json (design §D.4).
// Router modules {page, focus, flow, narrate}. Declared seams, for every registered mode: the surface
// controller (recording fake), the anchor helper (real, wrapped to record commit/syncVisual/display-jump
// arguments at call) and the FoliateView (stub: jsdom cannot host foliate). `narrateView.applyActiveWord`
// is Narrate's applyNarrationActiveWord, spied on the runtime prototype. The fixture has zero
// cross-owner effects, so the comparison is strict byte-for-byte after the standard normalization.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { compareReplay, readFixtureText, recordSeam, replayFixture, type Script } from "./harness/fixtureReplay";
import type { ReaderModeCreateInput, ReaderModeModule } from "../../src/reader/modes/ReaderModeAdapter";
import { pageMode } from "../../src/reader/modes/page/index";
import { focusMode } from "../../src/reader/modes/focus/index";
import { flowMode } from "../../src/reader/modes/flow/index";
import { narrateMode } from "../../src/reader/modes/narrate/index";
import { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";

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
vi.mock("../../src/reader/modes/narrate/surface", async () =>
  (await import("./harness/fixtureReplay")).recordingSurfaceModule("createNarrateSurface"));
vi.mock("../../src/reader/modes/narrate/helpers/usePersistentReadingAnchor", async (importOriginal) =>
  (await import("./harness/fixtureReplay")).recordingAnchorModule(await importOriginal(), "narrate"));
vi.mock("../../src/reader/modes/narrate/FoliateView", async () =>
  (await import("./harness/fixtureReplay")).stubFoliateViewModule());

const MODULES = { page: pageMode, focus: focusMode, flow: flowMode, narrate: narrateMode };

beforeAll(() => {
  // Seam narrateView.applyActiveWord (legacy onNarrateTruthSync → ReaderContainer applyNarrationActiveWord).
  const original = NarrateModeRuntime.prototype.applyNarrationActiveWord;
  vi.spyOn(NarrateModeRuntime.prototype, "applyNarrationActiveWord").mockImplementation(function (this: NarrateModeRuntime, wordIndex: number) {
    recordSeam("narrateView.applyActiveWord", [wordIndex]);
    return original.call(this, wordIndex);
  });
});

/** The committed fixture restricted to the named scripts (the comparison rule is unchanged). */
function fixtureWith(...names: string[]): string {
  const fixture = JSON.parse(readFixtureText("narrate"));
  const scripts = fixture.scripts.filter((s: { name: string }) => names.includes(s.name));
  expect(scripts.map((s: { name: string }) => s.name)).toEqual(names);
  return JSON.stringify({ ...fixture, scripts }, null, 2) + "\n";
}

/** Wraps every module so runtime constructions and lifecycle starts are counted per mode. */
function countingModules() {
  const created: Record<string, number> = { page: 0, focus: 0, flow: 0, narrate: 0 };
  const started: Record<string, number> = { page: 0, focus: 0, flow: 0, narrate: 0 };
  const modules = Object.fromEntries(Object.entries(MODULES).map(([mode, module]) => [mode, {
    ...(module as ReaderModeModule),
    createRuntime: (input: ReaderModeCreateInput) => {
      created[mode] += 1;
      const runtime = (module as ReaderModeModule).createRuntime(input);
      const start = runtime.start.bind(runtime);
      return new Proxy(runtime, {
        get: (target, prop, receiver) => (prop === "start"
          ? (...args: Parameters<typeof start>) => { started[mode] += 1; return start(...args); }
          : Reflect.get(target, prop, receiver)),
      });
    },
  }]));
  return { modules, created, started };
}

const channels = (script: Script, step: number) => script.commands[step].effects.map((e) => e.channel);
const effectsOf = (script: Script, channel: string) => script.commands.flatMap((c) => c.effects.filter((e) => e.channel === channel));

const START_CHANNELS = [
  "audio.stop",
  "audio.setOnTruthSync",
  "audio.setPageEndWord",
  "surface.clearSoftHighlight",
  "content.extractWords",
  "audio.setOnTruthSync",
  "narrate.jumpDisplayToWord",
  "settings.update",
  "audio.start",
  "settings.update",
];

describe("narrate mode behavior (G4)", () => {
  it("preserves the recorded mode baseline", async () => {
    const result = await replayFixture("narrate", MODULES);
    expect(result.errors).toEqual([]);
    expect(result.diff).toBeNull();
    // Q-F: the narrate fixture has no cross-owner effects; OC-1 drops no observation.
    expect(result.droppedEffects).toEqual([]);
    expect(result.droppedObservations).toEqual([]);
    expect(result.candidateScripts.map((s) => s.name)).toEqual([
      "narrate-core-start-7",
      "narrate-core-start-0",
      "narrate-delayed-extraction-start-0",
      "narrate-delayed-extraction-start-2",
      "narrate-pause-resume-reuses-session-start-7",
      "narrate-start-failure-warming-start-7",
      "narrate-start-failure-error-start-7",
    ]);

    // Not vacuous: the start ran at the seams; OC-3 re-attributes the display jump to Narrate's display.
    const [core7] = result.candidateScripts;
    expect(channels(core7, 2)).toEqual(START_CHANNELS);
    expect(core7.commands[2].effects[8]).toMatchObject({ channel: "audio.start", args: [expect.any(Array), 7, 300] });
    // Audio truth drives the anchor: commit, the narrate view seam, then the narrate highlight.
    expect(core7.commands[6].effects.slice(3).map((e) => e.channel)).toEqual([
      "persistence.commitWordIndex", "narrateView.applyActiveWord", "surface.highlight",
    ]);
    // Narrate→Page: the pause-to-page narrate part, then the release triple, inside the teardown window.
    expect(channels(core7, 14)).toEqual([
      "audio.stop", "audio.setOnTruthSync", "settings.update",
      "audio.stop", "audio.setOnTruthSync", "audio.setPageEndWord", "settings.update",
    ]);
    // Teardown emits nothing.
    expect(core7.commands[15].effects).toEqual([]);

    // Negative controls: the comparator fails on mutated copies of the committed fixture.
    const committed = readFixtureText("narrate");
    const shifted = JSON.parse(committed);
    shifted.scripts[0].commands[6].observation.highlightedWordIndex += 1;
    expect(compareReplay(JSON.stringify(shifted, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const droppedStop = JSON.parse(committed);
    droppedStop.scripts[0].commands[14].effects.splice(3, 1); // remove the second audio.stop
    expect(compareReplay(JSON.stringify(droppedStop, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();

    const resumeWithIndex = JSON.parse(committed);
    resumeWithIndex.scripts[0].commands[10].effects[0].args = [17]; // NarrateModeAdapter's resume(index)
    expect(compareReplay(JSON.stringify(resumeWithIndex, null, 2) + "\n", result.candidateScripts).diff).not.toBeNull();
  });

  it("Narrate delayed extraction preserves exact word and mode", async () => {
    const { modules, created } = countingModules();
    const result = await replayFixture(
      "narrate",
      modules,
      fixtureWith("narrate-delayed-extraction-start-0", "narrate-delayed-extraction-start-2"),
    );
    expect(result.errors).toEqual([]);
    expect(result.diff).toBeNull();
    for (const [script, word] of [[result.candidateScripts[0], 0], [result.candidateScripts[1], 2]] as const) {
      // The first press finds no words, turns the page and waits; nothing starts yet.
      expect(channels(script, 2)).toEqual([
        "audio.stop", "audio.setOnTruthSync", "audio.setPageEndWord",
        "surface.clearSoftHighlight", "content.extractWords", "surface.next",
      ]);
      // One start, at the exact word, after the retry; the mode stays Narrate (LL-125).
      const starts = effectsOf(script, "audio.start");
      expect(starts).toHaveLength(1);
      expect(starts[0].args.slice(1)).toEqual([word, 300]);
      expect(script.commands[4].observation).toMatchObject({ readingMode: "narrate", isNarrating: true, canonicalWordIndex: word });
      expect(effectsOf(script, "settings.update").every((e) => (e.args[0] as { readingMode?: string }).readingMode !== "flow")).toBe(true);
    }
    // Zero Flow runtime constructions (and no Focus): only Page (open) and Narrate.
    expect(created).toEqual({ page: 2, focus: 0, flow: 0, narrate: 2 });
  });

  it("Narrate pause resume reuses the current audio session", async () => {
    const result = await replayFixture("narrate", MODULES, fixtureWith("narrate-pause-resume-reuses-session-start-7"));
    expect(result.errors).toEqual([]);
    expect(result.diff).toBeNull();
    const [script] = result.candidateScripts;
    const resumes = effectsOf(script, "audio.resume");
    expect(resumes).toHaveLength(2);
    expect(resumes.every((e) => e.args.length === 0)).toBe(true); // production resume() takes no arguments
    expect(effectsOf(script, "audio.start")).toHaveLength(1);
    expect(effectsOf(script, "audio.pause").map((e) => e.args)).toEqual([["user-stop"], ["user-stop"]]);
    // Zero audio.stop after the first start: pause/resume never tears the session down.
    const firstStartStep = script.commands.findIndex((c) => c.effects.some((e) => e.channel === "audio.start"));
    const afterStart = script.commands.slice(firstStartStep).flatMap((c, i) => {
      const effects = i === 0 ? c.effects.slice(c.effects.findIndex((e) => e.channel === "audio.start")) : c.effects;
      return effects.filter((e) => e.channel === "audio.stop");
    });
    expect(afterStart).toEqual([]);
  });

  it("Narrate start failure stays local", async () => {
    const { modules, created, started } = countingModules();
    const result = await replayFixture(
      "narrate",
      modules,
      fixtureWith("narrate-start-failure-warming-start-7", "narrate-start-failure-error-start-7"),
    );
    expect(result.errors).toEqual([]);
    expect(result.diff).toBeNull();
    const [warming, error] = result.candidateScripts;

    // Warming: the session is live (isNarrating) and the next press resumes it (Q-G).
    expect(warming.commands[2].observation).toMatchObject({ isNarrating: true, audio: { status: "warming", cursorWordIndex: 7 } });
    expect(channels(warming, 4)).toEqual(["audio.resume", "settings.update"]);
    // Error: no session; the next press starts again; the failure stays in Narrate.
    expect(error.commands[2].observation).toMatchObject({ readingMode: "narrate", isNarrating: false, audio: { status: "error" } });
    expect(effectsOf(error, "audio.start")).toHaveLength(2);
    expect(channels(error, 5)).toEqual([
      "audio.stop", "audio.setOnTruthSync", "audio.setPageEndWord", "settings.update",
    ]);
    // The canonical word never advances before a "started" session.
    for (const script of [warming, error]) {
      for (const command of script.commands) {
        if (command.observation.mounted === false) continue;
        expect(command.observation.canonicalWordIndex, `${script.name} step ${command.step}`).toBe(7);
      }
    }
    // No Flow/Focus runtime, and no Page start (Page is only reselected by pause-to-page).
    expect(created).toMatchObject({ focus: 0, flow: 0 });
    expect(started).toMatchObject({ page: 0, focus: 0, flow: 0 });
  });
});

// @vitest-environment jsdom
// PLAY-FIRST-TEXT-1 (BUG-236; owner ruling 2026-10-30 "Start at first text"; Brain1 rulings 1–2 and Q2 option (a)):
// Play in Flow while the view shows a section with no words moves to the first later section with words and starts on
// its first word. A Play made before the section map exists starts exactly once when the map arrives.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff, type ReaderBookWordsValue } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createFlowRuntime } from "../../src/reader/modes/flow/index";
import type { FlowModeRuntime } from "../../src/reader/modes/flow/ModeRuntime";
import type { FlowFoliateViewAPI } from "../../src/reader/modes/flow/FoliateView";
import { createFakeInfrastructure } from "./harness/fakePorts";
import {
  BOOK, NO_TEXT_BOOK, calledWithMotion, createZeroWordView, highlightedWithMotion, settle, zeroWordDocument,
} from "./harness/zeroWordBook";

const WORD_MS = 60_000 / 300;

function open(options: { shown: number; position: number; book?: ReaderBookWordsValue | null; holdReady?: boolean }) {
  const book = options.book === undefined ? BOOK : options.book;
  const fake = createFakeInfrastructure({ document: zeroWordDocument(options.position, book) });
  const broker = createReaderPorts(fake.infra);
  const document = fake.infra.document.snapshot();
  broker.openDocument(document.documentId);
  const { key, ports } = broker.issue("flow");
  const runtime = createFlowRuntime({
    key, ports, document, settings: fake.infra.settings.read(),
    handoff: createInitialHandoff(document, document.wordCount), arrival: "silent",
  }) as FlowModeRuntime;
  const { api, view, releaseReady } = createZeroWordView(options.shown, { holdReady: options.holdReady });
  runtime.viewApiRef.current = api as unknown as FlowFoliateViewAPI;
  runtime.select(options.position);
  return { fake, runtime, api, view, releaseReady };
}

const engineWord = (runtime: FlowModeRuntime) => runtime.exportHandoff("capture-current").highlightedWordIndex;
const effects = (fake: ReturnType<typeof createFakeInfrastructure>, method: string) => fake.effects.filter((c) => c.method === method);
const completedStarts = (fake: ReturnType<typeof createFakeInfrastructure>) =>
  effects(fake, "settings.update").filter((c) => {
    const a = c.args[0] as Record<string, unknown>;
    return a.readingMode === "flow" && a.lastReadingMode === "flow";
  });
const modeWrites = (fake: ReturnType<typeof createFakeInfrastructure>) =>
  effects(fake, "settings.update").filter((c) => "readingMode" in (c.args[0] as Record<string, unknown>));

describe("Flow: Play on a section with no words starts at the first text (PLAY-FIRST-TEXT-1)", () => {
  const opened: FlowModeRuntime[] = [];
  afterEach(() => {
    for (const r of opened.splice(0)) r.destroy();
    vi.useRealTimers();
  });

  it("(f1) cover, fresh book: moves to section 1 and starts on its first word, MEDITATIONS", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api, view } = open({ shown: 0, position: 0 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    expect(api.goToSection).toHaveBeenCalledTimes(1);
    expect(api.goToSection).toHaveBeenCalledWith(1);
    expect(api.next).not.toHaveBeenCalled();
    expect(view.shown).toBe(1);
    expect(highlightedWithMotion(api, 0, "flow")).toBe(true);
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 0 });
    expect(engineWord(runtime)).toBe(0);
    expect(BOOK.words[0]).toBe("MEDITATIONS");
  });

  it("(f2) cover with a stale anchor: starts at word 0, not the anchor 12", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api } = open({ shown: 0, position: 12 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    expect(api.goToSection).toHaveBeenCalledWith(1);
    expect(highlightedWithMotion(api, 0, "flow")).toBe(true);
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 0 });
    expect(engineWord(runtime)).toBe(0);
  });

  it("(f3) plate: moves to section 3 and starts on s3w0", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api } = open({ shown: 2, position: 5 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    expect(api.goToSection).toHaveBeenCalledWith(3);
    expect(highlightedWithMotion(api, 10, "flow")).toBe(true);
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 10 });
    expect(engineWord(runtime)).toBe(10);
    expect(BOOK.words[10]).toBe("s3w0");
  });

  it("(f4) back cover with no later text: Play does nothing", async () => {
    vi.useFakeTimers({ now: 0 });
    const { fake, runtime, api } = open({ shown: 4, position: 15 });
    opened.push(runtime);
    runtime.togglePlay();
    await vi.advanceTimersByTimeAsync(1000);
    expect(runtime.getSnapshot().playing).toBe(false);
    expect(api.goToSection).not.toHaveBeenCalled();
    expect(api.next).not.toHaveBeenCalled();
    expect(api.highlightWordByIndex).not.toHaveBeenCalled();
    expect(effects(fake, "persistence.markEngaged")).toEqual([]);
  });

  it("(f5) the relocate save writes the playing word, never the stale anchor", async () => {
    vi.useFakeTimers({ now: 0 });
    const { fake, runtime } = open({ shown: 0, position: 12 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(WORD_MS);
    expect(engineWord(runtime)).toBe(1);
    runtime.onRelocate({ cfi: "epubcfi(/6/4!/4/2/1:0)", fraction: 0.1 });
    const saves = effects(fake, "persistence.scheduleRelocateSave");
    expect(saves.length).toBeGreaterThan(0);
    expect(saves[saves.length - 1].args).toEqual([{ wordIndex: 1, cfi: "epubcfi(/6/4!/4/2/1:0)" }]);
    expect(saves.some((c) => (c.args[0] as { wordIndex: number }).wordIndex === 12)).toBe(false);
  });

  it("(f6) Pause during the move cancels it", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api, releaseReady } = open({ shown: 0, position: 0, holdReady: true });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    expect(api.goToSection).toHaveBeenCalledWith(1);
    runtime.pause();
    releaseReady();
    await vi.advanceTimersByTimeAsync(1000);
    expect(runtime.getSnapshot().playing).toBe(false);
    expect(calledWithMotion(api)).toBe(false);
    expect(engineWord(runtime)).toBe(0);
  });

  async function mapAfterPlay(publishAtMs: number, before?: (o: ReturnType<typeof open>) => void, flagPath = false) {
    vi.useFakeTimers({ now: 0 });
    const o = open({ shown: 0, position: 0, book: null });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    expect(o.runtime.getSnapshot().playing).toBe(false);
    if (flagPath) expect(o.api.next).not.toHaveBeenCalled(); // no blind page turn on the flag path
    if (before) { await vi.advanceTimersByTimeAsync(200); before(o); }
    await vi.advanceTimersByTimeAsync(publishAtMs - (before ? 200 : 0));
    o.fake.publishDocument(zeroWordDocument(0, BOOK));
    await vi.advanceTimersByTimeAsync(2000 - publishAtMs);
    await settle();
    return o;
  }

  function expectOneStartAtMeditations(o: ReturnType<typeof open>) {
    expect(o.api.goToSection).toHaveBeenCalledTimes(1);
    expect(o.api.goToSection).toHaveBeenCalledWith(1);
    expect(o.view.shown).toBe(1);
    expect(highlightedWithMotion(o.api, 0, "flow")).toBe(true);
    const word = engineWord(o.runtime);
    expect(word).toBeGreaterThanOrEqual(0);
    expect(word).toBeLessThan(10);
    expect(completedStarts(o.fake)).toHaveLength(1);
  }

  it("(f7) the map at 300 ms gives exactly one start, at MEDITATIONS", async () => {
    expectOneStartAtMeditations(await mapAfterPlay(300, undefined, true));
  });

  it("(f8) the map at 800 ms gives exactly one start, at MEDITATIONS", async () => {
    expectOneStartAtMeditations(await mapAfterPlay(800, undefined, true));
  });

  it("(f9) a view that moved off the section before the map: no start", async () => {
    const o = await mapAfterPlay(300, (x) => { x.view.shown = 3; });
    expect(modeWrites(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(o.api.goToSection).not.toHaveBeenCalled();
  });

  it("(fc1) control: a book with no sections that have words stays inert", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api } = open({ shown: 0, position: 0, book: NO_TEXT_BOOK });
    opened.push(runtime);
    runtime.togglePlay();
    await vi.advanceTimersByTimeAsync(1000);
    expect(runtime.getSnapshot().playing).toBe(false);
    expect(api.goToSection).not.toHaveBeenCalled();
    expect(api.highlightWordByIndex).not.toHaveBeenCalled();
  });

  it("(fc2) control: a section with words starts where it is", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api } = open({ shown: 1, position: 5 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    expect(api.goToSection).not.toHaveBeenCalled();
    expect(api.next).not.toHaveBeenCalled();
    expect(highlightedWithMotion(api, 5, "flow")).toBe(true);
    expect(engineWord(runtime)).toBe(5);
  });

  it("(fc3) control: the map never arrives, so nothing starts", async () => {
    vi.useFakeTimers({ now: 0 });
    const { fake, runtime, api } = open({ shown: 0, position: 0, book: null });
    opened.push(runtime);
    runtime.togglePlay();
    await vi.advanceTimersByTimeAsync(2000);
    expect(runtime.getSnapshot().playing).toBe(false);
    expect(api.goToSection).not.toHaveBeenCalled();
    expect(calledWithMotion(api)).toBe(false);
    expect(effects(fake, "document.ensureBookWords")).toEqual([]);
  });

  it("(fc4) control: navigation before the map clears the pending Play", async () => {
    const o = await mapAfterPlay(800, (x) => { x.runtime.jumpToWord(5, "navigation"); });
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(modeWrites(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
  });

  it("(fc5) control: Pause before the map clears the pending Play", async () => {
    const o = await mapAfterPlay(800, (x) => { x.runtime.pause(); });
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(modeWrites(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
  });
});

// @vitest-environment jsdom
// PLAY-FIRST-TEXT-1 (owner ruling 2026-10-30 "Start at first text"; Brain1 rulings 1–2 and Q2 option (a)): Play in
// Focus while the view shows a section with no words moves to the first later section with words and starts on its
// first word. A Play made before the section map exists starts exactly once when the map arrives.
import { afterEach, describe, expect, it, vi } from "vitest";
import { FOCUS_MODE_START_DELAY_MS } from "../../src/constants";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff, type ReaderBookWordsValue } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createFocusRuntime } from "../../src/reader/modes/focus/index";
import type { FocusModeRuntime } from "../../src/reader/modes/focus/ModeRuntime";
import type { FocusFoliateViewAPI } from "../../src/reader/modes/focus/FoliateView";
import { createFakeInfrastructure } from "./harness/fakePorts";
import { BOOK, NO_TEXT_BOOK, createZeroWordView, settle, zeroWordDocument } from "./harness/zeroWordBook";

const WORD_MS = 60_000 / 300;

function open(options: { shown: number; position: number; book?: ReaderBookWordsValue | null; holdReady?: boolean }) {
  const book = options.book === undefined ? BOOK : options.book;
  const fake = createFakeInfrastructure({ document: zeroWordDocument(options.position, book) });
  const broker = createReaderPorts(fake.infra);
  const document = fake.infra.document.snapshot();
  broker.openDocument(document.documentId);
  const { key, ports } = broker.issue("focus");
  const runtime = createFocusRuntime({
    key, ports, document, settings: fake.infra.settings.read(),
    handoff: createInitialHandoff(document, document.wordCount), arrival: "silent",
  }) as FocusModeRuntime;
  const { api, view, releaseReady } = createZeroWordView(options.shown, { holdReady: options.holdReady });
  runtime.viewApiRef.current = api as unknown as FocusFoliateViewAPI;
  runtime.select(options.position);
  return { fake, runtime, api, view, releaseReady };
}

const word = (runtime: FocusModeRuntime) => runtime.getSnapshot().highlightedWordIndex;
const effects = (fake: ReturnType<typeof createFakeInfrastructure>, method: string) => fake.effects.filter((c) => c.method === method);
const completedStarts = (fake: ReturnType<typeof createFakeInfrastructure>) =>
  effects(fake, "settings.update").filter((c) => {
    const a = c.args[0] as Record<string, unknown>;
    return a.readingMode === "focus" && a.lastReadingMode === "focus" && a.isNarrating === false;
  });

describe("Focus: Play on a section with no words starts at the first text (PLAY-FIRST-TEXT-1)", () => {
  const opened: FocusModeRuntime[] = [];
  afterEach(() => {
    for (const r of opened.splice(0)) r.destroy();
    vi.useRealTimers();
  });

  it("(o1) cover, fresh book: moves to section 1 and starts on its first word, MEDITATIONS", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api, view } = open({ shown: 0, position: 0 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(FOCUS_MODE_START_DELAY_MS);
    expect(api.goToSection).toHaveBeenCalledTimes(1);
    expect(api.goToSection).toHaveBeenCalledWith(1);
    expect(api.next).not.toHaveBeenCalled();
    expect(view.shown).toBe(1);
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 0 });
    expect(BOOK.words[word(runtime)]).toBe("MEDITATIONS");
  });

  it("(o2) cover with a stale anchor: starts at word 0, not the anchor 12", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api, view } = open({ shown: 0, position: 12 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(FOCUS_MODE_START_DELAY_MS);
    expect(api.goToSection).toHaveBeenCalledWith(1);
    expect(view.shown).toBe(1);
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 0 });
  });

  it("(o3) plate: moves to section 3 and starts on s3w0", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api, view } = open({ shown: 2, position: 5 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(FOCUS_MODE_START_DELAY_MS);
    expect(api.goToSection).toHaveBeenCalledWith(3);
    expect(view.shown).toBe(3);
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 10 });
    expect(BOOK.words[10]).toBe("s3w0");
  });

  it("(o4) back cover with no later text: Play does nothing", async () => {
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

  it("(o5) the relocate save writes the playing word, never the stale anchor", async () => {
    vi.useFakeTimers({ now: 0 });
    const { fake, runtime } = open({ shown: 0, position: 12 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(FOCUS_MODE_START_DELAY_MS + 2 * WORD_MS);
    const playing = word(runtime);
    expect(playing).toBeGreaterThanOrEqual(1);
    expect(playing).toBeLessThanOrEqual(9);
    runtime.onRelocate({ cfi: "epubcfi(/6/4!/4/2/1:0)", fraction: 0.1 });
    const saves = effects(fake, "persistence.scheduleRelocateSave");
    expect(saves.length).toBeGreaterThan(0);
    expect(saves[saves.length - 1].args).toEqual([{ wordIndex: playing, cfi: "epubcfi(/6/4!/4/2/1:0)" }]);
    expect(saves.some((c) => (c.args[0] as { wordIndex: number }).wordIndex === 12)).toBe(false);
  });

  it("(o6) Pause during the move cancels it: no engine starts", async () => {
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
    expect(word(runtime)).toBe(0);
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
    expect(o.runtime.getSnapshot().playing).toBe(true);
    const w = word(o.runtime);
    expect(w).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThan(10);
    expect(completedStarts(o.fake)).toHaveLength(1);
  }

  it("(o7) the map at 300 ms gives exactly one start, at MEDITATIONS", async () => {
    expectOneStartAtMeditations(await mapAfterPlay(300, undefined, true));
  });

  it("(o8) the map at 800 ms gives exactly one start, at MEDITATIONS", async () => {
    expectOneStartAtMeditations(await mapAfterPlay(800, undefined, true));
  });

  it("(o9) a view that moved off the section before the map: no start", async () => {
    const o = await mapAfterPlay(300, (x) => { x.view.shown = 3; });
    expect(completedStarts(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(o.api.goToSection).not.toHaveBeenCalled();
  });

  it("(oc1) control: a book with no sections that have words stays inert", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api } = open({ shown: 0, position: 0, book: NO_TEXT_BOOK });
    opened.push(runtime);
    runtime.togglePlay();
    await vi.advanceTimersByTimeAsync(1000);
    expect(runtime.getSnapshot().playing).toBe(false);
    expect(api.goToSection).not.toHaveBeenCalled();
    expect(api.highlightWordByIndex).not.toHaveBeenCalled();
  });

  it("(oc2) control: a section with words starts where it is", async () => {
    vi.useFakeTimers({ now: 0 });
    const { runtime, api } = open({ shown: 1, position: 5 });
    opened.push(runtime);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(FOCUS_MODE_START_DELAY_MS);
    expect(api.goToSection).not.toHaveBeenCalled();
    expect(api.next).not.toHaveBeenCalled();
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 5 });
  });

  it("(oc3) control: the map never arrives, so nothing starts", async () => {
    vi.useFakeTimers({ now: 0 });
    const { fake, runtime, api } = open({ shown: 0, position: 0, book: null });
    opened.push(runtime);
    runtime.togglePlay();
    await vi.advanceTimersByTimeAsync(2000);
    expect(runtime.getSnapshot().playing).toBe(false);
    expect(api.goToSection).not.toHaveBeenCalled();
    expect(completedStarts(fake)).toEqual([]);
    expect(effects(fake, "document.ensureBookWords")).toEqual([]);
  });

  it("(oc4) control: navigation before the map clears the pending Play", async () => {
    const o = await mapAfterPlay(800, (x) => { x.runtime.jumpToWord(5, "navigation"); });
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(completedStarts(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
  });

  it("(oc5) control: Pause before the map clears the pending Play", async () => {
    const o = await mapAfterPlay(800, (x) => { x.runtime.pause(); });
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(completedStarts(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
  });
});

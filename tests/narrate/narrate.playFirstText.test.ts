// @vitest-environment jsdom
// PLAY-FIRST-TEXT-1 (owner ruling 2026-10-30 "Start at first text"; Brain1 rulings 1–2 and Q2 option (a)): Play in
// Narrate while the view shows a section with no words moves to the first later section with words (one navigation,
// traced first, LL-070) before any audio is requested, and speech starts on that section's first word. A Play made
// before the section map exists starts exactly once when the map arrives.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff, type ReaderBookWordsValue } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createNarrateRuntime } from "../../src/reader/modes/narrate/index";
import type { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";
import type { NarrateFoliateViewAPI } from "../../src/reader/modes/narrate/FoliateView";
import { createFakeInfrastructure } from "../readerModes/harness/fakePorts";
import { BOOK, NO_TEXT_BOOK, calledWithMotion, createZeroWordView, highlightedWithMotion, zeroWordDocument } from "../readerModes/harness/zeroWordBook";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SPF } from "./harness/fakeProducer";

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
/** Engine default lead (narrateEngine leadSeconds) plus one fake-table lead (2 frames) and a little. */
const INTO_FIRST_WORD_S = 0.03 + (2 * SPF) / 24000 + 0.01;
const WORD_S = (8 * SPF) / 24000; // FakeProducer default: 8 frames per word at speed 1.0

function open(options: { shown: number; position: number; book?: ReaderBookWordsValue | null; holdReady?: boolean }) {
  const book = options.book === undefined ? BOOK : options.book;
  const fake = createFakeInfrastructure({ document: zeroWordDocument(options.position, book) });
  const events: Array<Record<string, unknown>> = [];
  fake.infra.diagnostics.trace = (e) => { events.push(e as Record<string, unknown>); }; // the eval-trace sink
  const broker = createReaderPorts(fake.infra);
  const document = fake.infra.document.snapshot();
  broker.openDocument(document.documentId);
  const { key, ports } = broker.issue("narrate");
  const producer = new FakeProducer();
  const generate = vi.spyOn(producer, "generate");
  const output = new FakeAudioOutput();
  const runtime = createNarrateRuntime(
    { key, ports, document, settings: fake.infra.settings.read(), handoff: createInitialHandoff(document, document.wordCount), arrival: "silent" },
    { producer, createOutput: () => output },
  ) as NarrateModeRuntime;
  const { api, view, releaseReady } = createZeroWordView(options.shown, { holdReady: options.holdReady });
  runtime.viewApiRef.current = api as unknown as NarrateFoliateViewAPI;
  runtime.select(options.position);
  return { fake, runtime, api, view, releaseReady, producer, generate, output, events };
}

type Opened = ReturnType<typeof open>;
const effects = (fake: Opened["fake"], method: string) => fake.effects.filter((c) => c.method === method);
const completedStarts = (fake: Opened["fake"]) =>
  effects(fake, "settings.update").filter((c) => {
    const a = c.args[0] as Record<string, unknown>;
    return a.readingMode === "narrate" && a.lastReadingMode === "narrate" && a.isNarrating === true;
  });
/** The view moved to the target section before the first audio request (no audio for skipped sections, Q5). */
const movedBeforeAudio = (o: Opened, section: number): boolean => {
  const goIdx = o.api.goToSection.mock.calls.findIndex((c) => c[0] === section);
  if (goIdx < 0 || o.generate.mock.invocationCallOrder.length === 0) return false;
  return o.api.goToSection.mock.invocationCallOrder[goIdx] < o.generate.mock.invocationCallOrder[0];
};

describe("Narrate: Play on a section with no words starts at the first text (PLAY-FIRST-TEXT-1)", () => {
  const opened: NarrateModeRuntime[] = [];
  afterEach(() => { for (const r of opened.splice(0)) r.destroy(); });

  it("(n1) cover, fresh book: moves to section 1 before any audio and speaks MEDITATIONS first", async () => {
    const o = open({ shown: 0, position: 0 });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    expect(o.api.goToSection).toHaveBeenCalledWith(1);
    expect(o.producer.requests.length).toBe(0);
    expect(o.events.filter((e) => e.kind === "narrate-section-nav")).toContainEqual(
      expect.objectContaining({ caller: "play-first-text", word: 0, targetSection: 1 }));
    await flush(); await flush();
    expect(o.producer.requests.length).toBeGreaterThan(0);
    expect(o.producer.requests[0].text.startsWith("MEDITATIONS ")).toBe(true);
    expect(highlightedWithMotion(o.api, 0, "narrate")).toBe(true);
    expect(o.runtime.getSnapshot().playing).toBe(true);
  });

  it("(n2) cover with a stale anchor: speech starts at MEDITATIONS, not the anchor 12", async () => {
    const o = open({ shown: 0, position: 12 });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    await flush(); await flush();
    expect(movedBeforeAudio(o, 1)).toBe(true);
    expect(o.producer.requests[0].text.startsWith("MEDITATIONS ")).toBe(true);
  });

  it("(n3) plate: moves to section 3 and speaks s3w0 first", async () => {
    const o = open({ shown: 2, position: 5 });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    await flush(); await flush();
    expect(o.api.goToSection).toHaveBeenCalledWith(3);
    expect(movedBeforeAudio(o, 3)).toBe(true);
    expect(o.producer.requests[0].text.startsWith("s3w0 ")).toBe(true);
  });

  it("(n4) back cover with no later text: Play does nothing", async () => {
    const o = open({ shown: 4, position: 15 });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    await wait(300);
    expect(o.producer.requests.length).toBe(0);
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(effects(o.fake, "persistence.markEngaged")).toEqual([]);
  });

  it("(n5) the relocate save writes the spoken word, never the stale anchor", async () => {
    const o = open({ shown: 0, position: 12 });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    await flush(); await flush();
    o.output.advance(INTO_FIRST_WORD_S); o.runtime.tick(); o.output.advance(WORD_S); o.runtime.tick();
    expect(o.runtime.getSnapshot().highlightedWordIndex).toBe(1);
    o.runtime.onRelocate({ cfi: "epubcfi(/6/4!/4/2/1:0)", fraction: 0.1 });
    const saves = effects(o.fake, "persistence.scheduleRelocateSave");
    expect(saves.length).toBeGreaterThan(0);
    expect((saves[saves.length - 1].args[0] as { wordIndex: number }).wordIndex).toBe(1);
    expect(saves.some((c) => (c.args[0] as { wordIndex: number }).wordIndex === 12)).toBe(false);
  });

  it("(n6) Pause during the move cancels it: no audio is requested", async () => {
    const o = open({ shown: 0, position: 0, holdReady: true });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    expect(o.api.goToSection).toHaveBeenCalledWith(1);
    o.runtime.pause();
    o.releaseReady();
    await flush(); await flush();
    await wait(100);
    expect(o.producer.requests.length).toBe(0);
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(calledWithMotion(o.api)).toBe(false);
  });

  async function mapAfterPlay(publishAtMs: number, before?: (o: Opened) => void, flagPath = false) {
    const o = open({ shown: 0, position: 0, book: null });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    expect(o.runtime.getSnapshot().playing).toBe(false);
    if (flagPath) expect(o.api.next).not.toHaveBeenCalled(); // no blind page turn on the flag path
    if (before) { await wait(200); before(o); }
    await wait(publishAtMs - (before ? 200 : 0));
    o.fake.publishDocument(zeroWordDocument(0, BOOK));
    await wait(2000 - publishAtMs);
    await flush();
    return o;
  }

  function expectOneStartAtMeditations(o: Opened) {
    expect(o.api.goToSection).toHaveBeenCalledTimes(1);
    expect(o.api.goToSection).toHaveBeenCalledWith(1);
    expect(movedBeforeAudio(o, 1)).toBe(true);
    expect(o.producer.requests.length).toBeGreaterThan(0);
    expect(o.producer.requests[0].text.startsWith("MEDITATIONS ")).toBe(true);
    expect(completedStarts(o.fake)).toHaveLength(1);
    // No second start: every request after the first continues from it (none restarts at another word).
    expect(o.producer.requests.filter((r) => r.text.startsWith("MEDITATIONS "))).toHaveLength(1);
  }

  it("(n7) the map at 300 ms gives exactly one start, at MEDITATIONS", async () => {
    expectOneStartAtMeditations(await mapAfterPlay(300, undefined, true));
  });

  it("(n8) the map at 800 ms gives exactly one start, at MEDITATIONS", async () => {
    expectOneStartAtMeditations(await mapAfterPlay(800, undefined, true));
  });

  it("(n9) a view that moved off the section before the map: no start", async () => {
    const o = await mapAfterPlay(300, (x) => { x.view.shown = 3; });
    expect(completedStarts(o.fake)).toEqual([]);
    expect(o.producer.requests.length).toBe(0);
    expect(o.api.goToSection).not.toHaveBeenCalled();
  });

  it("(nc1) control: a book with no sections that have words stays inert", async () => {
    const o = open({ shown: 0, position: 0, book: NO_TEXT_BOOK });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    await wait(1000);
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(o.api.highlightWordByIndex).not.toHaveBeenCalled();
    expect(o.producer.requests.length).toBe(0);
  });

  it("(nc2) control: a section with words starts where it is", async () => {
    const o = open({ shown: 1, position: 5 });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    await flush(); await flush();
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(o.api.next).not.toHaveBeenCalled();
    expect(highlightedWithMotion(o.api, 5, "narrate")).toBe(true);
    expect(o.producer.requests[0].text.startsWith("s1w5 ")).toBe(true);
  });

  it("(nc3) control: the map never arrives, so nothing starts", async () => {
    const o = open({ shown: 0, position: 0, book: null });
    opened.push(o.runtime);
    o.runtime.togglePlay();
    await wait(2000);
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(calledWithMotion(o.api)).toBe(false);
    expect(o.producer.requests.length).toBe(0);
    expect(completedStarts(o.fake)).toEqual([]);
  });

  it("(nc4) control: navigation before the map clears the pending Play", async () => {
    const o = await mapAfterPlay(800, (x) => { x.runtime.jumpToWord(5, "navigation"); });
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(completedStarts(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(o.producer.requests.length).toBe(0);
  });

  it("(nc5) control: Pause before the map clears the pending Play", async () => {
    const o = await mapAfterPlay(800, (x) => { x.runtime.pause(); });
    expect(o.api.goToSection).not.toHaveBeenCalled();
    expect(completedStarts(o.fake)).toEqual([]);
    expect(o.runtime.getSnapshot().playing).toBe(false);
    expect(o.producer.requests.length).toBe(0);
  });
});

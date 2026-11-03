// @vitest-environment jsdom
// NARRATE-ARRIVAL-SYNC-1 (Brain1 ruling 2026-11-03; gate (1) run 5 D6 RED): switching into Narrate from another mode at
// a saved word moves the view to that word's section once the section map exists, so Play starts at the saved word's
// sentence. PLAY-FIRST-TEXT-1's rule still applies whenever the view really is on a section with no words (sp4, sp5).
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import {
  createInitialHandoff, createReaderModeHandoff, type ReaderBookWordsValue, type ReaderSessionKey,
} from "../../src/reader/document/ReaderDocumentSnapshot";
import { createNarrateRuntime } from "../../src/reader/modes/narrate/index";
import type { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";
import type { NarrateFoliateViewAPI } from "../../src/reader/modes/narrate/FoliateView";
import { createFakeInfrastructure } from "../readerModes/harness/fakePorts";
import { BOOK, RANGE, createZeroWordView, zeroWordDocument } from "../readerModes/harness/zeroWordBook";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer } from "./harness/fakeProducer";

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
/** Two display frames (queuePostModeAnchorSync) and a margin. */
const FRAMES_MS = 100;
const SAVED = 12; // section 3 (words 10–19); its sentence starts at 10 (no sentence end inside the section)

function open(options: { shown: number; position: number; book?: ReaderBookWordsValue | null; fromPage: boolean }) {
  const book = options.book === undefined ? BOOK : options.book;
  const fake = createFakeInfrastructure({ document: zeroWordDocument(options.position, book) });
  const events: Array<Record<string, unknown>> = [];
  fake.infra.diagnostics.trace = (e) => { events.push(e as Record<string, unknown>); };
  const broker = createReaderPorts(fake.infra);
  const document = fake.infra.document.snapshot();
  broker.openDocument(document.documentId);
  const { key, ports } = broker.issue("narrate");
  const initial = createInitialHandoff(document, document.wordCount);
  // A handover from Page: the source session is Page's, the saved word is the canonical anchor.
  const handoff = options.fromPage
    ? createReaderModeHandoff({ ...initial, source: { ...key, mode: "page" } as unknown as ReaderSessionKey })
    : initial;
  const producer = new FakeProducer();
  const generate = vi.spyOn(producer, "generate");
  const output = new FakeAudioOutput();
  const runtime = createNarrateRuntime(
    { key, ports, document, settings: fake.infra.settings.read(), handoff, arrival: options.fromPage ? "select" : "silent" },
    { producer, createOutput: () => output },
  ) as NarrateModeRuntime;
  const { api, view } = createZeroWordView(options.shown);
  runtime.viewApiRef.current = api as unknown as NarrateFoliateViewAPI;
  runtime.select(options.position);
  return { fake, runtime, api, view, producer, generate, events };
}

type Opened = ReturnType<typeof open>;
const firstTextNavs = (o: Opened) => o.events.filter((e) => e.kind === "narrate-section-nav" && e.caller === "play-first-text");
const completedStarts = (o: Opened) =>
  o.fake.effects.filter((c) => c.method === "settings.update").filter((c) => {
    const a = c.args[0] as Record<string, unknown>;
    return a.readingMode === "narrate" && a.isNarrating === true;
  });
/** The book word index of the first audio request's first word (the fake requests carry the words as text). */
const firstRequestWord = (o: Opened): number => {
  const first = o.producer.requests[0]?.text.split(" ")[0];
  return first == null ? -1 : BOOK.words.indexOf(first);
};
const inSaved = (w: number) => w >= RANGE[3][0] && w < RANGE[3][1];

describe("Narrate: arriving at a saved place shows it, so Play starts there (NARRATE-ARRIVAL-SYNC-1)", () => {
  const opened: NarrateModeRuntime[] = [];
  afterEach(() => { for (const r of opened.splice(0)) r.destroy(); });

  it("(sp1) from Page at 12 with the cover shown: the view moves to section 3 before Play; Play starts in 12's sentence", async () => {
    const o = open({ shown: 0, position: SAVED, fromPage: true });
    opened.push(o.runtime);
    await wait(FRAMES_MS);
    expect(o.api.goToSection).toHaveBeenCalledWith(3);
    o.runtime.togglePlay();
    await flush(); await flush();
    expect(firstTextNavs(o)).toEqual([]);
    expect(o.producer.requests.length).toBeGreaterThan(0);
    expect(inSaved(firstRequestWord(o))).toBe(true);
    expect(o.producer.requests[0].text.startsWith("MEDITATIONS ")).toBe(false);
  });

  it("(sp2) the section map arrives at 300 ms: the view moves to section 3 exactly once", async () => {
    const o = open({ shown: 0, position: SAVED, book: null, fromPage: true });
    opened.push(o.runtime);
    await wait(300);
    o.fake.publishDocument(zeroWordDocument(SAVED, BOOK));
    await wait(300);
    expect(o.api.goToSection).toHaveBeenCalledTimes(1);
    expect(o.api.goToSection).toHaveBeenCalledWith(3);
  });

  it("(sp3) Play before the map: exactly one start, in 12's sentence, with no play-first-text move", async () => {
    const o = open({ shown: 0, position: SAVED, book: null, fromPage: true });
    opened.push(o.runtime);
    await wait(FRAMES_MS);
    o.runtime.togglePlay();
    await wait(200);
    o.fake.publishDocument(zeroWordDocument(SAVED, BOOK));
    await wait(500);
    await flush();
    expect(completedStarts(o)).toHaveLength(1);
    expect(firstTextNavs(o)).toEqual([]);
    expect(o.producer.requests.length).toBeGreaterThan(0);
    expect(inSaved(firstRequestWord(o))).toBe(true);
  });

  it("(sp6) map pending, Play, then a click on another word before the map: the start is the clicked word, not 12's sentence", async () => {
    // Brain1 ruling (c), 2026-11-03. The click clears both the arrival sync and the pending Play (PLAY-FIRST-TEXT-1's
    // existing clear, spec item 5), so the map's arrival starts nothing; the next Play starts at the clicked word.
    const o = open({ shown: 0, position: SAVED, book: null, fromPage: true });
    opened.push(o.runtime);
    await wait(FRAMES_MS);
    o.runtime.togglePlay();
    await wait(100);
    o.view.shown = 3; // the reader paged to section 3 and clicked word 15 there
    o.runtime.onWordClick("epubcfi(/6/8!/4/2/1:0)", BOOK.words[15], 3, 5, 15);
    // Before the map the click resolves against the shown section's words (an existing clamp, reported to Brain1):
    // the start must be exactly the anchor the click set, whatever it is, and never 12's sentence start (10).
    const clicked = o.runtime.getSnapshot().canonicalWordIndex;
    await wait(100);
    o.fake.publishDocument(zeroWordDocument(SAVED, BOOK));
    await wait(300);
    expect(completedStarts(o)).toEqual([]);
    expect(o.api.goToSection).not.toHaveBeenCalled();
    o.runtime.togglePlay();
    await flush(); await flush();
    expect(firstTextNavs(o)).toEqual([]);
    expect(firstRequestWord(o)).toBe(clicked);
    expect(firstRequestWord(o)).not.toBe(10);
  });

  it("(sp4) control: after the sync the reader pages back to the cover; Play starts at MEDITATIONS via play-first-text", async () => {
    const o = open({ shown: 0, position: SAVED, fromPage: true });
    opened.push(o.runtime);
    await wait(FRAMES_MS);
    o.view.shown = 0; // the reader paged back to the cover
    o.runtime.togglePlay();
    await flush(); await flush();
    expect(firstTextNavs(o)).toHaveLength(1);
    expect(o.producer.requests[0].text.startsWith("MEDITATIONS ")).toBe(true);
  });

  it("(sp5) control: a fresh book (no handover) behaves as n1", async () => {
    const o = open({ shown: 0, position: 0, fromPage: false });
    opened.push(o.runtime);
    await wait(FRAMES_MS);
    o.runtime.togglePlay();
    expect(o.api.goToSection).toHaveBeenCalledWith(1);
    expect(o.producer.requests.length).toBe(0);
    await flush(); await flush();
    expect(firstTextNavs(o)).toHaveLength(1);
    expect(o.producer.requests[0].text.startsWith("MEDITATIONS ")).toBe(true);
    expect(o.runtime.getSnapshot().playing).toBe(true);
  });
});

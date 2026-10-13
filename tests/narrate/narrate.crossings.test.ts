// @vitest-environment jsdom
// NARRATE-REBUILD-1 P5 — D5 crossings. A chunk never spans a section end (the engine's breaks are the book's
// section ends when it speaks the book words); the cursor continues across the boundary; the view is asked for the
// next section and paints the pending word once that section's words are in; the section follow records the
// transition; adjacent and extreme speed changes keep one clock with no overlap, drop or repeat. Fake clock, fake
// producer (lawful tables), fake view API; nothing here estimates timing.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createNarrateRuntime } from "../../src/reader/modes/narrate/index";
import type { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";
import type { NarrateFoliateViewAPI } from "../../src/reader/modes/narrate/FoliateView";
import type { FoliateWord } from "../../src/reader/modes/narrate/helpers/foliateHelpers";
import { planChunks } from "../../src/reader/modes/narrate/engine/chunkPlan";
import { NarrateEngine, type EngineFailure } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { createFakeDocument, createFakeInfrastructure } from "../readerModes/harness/fakePorts";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF } from "./harness/fakeProducer";

// Section A ends without terminal punctuation (a heading or epigraph line), so only the section end can stop a chunk there.
const SECTION_A = "Of my grandfather Verus I have learned to be gentle and meek. Of my mother I have learned to be religious".split(" ");
const SECTION_B = "HIS FIRST BOOK concerning himself. Wherein Antoninus recordeth what and of whom he learned.".split(" ");
const WORDS = [...SECTION_A, ...SECTION_B];
const BOUNDARY = SECTION_A.length;
const SECTIONS = [
  { sectionIndex: 0, startWordIdx: 0, endWordIdx: BOUNDARY, wordCount: BOUNDARY },
  { sectionIndex: 1, startWordIdx: BOUNDARY, endWordIdx: WORDS.length, wordCount: SECTION_B.length },
];
const STEP = 1 / 60;
const FRAMES = 8;
const WORD_S = (FRAMES * SPF) / SAMPLE_RATE;
const flush = () => new Promise<void>((r) => setTimeout(r, 0));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

describe("narrate crossings (D5)", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("the chunk plan never spans a section end when the section ends are its breaks (and does without them: positive control)", () => {
    const withBreaks = planChunks(WORDS, 0, { breaks: new Set([BOUNDARY - 1]) });
    expect(withBreaks.some((c) => c.startWord < BOUNDARY && c.endWord > BOUNDARY)).toBe(false);
    expect(withBreaks.some((c) => c.endWord === BOUNDARY)).toBe(true);
    expect(withBreaks.some((c) => c.startWord === BOUNDARY)).toBe(true);
    const without = planChunks(WORDS, 0, {});
    expect(without.some((c) => c.startWord < BOUNDARY && c.endWord > BOUNDARY)).toBe(true);
  });

  it("the runtime chunks at the book's section ends, the cursor crosses, the view is stepped and the pending word painted, the section follow records the transition", async () => {
    const output = new FakeAudioOutput();
    const producer = new FakeProducer({ framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 });
    const document = createFakeDocument({
      position: BOUNDARY - 3, tokenWords: WORDS, wordCount: WORDS.length, paragraphBreaks: [],
      bookWords: { words: WORDS, sections: SECTIONS, totalWords: WORDS.length, footnoteCues: [] },
    });
    const fake = createFakeInfrastructure({ document });
    const broker = createReaderPorts(fake.infra);
    const snapshot = fake.infra.document.snapshot();
    broker.openDocument(snapshot.documentId);
    const { key, ports } = broker.issue("narrate");
    const runtime = createNarrateRuntime(
      { key, ports, document: snapshot, settings: fake.infra.settings.read(), handoff: createInitialHandoff(snapshot, snapshot.wordCount), arrival: "silent" },
      { producer, createOutput: () => output },
    ) as NarrateModeRuntime;

    // A fake view: one section loaded at a time; a highlight succeeds only inside it; next() loads the following one.
    let loaded = 0;
    const calls: string[] = [];
    const view: NarrateFoliateViewAPI = {
      getWords: () => WORDS.slice(SECTIONS[loaded].startWordIdx, SECTIONS[loaded].endWordIdx).map((word) => ({ word, range: null, sectionIndex: loaded } as FoliateWord)),
      getParagraphBreaks: () => new Set<number>(),
      goTo: async () => undefined,
      next: () => { calls.push("next"); loaded = Math.min(SECTIONS.length - 1, loaded + 1); },
      prev: () => { loaded = Math.max(0, loaded - 1); },
      highlightWordByIndex: (w) => { calls.push(`highlight:${w}`); return w >= SECTIONS[loaded].startWordIdx && w < SECTIONS[loaded].endWordIdx; },
      resolveWordState: () => ({ kind: "unknown" } as unknown as ReturnType<NarrateFoliateViewAPI["resolveWordState"]>),
      getSectionForWordIndex: (w) => SECTIONS.find((s) => w >= s.startWordIdx && w < s.endWordIdx)?.sectionIndex ?? null,
      findFirstVisibleWordIndex: () => SECTIONS[loaded].startWordIdx,
      isUserBrowsing: () => false,
      goToSection: async (i) => { calls.push(`goToSection:${i}`); loaded = i; },
      waitForSectionReady: async () => loaded,
      clearSoftHighlight: () => undefined,
      clearUserBrowsing: () => undefined,
    };
    runtime.viewApiRef.current = view;
    let clock = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => clock);

    runtime.select(BOUNDARY - 3);
    runtime.start({ cause: "play-button" });
    await flush();
    // The first chunk ends exactly at the section end; the next starts exactly there.
    expect(producer.requests[0].text).toBe(WORDS.slice(BOUNDARY - 3, BOUNDARY).join(" "));
    expect(producer.requests[1].text.startsWith("HIS FIRST BOOK")).toBe(true);
    expect(producer.requests.every((r) => { const n = r.text.split(" ").length; const start = WORDS.indexOf(r.text.split(" ")[0]); return !(start < BOUNDARY && start + n > BOUNDARY); })).toBe(true);

    // Play through the first chunk into the second: the cursor crosses the boundary.
    const seen: number[] = [];
    const ticks = Math.round((0.03 + 3 * WORD_S + 0.5) / STEP);
    for (let i = 0; i < ticks; i++) {
      output.advance(STEP);
      runtime.tick();
      const w = runtime.getSnapshot().highlightedWordIndex;
      if (seen.at(-1) !== w) { seen.push(w); clock += 1000; runtime.syncSection(); }
      await Promise.resolve();
    }
    expect(seen).toContain(BOUNDARY - 1);
    expect(seen).toContain(BOUNDARY);
    expect(seen.slice(seen.indexOf(BOUNDARY - 3))).toEqual(seen.slice(seen.indexOf(BOUNDARY - 3)).map((_, i) => BOUNDARY - 3 + i)); // in order, none dropped or repeated

    // The view was asked for the next section when the first word past the boundary could not be painted,
    // and paints it once that section's words are in (the pending-resume path).
    expect(calls).toContain("next");
    const firstMiss = calls.indexOf(`highlight:${BOUNDARY}`);
    expect(firstMiss).toBeGreaterThan(-1);
    expect(calls[firstMiss + 1]).toBe("next");
    runtime.onWordsReextracted();
    await frame();
    expect(calls.slice(firstMiss + 2)).toContain(`highlight:${BOUNDARY}`);

    // The section follow moved the view to section 1 and recorded the transition on the diagnostics port.
    expect(calls).toContain("goToSection:1");
    const traced = fake.diagnostics.filter((c) => c.method === "diagnostics.trace").map((c) => c.args[0] as Record<string, unknown>);
    expect(traced).toContainEqual(expect.objectContaining({ kind: "transition", transition: "section", from: 0, to: 1 }));
    runtime.destroy();
  });

  it("adjacent and extreme speed changes keep one clock: no overlapping voiced samples, no dropped or repeated word", async () => {
    const output = new FakeAudioOutput();
    const producer = new FakeProducer({ framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 });
    const cursor: number[] = [];
    const failures: EngineFailure[] = [];
    const engine = new NarrateEngine({
      words: WORDS, producer, output, voice: "af_bella", speed: 0.8, leadSeconds: 0.03,
      events: { onCursor: (w) => cursor.push(w), onState: () => {}, onFailure: (f) => failures.push(f), onComplete: () => {} },
    });
    const run = async (seconds: number) => { for (let i = 0; i < Math.round(seconds / STEP); i++) { output.advance(STEP); engine.tick(); await Promise.resolve(); } };
    engine.play(0);
    await run(0.5);
    engine.setSpeed(2.0);            // extreme: 0.80 → 2.00 mid-unit
    await run(0.05);
    engine.setSpeed(0.8);            // adjacent to the pending change: coalesces on the latest speed
    await run(0.05);
    engine.setSpeed(2.0);
    await run(2.5);
    engine.setSpeed(0.8);            // back down once the new speed is sounding
    await run(2.5);
    expect(failures).toEqual([]);
    expect(output.overlaps()).toEqual([]);
    expect(cursor.length).toBeGreaterThan(8);
    expect(cursor).toEqual(cursor.map((_, i) => i)); // every word once, in order: no drop, no repeat
    expect(engine.getSnapshot().speed).toBe(0.8);
  });
});

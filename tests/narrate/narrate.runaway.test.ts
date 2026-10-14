// @vitest-environment jsdom
// NARRATE-REBUILD-1 P5, row 63 (BUG-191 runaway). The view opens on section 4 while the spoken word is in section 3.
// A highlight miss must navigate to the spoken word's own section (one navigation at a time, retried by the next
// cursor) and never page blindly with next(). The fake view models foliate's page-turn lock: next() takes it until
// a timer fires, and goToSection does nothing while it is held.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createNarrateRuntime } from "../../src/reader/modes/narrate/index";
import type { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";
import type { NarrateFoliateViewAPI } from "../../src/reader/modes/narrate/FoliateView";
import type { FoliateWord } from "../../src/reader/modes/narrate/helpers/foliateHelpers";
import { createFakeDocument, createFakeInfrastructure } from "../readerModes/harness/fakePorts";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SAMPLE_RATE, SPF } from "./harness/fakeProducer";

const PER = 8;
const WORDS = Array.from({ length: 6 * PER }, (_, i) => `w${i}`);
const SECTIONS = Array.from({ length: 6 }, (_, i) => ({ sectionIndex: i, startWordIdx: i * PER, endWordIdx: (i + 1) * PER, wordCount: PER }));
const START = SECTIONS[4].startWordIdx - 3;
const STEP = 1 / 60;
const FRAMES = 8;
const WORD_S = (FRAMES * SPF) / SAMPLE_RATE;
const flush = () => new Promise<void>((r) => setTimeout(r, 0));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

describe("narrate runaway (BUG-191)", () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it("a miss in a wrong-section view goes to the word's section with goToSection, never next(), and survives the page-turn lock", async () => {
    const output = new FakeAudioOutput();
    const producer = new FakeProducer({ framesPerWord: FRAMES, leadFrames: 2, tailFrames: 1 });
    const document = createFakeDocument({
      position: START, tokenWords: WORDS, wordCount: WORDS.length, paragraphBreaks: [],
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

    let loaded = 4;
    let locked = false;
    const calls: string[] = [];
    const displayed: number[] = [4];
    const hits: Array<[number, boolean]> = [];
    const setLoaded = (i: number) => {
      loaded = i;
      displayed.push(i);
      void Promise.resolve().then(() => runtime.onWordsReextracted());
    };
    const view: NarrateFoliateViewAPI = {
      getWords: () => WORDS.slice(SECTIONS[loaded].startWordIdx, SECTIONS[loaded].endWordIdx).map((word) => ({ word, range: null, sectionIndex: loaded } as FoliateWord)),
      getParagraphBreaks: () => new Set<number>(),
      goTo: async () => undefined,
      next: () => {
        calls.push("next");
        if (locked) return;
        locked = true;
        setTimeout(() => { locked = false; }, 0);
        setLoaded(Math.min(SECTIONS.length - 1, loaded + 1));
      },
      prev: () => undefined,
      highlightWordByIndex: (w) => { const ok = w >= SECTIONS[loaded].startWordIdx && w < SECTIONS[loaded].endWordIdx; hits.push([w, ok]); return ok; },
      resolveWordState: () => ({ kind: "unknown" } as unknown as ReturnType<NarrateFoliateViewAPI["resolveWordState"]>),
      getSectionForWordIndex: (w) => SECTIONS.find((s) => w >= s.startWordIdx && w < s.endWordIdx)?.sectionIndex ?? null,
      getDisplayedSectionIndex: () => loaded,
      findFirstVisibleWordIndex: () => SECTIONS[loaded].startWordIdx,
      isUserBrowsing: () => false,
      goToSection: async (i) => { calls.push(`goToSection:${i}`); if (locked) return; setLoaded(i); },
      waitForSectionReady: async () => loaded,
      clearSoftHighlight: () => undefined,
      clearUserBrowsing: () => undefined,
    };
    runtime.viewApiRef.current = view;
    let clock = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => clock);

    runtime.select(START);
    runtime.start({ cause: "play-button" });
    await flush();

    const seen: number[] = [];
    const ticks = Math.round((0.03 + 6 * WORD_S + 0.5) / STEP);
    for (let i = 0; i < ticks; i++) {
      output.advance(STEP);
      runtime.tick();
      const w = runtime.getSnapshot().highlightedWordIndex;
      if (seen.at(-1) !== w) { seen.push(w); clock += 1000; runtime.syncSection(); }
      await Promise.resolve();
      await flush();
      await frame();
    }
    expect(seen).toContain(SECTIONS[4].startWordIdx);

    expect(calls).not.toContain("next");
    expect(displayed).toEqual([4, 3, 4]);
    expect(Math.max(...displayed)).toBeLessThanOrEqual(4);
    const loadIdx = hits.findIndex(([, ok]) => ok);
    expect(loadIdx).toBeGreaterThan(-1);
    // every word published after the section-3 load is painted: the only misses are the ones before the load and at the crossing
    const lastMissBefore = hits.slice(0, loadIdx).length;
    expect(lastMissBefore).toBeGreaterThan(0);
    const afterLoad = hits.slice(loadIdx);
    const crossing = SECTIONS[4].startWordIdx;
    expect(afterLoad.filter(([w, ok]) => !ok && w !== crossing)).toEqual([]);
    expect(afterLoad.some(([w, ok]) => ok && w >= crossing)).toBe(true);
    const traced = fake.diagnostics.filter((c) => c.method === "diagnostics.trace").map((c) => c.args[0] as Record<string, unknown>);
    const transitions = traced.filter((e) => e.kind === "transition" && e.transition === "section").map((e) => [e.from, e.to]);
    expect(transitions).toEqual([[4, 3], [3, 4]]);
    runtime.destroy();
  });
});

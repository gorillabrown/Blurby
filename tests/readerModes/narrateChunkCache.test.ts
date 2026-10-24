// @vitest-environment jsdom
// READER-MODE-SEPARATION-2-S1 (G6 parity, EPUB narrate-section-transition). B0's naturalReadingChunks memo
// (effectiveWords [foliateRenderVersion] → chunkSourceWords → buildNaturalChunks) returned the same full-book
// array once extraction completed, so the chunks were built once, during the render after the words arrived.
// F keyed its cache on the render version too and built lazily: on the 80k-word EPUB each rebuild took
// 0.75–1.1 s inside an audio callback (live G6 profile: readingChunks under onChunkReady → onSegmentStart),
// which delayed chunk scheduling into an underrun at the first chunk handoff. Without full-book words the
// loaded foliate slice is the source and a render bump still rebuilds, as on B0.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter, READER_MODE_MODULES } from "../../src/reader/useReaderModeOrchestrator";

const builds = vi.hoisted(() => ({ count: 0 }));
vi.mock("../../src/utils/naturalChunks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/utils/naturalChunks")>();
  return { ...actual, buildNaturalChunks: (...args: Parameters<typeof actual.buildNaturalChunks>) => { builds.count += 1; return actual.buildNaturalChunks(...args); } };
});

const WORDS = Array.from({ length: 25 }, (_, i) => (i % 6 === 5 ? `w${i}.` : `w${i}`));
const BOOK_WORDS = { words: WORDS, sections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 25, wordCount: 25 }], totalWords: 25, footnoteCues: [] };

type NarrateInternals = { onSurfaceLoad(): void; viewApiRef: { current: unknown } };

function setup(withBookWords: boolean) {
  const fake = createFakeInfrastructure({ document: createFakeDocument(withBookWords ? { bookWords: BOOK_WORDS } : {}) });
  const document = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: READER_MODE_MODULES,
    broker: createReaderPorts(fake.infra),
    getDocument: () => document,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(document);
  router.select("narrate");
  const runtime = router.getActive()!.runtime as unknown as NarrateInternals;
  // A loaded view (jsdom cannot host foliate): its slice is the whole fixture.
  const slice = WORDS.map((word) => ({ word, range: null, sectionIndex: 0 }));
  const api: Record<string, unknown> = { getWords: () => slice, highlightWordByIndex: () => true, findFirstVisibleWordIndex: () => 0, isUserBrowsing: () => false };
  runtime.viewApiRef.current = new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
  const segmentStart = (i: number) => (fake.registered.segmentStart as unknown as (w: number) => void)(i);
  const chunkBoundary = (i: number) => (fake.registered.chunkBoundary as unknown as (e: number) => void)(i);
  const renderBump = () => { runtime.onSurfaceLoad(); vi.advanceTimersByTime(1000); };
  return { fake, router, segmentStart, chunkBoundary, renderBump };
}

describe("Narrate natural chunks follow B0's memo (S1 G6)", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); builds.count = 0; });
  afterEach(() => { vi.useRealTimers(); });

  it("full-book words: built once after the words arrive, never inside audio callbacks or per render bump", () => {
    const { router, segmentStart, chunkBoundary, renderBump } = setup(true);
    vi.advanceTimersByTime(0);
    expect(builds.count).toBe(1);
    segmentStart(3);
    renderBump();
    chunkBoundary(12);
    renderBump();
    segmentStart(13);
    expect(builds.count).toBe(1);
    router.destroy();
  });

  it("full-book words: a Play before the warm-up still has the chunks before audio starts", () => {
    const { fake, router, segmentStart } = setup(true);
    router.togglePlay();
    expect(fake.effects.some((c) => c.method === "audio.start")).toBe(true);
    expect(builds.count).toBe(1);
    segmentStart(7);
    vi.advanceTimersByTime(1000);
    expect(builds.count).toBe(1);
    router.destroy();
  });

  it("no full-book words: the loaded slice is the source, so a render bump rebuilds (B0 foliateRenderVersion)", () => {
    const { router, segmentStart, renderBump } = setup(false);
    vi.advanceTimersByTime(0);
    expect(builds.count).toBe(0);
    segmentStart(3);
    expect(builds.count).toBe(1);
    segmentStart(4);
    expect(builds.count).toBe(1);
    renderBump();
    segmentStart(5);
    expect(builds.count).toBe(2);
    router.destroy();
  });
});

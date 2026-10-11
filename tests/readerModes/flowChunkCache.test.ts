// @vitest-environment jsdom
// READER-MODE-SEPARATION-2-S1 (G6 parity, Decision #28 item 2). Same B0 memo as Narrate: B0's
// naturalReadingChunks (effectiveWords [foliateRenderVersion] → chunkSourceWords [effectiveWords,
// paragraphBreaks, sections] → buildNaturalChunks) returned the same full-book array once extraction
// completed, so the chunks were built once, during the render after the words arrived. F keyed Flow's cache
// on the render version only and built lazily on the pacer/render callbacks (syncScrollEngineChunks follows
// every render bump). Without full-book words the loaded foliate slice is the source and a bump rebuilds.
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

type FlowInternals = { onSurfaceLoad(): void; syncScrollEngineChunks(): void; viewApiRef: { current: unknown } };

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
  router.select("flow");
  const runtime = router.getActive()!.runtime as unknown as FlowInternals;
  // A loaded view (jsdom cannot host foliate): its slice is the whole fixture.
  const slice = WORDS.map((word) => ({ word, range: null, sectionIndex: 0 }));
  const api: Record<string, unknown> = { getWords: () => slice, highlightWordByIndex: () => true, findFirstVisibleWordIndex: () => 0, isUserBrowsing: () => false };
  runtime.viewApiRef.current = new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
  /** A section load: the delayed render-version bump, then the chunk effect that follows it. */
  const renderBump = () => { runtime.onSurfaceLoad(); vi.advanceTimersByTime(1000); runtime.syncScrollEngineChunks(); };
  return { router, runtime, renderBump };
}

describe("Flow natural chunks follow B0's memo (S1 G6)", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); builds.count = 0; });
  afterEach(() => { vi.useRealTimers(); });

  it("full-book words: built once after the words arrive, never again per render bump while playing", () => {
    const { router, renderBump } = setup(true);
    vi.advanceTimersByTime(0);
    expect(builds.count).toBe(1);
    router.togglePlay();
    expect(router.getActive()!.runtime.getSnapshot().playing).toBe(true);
    renderBump();
    renderBump();
    expect(builds.count).toBe(1);
    router.destroy();
  });

  it("no full-book words: the loaded slice is the source, so a render bump rebuilds (B0 foliateRenderVersion)", () => {
    const { router, runtime, renderBump } = setup(false);
    vi.advanceTimersByTime(0);
    expect(builds.count).toBe(0);
    router.togglePlay();
    expect(router.getActive()!.runtime.getSnapshot().playing).toBe(true);
    runtime.syncScrollEngineChunks();
    runtime.syncScrollEngineChunks();
    expect(builds.count).toBe(1);
    renderBump();
    expect(builds.count).toBe(2);
    router.destroy();
  });
});

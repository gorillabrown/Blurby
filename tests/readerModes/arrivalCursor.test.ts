// @vitest-environment jsdom
// READER-MODE-SEPARATION-2-S1 (G6 cursor regression). On B0 one foliate surface outlived every mode switch,
// so the word clicked in paused Flow kept its cursor class in the destination (page-word--flow-cursor in
// Focus/Flow/Narrate; Page's highlight effect repainted it as page-word--highlighted). After separation each
// destination mounts a fresh view: the destination runtime must paint the handed-over word itself once its
// view has loaded a section. Book open in Page paints nothing (B0 "text-page" shows no cursor).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter, READER_MODE_MODULES } from "../../src/reader/useReaderModeOrchestrator";
import type { ReaderModeId } from "../../src/reader/modes/ReaderModeAdapter";

type Highlight = readonly [number, string | undefined, unknown];

/** A loaded view: every highlight hits; everything else is a neutral no-op. */
function stubView(runtime: unknown, calls: Highlight[]): void {
  const words = Array.from({ length: 25 }, (_, i) => ({ word: `w${i}`, range: null, sectionIndex: 0 }));
  const api: Record<string, unknown> = {
    getWords: () => words,
    getParagraphBreaks: () => new Set<number>(),
    highlightWordByIndex: (i: number, hint?: string, options?: unknown) => { calls.push([i, hint, options]); return true; },
    findFirstVisibleWordIndex: () => 0,
    getSectionForWordIndex: () => 0,
    isUserBrowsing: () => false,
    waitForSectionReady: () => Promise.resolve(0),
    goToSection: () => Promise.resolve(),
  };
  (runtime as { viewApiRef: { current: unknown } }).viewApiRef.current =
    new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
}

const ANCHOR = 7;
const MODES: ReaderModeId[] = ["page", "focus", "flow", "narrate"];

function setup() {
  const fake = createFakeInfrastructure();
  const document = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: READER_MODE_MODULES,
    broker: createReaderPorts(fake.infra),
    getDocument: () => document,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(document);
  return router;
}

function enter(router: ReturnType<typeof setup>, mode: ReaderModeId): void {
  if (mode === "page") router.pauseToPage();
  else router.select(mode);
}

/** Load this view's first section, then let the delayed load callbacks and frames run. */
function loadSection(router: ReturnType<typeof setup>): Highlight[] {
  const calls: Highlight[] = [];
  const runtime = router.getActive()!.runtime as unknown as { onSurfaceLoad: () => void };
  stubView(runtime, calls);
  runtime.onSurfaceLoad();
  vi.advanceTimersByTime(1000);
  return calls;
}

describe("paused mode switch paints the handed-over cursor (S1 G6)", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.useRealTimers(); });

  for (const from of MODES) {
    for (const to of MODES) {
      if (from === to) continue;
      it(`${from} → ${to}`, () => {
        const router = setup();
        router.select("flow");
        router.hardSelect({ cfi: null, word: `w${ANCHOR}`, globalWordIndex: ANCHOR });
        if (from !== "flow") enter(router, from);
        enter(router, to);
        const active = router.getActive()!;
        expect(active.mode).toBe(to);
        expect(active.runtime.getSnapshot().playing).toBe(false);

        const calls = loadSection(router);
        const handed = active.runtime.getSnapshot().highlightedWordIndex;
        // Page repaints with its own highlight style; Focus, Flow and Narrate show B0's flow cursor.
        const hint = to === "page" ? undefined : "flow";
        expect(calls).toContainEqual([handed, hint, { allowMotion: false }]);
        if (from !== "narrate" || to !== "page") expect(handed).toBe(ANCHOR);
        router.destroy();
      });
    }
  }

  it("book open in Page paints no cursor (B0 text-page)", () => {
    const router = setup();
    expect(loadSection(router)).toEqual([]);
    router.destroy();
  });

  it("a mode that is playing when its section loads leaves the cursor to playback", () => {
    const router = setup();
    router.select("flow");
    router.hardSelect({ cfi: null, word: `w${ANCHOR}`, globalWordIndex: ANCHOR });
    router.select("focus");
    router.togglePlay();
    const calls = loadSection(router);
    expect(calls.filter(([, hint, options]) => hint === "flow" && JSON.stringify(options) === JSON.stringify({ allowMotion: false }))).toEqual([]);
    router.destroy();
  });
});

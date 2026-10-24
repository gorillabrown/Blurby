// @vitest-environment jsdom
// CHAPTER-STEP-CFI-1. On an EPUB the shell sends a contents jump or a chapter step as navigateTo(entry word) and
// then go-to-href. Before the fix each mode saved the entry's word at once, with the previous section's relocate
// cfi, and the landing relocate saved nothing (its resume anchor was set). After it, the save waits for the jump
// to land and carries the landed cfi; a jump that never lands saves nothing; Focus paints the paused cursor on the
// entry's word and moves its engine (paused or playing) there. The view stub's goTo fires the landing relocate
// before it resolves, as foliate's scrolled renderer does.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDocument, createFakeInfrastructure, type FakeInfrastructure } from "./harness/fakePorts";
import { installFakeNarrateHost } from "../narrate/harness/fakeNarrateHost";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter, READER_MODE_MODULES } from "../../src/reader/useReaderModeOrchestrator";
import type { ReaderModeId } from "../../src/reader/modes/ReaderModeAdapter";

type Highlight = readonly [number, string | undefined, unknown];
type Relocating = { onRelocate: (detail: { cfi: string; fraction: number }) => void };

const ENTRY = 20;
const MODES = ["focus", "flow", "narrate"] as const;

/** A loaded view whose goTo fires the landing relocate (or none) and then resolves. */
function stubView(runtime: unknown, calls: Highlight[], options: { lands: boolean }): void {
  const words = Array.from({ length: 25 }, (_, i) => ({ word: `w${i}`, range: null, sectionIndex: 0 }));
  const api: Record<string, unknown> = {
    getWords: () => words,
    getParagraphBreaks: () => new Set<number>(),
    highlightWordByIndex: (i: number, hint?: string, opts?: unknown) => { calls.push([i, hint, opts]); return true; },
    findFirstVisibleWordIndex: () => 0,
    getSectionForWordIndex: () => 0,
    isUserBrowsing: () => false,
    waitForSectionReady: () => Promise.resolve(0),
    goToSection: () => Promise.resolve(),
    goTo: () => {
      if (options.lands) (runtime as Relocating).onRelocate({ cfi: "cfi:new", fraction: 0.5 });
      return Promise.resolve();
    },
  };
  (runtime as { viewApiRef: { current: unknown } }).viewApiRef.current =
    new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
}

function setup(mode: ReaderModeId, options: { useFoliate?: boolean; lands?: boolean } = {}) {
  const fake = createFakeInfrastructure({ document: createFakeDocument({ useFoliate: options.useFoliate ?? true }) });
  const document = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: READER_MODE_MODULES,
    broker: createReaderPorts(fake.infra),
    getDocument: () => document,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(document);
  if (mode !== "page") router.select(mode as Exclude<ReaderModeId, "page">);
  const runtime = router.getActive()!.runtime;
  const calls: Highlight[] = [];
  stubView(runtime, calls, { lands: options.lands ?? true });
  (runtime as unknown as Relocating).onRelocate({ cfi: "cfi:old", fraction: 0.1 });
  return { fake, router, runtime, calls };
}

const since = (fake: FakeInfrastructure, from: number, method: string) =>
  fake.effects.slice(from).filter((call) => call.method === method).map((call) => call.args);

async function flush(): Promise<void> {
  for (let i = 0; i < 5; i++) await vi.advanceTimersByTimeAsync(0);
}

/** The shell's contents jump on a foliate book (ReaderContainer handleJumpToChapter). */
async function jump(router: ReturnType<typeof setup>["router"]): Promise<void> {
  router.navigateTo(ENTRY);
  router.command({ kind: "go-to-href", href: "ch9.xhtml" });
  await flush();
}

describe("CHAPTER-STEP-CFI-1: a contents jump saves the landed word with the landed cfi", () => {
  let restore: () => void = () => {};
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); restore = installFakeNarrateHost(); });
  afterEach(() => { restore(); vi.useRealTimers(); });

  for (const mode of MODES) {
    it(`(cl1) ${mode}: one save, the entry's word with the landed cfi`, async () => {
      const { fake, router } = setup(mode);
      const from = fake.effects.length;
      await jump(router);
      const saved = since(fake, from, "persistence.updateDocProgress");
      expect(saved).toEqual([["doc-1", ENTRY, "cfi:new"]]);
      expect(saved.some((args) => args.includes("cfi:old"))).toBe(false);
      router.destroy();
    });

    it(`(cl2) ${mode}: a jump that never lands saves nothing and moves nothing`, async () => {
      const { fake, router, runtime } = setup(mode, { lands: false });
      const highlighted = runtime.getSnapshot().highlightedWordIndex;
      const from = fake.effects.length;
      await jump(router);
      expect(since(fake, from, "persistence.updateDocProgress")).toEqual([]);
      expect(runtime.getSnapshot().highlightedWordIndex).toBe(highlighted);
      router.destroy();
    });

    it(`(cl5) ${mode}: the landing relocate schedules no relocate save`, async () => {
      const { fake, router } = setup(mode);
      const from = fake.effects.length;
      await jump(router);
      expect(since(fake, from, "persistence.scheduleRelocateSave")).toEqual([]);
      router.destroy();
    });
  }

  it("(cl4) without foliate, navigateTo saves at once, as before", async () => {
    for (const mode of MODES) {
      const { fake, router } = setup(mode, { useFoliate: false });
      const from = fake.effects.length;
      router.navigateTo(ENTRY);
      const saved = since(fake, from, "persistence.updateDocProgress");
      expect(saved).toHaveLength(1);
      expect(saved[0].slice(0, 2)).toEqual(["doc-1", ENTRY]);
      router.destroy();
    }
  });
});

describe("CHAPTER-STEP-CFI-1: Focus makes the entry's word the reading word (owner ruling 2026-10-23)", () => {
  let restore: () => void = () => {};
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); restore = installFakeNarrateHost(); });
  afterEach(() => { restore(); vi.useRealTimers(); });

  it("(cl3) paused, never played: the paused cursor is painted on the entry's word", async () => {
    const { router, calls } = setup("focus");
    await jump(router);
    expect(calls).toContainEqual([ENTRY, "flow", { allowMotion: false }]);
    router.destroy();
  });

  it("(cl3) paused after playing: the engine moves to the entry's word and resumes from it", async () => {
    const { router, runtime, calls } = setup("focus");
    router.togglePlay();
    await vi.advanceTimersByTimeAsync(1500);
    router.togglePlay(); // pause
    expect(runtime.getSnapshot().playing).toBe(false);
    const before = runtime.getSnapshot().currentWordIndex;
    expect(before).not.toBe(ENTRY);
    await jump(router);
    expect(calls).toContainEqual([ENTRY, "flow", { allowMotion: false }]);
    router.togglePlay(); // resume
    await vi.advanceTimersByTimeAsync(400);
    expect(runtime.getSnapshot().currentWordIndex).toBe(ENTRY + 1);
    router.destroy();
  });

  it("(cl3, owner question 2) playing: the jump retargets the running engine and keeps playing", async () => {
    const { router, runtime } = setup("focus");
    router.togglePlay();
    await vi.advanceTimersByTimeAsync(1500);
    expect(runtime.getSnapshot().playing).toBe(true);
    expect(runtime.getSnapshot().currentWordIndex).not.toBe(ENTRY);
    await jump(router);
    expect(runtime.getSnapshot().playing).toBe(true);
    await vi.advanceTimersByTimeAsync(400);
    expect(runtime.getSnapshot().currentWordIndex).toBe(ENTRY + 1);
    expect(runtime.getSnapshot().playing).toBe(true);
    router.destroy();
  });
});

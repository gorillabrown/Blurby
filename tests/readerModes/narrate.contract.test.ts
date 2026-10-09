// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G2 — Narrate runtime contract (design §D.3).
// Narrate is imported only through its index.ts, in a fresh module registry per test. Its clock is the
// audio port: after start clockOwner is "audio-truth", and words advance only on fake audio events.
import { describe, expect, it, vi } from "vitest";
import type { ReaderModeModule } from "../../src/reader/modes/ReaderModeAdapter";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { assertLifecycle, assertNoLeak, assertSelectPausedAtZero } from "./harness/contractAssertions";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";

async function loadNarrate(): Promise<ReaderModeModule> {
  vi.resetModules();
  return (await import("../../src/reader/modes/narrate/index")).narrateMode;
}

describe("narrate mode runtime contract (G2)", () => {
  it("select is paused and word zero is valid", async () => {
    assertSelectPausedAtZero(await loadNarrate());
  });

  it("pause resume stop and destroy preserve their documented lifecycle", async () => {
    // Narrate's only clock is audio truth: with no audio events in 5 s the word does not move.
    assertLifecycle(await loadNarrate(), { clockOwnerAfterStart: "audio-truth", playsAfterStart: true, advances: false });
  });

  it("snapshots and start inputs do not leak mutable state", async () => {
    assertNoLeak(await loadNarrate());
  });

  it("advances only on audio truth and toggles pause and resume through the audio port", async () => {
    const narrateMode = await loadNarrate();
    vi.useFakeTimers({ now: 0 });
    try {
      const fake = createFakeInfrastructure({ document: createFakeDocument({ position: 7 }) });
      const broker = createReaderPorts(fake.infra);
      const document = fake.infra.document.snapshot();
      broker.openDocument(document.documentId);
      const { key, ports } = broker.issue("narrate");
      const runtime = narrateMode.createRuntime({
        key, ports, document, settings: fake.infra.settings.read(),
        handoff: createInitialHandoff(document, document.wordCount), arrival: "silent",
      });
      // A mounted view (ready, words loaded) lets start install the truth sync, as on a Foliate surface.
      const words = document.tokenWords.map((word) => ({ word, range: null, sectionIndex: 0 }));
      const highlights: number[] = [];
      (runtime as unknown as { viewApiRef: { current: unknown } }).viewApiRef.current = {
        getWords: () => words,
        highlightWordByIndex: (i: number) => { highlights.push(i); return true; },
        clearSoftHighlight: () => {}, clearUserBrowsing: () => {}, findFirstVisibleWordIndex: () => 0,
        isUserBrowsing: () => false, getSectionForWordIndex: () => 0, getParagraphBreaks: () => new Set<number>(),
      };
      runtime.select(7);
      fake.effects.length = 0;

      runtime.togglePlay();
      expect(fake.effects.find((c) => c.method === "audio.start")?.args.slice(1, 3)).toEqual([7, 300]);
      expect(runtime.getSnapshot()).toMatchObject({ playing: true, narrating: true, clockOwner: "audio-truth", currentWordIndex: 7 });

      // A word event alone (Foliate surface) never moves the anchor; truth moves it on the next frame.
      (fake.registered.onWord as (i: number) => void)(8);
      vi.advanceTimersByTime(5000);
      expect(runtime.getSnapshot()).toMatchObject({ currentWordIndex: 7, canonicalWordIndex: 7 });
      (fake.registered.truthSync as (i: number) => void)(9);
      expect(runtime.getSnapshot().currentWordIndex).toBe(7);
      vi.advanceTimersByTime(16);
      expect(runtime.getSnapshot()).toMatchObject({ currentWordIndex: 9, canonicalWordIndex: 9, highlightedWordIndex: 9 });
      expect(highlights).toEqual([9]);

      // Toggle: speaking → audio.pause("user-stop"); paused → audio.resume() with no arguments.
      fake.effects.length = 0;
      runtime.togglePlay();
      expect(fake.effects.filter((c) => c.method.startsWith("audio.")).map((c) => [c.method, c.args])).toEqual([["audio.pause", ["user-stop"]]]);
      expect(runtime.getSnapshot()).toMatchObject({ playing: false, narrating: true, clockOwner: "none" });
      fake.effects.length = 0;
      runtime.togglePlay();
      expect(fake.effects.filter((c) => c.method.startsWith("audio.")).map((c) => [c.method, c.args])).toEqual([["audio.resume", []]]);
      expect(runtime.getSnapshot()).toMatchObject({ playing: true, clockOwner: "audio-truth" });
      expect(fake.effects.some((c) => c.method === "audio.start")).toBe(false);

      // After destroy, captured audio callbacks change nothing and make no port call.
      runtime.destroy();
      const after = runtime.getSnapshot();
      const effects = fake.effects.length;
      (fake.registered.truthSync as ((i: number) => void) | null)?.(12);
      vi.advanceTimersByTime(60_000);
      expect(runtime.getSnapshot()).toEqual(after);
      expect(fake.effects.length).toBe(effects);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});

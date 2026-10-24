// @vitest-environment jsdom
// READER-MODE-SEPARATION-2-S1 (G6 visual parity). On B0, ReaderContainer's narrate-publisher effect listed
// `narration` (a new object on every useNarration render) in its deps, so it re-ran after every render and,
// whenever readingMode !== "narrate", set chunkReadingVisualState to null. Flow's published chunk state
// (useFlowScrollSync publishFlowVisualState) therefore lived for one commit: FoliatePageView's effect applied
// it (and followed it to the reading zone), then the null cleared page-word--active-word again. G6 B0 never
// shows an active word in Flow; the candidate kept the state, leaving active-word on the start word.
// Narrate keeps its chunk state (the effect installs the publishers instead), so its active word stays.
import { act, createElement, useSyncExternalStore } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter, READER_MODE_MODULES } from "../../src/reader/useReaderModeOrchestrator";
import type { ChunkReadingVisualState } from "../../src/types/chunkReading";

/** Each mode's FoliateView is a seam (jsdom cannot host foliate): record the chunk state its effect sees. */
const seam = vi.hoisted(() => {
  const applied: Array<{ mode: string; state: ChunkReadingVisualState | null }> = [];
  const recordingView = (mode: string) => async () => {
    const { useEffect } = await import("react");
    return {
      default: function RecordingFoliateView(props: { chunkReadingVisualState: ChunkReadingVisualState | null }) {
        useEffect(() => { applied.push({ mode, state: props.chunkReadingVisualState }); }, [props.chunkReadingVisualState]);
        return null;
      },
    };
  };
  return { applied, recordingView };
});
vi.mock("../../src/reader/modes/page/FoliateView", seam.recordingView("page"));
vi.mock("../../src/reader/modes/focus/FoliateView", seam.recordingView("focus"));
vi.mock("../../src/reader/modes/flow/FoliateView", seam.recordingView("flow"));
vi.mock("../../src/reader/modes/narrate/FoliateView", seam.recordingView("narrate"));

type Router = ReturnType<typeof createReaderModeRouter>;

function ActiveView({ router }: { router: Router }) {
  useSyncExternalStore(router.subscribe, router.getSnapshot);
  const active = router.getActive();
  if (!active) return null;
  return createElement(READER_MODE_MODULES[active.mode].View, { key: active.key.session, runtime: active.runtime });
}

let root: Root | null = null;

async function mount(fake: ReturnType<typeof createFakeInfrastructure>): Promise<Router> {
  const document = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: READER_MODE_MODULES,
    broker: createReaderPorts(fake.infra),
    getDocument: () => document,
    getSettings: () => fake.infra.settings.read(),
  });
  const container = window.document.createElement("div");
  window.document.body.appendChild(container);
  await act(async () => {
    router.openDocument(document);
    root = createRoot(container);
    root.render(createElement(ActiveView, { router }));
  });
  return router;
}

describe("chunk visual state lifetime matches B0 (S1 G6)", () => {
  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers({ now: 0 });
    seam.applied.length = 0;
  });
  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    vi.useRealTimers();
  });

  it("Flow: the view applies the published chunk state once, then it is cleared (no lingering active word)", async () => {
    const router = await mount(createFakeInfrastructure());
    await act(async () => { router.select("flow"); });
    await act(async () => { router.hardSelect({ cfi: null, word: "w7", globalWordIndex: 7 }); });
    seam.applied.length = 0;
    await act(async () => { router.togglePlay(); });

    const runtime = router.getActive()!.runtime as unknown as { getChunkVisualState(): ChunkReadingVisualState | null };
    expect(router.getActive()!.runtime.getSnapshot().playing).toBe(true);
    const seen = seam.applied.filter((e) => e.mode === "flow").map((e) => e.state);
    // The view still received the start's chunk state (its effect follows it to the reading zone)...
    expect(seen.some((s) => s?.mode === "flow" && s.activeWordIndex != null)).toBe(true);
    // ...and B0's per-render null followed in the next commit, so the view's null branch clears the classes.
    expect(seen.at(-1)).toBeNull();
    expect(runtime.getChunkVisualState()).toBeNull();
    router.destroy();
  });

  it("Narrate: a chunk-boundary state stays applied (B0 keeps Narrate's chunk state)", async () => {
    const fake = createFakeInfrastructure();
    fake.infra.audio.resolveHighlightSync = (() => ({ syncLevel: "word-synced" })) as never;
    const router = await mount(fake);
    await act(async () => { router.select("narrate"); });
    seam.applied.length = 0;
    await act(async () => { (fake.registered.chunkBoundary as unknown as (endIdx: number) => void)(21); });

    const runtime = router.getActive()!.runtime as unknown as { getChunkVisualState(): ChunkReadingVisualState | null };
    const seen = seam.applied.filter((e) => e.mode === "narrate").map((e) => e.state);
    expect(seen.at(-1)).toMatchObject({ mode: "narrate", activeWordIndex: 20 });
    expect(runtime.getChunkVisualState()).toMatchObject({ mode: "narrate", activeWordIndex: 20 });
    router.destroy();
  });
});

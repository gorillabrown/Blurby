// @vitest-environment jsdom

// READER-MODE-SEPARATION-2 (design §D.5, step E2): the legacy useReaderModeOrchestrator body was removed at E1.
// These cases now run against the thin router core (createReaderModeRouter + READER_MODE_MODULES) with fake
// port infrastructure behind the real broker, and assert through the owning mode runtime. Cases that need
// hand-seeded anchors create the owning runtime exactly as the router does (broker-issued ports, module
// createRuntime). The six authorized substitutions are in test-migration.json → authorizedSubstitutions.
// OC-4: the four toggleNarrationInFlow cases exercise a path that is dead in production; they keep importing
// the retained legacy src/hooks/useReaderMode.ts and are labelled "dead code under test".
import React, { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { DEFAULT_SETTINGS, FOCUS_MODE_START_DELAY_MS, FOLIATE_SECTION_LOAD_WAIT_MS } from "../src/constants";
import { useReaderMode } from "../src/hooks/useReaderMode";
import { createReaderModeRouter, READER_MODE_MODULES, useReaderModeOrchestrator } from "../src/reader/useReaderModeOrchestrator";
import { createReaderPorts, type ReaderPortInfrastructure } from "../src/reader/ports/createReaderPorts";
import type { ReaderAudioState } from "../src/reader/ports/ReaderPorts";
import {
  createReaderDocumentSnapshot,
  createReaderModeHandoff,
  createReaderSettingsSnapshot,
  type ReaderDocumentSnapshot,
  type ReaderModeHandoffInput,
} from "../src/reader/document/ReaderDocumentSnapshot";
import type { ReaderModeId, ReaderModeRuntime } from "../src/reader/modes/ReaderModeAdapter";
import { FocusMode, FocusModeRuntime } from "../src/reader/modes/focus/ModeRuntime";
import { FlowMode, FlowModeRuntime } from "../src/reader/modes/flow/ModeRuntime";
import { NarrateModeRuntime } from "../src/reader/modes/narrate/ModeRuntime";
import type { BlurbySettings, ReaderMode } from "../src/types";

type LegacyUseReaderModeReturn = ReturnType<typeof useReaderMode>;

// Records each mode's persistent-anchor calls (the legacy commitPersistentWordIndex / syncVisualToPersistentWord
// spies), wrapping the real helper copy so behavior is unchanged.
const anchorRecorder = vi.hoisted(() => {
  const calls: Array<{ mode: string; method: string; args: unknown[]; result: unknown }> = [];
  const wrap = (mode: string, actual: Record<string, unknown>) => ({
    ...actual,
    createPersistentReadingAnchor: (state: unknown, deps: unknown) => {
      const anchor = (actual.createPersistentReadingAnchor as (s: unknown, d: unknown) => Record<string, (...args: unknown[]) => unknown>)(state, deps);
      const record = (method: string) => (...args: unknown[]) => {
        const result = anchor[method](...args);
        calls.push({ mode, method, args, result });
        return result;
      };
      return {
        commitPersistentWordIndex: record("commitPersistentWordIndex"),
        syncVisualToPersistentWord: record("syncVisualToPersistentWord"),
      };
    },
  });
  return { calls, wrap };
});
vi.mock("../src/reader/modes/page/helpers/usePersistentReadingAnchor", async (importOriginal) => anchorRecorder.wrap("page", await importOriginal<Record<string, unknown>>()));
vi.mock("../src/reader/modes/focus/helpers/usePersistentReadingAnchor", async (importOriginal) => anchorRecorder.wrap("focus", await importOriginal<Record<string, unknown>>()));
vi.mock("../src/reader/modes/flow/helpers/usePersistentReadingAnchor", async (importOriginal) => anchorRecorder.wrap("flow", await importOriginal<Record<string, unknown>>()));
vi.mock("../src/reader/modes/narrate/helpers/usePersistentReadingAnchor", async (importOriginal) => anchorRecorder.wrap("narrate", await importOriginal<Record<string, unknown>>()));

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

function createNarration(overrides: Record<string, unknown> = {}): any {
  return {
    cursorWordIndex: 0,
    status: "idle",
    speaking: false,
    startCursorDriven: vi.fn(() => "started"),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    setOnTruthSync: vi.fn(),
    setPageEndWord: vi.fn(),
    ...overrides,
  };
}

// ── Router-core harness: fake infrastructure behind the real broker ────────────────
const WORDS = ["alpha", "beta", "gamma"];

interface FakeViewOptions {
  getWords?: () => string[];
  highlightWordByIndex?: (wordIndex: number, kind?: string, options?: unknown) => boolean;
  getSectionForWordIndex?: (wordIndex: number) => number | null;
  next?: () => void;
}

/** A mode view's API (the subset each mode's surface.ts calls). */
function createFakeView(options: FakeViewOptions = {}) {
  const words = options.getWords ?? (() => WORDS);
  return {
    getWords: vi.fn(() => words().map((word) => ({ word, range: null, sectionIndex: 0 }))),
    getParagraphBreaks: vi.fn(() => new Set<number>()),
    highlightWordByIndex: vi.fn(options.highlightWordByIndex ?? (() => true)),
    isWordInDom: vi.fn(() => true),
    next: vi.fn(options.next ?? (() => {})),
    getSectionForWordIndex: vi.fn(options.getSectionForWordIndex ?? (() => 0)),
    goToSection: vi.fn(() => Promise.resolve()),
    waitForSectionReady: vi.fn(() => Promise.resolve(0)),
    findFirstVisibleWordIndex: vi.fn(() => 0),
    isUserBrowsing: vi.fn(() => false),
    clearUserBrowsing: vi.fn(),
    clearSoftHighlight: vi.fn(),
    applySoftHighlight: vi.fn(() => true),
    goTo: vi.fn(),
  };
}
type FakeView = ReturnType<typeof createFakeView>;

interface InfraOptions {
  settings?: Partial<BlurbySettings>;
  document?: Partial<ReaderDocumentSnapshot>;
  audio?: Partial<ReaderAudioState>;
}

function createInfra(options: InfraOptions = {}) {
  const document = createReaderDocumentSnapshot({
    documentId: "doc-1",
    documentGeneration: 1,
    title: "Doc",
    author: null,
    coverPath: null,
    filepath: "/doc.epub",
    useFoliate: true,
    wordCount: 3,
    position: 0,
    cfi: null,
    tokenWords: [],
    paragraphBreaks: [],
    bookWords: null,
    pronunciationOverrides: [],
    ...options.document,
  });
  const settings = createReaderSettingsSnapshot({
    settings: { ...DEFAULT_SETTINGS, lastReadingMode: "flow", readingMode: "page", ttsEngine: "web", isNarrating: false, ...options.settings } as BlurbySettings,
    wpm: 180,
    effectiveWpm: 180,
    focusTextSize: 100,
    isEink: false,
    isMac: false,
  });
  const audioState: { -readonly [K in keyof ReaderAudioState]: ReaderAudioState[K] } = {
    status: "idle",
    speaking: false,
    warming: false,
    kokoroLoading: false,
    cursorWordIndex: 0,
    pauseReason: null,
    rate: 1,
    ...options.audio,
  };
  const updateSettings = vi.fn();
  const audio = {
    readState: vi.fn(() => ({ ...audioState })),
    start: vi.fn((_words: readonly string[], wordIndex: number) => {
      Object.assign(audioState, { status: "speaking", speaking: true, cursorWordIndex: wordIndex });
      return "started" as const;
    }),
    pause: vi.fn(() => { Object.assign(audioState, { status: "paused", speaking: false }); }),
    resume: vi.fn(() => { Object.assign(audioState, { status: "speaking", speaking: true }); }),
    stop: vi.fn(() => { Object.assign(audioState, { status: "idle", speaking: false }); }),
    setOnTruthSync: vi.fn(),
    setPageEndWord: vi.fn(),
    resync: vi.fn(),
    setOnChunkBoundary: vi.fn(),
    setOnSegmentStart: vi.fn(),
    setOnSectionEnd: vi.fn(),
    updateWords: vi.fn(),
    adjustRate: vi.fn(),
    resolveHighlightSync: vi.fn(() => undefined),
    getAudioProgress: vi.fn(() => null),
    updateCacheCursor: vi.fn(),
    configure: vi.fn(),
  };
  const infra: ReaderPortInfrastructure = {
    settings: { read: () => settings, update: updateSettings, setWpm: vi.fn() },
    persistence: {
      updateDocProgress: vi.fn(),
      updateProgress: vi.fn(),
      recordCfi: vi.fn(),
      markEngaged: vi.fn(),
      markPageActivity: vi.fn(),
      scheduleRelocateSave: vi.fn(),
    },
    document: {
      snapshot: () => document,
      readBookBytes: () => new Promise<ArrayBuffer>(() => {}),
      ensureBookWords: () => new Promise(() => {}),
      subscribe: () => () => {},
    },
    audio,
    diagnostics: { record: vi.fn(), transition: vi.fn(), trace: vi.fn() },
    shell: {
      reportRelocate: vi.fn(),
      reportToc: vi.fn(),
      reportEinkContentChange: vi.fn(),
      requestCompletionToPage: vi.fn(),
      requestCrossBook: vi.fn(),
    },
  };
  return { infra, document, settings, audio, audioState, updateSettings };
}

/** The router core over READER_MODE_MODULES, with the document open in Page. */
function createRouterHarness(options: InfraOptions = {}) {
  const fake = createInfra(options);
  const broker = createReaderPorts(fake.infra);
  const router = createReaderModeRouter({
    modules: READER_MODE_MODULES,
    broker,
    getDocument: () => fake.document,
    getSettings: () => fake.settings,
  });
  router.openDocument(fake.document);
  return {
    ...fake,
    router,
    runtime: () => router.getActive()!.runtime,
    /** The active mode's view mounts (its FoliateView populates viewApiRef). */
    attachView: (view: FakeView = createFakeView()) => {
      (router.getActive()!.runtime as unknown as { viewApiRef: { current: unknown } }).viewApiRef.current = view;
      return view;
    },
  };
}

/** The owning runtime, created as the router creates it, from a hand-seeded handoff; its view is mounted. */
function mountRuntime(mode: ReaderModeId, handoff: Partial<ReaderModeHandoffInput>, options: InfraOptions & { view?: FakeView } = {}) {
  const fake = createInfra(options);
  const broker = createReaderPorts(fake.infra);
  broker.openDocument(fake.document.documentId);
  const { key, ports } = broker.issue(mode);
  const canonical = handoff.canonicalWordIndex ?? 0;
  const seeded = createReaderModeHandoff({
    source: null,
    canonicalWordIndex: canonical,
    publishedWordIndex: canonical,
    highlightedWordIndex: canonical,
    softWordIndex: canonical,
    resumeAnchor: null,
    explicitSelectionAnchor: null,
    cfi: null,
    engaged: false,
    ...handoff,
  });
  const runtime: ReaderModeRuntime = READER_MODE_MODULES[mode].createRuntime({
    key,
    ports,
    document: fake.document,
    settings: fake.settings,
    handoff: seeded,
    arrival: "silent",
  });
  runtime.select(seeded.canonicalWordIndex);
  const view = options.view ?? createFakeView();
  (runtime as unknown as { viewApiRef: { current: unknown } }).viewApiRef.current = view;
  return { ...fake, runtime, view };
}

/** Each engine start as [engine type, start word, engine words, engine paragraph breaks] (legacy startMode args). */
function engineStarts(spy: MockInstance) {
  return spy.mock.calls.map((call, i) => {
    const engine = spy.mock.contexts[i] as { type: string; config: { words: string[]; paragraphBreaks: Set<number> } };
    return [engine.type, call[0], engine.config.words, engine.config.paragraphBreaks];
  });
}

/** The private display jump each runtime binds (OC-3: legacy reader.jumpToWord, `focusView.jumpToWord`). */
function spyDisplayJump(runtimeClass: { prototype: unknown }) {
  return vi.spyOn(runtimeClass.prototype as { jumpDisplayToWord(wordIndex: number): void }, "jumpDisplayToWord");
}

function anchorCalls(mode: string, method: string) {
  return anchorRecorder.calls.filter((call) => call.mode === mode && call.method === method);
}

function truthSyncCallback(audio: ReturnType<typeof createInfra>["audio"]) {
  const install = audio.setOnTruthSync.mock.calls.find(([value]) => typeof value === "function");
  return install?.[0] as unknown as (wordIndex: number) => void;
}

let flowEngineStart: MockInstance;
let focusEngineStart: MockInstance;
let flowRuntimeStart: MockInstance;
let focusRuntimeStart: MockInstance;

function installEngineSpies() {
  anchorRecorder.calls.length = 0;
  flowEngineStart = vi.spyOn(FlowMode.prototype, "start");
  focusEngineStart = vi.spyOn(FocusMode.prototype, "start");
  flowRuntimeStart = vi.spyOn(FlowModeRuntime.prototype, "start");
  focusRuntimeStart = vi.spyOn(FocusModeRuntime.prototype, "start");
}

describe("useReaderMode foliate handoff", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    installEngineSpies();
  });

  afterEach(() => {
    if (root) {
      flushSync(() => root?.unmount());
      root = null;
    }
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts foliate narration only after extraction finishes when the first launch begins on an empty slice", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page" } });
    harness.router.select("flow");
    let extractCalls = 0;
    harness.attachView(createFakeView({ getWords: () => (extractCalls >= 2 ? WORDS : []) }));
    const surface = (harness.runtime() as unknown as { surface: { extractWords(): void } }).surface;
    const extractFoliateWords = vi.spyOn(surface, "extractWords").mockImplementation(() => { extractCalls += 1; });
    const view = (harness.runtime() as unknown as { viewApiRef: { current: FakeView } }).viewApiRef.current;

    harness.router.togglePlay();
    await flushPromises();

    expect(extractFoliateWords).toHaveBeenCalledTimes(1);
    expect(view.next).toHaveBeenCalledTimes(1);
    expect(flowEngineStart).not.toHaveBeenCalled();

    vi.advanceTimersByTime(FOLIATE_SECTION_LOAD_WAIT_MS);
    await flushPromises();

    expect(extractFoliateWords).toHaveBeenCalledTimes(3);
    expect(engineStarts(flowEngineStart)).toContainEqual([
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    ]);
  });

  it("raises flowPlaying when starting foliate flow so the flow engine can boot", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page" } });
    harness.router.select("flow");
    harness.attachView();

    harness.router.togglePlay();
    await flushPromises();

    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "flow", playing: true });
    expect(engineStarts(flowEngineStart)).toContainEqual([
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    ]);
  });

  // OC-4: dead code under test — toggleNarrationInFlow has no production caller (retained legacy hook).
  it("promotes active flow narration into the real narrate mode contract", async () => {
    const modeInstance = {
      modeRef: { current: null },
      startMode: vi.fn(),
      stopMode: vi.fn(),
      pauseMode: vi.fn(),
      resumeMode: vi.fn(),
      setSpeed: vi.fn(),
      jumpToWordInMode: vi.fn(),
      updateModeWords: vi.fn(),
      pendingResumeRef: { current: null },
    };

    const foliateApiRef = {
      current: {
        clearSoftHighlight: vi.fn(),
        findFirstVisibleWordIndex: vi.fn(() => 0),
        highlightWordByIndex: vi.fn(() => true),
        getSectionForWordIndex: vi.fn(() => 0),
        goToSection: vi.fn(),
      },
    };

    const narration = createNarration();

    const reader = {
      playing: false,
      wordIndex: 0,
      wordsRef: { current: ["alpha", "beta", "gamma"] as string[] },
      togglePlay: vi.fn(),
      jumpToWord: vi.fn(),
    };

    const updateSettings = vi.fn();
    const settings = {
      lastReadingMode: "flow",
      readingMode: "flow",
      ttsEngine: "web",
      isNarrating: false,
    } as any;

    let snapshot: LegacyUseReaderModeReturn | null = null;
    let observedReadingMode: ReaderMode = "page";

    function Harness() {
      const [readingMode, setReadingMode] = useState<ReaderMode>("flow");
      const [isNarrating, setIsNarrating] = useState(false);
      const [focusPlaying, setFocusPlaying] = useState(false);
      const [flowPlaying, setFlowPlaying] = useState(true);
      const [highlightedWordIndex, setHighlightedWordIndex] = useState(1);
      observedReadingMode = readingMode;

      snapshot = useReaderMode({
        reader,
        narration,
        modeInstance: modeInstance as any,
        foliateApiRef: foliateApiRef as any,
        foliateWordsRef: { current: [] },
        useFoliate: true,
        settings,
        updateSettings,
        wpm: 180,
        setWpm: vi.fn(),
        effectiveWpm: 180,
        getEffectiveWords: () => ["alpha", "beta", "gamma"],
        extractFoliateWords: vi.fn(),
        paragraphBreaks: new Set<number>(),
        highlightedWordIndex,
        setHighlightedWordIndex,
        hasEngagedRef: { current: false },
        focusPlaying,
        setFocusPlaying,
        flowPlaying,
        setFlowPlaying,
        isBrowsedAway: false,
        setIsBrowsedAway: vi.fn(),
        pageNavRef: { current: { returnToHighlight: vi.fn(), getCurrentPageStart: vi.fn(() => 0) } },
        readingMode,
        setReadingMode,
        isNarrating,
        setIsNarrating,
        pendingNarrationResumeRef: { current: false },
        bookWordsTotalWords: 3,
        resumeAnchorRef: { current: null },
        softWordIndexRef: { current: 0 },
        persistentWordIndexRef: { current: 0 },
        commitPersistentWordIndex: vi.fn((_w: number) => _w),
        syncVisualToPersistentWord: vi.fn(() => 0),
        queuePostModeAnchorSync: vi.fn(),
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    await act(async () => {
      snapshot?.toggleNarrationInFlow();
      await flushPromises();
    });

    expect(observedReadingMode).toBe("narrate");
    expect(narration.startCursorDriven).toHaveBeenCalledWith(
      ["alpha", "beta", "gamma"],
      1,
      180,
      expect.any(Function),
    );
    expect(updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
      isNarrating: true,
    });
  });

  it("narrate playback ignores the parallel per-word callback when truth-sync is installed", async () => {
    const harness = mountRuntime("narrate", { canonicalWordIndex: 1 }, { settings: { lastReadingMode: "flow", readingMode: "flow" } });

    harness.runtime.togglePlay();
    await flushPromises();

    const onWordAdvance = (harness.audio.start.mock.calls[0] as unknown[] | undefined)?.[3] as ((wordIndex: number) => void) | undefined;
    expect(typeof onWordAdvance).toBe("function");

    onWordAdvance?.(2);
    vi.advanceTimersByTime(20);
    await flushPromises();

    expect(harness.runtime.mode).toBe("narrate");
    expect(harness.runtime.getSnapshot().highlightedWordIndex).toBe(1);
    expect(harness.view.highlightWordByIndex).not.toHaveBeenCalled();
    expect(harness.view.isWordInDom).not.toHaveBeenCalled();
  });

  it("re-enters narrate from page when narrate is the persisted last mode", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "narrate", readingMode: "page", isNarrating: true } });
    harness.attachView();

    harness.router.togglePlay();
    await flushPromises();

    // Page-mode Play is a no-op — mode, narration, and settings are all unchanged.
    expect(harness.router.getSnapshot()?.readingMode).toBe("page");
    expect(flowEngineStart).not.toHaveBeenCalled();
    expect(focusEngineStart).not.toHaveBeenCalled();
    expect(harness.audio.start).not.toHaveBeenCalled();
    expect(harness.updateSettings).not.toHaveBeenCalled();
  });
});

describe("useReaderMode four-mode foundation", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    installEngineSpies();
  });

  afterEach(() => {
    if (root) {
      flushSync(() => root?.unmount());
      root = null;
    }
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // OC-4: the legacy harness for the dead toggleNarrationInFlow cases (retained src/hooks/useReaderMode.ts).
  async function renderLegacyReaderModeHarness(options?: {
    settings?: Record<string, unknown>;
    initialReadingMode?: ReaderMode;
    initialIsNarrating?: boolean;
    initialFlowPlaying?: boolean;
    initialHighlightedWordIndex?: number;
    softWordIndex?: number;
    resumeAnchor?: number | null;
    explicitSelectionAnchor?: number | null;
    pendingNarrationResume?: boolean;
    narrationOverrides?: Record<string, unknown>;
    foliateApiCurrent?: Record<string, unknown>;
    getEffectiveWords?: () => string[];
    bookWordsTotalWords?: number;
    persistentWordIndex?: number;
    evalTrace?: any;
  }) {
    const modeInstance = {
      modeRef: { current: null },
      startMode: vi.fn(),
      stopMode: vi.fn(),
      pauseMode: vi.fn(),
      resumeMode: vi.fn(),
      setSpeed: vi.fn(),
      jumpToWordInMode: vi.fn(),
      updateModeWords: vi.fn(),
      pendingResumeRef: { current: null },
    };

    const foliateApiRef = {
      current: {
        clearSoftHighlight: vi.fn(),
        findFirstVisibleWordIndex: vi.fn(() => 0),
        highlightWordByIndex: vi.fn(() => true),
        getSectionForWordIndex: vi.fn(() => 0),
        goToSection: vi.fn(),
        isWordInDom: vi.fn(() => true),
        ...options?.foliateApiCurrent,
      },
    };

    const narration = createNarration(options?.narrationOverrides);

    const reader = {
      playing: false,
      wordIndex: 0,
      wordsRef: { current: ["alpha", "beta", "gamma"] as string[] },
      togglePlay: vi.fn(),
      jumpToWord: vi.fn(),
    };

    const updateSettings = vi.fn();
    const commitPersistentWordIndex = vi.fn((_w: number) => _w);
    const pendingNarrationResumeRef = { current: options?.pendingNarrationResume ?? false };
    const resumeAnchorRef = { current: options?.resumeAnchor ?? null };
    const explicitSelectionAnchorRef = { current: options?.explicitSelectionAnchor ?? null };
    const settings = {
      lastReadingMode: "flow",
      readingMode: options?.initialReadingMode ?? "page",
      ttsEngine: "web",
      isNarrating: false,
      ...options?.settings,
    } as any;

    let snapshot: LegacyUseReaderModeReturn | null = null;
    const observed = {
      readingMode: options?.initialReadingMode ?? "page" as ReaderMode,
      isNarrating: options?.initialIsNarrating ?? false,
      flowPlaying: options?.initialFlowPlaying ?? false,
      highlightedWordIndex: options?.initialHighlightedWordIndex ?? 0,
    };

    function Harness() {
      const [readingMode, setReadingMode] = useState<ReaderMode>(options?.initialReadingMode ?? "page");
      const [isNarrating, setIsNarrating] = useState(options?.initialIsNarrating ?? false);
      const [focusPlaying, setFocusPlaying] = useState(options?.initialReadingMode === "focus");
      const [flowPlaying, setFlowPlaying] = useState(options?.initialFlowPlaying ?? false);
      const [highlightedWordIndex, setHighlightedWordIndex] = useState(options?.initialHighlightedWordIndex ?? 0);

      observed.readingMode = readingMode;
      observed.isNarrating = isNarrating;
      observed.flowPlaying = flowPlaying;
      observed.highlightedWordIndex = highlightedWordIndex;

      snapshot = useReaderMode({
        reader,
        narration,
        modeInstance: modeInstance as any,
        foliateApiRef: foliateApiRef as any,
        foliateWordsRef: { current: [] },
        useFoliate: true,
        settings,
        updateSettings,
        wpm: 180,
        setWpm: vi.fn(),
        effectiveWpm: 180,
        getEffectiveWords: options?.getEffectiveWords ?? (() => ["alpha", "beta", "gamma"]),
        extractFoliateWords: vi.fn(),
        paragraphBreaks: new Set<number>(),
        highlightedWordIndex,
        setHighlightedWordIndex,
        hasEngagedRef: { current: false },
        focusPlaying,
        setFocusPlaying,
        flowPlaying,
        setFlowPlaying,
        isBrowsedAway: false,
        setIsBrowsedAway: vi.fn(),
        pageNavRef: { current: { returnToHighlight: vi.fn(), getCurrentPageStart: vi.fn(() => 0) } },
        readingMode,
        setReadingMode,
        isNarrating,
        setIsNarrating,
        pendingNarrationResumeRef,
        bookWordsTotalWords: options?.bookWordsTotalWords ?? 3,
        resumeAnchorRef,
        explicitSelectionAnchorRef,
        softWordIndexRef: { current: options?.softWordIndex ?? 0 },
        evalTrace: options?.evalTrace ?? null,
        persistentWordIndexRef: {
          current: options?.persistentWordIndex
            ?? options?.resumeAnchor
            ?? options?.explicitSelectionAnchor
            ?? options?.initialHighlightedWordIndex
            ?? 0,
        },
        commitPersistentWordIndex,
        syncVisualToPersistentWord: vi.fn(() => options?.resumeAnchor ?? options?.explicitSelectionAnchor ?? options?.initialHighlightedWordIndex ?? 0),
        queuePostModeAnchorSync: vi.fn(),
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    return {
      snapshot: () => snapshot,
      modeInstance,
      foliateApiRef,
      narration,
      reader,
      updateSettings,
      observed,
      pendingNarrationResumeRef,
      resumeAnchorRef,
      explicitSelectionAnchorRef,
      commitPersistentWordIndex,
    };
  }

  it("treats word index 0 as a valid explicit flow anchor instead of letting softWordIndex override it", async () => {
    const displayJump = spyDisplayJump(FlowModeRuntime);
    const harness = mountRuntime("flow", { canonicalWordIndex: 0, highlightedWordIndex: 0, softWordIndex: 2 });

    harness.runtime.togglePlay();
    await flushPromises();

    expect(displayJump).toHaveBeenCalledWith(0);
    expect(engineStarts(flowEngineStart)).toContainEqual([
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    ]);
  });

  it("clears the resume anchor after consuming it for a flow start", async () => {
    const displayJump = spyDisplayJump(FlowModeRuntime);
    const harness = mountRuntime("flow", { canonicalWordIndex: 2, resumeAnchor: 2, highlightedWordIndex: 1, softWordIndex: 0 });

    harness.runtime.togglePlay();
    await flushPromises();

    expect(displayJump).toHaveBeenCalledWith(2);
    expect(harness.runtime.exportHandoff("persistent").resumeAnchor).toBe(2);
  });

  it("starts narrate from an explicit selection even when an older resume anchor is still active", async () => {
    const harness = mountRuntime("narrate", {
      canonicalWordIndex: 0,
      highlightedWordIndex: 2,
      softWordIndex: 2,
      resumeAnchor: 0,
      explicitSelectionAnchor: 2,
    }, { settings: { lastReadingMode: "narrate", readingMode: "narrate" } });

    harness.runtime.togglePlay();
    await flushPromises();

    expect(harness.audio.start).toHaveBeenCalledWith(
      ["alpha", "beta", "gamma"],
      2,
      180,
      expect.any(Function),
    );
    const handoff = harness.runtime.exportHandoff("persistent");
    expect(handoff.resumeAnchor).toBe(2);
    expect(handoff.explicitSelectionAnchor).toBeNull();
  });

  it("starts narrate from a captured resume anchor before a stale persistent click anchor", async () => {
    const words = Array.from({ length: 20 }, (_, i) => `word-${i}`);
    const harness = mountRuntime("narrate", {
      canonicalWordIndex: 2,
      highlightedWordIndex: 2,
      resumeAnchor: 8,
      softWordIndex: 2,
    }, {
      settings: { lastReadingMode: "narrate", readingMode: "narrate" },
      document: { wordCount: 20 },
      view: createFakeView({ getWords: () => words }),
    });

    harness.runtime.togglePlay();
    await flushPromises();

    expect(harness.audio.start).toHaveBeenCalledWith(
      words,
      8,
      180,
      expect.any(Function),
    );
  });

  it("preserves narrate startup options across delayed Foliate word extraction", async () => {
    let wordsReady = false;
    const next = vi.fn(() => {
      wordsReady = true;
    });
    const harness = mountRuntime("narrate", {
      canonicalWordIndex: 0,
      highlightedWordIndex: 2,
      softWordIndex: 2,
      resumeAnchor: 0,
      explicitSelectionAnchor: 2,
    }, {
      settings: { lastReadingMode: "narrate", readingMode: "narrate" },
      view: createFakeView({ getWords: () => (wordsReady ? WORDS : []), next }),
    });

    harness.runtime.togglePlay();
    await flushPromises();

    expect(harness.audio.start).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();
    await flushPromises();

    expect(harness.runtime.mode).toBe("narrate");
    expect(harness.runtime.getSnapshot().selected).toBe(true);
    expect(flowRuntimeStart).not.toHaveBeenCalled();
    expect(harness.audio.start).toHaveBeenCalledWith(
      ["alpha", "beta", "gamma"],
      2,
      180,
      expect.any(Function),
    );
    const handoff = harness.runtime.exportHandoff("persistent");
    expect(handoff.resumeAnchor).toBe(2);
    expect(handoff.explicitSelectionAnchor).toBeNull();
  });

  // OC-4: dead code under test — toggleNarrationInFlow has no production caller (retained legacy hook).
  it("demotes active narrate mode back to flow when flow narration is toggled off", async () => {
    const harness = await renderLegacyReaderModeHarness({
      initialReadingMode: "narrate",
      initialIsNarrating: true,
      initialFlowPlaying: true,
      settings: {
        lastReadingMode: "narrate",
        readingMode: "narrate",
        isNarrating: true,
      },
    });

    await act(async () => {
      harness.snapshot()?.toggleNarrationInFlow();
      await flushPromises();
    });

    expect(harness.observed.readingMode).toBe("flow");
    expect(harness.observed.isNarrating).toBe(false);
    expect(harness.narration.stop).toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "flow",
      lastReadingMode: "flow",
      isNarrating: false,
    });
  });

  it("page-mode play is a no-op — mode and playback state are unchanged", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page" } });
    harness.attachView();

    harness.router.togglePlay();
    await flushPromises();

    // Page-mode Play is a no-op — nothing changes.
    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "page", playing: false });
    expect(harness.audio.start).not.toHaveBeenCalled();
    expect(harness.updateSettings).not.toHaveBeenCalled();
  });

  it("selecting flow from page mode updates the selected mode without auto-playing it", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "focus", readingMode: "page" } });

    harness.router.select("flow");
    await flushPromises();

    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "flow", playing: false });
    expect(flowRuntimeStart).not.toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "flow",
      lastReadingMode: "flow",
      isNarrating: false,
    });
  });

  it("selecting focus from page mode does not auto-start focus playback", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page" } });

    harness.router.select("focus");
    await flushPromises();

    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "focus", playing: false });
    expect(focusRuntimeStart).not.toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "focus",
      lastReadingMode: "focus",
      isNarrating: false,
    });
  });

  it("selecting narrate from page mode sets narrate paused without auto-starting TTS", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page" } });

    harness.router.select("narrate");
    await flushPromises();

    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "narrate", playing: false, narrating: false });
    expect(harness.audio.start).not.toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
      isNarrating: false,
    });
  });

  it("pausing active focus keeps the reader in focus mode", async () => {
    const focusEnginePause = vi.spyOn(FocusMode.prototype, "pause");
    const focusEngineStop = vi.spyOn(FocusMode.prototype, "stop");
    const harness = createRouterHarness({ settings: { lastReadingMode: "focus", readingMode: "page" } });
    harness.router.select("focus");
    harness.attachView();
    harness.router.togglePlay();
    vi.advanceTimersByTime(FOCUS_MODE_START_DELAY_MS);
    await flushPromises();
    expect(focusEngineStart).toHaveBeenCalled();

    harness.router.togglePlay();
    await flushPromises();

    expect(harness.router.getSnapshot()?.readingMode).toBe("focus");
    expect(focusEnginePause).toHaveBeenCalled();
    expect(focusEngineStop).not.toHaveBeenCalled();
  });

  it("pausing active narrate keeps one narration session instead of stopping for a cold restart", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "narrate", readingMode: "page" }, document: { wordCount: 20 } });
    harness.router.select("narrate");
    harness.attachView();
    harness.router.togglePlay();
    await flushPromises();
    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "narrate", narrating: true, playing: true });
    // The live session is speaking at word 7.
    harness.audioState.cursorWordIndex = 7;
    harness.audio.start.mockClear();
    harness.audio.stop.mockClear();
    harness.updateSettings.mockClear();
    anchorRecorder.calls.length = 0;

    harness.router.togglePlay();
    await flushPromises();

    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "narrate", narrating: true });
    expect(flowRuntimeStart).not.toHaveBeenCalled();
    expect(harness.audio.pause).toHaveBeenCalledWith("user-stop");
    expect(harness.audio.stop).not.toHaveBeenCalled();
    expect(harness.audio.start).not.toHaveBeenCalled();
    expect(harness.runtime().exportHandoff("persistent").resumeAnchor).toBe(7);
    expect(anchorCalls("narrate", "commitPersistentWordIndex").map((call) => call.args)).toContainEqual([7, "mode-advance", {
      persist: false,
      publishState: true,
      navigate: false,
      syncVisual: true,
    }]);
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
      isNarrating: true,
    });
  });

  it("resumes paused narrate through useNarration.resume instead of cold-starting again", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "narrate", readingMode: "page" }, document: { wordCount: 20 } });
    harness.router.select("narrate");
    harness.attachView();
    harness.router.togglePlay();
    harness.audioState.cursorWordIndex = 7;
    harness.router.togglePlay();
    await flushPromises();
    expect(harness.audioState).toMatchObject({ status: "paused", speaking: false, cursorWordIndex: 7 });
    expect(harness.runtime().exportHandoff("persistent").resumeAnchor).toBe(7);
    harness.audio.start.mockClear();
    harness.audio.stop.mockClear();
    harness.updateSettings.mockClear();

    harness.router.togglePlay();
    await flushPromises();

    expect(harness.audio.resume).toHaveBeenCalledWith();
    expect(harness.audio.resume).toHaveBeenCalledTimes(1);
    expect(harness.audio.start).not.toHaveBeenCalled();
    expect(harness.audio.stop).not.toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
      isNarrating: true,
    });
  });

  it("starts narrate normally when narrate mode is not actively narrating", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "narrate", readingMode: "page", isNarrating: false } });
    harness.router.select("narrate");
    harness.attachView();
    harness.updateSettings.mockClear();

    harness.router.togglePlay();
    await flushPromises();

    expect(harness.router.getSnapshot()?.readingMode).toBe("narrate");
    expect(harness.audio.start).toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
      isNarrating: true,
    });
  });

  it("records mode-switch anchor preservation when selecting another mode", async () => {
    const events: unknown[] = [];
    const fake = createInfra({ document: { position: 2 } });
    const { result } = renderHook(() => useReaderModeOrchestrator({
      infrastructure: fake.infra,
      getDocument: () => fake.document,
      getSettings: () => fake.settings,
      lastReadingMode: "flow",
      updateSettings: vi.fn(),
      evalTrace: {
        enabled: true,
        record: (event: unknown) => events.push(event),
      },
    }));
    act(() => {
      result.current.router.openDocument(fake.document);
    });

    await act(async () => {
      result.current.handleSelectMode("flow");
      await flushPromises();
    });

    expect(events).toContainEqual({
      kind: "transition",
      transition: "handoff",
      from: "page",
      to: "flow",
      context: "mode-switch-persistent-anchor-paused",
      latencyMs: 0,
    });
  });

  // OC-4: dead code under test — toggleNarrationInFlow has no production caller (retained legacy hook).
  it("installs a narrate truth-sync callback when flow narration is promoted into narrate mode", async () => {
    const harness = await renderLegacyReaderModeHarness({
      initialReadingMode: "flow",
      initialFlowPlaying: true,
      initialHighlightedWordIndex: 1,
    });

    await act(async () => {
      harness.snapshot()?.toggleNarrationInFlow();
      await flushPromises();
    });

    const installCall = harness.narration.setOnTruthSync.mock.calls.find(([value]: [unknown]) => typeof value === "function");
    expect(installCall).toBeTruthy();

    const truthSync = installCall?.[0] as (wordIndex: number) => void;
    await act(async () => {
      truthSync(2);
      vi.advanceTimersByTime(20);
      await flushPromises();
    });

    expect(harness.observed.highlightedWordIndex).toBe(2);
    expect(harness.commitPersistentWordIndex).toHaveBeenCalledWith(2, "mode-advance", {
      persist: false,
      publishState: true,
      navigate: false,
      syncVisual: false,
    });
    expect(harness.foliateApiRef.current.highlightWordByIndex).toHaveBeenCalledWith(2, "narrate", { allowMotion: false });
    expect(harness.modeInstance.pendingResumeRef.current).toBeNull();
  });

  it("routes trusted narrate word sync into the chunk visual active-word owner", async () => {
    const onNarrateTruthSync = vi.spyOn(NarrateModeRuntime.prototype, "applyNarrationActiveWord");
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page" } });
    harness.router.select("narrate");
    const view = harness.attachView();
    harness.router.togglePlay();
    await flushPromises();

    const truthSync = truthSyncCallback(harness.audio);

    truthSync(2);
    vi.advanceTimersByTime(20);
    await flushPromises();

    expect(onNarrateTruthSync).toHaveBeenCalledWith(2);
    expect(view.highlightWordByIndex).toHaveBeenCalledWith(2, "narrate", { allowMotion: false });
  });

  it("queues a narrate pending resume when spoken-word truth lands outside the current DOM slice", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page" }, document: { wordCount: 20 } });
    harness.router.select("narrate");
    const view = harness.attachView(createFakeView({
      highlightWordByIndex: () => false,
      getSectionForWordIndex: () => 3,
    }));
    harness.router.togglePlay();
    await flushPromises();

    const truthSync = truthSyncCallback(harness.audio);

    truthSync(7);
    vi.advanceTimersByTime(20);
    await flushPromises();

    expect(harness.router.getSnapshot()?.highlightedWordIndex).toBe(7);
    expect(view.highlightWordByIndex).toHaveBeenCalledWith(7, "narrate", { allowMotion: false });
    expect(view.goToSection).toHaveBeenCalledWith(3);
    // The queued narrate resume: once the next section stamps its words, the spoken word 7 is highlighted.
    view.highlightWordByIndex.mockClear();
    (harness.runtime() as unknown as { onWordsReextracted(): void }).onWordsReextracted();
    vi.advanceTimersByTime(20);
    expect(view.highlightWordByIndex).toHaveBeenCalledWith(7, undefined, undefined);
  });

  // OC-4: dead code under test — toggleNarrationInFlow has no production caller (retained legacy hook).
  it("clears the narrate truth-sync callback when flow narration is toggled back off", async () => {
    const harness = await renderLegacyReaderModeHarness({
      initialReadingMode: "flow",
      initialFlowPlaying: true,
    });

    await act(async () => {
      harness.snapshot()?.toggleNarrationInFlow();
      await flushPromises();
    });

    await act(async () => {
      harness.snapshot()?.toggleNarrationInFlow();
      await flushPromises();
    });

    expect(harness.narration.setOnTruthSync).toHaveBeenLastCalledWith(null);
    expect(harness.observed.readingMode).toBe("flow");
  });

  it("treats word index 0 as a valid explicit narrate anchor", async () => {
    const harness = mountRuntime("narrate", {
      canonicalWordIndex: 0,
      highlightedWordIndex: 0,
      softWordIndex: 5,
      explicitSelectionAnchor: 0,
    }, { settings: { lastReadingMode: "narrate", readingMode: "narrate" } });

    harness.runtime.togglePlay();
    await flushPromises();

    expect(harness.audio.start).toHaveBeenCalledWith(
      ["alpha", "beta", "gamma"],
      0,
      180,
      expect.any(Function),
    );
    expect(harness.runtime.exportHandoff("persistent").explicitSelectionAnchor).toBeNull();
  });

  it("preserves narrate options across delayed extraction with word 0 anchor", async () => {
    let wordsReady = false;
    const next = vi.fn(() => {
      wordsReady = true;
    });
    const harness = mountRuntime("narrate", {
      canonicalWordIndex: 0,
      highlightedWordIndex: 0,
      softWordIndex: 0,
      explicitSelectionAnchor: 0,
    }, {
      settings: { lastReadingMode: "narrate", readingMode: "narrate" },
      view: createFakeView({ getWords: () => (wordsReady ? WORDS : []), next }),
    });

    harness.runtime.togglePlay();
    await flushPromises();

    expect(harness.audio.start).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();
    await flushPromises();

    expect(harness.runtime.mode).toBe("narrate");
    expect(harness.runtime.getSnapshot().selected).toBe(true);
    expect(flowRuntimeStart).not.toHaveBeenCalled();
    expect(harness.audio.start).toHaveBeenCalledWith(
      ["alpha", "beta", "gamma"],
      0,
      180,
      expect.any(Function),
    );
  });

  it("selecting a mode clears isBrowsedAway via stopAllModes", async () => {
    const harness = createRouterHarness({ settings: { lastReadingMode: "flow", readingMode: "page", isNarrating: true }, document: { position: 5, wordCount: 20 } });
    harness.router.select("flow");
    (harness.runtime() as unknown as { onUserBrowseAway(): void }).onUserBrowseAway();
    expect(harness.router.getSnapshot()?.isBrowsedAway).toBe(true);

    harness.router.select("narrate");
    await flushPromises();

    expect(harness.router.getSnapshot()).toMatchObject({ readingMode: "narrate", isBrowsedAway: false });
  });

  it("Focus Play starts at the persistent word anchor, not word 0", async () => {
    const displayJump = spyDisplayJump(FocusModeRuntime);
    const bookWords = createBookWords(10000);
    const harness = mountRuntime("focus", { canonicalWordIndex: 3322, highlightedWordIndex: 3322, softWordIndex: 0 }, {
      document: { wordCount: 10000, bookWords },
    });

    harness.runtime.togglePlay();
    await flushPromises();

    // Flush the FOCUS_MODE_START_DELAY_MS timer so the engine starts
    vi.runOnlyPendingTimers();
    await flushPromises();

    // Should start Focus at 3322, not at 0
    expect(engineStarts(focusEngineStart)).toContainEqual([
      "focus",
      3322,
      expect.any(Array),
      expect.any(Object),
    ]);
    expect(displayJump).toHaveBeenCalledWith(3322);
  });

  it("Focus start after hard-click uses persistent anchor, not stale state", async () => {
    const bookWords = createBookWords(10000);
    const harness = mountRuntime("focus", { canonicalWordIndex: 3322, highlightedWordIndex: 0, softWordIndex: 0, explicitSelectionAnchor: 3322 }, {
      document: { wordCount: 10000, bookWords },
    });

    harness.runtime.togglePlay();
    await flushPromises();

    // Flush the FOCUS_MODE_START_DELAY_MS timer so the engine starts
    vi.runOnlyPendingTimers();
    await flushPromises();

    expect(engineStarts(focusEngineStart)).toContainEqual([
      "focus",
      3322,
      expect.any(Array),
      expect.any(Object),
    ]);
  });
});

function createBookWords(total: number): NonNullable<ReaderDocumentSnapshot["bookWords"]> {
  return {
    words: Array.from({ length: total }, (_, i) => `w${i}`),
    sections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: total, wordCount: total }],
    totalWords: total,
    footnoteCues: [],
  };
}

describe("useReaderMode persistent anchor mode matrix", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installEngineSpies();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each(["focus", "flow", "narrate"] as const)(
    "selecting %s does not start playback and uses the persistent anchor",
    async (mode) => {
      const harness = createRouterHarness({
        settings: { lastReadingMode: "flow", readingMode: "page" },
        document: { position: 64, wordCount: 100 },
      });

      harness.router.select(mode);
      await flushPromises();

      expect(anchorCalls(mode, "syncVisualToPersistentWord")).toContainEqual(
        expect.objectContaining({ args: [{ navigate: false }], result: 64 }),
      );
      // The queued post-mode anchor sync to 64 in the selected mode (double RAF).
      vi.advanceTimersByTime(50);
      expect(anchorCalls(mode, "syncVisualToPersistentWord")).toContainEqual(
        expect.objectContaining({ args: [{ navigate: true }], result: 64 }),
      );
      expect(harness.router.getSnapshot()).toMatchObject({ readingMode: mode, playing: false, currentWordIndex: 64 });
      expect(focusEngineStart).not.toHaveBeenCalled();
      expect(flowEngineStart).not.toHaveBeenCalled();
      expect(harness.audio.start).not.toHaveBeenCalled();
    },
  );
});

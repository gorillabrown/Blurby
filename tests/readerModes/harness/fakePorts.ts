// READER-MODE-SEPARATION-2 test-only harness: fake port infrastructure behind the real broker.
// The broker forwards only accepted calls, so everything recorded here was accepted.
import { DEFAULT_SETTINGS } from "../../../src/constants";
import type { BlurbySettings } from "../../../src/types";
import {
  createReaderDocumentSnapshot,
  createReaderSettingsSnapshot,
  type ReaderBookWordsValue,
  type ReaderDocumentSnapshot,
} from "../../../src/reader/document/ReaderDocumentSnapshot";
import type { ReaderPortInfrastructure } from "../../../src/reader/ports/createReaderPorts";
import type { ReaderAudioStartResult } from "../../../src/reader/ports/ReaderPorts";

export interface FakeCall {
  readonly method: string;
  readonly args: readonly unknown[];
}

const READS = new Set(["settings.read", "document.snapshot", "audio.readState", "audio.getAudioProgress", "audio.resolveHighlightSync"]);

export function createFakeDocument(overrides: Partial<ReaderDocumentSnapshot> = {}): ReaderDocumentSnapshot {
  const tokenWords = Array.from({ length: 25 }, (_, i) => `w${i}`);
  return createReaderDocumentSnapshot({
    documentId: "doc-1",
    documentGeneration: 0,
    title: "Fixture",
    author: null,
    coverPath: null,
    filepath: "/fixture.epub",
    useFoliate: true,
    wordCount: tokenWords.length,
    position: 7,
    cfi: null,
    tokenWords,
    paragraphBreaks: [8, 17],
    bookWords: null,
    pronunciationOverrides: [],
    ...overrides,
  });
}

export function createFakeInfrastructure(options: { document?: ReaderDocumentSnapshot; audioStartResult?: ReaderAudioStartResult } = {}) {
  const document = options.document ?? createFakeDocument();
  const settings = createReaderSettingsSnapshot({
    settings: { ...DEFAULT_SETTINGS, readingMode: "page", lastReadingMode: "flow", isNarrating: false } as BlurbySettings,
    wpm: 300,
    effectiveWpm: 300,
    focusTextSize: DEFAULT_SETTINGS.focusTextSize,
    isEink: false,
    isMac: false,
  });
  /** Accepted effect calls (reads and diagnostics excluded). */
  const effects: FakeCall[] = [];
  const diagnostics: FakeCall[] = [];
  /** Callbacks currently registered into infrastructure (as wrapped by the broker). */
  const registered: Record<string, ((...args: never[]) => unknown) | null> = {};
  const pendingBookWords: Array<(value: ReaderBookWordsValue | null) => void> = [];
  const pendingBookBytes: Array<(value: ArrayBuffer) => void> = [];

  const rec = (method: string) => (...args: unknown[]) => {
    if (!READS.has(method)) (method.startsWith("diagnostics.") ? diagnostics : effects).push({ method, args });
  };
  const register = (method: string, slot: string) => (...args: unknown[]) => {
    rec(method)(...args);
    registered[slot] = (args[slot === "onWord" ? 3 : 0] as never) ?? null;
  };

  const infra: ReaderPortInfrastructure = {
    settings: { read: () => settings, update: rec("settings.update"), setWpm: rec("settings.setWpm") },
    persistence: {
      updateDocProgress: rec("persistence.updateDocProgress"),
      updateProgress: rec("persistence.updateProgress"),
      recordCfi: rec("persistence.recordCfi"),
      markEngaged: rec("persistence.markEngaged"),
      markPageActivity: rec("persistence.markPageActivity"),
      scheduleRelocateSave: rec("persistence.scheduleRelocateSave"),
    },
    document: {
      snapshot: () => document,
      readBookBytes: () => { rec("document.readBookBytes")(); return new Promise((resolve) => pendingBookBytes.push(resolve)); },
      ensureBookWords: () => { rec("document.ensureBookWords")(); return new Promise((resolve) => pendingBookWords.push(resolve)); },
      subscribe: (listener) => { register("document.subscribe", "document")(listener); return rec("document.unsubscribe"); },
    },
    audio: {
      readState: () => ({ status: "idle", speaking: false, warming: false, kokoroLoading: false, cursorWordIndex: 0, pauseReason: null, rate: 1 }),
      start: (...args) => { register("audio.start", "onWord")(...args); return options.audioStartResult ?? "started"; },
      pause: rec("audio.pause"),
      resume: rec("audio.resume"),
      stop: rec("audio.stop"),
      setOnTruthSync: register("audio.setOnTruthSync", "truthSync"),
      setPageEndWord: rec("audio.setPageEndWord"),
      resync: rec("audio.resync"),
      setOnChunkBoundary: register("audio.setOnChunkBoundary", "chunkBoundary"),
      setOnSegmentStart: register("audio.setOnSegmentStart", "segmentStart"),
      setOnSectionEnd: register("audio.setOnSectionEnd", "sectionEnd"),
      updateWords: rec("audio.updateWords"),
      adjustRate: rec("audio.adjustRate"),
      resolveHighlightSync: () => undefined,
      getAudioProgress: () => null,
      updateCacheCursor: rec("audio.updateCacheCursor"),
      configure: rec("audio.configure"),
    },
    diagnostics: { record: rec("diagnostics.record"), transition: rec("diagnostics.transition"), trace: rec("diagnostics.trace") },
    shell: {
      reportRelocate: rec("shell.reportRelocate"),
      reportToc: rec("shell.reportToc"),
      reportFlowProgress: rec("shell.reportFlowProgress"),
      reportEinkContentChange: rec("shell.reportEinkContentChange"),
      requestCompletionToPage: rec("shell.requestCompletionToPage"),
      requestCrossBook: rec("shell.requestCrossBook"),
    },
  };

  return {
    infra,
    effects,
    diagnostics,
    registered,
    resolveBookWords: (value: ReaderBookWordsValue | null) => pendingBookWords.splice(0).forEach((resolve) => resolve(value)),
    resolveBookBytes: (value: ArrayBuffer) => pendingBookBytes.splice(0).forEach((resolve) => resolve(value)),
  };
}

export type FakeInfrastructure = ReturnType<typeof createFakeInfrastructure>;

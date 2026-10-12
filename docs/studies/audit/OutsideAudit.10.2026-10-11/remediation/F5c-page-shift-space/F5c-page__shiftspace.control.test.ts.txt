// Scratch control (read-only on the repo): real useReaderKeys + real useReaderModeOrchestrator,
// wired exactly as ReaderContainer.tsx:889 (slot 25 cycleMode=handleCycleMode, slot 26 cycleAndStart=handleCycleAndStart).
import { renderHook, act } from "@testing-library/react";
import { useReaderKeys } from "C:/Projects/Blurby/src/hooks/useKeyboardShortcuts";
import { useReaderModeOrchestrator } from "C:/Projects/Blurby/src/reader/useReaderModeOrchestrator";
import { createReaderDocumentSnapshot, createReaderSettingsSnapshot } from "C:/Projects/Blurby/src/reader/document/ReaderDocumentSnapshot";
import { DEFAULT_SETTINGS } from "C:/Projects/Blurby/src/constants";

function infra(last: string) {
  const document = createReaderDocumentSnapshot({ documentId: "d", documentGeneration: 1, title: "D", author: null, coverPath: null,
    filepath: "/d.epub", useFoliate: true, wordCount: 3, position: 0, cfi: null, tokenWords: [], paragraphBreaks: [], bookWords: null, pronunciationOverrides: [] } as any);
  const settings = createReaderSettingsSnapshot({ settings: { ...DEFAULT_SETTINGS, lastReadingMode: last, readingMode: "page", ttsEngine: "web", isNarrating: false } as any,
    wpm: 180, effectiveWpm: 180, focusTextSize: 100, isEink: false, isMac: false } as any);
  const f = () => vi.fn();
  const audio: any = { readState: vi.fn(() => ({ status: "idle", speaking: false, warming: false, kokoroLoading: false, cursorWordIndex: 0, pauseReason: null, rate: 1 })),
    start: vi.fn(() => "started"), pause: f(), resume: f(), stop: f(), setOnTruthSync: f(), setPageEndWord: f(), resync: f(), setOnChunkBoundary: f(),
    setOnSegmentStart: f(), setOnSectionEnd: f(), updateWords: f(), adjustRate: f(), resolveHighlightSync: vi.fn(() => undefined), getAudioProgress: vi.fn(() => null), updateCacheCursor: f(), configure: f() };
  const portUpdate = vi.fn();
  const inf: any = { settings: { read: () => settings, update: portUpdate, setWpm: f() },
    persistence: { updateDocProgress: f(), updateProgress: f(), recordCfi: f(), markEngaged: f(), markPageActivity: f(), scheduleRelocateSave: f() },
    document: { snapshot: () => document, readBookBytes: () => new Promise(() => {}), ensureBookWords: () => new Promise(() => {}), subscribe: () => () => {} },
    audio, diagnostics: { record: f(), transition: f(), trace: f() },
    shell: { reportRelocate: f(), reportToc: f(), reportEinkContentChange: f(), requestCompletionToPage: f(), requestCrossBook: f() } };
  return { inf, document, settings };
}

function setup(last: "flow" | "focus") {
  const fake = infra(last);
  const updateSettings = vi.fn();
  const n = () => {};
  const { result } = renderHook(() => {
    const o = useReaderModeOrchestrator({ infrastructure: fake.inf, getDocument: () => fake.document, getSettings: () => fake.settings, lastReadingMode: last, updateSettings });
    const readingMode = o.snapshot?.readingMode ?? "page";
    useReaderKeys("reader", readingMode, o.handleTogglePlay, n, o.adjustSpeed, n, n, n, n, o.handleEnterFocus, n, n, o.handleToggleNarration,
      n, n, o.handleEnterFlow, n, n, n, n, n, n, n, n, o.handleCycleMode, o.handleCycleAndStart, n, n, o.handleEnterNarrate);
    return o;
  });
  act(() => { result.current.router.openDocument(fake.document); });
  return { result, updateSettings };
}
const shiftSpace = () => act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " ", shiftKey: true, bubbles: true, cancelable: true })); });

it("C1 Page + Shift+Space, last=flow: stays in Page, writes lastReadingMode only (narrate today; focus after D15 narrowing)", () => {
  const { result, updateSettings } = setup("flow");
  expect(result.current.router.getActive()?.mode).toBe("page");
  shiftSpace();
  expect(result.current.router.getActive()?.mode).toBe("page");
  expect(result.current.snapshot?.readingMode).toBe("page");
  expect(updateSettings.mock.calls).toEqual([[{ lastReadingMode: "narrate" }]]);
});

it("C2 Page + Shift+Space, last=focus: stays in Page, writes lastReadingMode flow", () => {
  const { result, updateSettings } = setup("focus");
  shiftSpace();
  expect(result.current.router.getActive()?.mode).toBe("page");
  expect(updateSettings.mock.calls).toEqual([[{ lastReadingMode: "flow" }]]);
});

it("C3 counter-control: handleCycleAndStart (the function D15 names) called directly from Page DOES enter a mode", () => {
  const { result, updateSettings } = setup("focus");
  act(() => { result.current.handleCycleAndStart(); });
  expect(result.current.router.getActive()?.mode).toBe("flow");
  expect(updateSettings).not.toHaveBeenCalled();
});

it("C4 counter-control: Focus + Shift+Space reaches cycleAndStart and switches Focus -> Flow", () => {
  const { result } = setup("flow");
  act(() => { result.current.handleEnterFocus(); });
  expect(result.current.router.getActive()?.mode).toBe("focus");
  shiftSpace();
  expect(result.current.router.getActive()?.mode).toBe("flow");
});

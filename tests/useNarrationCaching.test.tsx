// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const backgroundCacherFactory = vi.hoisted(() => {
  let instances: any[] = [];

  return {
    makeInstance() {
      return {
        start: vi.fn(),
        stop: vi.fn(),
        setActiveBook: vi.fn(),
        setReadingNowBooks: vi.fn(),
        updateCursorPosition: vi.fn(),
        queueEntryCoverage: vi.fn(),
        isBookFullyCached: vi.fn().mockResolvedValue(false),
      };
    },
    push(instance: any) {
      instances.push(instance);
    },
    latest() {
      return instances[instances.length - 1] ?? null;
    },
    all() {
      return instances;
    },
    reset() {
      instances = [];
    },
  };
});

vi.mock("../src/utils/backgroundCacher", () => ({
  createBackgroundCacher: vi.fn(() => {
    const instance = backgroundCacherFactory.makeInstance();
    backgroundCacherFactory.push(instance);
    return instance;
  }),
}));

function flushPromises(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve());
}

interface HarnessProps {
  ttsRate: number;
  globalOverrides?: Array<{ from: string; to: string; enabled: boolean }>;
  bookOverrides?: Array<{ from: string; to: string; enabled: boolean }>;
}

function createProps(props: HarnessProps) {
  const wordsRef = { current: Array.from({ length: 500 }, (_, i) => `word${i}`) };
  return {
    activeDoc: {
      id: "book-1",
      position: 42,
      wordCount: 500,
      pronunciationOverrides: props.bookOverrides ?? [],
    } as any,
    settings: {
      ttsEngine: "kokoro",
      ttsCacheEnabled: true,
      ttsVoiceName: "af_bella",
      ttsRate: props.ttsRate,
      pronunciationOverrides: props.globalOverrides ?? [],
    } as any,
    wordsRef,
    narrationWarmUp: vi.fn(),
    useFoliate: false,
    readingMode: "page" as const,
    isNarrating: false,
    bookWordsRef: { current: null },
    footnoteCuesRef: { current: [] },
    bookWordsCompleteRef: { current: false },
    setBookWordMeta: vi.fn(),
    highlightedWordIndexRef: { current: 84 },
    foliateApiRef: { current: null },
    narration: {
      updateWords: vi.fn(),
    },
  };
}

describe("useNarrationCaching", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;
  let useNarrationCachingHook: typeof import("../src/hooks/useNarrationCaching").useNarrationCaching;

  beforeEach(async () => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    backgroundCacherFactory.reset();
    (window as any).electronAPI = {
      kokoroPreload: vi.fn().mockResolvedValue({ ok: true }),
      kokoroPreloadMarathon: vi.fn().mockResolvedValue({ ok: true }),
      kokoroGenerateMarathon: vi.fn().mockResolvedValue({
        audio: new Float32Array(100),
        sampleRate: 24000,
        durationMs: 1000,
      }),
    };
    useNarrationCachingHook = (await import("../src/hooks/useNarrationCaching")).useNarrationCaching;
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    container.remove();
    delete (window as any).electronAPI;
  });

  it("requeues active-book startup coverage when the rate bucket changes", async () => {
    function Harness(props: HarnessProps) {
      useNarrationCachingHook(createProps(props));
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(<Harness ttsRate={1.0} />);
      await flushPromises();
    });

    const firstInstance = backgroundCacherFactory.all()[0];
    expect(firstInstance.queueEntryCoverage).toHaveBeenCalledTimes(1);
    expect(firstInstance.setActiveBook).toHaveBeenCalledTimes(1);

    await act(async () => {
      root?.render(<Harness ttsRate={1.2} />);
      await flushPromises();
    });

    const secondInstance = backgroundCacherFactory.latest();
    expect(secondInstance).not.toBe(firstInstance);
    expect(secondInstance.queueEntryCoverage).toHaveBeenCalledTimes(1);
    expect(secondInstance.setActiveBook).toHaveBeenCalledTimes(1);
  });

  it("queues startup coverage from the current highlighted word instead of the persisted book position", async () => {
    function Harness(props: HarnessProps) {
      useNarrationCachingHook(createProps(props));
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(<Harness ttsRate={1.0} />);
      await flushPromises();
    });

    const firstInstance = backgroundCacherFactory.all()[0];
    expect(firstInstance.queueEntryCoverage).toHaveBeenCalledWith(
      expect.objectContaining({ position: 84 })
    );
    expect(firstInstance.setActiveBook).toHaveBeenCalledWith(
      expect.objectContaining({ position: 84 })
    );
  });

  it("requeues active-book startup coverage when pronunciation identity changes", async () => {
    function Harness(props: HarnessProps) {
      useNarrationCachingHook(createProps(props));
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(<Harness ttsRate={1.0} globalOverrides={[]} bookOverrides={[]} />);
      await flushPromises();
    });

    const firstInstance = backgroundCacherFactory.all()[0];

    await act(async () => {
      root?.render(
        <Harness
          ttsRate={1.0}
          globalOverrides={[{ from: "Eta", to: "Ay-tuh", enabled: true }]}
          bookOverrides={[{ from: "SQL", to: "sequel", enabled: true }]}
        />
      );
      await flushPromises();
    });

    const secondInstance = backgroundCacherFactory.latest();
    expect(secondInstance).not.toBe(firstInstance);
    expect(secondInstance.queueEntryCoverage).toHaveBeenCalledTimes(1);
    expect(secondInstance.setActiveBook).toHaveBeenCalledTimes(1);
  });
});

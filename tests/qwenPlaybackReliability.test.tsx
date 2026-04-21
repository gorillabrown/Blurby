// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function flushPromises(): Promise<void> {
  return Promise.resolve().then(() => Promise.resolve()).then(() => Promise.resolve());
}

const qwenStrategyMock = vi.hoisted(() => ({
  speakChunk: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
}));

vi.mock("../src/hooks/narration/qwenStrategy", () => ({
  createQwenStrategy: vi.fn(() => qwenStrategyMock),
}));

vi.mock("../src/hooks/narration/kokoroStrategy", () => ({
  createKokoroStrategy: vi.fn(() => ({
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    refreshBufferedTempo: vi.fn(),
    warmUp: vi.fn(),
    getScheduler: vi.fn(() => ({ stop: vi.fn(), pause: vi.fn(), resume: vi.fn() })),
    getPipeline: vi.fn(() => ({ acknowledgeChunk: vi.fn() })),
    getAudioProgress: vi.fn(() => null),
  })),
}));

vi.mock("../src/hooks/narration/webSpeechStrategy", () => ({
  createWebSpeechStrategy: vi.fn(() => ({
    speakChunk: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  })),
}));

function createElectronApiMock() {
  return {
    kokoroModelStatus: vi.fn().mockResolvedValue({
      status: "idle",
      ready: false,
      loading: false,
      detail: null,
      reason: null,
      recoverable: false,
    }),
    kokoroVoices: vi.fn().mockResolvedValue({ voices: ["af_bella"] }),
    onKokoroDownloadProgress: vi.fn(() => () => {}),
    onKokoroEngineStatus: vi.fn(() => () => {}),
    onKokoroDownloadError: vi.fn(() => () => {}),
    qwenModelStatus: vi.fn().mockResolvedValue({
      status: "ready",
      detail: "Qwen runtime ready for live narration playback",
      reason: null,
      ready: true,
      loading: false,
      recoverable: false,
    }),
    qwenPreload: vi.fn().mockResolvedValue({ success: true }),
    qwenVoices: vi.fn().mockResolvedValue({ voices: ["Ryan", "Aiden"] }),
    onQwenEngineStatus: vi.fn(() => () => {}),
    onQwenRuntimeError: vi.fn(() => () => {}),
  };
}

describe("Qwen playback reliability", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  const renderHarness = async () => {
    vi.resetModules();
    const { default: useNarration } = await import("../src/hooks/useNarration");
    let latest: ReturnType<typeof useNarration> | null = null;

    function Harness() {
      latest = useNarration();
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(<Harness />);
      await flushPromises();
    });

    return {
      getSnapshot: () => latest,
    };
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    (window as any).electronAPI = createElectronApiMock();

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
      },
    });

    qwenStrategyMock.speakChunk.mockClear();
    qwenStrategyMock.stop.mockClear();
    qwenStrategyMock.pause.mockClear();
    qwenStrategyMock.resume.mockClear();
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

  it("restarts the Qwen chain after an authoritative handoff without switching engines", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("qwen");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["zero", "one", "two", "three", "four"], 0, 180, vi.fn());
      await flushPromises();
    });

    qwenStrategyMock.stop.mockClear();
    qwenStrategyMock.speakChunk.mockClear();

    await act(async () => {
      harness.getSnapshot()?.updateWords(["three", "four", "five", "six"], 2, { mode: "handoff" });
      await flushPromises();
    });

    expect(harness.getSnapshot()?.qwenStatus.ready).toBe(true);
    expect(qwenStrategyMock.stop).toHaveBeenCalledTimes(1);
    expect(qwenStrategyMock.speakChunk).toHaveBeenCalledTimes(1);
  });

  it("stops the active Qwen strategy when narration is explicitly stopped", async () => {
    const harness = await renderHarness();

    await act(async () => {
      harness.getSnapshot()?.setEngine("qwen");
      await flushPromises();
    });

    await act(async () => {
      harness.getSnapshot()?.startCursorDriven(["one", "two", "three"], 0, 180, vi.fn());
      await flushPromises();
    });

    qwenStrategyMock.stop.mockClear();

    await act(async () => {
      harness.getSnapshot()?.stop();
      await flushPromises();
    });

    expect(qwenStrategyMock.stop).toHaveBeenCalledTimes(1);
    expect(harness.getSnapshot()?.speaking).toBe(false);
  });
});

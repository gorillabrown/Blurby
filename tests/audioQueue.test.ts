import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAudioQueue } from "../src/utils/audioQueue";
import type { AudioQueueConfig, AudioQueueCallbacks } from "../src/utils/audioQueue";

// Mock AudioContext for Node.js test environment
class MockAudioBufferSourceNode {
  buffer: any = null;
  onended: (() => void) | null = null;
  connect() { return this; }
  start() {
    // Simulate immediate playback completion for testing
    if (this.onended) setTimeout(() => this.onended!(), 10);
  }
  stop() {}
}

class MockAudioBuffer {
  copyToChannel() {}
}

class MockAudioContext {
  sampleRate = 24000;
  currentTime = 0;
  state: "running" | "suspended" = "running";

  createBuffer() { return new MockAudioBuffer(); }
  createBufferSource() { return new MockAudioBufferSourceNode(); }
  resume() { this.state = "running"; return Promise.resolve(); }
  suspend() { this.state = "suspended"; return Promise.resolve(); }
}

// Install mock AudioContext globally
beforeEach(() => {
  (globalThis as any).AudioContext = MockAudioContext;
});

afterEach(() => {
  delete (globalThis as any).AudioContext;
  vi.restoreAllMocks();
});

function makeConfig(overrides?: Partial<AudioQueueConfig>): AudioQueueConfig {
  const words = ["The", "quick", "brown", "fox", "jumped.", "Over", "the", "lazy", "dog."];
  return {
    generateFn: vi.fn(async (text: string) => ({
      audio: new Float32Array(2400), // 100ms at 24kHz
      sampleRate: 24000,
      durationMs: 100,
    })),
    getWords: () => words,
    getVoiceId: () => "af_bella",
    getSpeed: () => 1.0,
    findChunkEnd: (_words, startIdx) => Math.min(startIdx + 5, _words.length),
    getParagraphBreaks: () => new Set<number>(),
    ...overrides,
  };
}

function makeCallbacks(overrides?: Partial<AudioQueueCallbacks>): AudioQueueCallbacks {
  return {
    onWordAdvance: vi.fn(),
    onChunkBoundary: vi.fn(),
    onEnd: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

describe("audioQueue", () => {
  it("creates a queue with start/stop/pause/resume/flush methods", () => {
    const queue = createAudioQueue(makeConfig());
    expect(queue.start).toBeInstanceOf(Function);
    expect(queue.stop).toBeInstanceOf(Function);
    expect(queue.pause).toBeInstanceOf(Function);
    expect(queue.resume).toBeInstanceOf(Function);
    expect(queue.flush).toBeInstanceOf(Function);
    expect(queue.isPlaying).toBeInstanceOf(Function);
  });

  it("calls generateFn when started", async () => {
    const config = makeConfig();
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(0, cbs);

    // Wait for async production
    await vi.waitFor(() => {
      expect(config.generateFn).toHaveBeenCalled();
    });

    queue.stop();
  });

  it("generates chunks starting from the provided startIdx", async () => {
    const config = makeConfig();
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(5, cbs);

    await vi.waitFor(() => {
      expect(config.generateFn).toHaveBeenCalled();
    });

    // First call should use words starting from index 5
    const firstCallText = (config.generateFn as any).mock.calls[0][0];
    expect(firstCallText).toContain("Over");

    queue.stop();
  });

  it("stop clears the queue and prevents further generation", async () => {
    const config = makeConfig();
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(0, cbs);
    await vi.waitFor(() => {
      expect(config.generateFn).toHaveBeenCalled();
    });

    queue.stop();

    const callCountAfterStop = (config.generateFn as any).mock.calls.length;

    // Wait a tick to ensure no further calls
    await new Promise(r => setTimeout(r, 50));
    expect((config.generateFn as any).mock.calls.length).toBe(callCountAfterStop);
  });

  it("reports not playing after stop", () => {
    const queue = createAudioQueue(makeConfig());
    expect(queue.isPlaying()).toBe(false);
  });

  it("calls onError when generateFn fails", async () => {
    const config = makeConfig({
      generateFn: vi.fn(async () => ({ error: "Model not loaded" })),
    });
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(0, cbs);

    await vi.waitFor(() => {
      expect(cbs.onError).toHaveBeenCalled();
    });

    queue.stop();
  });

  it("calls onError when generateFn throws", async () => {
    const config = makeConfig({
      generateFn: vi.fn(async () => { throw new Error("Network error"); }),
    });
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(0, cbs);

    await vi.waitFor(() => {
      expect(cbs.onError).toHaveBeenCalled();
    });

    queue.stop();
  });

  it("flush resets the production index", async () => {
    const config = makeConfig();
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(0, cbs);

    await vi.waitFor(() => {
      expect(config.generateFn).toHaveBeenCalled();
    });

    (config.generateFn as any).mockClear();
    queue.flush(5);

    await vi.waitFor(() => {
      expect(config.generateFn).toHaveBeenCalled();
    });

    // After flush, generation should restart from index 5
    const firstCallText = (config.generateFn as any).mock.calls[0][0];
    expect(firstCallText).toContain("Over");

    queue.stop();
  });

  it("uses findChunkEnd to determine chunk boundaries", async () => {
    const findChunkEnd = vi.fn((_words: string[], startIdx: number) => Math.min(startIdx + 3, _words.length));
    const config = makeConfig({ findChunkEnd });
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(0, cbs);

    await vi.waitFor(() => {
      expect(findChunkEnd).toHaveBeenCalled();
    });

    // First chunk should be words 0-2 (3 words)
    const firstCallText = (config.generateFn as any).mock.calls[0][0];
    expect(firstCallText).toBe("The quick brown");

    queue.stop();
  });

  it("uses getVoiceId and getSpeed for generation", async () => {
    const config = makeConfig({
      getVoiceId: () => "am_adam",
      getSpeed: () => 1.5,
    });
    const queue = createAudioQueue(config);
    const cbs = makeCallbacks();

    queue.start(0, cbs);

    await vi.waitFor(() => {
      expect(config.generateFn).toHaveBeenCalled();
    });

    const call = (config.generateFn as any).mock.calls[0];
    expect(call[1]).toBe("am_adam");
    expect(call[2]).toBe(1.5);

    queue.stop();
  });
});

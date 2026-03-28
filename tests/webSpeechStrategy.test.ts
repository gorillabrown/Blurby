// @vitest-environment jsdom
// tests/webSpeechStrategy.test.ts — Tests for Web Speech API TTS strategy
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWebSpeechStrategy } from "../src/hooks/narration/webSpeechStrategy";

let mockUtterances: any[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  mockUtterances = [];

  // Mock SpeechSynthesisUtterance
  (globalThis as any).SpeechSynthesisUtterance = class {
    text: string;
    voice: any = null;
    rate: number = 1;
    pitch: number = 1;
    onboundary: ((e: any) => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
      mockUtterances.push(this);
    }
  };

  // Mock speechSynthesis
  (window as any).speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  };
});

afterEach(() => {
  delete (globalThis as any).SpeechSynthesisUtterance;
  delete (window as any).speechSynthesis;
});

describe("createWebSpeechStrategy", () => {
  const text = "Hello world test";
  const words = ["Hello", "world", "test"];
  const onWordAdvance = vi.fn();
  const onEnd = vi.fn();
  const onError = vi.fn();

  it("speakChunk creates utterance with text", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);

    expect(mockUtterances).toHaveLength(1);
    expect(mockUtterances[0].text).toBe(text);
  });

  it("speakChunk sets voice when available", () => {
    const mockVoice = { name: "Test Voice" } as SpeechSynthesisVoice;
    const strategy = createWebSpeechStrategy(() => mockVoice);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);

    expect(mockUtterances[0].voice).toBe(mockVoice);
  });

  it("speakChunk sets rate to speed", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.speakChunk(text, words, 0, 1.5, onWordAdvance, onEnd, onError);

    expect(mockUtterances[0].rate).toBe(1.5);
  });

  it("speakChunk calls speechSynthesis.speak", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);

    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(mockUtterances[0]);
  });

  it("word boundary events fire onWordAdvance with sequential offsets", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);

    const utterance = mockUtterances[0];
    // Fire 3 word boundary events
    utterance.onboundary({ name: "word" });
    utterance.onboundary({ name: "word" });
    utterance.onboundary({ name: "word" });

    expect(onWordAdvance).toHaveBeenCalledTimes(3);
    expect(onWordAdvance).toHaveBeenNthCalledWith(1, 0);
    expect(onWordAdvance).toHaveBeenNthCalledWith(2, 1);
    expect(onWordAdvance).toHaveBeenNthCalledWith(3, 2);
  });

  it("onend fires onEnd callback", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    mockUtterances[0].onend();

    expect(onEnd).toHaveBeenCalled();
  });

  it("onerror fires onError callback", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    mockUtterances[0].onerror();

    expect(onError).toHaveBeenCalled();
  });

  it("stop calls speechSynthesis.cancel", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.stop();

    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it("pause calls speechSynthesis.pause", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.pause();

    expect(window.speechSynthesis.pause).toHaveBeenCalled();
  });

  it("resume calls speechSynthesis.resume", () => {
    const strategy = createWebSpeechStrategy(() => null);

    strategy.resume();

    expect(window.speechSynthesis.resume).toHaveBeenCalled();
  });
});

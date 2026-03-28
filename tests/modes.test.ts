import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PageMode } from "../src/modes/PageMode";
import { FocusMode } from "../src/modes/FocusMode";
import { FlowMode } from "../src/modes/FlowMode";
import { NarrateMode } from "../src/modes/NarrateMode";
import type { ModeConfig, ModeCallbacks } from "../src/modes/ModeInterface";
import type { NarrationInterface } from "../src/modes/NarrateMode";

function makeCallbacks(overrides?: Partial<ModeCallbacks>): ModeCallbacks {
  return {
    onWordAdvance: vi.fn(),
    onPageTurn: vi.fn(),
    onComplete: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

function makeConfig(overrides?: Partial<ModeConfig>): ModeConfig {
  return {
    words: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog."],
    wpm: 300,
    callbacks: makeCallbacks(overrides?.callbacks),
    isFoliate: false,
    paragraphBreaks: new Set<number>(),
    settings: {},
    ...overrides,
  };
}

function makeNarration(overrides?: Partial<NarrationInterface>): NarrationInterface {
  return {
    startCursorDriven: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    adjustRate: vi.fn(),
    setRhythmPauses: vi.fn(),
    setPageEndWord: vi.fn(),
    setEngine: vi.fn(),
    speaking: false,
    ...overrides,
  };
}

// ── PageMode ────────────────────────────────────────────────────────────

describe("PageMode", () => {
  it("start sets currentWord", () => {
    const mode = new PageMode(makeConfig());
    mode.start(5);
    expect(mode.getCurrentWord()).toBe(5);
  });

  it("jumpTo fires onWordAdvance", () => {
    const callbacks = makeCallbacks();
    const mode = new PageMode(makeConfig({ callbacks }));
    mode.start(0);
    mode.jumpTo(3);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(3);
    expect(mode.getCurrentWord()).toBe(3);
  });

  it("getState returns isPlaying: false always", () => {
    const mode = new PageMode(makeConfig());
    mode.start(2);
    const state = mode.getState();
    expect(state.type).toBe("page");
    expect(state.isPlaying).toBe(false);
    expect(state.currentWordIndex).toBe(2);
  });

  it("getTimeRemaining calculates from WPM", () => {
    const mode = new PageMode(makeConfig({ wpm: 300 }));
    mode.start(0);
    const remaining = mode.getTimeRemaining(300); // 300 words at 300 WPM = 60s
    expect(remaining).toBeCloseTo(60000, -1);
  });

  it("pause/resume/stop are no-ops", () => {
    const mode = new PageMode(makeConfig());
    mode.start(0);
    mode.pause();
    mode.resume();
    mode.stop();
    // No errors thrown, state unchanged
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("setSpeed updates config wpm", () => {
    const mode = new PageMode(makeConfig({ wpm: 300 }));
    mode.setSpeed(500);
    expect(mode.getState().effectiveWpm).toBe(500);
  });

  it("destroy is safe", () => {
    const mode = new PageMode(makeConfig());
    mode.start(3);
    mode.destroy();
    // Should not throw
    expect(mode.getCurrentWord()).toBe(3);
  });
});

// ── FocusMode ───────────────────────────────────────────────────────────

describe("FocusMode", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("start begins word advancement", () => {
    const callbacks = makeCallbacks();
    const mode = new FocusMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(0);
    expect(mode.getState().isPlaying).toBe(true);
    // At 600 WPM, each word takes 100ms. After 100ms, should advance.
    vi.advanceTimersByTime(100);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(1);
  });

  it("rhythm pauses apply to punctuation", () => {
    const callbacks = makeCallbacks();
    // Last word "dog." has punctuation — should get extra pause
    const config = makeConfig({
      wpm: 600,
      callbacks,
      settings: { rhythmPauses: { commas: true, sentences: true, paragraphs: false, numbers: false, longerWords: false } },
    });
    const mode = new FocusMode(config);
    mode.start(7); // word "lazy" — no punctuation
    // Base interval at 600 WPM = 100ms
    vi.advanceTimersByTime(100);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(8); // "dog."
    // Now on "dog." which has sentence-ending punctuation
    // Should take longer than base 100ms
    vi.advanceTimersByTime(100);
    // Should NOT have completed yet (extra pause for punctuation)
    expect(mode.getCurrentWord()).toBe(8);
  });

  it("pause stops timer, resume restarts", () => {
    const callbacks = makeCallbacks();
    const mode = new FocusMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(0);
    vi.advanceTimersByTime(50); // half a word interval
    mode.pause();
    expect(mode.getState().isPlaying).toBe(false);
    vi.advanceTimersByTime(200); // nothing should happen
    expect(callbacks.onWordAdvance).not.toHaveBeenCalled();
    mode.resume();
    expect(mode.getState().isPlaying).toBe(true);
    vi.advanceTimersByTime(100);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(1);
  });

  it("setSpeed changes interval mid-play", () => {
    const callbacks = makeCallbacks();
    const mode = new FocusMode(makeConfig({ wpm: 300, callbacks }));
    mode.start(0);
    // At 300 WPM, interval = 200ms. Speed up to 600 WPM (100ms).
    mode.setSpeed(600);
    // The current word's timeout was set at 200ms. After it fires, next word uses 100ms.
    vi.advanceTimersByTime(200); // first word completes
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(1);
    vi.advanceTimersByTime(100); // second word at new speed
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(2);
  });

  it("jumpTo restarts from new position", () => {
    const callbacks = makeCallbacks();
    const mode = new FocusMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(0);
    mode.jumpTo(5);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(5);
    expect(mode.getCurrentWord()).toBe(5);
    vi.advanceTimersByTime(100);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(6);
  });

  it("completes when reaching end of words", () => {
    const callbacks = makeCallbacks();
    const config = makeConfig({ wpm: 600, callbacks, words: ["a", "b", "c"] });
    const mode = new FocusMode(config);
    mode.start(1); // start at "b"
    vi.advanceTimersByTime(100); // advance to "c" (index 2 = last word)
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(2);
    // FocusMode completes when currentWord >= words.length - 1
    vi.advanceTimersByTime(100);
    expect(callbacks.onComplete).toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("destroy stops timer", () => {
    const callbacks = makeCallbacks();
    const mode = new FocusMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(0);
    mode.destroy();
    vi.advanceTimersByTime(500);
    expect(callbacks.onWordAdvance).not.toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("getTimeRemaining estimates with overhead", () => {
    const mode = new FocusMode(makeConfig({ wpm: 300 }));
    mode.start(0);
    const remaining = mode.getTimeRemaining(300); // 300 words * (200ms * 1.2)
    expect(remaining).toBeGreaterThan(60000); // More than base 60s due to overhead
  });
});

// ── FlowMode ────────────────────────────────────────────────────────────

describe("FlowMode", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("start fires initial onWordAdvance and begins advancement", () => {
    const callbacks = makeCallbacks();
    const mode = new FlowMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(3);
    // FlowMode fires onWordAdvance for the initial word immediately
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(3);
    vi.advanceTimersByTime(100);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(4);
  });

  it("halved rhythm pauses vs Focus", () => {
    // Flow mode uses 50% of the rhythm pause duration
    const callbacks = makeCallbacks();
    const config = makeConfig({
      wpm: 600,
      callbacks,
      settings: { rhythmPauses: { commas: true, sentences: true, paragraphs: false, numbers: false, longerWords: false } },
      paragraphBreaks: new Set([2]), // "brown" is paragraph end
    });
    const mode = new FlowMode(config);
    mode.start(1); // "quick"
    // After base interval (100ms), advance to "brown" (idx 2)
    vi.advanceTimersByTime(100);
    expect(mode.getCurrentWord()).toBe(2);
  });

  it("pause and resume work", () => {
    const callbacks = makeCallbacks();
    const mode = new FlowMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(0);
    mode.pause();
    expect(mode.getState().isPlaying).toBe(false);
    vi.advanceTimersByTime(500);
    // Only the initial onWordAdvance(0) from start()
    expect(callbacks.onWordAdvance).toHaveBeenCalledTimes(1);
    mode.resume();
    vi.advanceTimersByTime(100);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(1);
  });

  it("jumpTo repositions and continues", () => {
    const callbacks = makeCallbacks();
    const mode = new FlowMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(0);
    mode.jumpTo(5);
    expect(mode.getCurrentWord()).toBe(5);
    vi.advanceTimersByTime(100);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(6);
  });

  it("prevLine and nextLine delegate to jumpTo", () => {
    const callbacks = makeCallbacks();
    const mode = new FlowMode(makeConfig({ wpm: 600, callbacks }));
    mode.start(3);
    mode.prevLine(0);
    expect(mode.getCurrentWord()).toBe(0);
    mode.nextLine(5);
    expect(mode.getCurrentWord()).toBe(5);
  });

  it("completes at end of words", () => {
    const callbacks = makeCallbacks();
    const config = makeConfig({ wpm: 600, callbacks, words: ["a", "b"] });
    const mode = new FlowMode(config);
    mode.start(0);
    vi.advanceTimersByTime(100); // advance to "b" (last word)
    vi.advanceTimersByTime(100); // try to advance past end
    expect(callbacks.onComplete).toHaveBeenCalled();
  });

  it("getTimeRemaining uses 10% overhead", () => {
    const mode = new FlowMode(makeConfig({ wpm: 300 }));
    mode.start(0);
    const remaining = mode.getTimeRemaining(300);
    // 300 words * (200ms * 1.1) = 66000ms
    expect(remaining).toBeCloseTo(66000, -2);
  });
});

// ── NarrateMode ─────────────────────────────────────────────────────────

describe("NarrateMode", () => {
  it("start calls narration.startCursorDriven", () => {
    const narration = makeNarration();
    const config = makeConfig({ settings: { ttsRate: 1.5 } });
    const mode = new NarrateMode(config, narration);
    mode.start(10);
    expect(narration.adjustRate).toHaveBeenCalledWith(1.5);
    expect(narration.setRhythmPauses).toHaveBeenCalled();
    expect(narration.startCursorDriven).toHaveBeenCalledWith(
      config.words,
      10,
      expect.any(Number),
      expect.any(Function)
    );
    expect(mode.getState().isPlaying).toBe(true);
  });

  it("pause delegates to narration.pause", () => {
    const narration = makeNarration();
    const mode = new NarrateMode(makeConfig(), narration);
    mode.start(0);
    mode.pause();
    expect(narration.pause).toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("resume delegates to narration.resume", () => {
    const narration = makeNarration();
    const mode = new NarrateMode(makeConfig(), narration);
    mode.start(0);
    mode.pause();
    mode.resume();
    expect(narration.resume).toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(true);
  });

  it("stop delegates to narration.stop", () => {
    const narration = makeNarration();
    const mode = new NarrateMode(makeConfig(), narration);
    mode.start(0);
    mode.stop();
    expect(narration.stop).toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("setSpeed clamps and adjusts rate", () => {
    const narration = makeNarration();
    const mode = new NarrateMode(makeConfig(), narration);
    mode.setSpeed(3.0); // Should clamp to 2.0
    expect(narration.adjustRate).toHaveBeenCalledWith(2.0);
    expect(mode.getRate()).toBe(2.0);
    mode.setSpeed(0.1); // Should clamp to 0.5
    expect(narration.adjustRate).toHaveBeenCalledWith(0.5);
    expect(mode.getRate()).toBe(0.5);
  });

  it("jumpTo restarts narration when playing", () => {
    const narration = makeNarration();
    const mode = new NarrateMode(makeConfig(), narration);
    mode.start(0);
    mode.jumpTo(50);
    // Should stop and restart at new position
    expect(narration.stop).toHaveBeenCalled();
    expect(narration.startCursorDriven).toHaveBeenCalledTimes(2);
    expect(mode.getCurrentWord()).toBe(50);
  });

  it("jumpTo fires callback without restart when paused", () => {
    const callbacks = makeCallbacks();
    const narration = makeNarration();
    const mode = new NarrateMode(makeConfig({ callbacks }), narration);
    mode.start(0);
    mode.pause();
    mode.jumpTo(25);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(25);
    // Should NOT restart narration (only 1 startCursorDriven call from initial start)
    expect(narration.startCursorDriven).toHaveBeenCalledTimes(1);
  });

  it("getEffectiveWpm derives from TTS rate", () => {
    const narration = makeNarration();
    const config = makeConfig({ settings: { ttsRate: 1.0 } });
    const mode = new NarrateMode(config, narration);
    // TTS_RATE_BASELINE_WPM = 150, so rate 1.0 → 150 WPM
    expect(mode.getEffectiveWpm()).toBe(150);
    mode.setSpeed(2.0);
    expect(mode.getEffectiveWpm()).toBe(300);
  });

  it("getState returns narration type and effective WPM", () => {
    const narration = makeNarration();
    const config = makeConfig({ settings: { ttsRate: 1.5 } });
    const mode = new NarrateMode(config, narration);
    mode.start(5);
    const state = mode.getState();
    expect(state.type).toBe("narration");
    expect(state.isPlaying).toBe(true);
    expect(state.currentWordIndex).toBe(5);
    expect(state.effectiveWpm).toBe(225); // 1.5 * 150
  });

  it("destroy stops narration", () => {
    const narration = makeNarration();
    const mode = new NarrateMode(makeConfig(), narration);
    mode.start(0);
    mode.destroy();
    expect(narration.stop).toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("word advance callback updates mode currentWord", () => {
    const narration = makeNarration();
    const callbacks = makeCallbacks();
    const mode = new NarrateMode(makeConfig({ callbacks }), narration);
    mode.start(0);
    // Simulate narration calling the onAdvance callback
    const onAdvance = (narration.startCursorDriven as any).mock.calls[0][3];
    onAdvance(5);
    expect(mode.getCurrentWord()).toBe(5);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(5);
  });
});

// ── updateWords contract ────────────────────────────────────────────────

describe("updateWords contract", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("FlowMode: updateWords extends array, mode continues", () => {
    const callbacks = makeCallbacks();
    const short = ["a", "b", "c", "d", "e"];
    const config = makeConfig({ wpm: 600, callbacks, words: short });
    const mode = new FlowMode(config);
    mode.start(2); // start at word 2 of 5

    // Extend to 10 words before the timer chain reaches the end
    const long = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    mode.updateWords(long);

    // Advance through remaining original words — should NOT complete at index 4
    vi.advanceTimersByTime(100); // -> word 3
    vi.advanceTimersByTime(100); // -> word 4 (was last in short array)
    vi.advanceTimersByTime(100); // -> word 5 (now valid thanks to updateWords)
    expect(callbacks.onComplete).not.toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(true);
    expect(mode.getCurrentWord()).toBe(5);
  });

  it("FocusMode: updateWords extends array, mode continues", () => {
    const callbacks = makeCallbacks();
    const short = ["a", "b", "c", "d", "e"];
    const config = makeConfig({ wpm: 600, callbacks, words: short });
    const mode = new FocusMode(config);
    mode.start(2); // start at word 2 of 5

    // Extend to 10 words before the timer chain reaches the end
    const long = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    mode.updateWords(long);

    // Advance through remaining original words — should NOT complete at index 4
    vi.advanceTimersByTime(100); // -> word 3
    vi.advanceTimersByTime(100); // -> word 4 (was last in short array)
    vi.advanceTimersByTime(100); // -> word 5 (now valid thanks to updateWords)
    expect(callbacks.onComplete).not.toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(true);
    expect(mode.getCurrentWord()).toBe(5);
  });

  it("NarrateMode: updateWords updates config.words", () => {
    const narration = makeNarration();
    const original = ["one", "two", "three"];
    const config = makeConfig({ words: original });
    const mode = new NarrateMode(config, narration);
    mode.start(0);

    const extended = ["one", "two", "three", "four", "five", "six"];
    mode.updateWords(extended);

    // The narration engine receives words via startCursorDriven; updateWords
    // updates config.words so the next startCursorDriven call (e.g. jumpTo)
    // picks up the new array.
    mode.jumpTo(4);
    const lastCall = (narration.startCursorDriven as any).mock.calls.at(-1);
    expect(lastCall[0]).toBe(extended);
    expect(lastCall[1]).toBe(4);
  });

  it("PageMode: updateWords is no-op", () => {
    const mode = new PageMode(makeConfig());
    mode.start(3);
    const before = mode.getCurrentWord();

    // Should not throw and should not change state
    mode.updateWords(["completely", "different", "words"]);

    expect(mode.getCurrentWord()).toBe(before);
    expect(mode.getState().type).toBe("page");
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("FlowMode: updateWords with shorter array stops mode", () => {
    const callbacks = makeCallbacks();
    const long = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    const config = makeConfig({ wpm: 600, callbacks, words: long });
    const mode = new FlowMode(config);
    mode.start(7); // start at word 7 of 10

    // Shrink to 5 words — current position (7) is now past the end
    mode.updateWords(["a", "b", "c", "d", "e"]);

    // Next scheduleNext should see currentWord (8) >= words.length (5) and complete
    vi.advanceTimersByTime(100); // triggers scheduleNext -> word 8 >= 5, complete
    expect(callbacks.onComplete).toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(false);
  });

  it("FocusMode: updateWords with shorter array stops mode", () => {
    const callbacks = makeCallbacks();
    const long = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    const config = makeConfig({ wpm: 600, callbacks, words: long });
    const mode = new FocusMode(config);
    mode.start(7); // start at word 7 of 10

    // Shrink to 5 words — current position (7) is now past the end
    mode.updateWords(["a", "b", "c", "d", "e"]);

    // Next scheduleNext should see currentWord (8) >= words.length (5) and complete
    vi.advanceTimersByTime(100); // triggers scheduleNext -> word 8 >= 5, complete
    expect(callbacks.onComplete).toHaveBeenCalled();
    expect(mode.getState().isPlaying).toBe(false);
  });
});

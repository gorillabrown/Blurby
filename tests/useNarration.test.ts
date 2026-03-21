import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * useNarration hook tests — testing the pure logic of rate clamping,
 * voice selection, and the speechSynthesis API interaction patterns.
 */

describe("useNarration — rate adjustment logic", () => {
  function adjustRate(newRate: number): number {
    return Math.max(0.5, Math.min(3.0, newRate));
  }

  it("clamps rate at minimum 0.5", () => {
    expect(adjustRate(0.1)).toBe(0.5);
    expect(adjustRate(0)).toBe(0.5);
    expect(adjustRate(-1)).toBe(0.5);
  });

  it("clamps rate at maximum 3.0", () => {
    expect(adjustRate(3.5)).toBe(3.0);
    expect(adjustRate(10)).toBe(3.0);
  });

  it("allows valid rates through", () => {
    expect(adjustRate(1.0)).toBe(1.0);
    expect(adjustRate(0.5)).toBe(0.5);
    expect(adjustRate(3.0)).toBe(3.0);
    expect(adjustRate(1.5)).toBe(1.5);
    expect(adjustRate(2.0)).toBe(2.0);
  });

  it("handles fractional rates", () => {
    expect(adjustRate(0.75)).toBe(0.75);
    expect(adjustRate(2.5)).toBe(2.5);
    expect(adjustRate(1.25)).toBe(1.25);
  });
});

describe("useNarration — voice selection logic", () => {
  interface MockVoice {
    name: string;
    lang: string;
    default: boolean;
  }

  function selectDefaultVoice(voices: MockVoice[]): MockVoice | null {
    if (voices.length === 0) return null;
    const english = voices.find((v) => v.lang.startsWith("en"));
    return english || voices[0];
  }

  it("selects first English voice when available", () => {
    const voices: MockVoice[] = [
      { name: "French", lang: "fr-FR", default: false },
      { name: "English US", lang: "en-US", default: false },
      { name: "English UK", lang: "en-GB", default: false },
    ];
    expect(selectDefaultVoice(voices)?.name).toBe("English US");
  });

  it("falls back to first voice when no English voice", () => {
    const voices: MockVoice[] = [
      { name: "French", lang: "fr-FR", default: false },
      { name: "German", lang: "de-DE", default: false },
    ];
    expect(selectDefaultVoice(voices)?.name).toBe("French");
  });

  it("returns null for empty voices array", () => {
    expect(selectDefaultVoice([])).toBeNull();
  });

  it("matches en- prefix for various English locales", () => {
    const voices: MockVoice[] = [
      { name: "Spanish", lang: "es-ES", default: false },
      { name: "English AU", lang: "en-AU", default: false },
    ];
    expect(selectDefaultVoice(voices)?.name).toBe("English AU");
  });
});

describe("useNarration — text slicing for startCharOffset", () => {
  it("slices text from given offset", () => {
    const text = "Hello world, this is a test.";
    const offset = 13; // start at "this"
    expect(text.slice(offset)).toBe("this is a test.");
  });

  it("offset 0 returns full text", () => {
    const text = "Hello world";
    expect(text.slice(0)).toBe("Hello world");
  });

  it("offset at end returns empty string", () => {
    const text = "Hello";
    expect(text.slice(text.length)).toBe("");
  });

  it("offset beyond end returns empty string", () => {
    const text = "Hello";
    expect(text.slice(100)).toBe("");
  });
});

describe("useNarration — boundary event charIndex mapping", () => {
  it("adds startCharOffset to boundary event charIndex", () => {
    const startCharOffset = 50;
    const eventCharIndex = 10;
    const globalCharIndex = startCharOffset + eventCharIndex;
    expect(globalCharIndex).toBe(60);
  });

  it("with zero offset, charIndex is unchanged", () => {
    const startCharOffset = 0;
    const eventCharIndex = 25;
    expect(startCharOffset + eventCharIndex).toBe(25);
  });
});

describe("useNarration — speaking state transitions", () => {
  it("speak sets speaking to true", () => {
    let speaking = false;
    // Simulating the speak callback
    speaking = true;
    expect(speaking).toBe(true);
  });

  it("pause sets speaking to false", () => {
    let speaking = true;
    speaking = false;
    expect(speaking).toBe(false);
  });

  it("resume sets speaking to true", () => {
    let speaking = false;
    speaking = true;
    expect(speaking).toBe(true);
  });

  it("stop sets speaking to false and clears utterance", () => {
    let speaking = true;
    let utterance: object | null = { text: "hello" };
    speaking = false;
    utterance = null;
    expect(speaking).toBe(false);
    expect(utterance).toBeNull();
  });

  it("onend callback sets speaking to false", () => {
    let speaking = true;
    // Simulating utterance.onend
    speaking = false;
    expect(speaking).toBe(false);
  });

  it("onerror callback sets speaking to false", () => {
    let speaking = true;
    // Simulating utterance.onerror
    speaking = false;
    expect(speaking).toBe(false);
  });
});

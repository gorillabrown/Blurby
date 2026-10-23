// @vitest-environment jsdom
// FOCUS-KEYS-FIX-1 (UI-SWEEP-TRIAGE-1 #92–95): Focus's word, sentence and paragraph keys move the
// reading position: the engine's word while it plays or is paused, the start anchor before the first play.
// Real router and runtimes over the fake ports, tokenized document (no foliate), fake timers.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { focusMode } from "../../src/reader/modes/focus/index";
import { FOCUS_MODE_START_DELAY_MS } from "../../src/constants";
import type { ReaderModeCommand } from "../../src/reader/modes/ReaderModeAdapter";

// Sentences end at 5, 11, 20, 30; paragraphs end at 13 and 25 (paragraphBreaks hold each paragraph's last word).
const WORDS = Array.from({ length: 40 }, (_, i) => ([5, 11, 20, 30].includes(i) ? `w${i}.` : `w${i}`));
const WORD_MS = 60_000 / 300; // the fake settings' 300 wpm; no punctuation on the words the tests step over

function open() {
  const fake = createFakeInfrastructure({
    document: createFakeDocument({ useFoliate: false, filepath: null, tokenWords: WORDS, wordCount: WORDS.length, paragraphBreaks: [13, 25], position: 7 }),
  });
  const document = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: { page: pageMode, focus: focusMode },
    broker: createReaderPorts(fake.infra),
    getDocument: () => document,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(document);
  router.hardSelect({ cfi: null, word: "w7", globalWordIndex: 7 });
  router.select("focus");
  return router;
}
type Router = ReturnType<typeof open>;
const word = (r: Router) => r.getActive()!.runtime.getSnapshot().highlightedWordIndex;
const send = (r: Router, command: ReaderModeCommand) => r.command(command);
function play(r: Router) {
  r.togglePlay();
  vi.advanceTimersByTime(FOCUS_MODE_START_DELAY_MS);
}

describe("FOCUS-KEYS-FIX-1: Focus navigation keys", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it("control: playing Focus advances one word per tick from the selected word", () => {
    const r = open();
    play(r);
    expect(word(r)).toBe(7);
    vi.advanceTimersByTime(WORD_MS);
    expect(word(r)).toBe(8);
    r.destroy();
  });

  it("#92 playing: seek moves the engine, and the next tick continues from there", () => {
    const r = open();
    play(r);
    vi.advanceTimersByTime(WORD_MS * 2); // 9
    send(r, { kind: "seek-words", delta: -1 });
    expect(word(r)).toBe(8);
    vi.advanceTimersByTime(WORD_MS);
    expect(word(r)).toBe(9); // not 10: the engine's own cursor moved
    r.destroy();
  });

  it("#92 paused: seek moves the engine's word, and play resumes from it", () => {
    const r = open();
    play(r);
    r.togglePlay(); // pause at 7
    send(r, { kind: "seek-words", delta: 1 });
    expect(word(r)).toBe(8);
    r.togglePlay(); // resume
    vi.advanceTimersByTime(WORD_MS);
    expect(word(r)).toBe(9);
    r.destroy();
  });

  it("#92 before the first play: seek moves the word Focus starts from", () => {
    const r = open();
    send(r, { kind: "seek-words", delta: 1 });
    expect(word(r)).toBe(8);
    play(r);
    expect(word(r)).toBe(8);
    r.destroy();
  });

  it("#93/#94 sentence keys move to the previous and next sentence start", () => {
    const r = open();
    play(r);
    r.togglePlay(); // paused at 7
    send(r, { kind: "sentence", direction: "next" });
    expect(word(r)).toBe(12);
    send(r, { kind: "sentence", direction: "prev" });
    expect(word(r)).toBe(6);
    r.destroy();
  });

  it("#95 paragraph keys move to the previous and next paragraph start", () => {
    const r = open();
    play(r);
    r.togglePlay(); // paused at 7
    send(r, { kind: "paragraph", direction: "next" });
    expect(word(r)).toBe(14);
    send(r, { kind: "paragraph", direction: "next" });
    expect(word(r)).toBe(26);
    send(r, { kind: "paragraph", direction: "prev" });
    expect(word(r)).toBe(14);
    r.destroy();
  });

  it("#93 playing: a sentence key retargets the engine", () => {
    const r = open();
    play(r);
    send(r, { kind: "sentence", direction: "next" });
    expect(word(r)).toBe(12);
    vi.advanceTimersByTime(WORD_MS);
    expect(word(r)).toBe(13);
    r.destroy();
  });
});

// @vitest-environment jsdom
// FLOW-KEYS-FIX-1 (UI-SWEEP-TRIAGE-1 #100–103): Flow's line, sentence and paragraph keys move the reading
// position for both pacers (the word timer and the line pacer), and before a play they move the start word.
// Real router and runtimes over the fake ports, tokenized document, fake timers; the line pacer runs over a
// jsdom container of word spans laid out five to a line. While playing, the line pacer republishes its line's
// first word on its own clock (pre-existing, as after a playing click), so the tests read each pacer's own
// word: the word timer through capture-current, the line pacer through its state.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { flowMode } from "../../src/reader/modes/flow/index";
import type { ReaderModeCommand } from "../../src/reader/modes/ReaderModeAdapter";

// Sentences end at 5, 11, 20, 30; paragraphs end at 13 and 25. Lines hold words 0–4, 5–9, 10–14, …
const WORDS = Array.from({ length: 40 }, (_, i) => ([5, 11, 20, 30].includes(i) ? `w${i}.` : `w${i}`));
const WORD_MS = 60_000 / 300; // the fake settings' 300 wpm; the tests never tick off a punctuated or paragraph-end word
const PER_LINE = 5;
const LINE_PX = 20;

type FlowInternals = {
  startScrollEngine: (c: HTMLElement, cursor: HTMLDivElement, z: (t: number) => void) => void;
  scrollEngine: { getState(): { running: boolean; lineIndex: number; wordIndex: number } } | null;
};

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

function layout(): { container: HTMLElement; cursor: HTMLDivElement } {
  const container = document.createElement("div");
  container.getBoundingClientRect = () => rect(0, 0, 500, 400);
  WORDS.forEach((text, i) => {
    const span = document.createElement("span");
    span.setAttribute("data-word-index", String(i));
    span.textContent = text;
    const line = Math.floor(i / PER_LINE);
    span.getBoundingClientRect = () => rect(line * LINE_PX, (i % PER_LINE) * 60, 50, 16);
    container.appendChild(span);
  });
  const cursor = document.createElement("div");
  container.appendChild(cursor);
  document.body.appendChild(container);
  return { container, cursor };
}

function open() {
  const fake = createFakeInfrastructure({
    document: createFakeDocument({ useFoliate: false, filepath: null, tokenWords: WORDS, wordCount: WORDS.length, paragraphBreaks: [13, 25], position: 7 }),
  });
  const doc = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: { page: pageMode, flow: flowMode },
    broker: createReaderPorts(fake.infra),
    getDocument: () => doc,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(doc);
  router.hardSelect({ cfi: null, word: "w7", globalWordIndex: 7 });
  router.select("flow");
  return router;
}
type Router = ReturnType<typeof open>;
const runtime = (r: Router) => r.getActive()!.runtime as unknown as FlowInternals;
/** The published (highlighted) word. */
const word = (r: Router) => r.getActive()!.runtime.getSnapshot().highlightedWordIndex;
/** The word timer's own word. */
const timerWord = (r: Router) => r.getActive()!.runtime.exportHandoff("capture-current").highlightedWordIndex;
/** The line pacer's own word. */
const lineWord = (r: Router) => runtime(r).scrollEngine!.getState().wordIndex;
const send = (r: Router, command: ReaderModeCommand) => r.command(command);
/** Play, then start the line pacer the way useModeBindings does once the view is ready. */
function play(r: Router) {
  r.togglePlay();
  const { container, cursor } = layout();
  runtime(r).startScrollEngine(container, cursor, () => {});
  expect(runtime(r).scrollEngine!.getState().running).toBe(true);
}

describe("FLOW-KEYS-FIX-1: Flow navigation keys", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); document.body.innerHTML = ""; });

  it("control: playing Flow's word timer advances one word per tick from the selected word", () => {
    const r = open();
    play(r);
    expect(timerWord(r)).toBe(7);
    vi.advanceTimersByTime(WORD_MS);
    expect(timerWord(r)).toBe(8);
    r.destroy();
  });

  it("#100 playing: ArrowDown moves both pacers to the next line, and the word timer continues from there", () => {
    const r = open();
    play(r);
    send(r, { kind: "flow-line", direction: "next" });
    expect(word(r)).toBe(10);
    expect(lineWord(r)).toBe(10);
    expect(timerWord(r)).toBe(10);
    vi.advanceTimersByTime(WORD_MS);
    expect(timerWord(r)).toBe(11); // not 8: the word timer moved with the line
    r.destroy();
  });

  it("#100 playing: ArrowUp moves both pacers to the previous line", () => {
    const r = open();
    play(r);
    send(r, { kind: "flow-line", direction: "prev" });
    expect(word(r)).toBe(0);
    expect(lineWord(r)).toBe(0);
    expect(timerWord(r)).toBe(0);
    vi.advanceTimersByTime(WORD_MS);
    expect(timerWord(r)).toBe(1);
    r.destroy();
  });

  it("#101/#102 playing: sentence keys move both pacers", () => {
    const r = open();
    play(r);
    send(r, { kind: "sentence", direction: "next" });
    expect(word(r)).toBe(12);
    expect(lineWord(r)).toBe(12);
    expect(timerWord(r)).toBe(12);
    vi.advanceTimersByTime(WORD_MS);
    expect(timerWord(r)).toBe(13);
    send(r, { kind: "sentence", direction: "prev" });
    expect(timerWord(r)).toBe(12);
    expect(lineWord(r)).toBe(12);
    r.destroy();
  });

  it("#103 playing: paragraph keys move both pacers", () => {
    const r = open();
    play(r);
    send(r, { kind: "paragraph", direction: "next" });
    expect(word(r)).toBe(14);
    expect(lineWord(r)).toBe(14);
    expect(timerWord(r)).toBe(14);
    vi.advanceTimersByTime(WORD_MS);
    expect(timerWord(r)).toBe(15);
    send(r, { kind: "paragraph", direction: "prev" });
    expect(timerWord(r)).toBe(14);
    expect(lineWord(r)).toBe(14);
    r.destroy();
  });

  it("Hotkey Map (Flow) playing: Ctrl+Left/Right seek one word for both pacers", () => {
    const r = open();
    play(r);
    send(r, { kind: "seek-words", delta: 1 });
    expect(word(r)).toBe(8);
    expect(lineWord(r)).toBe(8);
    expect(timerWord(r)).toBe(8);
    vi.advanceTimersByTime(WORD_MS);
    expect(timerWord(r)).toBe(9);
    send(r, { kind: "seek-words", delta: -1 });
    expect(timerWord(r)).toBe(8);
    expect(lineWord(r)).toBe(8);
    r.destroy();
  });

  it("Hotkey Map (Flow) paused: Ctrl+Right moves the word, and play starts from it", () => {
    const r = open();
    play(r);
    r.togglePlay(); // pause at 7
    send(r, { kind: "seek-words", delta: 1 });
    expect(word(r)).toBe(8);
    r.togglePlay();
    expect(timerWord(r)).toBe(8);
    r.destroy();
  });

  it("#101–#103 paused: sentence and paragraph keys move the word, and play starts from it", () => {
    const r = open();
    play(r);
    r.togglePlay(); // pause at 7 (the line pacer stops with it)
    send(r, { kind: "sentence", direction: "next" });
    expect(word(r)).toBe(12);
    send(r, { kind: "paragraph", direction: "next" });
    expect(word(r)).toBe(14);
    r.togglePlay(); // Flow's play is a cold restart from the start anchor
    expect(timerWord(r)).toBe(14);
    vi.advanceTimersByTime(WORD_MS);
    expect(timerWord(r)).toBe(15);
    r.destroy();
  });

  it("#101–#103 before the first play: sentence and paragraph keys move the start word", () => {
    const r = open();
    send(r, { kind: "paragraph", direction: "prev" });
    expect(word(r)).toBe(0);
    send(r, { kind: "sentence", direction: "next" });
    expect(word(r)).toBe(6);
    r.togglePlay();
    expect(timerWord(r)).toBe(6);
    r.destroy();
  });
});

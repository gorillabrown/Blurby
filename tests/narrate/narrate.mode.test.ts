// @vitest-environment jsdom
// NARRATE-REBUILD-1 P4 — the Narrate mode over the P3 engine, through the real broker with fake infrastructure,
// the P3 FakeProducer (lawful tables, D4 controls) and the hand-advanced FakeAudioOutput. Covers the charter's
// two notices (F5 voice loading, F4 "couldn't be timed"), the cursor as the table lookup at the playback sample,
// the rate grid (R7 at the runtime seam) and the view rendering both notices for a non-EPUB document.
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff, type ReaderDocumentSnapshot } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createNarrateRuntime, NarrateModeView } from "../../src/reader/modes/narrate/index";
import type { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";
import { createFakeDocument, createFakeInfrastructure } from "../readerModes/harness/fakePorts";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer, SPF } from "./harness/fakeProducer";

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
/** Engine default lead (narrateEngine leadSeconds) plus one fake-table lead (2 frames) and a little. */
const INTO_FIRST_WORD_S = 0.03 + (2 * SPF) / 24000 + 0.01;
const WORD_S = (8 * SPF) / 24000; // FakeProducer default: 8 frames per word at speed 1.0

function open(options: { producer?: FakeProducer; output?: FakeAudioOutput; document?: Partial<ReaderDocumentSnapshot> } = {}) {
  const producer = options.producer ?? new FakeProducer();
  const output = options.output ?? new FakeAudioOutput();
  // NARRATE-SENTENCE-RESUME-1: the fixture words have no sentence ends, so a start rewinds to its paragraph's first
  // word; the break after w6 keeps w7, where these tests start, a paragraph (and so a sentence) start.
  const fake = createFakeInfrastructure({ document: createFakeDocument({ position: 7, paragraphBreaks: [6, 8, 17], ...options.document }) });
  const broker = createReaderPorts(fake.infra);
  const document = fake.infra.document.snapshot();
  broker.openDocument(document.documentId);
  const { key, ports } = broker.issue("narrate");
  const runtime = createNarrateRuntime(
    { key, ports, document, settings: fake.infra.settings.read(), handoff: createInitialHandoff(document, document.wordCount), arrival: "silent" },
    { producer, createOutput: () => output },
  ) as NarrateModeRuntime;
  return { fake, runtime, producer, output };
}

const settingsWrites = (fake: ReturnType<typeof createFakeInfrastructure>) =>
  fake.effects.filter((c) => c.method === "settings.update").map((c) => c.args[0] as Record<string, unknown>);

describe("narrate mode (P4)", () => {
  const opened: NarrateModeRuntime[] = [];
  afterEach(() => { for (const r of opened.splice(0)) r.destroy(); });

  it("F5: start shows the voice-loading notice until the first word is timed; then the cursor is the table lookup at the playback sample", async () => {
    const { fake, runtime, producer, output } = open();
    opened.push(runtime);
    runtime.select(7);
    runtime.start({ cause: "play-button" });
    expect(runtime.getNotice()).toEqual({ kind: "loading", text: "Voice loading…" });
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, clockOwner: "audio-truth", narrating: true, currentWordIndex: 7, speed: { kind: "rate", rate: 1 } });
    expect(runtime.getNarrationWordIndex()).toBe(7); // the start word is highlighted while the voice loads
    expect(settingsWrites(fake)).toContainEqual({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: true });

    await flush(); // the producer answered and the engine scheduled the first chunk at now + lead
    expect(producer.requests.length).toBeGreaterThan(0);
    expect(producer.requests[0].text.startsWith("w7 ")).toBe(true);
    runtime.tick();
    expect(runtime.getNotice()?.kind).toBe("loading"); // nothing has sounded yet

    output.advance(INTO_FIRST_WORD_S);
    runtime.tick();
    expect(runtime.getNotice()).toBeNull();
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 7, currentWordIndex: 7, canonicalWordIndex: 7 });

    output.advance(WORD_S);
    runtime.tick();
    expect(runtime.getSnapshot()).toMatchObject({ highlightedWordIndex: 8, currentWordIndex: 8 });
    expect(runtime.getNarrationWordIndex()).toBe(8);

    runtime.pause();
    expect(runtime.getSnapshot()).toMatchObject({ playing: false, clockOwner: "none", narrating: true, highlightedWordIndex: 8 });
    expect(runtime.getNarrationWordIndex()).toBeUndefined();
  });

  it("F4: a refused chunk shows the timing-missing notice, narration pauses on the last timed word, and Play restarts it", async () => {
    const { runtime, producer, output } = open();
    opened.push(runtime);
    producer.nextControl("missing-table");
    runtime.select(7);
    runtime.start({ cause: "play-button" });
    expect(runtime.getNotice()?.kind).toBe("loading");

    await flush();
    expect(runtime.getNotice()).toEqual({ kind: "timing-missing", text: "This passage couldn't be timed. Narration paused on the last timed word." });
    expect(runtime.getSnapshot()).toMatchObject({ playing: false, clockOwner: "none", highlightedWordIndex: 7 });
    expect(runtime.getNarrationWordIndex()).toBeUndefined();
    expect(output.sources).toEqual([]); // nothing was ever scheduled from an untimed chunk

    // Play again: the failure clears, a lawful table arrives and the cursor is timed from the start word.
    runtime.togglePlay();
    expect(runtime.getNotice()?.kind).toBe("loading");
    await flush();
    output.advance(INTO_FIRST_WORD_S);
    runtime.tick();
    expect(runtime.getNotice()).toBeNull();
    expect(runtime.getSnapshot()).toMatchObject({ playing: true, highlightedWordIndex: 7 });
  });

  it("an F4 pause mid-session shows F4's notice, not Voice loading", async () => {
    // S5's D2 trial read "Voice loading…" after the word-3217 refusal because the driver pressed Play first; the notice
    // itself must be F4's while narration is paused on the refusal.
    // The engine prefetches the next chunk at once, so the producer holds its answers until the first word sounds.
    const { runtime, producer, output } = open({ producer: new FakeProducer({ hold: true }) });
    opened.push(runtime);
    producer.nextControl("ok"); // the first chunk is lawful and plays
    producer.nextControl("missing-table"); // the next one fails closed (F4) after words have been spoken
    runtime.select(7);
    runtime.start({ cause: "play-button" });
    producer.requests[0].release();
    await flush();
    output.advance(INTO_FIRST_WORD_S);
    runtime.tick();
    expect(runtime.getNotice()).toBeNull();
    producer.setHold(false);
    for (const r of producer.requests) r.release();
    await flush();
    for (let i = 0; i < 200 && runtime.getSnapshot().playing; i++) { output.advance(WORD_S); runtime.tick(); await flush(); }
    expect(runtime.getSnapshot().playing).toBe(false);
    expect(runtime.getSnapshot().highlightedWordIndex).toBeGreaterThan(7); // mid-session: words were spoken first
    expect(runtime.getNotice()).toEqual({ kind: "timing-missing", text: "This passage couldn't be timed. Narration paused on the last timed word." });
  });

  it("speed: the rate lives on the 0.05 grid inside 0.80–2.00, is written to settings, and WPM speeds are ignored", () => {
    const { fake, runtime } = open();
    opened.push(runtime);
    runtime.select(7);
    runtime.setSpeed({ kind: "rate", rate: 1.5 });
    expect(runtime.getSnapshot().speed).toEqual({ kind: "rate", rate: 1.5 });
    expect(settingsWrites(fake)).toContainEqual({ ttsRate: 1.5 });
    runtime.adjustSpeed(1);
    expect(runtime.getSnapshot().speed).toEqual({ kind: "rate", rate: 1.55 });
    runtime.adjustSpeed(-1);
    expect(runtime.getSnapshot().speed).toEqual({ kind: "rate", rate: 1.5 });
    runtime.setSpeed({ kind: "rate", rate: 1.234 });
    expect(runtime.getSnapshot().speed).toEqual({ kind: "rate", rate: 1.25 });
    runtime.setSpeed({ kind: "rate", rate: 3 });
    expect(runtime.getSnapshot().speed).toEqual({ kind: "rate", rate: 2 });
    runtime.setSpeed({ kind: "rate", rate: 0.1 });
    expect(runtime.getSnapshot().speed).toEqual({ kind: "rate", rate: 0.8 });
    runtime.setSpeed({ kind: "wpm", wpm: 300 });
    expect(runtime.getSnapshot().speed).toEqual({ kind: "rate", rate: 0.8 });
  });

  it("D3: the engine's recorded output reaches the diagnostics port (the eval-trace sink), never the window", async () => {
    const { fake, runtime, output } = open();
    opened.push(runtime);
    runtime.select(7);
    runtime.start({ cause: "play-button" });
    await flush();
    output.advance(INTO_FIRST_WORD_S);
    runtime.tick();
    const traced = fake.diagnostics.filter((c) => c.method === "diagnostics.trace").map((c) => c.args[0] as Record<string, unknown>);
    expect(traced.map((e) => e.kind)).toEqual(expect.arrayContaining(["narrate-request", "narrate-schedule", "narrate-first-voiced", "narrate-commit", "word"]));
    expect(traced.find((e) => e.kind === "narrate-request")).toMatchObject({ cause: "play", word: 7, speed: 1 });
    expect(traced.find((e) => e.kind === "narrate-first-voiced")).toMatchObject({ cause: "play", word: 7, latencyS: 0.03 });
    expect(traced.find((e) => e.kind === "narrate-commit")).toMatchObject({ word: 7, speed: 1, unit: 0 });
    expect(traced.find((e) => e.kind === "word")).toMatchObject({ source: "audio", wordIndex: 7 });
  });

  it("the generated speed is the selected rate: a chunk requested after a change carries it", async () => {
    const { runtime, producer } = open();
    opened.push(runtime);
    runtime.select(7);
    runtime.setSpeed({ kind: "rate", rate: 1.5 });
    runtime.start({ cause: "play-button" });
    await flush();
    expect(producer.requests[0].speed).toBe(1.5);
    expect(producer.requests[0].voice).toBe("af_bella");
  });

  describe("view", () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEachRender();

    function beforeEachRender() {
      // eslint-disable-next-line vitest/no-hooks
      afterEach(async () => {
        await act(async () => { root?.unmount(); });
        container?.remove();
      });
    }

    async function mount(runtime: NarrateModeRuntime) {
      container = document.createElement("div");
      document.body.appendChild(container);
      root = createRoot(container);
      await act(async () => { root.render(React.createElement(NarrateModeView, { runtime })); });
    }

    it("renders the loading notice while the first word is on its way and the timing-missing notice after a refusal (non-EPUB document)", async () => {
      const { runtime, producer, output } = open({ document: { useFoliate: false, filepath: "/fixture.txt" } });
      opened.push(runtime);
      await mount(runtime);
      expect(container.querySelector(".rm-narrate-root")).not.toBeNull();
      expect(container.querySelector(".rm-narrate-notice")).toBeNull();

      await act(async () => { runtime.select(7); runtime.start({ cause: "play-button" }); });
      const loading = container.querySelector(".rm-narrate-notice--loading");
      expect(loading?.textContent).toBe("Voice loading…");
      expect(loading?.getAttribute("role")).toBe("status");

      await act(async () => { await flush(); output.advance(INTO_FIRST_WORD_S); runtime.tick(); });
      expect(container.querySelector(".rm-narrate-notice")).toBeNull();

      // F2: a click while playing restarts speech at the clicked word. That chunk is refused: the notice names
      // it and the mode pauses (nothing untimed is ever scheduled).
      producer.nextControl("missing-table");
      await act(async () => { runtime.hardSelect({ cfi: null, word: "w20", globalWordIndex: 20 }); await flush(); });
      expect(producer.requests.at(-1)?.text.startsWith("w20")).toBe(true);
      expect(container.querySelector(".rm-narrate-notice--timing-missing")?.textContent).toContain("couldn't be timed");
      expect(runtime.getSnapshot()).toMatchObject({ playing: false, clockOwner: "none", highlightedWordIndex: 20 });
    });
  });
});

// NARRATE-SENTENCE-RESUME-1 — Play, Space and a reopened book start at the first word of the sentence the saved word is
// in; a word click and a navigation keep their own word. "w4." ends a sentence, so w5 begins the one holding w7.
describe("narrate mode: sentence start (NARRATE-SENTENCE-RESUME-1)", () => {
  const opened: NarrateModeRuntime[] = [];
  afterEach(() => { for (const r of opened.splice(0)) r.destroy(); });
  const tokenWords = Array.from({ length: 25 }, (_, i) => (i === 4 ? "w4." : `w${i}`));
  const document = { tokenWords, paragraphBreaks: [8, 17] };

  it("sentence start (s4): start from a mid-sentence saved word begins at the sentence's first word; it is highlighted and saved", async () => {
    const { runtime, producer, output } = open({ document });
    opened.push(runtime);
    runtime.select(7);
    runtime.start({ cause: "play-button" });
    expect(runtime.getNarrationWordIndex()).toBe(5);
    await flush();
    expect(producer.requests[0].text.startsWith("w5 ")).toBe(true);
    output.advance(INTO_FIRST_WORD_S);
    runtime.tick();
    expect(runtime.getSnapshot()).toMatchObject({ highlightedWordIndex: 5, currentWordIndex: 5, canonicalWordIndex: 5 });
    expect(tokenWords[runtime.getSnapshot().highlightedWordIndex]).toBe("w5");
  });

  it("sentence start (s5): a word click and a jump keep their own word", async () => {
    const { runtime, producer } = open({ document });
    opened.push(runtime);
    runtime.select(7);
    runtime.hardSelect({ cfi: null, word: "w7", globalWordIndex: 7 }); // clicked before Play: Play starts there
    runtime.start({ cause: "play-button" });
    await flush();
    expect(producer.requests[0].text.startsWith("w7 ")).toBe(true);
    expect(tokenWords[7]).toBe("w7");
    let n = producer.requests.length;
    runtime.jumpToWord(6, "navigate" as never); // while playing: the engine restarts at the jumped word
    await flush();
    expect(producer.requests[n].text.startsWith("w6 ")).toBe(true); // the request (a prefetch follows it)
    n = producer.requests.length;
    runtime.hardSelect({ cfi: null, word: "w7", globalWordIndex: 7 }); // a click while playing
    await flush();
    expect(producer.requests[n].text.startsWith("w7 ")).toBe(true);
  });
});

// @vitest-environment jsdom
// NARRATE-REBUILD-1 P5 (BUG-191 diagnosis): every runtime caller that can change the displayed section emits a
// `narrate-section-nav` trace event BEFORE it acts, through the diagnostics port (the eval-trace sink route).
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createNarrateRuntime } from "../../src/reader/modes/narrate/index";
import type { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";
import type { NarrateFoliateViewAPI } from "../../src/reader/modes/narrate/FoliateView";
import { createFakeDocument, createFakeInfrastructure } from "../readerModes/harness/fakePorts";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";
import { FakeProducer } from "./harness/fakeProducer";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function open(withSink: boolean) {
  const fake = createFakeInfrastructure({ document: createFakeDocument({ position: 7 }) });
  const log: string[] = [];
  const events: Array<Record<string, unknown>> = [];
  // Without the eval-trace sink the port's trace is a no-op (ReaderContainer gates it on evalTraceSink.enabled).
  fake.infra.diagnostics.trace = (e) => { if (withSink) { events.push(e as Record<string, unknown>); log.push(`trace:${(e as { kind: string }).kind}`); } };
  const broker = createReaderPorts(fake.infra);
  const document = fake.infra.document.snapshot();
  broker.openDocument(document.documentId);
  const { key, ports } = broker.issue("narrate");
  const runtime = createNarrateRuntime(
    { key, ports, document, settings: fake.infra.settings.read(), handoff: createInitialHandoff(document, document.wordCount), arrival: "silent" },
    { producer: new FakeProducer(), createOutput: () => new FakeAudioOutput() },
  ) as NarrateModeRuntime;
  const api = {
    highlightWordByIndex: vi.fn(() => false),
    next: vi.fn(() => { log.push("next"); }),
    getWords: vi.fn(() => [{ word: "w7", sectionIndex: 2 }]),
    getSectionForWordIndex: vi.fn(() => 2),
  } as unknown as NarrateFoliateViewAPI;
  runtime.viewApiRef.current = api;
  return { runtime, api, log, events };
}
const nav = (events: Array<Record<string, unknown>>) => events.filter((e) => e.kind === "narrate-section-nav");

describe("narrate-section-nav (P5 diagnostic)", () => {
  const opened: NarrateModeRuntime[] = [];
  afterEach(() => { for (const r of opened.splice(0)) r.destroy(); });

  it("cursor-miss: a highlight miss on the cursor word emits the event before surface.next()", () => {
    const { runtime, api, log, events } = open(true);
    opened.push(runtime);
    (runtime as unknown as { onEngineCursor(w: number): void }).onEngineCursor(7);
    expect(api.next).toHaveBeenCalledTimes(1);
    expect(nav(events)).toEqual([expect.objectContaining({ kind: "narrate-section-nav", caller: "cursor-miss", word: 7, t: expect.any(Number) })]);
    expect(log.indexOf("trace:narrate-section-nav")).toBeLessThan(log.indexOf("next"));
  });

  it("pending-resume: the retry after a words re-extraction emits the event before surface.next()", async () => {
    const { runtime, api, log, events } = open(true);
    opened.push(runtime);
    (runtime as unknown as { onEngineCursor(w: number): void }).onEngineCursor(7);
    runtime.onWordsReextracted();
    await wait(60);
    expect(api.next).toHaveBeenCalledTimes(2);
    expect(nav(events).map((e) => e.caller)).toEqual(["cursor-miss", "pending-resume"]);
    expect(nav(events)[1]).toMatchObject({ word: 7 });
    expect(log.lastIndexOf("trace:narrate-section-nav")).toBeLessThan(log.lastIndexOf("next"));
  });

  it("no sink: the same actions still call surface.next() exactly as before and emit nothing", async () => {
    const { runtime, api, events } = open(false);
    opened.push(runtime);
    (runtime as unknown as { onEngineCursor(w: number): void }).onEngineCursor(7);
    runtime.onWordsReextracted();
    await wait(60);
    expect(api.next).toHaveBeenCalledTimes(2);
    expect(events).toEqual([]);
  });
});

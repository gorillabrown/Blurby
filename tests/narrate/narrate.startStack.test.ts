// @vitest-environment jsdom
// NARRATE-START-STACK-1 (BUG-206): when Narrate shows a start error, error.log gets the error's full stack, once.
// On the base the F4 path recorded only `error.message`, so a renderer error like BUG-206's `setEnd` left no call site.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createNarrateRuntime } from "../../src/reader/modes/narrate/index";
import type { NarrateModeRuntime } from "../../src/reader/modes/narrate/ModeRuntime";
import type { ProducerPort } from "../../src/reader/modes/narrate/engine/narrateEngine";
import { createFakeDocument, createFakeInfrastructure } from "../readerModes/harness/fakePorts";
import { FakeAudioOutput } from "./harness/fakeAudioOutput";

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function failingProducer(): ProducerPort {
  return {
    async generate() {
      const err = new Error("Failed to execute 'setEnd' on 'Range': The offset 5 is larger than the node's length (4).");
      err.stack = "S";
      throw err;
    },
  };
}

describe("NARRATE-START-STACK-1 — a Narrate start error logs its full stack", () => {
  const opened: NarrateModeRuntime[] = [];
  const logError = vi.fn();
  afterEach(() => {
    for (const r of opened.splice(0)) r.destroy();
    logError.mockReset();
    delete (window as { electronAPI?: unknown }).electronAPI;
  });

  it("a start that fails with an Error whose stack is \"S\" sends a message containing \"S\" to logError, once", async () => {
    (window as { electronAPI?: unknown }).electronAPI = { logError };
    const fake = createFakeInfrastructure({ document: createFakeDocument({ position: 7 }) });
    const broker = createReaderPorts(fake.infra);
    const document = fake.infra.document.snapshot();
    broker.openDocument(document.documentId);
    const { key, ports } = broker.issue("narrate");
    const output = new FakeAudioOutput();
    const runtime = createNarrateRuntime(
      { key, ports, document, settings: fake.infra.settings.read(), handoff: createInitialHandoff(document, document.wordCount), arrival: "silent" },
      { producer: failingProducer(), createOutput: () => output },
    ) as NarrateModeRuntime;
    opened.push(runtime);

    runtime.select(7);
    runtime.start({ cause: "play-button" });
    await flush();

    expect(runtime.getNotice()?.kind).toBe("timing-missing"); // the reader sees the start error (F4's notice)
    // The stack itself, not the message: the logged text ends with the stack "S".
    expect(logError.mock.calls.some(([message]) => String(message).endsWith(": S"))).toBe(true);
    expect(logError.mock.calls.filter(([message]) => String(message).startsWith("[narrate]"))).toHaveLength(1);
  });

  it("the helper falls back to String(err) when there is no stack, and never throws without a preload", async () => {
    // A variable path, so the first test still runs (and fails by assertion) on a base without the helper.
    const helperPath = "../../src/reader/modes/narrate/helpers/logStartError";
    const { logNarrateStartError } = await import(/* @vite-ignore */ helperPath);
    (window as { electronAPI?: unknown }).electronAPI = { logError };
    logNarrateStartError("view load failed", "plain");
    expect(logError).toHaveBeenCalledWith("[narrate] view load failed: plain");
    delete (window as { electronAPI?: unknown }).electronAPI;
    expect(() => logNarrateStartError("view load failed", new Error("x"))).not.toThrow();
  });
});

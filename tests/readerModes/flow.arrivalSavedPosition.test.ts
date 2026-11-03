// @vitest-environment jsdom
// NARRATE-ARRIVAL-SYNC-1 (Brain1 ruling 2026-11-03): the sp1 equivalent for Flow. Arriving from Page at a saved word
// with the cover still shown, then pressing Play, must start in the saved word's section, not at the first text.
// A regression row; if RED, Blurby.Brain1 rules on Flow's own fix (mode isolation).
import { afterEach, describe, expect, it, vi } from "vitest";

import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff, createReaderModeHandoff, type ReaderSessionKey } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createFlowRuntime } from "../../src/reader/modes/flow/index";
import type { FlowModeRuntime } from "../../src/reader/modes/flow/ModeRuntime";
import type { FlowFoliateViewAPI } from "../../src/reader/modes/flow/FoliateView";
import { createFakeInfrastructure } from "./harness/fakePorts";
import { BOOK, RANGE, createZeroWordView, settle, zeroWordDocument } from "./harness/zeroWordBook";

const SAVED = 12;

describe("Flow: arriving from Page at a saved word, Play starts there (NARRATE-ARRIVAL-SYNC-1 sp1 equivalent)", () => {
  const opened: FlowModeRuntime[] = [];
  afterEach(() => { for (const r of opened.splice(0)) r.destroy(); vi.useRealTimers(); });

  // Expected-fail until Blurby.Brain1 ruling (a) of 2026-11-03 (packaged probe decides fix vs. fixture correction); the final tip carries no it.fails here.
  it.fails("(fl-sp1) from Page at 12 with the cover shown: Play starts in section 3, not at MEDITATIONS", async () => {
    vi.useFakeTimers({ now: 0 });
    const fake = createFakeInfrastructure({ document: zeroWordDocument(SAVED, BOOK) });
    const broker = createReaderPorts(fake.infra);
    const document = fake.infra.document.snapshot();
    broker.openDocument(document.documentId);
    const { key, ports } = broker.issue("flow");
    const initial = createInitialHandoff(document, document.wordCount);
    const handoff = createReaderModeHandoff({ ...initial, source: { ...key, mode: "page" } as unknown as ReaderSessionKey });
    const runtime = createFlowRuntime({ key, ports, document, settings: fake.infra.settings.read(), handoff, arrival: "select" }) as FlowModeRuntime;
    opened.push(runtime);
    const { api } = createZeroWordView(0);
    runtime.viewApiRef.current = api as unknown as FlowFoliateViewAPI;
    runtime.select(SAVED);
    await vi.advanceTimersByTimeAsync(100);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(0);
    await settle();
    const started = runtime.getSnapshot().highlightedWordIndex;
    expect({ started, word: BOOK.words[started], playing: runtime.getSnapshot().playing }).toMatchObject({ playing: true });
    expect(started >= RANGE[3][0] && started < RANGE[3][1]).toBe(true);
    expect(api.goToSection).not.toHaveBeenCalledWith(1);
  });
});

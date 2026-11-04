// @vitest-environment jsdom
// NARRATE-ARRIVAL-SYNC-1 (Brain1 ruling 2026-11-03): the sp1 equivalent for Focus. Arriving from Page at a saved word
// with the view at that word's section, then pressing Play, must start in the saved word's section, not at the first text.
// A regression row; if RED, Blurby.Brain1 rules on Focus's own fix (mode isolation).
import { afterEach, describe, expect, it, vi } from "vitest";
import { FOCUS_MODE_START_DELAY_MS } from "../../src/constants";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createInitialHandoff, createReaderModeHandoff, type ReaderSessionKey } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createFocusRuntime } from "../../src/reader/modes/focus/index";
import type { FocusModeRuntime } from "../../src/reader/modes/focus/ModeRuntime";
import type { FocusFoliateViewAPI } from "../../src/reader/modes/focus/FoliateView";
import { createFakeInfrastructure } from "./harness/fakePorts";
import { BOOK, RANGE, createZeroWordView, settle, zeroWordDocument } from "./harness/zeroWordBook";

const SAVED = 12;

describe("Focus: arriving from Page at a saved word, Play starts there (NARRATE-ARRIVAL-SYNC-1 sp1 equivalent)", () => {
  const opened: FocusModeRuntime[] = [];
  afterEach(() => { for (const r of opened.splice(0)) r.destroy(); vi.useRealTimers(); });

  it("(fo-sp1) from Page at 12 the view opens at the saved section: Play starts in section 3, not at MEDITATIONS", async () => {
    vi.useFakeTimers({ now: 0 });
    const fake = createFakeInfrastructure({ document: zeroWordDocument(SAVED, BOOK) });
    const broker = createReaderPorts(fake.infra);
    const document = fake.infra.document.snapshot();
    broker.openDocument(document.documentId);
    const { key, ports } = broker.issue("focus");
    const initial = createInitialHandoff(document, document.wordCount);
    const handoff = createReaderModeHandoff({ ...initial, source: { ...key, mode: "page" } as unknown as ReaderSessionKey });
    const runtime = createFocusRuntime({ key, ports, document, settings: fake.infra.settings.read(), handoff, arrival: "select" }) as FocusModeRuntime;
    opened.push(runtime);
    // The real view opens at the saved place (src/reader/modes/focus/FoliateView.tsx:992-1003: init at initialCfi, else goToFraction(position /
    // wordCount)), so it shows section 3 on arrival, not the cover (Blurby.Brain1 ruling (i), 2026-11-03; packaged probe).
    const { api } = createZeroWordView(3);
    runtime.viewApiRef.current = api as unknown as FocusFoliateViewAPI;
    runtime.select(SAVED);
    await vi.advanceTimersByTimeAsync(100);
    runtime.togglePlay();
    await settle();
    await vi.advanceTimersByTimeAsync(FOCUS_MODE_START_DELAY_MS);
    await settle();
    const started = runtime.getSnapshot().highlightedWordIndex;
    expect({ started, word: BOOK.words[started], playing: runtime.getSnapshot().playing }).toMatchObject({ playing: true });
    expect(started >= RANGE[3][0] && started < RANGE[3][1]).toBe(true);
    expect(api.goToSection).not.toHaveBeenCalledWith(1);
  });
});

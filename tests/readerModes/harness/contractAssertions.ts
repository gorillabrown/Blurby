// READER-MODE-SEPARATION-2 G2 — shared runtime-contract assertions (design §D.3).
// Each contract file imports its mode only through src/reader/modes/<mode>/index.ts after vi.resetModules(),
// then calls these against the real module. The fake infrastructure sits behind the real broker; a counting
// wrapper sees every port call the runtime makes (reads included).
import { expect, vi } from "vitest";
import { createReaderPorts } from "../../../src/reader/ports/createReaderPorts";
import type { ReaderPortInfrastructure } from "../../../src/reader/ports/createReaderPorts";
import {
  createInitialHandoff,
  type ReaderModeHandoff,
  type ReaderSettingsSnapshot,
} from "../../../src/reader/document/ReaderDocumentSnapshot";
import type {
  ReaderModeModule,
  ReaderModeRuntime,
  ReaderModeRuntimeSnapshotV1,
} from "../../../src/reader/modes/ReaderModeAdapter";
import { createFakeDocument, createFakeInfrastructure } from "./fakePorts";

type ClockOwner = ReaderModeRuntimeSnapshotV1["clockOwner"];

export interface LifecycleExpectations {
  /** clockOwner after start(). */
  readonly clockOwnerAfterStart: ClockOwner;
  /** playing after start(). */
  readonly playsAfterStart: boolean;
  /** Whether currentWordIndex advances while started (after advanceMs of fake time). */
  readonly advances: boolean;
  /** Fake time to let pass after start (default 5000 ms). */
  readonly advanceMs?: number;
}

interface Session {
  readonly runtime: ReaderModeRuntime;
  readonly calls: string[];
  readonly fake: ReturnType<typeof createFakeInfrastructure>;
}

/** Wraps every infrastructure method so each port call is counted, then forwards. */
function countingInfra(infra: ReaderPortInfrastructure, calls: string[]): ReaderPortInfrastructure {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [group, methods] of Object.entries(infra)) {
    out[group] = {};
    for (const [name, fn] of Object.entries(methods as Record<string, (...args: unknown[]) => unknown>)) {
      out[group][name] = (...args: unknown[]) => { calls.push(`${group}.${name}`); return fn(...args); };
    }
  }
  return out as unknown as ReaderPortInfrastructure;
}

function openSession(
  module: ReaderModeModule,
  options: { position?: number; handoff?: ReaderModeHandoff; settings?: ReaderSettingsSnapshot } = {},
): Session {
  const fake = createFakeInfrastructure({ document: createFakeDocument({ position: options.position ?? 7 }) });
  const calls: string[] = [];
  const broker = createReaderPorts(countingInfra(fake.infra, calls));
  const document = fake.infra.document.snapshot();
  broker.openDocument(document.documentId);
  const { key, ports } = broker.issue(module.id);
  calls.length = 0; // the broker seeds its cached reads at issue time; count only the runtime's calls
  const runtime = module.createRuntime({
    key,
    ports,
    document,
    settings: options.settings ?? fake.infra.settings.read(),
    handoff: options.handoff ?? createInitialHandoff(document, document.wordCount),
    arrival: "silent",
  });
  return { runtime, calls, fake };
}

export function assertSelectPausedAtZero(module: ReaderModeModule): void {
  const { runtime, calls } = openSession(module, { position: 0 });
  expect(runtime.mode).toBe(module.id);
  expect(runtime.contractVersion).toBe(1);
  // The constructor makes no port calls.
  expect(calls).toEqual([]);

  runtime.select(0);
  const snapshot = runtime.getSnapshot();
  expect(snapshot).toMatchObject({
    mode: module.id,
    selected: true,
    playing: false,
    currentWordIndex: 0,
    clockOwner: "none",
    canonicalWordIndex: 0,
    publishedWordIndex: 0,
    highlightedWordIndex: 0,
    contractVersion: 1,
  });

  // 0 is an explicit index (LL-108): selecting 0 from a non-zero anchor must not fall through.
  const other = openSession(module, { position: 7 }).runtime;
  other.select(0);
  expect(other.getSnapshot()).toMatchObject({ selected: true, playing: false, currentWordIndex: 0, clockOwner: "none" });
  runtime.destroy();
  other.destroy();
}

export function assertLifecycle(module: ReaderModeModule, expectations: LifecycleExpectations): void {
  vi.useFakeTimers({ now: 0 });
  try {
    const { runtime, calls } = openSession(module, { position: 7 });
    runtime.select(7);
    expect(runtime.getSnapshot()).toMatchObject({ selected: true, playing: false, clockOwner: "none", currentWordIndex: 7 });

    runtime.start({ cause: "play-button" });
    expect(runtime.getSnapshot()).toMatchObject({ clockOwner: expectations.clockOwnerAfterStart, playing: expectations.playsAfterStart });
    vi.advanceTimersByTime(expectations.advanceMs ?? 5000);
    const advanced = runtime.getSnapshot().currentWordIndex !== 7;
    expect(advanced).toBe(expectations.advances);

    runtime.pause();
    expect(runtime.getSnapshot()).toMatchObject({ clockOwner: "none", playing: false });
    const pausedAt = runtime.getSnapshot().currentWordIndex;
    vi.advanceTimersByTime(5000);
    expect(runtime.getSnapshot().currentWordIndex).toBe(pausedAt);

    runtime.resume();
    expect(runtime.getSnapshot()).toMatchObject({ clockOwner: expectations.clockOwnerAfterStart, playing: expectations.playsAfterStart });

    runtime.stop("user-stop");
    const stopped = runtime.getSnapshot();
    expect(stopped).toMatchObject({ selected: false, playing: false, clockOwner: "none" });

    // stop and destroy are idempotent; after them every call is a no-op.
    const callsAfterStop = calls.length;
    runtime.stop("user-stop");
    runtime.destroy();
    runtime.destroy();
    runtime.select(3);
    runtime.start({ cause: "space" });
    runtime.resume();
    runtime.jumpToWord(4, "navigation");
    runtime.togglePlay();
    runtime.hardSelect({ cfi: null, word: "w5", globalWordIndex: 5 });
    runtime.navigateTo(6);
    runtime.jumpBack();
    runtime.adjustSpeed(25);
    runtime.handleCommand({ kind: "move-selection", direction: "right" });
    expect(runtime.getSnapshot()).toEqual(stopped);
    // Destroyed runtimes produce zero side effects under fake timers.
    vi.advanceTimersByTime(60_000);
    expect(calls.slice(callsAfterStop)).toEqual([]);
  } finally {
    vi.clearAllTimers();
    vi.useRealTimers();
  }
}

function mutableCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function assertNoLeak(module: ReaderModeModule): void {
  vi.useFakeTimers({ now: 0 });
  try {
    const base = openSession(module, { position: 7 });
    const document = base.fake.infra.document.snapshot();
    // Unfrozen inputs: the runtime must keep private copies.
    const handoff = mutableCopy(createInitialHandoff(document, document.wordCount)) as { -readonly [K in keyof ReaderModeHandoff]: ReaderModeHandoff[K] };
    const settings = mutableCopy(base.fake.infra.settings.read()) as unknown as { wpm: number; settings: { readingMode: string } };
    base.runtime.destroy();

    const { runtime, calls } = openSession(module, { position: 7, handoff, settings: settings as unknown as ReaderSettingsSnapshot });
    runtime.select(7);
    const before = runtime.getSnapshot();
    const handoffBefore = runtime.exportHandoff("persistent");
    handoff.canonicalWordIndex = 20;
    handoff.highlightedWordIndex = 20;
    handoff.resumeAnchor = 20;
    settings.wpm = 999;
    settings.settings.readingMode = "flow";
    expect(runtime.getSnapshot()).toEqual(before);
    expect(runtime.exportHandoff("persistent")).toEqual(handoffBefore);

    // Snapshots are frozen values: mutation throws (strict mode) and changes nothing.
    expect(Object.isFrozen(before)).toBe(true);
    expect(() => { (before as { currentWordIndex: number }).currentWordIndex = 99; }).toThrow();
    expect(runtime.getSnapshot()).toEqual(before);
    expect(Object.isFrozen(handoffBefore)).toBe(true);

    // Repeated reads: equal values, fresh objects, zero port calls.
    const callsBefore = calls.length;
    const a = runtime.getSnapshot();
    const b = runtime.getSnapshot();
    runtime.exportHandoff("capture-current");
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(calls.length).toBe(callsBefore);

    // applySettings on one runtime leaves another runtime (another session) unchanged.
    const other = openSession(module, { position: 7 });
    other.runtime.select(7);
    const otherBefore = other.runtime.getSnapshot();
    const otherCalls = other.calls.length;
    const nextSettings = mutableCopy(other.fake.infra.settings.read()) as unknown as ReaderSettingsSnapshot;
    runtime.applySettings({ ...nextSettings, wpm: 450, effectiveWpm: 450 });
    expect(other.runtime.getSnapshot()).toEqual(otherBefore);
    expect(other.calls.length).toBe(otherCalls);

    runtime.destroy();
    other.runtime.destroy();
    const afterDestroy = calls.length;
    vi.advanceTimersByTime(60_000);
    expect(calls.length).toBe(afterDestroy);
  } finally {
    vi.clearAllTimers();
    vi.useRealTimers();
  }
}

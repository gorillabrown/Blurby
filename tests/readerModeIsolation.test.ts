// @vitest-environment jsdom
// READER-MODE-SEPARATION-2 G3 — routing and concurrency.
// Broker and router-core cases (Wave B), then the named G3 cases over the real mode modules present
// (design §D.3; jsdom because the real modules load their views).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  READER_PORT_RELEASE_CALLS,
  ReaderPortAccessError,
  createReaderPorts,
  type ReaderPortBroker,
} from "../src/reader/ports/createReaderPorts";
import {
  READER_MODE_RUNTIME_CONTRACT_VERSION,
  type ReaderModeCreateInput,
  type ReaderModeId,
  type ReaderModeModule,
  type ReaderModeRuntime,
} from "../src/reader/modes/ReaderModeAdapter";
import { READER_MODE_MODULES, createReaderModeRouter } from "../src/reader/useReaderModeOrchestrator";
import { createFakeDocument, createFakeInfrastructure, type FakeInfrastructure } from "./readerModes/harness/fakePorts";
import type { ReaderDocumentSnapshot, ReaderSessionKey } from "../src/reader/document/ReaderDocumentSnapshot";
import type { ReaderPorts } from "../src/reader/ports/ReaderPorts";
import { pageMode } from "../src/reader/modes/page/index";
import { focusMode } from "../src/reader/modes/focus/index";
import { flowMode } from "../src/reader/modes/flow/index";
import { narrateMode } from "../src/reader/modes/narrate/index";
import { buildImportGraph } from "../docs/planning/roadmap-reviews/reader-mode-separation-2/census/import-graph.mjs";

const flushMicrotasks = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function setup(): { fake: FakeInfrastructure; broker: ReaderPortBroker } {
  const fake = createFakeInfrastructure();
  const broker = createReaderPorts(fake.infra);
  broker.openDocument("doc-1");
  return { fake, broker };
}

const methods = (fake: FakeInfrastructure) => fake.effects.map((c) => c.method);

describe("reader port broker", () => {
  it("issues frozen ports bound to the (documentId, generation, mode, session) tuple", () => {
    const { fake, broker } = setup();
    const { key, ports } = broker.issue("narrate");
    expect(key).toEqual({ documentId: "doc-1", documentGeneration: 1, mode: "narrate", session: 1 });
    expect(Object.isFrozen(key)).toBe(true);
    expect(Object.isFrozen(ports)).toBe(true);
    expect(Object.isFrozen(ports.persistence)).toBe(true);
    expect(broker.isCurrent(key)).toBe(true);

    ports.persistence.updateProgress("doc-1", 0);
    ports.audio.stop("user-stop");
    expect(fake.effects).toEqual([
      { method: "persistence.updateProgress", args: ["doc-1", 0] },
      { method: "audio.stop", args: ["user-stop"] },
    ]);
    expect(broker.stats.accepted).toEqual({ "persistence.updateProgress": 1, "audio.stop": 1 });
    expect(broker.stats.rejected).toEqual({});
  });

  it("brokers every infrastructure method", () => {
    const { fake, broker } = setup();
    const { ports } = broker.issue("narrate");
    for (const group of Object.keys(fake.infra) as (keyof typeof fake.infra)[]) {
      expect(Object.keys(ports[group]).sort(), group).toEqual(Object.keys(fake.infra[group]).sort());
    }
  });

  it("refuses to issue without a document or while a session is active", () => {
    const fake = createFakeInfrastructure();
    const broker = createReaderPorts(fake.infra);
    expect(() => broker.issue("page")).toThrow(/no document/);
    broker.openDocument("doc-1");
    const { key } = broker.issue("page");
    expect(() => broker.issue("focus")).toThrow(/still active/);
    broker.invalidate(key);
    expect(broker.issue("focus").key.session).toBe(2);
  });

  it("rejects every call after invalidate with a neutral value and counts it", () => {
    const { fake, broker } = setup();
    const { key, ports } = broker.issue("narrate");
    const settingsBefore = ports.settings.read();
    broker.invalidate(key);
    broker.invalidate(key); // idempotent

    expect(broker.isCurrent(key)).toBe(false);
    expect(ports.audio.start(["a"], 0, 1, () => {})).toBe("error");
    expect(ports.audio.getAudioProgress()).toBeNull();
    expect(ports.persistence.updateDocProgress("doc-1", 0)).toBeUndefined();
    expect(ports.settings.read()).toBe(settingsBefore);
    expect(typeof ports.document.subscribe(() => {})).toBe("function");

    expect(fake.effects).toEqual([]);
    expect(broker.stats.accepted).toEqual({ "settings.read": 1 });
    expect(broker.stats.rejected).toEqual({
      "audio.start": 1,
      "audio.getAudioProgress": 1,
      "persistence.updateDocProgress": 1,
      "settings.read": 1,
      "document.subscribe": 1,
    });
    expect(fake.diagnostics.filter((c) => c.args[0] === "port-rejected")).toHaveLength(5);
  });

  it("lets teardown run only release-class calls, then closes the key", () => {
    const { fake, broker } = setup();
    const { key, ports } = broker.issue("narrate");
    expect(READER_PORT_RELEASE_CALLS).toContain("audio.stop");
    broker.invalidate(key);
    let runs = 0;
    broker.teardown(key, () => {
      runs += 1;
      ports.audio.stop("mode-switch");
      ports.audio.setOnTruthSync(null);
      ports.audio.setPageEndWord(null);
      ports.settings.update({ isNarrating: false });
      ports.diagnostics.record("teardown", "ok");
      // Not release-class: rejected inside the window.
      ports.audio.start(["a"], 0, 1, () => {});
      ports.audio.resume();
      ports.audio.resync(3, 1);
      ports.audio.setOnTruthSync(() => {});
      ports.persistence.updateProgress("doc-1", 3);
      ports.settings.setWpm(250);
      ports.settings.update({ readingMode: "page" });
    });
    expect(runs).toBe(1);
    expect(methods(fake)).toEqual(["audio.stop", "audio.setOnTruthSync", "audio.setPageEndWord", "settings.update"]);
    expect(fake.effects[3].args).toEqual([{ isNarrating: false }]);
    expect(broker.stats.rejected).toEqual({
      "audio.start": 1,
      "audio.resume": 1,
      "audio.resync": 1,
      "audio.setOnTruthSync": 1,
      "persistence.updateProgress": 1,
      "settings.setWpm": 1,
      "settings.update": 1,
    });

    // Closed: release calls are rejected too, and a second teardown does not run.
    ports.audio.stop("mode-switch");
    broker.teardown(key, () => { runs += 1; });
    expect(runs).toBe(1);
    expect(methods(fake)).toHaveLength(4);
    expect(broker.stats.rejected["audio.stop"]).toBe(1);
  });

  it("closeAll and openDocument close every key with no release window", () => {
    const { fake, broker } = setup();
    const first = broker.issue("narrate");
    broker.closeAll();
    broker.closeAll(); // idempotent
    first.ports.audio.stop("mode-switch");
    expect(broker.isCurrent(first.key)).toBe(false);

    const second = broker.issue("flow");
    expect(broker.openDocument("doc-2")).toBe(2);
    expect(broker.isCurrent(second.key)).toBe(false);
    second.ports.persistence.updateProgress("doc-1", 1);
    const third = broker.issue("page");
    expect(third.key).toEqual({ documentId: "doc-2", documentGeneration: 2, mode: "page", session: 3 });
    expect(fake.effects).toEqual([]);
    expect(broker.stats.rejected).toEqual({ "audio.stop": 1, "persistence.updateProgress": 1 });
  });

  it("drops infrastructure callbacks once the key is no longer active", () => {
    const { fake, broker } = setup();
    const { key, ports } = broker.issue("narrate");
    const seen: number[] = [];
    ports.audio.setOnTruthSync((i) => seen.push(i));
    ports.audio.start(["a", "b"], 0, 1, (i) => seen.push(100 + i));
    const truthSync = fake.registered.truthSync as (i: number) => void;
    const onWord = fake.registered.onWord as (i: number) => void;
    truthSync(1);
    onWord(1);
    expect(seen).toEqual([1, 101]);

    broker.invalidate(key);
    truthSync(2);
    onWord(2);
    expect(seen).toEqual([1, 101]);
    expect(broker.stats.rejected).toEqual({ "audio.setOnTruthSync:callback": 1, "audio.start:callback": 1 });
  });

  it("rejects a stale continuation after an awaited promise resolves (LL-109)", async () => {
    const { fake, broker } = setup();
    const live = broker.issue("narrate");
    const liveResult = live.ports.document.ensureBookWords();
    fake.resolveBookWords(null);
    await expect(liveResult).resolves.toBeNull();

    broker.invalidate(live.key);
    broker.teardown(live.key, () => {});
    const stale = broker.issue("flow");
    let continued = false;
    void stale.ports.document.ensureBookWords().then(() => { continued = true; });
    void stale.ports.document.readBookBytes().then(() => { continued = true; });
    broker.invalidate(stale.key);
    fake.resolveBookWords(null);
    fake.resolveBookBytes(new ArrayBuffer(1));
    await flushMicrotasks();
    expect(continued).toBe(false);

    // Calls made after invalidation never reach infrastructure and never settle either.
    void stale.ports.document.ensureBookWords().then(() => { continued = true; });
    await flushMicrotasks();
    expect(continued).toBe(false);
    expect(methods(fake)).toEqual(["document.ensureBookWords", "document.ensureBookWords", "document.readBookBytes"]);
  });

  it("issues audio only to narrate; every other mode's audio port throws", () => {
    for (const mode of ["page", "focus", "flow"] as ReaderModeId[]) {
      const { fake, broker } = setup();
      const { ports } = broker.issue(mode);
      expect(() => ports.audio.start(["a"], 0, 1, () => {})).toThrow(ReaderPortAccessError);
      expect(() => ports.audio.readState()).toThrow(`audio.readState is not issued to ${mode}`);
      ports.persistence.markEngaged();
      expect(methods(fake)).toEqual(["persistence.markEngaged"]);
    }
  });
});

// ── Router core with minimal fake modules ────────────────────────────────────

interface FakeRuntimeRecord {
  readonly input: ReaderModeCreateInput;
  readonly runtime: ReaderModeRuntime;
  subscriptions: number;
}

function fakeModule(mode: ReaderModeId, log: string[], made: FakeRuntimeRecord[]): ReaderModeModule {
  return {
    id: mode,
    contractVersion: READER_MODE_RUNTIME_CONTRACT_VERSION,
    View: () => null,
    createRuntime(input) {
      log.push(`create:${mode}:${input.arrival}`);
      let canonical = input.handoff.canonicalWordIndex;
      let highlighted = input.handoff.highlightedWordIndex;
      let selected = false;
      const listeners = new Set<() => void>();
      const notify = () => listeners.forEach((l) => l());
      const runtime: ReaderModeRuntime = {
        mode,
        contractVersion: READER_MODE_RUNTIME_CONTRACT_VERSION,
        key: input.key,
        select(i) { log.push(`select:${mode}:${i}`); selected = true; canonical = highlighted = i; notify(); },
        start() {},
        pause() {},
        resume() {},
        stop(reason, context) {
          log.push(`stop:${mode}:${reason}:${context?.destination}`);
          if (mode === "narrate") input.ports.audio.stop("mode-switch"); // release-class: accepted
          input.ports.persistence.updateProgress(input.key.documentId, canonical); // not release-class: rejected
        },
        jumpToWord(i) { highlighted = i; notify(); },
        getSnapshot: () => Object.freeze({
          mode, selected, playing: false, currentWordIndex: canonical, clockOwner: "none" as const,
          contractVersion: READER_MODE_RUNTIME_CONTRACT_VERSION, key: input.key,
          highlightedWordIndex: highlighted, publishedWordIndex: canonical, canonicalWordIndex: canonical,
          isBrowsedAway: false, narrating: false, speed: null, flowProgress: null,
        }),
        destroy() { log.push(`destroy:${mode}`); selected = false; },
        togglePlay() { log.push(`togglePlay:${mode}`); },
        hardSelect() {},
        navigateTo() {},
        jumpBack() {},
        adjustSpeed() {},
        setSpeed() {},
        applySettings() {},
        handleCommand() {},
        exportHandoff(capture) {
          log.push(`export:${mode}:${capture}`);
          return {
            source: input.key, canonicalWordIndex: canonical, publishedWordIndex: canonical, highlightedWordIndex: highlighted,
            softWordIndex: canonical, resumeAnchor: canonical, explicitSelectionAnchor: null, cfi: null,
          };
        },
        subscribe(listener) {
          record.subscriptions += 1;
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
      };
      const record: FakeRuntimeRecord = { input, runtime, subscriptions: 0 };
      made.push(record);
      return runtime;
    },
  };
}

function routerSetup() {
  const log: string[] = [];
  const made: FakeRuntimeRecord[] = [];
  const fake = createFakeInfrastructure();
  const real = createReaderPorts(fake.infra);
  const broker: ReaderPortBroker = {
    ...real,
    stats: real.stats,
    invalidate: (key) => { log.push(`invalidate:${key.mode}`); real.invalidate(key); },
    teardown: (key, run) => { log.push(`teardown:${key.mode}`); real.teardown(key, run); },
    issue: (mode) => { log.push(`issue:${mode}`); return real.issue(mode); },
  };
  const modules = Object.fromEntries((["page", "focus", "flow", "narrate"] as ReaderModeId[]).map((m) => [m, fakeModule(m, log, made)]));
  const document = createFakeDocument();
  const router = createReaderModeRouter({ modules, broker, getDocument: () => document, getSettings: () => fake.infra.settings.read() });
  router.openDocument(document);
  log.length = 0;
  return { log, made, fake, broker: real, router, document };
}

describe("reader mode router core", () => {
  it("opens a document into Page, silently, at the initial handoff", () => {
    const { made, router } = routerSetup();
    expect(made).toHaveLength(1);
    expect(made[0].input.arrival).toBe("silent");
    expect(made[0].input.handoff).toMatchObject({ source: null, canonicalWordIndex: 7, resumeAnchor: 7, explicitSelectionAnchor: null });
    expect(router.getSnapshot()).toMatchObject({ readingMode: "page", currentWordIndex: 7 });
    expect(router.getActive()?.key).toEqual({ documentId: "doc-1", documentGeneration: 1, mode: "page", session: 1 });
  });

  it("transitions in order: export, invalidate, teardown(stop, destroy), issue, create, select", () => {
    const { log, made, broker, router } = routerSetup();
    const pageKey = router.getActive()!.key;
    router.select("focus");
    expect(log).toEqual([
      "export:page:persistent", "invalidate:page", "teardown:page", "stop:page:mode-switch:focus", "destroy:page",
      "issue:focus", "create:focus:select", "select:focus:7",
    ]);
    const focus = made[1];
    expect(focus.input.handoff.source).toEqual(pageKey);
    expect(focus.input.handoff.canonicalWordIndex).toBe(7);
    expect(Object.isFrozen(focus.input.handoff)).toBe(true);
    expect(broker.isCurrent(pageKey)).toBe(false);
    expect(broker.stats.rejected["persistence.updateProgress"]).toBe(1);
    expect(router.getSnapshot()?.readingMode).toBe("focus");
  });

  it("pauses Narrate to Page with release calls only inside the teardown window", () => {
    const { log, fake, broker, router } = routerSetup();
    router.select("narrate");
    log.length = 0;
    router.pauseToPage();
    expect(log).toEqual([
      "export:narrate:capture-current", "invalidate:narrate", "teardown:narrate", "stop:narrate:mode-switch:page", "destroy:narrate",
      "issue:page", "create:page:pause-to-page", "select:page:7",
    ]);
    expect(fake.effects.map((c) => c.method)).toEqual(["audio.stop"]);
    expect(broker.stats.rejected["persistence.updateProgress"]).toBe(2);
  });

  it("selecting the active mode is a no-op; pause-to-page in Page reselects without a new session", () => {
    const { log, made, router } = routerSetup();
    router.select("flow");
    const key = router.getActive()!.key;
    log.length = 0;
    router.select("flow");
    expect(log).toEqual([]);
    expect(router.getActive()!.key).toBe(key);
    expect(made[1].subscriptions).toBe(1);

    router.pauseToPage();
    const pageKey = router.getActive()!.key;
    log.length = 0;
    router.pauseToPage();
    expect(log).toEqual(["select:page:7"]);
    expect(router.getActive()!.key).toBe(pageKey);
    expect(made.at(-1)!.subscriptions).toBe(1);
  });

  // Decision #23: closing on openDocument uses the same invalidate → teardown order as a transition, so the
  // outgoing session's release calls (Narrate's audio.stop) reach infrastructure instead of leaving audio running.
  it("openDocument starts a new generation and releases the old session inside a teardown window", () => {
    const { log, made, fake, broker, router, document } = routerSetup();
    router.select("narrate");
    const narrateKey = router.getActive()!.key;
    log.length = 0;
    router.openDocument({ ...document, position: 0 });
    expect(log).toEqual(["invalidate:narrate", "teardown:narrate", "stop:narrate:user-stop:undefined", "destroy:narrate", "issue:page", "create:page:silent", "select:page:0"]);
    expect(broker.isCurrent(narrateKey)).toBe(false);
    expect(fake.effects.map((c) => c.method)).toEqual(["audio.stop"]);
    expect(router.getActive()!.key).toEqual({ documentId: "doc-1", documentGeneration: 2, mode: "page", session: 3 });
    expect(made.at(-1)!.input.handoff.canonicalWordIndex).toBe(0);
  });

  it("queues completion to Page and drops it when the requesting key is stale", async () => {
    const { log, router } = routerSetup();
    router.select("focus");
    const focusKey = router.getActive()!.key;
    log.length = 0;
    router.requestCompletionToPage(focusKey);
    expect(log).toEqual([]);
    await Promise.resolve();
    expect(log).toEqual([
      "export:focus:capture-current", "invalidate:focus", "teardown:focus", "stop:focus:user-stop:page", "destroy:focus",
      "issue:page", "create:page:silent", "select:page:7",
    ]);

    router.select("flow");
    router.requestCompletionToPage(router.getActive()!.key);
    router.select("focus"); // the flow key goes stale before the microtask runs
    log.length = 0;
    await Promise.resolve();
    expect(log).toEqual([]);
    expect(router.getSnapshot()?.readingMode).toBe("focus");
  });

  it("exitToPage hands off the published word as the highlight", () => {
    const { made, router } = routerSetup();
    router.select("flow");
    made[1].runtime.jumpToWord(9, "navigation");
    router.exitToPage();
    expect(made[2].input.arrival).toBe("silent");
    expect(made[2].input.handoff).toMatchObject({ canonicalWordIndex: 7, publishedWordIndex: 7, highlightedWordIndex: 7 });
  });

  it("publishes a stable toolbar snapshot and destroys idempotently", () => {
    const { log, router } = routerSetup();
    let notified = 0;
    router.subscribe(() => { notified += 1; });
    const first = router.getSnapshot();
    expect(router.getSnapshot()).toBe(first);
    router.select("focus");
    expect(notified).toBeGreaterThan(0);
    expect(router.getSnapshot()).not.toBe(first);

    log.length = 0;
    router.destroy();
    router.destroy();
    router.togglePlay();
    expect(log).toEqual(["destroy:focus"]);
    expect(router.getActive()).toBeNull();
    expect(router.getSnapshot()).toBeNull();
  });
});

// ── G3 over the real mode modules (design §D.3) ──────────────────────────────
// The generators run over every mode whose module is registered here (all four since Wave D); the
// generated names extend without renaming.
const REAL_MODULES: Readonly<Partial<Record<ReaderModeId, ReaderModeModule>>> = { page: pageMode, focus: focusMode, flow: flowMode, narrate: narrateMode };
const PRESENT_MODES = (["page", "focus", "flow", "narrate"] as ReaderModeId[]).filter((m) => REAL_MODULES[m]);
const ORDERED_PAIRS = PRESENT_MODES.flatMap((from) => PRESENT_MODES.filter((to) => to !== from).map((to) => [from, to] as const));
const PLAYABLE = new Set<ReaderModeId>(["focus", "flow", "narrate"]);

const keyId = (key: ReaderSessionKey) => JSON.stringify([key.documentId, key.documentGeneration, key.mode, key.session]);
const acceptedTotal = (broker: ReaderPortBroker) => Object.values(broker.stats.accepted).reduce((sum, n) => sum + n, 0);

interface Issued { readonly mode: ReaderModeId; readonly key: ReaderSessionKey; readonly ports: ReaderPorts }

/**
 * Real modules + fake infrastructure behind the real broker. Each issued port is wrapped so every call is
 * attributed to its key: `attempted` counts calls the session made, `accepted` counts those the broker let
 * through to infrastructure.
 */
function isolationSetup(position = 7) {
  const fake = createFakeInfrastructure({ document: createFakeDocument({ position }) });
  const broker = createReaderPorts(fake.infra);
  const calls = new Map<string, { attempted: number; accepted: number }>();
  const issued: Issued[] = [];
  const runtimes: { mode: ReaderModeId; runtime: ReaderModeRuntime }[] = [];
  // The issued groups are frozen, so the proxy wraps an empty target and forwards to the group.
  const wrapGroup = (id: string, group: object) => new Proxy({}, {
    get: (_target, prop) => (...args: unknown[]) => {
      const rec = calls.get(id)!;
      rec.attempted += 1;
      const before = acceptedTotal(broker);
      try {
        return (group as Record<string | symbol, (...a: unknown[]) => unknown>)[prop](...args);
      } finally {
        if (acceptedTotal(broker) > before) rec.accepted += 1;
      }
    },
  });
  const counting: ReaderPortBroker = {
    ...broker,
    stats: broker.stats,
    issue: (mode) => {
      const { key, ports } = broker.issue(mode);
      const id = keyId(key);
      calls.set(id, { attempted: 0, accepted: 0 });
      const wrapped = Object.freeze(Object.fromEntries(
        (Object.keys(ports) as (keyof ReaderPorts)[]).map((group) => [group, wrapGroup(id, ports[group])]),
      )) as unknown as ReaderPorts;
      issued.push({ mode, key, ports: wrapped });
      return Object.freeze({ key, ports: wrapped });
    },
  };
  const modules = Object.fromEntries(Object.entries(REAL_MODULES).map(([mode, module]) => [mode, {
    ...module!,
    createRuntime: (input: ReaderModeCreateInput) => {
      const runtime = module!.createRuntime(input);
      runtimes.push({ mode: mode as ReaderModeId, runtime });
      return runtime;
    },
  }]));
  const document = fake.infra.document.snapshot();
  const router = createReaderModeRouter({ modules, broker: counting, getDocument: () => document, getSettings: () => fake.infra.settings.read() });
  router.openDocument(document);
  const enter = (mode: ReaderModeId) => (mode === "page" ? router.pauseToPage() : router.select(mode));
  const callsFor = (key: ReaderSessionKey) => ({ ...calls.get(keyId(key))! });
  const portsFor = (key: ReaderSessionKey) => issued.find((i) => keyId(i.key) === keyId(key))!.ports;
  return { fake, broker, router, document, runtimes, enter, callsFor, portsFor };
}

/** Flush every fake timer, RAF and microtask the sessions left behind. */
async function flushAll(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    vi.advanceTimersByTime(60_000);
    await Promise.resolve();
    await Promise.resolve();
  }
}

/** The work an old owner can still reach after it lost the session: its view callbacks and its ports. */
function invokeCapturedWork(
  runtime: ReaderModeRuntime,
  ports: ReaderPorts,
  key: ReaderSessionKey,
  router: ReturnType<typeof createReaderModeRouter>,
  options: { readonly ports: boolean } = { ports: true },
): void {
  const view = runtime as unknown as Record<string, unknown>;
  const call = (name: string, ...args: unknown[]) => {
    if (typeof view[name] === "function") (view[name] as (...a: unknown[]) => unknown)(...args);
  };
  call("onRelocate", { cfi: "epubcfi(/6/2!/4/2)", fraction: 0.5 });
  call("onSurfaceLoad");
  call("onWordsReextracted");
  call("onUserBrowseAway");
  call("pollBrowsing");
  call("onWordClick", "epubcfi(/6/2!/4/2)", "w3", 0, 3, 3);
  call("onTocReady", [{ label: "c1" }], 1);
  call("recordDiagnostic", "late", "work");
  call("readBookBytes");
  // Narrate's binding-driven work (section end, HOTFIX-6 extraction, audio bridge, the render poll).
  call("syncSectionEnd");
  call("releaseSectionEnd");
  call("ensureFullBookWords");
  call("configureAudio", { bookId: "late" });
  call("syncAudioRate");
  call("readNarrationWordIndex");
  runtime.select(3);
  runtime.start({ cause: "programmatic" });
  runtime.resume();
  runtime.togglePlay();
  runtime.hardSelect({ cfi: null, word: "w4", globalWordIndex: 4 });
  runtime.navigateTo(5);
  runtime.jumpBack();
  runtime.adjustSpeed(25);
  // The ports themselves (completion, cross-book, persistence, settings, diagnostics, audio). Skipped
  // when the key is still current (a runtime stopped in place): then only the runtime layer is under test.
  if (!options.ports) return;
  ports.shell.requestCompletionToPage();
  ports.shell.requestCrossBook({ finishedWordIndex: 5 });
  ports.persistence.updateProgress(key.documentId, 5);
  ports.settings.update({ readingMode: key.mode });
  ports.diagnostics.record("late", "work");
  try {
    ports.audio.stop("mode-switch");
  } catch (error) {
    if (!(error instanceof ReaderPortAccessError)) throw error;
  }
  router.requestCompletionToPage(key);
}

/** Fire every callback in a registration set (audio onWord/truth sync/chunk/segment/section end, subscriptions). */
function fireCallbacks(registered: FakeInfrastructure["registered"]): void {
  for (const cb of Object.values(registered)) {
    if (typeof cb === "function") (cb as (...a: unknown[]) => unknown)(1);
  }
}

/** Fire every callback infrastructure still holds. */
function fireRegisteredCallbacks(fake: FakeInfrastructure): void {
  fireCallbacks(fake.registered);
}

/** Infrastructure slots that currently hold a callback. */
const heldSlots = (fake: FakeInfrastructure) =>
  Object.entries(fake.registered).filter(([, cb]) => cb != null).map(([slot]) => slot).sort();

/** The slots a selected (not started) Narrate session holds: its chunk publishers (legacy narrate effect). */
const NARRATE_SELECTED_SLOTS = ["chunkBoundary", "segmentStart"];

/**
 * A mounted Narrate view stand-in (ready; `words` loaded), so start installs the truth sync, as on a
 * Foliate surface. With no words, start takes the legacy empty-words retry (next() + delayed timer).
 */
function stubNarrateView(runtime: ReaderModeRuntime, words: readonly string[]): void {
  const loaded = words.map((word) => ({ word, range: null, sectionIndex: 0 }));
  (runtime as unknown as { viewApiRef: { current: unknown } }).viewApiRef.current = {
    getWords: () => loaded,
    getParagraphBreaks: () => new Set<number>(),
    highlightWordByIndex: () => true,
    next: () => {},
    goToSection: () => Promise.resolve(),
    waitForSectionReady: () => Promise.resolve(0),
    getSectionForWordIndex: () => 0,
    findFirstVisibleWordIndex: () => 0,
    isUserBrowsing: () => false,
    clearSoftHighlight: () => {},
    clearUserBrowsing: () => {},
  };
}

/** A complete full-book extraction (so an unguarded HOTFIX-6 continuation would make port calls). */
function bookWordsValue(document: { tokenWords: readonly string[] }) {
  const words = [...document.tokenWords];
  return { words, sections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: words.length, wordCount: words.length }], totalWords: words.length, footnoteCues: [] } as never;
}

describe("reader mode isolation (G3)", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("covers every ordered pair of the present modes", () => {
    expect(PRESENT_MODES).toEqual(["page", "focus", "flow", "narrate"]);
    expect(ORDERED_PAIRS).toHaveLength(PRESENT_MODES.length * (PRESENT_MODES.length - 1));
  });

  for (const [from, to] of ORDERED_PAIRS) {
    it(`handoff ${from} to ${to} preserves position and rejects the old owner`, async () => {
      for (const scenario of [{ position: 7, reopen: false }, { position: 0, reopen: false }, { position: 7, reopen: true }]) {
        const label = `${from}→${to} at ${scenario.position}${scenario.reopen ? " after openDocument" : ""}`;
        const { fake, broker, router, document, runtimes, enter, callsFor, portsFor } = isolationSetup(scenario.position);
        if (scenario.reopen) {
          const firstKey = router.getActive()!.key;
          router.openDocument(document);
          expect(router.getActive()!.key.documentGeneration, label).toBe(2);
          expect(broker.isCurrent(firstKey), label).toBe(false);
        }
        enter(from);
        if (PLAYABLE.has(from)) router.togglePlay();
        const old = router.getActive()!;
        expect(old.mode, label).toBe(from);
        if (PLAYABLE.has(from)) expect(old.runtime.getSnapshot().playing, label).toBe(true);

        // Capture the old owner's pending work: a load timer, its live timers/RAFs and two port promises.
        (old.runtime as { onSurfaceLoad?: () => void }).onSurfaceLoad?.();
        expect(vi.getTimerCount(), label).toBeGreaterThan(0);
        const oldPorts = portsFor(old.key);
        const continued: string[] = [];
        void oldPorts.document.readBookBytes().then(() => continued.push("readBookBytes"));
        void oldPorts.document.ensureBookWords().then(() => continued.push("ensureBookWords"));
        const createdBefore = runtimes.length;

        enter(to);
        const teardownCalls = callsFor(old.key);
        await flushAll();
        // The old owner left no live work behind: nothing it scheduled made a port call after teardown.
        expect(callsFor(old.key), label).toEqual(teardownCalls);
        fake.resolveBookBytes(new ArrayBuffer(1));
        fake.resolveBookWords(null);
        fireRegisteredCallbacks(fake);
        invokeCapturedWork(old.runtime, oldPorts, old.key, router);
        await flushAll();

        const active = router.getActive()!;
        expect(active.mode, label).toBe(to);
        expect(active.runtime.getSnapshot().canonicalWordIndex, label).toBe(scenario.position);
        expect(runtimes.filter((r) => r.runtime.getSnapshot().selected).map((r) => r.mode), label).toEqual([to]);
        expect(broker.isCurrent(old.key), label).toBe(false);
        expect(callsFor(old.key).accepted - teardownCalls.accepted, label).toBe(0);
        expect(continued, label).toEqual([]);
        // Other modes untouched: the switch created only the destination, and no callback is held.
        expect(runtimes.slice(createdBefore).map((r) => r.mode), label).toEqual([to]);
        // No callback held for the old owner or any other mode; a Narrate destination holds only its own
        // chunk publishers (the old session's onWord/truth sync/section end were released in teardown).
        expect(heldSlots(fake), label).toEqual(to === "narrate" ? NARRATE_SELECTED_SLOTS : []);
        if (from === "narrate" && to === "page") {
          // OBS-A3-1 (legacy showed highlight 0): Page receives Narrate's canonical word, and the audio
          // cursor of the session Narrate actually started (here the same word).
          expect(active.runtime.getSnapshot(), label).toMatchObject({
            canonicalWordIndex: scenario.position,
            publishedWordIndex: scenario.position,
            highlightedWordIndex: scenario.position,
          });
        }
        router.destroy();
      }
    });
  }

  for (const mode of PRESENT_MODES) {
    it(`selecting ${mode} twice is a no-op`, async () => {
      const { fake, router, runtimes, enter } = isolationSetup(7);
      enter(mode); // first selection (Page is already selected by the document open)
      await flushAll();
      const before = router.getActive()!;
      const snapshot = before.runtime.getSnapshot();
      const registered = { ...fake.registered };
      const effects = fake.effects.length;
      const created = runtimes.length;

      enter(mode);
      await flushAll();
      const after = router.getActive()!;
      expect(after.key).toBe(before.key);
      expect(after.runtime).toBe(before.runtime);
      expect(runtimes).toHaveLength(created);
      expect(after.runtime.getSnapshot()).toMatchObject({
        selected: true,
        canonicalWordIndex: snapshot.canonicalWordIndex,
        publishedWordIndex: snapshot.publishedWordIndex,
        highlightedWordIndex: snapshot.highlightedWordIndex,
        playing: snapshot.playing,
      });
      expect(fake.registered).toEqual(registered);
      // Page alone re-emits its readingMode write (legacy handlePauseToPage in Page, page fixture step 5).
      expect(fake.effects.slice(effects)).toEqual(mode === "page"
        ? [{ method: "settings.update", args: [{ readingMode: "page" }] }]
        : []);
    });
  }

  it("Narrate that never started hands Page its own word, not the stale audio cursor (OBS-A3-1)", async () => {
    const { fake, router, enter } = isolationSetup(7);
    enter("narrate");
    await flushAll();
    expect(fake.audio.cursorWordIndex).toBe(0); // the legacy captureCurrentAnchor read this stale cursor
    router.pauseToPage();
    expect(router.getActive()!.mode).toBe("page");
    expect(router.getActive()!.runtime.getSnapshot()).toMatchObject({ canonicalWordIndex: 7, highlightedWordIndex: 7 });
    router.destroy();
  });

  it("rejected mode work cannot escape through a port", async () => {
    // Narrate runs twice more: started on a (stub) Foliate surface, so onWord, truth sync, chunk
    // boundary, segment start and section end are all registered and a truth frame is pending; and a
    // delayed-extraction start whose retry timer is pending. Narrate also exits by "stop" in place (the
    // key stays current, so only the runtime's own token can drop its work).
    const cases = PRESENT_MODES.flatMap((mode) => {
      const starts = mode === "narrate" ? ["started", "delayed-extraction"] as const : ["default"] as const;
      const exits = mode === "narrate"
        ? ["stop", "switch", "openDocument", "remount"] as const
        : ["switch", "openDocument", "remount"] as const;
      return starts.flatMap((start) => exits.map((exit) => ({ mode, start, exit })));
    });
    for (const { mode, start, exit } of cases) {
      const label = `${mode}${start === "default" ? "" : ` (${start})`} after ${exit}`;
      const { fake, broker, router, document, enter, callsFor, portsFor } = isolationSetup(7);
      enter(mode);
      const old = router.getActive()!;
      if (mode === "narrate") stubNarrateView(old.runtime, start === "delayed-extraction" ? [] : document.tokenWords);
      if (PLAYABLE.has(mode)) router.togglePlay();
      (old.runtime as { onSurfaceLoad?: () => void }).onSurfaceLoad?.(); // a pending delayed-load timer
      if (mode === "narrate") {
        const narrate = old.runtime as unknown as { syncSectionEnd: () => void; ensureFullBookWords: () => void };
        narrate.syncSectionEnd(); // the section-end fallback (binding-driven in production)
        narrate.ensureFullBookWords(); // a pending HOTFIX-6 extraction (only while narrating)
        if (start === "started") {
          expect(heldSlots(fake), label).toEqual(["chunkBoundary", "onWord", "sectionEnd", "segmentStart", "truthSync"]);
          (fake.registered.truthSync as (i: number) => void)(9); // a pending truth frame
        } else {
          expect(heldSlots(fake), label).toEqual(["chunkBoundary", "sectionEnd", "segmentStart"]);
          expect(old.runtime.getSnapshot().narrating, label).toBe(false); // waiting on the retry timer
        }
      }
      // The old owner's captured infrastructure callbacks, as registered before it lost the session.
      const captured = { ...fake.registered };
      const oldPorts = portsFor(old.key);
      const continued: string[] = [];
      if (exit !== "stop") void oldPorts.document.ensureBookWords().then(() => continued.push("ensureBookWords"));

      if (exit === "stop") old.runtime.stop("user-stop");
      else if (exit === "switch") enter(PRESENT_MODES.find((m) => m !== mode)!);
      else router.openDocument(document);
      if (exit === "remount") enter(mode); // a new session of the same mode
      await flushAll();

      const live = router.getActive()!;
      const liveSnapshot = live.runtime.getSnapshot();
      const acceptedBefore = { ...broker.stats.accepted };
      const effectsBefore = fake.effects.length;
      const oldSnapshot = old.runtime.getSnapshot();
      fake.resolveBookWords(bookWordsValue(document));
      fireCallbacks(captured);
      invokeCapturedWork(old.runtime, oldPorts, old.key, router, { ports: exit !== "stop" });
      await flushAll();

      expect(broker.stats.accepted, label).toEqual(acceptedBefore);
      expect(fake.effects.length, label).toBe(effectsBefore);
      expect(callsFor(old.key).attempted, label).toBeGreaterThan(0); // the old work really tried
      expect(continued, label).toEqual([]);
      expect(router.getActive()!.key, label).toBe(live.key);
      expect(live.runtime.getSnapshot(), label).toEqual(liveSnapshot);
      expect(old.runtime.getSnapshot(), label).toEqual(oldSnapshot);
      router.destroy();
    }
  });

  it("late full-book words reach only the active session", async () => {
    // Decision #19: the shell broadcasts each new document snapshot (background extraction landing after
    // open) through the document port; only the current session adopts it, and only for its own document.
    type DocumentView = { readonly document: ReaderDocumentSnapshot; getCanonicalSectionWords(sectionIndex: number): string[] | undefined };
    const view = (runtime: ReaderModeRuntime) => runtime as unknown as DocumentView;
    for (const mode of PRESENT_MODES) {
      const { fake, broker, router, document, enter } = isolationSetup(7);
      enter(mode);
      await flushAll();
      const active = router.getActive()!;
      expect(active.mode, mode).toBe(mode);
      expect(view(active.runtime).getCanonicalSectionWords(0), mode).toBeUndefined();
      expect(fake.documentListeners.size, mode).toBe(1);
      let notified = 0;
      active.runtime.subscribe(() => { notified += 1; });

      // A snapshot of another generation (or another document) is ignored.
      const late = bookWordsValue(document);
      fake.publishDocument(createFakeDocument({ documentGeneration: document.documentGeneration + 1, bookWords: late }));
      fake.publishDocument(createFakeDocument({ documentId: "doc-2", bookWords: late }));
      expect(notified, mode).toBe(0);
      expect(view(active.runtime).document, mode).toBe(document);
      expect(view(active.runtime).getCanonicalSectionWords(0), mode).toBeUndefined();

      // Same document, same generation, now with full-book words: adopted, and the binding is notified.
      const withWords = createFakeDocument({ bookWords: late });
      fake.publishDocument(withWords);
      expect(notified, mode).toBeGreaterThan(0);
      expect(view(active.runtime).document.bookWords, mode).toEqual(late);
      expect(view(active.runtime).getCanonicalSectionWords(0), mode).toEqual([...document.tokenWords]);

      // Switch away: the old session released its subscription; a later snapshot reaches only the new one.
      const captured = [...fake.documentListeners];
      enter(PRESENT_MODES.find((m) => m !== mode)!);
      await flushAll();
      const next = router.getActive()!;
      expect(fake.documentListeners.size, mode).toBe(1);
      expect(captured.some((listener) => fake.documentListeners.has(listener)), mode).toBe(false);
      const oldDocument = view(active.runtime).document;
      const oldSnapshot = active.runtime.getSnapshot();
      const notifiedBefore = notified;
      const rejectedBefore = broker.stats.rejected["document.subscribe:callback"] ?? 0;
      const upperWords = document.tokenWords.map((w) => w.toUpperCase());
      const upper = bookWordsValue({ tokenWords: upperWords });
      const later = createFakeDocument({ bookWords: upper });
      fake.publishDocument(later);
      captured.forEach((listener) => listener(later)); // the old session's wrapped callback, invoked anyway
      expect(broker.stats.rejected["document.subscribe:callback"], mode).toBe(rejectedBefore + captured.length);
      expect(notified, mode).toBe(notifiedBefore);
      expect(view(active.runtime).document, mode).toBe(oldDocument);
      expect(view(active.runtime).getCanonicalSectionWords(0), mode).toEqual([...document.tokenWords]);
      expect(active.runtime.getSnapshot(), mode).toEqual(oldSnapshot);
      expect(view(next.runtime).getCanonicalSectionWords(0), mode).toEqual(upperWords);
      router.destroy();
      expect(fake.documentListeners.size, mode).toBe(0);
    }
  });
});

// ── Router module registry (design §C step D3) ────────────────────────────────

describe("reader mode router registry (D3)", () => {
  it("registers the four modes and reaches each only through its index.ts", () => {
    expect(Object.keys(READER_MODE_MODULES)).toEqual(["page", "focus", "flow", "narrate"]);
    expect(READER_MODE_MODULES.page).toBe(pageMode);
    expect(READER_MODE_MODULES.focus).toBe(focusMode);
    expect(READER_MODE_MODULES.flow).toBe(flowMode);
    expect(READER_MODE_MODULES.narrate).toBe(narrateMode);
    for (const [mode, module] of Object.entries(READER_MODE_MODULES)) expect(module.id).toBe(mode);

    const ROUTER = "src/reader/useReaderModeOrchestrator.ts";
    const graph = buildImportGraph({ roots: [ROUTER] }) as unknown as {
      modules: readonly { path: string; edges: readonly { to: string; typeOnly: boolean }[] }[];
    };
    const modeDir = (file: string) => /^src\/reader\/modes\/([^/]+)\//.exec(file)?.[1] ?? null;
    const routerEdges = graph.modules.find((m) => m.path === ROUTER)!.edges;
    expect(routerEdges.filter((e) => modeDir(e.to)).map((e) => e.to).sort()).toEqual(
      ["flow", "focus", "narrate", "page"].map((m) => `src/reader/modes/${m}/index.ts`),
    );
    // Graph-wide: every edge entering a mode directory from outside it lands on that mode's index.ts.
    const crossings = graph.modules.flatMap((m) => m.edges
      .filter((e) => modeDir(e.to) && modeDir(e.to) !== modeDir(m.path))
      .map((e) => `${m.path} -> ${e.to}`));
    expect(crossings.length).toBeGreaterThanOrEqual(4);
    expect(crossings.filter((c) => !c.endsWith("/index.ts"))).toEqual([]);
    // The TypeScript-resolver graph build takes ~3 s alone and 13.6 s under full-suite load (F′ gate, 2026-10-09);
    // the default 10 s timeout measured the machine, not the router. No assertion changes.
  }, 60_000);
});

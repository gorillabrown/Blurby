// READER-MODE-SEPARATION-2 G3 — routing and concurrency.
// Wave B: broker and router-core cases. The named G3 handoff/same-mode/escape tests arrive with the mode trees.
import { describe, expect, it } from "vitest";
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
import { createReaderModeRouter } from "../src/reader/useReaderModeOrchestrator";
import { createFakeDocument, createFakeInfrastructure, type FakeInfrastructure } from "./readerModes/harness/fakePorts";

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

  it("openDocument starts a new generation and closes the old session without a release window", () => {
    const { log, made, fake, broker, router, document } = routerSetup();
    router.select("narrate");
    const narrateKey = router.getActive()!.key;
    log.length = 0;
    router.openDocument({ ...document, position: 0 });
    expect(log).toEqual(["destroy:narrate", "issue:page", "create:page:silent", "select:page:0"]);
    expect(broker.isCurrent(narrateKey)).toBe(false);
    expect(fake.effects).toEqual([]);
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

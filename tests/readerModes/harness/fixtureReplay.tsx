// READER-MODE-SEPARATION-2 G4 — generic fixture replay (design §D.4; rulings Q-F, OC-1, OC-3).
//
// Replays the commands of a committed baseline fixture (read, never written) through
// createReaderModeRouter with only the given (built) mode modules registered, records the
// candidate trace at the declared seams, and compares it with the baseline:
//   Q-F  recompute X = every audio.* effect in a step whose modeBefore and modeAfter are both not
//        narrate; the stored crossOwner flags must equal X; drop X from the baseline; the candidate
//        must emit zero effects matching the same rule.
//   OC-1 in a step whose modeAfter ≠ m, observation <m>Playing must be false; baseline values that
//        differ are recomputed into a dropped-observation list. No other observation is dropped.
//   OC-3 channel alias focusView.jumpToWord → "<mode>.jumpDisplayToWord" (re-attribution only).
// The remainder is serialized with JSON.stringify(_, null, 2) and compared byte-for-byte with the
// recorder's compareFixture logic (copied below).
//
// Seams (each behavior test declares them with vi.mock, pointing at the factories exported here):
//   src/reader/modes/<m>/surface             → recordingSurfaceModule("create<M>Surface")
//   src/reader/modes/<m>/helpers/usePersistentReadingAnchor → recordingAnchorModule(actual, "<m>")
//   src/reader/modes/<m>/FoliateView        → stubFoliateViewModule() (jsdom cannot host foliate)
// Fake infrastructure (audio, persistence, settings) sits behind the real broker, so only accepted
// port calls are recorded. Unrecorded port methods go to non-recording fakes. The shell's
// requestCompletionToPage is wired to the router as the E1 shell wires it: an accepted call comes from
// the active session, so the router queues completion for the active key.
import React, { act, useSyncExternalStore } from "react";
import { createRoot, type Root } from "react-dom/client";
import { readFileSync } from "node:fs";
import { vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../../src/constants";
import type { BlurbySettings } from "../../../src/types";
import {
  createReaderDocumentSnapshot,
  createReaderSettingsSnapshot,
  type ReaderDocumentSnapshot,
  type ReaderSettingsSnapshot,
} from "../../../src/reader/document/ReaderDocumentSnapshot";
import { createReaderPorts, type ReaderPortBroker, type ReaderPortInfrastructure } from "../../../src/reader/ports/createReaderPorts";
import type { ReaderAudioStartResult } from "../../../src/reader/ports/ReaderPorts";
import type { ReaderModeId, ReaderModeModule } from "../../../src/reader/modes/ReaderModeAdapter";
// Type-only: the router module statically registers every mode tree (READER_MODE_MODULES, step D3), and
// the behavior tests' vi.mock factories import this harness while those trees load. A static import here
// would close that cycle (the factory awaits this module, which awaits the mocked tree), so the router
// is loaded lazily inside replayScript.
import type { ReaderModeRouter } from "../../../src/reader/useReaderModeOrchestrator";

export const FIXTURE_DIR = "docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures";

// Fixed inputs, identical to the recorder's (fixtures/record-mode-baselines.recorder.tsx).
const WPM = 300;
const WORDS = (
  "The quick brown fox, having crossed the river, rested. Then it ran again; the hounds " +
  "followed close behind. Finally, night fell over 3 quiet hills."
).split(" ");
const PARAGRAPH_BREAKS = [8, 17];
const DOC_ID = "fixture-doc";

/** OC-3: baseline channel → candidate channel. */
export const CHANNEL_ALIASES: Readonly<Record<string, (mode: ReaderModeId) => string>> = Object.freeze({
  "focusView.jumpToWord": (mode: ReaderModeId) => `${mode}.jumpDisplayToWord`,
});
/** OC-1: the per-mode playing observations. */
const PLAYING_OBSERVATIONS: ReadonlyArray<readonly [ReaderModeId, string]> = [["focus", "focusPlaying"], ["flow", "flowPlaying"]];

interface Effect { channel: string; args: unknown[]; crossOwner?: true }
type Observation = Record<string, unknown>;
interface Step { step: number; command: string; args: Record<string, unknown>; observation: Observation; effects: Effect[] }
export interface Script { name: string; startWord: number; audioStartResults: ReaderAudioStartResult[]; commands: Step[] }
interface Fixture { mode: ReaderModeId; scripts: Script[]; [key: string]: unknown }

// ── JSON-safe copying (recorder toJson) ───────────────────────────────────────
function toJson(value: unknown): unknown {
  if (value === undefined) return "<undefined>";
  if (typeof value === "function") return "<fn>";
  if (value instanceof Set) return { $set: [...value].map(toJson) };
  if (Array.isArray(value)) return value.map(toJson);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = toJson(v);
    }
    return out;
  }
  return value;
}

/** Recorder compareFixture: null when identical, else the first differing line. */
export function compareFixture(expected: string, actual: string): string | null {
  if (expected === actual) return null;
  const a = expected.split("\n");
  const b = actual.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return `line ${i + 1}: expected ${JSON.stringify(a[i])} got ${JSON.stringify(b[i])}`;
  }
  return "differs (length)";
}

export function readFixtureText(mode: ReaderModeId): string {
  return readFileSync(`${FIXTURE_DIR}/${mode}.baseline.json`, "utf-8").replace(/\r\n/g, "\n");
}

// ── Seam sink (test-only module state: the env of the script being replayed) ────
interface ReplayEnv {
  readonly mode: ReaderModeId;
  readonly effects: Effect[];
  loaded: string[];
}
let currentEnv: ReplayEnv | null = null;

function record(channel: string, args: unknown[]): void {
  currentEnv?.effects.push({ channel, args: args.map(toJson) });
}

/**
 * Records a channel from a seam a behavior test spies on itself (design §D.4: `narrateView.applyActiveWord`
 * is the Narrate runtime's applyNarrationActiveWord, spied on its prototype). No-op outside a replay.
 */
export function recordSeam(channel: string, args: unknown[]): void {
  record(channel, args);
}

/**
 * Recording fake for a mode's surface.ts. Method names are the surface vocabulary every mode's
 * surface controller uses; channel methods are recorded, queries answer the fixture's fake values,
 * anything else is an unrecorded no-op.
 */
function createRecordingSurface(): Record<string, unknown> {
  const env = () => currentEnv;
  const known: Record<string, (...args: never[]) => unknown> = {
    highlight: (wordIndex: number, kind?: string, options?: unknown) => {
      record("surface.highlight", [wordIndex, kind, options]);
      return wordIndex < (env()?.loaded.length ?? 0);
    },
    next: () => record("surface.next", []),
    goToSection: (sectionIndex: number) => record("surface.goToSection", [sectionIndex]),
    clearSoftHighlight: () => record("surface.clearSoftHighlight", []),
    clearUserBrowsing: () => record("surface.clearUserBrowsing", []),
    extractWords: () => record("content.extractWords", []),
    returnToHighlight: () => record("pageNav.returnToHighlight", []),
    // Queries (not recorded, as in the recorder).
    isReady: () => true,
    getWords: () => [...(env()?.loaded ?? [])],
    findFirstVisibleWordIndex: () => 0,
    getSectionForWordIndex: () => 0,
    getParagraphBreaks: () => [...PARAGRAPH_BREAKS],
    isUserBrowsing: () => false,
    waitForSectionReady: () => Promise.resolve(0),
    jumpToWordAnchor: () => Promise.resolve(false),
  };
  return new Proxy(known, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
}

export function recordingSurfaceModule(factoryName: string): Record<string, unknown> {
  return { [factoryName]: () => createRecordingSurface() };
}

interface AnchorDeps { jumpDisplayToWord: (i: number) => void }
interface AnchorModule {
  createPersistentReadingAnchor: (state: unknown, deps: AnchorDeps) => {
    commitPersistentWordIndex: (i: number, cause: string, options?: unknown) => number;
    syncVisualToPersistentWord: (options?: unknown) => number;
  };
}

/**
 * Wraps the mode's real createPersistentReadingAnchor; records arguments at call, like the recorder.
 * The `jumpDisplayToWord` dependency is wrapped in place on the deps object the mode passed, so a mode
 * that also calls it directly (legacy reader.jumpToWord call sites) records through the same seam.
 * `mode` names the owning mode directory for the OC-3 alias (default: the fixture's mode).
 */
export function recordingAnchorModule(actual: unknown, mode?: ReaderModeId): Record<string, unknown> {
  const real = actual as AnchorModule;
  return {
    ...(actual as Record<string, unknown>),
    createPersistentReadingAnchor: (state: unknown, deps: AnchorDeps) => {
      const display = deps.jumpDisplayToWord;
      deps.jumpDisplayToWord = (i: number) => {
        if (currentEnv) record(CHANNEL_ALIASES["focusView.jumpToWord"](mode ?? currentEnv.mode), [i]);
        display(i);
      };
      const anchor = real.createPersistentReadingAnchor(state, deps);
      return {
        commitPersistentWordIndex: (i: number, cause: string, options?: unknown) => {
          record("persistence.commitWordIndex", [i, cause, options]);
          return anchor.commitPersistentWordIndex(i, cause, options);
        },
        syncVisualToPersistentWord: (options?: unknown) => {
          record("persistence.syncVisual", [options]);
          return anchor.syncVisualToPersistentWord(options);
        },
      };
    },
  };
}

/** jsdom cannot host foliate (no layout, no ResizeObserver): the mode's FoliateView is a declared seam. */
export function stubFoliateViewModule(): Record<string, unknown> {
  return { default: function StubFoliateView() { return null; } };
}

// ── Fake infrastructure with the fixture's fakeSemantics ──────────────────────
function createReplayInfrastructure(script: Script, document: ReaderDocumentSnapshot, getRouter: () => ReaderModeRouter | null) {
  const startResults = [...script.audioStartResults];
  const audio = { status: "idle", speaking: false, warming: false, cursorWordIndex: 0 };
  let wordCb: ((i: number) => void) | null = null;
  let truthCb: ((i: number) => void) | null = null;
  let settings = { ...(DEFAULT_SETTINGS as unknown as BlurbySettings), readingMode: "page", lastReadingMode: "flow", isNarrating: false } as BlurbySettings;
  let wpm = WPM;
  const snapshotSettings = (): ReaderSettingsSnapshot => createReaderSettingsSnapshot({
    settings, wpm, effectiveWpm: wpm, focusTextSize: DEFAULT_SETTINGS.focusTextSize, isEink: false, isMac: false,
  });
  let settingsSnapshot = snapshotSettings();
  const rec = (channel: string) => (...args: unknown[]) => record(channel, args);
  const noop = () => undefined;

  const infra: ReaderPortInfrastructure = {
    settings: {
      read: () => settingsSnapshot,
      update: (patch) => { record("settings.update", [patch]); settings = { ...settings, ...patch } as BlurbySettings; settingsSnapshot = snapshotSettings(); },
      setWpm: (value) => { record("settings.setWpm", [value]); wpm = value; settingsSnapshot = snapshotSettings(); },
    },
    persistence: {
      updateDocProgress: rec("persistence.updateDocProgress"),
      updateProgress: rec("persistence.updateProgress"),
      recordCfi: noop, markEngaged: noop, markPageActivity: noop, scheduleRelocateSave: noop,
    },
    document: {
      snapshot: () => document,
      readBookBytes: () => new Promise<ArrayBuffer>(() => {}),
      ensureBookWords: () => new Promise(() => {}),
      subscribe: () => noop,
    },
    audio: {
      readState: () => ({ status: audio.status as never, speaking: audio.speaking, warming: audio.warming, kokoroLoading: false, cursorWordIndex: audio.cursorWordIndex, pauseReason: null, rate: 1 }),
      start: (words, wordIndex, rate, onWord) => {
        record("audio.start", [words, wordIndex, rate]);
        const result = startResults.length > 1 ? startResults.shift()! : startResults[0];
        wordCb = onWord;
        audio.cursorWordIndex = wordIndex;
        audio.status = result === "started" ? "speaking" : result;
        audio.speaking = result === "started";
        audio.warming = result === "warming";
        return result;
      },
      pause: (...a) => { record("audio.pause", a); audio.status = "paused"; audio.speaking = false; },
      resume: (...a: unknown[]) => { record("audio.resume", a); audio.status = "speaking"; audio.speaking = true; audio.warming = false; },
      stop: (...a) => { record("audio.stop", a); audio.status = "idle"; audio.speaking = false; audio.warming = false; wordCb = null; },
      setOnTruthSync: (cb) => { record("audio.setOnTruthSync", [cb ? "<fn>" : null]); truthCb = cb; },
      setPageEndWord: rec("audio.setPageEndWord"),
      resync: (wordIndex, rate) => { record("audio.resync", [wordIndex, rate]); audio.cursorWordIndex = wordIndex; },
      setOnChunkBoundary: noop, setOnSegmentStart: noop, setOnSectionEnd: noop, updateWords: noop, adjustRate: noop,
      resolveHighlightSync: () => undefined, getAudioProgress: () => null, updateCacheCursor: noop, configure: noop,
    },
    diagnostics: { record: noop, transition: noop, trace: noop },
    shell: {
      reportRelocate: noop, reportToc: noop, reportFlowProgress: noop, reportEinkContentChange: noop,
      requestCompletionToPage: () => {
        const router = getRouter();
        const active = router?.getActive();
        if (router && active) router.requestCompletionToPage(active.key);
      },
      requestCrossBook: noop,
    },
  };
  return {
    infra,
    getSettings: () => settingsSnapshot,
    persistedSettings: () => ({ readingMode: settings.readingMode, lastReadingMode: settings.lastReadingMode, isNarrating: settings.isNarrating }),
    audioObservation: () => ({ status: audio.status, cursorWordIndex: audio.cursorWordIndex }),
    emitWord: (i: number) => { audio.cursorWordIndex = i; wordCb?.(i); },
    emitTruth: (i: number) => { audio.cursorWordIndex = i; truthCb?.(i); },
  };
}

// ── The active-mode view (the E1 shell's <ActiveModeView/>, minimal) ───────────
function ActiveModeView({ router, modules }: { router: ReaderModeRouter; modules: Partial<Record<ReaderModeId, ReaderModeModule>> }) {
  useSyncExternalStore(router.subscribe, router.getSnapshot);
  const active = router.getActive();
  if (!active) return null;
  const View = modules[active.mode]!.View;
  return <View key={active.key.session} runtime={active.runtime} />;
}

const flushPromises = () => Promise.resolve().then(() => Promise.resolve());

/** Optional replay instrumentation (e.g. a throwing audio infrastructure, a counting broker). */
export interface ReplayOptions {
  /** Replaces the fake infrastructure the real broker forwards to (recording fakes stay the observers). */
  readonly infra?: (infra: ReaderPortInfrastructure) => ReaderPortInfrastructure;
  /** Wraps the real broker the router uses. */
  readonly broker?: (broker: ReaderPortBroker) => ReaderPortBroker;
}

async function replayScript(
  mode: ReaderModeId,
  script: Script,
  modules: Partial<Record<ReaderModeId, ReaderModeModule>>,
  options: ReplayOptions,
): Promise<Script> {
  const open = script.commands[0];
  if (open?.command !== "openDocument") throw new Error(`${script.name}: first command must be openDocument`);
  const document = createReaderDocumentSnapshot({
    documentId: DOC_ID, documentGeneration: 0, title: "Fixture", author: null, coverPath: null,
    filepath: "/fixture.epub", useFoliate: true, wordCount: WORDS.length, position: script.startWord, cfi: null,
    tokenWords: WORDS, paragraphBreaks: PARAGRAPH_BREAKS, bookWords: null, pronunciationOverrides: [],
  });
  const env: ReplayEnv = { mode, effects: [], loaded: open.args.surfaceLoaded === false ? [] : [...WORDS] };
  let routerRef: ReaderModeRouter | null = null;
  const fake = createReplayInfrastructure(script, document, () => routerRef);
  const { createReaderModeRouter } = await import("../../../src/reader/useReaderModeOrchestrator");
  const broker = createReaderPorts(options.infra ? options.infra(fake.infra) : fake.infra);
  const router = createReaderModeRouter({
    modules, broker: options.broker ? options.broker(broker) : broker, getDocument: () => document, getSettings: fake.getSettings,
  });
  routerRef = router;
  const observe = (): Observation => {
    const active = router.getActive()!;
    const s = active.runtime.getSnapshot();
    return {
      readingMode: active.mode,
      focusPlaying: active.mode === "focus" ? s.playing : false,
      flowPlaying: active.mode === "flow" ? s.playing : false,
      isNarrating: active.mode === "narrate" ? s.narrating : false,
      isBrowsedAway: s.isBrowsedAway,
      highlightedWordIndex: s.highlightedWordIndex,
      publishedWordIndex: s.publishedWordIndex,
      canonicalWordIndex: s.canonicalWordIndex,
      persistedSettings: fake.persistedSettings(),
      audio: fake.audioObservation(),
    };
  };

  currentEnv = env;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ now: 0, toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "Date"] });
  const container = window.document.createElement("div");
  window.document.body.appendChild(container);
  let root: Root | null = null;
  let mounted = false;
  const steps: Step[] = [];
  try {
    for (const cmd of script.commands) {
      env.effects.length = 0;
      const a = cmd.args as Record<string, number & string>;
      await act(async () => {
        switch (cmd.command) {
          case "openDocument":
            router.openDocument(document);
            root = createRoot(container);
            root.render(<ActiveModeView router={router} modules={modules} />);
            mounted = true;
            break;
          case "selectMode":
            if (a.mode === "page") router.pauseToPage();
            else router.select(a.mode as "focus" | "flow" | "narrate");
            break;
          case "togglePlay": router.togglePlay(); break;
          case "hardSelect": router.hardSelect({ globalWordIndex: a.wordIndex, cfi: null, word: WORDS[a.wordIndex] ?? "" }); break;
          case "advanceTime": vi.advanceTimersByTime(a.ms); break;
          case "audioWordAdvance": fake.emitWord(a.wordIndex); break;
          case "audioTruthSync": fake.emitTruth(a.wordIndex); break;
          case "surfaceLoadsWords": env.loaded = [...WORDS]; break;
          case "teardown": root!.unmount(); router.destroy(); mounted = false; break;
          default: throw new Error(`${script.name}: unknown command ${cmd.command}`);
        }
        await flushPromises();
      });
      steps.push({ step: cmd.step, command: cmd.command, args: cmd.args, observation: mounted ? observe() : { mounted: false }, effects: env.effects.map((e) => ({ ...e })) });
    }
  } finally {
    if (mounted && root) act(() => { root!.unmount(); router.destroy(); });
    container.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
    currentEnv = null;
  }
  return { name: script.name, startWord: script.startWord, audioStartResults: script.audioStartResults, commands: steps };
}

// ── Comparison ────────────────────────────────────────────────────────────────
const modeOf = (observation: Observation | undefined): string | null =>
  observation && observation.mounted !== false ? (observation.readingMode as string) : null;

/** Q-F rule: indexes of audio.* effects in steps where neither modeBefore nor modeAfter is narrate. */
function crossOwnerSet(script: Script): Set<string> {
  const out = new Set<string>();
  script.commands.forEach((step, i) => {
    const before = i === 0 ? null : modeOf(script.commands[i - 1].observation);
    const after = step.observation.mounted === false ? before : modeOf(step.observation);
    if (before === "narrate" || after === "narrate") return;
    step.effects.forEach((effect, j) => { if (effect.channel.startsWith("audio.")) out.add(`${script.name}#${step.step}#${j}`); });
  });
  return out;
}

export interface ReplayComparison {
  /** Instrument and rule violations (stored-flag mismatch, candidate cross-owner effects, OC-1 candidate violations). */
  readonly errors: string[];
  /** null when the remainder is byte-identical; else the first differing line. */
  readonly diff: string | null;
  readonly droppedEffects: ReadonlyArray<{ script: string; step: number; channel: string }>;
  readonly droppedObservations: ReadonlyArray<{ script: string; step: number; field: string; baseline: unknown }>;
  readonly expectedText: string;
  readonly actualText: string;
}

export interface ReplayResult extends ReplayComparison {
  /** The recorded candidate trace (reusable with compareReplay for negative controls). */
  readonly candidateScripts: readonly Script[];
}

export function compareReplay(baselineText: string, candidateInput: readonly Script[]): ReplayComparison {
  const baseline = JSON.parse(baselineText) as Fixture;
  const candidateScripts = JSON.parse(JSON.stringify(candidateInput)) as Script[];
  const errors: string[] = [];
  const droppedEffects: Array<{ script: string; step: number; channel: string }> = [];
  const droppedObservations: Array<{ script: string; step: number; field: string; baseline: unknown }> = [];

  // Q-F (1)–(3) on the baseline.
  for (const script of baseline.scripts) {
    const x = crossOwnerSet(script);
    const stored = new Set<string>();
    script.commands.forEach((step) => step.effects.forEach((e, j) => { if (e.crossOwner) stored.add(`${script.name}#${step.step}#${j}`); }));
    const missing = [...x].filter((id) => !stored.has(id));
    const extra = [...stored].filter((id) => !x.has(id));
    if (missing.length || extra.length) errors.push(`Q-F instrument check (${script.name}): recomputed-but-unflagged [${missing.join(", ")}], flagged-but-not-recomputed [${extra.join(", ")}]`);
    for (const step of script.commands) {
      step.effects = step.effects.filter((e, j) => {
        if (!x.has(`${script.name}#${step.step}#${j}`)) return true;
        droppedEffects.push({ script: script.name, step: step.step, channel: e.channel });
        return false;
      });
    }
  }

  // Q-F (4) on the candidate; OC-3 alias back to the baseline channel name (any mode's display seam).
  const modes: readonly ReaderModeId[] = ["page", "focus", "flow", "narrate"];
  const aliases = new Map(modes.flatMap((m) => Object.entries(CHANNEL_ALIASES).map(([from, to]) => [to(m), from] as const)));
  const candidate = candidateScripts.map((script) => {
    for (const id of crossOwnerSet(script)) errors.push(`Q-F candidate emitted a cross-owner effect: ${id}`);
    return {
      ...script,
      commands: script.commands.map((step) => ({
        ...step,
        effects: step.effects.map((e) => ({ channel: aliases.get(e.channel) ?? e.channel, args: e.args })),
      })),
    };
  });

  // OC-1 on both sides.
  const applyOc1 = (scripts: Script[], side: "baseline" | "candidate") => {
    for (const script of scripts) {
      script.commands.forEach((step, i) => {
        const before = i === 0 ? null : modeOf(script.commands[i - 1].observation);
        const after = step.observation.mounted === false ? before : modeOf(step.observation);
        for (const [m, field] of PLAYING_OBSERVATIONS) {
          if (!(field in step.observation) || after === m || step.observation[field] === false) continue;
          if (side === "candidate") errors.push(`OC-1 candidate ${script.name} step ${step.step}: ${field} must be false while ${after} is active`);
          else droppedObservations.push({ script: script.name, step: step.step, field, baseline: step.observation[field] });
          step.observation[field] = false;
        }
      });
    }
  };
  applyOc1(baseline.scripts, "baseline");
  applyOc1(candidate, "candidate");

  // Q-F (5): strip crossOwner keys, serialize, compare byte-for-byte.
  const strip = (scripts: Script[]) => scripts.map((script) => ({
    ...script,
    commands: script.commands.map((step) => ({ ...step, effects: step.effects.map(({ channel, args }) => ({ channel, args })) })),
  }));
  const expectedText = JSON.stringify({ ...baseline, scripts: strip(baseline.scripts) }, null, 2) + "\n";
  const actualText = JSON.stringify({ ...baseline, scripts: strip(candidate) }, null, 2) + "\n";
  return { errors, diff: compareFixture(expectedText, actualText), droppedEffects, droppedObservations, expectedText, actualText };
}

/** Replays every script of the mode's committed fixture and compares it (baselineText overrides the file for negative controls). */
export async function replayFixture(
  mode: ReaderModeId,
  modules: Partial<Record<ReaderModeId, ReaderModeModule>>,
  baselineText: string = readFixtureText(mode),
  options: ReplayOptions = {},
): Promise<ReplayResult> {
  const baseline = JSON.parse(baselineText) as Fixture;
  if (baseline.mode !== mode) throw new Error(`fixture is for ${baseline.mode}, not ${mode}`);
  const candidate: Script[] = [];
  for (const script of baseline.scripts) candidate.push(await replayScript(mode, script, modules, options));
  return { ...compareReplay(baselineText, candidate), candidateScripts: candidate };
}

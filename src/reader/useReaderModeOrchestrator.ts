import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { BlurbySettings, ReaderMode } from "../types";
import type { TtsEvalTraceSink } from "../types/eval";
import {
  createInitialHandoff,
  createReaderModeHandoff,
  type ReaderDocumentSnapshot,
  type ReaderModeHandoff,
  type ReaderModeHandoffInput,
  type ReaderSessionKey,
  type ReaderSettingsSnapshot,
} from "./document/ReaderDocumentSnapshot";
import type {
  ReaderHardSelectInput,
  ReaderModeArrival,
  ReaderModeCommand,
  ReaderModeId,
  ReaderModeModule,
  ReaderModeRuntime,
  ReaderModeRuntimeSnapshotV1,
  ReaderModeSpeed,
  ReaderModeStopReason,
} from "./modes/ReaderModeAdapter";
import { createReaderPorts, type ReaderPortBroker, type ReaderPortInfrastructure } from "./ports/createReaderPorts";
import { pageMode } from "./modes/page/index";
import { focusMode } from "./modes/focus/index";
import { flowMode } from "./modes/flow/index";
import { narrateMode } from "./modes/narrate/index";

// ── React wrapper (READER-MODE-SEPARATION-2, step E1) ────────────────────────
// A thin binding over createReaderModeRouter + READER_MODE_MODULES (design §A.6). It owns one broker and
// one router per mount and keeps the handler names the shell passes to ReaderBottomBar and useReaderKeys.
// It holds no mode state: every intent is forwarded to the router, which forwards to the active runtime.

export interface UseReaderModeOrchestratorParams {
  /** Shell-owned infrastructure the broker forwards accepted port calls to (a stable object). */
  readonly infrastructure: ReaderPortInfrastructure;
  /** The current document snapshot (read at each mount). */
  readonly getDocument: () => ReaderDocumentSnapshot;
  /** The current settings snapshot (read at each mount). */
  readonly getSettings: () => ReaderSettingsSnapshot;
  /** settings.lastReadingMode (mode cycling is a shell settings write, not a mode effect). */
  readonly lastReadingMode: ReaderMode | undefined;
  readonly updateSettings: (patch: Partial<BlurbySettings>) => void;
  readonly evalTrace?: TtsEvalTraceSink | null;
  /** Defaults to READER_MODE_MODULES. */
  readonly modules?: Readonly<Partial<Record<ReaderModeId, ReaderModeModule>>>;
}

export interface UseReaderModeOrchestratorReturn {
  readonly router: ReaderModeRouter;
  /** null until a document is open. */
  readonly snapshot: ReaderToolbarSnapshot | null;
  readonly active: ReaderActiveMode | null;
  handleTogglePlay: () => void;
  handleSelectMode: (mode: "focus" | "flow" | "narrate") => void;
  handlePauseToPage: () => void;
  handleEnterFocus: () => void;
  handleEnterFlow: () => void;
  handleEnterNarrate: () => void;
  /** N key: flow → narrate, narrate → flow (explicit router transitions). */
  handleToggleNarration: () => void;
  handleExitToPage: () => void;
  handleHardSelect: (input: ReaderHardSelectInput) => void;
  handleNavigateTo: (wordIndex: number) => void;
  handleJumpBack: () => void;
  adjustSpeed: (delta: number) => void;
  handleCommand: (command: ReaderModeCommand) => void;
  handleSetSpeed: (speed: ReaderModeSpeed) => void;
  handleCycleMode: () => void;
  handleCycleAndStart: () => void;
}

export function useReaderModeOrchestrator(params: UseReaderModeOrchestratorParams): UseReaderModeOrchestratorReturn {
  const { infrastructure, getDocument, getSettings, lastReadingMode, updateSettings, evalTrace, modules } = params;

  // One broker and one router per mount. The router reads the document and settings through the getters
  // at each mount, so it is created once (StrictMode may build a second, side-effect-free copy).
  const [router] = useState(() => createReaderModeRouter({
    modules: modules ?? READER_MODE_MODULES,
    broker: createReaderPorts(infrastructure),
    getDocument: () => getDocument(),
    getSettings: () => getSettings(),
  }));
  // Unmount: broker.closeAll(), then runtime.destroy(). The shell reopens its document on remount.
  useEffect(() => () => router.destroy(), [router]);

  const snapshot = useSyncExternalStore(router.subscribe, router.getSnapshot);
  const active = router.getActive();

  const getNextSelectableMode = useCallback((current: ReaderMode): "focus" | "flow" | "narrate" => {
    if (current === "focus") return "flow";
    if (current === "flow") return "narrate";
    return "focus";
  }, []);

  const handleSelectMode = useCallback((target: "focus" | "flow" | "narrate") => {
    const fromMode = router.getActive()?.mode;
    if (!fromMode || fromMode === target) return;
    router.select(target);
    if (evalTrace?.enabled) {
      evalTrace.record({
        kind: "transition",
        transition: "handoff",
        from: fromMode,
        to: target,
        context: "mode-switch-persistent-anchor-paused",
        latencyMs: 0,
      });
    }
  }, [evalTrace, router]);

  const handleEnterFocus = useCallback(() => handleSelectMode("focus"), [handleSelectMode]);
  const handleEnterFlow = useCallback(() => handleSelectMode("flow"), [handleSelectMode]);
  const handleEnterNarrate = useCallback(() => handleSelectMode("narrate"), [handleSelectMode]);

  const handleToggleNarration = useCallback(() => {
    const mode = router.getActive()?.mode;
    if (mode === "flow") {
      handleSelectMode("narrate");
    } else if (mode === "narrate") {
      handleSelectMode("flow");
    }
  }, [handleSelectMode, router]);

  const handlePauseToPage = useCallback(() => {
    const fromMode = router.getActive()?.mode;
    router.pauseToPage();
    if (evalTrace?.enabled && fromMode && fromMode !== "page") {
      evalTrace.record({
        kind: "transition",
        transition: "handoff",
        from: fromMode,
        to: "page",
        context: "mode-switch-anchor-preserved",
        latencyMs: 0,
      });
    }
  }, [evalTrace, router]);

  const handleTogglePlay = useCallback(() => router.togglePlay(), [router]);
  const handleExitToPage = useCallback(() => router.exitToPage(), [router]);
  const handleHardSelect = useCallback((input: ReaderHardSelectInput) => router.hardSelect(input), [router]);
  const handleNavigateTo = useCallback((wordIndex: number) => router.navigateTo(wordIndex), [router]);
  const handleJumpBack = useCallback(() => router.jumpBack(), [router]);
  const adjustSpeed = useCallback((delta: number) => router.adjustSpeed(delta), [router]);
  const handleCommand = useCallback((command: ReaderModeCommand) => router.command(command), [router]);
  const handleSetSpeed = useCallback((speed: ReaderModeSpeed) => router.setSpeed(speed), [router]);

  const handleCycleMode = useCallback(() => {
    const current = lastReadingMode || "flow";
    const next = getNextSelectableMode(current);
    updateSettings({ lastReadingMode: next });
  }, [getNextSelectableMode, lastReadingMode, updateSettings]);

  const handleCycleAndStart = useCallback(() => {
    const mode = router.getActive()?.mode ?? "page";
    const current = mode === "page" ? (lastReadingMode || "flow") : mode;
    const next = getNextSelectableMode(current);
    handleSelectMode(next);
  }, [getNextSelectableMode, handleSelectMode, lastReadingMode, router]);

  return {
    router,
    snapshot,
    active,
    handleTogglePlay,
    handleSelectMode,
    handlePauseToPage,
    handleEnterFocus,
    handleEnterFlow,
    handleEnterNarrate,
    handleToggleNarration,
    handleExitToPage,
    handleHardSelect,
    handleNavigateTo,
    handleJumpBack,
    adjustSpeed,
    handleCommand,
    handleSetSpeed,
    handleCycleMode,
    handleCycleAndStart,
  };
}

// ── Thin router core (READER-MODE-SEPARATION-2, Wave B) ──────────────────────
// Built beside the legacy hook in Waves B–D (DD-1); since E1 the hook above is a thin wrapper around it.
// A transition hands off copied values only: export → invalidate → teardown(stop, destroy) →
// issue → create → publish → select. The incoming runtime never holds a reference to the outgoing one.

/** The router's module registry (Wave D, step D3): each mode is reached only through its index.ts. */
export const READER_MODE_MODULES = { page: pageMode, focus: focusMode, flow: flowMode, narrate: narrateMode };

export interface ReaderModeRouterOptions {
  readonly modules: Readonly<Partial<Record<ReaderModeId, ReaderModeModule>>>;
  readonly broker: ReaderPortBroker;
  readonly getDocument: () => ReaderDocumentSnapshot;
  readonly getSettings: () => ReaderSettingsSnapshot;
}

export interface ReaderActiveMode {
  readonly mode: ReaderModeId;
  readonly runtime: ReaderModeRuntime;
  readonly key: ReaderSessionKey;
}

export interface ReaderToolbarSnapshot {
  readonly readingMode: ReaderModeId;
  readonly playing: boolean;
  readonly narrating: boolean;
  /** Legacy canonicalWordAnchor = persistentWordIndex state. */
  readonly currentWordIndex: number;
  readonly highlightedWordIndex: number;
  readonly isBrowsedAway: boolean;
  readonly speed: ReaderModeSpeed | null;
  readonly flowProgress: ReaderModeRuntimeSnapshotV1["flowProgress"];
}

export interface ReaderModeRouter {
  /** null until a document is open. */
  getActive(): ReaderActiveMode | null;
  /** Same object between notifications; null until a document is open. */
  getSnapshot(): ReaderToolbarSnapshot | null;
  subscribe(listener: () => void): () => void;
  /** New generation → Page, arrival "silent", initial handoff. */
  openDocument(doc: ReaderDocumentSnapshot): void;
  /** Legacy handleSelectMode; selecting the active mode is a no-op. */
  select(target: "focus" | "flow" | "narrate"): void;
  /** Legacy handlePauseToPage. */
  pauseToPage(): void;
  /** Legacy handleExitReader, non-page branch. */
  exitToPage(): void;
  /** Legacy onComplete (Focus/Flow end of words): queued, dropped if the key is no longer current. */
  requestCompletionToPage(key: ReaderSessionKey): void;
  togglePlay(): void;
  hardSelect(input: ReaderHardSelectInput): void;
  navigateTo(wordIndex: number): void;
  jumpBack(): void;
  adjustSpeed(delta: number): void;
  setSpeed(speed: ReaderModeSpeed): void;
  command(command: ReaderModeCommand): void;
  /** Forwarded to the active runtime only. */
  applySettings(settings: ReaderSettingsSnapshot): void;
  /**
   * Cross-book auto-resume (legacy useFlowScrollSync effect 2, Flow part): once the next book has
   * opened in Page, enter Flow without the select arrival effects (legacy startFlow from Page) and
   * start it. No-op unless Page is active.
   */
  resumeFlowAfterBookOpen(): void;
  /** broker.closeAll(), then runtime.destroy(). Idempotent. */
  destroy(): void;
}

export function createReaderModeRouter(options: ReaderModeRouterOptions): ReaderModeRouter {
  const { modules, broker, getDocument, getSettings } = options;
  let active: ReaderActiveMode | null = null;
  let snapshot: ReaderToolbarSnapshot | null = null;
  let unsubscribeRuntime: (() => void) | null = null;
  const listeners = new Set<() => void>();

  function refresh(): void {
    const s = active?.runtime.getSnapshot();
    snapshot = active && s
      ? Object.freeze({
        readingMode: active.mode,
        playing: s.playing,
        narrating: s.narrating,
        currentWordIndex: s.publishedWordIndex,
        highlightedWordIndex: s.highlightedWordIndex,
        isBrowsedAway: s.isBrowsedAway,
        speed: s.speed,
        flowProgress: s.flowProgress,
      })
      : null;
    for (const listener of [...listeners]) listener();
  }

  function detach(): ReaderActiveMode | null {
    const out = active;
    unsubscribeRuntime?.();
    unsubscribeRuntime = null;
    active = null;
    return out;
  }

  function moduleFor(mode: ReaderModeId): ReaderModeModule {
    const module = modules[mode];
    if (!module) throw new Error(`createReaderModeRouter: no module registered for "${mode}"`);
    return module;
  }

  function mount(mode: ReaderModeId, document: ReaderDocumentSnapshot, handoff: ReaderModeHandoff, arrival: ReaderModeArrival): void {
    const module = moduleFor(mode);
    const { key, ports } = broker.issue(mode);
    const runtime = module.createRuntime({ key, ports, document, settings: getSettings(), handoff, arrival });
    active = { mode, runtime, key };
    unsubscribeRuntime = runtime.subscribe(refresh);
    refresh();
    runtime.select(handoff.canonicalWordIndex);
  }

  function transition(
    target: ReaderModeId,
    arrival: ReaderModeArrival,
    capture: "persistent" | "capture-current",
    stopReason: ReaderModeStopReason,
    adjust: (handoff: ReaderModeHandoffInput) => ReaderModeHandoffInput = (handoff) => handoff,
  ): void {
    const out = active;
    if (!out) return;
    moduleFor(target);
    const handoff = createReaderModeHandoff(adjust({ ...out.runtime.exportHandoff(capture), source: out.key }));
    broker.invalidate(out.key);
    broker.teardown(out.key, () => {
      out.runtime.stop(stopReason, { destination: target });
      out.runtime.destroy();
    });
    detach();
    mount(target, getDocument(), handoff, arrival);
  }

  function closeAll(release: boolean): void {
    // openDocument (the shell stays mounted): same order as a transition, so the outgoing session's release
    // calls (Narrate's audio.stop) reach infrastructure instead of leaving the old book's audio running
    // (Decision #23). destroy (unmount): no release window; B0 recorded none and useNarration's own unmount
    // cleanup stops audio.
    const out = detach();
    if (out && release) {
      broker.invalidate(out.key);
      broker.teardown(out.key, () => {
        out.runtime.stop("user-stop");
        out.runtime.destroy();
      });
    }
    broker.closeAll();
    if (out && !release) out.runtime.destroy();
  }

  return {
    getActive: () => active,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    openDocument(doc) {
      closeAll(true);
      broker.openDocument(doc.documentId);
      const total = doc.bookWords?.totalWords || doc.wordCount || doc.tokenWords.length;
      mount("page", doc, createInitialHandoff(doc, total), "silent");
    },
    select(target) {
      if (!active || active.mode === target) return;
      transition(target, "select", "persistent", "mode-switch");
    },
    pauseToPage() {
      if (!active) return;
      if (active.mode === "page") {
        active.runtime.select(active.runtime.getSnapshot().canonicalWordIndex);
        return;
      }
      transition("page", "pause-to-page", "capture-current", "mode-switch");
    },
    exitToPage() {
      if (!active || active.mode === "page") return;
      transition("page", "silent", "persistent", "user-stop", (h) => ({ ...h, highlightedWordIndex: h.publishedWordIndex }));
    },
    requestCompletionToPage(key) {
      queueMicrotask(() => {
        if (!active || active.mode === "page" || !broker.isCurrent(key)) return;
        transition("page", "silent", "capture-current", "user-stop");
      });
    },
    togglePlay: () => active?.runtime.togglePlay(),
    hardSelect: (input) => active?.runtime.hardSelect(input),
    navigateTo: (wordIndex) => active?.runtime.navigateTo(wordIndex),
    jumpBack: () => active?.runtime.jumpBack(),
    adjustSpeed: (delta) => active?.runtime.adjustSpeed(delta),
    setSpeed: (speed) => active?.runtime.setSpeed(speed),
    command: (command) => active?.runtime.handleCommand(command),
    applySettings: (settings) => active?.runtime.applySettings(settings),
    resumeFlowAfterBookOpen() {
      if (!active || active.mode !== "page") return;
      transition("flow", "silent", "persistent", "mode-switch");
      active?.runtime.start({ cause: "resume-after-book" });
    },
    destroy() {
      if (!active) return;
      closeAll(false);
      refresh();
    },
  };
}

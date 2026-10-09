import { useCallback } from "react";
import { useReaderMode, type UseReaderModeParams } from "../hooks/useReaderMode";
import { logDualSourceTransition } from "../utils/dualSourceDiag";
import type { ReaderMode } from "../types";
import {
  createInitialHandoff,
  createReaderModeHandoff,
  type ReaderDocumentSnapshot,
  type ReaderModeHandoff,
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
import type { ReaderPortBroker } from "./ports/createReaderPorts";

function toCompatibilityMode(mode: ReaderMode): "page" | "focus" | "flow" {
  return mode === "narrate" ? "flow" : mode;
}

export type UseReaderModeOrchestratorParams = UseReaderModeParams;

export interface UseReaderModeOrchestratorReturn {
  stopAllModes: () => void;
  startFocus: () => void;
  startFlow: (options?: { resumeNarration?: boolean; targetMode?: "flow" | "narrate" }) => void;
  toggleNarrationInFlow: () => void;
  handleTogglePlay: () => void;
  handleSelectMode: (mode: "focus" | "flow" | "narrate") => void;
  handlePauseToPage: () => void;
  handleEnterFocus: () => void;
  handleEnterFlow: () => void;
  handleStopTts: () => void;
  handleReturnToReading: () => void;
  handleCycleMode: () => void;
  handleCycleAndStart: () => void;
  preCapWpmRef: React.MutableRefObject<number | null>;
}

export function useReaderModeOrchestrator(params: UseReaderModeOrchestratorParams): UseReaderModeOrchestratorReturn {
  const {
    modeInstance,
    narration,
    readingMode,
    setReadingMode,
    flowPlaying,
    setFocusPlaying,
    setFlowPlaying,
    isBrowsedAway,
    setIsBrowsedAway,
    setIsNarrating,
    pendingNarrationResumeRef,
    pageNavRef,
    resumeAnchorRef,
    setHighlightedWordIndex,
    commitPersistentWordIndex,
    updateSettings,
    settings,
    syncVisualToPersistentWord,
    queuePostModeAnchorSync,
    evalTrace,
  } = params;

  const mode = useReaderMode(params);
  const {
    stopAllModes,
    startFocus,
    startFlow,
    toggleNarrationInFlow,
    captureCurrentAnchor,
    clearNarrateTruthSync,
    handleStopTts,
    handleReturnToReading,
    isNarratingRef,
    highlightedWordIndexRef,
    readingModeRef,
    preCapWpmRef,
  } = mode;

  const compatibilityMode = toCompatibilityMode(readingMode);

  const getNextSelectableMode = useCallback((current: ReaderMode): "focus" | "flow" | "narrate" => {
    if (current === "focus") return "flow";
    if (current === "flow") return "narrate";
    return "focus";
  }, []);

  const handleSelectMode = useCallback((target: "focus" | "flow" | "narrate") => {
    const fromMode = readingModeRef.current;
    if (fromMode === target) return;
    pendingNarrationResumeRef.current = false;
    stopAllModes();
    setFocusPlaying(false);
    setFlowPlaying(false);
    setIsNarrating(false);
    const anchor = syncVisualToPersistentWord({ navigate: false });
    queuePostModeAnchorSync(anchor, target);
    setIsBrowsedAway(false);
    setReadingMode(target);
    updateSettings({
      readingMode: target,
      lastReadingMode: target,
      isNarrating: false,
    });
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
  }, [
    evalTrace,
    pendingNarrationResumeRef,
    readingModeRef,
    setFlowPlaying,
    setFocusPlaying,
    setIsBrowsedAway,
    setIsNarrating,
    setReadingMode,
    stopAllModes,
    syncVisualToPersistentWord,
    queuePostModeAnchorSync,
    updateSettings,
  ]);

  const handleEnterFocus = useCallback(() => handleSelectMode("focus"), [handleSelectMode]);
  const handleEnterFlow = useCallback(() => handleSelectMode("flow"), [handleSelectMode]);

  const handlePauseToPage = useCallback(() => {
    const fromMode = readingModeRef.current;
    captureCurrentAnchor();
    if (isBrowsedAway && compatibilityMode === "flow" && isNarratingRef.current) {
      const pageStart = pageNavRef.current.getCurrentPageStart?.();
      if (pageStart != null) {
        setHighlightedWordIndex(pageStart);
        highlightedWordIndexRef.current = pageStart;
        resumeAnchorRef.current = pageStart;
        // NARRATE-DUAL-SOURCE-DIAG-1: resumeAnchor:set (useReaderModeOrchestrator — pause-to-page)
        logDualSourceTransition("resumeAnchor:set", () => ({
          resumeAnchor: pageStart,
          source: "useReaderModeOrchestrator:handlePauseToPage",
        }));
      }
      setIsBrowsedAway(false);
    }
    if (compatibilityMode === "flow" && isNarratingRef.current) {
      pendingNarrationResumeRef.current = true;
    }
    if (isNarratingRef.current) {
      narration.stop("mode-switch");
      clearNarrateTruthSync();
      setIsNarrating(false);
      updateSettings({ isNarrating: false });
    }
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
    if (evalTrace?.enabled && fromMode !== "page") {
      evalTrace.record({
        kind: "transition",
        transition: "handoff",
        from: fromMode,
        to: "page",
        context: "mode-switch-anchor-preserved",
        latencyMs: 0,
      });
    }
  }, [
    captureCurrentAnchor,
    clearNarrateTruthSync,
    compatibilityMode,
    evalTrace,
    highlightedWordIndexRef,
    isBrowsedAway,
    isNarratingRef,
    narration,
    pageNavRef,
    pendingNarrationResumeRef,
    readingModeRef,
    resumeAnchorRef,
    setHighlightedWordIndex,
    setIsBrowsedAway,
    setIsNarrating,
    setReadingMode,
    stopAllModes,
    updateSettings,
  ]);

  const handleTogglePlay = useCallback(() => {
    if (readingMode === "page") {
      return;
    }

    if (readingMode === "focus") {
      const focusInstance = modeInstance.modeRef.current;
      const isFocusPlaying = focusInstance?.type === "focus" && focusInstance.getState().isPlaying;
      if (isFocusPlaying) {
        captureCurrentAnchor();
        modeInstance.pauseMode();
        setFocusPlaying(false);
        return;
      }
      if (focusInstance?.type === "focus") {
        setFocusPlaying(true);
        modeInstance.resumeMode();
        return;
      }
      startFocus();
      return;
    }

    if (readingMode === "flow") {
      if (flowPlaying) {
        modeInstance.pauseMode();
        setFlowPlaying(false);
        return;
      }
      startFlow();
      return;
    }

    if (readingMode === "narrate") {
      const narrationSpeaking = narration.speaking === true || narration.status === "speaking" || narration.status === "holding";
      const narrationPaused = isNarratingRef.current && !narrationSpeaking;

      if (isNarratingRef.current && narrationSpeaking) {
        const anchor = narration.cursorWordIndex;
        const clampedAnchor = commitPersistentWordIndex(anchor, "mode-advance", {
          persist: false,
          publishState: true,
          navigate: false,
          syncVisual: true,
        });
        resumeAnchorRef.current = clampedAnchor;
        logDualSourceTransition("resumeAnchor:set", () => ({
          resumeAnchor: clampedAnchor,
          source: "useReaderModeOrchestrator:handleTogglePlay:narrate-pause",
        }));
        highlightedWordIndexRef.current = clampedAnchor;
        setHighlightedWordIndex(clampedAnchor);
        setFlowPlaying(false);
        narration.pause("user-stop");
        setIsNarrating(true);
        updateSettings({
          readingMode: "narrate",
          lastReadingMode: "narrate",
          isNarrating: true,
        });
        return;
      }

      if (narrationPaused) {
        narration.resume();
        setIsNarrating(true);
        updateSettings({
          readingMode: "narrate",
          lastReadingMode: "narrate",
          isNarrating: true,
        });
        return;
      }

      startFlow({ resumeNarration: true, targetMode: "narrate" });
    }
  }, [
    captureCurrentAnchor,
    commitPersistentWordIndex,
    flowPlaying,
    highlightedWordIndexRef,
    isNarratingRef,
    modeInstance,
    narration,
    readingMode,
    resumeAnchorRef,
    setFlowPlaying,
    setFocusPlaying,
    setHighlightedWordIndex,
    setIsNarrating,
    startFlow,
    startFocus,
    updateSettings,
  ]);

  const handleCycleMode = useCallback(() => {
    const current = settings.lastReadingMode || "flow";
    const next = getNextSelectableMode(current);
    updateSettings({ lastReadingMode: next });
  }, [getNextSelectableMode, settings.lastReadingMode, updateSettings]);

  const handleCycleAndStart = useCallback(() => {
    const current = readingModeRef.current === "page"
      ? (settings.lastReadingMode || "flow")
      : readingModeRef.current;
    const next = getNextSelectableMode(current);
    handleSelectMode(next);
  }, [getNextSelectableMode, handleSelectMode, readingModeRef, settings.lastReadingMode]);

  return {
    stopAllModes,
    startFocus,
    startFlow,
    toggleNarrationInFlow,
    handleTogglePlay,
    handleSelectMode,
    handlePauseToPage,
    handleEnterFocus,
    handleEnterFlow,
    handleStopTts,
    handleReturnToReading,
    handleCycleMode,
    handleCycleAndStart,
    preCapWpmRef,
  };
}

// ── Thin router core (READER-MODE-SEPARATION-2, Wave B) ──────────────────────
// Built beside the legacy hook above (DD-1); the hook becomes a wrapper around this core at E1.
// A transition hands off copied values only: export → invalidate → teardown(stop, destroy) →
// issue → create → publish → select. The incoming runtime never holds a reference to the outgoing one.

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
    adjust: (handoff: ReaderModeHandoff) => ReaderModeHandoff = (handoff) => handoff,
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

  function closeAll(): void {
    broker.closeAll();
    detach()?.runtime.destroy();
  }

  return {
    getActive: () => active,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    openDocument(doc) {
      closeAll();
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
    destroy() {
      if (!active) return;
      closeAll();
      refresh();
    },
  };
}

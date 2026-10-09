/**
 * Focus mode runtime (READER-MODE-SEPARATION-2 design §B.2). Implements ReaderModeRuntime v1.
 *
 * Focus owns the RSVP engine (FocusMode, relocated), its start delay, the Focus display index and
 * the per-word anchor commits the legacy ReaderContainer ran for focus. Everything outside the mode
 * goes through its ports (never audio: the broker issues Focus a throwing audio port, and the legacy
 * audio calls in stopAllModes/createInstance were cross-owner effects); everything DOM-side goes
 * through its own surface controller. After stop/destroy every call is a no-op and every pending
 * continuation is dropped (LL-109).
 *
 * Not copied (OC-9, Q-A): the dead RSVP progress-save effect, useReader's RAF tick/startPlayback/
 * togglePlay/requestExit (and the escPending they drive), and the background-cacher cursor update.
 */
import type { MutableRefObject } from "react";
import type { ReadingMode, ModeConfig, ModeState } from "../../../modes/ModeInterface";
import {
  FOCUS_MODE_START_DELAY_MS,
  FOLIATE_SECTION_LOAD_WAIT_MS,
  MAX_WPM,
  MIN_WPM,
  PUNCTUATION_PAUSE_MS,
} from "../../../constants";
import {
  READER_MODE_RUNTIME_CONTRACT_VERSION,
  type ReaderHardSelectInput,
  type ReaderModeAdapter,
  type ReaderModeArrival,
  type ReaderModeCommand,
  type ReaderModeCreateInput,
  type ReaderModeId,
  type ReaderModeJumpCause,
  type ReaderModeRuntime,
  type ReaderModeRuntimeSnapshot,
  type ReaderModeRuntimeSnapshotV1,
  type ReaderModeSpeed,
  type ReaderModeStartRequest,
  type ReaderModeStartRequestV1,
  type ReaderModeStopReason,
} from "../ReaderModeAdapter";
import {
  createReaderModeHandoff,
  freezeValue,
  numberArrayToSet,
  type ReaderDocumentSnapshot,
  type ReaderModeHandoff,
  type ReaderSessionKey,
  type ReaderSettingsSnapshot,
} from "../../document/ReaderDocumentSnapshot";
import type { ReaderPorts } from "../../ports/ReaderPorts";
import type { SectionBoundary } from "../../../types/narration";
import type { FocusFoliateViewAPI } from "./FoliateView";
import { FocusModeState, type FocusWordUpdateCallback } from "./ModeState";
import { createFocusSurface, type FocusSurface } from "./surface";
import {
  createPersistentReadingAnchor,
  type PersistentReadingAnchor,
  type PersistentReadingAnchorDeps,
} from "./helpers/usePersistentReadingAnchor";
import {
  resolveBookOpenInitialCfi,
  shouldClearBrowseAwayOnAnchorEvent,
  shouldConsumeResumeAnchorOnAdvance,
  shouldPersistRelocateProgress,
  shouldWriteRelocateCfi,
} from "./helpers/persistentReadingAnchor";
import { resolveCanonicalWordAnchor, resolveFoliateStartWord, resolveModeStartWordIndex } from "./helpers/startWordIndex";
import { calculatePauseMs } from "./helpers/rhythm";
import { findSectionForWord } from "./helpers/narration";

/**
 * FocusMode — RSVP (Rapid Serial Visual Presentation). (Relocated from src/modes/FocusMode.ts.)
 *
 * Displays one word at a time in the center of the screen at WPM speed.
 * Uses setTimeout chain (not setInterval) so each word can have a different
 * duration based on rhythm pauses (commas, sentences, paragraphs, numbers,
 * longer words).
 *
 * Visual rendering (centered word, ORP highlight, focus marks) is handled
 * by ReaderView.tsx via the onWordAdvance callback.
 */
export class FocusMode implements ReadingMode {
  readonly type = "focus" as const;
  private currentWord: number = 0;
  private config: ModeConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private playing: boolean = false;
  private paragraphBreaks: Set<number>;

  constructor(config: ModeConfig) {
    this.config = config;
    this.paragraphBreaks = config.paragraphBreaks || new Set();
  }

  start(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.playing = true;
    this.config.callbacks.onWordAdvance(wordIndex); // Show starting word first
    this.scheduleNext();
  }

  pause(): void {
    this.playing = false;
    this.clearTimer();
  }

  resume(): void {
    if (!this.playing) {
      this.playing = true;
      this.scheduleNext();
    }
  }

  stop(): void {
    this.playing = false;
    this.clearTimer();
  }

  getCurrentWord(): number {
    return this.currentWord;
  }

  setSpeed(wpm: number): void {
    this.config.wpm = wpm;
    // If playing, the next scheduled timeout will use the new speed
    // (no need to clear/restart — the current timeout is for the current word)
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.config.callbacks.onWordAdvance(wordIndex);
    // If playing, restart the timer chain from the new position
    if (this.playing) {
      this.clearTimer();
      this.scheduleNext();
    }
  }

  getState(): ModeState {
    return {
      type: "focus",
      isPlaying: this.playing,
      currentWordIndex: this.currentWord,
      effectiveWpm: this.config.wpm,
    };
  }

  updateWords(words: string[]): void {
    this.config.words = words;
  }

  destroy(): void {
    this.clearTimer();
    this.playing = false;
  }

  /**
   * Estimate time remaining from current position to end of document.
   */
  getTimeRemaining(totalWords: number): number {
    const wordsLeft = Math.max(0, totalWords - this.currentWord);
    const msPerWord = 60000 / this.config.wpm;
    // Add ~20% overhead for rhythm pauses (rough estimate)
    return wordsLeft * msPerWord * 1.2;
  }

  // ── Internal ─────────────────────────────────────────────────────

  private scheduleNext(): void {
    if (!this.playing) return;
    if (this.currentWord < 0) {
      this.currentWord = 0;
    }
    if (this.currentWord >= this.config.words.length - 1) {
      this.stop();
      this.config.callbacks.onComplete();
      return;
    }

    const word = this.config.words[this.currentWord];
    const baseMs = 60000 / this.config.wpm;
    const isParagraphEnd = this.paragraphBreaks.has(this.currentWord);

    // Calculate rhythm pause for current word
    let pauseMs = 0;
    if (this.config.settings.rhythmPauses) {
      pauseMs = calculatePauseMs(
        word,
        this.config.settings.rhythmPauses,
        PUNCTUATION_PAUSE_MS,
        isParagraphEnd
      );
    }

    const totalMs = baseMs + pauseMs;

    this.timer = setTimeout(() => {
      this.currentWord++;
      this.config.callbacks.onWordAdvance(this.currentWord);
      this.scheduleNext(); // Chain — next word may have different duration
    }, totalMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/** (Relocated from src/reader/modes/FocusModeAdapter.ts; legacy adapter contract, kept for its suite.) */
export interface FocusModeAdapterConfig {
  wpm: number;
  isFoliate: boolean;
  settings: {
    rhythmPauses?: any;
    focusSpan?: number;
    focusMarks?: boolean;
  };
  onWordAdvance?: (wordIndex: number) => void;
  onComplete?: () => void;
}

export class FocusModeAdapter implements ReaderModeAdapter {
  readonly mode: ReaderModeId = "focus";

  private instance: FocusMode | null = null;
  private _selected = false;
  private _playing = false;
  private _currentWordIndex = 0;
  private config: FocusModeAdapterConfig;

  constructor(config: FocusModeAdapterConfig) {
    this.config = config;
  }

  select(wordIndex: number): void {
    this._selected = true;
    this._currentWordIndex = wordIndex;
  }

  start(request: ReaderModeStartRequest): void {
    if (this.instance) {
      this.instance.destroy();
    }

    this._selected = true;
    this._playing = true;
    this._currentWordIndex = request.wordIndex;

    const modeConfig: ModeConfig = {
      words: request.words,
      wpm: this.config.wpm,
      callbacks: {
        onWordAdvance: (idx: number) => {
          this._currentWordIndex = idx;
          if (this._playing) {
            this.config.onWordAdvance?.(idx);
          }
        },
        onPageTurn: () => {},
        onComplete: () => {
          this._playing = false;
          this.config.onComplete?.();
        },
        onError: () => {},
      },
      isFoliate: this.config.isFoliate,
      paragraphBreaks: request.paragraphBreaks,
      settings: {
        rhythmPauses: this.config.settings.rhythmPauses,
        focusSpan: this.config.settings.focusSpan,
        focusMarks: this.config.settings.focusMarks,
      },
    };

    this.instance = new FocusMode(modeConfig);
    this.instance.start(request.wordIndex);
  }

  pause(): void {
    if (this.instance && this._playing) {
      this.instance.pause();
      this._playing = false;
    }
  }

  resume(): void {
    if (this.instance && !this._playing && this._selected) {
      this.instance.resume();
      this._playing = true;
    }
  }

  stop(
    _reason: "mode-switch" | "user-stop" | "book-close" | "teardown"
  ): void {
    if (this.instance) {
      this.instance.stop();
      this.instance.destroy();
      this.instance = null;
    }
    this._playing = false;
    this._selected = false;
  }

  jumpToWord(
    wordIndex: number,
    _cause: "hard-selection" | "navigation" | "restore"
  ): void {
    this._currentWordIndex = wordIndex;
    if (this.instance) {
      this.instance.jumpTo(wordIndex);
    }
  }

  getSnapshot(): ReaderModeRuntimeSnapshot {
    return {
      mode: "focus",
      selected: this._selected,
      playing: this._playing,
      currentWordIndex: this._currentWordIndex,
      clockOwner: this._playing ? "wpm" : "none",
    };
  }

  setSpeed(wpm: number): void {
    this.config.wpm = wpm;
    if (this.instance) {
      this.instance.setSpeed(wpm);
    }
  }

  destroy(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
    this._playing = false;
    this._selected = false;
  }
}

/** Legacy onLoad delay (ReaderContainer: "Slightly longer delay to ensure foliate has finished rendering"). */
const FOCUS_SURFACE_LOAD_DELAY_MS = 200;
/** Legacy useFoliateSync effect 3 goToSection throttle. */
const FOCUS_SECTION_SYNC_THROTTLE_MS = 200;

/** Frozen inputs are kept as-is; anything else is deep-copied and frozen first. */
function own<T>(value: T) {
  return Object.isFrozen(value) ? value : freezeValue(value);
}

export class FocusModeRuntime implements ReaderModeRuntime {
  readonly mode = "focus" as const;
  readonly contractVersion = READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  readonly document: ReaderDocumentSnapshot;
  /** Populated by this mode's FoliateView while it is mounted. */
  readonly viewApiRef: MutableRefObject<FocusFoliateViewAPI | null> = { current: null };
  /** resolveBookOpenInitialCfi over the handoff (the view's initial location). */
  readonly initialCfi: string | null;
  private readonly ports: ReaderPorts;
  private readonly arrival: ReaderModeArrival;
  private readonly state: FocusModeState;
  private readonly surface: FocusSurface;
  /** The anchor's dependencies; legacy direct reader.jumpToWord calls go through the same display seam. */
  private readonly anchorDeps: PersistentReadingAnchorDeps;
  private readonly anchor: PersistentReadingAnchor;
  private settingsSnapshot: ReaderSettingsSnapshot;
  /** Legacy useReader wpmRef: the latest value this runtime asked the shell to store. */
  private wpm: number;
  private engine: FocusMode | null = null;
  /** The words the engine runs over (legacy wordsRef for the overlay's direct DOM update). */
  private engineWords: string[] = [];
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private readonly rafs = new Set<number>();
  private alive = true;
  private destroyed = false;

  constructor(input: ReaderModeCreateInput) {
    this.key = input.key;
    this.ports = input.ports;
    this.arrival = input.arrival;
    this.document = own(input.document) as ReaderDocumentSnapshot;
    this.settingsSnapshot = own(input.settings) as ReaderSettingsSnapshot;
    this.wpm = this.settingsSnapshot.wpm;
    const handoff = createReaderModeHandoff(input.handoff);
    this.state = new FocusModeState(handoff);
    this.initialCfi = resolveBookOpenInitialCfi({ persistentWordIndex: handoff.canonicalWordIndex, cfi: handoff.cfi });
    this.surface = createFocusSurface(this.viewApiRef);
    this.anchorDeps = {
      documentId: this.document.documentId,
      totalWordCount: () => this.totalWordCount(),
      jumpDisplayToWord: (wordIndex) => this.jumpDisplayToWord(wordIndex),
      persistence: this.ports.persistence,
      diagnostics: this.ports.diagnostics,
    };
    this.anchor = createPersistentReadingAnchor(this.state, this.anchorDeps);
  }

  // ── Store ──────────────────────────────────────────────────────────────────
  subscribe = (listener: () => void): (() => void) => this.state.subscribe(listener);
  getVersion = (): number => this.state.version;

  get settings(): ReaderSettingsSnapshot {
    return this.settingsSnapshot;
  }

  getSnapshot(): ReaderModeRuntimeSnapshotV1 {
    const s = this.state;
    return Object.freeze({
      mode: this.mode,
      selected: s.selected,
      playing: s.playing,
      currentWordIndex: s.currentWordIndex,
      clockOwner: s.playing ? "wpm" as const : "none" as const,
      contractVersion: this.contractVersion,
      key: this.key,
      highlightedWordIndex: s.publishedHighlightedWordIndex,
      publishedWordIndex: s.publishedWordIndex,
      canonicalWordIndex: s.canonicalWordIndex,
      isBrowsedAway: s.isBrowsedAway,
      narrating: false,
      speed: Object.freeze({ kind: "wpm" as const, wpm: this.wpm }),
      flowProgress: null,
    });
  }

  /** RSVP display values for the overlay (legacy useReader.wordIndex and the effective words). */
  getDisplay(): { readonly wordIndex: number; readonly words: readonly string[] } {
    return { wordIndex: this.state.displayWordIndex, words: this.effectiveWords() };
  }

  /** Legacy onWordUpdateRef registration by the overlay (null unregisters). */
  setWordUpdateCallback = (callback: FocusWordUpdateCallback | null): void => {
    this.state.onWordUpdate = callback;
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  select(wordIndex: number): void {
    if (!this.alive) return;
    const reselect = this.state.selected;
    this.state.selected = true;
    this.state.currentWordIndex = wordIndex;
    if (!reselect && this.arrival === "select") {
      // Legacy handleSelectMode: syncVisualToPersistentWord({ navigate: false }) → queuePostModeAnchorSync
      // → setIsBrowsedAway(false) → updateSettings(...). (stopAllModes' audio calls are cross-owner.)
      this.anchor.syncVisualToPersistentWord({ navigate: false });
      this.state.isBrowsedAway = false;
      this.ports.settings.update({ readingMode: "focus", lastReadingMode: "focus", isNarrating: false });
      this.queuePostModeAnchorSync();
    }
    this.state.notify();
  }

  /** Legacy useReaderMode.startFocus. */
  start(_request: ReaderModeStartRequestV1): void {
    if (!this.alive) return;
    const s = this.state;
    // stopAllModes (Focus's own part): drop the pending start, stop the engine, clear playing/browse.
    s.pendingStartToken = null;
    s.pendingStartOnLoad = false;
    this.stopEngine();
    s.playing = false;
    s.isBrowsedAway = false;
    this.surface.clearSoftHighlight();
    this.markEngaged();
    if (this.document.useFoliate) {
      if (!this.surface.isReady() && this.document.tokenWords.length === 0) {
        // Design §F.2: this mode's view has not loaded yet — wait for its first section, never next().
        s.pendingStartOnLoad = true;
        s.notify();
        return;
      }
      this.surface.extractWords();
    }
    const effectiveWords = [...this.effectiveWords()];
    if (this.document.useFoliate && effectiveWords.length === 0 && this.surface.isReady()) {
      this.surface.next();
      this.setTimer(() => {
        this.surface.extractWords();
        const words = this.effectiveWords();
        if (words.length > 0) this.start(_request);
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      s.notify();
      return;
    }
    const bookWordsTotalWords = this.document.bookWords?.totalWords;
    const focusStartSource = this.consumeModeStartAnchor();
    let startWord = this.document.useFoliate
      ? resolveFoliateStartWord(
        focusStartSource,
        effectiveWords.length,
        () => this.surface.findFirstVisibleWordIndex(),
        bookWordsTotalWords,
      )
      : focusStartSource;
    if (this.document.useFoliate && startWord >= effectiveWords.length && effectiveWords.length > 0
      && !(bookWordsTotalWords != null && startWord < bookWordsTotalWords)) {
      const firstVisible = this.surface.findFirstVisibleWordIndex();
      startWord = firstVisible >= 0 ? firstVisible : 0;
    }
    if (this.document.useFoliate && startWord !== s.highlightedWordIndex) this.publishHighlight(startWord);
    this.anchorDeps.jumpDisplayToWord(startWord); // reader.jumpToWord(startWord)
    s.playing = true;
    this.ports.settings.update({ readingMode: "focus", lastReadingMode: "focus", isNarrating: false });
    const paragraphBreaks = this.document.useFoliate ? this.surface.getParagraphBreaks() : this.document.paragraphBreaks;
    const token = Symbol("focus-start");
    s.pendingStartToken = token;
    this.setTimer(() => {
      if (this.state.pendingStartToken !== token) return;
      this.state.pendingStartToken = null;
      this.startEngine(startWord, effectiveWords, paragraphBreaks);
    }, FOCUS_MODE_START_DELAY_MS);
    s.notify();
  }

  pause(): void {
    if (!this.alive) return;
    this.state.pendingStartToken = null;
    this.state.pendingStartOnLoad = false;
    if (this.engine?.getState().isPlaying) {
      this.captureCurrentAnchor();
      this.engine.pause();
    }
    this.state.playing = false;
    this.state.notify();
  }

  resume(): void {
    if (!this.alive || !this.engine) return;
    this.state.playing = true;
    this.engine.resume();
    this.state.notify();
  }

  /** Legacy handleTogglePlay, focus branch. */
  togglePlay(): void {
    if (!this.alive) return;
    if (this.engine?.getState().isPlaying) {
      this.captureCurrentAnchor();
      this.engine.pause();
      this.state.playing = false;
      this.state.notify();
      return;
    }
    if (this.engine) {
      this.resume();
      return;
    }
    this.start({ cause: "space" });
  }

  stop(_reason: ReaderModeStopReason, _context?: { readonly destination: ReaderModeId }): void {
    if (!this.alive) return;
    this.alive = false;
    this.clearTimers();
    this.state.pendingStartToken = null;
    this.state.pendingStartOnLoad = false;
    this.state.onWordUpdate = null;
    this.stopEngine();
    this.state.playing = false;
    this.state.selected = false;
    this.state.notify();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.stop("teardown");
    this.destroyed = true;
  }

  jumpToWord(wordIndex: number, _cause: ReaderModeJumpCause): void {
    if (!this.alive) return;
    if (this.engine) {
      this.engine.jumpTo(wordIndex); // advances through onEngineWordAdvance
      return;
    }
    this.state.currentWordIndex = wordIndex;
    this.state.notify();
  }

  exportHandoff(capture: "persistent" | "capture-current"): ReaderModeHandoff {
    const s = this.state;
    // Legacy captureCurrentAnchor, focus branch: the engine's current word becomes the highlight.
    const highlighted = capture === "capture-current" && this.engine
      ? this.engine.getCurrentWord()
      : s.publishedHighlightedWordIndex;
    return createReaderModeHandoff({
      source: this.key,
      canonicalWordIndex: s.canonicalWordIndex,
      publishedWordIndex: s.publishedWordIndex,
      highlightedWordIndex: highlighted,
      softWordIndex: s.softWordIndex,
      resumeAnchor: s.resumeAnchor,
      explicitSelectionAnchor: s.explicitSelectionAnchor,
      cfi: s.cfi,
      // input.engaged || this session's engagement: `engaged` is seeded from the handoff.
      engaged: s.engaged,
    });
  }

  applySettings(next: ReaderSettingsSnapshot): void {
    if (!this.alive) return;
    // The running engine keeps the WPM it started with (legacy: buildConfig is captured per instance
    // and modeInstance.setSpeed has no production caller).
    this.settingsSnapshot = own(next) as ReaderSettingsSnapshot;
    this.wpm = this.settingsSnapshot.wpm;
    this.state.notify();
  }

  /** Speed dialog: arrives with the speed amendment (design §E, step S4). */
  setSpeed(_speed: ReaderModeSpeed): void { /* not yet wired */ }

  // ── User intents ──────────────────────────────────────────────────────────
  /** Legacy FoliatePageView onWordClick (resolved and unresolved paths) + retargetActiveModeToWord. */
  hardSelect(input: ReaderHardSelectInput): void {
    if (!this.alive) return;
    const s = this.state;
    this.markEngaged();
    this.ports.persistence.markPageActivity();
    s.userExplicitSelection = true; // TTS-7J (BUG-130): mark explicit user choice
    this.surface.clearSoftHighlight(); // SELECTION-1: hard click clears soft highlight
    s.cfi = input.cfi;
    if (input.cfi) this.ports.persistence.recordCfi(input.cfi);
    const resolved = this.resolveClickedGlobalWordIndex(input.sectionIndex, input.wordOffsetInSection, input.globalWordIndex);
    if (resolved != null) {
      // NARRATE-INTENT-CURSOR-1: a click always writes a clean one-shot anchor.
      s.resumeAnchor = null;
      s.resumeAnchor = resolved;
      this.ports.diagnostics.transition("resumeAnchor:set", () => ({
        resumeAnchor: resolved,
        source: "ReaderContainer:onWordClick:click-to-narrate",
      }));
      s.explicitSelectionAnchor = resolved;
      // commitSharedWordAnchor(resolved, "hard-selection", cfi, { skipNarrationResync: true })
      const anchored = this.commitShared(resolved, "hard-selection", input.cfi);
      // retargetActiveModeToWord, focus branch: only a playing Focus retargets its engine.
      if (s.playing) this.engine?.jumpTo(anchored);
      if (shouldClearBrowseAwayOnAnchorEvent({ type: "hard-selection", wordIndex: anchored })) {
        this.surface.clearUserBrowsing();
        s.isBrowsedAway = false;
      }
      s.notify();
      return;
    }
    s.resumeAnchor = null; // TTS-7M: explicit selection with no index clears stale anchors
    this.ports.diagnostics.transition("resumeAnchor:consumed", () => ({
      resumeAnchor: null,
      source: "ReaderContainer:onWordClick:no-resolved-index",
    }));
    this.ports.diagnostics.record(
      "selection-validated",
      `no exact index for "${input.word}" — preserved anchor ${s.highlightedWordIndex}`,
    );
    s.notify();
  }

  /** Chapter prev/next/jump (legacy commitSharedWordAnchor, explicit-navigation; no engine retarget). */
  navigateTo(wordIndex: number): void {
    if (!this.alive) return;
    this.commitShared(wordIndex, "explicit-navigation", undefined);
    this.state.notify();
  }

  /** Legacy handleJumpBackToPersistentWord. */
  jumpBack(): void {
    if (!this.alive) return;
    const anchor = this.state.canonicalWordIndex;
    this.anchor.syncVisualToPersistentWord({ navigate: true });
    if (this.document.useFoliate) void this.surface.jumpToWordAnchor(anchor);
    this.state.isBrowsedAway = false;
    this.state.notify();
  }

  /** Legacy adjustSpeed, non-narration branch (useReader.adjustWpm). */
  adjustSpeed(delta: number): void {
    if (!this.alive) return;
    this.wpm = Math.max(MIN_WPM, Math.min(MAX_WPM, this.wpm + delta));
    this.ports.settings.setWpm(this.wpm);
    this.state.notify();
  }

  handleCommand(command: ReaderModeCommand): void {
    if (!this.alive) return;
    switch (command.kind) {
      case "seek-words": {
        // useReader.seekWords: moves the Focus display only (the engine keeps its own cursor).
        const words = this.effectiveWords();
        this.state.displayWordIndex = Math.max(0, Math.min(words.length - 1, this.state.displayWordIndex + command.delta));
        break;
      }
      case "go-to-href":
        // Legacy handleJumpToChapter foliate branch.
        this.markEngaged();
        this.ports.persistence.markPageActivity();
        this.surface.goTo(command.href);
        break;
      default:
        return; // flow-line / page keyboard commands belong to other modes.
    }
    this.state.notify();
  }

  // ── View events (bound by useModeBindings) ────────────────────────────────
  /** Legacy ReaderContainer onRelocate, focus branches (soft selection is page-only). */
  onRelocate = (detail: { readonly cfi: string; readonly fraction: number }): void => {
    if (!this.alive || !detail.cfi) return;
    const s = this.state;
    const fraction = detail.fraction || 0;
    this.ports.shell.reportRelocate({ cfi: detail.cfi, fraction }); // e-ink page turn + fraction (shell)
    const approxWordIdx = Math.floor(fraction * (this.document.wordCount || 0));
    const isBrowsingAway = this.surface.isUserBrowsing();
    if (shouldWriteRelocateCfi({ mode: "focus", userBrowsing: isBrowsingAway })) {
      s.cfi = detail.cfi;
      this.ports.persistence.recordCfi(detail.cfi);
    }
    // TTS-7M (BUG-135): when a resume anchor is active, passive relocate must not move the highlight.
    const hasResumeAnchor = s.resumeAnchor != null;
    if (!hasResumeAnchor) {
      this.publishHighlight(approxWordIdx);
    } else {
      this.ports.diagnostics.transition("resumeAnchor:active-skip", () => ({
        resumeAnchor: s.resumeAnchor,
        approxWordIdx,
        mode: "focus",
        source: "ReaderContainer:onRelocate",
      }));
    }
    s.notify();
    const shouldPersistRelocate = shouldPersistRelocateProgress({
      mode: "focus",
      hasEngaged: s.engaged,
      hasResumeAnchor,
      userBrowsing: isBrowsingAway,
    });
    if (!shouldPersistRelocate) return;
    this.ports.persistence.markPageActivity();
    const progressAnchor = resolveCanonicalWordAnchor({
      readingMode: "focus",
      resumeAnchor: s.resumeAnchor,
      highlightedWordIndex: s.highlightedWordIndex,
      softWordIndex: s.softWordIndex,
      focusWordIndex: s.displayWordIndex,
    });
    // High-water pages and the debounced CFI save stay in the shell.
    this.ports.persistence.scheduleRelocateSave({ wordIndex: progressAnchor, cfi: detail.cfi });
  };

  /** Legacy ReaderContainer onLoad, scrolled-surface branch: bump the render version after 200 ms. */
  onSurfaceLoad = (): void => {
    if (!this.alive) return;
    this.setTimer(() => {
      this.state.renderVersion += 1;
      this.state.notify();
      // Design §F.2: a start that waited for this view now runs.
      if (this.state.pendingStartOnLoad) {
        this.state.pendingStartOnLoad = false;
        this.start({ cause: "play-button" });
      }
    }, FOCUS_SURFACE_LOAD_DELAY_MS);
  };

  /** Legacy onWordsReextracted: bump the render version; without full-book words, refresh the engine's words. */
  onWordsReextracted = (): void => {
    if (!this.alive) return;
    const words = this.surface.getWords();
    if (!words?.length) return;
    this.state.renderVersion += 1;
    if (!this.document.bookWords) {
      this.engineWords = [...words];
      this.engine?.updateWords(this.engineWords);
    }
    this.state.notify();
  };

  onWordClick = (cfi: string, word: string, sectionIndex?: number, wordOffsetInSection?: number, globalWordIndex?: number): void => {
    this.hardSelect({ cfi, word, sectionIndex, wordOffsetInSection, globalWordIndex });
  };

  onTocReady = (toc: unknown[], sectionCount: number): void => {
    if (!this.alive) return;
    // Only plain values cross to the shell.
    this.ports.shell.reportToc(freezeValue(JSON.parse(JSON.stringify(toc)) as unknown[]), sectionCount);
  };

  /** Legacy handleFoliateUserBrowseAway. */
  onUserBrowseAway = (): void => {
    if (!this.alive || this.state.isBrowsedAway) return;
    this.state.isBrowsedAway = true;
    this.state.notify();
  };

  /** Legacy useFoliateSync effect 1 tick (setIsBrowsedAway(isUserBrowsing())). */
  pollBrowsing = (): void => {
    if (!this.alive) return;
    const browsing = this.surface.isUserBrowsing();
    if (browsing === this.state.isBrowsedAway) return;
    this.state.isBrowsedAway = browsing;
    this.state.notify();
  };

  /** Legacy useFoliateSync effect 3: follow the published highlight across sections (throttled). */
  syncSection = (): void => {
    if (!this.alive || !this.document.useFoliate || !this.document.bookWords) return;
    const s = this.state;
    const sec = findSectionForWord(this.document.bookWords.sections as SectionBoundary[], s.publishedHighlightedWordIndex);
    if (!sec) return;
    if (sec.sectionIndex !== s.currentSection) {
      const now = Date.now();
      if (now - s.lastGoToSectionTime < FOCUS_SECTION_SYNC_THROTTLE_MS) return;
      s.currentSection = sec.sectionIndex;
      s.lastGoToSectionTime = now;
      this.surface.goToSection(sec.sectionIndex);
    }
  };

  readBookBytes = (): Promise<ArrayBuffer> => this.ports.document.readBookBytes();

  recordDiagnostic = (kind: string, detail: string): void => {
    if (this.alive) this.ports.diagnostics.record(kind, detail);
  };

  /** Canonical extractor words for a section, when full-book words exist (SRL-067). */
  getCanonicalSectionWords = (sectionIndex: number): string[] | undefined => {
    const bookWords = this.document.bookWords;
    const section = bookWords?.sections.find((entry) => entry.sectionIndex === sectionIndex);
    return bookWords && section ? bookWords.words.slice(section.startWordIdx, section.endWordIdx) : undefined;
  };

  /** Legacy foliateRenderVersion (bumped after each section load). */
  getRenderVersion(): number {
    return this.state.renderVersion;
  }

  // ── Private ────────────────────────────────────────────────────────────────
  /** useReadingModeInstance.startMode("focus", …) + createInstance focus branch. */
  private startEngine(startWord: number, words: string[], paragraphBreaks: readonly number[]): void {
    if (!this.alive) return;
    this.stopEngine();
    this.engineWords = words;
    const settings = this.settingsSnapshot.settings;
    const config: ModeConfig = {
      words,
      wpm: this.settingsSnapshot.effectiveWpm,
      callbacks: {
        onWordAdvance: (idx: number) => this.onEngineWordAdvance(idx),
        onPageTurn: () => { /* Handled by foliate */ },
        onComplete: () => this.onEngineComplete(),
        onError: () => { /* Logged elsewhere */ },
      },
      isFoliate: this.document.useFoliate,
      paragraphBreaks: numberArrayToSet(paragraphBreaks),
      settings: {
        rhythmPauses: settings.rhythmPauses,
        ttsRate: settings.ttsRate,
        ttsEngine: settings.ttsEngine,
        ttsVoiceName: settings.ttsVoiceName ?? undefined,
        focusSpan: settings.focusSpan,
        focusMarks: settings.focusMarks,
        flowCursorStyle: settings.flowCursorStyle ?? undefined,
      },
    };
    Object.freeze(config.callbacks);
    this.engine = new FocusMode(config);
    this.engine.start(startWord);
  }

  /** createInstance focus branch (jumpToWord then onWordAdvance) + ReaderContainer onWordAdvance. */
  private onEngineWordAdvance(idx: number): void {
    if (!this.alive) return;
    const s = this.state;
    this.anchorDeps.jumpDisplayToWord(idx);
    // NARRATE-INTENT-CURSOR-1 (A4 fix): consume the one-shot anchor once playback advances past it.
    if (shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: s.resumeAnchor, advancedWordIndex: idx })) {
      s.resumeAnchor = null;
      this.ports.diagnostics.transition("resumeAnchor:consumed", () => ({
        resumeAnchor: null,
        approxWordIdx: idx,
        source: "ReaderContainer:onWordAdvance:advance-past",
      }));
    }
    s.explicitSelectionAnchor = null;
    s.highlightedWordIndex = idx;
    this.anchor.commitPersistentWordIndex(idx, "mode-advance", {
      persist: false,
      publishState: false,
      navigate: false,
      syncVisual: false,
    });
    this.publishHighlight(idx);
    s.currentWordIndex = idx;
    // ReaderView direct DOM update (Focus never narrates).
    const wordText = this.document.bookWords ? this.document.bookWords.words[idx] : this.engineWords[idx];
    if (s.onWordUpdate && wordText) s.onWordUpdate(wordText, idx);
    s.notify();
  }

  /** Legacy onComplete: setFocusPlaying(false); setReadingMode("page") — the router owns the switch. */
  private onEngineComplete(): void {
    if (!this.alive) return;
    this.state.playing = false;
    this.state.notify();
    this.ports.shell.requestCompletionToPage();
  }

  /** Legacy consumeModeStartAnchor. */
  private consumeModeStartAnchor(): number {
    const s = this.state;
    const startAnchor = resolveModeStartWordIndex(
      s.explicitSelectionAnchor,
      s.resumeAnchor,
      s.canonicalWordIndex,
      s.highlightedWordIndex,
      s.softWordIndex,
    );
    s.explicitSelectionAnchor = null;
    s.resumeAnchor = startAnchor;
    this.ports.diagnostics.transition("resumeAnchor:set", () => ({
      resumeAnchor: startAnchor,
      source: "useReaderMode:mode-change",
    }));
    return startAnchor;
  }

  /** Legacy captureCurrentAnchor, focus branch. */
  private captureCurrentAnchor(): void {
    if (this.engine) this.publishHighlight(this.engine.getCurrentWord());
  }

  /** Legacy queuePostModeAnchorSync + its double-RAF effect. */
  private queuePostModeAnchorSync(): void {
    const first = requestAnimationFrame(() => {
      this.rafs.delete(first);
      if (!this.alive) return;
      const second = requestAnimationFrame(() => {
        this.rafs.delete(second);
        if (!this.alive) return;
        this.anchor.syncVisualToPersistentWord({ navigate: true });
        this.surface.clearUserBrowsing();
        this.state.isBrowsedAway = false;
        this.state.notify();
      });
      this.rafs.add(second);
    });
    this.rafs.add(first);
  }

  private totalWordCount(): number {
    return this.document.bookWords?.totalWords || this.document.wordCount || this.document.tokenWords.length;
  }

  /** Legacy getEffectiveWords: full-book words when complete, else the loaded slice, else tokenized words. */
  private effectiveWords(): readonly string[] {
    if (this.document.useFoliate) {
      if (this.document.bookWords) return this.document.bookWords.words;
      const loaded = this.surface.getWords();
      if (loaded) return loaded;
    }
    return this.document.tokenWords;
  }

  private clampToEffectiveWordRange(index: number): number {
    const maxIdx = Math.max((this.effectiveWords().length || this.totalWordCount() || 1) - 1, 0);
    return Math.max(0, Math.min(index, maxIdx));
  }

  private resolveClickedGlobalWordIndex(sectionIndex?: number, wordOffsetInSection?: number, globalWordIndex?: number): number | null {
    if (typeof globalWordIndex === "number" && globalWordIndex >= 0) {
      return this.clampToEffectiveWordRange(globalWordIndex);
    }
    if (
      typeof sectionIndex === "number" &&
      sectionIndex >= 0 &&
      typeof wordOffsetInSection === "number" &&
      wordOffsetInSection >= 0
    ) {
      const section = this.document.bookWords?.sections.find((entry) => entry.sectionIndex === sectionIndex);
      if (section) {
        return this.clampToEffectiveWordRange(section.startWordIdx + wordOffsetInSection);
      }
      // Early in a fresh book, section metadata may not be hydrated: use the section-local offset.
      return this.clampToEffectiveWordRange(wordOffsetInSection);
    }
    return null;
  }

  /** Legacy commitSharedWordAnchor (Focus never narrates, so the resync branch cannot fire). */
  private commitShared(wordIndex: number, cause: "hard-selection" | "explicit-navigation", cfi: string | null | undefined): number {
    const clamped = this.anchor.commitPersistentWordIndex(wordIndex, cause, {
      cfi,
      persist: true,
      publishState: true,
      navigate: true,
    });
    this.state.currentWordIndex = clamped;
    return clamped;
  }

  /** Legacy setHighlightedWordIndex (the render-time ref resync is applied immediately). */
  private publishHighlight(wordIndex: number): void {
    this.state.highlightedWordIndex = wordIndex;
    this.state.publishedHighlightedWordIndex = wordIndex;
  }

  private markEngaged(): void {
    this.state.engaged = true;
    this.ports.persistence.markEngaged();
  }

  /** Legacy useReader.jumpToWord: the Focus display index, clamped to the words in use. */
  private jumpDisplayToWord(wordIndex: number): void {
    const words = this.engineWords.length > 0 ? this.engineWords : this.effectiveWords();
    this.state.displayWordIndex = Math.max(0, Math.min(words.length - 1, wordIndex));
  }

  private stopEngine(): void {
    this.engine?.stop();
    this.engine?.destroy();
    this.engine = null;
  }

  private setTimer(run: () => void, delayMs: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (this.alive) run();
    }, delayMs);
    this.timers.add(timer);
  }

  private clearTimers(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const raf of this.rafs) cancelAnimationFrame(raf);
    this.rafs.clear();
  }
}

/** No port calls and no timers in the constructor. */
export function createFocusRuntime(input: ReaderModeCreateInput): ReaderModeRuntime {
  return new FocusModeRuntime(input);
}

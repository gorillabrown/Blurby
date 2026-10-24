/**
 * Flow mode runtime (READER-MODE-SEPARATION-2 design §B.3). Implements ReaderModeRuntime v1.
 *
 * Flow owns its word timer (FlowMode, relocated), its line pacer (its own FlowScrollEngine copy, which
 * its React binding starts against this mode's view), the pause-on-miss bridge, the browse-away pause,
 * the natural-chunk visual state and the per-word anchor commits the legacy ReaderContainer ran for
 * flow. Both legacy pacers are kept as they are (no pacing change). Everything outside the mode goes
 * through its ports — never audio: the broker issues Flow a throwing audio port, and the legacy audio
 * calls (stopAllModes, createInstance's setOnTruthSync(null), the background-cacher cursor) were
 * cross-owner effects. Everything DOM-side goes through its own surface controller. After stop/destroy
 * every call is a no-op and every pending continuation is dropped (LL-109).
 *
 * Resume is a cold restart from the anchor (Q-G, fixture flow steps 6–7): togglePlay never resumes.
 * Not copied: useFlowScrollSync effect 6 (the Flow+narration follower, LL-125) and the narration
 * branches of the legacy word-advance glue (Flow never narrates).
 */
import type { MutableRefObject } from "react";
import type { ReadingMode, ModeConfig, ModeState } from "../../../modes/ModeInterface";
import {
  EINK_LINES_PER_PAGE,
  FLOW_ZONE_LINES_DEFAULT,
  FOLIATE_SECTION_LOAD_WAIT_MS,
  DEFAULT_EINK_WPM_CEILING,
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
  type ReaderBookWordsValue,
  type ReaderDocumentSnapshot,
  type ReaderModeHandoff,
  type ReaderSessionKey,
  type ReaderSettingsSnapshot,
} from "../../document/ReaderDocumentSnapshot";
import type { ReaderPorts } from "../../ports/ReaderPorts";
import type { SurfaceCommand } from "../../surface/SurfaceCommand";
import type { SectionBoundary } from "../../../types/narration";
import type { ChunkReadingVisualState, ChunkSourceWord, ReadingChunk } from "../../../types/chunkReading";
import { buildNaturalChunks } from "../../../utils/naturalChunks";
import type { FlowFoliateViewAPI } from "./FoliateView";
import { FlowModeState } from "./ModeState";
import { createFlowSurface, type FlowSurface } from "./surface";
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
import { createChunkReadingVisualState } from "./helpers/chunkReadingVisualState";
import { FlowScrollEngine, type FlowProgress } from "./helpers/FlowScrollEngine";
import type { FoliateWord } from "./helpers/foliateHelpers";

/**
 * FlowMode — Sliding cursor underline across text at WPM speed. (Relocated from src/modes/FlowMode.ts.)
 *
 * A visual cursor (underline or box) slides across the rendered text,
 * highlighting the current word and advancing at the configured WPM.
 * Uses setTimeout chain for variable-duration rhythm pauses.
 *
 * Visual rendering (cursor position, CSS transitions) is handled by
 * FlowCursorController (non-EPUB) or FoliatePageView overlay (EPUB).
 * This class manages timing and word advancement only.
 */
export class FlowMode implements ReadingMode {
  readonly type = "flow" as const;
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
    this.config.callbacks.onWordAdvance(wordIndex); // Highlight initial word
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
    // Current timeout runs out at old speed; next word uses new speed
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.config.callbacks.onWordAdvance(wordIndex);
    if (this.playing) {
      this.clearTimer();
      this.scheduleNext();
    }
  }

  getState(): ModeState {
    return {
      type: "flow",
      isPlaying: this.playing,
      currentWordIndex: this.currentWord,
      effectiveWpm: this.config.wpm,
    };
  }

  destroy(): void {
    this.clearTimer();
    this.playing = false;
  }

  /**
   * Estimate time remaining from current position.
   */
  getTimeRemaining(totalWords: number): number {
    const wordsLeft = Math.max(0, totalWords - this.currentWord);
    const msPerWord = 60000 / this.config.wpm;
    return wordsLeft * msPerWord * 1.1; // ~10% overhead for rhythm pauses
  }

  /**
   * Jump to the start of the previous visual line.
   * Caller provides the word index of the line start.
   */
  prevLine(lineStartWordIndex: number): void {
    this.jumpTo(lineStartWordIndex);
  }

  /**
   * Jump to the start of the next visual line.
   * Caller provides the word index of the line start.
   */
  nextLine(lineStartWordIndex: number): void {
    this.jumpTo(lineStartWordIndex);
  }

  /**
   * Update the word array when new EPUB sections load.
   * Keeps current position — only extends the available words.
   */
  updateWords(words: string[]): void {
    this.config.words = words;
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

    // Flow rhythm pauses are shorter than Focus — halved for visual-only
    let pauseMs = 0;
    if (this.config.settings.rhythmPauses) {
      pauseMs = Math.round(
        calculatePauseMs(
          word,
          this.config.settings.rhythmPauses,
          PUNCTUATION_PAUSE_MS,
          isParagraphEnd
        ) * 0.5 // Half-duration for visual-only pauses
      );
    }

    const totalMs = baseMs + pauseMs;

    this.timer = setTimeout(() => {
      this.currentWord++;
      this.config.callbacks.onWordAdvance(this.currentWord);
      this.scheduleNext();
    }, totalMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// ── FlowModeAdapter (relocated from src/reader/modes/FlowModeAdapter.ts; legacy adapter contract) ──

export interface FlowSectionMeta {
  sections: Array<{ sectionIndex: number; startWordIdx: number }>;
  totalWords: number;
}

export type FlowCompletionAction =
  | { action: "section-handoff"; sectionIndex: number; startWordIdx: number }
  | { action: "complete" };

export interface FlowModeAdapterConfig {
  wpm: number;
  isFoliate: boolean;
  settings: {
    rhythmPauses?: any;
    flowCursorStyle?: string;
  };
  onWordAdvance?: (wordIndex: number) => void;
  onComplete?: () => void;
  onSurfaceCommand?: (cmd: SurfaceCommand) => void;
  onBrowseAway?: () => void;
}

export class FlowModeAdapter implements ReaderModeAdapter {
  readonly mode: ReaderModeId = "flow";

  private instance: FlowMode | null = null;
  private _selected = false;
  private _playing = false;
  private _currentWordIndex = 0;
  private _browsedAway = false;
  private config: FlowModeAdapterConfig;
  private _sectionMeta: FlowSectionMeta | null = null;

  constructor(config: FlowModeAdapterConfig) {
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
    this._browsedAway = false;
    this._currentWordIndex = request.wordIndex;

    const modeConfig: ModeConfig = {
      words: request.words,
      wpm: this.config.wpm,
      callbacks: {
        onWordAdvance: (idx: number) => {
          this._currentWordIndex = idx;
          if (this._playing) {
            this.config.onWordAdvance?.(idx);
            this.config.onSurfaceCommand?.({
              kind: "highlight",
              wordIndex: idx,
              mode: "flow",
              allowMotion: false,
            });
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
        flowCursorStyle: this.config.settings.flowCursorStyle,
      },
    };

    this.instance = new FlowMode(modeConfig);
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
      this._browsedAway = false;
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
    this._browsedAway = false;
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
      mode: "flow",
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
    this._browsedAway = false;
    this.config.onSurfaceCommand?.({ kind: "clear", mode: "flow" });
  }

  // ── Flow-specific: section handoff ──────────────────────────────

  setSectionMeta(meta: FlowSectionMeta | null): void {
    this._sectionMeta = meta;
  }

  resolveCompletion(currentWordIndex: number): FlowCompletionAction {
    if (!this._sectionMeta) return { action: "complete" };
    const { sections, totalWords } = this._sectionMeta;
    const nextSection = sections.find(s => s.startWordIdx > currentWordIndex);
    if (nextSection && currentWordIndex < totalWords - 1) {
      return {
        action: "section-handoff",
        sectionIndex: nextSection.sectionIndex,
        startWordIdx: nextSection.startWordIdx,
      };
    }
    return { action: "complete" };
  }

  // ── Flow-specific: browse-away ──────────────────────────────────

  notifyBrowseAway(): void {
    if (this._playing) {
      this._browsedAway = true;
      this.pause();
      this.config.onBrowseAway?.();
    }
  }

  clearBrowseAway(): void {
    this._browsedAway = false;
  }

  get browsedAway(): boolean {
    return this._browsedAway;
  }
}

// ── Flow runtime ──────────────────────────────────────────────────────────────

/** Legacy onLoad delay (ReaderContainer: "Slightly longer delay to ensure foliate has finished rendering"). */
const FLOW_SURFACE_LOAD_DELAY_MS = 200;
/** Legacy useFoliateSync effect 3 goToSection throttle. */
const FLOW_SECTION_SYNC_THROTTLE_MS = 200;

/** Frozen inputs are kept as-is; anything else is deep-copied and frozen first. */
function own<T>(value: T) {
  return Object.isFrozen(value) ? value : freezeValue(value);
}

/** Legacy ReaderContainer sectionIndexForGlobalWord (natural-chunk source). */
function sectionIndexForGlobalWord(
  sections: readonly Readonly<SectionBoundary>[] | undefined,
  globalWordIndex: number,
): number | undefined {
  if (!sections?.length) return undefined;
  const section = sections.find((candidate) => (
    globalWordIndex >= candidate.startWordIdx && globalWordIndex < candidate.endWordIdx
  ));
  return section?.sectionIndex;
}

/**
 * sectionIndexForGlobalWord for ascending word indices (one natural-chunk source pass). When the sections are
 * sorted and disjoint the containing section is the only match, so a forward cursor returns what the legacy
 * scan's find() returns; otherwise the legacy scan runs. (80k words x 18 sections: the scan was most of a
 * full-book chunk build once buildNaturalChunks stopped rescanning.)
 */
function createSectionLookup(
  sections: readonly Readonly<SectionBoundary>[] | undefined,
): (globalWordIndex: number) => number | undefined {
  if (!sections?.length) return () => undefined;
  const ordered = sections.every((section, i) => section.startWordIdx <= section.endWordIdx
    && (i === 0 || sections[i - 1].endWordIdx <= section.startWordIdx));
  if (!ordered) return (globalWordIndex) => sectionIndexForGlobalWord(sections, globalWordIndex);
  let k = 0;
  return (globalWordIndex) => {
    while (k < sections.length && sections[k].endWordIdx <= globalWordIndex) k++;
    const section = sections[k];
    return section && globalWordIndex >= section.startWordIdx ? section.sectionIndex : undefined;
  };
}

/** Legacy ReaderContainer createChunkSourceWords. */
function createChunkSourceWords(params: {
  words: readonly string[];
  foliateWords?: readonly FoliateWord[];
  paragraphBreaks?: Set<number>;
  sections?: readonly Readonly<SectionBoundary>[];
}): ChunkSourceWord[] {
  const { words, foliateWords = [], paragraphBreaks = new Set<number>(), sections } = params;
  const canUseFoliateMetadata = foliateWords.length === words.length;
  const sectionAt = createSectionLookup(sections);

  return words.map((word, index) => {
    const foliateWord = canUseFoliateMetadata ? foliateWords[index] : undefined;
    return {
      word,
      globalWordIndex: index,
      sectionIndex: foliateWord?.sectionIndex ?? sectionAt(index),
      tokenId: foliateWord?.tokenId,
      blockId: foliateWord?.blockId,
      blockTag: foliateWord?.blockTag,
      blockOrdinal: foliateWord?.blockOrdinal,
      sourceLineBreakAfter: foliateWord?.sourceLineBreakAfter,
      paragraphBreakAfter: foliateWord?.paragraphBreakAfter ?? paragraphBreaks.has(index),
    };
  });
}

/** OC-6: Flow's own WPM key; absent → the legacy shared wpm (no migration). */
function ownFlowWpm(s: ReaderSettingsSnapshot): number {
  return s.settings.flowWpm ?? s.wpm;
}

/** The shell's e-ink ceiling (legacy effectiveWpm), applied to this mode's own WPM. */
function capEinkWpm(wpm: number, s: ReaderSettingsSnapshot): number {
  return s.isEink ? Math.min(wpm, s.settings.einkWpmCeiling || DEFAULT_EINK_WPM_CEILING) : wpm;
}

export class FlowModeRuntime implements ReaderModeRuntime {
  readonly mode = "flow" as const;
  readonly contractVersion = READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  private documentSnapshot: ReaderDocumentSnapshot;
  /** Unsubscribes adoptDocument from this session's document port (set on first select, released in stop). */
  private unsubscribeDocument: (() => void) | null = null;
  /** Populated by this mode's FoliateView while it is mounted. */
  readonly viewApiRef: MutableRefObject<FlowFoliateViewAPI | null> = { current: null };
  /** resolveBookOpenInitialCfi over the handoff (the view's initial location). */
  readonly initialCfi: string | null;
  private readonly ports: ReaderPorts;
  private readonly arrival: ReaderModeArrival;
  private readonly state: FlowModeState;
  private readonly surface: FlowSurface;
  /** The anchor's dependencies; legacy direct reader.jumpToWord calls go through the same display seam. */
  private readonly anchorDeps: PersistentReadingAnchorDeps;
  private readonly anchor: PersistentReadingAnchor;
  private settingsSnapshot: ReaderSettingsSnapshot;
  /** Legacy useReader wpmRef: the latest value this runtime asked the shell to store. */
  private wpm: number;
  private engine: FlowMode | null = null;
  /** Legacy useFlowScrollSync flowScrollEngineRef; started by the binding against this mode's view. */
  private scrollEngine: FlowScrollEngine | null = null;
  /** The words the engine runs over (legacy wordsRef). */
  private engineWords: string[] = [];
  /** Legacy naturalReadingChunks memo, keyed by the render version. */
  /** Legacy naturalReadingChunks memo: keyed by the word source and paragraph breaks, and by the render version only without full-book words. */
  private chunkCache: {
    readonly renderVersion: number;
    readonly bookWords: ReaderBookWordsValue | null;
    readonly paragraphBreaks: readonly number[];
    readonly chunks: ReadingChunk[];
  } | null = null;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private readonly rafs = new Set<number>();
  private alive = true;
  private destroyed = false;
  /**
   * S1 G6: B0 kept one foliate surface across a mode switch, so the word selected before a paused switch
   * kept its page-word--flow-cursor class in the destination. This session's view is new and starts
   * unpainted, so the handed-over word is painted here (B0's flow cursor, no motion) once a section has
   * loaded. Set for every session that came from another mode; cleared on the first hit or once
   * playback owns the cursor.
   */
  private arrivalCursorPending: boolean;

  constructor(input: ReaderModeCreateInput) {
    this.key = input.key;
    this.ports = input.ports;
    this.arrival = input.arrival;
    this.arrivalCursorPending = input.handoff.source != null;
    this.documentSnapshot = own(input.document) as ReaderDocumentSnapshot;
    this.settingsSnapshot = own(input.settings) as ReaderSettingsSnapshot;
    this.wpm = ownFlowWpm(this.settingsSnapshot);
    const handoff = createReaderModeHandoff(input.handoff);
    this.state = new FlowModeState(handoff);
    this.initialCfi = resolveBookOpenInitialCfi({ persistentWordIndex: handoff.canonicalWordIndex, cfi: handoff.cfi });
    this.surface = createFlowSurface(this.viewApiRef);
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

  /** This session's document; replaced by a newer same-document snapshot (Decision #19, adoptDocument). */
  get document(): ReaderDocumentSnapshot {
    return this.documentSnapshot;
  }

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
      flowProgress: s.flowProgress,
    });
  }

  /** The declared chunk visual state this mode's view renders (legacy chunkReadingVisualState). */
  getChunkVisualState(): ChunkReadingVisualState | null {
    return this.state.chunkVisualState;
  }

  /**
   * S1 G6: B0's ReaderContainer narrate-publisher effect re-ran after every render (its deps held the
   * per-render `narration` object) and, outside Narrate, set chunkReadingVisualState to null. Flow's published
   * state therefore lived for one commit: the view applied it (and followed it to the reading zone), then
   * cleared it, so Flow never kept page-word--active-word. useModeBindings calls this after every commit.
   */
  releaseChunkVisualState = (): void => {
    if (!this.alive || this.state.chunkVisualState == null) return;
    this.state.chunkVisualState = null;
    this.state.notify();
  };

  /**
   * Decision #19: adopt a newer snapshot of this session's own document (same id and generation), e.g. the
   * full-book words that background extraction delivers after open, and re-render this mode's view.
   */
  private adoptDocument = (snapshot: ReaderDocumentSnapshot): void => {
    if (!this.alive) return;
    if (snapshot.documentId !== this.documentSnapshot.documentId
      || snapshot.documentGeneration !== this.documentSnapshot.documentGeneration) return;
    const next = own(snapshot) as ReaderDocumentSnapshot;
    if (next === this.documentSnapshot) return;
    this.documentSnapshot = next;
    // With full-book words the chunk memo is keyed by them and the paragraph breaks (B0 memo deps); without
    // them the chunks read this snapshot's own words, so a new snapshot rebuilds as before.
    if (!next.bookWords) this.chunkCache = null;
    this.warmReadingChunks();
    this.state.notify();
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  select(wordIndex: number): void {
    if (!this.alive) return;
    // Decision #19: full-book words that land after open reach this session (one subscription per session).
    this.unsubscribeDocument ??= this.ports.document.subscribe(this.adoptDocument);
    const reselect = this.state.selected;
    this.state.selected = true;
    this.state.currentWordIndex = wordIndex;
    if (!reselect && this.arrival === "select") {
      // Legacy handleSelectMode: syncVisualToPersistentWord({ navigate: false }) → queuePostModeAnchorSync
      // → setIsBrowsedAway(false) → updateSettings(...). (stopAllModes' audio calls are cross-owner.)
      this.anchor.syncVisualToPersistentWord({ navigate: false });
      this.state.isBrowsedAway = false;
      this.ports.settings.update({ readingMode: "flow", lastReadingMode: "flow", isNarrating: false });
      this.queuePostModeAnchorSync();
    }
    if (!reselect) this.warmReadingChunks();
    this.state.notify();
  }

  /** Legacy useReaderMode.startFlow with targetMode "flow" and no resumeNarration. */
  start(request: ReaderModeStartRequestV1): void {
    if (!this.alive) return;
    this.arrivalCursorPending = false;
    const s = this.state;
    // stopAllModes (Flow's own part): stop the engine, clear playing/browse.
    s.pendingStartOnLoad = false;
    this.stopEngine();
    this.scrollEngine?.stop();
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
        if (words.length > 0) this.start(request);
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      s.notify();
      return;
    }
    const bookWordsTotalWords = this.document.bookWords?.totalWords;
    const flowStartSource = this.consumeModeStartAnchor();
    let startWord = this.document.useFoliate
      ? resolveFoliateStartWord(
        flowStartSource,
        effectiveWords.length,
        () => this.surface.findFirstVisibleWordIndex(),
        bookWordsTotalWords,
      )
      : flowStartSource;
    if (this.document.useFoliate && startWord >= effectiveWords.length && effectiveWords.length > 0
      && !(bookWordsTotalWords != null && startWord < bookWordsTotalWords)) {
      const firstVisible = this.surface.findFirstVisibleWordIndex();
      startWord = firstVisible >= 0 ? firstVisible : 0;
    }
    if (this.document.useFoliate && startWord !== s.highlightedWordIndex) this.publishHighlight(startWord);
    this.anchorDeps.jumpDisplayToWord(startWord); // reader.jumpToWord(startWord)
    if (this.document.useFoliate && this.surface.isReady()) {
      this.surface.highlight(startWord, "flow", { allowMotion: true });
    }
    this.ports.settings.update({ readingMode: "flow", lastReadingMode: "flow" });
    const paragraphBreaks = this.document.useFoliate ? this.surface.getParagraphBreaks() : this.document.paragraphBreaks;
    s.playing = true;
    this.startEngine(startWord, effectiveWords, paragraphBreaks);
    s.notify();
  }

  pause(): void {
    if (!this.alive) return;
    this.state.pendingStartOnLoad = false;
    this.pausePlayback();
    this.state.notify();
  }

  resume(): void {
    if (!this.alive || !this.engine) return;
    this.state.playing = true;
    this.engine.resume();
    this.state.notify();
  }

  /** Legacy handleTogglePlay, flow branch: pause, or a cold restart from the anchor (Q-G). */
  togglePlay(): void {
    if (!this.alive) return;
    if (this.state.playing) {
      this.pausePlayback();
      this.state.notify();
      return;
    }
    this.start({ cause: "space" });
  }

  stop(_reason: ReaderModeStopReason, _context?: { readonly destination: ReaderModeId }): void {
    if (!this.alive) return;
    this.alive = false;
    this.unsubscribeDocument?.(); // a local unsubscribe, not a port call
    this.unsubscribeDocument = null;
    this.clearTimers();
    this.state.pendingStartOnLoad = false;
    this.state.pendingResume = null;
    this.stopEngine();
    this.scrollEngine?.destroy();
    this.scrollEngine = null;
    this.state.playing = false;
    this.state.selected = false;
    this.state.chunkVisualState = null;
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
    // Legacy captureCurrentAnchor, flow branch: the engine's current word becomes the highlight.
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
    // The word timer keeps the WPM it started with (legacy: buildConfig is captured per instance and
    // modeInstance.setSpeed has no production caller); the line pacer follows (useFlowScrollSync effect 3).
    // OC-6: both sides read Flow's own key (flowWpm ?? wpm) under the e-ink ceiling.
    const previousEffectiveWpm = capEinkWpm(ownFlowWpm(this.settingsSnapshot), this.settingsSnapshot);
    this.settingsSnapshot = own(next) as ReaderSettingsSnapshot;
    this.wpm = ownFlowWpm(this.settingsSnapshot);
    if (this.getEffectiveWpm() !== previousEffectiveWpm) this.scrollEngine?.setWpm(this.getEffectiveWpm());
    this.state.notify();
  }

  /** Flow's effective pace: its own WPM under the e-ink ceiling. */
  getEffectiveWpm(): number {
    return capEinkWpm(this.wpm, this.settingsSnapshot);
  }

  /**
   * Speed dialog (design §E, step S4): store the exact WPM in Flow's own key (OC-6) and pace a running
   * word timer and line pacer with it. An out-of-range WPM is rejected, never clamped or rounded.
   */
  setSpeed(speed: ReaderModeSpeed): void {
    if (!this.alive || speed.kind !== "wpm") return;
    if (!(speed.wpm >= MIN_WPM && speed.wpm <= MAX_WPM)) return;
    this.wpm = speed.wpm;
    this.ports.settings.update({ flowWpm: speed.wpm });
    this.engine?.setSpeed(this.getEffectiveWpm());
    this.scrollEngine?.setWpm(this.getEffectiveWpm());
    this.state.notify();
  }

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
      // retargetActiveModeToWord, flow branch: only a playing Flow retargets its word timer and line pacer.
      if (s.playing) {
        this.engine?.jumpTo(anchored);
        this.scrollEngine?.jumpToWord(anchored);
      }
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

  /** Legacy handleJumpBackToPersistentWord (flow style hint). */
  jumpBack(): void {
    if (!this.alive) return;
    const anchor = this.state.canonicalWordIndex;
    this.anchor.syncVisualToPersistentWord({ navigate: true });
    if (this.document.useFoliate) void this.surface.jumpToWordAnchor(anchor);
    this.state.isBrowsedAway = false;
    this.state.notify();
  }

  /** Legacy adjustSpeed, non-narration branch (useReader.adjustWpm), on Flow's own key (OC-6). */
  adjustSpeed(delta: number): void {
    if (!this.alive) return;
    this.wpm = Math.max(MIN_WPM, Math.min(MAX_WPM, this.wpm + delta));
    this.ports.settings.update({ flowWpm: this.wpm });
    this.state.notify();
  }

  handleCommand(command: ReaderModeCommand): void {
    if (!this.alive) return;
    switch (command.kind) {
      case "flow-line":
        // Legacy handleFlowPrevLine / handleFlowNextLine.
        if (this.scrollEngine?.getState().running) this.scrollEngine.jumpToLine(command.direction);
        return;
      case "go-to-href":
        // Legacy handleJumpToChapter foliate branch.
        this.markEngaged();
        this.ports.persistence.markPageActivity();
        this.surface.goTo(command.href);
        break;
      default:
        return; // seek-words / page keyboard commands belong to other modes.
    }
    this.state.notify();
  }

  // ── View events (bound by useModeBindings) ────────────────────────────────
  /** Legacy ReaderContainer onRelocate, flow branches (the word advance owns the highlight). */
  onRelocate = (detail: { readonly cfi: string; readonly fraction: number }): void => {
    if (!this.alive || !detail.cfi) return;
    const s = this.state;
    const fraction = detail.fraction || 0;
    this.ports.shell.reportRelocate({ cfi: detail.cfi, fraction }); // e-ink page turn + fraction (shell)
    const approxWordIdx = Math.floor(fraction * (this.document.wordCount || 0));
    const isBrowsingAway = this.surface.isUserBrowsing();
    if (shouldWriteRelocateCfi({ mode: "flow", userBrowsing: isBrowsingAway })) {
      s.cfi = detail.cfi;
      this.ports.persistence.recordCfi(detail.cfi);
    }
    // During flow the word-advance callback owns highlightedWordIndex (TTS-7M: the anchor is the authority).
    const hasResumeAnchor = s.resumeAnchor != null;
    if (hasResumeAnchor) {
      this.ports.diagnostics.transition("resumeAnchor:active-skip", () => ({
        resumeAnchor: s.resumeAnchor,
        approxWordIdx,
        mode: "flow",
        source: "ReaderContainer:onRelocate",
      }));
    }
    const shouldPersistRelocate = shouldPersistRelocateProgress({
      mode: "flow",
      hasEngaged: s.engaged,
      hasResumeAnchor,
      userBrowsing: isBrowsingAway,
    });
    if (!shouldPersistRelocate) return;
    this.ports.persistence.markPageActivity();
    const progressAnchor = resolveCanonicalWordAnchor({
      readingMode: "flow",
      resumeAnchor: s.resumeAnchor,
      highlightedWordIndex: s.highlightedWordIndex,
      softWordIndex: s.softWordIndex,
    });
    // High-water pages and the debounced CFI save stay in the shell.
    this.ports.persistence.scheduleRelocateSave({ wordIndex: progressAnchor, cfi: detail.cfi });
  };

  /** Legacy ReaderContainer onLoad, scrolled-surface branch: bump the render version after 200 ms. */
  onSurfaceLoad = (): void => {
    if (!this.alive) return;
    // The view calls onLoad once the section has stamped its spans; its API may land later, so the
    // delayed callback below retries.
    this.paintArrivalCursor();
    this.setTimer(() => {
      this.paintArrivalCursor();
      this.state.renderVersion += 1;
      this.state.notify();
      // Design §F.2: a start that waited for this view now runs.
      if (this.state.pendingStartOnLoad) {
        this.state.pendingStartOnLoad = false;
        this.start({ cause: "play-button" });
      }
    }, FLOW_SURFACE_LOAD_DELAY_MS);
  };

  /** S1 G6: paint the handed-over word on this session's view with B0's paused cursor (flow style, no motion). */
  private paintArrivalCursor(): void {
    if (!this.arrivalCursorPending || this.state.playing) return;
    if (this.surface.highlight(this.state.publishedHighlightedWordIndex, "flow", { allowMotion: false })) {
      this.arrivalCursorPending = false;
    }
  }

  /**
   * Legacy onWordsReextracted: bump the render version; without full-book words, refresh the engine's
   * words; then resume a pause-on-miss once the new section has stamped its spans.
   */
  onWordsReextracted = (): void => {
    if (!this.alive) return;
    const s = this.state;
    const words = this.surface.getWords();
    if (!words?.length) return;
    s.renderVersion += 1;
    if (!this.document.bookWords) {
      this.engineWords = [...words];
      this.engine?.updateWords(this.engineWords);
    }
    const pending = s.pendingResume;
    if (pending != null) {
      s.pendingResume = null;
      // Allow the DOM to settle after word extraction + span wrapping.
      this.requestFrame(() => {
        if (!this.engine) return;
        const found = this.surface.highlight(pending, "flow");
        if (found) {
          this.engine.resume();
        } else {
          // Still not found — the word may be further ahead. Turn another page.
          s.pendingResume = pending;
          this.surface.next();
        }
      });
    }
    s.notify();
  };

  onWordClick = (cfi: string, word: string, sectionIndex?: number, wordOffsetInSection?: number, globalWordIndex?: number): void => {
    this.hardSelect({ cfi, word, sectionIndex, wordOffsetInSection, globalWordIndex });
  };

  onTocReady = (toc: unknown[], sectionCount: number): void => {
    if (!this.alive) return;
    // Only plain values cross to the shell.
    this.ports.shell.reportToc(freezeValue(JSON.parse(JSON.stringify(toc)) as unknown[]), sectionCount);
  };

  /** Legacy handleFoliateUserBrowseAway / onFlowUserBrowseAway, then the browse-pause effect. */
  onUserBrowseAway = (): void => {
    if (!this.alive || this.state.isBrowsedAway) return;
    this.setBrowsedAway(true);
    this.state.notify();
  };

  /** Legacy useFoliateSync effect 1 tick (setIsBrowsedAway(isUserBrowsing())), then the browse-pause effect. */
  pollBrowsing = (): void => {
    if (!this.alive) return;
    const browsing = this.surface.isUserBrowsing();
    if (browsing === this.state.isBrowsedAway) return;
    this.setBrowsedAway(browsing);
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
      if (now - s.lastGoToSectionTime < FLOW_SECTION_SYNC_THROTTLE_MS) return;
      s.currentSection = sec.sectionIndex;
      s.lastGoToSectionTime = now;
      Promise.resolve(this.surface.goToSection(sec.sectionIndex)).catch(() => {});
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

  // ── Line pacer (useFlowScrollSync effects 1, 3b, 5, 5b; driven by useModeBindings) ──
  /** Legacy waitForFoliateFlowReady. */
  waitForSurfaceReady = async (): Promise<void> => {
    if (!this.document.useFoliate) return;
    await this.surface.waitForSectionReady();
  };

  /** useFlowScrollSync effect 1, startWhenReady: start the line pacer against this mode's view. */
  startScrollEngine = (container: HTMLElement, cursor: HTMLDivElement, onZoneTopChange: (topFrac: number) => void): void => {
    if (!this.alive || !this.state.playing) return;
    const engine = this.scrollEngine ?? (this.scrollEngine = this.createScrollEngine());
    const totalWords = this.document.bookWords?.totalWords || this.document.wordCount || this.engineWords.length;
    if (totalWords > 0) engine.setTotalWords(totalWords);
    engine.setChunks(this.readingChunks());
    this.publishFlowVisualState(this.state.highlightedWordIndex);
    const settings = this.settingsSnapshot.settings;
    engine.start(
      container,
      cursor,
      this.state.highlightedWordIndex,
      this.getEffectiveWpm(),
      numberArrayToSet(this.document.paragraphBreaks),
      this.settingsSnapshot.isEink,
      settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT,
      onZoneTopChange,
      true,
    );
    this.state.notify();
  };

  /** useFlowScrollSync effect 1, not playing / cleanup. */
  stopScrollEngine = (): void => {
    this.scrollEngine?.stop();
  };

  /** useFlowScrollSync effect 3b: natural chunks follow the render version. */
  syncScrollEngineChunks = (): void => {
    if (!this.alive) return;
    this.scrollEngine?.setChunks(this.readingChunks());
    if (this.state.playing) {
      this.publishFlowVisualState(this.state.highlightedWordIndex);
      this.state.notify();
    }
  };

  /** useFlowScrollSync effects 5/5b: rebuild the line map and re-sync to the current word. */
  rebuildScrollEngine = (): void => {
    if (!this.alive) return;
    const engine = this.scrollEngine;
    if (!engine?.getState().running) return;
    engine.rebuildLineMap();
    engine.jumpToWord(this.state.highlightedWordIndex);
  };

  isScrollEngineRunning = (): boolean => Boolean(this.alive && this.scrollEngine?.getState().running);

  // ── Private ────────────────────────────────────────────────────────────────
  /** useReadingModeInstance.startMode("flow", …) + createInstance flow branch (EPUB pause-on-miss bridge). */
  private startEngine(startWord: number, words: string[], paragraphBreaks: readonly number[]): void {
    if (!this.alive) return;
    this.stopEngine();
    this.engineWords = words;
    const settings = this.settingsSnapshot.settings;
    const config: ModeConfig = {
      words,
      wpm: this.getEffectiveWpm(),
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
    this.engine = new FlowMode(config);
    this.engine.start(startWord);
  }

  /** ReaderContainer onWordAdvance (non-narrating branch) + createInstance's flow highlight and pause-on-miss. */
  private onEngineWordAdvance(idx: number): void {
    if (!this.alive) return;
    const s = this.state;
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
    if (this.document.useFoliate && this.surface.isReady()) {
      const found = this.surface.highlight(idx, "flow", { allowMotion: false });
      if (!found) {
        // Word not in loaded sections — pause, turn page, wait for section load (onWordsReextracted resumes).
        this.engine?.pause();
        s.pendingResume = idx;
        this.surface.next();
      }
    }
    s.notify();
  }

  /** Legacy onComplete (end of words): setFocusPlaying(false); setReadingMode("page") — the router owns the switch. */
  private onEngineComplete(): void {
    if (!this.alive) return;
    this.state.playing = false;
    this.scrollEngine?.stop();
    this.state.notify();
    this.ports.shell.requestCompletionToPage();
  }

  private createScrollEngine(): FlowScrollEngine {
    return new FlowScrollEngine({
      onWordAdvance: (idx: number) => {
        if (!this.alive) return;
        this.publishHighlight(idx);
        this.publishFlowVisualState(idx);
        this.ports.diagnostics.trace({ kind: "word", source: "flow", wordIndex: idx });
        this.state.notify();
      },
      onComplete: () => this.onScrollEngineComplete(),
      onProgressUpdate: (progress: FlowProgress) => {
        if (!this.alive) return;
        this.state.flowProgress = Object.freeze({ bookPct: progress.bookPct, estimatedMinutesLeft: progress.estimatedMinutesLeft });
        if (this.settingsSnapshot.isEink) {
          const lineShare = progress.totalLines > 0 ? Math.min(1, EINK_LINES_PER_PAGE / progress.totalLines) : 0.25;
          this.ports.shell.reportEinkContentChange(lineShare);
        }
        this.ports.diagnostics.trace({
          kind: "flow-position",
          lineIndex: progress.lineIndex,
          totalLines: progress.totalLines,
          wordIndex: progress.wordIndex,
          totalWords: progress.totalWords,
          bookPct: progress.bookPct,
        });
        this.state.notify();
      },
      onUserBrowseAway: () => this.onUserBrowseAway(),
    });
  }

  /**
   * useFlowScrollSync effect 1 onComplete: hand off to the next section of this EPUB (BUG-176), else the
   * book is finished — the shell owns the queue, overlay, finish and next-document open (cross-book).
   */
  private onScrollEngineComplete(): void {
    if (!this.alive) return;
    const currentWord = this.state.highlightedWordIndex;
    const meta = this.document.bookWords;
    const totalWords = meta?.totalWords || this.document.wordCount || this.engineWords.length;
    const nextSection = meta?.sections.find((section) => section.startWordIdx > currentWord);
    if (nextSection && currentWord < totalWords - 1) {
      Promise.resolve(this.surface.goToSection(nextSection.sectionIndex))
        .then(() => this.surface.waitForSectionReady(nextSection.sectionIndex))
        .then(() => {
          if (this.alive) this.scrollEngine?.rebuildLineMap();
        })
        .catch(() => {});
      return;
    }
    // setFlowPlaying(false); the word timer pauses with it (Flow's playing flag owns both pacers).
    this.pausePlayback();
    this.state.notify();
    this.ports.shell.requestCrossBook({ finishedWordIndex: currentWord });
  }

  /** Legacy publishFlowVisualState (Flow never narrates, so the isNarrating guard cannot fire). */
  private publishFlowVisualState(wordIndex: number): void {
    const chunks = this.readingChunks();
    this.state.chunkVisualState = chunks.length === 0
      ? null
      : createChunkReadingVisualState({ mode: "flow", chunks, wordIndex, syncLevel: "wpm" });
  }

  /**
   * Legacy naturalReadingChunks: B0's memo chain (effectiveWords [foliateRenderVersion] → chunkSourceWords
   * [effectiveWords, paragraphBreaks, sections] → buildNaturalChunks) recomputed on a render bump only while
   * the loaded foliate slice was the source; once full-book words existed effectiveWords returned that same
   * array, so the chunks were built once.
   */
  private readingChunks(): ReadingChunk[] {
    const renderVersion = this.state.renderVersion;
    const bookWords = this.document.bookWords;
    const paragraphBreaks = this.document.paragraphBreaks;
    const cache = this.chunkCache;
    if (cache && cache.bookWords === bookWords && cache.paragraphBreaks === paragraphBreaks
      && (bookWords || cache.renderVersion === renderVersion)) {
      return cache.chunks;
    }
    const foliateWords = (this.document.useFoliate && !this.document.bookWords ? this.surface.getFoliateWords() : null) ?? [];
    const chunks = buildNaturalChunks(createChunkSourceWords({
      words: this.effectiveWords(),
      foliateWords,
      paragraphBreaks: numberArrayToSet(this.document.paragraphBreaks),
      sections: this.document.bookWords?.sections,
    }));
    this.chunkCache = { renderVersion, bookWords, paragraphBreaks, chunks };
    return chunks;
  }

  /**
   * B0 built that memo during the render after full-book words arrived, before any playback: build it then
   * (this session's own timer), not on the first pacer or render callback.
   */
  private warmReadingChunks(): void {
    const bookWords = this.document.bookWords;
    if (!bookWords) return;
    if (this.chunkCache?.bookWords === bookWords && this.chunkCache.paragraphBreaks === this.document.paragraphBreaks) return;
    this.setTimer(() => { this.readingChunks(); }, 0);
  }

  /** Flow's playing flag owns both pacers: legacy modeInstance.pauseMode() + setFlowPlaying(false). */
  private pausePlayback(): void {
    this.state.pendingResume = null;
    this.engine?.pause();
    this.scrollEngine?.stop();
    this.state.playing = false;
  }

  /** setIsBrowsedAway + the legacy browse-pause effect (`readingMode === "flow" && flowPlaying && isBrowsedAway`). */
  private setBrowsedAway(value: boolean): void {
    this.state.isBrowsedAway = value;
    if (value && this.state.playing) this.pausePlayback();
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

  /** Legacy queuePostModeAnchorSync + its double-RAF effect. */
  private queuePostModeAnchorSync(): void {
    this.requestFrame(() => {
      this.requestFrame(() => {
        this.anchor.syncVisualToPersistentWord({ navigate: true });
        this.surface.clearUserBrowsing();
        this.state.isBrowsedAway = false;
        this.state.notify();
      });
    });
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

  /** Legacy commitSharedWordAnchor (Flow never narrates, so the resync branch cannot fire). */
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

  /** Legacy reader.jumpToWord wrote Focus's display index; Flow has no display index (mode-local no-op, OC-3). */
  private jumpDisplayToWord(_wordIndex: number): void { /* mode-local no-op display */ }

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

  private requestFrame(run: () => void): void {
    const raf = requestAnimationFrame(() => {
      this.rafs.delete(raf);
      if (this.alive) run();
    });
    this.rafs.add(raf);
  }

  private clearTimers(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const raf of this.rafs) cancelAnimationFrame(raf);
    this.rafs.clear();
  }
}

/** No port calls and no timers in the constructor. */
export function createFlowRuntime(input: ReaderModeCreateInput): ReaderModeRuntime {
  return new FlowModeRuntime(input);
}

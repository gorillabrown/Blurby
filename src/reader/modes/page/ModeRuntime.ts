/**
 * Page mode runtime (READER-MODE-SEPARATION-2 design §B.1). Implements ReaderModeRuntime v1.
 *
 * Page never plays: togglePlay/start/pause/resume are no-ops and the clock owner stays "none".
 * It owns hard selection, navigation, relocate handling and the Page keyboard commands that the
 * legacy ReaderContainer ran for page mode. Everything outside the mode goes through its ports;
 * everything DOM-side goes through its own surface controller. After stop/destroy every call is a
 * no-op and every pending continuation is dropped.
 */
import type { MutableRefObject } from "react";
import type { ReadingMode, ModeConfig, ModeState } from "../../../modes/ModeInterface";
import {
  FOLIATE_MIN_ENGAGEMENT_POSITION,
  KOKORO_UI_RATE_MAX,
  KOKORO_UI_RATE_MIN,
  KOKORO_UI_RATE_STEP,
  MAX_WPM,
  MIN_WPM,
  TTS_MAX_RATE,
  TTS_MIN_RATE,
  TTS_RATE_STEP,
} from "../../../constants";
import { findSentenceBoundary } from "../../../utils/text";
import {
  READER_MODE_RUNTIME_CONTRACT_VERSION,
  type ReaderHardSelectInput,
  type ReaderModeArrival,
  type ReaderModeCommand,
  type ReaderModeCreateInput,
  type ReaderModeId,
  type ReaderModeJumpCause,
  type ReaderModeRuntime,
  type ReaderModeRuntimeSnapshotV1,
  type ReaderModeSpeed,
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
import type { PageFoliateViewAPI } from "./FoliateView";
import { PageModeState } from "./ModeState";
import { createPageSurface, type PageSurface } from "./surface";
import { createPersistentReadingAnchor, type PersistentReadingAnchor } from "./helpers/usePersistentReadingAnchor";
import {
  resolveBookOpenInitialCfi,
  shouldClearBrowseAwayOnAnchorEvent,
  shouldPersistRelocateProgress,
  shouldWriteRelocateCfi,
} from "./helpers/persistentReadingAnchor";
import { resolveCanonicalWordAnchor } from "./helpers/startWordIndex";

/**
 * PageMode — Default paginated reading. (Relocated from src/modes/PageMode.ts.)
 *
 * No auto-advance. User reads at their own pace, clicks words,
 * turns pages manually. This is the "home" mode that all other
 * modes return to when paused.
 */
export class PageMode implements ReadingMode {
  readonly type = "page" as const;
  private currentWord: number = 0;
  private config: ModeConfig;

  constructor(config: ModeConfig) {
    this.config = config;
  }

  start(wordIndex: number): void {
    this.currentWord = wordIndex;
  }

  pause(): void { /* No-op */ }
  resume(): void { /* No-op */ }
  stop(): void { /* No-op */ }

  getCurrentWord(): number {
    return this.currentWord;
  }

  setSpeed(wpm: number): void {
    this.config.wpm = wpm;
  }

  jumpTo(wordIndex: number): void {
    this.currentWord = wordIndex;
    this.config.callbacks.onWordAdvance(wordIndex);
  }

  getState(): ModeState {
    return {
      type: "page",
      isPlaying: false,
      currentWordIndex: this.currentWord,
      effectiveWpm: this.config.wpm,
    };
  }

  updateWords(_words: string[]): void { /* Page mode doesn't track words */ }

  destroy(): void { /* Nothing to clean up */ }

  /**
   * Estimate time remaining from current position to end of document.
   */
  getTimeRemaining(totalWords: number): number {
    const wordsLeft = Math.max(0, totalWords - this.currentWord);
    return (wordsLeft / this.config.wpm) * 60000;
  }
}

// Owner-local copy of the Kokoro UI speed step (src/utils/kokoroRatePlan.ts, same values; Q-D).
// ponytail: duplicated 1.0–1.5 domain; the speed amendment (OC-7/OC-8) must update this copy too.
const KOKORO_UI_SPEEDS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5] as const;

function normalizeKokoroUiSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return KOKORO_UI_SPEEDS[0];
  const clamped = Math.max(KOKORO_UI_RATE_MIN, Math.min(KOKORO_UI_RATE_MAX, speed));
  const stepped = Math.round(clamped / KOKORO_UI_RATE_STEP) * KOKORO_UI_RATE_STEP;
  const normalized = Number(stepped.toFixed(1));
  const match = KOKORO_UI_SPEEDS.find((uiSpeed) => uiSpeed === normalized);
  return match ?? KOKORO_UI_SPEEDS[0];
}

function stepKokoroUiSpeed(current: number, delta: number): number {
  const normalized = normalizeKokoroUiSpeed(current);
  const idx = KOKORO_UI_SPEEDS.indexOf(normalized as (typeof KOKORO_UI_SPEEDS)[number]);
  const nextIdx = Math.max(0, Math.min(KOKORO_UI_SPEEDS.length - 1, idx + (delta > 0 ? 1 : -1)));
  return KOKORO_UI_SPEEDS[nextIdx];
}

/** Legacy onLoad delay (ReaderContainer: "Slightly longer delay to ensure foliate has finished rendering"). */
const PAGE_SURFACE_LOAD_DELAY_MS = 200;

/** Frozen inputs are kept as-is; anything else is deep-copied and frozen first. */
function own<T>(value: T) {
  return Object.isFrozen(value) ? value : freezeValue(value);
}

export class PageModeRuntime implements ReaderModeRuntime {
  readonly mode = "page" as const;
  readonly contractVersion = READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  private documentSnapshot: ReaderDocumentSnapshot;
  /** Unsubscribes adoptDocument from this session's document port (set on first select, released in stop). */
  private unsubscribeDocument: (() => void) | null = null;
  /** Populated by this mode's FoliateView while it is mounted. */
  readonly viewApiRef: MutableRefObject<PageFoliateViewAPI | null> = { current: null };
  /** resolveBookOpenInitialCfi over the handoff (the view's initial location). */
  readonly initialCfi: string | null;
  private readonly ports: ReaderPorts;
  private readonly arrival: ReaderModeArrival;
  private readonly state: PageModeState;
  private readonly surface: PageSurface;
  private readonly anchor: PersistentReadingAnchor;
  private settingsSnapshot: ReaderSettingsSnapshot;
  /** Legacy useReader wpmRef: the latest value this runtime asked the shell to store. */
  private wpm: number;
  private engine: PageMode | null = null;
  private readonly loadTimers = new Set<ReturnType<typeof setTimeout>>();
  private alive = true;
  private destroyed = false;
  /**
   * S1 G6: B0 kept one foliate surface across a mode switch, so its Page highlight effect repainted the
   * handed-over word on a surface that was already loaded. This session's view is new, and the effect
   * runs before its book loads, so the handed-over highlight is painted here once a section has loaded.
   * Set only for a session that came from another mode; book open (source null) paints nothing, as on B0.
   */
  private arrivalCursorPending: boolean;

  constructor(input: ReaderModeCreateInput) {
    this.key = input.key;
    this.ports = input.ports;
    this.arrival = input.arrival;
    this.arrivalCursorPending = input.handoff.source != null;
    this.documentSnapshot = own(input.document) as ReaderDocumentSnapshot;
    this.settingsSnapshot = own(input.settings) as ReaderSettingsSnapshot;
    this.wpm = this.settingsSnapshot.wpm;
    const handoff = createReaderModeHandoff(input.handoff);
    this.state = new PageModeState(handoff);
    this.initialCfi = resolveBookOpenInitialCfi({ persistentWordIndex: handoff.canonicalWordIndex, cfi: handoff.cfi });
    this.surface = createPageSurface(this.viewApiRef);
    this.anchor = createPersistentReadingAnchor(this.state, {
      documentId: this.document.documentId,
      totalWordCount: () => this.totalWordCount(),
      jumpDisplayToWord: (wordIndex) => this.jumpDisplayToWord(wordIndex),
      persistence: this.ports.persistence,
      diagnostics: this.ports.diagnostics,
    });
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
      playing: false,
      currentWordIndex: s.currentWordIndex,
      clockOwner: "none" as const,
      contractVersion: this.contractVersion,
      key: this.key,
      highlightedWordIndex: s.publishedHighlightedWordIndex,
      publishedWordIndex: s.publishedWordIndex,
      canonicalWordIndex: s.canonicalWordIndex,
      isBrowsedAway: s.isBrowsedAway,
      narrating: false,
      speed: null,
      flowProgress: null,
    });
  }

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
    // useReadingModeInstance createInstance, page branch.
    if (!this.engine) this.engine = new PageMode(this.buildEngineConfig());
    this.engine.start(wordIndex);
    // Legacy handlePauseToPage (stopAllModes → setIsBrowsedAway(false); updateSettings({ readingMode: "page" })),
    // on a pause-to-page arrival and on every same-mode reselect. Book open and silent returns emit nothing.
    if (reselect || this.arrival === "pause-to-page") {
      this.state.isBrowsedAway = false;
      this.ports.settings.update({ readingMode: "page" });
    }
    this.state.notify();
  }

  start(_request: ReaderModeStartRequestV1): void { /* Page never plays. */ }
  pause(): void { /* Page never plays. */ }
  resume(): void { /* Page never plays. */ }
  togglePlay(): void { /* Page Space is a no-op (legacy handleTogglePlay returns for page). */ }

  stop(_reason: ReaderModeStopReason, _context?: { readonly destination: ReaderModeId }): void {
    if (!this.alive) return;
    this.alive = false;
    this.unsubscribeDocument?.(); // a local unsubscribe, not a port call
    this.unsubscribeDocument = null;
    this.clearTimers();
    this.engine?.stop();
    this.engine?.destroy();
    this.engine = null;
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
    this.engine?.jumpTo(wordIndex);
    this.state.currentWordIndex = wordIndex;
    this.state.notify();
  }

  exportHandoff(_capture: "persistent" | "capture-current"): ReaderModeHandoff {
    // Page has no engine cursor: "capture-current" equals "persistent" (legacy captureCurrentAnchor).
    const s = this.state;
    return createReaderModeHandoff({
      source: this.key,
      canonicalWordIndex: s.canonicalWordIndex,
      publishedWordIndex: s.publishedWordIndex,
      highlightedWordIndex: s.publishedHighlightedWordIndex,
      softWordIndex: s.softWordIndex,
      resumeAnchor: s.resumeAnchor,
      explicitSelectionAnchor: s.explicitSelectionAnchor,
      cfi: s.cfi,
      // input.engaged || this session's engagement: hasEngaged is seeded from the handoff.
      engaged: s.hasEngaged,
    });
  }

  applySettings(next: ReaderSettingsSnapshot): void {
    if (!this.alive) return;
    this.settingsSnapshot = own(next) as ReaderSettingsSnapshot;
    this.wpm = this.settingsSnapshot.wpm;
    this.engine?.setSpeed(this.settingsSnapshot.effectiveWpm);
    this.state.notify();
  }

  setSpeed(_speed: ReaderModeSpeed): void { /* Page exposes no speed. */ }

  // ── User intents ──────────────────────────────────────────────────────────
  /** Legacy FoliatePageView onWordClick (resolved and unresolved paths). */
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
      // retargetActiveModeToWord: Page has no running engine to retarget.
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

  /** Chapter prev/next/jump (legacy commitSharedWordAnchor, explicit-navigation). */
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

  /** Legacy adjustSpeed, page branch (keyboard up/down). */
  adjustSpeed(delta: number): void {
    if (!this.alive) return;
    const settings = this.settingsSnapshot.settings;
    if (settings.lastReadingMode === "narrate") {
      let newRate: number;
      if (settings.ttsEngine === "kokoro") {
        newRate = stepKokoroUiSpeed(settings.ttsRate || 1.0, delta);
      } else {
        const step = delta > 0 ? TTS_RATE_STEP : -TTS_RATE_STEP;
        newRate = Math.round(Math.min(TTS_MAX_RATE, Math.max(TTS_MIN_RATE, (settings.ttsRate || 1.0) + step)) * 10) / 10;
      }
      // The legacy narration.adjustRate(newRate) is a cross-owner effect (design §B.1): Narrate applies the rate when it mounts.
      this.ports.settings.update({ ttsRate: newRate });
      return;
    }
    // useReader.adjustWpm
    this.wpm = Math.max(MIN_WPM, Math.min(MAX_WPM, this.wpm + delta));
    this.ports.settings.setWpm(this.wpm);
  }

  handleCommand(command: ReaderModeCommand): void {
    if (!this.alive) return;
    const words = this.document.tokenWords as string[];
    const idx = this.state.publishedHighlightedWordIndex;
    switch (command.kind) {
      case "move-selection": {
        this.markEngaged();
        this.ports.persistence.markPageActivity();
        // Move highlight by 1 word (left/right) or ~10 words (up/down, approximate line jump)
        const d = command.direction;
        const delta = d === "left" ? -1 : d === "right" ? 1 : d === "up" ? -10 : 10;
        this.publishHighlight(Math.max(0, Math.min(words.length - 1, idx + delta)));
        break;
      }
      case "paragraph": {
        // paragraphBreaks stores the LAST word of each paragraph; the next paragraph starts at breakIndex + 1
        const breaks = this.document.paragraphBreaks;
        if (command.direction === "prev") {
          let target = 0;
          for (let i = breaks.length - 1; i >= 0; i--) {
            const paraStart = breaks[i] + 1;
            if (paraStart < idx) {
              target = paraStart;
              break;
            }
          }
          this.publishHighlight(target);
        } else {
          let target = words.length - 1;
          for (let i = 0; i < breaks.length; i++) {
            const paraStart = breaks[i] + 1;
            if (paraStart > idx) {
              target = Math.min(paraStart, words.length - 1);
              break;
            }
          }
          this.publishHighlight(target);
        }
        break;
      }
      case "sentence":
        this.publishHighlight(findSentenceBoundary(words, idx, command.direction === "prev" ? "backward" : "forward"));
        break;
      case "go-to-href":
        // Legacy handleJumpToChapter foliate branch.
        this.markEngaged();
        this.ports.persistence.markPageActivity();
        this.surface.goTo(command.href);
        break;
      default:
        return; // seek-words / flow-line belong to other modes.
    }
    this.state.notify();
  }

  // ── View events (bound by useModeBindings) ────────────────────────────────
  /** Legacy ReaderContainer onRelocate, page branches. */
  onRelocate = (detail: { readonly cfi: string; readonly fraction: number }): void => {
    if (!this.alive || !detail.cfi) return;
    const s = this.state;
    const fraction = detail.fraction || 0;
    this.ports.shell.reportRelocate({ cfi: detail.cfi, fraction }); // e-ink page turn + fraction (shell)
    const approxWordIdx = Math.floor(fraction * (this.document.wordCount || 0));
    const isBrowsingAway = this.surface.isUserBrowsing();
    if (shouldWriteRelocateCfi({ mode: "page", userBrowsing: isBrowsingAway })) {
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
        mode: "page",
        source: "ReaderContainer:onRelocate",
      }));
    }
    // SELECTION-1: soft selection = first visible word, updated on every page turn.
    if (!hasResumeAnchor && !s.userExplicitSelection) {
      const firstVisible = this.surface.findFirstVisibleWordIndex();
      if (firstVisible >= 0) {
        s.softWordIndex = firstVisible;
        this.surface.applySoftHighlight(firstVisible);
      }
    } else if (!hasResumeAnchor && s.userExplicitSelection) {
      // User clicked a word — reset explicit flag on page turn so soft resumes next page
      s.userExplicitSelection = false;
    }
    s.notify();
    const shouldPersistRelocate = shouldPersistRelocateProgress({
      mode: "page",
      hasEngaged: s.hasEngaged,
      hasResumeAnchor,
      userBrowsing: isBrowsingAway,
    });
    if (!shouldPersistRelocate) return;
    this.ports.persistence.markPageActivity();
    const progressAnchor = resolveCanonicalWordAnchor({
      readingMode: "page",
      resumeAnchor: s.resumeAnchor,
      highlightedWordIndex: s.highlightedWordIndex,
      softWordIndex: s.softWordIndex,
    });
    // High-water pages and the debounced CFI save stay in the shell.
    this.ports.persistence.scheduleRelocateSave({ wordIndex: progressAnchor, cfi: detail.cfi });
  };

  /** Legacy ReaderContainer onLoad, non-scrolled (page) branch. */
  onSurfaceLoad = (): void => {
    if (!this.alive) return;
    // The view calls onLoad once the section has stamped its spans; its API may land later, so the
    // delayed callback below retries.
    this.paintArrivalCursor();
    const timer = setTimeout(() => {
      this.loadTimers.delete(timer);
      if (!this.alive) return;
      const s = this.state;
      s.renderVersion += 1;
      this.paintArrivalCursor();
      this.surface.extractWords();
      if (s.resumeAnchor != null) {
        // TTS-7M (BUG-135): an active resume anchor is the authoritative start point.
        this.ports.diagnostics.transition("resumeAnchor:active-skip", () => ({
          resumeAnchor: s.resumeAnchor,
          source: "ReaderContainer:onLoad",
        }));
      } else if (!s.userExplicitSelection) {
        // TTS-7J (BUG-130): an explicit click wins over passive restore.
        const savedPos = this.document.position || 0;
        if (savedPos >= FOLIATE_MIN_ENGAGEMENT_POSITION) {
          this.publishHighlight(savedPos);
          if (this.surface.isReady()) {
            void this.surface.jumpToWordAnchor(savedPos).then((hit) => {
              if (!this.alive) return;
              if (!hit) {
                const firstVisible = this.surface.findFirstVisibleWordIndex();
                if (firstVisible >= 0) {
                  this.surface.highlight(firstVisible);
                  s.softWordIndex = firstVisible;
                  this.surface.applySoftHighlight(firstVisible);
                }
              } else {
                s.softWordIndex = savedPos;
                this.surface.applySoftHighlight(savedPos);
              }
            });
          }
        } else if (this.surface.isReady()) {
          const firstVisible = this.surface.findFirstVisibleWordIndex();
          if (firstVisible >= 0) {
            this.publishHighlight(firstVisible);
            s.softWordIndex = firstVisible;
            this.surface.applySoftHighlight(firstVisible);
          }
        }
      }
      s.notify();
    }, PAGE_SURFACE_LOAD_DELAY_MS);
    this.loadTimers.add(timer);
  };

  /** S1 G6: paint the handed-over highlight on this session's view (B0's Page highlight effect, no motion). */
  private paintArrivalCursor(): void {
    if (!this.arrivalCursorPending) return;
    if (this.surface.highlight(this.state.publishedHighlightedWordIndex, undefined, { allowMotion: false })) {
      this.arrivalCursorPending = false;
    }
  }

  /** Legacy onWordsReextracted, page part: a new section stamped words → bump the render version. */
  onWordsReextracted = (): void => {
    if (!this.alive || !this.surface.getWords()?.length) return;
    this.state.renderVersion += 1;
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

  /** Legacy commitSharedWordAnchor (Page never narrates, so the resync branch cannot fire). */
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
    this.state.hasEngaged = true;
    this.ports.persistence.markEngaged();
  }

  /** Page has no Focus display; the legacy call wrote useReader.wordIndex (OC-3 channel alias). */
  private jumpDisplayToWord(_wordIndex: number): void { /* mode-local no-op display */ }

  private buildEngineConfig(): ModeConfig {
    const settings = this.settingsSnapshot.settings;
    return {
      words: [...this.document.tokenWords],
      wpm: this.settingsSnapshot.effectiveWpm,
      callbacks: {
        // Page never advances: the legacy retarget path skips page, so jumpTo has no caller.
        onWordAdvance: () => {},
        onPageTurn: () => {},
        onComplete: () => {},
        onError: () => {},
      },
      isFoliate: this.document.useFoliate,
      paragraphBreaks: numberArrayToSet(this.document.paragraphBreaks),
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
  }

  private clearTimers(): void {
    for (const timer of this.loadTimers) clearTimeout(timer);
    this.loadTimers.clear();
  }
}

/** No port calls and no timers in the constructor. */
export function createPageRuntime(input: ReaderModeCreateInput): ReaderModeRuntime {
  return new PageModeRuntime(input);
}

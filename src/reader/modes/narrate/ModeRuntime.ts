/**
 * Narrate mode runtime (READER-MODE-SEPARATION-2 design §B.4). Implements ReaderModeRuntime v1.
 *
 * Narrate is audio-owned (LL-125): the TTS infrastructure behind `ports.audio` is its only clock, and
 * its words advance only on audio truth (the truth-sync RAF flush). It owns its truth/cursor RAFs, its
 * pending section-miss word, its chunk visual state, its section-end ownership, the HOTFIX-6 full-book
 * adoption and the per-word anchor commits the legacy ReaderContainer/useReaderMode ran for narrate.
 * It holds nothing else from TTS: no useNarration, audioScheduler, kokoroRatePlan or narration-type
 * runtime imports (Q-C); diagnostics only through the port (Q-D). No Flow module is reachable: the
 * legacy `startFlow({ targetMode: "narrate", resumeNarration: true })` is copied as Narrate's own start,
 * so `setFlowPlaying(false)` and every Flow branch disappear.
 *
 * Legacy sources: useReaderMode.startFlow (narrate target, exact call order), installNarrateTruthSync /
 * clearNarrateTruthSync / syncFoliateNarrationCursor, handleTogglePlay (narrate branch: speaking →
 * pause; paused or warming → resume() with no arguments; else start — Q-G), handlePauseToPage (narrate
 * part), ReaderContainer applyNarrationActiveWord/ChunkBoundary/SegmentStart, retargetActiveModeToWord
 * and commitSharedWordAnchor (resync), onWordsReextracted (narrate pending branch), useFoliateSync
 * effect 4 (section end) and useNarrationCaching effect 6 (HOTFIX-6). `NarrateModeAdapter` is not the
 * engine: its resume passes an index, production passes none.
 *
 * Release: `stop` makes every release-class call (the pause-to-page narrate part when it applies, then
 * the legacy stopAllModes triple and the cleared infrastructure callbacks), so Narrate→Page emits the
 * fixture's double `audio.stop` inside the router's teardown window; `destroy` after `stop` makes no
 * call. After stop/destroy every call is a no-op and every pending continuation is dropped (LL-109).
 */
import type { MutableRefObject } from "react";
import {
  FOLIATE_SECTION_LOAD_WAIT_MS,
  KOKORO_UI_RATE_MAX,
  KOKORO_UI_RATE_MIN,
  KOKORO_UI_RATE_STEP,
  TTS_MAX_RATE,
  TTS_MIN_RATE,
  TTS_RATE_STEP,
} from "../../../constants";
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
  type ReaderBookWordsValue,
  type ReaderDocumentSnapshot,
  type ReaderModeHandoff,
  type ReaderSessionKey,
  type ReaderSettingsSnapshot,
} from "../../document/ReaderDocumentSnapshot";
import type { ReaderAudioConfig, ReaderAudioPort, ReaderPorts } from "../../ports/ReaderPorts";
import type { SectionBoundary } from "../../../types/narration";
import type { ChunkReadingVisualState, ChunkSourceWord, ReadingChunk } from "../../../types/chunkReading";
import { buildNaturalChunks } from "../../../utils/naturalChunks";
import type { NarrateFoliateViewAPI } from "./FoliateView";
import { NarrateModeState } from "./ModeState";
import { createNarrateSurface, type NarrateSurface } from "./surface";
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
import { createChunkReadingVisualState } from "./helpers/chunkReadingVisualState";
import type { FoliateWord } from "./helpers/foliateHelpers";

/** The chunk-boundary metadata the audio port reports (its own type, read off the port contract). */
type ChunkBoundaryMeta = Parameters<NonNullable<Parameters<ReaderAudioPort["setOnChunkBoundary"]>[0]>>[1];

// Owner-local copy of the Kokoro UI speed step (src/utils/kokoroRatePlan.ts, same values; Q-D).
// ponytail: duplicated 1.0–1.5 domain; the speed amendment (OC-7) must update this copy too.
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
const NARRATE_SURFACE_LOAD_DELAY_MS = 200;

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

/** Legacy ReaderContainer createChunkSourceWords. */
function createChunkSourceWords(params: {
  words: readonly string[];
  foliateWords?: readonly FoliateWord[];
  paragraphBreaks?: Set<number>;
  sections?: readonly Readonly<SectionBoundary>[];
}): ChunkSourceWord[] {
  const { words, foliateWords = [], paragraphBreaks = new Set<number>(), sections } = params;
  const canUseFoliateMetadata = foliateWords.length === words.length;

  return words.map((word, index) => {
    const foliateWord = canUseFoliateMetadata ? foliateWords[index] : undefined;
    return {
      word,
      globalWordIndex: index,
      sectionIndex: foliateWord?.sectionIndex ?? sectionIndexForGlobalWord(sections, index),
      tokenId: foliateWord?.tokenId,
      blockId: foliateWord?.blockId,
      blockTag: foliateWord?.blockTag,
      blockOrdinal: foliateWord?.blockOrdinal,
      sourceLineBreakAfter: foliateWord?.sourceLineBreakAfter,
      paragraphBreakAfter: foliateWord?.paragraphBreakAfter ?? paragraphBreaks.has(index),
    };
  });
}

export class NarrateModeRuntime implements ReaderModeRuntime {
  readonly mode = "narrate" as const;
  readonly contractVersion = READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  readonly document: ReaderDocumentSnapshot;
  /** Populated by this mode's FoliateView while it is mounted. */
  readonly viewApiRef: MutableRefObject<NarrateFoliateViewAPI | null> = { current: null };
  /** resolveBookOpenInitialCfi over the handoff (the view's initial location). */
  readonly initialCfi: string | null;
  private readonly ports: ReaderPorts;
  private readonly arrival: ReaderModeArrival;
  private readonly state: NarrateModeState;
  private readonly surface: NarrateSurface;
  /** The anchor's dependencies; legacy direct reader.jumpToWord calls go through the same display seam. */
  private readonly anchorDeps: PersistentReadingAnchorDeps;
  private readonly anchor: PersistentReadingAnchor;
  private settingsSnapshot: ReaderSettingsSnapshot;
  /** The rate this runtime last asked the shell to store (legacy settings.ttsRate). */
  private rate: number;
  /** Complete full-book words: the document's, or this session's HOTFIX-6 adoption (legacy bookWordsRef). */
  private bookWords: ReaderBookWordsValue | null;
  /** Legacy narrateTruthPendingWordRef / narrateTruthRafRef. */
  private truthPendingWord: number | null = null;
  private truthRaf: number | null = null;
  /** Legacy narrationCursorPendingWordRef / narrationCursorRafRef (non-Foliate cursor). */
  private cursorPendingWord: number | null = null;
  private cursorRaf: number | null = null;
  /** Bumped to cancel an in-flight HOTFIX-6 extraction (legacy effect cleanup `cancelled = true`). */
  private extractionToken = 0;
  /** Legacy naturalReadingChunks memo, keyed by the render version and the word source. */
  private chunkCache: { readonly renderVersion: number; readonly bookWords: ReaderBookWordsValue | null; readonly chunks: ReadingChunk[] } | null = null;
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
    this.rate = this.settingsSnapshot.settings.ttsRate;
    this.bookWords = this.document.bookWords;
    const handoff = createReaderModeHandoff(input.handoff);
    this.state = new NarrateModeState(handoff);
    this.initialCfi = resolveBookOpenInitialCfi({ persistentWordIndex: handoff.canonicalWordIndex, cfi: handoff.cfi });
    this.surface = createNarrateSurface(this.viewApiRef);
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
    const playing = s.narrating && !s.paused;
    return Object.freeze({
      mode: this.mode,
      selected: s.selected,
      playing,
      currentWordIndex: s.currentWordIndex,
      clockOwner: playing ? "audio-truth" as const : "none" as const,
      contractVersion: this.contractVersion,
      key: this.key,
      highlightedWordIndex: s.publishedHighlightedWordIndex,
      publishedWordIndex: s.publishedWordIndex,
      canonicalWordIndex: s.canonicalWordIndex,
      isBrowsedAway: s.isBrowsedAway,
      narrating: s.narrating,
      speed: Object.freeze({ kind: "rate" as const, rate: this.rate }),
      flowProgress: null,
    });
  }

  /** The declared chunk visual state this mode's view renders (legacy chunkReadingVisualState). */
  getChunkVisualState(): ChunkReadingVisualState | null {
    return this.state.chunkVisualState;
  }

  /** Full-book section boundaries for this mode's view (legacy bookWordMeta?.sections). */
  getBookWordSections(): readonly Readonly<SectionBoundary>[] | undefined {
    return this.bookWords?.sections;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  select(wordIndex: number): void {
    if (!this.alive) return;
    const s = this.state;
    const reselect = s.selected;
    s.selected = true;
    s.currentWordIndex = wordIndex;
    if (!reselect) {
      if (this.arrival === "select") {
        // Legacy handleSelectMode for a Narrate destination: stopAllModes (narration.stop("mode-switch"),
        // clearNarrateTruthSync, setPageEndWord(null)) → syncVisualToPersistentWord({ navigate: false })
        // → queuePostModeAnchorSync → setIsBrowsedAway(false) → updateSettings(...).
        this.ports.audio.stop("mode-switch");
        this.clearNarrateTruthSync();
        this.ports.audio.setPageEndWord(null);
        this.anchor.syncVisualToPersistentWord({ navigate: false });
        s.isBrowsedAway = false;
        this.ports.settings.update({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: false });
        this.queuePostModeAnchorSync();
      }
      // The ReaderContainer effect that installs the chunk publishers while readingMode === "narrate".
      this.ports.audio.setOnChunkBoundary(this.onChunkBoundary);
      this.ports.audio.setOnSegmentStart(this.onSegmentStart);
    }
    s.notify();
  }

  /** Legacy useReaderMode.startFlow({ resumeNarration: true, targetMode: "narrate" }), exact call order. */
  start(request: ReaderModeStartRequestV1): void {
    if (!this.alive) return;
    const s = this.state;
    s.pendingStartOnLoad = false;
    // stopAllModes (Narrate's own part).
    this.cancelCursorRaf();
    this.ports.audio.stop("mode-switch");
    this.clearNarrateTruthSync();
    s.narrating = false;
    s.paused = false;
    this.ports.audio.setPageEndWord(null);
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
      // LL-125: the retry re-runs Narrate's own start, so the narrate target and exact word survive.
      this.surface.next();
      this.setTimer(() => {
        this.surface.extractWords();
        const words = this.effectiveWords();
        if (words.length > 0) this.start(request);
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      s.notify();
      return;
    }
    const bookWordsTotalWords = this.bookWords?.totalWords;
    const narrateStartSource = this.consumeModeStartAnchor();
    let startWord = this.document.useFoliate
      ? resolveFoliateStartWord(
        narrateStartSource,
        effectiveWords.length,
        () => this.surface.findFirstVisibleWordIndex(),
        bookWordsTotalWords,
      )
      : narrateStartSource;
    if (this.document.useFoliate && startWord >= effectiveWords.length && effectiveWords.length > 0
      && !(bookWordsTotalWords != null && startWord < bookWordsTotalWords)) {
      const firstVisible = this.surface.findFirstVisibleWordIndex();
      startWord = firstVisible >= 0 ? firstVisible : 0;
    }
    if (this.document.useFoliate && startWord !== s.highlightedWordIndex) this.publishHighlight(startWord);
    this.installNarrateTruthSync();
    this.anchorDeps.jumpDisplayToWord(startWord); // reader.jumpToWord(startWord)
    this.ports.settings.update({ readingMode: "narrate", lastReadingMode: "narrate" });
    s.currentWordIndex = startWord;
    s.startAttempted = true;
    const narrationStart = this.ports.audio.start(effectiveWords, startWord, this.settingsSnapshot.effectiveWpm, (idx) => {
      this.syncFoliateNarrationCursor(idx);
    });
    const narrationActive = narrationStart !== "error";
    s.narrating = narrationActive;
    this.ports.settings.update({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: narrationActive });
    s.notify();
  }

  /** Legacy handleTogglePlay narrate branch, pause half (only while a session is live). */
  pause(): void {
    if (!this.alive || !this.state.narrating) return;
    this.pauseSession(this.ports.audio.readState().cursorWordIndex);
  }

  /** Legacy handleTogglePlay narrate branch, resume half: `narration.resume()` with no arguments. */
  resume(): void {
    if (!this.alive || !this.state.narrating || !this.state.paused) return;
    this.resumeSession();
  }

  /**
   * Legacy handleTogglePlay, narrate branch: a speaking session pauses; a paused (or still warming)
   * session resumes — the next press after a warming start resumes (Q-G); otherwise start.
   */
  togglePlay(): void {
    if (!this.alive) return;
    if (this.state.narrating) {
      const audio = this.ports.audio.readState();
      const narrationSpeaking = audio.speaking === true || audio.status === "speaking" || audio.status === "holding";
      if (narrationSpeaking) this.pauseSession(audio.cursorWordIndex);
      else this.resumeSession();
      return;
    }
    this.start({ cause: "space" });
  }

  stop(reason: ReaderModeStopReason, context?: { readonly destination: ReaderModeId }): void {
    if (!this.alive) return;
    const s = this.state;
    if (s.narrating && reason === "mode-switch" && context?.destination === "page") {
      // Legacy handlePauseToPage, narrate part.
      this.ports.audio.stop("mode-switch");
      this.clearNarrateTruthSync();
      s.narrating = false;
      this.ports.settings.update({ isNarrating: false });
    }
    this.alive = false;
    this.extractionToken += 1;
    this.clearTimers();
    this.truthRaf = null;
    this.truthPendingWord = null;
    this.cursorRaf = null;
    this.cursorPendingWord = null;
    // Legacy stopAllModes (audio.stop, clearNarrateTruthSync, setPageEndWord(null)) and the release of
    // every callback this session registered into infrastructure (release-class calls only).
    this.ports.audio.stop("mode-switch");
    this.ports.audio.setOnTruthSync(null);
    this.ports.audio.setPageEndWord(null);
    this.ports.audio.setOnChunkBoundary(null);
    this.ports.audio.setOnSegmentStart(null);
    this.ports.audio.setOnSectionEnd(null);
    s.sectionEndOwned = false;
    s.narrating = false;
    s.paused = false;
    s.pendingResume = null;
    s.pendingStartOnLoad = false;
    s.selected = false;
    s.chunkVisualState = null;
    s.notify();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.stop("teardown");
    this.destroyed = true;
  }

  jumpToWord(wordIndex: number, _cause: ReaderModeJumpCause): void {
    if (!this.alive) return;
    this.state.currentWordIndex = wordIndex;
    this.state.notify();
  }

  exportHandoff(capture: "persistent" | "capture-current"): ReaderModeHandoff {
    const s = this.state;
    // Legacy captureCurrentAnchor, narrate branch: the audio cursor becomes the highlight — but only if
    // this session attempted a start (OBS-A3-1: the legacy read a stale cursor 0 otherwise).
    const highlighted = capture === "capture-current" && s.startAttempted && this.alive
      ? this.ports.audio.readState().cursorWordIndex
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
      engaged: s.engaged,
    });
  }

  applySettings(next: ReaderSettingsSnapshot): void {
    if (!this.alive) return;
    // The audio bridge (useNarrationSync copy) follows the new snapshot in the binding.
    this.settingsSnapshot = own(next) as ReaderSettingsSnapshot;
    this.rate = this.settingsSnapshot.settings.ttsRate;
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
      // retargetActiveModeToWord, narrate branch: a live session resyncs the audio cursor.
      if (s.narrating) this.ports.audio.resync(anchored, this.settingsSnapshot.effectiveWpm);
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

  /** Chapter prev/next/jump (legacy commitSharedWordAnchor, explicit-navigation, with its resync guard). */
  navigateTo(wordIndex: number): void {
    if (!this.alive) return;
    const clamped = this.commitShared(wordIndex, "explicit-navigation", undefined);
    if (this.state.narrating) {
      const audio = this.ports.audio.readState();
      if (audio.speaking && !audio.warming) this.ports.audio.resync(clamped, this.settingsSnapshot.effectiveWpm);
    }
    this.state.notify();
  }

  /** Legacy handleJumpBackToPersistentWord (narrate style hint). */
  jumpBack(): void {
    if (!this.alive) return;
    const anchor = this.state.canonicalWordIndex;
    this.anchor.syncVisualToPersistentWord({ navigate: true });
    if (this.document.useFoliate) void this.surface.jumpToWordAnchor(anchor);
    this.state.isBrowsedAway = false;
    this.state.notify();
  }

  /** Legacy adjustSpeed, narration branch (keyboard ↑/↓): store the rate and apply it to the audio. */
  adjustSpeed(delta: number): void {
    if (!this.alive) return;
    const settings = this.settingsSnapshot.settings;
    const current = this.rate || 1.0;
    let newRate: number;
    if (settings.ttsEngine === "kokoro") {
      newRate = stepKokoroUiSpeed(current, delta);
    } else {
      const step = delta > 0 ? TTS_RATE_STEP : -TTS_RATE_STEP;
      newRate = Math.round(Math.min(TTS_MAX_RATE, Math.max(TTS_MIN_RATE, current + step)) * 10) / 10;
    }
    this.rate = newRate;
    this.ports.settings.update({ ttsRate: newRate });
    this.ports.audio.adjustRate(newRate);
    this.state.notify();
  }

  handleCommand(command: ReaderModeCommand): void {
    if (!this.alive) return;
    if (command.kind !== "go-to-href") return; // seek/line/page keyboard commands belong to other modes.
    // Legacy handleJumpToChapter foliate branch.
    this.markEngaged();
    this.ports.persistence.markPageActivity();
    this.surface.goTo(command.href);
    this.state.notify();
  }

  // ── Audio truth (installed by start, released by stop) ────────────────────
  /**
   * Legacy installNarrateTruthSync callback body, as a prototype method so G4 can observe the
   * `narrateView.applyActiveWord` seam: ReaderContainer applyNarrationActiveWord.
   */
  applyNarrationActiveWord(wordIndex: number): void {
    const s = this.state;
    // NARRATE-INTENT-CURSOR-1 (A4 fix): the resume anchor is a one-shot intent; consume it once the live
    // spoken word advances strictly past it.
    if (shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: s.resumeAnchor, advancedWordIndex: wordIndex })) {
      s.resumeAnchor = null;
      this.ports.diagnostics.transition("resumeAnchor:consumed", () => ({
        resumeAnchor: null,
        approxWordIdx: wordIndex,
        source: "ReaderContainer:applyNarrationActiveWord:advance-past",
      }));
    }
    s.explicitSelectionAnchor = null;
    const chunks = this.readingChunks();
    if (chunks.length === 0) {
      s.chunkVisualState = null;
      return;
    }
    // Installed through setOnTruthSync, which fires only for trusted spoken-word boundaries.
    s.chunkVisualState = createChunkReadingVisualState({
      mode: "narrate",
      chunks,
      wordIndex,
      syncLevel: "word-synced",
    });
  }

  private onTruthSync = (wordIndex: number): void => {
    if (!this.alive) return;
    this.truthPendingWord = wordIndex;
    if (this.truthRaf != null) return;
    this.truthRaf = this.requestFrame(() => {
      this.truthRaf = null;
      const latestWord = this.truthPendingWord;
      this.truthPendingWord = null;
      if (latestWord == null) return;
      const s = this.state;
      const liveAnchor = this.anchor.commitPersistentWordIndex(latestWord, "mode-advance", {
        persist: false,
        publishState: true,
        navigate: false,
        syncVisual: false,
      });
      this.publishHighlight(liveAnchor);
      s.currentWordIndex = liveAnchor;
      this.applyNarrationActiveWord(liveAnchor);
      const found = this.surface.highlight(liveAnchor, "narrate", { allowMotion: false });
      if (!found) {
        s.pendingResume = liveAnchor;
        const sectionIdx = this.surface.getSectionForWordIndex(liveAnchor);
        if (sectionIdx != null) {
          Promise.resolve(this.surface.goToSection(sectionIdx)).catch(() => {});
        }
      }
      s.notify();
    });
  };

  /** Legacy ReaderContainer applyNarrationChunkBoundary. */
  private onChunkBoundary = (endIdx: number, metadata?: ChunkBoundaryMeta): void => {
    if (!this.alive) return;
    const s = this.state;
    const chunks = this.readingChunks();
    if (chunks.length === 0) {
      s.chunkVisualState = null;
      s.notify();
      return;
    }
    const targetIdxRaw = metadata
      ? metadata.lastConfirmedWordIndex
      : Math.max(endIdx - 1, 0);
    const totalWords = chunks[chunks.length - 1]?.endWordIndex ?? 0;
    const targetIdx = Math.max(0, Math.min(targetIdxRaw, Math.max(totalWords - 1, 0)));
    const parentStart = metadata?.parentChunkStartIdx;
    const parentWordCount = metadata?.parentChunkWordCount;
    const parentEnd = parentStart != null && parentWordCount != null
      ? parentStart + parentWordCount
      : null;

    const chunkIdByParentRange = parentStart != null && parentEnd != null
      ? chunks.find((chunk) =>
        chunk.startWordIndex <= parentStart &&
        chunk.endWordIndex >= parentEnd
      )?.id ?? null
      : null;
    const chunkIdByTargetWord = chunks.find((chunk) => (
      chunk.startWordIndex <= targetIdx && chunk.endWordIndex > targetIdx
    ))?.id ?? null;
    const syncDecision = this.ports.audio.resolveHighlightSync({
      wordIndex: totalWords > 0 ? targetIdx : null,
      followingEnabled: true,
      fallbackMode: "chunk",
    });
    const policySyncLevel = syncDecision && syncDecision.syncLevel !== "off"
      ? syncDecision.syncLevel
      : "chunk-synced";

    s.chunkVisualState = createChunkReadingVisualState({
      mode: "narrate",
      chunks,
      wordIndex: totalWords > 0 ? targetIdx : null,
      chunkId: chunkIdByParentRange ?? chunkIdByTargetWord,
      syncLevel: policySyncLevel,
    });
    s.notify();
  };

  /** Legacy ReaderContainer applyNarrationSegmentStart. */
  private onSegmentStart = (wordIndex: number): void => {
    if (!this.alive) return;
    const s = this.state;
    const chunks = this.readingChunks();
    s.chunkVisualState = chunks.length === 0
      ? null
      : createChunkReadingVisualState({ mode: "narrate", chunks, wordIndex, syncLevel: "chunk-synced" });
    s.notify();
  };

  // ── View events (bound by useModeBindings) ────────────────────────────────
  /** Legacy ReaderContainer onRelocate, narrate branches (audio truth owns the highlight). */
  onRelocate = (detail: { readonly cfi: string; readonly fraction: number }): void => {
    if (!this.alive || !detail.cfi) return;
    const s = this.state;
    const fraction = detail.fraction || 0;
    this.ports.shell.reportRelocate({ cfi: detail.cfi, fraction }); // e-ink page turn + fraction (shell)
    const approxWordIdx = Math.floor(fraction * (this.document.wordCount || 0));
    const isBrowsingAway = this.surface.isUserBrowsing();
    if (shouldWriteRelocateCfi({ mode: "narrate", userBrowsing: isBrowsingAway })) {
      s.cfi = detail.cfi;
      this.ports.persistence.recordCfi(detail.cfi);
    }
    // During narration the truth sync owns highlightedWordIndex (TTS-7M: the anchor is the authority).
    const hasResumeAnchor = s.resumeAnchor != null;
    if (hasResumeAnchor) {
      this.ports.diagnostics.transition("resumeAnchor:active-skip", () => ({
        resumeAnchor: s.resumeAnchor,
        approxWordIdx,
        mode: "narrate",
        source: "ReaderContainer:onRelocate",
      }));
    }
    const shouldPersistRelocate = shouldPersistRelocateProgress({
      mode: "narrate",
      hasEngaged: s.engaged,
      hasResumeAnchor,
      userBrowsing: isBrowsingAway,
    });
    if (!shouldPersistRelocate) return;
    this.ports.persistence.markPageActivity();
    const progressAnchor = resolveCanonicalWordAnchor({
      readingMode: "narrate",
      resumeAnchor: s.resumeAnchor,
      highlightedWordIndex: s.highlightedWordIndex,
      softWordIndex: s.softWordIndex,
      narrationWordIndex: this.ports.audio.readState().cursorWordIndex,
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
    }, NARRATE_SURFACE_LOAD_DELAY_MS);
  };

  /**
   * Legacy onWordsReextracted: bump the render version; then, for a truth-sync section miss, restore
   * the spoken-word highlight once the new section has stamped its spans (Narrate never resumes a timer).
   */
  onWordsReextracted = (): void => {
    if (!this.alive) return;
    const s = this.state;
    const words = this.surface.getWords();
    if (!words?.length) return;
    s.renderVersion += 1;
    const pending = s.pendingResume;
    if (pending != null) {
      s.pendingResume = null;
      // Allow the DOM to settle after word extraction + span wrapping.
      this.requestFrame(() => {
        const found = this.surface.highlight(pending);
        if (!found) s.pendingResume = pending;
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

  /** Legacy handleFoliateUserBrowseAway (Narrate keeps speaking; the jump-back button returns). */
  onUserBrowseAway = (): void => {
    if (!this.alive || this.state.isBrowsedAway) return;
    this.state.isBrowsedAway = true;
    this.state.notify();
  };

  /**
   * Legacy useFoliateSync effect 1 tick. Narrate is a browse-aware surface only while narrating;
   * otherwise the legacy effect cleared the flag (`if (isBrowsedAway) setIsBrowsedAway(false)`).
   */
  pollBrowsing = (): void => {
    if (!this.alive) return;
    const browsing = this.state.narrating ? this.surface.isUserBrowsing() : false;
    if (browsing === this.state.isBrowsedAway) return;
    this.state.isBrowsedAway = browsing;
    this.state.notify();
  };

  /** Legacy useFoliateSync effect 4: own the section-end fallback until full-book words exist. */
  syncSectionEnd = (): void => {
    if (!this.alive) return;
    const s = this.state;
    const ownsFallback = this.document.useFoliate && !this.bookWords;
    if (!ownsFallback) {
      this.releaseSectionEnd();
      return;
    }
    s.sectionEndOwned = true;
    this.ports.audio.setOnSectionEnd(this.onSectionEnd);
  };

  /** Legacy useFoliateSync effect 4 cleanup. */
  releaseSectionEnd = (): void => {
    if (!this.alive || !this.state.sectionEndOwned) return;
    this.ports.audio.setOnSectionEnd(null);
    this.state.sectionEndOwned = false;
  };

  /**
   * Legacy useNarrationCaching effect 6 (HOTFIX-6): while narrating without full-book words, extract
   * them (document port), hand the audio the global array at the current position, and publish the
   * sections so this mode's own view restamps its loaded sections (its bookWordSections effect).
   */
  ensureFullBookWords = (): void => {
    if (!this.alive || !this.document.useFoliate || !this.state.narrating || this.bookWords) return;
    const token = ++this.extractionToken;
    const currentSectionIdx = this.surface.getFirstLoadedSectionIndex() ?? 0;
    this.ports.document.ensureBookWords().then((result) => {
      if (!this.alive || token !== this.extractionToken || !result) return;
      // TTS-7C: yield between extraction result processing and ref updates.
      this.setTimer(() => {
        if (token !== this.extractionToken || this.bookWords) return;
        this.bookWords = result;
        this.ports.audio.configure({ footnoteCues: result.footnoteCues });
        const currentSection = result.sections.find((section) => section.sectionIndex === currentSectionIdx);
        const currentLocalIdx = this.state.highlightedWordIndex;
        if (currentSection && currentLocalIdx >= 0) {
          this.ports.audio.updateWords(result.words, currentSection.startWordIdx + currentLocalIdx);
        }
        this.syncSectionEnd();
        this.state.notify();
      }, 0);
    }, () => { /* extraction failed: narration keeps the loaded words */ });
  };

  /** Legacy HOTFIX-6 effect cleanup (`cancelled = true`). */
  cancelFullBookWords = (): void => {
    this.extractionToken += 1;
  };

  /** useNarrationSync bridge: one configure() call per changed field group. */
  configureAudio = (config: ReaderAudioConfig): void => {
    if (this.alive) this.ports.audio.configure(config);
  };

  /** useNarrationSync effect 6: apply the stored rate when it differs from the engine's. */
  syncAudioRate = (): void => {
    if (!this.alive) return;
    const ttsRate = this.settingsSnapshot.settings.ttsRate;
    if (ttsRate && ttsRate !== this.ports.audio.readState().rate) this.ports.audio.adjustRate(ttsRate);
  };

  /** Legacy `narration.speaking ? narration.cursorWordIndex : undefined` (polled on render). */
  readNarrationWordIndex = (): number | undefined => {
    if (!this.alive) return undefined;
    const audio = this.ports.audio.readState();
    return audio.speaking ? audio.cursorWordIndex : undefined;
  };

  /** Footnote cues of the full-book words (useNarrationSync effect 10). */
  getFootnoteCues(): ReaderBookWordsValue["footnoteCues"] {
    return this.bookWords?.footnoteCues ?? [];
  }

  /** Document port; a stopped runtime's view gets a promise that never settles (LL-109). */
  readBookBytes = (): Promise<ArrayBuffer> => (this.alive ? this.ports.document.readBookBytes() : new Promise<ArrayBuffer>(() => {}));

  recordDiagnostic = (kind: string, detail: string): void => {
    if (this.alive) this.ports.diagnostics.record(kind, detail);
  };

  /** Canonical extractor words for a section, when full-book words exist (SRL-067). */
  getCanonicalSectionWords = (sectionIndex: number): string[] | undefined => {
    const bookWords = this.bookWords;
    const section = bookWords?.sections.find((entry) => entry.sectionIndex === sectionIndex);
    return bookWords && section ? bookWords.words.slice(section.startWordIdx, section.endWordIdx) : undefined;
  };

  /** Legacy foliateRenderVersion (bumped after each section load). */
  getRenderVersion(): number {
    return this.state.renderVersion;
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private pauseSession(cursorWordIndex: number): void {
    const s = this.state;
    const clampedAnchor = this.anchor.commitPersistentWordIndex(cursorWordIndex, "mode-advance", {
      persist: false,
      publishState: true,
      navigate: false,
      syncVisual: true,
    });
    s.resumeAnchor = clampedAnchor;
    this.ports.diagnostics.transition("resumeAnchor:set", () => ({
      resumeAnchor: clampedAnchor,
      source: "useReaderModeOrchestrator:handleTogglePlay:narrate-pause",
    }));
    this.publishHighlight(clampedAnchor);
    s.currentWordIndex = clampedAnchor;
    this.ports.audio.pause("user-stop");
    s.narrating = true;
    s.paused = true;
    this.ports.settings.update({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: true });
    s.notify();
  }

  private resumeSession(): void {
    const s = this.state;
    this.ports.audio.resume();
    s.narrating = true;
    s.paused = false;
    this.ports.settings.update({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: true });
    s.notify();
  }

  /** Legacy installNarrateTruthSync (needs this mode's view; otherwise it clears). */
  private installNarrateTruthSync(): void {
    if (!this.document.useFoliate || !this.surface.isReady()) {
      this.clearNarrateTruthSync();
      return;
    }
    this.ports.audio.setOnTruthSync(this.onTruthSync);
  }

  /** Legacy clearNarrateTruthSync. */
  private clearNarrateTruthSync(): void {
    if (this.truthRaf != null) {
      cancelAnimationFrame(this.truthRaf);
      this.rafs.delete(this.truthRaf);
      this.truthRaf = null;
    }
    this.truthPendingWord = null;
    this.ports.audio.setOnTruthSync(null);
  }

  /**
   * Legacy syncFoliateNarrationCursor(idx, "narrate"): on Foliate the truth sync owns the highlight, so
   * the word only re-renders this mode's view (which reads the audio cursor); otherwise a RAF publishes it.
   */
  private syncFoliateNarrationCursor(idx: number): void {
    if (!this.alive) return;
    const s = this.state;
    if (this.document.useFoliate) {
      s.notify();
      return;
    }
    s.highlightedWordIndex = idx;
    this.cursorPendingWord = idx;
    if (this.cursorRaf == null) {
      this.cursorRaf = this.requestFrame(() => {
        this.cursorRaf = null;
        const latestWord = this.cursorPendingWord;
        this.cursorPendingWord = null;
        if (latestWord == null) return;
        s.publishedHighlightedWordIndex = latestWord;
        s.notify();
      });
    }
  }

  private cancelCursorRaf(): void {
    if (this.cursorRaf != null) {
      cancelAnimationFrame(this.cursorRaf);
      this.rafs.delete(this.cursorRaf);
      this.cursorRaf = null;
    }
    this.cursorPendingWord = null;
  }

  /** Section-end fallback before full-book words (legacy useFoliateSync effect 4 callback). */
  private onSectionEnd = (): void => {
    if (!this.alive || this.bookWords || !this.surface.isReady()) return;
    this.surface.next();
    Promise.resolve(this.surface.waitForSectionReady())
      .then(() => {
        if (!this.alive) return;
        this.surface.extractWords();
        if (this.effectiveWords().length > 0) {
          this.ports.audio.resync(0, this.settingsSnapshot.effectiveWpm);
        }
      })
      .catch(() => {});
  };

  /** Legacy naturalReadingChunks (memo over the effective words and the render version). */
  private readingChunks(): ReadingChunk[] {
    const renderVersion = this.state.renderVersion;
    if (this.chunkCache?.renderVersion === renderVersion && this.chunkCache.bookWords === this.bookWords) {
      return this.chunkCache.chunks;
    }
    const foliateWords = (this.document.useFoliate && !this.bookWords ? this.surface.getFoliateWords() : null) ?? [];
    const chunks = buildNaturalChunks(createChunkSourceWords({
      words: this.effectiveWords(),
      foliateWords,
      paragraphBreaks: numberArrayToSet(this.document.paragraphBreaks),
      sections: this.bookWords?.sections,
    }));
    this.chunkCache = { renderVersion, bookWords: this.bookWords, chunks };
    return chunks;
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
    return this.bookWords?.totalWords || this.document.wordCount || this.document.tokenWords.length;
  }

  /** Legacy getEffectiveWords: full-book words when complete, else the loaded slice, else tokenized words. */
  private effectiveWords(): readonly string[] {
    if (this.document.useFoliate) {
      if (this.bookWords) return this.bookWords.words;
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
      const section = this.bookWords?.sections.find((entry) => entry.sectionIndex === sectionIndex);
      if (section) {
        return this.clampToEffectiveWordRange(section.startWordIdx + wordOffsetInSection);
      }
      // Early in a fresh book, section metadata may not be hydrated: use the section-local offset.
      return this.clampToEffectiveWordRange(wordOffsetInSection);
    }
    return null;
  }

  /** Legacy commitSharedWordAnchor (persist + publish + navigate); the caller owns the resync. */
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

  /** Legacy reader.jumpToWord wrote Focus's display index; Narrate has no display index (mode-local no-op, OC-3). */
  private jumpDisplayToWord(_wordIndex: number): void { /* mode-local no-op display */ }

  private setTimer(run: () => void, delayMs: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (this.alive) run();
    }, delayMs);
    this.timers.add(timer);
  }

  private requestFrame(run: () => void): number {
    const raf = requestAnimationFrame(() => {
      this.rafs.delete(raf);
      if (this.alive) run();
    });
    this.rafs.add(raf);
    return raf;
  }

  private clearTimers(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const raf of this.rafs) cancelAnimationFrame(raf);
    this.rafs.clear();
  }
}

/** No port calls and no timers in the constructor. */
export function createNarrateRuntime(input: ReaderModeCreateInput): ReaderModeRuntime {
  return new NarrateModeRuntime(input);
}

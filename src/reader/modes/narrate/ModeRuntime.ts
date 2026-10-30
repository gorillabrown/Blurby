/**
 * Narrate mode runtime (NARRATE-REBUILD-1 P4). Implements ReaderModeRuntime v1 over the P3 engine.
 *
 * The runtime owns the mode's anchor state, its view's surface controller and one NarrateEngine. The engine
 * owns the sample clock and the exact word tables; this runtime only forwards intents (start, pause, resume,
 * click, speed) and publishes the engine's cursor as the highlighted word. Everything outside the mode goes
 * through its ports; the producer is reached through the preload surface (window.electronAPI.narrate*) and
 * the one AudioContext through the AudioOutput seam, both injectable for tests. No estimated timing exists
 * here: the cursor is whatever the engine looked up in its table at the playback sample.
 * After stop/destroy every call is a no-op and every pending continuation is dropped (LL-109).
 */
import type { MutableRefObject } from "react";
import {
  FOLIATE_SECTION_LOAD_WAIT_MS,
  KOKORO_DEFAULT_VOICE,
  NARRATE_CHUNK_RAMP,
  NARRATE_PREFETCH_AHEAD_S,
  NARRATE_STEADY_CHUNK_MAX_WORDS,
  KOKORO_UI_RATE_MAX,
  KOKORO_UI_RATE_MIN,
  KOKORO_UI_RATE_STEP,
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
  type ReaderDocumentSnapshot,
  type ReaderModeHandoff,
  type ReaderSessionKey,
  type ReaderSettingsSnapshot,
} from "../../document/ReaderDocumentSnapshot";
import type { ReaderPorts } from "../../ports/ReaderPorts";
import type { SectionBoundary } from "../../../types/narration";
import type { TtsEvalTraceInputEvent } from "../../../types/eval";
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
import { NarrateEngine, type EngineFailure, type EngineState, type ProducerPort, type ProducerResult } from "./engine/narrateEngine";
import { WebAudioOutput, type AudioOutput } from "./engine/playbackClock";
import type { ChunkTable } from "./engine/wordTable";
import { logNarrateStartError } from "./helpers/logStartError";

/** Legacy onLoad delay (ReaderContainer: "Slightly longer delay to ensure foliate has finished rendering"). */
const NARRATE_SURFACE_LOAD_DELAY_MS = 200;
/** Legacy useFoliateSync effect 3 goToSection throttle. */
const NARRATE_SAMPLE_RATE = 24000;

/** Frozen inputs are kept as-is; anything else is deep-copied and frozen first. */
function own<T>(value: T) {
  return Object.isFrozen(value) ? value : freezeValue(value);
}

/** Snap a rate to the 0.05 grid inside the UI range (the speed tensor is float32; the grid keeps requests exact). */
export function snapRate(rate: number): number {
  const steps = Math.round((rate - KOKORO_UI_RATE_MIN) / KOKORO_UI_RATE_STEP);
  const snapped = KOKORO_UI_RATE_MIN + steps * KOKORO_UI_RATE_STEP;
  return Math.max(KOKORO_UI_RATE_MIN, Math.min(KOKORO_UI_RATE_MAX, Math.round(snapped * 100) / 100));
}

export interface NarrateRuntimeDeps {
  /** The main-process producer (P3) behind the preload surface. */
  readonly producer: ProducerPort;
  /** The one AudioContext of a session, created on the first start. */
  readonly createOutput: (sampleRate: number) => AudioOutput;
}

interface NarrateIpcResult {
  readonly table?: unknown;
  readonly pcm?: Float32Array;
  readonly sampleRate?: number;
  readonly genMs?: number;
  readonly worker?: number;
  readonly busyAtAssign?: { readonly worker: number; readonly pool: number; readonly workers: number };
  readonly ipc?: { readonly recvEpoch: number; readonly replyEpoch: number; readonly stages?: Readonly<Record<string, number>> };
  readonly error?: string;
}

function preloadProducer(): ProducerPort {
  return {
    async generate(request): Promise<ProducerResult> {
      const api = (globalThis as { electronAPI?: { narrateGenerate?: (text: string, voice: string, speed: number, options?: { priority: "request" | "prefetch"; group: string }) => Promise<NarrateIpcResult> } }).electronAPI;
      if (!api?.narrateGenerate) throw new Error("narrate producer unavailable (no preload surface)");
      const r = await api.narrateGenerate(request.text, request.voice, request.speed, { priority: request.priority ?? "request", group: request.group ?? "" });
      if (!r || r.error) throw new Error(r?.error ?? "narrate producer returned nothing");
      if (!(r.pcm instanceof Float32Array)) throw new Error("narrate producer returned no PCM");
      return { table: (r.table ?? null) as ChunkTable | null, pcm: r.pcm, sampleRate: r.sampleRate ?? NarrateIpcSampleRate(r), genMs: r.genMs, worker: r.worker, busyAtAssign: r.busyAtAssign, ipc: r.ipc };
    },
    async preload(): Promise<void> {
      const api = (globalThis as { electronAPI?: { narratePreload?: () => Promise<unknown> } }).electronAPI;
      await api?.narratePreload?.();
    },
    cancelQueued(groupPrefix: string): void {
      const api = (globalThis as { electronAPI?: { narrateCancelQueued?: (groupPrefix: string) => Promise<number> } }).electronAPI;
      void api?.narrateCancelQueued?.(groupPrefix)?.catch((err: unknown) => console.warn("[narrate] cancel queued failed:", err instanceof Error ? err.message : String(err)));
    },
  };
}
function NarrateIpcSampleRate(_r: NarrateIpcResult): number { return NARRATE_SAMPLE_RATE; }

export function defaultNarrateDeps(): NarrateRuntimeDeps {
  return { producer: preloadProducer(), createOutput: (sampleRate) => new WebAudioOutput(sampleRate) };
}

export class NarrateModeRuntime implements ReaderModeRuntime {
  readonly mode = "narrate" as const;
  readonly contractVersion = READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  private documentSnapshot: ReaderDocumentSnapshot;
  private unsubscribeDocument: (() => void) | null = null;
  /** Populated by this mode's FoliateView while it is mounted. */
  readonly viewApiRef: MutableRefObject<NarrateFoliateViewAPI | null> = { current: null };
  readonly initialCfi: string | null;
  private readonly ports: ReaderPorts;
  private readonly arrival: ReaderModeArrival;
  private readonly deps: NarrateRuntimeDeps;
  private readonly state: NarrateModeState;
  private readonly surface: NarrateSurface;
  private readonly anchorDeps: PersistentReadingAnchorDeps;
  private readonly anchor: PersistentReadingAnchor;
  private settingsSnapshot: ReaderSettingsSnapshot;
  private voice: string;
  private rate: number;
  private engine: NarrateEngine | null = null;
  private engineWords: readonly string[] = [];
  private output: AudioOutput | null = null;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private readonly rafs = new Set<number>();
  private alive = true;
  private destroyed = false;
  private arrivalCursorPending: boolean;

  constructor(input: ReaderModeCreateInput, deps: NarrateRuntimeDeps = defaultNarrateDeps()) {
    this.key = input.key;
    this.ports = input.ports;
    this.arrival = input.arrival;
    this.deps = deps;
    this.arrivalCursorPending = input.handoff.source != null;
    this.documentSnapshot = own(input.document) as ReaderDocumentSnapshot;
    this.settingsSnapshot = own(input.settings) as ReaderSettingsSnapshot;
    this.voice = this.settingsSnapshot.settings.ttsVoiceName || KOKORO_DEFAULT_VOICE;
    this.rate = snapRate(Number(this.settingsSnapshot.settings.ttsRate) || 1.0);
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
    // D6: load and warm the voice on entering the mode, so the first Play does not pay the model load (F5 still
    // covers a Play that arrives first). A failure here surfaces again, fail-closed, on the first generate.
    this.deps.producer.preload?.().catch(() => {});
  }

  // ── Store ──────────────────────────────────────────────────────────────────
  subscribe = (listener: () => void): (() => void) => this.state.subscribe(listener);
  getVersion = (): number => this.state.version;

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
      clockOwner: s.playing ? "audio-truth" as const : "none" as const,
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

  /** F5 / F4 for the view: the voice-loading state, or the "could not be timed" notice. */
  getNotice(): { readonly kind: "loading" | "timing-missing"; readonly text: string } | null {
    const s = this.state;
    if (s.failure) return { kind: "timing-missing", text: "This passage couldn't be timed. Narration paused on the last timed word." };
    if (s.loading) return { kind: "loading", text: "Voice loading…" };
    return null;
  }

  /** The spoken word for the view's highlight and scroll-follow; undefined when nothing is playing. */
  getNarrationWordIndex(): number | undefined {
    return this.state.playing ? this.state.publishedHighlightedWordIndex : undefined;
  }

  getRenderVersion(): number {
    return this.state.renderVersion;
  }

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
    this.unsubscribeDocument ??= this.ports.document.subscribe(this.adoptDocument);
    const reselect = this.state.selected;
    this.state.selected = true;
    this.state.currentWordIndex = wordIndex;
    if (!reselect && this.arrival === "select") {
      this.anchor.syncVisualToPersistentWord({ navigate: false });
      this.state.isBrowsedAway = false;
      this.ports.settings.update({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: false });
      this.queuePostModeAnchorSync();
    }
    this.state.notify();
  }

  start(_request: ReaderModeStartRequestV1): void {
    if (!this.alive) return;
    this.arrivalCursorPending = false;
    const s = this.state;
    s.pendingStartOnLoad = false;
    s.failure = null;
    this.surface.clearSoftHighlight();
    this.markEngaged();
    if (this.document.useFoliate) {
      if (!this.surface.isReady() && this.document.tokenWords.length === 0) {
        s.pendingStartOnLoad = true;
        s.notify();
        return;
      }
      this.surface.extractWords();
    }
    const effectiveWords = [...this.effectiveWords()];
    if (this.document.useFoliate && effectiveWords.length === 0 && this.surface.isReady()) {
      this.traceSectionNav("empty-words-retry", this.state.currentWordIndex);
      this.surface.next();
      this.setTimer(() => {
        this.surface.extractWords();
        if (this.effectiveWords().length > 0) this.start(_request);
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      s.notify();
      return;
    }
    const bookWordsTotalWords = this.document.bookWords?.totalWords;
    const startSource = this.consumeModeStartAnchor();
    let startWord = this.document.useFoliate
      ? resolveFoliateStartWord(startSource, effectiveWords.length, () => this.surface.findFirstVisibleWordIndex(), bookWordsTotalWords)
      : startSource;
    if (this.document.useFoliate && startWord >= effectiveWords.length && effectiveWords.length > 0
      && !(bookWordsTotalWords != null && startWord < bookWordsTotalWords)) {
      const firstVisible = this.surface.findFirstVisibleWordIndex();
      startWord = firstVisible >= 0 ? firstVisible : 0;
    }
    if (startWord !== s.highlightedWordIndex) this.publishHighlight(startWord);
    this.anchorDeps.jumpDisplayToWord(startWord);
    if (this.document.useFoliate && this.surface.isReady()) this.surface.highlight(startWord, "narrate", { allowMotion: true });
    this.ports.settings.update({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: true });
    s.playing = true;
    s.narrating = true;
    s.loading = true;
    this.engineFor(effectiveWords).play(startWord);
    if (this.document.useFoliate && !this.document.bookWords) void this.ports.document.ensureBookWords().catch(() => {});
    s.notify();
  }

  pause(): void {
    if (!this.alive || !this.state.playing) return;
    this.state.pendingStartOnLoad = false;
    this.engine?.pause();
    this.state.playing = false;
    this.state.notify();
  }

  resume(): void {
    if (!this.alive || !this.engine || this.state.playing) return;
    if (this.engine.getSnapshot().state !== "paused") return;
    this.engine.resume();
    this.state.playing = true;
    this.state.notify();
  }

  togglePlay(): void {
    if (!this.alive) return;
    if (this.state.playing) { this.pause(); return; }
    if (this.engine && this.engine.getSnapshot().state === "paused" && !this.state.failure) { this.resume(); return; }
    this.start({ cause: "space" });
  }

  stop(_reason: ReaderModeStopReason, _context?: { readonly destination: ReaderModeId }): void {
    if (!this.alive) return;
    this.alive = false;
    this.unsubscribeDocument?.();
    this.unsubscribeDocument = null;
    this.clearTimers();
    this.engine?.stop();
    this.engine = null;
    this.output?.close();
    this.output = null;
    const s = this.state;
    s.pendingStartOnLoad = false;
    s.pendingResume = null;
    s.sectionNavInFlight = null;
    s.playing = false;
    s.loading = false;
    s.selected = false;
    if (s.narrating) {
      s.narrating = false;
      this.ports.settings.update({ isNarrating: false }); // release-class call (READER_PORT_RELEASE_CALLS)
    }
    s.notify();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.stop("teardown");
    this.destroyed = true;
  }

  jumpToWord(wordIndex: number, _cause: ReaderModeJumpCause): void {
    if (!this.alive) return;
    if (this.state.playing && this.engine) { this.engine.play(wordIndex, "navigate"); return; }
    this.state.currentWordIndex = wordIndex;
    this.state.notify();
  }

  exportHandoff(capture: "persistent" | "capture-current"): ReaderModeHandoff {
    const s = this.state;
    const highlighted = capture === "capture-current" && this.engine && s.playing
      ? Math.max(0, this.engine.getSnapshot().cursor >= 0 ? this.engine.getSnapshot().cursor : s.publishedHighlightedWordIndex)
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
    this.settingsSnapshot = own(next) as ReaderSettingsSnapshot;
    const voice = this.settingsSnapshot.settings.ttsVoiceName || KOKORO_DEFAULT_VOICE;
    if (voice !== this.voice) { this.voice = voice; this.engine?.setVoice(voice); }
    const rate = snapRate(Number(this.settingsSnapshot.settings.ttsRate) || this.rate);
    if (rate !== this.rate) { this.rate = rate; this.engine?.setSpeed(rate); }
    this.state.notify();
  }

  /** Speed dialog and keys: the exact grid value is stored in settings and applied at the next word (R7). */
  setSpeed(speed: ReaderModeSpeed): void {
    if (!this.alive || speed.kind !== "rate") return;
    const rate = snapRate(speed.rate);
    if (!(rate > 0)) return;
    this.rate = rate;
    this.ports.settings.update({ ttsRate: rate }); // fire-and-forget (BUG-185): never treated as persisted
    this.engine?.setSpeed(rate);
    this.state.notify();
  }

  adjustSpeed(delta: number): void {
    if (!this.alive || !delta) return;
    this.setSpeed({ kind: "rate", rate: this.rate + (delta > 0 ? KOKORO_UI_RATE_STEP : -KOKORO_UI_RATE_STEP) });
  }

  // ── User intents ──────────────────────────────────────────────────────────
  hardSelect(input: ReaderHardSelectInput): void {
    if (!this.alive) return;
    const s = this.state;
    this.markEngaged();
    this.ports.persistence.markPageActivity();
    s.userExplicitSelection = true;
    this.surface.clearSoftHighlight();
    s.cfi = input.cfi;
    if (input.cfi) this.ports.persistence.recordCfi(input.cfi);
    const resolved = this.resolveClickedGlobalWordIndex(input.sectionIndex, input.wordOffsetInSection, input.globalWordIndex);
    if (resolved != null) {
      s.resumeAnchor = resolved;
      this.ports.diagnostics.transition("resumeAnchor:set", () => ({ resumeAnchor: resolved, source: "narrate:onWordClick:click-to-narrate" }));
      s.explicitSelectionAnchor = resolved;
      const anchored = this.commitShared(resolved, "hard-selection", input.cfi);
      // F2: a click while playing restarts speech at the clicked word; while paused it sets where Play starts.
      if (s.playing && this.engine) { s.failure = null; s.loading = true; this.engine.play(anchored, "click"); }
      if (shouldClearBrowseAwayOnAnchorEvent({ type: "hard-selection", wordIndex: anchored })) {
        this.surface.clearUserBrowsing();
        s.isBrowsedAway = false;
      }
      s.notify();
      return;
    }
    s.resumeAnchor = null;
    this.ports.diagnostics.transition("resumeAnchor:consumed", () => ({ resumeAnchor: null, source: "narrate:onWordClick:no-resolved-index" }));
    this.ports.diagnostics.record("selection-validated", `no exact index for "${input.word}" — preserved anchor ${s.highlightedWordIndex}`);
    s.notify();
  }

  navigateTo(wordIndex: number): void {
    if (!this.alive) return;
    this.commitShared(wordIndex, "explicit-navigation", undefined);
    if (this.state.playing && this.engine) this.engine.play(this.state.currentWordIndex, "navigate");
    this.state.notify();
  }

  jumpBack(): void {
    if (!this.alive) return;
    const anchor = this.state.canonicalWordIndex;
    this.anchor.syncVisualToPersistentWord({ navigate: true });
    if (this.document.useFoliate) {
      this.traceSectionNav("jump-back", anchor);
      void this.surface.jumpToWordAnchor(anchor);
    }
    this.surface.clearUserBrowsing();
    this.state.isBrowsedAway = false;
    this.state.notify();
  }

  handleCommand(command: ReaderModeCommand): void {
    if (!this.alive) return;
    if (command.kind !== "go-to-href") return;
    this.markEngaged();
    this.ports.persistence.markPageActivity();
    this.traceSectionNav("toc-goto", null);
    this.surface.goTo(command.href);
    this.state.notify();
  }

  // ── View events (bound by useModeBindings) ────────────────────────────────
  onRelocate = (detail: { readonly cfi: string; readonly fraction: number }): void => {
    if (!this.alive || !detail.cfi) return;
    const s = this.state;
    this.ports.shell.reportRelocate({ cfi: detail.cfi, fraction: detail.fraction || 0 });
    const isBrowsingAway = this.surface.isUserBrowsing();
    if (shouldWriteRelocateCfi({ mode: "narrate", userBrowsing: isBrowsingAway })) {
      s.cfi = detail.cfi;
      this.ports.persistence.recordCfi(detail.cfi);
    }
    const hasResumeAnchor = s.resumeAnchor != null;
    if (!shouldPersistRelocateProgress({ mode: "narrate", hasEngaged: s.engaged, hasResumeAnchor, userBrowsing: isBrowsingAway })) return;
    this.ports.persistence.markPageActivity();
    const progressAnchor = resolveCanonicalWordAnchor({
      readingMode: "narrate",
      resumeAnchor: s.resumeAnchor,
      highlightedWordIndex: s.highlightedWordIndex,
      softWordIndex: s.softWordIndex,
    });
    this.ports.persistence.scheduleRelocateSave({ wordIndex: progressAnchor, cfi: detail.cfi });
  };

  onSurfaceLoad = (): void => {
    if (!this.alive) return;
    this.paintArrivalCursor();
    this.setTimer(() => {
      this.paintArrivalCursor();
      this.state.renderVersion += 1;
      this.state.notify();
      if (this.state.pendingStartOnLoad) {
        this.state.pendingStartOnLoad = false;
        this.start({ cause: "play-button" });
      }
    }, NARRATE_SURFACE_LOAD_DELAY_MS);
  };

  private paintArrivalCursor(): void {
    if (!this.arrivalCursorPending || this.state.playing) return;
    if (this.surface.highlight(this.state.publishedHighlightedWordIndex, "flow", { allowMotion: false })) this.arrivalCursorPending = false;
  }

  onWordsReextracted = (): void => {
    if (!this.alive) return;
    const s = this.state;
    const words = this.surface.getWords();
    if (!words?.length) return;
    s.renderVersion += 1;
    const pending = s.pendingResume;
    if (pending != null) {
      s.pendingResume = null;
      this.requestFrame(() => {
        if (!this.surface.highlight(pending, "narrate")) {
          s.pendingResume = pending;
          this.followSpokenSection(pending, "pending-resume");
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
    this.ports.shell.reportToc(freezeValue(JSON.parse(JSON.stringify(toc)) as unknown[]), sectionCount);
  };

  /** Browsing away never stops narration (legacy: the jump-back button returns to the spoken word). */
  onUserBrowseAway = (): void => {
    if (!this.alive || this.state.isBrowsedAway) return;
    this.state.isBrowsedAway = true;
    this.state.notify();
  };

  pollBrowsing = (): void => {
    if (!this.alive) return;
    const browsing = this.surface.isUserBrowsing();
    if (browsing === this.state.isBrowsedAway) return;
    this.state.isBrowsedAway = browsing;
    this.state.notify();
  };

  /** Follow the spoken word across sections (legacy useFoliateSync effect 3, throttled). */
  syncSection = (): void => {
    if (!this.alive || !this.document.useFoliate || !this.document.bookWords) return;
    this.followSpokenSection(this.state.publishedHighlightedWordIndex, "section-sync");
  };

  /** A miss goes to the spoken word's own section, one navigation at a time; it never pages blindly (BUG-191 runaway). */
  private followSpokenSection(word: number, caller: string): void {
    const s = this.state;
    const target = this.surface.getSectionForWordIndex(word);
    if (target == null) { this.traceSectionNav(caller, word); this.surface.next(); return; } // no section map: legacy forward step
    const shown = this.surface.getDisplayedSectionIndex();
    if (target === shown || s.sectionNavInFlight != null) return;
    s.sectionNavInFlight = target;
    s.currentSection = target;
    this.ports.diagnostics.trace({ kind: "transition", transition: "section", from: shown ?? -1, to: target, context: `word ${word}` });
    this.traceSectionNav(caller, word, target, shown ?? -1);
    // foliate drops a goTo while a page turn holds its lock and resolves anyway: clearing in-flight lets the next cursor retry.
    this.surface.goToSection(target).catch(() => {}).finally(() => { if (this.state.sectionNavInFlight === target) this.state.sectionNavInFlight = null; });
  }

  /** One display frame: the engine publishes the unit at the current playback sample. */
  tick = (): void => {
    if (!this.alive || !this.state.playing) return;
    this.engine?.tick();
  };

  /** Timer-driven upkeep (prefetch, end of audio) that keeps narration going while the window gets no frames. */
  pump = (): void => {
    if (!this.alive || !this.state.playing) return;
    this.engine?.pump();
  };

  readBookBytes = (): Promise<ArrayBuffer> => this.ports.document.readBookBytes();

  /** P5 diagnostic (BUG-191): a caller is about to change the displayed section. The port's trace is a no-op without the eval-trace sink. */
  traceSectionNav = (caller: string, word: number | null, targetSection?: number | null, displayed?: number): void => {
    if (!this.alive) return;
    const shown = displayed ?? this.surface.getDisplayedSectionIndex() ?? this.state.currentSection;
    this.ports.diagnostics.trace({
      kind: "narrate-section-nav", t: performance.now(), caller, word,
      sectionIndex: shown >= 0 ? shown : null,
      targetSection: targetSection ?? (word == null ? null : this.surface.getSectionForWordIndex(word)),
    });
  };

  /** P5 diagnostic: the view's section-load and layout records go to the same port. */
  traceViewEvent = (event: TtsEvalTraceInputEvent): void => {
    if (this.alive) this.ports.diagnostics.trace(event);
  };

  recordDiagnostic = (kind: string, detail: string): void => {
    if (this.alive) this.ports.diagnostics.record(kind, detail);
  };

  getCanonicalSectionWords = (sectionIndex: number): string[] | undefined => {
    const bookWords = this.document.bookWords;
    const section = bookWords?.sections.find((entry) => entry.sectionIndex === sectionIndex);
    return bookWords && section ? bookWords.words.slice(section.startWordIdx, section.endWordIdx) : undefined;
  };

  // ── Engine ────────────────────────────────────────────────────────────────
  private engineFor(words: readonly string[]): NarrateEngine {
    if (this.engine && this.engineWords === words) return this.engine;
    if (this.engine && this.engineWords.length === words.length && this.engineWords.every((w, i) => w === words[i])) return this.engine;
    this.engine?.stop();
    this.engineWords = words;
    this.output ??= this.deps.createOutput(NARRATE_SAMPLE_RATE);
    this.engine = new NarrateEngine({
      words,
      breaks: this.chunkBreaks(words),
      chunkRamp: NARRATE_CHUNK_RAMP,
      prefetchSeconds: NARRATE_PREFETCH_AHEAD_S,
      chunkMaxWords: NARRATE_STEADY_CHUNK_MAX_WORDS,
      producer: this.deps.producer,
      output: this.output,
      voice: this.voice,
      speed: this.rate,
      events: {
        onCursor: (word) => this.onEngineCursor(word),
        onState: (state) => this.onEngineState(state),
        onFailure: (failure) => this.onEngineFailure(failure),
        onComplete: () => this.onEngineComplete(),
        onDiagnostic: (kind, detail) => { if (this.alive) this.ports.diagnostics.record(kind, detail); },
        // D3 recorded output: the engine's records go to the diagnostics port (the eval-trace sink when enabled).
        onTrace: (event) => { if (this.alive) this.ports.diagnostics.trace(event); },
      },
    });
    return this.engine;
  }

  /**
   * Where a chunk may never cross (D5 crossings): the book's section ends when the engine speaks the book words
   * (the tokenized content's paragraph breaks index tokenWords, not bookWords), else the paragraph breaks.
   */
  private chunkBreaks(words: readonly string[]): ReadonlySet<number> {
    const bookWords = this.document.bookWords;
    // By content: start() hands the engine a copy of the words, never the snapshot's own array.
    if (bookWords && words.length === bookWords.words.length && words.every((w, i) => w === bookWords.words[i])) {
      const ends = new Set<number>();
      for (const section of bookWords.sections) if (section.endWordIdx > 0) ends.add(section.endWordIdx - 1);
      return ends;
    }
    return numberArrayToSet(this.document.paragraphBreaks);
  }

  private onEngineCursor(word: number): void {
    if (!this.alive) return;
    const s = this.state;
    if (shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: s.resumeAnchor, advancedWordIndex: word })) {
      s.resumeAnchor = null;
      this.ports.diagnostics.transition("resumeAnchor:consumed", () => ({ resumeAnchor: null, approxWordIdx: word, source: "narrate:cursor:advance-past" }));
    }
    s.explicitSelectionAnchor = null;
    s.loading = false;
    s.highlightedWordIndex = word;
    this.anchor.commitPersistentWordIndex(word, "mode-advance", { persist: false, publishState: false, navigate: false, syncVisual: false });
    this.publishHighlight(word);
    s.currentWordIndex = word;
    if (this.document.useFoliate && this.surface.isReady()) {
      if (!this.surface.highlight(word, "narrate", { allowMotion: false })) {
        s.pendingResume = word;
        this.followSpokenSection(word, "cursor-miss");
      }
    }
    this.ports.diagnostics.trace({ kind: "word", source: "audio", wordIndex: word });
    s.notify();
  }

  private onEngineState(state: EngineState): void {
    if (!this.alive) return;
    const s = this.state;
    if (state === "playing") { s.playing = true; }
    else if (state === "paused") { s.playing = false; s.loading = false; }
    else if (state === "stopped") { s.playing = false; s.loading = false; }
    s.notify();
  }

  private onEngineFailure(failure: EngineFailure): void {
    if (!this.alive) return;
    this.state.failure = failure;
    this.state.loading = false;
    this.ports.diagnostics.record("narrate:F4", `${failure.reason} at word ${failure.atWord}${failure.detail ? ": " + failure.detail : ""}`);
    if (failure.reason === "producer-error") logNarrateStartError(`F4 producer-error at word ${failure.atWord}`, failure.stack ?? failure.detail);
    this.state.notify();
  }

  private onEngineComplete(): void {
    if (!this.alive) return;
    this.state.playing = false;
    this.state.loading = false;
    this.state.notify();
    this.ports.shell.requestCompletionToPage();
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private consumeModeStartAnchor(): number {
    const s = this.state;
    const startAnchor = resolveModeStartWordIndex(s.explicitSelectionAnchor, s.resumeAnchor, s.canonicalWordIndex, s.highlightedWordIndex, s.softWordIndex);
    s.explicitSelectionAnchor = null;
    s.resumeAnchor = startAnchor;
    this.ports.diagnostics.transition("resumeAnchor:set", () => ({ resumeAnchor: startAnchor, source: "narrate:mode-change" }));
    return startAnchor;
  }

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
    if (typeof globalWordIndex === "number" && globalWordIndex >= 0) return this.clampToEffectiveWordRange(globalWordIndex);
    if (typeof sectionIndex === "number" && sectionIndex >= 0 && typeof wordOffsetInSection === "number" && wordOffsetInSection >= 0) {
      const section = this.document.bookWords?.sections.find((entry) => entry.sectionIndex === sectionIndex);
      return this.clampToEffectiveWordRange(section ? section.startWordIdx + wordOffsetInSection : wordOffsetInSection);
    }
    return null;
  }

  private commitShared(wordIndex: number, cause: "hard-selection" | "explicit-navigation", cfi: string | null | undefined): number {
    const clamped = this.anchor.commitPersistentWordIndex(wordIndex, cause, { cfi, persist: true, publishState: true, navigate: true });
    this.state.currentWordIndex = clamped;
    return clamped;
  }

  private publishHighlight(wordIndex: number): void {
    this.state.highlightedWordIndex = wordIndex;
    this.state.publishedHighlightedWordIndex = wordIndex;
  }

  private markEngaged(): void {
    this.state.engaged = true;
    this.ports.persistence.markEngaged();
  }

  private jumpDisplayToWord(_wordIndex: number): void { /* mode-local no-op display */ }

  private setTimer(run: () => void, delayMs: number): void {
    const timer = setTimeout(() => { this.timers.delete(timer); if (this.alive) run(); }, delayMs);
    this.timers.add(timer);
  }

  private requestFrame(run: () => void): void {
    const raf = requestAnimationFrame(() => { this.rafs.delete(raf); if (this.alive) run(); });
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
export function createNarrateRuntime(input: ReaderModeCreateInput, deps?: NarrateRuntimeDeps): ReaderModeRuntime {
  return new NarrateModeRuntime(input, deps);
}

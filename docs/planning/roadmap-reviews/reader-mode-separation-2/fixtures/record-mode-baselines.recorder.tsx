// @vitest-environment jsdom
/**
 * READER-MODE-SEPARATION-2 Wave A — G4 behavior-baseline fixture recorder.
 *
 * Drives the CURRENT production mode path (real useReaderModeOrchestrator → useReaderMode →
 * real useReadingModeInstance → real FocusMode/FlowMode/PageMode engines, plus the real
 * usePersistentReadingAnchor) under jsdom with fake timers, and records an
 * implementation-neutral command → observation/effects trace per mode.
 *
 *   Record:  RMS2_RECORD=1 npx vitest run --config docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/vitest.config.mjs
 *   Verify:  npx vitest run --config docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/vitest.config.mjs
 *
 * Only true collaborators are replaced (audio port, Foliate surface, settings, persistence IPC,
 * Focus display hook, page nav, narrate view). Where the orchestrator's inputs are produced by
 * ReaderContainer glue, that glue is copied verbatim-in-behavior below with line citations
 * (ReaderContainer cannot mount headlessly). See LIMITATIONS.
 */
import React, { act, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReaderModeOrchestrator } from "../../../../../src/reader/useReaderModeOrchestrator";
import { useReadingModeInstance } from "../../../../../src/hooks/useReadingModeInstance";
import { usePersistentReadingAnchor } from "../../../../../src/hooks/usePersistentReadingAnchor";
import {
  shouldClearBrowseAwayOnAnchorEvent,
  shouldConsumeResumeAnchorOnAdvance,
} from "../../../../../src/utils/persistentReadingAnchor";
import { DEFAULT_SETTINGS } from "../../../../../src/constants";
import type { BlurbySettings, ReaderMode } from "../../../../../src/types";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../../../../..");
const RECORD = process.env.RMS2_RECORD === "1";
const MODES = ["page", "focus", "flow", "narrate"] as const;
type Mode = (typeof MODES)[number];

// ── Fixed inputs ─────────────────────────────────────────────────────────────
const WPM = 300;
const WORDS = (
  "The quick brown fox, having crossed the river, rested. Then it ran again; the hounds " +
  "followed close behind. Finally, night fell over 3 quiet hills."
).split(" ");
const PARAGRAPH_BREAKS = [8, 17];
const DOC_ID = "fixture-doc";

// ── Fixture header content ───────────────────────────────────────────────────
const CHANNEL_MAPPING = [
  { from: "narration.startCursorDriven(words, startWordIndex, wpm, onWordAdvance)", channel: "audio.start", args: "(words, wordIndex, rate=wpm); callback omitted" },
  { from: "narration.pause(reason)", channel: "audio.pause", args: "(reason)" },
  { from: "narration.resume(...args)", channel: "audio.resume", args: "as called (production passes none)" },
  { from: "narration.stop(reason)", channel: "audio.stop", args: "(reason)" },
  { from: "narration.setOnTruthSync(cb|null)", channel: "audio.setOnTruthSync", args: "('<fn>' | null)" },
  { from: "narration.setPageEndWord(idx|null)", channel: "audio.setPageEndWord", args: "(idx|null)" },
  { from: "narration.resyncToCursor(idx, wpm) [ReaderContainer retargetActiveModeToWord]", channel: "audio.resync", args: "(wordIndex, rate)" },
  { from: "foliateApi.highlightWordByIndex(idx, kind, opts)", channel: "surface.highlight", args: "(wordIndex, kind, opts)" },
  { from: "foliateApi.next()", channel: "surface.next", args: "()" },
  { from: "foliateApi.goToSection(sectionIdx)", channel: "surface.goToSection", args: "(sectionIdx)" },
  { from: "foliateApi.clearSoftHighlight()", channel: "surface.clearSoftHighlight", args: "()" },
  { from: "foliateApi.clearUserBrowsing()", channel: "surface.clearUserBrowsing", args: "()" },
  { from: "extractFoliateWords() [ReaderContainer:651]", channel: "content.extractWords", args: "()" },
  { from: "commitPersistentWordIndex(idx, cause, options) [real usePersistentReadingAnchor, recorded at call]", channel: "persistence.commitWordIndex", args: "(wordIndex, cause, options)" },
  { from: "syncVisualToPersistentWord(options) [real hook, recorded at call]", channel: "persistence.syncVisual", args: "(options)" },
  { from: "window.electronAPI.updateDocProgress(docId, idx, cfi)", channel: "persistence.updateDocProgress", args: "(docId, wordIndex, cfi)" },
  { from: "onUpdateProgress(docId, idx)", channel: "persistence.updateProgress", args: "(docId, wordIndex)" },
  { from: "updateSettings(patch)", channel: "settings.update", args: "(patch)" },
  { from: "setWpm(value|updater)", channel: "settings.setWpm", args: "(resolved value)" },
  { from: "reader.jumpToWord(idx) [useReader, also passed to persistence hook + mode instance]", channel: "focusView.jumpToWord", args: "(wordIndex)" },
  { from: "reader.togglePlay()", channel: "focusView.togglePlay", args: "()" },
  { from: "onNarrateTruthSync(idx) [ReaderContainer applyNarrationActiveWord]", channel: "narrateView.applyActiveWord", args: "(wordIndex)" },
  { from: "pageNavRef.current.returnToHighlight()", channel: "pageNav.returnToHighlight", args: "()" },
  { from: "flowScrollEngineRef.current.* (useFlowScrollSync / FlowScrollEngine)", channel: "scroll.*", args: "NOT MOUNTED — see limitations; zero scroll effects in this baseline" },
];

const QUERIES_NOT_RECORDED = [
  "foliateApi.getWords / findFirstVisibleWordIndex (fake → 0) / getSectionForWordIndex (fake → 0) / getParagraphBreaks (fake → {8,17})",
  "pageNavRef.current.getCurrentPageStart (fake → 0)",
  "getEffectiveWords()",
  "reads of narration.cursorWordIndex / speaking / status",
];

const FAKE_SEMANTICS = {
  audio: "start→ returns the script's next startResult (last repeats); sets cursorWordIndex=wordIndex and status speaking|warming|error. pause→status paused. resume→status speaking. stop→status idle and drops the word callback. resync→cursorWordIndex=wordIndex. Commands audioWordAdvance(i)/audioTruthSync(i) set cursorWordIndex=i and invoke the callback last registered via start/setOnTruthSync (if any).",
  surface: "Foliate API fake. highlightWordByIndex returns true iff wordIndex < loaded word count. Words are loaded at open unless the script declares delayed extraction; command surfaceLoadsWords loads them.",
  settings: "Initial {...DEFAULT_SETTINGS, readingMode:'page', lastReadingMode:'flow', isNarrating:false}; settings.update merges the patch into rendered settings.",
  document: `activeDoc {id:'${DOC_ID}', position:startWord, wordCount:${WORDS.length}, cfi:null}; ${WORDS.length} words; paragraph breaks ${JSON.stringify(PARAGRAPH_BREAKS)}; wpm=effectiveWpm=${WPM}; useFoliate=true; bookWordsTotalWords=${WORDS.length}.`,
};

const LIMITATIONS = [
  "ReaderContainer cannot mount headlessly (FoliatePageView, Electron IPC, TTS). Its glue that feeds the orchestrator is reproduced in the harness with citations: onWordAdvance/onComplete (ReaderContainer.tsx:705-755), queuePostModeAnchorSync + double-RAF post-mode anchor effect (766-770, 883-901), retargetActiveModeToWord (865-881), foliate onWordClick resolved-index path used for hardSelect (1356-1399), extractFoliateWords (651-664), state/ref declarations (178-200).",
  "Only the Foliate (useFoliate=true) surface is recorded. ReaderContainer renders non-EPUB documents only as an error fallback (ReaderContainer.tsx:1605, 'all docs should be EPUB since EPUB-2B'), so useFoliate=false branches (FlowCursorController delegation) are not reachable in production rendering. Non-EPUB fixtures are covered by the live G0/G6 matrix, not here.",
  "useFlowScrollSync / FlowScrollEngine / FlowCursorController are not mounted (they need real layout); scroll.* has zero recorded effects and flowScrollEngineRef is null in retargetActiveModeToWord.",
  "useNarration (Kokoro, audioScheduler) is replaced by the declared fake audio port; heard-audio timing, cursor lag (NARRATION_CURSOR_LAG_MS) and the known cursor-lead / 1.4x overlap defects are NOT represented. Audio progress is driven only by explicit audioWordAdvance/audioTruthSync commands.",
  "useReader (Focus display), ReaderView onWordUpdate DOM fast-path and the TTS background cacher (backgroundCacherRef.updateCursorPosition) are not modeled; reader.playing is always false.",
  "useDocumentLifecycle is not mounted: no saved-mode restore on open (document always opens in page mode), no session stats, no lifecycle RAF cleanup. useFoliateSync browse-away detection is not mounted; isBrowsedAway only changes through the router/glue.",
  "evalTrace is disabled (null); markPageActivity / userExplicitSelectionRef / activeDoc.cfi mutation on click are omitted (no collaborator effects in this path).",
  "Foliate section misses (highlightWordByIndex=false → surface.next/goToSection pause-on-miss) are not exercised except through delayed extraction.",
  "Cross-owner effects are present in this baseline (e.g. Focus/Flow/Page commands call audio.stop/setOnTruthSync/setPageEndWord via stopAllModes and createInstance). They are tagged crossOwner:true; the roadmap requires they become zero after separation (G6), which conflicts with a pure byte-for-byte G4 comparison unless crossOwner-tagged effects are excluded and asserted absent.",
];

const COMPARISON = "Fixture file text (line endings normalized to LF) must equal the freshly recorded serialization byte-for-byte. provenanceFields are copied from the committed fixture before comparison. strippedFields is empty: the current path emits no wall-clock values or session identifiers (fake timers start at 0; Date is faked).";

// ── Scripts ──────────────────────────────────────────────────────────────────
type Command =
  | { command: "openDocument"; args: { wordCount: number; startWord: number; surfaceLoaded: boolean } }
  | { command: "selectMode"; args: { mode: Mode } }
  | { command: "togglePlay"; args: Record<string, never> }
  | { command: "hardSelect"; args: { wordIndex: number } }
  | { command: "advanceTime"; args: { ms: number } }
  | { command: "audioWordAdvance"; args: { wordIndex: number } }
  | { command: "audioTruthSync"; args: { wordIndex: number } }
  | { command: "surfaceLoadsWords"; args: Record<string, never> }
  | { command: "teardown"; args: Record<string, never> };

interface ScriptDef {
  name: string;
  startWord: number;
  audioStartResults: Array<"started" | "warming" | "error">;
  commands: Command[];
}

const open = (startWord: number, surfaceLoaded = true): Command =>
  ({ command: "openDocument", args: { wordCount: WORDS.length, startWord, surfaceLoaded } });
const select = (mode: Mode): Command => ({ command: "selectMode", args: { mode } });
const toggle = (): Command => ({ command: "togglePlay", args: {} });
const pick = (wordIndex: number): Command => ({ command: "hardSelect", args: { wordIndex } });
const wait = (ms: number): Command => ({ command: "advanceTime", args: { ms } });
const heard = (wordIndex: number): Command => ({ command: "audioWordAdvance", args: { wordIndex } });
const truth = (wordIndex: number): Command => ({ command: "audioTruthSync", args: { wordIndex } });
const teardown = (): Command => ({ command: "teardown", args: {} });

function scriptsFor(mode: Mode): ScriptDef[] {
  const base = (startWord: number): ScriptDef[] => {
    const s = startWord;
    const ok: ScriptDef["audioStartResults"] = ["started"];
    switch (mode) {
      case "page":
        return [{ name: `page-core-start-${s}`, startWord: s, audioStartResults: ok, commands: [
          open(s), toggle(), pick(s + 3), toggle(), wait(1000), select("page"), teardown(), wait(1000),
        ] }];
      case "focus":
        return [{ name: `focus-core-start-${s}`, startWord: s, audioStartResults: ok, commands: [
          open(s), select("focus"), toggle(), wait(50), wait(4000), toggle(), wait(3000), toggle(), wait(3000),
          pick(s + 10), wait(1000), select("focus"), select("page"), teardown(), wait(5000),
        ] }];
      case "flow":
        return [{ name: `flow-core-start-${s}`, startWord: s, audioStartResults: ok, commands: [
          open(s), select("flow"), toggle(), wait(4000), toggle(), wait(3000), toggle(), wait(3000),
          pick(s + 10), wait(1000), select("flow"), select("page"), teardown(), wait(5000),
        ] }];
      case "narrate":
        return [{ name: `narrate-core-start-${s}`, startWord: s, audioStartResults: ok, commands: [
          open(s), select("narrate"), toggle(), heard(s + 1), wait(16), truth(s + 2), wait(16),
          pick(s + 10), toggle(), wait(1000), toggle(), truth(s + 11), wait(16),
          select("narrate"), select("page"), teardown(), wait(1000),
        ] }];
    }
  };
  const scripts = [...base(7), ...base(0)];
  if (mode === "focus") {
    scripts.push({ name: "focus-runs-to-completion-start-7", startWord: 7, audioStartResults: ["started"], commands: [
      open(7), select("focus"), toggle(), wait(20000), teardown(),
    ] });
  }
  if (mode === "narrate") {
    for (const s of [0, 2]) {
      scripts.push({ name: `narrate-delayed-extraction-start-${s}`, startWord: s, audioStartResults: ["started"], commands: [
        open(s, false), select("narrate"), toggle(), { command: "surfaceLoadsWords", args: {} }, wait(500), wait(16), teardown(),
      ] });
    }
    scripts.push({ name: "narrate-pause-resume-reuses-session-start-7", startWord: 7, audioStartResults: ["started"], commands: [
      open(7), select("narrate"), toggle(), toggle(), toggle(), toggle(), toggle(), teardown(),
    ] });
    for (const result of ["warming", "error"] as const) {
      scripts.push({ name: `narrate-start-failure-${result}-start-7`, startWord: 7, audioStartResults: [result], commands: [
        open(7), select("narrate"), toggle(), wait(1000), toggle(), select("page"), teardown(),
      ] });
    }
  }
  return scripts;
}

// ── JSON-safe copying ────────────────────────────────────────────────────────
function toJson(value: unknown): unknown {
  if (value === undefined) return "<undefined>";
  if (typeof value === "function") return "<fn>";
  if (value instanceof Set) return { $set: [...value].map(toJson) };
  if (Array.isArray(value)) return value.map(toJson);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = toJson(v); // object keys holding undefined are dropped (JSON semantics)
    }
    return out;
  }
  return value;
}

interface Effect { channel: string; args: unknown[]; crossOwner?: true }

// ── Fakes (collaborators) ────────────────────────────────────────────────────
function createEnv(def: ScriptDef, surfaceLoaded: boolean) {
  const effects: Effect[] = [];
  const rec = (channel: string) => (...args: unknown[]) => { effects.push({ channel, args: args.map(toJson) }); };

  const startResults = [...def.audioStartResults];
  let wordCb: ((i: number) => void) | null = null;
  let truthCb: ((i: number) => void) | null = null;
  const audio: any = {
    cursorWordIndex: 0, status: "idle", speaking: false, warming: false,
    startCursorDriven(words: string[], idx: number, wpm: number, cb: (i: number) => void) {
      effects.push({ channel: "audio.start", args: [toJson(words), idx, wpm] });
      const result = startResults.length > 1 ? startResults.shift()! : startResults[0];
      wordCb = cb;
      audio.cursorWordIndex = idx;
      audio.status = result === "started" ? "speaking" : result;
      audio.speaking = result === "started";
      audio.warming = result === "warming";
      return result;
    },
    pause(...a: unknown[]) { rec("audio.pause")(...a); audio.status = "paused"; audio.speaking = false; },
    resume(...a: unknown[]) { rec("audio.resume")(...a); audio.status = "speaking"; audio.speaking = true; audio.warming = false; },
    stop(...a: unknown[]) { rec("audio.stop")(...a); audio.status = "idle"; audio.speaking = false; audio.warming = false; wordCb = null; },
    setOnTruthSync(cb: ((i: number) => void) | null) { rec("audio.setOnTruthSync")(cb ? "<fn>" : null); truthCb = cb; },
    setPageEndWord: rec("audio.setPageEndWord"),
    resyncToCursor(idx: number, wpm: number) { rec("audio.resync")(idx, wpm); audio.cursorWordIndex = idx; },
  };
  const emitWord = (i: number) => { audio.cursorWordIndex = i; wordCb?.(i); };
  const emitTruth = (i: number) => { audio.cursorWordIndex = i; truthCb?.(i); };

  const surfaceState = { loaded: surfaceLoaded ? WORDS : ([] as string[]) };
  const foliateApi: any = {
    getWords: () => surfaceState.loaded.map((word) => ({ word })),
    next: rec("surface.next"),
    goToSection: rec("surface.goToSection"),
    clearSoftHighlight: rec("surface.clearSoftHighlight"),
    clearUserBrowsing: rec("surface.clearUserBrowsing"),
    highlightWordByIndex: (idx: number, kind: string, opts?: unknown) => {
      rec("surface.highlight")(idx, kind, opts);
      return idx < surfaceState.loaded.length;
    },
    findFirstVisibleWordIndex: () => 0,
    getSectionForWordIndex: () => 0,
    getParagraphBreaks: () => new Set(PARAGRAPH_BREAKS),
  };

  const collaborators = {
    reader: { playing: false, wordIndex: 0, wordsRef: { current: WORDS }, togglePlay: rec("focusView.togglePlay"), jumpToWord: rec("focusView.jumpToWord") },
    foliateApiRef: { current: foliateApi },
    pageNavRef: { current: { returnToHighlight: rec("pageNav.returnToHighlight"), getCurrentPageStart: () => 0 } },
    applyNarrationActiveWord: rec("narrateView.applyActiveWord"),
    onUpdateProgress: rec("persistence.updateProgress"),
    updateDocProgress: rec("persistence.updateDocProgress"),
    rec,
  };
  return { effects, audio, emitWord, emitTruth, surfaceState, collaborators, ctl: null as null | Controls };
}

type Env = ReturnType<typeof createEnv>;

interface Controls {
  togglePlay: () => void;
  selectMode: (mode: Mode) => void;
  hardSelect: (wordIndex: number) => void;
  observe: () => Record<string, unknown>;
}

// ── Harness: ReaderContainer-equivalent wiring around the real hooks ─────────
function Harness({ env, startWord }: { env: Env; startWord: number }) {
  const { collaborators: c, audio } = env;
  const activeDoc = useMemo(() => ({ id: DOC_ID, position: startWord, wordCount: WORDS.length, cfi: null }), [startWord]);

  // ReaderContainer.tsx:178-200
  const [readingMode, setReadingMode] = useState<ReaderMode>("page");
  const readingModeRef = useRef(readingMode);
  readingModeRef.current = readingMode;
  const [isNarrating, setIsNarrating] = useState(false);
  const isNarratingRef = useRef(isNarrating);
  isNarratingRef.current = isNarrating;
  const pendingNarrationResumeRef = useRef(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(activeDoc.position || 0);
  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;
  const softWordIndexRef = useRef(0);
  const explicitSelectionAnchorRef = useRef<number | null>(null);
  const [focusPlaying, setFocusPlaying] = useState(false);
  const [flowPlaying, setFlowPlaying] = useState(false);
  const [isBrowsedAway, setIsBrowsedAway] = useState(false);
  const resumeAnchorRef = useRef<number | null>(null); // useDocumentLifecycle.ts:132
  const hasEngagedRef = useRef(false);
  const narrationStateFlushRafRef = useRef<number | null>(null);
  const narrationStatePendingIdxRef = useRef<number | null>(null);
  const flowScrollEngineRef = useRef<{ jumpToWord: (i: number) => void } | null>(null);

  const [settings, setSettings] = useState<BlurbySettings>(() => ({
    ...(DEFAULT_SETTINGS as unknown as BlurbySettings), readingMode: "page", lastReadingMode: "flow", isNarrating: false,
  }));
  const updateSettings = useCallback((patch: Partial<BlurbySettings>) => {
    c.rec("settings.update")(patch);
    setSettings((s) => ({ ...s, ...patch }));
  }, [c]);
  const [wpm, setWpmState] = useState(WPM);
  const wpmRef = useRef(wpm);
  wpmRef.current = wpm;
  const setWpm = useCallback((v: React.SetStateAction<number>) => {
    const next = typeof v === "function" ? (v as (p: number) => number)(wpmRef.current) : v;
    c.rec("settings.setWpm")(next);
    setWpmState(next);
  }, [c]) as React.Dispatch<React.SetStateAction<number>>;
  const effectiveWpm = wpm;

  // Real persistence hook; IPC + library callbacks are recording spies.
  const persistence = usePersistentReadingAnchor({
    activeDoc, totalWordCount: WORDS.length, highlightedWordIndexRef, softWordIndexRef,
    explicitSelectionAnchorRef, resumeAnchorRef, setHighlightedWordIndex,
    jumpToWord: c.reader.jumpToWord, onUpdateProgress: c.onUpdateProgress,
  });
  const realCommit = persistence.commitPersistentWordIndex;
  const commitPersistentWordIndex = useCallback<typeof realCommit>((i, cause, options) => {
    c.rec("persistence.commitWordIndex")(i, cause, options);
    return realCommit(i, cause, options);
  }, [c, realCommit]);
  const realSync = persistence.syncVisualToPersistentWord;
  const syncVisualToPersistentWord = useCallback((options?: { navigate?: boolean }) => {
    c.rec("persistence.syncVisual")(options);
    return realSync(options);
  }, [c, realSync]);

  // ReaderContainer.tsx:307-321 (foliate branch, bookWords incomplete) and 651-664
  const getEffectiveWords = useCallback(() => c.foliateApiRef.current.getWords().map((w: { word: string }) => w.word), [c]);
  const extractFoliateWords = useCallback(() => { c.rec("content.extractWords")(); }, [c]);

  const compatibilityReadingMode: "page" | "focus" | "flow" = readingMode === "narrate" ? "flow" : readingMode;

  // ReaderContainer.tsx:697-759
  const modeInstanceHook = useReadingModeInstance({
    readingMode: compatibilityReadingMode,
    wpm: effectiveWpm,
    settings,
    narration: audio,
    isFoliate: true,
    jumpToWord: c.reader.jumpToWord,
    foliateApiRef: c.foliateApiRef as any,
    onWordAdvance: (idx: number) => {
      if (shouldConsumeResumeAnchorOnAdvance({ resumeAnchor: resumeAnchorRef.current, advancedWordIndex: idx })) {
        resumeAnchorRef.current = null;
      }
      explicitSelectionAnchorRef.current = null;
      highlightedWordIndexRef.current = idx;
      commitPersistentWordIndex(idx, "mode-advance", { persist: false, publishState: false, navigate: false, syncVisual: false });
      if (isNarratingRef.current) {
        narrationStatePendingIdxRef.current = idx;
        if (narrationStateFlushRafRef.current == null) {
          narrationStateFlushRafRef.current = requestAnimationFrame(() => {
            narrationStateFlushRafRef.current = null;
            if (narrationStatePendingIdxRef.current != null) setHighlightedWordIndex(narrationStatePendingIdxRef.current);
          });
        }
      } else {
        setHighlightedWordIndex(idx);
      }
    },
    onComplete: () => {
      setFocusPlaying(false);
      setReadingMode("page");
    },
    setFlowPlaying,
    bookWordsCompleteRef: { current: false },
  });

  // ReaderContainer.tsx:762-770
  const pendingModeSurfaceAnchorRef = useRef<{ wordIndex: number; mode: "focus" | "flow" | "narrate" } | null>(null);
  const [pendingModeSurfaceAnchorVersion, setPendingModeSurfaceAnchorVersion] = useState(0);
  const queuePostModeAnchorSync = useCallback((wordIndex: number, mode: "focus" | "flow" | "narrate") => {
    pendingModeSurfaceAnchorRef.current = { wordIndex, mode };
    setPendingModeSurfaceAnchorVersion((v) => v + 1);
  }, []);

  const modeHook = useReaderModeOrchestrator({
    reader: c.reader,
    narration: audio,
    modeInstance: modeInstanceHook,
    foliateApiRef: c.foliateApiRef as any,
    foliateWordsRef: { current: [] },
    useFoliate: true,
    settings,
    updateSettings,
    wpm,
    setWpm,
    effectiveWpm,
    getEffectiveWords,
    extractFoliateWords,
    paragraphBreaks: new Set<number>(),
    highlightedWordIndex,
    setHighlightedWordIndex,
    hasEngagedRef,
    focusPlaying,
    setFocusPlaying,
    flowPlaying,
    setFlowPlaying,
    isBrowsedAway,
    setIsBrowsedAway,
    pageNavRef: c.pageNavRef,
    readingMode,
    setReadingMode,
    isNarrating,
    setIsNarrating,
    pendingNarrationResumeRef,
    bookWordsTotalWords: WORDS.length,
    resumeAnchorRef,
    explicitSelectionAnchorRef,
    softWordIndexRef,
    persistentWordIndexRef: persistence.persistentWordIndexRef,
    commitPersistentWordIndex,
    syncVisualToPersistentWord,
    queuePostModeAnchorSync,
    onNarrateTruthSync: c.applyNarrationActiveWord,
    evalTrace: null,
  });

  // ReaderContainer.tsx:865-881
  const retargetActiveModeToWord = (wordIndex: number) => {
    const mode = readingModeRef.current;
    if (mode === "focus" && focusPlaying) { modeInstanceHook.jumpToWordInMode(wordIndex); return; }
    if (mode === "flow" && flowPlaying) {
      modeInstanceHook.jumpToWordInMode(wordIndex);
      flowScrollEngineRef.current?.jumpToWord(wordIndex);
      return;
    }
    if (mode === "narrate" && isNarratingRef.current) {
      modeInstanceHook.jumpToWordInMode(wordIndex);
      flowScrollEngineRef.current?.jumpToWord(wordIndex);
      audio.resyncToCursor(wordIndex, effectiveWpm);
    }
  };

  // ReaderContainer.tsx:883-901 (foliateRenderVersion dependency omitted; constant here)
  useEffect(() => {
    const pending = pendingModeSurfaceAnchorRef.current;
    if (!pending || pending.mode !== readingMode) return;
    let firstRaf = 0;
    let secondRaf = 0;
    firstRaf = requestAnimationFrame(() => {
      secondRaf = requestAnimationFrame(() => {
        const latest = pendingModeSurfaceAnchorRef.current;
        if (!latest || latest.mode !== readingMode) return;
        syncVisualToPersistentWord({ navigate: true });
        c.foliateApiRef.current?.clearUserBrowsing?.();
        setIsBrowsedAway(false);
        pendingModeSurfaceAnchorRef.current = null;
      });
    });
    return () => { cancelAnimationFrame(firstRaf); cancelAnimationFrame(secondRaf); };
  }, [c, pendingModeSurfaceAnchorVersion, readingMode, syncVisualToPersistentWord]);

  // ReaderContainer.tsx:1356-1399 — foliate onWordClick, resolved global index path.
  // resolveClickedGlobalWordIndex(globalWordIndex) = clampToEffectiveWordRange (512-516).
  const hardSelect = (wordIndex: number) => {
    hasEngagedRef.current = true;
    c.foliateApiRef.current?.clearSoftHighlight?.();
    const effective = getEffectiveWords();
    const maxIdx = Math.max((effective.length || WORDS.length || 1) - 1, 0);
    const resolved = Math.max(0, Math.min(wordIndex, maxIdx));
    resumeAnchorRef.current = null;
    resumeAnchorRef.current = resolved;
    explicitSelectionAnchorRef.current = resolved;
    // commitSharedWordAnchor(resolved, "hard-selection", cfi, { skipNarrationResync: true }) — 542-560
    const anchored = commitPersistentWordIndex(resolved, "hard-selection", {
      cfi: null, persist: true, publishState: true, navigate: true,
    });
    retargetActiveModeToWord(anchored);
    if (shouldClearBrowseAwayOnAnchorEvent({ type: "hard-selection", wordIndex: anchored })) {
      c.foliateApiRef.current?.clearUserBrowsing?.();
      setIsBrowsedAway(false);
    }
  };

  env.ctl = {
    togglePlay: modeHook.handleTogglePlay,
    selectMode: (mode) => (mode === "page" ? modeHook.handlePauseToPage() : modeHook.handleSelectMode(mode)),
    hardSelect,
    observe: () => ({
      readingMode,
      focusPlaying,
      flowPlaying,
      isNarrating,
      isBrowsedAway,
      highlightedWordIndex,
      publishedWordIndex: persistence.persistentWordIndex,
      canonicalWordIndex: persistence.persistentWordIndexRef.current,
      persistedSettings: {
        readingMode: settings.readingMode,
        lastReadingMode: settings.lastReadingMode,
        isNarrating: settings.isNarrating,
      },
      audio: { status: audio.status, cursorWordIndex: audio.cursorWordIndex },
    }),
  };
  return null;
}

// ── Runner ───────────────────────────────────────────────────────────────────
const flushPromises = () => Promise.resolve().then(() => Promise.resolve());

async function runScript(def: ScriptDef) {
  const openCmd = def.commands[0];
  if (openCmd.command !== "openDocument") throw new Error(`${def.name}: first command must be openDocument`);
  const env = createEnv(def, openCmd.args.surfaceLoaded);
  (window as any).electronAPI = { updateDocProgress: env.collaborators.updateDocProgress };
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ now: 0, toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "Date"] });
  const container = document.createElement("div");
  document.body.appendChild(container);
  let root: Root | null = null;
  let mounted = false;
  const steps: unknown[] = [];
  try {
    for (const [step, cmd] of def.commands.entries()) {
      const modeBefore = mounted ? (env.ctl!.observe().readingMode as string) : null;
      env.effects.length = 0;
      await act(async () => {
        switch (cmd.command) {
          case "openDocument":
            root = createRoot(container);
            root.render(React.createElement(Harness, { env, startWord: cmd.args.startWord }));
            mounted = true;
            break;
          case "selectMode": env.ctl!.selectMode(cmd.args.mode); break;
          case "togglePlay": env.ctl!.togglePlay(); break;
          case "hardSelect": env.ctl!.hardSelect(cmd.args.wordIndex); break;
          case "advanceTime": vi.advanceTimersByTime(cmd.args.ms); break;
          case "audioWordAdvance": env.emitWord(cmd.args.wordIndex); break;
          case "audioTruthSync": env.emitTruth(cmd.args.wordIndex); break;
          case "surfaceLoadsWords": env.surfaceState.loaded = WORDS; break;
          case "teardown": root!.unmount(); mounted = false; break;
        }
        await flushPromises();
      });
      const observation = mounted ? env.ctl!.observe() : { mounted: false };
      const modeAfter = mounted ? (observation as { readingMode: string }).readingMode : modeBefore;
      const narrateInvolved = modeBefore === "narrate" || modeAfter === "narrate";
      const effects = env.effects.map((e) =>
        e.channel.startsWith("audio.") && !narrateInvolved ? { ...e, crossOwner: true as const } : { ...e });
      steps.push({ step, command: cmd.command, args: cmd.args, observation, effects });
    }
  } finally {
    if (mounted && root) act(() => root!.unmount());
    container.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
    delete (window as any).electronAPI;
  }
  return { name: def.name, startWord: def.startWord, audioStartResults: def.audioStartResults, commands: steps };
}

function git(args: string): string {
  try { return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf-8" }).trim(); } catch { return "unavailable"; }
}

async function buildFixture(mode: Mode, provenance: { sourceCommit: string; sourceSrcTree: string }) {
  const scripts = [];
  for (const def of scriptsFor(mode)) scripts.push(await runScript(def));
  const doc = {
    schemaVersion: 1,
    mode,
    sourceCommit: provenance.sourceCommit,
    sourceSrcTree: provenance.sourceSrcTree,
    recordedFrom: "production path: useReaderModeOrchestrator + useReadingModeInstance",
    recorder: "docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/record-mode-baselines.test.tsx",
    comparison: COMPARISON,
    provenanceFields: ["sourceCommit", "sourceSrcTree"],
    strippedFields: [] as string[],
    channelMapping: CHANNEL_MAPPING,
    queriesNotRecorded: QUERIES_NOT_RECORDED,
    fakeSemantics: FAKE_SEMANTICS,
    observationFields: {
      readingMode: "router mode state", focusPlaying: "Focus playing flag", flowPlaying: "Flow playing flag",
      isNarrating: "Narrate active-session flag", isBrowsedAway: "browse-away flag", highlightedWordIndex: "rendered highlight/selection",
      publishedWordIndex: "published persistent anchor (state)", canonicalWordIndex: "canonical anchor (persistence ref)",
      persistedSettings: "settings readingMode/lastReadingMode/isNarrating after all settings.update patches",
      audio: "fake audio port status/cursor (narrate truth source)",
    },
    limitations: LIMITATIONS,
    scripts,
  };
  return JSON.stringify(doc, null, 2) + "\n";
}

const fixturePath = (mode: Mode) => join(HERE, `${mode}.baseline.json`);
const readFixture = (mode: Mode) => readFileSync(fixturePath(mode), "utf-8").replace(/\r\n/g, "\n");

/** Returns null when identical, else a description of the first differing line. */
export function compareFixture(expected: string, actual: string): string | null {
  if (expected === actual) return null;
  const a = expected.split("\n");
  const b = actual.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return `line ${i + 1}: expected ${JSON.stringify(a[i])} got ${JSON.stringify(b[i])}`;
  }
  return "differs (length)";
}

afterEach(() => { vi.useRealTimers(); });

describe("RMS2 G4 mode behavior baselines", () => {
  for (const mode of MODES) {
    it(`${RECORD ? "records" : "reproduces"} the ${mode} baseline byte-for-byte`, async () => {
      if (RECORD) {
        const provenance = { sourceCommit: git("rev-parse HEAD"), sourceSrcTree: git("rev-parse HEAD:src") };
        const first = await buildFixture(mode, provenance);
        const second = await buildFixture(mode, provenance);
        expect(compareFixture(first, second)).toBeNull(); // in-process determinism
        writeFileSync(fixturePath(mode), first, "utf-8");
        return;
      }
      expect(existsSync(fixturePath(mode)), `missing ${fixturePath(mode)}; run with RMS2_RECORD=1`).toBe(true);
      const committed = readFixture(mode);
      const { sourceCommit, sourceSrcTree } = JSON.parse(committed);
      const fresh = await buildFixture(mode, { sourceCommit, sourceSrcTree });
      expect(compareFixture(committed, fresh)).toBeNull();
    });
  }

  it("negative control: an altered fixture fails the comparison", async () => {
    const mode: Mode = "focus";
    const base = existsSync(fixturePath(mode)) && !RECORD
      ? readFixture(mode)
      : await buildFixture(mode, { sourceCommit: "x", sourceSrcTree: "x" });
    const parsed = JSON.parse(base);
    const fresh = RECORD ? base : await buildFixture(mode, { sourceCommit: parsed.sourceCommit, sourceSrcTree: parsed.sourceSrcTree });
    expect(compareFixture(base, fresh)).toBeNull();

    const shiftedPosition = JSON.parse(base);
    shiftedPosition.scripts[0].commands[4].observation.highlightedWordIndex += 1;
    expect(compareFixture(JSON.stringify(shiftedPosition, null, 2) + "\n", fresh)).not.toBeNull();

    const droppedEffect = JSON.parse(base);
    const withEffects = droppedEffect.scripts[0].commands.find((c: { effects: unknown[] }) => c.effects.length > 0);
    withEffects.effects.pop();
    expect(compareFixture(JSON.stringify(droppedEffect, null, 2) + "\n", fresh)).not.toBeNull();
  });
});

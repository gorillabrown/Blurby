// Narrate React binding (READER-MODE-SEPARATION-2 design §B.0, §B.4): subscribes React to the runtime
// and connects the DOM- and lifecycle-dependent pieces the legacy shared hooks ran for narrate — the
// browse-away poll (useFoliateSync effect 1), the section-end fallback (useFoliateSync effect 4), the
// HOTFIX-6 full-book extraction (useNarrationCaching effect 6) and the useNarrationSync bridge, which
// becomes audio.configure()/adjustRate() through the runtime's port. The narration word reaches the
// view through a readState poll on render. The runtime owns every port call (LL-014).
import { useEffect, useSyncExternalStore } from "react";
import {
  FOLIATE_BROWSING_CHECK_INTERVAL_MS,
  TTS_DIALOGUE_SENTENCE_THRESHOLD,
  TTS_PAUSE_CLAUSE_MS,
  TTS_PAUSE_COMMA_MS,
  TTS_PAUSE_PARAGRAPH_MS,
  TTS_PAUSE_SENTENCE_MS,
  normalizeSelectableTtsEngine,
} from "../../../constants";
import type { NarrateFoliateViewProps } from "./FoliateView";
import type { NarrateModeRuntime } from "./ModeRuntime";

export function useNarrateModeBindings(runtime: NarrateModeRuntime): {
  readonly useFoliate: boolean;
  readonly viewProps: NarrateFoliateViewProps;
} {
  // getSnapshot() returns a fresh frozen object per call, so React tracks the runtime's version number.
  useSyncExternalStore(runtime.subscribe, runtime.getVersion);
  const snapshot = runtime.getSnapshot();
  const { document, settings } = runtime;
  const s = settings.settings;
  const bookWordSections = runtime.getBookWordSections();
  const hasBookWords = bookWordSections != null;

  // useFoliateSync effect 1: Narrate is browse-aware only while narrating (the tick clears it otherwise).
  useEffect(() => {
    if (!document.useFoliate || !snapshot.narrating) {
      runtime.pollBrowsing();
      return;
    }
    const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [runtime, document.useFoliate, snapshot.narrating]);

  // useFoliateSync effect 4: own the section-end fallback until full-book words exist.
  useEffect(() => {
    runtime.syncSectionEnd();
    return () => runtime.releaseSectionEnd();
  }, [runtime, hasBookWords]);

  // useNarrationCaching effect 6 (HOTFIX-6): full-book words once narration is live.
  useEffect(() => {
    runtime.ensureFullBookWords();
    return () => runtime.cancelFullBookWords();
  }, [runtime, snapshot.narrating]);

  // useNarrationSync effects 1–10, one configure() call per changed field group.
  const footnoteMode = s.ttsFootnoteMode || "skip";
  useEffect(() => {
    runtime.configureAudio({ bookId: `${document.documentId}::fn:${footnoteMode}` });
  }, [runtime, document.documentId, footnoteMode]);
  useEffect(() => {
    runtime.configureAudio({
      mediaSessionBook: { title: document.title, author: document.author, coverArtUrl: null },
      mediaSessionCoverPath: document.coverPath,
    });
  }, [runtime, document.documentId, document.title, document.author, document.coverPath]);
  const overridesKey = JSON.stringify(s.pronunciationOverrides ?? []);
  useEffect(() => {
    runtime.configureAudio({ pronunciationOverrides: s.pronunciationOverrides ?? [] });
  }, [runtime, overridesKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    runtime.configureAudio({ bookPronunciationOverrides: document.pronunciationOverrides });
  }, [runtime, document.documentId, document.pronunciationOverrides]);
  useEffect(() => {
    runtime.configureAudio({ engine: normalizeSelectableTtsEngine(s.ttsEngine) });
  }, [runtime, s.ttsEngine]);
  useEffect(() => {
    if (s.ttsVoiceName) runtime.configureAudio({ voiceName: s.ttsVoiceName });
  }, [runtime, s.ttsEngine, s.ttsVoiceName]);
  useEffect(() => {
    runtime.syncAudioRate();
  }, [runtime, s.ttsRate]);
  useEffect(() => {
    runtime.configureAudio({
      pauseConfig: {
        commaMs: s.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS,
        clauseMs: s.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS,
        sentenceMs: s.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS,
        paragraphMs: s.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS,
        dialogueThreshold: s.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD,
      },
    });
  }, [runtime, s.ttsPauseCommaMs, s.ttsPauseClauseMs, s.ttsPauseSentenceMs, s.ttsPauseParagraphMs, s.ttsDialogueSentenceThreshold]);
  useEffect(() => {
    runtime.configureAudio({ footnoteMode });
  }, [runtime, footnoteMode]);
  useEffect(() => {
    runtime.configureAudio({ footnoteCues: runtime.getFootnoteCues() });
  }, [runtime, document.documentId, hasBookWords]);

  return {
    useFoliate: document.useFoliate,
    viewProps: {
      document,
      settings: s,
      focusTextSize: settings.focusTextSize,
      initialCfi: runtime.initialCfi,
      readBookBytes: runtime.readBookBytes,
      recordDiagnostic: runtime.recordDiagnostic,
      onRelocate: runtime.onRelocate,
      onTocReady: runtime.onTocReady,
      onWordClick: runtime.onWordClick,
      onLoad: runtime.onSurfaceLoad,
      onWordsReextracted: runtime.onWordsReextracted,
      viewApiRef: runtime.viewApiRef,
      showJumpBackToAnchor: snapshot.isBrowsedAway,
      onJumpBackToAnchor: () => runtime.jumpBack(),
      onUserBrowseAway: runtime.onUserBrowseAway,
      highlightedWordIndex: snapshot.highlightedWordIndex,
      narrationWordIndex: runtime.readNarrationWordIndex(),
      bookWordSections,
      renderVersion: runtime.getRenderVersion(),
      getCanonicalSectionWords: runtime.getCanonicalSectionWords,
      chunkReadingVisualState: runtime.getChunkVisualState(),
    },
  };
}

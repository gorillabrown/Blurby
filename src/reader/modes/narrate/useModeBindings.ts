// Narrate React binding (NARRATE-REBUILD-1 P4; READER-MODE-SEPARATION-2 design §B.0, §B.4): subscribes React
// to the runtime and runs the DOM-side effects — the browse-away poll (useFoliateSync effect 1), the section
// follow (effect 3) and the display-frame tick that lets the engine publish the unit at the current playback
// sample. The runtime owns every port call and the engine; React only drives the frames (LL-014).
import { useEffect, useSyncExternalStore } from "react";
import { FOLIATE_BROWSING_CHECK_INTERVAL_MS, NARRATE_PUMP_INTERVAL_MS } from "../../../constants";
import type { NarrateFoliateViewProps } from "./FoliateView";
import type { NarrateModeRuntime } from "./ModeRuntime";

export function useNarrateModeBindings(runtime: NarrateModeRuntime): {
  readonly useFoliate: boolean;
  readonly playing: boolean;
  readonly notice: ReturnType<NarrateModeRuntime["getNotice"]>;
  readonly viewProps: NarrateFoliateViewProps;
} {
  // getSnapshot() returns a fresh frozen object per call, so React tracks the runtime's version number.
  useSyncExternalStore(runtime.subscribe, runtime.getVersion);
  const snapshot = runtime.getSnapshot();
  const { document, settings } = runtime;

  // useFoliateSync effect 1: poll the view's browse-away flag.
  useEffect(() => {
    if (!document.useFoliate) return;
    const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [runtime, document.useFoliate]);

  // useFoliateSync effect 3: when the spoken word crosses a section boundary, go there.
  useEffect(() => {
    runtime.syncSection();
  }, [runtime, snapshot.highlightedWordIndex]);

  // One tick per display frame while playing: the cursor is the table lookup at the playback sample (D3).
  useEffect(() => {
    if (!snapshot.playing) return;
    let raf = 0;
    const frame = () => { runtime.tick(); raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    // A hidden, minimized or covered window gets no frames: the prefetch and the end of audio run on a timer too.
    const pump = setInterval(runtime.pump, NARRATE_PUMP_INTERVAL_MS);
    return () => { cancelAnimationFrame(raf); clearInterval(pump); };
  }, [runtime, snapshot.playing]);

  return {
    useFoliate: document.useFoliate,
    playing: snapshot.playing,
    notice: runtime.getNotice(),
    viewProps: {
      document,
      settings: settings.settings,
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
      narrationWordIndex: runtime.getNarrationWordIndex(),
      bookWordSections: document.bookWords?.sections,
      renderVersion: runtime.getRenderVersion(),
      getCanonicalSectionWords: runtime.getCanonicalSectionWords,
      chunkReadingVisualState: null,
    },
  };
}

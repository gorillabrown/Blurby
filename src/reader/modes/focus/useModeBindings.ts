// Focus React binding (READER-MODE-SEPARATION-2 design §B.0, §B.2): subscribes React to the runtime
// and owns the DOM-side effects the legacy shared hooks ran for focus — the browse-away poll
// (useFoliateSync effect 1) and the section follow (useFoliateSync effect 3). Every view callback
// forwards to a runtime method; the runtime owns all state and every port call.
import { useEffect, useSyncExternalStore } from "react";
import { FOLIATE_BROWSING_CHECK_INTERVAL_MS } from "../../../constants";
import type { FocusFoliateViewProps } from "./FoliateView";
import type { FocusModeRuntime } from "./ModeRuntime";

export function useFocusModeBindings(runtime: FocusModeRuntime): {
  readonly useFoliate: boolean;
  readonly playing: boolean;
  readonly viewProps: FocusFoliateViewProps;
} {
  // getSnapshot() returns a fresh frozen object per call, so React tracks the runtime's version number.
  useSyncExternalStore(runtime.subscribe, runtime.getVersion);
  const snapshot = runtime.getSnapshot();
  const { document, settings } = runtime;

  // useFoliateSync effect 1: poll the view's browse-away flag (Focus is a browse-aware surface).
  useEffect(() => {
    if (!document.useFoliate) return;
    const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [runtime, document.useFoliate]);

  // useFoliateSync effect 3: when the published highlight crosses a section boundary, go there.
  useEffect(() => {
    runtime.syncSection();
  }, [runtime, snapshot.highlightedWordIndex]);

  return {
    useFoliate: document.useFoliate,
    playing: snapshot.playing,
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
      bookWordSections: document.bookWords?.sections,
      renderVersion: runtime.getRenderVersion(),
      getCanonicalSectionWords: runtime.getCanonicalSectionWords,
    },
  };
}

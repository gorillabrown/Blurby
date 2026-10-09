// Page React binding (READER-MODE-SEPARATION-2 design §B.0, §B.1): subscribes React to the runtime and
// owns the DOM-side browse-away poll (legacy useFoliateSync effect 1). Every view callback forwards to a
// runtime method; the runtime owns all state and every port call.
import { useEffect, useSyncExternalStore } from "react";
import { FOLIATE_BROWSING_CHECK_INTERVAL_MS } from "../../../constants";
import type { PageFoliateViewProps } from "./FoliateView";
import type { PageModeRuntime } from "./ModeRuntime";

export function usePageModeBindings(runtime: PageModeRuntime): { readonly useFoliate: boolean; readonly viewProps: PageFoliateViewProps } {
  // getSnapshot() returns a fresh frozen object per call, so React tracks the runtime's version number.
  useSyncExternalStore(runtime.subscribe, runtime.getVersion);
  const snapshot = runtime.getSnapshot();
  const { document, settings } = runtime;

  // useFoliateSync effect 1: poll the view's browse-away flag (Page is a browse-aware surface).
  useEffect(() => {
    if (!document.useFoliate) return;
    const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [runtime, document.useFoliate]);

  return {
    useFoliate: document.useFoliate,
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

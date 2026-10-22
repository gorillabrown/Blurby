// Page React binding (READER-MODE-SEPARATION-2 design §B.0, §B.1): subscribes React to the runtime. Every view
// callback forwards to a runtime method; the runtime owns all state and every port call. Page has no browse-away
// poll (PAGE-POSITION-SAVE-2): browse-away is runtime state, set only through onUserBrowseAway.
import { useSyncExternalStore } from "react";
import type { PageFoliateViewProps } from "./FoliateView";
import type { PageModeRuntime } from "./ModeRuntime";

export function usePageModeBindings(runtime: PageModeRuntime): { readonly useFoliate: boolean; readonly viewProps: PageFoliateViewProps } {
  // getSnapshot() returns a fresh frozen object per call, so React tracks the runtime's version number.
  useSyncExternalStore(runtime.subscribe, runtime.getVersion);
  const snapshot = runtime.getSnapshot();
  const { document, settings } = runtime;

  return {
    useFoliate: document.useFoliate,
    viewProps: {
      document,
      settings: settings.settings,
      focusTextSize: settings.focusTextSize,
      initialCfi: runtime.initialCfi,
      readBookBytes: runtime.readBookBytes,
      ensureBookWords: runtime.ensureBookWords,
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
      onPageTurned: runtime.onPageTurned,
      onHeldClickSave: runtime.onHeldClickSave,
      highlightedWordIndex: snapshot.highlightedWordIndex,
      bookWordSections: document.bookWords?.sections,
      renderVersion: runtime.getRenderVersion(),
      getCanonicalSectionWords: runtime.getCanonicalSectionWords,
    },
  };
}

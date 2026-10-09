// Flow React binding (READER-MODE-SEPARATION-2 design §B.0, §B.3): subscribes React to the runtime and
// connects the DOM-dependent pieces the legacy shared hooks ran for flow — the browse-away poll
// (useFoliateSync effect 1), the section follow (useFoliateSync effect 3) and the line pacer's
// lifecycle against this mode's view (useFlowScrollSync effects 1, 3b, 5, 5b). The runtime owns the
// FlowScrollEngine instance, its state and every port call; React only starts and stops it (LL-014).
// Effect 3 (WPM) is runtime.applySettings; effect 2 (cross-book auto-resume) runs while Page is active,
// so it is the router's resumeFlowAfterBookOpen; effect 6 (Flow+narration follower) is not copied (LL-125).
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { FLOW_ZONE_LINES_DEFAULT, FOLIATE_BROWSING_CHECK_INTERVAL_MS } from "../../../constants";
import type { FlowFoliateViewProps } from "./FoliateView";
import type { FlowModeRuntime } from "./ModeRuntime";

/** useFlowScrollSync startWhenReady: the surface refs can attach a tick after play flips. */
const FLOW_SURFACE_RETRY_ATTEMPTS = 8;
const FLOW_SURFACE_RETRY_MS = 80;
/** useFlowScrollSync effect 5: settle time before a font-size rebuild. */
const FLOW_REBUILD_DELAY_MS = 200;

export function useFlowModeBindings(runtime: FlowModeRuntime): {
  readonly useFoliate: boolean;
  readonly viewProps: FlowFoliateViewProps;
} {
  // getSnapshot() returns a fresh frozen object per call, so React tracks the runtime's version number.
  useSyncExternalStore(runtime.subscribe, runtime.getVersion);
  const snapshot = runtime.getSnapshot();
  const { document, settings } = runtime;
  const renderVersion = runtime.getRenderVersion();
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const flowCursorRef = useRef<HTMLDivElement | null>(null);
  const flowZoneLines = settings.settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT;

  // FLOW-ZONE-AUTO: the engine reports the descending zone's top fraction per line advance. Write it
  // straight to the masked element's CSS vars (line-advance rate is too fast for React state).
  const onZoneTopChange = useCallback((topFrac: number) => {
    const host = runtime.viewApiRef.current?.getFlowZoneHost() ?? null;
    if (!host) return;
    const ch = host.clientHeight;
    if (ch <= 0) return;
    const lineHeight = parseFloat(getComputedStyle(host).lineHeight) || 24;
    const zoneHeightFrac = (lineHeight * flowZoneLines) / ch;
    const botFrac = Math.min(topFrac + zoneHeightFrac, 0.95);
    host.style.setProperty("--flow-zone-top", `${topFrac * 100}%`);
    host.style.setProperty("--flow-zone-bottom", `${botFrac * 100}%`);
  }, [runtime, flowZoneLines]);
  const onZoneTopChangeRef = useRef(onZoneTopChange);
  onZoneTopChangeRef.current = onZoneTopChange;

  // useFoliateSync effect 1: poll the view's browse-away flag (Flow is a browse-aware surface).
  useEffect(() => {
    if (!document.useFoliate) return;
    const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [runtime, document.useFoliate]);

  // useFoliateSync effect 3: when the published highlight crosses a section boundary, go there.
  useEffect(() => {
    runtime.syncSection();
  }, [runtime, snapshot.highlightedWordIndex]);

  // useFlowScrollSync effect 1: start the line pacer while Flow plays; stop it otherwise.
  useEffect(() => {
    if (!snapshot.playing) {
      runtime.stopScrollEngine();
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const startWhenReady = async (attempt = 0) => {
      await runtime.waitForSurfaceReady();
      if (cancelled) return;
      const container = scrollContainerRef.current ?? runtime.viewApiRef.current?.getScrollContainer() ?? null;
      const cursor = flowCursorRef.current;
      if (!container || !cursor) {
        if (attempt < FLOW_SURFACE_RETRY_ATTEMPTS) {
          retryTimer = setTimeout(() => { void startWhenReady(attempt + 1); }, FLOW_SURFACE_RETRY_MS);
        }
        return;
      }
      runtime.startScrollEngine(container, cursor, (topFrac) => onZoneTopChangeRef.current(topFrac));
    };
    void startWhenReady();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      runtime.stopScrollEngine();
    };
  }, [runtime, snapshot.playing]);

  // useFlowScrollSync effect 3b: natural chunks follow the rendered words.
  useEffect(() => {
    runtime.syncScrollEngineChunks();
  }, [runtime, renderVersion, snapshot.playing]);

  // useFlowScrollSync effect 5: rebuild the line map after a font-size change.
  useEffect(() => {
    if (!runtime.isScrollEngineRunning()) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void runtime.waitForSurfaceReady().then(() => { if (!cancelled) runtime.rebuildScrollEngine(); });
    }, FLOW_REBUILD_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [runtime, settings.focusTextSize]);

  // useFlowScrollSync effect 5b: rebuild after this view stamps a new rendered-word surface.
  const lastHandledRenderVersionRef = useRef(renderVersion);
  useEffect(() => {
    if (!document.useFoliate || !snapshot.playing) {
      lastHandledRenderVersionRef.current = renderVersion;
      return;
    }
    if (renderVersion === lastHandledRenderVersionRef.current) return;
    let cancelled = false;
    void runtime.waitForSurfaceReady().then(() => {
      if (cancelled || !runtime.isScrollEngineRunning()) return;
      runtime.rebuildScrollEngine();
      lastHandledRenderVersionRef.current = renderVersion;
    });
    return () => { cancelled = true; };
  }, [runtime, renderVersion, snapshot.playing, document.useFoliate]);

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
      renderVersion,
      getCanonicalSectionWords: runtime.getCanonicalSectionWords,
      chunkReadingVisualState: runtime.getChunkVisualState(),
      scrollContainerRef,
      flowCursorRef,
    },
  };
}

import { useState, useCallback } from "react";
import {
  DEFAULT_EINK_REFRESH_INTERVAL,
  EINK_ADAPTIVE_REFRESH_ENABLED,
  EINK_GHOSTING_THRESHOLD,
  EINK_REFRESH_FLASH_MS,
} from "../constants";
import { BlurbySettings } from "../types";
import { nextEinkGhostingLoad } from "../utils/einkErgonomics";

interface UseEinkControllerReturn {
  einkPageTurns: number;
  einkGhostingLoad: number;
  showEinkRefresh: boolean;
  triggerEinkRefresh: () => void;
  handleEinkPageTurn: () => void;
  handleEinkContentChange: (changeEstimate?: number) => void;
}

/**
 * Manages e-ink ghosting prevention.
 * Tracks page turns and triggers a full-screen refresh overlay
 * at configurable intervals to clear e-ink display artifacts.
 */
export function useEinkController(settings: BlurbySettings): UseEinkControllerReturn {
  const isEink = settings.einkMode === true;
  const [einkPageTurns, setEinkPageTurns] = useState(0);
  const [einkGhostingLoad, setEinkGhostingLoad] = useState(0);
  const [showEinkRefresh, setShowEinkRefresh] = useState(false);

  const triggerEinkRefresh = useCallback(() => {
    if (!isEink) return;
    setShowEinkRefresh(true);
    setTimeout(() => setShowEinkRefresh(false), EINK_REFRESH_FLASH_MS);
  }, [isEink]);

  const handleEinkPageTurn = useCallback(() => {
    if (!isEink) return;
    setEinkPageTurns((prev) => {
      const next = prev + 1;
      if (next >= (settings.einkRefreshInterval || DEFAULT_EINK_REFRESH_INTERVAL)) {
        triggerEinkRefresh();
        return 0;
      }
      return next;
    });
  }, [isEink, settings.einkRefreshInterval, triggerEinkRefresh]);

  const handleEinkContentChange = useCallback((changeEstimate = 0.25) => {
    if (!isEink) return;
    setEinkGhostingLoad((prev) => {
      const result = nextEinkGhostingLoad(
        prev,
        changeEstimate,
        EINK_GHOSTING_THRESHOLD,
        EINK_ADAPTIVE_REFRESH_ENABLED
      );
      if (result.shouldRefresh) triggerEinkRefresh();
      return result.nextLoad;
    });
  }, [isEink, triggerEinkRefresh]);

  return {
    einkPageTurns,
    einkGhostingLoad,
    showEinkRefresh,
    triggerEinkRefresh,
    handleEinkPageTurn,
    handleEinkContentChange,
  };
}

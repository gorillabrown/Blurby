import { createContext, useContext, useCallback, useMemo } from "react";
import type { BlurbySettings } from "../types";

const api = window.electronAPI;

interface SettingsContextType {
  settings: BlurbySettings;
  updateSettings: (updates: Partial<BlurbySettings>) => Promise<void>;
}

const defaultSettings: BlurbySettings = {
  schemaVersion: 0,
  wpm: 300,
  sourceFolder: null,
  folderName: "My reading list",
  recentFolders: [],
  theme: "dark",
  launchAtLogin: false,
  focusTextSize: 100,
  accentColor: null,
  fontFamily: null,
  compactMode: false,
  readingMode: "focus",
  focusMarks: true,
  readingRuler: false,
  focusSpan: 0.4,
  flowTextSize: 100,
  rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
  layoutSpacing: { line: 1.5, character: 0, word: 0 },
  initialPauseMs: 3000,
  punctuationPauseMs: 1000,
  viewMode: "list" as const,
  einkWpmCeiling: 250,
  einkRefreshInterval: 20,
  einkPhraseGrouping: true,
  syncIntervalMinutes: 5,
  syncOnMeteredConnection: false,
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

/**
 * Hook to create a stable SettingsContext value.
 * Call this in the component that owns settings state, then pass the result to SettingsContext.Provider.
 */
export function useSettingsProvider(
  settings: BlurbySettings,
  setSettings: React.Dispatch<React.SetStateAction<BlurbySettings>>
) {
  const updateSettings = useCallback(async (updates: Partial<BlurbySettings>) => {
    await api.saveSettings(updates);
    setSettings((prev) => ({ ...prev, ...updates }));
  }, [setSettings]);

  const value = useMemo(() => ({
    settings,
    updateSettings,
  }), [settings, updateSettings]);

  return value;
}

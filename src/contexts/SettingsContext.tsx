import { createContext, useContext, useCallback, useMemo } from "react";
import type { BlurbySettings } from "../types";
import { DEFAULT_SETTINGS } from "../constants";

const api = window.electronAPI;

interface SettingsContextType {
  settings: BlurbySettings;
  updateSettings: (updates: Partial<BlurbySettings>) => Promise<void>;
}

const defaultSettings = DEFAULT_SETTINGS as BlurbySettings;

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

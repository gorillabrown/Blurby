import type { BlurbySettings } from "../types";
import { ThemeSettings } from "./settings/ThemeSettings";
import { ConnectorsSettings } from "./settings/ConnectorsSettings";
import { HelpSettings } from "./settings/HelpSettings";
import { HotkeyMapSettings } from "./settings/HotkeyMapSettings";
import { SpeedReadingSettings } from "./settings/SpeedReadingSettings";
import { LayoutSettings } from "./settings/LayoutSettings";
import { LibraryLayoutSettings } from "./settings/LibraryLayoutSettings";
import { CloudSyncSettings } from "./settings/CloudSyncSettings";
import { TTSSettings } from "./settings/TTSSettings";

interface SettingsMenuProps {
  settings: BlurbySettings;
  onNavigate: (view: string) => void;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
  activeSubPage?: string;
  isMac?: boolean;
  onOpenMetadataWizard?: () => void;
}

const CATEGORIES = [
  { id: "layout", label: "Reading Layout", icon: "📐" },
  { id: "speed-reading", label: "Speed Reading", icon: "⚡" },
  { id: "tts", label: "Narration (TTS)", icon: "🔊" },
  { id: "theme", label: "Theme", icon: "🎨" },
  { id: "library-layout", label: "Library Layout", icon: "📚" },
  { id: "connectors", label: "Connectors", icon: "🔌" },
  { id: "cloud-sync", label: "Cloud Sync", icon: "☁️" },
];

const SECONDARY_CATEGORIES = [
  { id: "hotkeys", label: "Hotkey Map", icon: "⌨️" },
];

export function SettingsMenu({
  settings,
  onNavigate,
  onSettingsChange,
  siteLogins,
  onSiteLogin,
  onSiteLogout,
  activeSubPage,
  isMac = false,
  onOpenMetadataWizard,
}: SettingsMenuProps) {
  if (activeSubPage) {
    return (
      <div className="settings-subpage">
        {activeSubPage === "theme" && (
          <ThemeSettings settings={settings} onSettingsChange={onSettingsChange} />
        )}
        {activeSubPage === "connectors" && (
          <ConnectorsSettings
            siteLogins={siteLogins}
            onSiteLogin={onSiteLogin}
            onSiteLogout={onSiteLogout}
          />
        )}
        {activeSubPage === "hotkeys" && <HotkeyMapSettings />}
        {activeSubPage === "speed-reading" && (
          <SpeedReadingSettings settings={settings} onSettingsChange={onSettingsChange} />
        )}
        {activeSubPage === "tts" && (
          <TTSSettings settings={settings} onSettingsChange={onSettingsChange} />
        )}
        {activeSubPage === "layout" && (
          <LayoutSettings settings={settings} onSettingsChange={onSettingsChange} />
        )}
        {activeSubPage === "library-layout" && (
          <LibraryLayoutSettings settings={settings} onSettingsChange={onSettingsChange} onOpenMetadataWizard={onOpenMetadataWizard} />
        )}
        {activeSubPage === "cloud-sync" && (
          <CloudSyncSettings settings={settings} onSettingsChange={onSettingsChange} />
        )}
      </div>
    );
  }

  return (
    <div className="settings-menu">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          className="settings-menu-item"
          onClick={() => onNavigate(cat.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate(cat.id)}
        >
          <span>
            <span className="settings-menu-item-icon" aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </span>
          <span className="settings-menu-item-chevron" aria-hidden="true">▸</span>
        </div>
      ))}

      <div className="settings-menu-divider" aria-hidden="true" />

      {SECONDARY_CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          className="settings-menu-item"
          onClick={() => onNavigate(cat.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate(cat.id)}
        >
          <span>
            <span className="settings-menu-item-icon" aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </span>
          <span className="settings-menu-item-chevron" aria-hidden="true">▸</span>
        </div>
      ))}

      <div className="settings-menu-divider" aria-hidden="true" />

      <HelpSettings isMac={isMac} />
    </div>
  );
}

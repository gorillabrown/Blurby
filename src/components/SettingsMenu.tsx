import type { BlurbySettings } from "../types";
import { ThemeSettings } from "./settings/ThemeSettings";
import { ConnectorsSettings } from "./settings/ConnectorsSettings";
import { HelpSettings } from "./settings/HelpSettings";
import { HotkeyMapSettings } from "./settings/HotkeyMapSettings";
import { TextSizeSettings } from "./settings/TextSizeSettings";
import { SpeedReadingSettings } from "./settings/SpeedReadingSettings";
import { LayoutSettings } from "./settings/LayoutSettings";

interface SettingsMenuProps {
  settings: BlurbySettings;
  onNavigate: (view: string) => void;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
  activeSubPage?: string;
  isMac?: boolean;
}

const CATEGORIES = [
  { id: "text-size", label: "Text Size", icon: "🔤" },
  { id: "speed-reading", label: "Speed Reading", icon: "⚡" },
  { id: "theme", label: "Theme", icon: "🎨" },
  { id: "layout", label: "Layout", icon: "📐" },
  { id: "connectors", label: "Connectors", icon: "🔌" },
];

const SECONDARY_CATEGORIES = [
  { id: "help", label: "Help", icon: "❓" },
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
        {activeSubPage === "help" && <HelpSettings isMac={isMac} />}
        {activeSubPage === "hotkeys" && <HotkeyMapSettings />}
        {activeSubPage === "text-size" && (
          <TextSizeSettings settings={settings} onSettingsChange={onSettingsChange} />
        )}
        {activeSubPage === "speed-reading" && (
          <SpeedReadingSettings settings={settings} onSettingsChange={onSettingsChange} />
        )}
        {activeSubPage === "layout" && <LayoutSettings />}
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
            <span className="settings-menu-item-icon">{cat.icon}</span>
            {cat.label}
          </span>
          <span className="settings-menu-item-chevron">▸</span>
        </div>
      ))}

      <div className="settings-menu-divider" />

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
            <span className="settings-menu-item-icon">{cat.icon}</span>
            {cat.label}
          </span>
          <span className="settings-menu-item-chevron">▸</span>
        </div>
      ))}
    </div>
  );
}

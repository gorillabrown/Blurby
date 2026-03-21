import { useState, useCallback, useEffect } from "react";
import type { BlurbyDoc, BlurbySettings } from "../types";
import ReadingQueue from "./ReadingQueue";
import { SettingsMenu } from "./SettingsMenu";

type FlapView = "queue" | "settings" | string;

const TITLES: Record<string, string> = {
  queue: "Reading Queue",
  settings: "Settings",
  "text-size": "Text Size",
  "speed-reading": "Speed Reading",
  theme: "Theme",
  layout: "Layout",
  connectors: "Connectors",
  help: "Help",
  hotkeys: "Hotkey Map",
};

interface MenuFlapProps {
  open: boolean;
  onClose: () => void;
  docs: BlurbyDoc[];
  settings: BlurbySettings;
  onOpenDoc: (docId: string) => void;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
  isMac?: boolean;
}

export default function MenuFlap({
  open,
  onClose,
  docs,
  settings,
  onOpenDoc,
  onSettingsChange,
  siteLogins,
  onSiteLogin,
  onSiteLogout,
  isMac = false,
}: MenuFlapProps) {
  const [view, setView] = useState<FlapView>("queue");

  // Reset to queue whenever the flap is opened
  useEffect(() => {
    if (open) {
      setView("queue");
    }
  }, [open]);

  const handleBack = useCallback(() => {
    if (view === "settings") {
      setView("queue");
    } else if (view !== "queue") {
      // sub-page: go back to settings list
      setView("settings");
    }
  }, [view]);

  const handleGoToSettings = useCallback(() => {
    setView("settings");
  }, []);

  const handleSubPage = useCallback((subPageId: string) => {
    setView(subPageId);
  }, []);

  const handleCompactToggle = useCallback(() => {
    onSettingsChange({ compactMode: !settings.compactMode });
  }, [onSettingsChange, settings.compactMode]);

  const handleDocClick = useCallback(
    (docId: string) => {
      onOpenDoc(docId);
      onClose();
    },
    [onOpenDoc, onClose]
  );

  const isOnQueue = view === "queue";
  const isOnSettings = !isOnQueue;

  const title = TITLES[view] ?? view;

  return (
    <>
      <div
        className={`menu-flap-backdrop${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`menu-flap${open ? " open" : ""}`}
        role="dialog"
        aria-label="Menu"
        aria-modal="true"
      >
        <div className="menu-flap-header">
          {isOnSettings && (
            <button
              className="menu-flap-back-btn"
              onClick={handleBack}
              aria-label="Back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <span className="menu-flap-title">{title}</span>

          <div className="menu-flap-header-actions">
            {isOnQueue && (
              <button
                className="menu-flap-compact-btn"
                onClick={handleCompactToggle}
                aria-label={settings.compactMode ? "Expand view" : "Compact view"}
                title={settings.compactMode ? "Expand view" : "Compact view"}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  {settings.compactMode ? (
                    <path
                      d="M2 4h12M2 8h12M2 12h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M2 3h12M2 6h8M2 9h12M2 12h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </button>
            )}
            <button
              className="menu-flap-close-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="menu-flap-body">
          {isOnQueue ? (
            <ReadingQueue
              docs={docs}
              compact={settings.compactMode}
              onDocClick={handleDocClick}
            />
          ) : (
            <SettingsMenu
              settings={settings}
              onNavigate={handleSubPage}
              onSettingsChange={onSettingsChange}
              siteLogins={siteLogins}
              onSiteLogin={onSiteLogin}
              onSiteLogout={onSiteLogout}
              activeSubPage={view !== "settings" ? view : undefined}
              isMac={isMac}
            />
          )}
        </div>

        {isOnQueue && (
          <div className="menu-flap-footer">
            <button
              className="menu-flap-settings-btn"
              onClick={handleGoToSettings}
            >
              Settings
            </button>
          </div>
        )}
      </div>
    </>
  );
}

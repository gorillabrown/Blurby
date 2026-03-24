import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

  // Click anywhere outside flap closes it
  const flapRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    // Close flap on any mousedown outside the flap panel.
    // Uses document capture phase so it fires before any element's own handler.
    const handler = (e: MouseEvent) => {
      if (flapRef.current && flapRef.current.contains(e.target as Node)) return;
      onCloseRef.current();
    };
    // Delay registration so the opening click/mousedown doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler, true);
      document.addEventListener("pointerdown", handler, true);
    }, 150);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("pointerdown", handler, true);
    };
  }, [open]);

  // Escape closes flap (or navigates back in settings sub-pages)
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (view !== "queue") {
          // Go back within settings first
          if (view === "settings") setView("queue");
          else setView("settings");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler, true); // capture phase
    return () => window.removeEventListener("keydown", handler, true);
  }, [open, view, onClose]);

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

  // Render via portal on document.body to escape any stacking context
  return createPortal(
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            zIndex: 100000,
            cursor: "pointer",
          }}
          onClick={onClose}
          onMouseDown={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={flapRef}
        className={`menu-flap${open ? " open" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Menu"
        aria-modal="true"
        aria-expanded={open}
      >
        <div className="menu-flap-header">
          {isOnSettings && (
            <button
              className="menu-flap-back-btn"
              onClick={handleBack}
              aria-label="Back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
            {isOnQueue && (
              <button
                className="menu-flap-settings-btn"
                onClick={handleGoToSettings}
                aria-label="Go to settings"
                title="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            )}
            <button
              className="menu-flap-close-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

        {/* Settings button moved to header (21C) */}
      </div>
    </>,
    document.body
  );
}

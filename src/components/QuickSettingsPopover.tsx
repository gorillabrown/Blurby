import { useEffect, useRef, useCallback } from "react";
import { MIN_WPM, MAX_WPM, WPM_STEP, DEFAULT_WPM } from "../constants";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface QuickSettingsPopoverProps {
  context: string; // "library" | "reader-rsvp" | "reader-scroll" | "reader"
  settings: {
    wpm?: number;
    focusTextSize?: number;
    flowTextSize?: number;
    theme?: "blurby" | "dark" | "light" | "eink" | "system";
    readingMode?: "focus" | "flow";
    viewMode?: "grid" | "list";
    [key: string]: unknown;
  };
  onSettingsChange: (updates: Record<string, unknown>) => void;
  onClose: () => void;
}

const FONT_MIN = 12;
const FONT_MAX = 48;
const FONT_STEP = 1;

const THEMES: Array<{ value: "blurby" | "dark" | "light" | "eink" | "system"; label: string }> = [
  { value: "blurby", label: "Blurby" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "eink", label: "E-ink" },
];

const SORT_OPTIONS = [
  { value: "lastReadAt", label: "Last read" },
  { value: "created", label: "Date added" },
  { value: "title", label: "Title (A–Z)" },
  { value: "wordCount", label: "Length" },
];

export default function QuickSettingsPopover({
  context,
  settings,
  onSettingsChange,
  onClose,
}: QuickSettingsPopoverProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef);

  const isReaderContext =
    context === "reader" ||
    context === "reader-rsvp" ||
    context === "reader-scroll";

  const isLibraryContext = context === "library";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Use capture so it fires before other handlers
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [onClose]);

  // Auto-focus the first slider on open
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const firstSlider = el.querySelector<HTMLElement>('input[type="range"]');
    firstSlider?.focus();
  }, []);

  const wpm = typeof settings.wpm === "number" ? settings.wpm : DEFAULT_WPM;
  const focusTextSize =
    typeof settings.focusTextSize === "number" ? settings.focusTextSize : 18;
  const flowTextSize =
    typeof settings.flowTextSize === "number" ? settings.flowTextSize : 16;
  const theme = settings.theme ?? "blurby";
  const readingMode = settings.readingMode ?? "focus";
  const viewMode = settings.viewMode ?? "list";

  const fontSizeKey =
    context === "reader-scroll" ? "flowTextSize" : "focusTextSize";
  const currentFontSize =
    context === "reader-scroll" ? flowTextSize : focusTextSize;

  return (
    <div
      ref={dialogRef}
      className="quick-settings-popover"
      role="dialog"
      aria-modal="true"
      aria-label="Quick settings"
    >
      <div className="quick-settings-header">
        <span className="quick-settings-title">Quick Settings</span>
        <button
          className="quick-settings-close"
          onClick={onClose}
          aria-label="Close quick settings"
        >
          &times;
        </button>
      </div>

      {/* ── Reader controls ─────────────────────────────────────── */}
      {isReaderContext && (
        <>
          {/* WPM slider */}
          <div className="quick-settings-row">
            <label
              className="quick-settings-label"
              htmlFor="qs-wpm"
            >
              Speed
            </label>
            <div className="quick-settings-control quick-settings-control--slider">
              <input
                id="qs-wpm"
                type="range"
                min={MIN_WPM}
                max={MAX_WPM}
                step={WPM_STEP}
                value={wpm}
                onChange={(e) =>
                  onSettingsChange({ wpm: parseInt(e.target.value, 10) })
                }
                aria-label={`Reading speed: ${wpm} words per minute`}
                aria-valuemin={MIN_WPM}
                aria-valuemax={MAX_WPM}
                aria-valuenow={wpm}
                aria-valuetext={`${wpm} words per minute`}
              />
              <span className="quick-settings-value" aria-hidden="true">
                {wpm} wpm
              </span>
            </div>
          </div>

          {/* Font size slider */}
          <div className="quick-settings-row">
            <label
              className="quick-settings-label"
              htmlFor="qs-fontsize"
            >
              Text size
            </label>
            <div className="quick-settings-control quick-settings-control--slider">
              <input
                id="qs-fontsize"
                type="range"
                min={FONT_MIN}
                max={FONT_MAX}
                step={FONT_STEP}
                value={currentFontSize}
                onChange={(e) =>
                  onSettingsChange({
                    [fontSizeKey]: parseInt(e.target.value, 10),
                  })
                }
                aria-label={`Text size: ${currentFontSize}px`}
                aria-valuemin={FONT_MIN}
                aria-valuemax={FONT_MAX}
                aria-valuenow={currentFontSize}
                aria-valuetext={`${currentFontSize} pixels`}
              />
              <span className="quick-settings-value" aria-hidden="true">
                {currentFontSize}px
              </span>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="quick-settings-row">
            <span className="quick-settings-label" id="qs-theme-label">
              Theme
            </span>
            <div
              className="quick-settings-control quick-settings-control--seg"
              role="radiogroup"
              aria-labelledby="qs-theme-label"
            >
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  className={[
                    "quick-settings-seg-btn",
                    theme === t.value ? "quick-settings-seg-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="radio"
                  aria-checked={theme === t.value}
                  onClick={() => onSettingsChange({ theme: t.value })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reading mode */}
          <div className="quick-settings-row">
            <span className="quick-settings-label" id="qs-mode-label">
              Mode
            </span>
            <div
              className="quick-settings-control quick-settings-control--seg"
              role="radiogroup"
              aria-labelledby="qs-mode-label"
            >
              <button
                className={[
                  "quick-settings-seg-btn",
                  readingMode === "focus"
                    ? "quick-settings-seg-btn--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="radio"
                aria-checked={readingMode === "focus"}
                onClick={() => onSettingsChange({ readingMode: "focus" })}
              >
                Focus
              </button>
              <button
                className={[
                  "quick-settings-seg-btn",
                  readingMode === "flow"
                    ? "quick-settings-seg-btn--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="radio"
                aria-checked={readingMode === "flow"}
                onClick={() => onSettingsChange({ readingMode: "flow" })}
              >
                Flow
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Library controls ─────────────────────────────────────── */}
      {isLibraryContext && (
        <>
          {/* Sort */}
          <div className="quick-settings-row">
            <label className="quick-settings-label" htmlFor="qs-sort">
              Sort by
            </label>
            <div className="quick-settings-control">
              <select
                id="qs-sort"
                className="quick-settings-select"
                value={
                  typeof settings.sortBy === "string"
                    ? settings.sortBy
                    : "lastReadAt"
                }
                onChange={(e) =>
                  onSettingsChange({ sortBy: e.target.value })
                }
                aria-label="Sort library by"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View mode */}
          <div className="quick-settings-row">
            <span className="quick-settings-label" id="qs-view-label">
              View
            </span>
            <div
              className="quick-settings-control quick-settings-control--seg"
              role="radiogroup"
              aria-labelledby="qs-view-label"
            >
              <button
                className={[
                  "quick-settings-seg-btn",
                  viewMode === "list" ? "quick-settings-seg-btn--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="radio"
                aria-checked={viewMode === "list"}
                onClick={() => onSettingsChange({ viewMode: "list" })}
              >
                List
              </button>
              <button
                className={[
                  "quick-settings-seg-btn",
                  viewMode === "grid" ? "quick-settings-seg-btn--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="radio"
                aria-checked={viewMode === "grid"}
                onClick={() => onSettingsChange({ viewMode: "grid" })}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Theme (also available in library context) */}
          <div className="quick-settings-row">
            <span className="quick-settings-label" id="qs-lib-theme-label">
              Theme
            </span>
            <div
              className="quick-settings-control quick-settings-control--seg"
              role="radiogroup"
              aria-labelledby="qs-lib-theme-label"
            >
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  className={[
                    "quick-settings-seg-btn",
                    theme === t.value ? "quick-settings-seg-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="radio"
                  aria-checked={theme === t.value}
                  onClick={() => onSettingsChange({ theme: t.value })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

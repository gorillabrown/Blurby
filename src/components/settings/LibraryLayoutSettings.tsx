import { useState } from "react";
import type { BlurbySettings } from "../../types";
import { useToast } from "../../contexts/ToastContext";

interface LibraryLayoutSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
  onOpenMetadataWizard?: () => void;
}

const SORT_OPTIONS = [
  { value: "progress", label: "Closest to done" },
  { value: "alpha", label: "A-Z by title" },
  { value: "author", label: "A-Z by author" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

const CARD_SIZES: Array<{ value: "small" | "medium" | "large"; label: string }> = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const CARD_SPACINGS: Array<{ value: "compact" | "cozy" | "roomy"; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "cozy", label: "Cozy" },
  { value: "roomy", label: "Roomy" },
];

export function LibraryLayoutSettings({ settings, onSettingsChange, onOpenMetadataWizard }: LibraryLayoutSettingsProps) {
  const { showToast } = useToast();
  const [normalizing, setNormalizing] = useState(false);
  const currentSort = settings.defaultSort || "progress";
  const currentViewMode = settings.defaultViewMode || settings.viewMode || "list";
  const currentCardSize = settings.libraryCardSize || "medium";
  const currentSpacing = settings.libraryCardSpacing || "cozy";

  return (
    <div>
      {/* Default Sort */}
      <div className="settings-section-label">Default Sort</div>
      <select
        className="settings-select"
        value={currentSort}
        onChange={(e) => onSettingsChange({ defaultSort: e.target.value })}
        aria-label="Default sort order"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Default Layout */}
      <div className="settings-section-label" style={{ marginTop: 20 }}>Default Layout</div>
      <div className="settings-toggle-row">
        <button
          className={`settings-toggle-btn${currentViewMode === "grid" ? " settings-toggle-btn-active" : ""}`}
          onClick={() => onSettingsChange({ defaultViewMode: "grid", viewMode: "grid" })}
        >Grid View</button>
        <button
          className={`settings-toggle-btn${currentViewMode === "list" ? " settings-toggle-btn-active" : ""}`}
          onClick={() => onSettingsChange({ defaultViewMode: "list", viewMode: "list" })}
        >List View</button>
      </div>

      {/* Card Size */}
      <div className="settings-section-label" style={{ marginTop: 20 }}>Card Size</div>
      <div className="settings-toggle-row">
        {CARD_SIZES.map((size) => (
          <button
            key={size.value}
            className={`settings-toggle-btn${currentCardSize === size.value ? " settings-toggle-btn-active" : ""}`}
            onClick={() => onSettingsChange({ libraryCardSize: size.value })}
          >{size.label}</button>
        ))}
      </div>

      {/* Card Spacing */}
      <div className="settings-section-label" style={{ marginTop: 20 }}>Card Spacing</div>
      <div className="settings-toggle-row">
        {CARD_SPACINGS.map((sp) => (
          <button
            key={sp.value}
            className={`settings-toggle-btn${currentSpacing === sp.value ? " settings-toggle-btn-active" : ""}`}
            onClick={() => onSettingsChange({ libraryCardSpacing: sp.value })}
          >{sp.label}</button>
        ))}
      </div>

      {/* Author Normalization */}
      <div className="settings-section-label" style={{ marginTop: 20 }}>Library Maintenance</div>
      <button
        className="settings-toggle-btn"
        disabled={normalizing}
        onClick={async () => {
          setNormalizing(true);
          try {
            const result = await (window as any).electronAPI.normalizeAllAuthors();
            if (showToast) {
              showToast(result.updated > 0
                ? `Normalized ${result.updated} author name${result.updated === 1 ? "" : "s"}`
                : "All author names are already normalized");
            }
          } finally {
            setNormalizing(false);
          }
        }}
      >
        {normalizing ? "Normalizing..." : "Normalize Authors"}
      </button>
      {onOpenMetadataWizard && (
        <button
          className="settings-toggle-btn"
          onClick={onOpenMetadataWizard}
          style={{ marginTop: 8 }}
        >
          Metadata Wizard
        </button>
      )}
    </div>
  );
}

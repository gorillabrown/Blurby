export function LayoutSettings() {
  return (
    <div style={{ opacity: 0.5 }}>
      <div className="settings-section-label">Spacing</div>

      <div className="settings-toggle-label" style={{ fontSize: 12, marginBottom: 4 }}>Line Spacing</div>
      <input
        type="range"
        className="settings-slider"
        min={1}
        max={3}
        step={0.1}
        defaultValue={1.5}
        disabled
        aria-label="Line spacing (coming soon)"
      />
      <div style={{ fontSize: 10, color: "var(--text-muted, #666)", marginBottom: 12 }}>Coming soon</div>

      <div className="settings-toggle-label" style={{ fontSize: 12, marginBottom: 4 }}>Character Spacing</div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={10}
        step={0.5}
        defaultValue={0}
        disabled
        aria-label="Character spacing (coming soon)"
      />
      <div style={{ fontSize: 10, color: "var(--text-muted, #666)", marginBottom: 12 }}>Coming soon</div>

      <div className="settings-toggle-label" style={{ fontSize: 12, marginBottom: 4 }}>Word Spacing</div>
      <input
        type="range"
        className="settings-slider"
        min={0}
        max={10}
        step={0.5}
        defaultValue={0}
        disabled
        aria-label="Word spacing (coming soon)"
      />
      <div style={{ fontSize: 10, color: "var(--text-muted, #666)", marginBottom: 12 }}>Coming soon</div>
    </div>
  );
}

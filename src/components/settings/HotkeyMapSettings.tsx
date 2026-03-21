const HOTKEYS = [
  { action: "Jump back", key: "Left Arrow", status: "implemented" },
  { action: "Jump forward", key: "Right Arrow", status: "implemented" },
  { action: "Speed up", key: "Up Arrow", status: "implemented" },
  { action: "Slow down", key: "Down Arrow", status: "implemented" },
  { action: "Speed up (coarse)", key: "Shift + Up", status: "implemented" },
  { action: "Slow down (coarse)", key: "Shift + Down", status: "implemented" },
  { action: "Play / pause", key: "Space", status: "implemented" },
  { action: "Toggle favorite", key: "B", status: "implemented" },
  { action: "Switch reading mode", key: "Shift + F", status: "implemented" },
  { action: "Open settings", key: "Ctrl/Cmd + ,", status: "implemented" },
  { action: "Toggle side menu", key: "Tab", status: "implemented" },
  { action: "Font size up", key: "+ / =", status: "implemented" },
  { action: "Font size down", key: "- / _", status: "implemented" },
  { action: "Exit reader", key: "Esc", status: "implemented" },
  { action: "Smart import", key: "Alt/Cmd + V", status: "implemented" },
] as const;

export function HotkeyMapSettings() {
  return (
    <div>
      <div className="hotkey-grid">
        {HOTKEYS.map((hotkey) => (
          <>
            <span key={`action-${hotkey.key}`} className="hotkey-action">
              {hotkey.action}
            </span>
            <span key={`key-${hotkey.key}`} className="hotkey-key">
              {hotkey.key}
            </span>
          </>
        ))}
      </div>
    </div>
  );
}

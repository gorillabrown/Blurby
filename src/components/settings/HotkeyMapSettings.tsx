const HOTKEYS = [
  { action: "Jump back", key: "Left Arrow", status: "implemented" },
  { action: "Jump forward", key: "Right Arrow", status: "implemented" },
  { action: "Speed up", key: "Up Arrow", status: "implemented" },
  { action: "Slow down", key: "Down Arrow", status: "implemented" },
  { action: "Speed up (coarse)", key: "Shift + Up", status: "planned" },
  { action: "Slow down (coarse)", key: "Shift + Down", status: "planned" },
  { action: "Play / pause", key: "Space", status: "implemented" },
  { action: "Reader view", key: "Ctrl/Cmd + 1", status: "planned" },
  { action: "Source view", key: "Ctrl/Cmd + 2", status: "planned" },
  { action: "Reader settings", key: "Ctrl/Cmd + ,", status: "planned" },
  { action: "Reading speed", key: "Shift + S", status: "planned" },
  { action: "Narration settings", key: "Shift + T", status: "planned" },
  { action: "Speed reading mode", key: "Shift + F", status: "planned" },
  { action: "Navigation modal", key: "N", status: "planned" },
  { action: "Toggle favorite", key: "B", status: "planned" },
  { action: "Toggle narration", key: "T", status: "planned" },
  { action: "Toggle side menu", key: "Tab", status: "implemented" },
] as const;

export function HotkeyMapSettings() {
  return (
    <div>
      <div className="hotkey-grid">
        {HOTKEYS.map((hotkey) => {
          const isPlanned = hotkey.status === "planned";
          return (
            <>
              <span key={`action-${hotkey.key}`} className={`hotkey-action${isPlanned ? " planned" : ""}`}>
                {hotkey.action}
                {isPlanned && <span className="hotkey-planned-badge">(planned)</span>}
              </span>
              <span key={`key-${hotkey.key}`} className={`hotkey-key${isPlanned ? " planned" : ""}`}>
                {hotkey.key}
              </span>
            </>
          );
        })}
      </div>
    </div>
  );
}

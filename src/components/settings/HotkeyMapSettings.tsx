interface ShortcutEntry {
  action: string;
  key: string;
}

const SECTIONS: Array<{ title: string; shortcuts: ShortcutEntry[] }> = [
  {
    title: "Global",
    shortcuts: [
      { action: "Command palette", key: "Ctrl + K" },
      { action: "Open settings", key: "Ctrl + ," },
      { action: "Quick settings", key: "Ctrl + Shift + ," },
      { action: "Shortcuts overlay", key: "?" },
      { action: "Highlights overlay", key: ";" },
      { action: "Font size up", key: "Ctrl + =" },
      { action: "Font size down", key: "Ctrl + -" },
      { action: "Font size reset", key: "Ctrl + 0" },
      { action: "Smart import", key: "Alt + V" },
    ],
  },
  {
    title: "Library",
    shortcuts: [
      { action: "Navigate down", key: "J / Down" },
      { action: "Navigate up", key: "K / Up" },
      { action: "Open document", key: "Enter" },
      { action: "Toggle select", key: "X" },
      { action: "Select all", key: "Ctrl + Shift + A" },
      { action: "Focus search", key: "/" },
      { action: "Cycle focus zones", key: "Tab" },
      { action: "Jump to top", key: "Ctrl + Up" },
      { action: "Jump to bottom", key: "Ctrl + Down" },
      { action: "Archive", key: "E" },
      { action: "Restore from archive", key: "Shift + E" },
      { action: "Star / Favorite", key: "S" },
      { action: "Trash", key: "#" },
      { action: "Toggle unread", key: "U" },
      { action: "Resume reading", key: "R" },
      { action: "Open source", key: "O" },
      { action: "Snooze", key: "H" },
      { action: "Add tag", key: "L" },
      { action: "Move to collection", key: "V" },
      { action: "Undo last action", key: "Z" },
      { action: "Filter: unread", key: "Shift + U" },
      { action: "Filter: starred", key: "Shift + S" },
      { action: "Filter: reading", key: "Shift + R" },
      { action: "Filter: imported today", key: "Shift + I" },
    ],
  },
  {
    title: "Go-To Sequences (G then ...)",
    shortcuts: [
      { action: "Library", key: "G → L" },
      { action: "Favorites", key: "G → F" },
      { action: "Archive", key: "G → A" },
      { action: "Queue", key: "G → Q" },
      { action: "Recent", key: "G → R" },
      { action: "Stats", key: "G → S" },
      { action: "Snoozed", key: "G → H" },
      { action: "Collections", key: "G → C" },
      { action: "Toggle menu", key: "G → M" },
    ],
  },
  {
    title: "Reader — Focus",
    shortcuts: [
      { action: "Play / pause", key: "Space" },
      { action: "Rewind 5 words", key: "Left Arrow" },
      { action: "Forward 5 words", key: "Right Arrow" },
      { action: "Seek -1 word", key: "Ctrl + Left" },
      { action: "Seek +1 word", key: "Ctrl + Right" },
      { action: "Previous sentence", key: "Ctrl + Up" },
      { action: "Next sentence", key: "Ctrl + Down" },
      { action: "Previous paragraph", key: "Shift + Left" },
      { action: "Next paragraph", key: "Shift + Right" },
      { action: "Previous chapter", key: "Shift + Up" },
      { action: "Next chapter", key: "Shift + Down" },
      { action: "Speed up", key: "Up Arrow" },
      { action: "Slow down", key: "Down Arrow" },
      { action: "Star / Favorite", key: "S" },
      { action: "Toggle narration", key: "T" },
      { action: "Previous chapter", key: "[ / P" },
      { action: "Next chapter", key: "] / N" },
      { action: "Exit reader", key: "Esc" },
    ],
  },
  {
    title: "Reader — Flow",
    shortcuts: [
      { action: "Play / pause flow", key: "Space" },
      { action: "Previous line", key: "Left Arrow" },
      { action: "Next line", key: "Right Arrow" },
      { action: "Seek -1 word", key: "Ctrl + Left" },
      { action: "Seek +1 word", key: "Ctrl + Right" },
      { action: "Previous sentence", key: "Ctrl + Up" },
      { action: "Next sentence", key: "Ctrl + Down" },
      { action: "Previous paragraph", key: "Shift + Left" },
      { action: "Next paragraph", key: "Shift + Right" },
      { action: "Previous chapter", key: "Shift + Up" },
      { action: "Next chapter", key: "Shift + Down" },
      { action: "Speed up", key: "Up Arrow" },
      { action: "Slow down", key: "Down Arrow" },
      { action: "Star / Favorite", key: "S" },
      { action: "Toggle narration", key: "T" },
      { action: "Previous chapter", key: "[ / P" },
      { action: "Next chapter", key: "] / N" },
      { action: "Toggle menu", key: "Tab" },
      { action: "Exit reader", key: "Esc" },
    ],
  },
  {
    title: "Overlays",
    shortcuts: [
      { action: "Close overlay", key: "Esc" },
      { action: "Navigate results", key: "Up / Down" },
      { action: "Select result", key: "Enter" },
      { action: "Snooze: pick time", key: "1-5" },
    ],
  },
];

export function HotkeyMapSettings() {
  return (
    <div className="hotkey-settings">
      {SECTIONS.map((section) => (
        <div key={section.title} className="hotkey-section">
          <h4 className="hotkey-section-title">{section.title}</h4>
          <div className="hotkey-grid">
            {section.shortcuts.map((s) => (
              <div key={s.action} className="hotkey-row">
                <span className="hotkey-action">{s.action}</span>
                <span className="hotkey-key">{s.key}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

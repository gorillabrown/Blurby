# Blurby Hotkey Reference

**Date**: 2026-03-22 (v2 — Page-as-parent architecture)
**Status**: Post-Sprint 20/21 spec

---

## Global (Any View)

| Key | Action |
|-----|--------|
| `/` | Library search (documents only) |
| `Ctrl+K` | Command palette (actions, settings, chapters, shortcuts — no library items) |
| `Ctrl+,` | Open settings |
| `Ctrl+Shift+,` | Quick settings popover (context-sensitive) |
| `?` | Shortcuts overlay |
| `;` | Highlights & notes overlay |

---

## Library

### Navigation

| Key | Action |
|-----|--------|
| `J` | Move focus down |
| `K` | Move focus up |
| `↑` / `↓` | Move focus up/down (grid nav) |
| `←` / `→` | Move focus left/right (grid nav) |
| `Ctrl+↑` | Jump to first document |
| `Ctrl+↓` | Jump to last document |
| `Enter` | Open focused document at last reading position |
| `R` | Resume reading (alias for Enter) |
| `Tab` | Cycle zone: search → grid → sidebar |
| `Shift+Tab` | Cycle zone (reverse) |

### Actions (on focused document)

| Key | Action |
|-----|--------|
| `E` | Archive (auto-advance to next) |
| `Shift+E` | Restore from archive |
| `S` | Toggle star / favorite |
| `#` | Trash (Shift+3) |
| `U` | Toggle read / unread |
| `O` | Open original source (URL → browser, file → folder) |
| `X` | Toggle multi-select |
| `Ctrl+Shift+A` | Select all visible documents |
| `Z` | Undo last action (5-second window) |

### Snooze & Organize

| Key | Action |
|-----|--------|
| `H` | Snooze — opens time picker |
| `L` | Tag picker |
| `V` | Move to collection |

### Filters

| Key | Action |
|-----|--------|
| `Shift+U` | Filter: unread only (toggle) |
| `Shift+S` | Filter: starred only (toggle) |
| `Shift+R` | Filter: currently reading (toggle) |
| `Shift+I` | Filter: imported today (toggle) |

### Go-To Sequences (press G, then...)

| Sequence | Destination |
|----------|-------------|
| `G` → `L` | Library (all documents) |
| `G` → `F` | Favorites |
| `G` → `A` | Archive |
| `G` → `Q` | Queue |
| `G` → `R` | Recent |
| `G` → `S` | Stats |
| `G` → `H` | Snoozed |
| `G` → `C` | Collections |
| `G` → `M` | Toggle menu sidebar |

---

## Reader — Page View (Default)

Page view is the default when opening a document. Paginated, book-like reading with no word highlighting.

### Page Navigation

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / next page |
| `Ctrl+↑` / `Ctrl+↓` | First / last page |
| `[` or `P` | Previous chapter |
| `]` or `N` | Next chapter |

### Launching Speed-Reading Modes

| Key | Action |
|-----|--------|
| `Space` | Enter Focus (RSVP) at highlighted word |
| `Shift+Space` | Enter Flow (scroll highlight) at highlighted word |

### Word Selection & Annotation

| Key | Action |
|-----|--------|
| Click word | Highlight / set anchor point |
| `Shift+←` / `Shift+→` | Move highlight left/right by word |
| `Shift+↑` / `Shift+↓` | Move highlight up/down by line |
| `Shift+D` | Define highlighted word |
| `Shift+N` | Make note on highlighted word/phrase |
| Right-click word | Context menu: "Define" or "Make Note" |

### General

| Key | Action |
|-----|--------|
| `↑` / `↓` | Adjust WPM ±25 |
| `Shift+↑` / `Shift+↓` | Adjust WPM ±100 |
| `Ctrl+=` / `Ctrl+-` | Font size increase / decrease |
| `Ctrl+0` | Reset font size |
| `M` | Toggle menu flap |
| `T` | Toggle TTS narration |
| `S` | Toggle star / favorite |
| `Escape` | Exit reader (return to library) |

---

## Reader — Focus Mode (RSVP Sub-Mode)

Entered via `Space` from Page view. Single word displayed at center, advancing at WPM.

| Key | Action |
|-----|--------|
| `Space` | Pause → return to Page view |
| `←` / `→` | Rewind / forward words |
| `↑` / `↓` | Adjust WPM ±25 |
| `Shift+↑` / `Shift+↓` | Adjust WPM ±100 |
| `Escape` | Exit to Page view |

On pause: user lands back in Page view at the word they stopped on, highlighted. `Space` re-enters Focus. `Shift+Space` enters Flow instead.

---

## Reader — Flow Mode (Scroll Highlight Sub-Mode)

Entered via `Shift+Space` from Page view. Full text scrolls with word-level highlight walking through.

| Key | Action |
|-----|--------|
| `Space` | Pause → return to Page view |
| `←` / `→` | Seek words backward / forward |
| `↑` / `↓` | Adjust WPM ±25 |
| `Shift+↑` / `Shift+↓` | Adjust WPM ±100 |
| `Escape` | Exit to Page view |

On pause: same as Focus — lands in Page view with word highlighted.

---

## Escape Layering (Priority Order)

Pressing `Escape` closes the topmost layer:

1. Command palette
2. Library search
3. Snooze picker
4. Tag picker
5. Shortcuts overlay
6. Highlights overlay
7. Quick settings popover
8. Highlight menu / note input
9. Search bar focus (return to grid)
10. Multi-select (clear selection)
11. Focus/Flow → Page view
12. Page view → Library

---

## Retired Keys

| Key | Was | Replaced By |
|-----|-----|-------------|
| `B` | Toggle favorite | `S` |
| `=` / `-` (bare) | Font size | `Ctrl+=` / `Ctrl+-` |
| `Shift+F` | Toggle reading mode | `Space` / `Shift+Space` from Page |
| `Tab` (reader) | Menu flap | `M` |
| `Shift+Space` (flow) | Toggle flow playback | `Shift+Space` from Page to enter Flow |
| `Space` (flow, old) | Switch to focus mode | Pause → Page view |

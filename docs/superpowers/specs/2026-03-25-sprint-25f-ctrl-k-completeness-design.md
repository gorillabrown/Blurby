# Sprint 25F — Ctrl+K Completeness

**Date:** 2026-03-25
**Scope:** BUG-058, BUG-059, BUG-038, BUG-060, CSS fix
**Estimated effort:** 4-6 hours
**Branch:** `sprint/25f-ctrl-k-completeness`

---

## Overview

Make the Ctrl+K command palette a complete entry point to every app action and setting, expand hotkey coaching coverage to reader views, clean up Help settings, and fix the hotkey map layout.

Five items, one theme: **discoverability**.

---

## BUG-058: Library Layout + Reading Layout in Ctrl+K

### Problem

CommandPalette.tsx has zero entries for LibraryLayoutSettings (sort, grid/list, card size, spacing). LayoutSettings is partially covered — missing text size entries. (Existing entries for Line/Character/Word Spacing are fine and stay.)

### Solution

Add 7 new entries to the `buildActions()` registry in CommandPalette.tsx:

| Label | Sublabel | Opens Page |
|-------|----------|------------|
| Settings: Library Layout | Sort, grid/list, card size, spacing | `library-layout` |
| Default Sort Order | Closest to done, A-Z, newest, oldest | `library-layout` |
| Library View Mode | Grid or list view | `library-layout` |
| Card Size | Small, medium, large cards | `library-layout` |
| Card Spacing | Compact, cozy, roomy | `library-layout` |
| Focus Text Size | Adjust focus reader text size | `layout` |
| Flow Text Size | Adjust flow reader text size | `layout` |

### Files Changed

- `src/components/CommandPalette.tsx` — add entries to `buildActions()`

---

## BUG-059: Every Individual Setting Searchable (~50+ entries)

### Problem

Only ~33 entries exist in the command palette. Many settings pages have no sub-entries, making individual settings undiscoverable via Ctrl+K.

### Solution

Add ~23 new entries across all settings pages. All use Option A behavior: selecting an entry navigates to the settings page containing that setting.

Remove the duplicate "Settings: Toggle Theme" entry (line 84), which overlaps with "Settings: Theme" (line 99).

#### ThemeSettings additions (4 new)

| Label | Sublabel | Opens Page |
|-------|----------|------------|
| Theme Mode | Blurby, dark, light, e-ink, system | `theme` |
| E-Ink Phrase Grouping | 2-3 words per tick on e-ink displays | `theme` |
| E-Ink WPM Ceiling | Max reading speed for e-ink | `theme` |
| E-Ink Screen Refresh | Refresh interval for e-ink ghosting | `theme` |

#### SpeedReadingSettings additions (14 new)

| Label | Sublabel | Opens Page |
|-------|----------|------------|
| Focus Marks | Toggle ORP focus marks | `speed-reading` |
| Reading Ruler | Toggle reading ruler line | `speed-reading` |
| Focus Span | Adjust focus area width | `speed-reading` |
| Words Per Highlight | Flow mode highlight word count | `speed-reading` |
| Flow Cursor Style | Underline or highlight cursor | `speed-reading` |
| Comma Pauses | Pause on commas, colons, semicolons | `speed-reading` |
| Sentence Pauses | Pause at sentence endings | `speed-reading` |
| Paragraph Pauses | Pause at paragraph breaks | `speed-reading` |
| Number Pauses | Pause on numbers | `speed-reading` |
| Long Word Pauses | Pause on words longer than 8 chars | `speed-reading` |
| Enable TTS | Turn text-to-speech on/off | `speed-reading` |
| Voice Engine | System or Kokoro AI voices | `speed-reading` |
| TTS Voice | Choose narration voice | `speed-reading` |
| Speech Rate | Adjust TTS playback speed | `speed-reading` |

#### CloudSyncSettings additions (3 new)

| Label | Sublabel | Opens Page |
|-------|----------|------------|
| Sync Interval | How often to sync (1/5/15/30 min, manual) | `cloud-sync` |
| Microsoft Account | Connect OneDrive for sync | `cloud-sync` |
| Google Account | Connect Google Drive for sync | `cloud-sync` |

#### ConnectorsSettings additions (1 new)

| Label | Sublabel | Opens Page |
|-------|----------|------------|
| Site Login | Add authenticated site for article import | `connectors` |

#### HelpSettings additions (1 new)

| Label | Sublabel | Opens Page |
|-------|----------|------------|
| Check for Updates | Check if a newer version is available | `help` |

### Totals

- 7 entries from BUG-058
- 23 entries from BUG-059
- 1 duplicate removed
- Final count: ~62 entries (up from ~33)

### Files Changed

- `src/components/CommandPalette.tsx` — add entries, remove duplicate

---

## BUG-038: Hotkey Coaching Toasts in Reader Views

### Problem

`HotkeyCoach.tsx` is partially wired. The component renders in `LibraryContainer.tsx`, and `triggerCoachHint()` is already called in library card components (`DocCard.tsx`, `DocGridCard.tsx`) and `LibraryView.tsx` for archive, favorite, delete, and search actions. However, coaching is completely absent from all reader views — no hints for bottom bar button clicks (play, focus, flow, TTS, chapter nav, font size, menu).

### Solution

Three changes:

#### 1. Move HotkeyCoach to App.tsx (global render)

Move `<HotkeyCoach />` from `LibraryContainer.tsx` to `App.tsx` so it works in both library and reader views. Remove the import and render from `LibraryContainer.tsx` to avoid double-rendering.

#### 2. Expand COACH_HINTS map

Add reader bottom bar entries. Only coach where a mouse click has a faster keyboard alternative — skip pure-keyboard actions (arrow nav, Escape layering, filter combos).

**Library view hints** (already wired — no changes needed):

| Coach Key | Action Label | Hotkey | Wired In |
|-----------|-------------|--------|----------|
| `archive` | archive | E | DocCard, DocGridCard |
| `favorite` | favorite | S | DocCard, DocGridCard |
| `star` | star | S | DocCard, DocGridCard |
| `search` | search | / | LibraryView |
| `delete` | delete | # | DocCard, DocGridCard |
| `queue` | queue | Q | (existing hint, no click target — orphaned) |
| `settings` | settings | Ctrl+, | (existing hint, wire to MenuFlap settings click) |

**Reader bottom bar hints** (all new):

| Coach Key | Action Label | Hotkey | Notes |
|-----------|-------------|--------|-------|
| `play` | play/pause | Space | |
| `enterFocus` | enter Focus mode | Shift+Space | Page mode only |
| `enterFlow` | enter Flow mode | Space | Page mode only |
| `narration` | toggle narration | N | Page-mode TTS button uses N key (T is universal but N is context-correct here) |
| `fontSize` | adjust font size | Ctrl+=/- | |
| `prevChapter` | previous chapter | [ | |
| `nextChapter` | next chapter | ] | |
| `menu` | toggle menu | Tab | |

**Total:** 15 entries in COACH_HINTS map (7 existing + 8 new reader hints).

#### 3. Wire triggerCoachHint() into reader click handlers

Import `triggerCoachHint` in `ReaderBottomBar.tsx`. Add calls inside existing `onClick` handlers for: play/pause, Focus mode button, Flow mode button, TTS toggle, font size +/- buttons, chapter prev/next buttons, and menu toggle.

Also wire `triggerCoachHint("settings")` in `MenuFlap.tsx` (or wherever the Settings button click handler lives) to activate the existing orphaned hint.

### Existing wiring (no changes needed)

These files already call `triggerCoachHint` and should not be modified:
- `src/components/DocCard.tsx` — favorite, archive, unarchive, delete
- `src/components/DocGridCard.tsx` — favorite, archive, delete
- `src/components/LibraryView.tsx` — search

### Behavior (unchanged from existing design)

- Each hint shows **once per action** (tracked in localStorage under `blurby_hotkey_coach_shown`)
- Toast auto-dismisses after `HOTKEY_COACH_DISMISS_MS` (from constants)
- Escape dismisses immediately
- Click on toast dismisses it
- ARIA `role="status"` with `aria-live="polite"` for screen readers

### Files Changed

- `src/App.tsx` — import and render `<HotkeyCoach />`
- `src/components/LibraryContainer.tsx` — **remove** `<HotkeyCoach />` import and render (moved to App.tsx)
- `src/components/HotkeyCoach.tsx` — add 8 new reader entries to `COACH_HINTS` map
- `src/components/ReaderBottomBar.tsx` — import `triggerCoachHint`, add calls in click handlers
- `src/components/MenuFlap.tsx` — add `triggerCoachHint("settings")` to settings button click

---

## BUG-060: Remove Keyboard Shortcuts from Help Settings

### Problem

HelpSettings.tsx has a hardcoded "Keyboard Shortcuts" section with only 7 shortcuts (Play/Pause, Rewind, Forward, Speed +/-, Exit reader, Quick-read). The full Hotkey Map settings page already exists as a separate settings sub-page with 50+ shortcuts across 6 sections. The Help shortcuts are redundant, incomplete, and misleading.

### Solution

Remove the "Keyboard Shortcuts" section entirely from HelpSettings.tsx (lines 34-50: the section label, the `hotkey-grid` div, and all its children). Keep only "Adding Content" and "Updates" sections.

The Hotkey Map page remains the single source of truth for keyboard shortcuts. It is already accessible via:
- Settings sidebar ("Hotkey Map" entry)
- Ctrl+K ("Settings: Hotkeys")
- `?` shortcut (ShortcutsOverlay)

### Files Changed

- `src/components/settings/HelpSettings.tsx` — remove Keyboard Shortcuts section
- `src/components/settings/HelpSettings.tsx` — remove unused `REWIND_WORDS`, `WPM_STEP` imports from constants

---

## CSS Fix: Hotkey Map Grid Layout

### Problem

The hotkey map page has broken layout — action labels and key labels run together without column separation (e.g., "Command paletteCtrl + K" on one line instead of two columns).

**Root cause:** The CSS `.hotkey-grid` uses `display: grid; grid-template-columns: 1fr auto` expecting flat children (action, key, action, key alternating). But `HotkeyMapSettings.tsx` wraps each pair in a `<div className="hotkey-row">`, which becomes a single grid item. The `.hotkey-row` class has no CSS definition.

### Solution

Add `display: contents` to `.hotkey-row` in `global.css`. This makes the row wrapper transparent to the grid layout — its children (`.hotkey-action` and `.hotkey-key`) participate directly in the parent grid columns. (`display: contents` is safe in Electron 41 / Chromium 136+.)

Additionally, add basic styling for `.hotkey-section-title` and `.hotkey-settings` which are also unstyled:

```css
.hotkey-row {
  display: contents;
}

.hotkey-settings {
  padding: 0;
}

.hotkey-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin: 16px 0 8px;
}

.hotkey-section-title:first-child {
  margin-top: 0;
}
```

### Files Changed

- `src/styles/global.css` — add `.hotkey-row`, `.hotkey-settings`, `.hotkey-section-title` rules

---

## Acceptance Criteria

### BUG-058
- [ ] Searching "library layout" in Ctrl+K shows Library Layout settings entry
- [ ] Searching "sort" shows Default Sort Order entry
- [ ] Searching "card size" shows Card Size entry
- [ ] Searching "text size" shows Focus Text Size and Flow Text Size entries
- [ ] All new entries navigate to the correct settings page on selection

### BUG-059
- [ ] Searching any individual setting name (e.g., "focus marks", "comma pauses", "sync interval") returns a matching entry
- [ ] Total palette entries >= 55
- [ ] Duplicate "Settings: Toggle Theme" entry removed
- [ ] All entries navigate to correct settings sub-page
- [ ] Fuzzy search works across labels and sublabels

### BUG-038
- [ ] `<HotkeyCoach />` renders in App.tsx (not in LibraryContainer)
- [ ] No double-render of HotkeyCoach (removed from LibraryContainer)
- [ ] Existing library coaching still works (archive, favorite, delete, search)
- [ ] Clicking play button in reader bottom bar shows coaching toast "Next time try Space to play/pause faster"
- [ ] Clicking TTS toggle shows coaching toast "Next time try N to toggle narration faster"
- [ ] Clicking Focus mode button shows coaching toast
- [ ] Each coaching toast shows only once per action (localStorage persistence)
- [ ] Coaching toast auto-dismisses after timeout
- [ ] Escape key dismisses active coaching toast
- [ ] 15 coach hints in COACH_HINTS map (7 existing + 8 new)

### BUG-060
- [ ] Help settings page shows only "Adding Content" and "Updates" sections
- [ ] No keyboard shortcuts listed in Help
- [ ] `REWIND_WORDS` and `WPM_STEP` imports removed from HelpSettings.tsx

### CSS Fix
- [ ] Hotkey Map page shows two-column layout: action on left, key on right
- [ ] Section titles (Global, Library, Go-To Sequences, etc.) visually separate groups
- [ ] No text running together — clear gap between action and key columns

### General
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] No regressions in existing Ctrl+K functionality
- [ ] Palette performance acceptable with ~62 entries (fuzzy search stays fast)

---

## Non-Goals

- No inline setting modification from palette (Option C) — just navigation
- No auto-scroll to specific controls within settings pages (Option B)
- No coaching for pure-keyboard actions (arrow nav, escape layering, filter combos)
- No coaching for sidebar Go-To navigation (no click targets exist — G-sequences are keyboard-only)
- No new keyboard shortcuts — only wiring existing ones to coaching

## Dependencies

- None — all five items are independent of each other and can be parallelized

## Risk

- Low. All changes are additive. No architecture changes, no new components, no new IPC channels.
- The only structural change is moving HotkeyCoach from LibraryContainer to App.tsx.
- The CSS fix uses `display: contents` which is safe in Electron 41 (Chromium 136+).

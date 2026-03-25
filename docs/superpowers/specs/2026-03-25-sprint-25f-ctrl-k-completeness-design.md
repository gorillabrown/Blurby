# Sprint 25F — Ctrl+K Completeness

**Date:** 2026-03-25
**Scope:** BUG-058, BUG-059, BUG-038
**Estimated effort:** 4-6 hours
**Branch:** `sprint/25f-ctrl-k-completeness`

---

## Overview

Make the Ctrl+K command palette a complete entry point to every app action and setting, and wire up the dormant hotkey coaching system so users discover keyboard shortcuts naturally.

Three bugs, one theme: **discoverability**.

---

## BUG-058: Library Layout + Reading Layout in Ctrl+K

### Problem

CommandPalette.tsx has zero entries for LibraryLayoutSettings (sort, grid/list, card size, spacing). LayoutSettings is partially covered — missing text size entries.

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

Only ~30 entries exist in the command palette. Many settings pages have no sub-entries, making individual settings undiscoverable via Ctrl+K.

### Solution

Add ~30 new entries across all settings pages. All use Option A behavior: selecting an entry navigates to the settings page containing that setting.

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
- Final count: ~60 entries (up from ~30)

### Files Changed

- `src/components/CommandPalette.tsx` — add entries, remove duplicate

---

## BUG-038: Hotkey Coaching Toasts in Reader Views

### Problem

`HotkeyCoach.tsx` exists as dead code. The component is never imported or rendered. `triggerCoachHint()` is never called anywhere. The coaching system is fully built but completely unwired.

### Solution

Three changes:

#### 1. Render HotkeyCoach globally

Mount `<HotkeyCoach />` once in `App.tsx` rather than per-container. The component uses a global custom event listener, so it works regardless of which view is active.

#### 2. Expand COACH_HINTS map

Add entries for all clickable UI elements that have keyboard equivalents. Only coach where a mouse click has a faster keyboard alternative — skip pure-keyboard actions (arrow nav, Escape layering, filter combos).

**Library view hints** (existing 7 + new sidebar hints):

| Coach Key | Action Label | Hotkey |
|-----------|-------------|--------|
| `archive` | archive | E |
| `favorite` | favorite | S |
| `star` | star | S |
| `search` | search | / |
| `delete` | delete | # |
| `queue` | queue | Q |
| `settings` | settings | Ctrl+, |
| `goToFavorites` | jump to Favorites | G then F |
| `goToArchive` | jump to Archive | G then A |
| `goToQueue` | jump to Queue | G then Q |
| `goToRecent` | jump to Recent | G then R |
| `goToStats` | jump to Stats | G then S |
| `goToSnoozed` | jump to Snoozed | G then H |
| `goToCollections` | jump to Collections | G then C |

**Reader bottom bar hints** (all new):

| Coach Key | Action Label | Hotkey |
|-----------|-------------|--------|
| `play` | play/pause | Space |
| `enterFocus` | enter Focus mode | Shift+Space |
| `enterFlow` | enter Flow mode | Space |
| `narration` | toggle narration | T |
| `fontSize` | adjust font size | Ctrl+=/- |
| `prevChapter` | previous chapter | [ |
| `nextChapter` | next chapter | ] |
| `menu` | toggle menu | Tab |

**Total:** ~22 coaching hints (7 existing + 15 new).

#### 3. Wire triggerCoachHint() into click handlers

**Library view:** Import `triggerCoachHint` in `LibraryContainer.tsx` (or wherever archive/favorite/delete/queue click handlers live). Add calls inside existing `onClick` handlers. Also wire sidebar filter clicks for Go-To hints.

**Reader view:** Import `triggerCoachHint` in `ReaderBottomBar.tsx`. Add calls inside existing `onClick` handlers for play, focus, flow, TTS, font size, chapter nav, and menu buttons.

### Behavior (unchanged from existing design)

- Each hint shows **once per action** (tracked in localStorage under `blurby_hotkey_coach_shown`)
- Toast auto-dismisses after `HOTKEY_COACH_DISMISS_MS` (from constants)
- Escape dismisses immediately
- Click on toast dismisses it
- ARIA `role="status"` with `aria-live="polite"` for screen readers

### Files Changed

- `src/App.tsx` — import and render `<HotkeyCoach />`
- `src/components/HotkeyCoach.tsx` — expand `COACH_HINTS` map (~15 new entries)
- `src/components/ReaderBottomBar.tsx` — import `triggerCoachHint`, add calls in click handlers
- `src/components/LibraryContainer.tsx` (or `LibraryView.tsx`) — import `triggerCoachHint`, add calls in click handlers
- Sidebar filter click handlers — add `triggerCoachHint` for Go-To sequence hints

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
- [ ] `<HotkeyCoach />` renders globally in App.tsx
- [ ] Clicking archive button in library shows coaching toast "Next time try E to archive faster"
- [ ] Clicking play button in reader bottom bar shows coaching toast "Next time try Space to play/pause faster"
- [ ] Clicking TTS toggle shows coaching toast "Next time try T to toggle narration faster"
- [ ] Each coaching toast shows only once per action (localStorage persistence)
- [ ] Coaching toast auto-dismisses after timeout
- [ ] Escape key dismisses active coaching toast
- [ ] All 22+ coach hints have entries in COACH_HINTS map

### General
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] No regressions in existing Ctrl+K functionality
- [ ] Palette performance acceptable with ~60 entries (fuzzy search stays fast)

---

## Non-Goals

- No inline setting modification from palette (Option C) — just navigation
- No auto-scroll to specific controls within settings pages (Option B)
- No coaching for pure-keyboard actions (arrow nav, escape layering, filter combos)
- No new keyboard shortcuts — only wiring existing ones to coaching

## Dependencies

- None — all three bugs are independent of each other and can be parallelized

## Risk

- Low. All changes are additive. No architecture changes, no new components, no new IPC channels.
- The only structural change is mounting HotkeyCoach in App.tsx instead of per-container.

# Menu Flap, Settings Redesign & URL-to-PDF Export

> Design spec for Blurby's new overlay menu flap with integrated settings and automatic PDF generation for URL-imported articles.

---

## Overview

Two features delivered as a cohesive unit:

1. **Menu Flap** — A right-side overlay drawer accessible from both the reader and dashboard via hamburger icon or `Tab` key. Default view shows a reading queue (in-progress and unread documents). A Settings section at the bottom provides drill-down access to all app settings, replacing the current appearance panel in LibraryView.

2. **URL-to-PDF Export** — When importing articles from URLs, a PDF is automatically generated via pdfkit and saved to a `Saved Articles/` subfolder inside the user's watched source folder. This subfolder is excluded from the folder watcher and scanner to avoid duplication. The library entry transitions from `source: "url"` to `source: "folder"`, making the PDF the canonical copy. URL import requires a source folder to be selected.

---

## Feature 1: Menu Flap

### Overlay Behavior

- **Position:** Right-aligned, full height, ~300px wide
- **Backdrop:** Semi-transparent dim over main content
- **Animation:** Slide-in from right, ~200ms CSS transition, respects `prefers-reduced-motion`
- **Z-index:** Above all content, below existing modals (delete confirmation, etc.)
- **Default state:** Closed on app launch

### Open/Close Triggers

| Action | Result |
|--------|--------|
| Hamburger icon click (top-right, both views) | Toggle open/closed |
| `Tab` keyboard shortcut | Toggle open/closed |
| Click backdrop (dimmed area) | Close |
| Click a document in reading queue | Close + open doc in reader |
| Back arrow to queue level + close | Close |

`Escape` is never involved with the flap — it remains exclusively for reader exit.

### Flap Header

- **Left:** Back arrow (navigates up: sub-page → settings list → queue)
- **Center:** Current view title ("Reading Queue" / "Settings" / "Theme" etc.)
- **Right:** Compact/relaxed toggle icon + close (✕) button

### Compact/Relaxed Toggle

- Boolean setting (`compactMode`) toggled via icon in flap header
- Controls reading queue item density (bubble size, padding, spacing)
- Hook for future compact behaviors in other areas (settings panels, etc.)
- Persisted in settings.json

### Reading Queue (Default View)

Two sections, in order:

1. **In-progress** (0% < progress < 100%) — sorted by `lastReadAt` timestamp descending (most recently read at top)
2. **Unread** (progress = 0%) — sorted by date added descending

Sorting requires a `lastReadAt` field on each document — see Library Migration section below.

Each item shows:
- Document title
- Date added
- Source badge (folder / url / manual)
- Bubble progress bar: 10 bubbles, filled count = `Math.floor(progress / 10)`, accent color for filled, faded accent for empty, percentage label

Clicking a document closes the flap and opens it directly in the reader.

Empty state: "No unread materials" message.

### Settings Menu

Accessed via Settings button pinned at the bottom of the flap. Replaces the reading queue content with a category list. Drill-down navigation — tapping a category shows its sub-page, back arrow returns to the list.

**Categories:**

| Category | Component | Status |
|----------|-----------|--------|
| Text Size | `TextSizeSettings.tsx` | Partial — wire existing fontSize, placeholder for separate focus/flow sliders |
| Speed Reading | `SpeedReadingSettings.tsx` | Placeholder — mode toggle wired to Focus/ScrollReader, rest disabled |
| Theme | `ThemeSettings.tsx` | Full — migrates existing accent color, font family, dark/light/eink/system |
| Layout | `LayoutSettings.tsx` | Placeholder — line/character/word spacing sliders, disabled |
| Connectors | `ConnectorsSettings.tsx` | Full — migrates existing site login/logout/cookie UI |
| Help | `HelpSettings.tsx` | Full — migrates existing HelpPanel content |
| Hotkey Map | `HotkeyMapSettings.tsx` | Full — read-only reference list |

Help and Hotkey Map are visually separated from the main settings categories by a divider.

### Speed Reading Settings Structure (Placeholder)

```
MODE
  [Focus] [Flow]            ← toggle, Focus wired to existing, Flow placeholder

FOCUS MODE
  Focus Marks               ← toggle, placeholder

GENERAL READER
  Reading Ruler             ← toggle, placeholder

FOCUS SPAN
  [slider: Narrow ↔ Wide]  ← placeholder

RHYTHM PAUSES
  Commas, colons, etc.      ← toggle, placeholder
  Between sentences         ← toggle, placeholder
  Between paragraphs        ← toggle, placeholder
  Numbers                   ← toggle, placeholder
  Longer words              ← toggle, placeholder
```

### Hotkey Map Reference

Implemented shortcuts display normally. Unimplemented shortcuts display greyed out with a "planned" label.

| Action | Shortcut | Status |
|--------|----------|--------|
| Jump back | Left Arrow | Implemented |
| Jump forward | Right Arrow | Implemented |
| Speed up | Up Arrow | Implemented |
| Slow down | Down Arrow | Implemented |
| Speed up (coarse) | Shift + Up Arrow | Planned |
| Slow down (coarse) | Shift + Down Arrow | Planned |
| Play / pause | Space | Implemented |
| Reader view | Ctrl/Cmd + 1 | Planned |
| Source view | Ctrl/Cmd + 2 | Planned |
| Reader settings | Ctrl/Cmd + , | Planned |
| Reading speed | Shift + S | Planned |
| Narration settings | Shift + T | Planned |
| Speed reading mode | Shift + F | Planned |
| Navigation modal | N | Planned |
| Toggle favorite | B | Planned |
| Toggle narration | T | Planned |
| Toggle side menu | Tab | Implemented |

---

## Feature 2: URL-to-PDF Export

### Trigger

Automatic — immediately after successful URL article extraction in the `add-doc-from-url` IPC handler.

### Prerequisites

- A source folder must be selected. URL import is disabled (greyed out with tooltip) if no source folder is set.
- Manual paste documents do not generate PDFs.

### Save Location

- `<source-folder>/Saved Articles/` subfolder
- Auto-created on first URL import if it doesn't exist
- Filename: sanitized article title + `.pdf` (e.g., `AI-in-Education.pdf`)
- **Watcher exclusion:** The `Saved Articles/` subfolder is excluded from both the Chokidar watcher (`ignored` option) and `scanFolderAsync` to prevent duplication

### PDF Content (pdfkit)

- **Header block (first page):** Title, author (if available), source URL, fetch date
- **Body:** Article text with paragraph breaks
- **Metadata embedded:** title, author, source URL (`keywords` field), creation date

### Library Entry Transition

After PDF is successfully written:
1. Update the library entry's `source` from `"url"` to `"folder"`
2. Set `filepath` to the PDF's absolute path
3. Remove `content` from library.json (now loaded on-demand from the PDF file)
4. Preserve all other metadata (position, wordCount, created, etc.)

This eliminates duplication. The `Saved Articles/` subfolder is excluded from the watcher/scanner, so the PDF is managed entirely via its library entry and absolute filepath. `load-doc-content` reads it on demand.

**Sync protection:** `syncLibraryWithFolder` must preserve folder-sourced docs whose filepath is inside the `Saved Articles/` subfolder, even though the scanner does not visit that subfolder.

### Error Handling

- If PDF generation fails, the URL-sourced doc remains as-is (content in library.json) — import still succeeds, just no PDF
- Log PDF generation errors to the error log

---

## Component Architecture

### New Components

| Component | Purpose |
|-----------|---------|
| `MenuFlap.tsx` | Shell: overlay, backdrop, open/close animation, navigation stack |
| `ReadingQueue.tsx` | Default flap view: sectioned doc list, bubble progress bars |
| `SettingsMenu.tsx` | Top-level category list with drill-down routing |
| `TextSizeSettings.tsx` | Focus/flow text size sliders |
| `SpeedReadingSettings.tsx` | Mode, focus marks, ruler, span, rhythm pauses |
| `ThemeSettings.tsx` | Dark/light/system, accent color, font family |
| `LayoutSettings.tsx` | Line/character/word spacing |
| `ConnectorsSettings.tsx` | Site login management |
| `HelpSettings.tsx` | Help content |
| `HotkeyMapSettings.tsx` | Read-only hotkey reference |

### Removed/Refactored

- **Appearance panel in LibraryView.tsx** (the `showAppearance` conditional block): Deleted. Logic migrates to ThemeSettings + ConnectorsSettings.
- **HelpPanel.tsx**: Content migrates to HelpSettings. Old component removed.

### State Management

- Flap open/close: `App.tsx` state (shared across reader and library views)
- Flap navigation (which sub-page): `MenuFlap.tsx` internal state
- Re-opening flap always resets to Reading Queue
- Settings components receive current settings as props + onChange callbacks

---

## Data Migration: v3 → v4

### New Settings Fields

```json
{
  "schemaVersion": 4,
  "compactMode": false,
  "readingMode": "focus",
  "focusMarks": true,
  "readingRuler": false,
  "focusSpan": 0.4,
  "rhythmPauses": {
    "commas": true,
    "sentences": true,
    "paragraphs": true,
    "numbers": false,
    "longerWords": false
  },
  "layoutSpacing": {
    "line": 1.5,
    "character": 0,
    "word": 0
  },
  "focusTextSize": 100,
  "flowTextSize": 100
}
```

- Existing `fontSize` maps to `focusTextSize`, then is removed
- All references to `fontSize` in App.tsx, ReaderView.tsx, ScrollReaderView.tsx, types.ts, and standalone reader must be updated to `focusTextSize`
- All other existing fields (`accentColor`, `fontFamily`, `theme`, etc.) are preserved unchanged

### Library Migration: v1 → v2

Add `lastReadAt` field to each document for reading queue sorting:

```json
{
  "lastReadAt": null
}
```

- Default: `null` for all existing docs (treated as "never read" in sort order)
- Updated whenever the user opens a document in the reader (timestamp set to `Date.now()`)
- Existing `position > 0` docs could have `lastReadAt` backfilled from `modified` as a best-effort estimate

### Relationship between `readingMode` and existing `readerMode`

The existing `readerMode` state in App.tsx ("speed"/"scroll") maps to the new `readingMode` setting ("focus"/"flow"). During implementation, consolidate these: `readingMode: "focus"` = current speed/RSVP reader, `readingMode: "flow"` = current scroll reader (to be enhanced later with word-by-word highlighting). The existing `readerMode` state variable should be derived from `settings.readingMode`.

---

## Testing Strategy

### New Test Files

| File | Coverage |
|------|----------|
| `tests/menu-flap.test.js` | Queue sorting (in-progress by last-read, unread by date-added), bubble count calculation (`Math.floor(progress/10)`), compact mode toggle |
| `tests/pdf-export.test.js` | Filename sanitization, metadata structure, doc source transition logic (url→folder field changes), pdfkit→pdf-parse round-trip text fidelity |

### Existing Test Updates

| File | Changes |
|------|---------|
| `tests/migrations.test.js` | Add v3→v4 settings cases (new fields with defaults, fontSize→focusTextSize rename, existing fields preserved) and library v1→v2 case (lastReadAt added to all docs) |

### Tested (pure functions)

- Queue sorting algorithm
- Bubble count from progress percentage
- Migration function correctness
- PDF filename sanitization
- PDF text round-trip (pdfkit write → pdf-parse read)
- Settings defaults after migration
- Library migration (lastReadAt field added)

### Not tested (requires Electron)

- Flap open/close animations
- IPC handlers
- Actual PDF file I/O
- Keyboard shortcut registration

---

## Roadmap: Phase 5

### 5.1 Menu Flap Shell
- [ ] Create `MenuFlap.tsx` with overlay, backdrop, slide-in animation
- [ ] Add hamburger icon to ReaderView and LibraryView headers
- [ ] Wire `Tab` keyboard shortcut to toggle flap
- [ ] Backdrop click to close
- [ ] Compact/relaxed toggle in flap header
- [ ] Respect `prefers-reduced-motion`

### 5.2 Reading Queue
- [ ] Create `ReadingQueue.tsx` with in-progress and unread sections
- [ ] Implement bubble progress bar (10 bubbles, accent-colored)
- [ ] Sort in-progress by last read descending, unread by date added descending
- [ ] Click-to-read: close flap, open doc in reader
- [ ] Compact and relaxed display modes
- [ ] Empty state message

### 5.3 Settings Reorganization
- [ ] Create `SettingsMenu.tsx` with drill-down category navigation
- [ ] Back arrow navigation through settings hierarchy
- [ ] Divider between main settings and help/hotkeys

### 5.4 Settings Sub-pages (Implemented)
- [ ] `ThemeSettings.tsx` — migrate accent color, font family, dark/light/eink/system from LibraryView
- [ ] `ConnectorsSettings.tsx` — migrate site login UI from LibraryView
- [ ] `HelpSettings.tsx` — migrate HelpPanel content
- [ ] `HotkeyMapSettings.tsx` — read-only hotkey reference
- [ ] `TextSizeSettings.tsx` — wire existing fontSize (placeholder for separate sliders)

### 5.5 Settings Sub-pages (Placeholder)
- [ ] `SpeedReadingSettings.tsx` — mode toggle, focus marks, reading ruler, focus span, rhythm pauses (UI rendered, controls disabled)
- [ ] `LayoutSettings.tsx` — line/character/word spacing sliders (disabled)

### 5.6 URL-to-PDF Export
- [ ] Install pdfkit dependency
- [ ] Generate PDF on URL import with title/author/URL/date metadata
- [ ] Save to `<source-folder>/Saved Articles/` subfolder
- [ ] Exclude `Saved Articles/` from Chokidar watcher and `scanFolderAsync`
- [ ] Protect `Saved Articles/` docs in `syncLibraryWithFolder` from being discarded
- [ ] Transition library entry from `source: "url"` to `source: "folder"`
- [ ] Disable URL import when no source folder is selected
- [ ] Verify pdfkit→pdf-parse round-trip text fidelity
- [ ] Handle PDF generation errors gracefully (log, keep URL-sourced entry)

### 5.7 Schema Migrations
- [ ] Settings v3→v4: Add all new settings fields with defaults
- [ ] Settings v3→v4: Map existing `fontSize` to `focusTextSize`
- [ ] Settings v3→v4: Update all `fontSize` references across codebase to `focusTextSize`
- [ ] Library v1→v2: Add `lastReadAt` field to all docs (default null)
- [ ] Library v1→v2: Backfill `lastReadAt` from `modified` for docs with position > 0
- [ ] Update `lastReadAt` timestamp when opening a doc in the reader
- [ ] Add migration tests for both settings and library migrations
- [ ] Consolidate `readerMode` state with `readingMode` setting

### 5.8 Remove Legacy Appearance Panel
- [ ] Delete appearance panel section from LibraryView
- [ ] Remove HelpPanel.tsx (content fully migrated)
- [ ] Clean up any orphaned CSS classes

### Also: Check off Phase 1.5 rAF item
- Phase 1.5's unchecked "Consider replacing setInterval with requestAnimationFrame" was completed in Phase 3.1

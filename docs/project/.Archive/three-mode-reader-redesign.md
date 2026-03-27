# Reader Redesign: Page → Focus / Flow

**Date**: 2026-03-22 (v2 — replaces original three-mode-as-peers design)
**Status**: Design spec — pending ROADMAP.md integration

---

## Overview

Blurby's reading experience is restructured into a parent-child hierarchy. **Page** is the default reading view — a paginated, book-like experience with no word highlighting. **Focus** (RSVP) and **Flow** (scroll with highlighting) are speed-reading tools launched *from* Page. The user always returns to Page when pausing.

This replaces the old two-mode toggle (Focus ↔ Flow) and the earlier three-mode-as-peers draft.

---

## Architecture

```
┌──────────────────────────────────────────┐
│              Page View (default)          │
│  Paginated text · no highlight            │
│  Click word to set anchor · arrows page   │
│                                           │
│     ┌─────────┐       ┌─────────┐        │
│     │  Focus   │       │  Flow   │        │
│     │  (RSVP)  │       │ (Scroll)│        │
│     │  Space   │       │Shift+Spc│        │
│     └────┬─────┘       └────┬────┘        │
│          │ Space (pause)    │ Space (pause)│
│          └──────► Page ◄────┘             │
└──────────────────────────────────────────┘
```

---

## The Views

### Page (Default / Parent)
- **Component**: `PageReaderView.tsx` (new, derived from e-ink pagination)
- **Display**: Full text paginated into screen-sized pages. No word highlighting. Clean book-like reading.
- **Entry**: Opening any document from library lands here
- **Navigation**: `←`/`→` flip pages. Click left/right halves of screen also flips. Scroll wheel optional.
- **Word selection**: Click a word to highlight it (sets anchor point for Focus/Flow). `Shift+←`/`→`/`↑`/`↓` moves highlight between words on the page for precision selection.
- **Context menu**: Right-click a highlighted word opens submenu: "Define" or "Make Note"
- **Hotkeys on selected word**: `Shift+D` = define, `Shift+N` = make note
- **Launching sub-modes**: `Space` = enter Focus at highlighted word. `Shift+Space` = enter Flow at highlighted word.
- **Best for**: Passive reading, reviewing context, selecting passages, taking notes

### Focus (RSVP — Sub-mode)
- **Component**: `ReaderView.tsx` (existing)
- **Display**: Single word centered on screen, ORP highlighting, WPM gauge
- **Entry**: `Space` from Page view (starts at highlighted/anchor word)
- **"Play" means**: Advance through words one-at-a-time at WPM speed
- **Pause behavior**: `Space` pauses AND returns to Page view. The user sees the full page context around where they stopped. Pressing `Space` again re-enters Focus; `Shift+Space` enters Flow instead.
- **Navigation while playing**: `←`/`→` = rewind/forward words
- **Best for**: Speed reading, deep focus, distraction-free consumption

### Flow (Scroll + Highlight — Sub-mode)
- **Component**: `ScrollReaderView.tsx` with `FlowText` active (existing)
- **Display**: Full text in a scrollable view, word-level highlight walks through text at WPM
- **Entry**: `Shift+Space` from Page view (starts at highlighted/anchor word)
- **Pause behavior**: `Space` pauses AND returns to Page view (same as Focus)
- **Navigation while playing**: Scroll wheel adjusts view, click word to jump
- **Best for**: Following along while seeing full context, audiobook-style pacing

---

## User Workflow

```
1. Open app → Library (all readings)
2. Select document (Enter opens at last position) → Page view
3. Read pages manually (← → to flip)
4. Click a word to set highlight anchor
5. Space → Focus begins at that word (RSVP speed reading)
   - Space again → Pause → Back to Page (context review)
   - Space again → Resume Focus
   - Shift+Space → Switch to Flow instead
6. Shift+Space → Flow begins at that word (scroll highlighting)
   - Space → Pause → Back to Page
7. In Page: Shift+arrow keys to select words → Shift+D define, Shift+N note
8. Right-click word → "Define" or "Make Note" context menu
```

---

## Notes System

### Behavior
When a user highlights a word/phrase and presses `Shift+N` (or right-click → "Make Note"):
1. A small floating note input appears near the highlight (inline popover, not a modal)
2. User types their note and presses `Enter` to save (or `Escape` to cancel)
3. The note is saved to a running `.docx` file in the source folder

### UI Recommendations
- **Note input**: Floating popover anchored to the highlighted word. Minimal: single text field + "Save" button. Rounded corners, subtle shadow, matches current theme. Auto-focuses on open.
- **Visual indicator**: After saving, a small dot or underline appears on the word in Page view indicating a note exists. Hovering shows a tooltip preview of the note.
- **Note panel**: Accessible via `;` (highlights overlay) or menu flap. Shows all notes for current document with jump-to-page links.

### .docx Export Format
- **File location**: Source folder (same folder the document was imported from, or app data dir for URL imports)
- **File name**: `{Document Title} — Reading Notes.docx`
- **Structure**:
  ```
  TABLE OF CONTENTS (linked, auto-updated)

  ═══════════════════════════════════════

  ## [Document Title]

  "[Exact highlighted text]"
  Author Last, F. M. (Year). Title. Source. Page/Section reference.

  [User's note text]

  — March 22, 2026 at 3:45 PM

  ---

  "[Another highlight]"
  Author Last, F. M. (Year). Title. Source. Page/Section reference.

  [User's note text]

  — March 22, 2026 at 4:12 PM
  ```
- Notes from the same document grouped under one header
- Newest notes appended to the bottom
- APA citation derived from BlurbyDoc metadata (author, title, sourceUrl, publishedDate)
- Table of Contents at top links to each document header section

### UI Recommendations for Notes
- **Toast on save**: "Note saved to Reading Notes.docx" with "Open" action link
- **Docx creation**: Auto-created on first note if it doesn't exist. Appended on subsequent notes.
- **Access**: "Open Reading Notes" button in menu flap and stats panel (replaces "Export CSV")

---

## Reading Log (Excel Workbook)

### Template
See `docs/project/Reading_Log_Blurby_Template.xlsx` for exact structure. Blurby auto-creates this workbook on first reading session.

**File**: `Blurby Reading Log.xlsx` in source folder

### Tab 1 — "Reading Log" (named table: `ReadLog`)

One row per work (not per session — sessions increment within the row).

| # | Title | Lead Author Last Name | Lead Author First Name | Other Authors | Pub. Year | Publisher / Source | Edition / Vol. | DOI / URL | Work Type | Format | Pages | Pages Read | Date Started | Date Finished | Days to Complete | Sessions | Total Time (min) | Avg WPM | Completed? | % Read | Rating (1–5) | Notes / Key Takeaway |
|---|-------|----------------------|----------------------|---------------|-----------|-------------------|----------------|-----------|-----------|--------|-------|------------|-------------|--------------|-----------------|----------|-----------------|---------|------------|--------|-------------|---------------------|

**Auto-populated by Blurby** (on first read of a document):
- `#`: auto-increment
- `Title`: from BlurbyDoc.title
- `Lead Author Last Name` / `First Name`: parsed from BlurbyDoc.author
- `Pub. Year`: from BlurbyDoc.publishedDate
- `Publisher / Source`: from BlurbyDoc.sourceDomain or publisher metadata
- `DOI / URL`: from BlurbyDoc.sourceUrl
- `Work Type`: "Book" for EPUB/MOBI/PDF, "Article" for URL imports
- `Format`: always "Digital" (Blurby is a digital reader)
- `Pages`: estimated from word count ÷ ~250 words/page
- `Date Started`: timestamp of first reading session

**Updated incrementally by Blurby** (each session):
- `Sessions`: incremented by 1
- `Total Time (min)`: += session duration
- `Avg WPM`: session-weighted average (or final WPM of latest session)
- `% Read`: from reading progress
- `Date Finished`: set when progress reaches 100%

**Formula columns** (in the template):
- `Pages Read`: `=ROUNDUP(Pages × % Read, 0)`
- `Days to Complete`: `=IF(AND(Finished<>"", Started<>""), Finished - Started, "")`

**User fills manually**: Other Authors, Edition/Vol., Rating (1–5), Notes / Key Takeaway, Completed? override

### Tab 2 — "Dashboard"

All values are formulas referencing the `ReadLog` structured table. No hardcoded values.

**Volume & Pace**:
- Total Works Read, Works Read YTD, Total Pages Read, Avg Pages/Day, Avg Days/Book, Books/Month
- Most Pages Read, Fewest Pages Read, Longest Read (Days), Quickest Read (Days), Books/Year, Pages Read YTD

**Sessions & Speed**:
- Total Sessions, Avg Sessions/Book, Total Reading Time (hrs), Avg Time/Session (min), Weighted Avg WPM, Completed Time (hrs)
- Most Sessions (Single Work), Fewest Sessions, Fastest WPM, Slowest WPM, Avg Time/Book (min), Longest Read Time (hrs)

**Completion & Commitment**:
- Completion Rate, Abandonment Rate, Total DNFs, Avg % Read on DNF, DNF: Books, DNF: Articles

**Temporal Patterns**:
- Median Publication Year, Median Publication Lag (Yrs), Oldest Work (Pub Year), Newest Work (Pub Year), Reading Since, Reading Span (Months)

**Monthly Reading Volume**:
- Jan–Dec counts (COUNTIFS by month), year-selectable

**Diversity & Breadth**:
- Unique Authors, Most-Read Author Count, Repeat Author Rate, Books/Articles/Other counts
- Format breakdown: Print/Digital/Audio counts and percentages

**Quality & Preference**:
- Avg Rating, Highest/Lowest Rating, 5-Star Reads, Below 3-Star, Avg Rating (Completed)
- Rating Distribution: ★1 through ★5 counts

**Footer**: "Blurby. — Fast · Friendly · Focused"

### UI Recommendations
- In "Reading Statistics" panel, replace "Export CSV" with "Open Reading Log" button
- Opens the .xlsx file in the user's default spreadsheet app via `shell.openPath()`
- Auto-created from template on first reading session if it doesn't exist

---

## Search Split: `/` vs `Ctrl+K`

### `/` — Library Search
- Opens the same search bar overlay but scoped to **library items only**
- Searches: document titles, authors, source domains, tags, collections
- Results: document cards/rows, clickable to open
- Available from: Library view (and reader, navigates back to library with filter applied)

### `Ctrl+K` — Command Palette (Non-Library)
- Searches everything EXCEPT library documents:
  - Actions ("archive", "toggle theme", "open settings")
  - Settings (jump to any settings sub-page)
  - Chapters (within current document, if in reader)
  - Keyboard shortcuts (type a shortcut name to learn its key)
- Recent actions shown before typing

### Rationale
Library search is the most frequent action — it deserves the fastest key (`/`). Command palette is for power-user actions and discovery — `Ctrl+K` is the universal convention.

---

## Unified Bottom Bar

### `ReaderBottomBar.tsx` (shared component)

Rendered by `ReaderContainer.tsx`, always visible, identical layout across Page/Focus/Flow.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (progress bar)    │
├─────────────────────────────────────────────────────────────────────────┤
│ 300 wpm  ═══●═════════  │  A-  110%  A+  │  [Focus] [Flow]            │
├─────────────────────────────────────────────────────────────────────────┤
│ 12%   ← → page  ↑ ↓ speed  space focus  ⇧space flow  M menu   4h 2m │
└─────────────────────────────────────────────────────────────────────────┘
```

**Row 1**: Progress bar

**Row 2 — Controls**:
- WPM label + slider (always visible)
- Font size controls (A-, percentage, A+)
- Mode buttons: `Focus` and `Flow` — clicking enters that sub-mode. Current active mode highlighted with brand orange. In Page view, neither is highlighted (neutral state).
- Chapter nav (if chapters): `‹` chapter name `›` + dropdown
- E-ink refresh (if e-ink theme)

**Row 3 — Info line**:
- Left: percentage complete
- Center: context-sensitive hint text
- Right: time remaining

**Hint text per view:**
- Page: `← → page  ↑ ↓ speed  space focus  ⇧space flow  M menu`
- Focus: `← → rewind  ↑ ↓ speed  space pause  M menu`
- Flow: `← → seek  ↑ ↓ speed  space pause  M menu`

**Opacity**: Full in Page view. Fades to ~8% during Focus/Flow playback. E-ink: always full.

---

## Hotkey Changes Summary

| Key | Before | After | Context |
|-----|--------|-------|---------|
| `Space` (page) | N/A | **Enter Focus** at highlighted word | Page view |
| `Shift+Space` (page) | N/A | **Enter Flow** at highlighted word | Page view |
| `Space` (focus/flow) | Play/pause toggle | **Pause + return to Page** | Focus/Flow |
| `Shift+←`/`→`/`↑`/`↓` (page) | N/A | **Word-level navigation** for highlight selection | Page view |
| `Shift+D` (page) | N/A | **Define** selected word | Page view (word selected) |
| `Shift+N` (page) | N/A | **Make Note** on selected word/phrase | Page view (word selected) |
| `Tab` (reader) | Toggle menu flap | **Removed in reader** (Tab reserved for future use) | — |
| `M` (reader) | N/A | **Toggle menu flap** | All views |
| `Shift+F` (reader) | Toggle mode | **Removed** | Replaced by Space/Shift+Space |
| `/` (any) | Focus search (library only) | **Library search** (dedicated overlay) | Any view |
| `Ctrl+K` (any) | Command palette (everything) | **Command palette** (non-library items only) | Any view |
| `↑`/`↓` (focus/flow) | WPM (focus only) | **Adjust WPM** in both | Focus and Flow |
| `←`/`→` (page) | N/A | **Prev/next page** | Page view |

---

## Position Mapping Between Views

When entering/exiting sub-modes, position must map correctly:

- **Page → Focus**: Highlighted word (or first word on current page if none) → set `wordIndex`
- **Focus → Page (pause)**: Current `wordIndex` → find which page contains that word → show that page with word highlighted
- **Page → Flow**: Same as Focus — highlighted word → `flowWordIndex`, scroll to position
- **Flow → Page (pause)**: Current `flowWordIndex` → find page → show page with word highlighted
- **Focus ↔ Flow** (via Page): Always transitions through Page. User pauses Focus (lands on Page), then presses Shift+Space (enters Flow). Position preserved through the intermediate Page state.

---

## Implementation Notes

### New Components
| Component | Purpose |
|-----------|---------|
| `PageReaderView.tsx` | Paginated book-like view, word selection, note/define triggers |
| `ReaderBottomBar.tsx` | Unified controls across all views |

### Modified Components
| Component | Changes |
|-----------|---------|
| `ReaderContainer.tsx` | Page as default, Focus/Flow as sub-modes, three-way rendering, position mapping |
| `ReaderView.tsx` | Remove local bottom bar, remove "scroll mode" button. Space = pause + return to Page |
| `ScrollReaderView.tsx` | Remove local bottom bar, remove local Space handler, remove mode switch buttons. Space = pause + return to Page |
| `useKeyboardShortcuts.ts` | Remove mode gate (line 146), add Page-specific keys (Shift+arrows, Shift+D, Shift+N), M for menu, `/` for library search, Ctrl+K scoped to non-library |
| `src/types.ts` | `readingMode: "focus" \| "flow" \| "page"`, default `"page"` |

### Notes .docx Generation
- Use existing `pdfkit`-style approach but for docx (need `docx` npm package or similar)
- Main process IPC: `save-reading-note` channel receives `{ docId, highlight, note, citation }`
- Main process generates/appends to .docx in source folder
- APA citation built from BlurbyDoc metadata

### Reading Log .xlsx Generation
- Use existing xlsx infrastructure or `exceljs` npm package
- Main process IPC: `log-reading-session` channel receives `{ docId, duration, wordsRead, finalWpm, mode, chapter }`
- Appends row to Tab 1, recalculates Tab 2 dashboard formulas
- Session timer managed in renderer, sent on pause/exit

# UI-SWEEP-TRIAGE-1 — UI-SWEEP-1's NO-EFFECT and unreachable candidates, confirmed or dismissed

**Base:** the `--dir` x64 package of `97527896` (tree `4cda8d7c`) that UI-SWEEP-1 swept, at `C:\Projects\Blurby-artifacts\ui-sweep-1\build-97527896-x64`. Fresh scratch profiles, seeded with the bundled sample, `g0-converted-text.epub`, `Superhuman_Keyboard_Shortcuts.pdf` and `prose-basic.txt`.

**Method:** `scripts/ui-sweep/triage.mjs` reuses sweep.mjs's session, routes and plan. Each candidate is tested in five steps:
1. Enter its surface and run its preconditions (a state in which the control should act).
2. Take probe A, wait 1.2 s, and take probe B with no press. Anything that differs between A and B is noise and is ignored.
3. Press the control.
4. Take probe C.
5. The effect is what differs between B and C, outside the noise.

A candidate with no effect is run a second time.

The probe reads facets the sweep's digest cannot see:
- **Style:** the `:root` custom properties and computed style, and the reader iframe's body style and injected theme.
- **Settings:** the settings object, key by key, read through the renderer.
- **Zoom.**
- **Focus:** the active element, of any kind.
- **Scroll:** every scrolled element.
- **Reader:** the foliate location, the renderer page, the highlighted and cursor word indices, and the chapter label.
- **Library:** the focused and selected cards, and each document's archived, trashed and favourite flags.
- **Form values.**
- **Menu flap:** its `.open` state.
- **The sweep's DOM digest.**

Every DEFECT row was reproduced in two runs. The reader rows start in text: a TOC jump to INTRODUCTION in Page, then a switch to their mode. A TOC jump made inside Focus or Flow leaves the reader on the cover, where a seek has nothing to move.

**Positive control (Done-when 2):** PASS, before the candidates, on every run.
- "dark theme" from the light theme (the specification's example): `--bg` went from `#f5f3ef` to `#0f0f0f` in the strong probe.
- Library **J**: the strong probe saw `library.focused` change, and the sweep's digest changed in no field. This is the blind spot that made UI-SWEEP-1 report J as NO-EFFECT.

**Profile safety:**
- Every launch passes the profile preflight (`Session.profilePreflight` in sweep.mjs). Over the Node inspector, `app.getPath('userData')` must be the scratch profile, never `%APPDATA%\blurby`. The scratch `blurby-data/covers` must appear, and the live profile's hashes must not move during the run. Otherwise the driver exits 4.
- The live profile's library.json was unchanged in every run.
- settings.json changed once, at 03:24:45 on 2026-10-23. That was a v1.28.0 bisect build that ignored `BLURBY_USER_DATA_DIR`; see the memo's Lessons. No triage run touched it: each run's own before and after hashes are equal, and run 2 spans the incident.

## Totals

| Class | Candidates |
|---|---|
| WORKS (a sweep blind spot) | 42 |
| BY-DESIGN (nothing to do in the sweep's state; each acts from a state where it should) | 39 |
| DEFECT, Medium | 18 |
| DEFECT, Low | 5 |
| **All NO-EFFECT rows** | **104** |
| W1–W3 (code reads, below) | 3 |

Release-blocking: none, in this report's reading. The Focus and Flow navigation keys (#92–95, #100–103) went to Blurby.Brain on 2026-10-23. They regressed in the READER-MODE-SEPARATION-2 cutover (`3dd4b504`), so they predate the release line; Brain rules whether they gate the release.

## DEFECTs

| Group | Rows | Severity | What happens | Cause (`file:line`) |
|---|---|---|---|---|
| Focus seek | 92 | Medium | Ctrl+Right/Left move nothing. Paused, the cursor stays on word 187 (2 runs). Playing, the RSVP word never steps back (`26,` → `A.` → `D.`, 2 runs). | `src/reader/modes/focus/ModeRuntime.ts:749-753`: the seek moves `displayWordIndex` only, and the engine's next word overwrites it. The RSVP overlay renders only while playing (`ModeView.tsx:47`). |
| Focus sentence and paragraph | 93–95 | Medium | Ctrl+Up/Down and Shift+Left/Right do nothing (2 runs each, in text). The window receives each key, and ArrowUp, the control, changes the speed. | `src/reader/modes/focus/ModeRuntime.ts:746-764`: `handleCommand` has no `sentence` or `paragraph` case, so `default: return` drops them. Before `3dd4b504` they moved the shared highlighted word (`ReaderContainer.tsx`, `3dd4b504^:1137-1159`). |
| Flow line, sentence and paragraph | 100–103 | Medium | ArrowDown/Up, Ctrl+Up/Down and Shift+Up/Down do nothing (2 runs each). While playing, ArrowUp and ArrowDown never jump a line (`196,197` → `197..200`, 2 runs). | `src/reader/modes/flow/ModeRuntime.ts:916-931`: only `flow-line` is routed, and only while running (`:921`). `sentence` and `paragraph` are dropped, although `FlowScrollEngine.jumpToParagraph` exists (`helpers/FlowScrollEngine.ts:373`). |
| Chapter navigation | 73–77, 96–99 | Medium | Previous/Next chapter and Shift+Up/Down, P and ] do nothing on EPUBs in every mode (2 runs each). The bisect found it dead at v1.28.0 too. | `src/components/ReaderContainer.tsx:644-663`: chapters are rebuilt from `activeDoc.content`, which EPUB documents lack, so `chs.length < 2` returns. Pre-existing and not a release gate (Blurby.Brain); it goes to JUMP-LANDING-SAVE-1 (B). |
| Library Shift+E | 89 | Medium | Restore from archive never restores: 2 runs from the archived tab and 2 from G then A, with no flag change. | `src/components/LibraryContainer.tsx:289-298, :397`: the keyboard hook focuses into a list built from its own `activeFilter`, while LibraryView keeps a separate tab (`LibraryView.tsx:58`). The full path from G then A was not traced. |
| Library text-size keys | 79, 80, 87 | Low | Ctrl+=, Ctrl+− and Ctrl+0 do nothing in the library (2 runs each). | `src/hooks/useKeyboardShortcuts.ts:225-227` are in `useReaderKeys`, which returns unless view is reader (`:186`). The Hotkey Map lists them as Global. |
| Skip to content | 1, 5 | Low | Neither focus nor scroll moves (#1: 2 runs; #5: 1 run, focus left to body). | `src/App.tsx:147-148`: the link targets `#main-content`, the App wrapper that holds the whole page. `LibraryView.tsx:354` repeats the id. |

## W1–W3 (Done-when 4, read from the code)

| # | Candidate | Verdict | Evidence |
|---|---|---|---|
| W1 | Settings — TextSizeSettings is not routed | **Confirmed**, BY-DESIGN (dead file) | `TextSizeSettings` is imported nowhere in `src`. `SettingsMenu.tsx:25-35` lists no text-size item, and `LayoutSettings.tsx:13` says "Text Size (merged from TextSizeSettings)". The file is a deletion candidate. |
| W2 | Reader — QuickSettingsPopover has no working route | **Confirmed**, DEFECT Low | `useKeyboardShortcuts.ts:323` (`Ctrl` and `e.key === ","`) opens Settings before the Shift branch at `:330`. On a US layout Shift gives `e.key === "<"`, so neither branch matches. No button or palette entry opens the popover (`LibraryContainer.tsx:601, :734` render it only on `activeOverlay === "quickSettings"`). |
| W3 | Reader — NotePopover is never rendered | **Confirmed**, DEFECT Low | Page's Shift+N calls `handleMakeNote`, which dispatches `blurby:make-note` (`ReaderContainer.tsx:710`). No `addEventListener` for it exists in `src`, and `NotePopover` is imported nowhere. |

## Triage table

Columns: the row number in UI-SWEEP-1's bug candidates; surface; control; class (severity); the precondition run before the press (route steps omitted); what each run measured; why, with `file:line` for DEFECTs.

| # | Surface | Control | Class | Precondition | Measured (per run) | Why |
|---|---|---|---|---|---|---|
| 1 | Library — list view | Skip to content | **DEFECT** (Low) |  | nothing / nothing | the skip link's target id main-content is on the App wrapper (first of two elements with that id), which holds the whole page, so focus and scroll do not move — `src/App.tsx:147-148; src/components/LibraryView.tsx:354` |
| 2 | Library — list view | all (4) | **BY-DESIGN** | click favorites (0) (submit) | nothing / nothing / nothing / nothing / seen reader.progress, forms, dom.count | already the active tab in the sweep's state; from the favorites tab it switches the list |
| 3 | Library — list view | all types | **BY-DESIGN** | click articles (3) (submit) | seen active / seen reader.progress, dom.count, dom.text | already the active type filter; from "articles" it restores all types |
| 4 | Library — list view | Close menu | **BY-DESIGN** | steps | seen active / seen active, flapOpen | the flap stays mounted when closed (MenuFlap.tsx:136); pressed with the flap open, it closes it |
| 5 | Library — grid view | Skip to content | **DEFECT** (Low) |  | seen active | as #1 (grid view) — `src/App.tsx:147-148; src/components/LibraryView.tsx:354` |
| 6 | Library — grid view | all (3) | **BY-DESIGN** | click favorites (0) (submit) | nothing / nothing / nothing / nothing / seen forms, dom.count, dom.text | as #2 (grid view) |
| 7 | Library — grid view | all types | **BY-DESIGN** | click articles (3) (submit) | seen active / seen dom.count, dom.text | as #3 (grid view) |
| 8 | Library — grid view | Prose-basic, 97% read | **WORKS** |  | harness / harness / seen iframe, settings.readingMode, active | opens the book (settings.readingMode, reader location changed) |
| 9 | Library — AddEditPanel | Document title | **WORKS** |  | seen active | seen: active |
| 10 | Library — Add from URL panel | Article URL | **WORKS** |  | seen active | seen: active |
| 11 | Library — ImportConfirmDialog | Import title | **WORKS** |  | seen active | seen: active |
| 12 | Library — BugReportModal | Bug description | **WORKS** |  | seen active | seen: active |
| 13 | Library — CommandPalette | Command palette search | **WORKS** |  | seen active | seen: active |
| 14 | Library — HighlightsOverlay | Search highlights | **WORKS** |  | seen active | seen: active |
| 15 | Library — TagPickerOverlay | Filter or create tag... | **WORKS** |  | seen active | seen: active |
| 16 | Settings — menu (with HelpSettings inline) | 📐Reading Layout ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane (.settings-subpage appears) |
| 17 | Settings — menu (with HelpSettings inline) | ⚡Speed Reading ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane |
| 18 | Settings — menu (with HelpSettings inline) | 🎨Theme ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane |
| 19 | Settings — menu (with HelpSettings inline) | 📚Library Layout ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane |
| 20 | Settings — menu (with HelpSettings inline) | 🎯Reading Goals ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane |
| 21 | Settings — menu (with HelpSettings inline) | 🔌Connectors ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane |
| 22 | Settings — menu (with HelpSettings inline) | ☁️Cloud Sync ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane |
| 23 | Settings — menu (with HelpSettings inline) | ⌨️Hotkey Map ▸ | **WORKS** |  | seen dom.count, dom.text, dom.dialogs | opens the pane |
| 24 | Settings — LayoutSettings (Reading Layout) | Focus text size | **WORKS** |  | seen settings.focusTextSize, active, dom.text | seen: settings.focusTextSize, active, dom.text |
| 25 | Settings — LayoutSettings (Reading Layout) | Flow text size | **WORKS** |  | seen settings.flowTextSize, active, dom.text | seen: settings.flowTextSize, active, dom.text |
| 26 | Settings — LayoutSettings (Reading Layout) | Line spacing | **WORKS** |  | seen settings.layoutSpacing, active, dom.text | seen: settings.layoutSpacing, active, dom.text |
| 27 | Settings — LayoutSettings (Reading Layout) | Character spacing | **WORKS** |  | seen settings.layoutSpacing, active, dom.text | seen: settings.layoutSpacing, active, dom.text |
| 28 | Settings — LayoutSettings (Reading Layout) | Word spacing | **WORKS** |  | seen settings.layoutSpacing, active, dom.text | seen: settings.layoutSpacing, active, dom.text |
| 29 | Settings — LayoutSettings (Reading Layout) | Justified text | **WORKS** |  | seen active, settings.justifiedText | seen: active, settings.justifiedText |
| 30 | Settings — SpeedReadingSettings | Focus | **BY-DESIGN** | click Flow (submit) | seen settings.readingMode | already the selected mode; from the other tab it switches settings.readingMode |
| 31 | Settings — SpeedReadingSettings | Flow | **BY-DESIGN** | click Focus (submit) | seen settings.readingMode | as #30 |
| 32 | Settings — SpeedReadingSettings | Use legacy renderer | **WORKS** |  | seen active, settings.useLegacyRenderer | seen: active, settings.useLegacyRenderer |
| 33 | Settings — SpeedReadingSettings | Focus Marks | **WORKS** |  | seen settings.focusMarks, active | seen: settings.focusMarks, active |
| 34 | Settings — SpeedReadingSettings | Reading Ruler | **WORKS** |  | seen settings.readingRuler, active | seen: settings.readingRuler, active |
| 35 | Settings — SpeedReadingSettings | Focus span | **WORKS** |  | seen settings.focusSpan, active, dom.text | seen: settings.focusSpan, active, dom.text |
| 36 | Settings — SpeedReadingSettings | Flow mode words per highlight | **WORKS** |  | seen active, dom.text, settings.flowWordSpan | seen: active, dom.text, settings.flowWordSpan |
| 37 | Settings — SpeedReadingSettings | Flow cursor style | **WORKS** |  | seen active, settings.flowCursorStyle | seen: active, settings.flowCursorStyle |
| 38 | Settings — ThemeSettings | Toggle E-Ink display mode | **WORKS** |  | seen style.bodyHash, style.rootAttrs, settings.einkMode | seen: style.bodyHash, style.rootAttrs, settings.einkMode |
| 39 | Settings — ThemeSettings | blurby theme | **BY-DESIGN** | click light theme (submit) | seen style.vars.--accent, style.vars.--bg, style.rootHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 40 | Settings — ThemeSettings | dark theme | **BY-DESIGN** | click light theme (submit) | seen style.vars.--accent, style.vars.--bg, style.rootHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 41 | Settings — ThemeSettings | light theme | **BY-DESIGN** | click dark theme (submit) | seen style.vars.--accent, style.vars.--bg, style.rootHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 42 | Settings — ThemeSettings | eink theme | **BY-DESIGN** | click light theme (submit) | seen style.vars.--accent, style.vars.--bg, style.vars.--reader-font | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 43 | Settings — ThemeSettings | system theme | **BY-DESIGN** | click light theme (submit) | seen settings.theme | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 44 | Settings — ThemeSettings | Accent color: gold | **BY-DESIGN** | click Accent color: blurby blue (submit) | seen style.vars.--accent, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 45 | Settings — ThemeSettings | Accent color: blurby blue | **BY-DESIGN** | click Accent color: gold (submit) | seen style.vars.--accent, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 46 | Settings — ThemeSettings | Accent color: green | **BY-DESIGN** | click Accent color: gold (submit) | seen style.vars.--accent, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 47 | Settings — ThemeSettings | Accent color: blurby coral | **BY-DESIGN** | click Accent color: gold (submit) | seen style.vars.--accent, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 48 | Settings — ThemeSettings | Accent color: purple | **BY-DESIGN** | click Accent color: gold (submit) | seen style.vars.--accent, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 49 | Settings — ThemeSettings | Accent color: teal | **BY-DESIGN** | click Accent color: gold (submit) | seen style.vars.--accent, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 50 | Settings — ThemeSettings | Custom accent color | **BY-DESIGN** |  | seen active / seen active | focus moves to the colour input; the platform colour chooser opens outside the page, where neither detector can see it (unverified) |
| 51 | Settings — ThemeSettings | system | **BY-DESIGN** | click Georgia (submit) | seen style.vars.--reader-font, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 52 | Settings — ThemeSettings | Georgia | **BY-DESIGN** | click Merriweather (submit) | seen style.vars.--reader-font, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 53 | Settings — ThemeSettings | Merriweather | **BY-DESIGN** | click Georgia (submit) | seen style.vars.--reader-font, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 54 | Settings — ThemeSettings | Mono | **BY-DESIGN** | click Georgia (submit) | seen style.vars.--reader-font, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 55 | Settings — ThemeSettings | Literata | **BY-DESIGN** | click Georgia (submit) | seen style.vars.--reader-font, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 56 | Settings — ThemeSettings | OpenDyslexic | **BY-DESIGN** | click Georgia (submit) | seen style.vars.--reader-font, style.rootHash, style.bodyHash | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 57 | Settings — LibraryLayoutSettings | Default sort order | **WORKS** |  | seen active, settings.defaultSort | seen: active, settings.defaultSort |
| 58 | Settings — LibraryLayoutSettings | Grid View | **BY-DESIGN** | click List View (submit) | seen settings.viewMode, settings.defaultViewMode, reader.progress | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 59 | Settings — LibraryLayoutSettings | List View | **BY-DESIGN** | click Grid View (submit) | seen settings.viewMode, settings.defaultViewMode, reader.progress | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 60 | Settings — LibraryLayoutSettings | Small | **BY-DESIGN** | click Medium (submit) | seen settings.libraryCardSize | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 61 | Settings — LibraryLayoutSettings | Medium | **BY-DESIGN** | click Small (submit) | seen settings.libraryCardSize | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 62 | Settings — LibraryLayoutSettings | Large | **BY-DESIGN** | click Small (submit) | seen settings.libraryCardSize | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 63 | Settings — LibraryLayoutSettings | Compact | **BY-DESIGN** | click Cozy (submit) | seen settings.libraryCardSpacing | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 64 | Settings — LibraryLayoutSettings | Cozy | **BY-DESIGN** | click Compact (submit) | seen settings.libraryCardSpacing | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 65 | Settings — LibraryLayoutSettings | Roomy | **BY-DESIGN** | click Compact (submit) | seen settings.libraryCardSpacing | already the selected value in the sweep's state; from another value it changes (settings and styles) |
| 66 | Settings — LibraryLayoutSettings | Metadata Wizard | **WORKS** |  | seen active, dom.count, dom.text | seen: active, dom.count, dom.text |
| 67 | Settings — ReadingGoalsSettings | Goal type | **WORKS** |  | seen active / seen active, forms | seen: active, forms |
| 68 | Settings — ReadingGoalsSettings | New goal target | **WORKS** |  | seen active | seen: active |
| 69 | Settings — ReadingGoalsSettings | Add reading goal | **BY-DESIGN** | typed 5 | seen settings.readingGoals, active, reader.progress | disabled until a target is entered; with a target it adds the goal (settings.readingGoals) |
| 70 | Reader — Page | Previous page | **BY-DESIGN** | steps | seen libraryFlags.sample-meditations, active, reader.cfi | on the first page there is no previous page; after Next page it turns back |
| 71 | Reader — Page | Page mode | **BY-DESIGN** |  | harness / harness / seen active | already in Page mode |
| 72 | Reader — Focus | Focus mode | **BY-DESIGN** |  | harness / harness / nothing / seen active | already in Focus mode |
| 73 | Reader — Focus | Previous chapter | **DEFECT** (Medium) | steps, steps | nothing / nothing | chapters are rebuilt from activeDoc.content, which EPUB documents lack, so the handler returns (pre-existing at v1.28.0; JUMP-LANDING-SAVE-1 (B)) — `src/components/ReaderContainer.tsx:644-663` |
| 74 | Reader — Flow | Previous chapter | **DEFECT** (Medium) | steps, steps | nothing / nothing | as #73 — `src/components/ReaderContainer.tsx:644-663` |
| 75 | Reader — Flow | Next chapter | **DEFECT** (Medium) | steps | seen active | as #73 — `src/components/ReaderContainer.tsx:644-663` |
| 76 | Reader — Narrate | Previous chapter | **DEFECT** (Medium) | steps, steps | nothing / nothing | as #73 — `src/components/ReaderContainer.tsx:644-663` |
| 77 | Reader — Narrate | Next chapter | **DEFECT** (Medium) | steps | seen active | as #73 — `src/components/ReaderContainer.tsx:644-663` |
| 78 | Reader — HighlightsOverlay | Search highlights | **WORKS** |  | seen active | seen: active |
| 79 | Keyboard — Library | Font size up (Ctrl+=) [Global] | **DEFECT** (Low) |  | nothing / nothing | the text-size keys live in useReaderKeys, which returns unless view is reader; the Hotkey Map lists them as Global — `src/hooks/useKeyboardShortcuts.ts:186, :225-227` |
| 80 | Keyboard — Library | Font size down (Ctrl+-) [Global] | **DEFECT** (Low) |  | nothing / nothing | as #79 — `src/hooks/useKeyboardShortcuts.ts:186, :225-227` |
| 81 | Keyboard — Library | Navigate down (J) [Library] | **WORKS** |  | seen library.focused | seen: library.focused |
| 82 | Keyboard — Library | Navigate down (Down) [Library] | **WORKS** |  | seen library.focused | seen: library.focused |
| 83 | Keyboard — Library | Navigate up (K) [Library] | **WORKS** | key j, key j | seen library.focused | seen: library.focused |
| 84 | Keyboard — Library | Navigate up (Up) [Library] | **WORKS** | key j, key j | seen library.focused | seen: library.focused |
| 85 | Keyboard — Library | Jump to top (Ctrl+Up) [Library] | **WORKS** | key j, key j | seen library.focused | seen: library.focused |
| 86 | Keyboard — Library | Jump to bottom (Ctrl+Down) [Library] | **WORKS** |  | seen library.focused | seen: library.focused |
| 87 | Keyboard — Library | Font size reset (Ctrl+0) [Global] | **DEFECT** (Low) | key Ctrl+= | nothing / nothing | as #79 — `src/hooks/useKeyboardShortcuts.ts:186, :227` |
| 88 | Keyboard — Library | Archive (E) [Library] | **WORKS** | key j | seen libraryFlags.17927430279240omudg, reader.progress, library.focused | seen: libraryFlags.17927430279240omudg, reader.progress, library.focused |
| 89 | Keyboard — Library | Restore from archive (Shift+E) [Library] | **DEFECT** (Medium) | key j, key e, click archived (1) (submit), key j | nothing / nothing / nothing / nothing | Shift+E never restores: the keyboard hook focuses into its own activeFilter list, separate from LibraryView's tab; neither the archived tab nor G then A route restored (2 runs each) — `src/components/LibraryContainer.tsx:289-298, :397; src/components/LibraryView.tsx:58` |
| 90 | Keyboard — Library | Trash (#) [Library] | **WORKS** | key j | seen libraryFlags.17927430279240omudg, reader.progress, library.focused | seen: libraryFlags.17927430279240omudg, reader.progress, library.focused |
| 91 | Keyboard — Page | Smart import (Alt+V) [Global] | **BY-DESIGN** |  | harness / harness / nothing / nothing | smart import is library-only by design (useSmartImport returns unless view is library, useKeyboardShortcuts.ts:663); the Hotkey Map's Global label is loose |
| 92 | Keyboard — Focus | Seek +1 word (Ctrl+Right) [Reader — Focus] | **DEFECT** (Medium) | steps | nothing / nothing | seek moves displayWordIndex only, which the engine's next word overwrites; no move paused (2 runs) or playing (RSVP never steps back, 2 runs) — `src/reader/modes/focus/ModeRuntime.ts:746-764 (:749-753)` |
| 93 | Keyboard — Focus | Previous sentence (Ctrl+Up) [Reader — Focus] | **DEFECT** (Medium) | steps, key Ctrl+Down, key Ctrl+Down | nothing / nothing | Focus's runtime drops sentence commands (default: return); regression from the READER-MODE-SEPARATION-2 cutover 3dd4b504 — `src/reader/modes/focus/ModeRuntime.ts:746-764` |
| 94 | Keyboard — Focus | Next sentence (Ctrl+Down) [Reader — Focus] | **DEFECT** (Medium) | steps | nothing / nothing | as #93 — `src/reader/modes/focus/ModeRuntime.ts:746-764` |
| 95 | Keyboard — Focus | Next paragraph (Shift+Right) [Reader — Focus] | **DEFECT** (Medium) | steps | nothing / nothing | Focus's runtime drops paragraph commands; as #93 — `src/reader/modes/focus/ModeRuntime.ts:746-764` |
| 96 | Keyboard — Focus | Previous chapter (Shift+Up) [Reader — Focus] | **DEFECT** (Medium) | steps, key Shift+Down, key Shift+Down | nothing / nothing | as #73 (keyboard) — `src/components/ReaderContainer.tsx:644-663` |
| 97 | Keyboard — Focus | Next chapter (Shift+Down) [Reader — Focus] | **DEFECT** (Medium) | steps | nothing / nothing | as #73 — `src/components/ReaderContainer.tsx:644-663` |
| 98 | Keyboard — Focus | Previous chapter (P) [Reader — Focus] | **DEFECT** (Medium) | steps, key ], key ] | nothing / nothing | as #73 — `src/components/ReaderContainer.tsx:644-663` |
| 99 | Keyboard — Focus | Next chapter (]) [Reader — Focus] | **DEFECT** (Medium) | steps | nothing / nothing | as #73 — `src/components/ReaderContainer.tsx:644-663` |
| 100 | Keyboard — Flow | Next line (ArrowDown) [Reader — Flow] | **DEFECT** (Medium) | steps | nothing / nothing | paused it acts only while the engine runs; playing, ArrowUp and ArrowDown never jumped a line (2 runs) — `src/reader/modes/flow/ModeRuntime.ts:916-931 (:921); src/reader/modes/flow/helpers/FlowScrollEngine.ts:354` |
| 101 | Keyboard — Flow | Previous sentence (Ctrl+Up) [Reader — Flow] | **DEFECT** (Medium) | steps, key Ctrl+Down, key Ctrl+Down | nothing / nothing | Flow's runtime drops sentence commands; regression from 3dd4b504 — `src/reader/modes/flow/ModeRuntime.ts:916-931` |
| 102 | Keyboard — Flow | Next sentence (Ctrl+Down) [Reader — Flow] | **DEFECT** (Medium) | steps | nothing / nothing | as #101 — `src/reader/modes/flow/ModeRuntime.ts:916-931` |
| 103 | Keyboard — Flow | Previous paragraph (Shift+Up) [Reader — Flow] | **DEFECT** (Medium) | steps, key Shift+Down, key Shift+Down | harness / nothing / nothing | Flow's runtime drops paragraph commands although the engine has jumpToParagraph — `src/reader/modes/flow/ModeRuntime.ts:916-931; FlowScrollEngine.ts:373` |
| 104 | Keyboard — Overlays | Navigate results (Up) [Overlays] | **BY-DESIGN** | key Down, key Down | seen library.paletteFocused | at the first result Up has nothing to do; after Down it moves the focused result |
| W1 | Settings — TextSizeSettings | (unreachable) | **BY-DESIGN** (dead file) | — | code read | not routed; merged into LayoutSettings — `src/components/SettingsMenu.tsx:25-35; src/components/settings/LayoutSettings.tsx:13` |
| W2 | Reader — QuickSettingsPopover | (unreachable) | **DEFECT** (Low) | — | code read | Ctrl+Shift+, never reaches the Shift branch — `src/hooks/useKeyboardShortcuts.ts:323, :330` |
| W3 | Reader — NotePopover | (unreachable) | **DEFECT** (Low) | — | code read | blurby:make-note has no listener; NotePopover is never imported — `src/components/ReaderContainer.tsx:710` |

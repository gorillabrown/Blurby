# UI-SWEEP-1 — every control on every screen (packaged build of 97527896)

**Base:** a `--dir` x64 package of `97527896`, tree `4cda8d7c`. This is the release-fix sha after BOOK-TYPE-SCALE-1 merged. The specification names `47ae6e1f`; Blurby.Roadmap moved the base to the shipping tree on 2026-10-23. FOLIATE-OBSERVER-LEAK-1 is not merged at `97527896`, so BUG-187's flood is still present. The positive control was confirmed on this build before the run (a Flow-only run gave 25 rows) and again in this run (below). The title and the BUG-187 label were written by the harness before `--build` existed; they were corrected by hand to name the base this run used.

Method: each control is pressed over CDP at its box centre (or its key is sent), then classified from a DOM and state digest, uncaught exceptions, console errors and error.log growth (scripts/ui-sweep/sweep.mjs). Controls with destructive labels run last, each on a freshly re-seeded scratch profile. Escape resets after each press; when the surface is lost, the page reloads and the route is replayed.

## Totals

| Result | Controls |
|---|---|
| OK | 145 |
| ERROR | 97 |
| NO-EFFECT | 107 |
| SKIPPED-SAFETY | 10 |
| SKIPPED-DIALOG | 0 |
| UNREACHABLE | 10 |
| UNKNOWN | 0 |
| **All** | 369 |

Run time: 67.4 min. Surfaces: 57, of which unreachable: 12.

**Positive control:** PASS. 34 ERROR row(s) on Flow surfaces with error.log growth carrying the ResizeObserver message (BUG-187), e.g. "Speed 1.20x, 300 words per minute" on Reader — Flow

## Live profile

| File | sha256 before | sha256 after |
|---|---|---|
| library.json | `d4b884bdd7b866a729fea97e71a952850020beecb99595703aeb967a8cffbdf6` | `d4b884bdd7b866a729fea97e71a952850020beecb99595703aeb967a8cffbdf6` |
| settings.json | `1a4a40c6af6f627099e4bc0cd9effff60430990206980da310512858818debd4` | `1a4a40c6af6f627099e4bc0cd9effff60430990206980da310512858818debd4` |

Unchanged: yes.

## Bug candidates

**Known, reported once (BUG-187, ResizeObserver flood (FOLIATE-OBSERVER-LEAK-1 not merged at 97527896)):** 97 row(s) whose only error evidence matches `ResizeObserver loop`: Library — list view, Library — grid view, Reader — Page, Reader — Focus, Reader — Flow, Reader — Narrate, Reader — ReaderSpeedDialog (Focus), Reader — ReaderSpeedDialog (Flow), Keyboard — Library, Keyboard — Focus, Keyboard — Flow, Keyboard — Narrate. Those rows are not repeated below.

**Unreachable for a code reason (dead code or broken wiring):**

| # | Surface | Code reason | Suspected file |
|---|---|---|---|
| W1 | Settings — TextSizeSettings | not routed: TextSizeSettings.tsx is defined but no menu item opens it; its text-size sliders are part of LayoutSettings (Reading Layout) | src/components/settings/TextSizeSettings.tsx |
| W2 | Reader — QuickSettingsPopover | no working route: its shortcut Ctrl+Shift+, tests e.key === ',' but Shift makes e.key '<' on a US layout (useKeyboardShortcuts.ts), and no button or palette entry opens it. The keyboard pass presses Ctrl+Shift+, and records what happens (bug candidate) | src/components/QuickSettingsPopover.tsx, src/hooks/useKeyboardShortcuts.ts |
| W3 | Reader — NotePopover | never rendered: the blurby:make-note event (ReaderContainer.tsx) has no listener | src/components/NotePopover.tsx, src/components/ReaderContainer.tsx |

| # | Result | Surface | Control | Steps | Evidence | Suspected file |
|---|---|---|---|---|---|---|
| 1 | NO-EFFECT | Library — list view | Skip to content | start state (list view); press "Skip to content" | shots 0001-before.png, 0001-after.png | src/components/LibraryView.tsx, src/components/DocCard.tsx |
| 2 | NO-EFFECT | Library — list view | all (4) | start state (list view); press "all (4)" | shots 0011-before.png, 0011-after.png | src/components/LibraryView.tsx, src/components/DocCard.tsx |
| 3 | NO-EFFECT | Library — list view | all types | start state (list view); press "all types" | shots 0015-before.png, 0015-after.png | src/components/LibraryView.tsx, src/components/DocCard.tsx |
| 4 | NO-EFFECT | Library — list view | Close menu | start state (list view); press "Close menu" | shots 0032-before.png, 0032-after.png | src/components/LibraryView.tsx, src/components/DocCard.tsx |
| 5 | NO-EFFECT | Library — grid view | Skip to content | press "Grid view"; press "Skip to content" | shots 0033-before.png, 0033-after.png | src/components/LibraryView.tsx, src/components/DocGridCard.tsx |
| 6 | NO-EFFECT | Library — grid view | all (3) | press "Grid view"; press "all (3)" | shots 0043-before.png, 0043-after.png | src/components/LibraryView.tsx, src/components/DocGridCard.tsx |
| 7 | NO-EFFECT | Library — grid view | all types | press "Grid view"; press "all types" | shots 0047-before.png, 0047-after.png | src/components/LibraryView.tsx, src/components/DocGridCard.tsx |
| 8 | NO-EFFECT | Library — grid view | Prose-basic, 97% read | press "Grid view"; press "Prose-basic, 97% read" | shots 0060-before.png, 0060-after.png | src/components/LibraryView.tsx, src/components/DocGridCard.tsx |
| 9 | NO-EFFECT | Library — AddEditPanel | Document title | press "Add document"; press "Document title" | shots 0068-before.png, 0068-after.png | src/components/AddEditPanel.tsx |
| 10 | NO-EFFECT | Library — Add from URL panel | Article URL | press "Add from URL"; press "Article URL" | shots 0072-before.png, 0072-after.png | src/components/LibraryView.tsx |
| 11 | NO-EFFECT | Library — ImportConfirmDialog | Import title | put text on the clipboard, then Alt+V; press "Import title" | shots 0086-before.png, 0086-after.png | src/components/ImportConfirmDialog.tsx |
| 12 | NO-EFFECT | Library — BugReportModal | Bug description | Ctrl+Shift+B (packaged: saves under the scratch profile's blurby-data/bug-reports); press "Bug description" | shots 0089-before.png, 0089-after.png | src/components/BugReportModal.tsx |
| 13 | NO-EFFECT | Library — CommandPalette | Command palette search | Ctrl+K; press "Command palette search" | shots 0095-before.png, 0095-after.png | src/components/CommandPalette.tsx |
| 14 | NO-EFFECT | Library — HighlightsOverlay | Search highlights | ;; press "Search highlights" | shots 0097-before.png, 0097-after.png | src/components/HighlightsOverlay.tsx |
| 15 | NO-EFFECT | Library — TagPickerOverlay | Filter or create tag... | J, then L; press "Filter or create tag..." | shots 0098-before.png, 0098-after.png | src/components/TagPickerOverlay.tsx |
| 16 | NO-EFFECT | Settings — menu (with HelpSettings inline) | 📐Reading Layout ▸ | MenuFlap, then "Go to settings"; press "📐Reading Layout ▸" | shots 0101-before.png, 0101-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 17 | NO-EFFECT | Settings — menu (with HelpSettings inline) | ⚡Speed Reading ▸ | MenuFlap, then "Go to settings"; press "⚡Speed Reading ▸" | shots 0102-before.png, 0102-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 18 | NO-EFFECT | Settings — menu (with HelpSettings inline) | 🎨Theme ▸ | MenuFlap, then "Go to settings"; press "🎨Theme ▸" | shots 0103-before.png, 0103-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 19 | NO-EFFECT | Settings — menu (with HelpSettings inline) | 📚Library Layout ▸ | MenuFlap, then "Go to settings"; press "📚Library Layout ▸" | shots 0104-before.png, 0104-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 20 | NO-EFFECT | Settings — menu (with HelpSettings inline) | 🎯Reading Goals ▸ | MenuFlap, then "Go to settings"; press "🎯Reading Goals ▸" | shots 0105-before.png, 0105-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 21 | NO-EFFECT | Settings — menu (with HelpSettings inline) | 🔌Connectors ▸ | MenuFlap, then "Go to settings"; press "🔌Connectors ▸" | shots 0106-before.png, 0106-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 22 | NO-EFFECT | Settings — menu (with HelpSettings inline) | ☁️Cloud Sync ▸ | MenuFlap, then "Go to settings"; press "☁️Cloud Sync ▸" | shots 0107-before.png, 0107-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 23 | NO-EFFECT | Settings — menu (with HelpSettings inline) | ⌨️Hotkey Map ▸ | MenuFlap, then "Go to settings"; press "⌨️Hotkey Map ▸" | shots 0108-before.png, 0108-after.png | src/components/SettingsMenu.tsx, src/components/settings/HelpSettings.tsx |
| 24 | NO-EFFECT | Settings — LayoutSettings (Reading Layout) | Focus text size | Settings, then "Reading Layout"; press "Focus text size" | shots 0111-before.png, 0111-after.png | src/components/settings/LayoutSettings.tsx |
| 25 | NO-EFFECT | Settings — LayoutSettings (Reading Layout) | Flow text size | Settings, then "Reading Layout"; press "Flow text size" | shots 0112-before.png, 0112-after.png | src/components/settings/LayoutSettings.tsx |
| 26 | NO-EFFECT | Settings — LayoutSettings (Reading Layout) | Line spacing | Settings, then "Reading Layout"; press "Line spacing" | shots 0113-before.png, 0113-after.png | src/components/settings/LayoutSettings.tsx |
| 27 | NO-EFFECT | Settings — LayoutSettings (Reading Layout) | Character spacing | Settings, then "Reading Layout"; press "Character spacing" | shots 0114-before.png, 0114-after.png | src/components/settings/LayoutSettings.tsx |
| 28 | NO-EFFECT | Settings — LayoutSettings (Reading Layout) | Word spacing | Settings, then "Reading Layout"; press "Word spacing" | shots 0115-before.png, 0115-after.png | src/components/settings/LayoutSettings.tsx |
| 29 | NO-EFFECT | Settings — LayoutSettings (Reading Layout) | Justified text | Settings, then "Reading Layout"; press "Justified text" | shots 0116-before.png, 0116-after.png | src/components/settings/LayoutSettings.tsx |
| 30 | NO-EFFECT | Settings — SpeedReadingSettings | Focus | Settings, then "Speed Reading"; press "Focus" | shots 0119-before.png, 0119-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 31 | NO-EFFECT | Settings — SpeedReadingSettings | Flow | Settings, then "Speed Reading"; press "Flow" | shots 0120-before.png, 0120-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 32 | NO-EFFECT | Settings — SpeedReadingSettings | Use legacy renderer | Settings, then "Speed Reading"; press "Use legacy renderer" | shots 0121-before.png, 0121-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 33 | NO-EFFECT | Settings — SpeedReadingSettings | Focus Marks | Settings, then "Speed Reading"; press "Focus Marks" | shots 0122-before.png, 0122-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 34 | NO-EFFECT | Settings — SpeedReadingSettings | Reading Ruler | Settings, then "Speed Reading"; press "Reading Ruler" | shots 0123-before.png, 0123-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 35 | NO-EFFECT | Settings — SpeedReadingSettings | Focus span | Settings, then "Speed Reading"; press "Focus span" | shots 0124-before.png, 0124-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 36 | NO-EFFECT | Settings — SpeedReadingSettings | Flow mode words per highlight | Settings, then "Speed Reading"; press "Flow mode words per highlight" | shots 0125-before.png, 0125-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 37 | NO-EFFECT | Settings — SpeedReadingSettings | Flow cursor style | Settings, then "Speed Reading"; press "Flow cursor style" | shots 0126-before.png, 0126-after.png | src/components/settings/SpeedReadingSettings.tsx |
| 38 | NO-EFFECT | Settings — ThemeSettings | Toggle E-Ink display mode | Settings, then "Theme"; press "Toggle E-Ink display mode" | shots 0129-before.png, 0129-after.png | src/components/settings/ThemeSettings.tsx |
| 39 | NO-EFFECT | Settings — ThemeSettings | blurby theme | Settings, then "Theme"; press "blurby theme" | shots 0130-before.png, 0130-after.png | src/components/settings/ThemeSettings.tsx |
| 40 | NO-EFFECT | Settings — ThemeSettings | dark theme | Settings, then "Theme"; press "dark theme" | shots 0131-before.png, 0131-after.png | src/components/settings/ThemeSettings.tsx |
| 41 | NO-EFFECT | Settings — ThemeSettings | light theme | Settings, then "Theme"; press "light theme" | shots 0132-before.png, 0132-after.png | src/components/settings/ThemeSettings.tsx |
| 42 | NO-EFFECT | Settings — ThemeSettings | eink theme | Settings, then "Theme"; press "eink theme" | shots 0133-before.png, 0133-after.png | src/components/settings/ThemeSettings.tsx |
| 43 | NO-EFFECT | Settings — ThemeSettings | system theme | Settings, then "Theme"; press "system theme" | shots 0134-before.png, 0134-after.png | src/components/settings/ThemeSettings.tsx |
| 44 | NO-EFFECT | Settings — ThemeSettings | Accent color: gold | Settings, then "Theme"; press "Accent color: gold" | shots 0135-before.png, 0135-after.png | src/components/settings/ThemeSettings.tsx |
| 45 | NO-EFFECT | Settings — ThemeSettings | Accent color: blurby blue | Settings, then "Theme"; press "Accent color: blurby blue" | shots 0136-before.png, 0136-after.png | src/components/settings/ThemeSettings.tsx |
| 46 | NO-EFFECT | Settings — ThemeSettings | Accent color: green | Settings, then "Theme"; press "Accent color: green" | shots 0137-before.png, 0137-after.png | src/components/settings/ThemeSettings.tsx |
| 47 | NO-EFFECT | Settings — ThemeSettings | Accent color: blurby coral | Settings, then "Theme"; press "Accent color: blurby coral" | shots 0138-before.png, 0138-after.png | src/components/settings/ThemeSettings.tsx |
| 48 | NO-EFFECT | Settings — ThemeSettings | Accent color: purple | Settings, then "Theme"; press "Accent color: purple" | shots 0139-before.png, 0139-after.png | src/components/settings/ThemeSettings.tsx |
| 49 | NO-EFFECT | Settings — ThemeSettings | Accent color: teal | Settings, then "Theme"; press "Accent color: teal" | shots 0140-before.png, 0140-after.png | src/components/settings/ThemeSettings.tsx |
| 50 | NO-EFFECT | Settings — ThemeSettings | Custom accent color | Settings, then "Theme"; press "Custom accent color" | shots 0141-before.png, 0141-after.png | src/components/settings/ThemeSettings.tsx |
| 51 | NO-EFFECT | Settings — ThemeSettings | system | Settings, then "Theme"; press "system" | shots 0142-before.png, 0142-after.png | src/components/settings/ThemeSettings.tsx |
| 52 | NO-EFFECT | Settings — ThemeSettings | Georgia | Settings, then "Theme"; press "Georgia" | shots 0143-before.png, 0143-after.png | src/components/settings/ThemeSettings.tsx |
| 53 | NO-EFFECT | Settings — ThemeSettings | Merriweather | Settings, then "Theme"; press "Merriweather" | shots 0144-before.png, 0144-after.png | src/components/settings/ThemeSettings.tsx |
| 54 | NO-EFFECT | Settings — ThemeSettings | Mono | Settings, then "Theme"; press "Mono" | shots 0145-before.png, 0145-after.png | src/components/settings/ThemeSettings.tsx |
| 55 | NO-EFFECT | Settings — ThemeSettings | Literata | Settings, then "Theme"; press "Literata" | shots 0146-before.png, 0146-after.png | src/components/settings/ThemeSettings.tsx |
| 56 | NO-EFFECT | Settings — ThemeSettings | OpenDyslexic | Settings, then "Theme"; press "OpenDyslexic" | shots 0147-before.png, 0147-after.png | src/components/settings/ThemeSettings.tsx |
| 57 | NO-EFFECT | Settings — LibraryLayoutSettings | Default sort order | Settings, then "Library Layout"; press "Default sort order" | shots 0150-before.png, 0150-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 58 | NO-EFFECT | Settings — LibraryLayoutSettings | Grid View | Settings, then "Library Layout"; press "Grid View" | shots 0151-before.png, 0151-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 59 | NO-EFFECT | Settings — LibraryLayoutSettings | List View | Settings, then "Library Layout"; press "List View" | shots 0152-before.png, 0152-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 60 | NO-EFFECT | Settings — LibraryLayoutSettings | Small | Settings, then "Library Layout"; press "Small" | shots 0153-before.png, 0153-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 61 | NO-EFFECT | Settings — LibraryLayoutSettings | Medium | Settings, then "Library Layout"; press "Medium" | shots 0154-before.png, 0154-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 62 | NO-EFFECT | Settings — LibraryLayoutSettings | Large | Settings, then "Library Layout"; press "Large" | shots 0155-before.png, 0155-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 63 | NO-EFFECT | Settings — LibraryLayoutSettings | Compact | Settings, then "Library Layout"; press "Compact" | shots 0156-before.png, 0156-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 64 | NO-EFFECT | Settings — LibraryLayoutSettings | Cozy | Settings, then "Library Layout"; press "Cozy" | shots 0157-before.png, 0157-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 65 | NO-EFFECT | Settings — LibraryLayoutSettings | Roomy | Settings, then "Library Layout"; press "Roomy" | shots 0158-before.png, 0158-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 66 | NO-EFFECT | Settings — LibraryLayoutSettings | Metadata Wizard | Settings, then "Library Layout"; press "Metadata Wizard" | shots 0159-before.png, 0159-after.png | src/components/settings/LibraryLayoutSettings.tsx |
| 67 | NO-EFFECT | Settings — ReadingGoalsSettings | Goal type | Settings, then "Reading Goals"; press "Goal type" | shots 0162-before.png, 0162-after.png | src/components/settings/ReadingGoalsSettings.tsx |
| 68 | NO-EFFECT | Settings — ReadingGoalsSettings | New goal target | Settings, then "Reading Goals"; press "New goal target" | shots 0163-before.png, 0163-after.png | src/components/settings/ReadingGoalsSettings.tsx |
| 69 | NO-EFFECT | Settings — ReadingGoalsSettings | Add reading goal | Settings, then "Reading Goals"; press "Add reading goal" | shots 0164-before.png, 0164-after.png | src/components/settings/ReadingGoalsSettings.tsx |
| 70 | NO-EFFECT | Reader — Page | Previous page | open the sample book, Page (the default); press "Previous page" | shots 0171-before.png, 0171-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/page/ |
| 71 | NO-EFFECT | Reader — Page | Page mode | open the sample book, Page (the default); press "Page mode" | shots 0176-before.png, 0176-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/page/ |
| 72 | NO-EFFECT | Reader — Focus | Focus mode | open the sample book, press "Focus mode"; press "Focus mode" | shots 0188-before.png, 0188-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/focus/ |
| 73 | NO-EFFECT | Reader — Focus | Previous chapter | open the sample book, press "Focus mode"; press "Previous chapter" | shots 0191-before.png, 0191-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/focus/ |
| 74 | NO-EFFECT | Reader — Flow | Previous chapter | open the sample book, press "Flow mode"; press "Previous chapter" | shots 0203-before.png, 0203-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/flow/ |
| 75 | NO-EFFECT | Reader — Flow | Next chapter | open the sample book, press "Flow mode"; press "Next chapter" | shots 0205-before.png, 0205-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/flow/ |
| 76 | NO-EFFECT | Reader — Narrate | Previous chapter | open the sample book, press "Narrate mode"; press "Previous chapter" | shots 0214-before.png, 0214-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/narrate/ |
| 77 | NO-EFFECT | Reader — Narrate | Next chapter | open the sample book, press "Narrate mode"; press "Next chapter" | shots 0216-before.png, 0216-after.png | src/components/ReaderBottomBar.tsx, src/reader/modes/narrate/ |
| 78 | NO-EFFECT | Reader — HighlightsOverlay | Search highlights | Page, then ; (Escape also leaves the reader here, so the route is replayed); press "Search highlights" | shots 0222-before.png, 0222-after.png | src/components/HighlightsOverlay.tsx |
| 79 | NO-EFFECT | Keyboard — Library | Font size up (Ctrl+=) [Global] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Font size up (Ctrl+=) [Global]" | shots 0230-before.png, 0230-after.png | src/hooks/useKeyboardShortcuts.ts |
| 80 | NO-EFFECT | Keyboard — Library | Font size down (Ctrl+-) [Global] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Font size down (Ctrl+-) [Global]" | shots 0231-before.png, 0231-after.png | src/hooks/useKeyboardShortcuts.ts |
| 81 | NO-EFFECT | Keyboard — Library | Navigate down (J) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Navigate down (J) [Library]" | shots 0233-before.png, 0233-after.png | src/hooks/useKeyboardShortcuts.ts |
| 82 | NO-EFFECT | Keyboard — Library | Navigate down (Down) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Navigate down (Down) [Library]" | shots 0234-before.png, 0234-after.png | src/hooks/useKeyboardShortcuts.ts |
| 83 | NO-EFFECT | Keyboard — Library | Navigate up (K) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Navigate up (K) [Library]" | shots 0235-before.png, 0235-after.png | src/hooks/useKeyboardShortcuts.ts |
| 84 | NO-EFFECT | Keyboard — Library | Navigate up (Up) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Navigate up (Up) [Library]" | shots 0236-before.png, 0236-after.png | src/hooks/useKeyboardShortcuts.ts |
| 85 | NO-EFFECT | Keyboard — Library | Jump to top (Ctrl+Up) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Jump to top (Ctrl+Up) [Library]" | shots 0242-before.png, 0242-after.png | src/hooks/useKeyboardShortcuts.ts |
| 86 | NO-EFFECT | Keyboard — Library | Jump to bottom (Ctrl+Down) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Jump to bottom (Ctrl+Down) [Library]" | shots 0243-before.png, 0243-after.png | src/hooks/useKeyboardShortcuts.ts |
| 87 | NO-EFFECT | Keyboard — Library | Font size reset (Ctrl+0) [Global] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Font size reset (Ctrl+0) [Global]" | destructive pass, fresh scratch copy; shots 0350-before.png, 0350-after.png | src/hooks/useKeyboardShortcuts.ts |
| 88 | NO-EFFECT | Keyboard — Library | Archive (E) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Archive (E) [Library]" | destructive pass, fresh scratch copy; shots 0351-before.png, 0351-after.png | src/hooks/useKeyboardShortcuts.ts |
| 89 | NO-EFFECT | Keyboard — Library | Restore from archive (Shift+E) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Restore from archive (Shift+E) [Library]" | destructive pass, fresh scratch copy; shots 0352-before.png, 0352-after.png | src/hooks/useKeyboardShortcuts.ts |
| 90 | NO-EFFECT | Keyboard — Library | Trash (#) [Library] | library list view; Global, Library and Go-To rows of the Hotkey Map; press "Trash (#) [Library]" | destructive pass, fresh scratch copy; shots 0353-before.png, 0353-after.png | src/hooks/useKeyboardShortcuts.ts |
| 91 | NO-EFFECT | Keyboard — Page | Smart import (Alt+V) [Global] | sample book in Page; Global rows (the Hotkey Map lists no Page section); press "Smart import (Alt+V) [Global]" | shots 0271-before.png, 0271-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/page/ |
| 92 | NO-EFFECT | Keyboard — Focus | Seek +1 word (Ctrl+Right) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Seek +1 word (Ctrl+Right) [Reader — Focus]" | shots 0284-before.png, 0284-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 93 | NO-EFFECT | Keyboard — Focus | Previous sentence (Ctrl+Up) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Previous sentence (Ctrl+Up) [Reader — Focus]" | shots 0285-before.png, 0285-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 94 | NO-EFFECT | Keyboard — Focus | Next sentence (Ctrl+Down) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Next sentence (Ctrl+Down) [Reader — Focus]" | shots 0286-before.png, 0286-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 95 | NO-EFFECT | Keyboard — Focus | Next paragraph (Shift+Right) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Next paragraph (Shift+Right) [Reader — Focus]" | shots 0288-before.png, 0288-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 96 | NO-EFFECT | Keyboard — Focus | Previous chapter (Shift+Up) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Previous chapter (Shift+Up) [Reader — Focus]" | shots 0289-before.png, 0289-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 97 | NO-EFFECT | Keyboard — Focus | Next chapter (Shift+Down) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Next chapter (Shift+Down) [Reader — Focus]" | shots 0290-before.png, 0290-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 98 | NO-EFFECT | Keyboard — Focus | Previous chapter (P) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Previous chapter (P) [Reader — Focus]" | shots 0295-before.png, 0295-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 99 | NO-EFFECT | Keyboard — Focus | Next chapter (]) [Reader — Focus] | sample book in Focus; Global and Reader — Focus rows; press "Next chapter (]) [Reader — Focus]" | shots 0296-before.png, 0296-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/focus/ |
| 100 | NO-EFFECT | Keyboard — Flow | Next line (ArrowDown) [Reader — Flow] | sample book in Flow; Global and Reader — Flow rows; press "Next line (ArrowDown) [Reader — Flow]" | shots 0309-before.png, 0309-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/flow/ |
| 101 | NO-EFFECT | Keyboard — Flow | Previous sentence (Ctrl+Up) [Reader — Flow] | sample book in Flow; Global and Reader — Flow rows; press "Previous sentence (Ctrl+Up) [Reader — Flow]" | shots 0312-before.png, 0312-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/flow/ |
| 102 | NO-EFFECT | Keyboard — Flow | Next sentence (Ctrl+Down) [Reader — Flow] | sample book in Flow; Global and Reader — Flow rows; press "Next sentence (Ctrl+Down) [Reader — Flow]" | shots 0313-before.png, 0313-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/flow/ |
| 103 | NO-EFFECT | Keyboard — Flow | Previous paragraph (Shift+Up) [Reader — Flow] | sample book in Flow; Global and Reader — Flow rows; press "Previous paragraph (Shift+Up) [Reader — Flow]" | shots 0316-before.png, 0316-after.png | src/hooks/useKeyboardShortcuts.ts, src/reader/modes/flow/ |
| 104 | NO-EFFECT | Keyboard — Overlays | Navigate results (Up) [Overlays] | the CommandPalette open; the Overlays rows (the 1-5 snooze keys go to the snooze picker); press "Navigate results (Up) [Overlays]" | shots 0336-before.png, 0336-after.png | src/components/CommandPalette.tsx |

## Surfaces

### Library — list view

Reached: start state (list view)

Controls enumerated: 35. Walk: entered: (start state)

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — list view | Skip to content | `div#root > a` | NO-EFFECT | shots 0001-before.png, 0001-after.png |
| Library — list view | Open menu | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > button` | OK | changed: state; shots 0002-before.png, 0002-after.png |
| Library — list view | My reading list | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div > h1` | OK | changed: text,state,active; shots 0003-before.png, 0003-after.png |
| Library — list view | Search library | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(1)` | OK | changed: count,text,state,active; shots 0004-before.png, 0004-after.png |
| Library — list view | Grid view | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(2)` | OK | changed: count,text,state; shots 0005-before.png, 0005-after.png |
| Library — list view | Show reading statistics | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(3)` | OK | changed: count,text,state; shots 0006-before.png, 0006-after.png |
| Library — list view | Select folder | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > button` | OK | changed: count,text,state; shots 0007-before.png, 0007-after.png |
| Library — list view | Rescan folder | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(4)` | NO-EFFECT | disabled; shots 0008-before.png, 0008-after.png |
| Library — list view | Add from URL | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(5)` | OK | changed: count,text,state,active; shots 0009-before.png, 0009-after.png |
| Library — list view | Add document | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(6)` | OK | changed: count,text,state,active; shots 0010-before.png, 0010-after.png |
| Library — list view | all (4) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(1)` | NO-EFFECT | shots 0011-before.png, 0011-after.png |
| Library — list view | new (4) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(2)` | OK | changed: state; shots 0012-before.png, 0012-after.png |
| Library — list view | favorites (0) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(3)` | OK | changed: count,text,state; shots 0013-before.png, 0013-after.png |
| Library — list view | archived (0) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(4)` | OK | changed: count,text,state; shots 0014-before.png, 0014-after.png |
| Library — list view | all types | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(5)` | NO-EFFECT | shots 0015-before.png, 0015-after.png |
| Library — list view | articles (3) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(6)` | OK | changed: count,text,state; shots 0016-before.png, 0016-after.png |
| Library — list view | books (1) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(7)` | OK | changed: count,text,state; shots 0017-before.png, 0017-after.png |
| Library — list view | PDFs (0) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(8)` | OK | changed: count,text,state; shots 0018-before.png, 0018-after.png |
| Library — list view | Sort not started | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > select` | OK | changed: active; shots 0019-before.png, 0019-after.png |
| Library — list view | Meditations by Marcus Aurelius, 80479 words, 4h 28m | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div` | OK | changed: count,text,state,active,foliate; shots 0020-before.png, 0020-after.png |
| Library — list view | Add to favorites | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(2) > button:nth-of-type(1)` | ERROR | error.log +7452 B: [2026-10-23T06:15:29.737Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:15:29.754Z] Unhand; changed: count,text; shots 0021-before.png, 0021-after.png |
| Library — list view | Open in scroll reader | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(2) > button:nth-of-type(2)` | ERROR | error.log +6831 B: [2026-10-23T06:15:30.604Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:15:30.620Z] Unhand; changed: count,text,state,foliate; shots 0022-before.png, 0022-after.png |
| Library — list view | Open in new window | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(2) > button:nth-of-type(3)` | ERROR | error.log +65536 B: [2026-10-23T06:15:31.437Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:15:31.454Z] Unhand; opened window file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html#reader/sample-meditations (closed); shots 0023-before.png, 0023-after.png |
| Library — list view | Edit | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(2) > button:nth-of-type(4)` | OK | changed: count,text,state; shots 0024-before.png, 0024-after.png |
| Library — list view | g0-converted-text, 339 words, 1m | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(2) > div` | OK | changed: count,text,state; shots 0025-before.png, 0025-after.png |
| Library — list view | prose-basic, 38 words, <1m | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3) > div` | OK | changed: count,text,state,foliate; shots 0026-before.png, 0026-after.png |
| Library — list view | Superhuman_Keyboard_Shortcuts, 1052 words, 4m | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(4) > div` | UNREACHABLE | control not found after reset |
| Library — list view | Reading speed | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(1) > input` | UNREACHABLE | control not found after reset |
| Library — list view | start at login | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > label > input` | SKIPPED-SAFETY | label matches "start at login" |
| Library — list view | Backup library | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > button:nth-of-type(1)` | UNREACHABLE | control not found after reset |
| Library — list view | Restore library | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > button:nth-of-type(2)` | UNREACHABLE | control not found after reset |
| Library — list view | Go to settings | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button:nth-of-type(1)` | ERROR | error.log +65536 B: [2026-10-23T06:15:57.003Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:15:57.020Z] Unhand; shots 0031-before.png, 0031-after.png |
| Library — list view | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button:nth-of-type(2)` | NO-EFFECT | shots 0032-before.png, 0032-after.png |
| Library — list view | Archive document | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(2) > button:nth-of-type(5)` | OK | destructive pass, fresh scratch copy; changed: count,text,state; shots 0343-before.png, 0343-after.png |
| Library — list view | Delete | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(2) > button:nth-of-type(6)` | OK | destructive pass, fresh scratch copy; changed: count,text,state; shots 0344-before.png, 0344-after.png |

### Library — grid view

Reached: press "Grid view"

Controls enumerated: 29. Walk: entered: .view-toggle-btn

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — grid view | Skip to content | `div#root > a` | NO-EFFECT | shots 0033-before.png, 0033-after.png |
| Library — grid view | Open menu | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > button` | OK | changed: state; shots 0034-before.png, 0034-after.png |
| Library — grid view | My reading list | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div > h1` | OK | changed: text,state,active; shots 0035-before.png, 0035-after.png |
| Library — grid view | Search library | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(1)` | OK | changed: count,state,active; shots 0036-before.png, 0036-after.png |
| Library — grid view | List view | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(2)` | OK | changed: count,text,state; shots 0037-before.png, 0037-after.png |
| Library — grid view | Show reading statistics | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(3)` | OK | changed: count,text,state; shots 0038-before.png, 0038-after.png |
| Library — grid view | Select folder | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > button` | OK | changed: count,text,state; shots 0039-before.png, 0039-after.png |
| Library — grid view | Rescan folder | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(4)` | NO-EFFECT | disabled; shots 0040-before.png, 0040-after.png |
| Library — grid view | Add from URL | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(5)` | OK | changed: count,text,state,active; shots 0041-before.png, 0041-after.png |
| Library — grid view | Add document | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > button:nth-of-type(6)` | OK | changed: count,text,state,active; shots 0042-before.png, 0042-after.png |
| Library — grid view | all (3) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(1)` | NO-EFFECT | shots 0043-before.png, 0043-after.png |
| Library — grid view | new (3) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(2)` | OK | changed: state; shots 0044-before.png, 0044-after.png |
| Library — grid view | favorites (1) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(3)` | OK | changed: count,text,state; shots 0045-before.png, 0045-after.png |
| Library — grid view | archived (1) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(4)` | OK | changed: count,text,state; shots 0046-before.png, 0046-after.png |
| Library — grid view | all types | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(5)` | NO-EFFECT | shots 0047-before.png, 0047-after.png |
| Library — grid view | articles (2) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(6)` | OK | changed: count,text,state; covered by div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > button; shots 0048-before.png, 0048-after.png |
| Library — grid view | books (1) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(7)` | OK | changed: count,text,state; shots 0049-before.png, 0049-after.png |
| Library — grid view | PDFs (0) | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(8)` | OK | changed: count,text,state; shots 0050-before.png, 0050-after.png |
| Library — grid view | Sort not started | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > select` | OK | changed: active; shots 0051-before.png, 0051-after.png |
| Library — grid view | Meditations, by Marcus Aurelius | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(1)` | OK | changed: count,text,state,active,foliate; shots 0052-before.png, 0052-after.png |
| Library — grid view | g0-converted-text | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(2)` | UNREACHABLE | control not found after reset |
| Library — grid view | Superhuman_Keyboard_Shortcuts | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(3)` | UNREACHABLE | control not found after reset |
| Library — grid view | Reading speed | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(1) > input` | UNREACHABLE | control not found after reset |
| Library — grid view | start at login | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > label > input` | SKIPPED-SAFETY | label matches "start at login" |
| Library — grid view | Backup library | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > button:nth-of-type(1)` | UNREACHABLE | control not found after reset |
| Library — grid view | Restore library | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > div:nth-of-type(2) > button:nth-of-type(2)` | UNREACHABLE | control not found after reset |
| Library — grid view | Go to settings | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button:nth-of-type(1)` | ERROR | error.log +65536 B: [2026-10-23T06:18:46.520Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:18:46.537Z] Unhand; shots 0058-before.png, 0058-after.png |
| Library — grid view | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button:nth-of-type(2)` | ERROR | error.log +15318 B: [2026-10-23T06:19:08.054Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:19:08.070Z] Unhand; shots 0059-before.png, 0059-after.png |
| Library — grid view | Prose-basic, 97% read | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(2)` | NO-EFFECT | shots 0060-before.png, 0060-after.png |

### Library — grid card menu

Reached: grid view, right-click the sample card

Controls enumerated: 4. Walk: entered: .view-toggle-btn → eval

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — grid card menu | Edit Metadata | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(1) > button:nth-of-type(2)` | OK | changed: count,text,state,active; shots 0061-before.png, 0061-after.png |
| Library — grid card menu | Add to Queue | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(1) > button:nth-of-type(3)` | OK | changed: count,text,state; shots 0062-before.png, 0062-after.png |
| Library — grid card menu | Reset Progress | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(1) > button:nth-of-type(1)` | OK | destructive pass, fresh scratch copy; changed: count,text,state; shots 0345-before.png, 0345-after.png |
| Library — grid card menu | Delete | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(1) > button:nth-of-type(4)` | OK | destructive pass, fresh scratch copy; changed: count,text,state; shots 0346-before.png, 0346-after.png |

### Library — MenuFlap and ReadingQueue

Reached: press "Open menu"

Controls enumerated: 4. Walk: entered: .library-hamburger-btn → wait .menu-flap.open

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — MenuFlap and ReadingQueue | Go to settings | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button:nth-of-type(1)` | OK | changed: count,text,state; shots 0063-before.png, 0063-after.png |
| Library — MenuFlap and ReadingQueue | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button:nth-of-type(2)` | OK | changed: state; shots 0064-before.png, 0064-after.png |
| Library — MenuFlap and ReadingQueue | Meditations, 0% read | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(2)` | OK | changed: count,text,state,foliate; shots 0065-before.png, 0065-after.png |
| Library — MenuFlap and ReadingQueue | Prose-basic, 97% read | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(3)` | OK | changed: count,text,state,foliate; shots 0066-before.png, 0066-after.png |

### Library — folder button and RecentFolders

Reached: press "Select folder"

Controls enumerated: 1. Walk: entered: [aria-label="Select folder"]

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — folder button and RecentFolders | Browse for folder... | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > button` | OK | changed: count,text,state; shots 0067-before.png, 0067-after.png |

### Library — DeleteConfirmation

Reached: list view, press "Delete" on the .txt fixture card

**UNREACHABLE:** (step: .doc-card[data-doc-id="17927359998750r6gaz"] [aria-label="Delete"] not found)

### Library — AddEditPanel

Reached: press "Add document"

Controls enumerated: 4. Walk: entered: [aria-label="Add document"]

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — AddEditPanel | Document title | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > input` | NO-EFFECT | shots 0068-before.png, 0068-after.png |
| Library — AddEditPanel | Document content | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > textarea` | OK | changed: active; shots 0069-before.png, 0069-after.png |
| Library — AddEditPanel | cancel | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > button:nth-of-type(1)` | OK | changed: count,text,state,active; shots 0070-before.png, 0070-after.png |
| Library — AddEditPanel | add | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > button:nth-of-type(2)` | OK | changed: active; disabled; shots 0071-before.png, 0071-after.png |

### Library — Add from URL panel

Reached: press "Add from URL"

Controls enumerated: 3. Walk: entered: [aria-label="Add from URL"]

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — Add from URL panel | Article URL | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > input` | NO-EFFECT | shots 0072-before.png, 0072-after.png |
| Library — Add from URL panel | fetch | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > button:nth-of-type(1)` | SKIPPED-SAFETY | label matches "fetch" |
| Library — Add from URL panel | cancel | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > button:nth-of-type(2)` | OK | changed: count,text,state,active; shots 0073-before.png, 0073-after.png |

### Library — StatsPanel

Reached: press "Show reading statistics"

Controls enumerated: 3. Walk: entered: [aria-label="Show reading statistics"]

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — StatsPanel | Open Reading Log | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div > button:nth-of-type(2)` | SKIPPED-SAFETY | label matches "Open Reading Log" |
| Library — StatsPanel | close | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div > button:nth-of-type(3)` | OK | changed: count,text,state; shots 0074-before.png, 0074-after.png |
| Library — StatsPanel | Reset statistics | `div#root > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div > button:nth-of-type(1)` | OK | destructive pass, fresh scratch copy; changed: text; shots 0347-before.png, 0347-after.png |

### Library — MetadataWizard

Reached: Ctrl+Shift+M

Controls enumerated: 12. Walk: entered: key Ctrl+Shift+M

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — MetadataWizard | Close | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0075-before.png, 0075-after.png |
| Library — MetadataWizard | Accept changes for prose-basic | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(1) > td:nth-of-type(1) > input` | OK | changed: text,state; shots 0076-before.png, 0076-after.png |
| Library — MetadataWizard | Suggested title for prose-basic | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(1) > td:nth-of-type(3) > input` | OK | changed: active; shots 0077-before.png, 0077-after.png |
| Library — MetadataWizard | Suggested author for prose-basic | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(1) > td:nth-of-type(5) > input` | OK | changed: active; shots 0078-before.png, 0078-after.png |
| Library — MetadataWizard | Accept changes for Superhuman_Keyboard_Shortcuts | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(2) > td:nth-of-type(1) > input` | OK | changed: text,state; shots 0079-before.png, 0079-after.png |
| Library — MetadataWizard | Suggested title for Superhuman_Keyboard_Shortcuts | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(2) > td:nth-of-type(3) > input` | OK | changed: active; shots 0080-before.png, 0080-after.png |
| Library — MetadataWizard | Suggested author for Superhuman_Keyboard_Shortcuts | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(2) > td:nth-of-type(5) > input` | OK | changed: active; shots 0081-before.png, 0081-after.png |
| Library — MetadataWizard | Accept changes for g0-converted-text | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(3) > td:nth-of-type(1) > input` | OK | changed: text,state; shots 0082-before.png, 0082-after.png |
| Library — MetadataWizard | Suggested title for g0-converted-text | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(3) > td:nth-of-type(3) > input` | OK | changed: active; shots 0083-before.png, 0083-after.png |
| Library — MetadataWizard | Suggested author for g0-converted-text | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > table > tbody > tr:nth-of-type(3) > td:nth-of-type(5) > input` | OK | changed: active; shots 0084-before.png, 0084-after.png |
| Library — MetadataWizard | Cancel | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(3) > div > button:nth-of-type(1)` | OK | changed: count,text,state; shots 0085-before.png, 0085-after.png |
| Library — MetadataWizard | Apply 2 Changes | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(3) > div > button:nth-of-type(2)` | OK | destructive pass, fresh scratch copy; changed: count,text,state; shots 0348-before.png, 0348-after.png |

### Library — ImportConfirmDialog

Reached: put text on the clipboard, then Alt+V

Controls enumerated: 3. Walk: entered: eval → key Alt+V

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — ImportConfirmDialog | Import title | `div#root > div > div > div:nth-of-type(2) > div > input` | NO-EFFECT | shots 0086-before.png, 0086-after.png |
| Library — ImportConfirmDialog | cancel | `div#root > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > button:nth-of-type(1)` | OK | changed: count,text,state,active; shots 0087-before.png, 0087-after.png |
| Library — ImportConfirmDialog | import | `div#root > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > button:nth-of-type(2)` | OK | changed: count,text,state,active; shots 0088-before.png, 0088-after.png |

### Library — BugReportModal

Reached: Ctrl+Shift+B (packaged: saves under the scratch profile's blurby-data/bug-reports)

Controls enumerated: 6. Walk: entered: key Ctrl+Shift+B

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — BugReportModal | Bug description | `div#root > div > div:nth-of-type(2) > div > textarea` | NO-EFFECT | shots 0089-before.png, 0089-after.png |
| Library — BugReportModal | Cosmetic | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(3) > button:nth-of-type(1)` | OK | changed: state,active; shots 0090-before.png, 0090-after.png |
| Library — BugReportModal | Broken | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(3) > button:nth-of-type(2)` | OK | changed: active; shots 0091-before.png, 0091-after.png |
| Library — BugReportModal | Crash | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(3) > button:nth-of-type(3)` | OK | changed: state,active; shots 0092-before.png, 0092-after.png |
| Library — BugReportModal | Cancel | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(4) > button:nth-of-type(1)` | OK | changed: count,text,state,active; shots 0093-before.png, 0093-after.png |
| Library — BugReportModal | Save Report | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(4) > button:nth-of-type(2)` | OK | changed: count,text,state,active; shots 0094-before.png, 0094-after.png |

### Library — CommandPalette

Reached: Ctrl+K

Controls enumerated: 1. Walk: entered: key Ctrl+K

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — CommandPalette | Command palette search | `body > div:nth-of-type(4) > div > input` | NO-EFFECT | shots 0095-before.png, 0095-after.png |

### Library — ShortcutsOverlay

Reached: ?

Controls enumerated: 1. Walk: entered: key ?

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — ShortcutsOverlay | Close shortcuts overlay | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0096-before.png, 0096-after.png |

### Library — HighlightsOverlay

Reached: ;

Controls enumerated: 1. Walk: entered: key ;

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — HighlightsOverlay | Search highlights | `div#root > div > div:nth-of-type(2) > div > input` | NO-EFFECT | shots 0097-before.png, 0097-after.png |

### Library — SnoozePickerOverlay

Reached: J, then H

Controls enumerated: 0. Walk: entered: key j → key h

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|

### Library — TagPickerOverlay

Reached: J, then L

Controls enumerated: 1. Walk: entered: key j → key l

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — TagPickerOverlay | Filter or create tag... | `div#root > div > div:nth-of-type(2) > div > input` | NO-EFFECT | shots 0098-before.png, 0098-after.png |

### Library — GoToIndicator

Reached: G (it times out after 2 s; its key sequences are in Keyboard — Library)

**UNREACHABLE:** (step: waited for .goto-indicator)

### Library — FolderNoticeBanner

**UNREACHABLE:** shown only when the main process reports an unreachable source folder; the scratch profile has no source folder, and the sweep does not fake one

### Library — PairingBanner

**UNREACHABLE:** shown only on a pairing push from the Chrome extension over the local WebSocket; the sandbox pairs nothing

### Settings — menu (with HelpSettings inline)

Reached: MenuFlap, then "Go to settings"

Controls enumerated: 11. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — menu (with HelpSettings inline) | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0099-before.png, 0099-after.png |
| Settings — menu (with HelpSettings inline) | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0100-before.png, 0100-after.png |
| Settings — menu (with HelpSettings inline) | 📐Reading Layout ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(1)` | NO-EFFECT | shots 0101-before.png, 0101-after.png |
| Settings — menu (with HelpSettings inline) | ⚡Speed Reading ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(2)` | NO-EFFECT | shots 0102-before.png, 0102-after.png |
| Settings — menu (with HelpSettings inline) | 🎨Theme ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(3)` | NO-EFFECT | shots 0103-before.png, 0103-after.png |
| Settings — menu (with HelpSettings inline) | 📚Library Layout ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(4)` | NO-EFFECT | shots 0104-before.png, 0104-after.png |
| Settings — menu (with HelpSettings inline) | 🎯Reading Goals ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(5)` | NO-EFFECT | shots 0105-before.png, 0105-after.png |
| Settings — menu (with HelpSettings inline) | 🔌Connectors ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(6)` | NO-EFFECT | shots 0106-before.png, 0106-after.png |
| Settings — menu (with HelpSettings inline) | ☁️Cloud Sync ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(7)` | NO-EFFECT | shots 0107-before.png, 0107-after.png |
| Settings — menu (with HelpSettings inline) | ⌨️Hotkey Map ▸ | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(9)` | NO-EFFECT | shots 0108-before.png, 0108-after.png |
| Settings — menu (with HelpSettings inline) | Check for updates | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div:nth-of-type(11) > div:nth-of-type(5) > button` | SKIPPED-SAFETY | label matches "Check for updates" |

### Settings — HelpSettings

HelpSettings has no sub-page: it renders inline at the bottom of the settings menu (SettingsMenu.tsx), so its controls are rows of **Settings — menu (with HelpSettings inline)** above.

### Settings — LayoutSettings (Reading Layout)

Reached: Settings, then "Reading Layout"

Controls enumerated: 8. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — LayoutSettings (Reading Layout) | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0109-before.png, 0109-after.png |
| Settings — LayoutSettings (Reading Layout) | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0110-before.png, 0110-after.png |
| Settings — LayoutSettings (Reading Layout) | Focus text size | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > input:nth-of-type(1)` | NO-EFFECT | shots 0111-before.png, 0111-after.png |
| Settings — LayoutSettings (Reading Layout) | Flow text size | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > input:nth-of-type(2)` | NO-EFFECT | shots 0112-before.png, 0112-after.png |
| Settings — LayoutSettings (Reading Layout) | Line spacing | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > input:nth-of-type(3)` | NO-EFFECT | shots 0113-before.png, 0113-after.png |
| Settings — LayoutSettings (Reading Layout) | Character spacing | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > input:nth-of-type(4)` | NO-EFFECT | shots 0114-before.png, 0114-after.png |
| Settings — LayoutSettings (Reading Layout) | Word spacing | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > input:nth-of-type(5)` | NO-EFFECT | shots 0115-before.png, 0115-after.png |
| Settings — LayoutSettings (Reading Layout) | Justified text | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > label > input` | NO-EFFECT | shots 0116-before.png, 0116-after.png |

### Settings — TextSizeSettings

**UNREACHABLE:** not routed: TextSizeSettings.tsx is defined but no menu item opens it; its text-size sliders are part of LayoutSettings (Reading Layout)

### Settings — SpeedReadingSettings

Reached: Settings, then "Speed Reading"

Controls enumerated: 10. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — SpeedReadingSettings | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0117-before.png, 0117-after.png |
| Settings — SpeedReadingSettings | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0118-before.png, 0118-after.png |
| Settings — SpeedReadingSettings | Focus | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(2) > button:nth-of-type(1)` | NO-EFFECT | shots 0119-before.png, 0119-after.png |
| Settings — SpeedReadingSettings | Flow | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(2) > button:nth-of-type(2)` | NO-EFFECT | shots 0120-before.png, 0120-after.png |
| Settings — SpeedReadingSettings | Use legacy renderer | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > div` | NO-EFFECT | shots 0121-before.png, 0121-after.png |
| Settings — SpeedReadingSettings | Focus Marks | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(7) > div` | NO-EFFECT | shots 0122-before.png, 0122-after.png |
| Settings — SpeedReadingSettings | Reading Ruler | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > div` | NO-EFFECT | shots 0123-before.png, 0123-after.png |
| Settings — SpeedReadingSettings | Focus span | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > input:nth-of-type(1)` | NO-EFFECT | shots 0124-before.png, 0124-after.png |
| Settings — SpeedReadingSettings | Flow mode words per highlight | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > input:nth-of-type(2)` | NO-EFFECT | shots 0125-before.png, 0125-after.png |
| Settings — SpeedReadingSettings | Flow cursor style | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(13) > select` | NO-EFFECT | shots 0126-before.png, 0126-after.png |

### Settings — ThemeSettings

Reached: Settings, then "Theme"

Controls enumerated: 21. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — ThemeSettings | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0127-before.png, 0127-after.png |
| Settings — ThemeSettings | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0128-before.png, 0128-after.png |
| Settings — ThemeSettings | Toggle E-Ink display mode | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div` | NO-EFFECT | shots 0129-before.png, 0129-after.png |
| Settings — ThemeSettings | blurby theme | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > button:nth-of-type(1)` | NO-EFFECT | shots 0130-before.png, 0130-after.png |
| Settings — ThemeSettings | dark theme | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > button:nth-of-type(2)` | NO-EFFECT | shots 0131-before.png, 0131-after.png |
| Settings — ThemeSettings | light theme | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > button:nth-of-type(3)` | NO-EFFECT | shots 0132-before.png, 0132-after.png |
| Settings — ThemeSettings | eink theme | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > button:nth-of-type(4)` | NO-EFFECT | shots 0133-before.png, 0133-after.png |
| Settings — ThemeSettings | system theme | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(4) > button:nth-of-type(5)` | NO-EFFECT | shots 0134-before.png, 0134-after.png |
| Settings — ThemeSettings | Accent color: gold | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(6) > button:nth-of-type(1)` | NO-EFFECT | shots 0135-before.png, 0135-after.png |
| Settings — ThemeSettings | Accent color: blurby blue | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(6) > button:nth-of-type(2)` | NO-EFFECT | shots 0136-before.png, 0136-after.png |
| Settings — ThemeSettings | Accent color: green | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(6) > button:nth-of-type(3)` | NO-EFFECT | shots 0137-before.png, 0137-after.png |
| Settings — ThemeSettings | Accent color: blurby coral | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(6) > button:nth-of-type(4)` | NO-EFFECT | shots 0138-before.png, 0138-after.png |
| Settings — ThemeSettings | Accent color: purple | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(6) > button:nth-of-type(5)` | NO-EFFECT | shots 0139-before.png, 0139-after.png |
| Settings — ThemeSettings | Accent color: teal | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(6) > button:nth-of-type(6)` | NO-EFFECT | shots 0140-before.png, 0140-after.png |
| Settings — ThemeSettings | Custom accent color | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(6) > label > input` | NO-EFFECT | shots 0141-before.png, 0141-after.png |
| Settings — ThemeSettings | system | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > button:nth-of-type(1)` | NO-EFFECT | shots 0142-before.png, 0142-after.png |
| Settings — ThemeSettings | Georgia | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > button:nth-of-type(2)` | NO-EFFECT | shots 0143-before.png, 0143-after.png |
| Settings — ThemeSettings | Merriweather | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > button:nth-of-type(3)` | NO-EFFECT | shots 0144-before.png, 0144-after.png |
| Settings — ThemeSettings | Mono | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > button:nth-of-type(4)` | NO-EFFECT | shots 0145-before.png, 0145-after.png |
| Settings — ThemeSettings | Literata | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > button:nth-of-type(5)` | NO-EFFECT | shots 0146-before.png, 0146-after.png |
| Settings — ThemeSettings | OpenDyslexic | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > button:nth-of-type(6)` | NO-EFFECT | shots 0147-before.png, 0147-after.png |

### Settings — LibraryLayoutSettings

Reached: Settings, then "Library Layout"

Controls enumerated: 13. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — LibraryLayoutSettings | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0148-before.png, 0148-after.png |
| Settings — LibraryLayoutSettings | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0149-before.png, 0149-after.png |
| Settings — LibraryLayoutSettings | Default sort order | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > select` | NO-EFFECT | shots 0150-before.png, 0150-after.png |
| Settings — LibraryLayoutSettings | Grid View | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(3) > button:nth-of-type(1)` | NO-EFFECT | shots 0151-before.png, 0151-after.png |
| Settings — LibraryLayoutSettings | List View | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(3) > button:nth-of-type(2)` | NO-EFFECT | shots 0152-before.png, 0152-after.png |
| Settings — LibraryLayoutSettings | Small | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(5) > button:nth-of-type(1)` | NO-EFFECT | shots 0153-before.png, 0153-after.png |
| Settings — LibraryLayoutSettings | Medium | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(5) > button:nth-of-type(2)` | NO-EFFECT | shots 0154-before.png, 0154-after.png |
| Settings — LibraryLayoutSettings | Large | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(5) > button:nth-of-type(3)` | NO-EFFECT | shots 0155-before.png, 0155-after.png |
| Settings — LibraryLayoutSettings | Compact | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(7) > button:nth-of-type(1)` | NO-EFFECT | shots 0156-before.png, 0156-after.png |
| Settings — LibraryLayoutSettings | Cozy | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(7) > button:nth-of-type(2)` | NO-EFFECT | shots 0157-before.png, 0157-after.png |
| Settings — LibraryLayoutSettings | Roomy | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(7) > button:nth-of-type(3)` | NO-EFFECT | shots 0158-before.png, 0158-after.png |
| Settings — LibraryLayoutSettings | Metadata Wizard | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > button:nth-of-type(2)` | NO-EFFECT | shots 0159-before.png, 0159-after.png |
| Settings — LibraryLayoutSettings | Normalize Authors | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > button:nth-of-type(1)` | OK | destructive pass, fresh scratch copy; changed: text; shots 0349-before.png, 0349-after.png |

### Settings — ReadingGoalsSettings

Reached: Settings, then "Reading Goals"

Controls enumerated: 5. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — ReadingGoalsSettings | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0160-before.png, 0160-after.png |
| Settings — ReadingGoalsSettings | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0161-before.png, 0161-after.png |
| Settings — ReadingGoalsSettings | Goal type | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div > select` | NO-EFFECT | shots 0162-before.png, 0162-after.png |
| Settings — ReadingGoalsSettings | New goal target | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div > input` | NO-EFFECT | shots 0163-before.png, 0163-after.png |
| Settings — ReadingGoalsSettings | Add reading goal | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div > button` | NO-EFFECT | shots 0164-before.png, 0164-after.png |

### Library — GoalProgressWidget

Reached: rendered when a reading goal exists (Reading Goals' controls ran first)

**UNREACHABLE:** no reading goal exists in the scratch profile, so the widget does not render (step: waited for .goal-progress-widget)

### Settings — ConnectorsSettings

Reached: Settings, then "Connectors"

Controls enumerated: 5. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — ConnectorsSettings | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0165-before.png, 0165-after.png |
| Settings — ConnectorsSettings | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0166-before.png, 0166-after.png |
| Settings — ConnectorsSettings | New Code | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(3) > button` | SKIPPED-SAFETY | label matches "New Code" |
| Settings — ConnectorsSettings | Site URL to log in to | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > input` | SKIPPED-SAFETY | label matches "log in" |
| Settings — ConnectorsSettings | Log in | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(8) > button` | SKIPPED-SAFETY | label matches "Log in" |

### Settings — CloudSyncSettings

Reached: Settings, then "Cloud Sync"

Controls enumerated: 4. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — CloudSyncSettings | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0167-before.png, 0167-after.png |
| Settings — CloudSyncSettings | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0168-before.png, 0168-after.png |
| Settings — CloudSyncSettings | M Sign in with Microsoft | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(3) > button:nth-of-type(1)` | SKIPPED-SAFETY | label matches "Sign in" |
| Settings — CloudSyncSettings | G Sign in with Google | `body > div:nth-of-type(3) > div:nth-of-type(2) > div > div > div:nth-of-type(3) > button:nth-of-type(2)` | SKIPPED-SAFETY | label matches "Sign in" |

### Settings — HotkeyMapSettings

Reached: Settings, then "Hotkey Map"

Controls enumerated: 2. Walk: entered: .library-hamburger-btn → wait .menu-flap.open → .menu-flap-settings-btn → wait .settings-menu → eval → wait .settings-subpage

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Settings — HotkeyMapSettings | Back | `body > div:nth-of-type(3) > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0169-before.png, 0169-after.png |
| Settings — HotkeyMapSettings | Close menu | `body > div:nth-of-type(3) > div:nth-of-type(1) > div > button` | OK | changed: state; shots 0170-before.png, 0170-after.png |

### Reader — Page

Reached: open the sample book, Page (the default)

Controls enumerated: 12. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → wait .rm-page-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — Page | Previous page | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(1) > div > div > button:nth-of-type(1)` | NO-EFFECT | shots 0171-before.png, 0171-after.png |
| Reader — Page | Next page | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(1) > div > div > button:nth-of-type(2)` | OK | changed: count,text,state,foliate; shots 0172-before.png, 0172-after.png |
| Reader — Page | Decrease font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(1)` | OK | changed: count,text; shots 0173-before.png, 0173-after.png |
| Reader — Page | Increase font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(2)` | OK | changed: text; shots 0174-before.png, 0174-after.png |
| Reader — Page | Play | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button` | NO-EFFECT | disabled; shots 0175-before.png, 0175-after.png |
| Reader — Page | Page mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(1)` | NO-EFFECT | shots 0176-before.png, 0176-after.png |
| Reader — Page | Focus mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(2)` | ERROR | error.log +1242 B: [2026-10-23T06:47:01.292Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:01.305Z] Unhand; changed: count,text,state,foliate; shots 0177-before.png, 0177-after.png |
| Reader — Page | Flow mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)` | ERROR | error.log +6417 B: [2026-10-23T06:47:02.049Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:02.068Z] Unhand; changed: count,text,state,foliate; shots 0178-before.png, 0178-after.png |
| Reader — Page | Narrate mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(4)` | ERROR | error.log +12006 B: [2026-10-23T06:47:02.899Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:02.916Z] Unhand; changed: text,state,foliate; shots 0179-before.png, 0179-after.png |
| Reader — Page | Previous chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(1)` | OK | changed: count,text; shots 0180-before.png, 0180-after.png |
| Reader — Page | BOOKS | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(2)` | OK | changed: count,text,state; shots 0181-before.png, 0181-after.png |
| Reader — Page | Next chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(3)` | OK | changed: count,text; shots 0182-before.png, 0182-after.png |

### Reader — Focus

Reached: open the sample book, press "Focus mode"

Controls enumerated: 11. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Focus mode"] → wait .rm-focus-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — Focus | Speed 1.20x, 300 words per minute | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > button` | ERROR | error.log +7659 B: [2026-10-23T06:47:15.983Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:15.999Z] Unhand; changed: count,text,state; shots 0183-before.png, 0183-after.png |
| Reader — Focus | Decrease font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(1)` | ERROR | error.log +7245 B: [2026-10-23T06:47:16.866Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:16.882Z] Unhand; changed: text,foliate; shots 0184-before.png, 0184-after.png |
| Reader — Focus | Increase font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(2)` | ERROR | error.log +7659 B: [2026-10-23T06:47:21.916Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:21.932Z] Unhand; changed: text,foliate; shots 0185-before.png, 0185-after.png |
| Reader — Focus | Play | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button` | ERROR | error.log +7452 B: [2026-10-23T06:47:26.982Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:26.999Z] Unhand; changed: count,text,state; shots 0186-before.png, 0186-after.png |
| Reader — Focus | Page mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(1)` | ERROR | error.log +7245 B: [2026-10-23T06:47:32.049Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:47:32.066Z] Unhand; changed: text,state,foliate; shots 0187-before.png, 0187-after.png |
| Reader — Focus | Focus mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(2)` | NO-EFFECT | shots 0188-before.png, 0188-after.png |
| Reader — Focus | Flow mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(3)` | ERROR | error.log +7038 B: [2026-10-23T06:48:02.799Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:48:02.816Z] Unhand; changed: count,text,state; shots 0189-before.png, 0189-after.png |
| Reader — Focus | Narrate mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(4)` | ERROR | error.log +7452 B: [2026-10-23T06:48:07.849Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:48:07.866Z] Unhand; changed: text,state; shots 0190-before.png, 0190-after.png |
| Reader — Focus | Previous chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > button:nth-of-type(1)` | NO-EFFECT | shots 0191-before.png, 0191-after.png |
| Reader — Focus | INTRODUCTION | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > button:nth-of-type(2)` | ERROR | error.log +7452 B: [2026-10-23T06:48:38.650Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:48:38.666Z] Unhand; changed: count,text,state; shots 0192-before.png, 0192-after.png |
| Reader — Focus | Next chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > button:nth-of-type(3)` | ERROR | error.log +65536 B: [2026-10-23T06:48:39.516Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:48:39.533Z] Unhand; shots 0193-before.png, 0193-after.png |

### Reader — Flow

Reached: open the sample book, press "Flow mode"

Controls enumerated: 12. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Flow mode"] → wait .rm-flow-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — Flow | Speed 1.20x, 300 words per minute | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > button` | ERROR | error.log +7245 B: [2026-10-23T06:49:09.482Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:49:09.499Z] Unhand; changed: count,text,state; shots 0194-before.png, 0194-after.png |
| Reader — Flow | Decrease font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(1)` | ERROR | error.log +7452 B: [2026-10-23T06:49:10.333Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:49:10.349Z] Unhand; changed: text,foliate; shots 0195-before.png, 0195-after.png |
| Reader — Flow | Increase font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(2)` | ERROR | error.log +7452 B: [2026-10-23T06:49:15.383Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:49:15.399Z] Unhand; changed: text,foliate; shots 0196-before.png, 0196-after.png |
| Reader — Flow | Play | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button` | ERROR | error.log +6003 B: [2026-10-23T06:49:20.449Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:49:20.466Z] Unhand; changed: count,text,foliate; shots 0197-before.png, 0197-after.png |
| Reader — Flow | Page mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(1)` | ERROR | error.log +7452 B: [2026-10-23T06:49:27.217Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:49:27.233Z] Unhand; changed: count,text,state,foliate; shots 0198-before.png, 0198-after.png |
| Reader — Flow | Focus mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(2)` | ERROR | error.log +7245 B: [2026-10-23T06:49:32.249Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:49:32.266Z] Unhand; changed: count,text,state; shots 0199-before.png, 0199-after.png |
| Reader — Flow | Flow mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(3)` | ERROR | error.log +65536 B: [2026-10-23T06:49:37.315Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:49:37.332Z] Unhand; shots 0200-before.png, 0200-after.png |
| Reader — Flow | Narrate mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(4)` | ERROR | error.log +7452 B: [2026-10-23T06:50:03.115Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:50:03.132Z] Unhand; changed: count,text,state; shots 0201-before.png, 0201-after.png |
| Reader — Flow | Lines 5 | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > label > input` | ERROR | error.log +65536 B: [2026-10-23T06:50:08.182Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:50:08.199Z] Unhand; shots 0202-before.png, 0202-after.png |
| Reader — Flow | Previous chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(5) > button:nth-of-type(1)` | NO-EFFECT | shots 0203-before.png, 0203-after.png |
| Reader — Flow | INTRODUCTION | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(5) > button:nth-of-type(2)` | OK | changed: count,text,state; shots 0204-before.png, 0204-after.png |
| Reader — Flow | Next chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(5) > button:nth-of-type(3)` | NO-EFFECT | shots 0205-before.png, 0205-after.png |

### Reader — Narrate

Reached: open the sample book, press "Narrate mode"

Controls enumerated: 11. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Narrate mode"] → wait .rm-narrate-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — Narrate | Speed 1.00x narration rate | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > button` | ERROR | error.log +7452 B: [2026-10-23T06:51:30.515Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:51:30.532Z] Unhand; changed: count,text,state; shots 0206-before.png, 0206-after.png |
| Reader — Narrate | Decrease font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(1)` | ERROR | error.log +7452 B: [2026-10-23T06:51:31.382Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:51:31.399Z] Unhand; changed: text,foliate; shots 0207-before.png, 0207-after.png |
| Reader — Narrate | Increase font size | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(2)` | ERROR | error.log +7038 B: [2026-10-23T06:51:36.432Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:51:36.449Z] Unhand; changed: text,foliate; shots 0208-before.png, 0208-after.png |
| Reader — Narrate | Play | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > button` | ERROR | error.log +7245 B: [2026-10-23T06:51:41.499Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:51:41.515Z] Unhand; changed: count,text,foliate; shots 0209-before.png, 0209-after.png |
| Reader — Narrate | Page mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(1)` | ERROR | error.log +7245 B: [2026-10-23T06:51:46.749Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:51:46.766Z] Unhand; changed: text,state,foliate; shots 0210-before.png, 0210-after.png |
| Reader — Narrate | Focus mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(2)` | ERROR | error.log +7452 B: [2026-10-23T06:51:51.799Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:51:51.816Z] Unhand; changed: text,state; shots 0211-before.png, 0211-after.png |
| Reader — Narrate | Flow mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(3)` | ERROR | error.log +7245 B: [2026-10-23T06:51:56.849Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:51:56.865Z] Unhand; changed: count,text,state; shots 0212-before.png, 0212-after.png |
| Reader — Narrate | Narrate mode | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > button:nth-of-type(4)` | ERROR | error.log +52992 B: [2026-10-23T06:52:01.915Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:52:01.932Z] Unhand; shots 0213-before.png, 0213-after.png |
| Reader — Narrate | Previous chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > button:nth-of-type(1)` | NO-EFFECT | shots 0214-before.png, 0214-after.png |
| Reader — Narrate | INTRODUCTION | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > button:nth-of-type(2)` | OK | changed: count,text,state; shots 0215-before.png, 0215-after.png |
| Reader — Narrate | Next chapter | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(4) > button:nth-of-type(3)` | NO-EFFECT | shots 0216-before.png, 0216-after.png |

### Reader — ReaderSpeedDialog (Focus)

Reached: Focus, then the speed control

Controls enumerated: 2. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Focus mode"] → wait .rm-focus-root → .rbb-speed-trigger

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — ReaderSpeedDialog (Focus) | Focus speed | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div > input` | OK | changed: text,state; shots 0217-before.png, 0217-after.png |
| Reader — ReaderSpeedDialog (Focus) | Done | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div > button` | ERROR | error.log +7038 B: [2026-10-23T06:53:29.881Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:53:29.898Z] Unhand; changed: count,text,state; shots 0218-before.png, 0218-after.png |

### Reader — ReaderSpeedDialog (Flow)

Reached: Flow, then the speed control

Controls enumerated: 2. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Flow mode"] → wait .rm-flow-root → .rbb-speed-trigger

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — ReaderSpeedDialog (Flow) | Flow speed | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div > input` | ERROR | error.log +7452 B: [2026-10-23T06:53:39.782Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:53:39.798Z] Unhand; changed: text,state; shots 0219-before.png, 0219-after.png |
| Reader — ReaderSpeedDialog (Flow) | Done | `div#main-content > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div > button` | ERROR | error.log +7452 B: [2026-10-23T06:53:45.165Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:53:45.181Z] Unhand; changed: count,text,state; shots 0220-before.png, 0220-after.png |

### Reader — chapter dropdown

Reached: Page, then the chapter name

Controls enumerated: 0. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → wait .rm-page-root → .rbb-chapter-name

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|

### Reader — ShortcutsOverlay

Reached: Page, then ?

Controls enumerated: 1. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → wait .rm-page-root → key ?

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — ShortcutsOverlay | Close shortcuts overlay | `div#main-content > div:nth-of-type(2) > div > div:nth-of-type(1) > button` | OK | changed: count,text,state; shots 0221-before.png, 0221-after.png |

### Reader — HighlightsOverlay

Reached: Page, then ; (Escape also leaves the reader here, so the route is replayed)

Controls enumerated: 1. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → wait .rm-page-root → key ;

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Reader — HighlightsOverlay | Search highlights | `div#main-content > div:nth-of-type(2) > div > input` | NO-EFFECT | shots 0222-before.png, 0222-after.png |

### Reader — BacktrackPrompt

Reached: Page: next page ×4, previous ×2, then Escape

**UNREACHABLE:** (step: waited for .backtrack-prompt)

### Reader — ReturnToReadingPill

Reached: Flow, then scroll the text well away from the cursor

**UNREACHABLE:** scrolling Flow's text did not show the pill (step: waited for .return-to-reading-pill)

### Reader — QuickSettingsPopover

**UNREACHABLE:** no working route: its shortcut Ctrl+Shift+, tests e.key === ',' but Shift makes e.key '<' on a US layout (useKeyboardShortcuts.ts), and no button or palette entry opens it. The keyboard pass presses Ctrl+Shift+, and records what happens (bug candidate)

### Reader — HighlightMenu

**UNREACHABLE:** not reachable in the main window: the Focus view never sets highlightWord; it renders only in the standalone reader window (PausedTextView)

### Reader — DefinitionPopup

**UNREACHABLE:** not reachable in the main window (as HighlightMenu); its define action also fetches dictionaryapi.dev, which the denylist excludes

### Reader — NotePopover

**UNREACHABLE:** never rendered: the blurby:make-note event (ReaderContainer.tsx) has no listener

### Reader — GoToIndicator

GoToIndicator is library-only (the G sequences are library keys); see **Library — GoToIndicator**.

### Reader — SnoozePickerOverlay and TagPickerOverlay

Not rendered in the reader; they are library surfaces (see **Library — SnoozePickerOverlay** and **Library — TagPickerOverlay**).

### Library — OnboardingOverlay

Reached: clear firstRunCompleted on the scratch profile, reload

Controls enumerated: 2. Walk: entered: eval

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Library — OnboardingOverlay | Get Started | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > button:nth-of-type(1)` | OK | changed: count,text,state; shots 0223-before.png, 0223-after.png |
| Library — OnboardingOverlay | Skip tour | `div#root > div > div:nth-of-type(2) > div > div:nth-of-type(2) > button:nth-of-type(2)` | OK | changed: count,text,state; shots 0224-before.png, 0224-after.png |

### Keyboard — Library

Reached: library list view; Global, Library and Go-To rows of the Hotkey Map

Controls enumerated: 44. Walk: entered: (start state)

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Keyboard — Library | Command palette (Ctrl+K) [Global] | `key Ctrl+K` | OK | changed: count,text,state,active; shots 0225-before.png, 0225-after.png |
| Keyboard — Library | Open settings (Ctrl+,) [Global] | `key Ctrl+,` | OK | changed: state; shots 0226-before.png, 0226-after.png |
| Keyboard — Library | Quick settings (Ctrl+Shift+,) [Global] | `key Ctrl+Shift+,` | OK | changed: state; shots 0227-before.png, 0227-after.png |
| Keyboard — Library | Shortcuts overlay (?) [Global] | `key ?` | OK | changed: count,text,state; shots 0228-before.png, 0228-after.png |
| Keyboard — Library | Highlights overlay (;) [Global] | `key ;` | OK | changed: count,text,state,active; shots 0229-before.png, 0229-after.png |
| Keyboard — Library | Font size up (Ctrl+=) [Global] | `key Ctrl+=` | NO-EFFECT | shots 0230-before.png, 0230-after.png |
| Keyboard — Library | Font size down (Ctrl+-) [Global] | `key Ctrl+-` | NO-EFFECT | shots 0231-before.png, 0231-after.png |
| Keyboard — Library | Smart import (Alt+V) [Global] | `key Alt+V` | OK | changed: count,text,state,active; shots 0232-before.png, 0232-after.png |
| Keyboard — Library | Navigate down (J) [Library] | `key J` | NO-EFFECT | shots 0233-before.png, 0233-after.png |
| Keyboard — Library | Navigate down (Down) [Library] | `key Down` | NO-EFFECT | shots 0234-before.png, 0234-after.png |
| Keyboard — Library | Navigate up (K) [Library] | `key K` | NO-EFFECT | shots 0235-before.png, 0235-after.png |
| Keyboard — Library | Navigate up (Up) [Library] | `key Up` | NO-EFFECT | shots 0236-before.png, 0236-after.png |
| Keyboard — Library | Open document (Enter) [Library] | `key Enter` | OK | changed: count,text,state; shots 0237-before.png, 0237-after.png |
| Keyboard — Library | Toggle select (X) [Library] | `key X` | OK | changed: state; shots 0238-before.png, 0238-after.png |
| Keyboard — Library | Select all (Ctrl+Shift+A) [Library] | `key Ctrl+Shift+A` | OK | changed: count,state; shots 0239-before.png, 0239-after.png |
| Keyboard — Library | Focus search (/) [Library] | `key /` | OK | changed: count,text,state,active; shots 0240-before.png, 0240-after.png |
| Keyboard — Library | Cycle focus zones (Tab) [Library] | `key Tab` | OK | changed: state; shots 0241-before.png, 0241-after.png |
| Keyboard — Library | Jump to top (Ctrl+Up) [Library] | `key Ctrl+Up` | NO-EFFECT | shots 0242-before.png, 0242-after.png |
| Keyboard — Library | Jump to bottom (Ctrl+Down) [Library] | `key Ctrl+Down` | NO-EFFECT | shots 0243-before.png, 0243-after.png |
| Keyboard — Library | Star / Favorite (S) [Library] | `key S` | OK | changed: count,text; shots 0244-before.png, 0244-after.png |
| Keyboard — Library | Toggle unread (U) [Library] | `key U` | OK | changed: count,text; shots 0245-before.png, 0245-after.png |
| Keyboard — Library | Resume reading (R) [Library] | `key R` | OK | changed: count,text,state,foliate; shots 0246-before.png, 0246-after.png |
| Keyboard — Library | Open source (O) [Library] | `key O` | ERROR | error.log +8694 B: [2026-10-23T06:59:20.814Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:20.831Z] Unhand; changed: count,text,state; shots 0247-before.png, 0247-after.png |
| Keyboard — Library | Snooze (H) [Library] | `key H` | ERROR | error.log +8487 B: [2026-10-23T06:59:21.781Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:21.798Z] Unhand; changed: count,text,state; shots 0248-before.png, 0248-after.png |
| Keyboard — Library | Add tag (L) [Library] | `key L` | ERROR | error.log +8694 B: [2026-10-23T06:59:22.731Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:22.747Z] Unhand; changed: count,text,state,active; shots 0249-before.png, 0249-after.png |
| Keyboard — Library | Move to collection (V) [Library] | `key V` | ERROR | error.log +8694 B: [2026-10-23T06:59:23.697Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:23.714Z] Unhand; changed: count,text,state,active; shots 0250-before.png, 0250-after.png |
| Keyboard — Library | Undo last action (Z) [Library] | `key Z` | ERROR | error.log +65536 B: [2026-10-23T06:59:24.664Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:24.681Z] Unhand; shots 0251-before.png, 0251-after.png |
| Keyboard — Library | Filter: unread (Shift+U) [Library] | `key Shift+U` | ERROR | error.log +8487 B: [2026-10-23T06:59:46.314Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:46.331Z] Unhand; changed: count,text,state; shots 0252-before.png, 0252-after.png |
| Keyboard — Library | Filter: starred (Shift+S) [Library] | `key Shift+S` | ERROR | error.log +8487 B: [2026-10-23T06:59:47.264Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:47.281Z] Unhand; changed: count,text,state; shots 0253-before.png, 0253-after.png |
| Keyboard — Library | Filter: reading (Shift+R) [Library] | `key Shift+R` | ERROR | error.log +8280 B: [2026-10-23T06:59:48.214Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:48.231Z] Unhand; changed: count,text,state; shots 0254-before.png, 0254-after.png |
| Keyboard — Library | Filter: imported today (Shift+I) [Library] | `key Shift+I` | ERROR | error.log +8487 B: [2026-10-23T06:59:49.164Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:49.181Z] Unhand; changed: count,text,state; shots 0255-before.png, 0255-after.png |
| Keyboard — Library | Library (G then L) [Go-To Sequences (G then ...)] | `key G then L` | ERROR | error.log +65536 B: [2026-10-23T06:59:50.114Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T06:59:50.131Z] Unhand; shots 0256-before.png, 0256-after.png |
| Keyboard — Library | Favorites (G then F) [Go-To Sequences (G then ...)] | `key G then F` | OK | changed: count,text,state; shots 0257-before.png, 0257-after.png |
| Keyboard — Library | Queue (G then Q) [Go-To Sequences (G then ...)] | `key G then Q` | OK | changed: count,text,state; shots 0258-before.png, 0258-after.png |
| Keyboard — Library | Recent (G then R) [Go-To Sequences (G then ...)] | `key G then R` | OK | changed: count,text,state; shots 0259-before.png, 0259-after.png |
| Keyboard — Library | Stats (G then S) [Go-To Sequences (G then ...)] | `key G then S` | OK | changed: state; shots 0260-before.png, 0260-after.png |
| Keyboard — Library | Snoozed (G then H) [Go-To Sequences (G then ...)] | `key G then H` | OK | changed: count,text,state; shots 0261-before.png, 0261-after.png |
| Keyboard — Library | Collections (G then C) [Go-To Sequences (G then ...)] | `key G then C` | OK | changed: count,text,state; shots 0262-before.png, 0262-after.png |
| Keyboard — Library | Toggle menu (G then M) [Go-To Sequences (G then ...)] | `key G then M` | OK | changed: state; shots 0263-before.png, 0263-after.png |
| Keyboard — Library | Font size reset (Ctrl+0) [Global] | `key Ctrl+0` | NO-EFFECT | destructive pass, fresh scratch copy; shots 0350-before.png, 0350-after.png |
| Keyboard — Library | Archive (E) [Library] | `key E` | NO-EFFECT | destructive pass, fresh scratch copy; shots 0351-before.png, 0351-after.png |
| Keyboard — Library | Restore from archive (Shift+E) [Library] | `key Shift+E` | NO-EFFECT | destructive pass, fresh scratch copy; shots 0352-before.png, 0352-after.png |
| Keyboard — Library | Trash (#) [Library] | `key #` | NO-EFFECT | destructive pass, fresh scratch copy; shots 0353-before.png, 0353-after.png |
| Keyboard — Library | Archive (G then A) [Go-To Sequences (G then ...)] | `key G then A` | OK | destructive pass, fresh scratch copy; changed: count,text,state; shots 0354-before.png, 0354-after.png |

### Keyboard — Page

Reached: sample book in Page; Global rows (the Hotkey Map lists no Page section)

Controls enumerated: 9. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → wait .rm-page-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Keyboard — Page | Command palette (Ctrl+K) [Global] | `key Ctrl+K` | OK | changed: count,text,state,active; shots 0264-before.png, 0264-after.png |
| Keyboard — Page | Open settings (Ctrl+,) [Global] | `key Ctrl+,` | OK | changed: state; shots 0265-before.png, 0265-after.png |
| Keyboard — Page | Quick settings (Ctrl+Shift+,) [Global] | `key Ctrl+Shift+,` | OK | changed: state; shots 0266-before.png, 0266-after.png |
| Keyboard — Page | Shortcuts overlay (?) [Global] | `key ?` | OK | changed: count,text,state; shots 0267-before.png, 0267-after.png |
| Keyboard — Page | Highlights overlay (;) [Global] | `key ;` | OK | changed: count,text,state,active; shots 0268-before.png, 0268-after.png |
| Keyboard — Page | Font size up (Ctrl+=) [Global] | `key Ctrl+=` | OK | changed: text; shots 0269-before.png, 0269-after.png |
| Keyboard — Page | Font size down (Ctrl+-) [Global] | `key Ctrl+-` | OK | changed: text; shots 0270-before.png, 0270-after.png |
| Keyboard — Page | Smart import (Alt+V) [Global] | `key Alt+V` | NO-EFFECT | shots 0271-before.png, 0271-after.png |
| Keyboard — Page | Font size reset (Ctrl+0) [Global] | `key Ctrl+0` | OK | destructive pass, fresh scratch copy; changed: text; shots 0355-before.png, 0355-after.png |

### Keyboard — Focus

Reached: sample book in Focus; Global and Reader — Focus rows

Controls enumerated: 28. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Focus mode"] → wait .rm-focus-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Keyboard — Focus | Command palette (Ctrl+K) [Global] | `key Ctrl+K` | ERROR | error.log +9108 B: [2026-10-23T07:01:07.731Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:01:07.748Z] Unhand; changed: count,text,state,active; shots 0272-before.png, 0272-after.png |
| Keyboard — Focus | Open settings (Ctrl+,) [Global] | `key Ctrl+,` | ERROR | error.log +8487 B: [2026-10-23T07:01:12.914Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:01:12.931Z] Unhand; changed: state; shots 0273-before.png, 0273-after.png |
| Keyboard — Focus | Quick settings (Ctrl+Shift+,) [Global] | `key Ctrl+Shift+,` | ERROR | error.log +8280 B: [2026-10-23T07:01:13.864Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:01:13.881Z] Unhand; changed: state; shots 0274-before.png, 0274-after.png |
| Keyboard — Focus | Shortcuts overlay (?) [Global] | `key ?` | ERROR | error.log +8487 B: [2026-10-23T07:01:14.814Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:01:14.831Z] Unhand; changed: count,text,state; shots 0275-before.png, 0275-after.png |
| Keyboard — Focus | Highlights overlay (;) [Global] | `key ;` | ERROR | error.log +8694 B: [2026-10-23T07:01:15.781Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:01:15.797Z] Unhand; changed: count,text,state,active; shots 0276-before.png, 0276-after.png |
| Keyboard — Focus | Font size up (Ctrl+=) [Global] | `key Ctrl+=` | OK | changed: text,foliate; shots 0277-before.png, 0277-after.png |
| Keyboard — Focus | Font size down (Ctrl+-) [Global] | `key Ctrl+-` | ERROR | error.log +8901 B: [2026-10-23T07:01:26.064Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:01:26.081Z] Unhand; changed: text,foliate; shots 0278-before.png, 0278-after.png |
| Keyboard — Focus | Smart import (Alt+V) [Global] | `key Alt+V` | ERROR | error.log +65536 B: [2026-10-23T07:01:31.230Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:01:31.247Z] Unhand; shots 0279-before.png, 0279-after.png |
| Keyboard — Focus | Play / pause (Space) [Reader — Focus] | `key Space` | OK | changed: count,text,state; shots 0280-before.png, 0280-after.png |
| Keyboard — Focus | Rewind 5 words (ArrowLeft) [Reader — Focus] | `key ArrowLeft` | ERROR | error.log +65536 B: [2026-10-23T07:02:02.214Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:02:02.230Z] Unhand; shots 0281-before.png, 0281-after.png |
| Keyboard — Focus | Forward 5 words (ArrowRight) [Reader — Focus] | `key ArrowRight` | ERROR | error.log +65536 B: [2026-10-23T07:02:28.098Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:02:28.114Z] Unhand; shots 0282-before.png, 0282-after.png |
| Keyboard — Focus | Seek -1 word (Ctrl+Left) [Reader — Focus] | `key Ctrl+Left` | ERROR | error.log +65536 B: [2026-10-23T07:02:53.980Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:02:53.997Z] Unhand; shots 0283-before.png, 0283-after.png |
| Keyboard — Focus | Seek +1 word (Ctrl+Right) [Reader — Focus] | `key Ctrl+Right` | NO-EFFECT | shots 0284-before.png, 0284-after.png |
| Keyboard — Focus | Previous sentence (Ctrl+Up) [Reader — Focus] | `key Ctrl+Up` | NO-EFFECT | shots 0285-before.png, 0285-after.png |
| Keyboard — Focus | Next sentence (Ctrl+Down) [Reader — Focus] | `key Ctrl+Down` | NO-EFFECT | shots 0286-before.png, 0286-after.png |
| Keyboard — Focus | Previous paragraph (Shift+Left) [Reader — Focus] | `key Shift+Left` | ERROR | error.log +65536 B: [2026-10-23T07:04:37.397Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:04:37.414Z] Unhand; shots 0287-before.png, 0287-after.png |
| Keyboard — Focus | Next paragraph (Shift+Right) [Reader — Focus] | `key Shift+Right` | NO-EFFECT | shots 0288-before.png, 0288-after.png |
| Keyboard — Focus | Previous chapter (Shift+Up) [Reader — Focus] | `key Shift+Up` | NO-EFFECT | shots 0289-before.png, 0289-after.png |
| Keyboard — Focus | Next chapter (Shift+Down) [Reader — Focus] | `key Shift+Down` | NO-EFFECT | shots 0290-before.png, 0290-after.png |
| Keyboard — Focus | Speed up (ArrowUp) [Reader — Focus] | `key ArrowUp` | OK | changed: text; shots 0291-before.png, 0291-after.png |
| Keyboard — Focus | Slow down (ArrowDown) [Reader — Focus] | `key ArrowDown` | ERROR | error.log +8487 B: [2026-10-23T07:06:25.947Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:06:25.963Z] Unhand; changed: text; shots 0292-before.png, 0292-after.png |
| Keyboard — Focus | Star / Favorite (S) [Reader — Focus] | `key S` | ERROR | error.log +65536 B: [2026-10-23T07:06:31.096Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:06:31.113Z] Unhand; shots 0293-before.png, 0293-after.png |
| Keyboard — Focus | Previous chapter ([) [Reader — Focus] | `key [` | ERROR | error.log +65536 B: [2026-10-23T07:06:56.963Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:06:56.980Z] Unhand; shots 0294-before.png, 0294-after.png |
| Keyboard — Focus | Previous chapter (P) [Reader — Focus] | `key P` | NO-EFFECT | shots 0295-before.png, 0295-after.png |
| Keyboard — Focus | Next chapter (]) [Reader — Focus] | `key ]` | NO-EFFECT | shots 0296-before.png, 0296-after.png |
| Keyboard — Focus | Enter Narrate (N) [Reader — Focus] | `key N` | ERROR | error.log +15525 B: [2026-10-23T07:08:14.480Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:14.496Z] Unhand; changed: text,state,foliate; shots 0297-before.png, 0297-after.png |
| Keyboard — Focus | Exit reader (Escape) [Reader — Focus] | `key Escape` | ERROR | error.log +8487 B: [2026-10-23T07:08:20.180Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:20.196Z] Unhand; changed: text,state,foliate; shots 0298-before.png, 0298-after.png |
| Keyboard — Focus | Font size reset (Ctrl+0) [Global] | `key Ctrl+0` | ERROR | destructive pass, fresh scratch copy; error.log +8487 B: [2026-10-23T07:20:26.344Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:20:26.360Z] Unhand; changed: text; shots 0356-before.png, 0356-after.png |

### Keyboard — Flow

Reached: sample book in Flow; Global and Reader — Flow rows

Controls enumerated: 29. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Flow mode"] → wait .rm-flow-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Keyboard — Flow | Command palette (Ctrl+K) [Global] | `key Ctrl+K` | OK | changed: count,text,state,active; shots 0299-before.png, 0299-after.png |
| Keyboard — Flow | Open settings (Ctrl+,) [Global] | `key Ctrl+,` | ERROR | error.log +8694 B: [2026-10-23T07:08:34.697Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:34.713Z] Unhand; changed: state; shots 0300-before.png, 0300-after.png |
| Keyboard — Flow | Quick settings (Ctrl+Shift+,) [Global] | `key Ctrl+Shift+,` | ERROR | error.log +8487 B: [2026-10-23T07:08:35.663Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:35.680Z] Unhand; changed: state; shots 0301-before.png, 0301-after.png |
| Keyboard — Flow | Shortcuts overlay (?) [Global] | `key ?` | ERROR | error.log +8694 B: [2026-10-23T07:08:36.613Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:36.630Z] Unhand; changed: count,text,state; shots 0302-before.png, 0302-after.png |
| Keyboard — Flow | Highlights overlay (;) [Global] | `key ;` | ERROR | error.log +8694 B: [2026-10-23T07:08:37.580Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:37.597Z] Unhand; changed: count,text,state,active; shots 0303-before.png, 0303-after.png |
| Keyboard — Flow | Font size up (Ctrl+=) [Global] | `key Ctrl+=` | ERROR | error.log +8694 B: [2026-10-23T07:08:42.746Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:42.763Z] Unhand; changed: text,foliate; shots 0304-before.png, 0304-after.png |
| Keyboard — Flow | Font size down (Ctrl+-) [Global] | `key Ctrl+-` | ERROR | error.log +8901 B: [2026-10-23T07:08:47.896Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:47.913Z] Unhand; changed: text,foliate; shots 0305-before.png, 0305-after.png |
| Keyboard — Flow | Smart import (Alt+V) [Global] | `key Alt+V` | ERROR | error.log +25461 B: [2026-10-23T07:08:53.063Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:08:53.080Z] Unhand; shots 0306-before.png, 0306-after.png |
| Keyboard — Flow | Play / pause flow (Space) [Reader — Flow] | `key Space` | ERROR | error.log +8694 B: [2026-10-23T07:09:18.929Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:09:18.946Z] Unhand; changed: count,text; shots 0307-before.png, 0307-after.png |
| Keyboard — Flow | Previous line (ArrowUp) [Reader — Flow] | `key ArrowUp` | ERROR | error.log +65536 B: [2026-10-23T07:09:24.079Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:09:24.096Z] Unhand; shots 0308-before.png, 0308-after.png |
| Keyboard — Flow | Next line (ArrowDown) [Reader — Flow] | `key ArrowDown` | NO-EFFECT | shots 0309-before.png, 0309-after.png |
| Keyboard — Flow | Seek -1 word (Ctrl+Left) [Reader — Flow] | `key Ctrl+Left` | OK | changed: count,text,state,foliate; shots 0310-before.png, 0310-after.png |
| Keyboard — Flow | Seek +1 word (Ctrl+Right) [Reader — Flow] | `key Ctrl+Right` | ERROR | error.log +8694 B: [2026-10-23T07:10:20.946Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:10:20.962Z] Unhand; changed: count,text,state,foliate; shots 0311-before.png, 0311-after.png |
| Keyboard — Flow | Previous sentence (Ctrl+Up) [Reader — Flow] | `key Ctrl+Up` | NO-EFFECT | shots 0312-before.png, 0312-after.png |
| Keyboard — Flow | Next sentence (Ctrl+Down) [Reader — Flow] | `key Ctrl+Down` | NO-EFFECT | shots 0313-before.png, 0313-after.png |
| Keyboard — Flow | Previous paragraph (Shift+Left) [Reader — Flow] | `key Shift+Left` | ERROR | error.log +8901 B: [2026-10-23T07:11:17.779Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:11:17.796Z] Unhand; changed: count,text,state,foliate; shots 0314-before.png, 0314-after.png |
| Keyboard — Flow | Next paragraph (Shift+Right) [Reader — Flow] | `key Shift+Right` | ERROR | error.log +8694 B: [2026-10-23T07:11:22.946Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:11:22.962Z] Unhand; changed: count,text,state,foliate; shots 0315-before.png, 0315-after.png |
| Keyboard — Flow | Previous paragraph (Shift+Up) [Reader — Flow] | `key Shift+Up` | NO-EFFECT | shots 0316-before.png, 0316-after.png |
| Keyboard — Flow | Next paragraph (Shift+Down) [Reader — Flow] | `key Shift+Down` | ERROR | error.log +65536 B: [2026-10-23T07:11:53.962Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:11:53.979Z] Unhand; shots 0317-before.png, 0317-after.png |
| Keyboard — Flow | Speed up (ArrowRight) [Reader — Flow] | `key ArrowRight` | ERROR | error.log +8694 B: [2026-10-23T07:12:19.845Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:12:19.862Z] Unhand; changed: count,text,state,foliate; shots 0318-before.png, 0318-after.png |
| Keyboard — Flow | Slow down (ArrowLeft) [Reader — Flow] | `key ArrowLeft` | ERROR | error.log +8694 B: [2026-10-23T07:12:24.995Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:12:25.012Z] Unhand; changed: count,text,state,foliate; shots 0319-before.png, 0319-after.png |
| Keyboard — Flow | Star / Favorite (S) [Reader — Flow] | `key S` | ERROR | error.log +65536 B: [2026-10-23T07:12:30.145Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:12:30.162Z] Unhand; shots 0320-before.png, 0320-after.png |
| Keyboard — Flow | Previous chapter ([) [Reader — Flow] | `key [` | ERROR | error.log +65536 B: [2026-10-23T07:12:56.029Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:12:56.045Z] Unhand; shots 0321-before.png, 0321-after.png |
| Keyboard — Flow | Previous chapter (P) [Reader — Flow] | `key P` | ERROR | error.log +65536 B: [2026-10-23T07:13:21.879Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:13:21.896Z] Unhand; shots 0322-before.png, 0322-after.png |
| Keyboard — Flow | Next chapter (]) [Reader — Flow] | `key ]` | ERROR | error.log +65536 B: [2026-10-23T07:13:47.762Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:13:47.779Z] Unhand; shots 0323-before.png, 0323-after.png |
| Keyboard — Flow | Enter Narrate (N) [Reader — Flow] | `key N` | ERROR | error.log +8694 B: [2026-10-23T07:14:13.629Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:13.646Z] Unhand; changed: count,text,state,foliate; shots 0324-before.png, 0324-after.png |
| Keyboard — Flow | Toggle menu (Tab) [Reader — Flow] | `key Tab` | ERROR | error.log +8694 B: [2026-10-23T07:14:18.778Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:18.795Z] Unhand; changed: state; shots 0325-before.png, 0325-after.png |
| Keyboard — Flow | Exit reader (Escape) [Reader — Flow] | `key Escape` | ERROR | error.log +8694 B: [2026-10-23T07:14:19.745Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:19.762Z] Unhand; changed: count,text,state,foliate; shots 0326-before.png, 0326-after.png |
| Keyboard — Flow | Font size reset (Ctrl+0) [Global] | `key Ctrl+0` | ERROR | destructive pass, fresh scratch copy; error.log +8280 B: [2026-10-23T07:20:32.044Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:20:32.060Z] Unhand; changed: text; shots 0357-before.png, 0357-after.png |

### Keyboard — Narrate

Reached: sample book in Narrate; Global rows (no Narrate section)

Controls enumerated: 9. Walk: entered: .view-toggle-btn → .doc-card[data-doc-id="sample-meditations"] → wait .reader-layout → [aria-label="Narrate mode"] → wait .rm-narrate-root

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Keyboard — Narrate | Command palette (Ctrl+K) [Global] | `key Ctrl+K` | ERROR | error.log +8901 B: [2026-10-23T07:14:29.095Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:29.112Z] Unhand; changed: count,text,state,active; shots 0327-before.png, 0327-after.png |
| Keyboard — Narrate | Open settings (Ctrl+,) [Global] | `key Ctrl+,` | ERROR | error.log +8487 B: [2026-10-23T07:14:34.261Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:34.278Z] Unhand; changed: state; shots 0328-before.png, 0328-after.png |
| Keyboard — Narrate | Quick settings (Ctrl+Shift+,) [Global] | `key Ctrl+Shift+,` | ERROR | error.log +8487 B: [2026-10-23T07:14:35.228Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:35.245Z] Unhand; changed: state; shots 0329-before.png, 0329-after.png |
| Keyboard — Narrate | Shortcuts overlay (?) [Global] | `key ?` | ERROR | error.log +8694 B: [2026-10-23T07:14:36.178Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:36.195Z] Unhand; changed: count,text,state; shots 0330-before.png, 0330-after.png |
| Keyboard — Narrate | Highlights overlay (;) [Global] | `key ;` | ERROR | error.log +8901 B: [2026-10-23T07:14:37.145Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:37.161Z] Unhand; changed: count,text,state,active; shots 0331-before.png, 0331-after.png |
| Keyboard — Narrate | Font size up (Ctrl+=) [Global] | `key Ctrl+=` | ERROR | error.log +8487 B: [2026-10-23T07:14:42.311Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:42.328Z] Unhand; changed: text,foliate; shots 0332-before.png, 0332-after.png |
| Keyboard — Narrate | Font size down (Ctrl+-) [Global] | `key Ctrl+-` | ERROR | error.log +8694 B: [2026-10-23T07:14:47.445Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:47.462Z] Unhand; changed: text,foliate; shots 0333-before.png, 0333-after.png |
| Keyboard — Narrate | Smart import (Alt+V) [Global] | `key Alt+V` | ERROR | error.log +65536 B: [2026-10-23T07:14:52.595Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:14:52.612Z] Unhand; shots 0334-before.png, 0334-after.png |
| Keyboard — Narrate | Font size reset (Ctrl+0) [Global] | `key Ctrl+0` | ERROR | destructive pass, fresh scratch copy; error.log +8694 B: [2026-10-23T07:20:37.727Z] Unhandled: ResizeObserver loop completed with undelivered notifications. at file:///C:/Projects/Blurby-artifacts/ui-sweep-1/build-97527896-x64/resources/app.asar/dist/index.html:0 [2026-10-23T07:20:37.744Z] Unhand; changed: text; shots 0358-before.png, 0358-after.png |

### Keyboard — Overlays

Reached: the CommandPalette open; the Overlays rows (the 1-5 snooze keys go to the snooze picker)

Controls enumerated: 4. Walk: entered: key Ctrl+K

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Keyboard — Overlays | Close overlay (Escape) [Overlays] | `key Escape` | OK | changed: count,text,state,active; shots 0335-before.png, 0335-after.png |
| Keyboard — Overlays | Navigate results (Up) [Overlays] | `key Up` | NO-EFFECT | shots 0336-before.png, 0336-after.png |
| Keyboard — Overlays | Navigate results (Down) [Overlays] | `key Down` | OK | changed: state; shots 0337-before.png, 0337-after.png |
| Keyboard — Overlays | Select result (Enter) [Overlays] | `key Enter` | OK | changed: count,text,state,active; shots 0338-before.png, 0338-after.png |

### Keyboard — Snooze picker keys

Reached: J, then H, then the 1-5 rows

Controls enumerated: 5. Walk: entered: key j → key h

| Surface | Control | Selector | Result | Evidence |
|---|---|---|---|---|
| Keyboard — Snooze picker keys | Snooze: pick time (1) [Overlays] | `key 1` | OK | changed: count,text,state; shots 0339-before.png, 0339-after.png |
| Keyboard — Snooze picker keys | Snooze: pick time (2) [Overlays] | `key 2` | OK | changed: count,text,state; shots 0340-before.png, 0340-after.png |
| Keyboard — Snooze picker keys | Snooze: pick time (3) [Overlays] | `key 3` | OK | changed: count,text,state; shots 0341-before.png, 0341-after.png |
| Keyboard — Snooze picker keys | Snooze: pick time (4) [Overlays] | `key 4` | OK | changed: count,text,state; shots 0342-before.png, 0342-after.png |
| Keyboard — Snooze picker keys | Snooze: pick time (5) [Overlays] | `` | UNREACHABLE | could not re-enter surface: step: waited for .snooze-picker-overlay |

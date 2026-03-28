# Chrome Click-Through Test Checklist

Structured test checklist for verifying Blurby's UI end-to-end in a Chromium browser using the electronAPI stub. Designed for execution by Claude in Chrome or a human tester.

**Prerequisites:** `npm run dev` running, open `http://localhost:5173` in Chrome.

## Format

Each item: `[ID] Action | Expected | Screenshot? | Console check`

- **Screenshot?** = Y if state should be captured visually
- **Console check** = what `[stub]` log entry to verify, or "none"

---

## 1. Boot & Initialization (BOOT)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| BOOT-01 | Open `localhost:5173` in Chrome | App loads, no white screen | Y | `[Blurby Stub] electronAPI stub installed` |
| BOOT-02 | Open DevTools console | No uncaught errors or warnings | N | No red errors |
| BOOT-03 | Check `window.electronAPI` in console | Returns object with all methods | N | none |
| BOOT-04 | Check `window.__blurbyStub` in console | Returns object with `emit`, `getSettings`, `getLibrary`, `reset` | N | none |

## 2. Onboarding / First Run (OB)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| OB-01 | Observe initial load (firstRunCompleted=false) | Welcome/onboarding screen appears | Y | `[stub] getState` |
| OB-02 | Complete onboarding flow (click through steps) | Tour tooltips appear in sequence | Y | none |
| OB-03 | Complete final onboarding step | Library view appears, Meditations visible | Y | `[stub] saveSettings` with `firstRunCompleted: true` |
| OB-04 | Run `window.__blurbyStub.reset()` then reload | Onboarding appears again | N | `[stub] state reset` |
| OB-05 | Run `window.__blurbyStub.setFirstRunCompleted(true)` then reload | Library loads directly, no onboarding | N | `[stub] firstRunCompleted set to true` |

## 3. Library — Grid & List View (LIB)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| LIB-01 | View library after onboarding | Meditations doc card visible with title, author "Marcus Aurelius" | Y | none |
| LIB-02 | Toggle to grid view (click view toggle) | Cards switch to grid layout | Y | `[stub] saveSettings` |
| LIB-03 | Toggle to list view | Cards switch to list layout | Y | `[stub] saveSettings` |
| LIB-04 | Press `/` to focus search | Search field gains focus | N | none |
| LIB-05 | Type "Meditations" in search | Meditations card remains visible, others filtered | N | none |
| LIB-06 | Type "nonexistent" in search | Empty state shown, no results | Y | none |
| LIB-07 | Clear search | All docs reappear | N | none |
| LIB-08 | Right-click Meditations card | Context menu appears (if implemented) | Y | none |
| LIB-09 | Press `J` to move selection down | Focus indicator moves to first/next card | N | none |
| LIB-10 | Press `K` to move selection up | Focus indicator moves to previous card | N | none |
| LIB-11 | Press `Enter` on focused card | Reader opens with Meditations | N | `[stub] loadDocContent` or `[stub] readFileBuffer` |

## 4. Library — Favorites & Archive (FAV)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| FAV-01 | Star Meditations (click star or press `s`) | Star icon fills, doc marked favorite | Y | `[stub] toggleFavorite` → `true` |
| FAV-02 | Navigate to Favorites filter (`gf` sequence) | Only starred docs visible | Y | none |
| FAV-03 | Unstar Meditations | Star icon empties | N | `[stub] toggleFavorite` → `false` |
| FAV-04 | Archive Meditations (context menu or shortcut) | Doc disappears from main view | N | `[stub] archiveDoc` |
| FAV-05 | Navigate to Archive filter (`ga`) | Archived Meditations visible | Y | none |
| FAV-06 | Unarchive Meditations | Doc reappears in main library | N | `[stub] unarchiveDoc` |

## 5. Reader — Page Mode (READ)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| READ-01 | Click Meditations to open | Reader view loads, page content visible | Y | `[stub] readFileBuffer` |
| READ-02 | Observe EPUB rendering | Text content from Meditations visible (foliate-js) | Y | none |
| READ-03 | Press Right Arrow or click next | Page advances | N | `[stub] updateDocProgress` |
| READ-04 | Press Left Arrow or click prev | Page goes back | N | `[stub] updateDocProgress` |
| READ-05 | Open chapter dropdown | Chapter list appears (Book One through Twelve) | Y | `[stub] getDocChapters` |
| READ-06 | Select a different chapter | Reader jumps to that chapter | N | none |
| READ-07 | Press `Escape` | Returns to library view | N | none |

## 6. Reader — Focus Mode (FOCUS)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| FOCUS-01 | Open Meditations, press `Space` to start last mode (or click Focus) | Focus mode starts, single word displayed | Y | none |
| FOCUS-02 | Observe word advancement | Words advance at configured WPM | N | none |
| FOCUS-03 | Press `Space` to pause | Word advancement pauses | N | none |
| FOCUS-04 | Press `Space` to resume | Word advancement resumes | N | none |
| FOCUS-05 | Press `Up Arrow` | WPM increases by step | N | none |
| FOCUS-06 | Press `Down Arrow` | WPM decreases by step | N | none |
| FOCUS-07 | Press `Left Arrow` | Rewinds 5 words | N | none |
| FOCUS-08 | Press `Right Arrow` | Skips forward 5 words | N | none |
| FOCUS-09 | Press `Escape` | Exits Focus mode, returns to Page mode | N | none |
| FOCUS-10 | Verify ORP highlight | Optimal Recognition Point character is highlighted | Y | none |

## 7. Reader — Flow Mode (FLOW)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| FLOW-01 | Open Meditations, enter Flow mode (click Flow or Shift+Space) | Scrolling text view with highlight cursor | Y | none |
| FLOW-02 | Observe cursor movement | Word group highlights and auto-scrolls | N | none |
| FLOW-03 | Press `Space` to pause | Highlight cursor pauses | N | none |
| FLOW-04 | Press `Space` to resume | Highlight cursor resumes | N | none |
| FLOW-05 | Press `Up Arrow` | WPM increases | N | none |
| FLOW-06 | Press `Down Arrow` | WPM decreases | N | none |
| FLOW-07 | Press `Escape` | Exits Flow mode | N | none |
| FLOW-08 | Verify underline/highlight cursor style | Cursor style matches setting (underline default) | Y | none |

## 8. Reader — Narrate Mode (NAR)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| NAR-01 | Open Meditations, enter Narrate mode (click Narrate) | Narration starts, word highlighting follows speech | Y | `[stub] kokoroGenerate` or Web Speech activity |
| NAR-02 | Observe word-level tracking | Highlighted word advances in sync with audio | N | `[audio] play` in console |
| NAR-03 | Press `Space` to pause | Audio pauses, highlight freezes | N | none |
| NAR-04 | Press `Space` to resume | Audio resumes, highlight continues | N | none |
| NAR-05 | Press `Up Arrow` to increase speed | WPM/rate increases | N | none |
| NAR-06 | Press `Down Arrow` to decrease speed | WPM/rate decreases | N | none |
| NAR-07 | Press `Escape` | Narration stops, exits to page view | N | none |
| NAR-08 | Switch engine (if Kokoro toggle visible) | Engine switches between web/kokoro | N | `[stub] kokoroModelStatus` |
| NAR-09 | Verify Kokoro mock generates audible tone | 440Hz sine wave plays through speakers | N | `[stub] kokoroGenerate` with sample/duration info |

## 9. Bottom Bar Controls (BAR)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| BAR-01 | Observe bottom bar in reader | WPM display, mode buttons, chapter dropdown visible | Y | none |
| BAR-02 | Click WPM up button | WPM increases by step | N | none |
| BAR-03 | Click WPM down button | WPM decreases by step | N | none |
| BAR-04 | Click Focus mode button | Switches to Focus mode | N | none |
| BAR-05 | Click Flow mode button | Switches to Flow mode | N | none |
| BAR-06 | Click Narrate mode button | Switches to Narrate mode | N | none |
| BAR-07 | Press `Shift+Space` in a mode | Cycles to next mode (Focus → Flow → Narrate → Focus) | N | none |
| BAR-08 | Verify font size controls (if visible) | Text size adjusts | N | none |

## 10. Settings Pages (SET)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| SET-01 | Open settings (Tab or menu) | Settings panel appears | Y | none |
| SET-02 | Navigate to Theme settings | Theme options visible (dark, light, blurby, eink, system) | Y | none |
| SET-03 | Switch to Light theme | App theme changes to light colors | Y | `[stub] saveSettings` with `theme: "light"` |
| SET-04 | Switch to Dark theme | App theme changes to dark colors | Y | `[stub] saveSettings` with `theme: "dark"` |
| SET-05 | Switch to Blurby theme | App theme changes to Blurby brand colors | Y | `[stub] saveSettings` |
| SET-06 | Switch to E-ink theme | App theme changes to high-contrast B&W | Y | `[stub] saveSettings` |
| SET-07 | Navigate to Layout settings | Layout spacing controls visible | Y | none |
| SET-08 | Navigate to Speed settings | WPM, rhythm pauses, initial pause controls visible | Y | none |
| SET-09 | Navigate to Hotkeys settings | Keyboard shortcut list visible | Y | none |
| SET-10 | Navigate to Connectors settings | Cloud sync, Chrome extension options visible | Y | none |
| SET-11 | Navigate to Help settings | Version info, check for updates button visible | Y | none |
| SET-12 | Click "Check for Updates" | Response shown (up-to-date message) | N | `[stub] checkForUpdates` → `up-to-date` |
| SET-13 | Navigate to Text Size settings | Text size slider/controls visible | Y | none |
| SET-14 | Navigate to Cloud Sync settings | Sign-in buttons for Microsoft/Google visible | Y | none |
| SET-15 | Click Sign In (Microsoft or Google) | Error/stub message shown (not available in browser) | N | `[stub] cloudSignIn` |
| SET-16 | Close settings | Returns to library or reader | N | none |

## 11. Keyboard Shortcuts (KB)

> **Note:** G-sequences (KB-08 through KB-16) require sub-second key timing. Browser automation introduces delay between keypresses, causing false failures. Verify G-sequences manually in Electron or with deliberate fast typing in browser.

> **Note:** `Ctrl+,` (KB-17) is intercepted by Chrome to open browser settings. This shortcut works in Electron but not in browser context. Marked SKIP for browser testing.

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| KB-01 | Press `?` in library | Shortcuts overlay opens | Y | none |
| KB-02 | Press `Escape` | Shortcuts overlay closes | N | none |
| KB-03 | Press `Ctrl+K` (or Cmd+K) | Command palette opens | Y | none |
| KB-04 | Type a command in palette | Filtered results appear | N | none |
| KB-05 | Press `Escape` to close palette | Palette closes | N | none |
| KB-06 | Press `/` in library | Search field focuses | N | none |
| KB-07 | Press `Tab` in library | Menu flap toggles (Reading Queue sidebar) | N | none |
| KB-08 | G-sequence: `g` then `l` | Navigates to All library filter | N | none |
| KB-09 | G-sequence: `g` then `f` | Navigates to Favorites filter | N | none |
| KB-10 | G-sequence: `g` then `a` | Navigates to Archive filter | N | none |
| KB-11 | G-sequence: `g` then `q` | Navigates to Queue filter | N | none |
| KB-12 | G-sequence: `g` then `r` | Navigates to Recent filter | N | none |
| KB-13 | G-sequence: `g` then `s` | Navigates to Stats view | N | none |
| KB-14 | G-sequence: `g` then `h` | Navigates to Snoozed filter | N | none |
| KB-15 | G-sequence: `g` then `c` | Navigates to Collections filter | N | none |
| KB-16 | G-sequence: `g` then `m` | Toggles menu flap | N | none |
| KB-17 | Press `Ctrl+,` in library | Opens settings (SKIP in browser — Chrome intercepts) | N | none |
| KB-18 | Press `Ctrl+Shift+,` in library | Opens quick settings overlay | N | none |
| KB-19 | Press `;` in library | Opens highlights overlay | N | none |
| KB-20 | Press `F6` | Cycles focus zone (search → grid → sidebar) | N | none |
| KB-21 | Press `Shift+F6` | Cycles focus zone in reverse | N | none |

## 12. Command Palette (CMD)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| CMD-01 | Press `Ctrl+K` | Command palette opens with search field | Y | none |
| CMD-02 | Type "theme" | Theme-related commands appear | N | none |
| CMD-03 | Select "Dark theme" command | Theme switches to dark | N | `[stub] saveSettings` |
| CMD-04 | Press `Ctrl+K`, type "open" | Open-related commands appear | N | none |
| CMD-05 | Press `Escape` | Palette closes cleanly | N | none |

## 13. Drag and Drop (DD)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| DD-01 | Drag a .txt file onto the app | Import accepted, doc added to library | N | `[stub] importDroppedFiles` → `imported: [...]` |
| DD-02 | Drag a .jpg file onto the app | Rejection toast shown (unsupported format) | Y | `[stub] importDroppedFiles` → `rejected: [...]` |
| DD-03 | Drag multiple valid files | All imported, library updated | N | `[stub] importDroppedFiles` |

## 14. Error States (ERR)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| ERR-01 | Delete Meditations, try to open it | Error handled gracefully (no crash) | Y | none |
| ERR-02 | Run `window.__blurbyStub.reset()` and reload | App restarts cleanly with fresh state | N | `[stub] state reset` |
| ERR-03 | Trigger event: `window.__blurbyStub.emit("watcher-error", {message: "Test error"})` | Error handled (toast or log) | N | `[stub] emit watcher-error` |
| ERR-04 | Trigger event: `window.__blurbyStub.emit("update-available", "2.0.0")` | Update notification appears | Y | `[stub] emit update-available` |
| ERR-05 | Trigger event: `window.__blurbyStub.emit("cloud-auth-required", "microsoft")` | Auth prompt appears | N | `[stub] emit cloud-auth-required` |

## 15. Mode Cycling & Transitions (MODE)

| ID | Action | Expected | Screenshot? | Console |
|----|--------|----------|-------------|---------|
| MODE-01 | Open reader, start Focus mode | Focus mode active | N | none |
| MODE-02 | Press `Shift+Space` | Transitions to Flow mode | N | none |
| MODE-03 | Press `Shift+Space` | Transitions to Narrate mode | N | none |
| MODE-04 | Press `Shift+Space` | Cycles back to Focus mode | N | none |
| MODE-05 | Press `Escape` from any mode | Returns to Page mode | N | none |
| MODE-06 | Start Focus, advance 50 words, switch to Flow | Flow starts near same position | N | none |

---

## Summary

| Area | Count |
|------|-------|
| Boot | 4 |
| Onboarding | 5 |
| Library | 11 |
| Favorites/Archive | 6 |
| Reader/Page | 7 |
| Focus Mode | 10 |
| Flow Mode | 8 |
| Narrate Mode | 9 |
| Bottom Bar | 8 |
| Settings | 16 |
| Keyboard | 21 |
| Command Palette | 5 |
| Drag & Drop | 3 |
| Error States | 5 |
| Mode Cycling | 6 |
| **Total** | **124** |

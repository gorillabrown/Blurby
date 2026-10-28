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

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| READ-01 | Click Meditations to open | Reader view loads, page content visible | Y | `[stub] readFileBuffer` | PASS | 2026-05-04 |
| READ-02 | Observe EPUB rendering | Text content from Meditations visible (foliate-js) | Y | none | PASS | 2026-05-04 |
| READ-03 | Press Right Arrow or click right arrow | Page advances | N | `[stub] updateDocProgress` | PASS | 2026-05-04 |
| READ-04 | Press Left Arrow or click left arrow | Page goes back | N | `[stub] updateDocProgress` | PASS | 2026-05-04 |
| READ-05 | Open chapter dropdown | Chapter list appears (Book One through Twelve) | Y | `[stub] getDocChapters` | — | — |
| READ-06 | Select a different chapter | Reader jumps to that chapter | N | none | — | — |
| READ-07 | Press `Escape` | Returns to library view | N | none | PASS (user-confirmed) | 2026-05-04 |
| READ-08 | Press `H` | Returns to library view (Home hotkey) | N | none | — | — |
| READ-09 | Observe two-column paginated layout | Text flows in two columns, page-turn arrows at screen edges | Y | none | PASS | 2026-05-04 |
| READ-10 | Observe bottom-left progress percentage | Shows current reading position as % | N | none | PASS | 2026-05-04 |
| READ-11 | Observe chapter navigation in bottom bar | "< CHAPTER NAME >" with left/right arrows | N | none | PASS | 2026-05-04 |
| READ-12 | Navigate forward 3+ pages, note position | Position advances, % increases | N | none | PASS | 2026-05-04 |

## 6. Reader — Focus Mode (FOCUS)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| FOCUS-01 | Click Focus button in bottom bar | Focus mode activates, "resume reading" or word shown | Y | none | PASS | 2026-05-04 |
| FOCUS-02 | Click play button to start | Words begin advancing at configured WPM | N | none | PASS | 2026-05-04 |
| FOCUS-03 | Observe word display with ORP | Single word centered, ORP letter highlighted in pink/red | Y | none | PASS | 2026-05-04 |
| FOCUS-04 | Observe reading zone band | Horizontal lighter strip across center of screen | Y | none | PASS | 2026-05-04 |
| FOCUS-05 | Observe alignment dots | Two small red dots above and below reading zone | Y | none | PASS | 2026-05-04 |
| FOCUS-06 | Press `Space` to pause | Word advancement pauses | N | none | PASS | 2026-05-04 |
| FOCUS-07 | Observe paused state display | Last word remains visible (not replaced by generic text) | Y | none | FAIL — shows "resume reading" instead of last word | 2026-05-04 |
| FOCUS-08 | Press `Space` to resume | Word advancement resumes from paused position | N | none | PASS | 2026-05-04 |
| FOCUS-09 | Stop then start again (full restart cycle) | Start → stop → start works without issues | N | none | PASS | 2026-05-04 |
| FOCUS-10 | Press `Up Arrow` | WPM increases by step | N | none | — | — |
| FOCUS-11 | Press `Down Arrow` | WPM decreases by step | N | none | — | — |
| FOCUS-12 | Press `Left Arrow` | Rewinds 5 words | N | none | — | — |
| FOCUS-13 | Press `Right Arrow` | Skips forward 5 words | N | none | — | — |
| FOCUS-14 | Press `Escape` | Exits Focus mode, returns to Page mode | N | none | PASS (user-confirmed) | 2026-05-04 |
| FOCUS-15 | Verify ORP highlight letter | Optimal Recognition Point character (~40% position) highlighted in pink/red | Y | none | PASS | 2026-05-04 |
| FOCUS-16 | Observe "ESC" label in top-left | Clickable ESC label visible in top-left corner | N | none | PASS | 2026-05-04 |
| FOCUS-17 | Observe speed display in top-right | Speed slider and "400 wpm" label visible | N | none | PASS | 2026-05-04 |
| FOCUS-18 | Observe startup speed | First word should appear immediately on play | N | none | ISSUE — ~1-2s delay before first word | 2026-05-04 |

## 7. Reader — Flow Mode (FLOW)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| FLOW-01 | Click Flow button in bottom bar | Flow mode activates, scrolling text view | Y | none | PASS | 2026-05-04 |
| FLOW-02 | Observe reading zone mask | Brighter text band visible via CSS mask-image around active position | Y | none | PASS | 2026-05-04 |
| FLOW-03 | Observe initial word selection on entry | A word should be highlighted/selected at current position | Y | none | FAIL — no word selected until play | 2026-05-04 |
| FLOW-04 | Click play button to start | Cursor begins moving, text auto-scrolls | N | none | PASS | 2026-05-04 |
| FLOW-05 | Observe underline cursor | `.flow-shrink-cursor` underline beneath active word group | Y | none | PASS (subtle) | 2026-05-04 |
| FLOW-06 | Observe auto-scroll tracking | Text scrolls to keep cursor in reading zone | N | none | PASS | 2026-05-04 |
| FLOW-07 | Press `Space` to pause | Cursor and auto-scroll pause | N | none | PASS | 2026-05-04 |
| FLOW-08 | Press `Space` to resume | Cursor and auto-scroll resume | N | none | PASS | 2026-05-04 |
| FLOW-09 | Stop then start again (full restart cycle) | Start → stop → start works without issues | N | none | PASS | 2026-05-04 |
| FLOW-10 | Press `Left Arrow` (speed down) | WPM decreases by step (per hint: ← → speed) | N | none | — | — |
| FLOW-11 | Press `Right Arrow` (speed up) | WPM increases by step | N | none | — | — |
| FLOW-12 | Press `Up Arrow` (line jump up) | Jumps to previous line in flow engine | N | none | FAIL — scrolls page instead | 2026-05-04 |
| FLOW-13 | Press `Down Arrow` (line jump down) | Jumps to next line in flow engine | N | none | FAIL — scrolls page instead | 2026-05-04 |
| FLOW-14 | Press `Escape` | Exits Flow mode | N | none | PASS (user-confirmed) | 2026-05-04 |
| FLOW-15 | Verify underline cursor style | Thin accent-colored underline beneath active word group | Y | none | PASS (very subtle — may need enhancement) | 2026-05-04 |
| FLOW-16 | Observe Zone controls in bottom bar | "Zone" button/control visible | N | none | PASS | 2026-05-04 |
| FLOW-17 | Observe Lines slider in bottom bar | Lines count slider with current value (default: 6) | N | none | PASS | 2026-05-04 |
| FLOW-18 | Observe progress/time in bottom bar | "0% · ~186 min left" format | N | none | PASS | 2026-05-04 |

## 8. Reader — Narrate Mode (NAR)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| NAR-01 | Click Narrate button in bottom bar | Narrate mode activates, scrolling text view (shares flow surface) | Y | none | PASS | 2026-05-04 |
| NAR-02 | Click play button to start narration | TTS audio begins, status shows "Narrating · N%" | N | `[stub] kokoroGenerate` | FAIL — status says Narrating but 0% forever, no audio | 2026-05-04 |
| NAR-03 | Observe word-level tracking cursor | `.page-word--highlighted` background highlight advances with audio | Y | none | BLOCKED — TTS never produced audio | 2026-05-04 |
| NAR-04 | Press `Space` to pause | Audio pauses, highlight freezes | N | none | PASS (pause button works) | 2026-05-04 |
| NAR-05 | Press `Space` to resume | Audio resumes, highlight continues | N | none | BLOCKED — no audio to resume | 2026-05-04 |
| NAR-06 | Stop then start again (full restart cycle) | Start → stop → start works without issues | N | none | BLOCKED — TTS engine not producing audio | 2026-05-04 |
| NAR-07 | Press `Up Arrow` to increase speed | Narration rate increases (shown as multiplier, e.g. 1.1x) | N | none | — | — |
| NAR-08 | Press `Down Arrow` to decrease speed | Narration rate decreases | N | none | — | — |
| NAR-09 | Press `Escape` | Narration stops, exits to page view | N | none | PASS (user-confirmed) | 2026-05-04 |
| NAR-10 | Observe speed display format | Shows multiplier (e.g. "1.1x") not WPM | N | none | PASS | 2026-05-04 |
| NAR-11 | Observe "Narrating" status in bottom bar | "Narrating · N% · ~Xm left" while playing | N | none | PASS (shows status, but stuck at 0%) | 2026-05-04 |
| NAR-12 | Verify TTS engine loads and produces audio | Audio audible within ~10 seconds of pressing play | N | console | FAIL — no audio after 23+ seconds | 2026-05-04 |
| NAR-13 | Observe loading/buffering indicator | Spinner or "Loading TTS..." while engine initializes | N | none | FAIL — no loading indicator, just static "Narrating" | 2026-05-04 |
| NAR-14 | Press `N` key to enter Narrate from another mode | Narrate mode activates (bare N key, universal shortcut) | N | none | — | — |

## 9. Bottom Bar Controls (BAR)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| BAR-01 | Observe bottom bar in Page mode | WPM, speed slider, A-/A+, play, mode buttons, chapter nav visible | Y | none | PASS | 2026-05-04 |
| BAR-02 | Observe bottom bar in Focus mode | WPM, speed slider, A-/A+, play/pause, mode buttons visible | Y | none | PASS | 2026-05-04 |
| BAR-03 | Observe bottom bar in Flow mode | WPM, speed slider, A-/A+, play/pause, mode buttons, Zone, Upper, Lines, progress visible | Y | none | PASS | 2026-05-04 |
| BAR-04 | Observe bottom bar in Narrate mode | Speed multiplier, speed slider, A-/A+, play/pause, mode buttons, "Narrating" status, Zone, Lines visible | Y | none | PASS | 2026-05-04 |
| BAR-05 | Observe hint bar text | Keyboard shortcuts shown per mode surface | N | none | PASS | 2026-05-04 |
| BAR-06 | Click speed slider | Speed adjusts | N | none | — | — |
| BAR-07 | Click A- button | Font size decreases | N | none | — | — |
| BAR-08 | Click A+ button | Font size increases | N | none | — | — |
| BAR-09 | Click Focus mode button | Switches to Focus mode | N | none | PASS | 2026-05-04 |
| BAR-10 | Click Flow mode button | Switches to Flow mode | N | none | PASS | 2026-05-04 |
| BAR-11 | Click Narrate mode button | Switches to Narrate mode | N | none | PASS | 2026-05-04 |
| BAR-12 | Click Page mode button | Switches to Page mode | N | none | PASS | 2026-05-04 |
| BAR-13 | Press `Shift+Space` from Page mode | Cycles selected mode (outlines next mode without starting) | N | none | — | — |
| BAR-14 | Press `Shift+Space` from Focus mode | Switches to next mode and starts it | N | none | — | — |
| BAR-15 | Verify font size controls visible | A- and A+ buttons present in bottom bar | N | none | PASS | 2026-05-04 |
| BAR-16 | Press `M` key | Reading Queue side panel toggles | N | none | PASS | 2026-05-04 |
| BAR-17 | Press `Tab` key | Reading Queue side panel toggles | N | none | PASS | 2026-05-04 |

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

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| MODE-01 | Open reader in Page mode, click Focus | Focus mode active, position preserved | N | none | PASS | 2026-05-04 |
| MODE-02 | From Focus, click Flow | Flow mode active, position preserved | N | none | PASS | 2026-05-04 |
| MODE-03 | From Flow, click Narrate | Narrate mode active, position preserved | N | none | PASS (second attempt); FAIL (first attempt — position reset) | 2026-05-04 |
| MODE-04 | From Narrate, click Page | Page mode active, position preserved | N | none | PASS | 2026-05-04 |
| MODE-05 | From Page, click Narrate | Narrate mode active, position preserved | N | none | — | — |
| MODE-06 | From Focus, click Narrate | Narrate mode active, position preserved | N | none | — | — |
| MODE-07 | From Flow, click Focus | Focus mode active, position preserved | N | none | — | — |
| MODE-08 | Press `Shift+Space` from Focus | Transitions to Flow mode and starts | N | none | — | — |
| MODE-09 | Press `Shift+Space` from Flow | Transitions to Narrate mode and starts | N | none | — | — |
| MODE-10 | Press `Shift+Space` from Narrate | Cycles back to Focus mode and starts | N | none | — | — |
| MODE-11 | Press `Escape` from any mode | Returns to Page mode | N | none | PASS (user-confirmed) | 2026-05-04 |
| MODE-12 | Press `H` from any mode | Returns to library (Home hotkey) | N | none | — (just implemented) | 2026-05-04 |

## 16. Position Preservation (POS)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| POS-01 | Page mode: advance to 3%, switch to Focus | Focus opens at 3% | N | none | PASS | 2026-05-04 |
| POS-02 | Focus mode: run, stop at ~3%, switch to Flow | Flow opens at ~3% | N | none | PASS | 2026-05-04 |
| POS-03 | Flow mode: run, stop at ~3%, switch to Narrate | Narrate opens at ~3% | N | none | PASS (second attempt) | 2026-05-04 |
| POS-04 | Narrate mode: switch to Page | Page opens at same position | N | none | PASS | 2026-05-04 |
| POS-05 | Navigate to a mid-book position (~9%), switch modes | Position preserved across switch | N | none | FAIL — first Flow→Narrate reset to 1% | 2026-05-04 |
| POS-06 | Start Focus, advance 50+ words, pause, switch to Flow | Flow starts near same word position | N | none | — | — |
| POS-07 | Start Flow, advance 50+ words, pause, switch to Focus | Focus starts near same word position | N | none | — | — |
| POS-08 | Start Narrate, advance 30+ seconds, pause, switch to Page | Page shows content near where narration was | N | none | BLOCKED — TTS not producing audio | 2026-05-04 |

## 17. Exit & Reentry (EXIT)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| EXIT-01 | Read to a known position (e.g. 8%), exit to library | Library shows correct progress percentage | Y | none | PASS — library showed 8% | 2026-05-04 |
| EXIT-02 | Reopen the same book from library | Book opens at last-read position | Y | none | FAIL — library showed 8% but book opened at 2% | 2026-05-04 |
| EXIT-03 | Exit via Escape key | Returns to library | N | none | PASS (user-confirmed) | 2026-05-04 |
| EXIT-04 | Exit via H key (Home hotkey) | Returns to library | N | none | — (just implemented) | 2026-05-04 |
| EXIT-05 | Read in Focus mode, exit, reopen | Book opens in Page mode at same position | N | none | — | — |
| EXIT-06 | Read in Flow mode, exit, reopen | Book opens in Page mode at same position | N | none | — | — |
| EXIT-07 | Read in Narrate mode, exit, reopen | Book opens in Page mode at same position | N | none | — | — |
| EXIT-08 | Verify last-used reading mode is remembered | Reopened book defaults to last-used mode (or Page) | N | none | — | — |

## 18. Reading Queue Panel (RQ)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| RQ-01 | Press `M` to open Reading Queue | Side panel opens showing "NOW READING" with current book | Y | none | PASS | 2026-05-04 |
| RQ-02 | Observe book info in panel | Title, format (epub), date added, progress visible | N | none | PASS | 2026-05-04 |
| RQ-03 | Press `M` or click X to close | Panel closes | N | none | PASS | 2026-05-04 |
| RQ-04 | Press `Tab` to toggle panel | Same as M key — panel toggles | N | none | PASS | 2026-05-04 |
| RQ-05 | Observe settings gear icon | Gear icon visible in panel header | N | none | PASS | 2026-05-04 |

## 19. UI Elements Per Mode (UI)

| ID | Action | Expected | Screenshot? | Console | Last Status | Date |
|----|--------|----------|-------------|---------|-------------|------|
| UI-01 | Page mode: verify two-column layout | Text flows in two justified columns | Y | none | PASS | 2026-05-04 |
| UI-02 | Page mode: verify page-turn arrows | Left and right arrow buttons at screen edges | Y | none | PASS | 2026-05-04 |
| UI-03 | Page mode: verify chapter nav in bottom bar | "< CHAPTER NAME >" with left/right arrows | N | none | PASS | 2026-05-04 |
| UI-04 | Page mode: verify no ESC label | No visible ESC/back button (unlike Focus mode) | N | none | CONFIRMED — no label | 2026-05-04 |
| UI-05 | Focus mode: verify ORP highlight color | Pink/red highlight on optimal recognition letter | Y | none | PASS | 2026-05-04 |
| UI-06 | Focus mode: verify reading zone band | Horizontal lighter strip across center | Y | none | PASS | 2026-05-04 |
| UI-07 | Focus mode: verify alignment dots | Two small red dots above/below reading zone | Y | none | PASS | 2026-05-04 |
| UI-08 | Focus mode: verify ESC label top-left | "ESC" text visible and clickable in top-left | N | none | PASS | 2026-05-04 |
| UI-09 | Focus mode: verify title display | Book title "Meditations" shown in header | N | none | PASS | 2026-05-04 |
| UI-10 | Focus mode: verify speed display top-right | Speed slider and WPM label in top-right | N | none | PASS | 2026-05-04 |
| UI-11 | Flow mode: verify reading zone mask | Brighter text band via CSS mask-image | Y | none | PASS | 2026-05-04 |
| UI-12 | Flow mode: verify underline cursor | `.flow-shrink-cursor` thin accent underline beneath active word group | Y | none | PASS (very subtle) | 2026-05-04 |
| UI-13 | Flow mode: verify Zone button | "Zone" control in bottom bar | N | none | PASS | 2026-05-04 |
| UI-14 | Flow mode: verify "Upper" dropdown | Zone position dropdown in bottom bar | N | none | PASS | 2026-05-04 |
| UI-15 | Flow mode: verify Lines slider | Lines count with slider (default: 6) | N | none | PASS | 2026-05-04 |
| UI-16 | Flow mode: verify progress display | "N% · ~Xm left" format in bottom bar | N | none | PASS | 2026-05-04 |
| UI-17 | Narrate mode: verify speed as multiplier | Shows "1.1x" format instead of WPM | N | none | PASS | 2026-05-04 |
| UI-18 | Narrate mode: verify "Narrating" status label | "Narrating · N% · ~Xm left" during playback | N | none | PASS (but stuck at 0%) | 2026-05-04 |
| UI-19 | All modes: verify hint bar text | Keyboard shortcuts shown in small text at bottom | N | none | PASS | 2026-05-04 |
| UI-20 | All modes: verify "H home" in hint bar | Home hotkey hint visible after v1.75.2+ | N | none | — (just added) | 2026-05-04 |

---

## Summary

| Area | Count |
|------|-------|
| Boot | 4 |
| Onboarding | 5 |
| Library | 11 |
| Favorites/Archive | 6 |
| Reader/Page | 12 |
| Focus Mode | 18 |
| Flow Mode | 18 |
| Narrate Mode | 14 |
| Bottom Bar | 17 |
| Settings | 16 |
| Keyboard | 21 |
| Command Palette | 5 |
| Drag & Drop | 3 |
| Error States | 5 |
| Mode Cycling | 12 |
| Position Preservation | 8 |
| Exit & Reentry | 8 |
| Reading Queue Panel | 5 |
| UI Elements Per Mode | 20 |
| **Total** | **208** |

---

## Test Run Log

### 2026-05-04 — Electron Native App Test (computer-use MCP)

**Tester:** Claude (computer-use MCP) + Evan (manual Escape key)
**Environment:** Blurby v1.75.1, Electron 41, Windows 11
**Book:** Meditations by Marcus Aurelius (EPUB)
**Tool limitation:** Claude overlay intercepted Escape key; user confirmed Escape works normally

**Results:** 80 items tested, 5 FAIL, 4 BLOCKED, 5 new bugs filed

| Bug ID | Severity | Summary | Checklist IDs |
|--------|----------|---------|---------------|
| BUG-A | High | Narrate TTS engine fails to produce audio — stuck at 0% indefinitely | NAR-02, NAR-12 |
| BUG-B | Medium | Position mismatch on book reentry — library shows 8% but opens at 2% | EXIT-02 |
| BUG-C | Low | Flow mode no initial word selected on entry | FLOW-03 |
| BUG-D | Low | Flow Up/Down arrows scroll page instead of line-jumping | FLOW-12, FLOW-13 |
| BUG-E | Medium | First Flow→Narrate mode switch resets position to 1% | POS-05, MODE-03 |

**UX Issues:**
- FOCUS-07: Focus shows "resume reading" on pause instead of last word
- FOCUS-18: ~1-2s delay before first word appears on play
- UI-04: Page mode has no visible ESC/exit label (Focus has one)
- UI-12: Flow underline cursor is very subtle, may need thickening

**Feature added during test:** H key Home hotkey (useKeyboardShortcuts.ts + ReaderBottomBar.tsx hint text)

# Sprint 2 — Speed Reading Engine, Shortcuts, Flow Mode, Testing & Polish

> Design spec for Blurby's second sprint: wiring placeholder features, keyboard shortcuts, Flow mode auto-advance, manual rescan, and end-to-end testing.

---

## Overview

Seven work items (A–G) that bring Blurby from "infrastructure complete" to "fully functional reading tool."

| Item | Name | Size | Priority |
|------|------|------|----------|
| A | Wire up Speed Reading placeholder features | Large | High |
| B | Wire up planned keyboard shortcuts | Medium | High |
| C | Flow mode auto-advancing highlight | Large | Medium |
| D | UX polish | Small | Medium |
| E | Distribution prep | Small | Low (blocked on assets) |
| F | End-to-end testing | Medium | High |
| G | Manual rescan button | Small | High |

---

## A. Wire Up Speed Reading Placeholder Features

### A.1 Rhythm Pauses

The playback engine (`useReader.ts`) already has punctuation pause logic (lines 40-42 in the tick function). Extend this to support all rhythm pause types.

**Implementation in `useReader.ts` tick function:**

When advancing to the next word, check:
- **Commas, colons, etc.** (`rhythmPauses.commas`): If current word ends with `,`, `:`, `;` — add `punctuationPauseMs` delay
- **Between sentences** (`rhythmPauses.sentences`): If current word ends with `.`, `!`, `?` — add `punctuationPauseMs * 1.5` delay
- **Between paragraphs** (`rhythmPauses.paragraphs`): If the word is the last word before a paragraph break (detected during tokenization) — add `punctuationPauseMs * 2` delay
- **Numbers** (`rhythmPauses.numbers`): If current word contains digits — add `punctuationPauseMs * 0.5` delay
- **Longer words** (`rhythmPauses.longerWords`): If word length > 8 chars — add `word.length * 15`ms extra delay

**Paragraph break detection:** Extend `tokenize()` in `text.ts` to return paragraph boundary indices alongside the word array. Add a new function `tokenizeWithMeta(text)` that returns `{ words: string[], paragraphBreaks: Set<number> }` where the set contains word indices that end a paragraph.

**Settings wiring:** Pass `rhythmPauses` from settings through App.tsx → useReader. The existing `hasPunctuation()` check becomes one case within the broader rhythm pause system.

**Enable controls:** In `SpeedReadingSettings.tsx`, remove the `disabled` class from all rhythm pause toggles. Wire `onChange` to call `onSettingsChange({ rhythmPauses: { ...settings.rhythmPauses, [field]: !value } })`.

### A.2 Focus Marks

Visual guide marks above and below the displayed word in focus/RSVP mode to help the eye lock onto the ORP (Optimal Recognition Point).

**Implementation in `ReaderView.tsx`:**
- When `settings.focusMarks` is true, render small triangular markers (▼ above, ▲ below) at the ORP character position
- The ORP position is already calculated by `focusChar()` in `text.ts`
- CSS: `.focus-mark-top` and `.focus-mark-bottom` positioned absolutely relative to the word display container, aligned to the ORP character's horizontal position

**Enable toggle:** In `SpeedReadingSettings.tsx`, wire the Focus Marks toggle to `onSettingsChange({ focusMarks: !settings.focusMarks })`.

### A.3 Reading Ruler

A horizontal line that follows the current reading position in flow/scroll mode, helping users track their place.

**Implementation in `ScrollReaderView.tsx`:**
- When `settings.readingRuler` is true, render a semi-transparent horizontal overlay line at a fixed vertical position (e.g., 40% from top of viewport)
- The ruler is a fixed-position div: `position: fixed; left: 0; right: 0; height: 2px; background: var(--accent); opacity: 0.4;`
- Content scrolls behind/through the ruler

**Enable toggle:** Wire in `SpeedReadingSettings.tsx`.

### A.4 Focus Span

Controls how many surrounding characters are visible around the ORP character in focus mode. A narrow span shows fewer characters clearly (everything else dimmed), a wide span shows more.

**Implementation in `ReaderView.tsx`:**
- `settings.focusSpan` is a float 0–1 (default 0.4)
- Map to a character range: `spanChars = Math.floor(focusSpan * word.length)`
- Characters within `spanChars` of the ORP position render at full opacity
- Characters outside the span render at reduced opacity (0.3)
- This creates a spotlight effect centered on the ORP

**Enable slider:** Wire in `SpeedReadingSettings.tsx`.

### A.5 Layout Spacing

Apply CSS spacing values from settings to the reader views.

**Implementation:**
- In both `ReaderView.tsx` and `ScrollReaderView.tsx`, apply layout spacing as inline CSS on the text container:
  ```
  lineHeight: settings.layoutSpacing.line
  letterSpacing: `${settings.layoutSpacing.character}px`
  wordSpacing: `${settings.layoutSpacing.word}px`
  ```
- Pass `settings.layoutSpacing` as a prop to both reader views

**Enable sliders:** In `LayoutSettings.tsx`, remove the disabled state and opacity. Wire onChange handlers.

### A.6 Flow Text Size

Wire the flow text size slider to ScrollReaderView.

**Implementation:**
- `TextSizeSettings.tsx`: Enable the flow slider, wire to `onSettingsChange({ flowTextSize: value })`
- `ScrollReaderView.tsx`: Accept `flowTextSize` prop (or use `focusTextSize` — clarify: should flow and focus have independent sizes?)
- `App.tsx`: Pass `settings.flowTextSize` to ScrollReaderView instead of `focusTextSize`

---

## B. Wire Up Planned Keyboard Shortcuts

### Shortcuts to implement:

| Shortcut | Action | Handler | Scope |
|----------|--------|---------|-------|
| Shift+Up | Coarse speed up (+100 WPM) | `adjustWpm(100)` | Reader |
| Shift+Down | Coarse speed down (-100 WPM) | `adjustWpm(-100)` | Reader |
| B | Toggle favorite | `toggleFavorite(activeDoc.id)` | Reader |
| Shift+F | Toggle focus/flow mode | `handleSwitchToScroll()` / `handleSwitchToFocus()` | Reader |
| Ctrl/Cmd+, | Open settings (toggle flap → settings) | Open flap + navigate to settings | Global |

### Shortcuts to defer (no underlying feature yet):

| Shortcut | Reason to defer |
|----------|----------------|
| Ctrl/Cmd+1 (Reader view) | Already in reader when shortcut would fire |
| Ctrl/Cmd+2 (Source view) | No source view concept exists |
| Shift+S (Reading speed) | Redundant with Up/Down arrows |
| Shift+T (Narration settings) | No narration feature |
| T (Toggle narration) | No narration feature |
| N (Navigation modal) | No navigation modal exists yet |

**Implementation in `useKeyboardShortcuts.ts`:**

Extend the `useReaderKeys` handler to check for Shift modifier on arrow keys and add new key bindings. The `toggleFavorite` and `activeDoc` need to be passed as additional parameters.

**Update HotkeyMapSettings.tsx:** Change status from "planned" to "implemented" for the 5 new shortcuts. Mark deferred ones as "future" instead of "planned".

---

## C. Flow Mode Auto-Advancing Highlight

Transform ScrollReaderView from passive scrolling into an active guided reading experience.

### Core concept:
All text is visible. A highlight moves word-by-word at the configured WPM speed. The viewport auto-scrolls to keep the highlighted word visible.

### Implementation:

**New state in ScrollReaderView:**
- `flowPlaying: boolean` — whether auto-advance is active
- `flowWordIndex: number` — current highlighted word index
- `flowAccumulator: number` — timing accumulator (same pattern as useReader)

**Word-level rendering:**
Replace the current paragraph-based rendering with word-level spans:
```tsx
{words.map((word, i) => (
  <span key={i} className={i === flowWordIndex ? "flow-word-active" : ""}>
    {word}{' '}
  </span>
))}
```

This is potentially expensive for large documents. **Optimization:** Only render a window of ~2000 words around the current position, with placeholder divs for the rest to maintain scroll height.

**Auto-scroll:**
When `flowPlaying` is true, run a RAF loop:
1. Accumulate time since last frame
2. When accumulated time >= `60000 / wpm`, advance `flowWordIndex`
3. Check if the highlighted word's DOM element is in viewport; if not, `scrollIntoView({ behavior: 'smooth', block: 'center' })`
4. Apply rhythm pauses (same logic as focus mode)

**Controls:**
- Space: toggle `flowPlaying`
- Click any word: jump `flowWordIndex` to that position
- All existing controls (Escape, +/-, arrows) continue to work
- Add play/pause button to the top bar

**CSS:**
```css
.flow-word-active {
  background: var(--accent);
  color: var(--bg);
  border-radius: 2px;
  padding: 0 2px;
}
```

**Progress tracking:**
When `flowPlaying`, update progress based on `flowWordIndex` instead of scroll position.

---

## D. UX Polish

Specific issues to address based on testing:

### D.1 Export/Import button labels
Rename "export" → "backup" and "import" → "restore" in LibraryView footer to avoid confusion with content import.

### D.2 Reader mode persistence
When switching from flow → focus or vice versa, preserve the current word position so the user resumes at the same place.

### D.3 Grid card actions
DocGridCard currently only supports click-to-open. Add a right-click context menu or hover overlay with: favorite, archive, delete, open in new window.

### D.4 Settings flap scroll
If there are many settings on a sub-page (e.g., Speed Reading), ensure the flap body scrolls properly and doesn't clip content.

---

## E. Distribution Prep

### E.1 Application icons
- Requires icon artwork (not a code task)
- Once artwork is provided: generate `.ico` with all required sizes (16-256px), add tray icon, configure in electron-builder
- **Status: Blocked on artwork**

### E.2 Code signing
- Requires purchasing a certificate (~$200-400/year) or Azure Trusted Signing setup
- **Status: Blocked on certificate**

### E.3 Clean VM test
- Install the built `.exe` on a clean Windows VM
- Verify all functionality listed in Phase 0.1 of the roadmap
- **Status: Can be done any time after build**

---

## F. End-to-End Testing

### F.1 Pure function test expansion

New tests for functions that can be tested without Electron:

| Test file | New tests |
|-----------|----------|
| `tests/text.test.js` | `tokenizeWithMeta()` — paragraph break detection |
| `tests/features.test.js` | Rhythm pause delay calculations for each pause type |
| `tests/features.test.js` | Focus span opacity calculation |
| `tests/features.test.js` | Bubble count edge cases (negative, >100%) |

### F.2 Manual test checklist

A structured checklist to verify all buttons and commands work. This should be saved as `docs/manual-test-checklist.md`.

**Library View:**
- [ ] Hamburger opens/closes menu flap
- [ ] Tab key toggles flap
- [ ] Folder selector opens dialog, scans recursively
- [ ] Recent folders dropdown works
- [ ] URL import: enter URL, fetch, verify content extracted
- [ ] URL import disabled without source folder (tooltip shown)
- [ ] Manual add: create, save, verify in library
- [ ] Manual edit: modify title/content, save
- [ ] Delete: confirmation appears, delete removes doc
- [ ] Favorite toggle: star appears/disappears
- [ ] Archive: doc moves to archived tab
- [ ] Unarchive: doc returns to all tab
- [ ] Reset progress: progress returns to 0%
- [ ] Search filters documents
- [ ] Sort by progress/alpha/newest/oldest all work
- [ ] Tab switching: all/favorites/archived
- [ ] Grid/list toggle switches view mode
- [ ] Grid cards show cover images for EPUBs
- [ ] WPM slider changes speed
- [ ] Backup/Restore buttons work
- [ ] Drag and drop files imports them
- [ ] Stats panel opens/closes with correct data

**Focus Reader:**
- [ ] Click doc opens reader
- [ ] Space starts/pauses playback
- [ ] Left/Right arrows rewind/forward 5 words
- [ ] Up/Down arrows adjust WPM by 25
- [ ] Shift+Up/Down adjust WPM by 100
- [ ] +/- adjust text size
- [ ] Tab opens flap during reading
- [ ] Escape shows "press again" during playback
- [ ] Escape exits immediately when paused
- [ ] WPM slider works when paused
- [ ] Font size buttons work when paused
- [ ] "scroll mode" button switches to flow mode
- [ ] Progress saves on exit
- [ ] Progress resumes on re-open
- [ ] B toggles favorite (when implemented)
- [ ] Shift+F switches to flow mode (when implemented)

**Flow Reader:**
- [ ] Scroll reading works naturally
- [ ] +/- adjust text size
- [ ] Escape exits to library
- [ ] "focus mode" button switches to focus reader
- [ ] Tab opens flap
- [ ] Progress saves on exit
- [ ] Space starts/pauses auto-advance (when C implemented)
- [ ] Word highlight advances at WPM speed (when C implemented)

**Menu Flap:**
- [ ] Reading Queue shows in-progress docs first, then unread
- [ ] Click doc in queue opens it in reader
- [ ] Compact/relaxed toggle changes layout
- [ ] Settings → each category navigates correctly
- [ ] Back arrow returns to previous level
- [ ] Theme settings: mode toggle, accent colors, fonts all apply
- [ ] Connectors: login/logout flow works
- [ ] Help content displays
- [ ] Hotkey map shows all shortcuts with correct status
- [ ] Clicking backdrop closes flap
- [ ] Re-opening flap resets to Reading Queue

**Cross-cutting:**
- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly
- [ ] E-ink theme renders correctly
- [ ] System theme follows OS setting
- [ ] App remembers all settings on restart
- [ ] Multiple reader windows work independently

---

## G. Manual Rescan Button

### Implementation:

**main.js — Enhanced rescan function:**
```javascript
async function rescanLibraryWithCovers() {
  if (!settings.sourceFolder) return { error: "No source folder selected" };

  const files = await scanFolderAsync(settings.sourceFolder);
  const docs = getLibrary();
  const existing = new Map(docs.map((d) => [d.filepath, d]));
  const synced = [];

  for (const file of files) {
    const prev = existing.get(file.filepath);
    if (prev) {
      // Re-extract covers and author for existing docs that are missing them
      let updates = { ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size };
      if (!prev.coverPath && file.ext === ".epub") {
        updates.coverPath = await extractEpubCover(file.filepath, prev.id);
      }
      if (!prev.author && file.ext === ".epub") {
        updates.author = await extractAuthorFromEpub(file.filepath);
      }
      if (!prev.author && !file.ext === ".epub") {
        updates.author = extractAuthorFromFilename(file.filename);
      }
      synced.push(updates);
    } else {
      // New file — full extraction (existing sync logic)
      ...
    }
  }

  // Preserve non-folder and Saved Articles docs (existing logic)
  ...

  setLibrary(synced);
  saveLibrary();
  broadcastLibrary();
  return { count: synced.length };
}
```

**IPC handler:**
```javascript
ipcMain.handle("rescan-folder", async () => {
  return await rescanLibraryWithCovers();
});
```

**preload.js:**
```javascript
rescanFolder: () => ipcRenderer.invoke("rescan-folder"),
```

**types.ts — ElectronAPI:**
```typescript
rescanFolder: () => Promise<{ count: number } | { error: string }>;
```

**UI — LibraryView.tsx:**
Add a rescan button in the library header, near the folder selector:
```tsx
<button
  className="btn"
  onClick={handleRescan}
  disabled={!settings.sourceFolder || rescanning}
  title="Rescan folder for new items and covers"
  aria-label="Rescan folder"
>
  {rescanning ? "scanning..." : "⟳"}
</button>
```

With state:
```typescript
const [rescanning, setRescanning] = useState(false);
const handleRescan = async () => {
  setRescanning(true);
  try {
    const result = await api.rescanFolder();
    if (result?.count) showToast?.(`Found ${result.count} items`);
  } finally {
    setRescanning(false);
  }
};
```

**Behavior:**
- Disabled when no source folder is selected
- Shows "scanning..." while in progress
- Re-extracts covers and authors for docs that are missing them
- Picks up any new files added since last scan
- Does NOT re-extract content for existing docs (only metadata/covers)
- Shows toast notification with count when done

---

## Recommended Sprint Order

1. **G — Manual Rescan** (quick win, unblocks cover testing)
2. **F — Testing checklist** (write the manual test doc, expand pure function tests)
3. **B — Keyboard shortcuts** (5 new shortcuts, small scope)
4. **A — Speed Reading features** (largest item, core value)
5. **C — Flow mode auto-advance** (depends on A for rhythm pauses)
6. **D — UX polish** (cleanup pass)
7. **E — Distribution** (blocked on external assets)

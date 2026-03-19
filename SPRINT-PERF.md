# Overnight Performance Sprint

## Goal
Systematically discover and fix performance bottlenecks across main process, renderer, and startup. Target: smooth 60fps reading on 100K+ word books, sub-2s app startup, zero lag on library with 1000+ docs.

---

## Phase 1: Main Process — Synchronous I/O Elimination
**Estimated scope: ~25 edits in main.js**

### 1A. Replace all synchronous fs calls with async equivalents
Every `fs.readFileSync`, `fs.writeFileSync`, `fs.existsSync`, `fs.mkdirSync`, `fs.copyFileSync` blocks the Electron main thread, freezing the UI.

**Targets:**
- `readJSON()` (line ~94) — uses `fs.readFileSync` → switch to `fsPromises.readFile`
- `writeJSON()` (line ~99) — uses `fs.writeFileSync` → switch to `fsPromises.writeFile`
- `getDataPath()` (line ~82) — uses `fs.existsSync` + `fs.mkdirSync` → cache result after first call
- `backupFile()` (line ~215) — uses `fs.existsSync` + `fs.copyFileSync` → async
- `extractMobiCover()` (line ~495) — uses `fs.existsSync`, `fs.mkdirSync`, `fs.writeFileSync` → async
- `parseCallibreOpf()` — uses `fs.existsSync` in a loop → async
- Cover extraction in folder sync — multiple `fs.existsSync` + `fs.copyFileSync` calls → async
- Import handler — `fs.existsSync` before copy → async

### 1B. Debounce and batch library writes
`saveLibrary()` is called after every single document change. With bulk operations (folder sync, multi-file import), this writes the entire library JSON to disk dozens of times.

**Fix:**
- Add a `debouncedSaveLibrary()` (500ms debounce) for non-critical writes
- Keep synchronous `saveLibrary()` only for critical paths (app quit, explicit save)
- Batch `broadcastLibrary()` calls — debounce to 200ms so rapid changes coalesce

### 1C. Index library by ID
Every IPC handler does `.find(d => d.id === docId)` — linear scan on every operation.

**Fix:**
- Maintain a `Map<string, BlurbyDoc>` index alongside the array
- Update index on add/remove/modify
- O(1) lookups for `update-doc-progress`, `delete-doc`, `load-doc-content`, `get-doc-chapters`, `toggle-favorite`, `archive-doc`, `unarchive-doc`, etc.

---

## Phase 2: Main Process — Startup & Content Loading

### 2A. Lazy-load heavy modules
Three heavy modules loaded at startup but only used on specific actions:

| Module | Size | Used when |
|--------|------|-----------|
| `@mozilla/readability` | ~200K | URL article import |
| `jsdom` (JSDOM) | ~4.3M | URL article import |
| `pdfkit` (PDFDocument) | ~8.2M | Article PDF generation |

**Fix:** Move `require()` calls inside the functions that use them:
- `Readability` + `JSDOM` → inside `extractArticleFromHtml()`
- `PDFDocument` → inside `generateArticlePdf()`

Saves ~13MB heap at startup.

### 2B. Non-blocking folder sync at startup
`syncLibraryWithFolder()` is awaited at app launch (line ~2283). For large folders, this blocks the window from appearing.

**Fix:** Fire-and-forget with `setImmediate()`:
```js
setImmediate(() => {
  syncLibraryWithFolder().then(() => startWatcher());
});
```

### 2C. Parallel content extraction with concurrency limit
`syncLibraryWithFolder()` extracts content sequentially — one file at a time. For 100 new files, this is extremely slow.

**Fix:**
- Process new files in batches of 4 (Promise pool pattern)
- Extract content, metadata, and covers concurrently within each batch
- Broadcast library updates after each batch (not each file)

### 2D. PDF timeout reduction
PDF parsing has a 30-second timeout per file. Corrupted PDFs freeze the event loop for 30s.

**Fix:** Reduce timeout to 10 seconds. Add AbortController where possible.

---

## Phase 3: Renderer — React Rendering Optimization

### 3A. Memoize LibraryView computed state
`getFilteredAndSorted()` runs on every render — O(n log n) sort on the full library.

**Fix:**
- Wrap in `useMemo` keyed on `[library, filter, sort, searchQuery, typeFilter]`
- Memoize `readingNow` and `notStarted` splits
- Memoize search results

### 3B. Add React.memo to list item components
`DocCard` and `DocGridCard` re-render on every parent re-render even when their doc hasn't changed.

**Fix:**
- Wrap both with `React.memo` and a custom comparator checking `doc.id`, `doc.position`, `doc.title`, `doc.archived`, `doc.favorite`
- Same for `ReadingQueue` item renderer

### 3C. Stabilize callback references
Multiple components pass inline functions as props, creating new references every render:

**Targets:**
- App.tsx: `onHighlight` callback in ReaderView (lines 250-255)
- App.tsx: `onSwitchToFocus`, `onExit` in ScrollReaderView
- LibraryView: `onOpenDoc`, `onDelete` callbacks to DocCard children
- MenuFlap: `handleDocClick` depends on `onOpenDoc` + `onClose`

**Fix:** Extract to `useCallback` with minimal dependency arrays. Use refs for values that change often but don't need to trigger re-creation.

### 3D. Reduce keyboard handler churn
`useReaderKeys` has 13 dependencies — re-attaches all keyboard listeners whenever any callback changes.

**Fix:**
- Store all callbacks in a single ref object
- Single `useEffect` with empty deps attaches once
- Handler reads from ref.current at call time (always fresh, never stale)

### 3E. Split settings prop
ReaderView and ScrollReaderView receive the entire `settings` object. Any settings change (theme, accent color, etc.) re-renders the reader.

**Fix:**
- Destructure only needed settings fields in App.tsx before passing
- Pass individual props: `focusMarks`, `focusSpan`, `layoutSpacing`, `rhythmPauses`, `readingRuler`
- Or create a `useReaderSettings()` hook that memoizes the subset

---

## Phase 4: Renderer — Reading Mode Optimization

### 4A. Speed mode (ReaderView) — playing state
During RSVP playback, `setWordIndex()` fires on every RAF tick (~16ms). Each call triggers a React re-render of the entire ReaderView, including bottom bar, chapter info, progress calculation.

**Fix:**
- Use a ref for the word display during playback (bypass React render cycle)
- Only call `setWordIndex()` at reduced frequency (every 5th word or every 100ms) for progress display
- Directly update the DOM for the focus word display via ref

### 4B. Flow mode (ScrollReaderView) — reduce re-renders
`setFlowWordIndex()` fires every word, re-rendering the entire FlowText component.

**Fix:**
- Use a ref for the active word highlight
- Swap CSS classes directly via DOM manipulation during flow playback
- Only update React state every N words for progress tracking

### 4C. Progress save throttling
`onProgressUpdate()` is called on every word advance in flow mode (line ~231). This triggers IPC to save position.

**Fix:**
- Throttle progress saves to once every 5 seconds or every 50 words
- Save immediately on pause/exit (already handled)

---

## Phase 5: Cover Image & Data Transfer

### 5A. Cover image caching
`get-cover-image` IPC reads the full image file and base64-encodes it on every call. With 100 covers in grid view, that's 100 file reads.

**Fix:**
- Cache base64 results in a `Map<string, string>` (memory-bounded LRU, ~50 entries)
- Return cache hit immediately
- Invalidate on file change

### 5B. Library broadcast optimization
`broadcastLibrary()` serializes the entire library and sends it via IPC. For 1000 docs with metadata, this can be megabytes.

**Fix:**
- Send incremental updates (delta: `{ type: "update", doc }` or `{ type: "delete", id }`)
- Full library only on initial load and explicit refresh
- Renderer maintains its own copy and applies deltas

---

## Execution Order

Run phases in priority order based on user-facing impact:

| Order | Phase | Impact | Risk |
|-------|-------|--------|------|
| 1 | 3A-3B | Library lag elimination | Low |
| 2 | 4A-4B | Reader mode smoothness | Medium |
| 3 | 1A-1B | UI freeze elimination | Medium |
| 4 | 2A-2B | Faster startup | Low |
| 5 | 1C | Library operation speed | Low |
| 6 | 3C-3E | Reduced re-renders | Low |
| 7 | 2C-2D | Faster folder import | Low |
| 8 | 4C, 5A-5B | Polish | Low |

Run tests (`npm test`) after each phase. Build (`npm run build`) after phases 3 and 4. TypeScript check (`npx tsc --noEmit`) throughout.

---

## Success Criteria

- [ ] 100K-word book opens and plays in speed mode with no frame drops
- [ ] Flow mode scrolls smoothly at 300+ WPM
- [ ] Library with 500+ docs scrolls smoothly in grid and list view
- [ ] App window visible within 2 seconds of launch
- [ ] Folder sync with 100+ new files completes without freezing UI
- [ ] No synchronous file I/O in main process (except app quit save)
- [ ] All 135+ existing tests pass
- [ ] Build succeeds with no TypeScript errors
